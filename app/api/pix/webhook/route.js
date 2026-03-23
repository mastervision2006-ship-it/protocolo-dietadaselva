import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
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

    const { error } = await supabase
      .from('pagamentos_pix')
      .upsert({ transaction_id: tidClean }, { onConflict: 'transaction_id', ignoreDuplicates: true });

    if (error) {
      console.error('[PIX webhook] Supabase error:', error);
      return NextResponse.json({ ok: false, error: 'db error' });
    }

    return NextResponse.json({ ok: true, saved: true, transactionId: tidClean });

  } catch (err) {
    console.error('[PIX webhook]', err);
    return NextResponse.json({ ok: false, error: 'internal error' });
  }
}
