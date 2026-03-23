import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function POST(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const data = await req.json();
    const event = data.event ?? null;
    const transaction = data.transaction ?? null;

    if (!transaction || typeof transaction !== 'object') {
      return NextResponse.json({ ok: false, error: 'no transaction' });
    }

    const status = transaction.status ?? null;
    const isPaid =
      ['TRANSACTION_PAID', 'TRANSACTION_COMPLETED'].includes(event) ||
      status === 'COMPLETED';

    if (!isPaid) {
      return NextResponse.json({ ok: true, saved: false, reason: 'not paid yet' });
    }

    const tid = transaction.id ?? null;
    if (!tid || typeof tid !== 'string') {
      return NextResponse.json({ ok: false, error: 'no transaction.id' });
    }

    const tidClean = tid.replace(/[^a-zA-Z0-9_\-]/g, '');
    if (!tidClean) {
      return NextResponse.json({ ok: false, error: 'invalid transaction.id' });
    }

    // 1. Salva pagamento confirmado
    const { error: dbError } = await supabase
      .from('pagamentos_pix')
      .upsert({ transaction_id: tidClean }, { onConflict: 'transaction_id', ignoreDuplicates: true });

    if (dbError) {
      console.error('[PIX webhook] Supabase error:', dbError);
      return NextResponse.json({ ok: false, error: 'db error' });
    }

    // 2. Busca lead pelo transaction_id
    const { data: purchase } = await supabase
      .from('pending_purchases')
      .select('name, email, delivered')
      .eq('transaction_id', tidClean)
      .maybeSingle();

    if (!purchase || !purchase.email) {
      return NextResponse.json({ ok: true, saved: true, access: 'no lead found' });
    }

    if (purchase.delivered) {
      return NextResponse.json({ ok: true, saved: true, access: 'already delivered' });
    }

    // 3. Cria usuário no Supabase Auth (ou usa existente)
    let userId = null;

    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === purchase.email);

    if (existing) {
      userId = existing.id;
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: purchase.email,
        email_confirm: true,
        user_metadata: { nome: purchase.name },
      });
      if (createError) {
        console.error('[PIX webhook] create user error:', createError);
      } else {
        userId = newUser.user.id;
      }
    }

    // 4. Cria perfil do usuário
    if (userId) {
      await supabase.from('profiles').upsert({
        user_id: userId,
        nome: purchase.name,
        email: purchase.email,
        plano: 'basic',
        data_inicio: new Date().toISOString().split('T')[0],
      }, { onConflict: 'user_id', ignoreDuplicates: true });

      // 5. Gera link mágico de acesso
      const appUrl = process.env.APP_DA_SELVA_URL || 'https://app-da-selva.vercel.app';
      const { data: linkData } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: purchase.email,
        options: { redirectTo: `${appUrl}/inicio` },
      });

      const magicLink = linkData?.properties?.action_link ?? `${appUrl}/login`;

      // 6. Envia email via Resend
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Dieta da Selva <onboarding@resend.dev>',
        to: purchase.email,
        subject: '🌿 Seu acesso ao App da Selva está pronto!',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0A0F07;padding:40px 24px;border-radius:16px">
            <div style="text-align:center;margin-bottom:32px">
              <div style="font-size:48px">🌿</div>
              <h1 style="color:#F2F0E8;font-size:22px;margin:8px 0">Dieta da Selva</h1>
            </div>

            <h2 style="color:#F2F0E8;font-size:18px;margin-bottom:8px">Olá, ${purchase.name.split(' ')[0]}! 👋</h2>
            <p style="color:#9CA88E;font-size:14px;line-height:1.7;margin-bottom:24px">
              Seu pagamento foi confirmado e seu acesso ao <strong style="color:#E8A838">Protocolo Dieta da Selva</strong> está liberado!
            </p>

            <div style="background:#1A2010;border-radius:12px;padding:16px;margin-bottom:24px">
              <p style="color:#9CA88E;font-size:13px;margin:0 0 4px 0">O que você tem acesso:</p>
              <p style="color:#F2F0E8;font-size:13px;margin:4px 0">🥩 Plano alimentar completo de 21 dias</p>
              <p style="color:#F2F0E8;font-size:13px;margin:4px 0">📖 Biblioteca de receitas carnívoras</p>
              <p style="color:#F2F0E8;font-size:13px;margin:4px 0">🏆 Desafio 21 dias sem falhar</p>
              <p style="color:#F2F0E8;font-size:13px;margin:4px 0">🌿 Selva IA para tirar suas dúvidas</p>
            </div>

            <div style="text-align:center;margin-bottom:24px">
              <a href="${magicLink}" style="display:inline-block;background:#E8A838;color:#000;font-weight:700;font-size:15px;padding:16px 32px;border-radius:12px;text-decoration:none">
                ACESSAR MEU PROTOCOLO →
              </a>
              <p style="color:#5C6652;font-size:11px;margin-top:8px">Este link expira em 24 horas</p>
            </div>

            <p style="color:#5C6652;font-size:12px;text-align:center;margin:0">
              Dúvidas? Responda este email ou entre em contato pelo WhatsApp.
            </p>
          </div>
        `,
      });

      // 7. Marca como entregue
      await supabase
        .from('pending_purchases')
        .update({ delivered: true })
        .eq('transaction_id', tidClean);
    }

    return NextResponse.json({ ok: true, saved: true, transactionId: tidClean });

  } catch (err) {
    console.error('[PIX webhook]', err);
    return NextResponse.json({ ok: false, error: 'internal error' });
  }
}
