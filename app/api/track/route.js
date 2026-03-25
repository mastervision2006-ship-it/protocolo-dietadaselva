import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { session_id, event, screen, ...rest } = body;

    if (!session_id || !event) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const ua = req.headers.get('user-agent') || null;
    const data = Object.keys(rest).length > 0 ? rest : null;

    await supabase.from('funnel_events').insert({
      session_id,
      event,
      screen: screen || null,
      data,
      user_agent: ua,
    });

    return NextResponse.json({ ok: true });
  } catch (_) {
    // Silently fail — never block the quiz
    return NextResponse.json({ ok: false });
  }
}
