'use client';
import { useState, useEffect, useCallback } from 'react';

/* ─── THEME ─────────────────────────────────────── */
const C = {
  bg:       '#070a05',
  surface:  '#0d1109',
  card:     '#101508',
  border:   'rgba(140,179,105,0.10)',
  borderHi: 'rgba(140,179,105,0.20)',
  txt:      '#dce8cc',
  muted:    '#7a8e6e',
  dim:      '#404d36',
  gold:     '#E8A838',
  green:    '#8CB369',
  red:      '#e05c42',
  orange:   '#e88038',
  blue:     '#5ca8e8',
  success:  '#5ce888',
};

/* ─── INLINE STYLES ──────────────────────────────── */
const S = {
  root: {
    minHeight: '100vh',
    background: C.bg,
    fontFamily: "'DM Sans', sans-serif",
    color: C.txt,
    padding: '0',
  },
  // Login gate
  gate: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', gap: 16, padding: 24,
  },
  gateCard: {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
    padding: '40px 32px', maxWidth: 380, width: '100%', textAlign: 'center',
  },
  // Main layout
  header: {
    background: C.surface, borderBottom: `1px solid ${C.border}`,
    padding: '16px 24px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
    position: 'sticky', top: 0, zIndex: 10,
  },
  main: { padding: '24px', maxWidth: 1280, margin: '0 auto' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 24 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 },
  card: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 16, padding: 20, overflow: 'hidden',
  },
  // Typography
  label: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted },
  h2: { fontSize: 18, fontWeight: 700, color: C.txt, marginBottom: 16 },
  // Input
  input: {
    width: '100%', background: '#111908', border: `1px solid ${C.border}`,
    borderRadius: 12, padding: '12px 16px', color: C.txt, fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  },
  btn: {
    background: C.green, color: '#0a0d08', border: 'none',
    borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 14,
    cursor: 'pointer', width: '100%', marginTop: 8,
  },
  // Period selector
  pill: (active) => ({
    background: active ? C.green : 'transparent',
    color: active ? '#0a0d08' : C.muted,
    border: `1px solid ${active ? C.green : C.border}`,
    borderRadius: 20, padding: '5px 14px', fontSize: 12,
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
  }),
};

