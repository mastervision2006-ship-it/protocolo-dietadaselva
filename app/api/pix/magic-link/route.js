import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { searchParams } = new URL(req.url);
  const tid = (searchParams.get('tid') ?? '').replace(/[^a-zA-Z0-9_\-]/g, '');

  if (!tid) {
    return NextResponse.json({ error: 'tid obrigatório' }, { status: 400 });
  }

  // Busca o lead pelo transaction_id
  const { data: purchase } = await supabase
    .from('pending_purchases')
    .select('email, name')
    .eq('transaction_id', tid)
    .maybeSingle();

  if (!purchase?.email) {
    return NextResponse.json({ error: 'lead não encontrado' }, { status: 404 });
  }

  const appUrl = process.env.APP_DA_SELVA_URL || 'https://app-da-selva.vercel.app';

  // Gera magic link fresco
  const { data: linkData, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: purchase.email,
    options: { redirectTo: `${appUrl}/inicio` },
  });

  if (error || !linkData?.properties?.action_link) {
    console.error('[magic-link]', error);
    return NextResponse.json({ error: 'erro ao gerar link' }, { status: 500 });
  }

  return NextResponse.json({
    link: linkData.properties.action_link,
    name: purchase.name,
    email: purchase.email,
  });
}
