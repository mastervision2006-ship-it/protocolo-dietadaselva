import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Funnel steps in order
const FUNNEL_STEPS = [
  { key: 'landing',       label: 'Landing Page',      group: 'entrada' },
  { key: 'name',          label: 'Inseriu Nome',       group: 'entrada' },
  { key: 'quiz_q1',       label: 'Q1 — Objetivo',      group: 'quiz' },
  { key: 'quiz_q2',       label: 'Q2 — Idade',         group: 'quiz' },
  { key: 'quiz_q3',       label: 'Q3 — Frustração',    group: 'quiz' },
  { key: 'quiz_q4',       label: 'Q4 — Alimentação',   group: 'quiz' },
  { key: 'quiz_q5',       label: 'Q5 — Sintomas',      group: 'quiz' },
  { key: 'quiz_q6',       label: 'Q6 — Tentativas',    group: 'quiz' },
  { key: 'quiz_q7',       label: 'Q7 — Motivação',     group: 'quiz' },
  { key: 'quiz_q8',       label: 'Q8 — Compromisso',   group: 'quiz' },
  { key: 'quiz_q9',       label: 'Q9 — Pronta',        group: 'quiz' },
  { key: 'body-data',     label: 'Dados Corporais',    group: 'qualificacao' },
  { key: 'edu-unificada', label: 'Tela Educacional',   group: 'qualificacao' },
  { key: 'diagnosis',     label: 'Diagnóstico',        group: 'qualificacao' },
  { key: 'result',        label: 'Viu a Oferta',       group: 'conversao' },
  { key: 'checkout',      label: 'Abriu PIX',          group: 'conversao' },
  { key: 'payment',       label: 'Pagou (R$27)',        group: 'conversao' },
];

const QUESTION_META = {
  goal:        { label: 'Objetivo principal', options: { perda: 'Perder peso', inchaco: 'Reduzir inchaço', energia: 'Mais energia', todas: 'Todos' } },
  age:         { label: 'Faixa etária',       options: { '25-34': '25–34 anos', '35-44': '35–44 anos', '45-54': '45–54 anos', '55+': '55+ anos' } },
  frustration: { label: 'Frustração',         options: { dietas: 'Dietas não funcionam', sanfona: 'Efeito sanfona', fome: 'Fome constante', tempo: 'Falta de tempo' } },
  meals:       { label: 'Alimentação atual',  options: { carboidratos: 'Muito carboidrato', pula: 'Pula refeições', irregular: 'Irregular', caotico: 'Caótico' } },
  symptoms:    { label: 'Sintomas',           options: { inchaco: 'Inchaço', fadiga: 'Fadiga', ansiedade: 'Ansiedade/compulsão', articulacoes: 'Dores articulares' } },
  tentativas:  { label: 'Tentativas passadas',options: { primeira: '1ª tentativa', poucas: '1–2 vezes', muitas: '3+ vezes', ciclo: 'Ciclo sem fim' } },
  motivacao:   { label: 'Motivação',          options: { 'resultado-rapido': 'Resultado rápido', simplicidade: 'Simplicidade', 'sem-fome': 'Sem fome', bemestar: 'Bem-estar' } },
  commitment:  { label: 'Comprometimento',    options: { hoje: 'Começa hoje', facil: 'Se for fácil', saber: 'Precisa saber mais', descrente: 'Cético' } },
  ready:       { label: 'Estado emocional',   options: { pronta: 'Pronta!', resultado: 'Se provar resultado', medo: 'Com medo de falhar', prova: 'Precisa de prova' } },
};

const PROFILE_LABELS = {
  decidida:  'Decidida',
  cetica:    'Cética',
  medo:      'Medo de falhar',
  ocupada:   'Ocupada',
  hormonal:  'Hormonal (45+)',
  economica: 'Econômica',
};

