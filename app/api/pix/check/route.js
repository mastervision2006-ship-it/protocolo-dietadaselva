import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const tid = (searchParams.get('tid') ?? '').replace(/[^a-zA-Z0-9_\-]/g, '');

  if (!tid) {
    return NextResponse.json({ paid: false });
  }

  const { data } = await supabase
    .from('pagamentos_pix')
    .select('id')
    .eq('transaction_id', tid)
    .maybeSingle();

  return NextResponse.json({ paid: !!data });
}