/* ─── HELPERS ────────────────────────────────────── */
const insightColor = { danger: C.red, warning: C.orange, info: C.blue, success: C.success };
const insightBg    = { danger: 'rgba(224,92,66,0.08)', warning: 'rgba(232,128,56,0.08)', info: 'rgba(92,168,232,0.08)', success: 'rgba(92,232,136,0.08)' };
const groupColors  = { entrada: C.blue, quiz: C.green, qualificacao: C.gold, conversao: C.red };

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={S.card}>
      <p style={S.label}>{label}</p>
      <p style={{ fontSize: 36, fontWeight: 800, color: accent || C.txt, lineHeight: 1.1, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function FunnelRow({ step, maxCount, isLast }) {
  const barPct = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
  const groupColor = groupColors[step.group] || C.green;
  return (
    <div style={{ borderBottom: isLast ? 'none' : `1px solid ${C.border}`, paddingBottom: 14, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: groupColor, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: C.txt, fontWeight: 500 }}>{step.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: C.txt, fontWeight: 700 }}>
            {step.count.toLocaleString('pt-BR')}
          </span>
          <span style={{ fontSize: 11, color: C.muted, width: 36, textAlign: 'right' }}>
            {step.pct_of_start}%
          </span>
          {step.drop_from_prev > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: step.drop_from_prev > 30 ? C.red : step.drop_from_prev > 15 ? C.orange : C.muted,
              width: 44, textAlign: 'right',
            }}>
              -{step.drop_from_prev}%
            </span>
          )}
        </div>
      </div>
      <div style={{ height: 6, background: '#1a2010', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${barPct}%`,
          background: `linear-gradient(90deg, ${groupColor}cc, ${groupColor})`,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

function QuestionCard({ qData }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...S.card, marginBottom: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <p style={S.label}>{qData.label}</p>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{qData.total} respostas</p>
          </div>
          <span style={{ fontSize: 18, color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>⌄</span>
        </div>
        {!open && qData.answers.length > 0 && (
          <div style={{ marginTop: 10, height: 5, background: '#1a2010', borderRadius: 99, overflow: 'hidden', display: 'flex', gap: 2 }}>
            {qData.answers.map((a, i) => (
              <div key={i} style={{
                height: '100%', width: `${a.pct}%`,
                background: [C.green, C.gold, C.blue, C.orange][i % 4],
                borderRadius: 99,
              }} />
            ))}
          </div>
        )}
      </button>
      {open && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {qData.answers.map((a, i) => (
            <div key={a.value}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: C.txt }}>{a.label}</span>
                <span style={{ fontSize: 13, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>
                  {a.count} ({a.pct}%)
                </span>
              </div>
              <div style={{ height: 5, background: '#1a2010', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${a.pct}%`,
                  background: [C.green, C.gold, C.blue, C.orange][i % 4],
                  borderRadius: 99, transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfilesCard({ profiles }) {
  const colors = [C.gold, C.green, C.red, C.blue, C.orange, C.success];
  return (
    <div style={S.card}>
      <p style={{ ...S.h2, marginBottom: 16 }}>Perfis de Lead</p>
      {profiles.length === 0 ? (
        <p style={{ fontSize: 13, color: C.muted }}>Sem dados ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {profiles.map((p, i) => (
            <div key={p.profile}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i % colors.length] }} />
                  <span style={{ fontSize: 13, color: C.txt }}>{p.label}</span>
                </div>
                <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: C.muted }}>
                  {p.count} ({p.pct}%)
                </span>
              </div>
              <div style={{ height: 5, background: '#1a2010', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${p.pct}%`,
                  background: colors[i % colors.length],
                  borderRadius: 99, transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InsightsCard({ insights }) {
  return (
    <div style={S.card}>
      <p style={{ ...S.h2, marginBottom: 16 }}>Insights & Sugestões</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {insights.map((ins, i) => (
          <div key={i} style={{
            background: insightBg[ins.level] || insightBg.info,
            border: `1px solid ${insightColor[ins.level]}30`,
            borderLeft: `3px solid ${insightColor[ins.level]}`,
            borderRadius: 10, padding: '12px 14px',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: insightColor[ins.level], marginBottom: 4 }}>
              {ins.title}
            </p>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{ins.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.sessions), 1);
  return (
    <div style={S.card}>
      <p style={{ ...S.h2, marginBottom: 16 }}>Sessões por Dia</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 64 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', background: C.green,
              height: `${Math.max(4, (d.sessions / max) * 56)}px`,
              borderRadius: '4px 4px 0 0', opacity: 0.8,
            }} title={`${d.date}: ${d.sessions} sessões`} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: C.dim }}>{data[0]?.date?.slice(5)}</span>
        <span style={{ fontSize: 10, color: C.dim }}>{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async (key, d) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/stats?key=${encodeURIComponent(key)}&days=${d}`);
      if (res.status === 401) { setError('Chave incorreta.'); setAuthed(false); setLoading(false); return; }
      const json = await res.json();
      setStats(json);
      setLastUpdated(new Date().toLocaleTimeString('pt-BR'));
    } catch (_) {
      setError('Erro ao carregar dados.');
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    if (!keyInput.trim()) return;
    setAdminKey(keyInput.trim());
    setAuthed(true);
    fetchStats(keyInput.trim(), days);
  };

  const handlePeriod = (d) => {
    setDays(d);
    fetchStats(adminKey, d);
  };

  // Auto-refresh every 60s
  useEffect(() => {
    if (!authed || !adminKey) return;
    const id = setInterval(() => fetchStats(adminKey, days), 60000);
    return () => clearInterval(id);
  }, [authed, adminKey, days, fetchStats]);

  /* ── LOGIN GATE ── */
  if (!authed) {
    return (
      <div style={S.root}>
        <div style={S.gate}>
          <div style={S.gateCard}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌿</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: C.txt, marginBottom: 4 }}>Painel Analytics</h1>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Dieta da Selva · Funil</p>
            <input
              style={S.input}
              type="password"
              placeholder="Chave de acesso"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoFocus
            />
            {error && <p style={{ fontSize: 12, color: C.red, marginTop: 8 }}>{error}</p>}
            <button style={S.btn} onClick={handleLogin}>Entrar</button>
          </div>
        </div>
      </div>
    );
  }

  const { totals, funnel, questions, profiles, insights, by_day } = stats || {};

  /* ── MAIN DASHBOARD ── */
  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🌿</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.txt, lineHeight: 1 }}>Analytics · Dieta da Selva</p>
            {lastUpdated && <p style={{ fontSize: 10, color: C.dim, marginTop: 1 }}>Atualizado às {lastUpdated}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {[7, 14, 30].map(d => (
            <button key={d} style={S.pill(days === d)} onClick={() => handlePeriod(d)}>{d}d</button>
          ))}
          <button
            style={{ ...S.pill(false), marginLeft: 8 }}
            onClick={() => fetchStats(adminKey, days)}
            disabled={loading}
          >
            {loading ? '...' : '↻'}
          </button>
        </div>
      </div>

      <div style={S.main}>
        {error && <p style={{ fontSize: 13, color: C.red, marginBottom: 16 }}>{error}</p>}

        {loading && !stats && (
          <div style={{ textAlign: 'center', paddingTop: 80, color: C.muted }}>
            <p style={{ fontSize: 14 }}>Carregando dados...</p>
          </div>
        )}

        {stats && (
          <>
            {/* KPI Cards */}
            <div style={S.grid2}>
              <KpiCard label="Sessões" value={totals.sessions.toLocaleString('pt-BR')} sub={`Últimos ${days} dias`} />
              <KpiCard label="Viram a Oferta" value={totals.reached_result.toLocaleString('pt-BR')} sub={totals.sessions > 0 ? `${Math.round((totals.reached_result/totals.sessions)*100)}% das sessões` : '—'} accent={C.gold} />
              <KpiCard label="Abriram Checkout" value={totals.checkout_initiated.toLocaleString('pt-BR')} sub={totals.reached_result > 0 ? `${Math.round((totals.checkout_initiated/totals.reached_result)*100)}% dos que viram a oferta` : '—'} accent={C.orange} />
              <KpiCard label="Pagamentos" value={totals.payments_confirmed.toLocaleString('pt-BR')} sub={`R$ ${(totals.revenue || 0).toLocaleString('pt-BR')} · ${totals.conversion_rate}% de conversão`} accent={C.green} />
            </div>

            {/* Funnel + Insights/Profiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20, marginBottom: 24 }}>
              {/* Funnel */}
              <div style={S.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <p style={S.h2}>Funil de Conversão</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {Object.entries(groupColors).map(([g, c]) => (
                      <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                        <span style={{ fontSize: 10, color: C.muted, textTransform: 'capitalize' }}>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Column headers */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 8, paddingRight: 2 }}>
                  <span style={{ fontSize: 10, color: C.dim, width: 56, textAlign: 'right' }}>Sessões</span>
                  <span style={{ fontSize: 10, color: C.dim, width: 36, textAlign: 'right' }}>Do total</span>
                  <span style={{ fontSize: 10, color: C.dim, width: 44, textAlign: 'right' }}>Perda</span>
                </div>
                {funnel.map((step, i) => (
                  <FunnelRow
                    key={step.key}
                    step={step}
                    maxCount={funnel[0]?.count || 1}
                    isLast={i === funnel.length - 1}
                  />
                ))}
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ProfilesCard profiles={profiles || []} />
                <MiniChart data={by_day || []} />
              </div>
            </div>

            {/* Insights */}
            <InsightsCard insights={insights || []} />

            {/* Quiz Questions */}
            {questions && Object.keys(questions).length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ ...S.h2, marginBottom: 16 }}>Respostas do Quiz</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 }}>
                  {Object.entries(questions).map(([qId, qData]) => (
                    <QuestionCard key={qId} qData={qData} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