function generateInsights(funnel, profiles, totalSessions) {
  const insights = [];
  if (!funnel.length || !totalSessions) return insights;

  const get = (key) => funnel.find(f => f.key === key);
  const landing = get('landing');
  const name    = get('name');
  const q1      = get('quiz_q1');
  const q3      = get('quiz_q3');
  const bodyData= get('body-data');
  const result  = get('result');
  const checkout= get('checkout');
  const payment = get('payment');

  // Landing → Name drop
  if (landing && name && landing.count > 0) {
    const drop = ((landing.count - name.count) / landing.count) * 100;
    if (drop > 55) {
      insights.push({ level: 'danger', title: 'Alto abandono na Landing Page', body: `${drop.toFixed(0)}% dos visitantes saem antes de inserir o nome. Teste uma headline mais direta ou reduza o scroll até o CTA.` });
    } else if (drop > 35) {
      insights.push({ level: 'warning', title: 'Abandono moderado na entrada', body: `${drop.toFixed(0)}% saem na landing. Considere um vídeo curto ou urgência acima do fold.` });
    }
  }

  // Quiz completion rate
  if (q1 && q3 && q1.count > 0) {
    const drop = ((q1.count - q3.count) / q1.count) * 100;
    if (drop > 25) {
      insights.push({ level: 'warning', title: 'Abandono no início do quiz', body: `${drop.toFixed(0)}% desistem entre Q1 e Q3. As primeiras perguntas podem estar longas demais ou pouco envolventes.` });
    }
  }

  // Body-data drop
  if (q1 && bodyData && q1.count > 0) {
    const drop = ((q1.count - bodyData.count) / q1.count) * 100;
    if (drop > 40) {
      insights.push({ level: 'warning', title: 'Abandono alto no quiz (Q1→Dados)', body: `${drop.toFixed(0)}% terminam o quiz mas não chegam aos dados corporais. O questionário pode estar cansativo.` });
    }
  }

  // Offer to checkout
  if (result && checkout && result.count > 0) {
    const drop = ((result.count - checkout.count) / result.count) * 100;
    if (drop > 70) {
      insights.push({ level: 'danger', title: 'Baixo engajamento com a oferta', body: `Apenas ${(100 - drop).toFixed(0)}% dos que veem o resultado clicam em comprar. Teste headline, urgência ou valor percebido na tela de resultado.` });
    } else if (drop > 50) {
      insights.push({ level: 'warning', title: 'Oferta pode ser mais persuasiva', body: `${drop.toFixed(0)}% veem a oferta mas não clicam. Considere adicionar depoimentos ou bônus exclusivos.` });
    }
  }

  // Checkout to payment
  if (checkout && payment && checkout.count > 0) {
    const drop = ((checkout.count - payment.count) / checkout.count) * 100;
    if (drop > 60) {
      insights.push({ level: 'danger', title: 'Checkout com muita fricção', body: `${drop.toFixed(0)}% abrem o PIX mas não pagam. Teste uma cópia de urgência ao lado do QR Code ou reduza os campos do formulário.` });
    } else if (drop > 40) {
      insights.push({ level: 'warning', title: 'Checkout pode melhorar', body: `${drop.toFixed(0)}% saem sem pagar após abrir o PIX. Um timer de expiração ou garantia visível pode ajudar.` });
    }
  }

  // Lead profiles
  const total = profiles.reduce((s, p) => s + p.count, 0);
  if (total > 0) {
    const medo = profiles.find(p => p.profile === 'medo');
    const cetica = profiles.find(p => p.profile === 'cetica');
    const hormonal = profiles.find(p => p.profile === 'hormonal');

    if (medo && (medo.count / total) > 0.30) {
      insights.push({ level: 'info', title: `${((medo.count/total)*100).toFixed(0)}% dos leads têm medo de falhar`, body: 'Considere expandir a Tela de Medo com mais histórias de transformação e a garantia de 7 dias em destaque.' });
    }
    if (cetica && (cetica.count / total) > 0.40) {
      insights.push({ level: 'info', title: `Perfil Cético é dominante (${((cetica.count/total)*100).toFixed(0)}%)`, body: 'Adicione mais provas sociais e depoimentos verificados. Esse perfil converte melhor com evidências concretas.' });
    }
    if (hormonal && (hormonal.count / total) > 0.25) {
      insights.push({ level: 'info', title: `${((hormonal.count/total)*100).toFixed(0)}% são leads hormonais (45+)`, body: 'Considere uma versão da landing focada em menopausa e resistência hormonal para aumentar identificação.' });
    }
  }

  // Overall conversion
  if (landing && payment && landing.count > 10) {
    const conv = (payment.count / landing.count) * 100;
    if (conv >= 3) {
      insights.push({ level: 'success', title: `Conversão saudável: ${conv.toFixed(2)}%`, body: 'O funil está convertendo bem. Foco agora em escalar tráfego qualificado.' });
    } else if (conv >= 1) {
      insights.push({ level: 'info', title: `Conversão de ${conv.toFixed(2)}% — pode melhorar`, body: 'Meta: 3%+. Revise os pontos de maior abandono acima para priorizar melhorias.' });
    } else if (conv < 1 && landing.count > 50) {
      insights.push({ level: 'danger', title: `Conversão crítica: ${conv.toFixed(2)}%`, body: 'Menos de 1% dos visitantes compram. Revise urgentemente a oferta e os pontos de abandono.' });
    }
  }

  if (!insights.length) {
    insights.push({ level: 'info', title: 'Coletando dados...', body: 'Aguarde mais sessões para receber insights automáticos sobre o funil.' });
  }

  return insights;
}

