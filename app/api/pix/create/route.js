import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SIGILOPAY_API = 'https://app.sigilopay.com.br/api/v1';

export async function POST(req) {
  try {
    const { name, email, phone, cpf } = await req.json();

    if (!name || !email || !phone || !cpf) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const identifier = `dieta_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://protocolo-dietadaselva.vercel.app';
    const callbackUrl = `${appUrl}/api/pix/webhook`;

    const payload = {
      identifier,
      amount: 27,
      client: {
        name,
        email,
        phone: phone.replace(/\D/g, ''),
        document: cpf.replace(/\D/g, ''),
      },
      callbackUrl,
    };

    const response = await fetch(`${SIGILOPAY_API}/gateway/pix/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-public-key': process.env.SIGILOPAY_PUBLIC_KEY,
        'x-secret-key': process.env.SIGILOPAY_SECRET_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.message || data.errorDescription || 'Erro na SigiloPay';
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const transactionId = data.transactionId || '';

    // Salva lead vinculado ao transactionId para o webhook usar depois
    if (transactionId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      await supabase.from('pending_purchases').upsert(
        { transaction_id: transactionId, name, email, phone: phone.replace(/\D/g, '') },
        { onConflict: 'transaction_id', ignoreDuplicates: true }
      );
    }

    const pixNode = data.pix || data.order?.pix || {};
    const pixPayload =
      pixNode.code || pixNode.payload || pixNode.emv || pixNode.qrCode || pixNode.qrcode || null;

    if (!pixPayload) {
      return NextResponse.json({ error: 'Sem código PIX na resposta da SigiloPay' }, { status: 500 });
    }

    let qrCodeSrc = pixNode.base64 || pixNode.image || pixNode.imageUrl || pixNode.qrCodeImageUrl || null;

    if (qrCodeSrc && !qrCodeSrc.startsWith('data:') && !qrCodeSrc.startsWith('http')) {
      qrCodeSrc = `data:image/png;base64,${qrCodeSrc}`;
    }
    if (!qrCodeSrc) {
      qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(pixPayload)}`;
    }

    return NextResponse.json({ transactionId, pixPayload, qrCodeSrc });

  } catch (err) {
    console.error('[PIX create]', err);
    return NextResponse.json({ error: 'Erro interno ao gerar PIX' }, { status: 500 });
  }
}