export async function GET(req) {
  const key = req.nextUrl.searchParams.get('key');
  const adminKey = process.env.ADMIN_KEY;

  if (adminKey && key !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const days = Math.min(parseInt(req.nextUrl.searchParams.get('days') || '7', 10), 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: events, error } = await supabase
    .from('funnel_events')
    .select('session_id, event, screen, data, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(50000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({
      period: { days, from: since, to: new Date().toISOString() },
      totals: { sessions: 0, reached_result: 0, checkout_initiated: 0, payments_confirmed: 0, conversion_rate: 0 },
      funnel: [],
      questions: {},
      profiles: [],
      insights: [{ level: 'info', title: 'Sem dados ainda', body: 'Nenhuma sessão registrada no período. O tracking está configurado corretamente?' }],
      by_day: [],
    });
  }

  // --- Aggregate ---
  const sessionsByScreen = {};
  const answersByQuestion = {};
  const profileCounts = {};
  const allSessions = new Set();
  const byDay = {};

  for (const evt of events) {
    allSessions.add(evt.session_id);

    // Daily sessions
    const day = evt.created_at.slice(0, 10);
    if (!byDay[day]) byDay[day] = new Set();
    byDay[day].add(evt.session_id);

    // Screen views
    if (evt.event === 'screen_view' && evt.screen) {
      if (!sessionsByScreen[evt.screen]) sessionsByScreen[evt.screen] = new Set();
      sessionsByScreen[evt.screen].add(evt.session_id);
    }

    // Checkout / payment (separate events, not screen_view)
    if (evt.event === 'checkout_initiated') {
      if (!sessionsByScreen['checkout']) sessionsByScreen['checkout'] = new Set();
      sessionsByScreen['checkout'].add(evt.session_id);
    }
    if (evt.event === 'payment_confirmed') {
      if (!sessionsByScreen['payment']) sessionsByScreen['payment'] = new Set();
      sessionsByScreen['payment'].add(evt.session_id);
    }

    // Quiz answers
    if (evt.event === 'quiz_answer' && evt.data?.question && evt.data?.answer) {
      const q = evt.data.question;
      const a = evt.data.answer;
      if (!answersByQuestion[q]) answersByQuestion[q] = {};
      if (!answersByQuestion[q][a]) answersByQuestion[q][a] = 0;
      answersByQuestion[q][a]++;
    }

    // Lead profiles
    if (evt.event === 'lead_profile' && evt.data?.profile) {
      const p = evt.data.profile;
      if (!profileCounts[p]) profileCounts[p] = 0;
      profileCounts[p]++;
    }
  }

  // Build funnel array
  const landingCount = sessionsByScreen['landing']?.size || 0;
  const funnel = FUNNEL_STEPS.map((step, i) => {
    const count = sessionsByScreen[step.key]?.size || 0;
    const prevKey = i > 0 ? FUNNEL_STEPS[i - 1].key : null;
    const prevCount = prevKey ? (sessionsByScreen[prevKey]?.size || 0) : count;
    return {
      key: step.key,
      label: step.label,
      group: step.group,
      count,
      pct_of_start: landingCount > 0 ? Math.round((count / landingCount) * 100) : 0,
      drop_from_prev: prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0,
    };
  });

  // Build questions breakdown
  const questions = {};
  for (const [qId, answers] of Object.entries(answersByQuestion)) {
    if (!QUESTION_META[qId]) continue;
    const total = Object.values(answers).reduce((s, n) => s + n, 0);
    const opts = QUESTION_META[qId].options;
    questions[qId] = {
      label: QUESTION_META[qId].label,
      total,
      answers: Object.entries(answers)
        .map(([value, count]) => ({
          value,
          label: opts[value] || value,
          count,
          pct: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count),
    };
  }

  // Build profiles
  const totalProfiles = Object.values(profileCounts).reduce((s, n) => s + n, 0);
  const profiles = Object.entries(profileCounts)
    .map(([profile, count]) => ({
      profile,
      label: PROFILE_LABELS[profile] || profile,
      count,
      pct: totalProfiles > 0 ? Math.round((count / totalProfiles) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Totals
  const totalSessions = allSessions.size;
  const reachedResult = sessionsByScreen['result']?.size || 0;
  const checkoutCount = sessionsByScreen['checkout']?.size || 0;
  const paymentCount  = sessionsByScreen['payment']?.size || 0;

  // By day array
  const byDayArray = Object.entries(byDay)
    .map(([date, sessions]) => ({ date, sessions: sessions.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const insights = generateInsights(funnel, profiles, totalSessions);

  return NextResponse.json({
    period: { days, from: since, to: new Date().toISOString() },
    totals: {
      sessions: totalSessions,
      reached_result: reachedResult,
      checkout_initiated: checkoutCount,
      payments_confirmed: paymentCount,
      conversion_rate: totalSessions > 0 ? +((paymentCount / totalSessions) * 100).toFixed(2) : 0,
      revenue: paymentCount * 27,
    },
    funnel,
    questions,
    profiles,
    insights,
    by_day: byDayArray,
  });
}
