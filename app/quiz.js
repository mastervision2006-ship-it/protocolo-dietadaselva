"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   PROTOCOLO DIETA DA SELVA v2.0 — FUNIL QUIZ IMERSIVO
   Público: Mulheres 30+ | R$27 | Garantia 7 dias
   ═══════════════════════════════════════════════════════════ */

const CHECKOUT_URL = "https://SEU-CHECKOUT-GG.com/protocolo-dieta-da-selva";

/* ── SCREENS FLOW v3.0 ──
  1. landing        → Landing com matéria Fogaça
  2. name           → Pega nome
  3. quiz (9 perguntas com segmentação)
  4. [medo-screen]  → Só para quem responde "medo de falhar" na Q9
  5. body-data      → Peso, altura, meta
  6. edu-unificada  → GLP-1 + mecanismo + 2 depoimentos em 1 tela
  7. analyzing      → Loading com progresso
  8. diagnosis      → Diagnóstico personalizado por perfil
  9. result         → Oferta com headline dinâmica por segmento
*/

const QUIZ_QUESTIONS = [
  {
    id: "goal",
    question: "{{name}}, qual é o seu maior objetivo agora?",
    subtitle: "Seja honesta — isso define todo o seu protocolo",
    options: [
      { text: "Perder peso de vez", emoji: "🔥", value: "peso" },
      { text: "Desinchar e me sentir leve", emoji: "✨", value: "desinchar" },
      { text: "Recuperar minha energia", emoji: "⚡", value: "energia" },
      { text: "Tudo isso junto", emoji: "💎", value: "todas" },
    ],
  },
  {
    id: "age",
    question: "Qual a sua faixa de idade?",
    subtitle: "O protocolo é calibrado por fase metabólica, {{name}}",
    options: [
      { text: "25 a 34 anos", emoji: "🌸", value: "25-34" },
      { text: "35 a 44 anos", emoji: "🌺", value: "35-44" },
      { text: "45 a 54 anos", emoji: "🌹", value: "45-54" },
      { text: "55 anos ou mais", emoji: "💐", value: "55+" },
    ],
  },
  {
    id: "frustration",
    question: "Qual dessas frases te representa mais, {{name}}?",
    subtitle: "Não julgamos — só precisamos entender seu padrão",
    options: [
      { text: "Já tentei várias dietas e nenhuma durou", emoji: "😞", value: "dietas" },
      { text: "Sempre emagreço e volto a engordar", emoji: "🔄", value: "sanfona" },
      { text: "Sinto fome demais em qualquer dieta", emoji: "😫", value: "fome" },
      { text: "Não tenho tempo para coisas complicadas", emoji: "⏰", value: "tempo" },
    ],
  },
  {
    id: "meals",
    question: "Como você descreveria sua alimentação hoje?",
    subtitle: "Sem julgamento — só queremos entender seu ponto de partida",
    options: [
      { text: "Muita massa, pão e doce no dia a dia", emoji: "🍞", value: "carboidratos" },
      { text: "Pulo refeições com frequência", emoji: "⏭️", value: "pula" },
      { text: "Tento comer bem mas não consigo manter", emoji: "🥗", value: "tenta" },
      { text: "Como de tudo, sem padrão definido", emoji: "🍕", value: "descontrole" },
    ],
  },
  {
    id: "symptoms",
    question: "Você sente algum desses sinais, {{name}}?",
    subtitle: "Esses sintomas revelam seu perfil metabólico real",
    options: [
      { text: "Barriga inchada quase todo dia", emoji: "🎈", value: "inchaço" },
      { text: "Cansaço mesmo dormindo bem", emoji: "😴", value: "cansaço" },
      { text: "Vontade de comer doce ou compulsão", emoji: "🧠", value: "ansiedade" },
      { text: "Dores nas juntas ou sensação de inflamação", emoji: "🦴", value: "inflamação" },
    ],
  },
  {
    id: "tentativas",
    question: "Quantas vezes você já tentou emagrecer de verdade?",
    subtitle: "Cada tentativa revela algo sobre o seu metabolismo, {{name}}",
    options: [
      { text: "Esta seria minha primeira tentativa", emoji: "🆕", value: "primeira" },
      { text: "Já tentei 1 ou 2 vezes", emoji: "🌱", value: "poucas" },
      { text: "Já tentei muitas vezes (mais de 3)", emoji: "📉", value: "muitas" },
      { text: "Perdi as contas — é um ciclo sem fim", emoji: "🔁", value: "ciclo" },
    ],
  },
  {
    id: "motivacao",
    question: "O que mais te motivaria a começar, {{name}}?",
    subtitle: "Queremos entender o que realmente importa para você",
    options: [
      { text: "Sentir diferença rápida no meu corpo", emoji: "⚡", value: "resultado-rapido" },
      { text: "Um método simples que cabe na minha rotina", emoji: "🌿", value: "simplicidade" },
      { text: "Comer bem sem passar fome jamais", emoji: "🥩", value: "sem-fome" },
      { text: "Ter energia e bem-estar, não só emagrecer", emoji: "✨", value: "bemestar" },
    ],
  },
  {
    id: "commitment",
    question: "Se você tivesse o método certo em mãos agora...",
    subtitle: "Imagine: sem fome, sem academia obrigatória, comendo o que ama",
    options: [
      { text: "Começaria ainda hoje", emoji: "🚀", value: "hoje" },
      { text: "Começaria se fosse fácil de seguir", emoji: "👍", value: "tentaria" },
      { text: "Precisaria entender melhor primeiro", emoji: "📖", value: "saber" },
      { text: "Já ouvi muita promessa — estou cansada", emoji: "😒", value: "descrente" },
    ],
  },
  {
    id: "ready",
    question: "{{name}}, como você se sente em relação a mudar agora?",
    subtitle: "Esta resposta é a mais importante de todas",
    options: [
      { text: "Estou pronta — quero começar agora", emoji: "💪", value: "pronta" },
      { text: "Estou pronta se o método for comprovado", emoji: "✅", value: "comprovado" },
      { text: "Tenho medo de falhar de novo", emoji: "🥺", value: "medo" },
      { text: "Preciso ver resultado antes de acreditar", emoji: "📊", value: "resultado" },
    ],
  },
];

const TESTIMONIALS = [
  { name:"Mariana R.", age:"38", city:"São Paulo", text:"Eu era a louca do doce, sério. Depois de 3 dias na dieta a vontade simplesmente foi embora. Perdi 8kg sem sofrer.", result:"-8kg / 30 dias", stars:5, img:"/testimonials/prova1.png" },
  { name:"Cláudia F.", age:"45", city:"Belo Horizonte", text:"Tentei de tudo antes. Com o Protocolo, além de perder 12kg, minha inflamação sumiu. Tenho energia que não tinha aos 30.", result:"-12kg / 60 dias", stars:5, img:"/testimonials/prova2.png" },
  { name:"Patrícia M.", age:"52", city:"Rio de Janeiro", text:"Com 52 anos achava impossível. O app me guiou dia a dia com receitas fáceis. Perdi 6kg e desinchei completamente.", result:"-6kg / 21 dias", stars:5, img:"/testimonials/prova3.png" },
  { name:"Renata S.", age:"41", city:"Curitiba", text:"A parte do GLP-1 me convenceu. Meu corpo produz saciedade naturalmente agora. Emagreci 10kg sem sofrer.", result:"-10kg / 45 dias", stars:5, img:"/testimonials/prova4.png" },
  { name:"Fernanda L.", age:"36", city:"Salvador", text:"Voltei a caber nas minhas roupas de 5 anos atrás. E o melhor: sem academia, só com alimentação e os exercícios do app.", result:"-7kg / 30 dias", stars:5, img:"/testimonials/prova5.jpg" },
  { name:"Juliana C.", age:"44", city:"Porto Alegre", text:"Achei que era mais uma dieta da moda. Me enganei. No 7º dia já não sentia mais aquela fome ansiosa. Perdi 9kg em 5 semanas.", result:"-9kg / 35 dias", stars:5, img:"/testimonials/prova6.webp" },
];

/* ══════════════════════
   SEGMENTATION ENGINE
   ══════════════════════ */
function getLeadProfile(answers) {
  const { goal, age, frustration, tentativas, motivacao, commitment, ready } = answers || {};
  if (ready === 'medo') return 'medo';
  if (commitment === 'hoje' && (ready === 'pronta' || goal === 'todas')) return 'decidida';
  if (tentativas === 'muitas' || tentativas === 'ciclo' || commitment === 'descrente') return 'cetica';
  if ((age === '45-54' || age === '55+') && answers?.symptoms) return 'hormonal';
  if (frustration === 'tempo' || motivacao === 'simplicidade') return 'ocupada';
  if (commitment === 'saber' || ready === 'resultado') return 'economica';
  if (frustration === 'dietas' && tentativas !== 'primeira') return 'cetica';
  return 'cetica';
}

/* ══════════════════════
   BRANCHING ENGINE
   ══════════════════════ */

// 1. Pergunta contextual — subtítulo/enunciado muda com base nas respostas anteriores
function getContextualQuestion(q, answers) {
  const { age, frustration, tentativas, ready } = answers || {};
  const overrides = {};

  if (q.id === 'frustration') {
    if (age === '45-54' || age === '55+')
      overrides.subtitle = 'Depois dos 45 o metabolismo muda — seja honesta com você mesma';
  }

  if (q.id === 'tentativas') {
    if (frustration === 'dietas')
      overrides.subtitle = 'Cada tentativa que não durou tem uma razão — vamos identificar a sua';
    else if (frustration === 'sanfona')
      overrides.subtitle = 'O efeito sanfona tem uma causa hormonal — vamos mapear o seu padrão';
  }

  if (q.id === 'motivacao') {
    if (tentativas === 'muitas' || tentativas === 'ciclo')
      overrides.question = 'O que seria diferente desta vez para você, {{name}}?';
    else if (frustration === 'tempo')
      overrides.question = 'O que te faria encaixar uma mudança na sua rotina agora, {{name}}?';
  }

  if (q.id === 'commitment') {
    if (frustration === 'tempo')
      overrides.subtitle = 'A Selva leva menos de 15 min por dia — imagina o impacto disso';
    else if (frustration === 'fome')
      overrides.subtitle = 'Imagine comer até ficar saciada e ainda assim emagrecer, {{name}}';
  }

  if (q.id === 'ready') {
    if (tentativas === 'ciclo')
      overrides.subtitle = 'Sua resposta define o tipo de suporte que o protocolo vai te dar';
    else if (frustration === 'dietas')
      overrides.subtitle = 'Não precisa de confiança total — só de uma chance justa';
    else if (ready === 'medo')
      overrides.subtitle = 'Qualquer resposta é válida aqui — queremos entender, não julgar';
  }

  return Object.keys(overrides).length ? { ...q, ...overrides } : q;
}

// 2. Passos do loading personalizados por resposta
function getAnalysisSteps(answers, name) {
  const { frustration, tentativas, ready, symptoms, motivacao } = answers || {};

  const step2 =
    frustration === 'tempo'   ? 'Mapeando receitas de menos de 15 minutos para o seu perfil...' :
    frustration === 'fome'    ? 'Calculando seu perfil de saciedade e GLP-1 natural...' :
    frustration === 'dietas'  ? 'Identificando por que os métodos anteriores não funcionaram...' :
    frustration === 'sanfona' ? 'Analisando padrão hormonal do efeito sanfona...' :
                                'Calculando taxa de queima de gordura...';

  const step3 =
    (tentativas === 'muitas' || tentativas === 'ciclo')
      ? 'Cruzando histórico de ciclos com perfis de sucesso similares...'
      : 'Estimando produção natural de GLP-1...';

  const step4 =
    symptoms === 'inchaço'   ? 'Avaliando inflamação e retenção de líquido...' :
    symptoms === 'cansaço'   ? 'Analisando deficiência energética celular...' :
    symptoms === 'ansiedade' ? 'Mapeando eixo intestino-cérebro e compulsão...' :
    symptoms === 'inflamação'? 'Avaliando marcadores inflamatórios e articulares...' :
                               'Avaliando compatibilidade com o protocolo...';

  const step5 =
    ready === 'medo'               ? 'Configurando protocolo de transição gentil...' :
    motivacao === 'simplicidade'   ? 'Selecionando as receitas mais simples do protocolo...' :
    motivacao === 'resultado-rapido'? 'Calculando cronograma de resultados acelerado...' :
                                     'Gerando diagnóstico personalizado...';

  return [
    { l: `Analisando perfil metabólico de ${name}...`, t: 0  },
    { l: step2,                                         t: 20 },
    { l: step3,                                         t: 40 },
    { l: step4,                                         t: 60 },
    { l: step5,                                         t: 80 },
    { l: 'Finalizando seu laudo...',                    t: 95 },
  ];
}

// 3. Nota de abertura do diagnóstico — frase empática personalizada
function getDiagnosisNote(answers) {
  const { frustration, tentativas, ready, motivacao } = answers || {};

  if (ready === 'medo')
    return { emoji: '🌿', text: 'Identificamos que você tem medo de falhar de novo. Por isso seu protocolo foi desenhado para transições gentis — sem choques, sem obrigações impossíveis.' };
  if (tentativas === 'ciclo' || (tentativas === 'muitas' && frustration === 'dietas'))
    return { emoji: '🔄', text: 'Após múltiplas tentativas, encontramos o padrão exato que sabotou cada uma delas. Desta vez o protocolo vai direto nessa raiz.' };
  if (frustration === 'tempo' || motivacao === 'simplicidade')
    return { emoji: '⏱️', text: 'Seu protocolo foi otimizado para menos de 15 minutos por dia — sem preparo longo, sem receitas complicadas.' };
  if (frustration === 'fome' || motivacao === 'sem-fome')
    return { emoji: '🥩', text: 'Seu protocolo prioriza saciedade máxima desde o Dia 1 — você vai comer até se sentir satisfeita em cada refeição.' };
  if (frustration === 'sanfona')
    return { emoji: '⚖️', text: 'Identificamos seu padrão de efeito sanfona. O protocolo foi ajustado para preservar músculo e estabilizar o peso depois da perda.' };
  return null;
}

// 4. Nota de abertura da oferta — frase curta e direta por contexto
function getOfferNote(answers, name) {
  const { frustration, tentativas, ready, motivacao, commitment } = answers || {};

  if (ready === 'medo')
    return `Nenhuma promessa impossível. Só 7 dias para você provar para si mesma.`;
  if (tentativas === 'ciclo')
    return `Você já deu voltas nesse ciclo tempo suficiente. Esta é a saída, ${name}.`;
  if (frustration === 'tempo')
    return `Menos de 15 minutos por dia. Sem academia. Sem complicação.`;
  if (frustration === 'fome')
    return `Desta vez você vai comer de verdade — e o peso vai cair mesmo assim.`;
  if (commitment === 'descrente' || (tentativas === 'muitas' && frustration === 'dietas'))
    return `Você está cansada de promessas. Por isso existe a garantia de 7 dias — risco zero do seu lado.`;
  if (motivacao === 'bemestar')
    return `Não é só sobre emagrecer. É sobre se sentir bem de verdade, todos os dias.`;
  return null;
}

/* ══════════════════════
   FUNNEL TRACKING
   ══════════════════════ */
function getSessionId() {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('_sds_sid');
  if (!sid) {
    sid = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    sessionStorage.setItem('_sds_sid', sid);
  }
  return sid;
}

function track(event, data = {}) {
  try {
    const sid = getSessionId();
    if (!sid) return;
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sid, event, ...data }),
      keepalive: true,
    }).catch(() => {});
  } catch (_) {}
}

/* ══════════════════════
   ANSWER NORMALIZER
   Maps new screen values → internal engine values (diagnosis, profiles, loading)
   ══════════════════════ */
const ANSWER_NORMALIZE = {
  age: {
    '18–29': '25-34',
    '30–39': '35-44',
    '40–49': '45-54',
    '50+':   '55+',
  },
  goal: {
    'emagrecer': 'peso',
    // desinchar, energia, todas → unchanged
  },
  frustration: {
    'parou':  'dietas',   // "metabolismo parou" → histórico de dietas
    'sanfona': 'sanfona', // unchanged
    'inicio':  'tempo',   // "estou começando" → quer simplicidade
  },
  meals: {
    '1-2':       'pula',         // poucas refeições → pula
    '3':         'tenta',        // regular mas não funciona
    '4-5':       'carboidratos', // muitas refeições → padrão carb-driven
    'irregular': 'descontrole',  // sem padrão → descontrole
  },
};

/* ══════════════════════
   MAIN COMPONENT
   ══════════════════════ */
export default function Quiz() {
  const [screen, setScreen]         = useState("gender");
  const [answers, setAnswers]       = useState({});
  const [userName, setUserName]     = useState("");
  const [nameInput, setNameInput]   = useState("");
  const [bodyData, setBodyData]     = useState({ weight:"", height:"", goal:"" });
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [fadeIn, setFadeIn]         = useState(true);

  useEffect(() => {
    track('screen_view', { screen });
    if (typeof window !== 'undefined') window.scrollTo(0,0);
  }, [screen]);

  const t = useCallback((cb) => {
    setFadeIn(false);
    setTimeout(() => { cb(); setFadeIn(true); }, 380);
  }, []);

  const go = (next) => t(() => setScreen(next));

  const answer = (key, val, next) => {
    const normalized = ANSWER_NORMALIZE[key]?.[val] ?? val;
    setAnswers(p => ({ ...p, [key]: normalized }));
    track('quiz_answer', { question: key, answer: val, normalized });
    setTimeout(() => go(next), 400);
  };

  const n = (text) => text.replace(/\{\{name\}\}/g, userName || "você");

  const handleDataSubmit = () => {
    if (!nameInput.trim() || !bodyData.weight || !bodyData.height || !bodyData.goal) return;
    const first = nameInput.trim().split(" ")[0];
    setUserName(first.charAt(0).toUpperCase() + first.slice(1).toLowerCase());
    track('lead_profile', { profile: getLeadProfile(answers) });
    t(() => {
      setScreen("analyzing");
      let p = 0;
      const steps = [{to:18,d:45},{to:35,d:55},{to:52,d:35},{to:70,d:65},{to:88,d:40},{to:100,d:50}];
      let si = 0;
      const run = () => {
        if (si >= steps.length) { setTimeout(() => t(() => setScreen("diagnosis")), 700); return; }
        const {to,d} = steps[si];
        const iv = setInterval(() => {
          p++; setAnalysisProgress(p);
          if (p >= to) { clearInterval(iv); si++; setTimeout(run, 250); }
        }, d);
      };
      run();
    });
  };

  const bmi = bodyData.weight && bodyData.height
    ? (parseFloat(bodyData.weight) / ((parseFloat(bodyData.height)/100) ** 2)).toFixed(1)
    : 0;
  const weightToLose = bodyData.weight && bodyData.goal
    ? Math.max(0, parseFloat(bodyData.weight) - parseFloat(bodyData.goal))
    : 0;
  const timeWeeks = Math.max(3, Math.ceil(weightToLose / 1.2));

  const getBmiCategory = (v) => {
    const b = parseFloat(v);
    if (b < 18.5) return { label:"Abaixo do peso",   color:"#60A5FA" };
    if (b < 25)   return { label:"Peso normal",       color:"#8CB369" };
    if (b < 30)   return { label:"Sobrepeso",         color:"#E8A838" };
    if (b < 35)   return { label:"Obesidade grau I",  color:"#E85D4A" };
    return               { label:"Obesidade grau II+",color:"#DC2626" };
  };

  // total steps for progress bar
  const STEPS = ["gender","age","social-proof","objective","authority","difficulty","mechanism","awareness","habits","symptoms","sleep-q","sleep-edu","water-q","water-edu","exercise-q","exercise-edu","data"];
  const stepIdx = STEPS.indexOf(screen);
  const progress = stepIdx >= 0 ? Math.round(((stepIdx + 1) / STEPS.length) * 100) : 100;

  return (
    <div style={S.page}>
      <div style={S.grain} />
      <div style={S.glow1} />
      <div style={S.glow2} />
      <div style={{...S.container, opacity: fadeIn?1:0, transform: fadeIn?"translateY(0)":"translateY(14px)", transition:"all 0.4s ease"}}>
        {screen === "gender"       && <GenderScreen     onAnswer={(v) => answer('gender', v, 'age')} />}
        {screen === "age"          && <AgeScreen        progress={progress} onAnswer={(v) => answer('age', v, 'social-proof')} />}
        {screen === "social-proof" && <SocialProofScreen progress={progress} onNext={() => go('objective')} />}
        {screen === "objective"    && <ObjectiveScreen  progress={progress} onAnswer={(v) => answer('goal', v, 'authority')} />}
        {screen === "authority"    && <AuthorityScreen  progress={progress} onNext={() => go('difficulty')} />}
        {screen === "difficulty"   && <DifficultyScreen progress={progress} onAnswer={(v) => answer('frustration', v, 'mechanism')} />}
        {screen === "mechanism"    && <MechanismScreen  progress={progress} onNext={() => go('awareness')} />}
        {screen === "awareness"    && <AwarenessScreen  progress={progress} onAnswer={(v) => answer('awareness', v, 'habits')} />}
        {screen === "habits"       && <HabitsScreen     progress={progress} onAnswer={(v) => answer('meals', v, 'symptoms')} />}
        {screen === "symptoms"    && <SymptomsScreen    progress={progress} onAnswer={(v) => answer('symptoms', v, 'sleep-q')} />}
        {screen === "sleep-q"     && <SleepQuestion     progress={progress} onAnswer={(v) => { answer('sleep', v, 'sleep-edu'); }} />}
        {screen === "sleep-edu"   && <SleepEdu          progress={progress} onNext={() => go('water-q')} />}
        {screen === "water-q"     && <WaterQuestion     progress={progress} onAnswer={(v) => { answer('water', v, 'water-edu'); }} />}
        {screen === "water-edu"   && <WaterEdu          progress={progress} onNext={() => go('exercise-q')} />}
        {screen === "exercise-q"  && <ExerciseQuestion  progress={progress} onAnswer={(v) => { answer('exercise', v, 'exercise-edu'); }} />}
        {screen === "exercise-edu"&& <ExerciseEdu       progress={progress} onNext={() => go('data')} />}
        {screen === "data"         && <DataScreen       nameInput={nameInput} onNameChange={setNameInput} bodyData={bodyData} onBodyChange={setBodyData} onSubmit={handleDataSubmit} />}
        {screen === "analyzing"    && <Analyzing        progress={analysisProgress} name={userName || nameInput} answers={answers} />}
        {screen === "diagnosis"    && <Diagnosis        name={userName} bmi={bmi} bmiCat={getBmiCategory(bmi)} weightToLose={weightToLose} timeWeeks={timeWeeks} answers={answers} onNext={() => go('result')} />}
        {screen === "result"       && <Result           name={userName} weightToLose={weightToLose} timeWeeks={timeWeeks} bmi={bmi} bmiCat={getBmiCategory(bmi)} answers={answers} />}
      </div>
      {screen === "result" && <SelvaChat name={userName} />}
      <style>{CSS}</style>
    </div>
  );
}

/* ══════════════════════
   APP DEMO — Interactive Preview
   ══════════════════════ */
const PLANO_S1 = [
  {dia:1,titulo:'Dia 1 — Ativação',subtitulo:'Iniciando o Protocolo',cafe:{emoji:'☀️',tipo:'Café da manhã',hora:'7h',titulo:'Ovos mexidos com bacon',descricao:'3 ovos + 3 fatias bacon + manteiga',calorias:420,proteinas:28},almoco:{emoji:'🥩',tipo:'Almoço',hora:'12h',titulo:'Picanha grelhada',descricao:'200g picanha + manteiga de alho',calorias:680,proteinas:52},lanche:{emoji:'🧀',tipo:'Lanche',hora:'15h',titulo:'Queijo coalho grelhado',descricao:'2 fatias + azeite',calorias:280,proteinas:18},jantar:{emoji:'🌙',tipo:'Jantar',hora:'19h',titulo:'Frango com manteiga de alho',descricao:'200g coxa + ervas finas',calorias:520,proteinas:48}},
  {dia:2,titulo:'Dia 2 — Adaptação',subtitulo:'O corpo se ajusta',cafe:{emoji:'☀️',tipo:'Café da manhã',hora:'7h',titulo:'Omelete de queijo',descricao:'3 ovos + 50g queijo + manteiga',calorias:390,proteinas:30},almoco:{emoji:'🥩',tipo:'Almoço',hora:'12h',titulo:'Costelinha assada',descricao:'300g costelinha + alho',calorias:720,proteinas:48},lanche:{emoji:'🐟',tipo:'Lanche',hora:'15h',titulo:'Sardinha com azeite',descricao:'1 lata + azeite extra virgem',calorias:250,proteinas:22},jantar:{emoji:'🌙',tipo:'Jantar',hora:'19h',titulo:'Carne moída refogada',descricao:'200g patinho + manteiga',calorias:460,proteinas:44}},
  {dia:3,titulo:'Dia 3 — Queima',subtitulo:'Cetose iniciando',cafe:{emoji:'☀️',tipo:'Café da manhã',hora:'7h',titulo:'Café com manteiga',descricao:'Café preto + 1 col manteiga',calorias:120,proteinas:0},almoco:{emoji:'🥩',tipo:'Almoço',hora:'12h',titulo:'Contrafilé na brasa',descricao:'250g contrafilé + sal grosso',calorias:600,proteinas:55},lanche:{emoji:'🧀',tipo:'Lanche',hora:'15h',titulo:'Queijo e presunto',descricao:'3 fatias queijo + 3 presunto',calorias:220,proteinas:20},jantar:{emoji:'🌙',tipo:'Jantar',hora:'19h',titulo:'Salmão grelhado',descricao:'180g salmão + limão + manteiga',calorias:480,proteinas:46}},
  {dia:4,titulo:'Dia 4 — Energia',subtitulo:'Combustível animal',cafe:{emoji:'☀️',tipo:'Café da manhã',hora:'7h',titulo:'Ovos com calabresa',descricao:'2 ovos + 60g calabresa + manteiga',calorias:440,proteinas:26},almoco:{emoji:'🥩',tipo:'Almoço',hora:'12h',titulo:'Tilápia grelhada',descricao:'250g tilápia + manteiga + ervas',calorias:520,proteinas:50},lanche:{emoji:'🥑',tipo:'Lanche',hora:'15h',titulo:'Abacate com sal',descricao:'½ abacate + sal + limão',calorias:180,proteinas:2},jantar:{emoji:'🌙',tipo:'Jantar',hora:'19h',titulo:'Frango desfiado',descricao:'200g frango + 20g manteiga',calorias:490,proteinas:52}},
  {dia:5,titulo:'Dia 5 — Força',subtitulo:'Chegando ao pico',cafe:{emoji:'☀️',tipo:'Café da manhã',hora:'7h',titulo:'Panqueca de ovo',descricao:'2 ovos + 1 banana + manteiga',calorias:320,proteinas:14},almoco:{emoji:'🥩',tipo:'Almoço',hora:'12h',titulo:'Costela no forno',descricao:'300g costela + alho + cebola',calorias:780,proteinas:56},lanche:{emoji:'🧀',tipo:'Lanche',hora:'15h',titulo:'Iogurte grego',descricao:'200g iogurte natural integral',calorias:180,proteinas:16},jantar:{emoji:'🌙',tipo:'Jantar',hora:'19h',titulo:'Atum grelhado',descricao:'200g atum + azeite + limão',calorias:440,proteinas:50}},
  {dia:6,titulo:'Dia 6 — Reviravolta',subtitulo:'Corpo em transformação',cafe:{emoji:'☀️',tipo:'Café da manhã',hora:'7h',titulo:'Ovos cozidos com azeite',descricao:'3 ovos cozidos + azeite + sal',calorias:280,proteinas:21},almoco:{emoji:'🥩',tipo:'Almoço',hora:'12h',titulo:'Pernil assado',descricao:'250g pernil + alecrim + alho',calorias:650,proteinas:54},lanche:{emoji:'🐟',tipo:'Lanche',hora:'15h',titulo:'Sardinha em azeite',descricao:'1 lata sardinha em azeite',calorias:280,proteinas:22},jantar:{emoji:'🌙',tipo:'Jantar',hora:'19h',titulo:'Bife acebolado',descricao:'200g coxão + cebola + manteiga',calorias:500,proteinas:46}},
  {dia:7,titulo:'Dia 7 — Virada!',subtitulo:'Uma semana concluída 🎉',cafe:{emoji:'☀️',tipo:'Café da manhã',hora:'7h',titulo:'Omelete especial',descricao:'3 ovos + cogumelo + queijo',calorias:380,proteinas:28},almoco:{emoji:'🥩',tipo:'Almoço',hora:'12h',titulo:'Churrasco especial',descricao:'Picanha + costela + frango',calorias:900,proteinas:72},lanche:{emoji:'🧀',tipo:'Lanche',hora:'15h',titulo:'Mix de queijos',descricao:'Minas + coalho + parmesão',calorias:250,proteinas:18},jantar:{emoji:'🌙',tipo:'Jantar',hora:'19h',titulo:'Caldo de ossobuco',descricao:'Ossobuco + legumes + ervas',calorias:420,proteinas:40}},
];

const RECEITAS_DEMO = [
  { emoji:'🥚', nome:'Omelete de Queijo com Bacon',     cat:'Café da manhã', tempo:'10 min', kcal:420, prot:32, locked:false },
  { emoji:'🥩', nome:'Picanha na Manteiga de Alho',     cat:'Almoço',        tempo:'15 min', kcal:680, prot:52, locked:false },
  { emoji:'🐟', nome:'Salmão com Limão e Ervas',        cat:'Jantar',        tempo:'12 min', kcal:480, prot:46, locked:true  },
  { emoji:'🥓', nome:'Costelinha Assada com Alho',      cat:'Almoço',        tempo:'20 min', kcal:720, prot:54, locked:true  },
  { emoji:'🧀', nome:'Omelete de Brie e Presunto',      cat:'Café da manhã', tempo:'8 min',  kcal:390, prot:28, locked:true  },
];

const TREINOS_DEMO = [
  { dia:'Dia 1', nome:'Ativação Metabólica', tempo:'15 min', nivel:'Iniciante', locked:false,
    exercicios:[
      { nome:'Agachamento livre', reps:'3 × 15', emoji:'🦵' },
      { nome:'Flexão de braço',   reps:'3 × 10', emoji:'💪' },
      { nome:'Prancha isométrica',reps:'3 × 30s',emoji:'🏋️' },
    ]},
  { dia:'Dia 2', nome:'Força Leve',          tempo:'15 min', nivel:'Iniciante', locked:true,  exercicios:[] },
  { dia:'Dia 3', nome:'Cardio Suave',        tempo:'20 min', nivel:'Iniciante', locked:true,  exercicios:[] },
  { dia:'Dia 4', nome:'Descanso Ativo',      tempo:'10 min', nivel:'Leve',      locked:true,  exercicios:[] },
];

function AppDemo({ onComprar }) {
  const [tab, setTab]       = useState('inicio');
  const [locked, setLocked] = useState(false);
  const [lockedItem, setLockedItem] = useState('');
  const [semana, setSemana] = useState(1);
  const [diaPlano, setDiaPlano] = useState(1);

  function tryAccess(item) { setLockedItem(item); setLocked(true); }

  const diaData = PLANO_S1.find(d => d.dia === diaPlano) ?? PLANO_S1[0];

  const IcoHome     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  const IcoPlano    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M3 9h18M8 3v3M16 3v3M8 14h4M8 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  const IcoReceitas = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6h3.5M21 22v-7h-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  const IcoTreinos  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
  const IcoChat     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;

  return (
    <div className="demo-wrap">
      <p className="demo-headline">📱 Explore o app antes de comprar</p>
      <p className="demo-sub">Toque em qualquer seção para ver o que está te esperando</p>

      <div className="phone-frame">
        <div className="phone-status">
          <span className="phone-time">9:41</span>
          <div className="phone-status-icons">
            <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><rect x="0" y="4" width="2" height="6" rx="0.5" opacity=".4"/><rect x="3" y="2.5" width="2" height="7.5" rx="0.5" opacity=".6"/><rect x="6" y="1" width="2" height="9" rx="0.5" opacity=".8"/><rect x="9" y="0" width="2" height="10" rx="0.5"/></svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 2.5C5.2 2.5 3.1 3.5 1.7 5.1L0 3.3C1.9 1.3 4.6 0 7.5 0s5.6 1.3 7.5 3.3l-1.7 1.8C11.9 3.5 9.8 2.5 7.5 2.5z" opacity=".4"/><path d="M7.5 5.5c-1.5 0-2.8.6-3.7 1.6L2.2 5.4C3.6 3.9 5.5 3 7.5 3s3.9.9 5.3 2.4L11.2 7.1C10.3 6.1 9 5.5 7.5 5.5z" opacity=".7"/><circle cx="7.5" cy="10" r="1.3"/></svg>
            <svg width="22" height="11" viewBox="0 0 22 11" fill="currentColor"><rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="currentColor" strokeOpacity=".35" fill="none"/><rect x="2" y="2" width="14" height="7" rx="1.5"/><path d="M20 3.5v3A1.5 1.5 0 0020 3.5z" opacity=".4"/></svg>
          </div>
        </div>

        <div className="phone-body">

          {tab==='inicio' && (
            <div className="app-home">
              <div className="app-top-bar">
                <div>
                  <p className="app-greeting">Bem-vinda,</p>
                  <p className="app-name-txt">Você 👋</p>
                </div>
                <div className="app-av">🌿</div>
              </div>

              <div className="app-card" onClick={()=>tryAccess('Progresso do Protocolo')}>
                <p className="app-lbl">MEU PROTOCOLO</p>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'5px'}}>
                  <div><span style={{fontSize:'26px',fontWeight:'800',color:'#F2F0E8'}}>0%</span><span style={{fontSize:'11px',color:'#9CA88E',marginLeft:'6px'}}>concluído</span></div>
                  <span style={{fontSize:'11px',color:'#9CA88E'}}>Dia 1/21</span>
                </div>
                <div className="app-bar"><div className="app-bar-fill" style={{width:'4%'}}/></div>
                <div className="app-stats-row" style={{marginTop:'8px'}}>
                  {[['Perdeu','-0kg','#E8A838'],['Meta','Emagrecer','#8CB369'],['Dias','21','#F2F0E8']].map(([l,v,c],i)=>(
                    <div key={i} className="app-stat"><span className="app-stat-l">{l}</span><strong className="app-stat-v" style={{color:c}}>{v}</strong></div>
                  ))}
                </div>
              </div>

              <p className="app-lbl" style={{marginTop:'10px',marginBottom:'5px'}}>PRÓXIMA REFEIÇÃO</p>
              <div className="app-meal" onClick={()=>tryAccess('Plano Alimentar Completo')}>
                <div className="app-meal-icon">🥩</div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:'10px',color:'#E8A838',fontWeight:'600',marginBottom:'2px'}}>Café da manhã</p>
                  <p style={{fontSize:'12px',fontWeight:'700',color:'#F2F0E8',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',marginBottom:'1px'}}>Ovos mexidos com bacon</p>
                  <p style={{fontSize:'10px',color:'#9CA88E'}}>420 kcal · 28g proteína</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#E8A838" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>

              <p className="app-lbl" style={{marginTop:'10px',marginBottom:'5px'}}>DICA DO DIA</p>
              <div className="app-tip" onClick={()=>tryAccess('Dicas Diárias Personalizadas')}>
                <span style={{fontSize:'18px'}}>💧</span>
                <p style={{fontSize:'10px',color:'#9CA88E',lineHeight:'1.5',flex:1}}>Beba pelo menos 2,5L de água hoje. A hidratação acelera a queima de gordura e reduz a fome.</p>
              </div>

              <div className="app-ia-cta" onClick={()=>tryAccess('Selva IA — Chat 24h')}>
                <div className="app-ia-icon">🌿</div>
                <div style={{flex:1}}>
                  <p style={{fontSize:'11px',fontWeight:'700',color:'#F2F0E8',marginBottom:'1px'}}>Selva IA</p>
                  <p style={{fontSize:'10px',color:'#9CA88E'}}>Tire dúvidas sobre sua dieta agora</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#E8A838" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
            </div>
          )}

          {tab==='plano' && (
            <div className="app-section">
              <p className="app-page-title">Plano Alimentar</p>
              <p style={{fontSize:'10px',color:'#9CA88E',marginTop:'-4px',marginBottom:'10px'}}>Protocolo 21 dias · Dieta da Selva</p>

              <div className="app-semana-row">
                {[1,2,3].map(s=>(
                  <button key={s}
                    className={'app-semana-btn'+(semana===s?' app-semana-active':'')}
                    onClick={()=>{ if(s>1){tryAccess('Semana '+s+' do Protocolo');return;} setSemana(s);setDiaPlano(1); }}>
                    Semana {s}
                  </button>
                ))}
              </div>

              <div className="app-dias-row">
                {PLANO_S1.map(d=>(
                  <button key={d.dia}
                    className={'app-dia-pill'+(diaPlano===d.dia?' app-dia-active':'')+(d.dia<diaPlano?' app-dia-done':'')}
                    onClick={()=>setDiaPlano(d.dia)}>
                    <span style={{fontSize:'8px',fontWeight:'500'}}>Dia</span>
                    <span style={{fontSize:'13px',fontWeight:'800',lineHeight:'1.1'}}>{d.dia}</span>
                    {d.dia<diaPlano && <span style={{fontSize:'8px'}}>✓</span>}
                  </button>
                ))}
              </div>

              <div className="app-dia-header">
                <p style={{fontSize:'13px',fontWeight:'700',color:'#F2F0E8',marginBottom:'3px'}}>{diaData.titulo}</p>
                <span className="app-dia-tag">{diaData.subtitulo}</span>
              </div>

              {[diaData.cafe,diaData.almoco,diaData.lanche,diaData.jantar].map((r,i)=>(
                <div key={i} className="app-ref-card" onClick={()=>tryAccess(r.titulo)}>
                  <div className="app-ref-head">
                    <span style={{fontSize:'13px'}}>{r.emoji}</span>
                    <span className="app-ref-tipo">{r.tipo}</span>
                    <span className="app-ref-hora">{r.hora}</span>
                  </div>
                  <p style={{fontSize:'11px',fontWeight:'700',color:'#F2F0E8',marginBottom:'2px'}}>{r.titulo}</p>
                  <p style={{fontSize:'10px',color:'#9CA88E',marginBottom:'6px'}}>{r.descricao}</p>
                  <div style={{display:'flex',gap:'12px'}}>
                    <span><span style={{fontSize:'9px',color:'#5C6652'}}>Kcal </span><strong style={{fontSize:'10px',color:'#E8A838'}}>{r.calorias}</strong></span>
                    <span><span style={{fontSize:'9px',color:'#5C6652'}}>Proteína </span><strong style={{fontSize:'10px',color:'#8CB369'}}>{r.proteinas}g</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab==='receitas' && (
            <div className="app-section">
              <p className="app-page-title">Receitas</p>
              <p style={{fontSize:'10px',color:'#9CA88E',marginTop:'-4px',marginBottom:'10px'}}>Biblioteca carnívora · +50 receitas exclusivas</p>

              {/* Filtros de categoria */}
              <div style={{display:'flex',gap:'5px',overflowX:'auto',marginBottom:'10px',scrollbarWidth:'none',paddingBottom:'2px'}}>
                {['Todas','Café','Almoço','Jantar','Rápidas'].map((c,i)=>(
                  <button key={i} style={{flexShrink:0,padding:'3px 9px',borderRadius:'100px',fontSize:'9px',fontWeight:'600',background:i===0?'#E8A838':'#1A2010',color:i===0?'#000':'#9CA88E',border:'none',fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>{c}</button>
                ))}
              </div>

              {/* Cards visíveis */}
              {RECEITAS_DEMO.filter(r=>!r.locked).map((r,i)=>(
                <div key={i} className="app-ref-card" onClick={()=>tryAccess(r.nome)}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                    <div style={{width:'36px',height:'36px',background:'#1A2010',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>{r.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:'11px',fontWeight:'700',color:'#F2F0E8',marginBottom:'1px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.nome}</p>
                      <p style={{fontSize:'9px',color:'#E8A838'}}>{r.cat}</p>
                    </div>
                    <span style={{fontSize:'9px',color:'#5C6652',background:'#1A2010',padding:'2px 6px',borderRadius:'100px',flexShrink:0,border:'1px solid rgba(140,179,105,0.1)'}}>{r.tempo}</span>
                  </div>
                  <div style={{display:'flex',gap:'12px'}}>
                    <span><span style={{fontSize:'9px',color:'#5C6652'}}>Kcal </span><strong style={{fontSize:'10px',color:'#E8A838'}}>{r.kcal}</strong></span>
                    <span><span style={{fontSize:'9px',color:'#5C6652'}}>Prot </span><strong style={{fontSize:'10px',color:'#8CB369'}}>{r.prot}g</strong></span>
                    <span style={{fontSize:'9px',color:'#8CB369',marginLeft:'auto'}}>✓ Carnívoro</span>
                  </div>
                </div>
              ))}

              {/* Cards bloqueados com overlay */}
              <div style={{position:'relative'}}>
                {RECEITAS_DEMO.filter(r=>r.locked).map((r,i)=>(
                  <div key={i} className="app-ref-card" style={{filter:'blur(3px)',userSelect:'none',marginBottom:'6px',pointerEvents:'none'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{width:'36px',height:'36px',background:'#1A2010',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>{r.emoji}</div>
                      <div style={{flex:1}}><p style={{fontSize:'11px',fontWeight:'700',color:'#F2F0E8'}}>{r.nome}</p><p style={{fontSize:'9px',color:'#E8A838'}}>{r.cat}</p></div>
                      <span style={{fontSize:'9px',padding:'2px 6px',background:'#1A2010',borderRadius:'100px'}}>{r.tempo}</span>
                    </div>
                  </div>
                ))}
                <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(6,9,4,0.65)',backdropFilter:'blur(3px)',borderRadius:'10px',cursor:'pointer'}} onClick={()=>tryAccess('+48 Receitas Exclusivas')}>
                  <span style={{fontSize:'20px'}}>🔒</span>
                  <p style={{fontSize:'11px',fontWeight:'700',color:'#F2F0E8',marginTop:'5px'}}>+48 receitas desbloqueadas</p>
                  <p style={{fontSize:'10px',color:'#E8A838',marginTop:'2px'}}>acesso por R$27</p>
                </div>
              </div>
            </div>
          )}

          {tab==='treinos' && (
            <div className="app-section">
              <p className="app-page-title">Exercícios</p>
              <p style={{fontSize:'10px',color:'#9CA88E',marginTop:'-4px',marginBottom:'10px'}}>Em casa · 15 min · Sem equipamento</p>

              {/* Semana selector */}
              <div className="app-semana-row" style={{marginBottom:'10px'}}>
                {['Semana 1','Semana 2','Semana 3'].map((s,i)=>(
                  <button key={i} className={'app-semana-btn'+(i===0?' app-semana-active':'')} onClick={()=>i>0&&tryAccess(s+' de Exercícios')}>{s}</button>
                ))}
              </div>

              {/* Dia 1 expandido */}
              {TREINOS_DEMO.filter(t=>!t.locked).map((t,i)=>(
                <div key={i} className="app-card" style={{marginBottom:'8px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                    <div>
                      <p style={{fontSize:'11px',fontWeight:'700',color:'#F2F0E8'}}>{t.dia} — {t.nome}</p>
                      <p style={{fontSize:'9px',color:'#9CA88E'}}>{t.tempo} · {t.nivel}</p>
                    </div>
                    <span style={{fontSize:'9px',padding:'2px 7px',background:'rgba(140,179,105,0.1)',color:'#8CB369',borderRadius:'100px',border:'1px solid rgba(140,179,105,0.2)'}}>Hoje</span>
                  </div>
                  {t.exercicios.map((ex,j)=>(
                    <div key={j} style={{display:'flex',alignItems:'center',gap:'8px',padding:'5px 0',borderBottom:j<t.exercicios.length-1?'1px solid rgba(140,179,105,0.06)':'none'}}>
                      <span style={{fontSize:'14px'}}>{ex.emoji}</span>
                      <span style={{fontSize:'10px',color:'#D4D9CC',flex:1}}>{ex.nome}</span>
                      <span style={{fontSize:'9px',fontWeight:'700',color:'#E8A838'}}>{ex.reps}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Dias bloqueados */}
              <div style={{position:'relative'}}>
                {TREINOS_DEMO.filter(t=>t.locked).map((t,i)=>(
                  <div key={i} className="app-ref-card" style={{filter:'blur(3px)',userSelect:'none',marginBottom:'6px',pointerEvents:'none'}}>
                    <p style={{fontSize:'11px',fontWeight:'700',color:'#F2F0E8'}}>{t.dia} — {t.nome}</p>
                    <p style={{fontSize:'9px',color:'#9CA88E'}}>{t.tempo} · Sem equipamento</p>
                  </div>
                ))}
                <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(6,9,4,0.65)',backdropFilter:'blur(3px)',borderRadius:'10px',cursor:'pointer'}} onClick={()=>tryAccess('21 Dias de Exercícios')}>
                  <span style={{fontSize:'20px'}}>🔒</span>
                  <p style={{fontSize:'11px',fontWeight:'700',color:'#F2F0E8',marginTop:'5px'}}>21 dias de treino desbloqueados</p>
                  <p style={{fontSize:'10px',color:'#E8A838',marginTop:'2px'}}>acesso por R$27</p>
                </div>
              </div>
            </div>
          )}

          {tab==='desafio' && (
            <div className="app-section">
              <p className="app-page-title">Desafio 21 Dias</p>
              <p style={{fontSize:'10px',color:'#9CA88E',marginTop:'-6px',marginBottom:'10px'}}>Sem falhar · Protocolo Dieta da Selva</p>

              <div className="app-card" style={{marginBottom:'10px'}} onClick={()=>tryAccess('Progresso do Desafio')}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                  <div><p style={{fontSize:'24px',fontWeight:'800',color:'#F2F0E8',lineHeight:'1'}}>0%</p><p style={{fontSize:'9px',color:'#9CA88E'}}>do desafio concluído</p></div>
                  <div style={{textAlign:'right'}}><p style={{fontSize:'18px',fontWeight:'700',color:'#E8A838'}}>🔥 0</p><p style={{fontSize:'9px',color:'#9CA88E'}}>dias seguidos</p></div>
                </div>
                <div className="app-bar" style={{marginBottom:'10px'}}><div className="app-bar-fill" style={{width:'0%'}}/></div>
                <div className="app-days-grid">
                  {Array.from({length:21},(_,i)=>(
                    <div key={i} className={`app-day${i===0?' app-day-today':''}`}>{i===0?'●':i+1}</div>
                  ))}
                </div>
              </div>

              <div className="app-checkin-card" onClick={()=>tryAccess('Check-in Diário')}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                  <span style={{fontSize:'18px'}}>📋</span>
                  <div>
                    <p style={{fontSize:'11px',fontWeight:'700',color:'#F2F0E8'}}>Check-in — Dia 1</p>
                    <p style={{fontSize:'10px',color:'#9CA88E'}}>Marque quando concluir o cardápio de hoje</p>
                  </div>
                </div>
                <div className="app-checkin-btn">MARCAR DIA COMO CONCLUÍDO</div>
              </div>

              <div className="app-stats-row" style={{marginTop:'10px'}}>
                {[['📅','0','Dias feitos'],['🔥','0','Sequência'],['⏳','21','Restam']].map(([e,v,l],i)=>(
                  <div key={i} className="app-card" style={{flex:1,textAlign:'center',padding:'8px 4px'}}>
                    <div style={{fontSize:'16px',marginBottom:'3px'}}>{e}</div>
                    <p style={{fontSize:'16px',fontWeight:'800',color:'#F2F0E8',lineHeight:'1'}}>{v}</p>
                    <p style={{fontSize:'9px',color:'#9CA88E',marginTop:'2px'}}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='chat' && (
            <div className="app-chat-wrap">
              <div className="app-chat-hd">
                <div className="app-chat-av">🌿</div>
                <div style={{flex:1}}>
                  <p style={{fontSize:'12px',fontWeight:'700',color:'#F2F0E8',marginBottom:'1px'}}>Selva IA</p>
                  <p style={{fontSize:'10px',color:'#8CB369',display:'flex',alignItems:'center',gap:'4px'}}>
                    <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#8CB369',display:'inline-block'}}/>online agora
                  </p>
                </div>
              </div>
              <div className="app-chat-msgs">
                <div className="app-chat-bot-msg">Oi! Sou a Selva IA 🌿 Estou aqui para te guiar no protocolo, adaptar receitas e te motivar!</div>
                <div className="app-chat-bot-msg">Posso calcular sua meta de proteína, sugerir substituições e responder qualquer dúvida sobre a dieta.</div>
                <div className="app-chat-blur-wrap" onClick={()=>tryAccess('Selva IA — Chat 24h')}>
                  <div className="app-chat-user-msg" style={{filter:'blur(4px)',userSelect:'none'}}>Qual receita posso fazer...</div>
                  <div className="app-chat-bot-msg" style={{filter:'blur(4px)',userSelect:'none'}}>Com certeza! Para o seu perfil eu recomendo...</div>
                  <div className="app-chat-lock-overlay">
                    <span style={{fontSize:'20px'}}>🔒</span>
                    <p style={{fontSize:'10px',fontWeight:'700',color:'#F2F0E8',marginTop:'4px'}}>Disponível para membros</p>
                    <p style={{fontSize:'9px',color:'#9CA88E'}}>Chat 24h · acesso por R$27</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="phone-nav">
          {[
            {id:'inicio',   Ic:IcoHome,     label:'Início'},
            {id:'plano',    Ic:IcoPlano,    label:'Plano'},
            {id:'receitas', Ic:IcoReceitas, label:'Receitas'},
            {id:'treinos',  Ic:IcoTreinos,  label:'Treinos'},
            {id:'chat',     Ic:IcoChat,     label:'Chat IA'},
          ].map(({id,Ic,label})=>(
            <button key={id} className={`pnav-btn${tab===id?' pnav-active':''}`} onClick={()=>setTab(id)}>
              <Ic/>
              <span className="pnav-label">{label}</span>
            </button>
          ))}
        </div>

        <div className="phone-home-ind"/>

        {locked && (
          <div className="demo-paywall" onClick={()=>setLocked(false)}>
            <div className="demo-pw-card" onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:'36px',marginBottom:'4px'}}>🔒</div>
              <p className="demo-pw-title">Conteúdo Exclusivo</p>
              <p className="demo-pw-sub">"{lockedItem}" é exclusivo para membros do Protocolo Dieta da Selva</p>
              <div className="demo-pw-price">
                <span style={{fontSize:'13px',color:'#5C6652',textDecoration:'line-through',marginRight:'8px'}}>De R$ 197</span>
                <span style={{fontSize:'26px',fontWeight:'900',color:'#F2F0E8'}}>R$ 27</span>
              </div>
              <div className="demo-pw-perks">
                {['Plano 21 dias completo','Selva IA 24h','Desafio + check-in','Garantia 7 dias'].map((p,i)=>(
                  <span key={i} className="demo-pw-perk">✓ {p}</span>
                ))}
              </div>
              <button className="demo-pw-cta" onClick={()=>{ setLocked(false); onComprar(); }}>
                GARANTIR ACESSO AGORA →
              </button>
              <p className="demo-pw-guarantee">🛡️ Garantia incondicional de 7 dias</p>
              <button className="demo-pw-back" onClick={()=>setLocked(false)}>← Continuar explorando</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════
   SELVA CHAT — Knowledge Base
   ══════════════════════ */
const CHAT_KB = [
  // OBJEÇÃO 1 — Já tentei tanta coisa
  {
    triggers: ['ja tentei','já tentei','nao funciona','não funciona','tentei de tudo','tentei varias','tentei várias','decepcionei','frustrada','frustrei','nao acredito','não acredito','funciona mesmo','vai ser diferente'],
    text: `Eu entendo. De verdade.\n\nSabe o que me dói nessa frase? Que você está carregando a culpa de um fracasso que não é seu.\n\nVocê não falhou. O método falhou com você.\n\nPensa comigo: toda dieta que você tentou antes te pediu o quê? Cortar carboidrato e passar fome. Contar caloria e viver com ansiedade. Tomar shake e fingir que aquilo é comida de verdade. Sacrificar final de semana, social, prazer — por um resultado que some na primeira semana que você para.\n\nNão é fraqueza sua. É que esse sistema foi feito pra você abandonar. Porque toda vez que você abandona, você culpa a si mesma e tenta de novo.\n\nA Dieta da Selva funciona diferente porque ela não pede sacrifício. Ela pede que você coma — de verdade. Carne, ovos, frutas. Comida que sacia, que alimenta, que dá energia. Sem contar nada, sem passar fome.\n\nSão só R$27. Com garantia de 7 dias. Se em uma semana você achar que não é pra você, devolvemos tudo. Sem pergunta, sem burocracia.\n\nA única pergunta que importa agora é: você vai deixar as tentativas passadas te impedir de tentar o único método que respeita o seu corpo?`,
    suggestions: ['Vou passar fome?','E a garantia?','Quero começar hoje'],
    showCTA: false,
  },
  // OBJEÇÃO 2 — Medo de passar fome
  {
    triggers: ['fome','passar fome','ficar com fome','fiquei com fome','restritiva','restricao','restrição','sacrificio','sacrifício','mal-humorada','mal humorada','ansiosa com dieta'],
    text: `Essa é a melhor objeção que você podia ter. Porque ela me diz que você já sofreu pra caramba com dieta — e que dessa vez você quer algo diferente.\n\nVou te contar uma coisa que a maioria não fala: fome não é sinal de que você está emagrecendo. Fome é sinal de que o seu corpo está em pânico. E quando o corpo entra em pânico, ele segura gordura.\n\nA Dieta da Selva foi construída exatamente ao contrário. Você come até ficar saciada. Carne, ovo, frutas. Gordura boa. Proteína de verdade. Seu corpo recebe o sinal de que está bem alimentado — e aí, sim, ele libera a gordura guardada.\n\nA primeira coisa que muda é que a fome ansiosa das 15h desaparece. Aquela vontade de doce depois do almoço? Some. Porque o corpo finalmente foi alimentado de verdade.\n\nCom R$27 você testa isso por 7 dias. Se no sétimo dia você ainda estiver com fome, pede o dinheiro de volta. Mas você vai sentir a diferença muito antes disso.`,
    suggestions: ['Posso comer de tudo?','E os carboidratos?','Quero testar os 7 dias'],
    showCTA: true,
  },
  // OBJEÇÃO 3 — Não vai funcionar pra mim
  {
    triggers: ['comigo nao','comigo não','meu metabolismo','metabolismo lento','nao sou como','não sou como','caso especial','diferente das outras','meu corpo nao','meu corpo não','problema no meu corpo'],
    text: `Sabe o que é mais doloroso do que uma dieta não funcionar? É quando você começa a acreditar que o problema é você.\n\nQuantas vezes você já disse essa frase: "Comigo não funciona"? Eu preciso que você escute o quanto isso machuca. Porque você está carregando uma crença que não é sua — alguém plantou ela em você cada vez que um método falhou e jogou a culpa no seu corpo.\n\nMas vou te falar a verdade: o seu corpo não é defeituoso. Ele é inteligente. Quando você passa fome, ele segura gordura. Quando você come industrializado, ele inflama. Quando você come de verdade — proteína, gordura boa, fruta — ele faz exatamente o que deveria fazer.\n\nA Dieta da Selva não é pra um tipo específico de corpo. Ela funciona porque respeita como o corpo humano funciona — o seu, o meu, o de qualquer mulher.\n\nR$27 é menos que um lanche no shopping. Com 7 dias de garantia. Você não tem nada a perder — só a crença de que "comigo não funciona". E essa crença? Ela está te custando muito mais do que R$27.`,
    suggestions: ['Mas tenho hormônio lento','E a garantia?','Quero tentar'],
    showCTA: true,
  },
  // OBJEÇÃO 4 — Não tenho tempo
  {
    triggers: ['nao tenho tempo','não tenho tempo','vida corrida','ocupada','sem tempo','nao consigo','não consigo','rotina cheia','muita coisa pra fazer','cansada demais'],
    text: `Você trabalha, cuida da casa, cuida das pessoas que ama — e ainda assim está aqui, tentando cuidar de você. Isso diz muito sobre quem você é.\n\nMas eu preciso te fazer uma pergunta honesta: quanto tempo você gasta por dia se sentindo mal com o próprio corpo? Se olhando no espelho e desviando o olhar? Escolhendo roupa porque nada te agrada? Pensando em "segunda-feira começo"?\n\nÀs vezes o que nos toma mais tempo não é fazer a mudança — é o peso emocional de adiar ela.\n\nO App Dieta da Selva cabe na sua rotina porque não exige nada de extra. As receitas são simples. Os exercícios são em casa, sem equipamento, em menos de 15 minutos. A alimentação usa comida de verdade que você já compra.\n\nNão é mais uma coisa na sua lista. É a coisa que vai te dar energia pra fazer todas as outras coisas melhor.`,
    suggestions: ['As receitas são rápidas?','Precisa de academia?','Quero começar'],
    showCTA: true,
  },
  // OBJEÇÃO 5 — R$27 parece barato demais
  {
    triggers: ['barato demais','muito barato','parece fraco','parece ruim','qualidade baixa','27 reais so','r$27 so','27 reais é pouco','desconfio','desconfiei'],
    text: `Eu adoro essa pergunta porque ela diz que você tem discernimento. Você já foi enganada antes — e não quer cair num golpe de novo.\n\nMas me deixa virar essa lógica: você já pagou caro por algo que não funcionou? Nutricionista a R$300 a consulta? Shake de R$200? Curso de reeducação alimentar de R$500?\n\nO preço alto não é garantia de resultado. Às vezes é só garantia de que o marketing foi mais caro.\n\nO App Dieta da Selva custa R$27 porque o objetivo é simples: tirar a barreira financeira que impede você de começar. A aposta é que quando você experimentar e ver resultado, vai querer continuar.\n\nDentro do app você tem receitas completas para café, almoço e jantar. Plano de exercícios de 21 dias pra fazer em casa. Guia completo da Dieta da Selva. Tudo organizado, fácil de seguir.\n\nPor R$27. Com 7 dias de garantia. O risco não é você comprar — o risco é você não comprar e continuar do mesmo jeito.`,
    suggestions: ['O que tem no app?','E a garantia?','Quero garantir agora'],
    showCTA: true,
  },
  // OBJEÇÃO 6 — Preciso pensar
  {
    triggers: ['preciso pensar','vou pensar','deixa eu pensar','ainda nao sei','ainda não sei','vou ver','nao sei se','não sei se','talvez','pode ser'],
    text: `Tudo bem. Mas me conta uma coisa: o que exatamente você precisa pensar?\n\nSe for sobre o preço — R$27 com garantia de 7 dias é literalmente risco zero. Você pode pedir o dinheiro de volta sem explicação.\n\nSe for sobre o método — você já tem a resposta de todas as outras tentativas. Elas funcionaram? A única coisa diferente aqui é experimentar algo diferente.\n\nSe for sobre o tempo — o app já existe, o conteúdo está pronto, você acessa agora mesmo.\n\nEntão me ajuda a entender: o que especificamente você precisa pensar? Me fala, e a gente resolve juntas agora.`,
    suggestions: ['Tenho medo de gastar e não usar','E se não funcionar?','Tá, me convenceu'],
    showCTA: false,
  },
  // OBJEÇÃO 7 — Já tenho muitos apps que não uso
  {
    triggers: ['muitos apps','apps que nao uso','apps que não uso','compro e nao uso','compro e não uso','nao vou usar','não vou usar','ja comprei','já comprei','esqueco','esqueço','abandono tudo'],
    text: `Você está sendo honesta comigo e eu respeito isso. Mas me deixa ser honesta com você também.\n\nVocê não usa esses apps porque eles são complicados, chatos ou te fazem sentir culpada toda vez que abre. Correto?\n\nO App Dieta da Selva foi feito pra ser simples. Você abre, vê o que comer hoje, faz o exercício do dia, fecha. Não tem contador de caloria, não tem planilha, não tem nada que te faça sentir inadequada.\n\nMas vou falar uma verdade que vai doer um pouco: o maior desperdício não é os R$27. É mais um ano do jeito que está.\n\nVocê tem 7 dias de garantia. Se abrir o app e não sentir que vale, pede o dinheiro de volta. Mas e se abrir e sentir que finalmente encontrou algo que funciona pra você?`,
    suggestions: ['Como é o app por dentro?','E a garantia de 7 dias?','Quero tentar'],
    showCTA: true,
  },
  // OBJEÇÃO 8 — Família não vai comer assim
  {
    triggers: ['familia nao','família não','familia vai','família vai','filhos nao','filhos não','marido nao','marido não','cozinhar separado','cozinha separada','casa toda','minha familia'],
    text: `Essa é uma das coisas mais legais da Dieta da Selva — ela não é uma dieta esquisita.\n\nCarne, ovo, frango, frutas, arroz, feijão, legumes. Sua família já come isso. A diferença é que você vai cortar os ultra-processados e óleos ruins — e isso serve pra todo mundo.\n\nVocê não precisa cozinhar separado. Você não precisa ficar explicando. Você simplesmente começa a comer melhor — e muitas vezes a família vai junto sem nem perceber.\n\nE mesmo que prefira adaptar só o seu prato, leva 5 minutos. Não tem nada restritivo ou complicado aqui.`,
    suggestions: ['Tem receitas práticas?','Quanto tempo leva?','Quero começar'],
    showCTA: true,
  },
  // OBJEÇÃO 9 — Problema de saúde / hormônio / tireoide
  {
    triggers: ['tireoide','tireoide','hormonio','hormônio','hipotireoidismo','pcos','sop','insulina','problema de saude','problema de saúde','doença','medicamento','remedio','remédio','anticoncepcional'],
    text: `Isso é muito sério e eu não vou minimizar. Problemas hormonais, tireoide, PCOS — eles realmente impactam o metabolismo.\n\nMas deixa eu te perguntar: o que o médico disse sobre alimentação? Na maioria dos casos, a recomendação é exatamente isso — reduzir ultra-processados, açúcar e inflamação. É exatamente o que a Dieta da Selva propõe.\n\nEla não substitui o acompanhamento médico — e a gente deixa isso claro no app. Mas ela funciona junto com o tratamento, não contra ele.\n\nMulheres com hipotireoidismo relatam melhora significativa quando cortam os inflamatórios da dieta. Não é milagre — é o corpo respondendo a comida de verdade.\n\nExperimente por 7 dias. Se não sentir diferença, você pede o dinheiro de volta. Mas e se sentir?`,
    suggestions: ['É seguro para quem tem tireoide?','E a garantia?','Quero tentar os 7 dias'],
    showCTA: true,
  },
  // OBJEÇÃO 10 — É seguro? Posso confiar?
  {
    triggers: ['seguro','confiar','confiavel','confiável','golpe','fraude','fake','enganar','mentira','verdadeiro','legitimo','legítimo','serio','sério'],
    text: `Faz bem em perguntar.\n\nA Dieta da Selva não é uma dieta radical de eliminar tudo. É uma volta à comida de verdade — carne, ovos, frutas, legumes. O tipo de coisa que sua avó comia.\n\nNão tem suplemento obrigatório. Não tem produto pra comprar. Não tem restrição extrema. É simplesmente cortar o industrializado e voltar ao natural.\n\nA compra? Pagamento seguro via PIX, garantia de 7 dias, acesso imediato após confirmar. Qualquer problema, a gente resolve.\n\nA pergunta real é: você está mais segura continuando do jeito que está do que tentando algo diferente por R$27?`,
    suggestions: ['Como funciona o pagamento?','E a garantia de 7 dias?','Quero garantir agora'],
    showCTA: true,
  },
  // Acesso / como funciona
  {
    triggers: ['como acesso','onde acesso','como uso','baixar','instalar','link','apos pagar','depois de pagar','acessar','entrar no app'],
    text: `Super simples! 📱\n\nAssim que o PIX for confirmado — em menos de 30 segundos — você recebe um link direto no celular pra acessar o app.\n\nNão precisa instalar nada. Funciona no navegador do seu celular igual ao Instagram. Você adiciona ao atalho da tela inicial e vira um app de verdade.\n\nTodo o conteúdo fica lá: receitas, plano alimentar, treinos, desafio dos 21 dias, a IA Selva pra tirar suas dúvidas.`,
    suggestions: ['Como é feito o pagamento?','E a garantia?','Quero garantir agora'],
    showCTA: true,
  },
  // Pagamento / PIX — passo a passo completo
  {
    triggers: ['pagar','pagamento','pix','cartao','cartão','boleto','parcelar','parcelamento','como pago','forma de pagamento','passo a passo','como funciona o pix','nao sei pagar','não sei pagar','nunca usei pix','como usar pix','qr code','copia e cola','copiar codigo','código pix'],
    text: `O pagamento é 100% via PIX — seguro, rápido e sem complicação. 🔒\n\n📱 PASSO A PASSO — QR CODE:\n1. Clica no botão abaixo\n2. Preenche nome, e-mail e CPF\n3. O QR Code aparece na tela\n4. Abre o app do seu banco\n5. Vai em "PIX" → "Pagar com QR Code"\n6. Aponta a câmera para o código\n7. Confirma o valor de R$ 27\n8. Acesso liberado em menos de 30 segundos!\n\n📋 PREFERE COPIA E COLA?\nClica em "Copiar código PIX", abre o app do banco → PIX → Pix Copia e Cola, e cola o código. Só confirmar!\n\n🔒 SEUS DADOS 100% PROTEGIDOS:\n✅ Nenhum dado de cartão cadastrado\n✅ Você aprova tudo dentro do app do seu banco\n✅ Transação criptografada e segura\n✅ Processado pelo sistema bancário oficial\n\n🌿 GARANTIA INCONDICIONAL DE 7 DIAS:\nSe em 7 dias você não sentir nenhuma diferença — no inchaço, na energia, na saciedade — devolvemos 100% do seu dinheiro. Sem perguntas. Sem burocracia. Risco zero.`,
    suggestions: ['Como acesso após pagar?','E a garantia de 7 dias?','Quero garantir agora'],
    showCTA: true,
  },
  // Garantia
  {
    triggers: ['garantia','devolver','devolucao','devolução','dinheiro de volta','reembolso','7 dias','risco'],
    text: `Garantia incondicional de 7 dias. ✅\n\nSe em 7 dias você não sentir nenhuma diferença — no inchaço, na energia, na saciedade — basta mandar uma mensagem e devolvemos 100% do seu dinheiro. Sem perguntas. Sem burocracia.\n\nO risco é zero do seu lado. A única coisa que você pode perder é mais tempo no mesmo ciclo.`,
    suggestions: ['Quero começar hoje','Como acesso o app?','Tá, me convenci'],
    showCTA: true,
  },
  // Quero comprar / fechar
  {
    triggers: ['quero','comprar','garantir','comecar','começar','hoje','agora','me convenci','ta bom','tá bom','vamos','bora','sim','fechou'],
    text: `Que ótimo! Fico feliz que você tomou essa decisão por você. 🌿\n\nClica no botão abaixo, garante o seu acesso por R$27 e começa hoje. Se em 7 dias não sentir que valeu, a gente devolve tudo.\n\nVocê não tem nada a perder — só o peso que está carregando.`,
    suggestions: [],
    showCTA: true,
  },
];

const ABERTURA_INICIAL = `Você chegou até aqui. Isso não foi por acaso — tem algo que você quer mudar.\n\nSou a SELVA, consultora especialista em transformação corporal feminina. Estou aqui pra tirar qualquer dúvida antes de você garantir seu acesso.\n\nMe conta: qual é a coisa que mais te incomoda hoje quando você pensa no seu corpo?`;

function getSelvaResponse(text, name) {
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const entry of CHAT_KB) {
    if (entry.triggers.some(tr => t.includes(tr.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
      return { text: entry.text, suggestions: entry.suggestions, showCTA: entry.showCTA ?? false };
    }
  }
  // Resposta padrão empática — segue o fluxo da IA Closer
  return {
    text: `Entendo o que você está sentindo${name ? `, ${name}` : ''}.\n\nMe conta mais — o que especificamente ainda te impede de dar esse passo? Pode ser sobre o método, o preço, o tempo ou qualquer outra coisa. A gente resolve juntas agora.`,
    suggestions: ['Já tentei tanta coisa','Medo de passar fome','Não tenho tempo','R$27 parece barato demais'],
    showCTA: false,
  };
}

function SelvaChat({ name }) {
  const firstName = name?.split(' ')[0] ?? '';
  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState([]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const endRef   = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 350); }
  }, [open]);
  useEffect(() => {
    if (!open || msgs.length > 0) return;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs([{ from:'bot', text: ABERTURA_INICIAL, suggestions:['Já tentei tanta coisa','Vou passar fome?','E a garantia?','Como acesso?','Por que R$ 27?'], showCTA: false }]);
    }, 1100);
  }, [open]);

  function sendMsg(text) {
    if (!text.trim()) return;
    setMsgs(prev => [...prev, { from:'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(prev => [...prev, { from:'bot', ...getSelvaResponse(text, firstName) }]);
    }, 700 + Math.random() * 900);
  }

  return (
    <>
      {!open && (
        <button className="s-fab" onClick={() => setOpen(true)} aria-label="Chat com Selva IA">
          <span className="s-fab-icon">🌿</span>
          <span className="s-fab-label">Tirar dúvidas</span>
        </button>
      )}
      {open && (
        <div className="s-chat">
          <div className="s-hd">
            <div className="s-av">🌿</div>
            <div className="s-meta">
              <span className="s-nm">Selva IA</span>
              <span className="s-st"><span className="s-st-dot" />online agora</span>
            </div>
            <button className="s-close" onClick={() => setOpen(false)} aria-label="Fechar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#9CA88E" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="s-body">
            {msgs.map((m, i) => (
              <div key={i} className="s-group">
                <div className={`s-msg s-${m.from}`}>
                  {m.text.split('\n').map((line, li, arr) => <span key={li}>{line}{li < arr.length - 1 && <br/>}</span>)}
                </div>
                {m.from === 'bot' && m.showCTA && (
                  <button className="s-cta" onClick={() => { setOpen(false); setTimeout(() => document.querySelector('.price-card')?.scrollIntoView({ behavior:'smooth', block:'center' }), 150); }}>
                    🔒 Garantir acesso por R$27 agora
                  </button>
                )}
                {m.suggestions?.length > 0 && (
                  <div className="s-chips">
                    {m.suggestions.map((s, j) => <button key={j} className="s-chip" onClick={() => sendMsg(s)}>{s}</button>)}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="s-msg s-bot s-typing">
                <span className="s-dot"/><span className="s-dot"/><span className="s-dot"/>
              </div>
            )}
            <div ref={endRef}/>
          </div>
          <div className="s-ft">
            <input ref={inputRef} className="s-inp" placeholder="Escreva sua dúvida..." value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMsg(input))}
              maxLength={200}
            />
            <button className="s-send" onClick={() => sendMsg(input)} disabled={!input.trim()} aria-label="Enviar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════
   1. GENDER SCREEN
   ══════════════════════ */
function GenderScreen({ onAnswer }) {
  return (
    <div className="gen-wrap">
      <div style={{textAlign:"center",marginBottom:"28px"}}>
        <div className="landing-source" style={{display:"inline-flex",marginBottom:"16px"}}>
          <span className="landing-source-dot"/>
          <span>Análise gratuita · <strong>Dieta da Selva</strong></span>
        </div>
        <h1 className="hero-title" style={{fontSize:"22px",marginBottom:"8px"}}>
          Você está muito perto de descobrir qual o melhor protocolo para o seu metabolismo
        </h1>
        <p style={{fontSize:"14px",color:"#9CA88E"}}>Para personalizar sua análise, nos diga:</p>
      </div>
      <div className="gen-cards">
        <button className="gen-card" onClick={() => onAnswer('mulher')}>
          <img src="/gen-mulher.webp" alt="Mulher" className="gen-card-img" onError={e => { e.target.style.display='none'; }} />
          <span className="gen-card-label">Mulher</span>
        </button>
        <button className="gen-card" onClick={() => onAnswer('homem')}>
          <img src="/gen-homem.webp" alt="Homem" className="gen-card-img" onError={e => { e.target.style.display='none'; }} />
          <span className="gen-card-label">Homem</span>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════
   2. AGE SCREEN
   ══════════════════════ */
function AgeScreen({ progress, onAnswer }) {
  const ranges = [
    { label:"18–29", img:"/age-18.webp" },
    { label:"30–39", img:"/age-30.webp" },
    { label:"40–49", img:"/age-40.webp" },
    { label:"50+",   img:"/age-50.webp" },
  ];
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <div style={{textAlign:"center",margin:"24px 0 20px"}}>
        <h2 className="question">Qual é a sua faixa etária?</h2>
        <p className="question-sub">Isso ajusta o protocolo para o seu metabolismo atual</p>
      </div>
      <div className="age-grid">
        {ranges.map(r => (
          <button key={r.label} className="age-card" onClick={() => onAnswer(r.label)}>
            <img src={r.img} alt={r.label} className="age-card-img" onError={e => { e.target.style.display='none'; }} />
            <span className="age-card-label">{r.label} anos</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════
   3. SOCIAL PROOF SCREEN
   ══════════════════════ */
function SocialProofScreen({ progress, onNext }) {
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <div style={{textAlign:"center",padding:"32px 16px 0"}}>
        <div style={{fontSize:"48px",marginBottom:"16px"}}>🌿</div>
        <h2 className="screen-title" style={{fontSize:"28px",marginBottom:"12px"}}>
          Mais de <span style={{color:"#E8A838"}}>12.400 mulheres</span> já usaram este protocolo para queimar gordura de forma natural
        </h2>
        <p style={{fontSize:"14px",color:"#9CA88E",marginBottom:"24px",lineHeight:"1.6"}}>
          Sem academia obrigatória. Sem passar fome. Sem contar caloria.
        </p>
        <img src="/comunidade.webp" alt="Comunidade Dieta da Selva" className="comunidade-img" onError={e => { e.target.style.display='none'; }} />
        <div className="sp-depo-row">
          {["-35kg ✓","-17kg ✓","-14kg ✓","-13,7kg ✓"].map((r,i) => (
            <div key={i} className="sp-depo-badge">{r}</div>
          ))}
        </div>
        <button className="cta" style={{width:"100%",marginTop:"24px"}} onClick={onNext}>
          Sim, quero descobrir meu protocolo →
        </button>
        <p className="micro" style={{marginTop:"10px"}}>Você está prestes a conhecer seu perfil metabólico</p>
      </div>
    </div>
  );
}

/* ══════════════════════
   4. OBJECTIVE SCREEN
   ══════════════════════ */
function ObjectiveScreen({ progress, onAnswer }) {
  const opts = [
    { value:"emagrecer",  emoji:"🔥", text:"Emagrecer de vez, sem efeito sanfona" },
    { value:"desinchar",  emoji:"✨", text:"Desinchar e me sentir mais leve" },
    { value:"energia",    emoji:"⚡", text:"Ter mais energia e disposição" },
    { value:"todas",      emoji:"🌿", text:"Tudo isso ao mesmo tempo" },
  ];
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <div style={{textAlign:"center",margin:"24px 0 20px"}}>
        <h2 className="question">Qual é o seu principal objetivo hoje?</h2>
        <p className="question-sub">Sua resposta define o foco do protocolo</p>
      </div>
      <div className="opt-card-list">
        {opts.map(o => (
          <button key={o.value} className="opt-card-icon" onClick={() => onAnswer(o.value)}>
            <div className="opt-card-icon-emoji">{o.emoji}</div>
            <span className="opt-card-icon-title">{o.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════
   5. AUTHORITY SCREEN
   ══════════════════════ */
function AuthorityScreen({ progress, onNext }) {
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>

      {/* Barra de portal de notícias */}
      <div className="news-portal-bar">
        <span className="news-portal-logo">UOL <span style={{color:"#E8A838"}}>VivaBem</span></span>
        <span className="news-portal-section">SAÚDE &amp; BEM-ESTAR</span>
        <span className="news-portal-date">26 nov. 2025</span>
      </div>

      {/* Manchete */}
      <div className="news-article-wrap">
        <div className="news-tag-row">
          <span className="news-tag-cat">EMAGRECIMENTO</span>
          <span className="news-tag-verified">✓ Verificado</span>
        </div>
        <h1 className="news-headline">
          Fogaça diz ter eliminado <span style={{color:"#E8A838"}}>17 kg</span> com a 'Dieta da Selva': como funciona e por que especialistas aprovam?
        </h1>
        <p className="news-byline">Por Redação UOL VivaBem · 26/11/2025 às 14h32</p>

        {/* Foto principal */}
        <img src="/fogaca.webp" alt="Henrique Fogaça" className="news-main-img" />
        <p className="news-img-caption">Henrique Fogaça revelou a dieta que usou para perder 17 kg em 3 meses — Crédito: Divulgação</p>

        {/* Lead */}
        <p className="news-lead">
          O chef e apresentador Henrique Fogaça surpreendeu seguidores ao revelar que eliminou <strong>17 quilos em menos de 3 meses</strong> seguindo o que ele chama de "dieta da selva" — um protocolo baseado em carnes, ovos, queijos e gorduras boas, com eliminação quase total de carboidratos processados.
        </p>

        {/* Citação destacada */}
        <blockquote className="news-quote">
          "Parei o carboidrato do dia para a noite. Comecei a comer mais carne, gordura boa, ovos. Em três semanas já havia perdido 6 kg. A fome ansiosa simplesmente desapareceu."
          <cite>— Henrique Fogaça</cite>
        </blockquote>

        {/* Corpo */}
        <p className="news-body">
          Segundo o chef, a mudança mais surpreendente não foi a balança — foi a energia. <strong>"Acordei disposto pela primeira vez em anos"</strong>, contou ele em entrevista. Nutricionistas ouvidos pela reportagem confirmam que a dieta ancestral, rica em proteína animal, ativa o hormônio GLP-1 — o mesmo mecanismo dos novos medicamentos de emagrecimento, mas de forma natural.
        </p>

        {/* Stats */}
        <div className="news-stats-row">
          <div className="news-stat"><span className="news-stat-num">17kg</span><span className="news-stat-lbl">em 3 meses</span></div>
          <div className="news-stat-div"/>
          <div className="news-stat"><span className="news-stat-num">+12 mil</span><span className="news-stat-lbl">mulheres no método</span></div>
          <div className="news-stat-div"/>
          <div className="news-stat"><span className="news-stat-num">7 dias</span><span className="news-stat-lbl">primeiros resultados</span></div>
        </div>
      </div>

      <button className="cta" style={{width:"100%",marginTop:"20px"}} onClick={onNext}>
        Quero saber se funciona para mim →
      </button>
      <p className="micro" style={{marginTop:"8px"}}>Análise personalizada gratuita em 2 minutos</p>
    </div>
  );
}

/* ══════════════════════
   6. DIFFICULTY SCREEN
   ══════════════════════ */
function DifficultyScreen({ progress, onAnswer }) {
  const opts = [
    { value:"parou",  emoji:"😫", text:"Muito difícil — sinto que meu metabolismo parou" },
    { value:"sanfona",emoji:"🔄", text:"Consigo perder, mas ganho tudo de volta" },
    { value:"inicio", emoji:"🚀", text:"Estou começando e quero o caminho certo" },
  ];
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <div style={{textAlign:"center",margin:"24px 0 20px"}}>
        <h2 className="question">O quão difícil é para você perder peso hoje?</h2>
        <p className="question-sub">Seja honesta — sem julgamento aqui</p>
      </div>
      <div className="opt-chips">
        {opts.map(o => (
          <button key={o.value} className="opt-chip" onClick={() => onAnswer(o.value)}>
            <span className="opt-chip-emoji">{o.emoji}</span>
            <span>{o.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════
   7. MECHANISM SCREEN
   ══════════════════════ */
function MechanismScreen({ progress, onNext }) {
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <div style={{padding:"24px 0 0",maxWidth:"480px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"16px"}}>
          <h2 className="question" style={{fontSize:"21px",marginBottom:"12px"}}>
            Você sente que come pouco e mesmo assim não emagrece?
          </h2>
        </div>
        <img src="/inflamacao.webp" alt="Inflamação celular" style={{width:"100%",borderRadius:"14px",marginBottom:"14px",display:"block"}} />
        <div className="mech-card">
          <div className="mech-card-badge">⚠️ Por que isso acontece</div>
          <p className="mech-card-body">
            Isso não é falta de força de vontade. É um <strong>bloqueio inflamatório nas células</strong>, causado pelo excesso de carboidratos processados na dieta moderna.
          </p>
          <p className="mech-card-body" style={{marginTop:"10px"}}>
            Quando as células estão inflamadas, o corpo <strong>resiste à queima de gordura</strong> — não importa quanto você se esforce ou restrinja. O metabolismo trava.
          </p>
        </div>
        <div className="mech-compare">
          <div className="mech-compare-col mech-bad">
            <div className="mech-compare-head">❌ Célula inflamada</div>
            <p>Retém gordura</p>
            <p>Aumenta o inchaço</p>
            <p>Bloqueia a energia</p>
          </div>
          <div className="mech-compare-col mech-good">
            <div className="mech-compare-head">✅ Célula limpa</div>
            <p>Queima gordura</p>
            <p>Reduz o inchaço</p>
            <p>Energia real</p>
          </div>
        </div>
        <div className="mech-solucao">
          <p style={{fontSize:"14px",color:"#A8D08D",fontWeight:"700",marginBottom:"6px"}}>🥩 A solução: Protocolo Carnívoro Ancestral</p>
          <p style={{fontSize:"13px",color:"#9CA88E",lineHeight:"1.6"}}>
            A Dieta da Selva remove diretamente a causa do bloqueio — tratando a inflamação celular com proteína animal, gordura boa e zero carboidrato processado.
          </p>
        </div>
        <button className="cta" style={{width:"100%",marginTop:"20px"}} onClick={onNext}>
          Entendi — continuar →
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════
   8. AWARENESS SCREEN
   ══════════════════════ */
function AwarenessScreen({ progress, onAnswer }) {
  const opts = [
    { value:"sim-quero",    emoji:"💚", text:"Sim, e quero começar agora" },
    { value:"ouvi-duvidas", emoji:"🤔", text:"Já ouvi falar, mas tenho dúvidas" },
    { value:"nunca",        emoji:"👀", text:"Nunca ouvi falar, mas estou curiosa" },
  ];
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <div style={{textAlign:"center",margin:"24px 0 20px"}}>
        <h2 className="question">Você já conhecia a Dieta da Selva?</h2>
        <p className="question-sub">O protocolo carnívoro que reseta o metabolismo feminino</p>
      </div>
      <div className="opt-chips">
        {opts.map(o => (
          <button key={o.value} className="opt-chip" onClick={() => onAnswer(o.value)}>
            <span className="opt-chip-emoji">{o.emoji}</span>
            <span>{o.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════
   9. HABITS SCREEN
   ══════════════════════ */
function HabitsScreen({ progress, onAnswer }) {
  const opts = [
    { value:"1-2",       emoji:"🍳", text:"1 a 2 refeições por dia" },
    { value:"3",         emoji:"🥩", text:"3 refeições (café, almoço, jantar)" },
    { value:"4-5",       emoji:"🍽️", text:"4 a 5 refeições ou lanches frequentes" },
    { value:"irregular", emoji:"😅", text:"Irregular — como quando lembro" },
  ];
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <div style={{textAlign:"center",margin:"24px 0 20px"}}>
        <h2 className="question">Quantas refeições você faz por dia?</h2>
        <p className="question-sub">Isso ajusta a distribuição do seu protocolo</p>
      </div>
      <div className="opt-card-list">
        {opts.map(o => (
          <button key={o.value} className="opt-card-icon" onClick={() => onAnswer(o.value)}>
            <div className="opt-card-icon-emoji">{o.emoji}</div>
            <span className="opt-card-icon-title">{o.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════
   10. SYMPTOMS SCREEN (new, replaces QuizScreen in flow)
   ══════════════════════ */
function SymptomsScreen({ progress, onAnswer }) {
  const q = QUIZ_QUESTIONS.find(q => q.id === 'symptoms');
  const [sel, setSel] = useState(null);
  const handleClick = (val) => {
    if (sel) return;
    setSel(val);
    setTimeout(() => onAnswer(val), 500);
  };
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <div style={{textAlign:"center",margin:"24px 0 20px"}}>
        <h2 className="question">{q.question.replace(/\{\{name\}\}/g,'')}</h2>
        <p className="question-sub">{q.subtitle}</p>
      </div>
      <div className="opt-grid-icons">
        {q.options.map(o => {
          const IconComp = Q_ICONS[`symptoms:${o.value}`];
          return (
            <button key={o.value}
              className={`opt-grid-icon-card${sel===o.value?' opt-sel':''}`}
              onClick={() => handleClick(o.value)}
              disabled={sel !== null}>
              <div className="opt-grid-icon-svg">
                {IconComp ? <IconComp /> : <span style={{fontSize:'32px'}}>{o.emoji}</span>}
              </div>
              <span className="opt-grid-icon-label">{o.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   11. LIFESTYLE — 3 pares (pergunta + edu)
   ══════════════════════════════════════════ */

/* ── SONO ── */
function SleepQuestion({ progress, onAnswer }) {
  const opts = [
    { value:"bem",       emoji:"😴", text:"Durmo bem, 7h ou mais" },
    { value:"irregular", emoji:"😶", text:"Irregular, às vezes pouco" },
    { value:"mal",       emoji:"😩", text:"Durmo mal ou menos de 6h" },
  ];
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <div style={{textAlign:"center",margin:"24px 0 20px"}}>
        <h2 className="question">Como está o seu sono?</h2>
        <p className="question-sub">O sono influencia diretamente o seu metabolismo</p>
      </div>
      <div className="opt-chips">
        {opts.map(o => (
          <button key={o.value} className="opt-chip" onClick={() => onAnswer(o.value)}>
            <span className="opt-chip-emoji">{o.emoji}</span>
            <span>{o.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
function SleepEdu({ progress, onNext }) {
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <img src="/dormindo.webp" alt="Sono e metabolismo" className="lifestyle-hero-img" />
      <div style={{padding:"20px 0 0",maxWidth:"480px",margin:"0 auto"}}>
        <div className="lifestyle-edu-badge">😴 Sono &amp; Metabolismo</div>
        <h2 className="question" style={{fontSize:"20px",marginBottom:"12px"}}>
          O sono ruim é um dos maiores sabotadores do emagrecimento
        </h2>
        <div className="lifestyle-edu-card">
          <p className="lifestyle-edu-body">
            Dormir menos de 7h eleva o <strong>cortisol</strong> — o hormônio do estresse que sinaliza ao corpo para <strong>armazenar gordura</strong>, especialmente na barriga.
          </p>
          <p className="lifestyle-edu-body" style={{marginTop:"10px"}}>
            A boa notícia: a Dieta da Selva regula o cortisol naturalmente. A proteína animal e a gordura boa <strong>estabilizam o açúcar no sangue</strong>, o que melhora a qualidade do sono ainda na primeira semana.
          </p>
        </div>
        <button className="cta" style={{width:"100%",marginTop:"20px"}} onClick={onNext}>
          Entendi — continuar →
        </button>
      </div>
    </div>
  );
}

/* ── HIDRATAÇÃO ── */
function WaterQuestion({ progress, onAnswer }) {
  const opts = [
    { value:"bastante", emoji:"💧", text:"Mais de 1,5L por dia" },
    { value:"pouco",    emoji:"🥤", text:"Pouco, preciso me lembrar" },
    { value:"quase",    emoji:"😬", text:"Quase não bebo água pura" },
  ];
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <div style={{textAlign:"center",margin:"24px 0 20px"}}>
        <h2 className="question">Quantos litros de água você bebe por dia?</h2>
        <p className="question-sub">A hidratação afeta inchaço, energia e queima de gordura</p>
      </div>
      <div className="opt-chips">
        {opts.map(o => (
          <button key={o.value} className="opt-chip" onClick={() => onAnswer(o.value)}>
            <span className="opt-chip-emoji">{o.emoji}</span>
            <span>{o.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
function WaterEdu({ progress, onNext }) {
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <img src="/agua.webp" alt="Hidratação" className="lifestyle-hero-img" />
      <div style={{padding:"20px 0 0",maxWidth:"480px",margin:"0 auto"}}>
        <div className="lifestyle-edu-badge">💧 Hidratação &amp; Inchaço</div>
        <h2 className="question" style={{fontSize:"20px",marginBottom:"12px"}}>
          Beber pouca água é uma das causas do inchaço crônico
        </h2>
        <div className="lifestyle-edu-card">
          <p className="lifestyle-edu-body">
            Quando o corpo recebe pouca água, ele <strong>retém líquido como mecanismo de defesa</strong> — gerando inchaço, peso extra na balança e aquela sensação de barriga estufada.
          </p>
          <p className="lifestyle-edu-body" style={{marginTop:"10px"}}>
            No protocolo Dieta da Selva, a hidratação adequada acelera a eliminação das toxinas liberadas pela quebra de gordura. Você vai notar a diferença no inchaço <strong>já nos primeiros dias</strong>.
          </p>
        </div>
        <button className="cta" style={{width:"100%",marginTop:"20px"}} onClick={onNext}>
          Entendi — continuar →
        </button>
      </div>
    </div>
  );
}

/* ── EXERCÍCIO ── */
function ExerciseQuestion({ progress, onAnswer }) {
  const opts = [
    { value:"regularmente", emoji:"🏋️", text:"Me exercito regularmente" },
    { value:"as-vezes",     emoji:"🚶", text:"Às vezes, sem constância" },
    { value:"nao",          emoji:"🛋️", text:"Não faço exercício hoje" },
  ];
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <div style={{textAlign:"center",margin:"24px 0 20px"}}>
        <h2 className="question">Você pratica alguma atividade física?</h2>
        <p className="question-sub">O protocolo funciona com ou sem exercício</p>
      </div>
      <div className="opt-chips">
        {opts.map(o => (
          <button key={o.value} className="opt-chip" onClick={() => onAnswer(o.value)}>
            <span className="opt-chip-emoji">{o.emoji}</span>
            <span>{o.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
function ExerciseEdu({ progress, onNext }) {
  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim"><div className="progress-slim-fill" style={{width:`${progress}%`}} /></div>
      <img src="/exercicio.webp" alt="Exercício" className="lifestyle-hero-img" />
      <div style={{padding:"20px 0 0",maxWidth:"480px",margin:"0 auto"}}>
        <div className="lifestyle-edu-badge">🏋️ Exercício &amp; Protocolo</div>
        <h2 className="question" style={{fontSize:"20px",marginBottom:"12px"}}>
          Academia não é obrigatória — mas o movimento acelera tudo
        </h2>
        <div className="lifestyle-edu-card">
          <p className="lifestyle-edu-body">
            A <strong>alimentação responde por 80% dos resultados</strong> de emagrecimento. O protocolo Dieta da Selva foi desenhado para funcionar mesmo sem academia.
          </p>
          <p className="lifestyle-edu-body" style={{marginTop:"10px"}}>
            Se você já se exercita, vai potencializar os resultados. Se não, o app inclui <strong>treinos de 15 minutos em casa</strong> — pensados especificamente para mulheres que querem começar do zero.
          </p>
        </div>
        <button className="cta" style={{width:"100%",marginTop:"20px"}} onClick={onNext}>
          Entendi — continuar →
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════
   12. DATA SCREEN (replaces NameScreen + BodyDataScreen)
   ══════════════════════ */
function DataScreen({ nameInput, onNameChange, bodyData, onBodyChange, onSubmit }) {
  const set = (k,v) => onBodyChange({...bodyData,[k]:v});
  const valid = nameInput.trim().length >= 2 && bodyData.weight && bodyData.height && bodyData.goal;
  return (
    <div style={{paddingTop:"0",maxWidth:"460px",margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:"24px",paddingTop:"16px"}}>
        <div style={{fontSize:"32px",marginBottom:"10px"}}>📊</div>
        <h2 className="screen-title">Quase lá! Dados finais para o seu diagnóstico</h2>
        <p className="screen-sub">Essas informações geram seu laudo personalizado</p>
      </div>
      <div className="input-group">
        <label className="label">Seu primeiro nome</label>
        <input type="text" placeholder="Ex: Maria" value={nameInput} onChange={e => onNameChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && valid && onSubmit()} className="field" autoFocus />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
        <div className="input-group" style={{margin:0}}>
          <label className="label">Peso atual (kg)</label>
          <input type="number" inputMode="decimal" placeholder="Ex: 78" value={bodyData.weight}
            onChange={e => set("weight",e.target.value)} className="field" />
        </div>
        <div className="input-group" style={{margin:0}}>
          <label className="label">Altura (cm)</label>
          <input type="number" inputMode="decimal" placeholder="Ex: 165" value={bodyData.height}
            onChange={e => set("height",e.target.value)} className="field" />
        </div>
      </div>
      <div className="input-group" style={{marginTop:"12px"}}>
        <label className="label">Peso desejado (kg)</label>
        <input type="number" inputMode="decimal" placeholder="Ex: 65" value={bodyData.goal}
          onChange={e => set("goal",e.target.value)} className="field" />
      </div>
      <button className="cta" onClick={onSubmit} style={{width:"100%",marginTop:"20px"}} disabled={!valid}>
        Gerar meu diagnóstico →
      </button>
      <p className="micro" style={{marginTop:"10px"}}>🔒 Seus dados são confidenciais e não serão compartilhados</p>
    </div>
  );
}

/* ══════════════════════
   3. QUIZ SCREEN
   ══════════════════════ */
const OPEN_LOOP_HINTS = [
  "Seu perfil está tomando forma.",                              // Q1 goal
  "Sua fase metabólica foi identificada.",                       // Q2 age
  "Suas respostas já mostram um padrão importante.",             // Q3 frustration
  "Encontramos a raiz do seu comportamento alimentar.",          // Q4 meals
  "Seus sintomas revelam muito sobre o seu metabolismo.",        // Q5 symptoms
  "Entendemos por que as tentativas anteriores não duraram.",    // Q6 tentativas
  "Sabemos o que vai funcionar para você.",                      // Q7 motivacao
  "Seu perfil está quase completo.",                             // Q8 commitment
  "Estamos identificando o que mais trava seus resultados.",     // Q9 ready
];

/* ══════════════════════════════════════════════════════════
   QUIZ VISUAL SYSTEM — SVG ILLUSTRATIONS + LAYOUT ENGINE
   ══════════════════════════════════════════════════════════ */

// Layout type per question id
const Q_LAYOUT = {
  goal:        'grid-card',
  age:         'chip',
  frustration: 'card-icon',
  meals:       'chip',
  symptoms:    'grid-icon',
  tentativas:  'card-icon',
  motivacao:   'grid-card',
  commitment:  'card-icon',
  ready:       'emoji-centered',
};

/* ── Q1 Goal illustrations (72px grid cards) ── */
function IllGoalPeso() {
  return (
    <svg viewBox="0 0 72 72" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="36" cy="36" r="32" fill="rgba(140,179,105,0.1)"/>
      <circle cx="36" cy="22" r="9" fill="#A8D08D"/>
      <path d="M26 32 Q36 42 46 32 L44 54 L28 54Z" fill="#8CB369" opacity="0.55"/>
      <rect x="26" y="54" width="20" height="4" rx="2" fill="#8CB369" opacity="0.5"/>
      <rect x="35" y="50" width="2" height="6" fill="#8CB369" opacity="0.4"/>
      <ellipse cx="36" cy="58" rx="12" ry="3.5" fill="rgba(140,179,105,0.15)" stroke="#8CB369" strokeWidth="1"/>
      <circle cx="53" cy="24" r="8" fill="rgba(232,168,56,0.15)"/>
      <path d="M53 19 L53 27 M50 25 L53 28 L56 25" stroke="#E8A838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IllGoalDesinchar() {
  return (
    <svg viewBox="0 0 72 72" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="36" cy="36" r="32" fill="rgba(212,133,106,0.1)"/>
      <circle cx="36" cy="23" r="9" fill="#D4A574"/>
      <path d="M25 34 Q36 44 47 34 L45 56 L27 56Z" fill="#D4856A" opacity="0.5"/>
      <path d="M25 37 Q18 34 14 30" stroke="#D4856A" strokeWidth="3" strokeLinecap="round"/>
      <path d="M47 37 Q54 34 58 30" stroke="#D4856A" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="13" cy="26" r="3" fill="#E8A838" opacity="0.6"/>
      <circle cx="59" cy="24" r="2" fill="#E8A838" opacity="0.5"/>
      <path d="M57 44 L58 41 L59 44 L62 45 L59 46 L58 49 L57 46 L54 45Z" fill="#E8A838" opacity="0.5"/>
      <path d="M11 43 L12 40 L13 43 L16 44 L13 45 L12 48 L11 45 L8 44Z" fill="#E8A838" opacity="0.4"/>
    </svg>
  );
}
function IllGoalEnergia() {
  return (
    <svg viewBox="0 0 72 72" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="36" cy="36" r="32" fill="rgba(232,168,56,0.1)"/>
      <path d="M41 12 L27 40 L37 40 L31 60 L45 32 L35 32Z" fill="#E8A838"/>
      <line x1="54" y1="18" x2="58" y2="14" stroke="#E8A838" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <line x1="56" y1="28" x2="61" y2="28" stroke="#E8A838" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <line x1="54" y1="38" x2="59" y2="42" stroke="#E8A838" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <line x1="18" y1="18" x2="14" y2="14" stroke="#E8A838" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      <line x1="16" y1="28" x2="11" y2="28" stroke="#E8A838" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
}
function IllGoalTodas() {
  return (
    <svg viewBox="0 0 72 72" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="36" cy="36" r="32" fill="rgba(140,179,105,0.1)"/>
      <circle cx="36" cy="24" r="9" fill="#A8D08D"/>
      <path d="M27 34 Q36 40 45 34 L49 56 L23 56Z" fill="#8CB369" opacity="0.5"/>
      <path d="M27 36 Q20 30 18 22" stroke="#8CB369" strokeWidth="3" strokeLinecap="round"/>
      <path d="M45 36 Q52 30 54 22" stroke="#8CB369" strokeWidth="3" strokeLinecap="round"/>
      <path d="M19 14 L20.2 17.8 L24.2 17.8 L21 20.4 L22.4 24.2 L19 21.6 L15.6 24.2 L17 20.4 L13.8 17.8 L17.8 17.8Z" fill="#E8A838"/>
      <path d="M52 12 L53 15 L56 15 L53.8 17 L54.6 20 L52 18.4 L49.4 20 L50.2 17 L48 15 L51 15Z" fill="#E8A838" opacity="0.8"/>
      <circle cx="36" cy="12" r="2.5" fill="#E8A838" opacity="0.7"/>
    </svg>
  );
}

/* ── Q3 Frustration icons (56px in card-icon layout) ── */
function IllFrustDietas() {
  return (
    <svg viewBox="0 0 56 56" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="28" cy="28" r="24" fill="rgba(212,133,106,0.12)"/>
      <rect x="14" y="14" width="28" height="22" rx="3" fill="rgba(212,133,106,0.2)" stroke="#D4856A" strokeWidth="1.5"/>
      <line x1="28" y1="14" x2="28" y2="36" stroke="#D4856A" strokeWidth="1" opacity="0.5"/>
      <line x1="16" y1="20" x2="27" y2="20" stroke="#D4856A" strokeWidth="1" opacity="0.4"/>
      <line x1="16" y1="24" x2="27" y2="24" stroke="#D4856A" strokeWidth="1" opacity="0.3"/>
      <line x1="29" y1="22" x2="40" y2="22" stroke="#D4856A" strokeWidth="1" opacity="0.3"/>
      <line x1="12" y1="40" x2="44" y2="16" stroke="#E85D4A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="44" y1="40" x2="12" y2="16" stroke="#E85D4A" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
function IllFrustSanfona() {
  return (
    <svg viewBox="0 0 56 56" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="28" cy="28" r="24" fill="rgba(232,168,56,0.1)"/>
      <circle cx="28" cy="28" r="14" stroke="#E8A838" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4"/>
      <path d="M28 14 A14 14 0 0 1 42 28" stroke="#E8A838" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M42 28 A14 14 0 0 1 28 42" stroke="#E8A838" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 42 A14 14 0 0 1 14 28" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
      <path d="M14 28 A14 14 0 0 1 28 14" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
      <path d="M38 12 L42 16 L46 12" stroke="#E8A838" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 30 L14 34 L18 30" stroke="#E8A838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
    </svg>
  );
}
function IllFrustFome() {
  return (
    <svg viewBox="0 0 56 56" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="28" cy="28" r="24" fill="rgba(140,179,105,0.08)"/>
      <path d="M12 28 Q12 44 28 44 Q44 44 44 28Z" fill="rgba(140,179,105,0.1)" stroke="#8CB369" strokeWidth="1.5"/>
      <line x1="10" y1="28" x2="46" y2="28" stroke="#8CB369" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="22" cy="36" r="1.5" fill="#9CA88E"/>
      <circle cx="34" cy="36" r="1.5" fill="#9CA88E"/>
      <path d="M22 40 Q28 37 34 40" stroke="#9CA88E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M22 18 Q24 14 22 10" stroke="#9CA88E" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M28 17 Q30 13 28 9" stroke="#9CA88E" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M34 18 Q36 14 34 10" stroke="#9CA88E" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  );
}
function IllFrustTempo() {
  return (
    <svg viewBox="0 0 56 56" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="28" cy="28" r="24" fill="rgba(92,168,232,0.08)"/>
      <circle cx="28" cy="30" r="16" fill="rgba(92,168,232,0.1)" stroke="#5CA8E8" strokeWidth="1.5"/>
      <circle cx="28" cy="30" r="2" fill="#5CA8E8"/>
      <line x1="28" y1="30" x2="28" y2="18" stroke="#5CA8E8" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="28" y1="30" x2="38" y2="30" stroke="#5CA8E8" strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="14" x2="24" y2="11" stroke="#5CA8E8" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <line x1="34" y1="14" x2="32" y2="11" stroke="#5CA8E8" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <line x1="46" y1="22" x2="50" y2="20" stroke="#5CA8E8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <line x1="47" y1="30" x2="52" y2="30" stroke="#5CA8E8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

/* ── Q5 Symptoms icons (52px grid-icon layout) ── */
function IllSymInchaco() {
  return (
    <svg viewBox="0 0 52 52" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="26" cy="26" r="22" fill="rgba(212,133,106,0.12)"/>
      <ellipse cx="26" cy="30" rx="15" ry="12" fill="rgba(212,133,106,0.2)" stroke="#D4856A" strokeWidth="1.5"/>
      <path d="M14 24 Q18 22 22 24 Q26 26 30 24 Q34 22 38 24" stroke="#D4856A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M11 30 L7 30 M9 28 L7 30 L9 32" stroke="#D4856A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M41 30 L45 30 M43 28 L45 30 L43 32" stroke="#D4856A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IllSymCansaco() {
  return (
    <svg viewBox="0 0 52 52" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="26" cy="26" r="22" fill="rgba(121,120,200,0.08)"/>
      <path d="M10 26 Q26 16 42 26 Q26 38 10 26Z" fill="rgba(121,120,200,0.1)" stroke="#8080C0" strokeWidth="1.5"/>
      <path d="M10 26 Q26 20 42 26" stroke="#8080C0" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="26" cy="30" r="5" fill="rgba(121,120,200,0.2)"/>
      <circle cx="26" cy="30" r="2.5" fill="#8080C0"/>
      <circle cx="38" cy="14" r="2" fill="#8080C0" opacity="0.35"/>
      <circle cx="43" cy="10" r="1.5" fill="#8080C0" opacity="0.25"/>
      <circle cx="47" cy="6" r="1" fill="#8080C0" opacity="0.15"/>
    </svg>
  );
}
function IllSymAnsiedade() {
  return (
    <svg viewBox="0 0 52 52" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="26" cy="26" r="22" fill="rgba(155,100,200,0.08)"/>
      <circle cx="26" cy="26" r="14" fill="rgba(155,100,200,0.12)" stroke="#9B64C8" strokeWidth="1.5"/>
      <path d="M26 18 Q32 18 32 22 Q32 26 26 26 Q20 26 20 30 Q20 34 26 34" stroke="#9B64C8" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="26" cy="36" r="1.5" fill="#9B64C8"/>
      <circle cx="14" cy="16" r="1.5" fill="#9B64C8" opacity="0.25"/>
      <circle cx="38" cy="14" r="1.5" fill="#9B64C8" opacity="0.2"/>
    </svg>
  );
}
function IllSymInflamacao() {
  return (
    <svg viewBox="0 0 52 52" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="26" cy="26" r="22" fill="rgba(232,120,56,0.08)"/>
      <circle cx="26" cy="28" r="10" fill="rgba(232,120,56,0.2)" stroke="#E87838" strokeWidth="1.5"/>
      <circle cx="26" cy="28" r="5" fill="rgba(232,120,56,0.3)"/>
      <line x1="26" y1="14" x2="26" y2="10" stroke="#E87838" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
      <line x1="36" y1="18" x2="39" y2="15" stroke="#E87838" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <line x1="40" y1="28" x2="44" y2="28" stroke="#E87838" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <line x1="16" y1="18" x2="13" y2="15" stroke="#E87838" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <line x1="12" y1="28" x2="8" y2="28" stroke="#E87838" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <line x1="36" y1="38" x2="39" y2="41" stroke="#E87838" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

/* ── Q7 Motivação illustrations (72px grid cards) ── */
function IllMotivRapido() {
  return (
    <svg viewBox="0 0 72 72" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="36" cy="36" r="32" fill="rgba(232,168,56,0.1)"/>
      <rect x="28" y="50" width="16" height="4" rx="2" fill="#E8A838" opacity="0.5"/>
      <rect x="24" y="46" width="24" height="5" rx="2.5" fill="#E8A838" opacity="0.4"/>
      <path d="M24 22 L24 46 L48 46 L48 22 Q48 14 36 14 Q24 14 24 22Z" fill="rgba(232,168,56,0.2)" stroke="#E8A838" strokeWidth="1.5"/>
      <path d="M24 28 Q16 30 16 36 Q16 42 24 42" stroke="#E8A838" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M48 28 Q56 30 56 36 Q56 42 48 42" stroke="#E8A838" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M36 10 L37.2 13.4 L41 13.4 L38.2 15.8 L39.2 19.4 L36 17.2 L32.8 19.4 L33.8 15.8 L31 13.4 L34.8 13.4Z" fill="#E8A838"/>
    </svg>
  );
}
function IllMotivSimples() {
  return (
    <svg viewBox="0 0 72 72" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="36" cy="36" r="32" fill="rgba(140,179,105,0.1)"/>
      <path d="M16 40 Q16 56 36 56 Q56 56 56 40Z" fill="rgba(140,179,105,0.2)" stroke="#8CB369" strokeWidth="1.5"/>
      <line x1="14" y1="40" x2="58" y2="40" stroke="#8CB369" strokeWidth="2" strokeLinecap="round"/>
      <path d="M36 24 Q44 16 44 24 Q44 32 36 30 Q28 32 28 24 Q28 16 36 24Z" fill="#8CB369" opacity="0.6"/>
      <line x1="36" y1="24" x2="36" y2="32" stroke="#6B9B45" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 50 Q36 54 48 50" stroke="#8CB369" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
function IllMotivSemFome() {
  return (
    <svg viewBox="0 0 72 72" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="36" cy="36" r="32" fill="rgba(212,133,106,0.1)"/>
      <ellipse cx="36" cy="48" rx="22" ry="7" fill="rgba(212,133,106,0.15)" stroke="#D4856A" strokeWidth="1.5"/>
      <ellipse cx="36" cy="40" rx="18" ry="12" fill="rgba(212,133,106,0.2)" stroke="#D4856A" strokeWidth="1.5"/>
      <ellipse cx="28" cy="38" rx="6" ry="4" fill="#D4856A" opacity="0.45"/>
      <ellipse cx="40" cy="36" rx="5" ry="4" fill="#A8D08D" opacity="0.55"/>
      <ellipse cx="36" cy="42" rx="5" ry="3" fill="#E8A838" opacity="0.45"/>
      <path d="M26 24 Q28 20 26 16" stroke="#D4856A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M36 22 Q38 18 36 14" stroke="#D4856A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M46 24 Q48 20 46 16" stroke="#D4856A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <circle cx="57" cy="20" r="8" fill="rgba(232,168,56,0.15)"/>
      <circle cx="54" cy="18" r="1.5" fill="#E8A838"/>
      <circle cx="60" cy="18" r="1.5" fill="#E8A838"/>
      <path d="M54 22 Q57 24 60 22" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
function IllMotivBemestar() {
  return (
    <svg viewBox="0 0 72 72" fill="none" style={{width:'100%',height:'100%'}}>
      <circle cx="36" cy="36" r="32" fill="rgba(184,160,208,0.1)"/>
      <circle cx="36" cy="24" r="9" fill="#C8A8DC" opacity="0.8"/>
      <path d="M26 34 Q36 44 46 34 L44 56 L28 56Z" fill="#B8A0D0" opacity="0.5"/>
      <line x1="36" y1="8" x2="36" y2="12" stroke="#B8A0D0" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="22" y1="12" x2="24" y2="15" stroke="#B8A0D0" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <line x1="50" y1="12" x2="48" y2="15" stroke="#B8A0D0" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <line x1="14" y1="24" x2="18" y2="24" stroke="#B8A0D0" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <line x1="58" y1="24" x2="54" y2="24" stroke="#B8A0D0" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <path d="M36 50 Q30 46 26 46 Q22 46 22 50 Q22 55 36 60 Q50 55 50 50 Q50 46 46 46 Q42 46 36 50Z" fill="#B8A0D0" opacity="0.35"/>
    </svg>
  );
}

// Map question+value → illustration component
const Q_ILLUSTRATIONS = {
  'goal:peso':                  IllGoalPeso,
  'goal:desinchar':             IllGoalDesinchar,
  'goal:energia':               IllGoalEnergia,
  'goal:todas':                 IllGoalTodas,
  'motivacao:resultado-rapido': IllMotivRapido,
  'motivacao:simplicidade':     IllMotivSimples,
  'motivacao:sem-fome':         IllMotivSemFome,
  'motivacao:bemestar':         IllMotivBemestar,
};

// Map question+value → icon component (for card-icon and grid-icon layouts)
const Q_ICONS = {
  'frustration:dietas':    IllFrustDietas,
  'frustration:sanfona':   IllFrustSanfona,
  'frustration:fome':      IllFrustFome,
  'frustration:tempo':     IllFrustTempo,
  'symptoms:inchaço':      IllSymInchaco,
  'symptoms:cansaço':      IllSymCansaco,
  'symptoms:ansiedade':    IllSymAnsiedade,
  'symptoms:inflamação':   IllSymInflamacao,
};

function QuizScreen({ q, progress, cur, total, onAnswer, sel, n }) {
  const hint = OPEN_LOOP_HINTS[cur];
  const layout = Q_LAYOUT[q.id] || 'card-icon';

  const renderOptions = () => {
    switch (layout) {
      case 'grid-card':
        return (
          <div className="opt-grid">
            {q.options.map(o => {
              const IllComp = Q_ILLUSTRATIONS[`${q.id}:${o.value}`];
              return (
                <button key={o.value}
                  className={`opt-grid-card${sel===o.value?' opt-sel':''}`}
                  onClick={() => onAnswer(q.id, o.value)}
                  disabled={sel !== null}>
                  <div className="opt-grid-illus">
                    {IllComp ? <IllComp /> : <span style={{fontSize:'40px'}}>{o.emoji}</span>}
                  </div>
                  <span className="opt-grid-label">{o.text}</span>
                </button>
              );
            })}
          </div>
        );

      case 'chip':
        return (
          <div className="opt-chips">
            {q.options.map(o => (
              <button key={o.value}
                className={`opt-chip${sel===o.value?' opt-sel':''}`}
                onClick={() => onAnswer(q.id, o.value)}
                disabled={sel !== null}>
                <span className="opt-chip-emoji">{o.emoji}</span>
                <span>{o.text}</span>
                {sel===o.value && <span className="opt-check-pill">✓</span>}
              </button>
            ))}
          </div>
        );

      case 'grid-icon':
        return (
          <div className="opt-grid-icons">
            {q.options.map(o => {
              const IconComp = Q_ICONS[`${q.id}:${o.value}`];
              return (
                <button key={o.value}
                  className={`opt-grid-icon-card${sel===o.value?' opt-sel':''}`}
                  onClick={() => onAnswer(q.id, o.value)}
                  disabled={sel !== null}>
                  <div className="opt-grid-icon-svg">
                    {IconComp ? <IconComp /> : <span style={{fontSize:'32px'}}>{o.emoji}</span>}
                  </div>
                  <span className="opt-grid-icon-label">{o.text}</span>
                </button>
              );
            })}
          </div>
        );

      case 'emoji-centered':
        return (
          <div className="opt-emoji-list">
            {q.options.map(o => (
              <button key={o.value}
                className={`opt-emoji-card${sel===o.value?' opt-sel':''}`}
                onClick={() => onAnswer(q.id, o.value)}
                disabled={sel !== null}>
                <span className="opt-emoji-big">{o.emoji}</span>
                <span className="opt-emoji-label">{o.text}</span>
              </button>
            ))}
          </div>
        );

      default: // card-icon
        return (
          <div className="opt-card-list">
            {q.options.map(o => {
              const IconComp = Q_ICONS[`${q.id}:${o.value}`];
              return (
                <button key={o.value}
                  className={`opt-card-icon${sel===o.value?' opt-sel':''}`}
                  onClick={() => onAnswer(q.id, o.value)}
                  disabled={sel !== null}>
                  <div className={IconComp ? 'opt-card-icon-img' : 'opt-card-icon-emoji'}>
                    {IconComp ? <IconComp /> : o.emoji}
                  </div>
                  <span className="opt-card-icon-title">{o.text}</span>
                  <span className="opt-card-icon-check">✓</span>
                </button>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div style={{paddingTop:"0"}}>
      <div className="progress-slim">
        <div className="progress-slim-fill" style={{width:`${progress}%`}} />
      </div>
      <div style={{textAlign:"center",marginBottom:"24px",marginTop:"24px"}}>
        <h2 className="question">{n(q.question)}</h2>
        <p className="question-sub">{n(q.subtitle)}</p>
      </div>
      {renderOptions()}
      {sel && hint && (
        <div className="open-loop-hint">
          <span className="ol-dot"/>
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════
   TESTI SLIDER
   ══════════════════════ */
function TestiSlider() {
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);

  function scrollTo(i) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[i];
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    setActive(i);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardW = el.children[0]?.offsetWidth || 1;
      setActive(Math.round(el.scrollLeft / (cardW + 10)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="tslider-wrap">
      <div className="tslider-track" ref={scrollRef}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="tslider-card">
            {t.img && (
              <img src={t.img} alt={t.name} className="tslider-photo" />
            )}
            <div className="tslider-body">
              <div className="tslider-stars">★★★★★</div>
              <p className="tslider-text">"{t.text.substring(0, 90)}..."</p>
              <div className="tslider-footer">
                <div>
                  <p className="tslider-name">{t.name}, {t.age} anos</p>
                  <p className="tslider-city">{t.city}</p>
                </div>
                <span className="tslider-result">{t.result}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="tslider-dots">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} className={`tslider-dot${active === i ? ' tsd-active' : ''}`} onClick={() => scrollTo(i)} />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════
   8. ANALYZING — 5 versões por perfil
   ══════════════════════ */
const LOADING_PROFILES = {
  decidida: {
    headline: "Calculando o caminho mais rápido para seus resultados...",
    subheadline: "Você está pronta — estamos definindo o protocolo certo",
    bullets: [
      { icon: "🔥", text: "Velocidade de queima pelo seu metabolismo" },
      { icon: "⚡", text: "Energia disponível na primeira semana" },
      { icon: "🎯", text: "Protocolo mais direto para o seu objetivo" },
    ],
  },
  cetica: {
    headline: "Identificando o que falhou nas tentativas anteriores...",
    subheadline: "Suas respostas estão mostrando um padrão claro",
    bullets: [
      { icon: "🔍", text: "Raiz dos métodos que não funcionaram" },
      { icon: "🧬", text: "Compatibilidade com o protocolo ancestral" },
      { icon: "🛡️", text: "O que será diferente desta vez" },
    ],
  },
  medo: {
    headline: "Desenhando um protocolo de transição gentil para você...",
    subheadline: "Sem pressão — sem obrigações impossíveis",
    bullets: [
      { icon: "🌿", text: "Nível de suporte ideal para o seu perfil" },
      { icon: "🥩", text: "Alimentos que eliminam a fome ansiosa" },
      { icon: "💚", text: "Primeiros 7 dias sem nenhum impacto brusco" },
    ],
  },
  ocupada: {
    headline: "Montando o protocolo mais simples para a sua rotina...",
    subheadline: "Menos de 15 minutos por dia — confirmando isso",
    bullets: [
      { icon: "⏱️", text: "Tempo médio de preparo das suas receitas" },
      { icon: "📱", text: "Frequência ideal de uso do app" },
      { icon: "🛒", text: "Lista de compras da semana em 10 itens" },
    ],
  },
  hormonal: {
    headline: "Mapeando seu perfil metabólico hormonal...",
    subheadline: "Cada fase de vida exige uma abordagem diferente",
    bullets: [
      { icon: "🌹", text: "Impacto hormonal no seu metabolismo atual" },
      { icon: "🔋", text: "Protocolo de reativação energética" },
      { icon: "🛡️", text: "Alimentos anti-inflamatórios prioritários" },
    ],
  },
  economica: {
    headline: "Calculando o que faz mais sentido para você...",
    subheadline: "Queremos mostrar exatamente o que você recebe",
    bullets: [
      { icon: "💰", text: "Custo real por dia do protocolo" },
      { icon: "📊", text: "Resultado esperado nas primeiras 3 semanas" },
      { icon: "🛡️", text: "Cobertura total da garantia de 7 dias" },
    ],
  },
};

const ANALYZING_PHOTOS = [
  { src:"/ad-1.webp",   label:"Rose Pungan",  result:"-35kg" },
  { src:"/ad-2.webp",   label:"Márcia Braga", result:"-15kg" },
  { src:"/ad-3.webp",   label:"Alice",        result:"-14kg" },
  { src:"/depo-1.webp", label:"",             result:"-17kg" },
  { src:"/depo-2.webp", label:"",             result:"-13,7kg" },
];

function Analyzing({ progress, name, answers }) {
  const profile = getLeadProfile(answers);
  const lp = LOADING_PROFILES[profile] || LOADING_PROFILES.cetica;
  const thresholds = [30, 60, 85];

  // Cicla foto a cada 2s
  const [photoIdx, setPhotoIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setPhotoIdx(i => (i + 1) % ANALYZING_PHOTOS.length), 2000);
    return () => clearInterval(iv);
  }, []);

  const photo = ANALYZING_PHOTOS[photoIdx];

  return (
    <div style={{paddingTop:"32px",maxWidth:"420px",margin:"0 auto"}}>
      {/* Headline personalizada */}
      <h2 className="analyzing-headline">{lp.headline}</h2>
      <p className="analyzing-sub">{lp.subheadline}</p>

      {/* Foto rotativa antes/depois */}
      <div className="analyzing-photo-wrap">
        <img key={photoIdx} src={photo.src} alt={photo.label || "resultado"} className="analyzing-photo" />
        <div className="analyzing-photo-badge">{photo.result} 🔥</div>
        {photo.label && <div className="analyzing-photo-name">{photo.label}</div>}
      </div>

      {/* Bullets que aparecem progressivamente */}
      <div className="analyzing-bullets">
        {lp.bullets.map((b, i) => {
          const done = progress >= thresholds[i];
          const active = progress >= (i === 0 ? 5 : thresholds[i-1]) && !done;
          return (
            <div key={i} className={`analyzing-bullet${done ? ' ab-done' : active ? ' ab-active' : ' ab-waiting'}`}>
              <span className="ab-icon">
                {done ? '✓' : active ? <span className="ab-spinner"/> : '○'}
              </span>
              <span className="ab-text">{b.icon} {b.text}</span>
            </div>
          );
        })}
      </div>

      {/* Barra de progresso */}
      <div className="analysis-bar-wrap" style={{marginTop:"24px"}}>
        <div className="analysis-bar"><div className="analysis-fill" style={{width:`${progress}%`}} /></div>
        <span className="analysis-pct">{progress}%</span>
      </div>
      <p className="micro" style={{marginTop:"12px",textAlign:"center"}}>
        {progress < 40 ? 'Lendo seu perfil metabólico...' :
         progress < 75 ? 'Cruzando com milhares de perfis similares...' :
         'Finalizando seu laudo personalizado...'}
      </p>
    </div>
  );
}

/* ══════════════════════
   9. DIAGNOSIS ENGINE
   ══════════════════════ */
function buildDiagnosis(answers, bmi, bmiCat, weightToLose, timeWeeks) {
  const { age, symptoms, meals, frustration, commitment, ready, goal, tentativas, motivacao } = answers;

  // ── Perfil Metabólico ──────────────────────────────────────
  let perfil, perfilEmoji, perfilColor, perfilDesc;
  if (age === '25-34') {
    if (symptoms === 'ansiedade') {
      perfil = 'Compulsão e Inflamação Silenciosa'; perfilEmoji = '🧠'; perfilColor = '#E8A838';
      perfilDesc = 'Seu corpo sinaliza estresse metabólico via compulsão alimentar. O cortisol elevado bloqueia a queima de gordura e cria ciclos de fome emocional que sabotam qualquer dieta convencional.';
    } else if (symptoms === 'inchaço') {
      perfil = 'Intolerância a Carboidratos'; perfilEmoji = '💧'; perfilColor = '#8CB369';
      perfilDesc = 'O inchaço constante indica que seu corpo não processa bem carboidratos. A inflamação intestinal retém líquido e disfarça a perda de gordura real nos primeiros dias.';
    } else if (symptoms === 'inflamação') {
      perfil = 'Inflamação Sistêmica Precoce'; perfilEmoji = '🔥'; perfilColor = '#E85D4A';
      perfilDesc = 'As dores articulares nessa faixa etária quase sempre têm origem alimentar — glúten, açúcar e óleos vegetais inflamam as articulações. A dieta ancestral é o antiinflamatório mais potente.';
    } else {
      perfil = 'Resistência Metabólica Inicial'; perfilEmoji = '⚡'; perfilColor = '#E8A838';
      perfilDesc = 'Seu metabolismo está nos primeiros sinais de resistência — ainda responsivo, mas já mostrando que dietas convencionais não funcionam mais. É o momento ideal para agir.';
    }
  } else if (age === '35-44') {
    if (symptoms === 'cansaço') {
      perfil = 'Fadiga Metabólica + Desequilíbrio Hormonal'; perfilEmoji = '🔋'; perfilColor = '#E85D4A';
      perfilDesc = 'Entre 35-44 anos, a queda gradual de estrogênio reduz a eficiência celular. O cansaço que você sente não é preguiça — é bioquímica. Proteína animal e gordura boa restauram essa energia.';
    } else if (symptoms === 'inchaço') {
      perfil = 'Inflamação Crônica de Baixo Grau'; perfilEmoji = '🔥'; perfilColor = '#E85D4A';
      perfilDesc = 'O inchaço nessa faixa quase sempre indica inflamação sistêmica relacionada à alimentação. Eliminar carboidratos inflamatórios produz desinchamento visível em 48-72h.';
    } else if (symptoms === 'ansiedade') {
      perfil = 'Disrupção do Eixo Intestino-Cérebro'; perfilEmoji = '🧠'; perfilColor = '#E8A838';
      perfilDesc = '90% da serotonina é produzida no intestino. A ansiedade alimentar nessa fase indica que a microbiota está desequilibrada — a dieta ancestral reconstrói esse eixo naturalmente.';
    } else {
      perfil = 'Transição Metabólica Hormonal'; perfilEmoji = '🌊'; perfilColor = '#E8A838';
      perfilDesc = 'Seu metabolismo está em transição — os hormônios começam a reduzir e a insulina se torna menos eficiente. A janela para reverter esse processo com dieta é agora.';
    }
  } else if (age === '45-54') {
    if (symptoms === 'inflamação') {
      perfil = 'Inflamação Pós-Hormonal + Resistência à Insulina'; perfilEmoji = '🛡️'; perfilColor = '#E85D4A';
      perfilDesc = 'Com a queda do estrogênio, o corpo migra gordura para a região abdominal e aumenta a inflamação articular. A dieta carnívora é clinicamente reconhecida como reversora desse padrão.';
    } else {
      perfil = 'Metabolismo Pós-Hormonal Adaptativo'; perfilEmoji = '🛡️'; perfilColor = '#E8A838';
      perfilDesc = 'Nessa fase o corpo exige mais proteína e gordura boa para manter massa muscular, densidade óssea e energia. O protocolo ancestral foi feito exatamente para esse metabolismo.';
    }
  } else {
    perfil = 'Metabolismo de Maturidade — Proteína é Prioridade'; perfilEmoji = '💎'; perfilColor = '#A8D08D';
    perfilDesc = 'Acima dos 55, cada grama de proteína animal conta para preservar músculos, ossos e cognição. O protocolo carnívoro entrega a maior densidade nutricional possível por refeição.';
  }

  // ── Padrão Alimentar ──────────────────────────────────────
  const padraoMap = {
    carboidratos: { titulo: 'Dependência de Carboidratos', desc: 'Pão, massa e doce ativam os mesmos receptores de dopamina que substâncias viciantes. Seu cérebro foi treinado a precisar deles — não é falta de força de vontade, é neurologia.' },
    pula:         { titulo: 'Ciclo de Privação e Compensação', desc: 'Pular refeições eleva o cortisol e ativa modo de emergência metabólica. Quando come, o corpo armazena tudo como gordura por "segurança". Esse ciclo sabota qualquer tentativa de emagrecimento.' },
    tenta:        { titulo: 'Inconsistência Alimentar', desc: 'Você sabe o que é saudável mas não consegue manter. Isso acontece porque dietas convencionais são biologicamente incompatíveis com o cérebro — geram fome, irritação e abandono previsível.' },
    descontrole:  { titulo: 'Compulsão por Deficit de Saciedade', desc: 'Comer sem controle quase sempre indica que o corpo não recebe os nutrientes certos. Quando você come proteína animal + gordura boa, o hormônio GLP-1 sinaliza saciedade real — e a compulsão some.' },
  };
  const padrao = padraoMap[meals] || padraoMap.tenta;

  // ── Principal Bloqueador ──────────────────────────────────
  const bloqueadorMap = {
    dietas:  { titulo: 'Histórico de Tentativas Frustradas', desc: 'Cada dieta que falhou não foi sua culpa — foi o método. Dietas que restringem quantidade sem resolver a fome são biologicamente insustentáveis.', solucao: 'O protocolo resolve a raiz: remove a fome. Quando a fome desaparece, a dieta deixa de ser um esforço.' },
    sanfona: { titulo: 'Efeito Sanfona Recorrente', desc: 'O efeito sanfona acontece quando a dieta perde músculo junto com gordura. Sem músculo, o metabolismo cai, e o peso volta com juros.', solucao: 'A proteína animal em abundância preserva cada grama de músculo enquanto o corpo elimina gordura.' },
    fome:    { titulo: 'Hipersensibilidade à Restrição', desc: 'Seu corpo aprendeu que restrição = perigo, e dispara fome compulsiva para se proteger. Esse mecanismo é inconsciente e mais forte que a força de vontade.', solucao: 'Comendo até a saciedade — carne, ovos, gordura — o alarme de fome é desativado na raiz.' },
    tempo:   { titulo: 'Barreira de Rotina e Complexidade', desc: 'Dietas com múltiplos ingredientes e preparo longo são incompatíveis com a vida real. A complexidade é o principal motivo de abandono.', solucao: 'As receitas do protocolo levam 10-20 minutos e usam no máximo 4 ingredientes. Simples por design.' },
  };
  const bloqueador = bloqueadorMap[frustration] || bloqueadorMap.dietas;

  // ── Previsão Semana 1 ─────────────────────────────────────
  const semana1Map = {
    inchaço:    { dia: 'Dias 2-3', evento: 'Desinchamento visível — até 2kg de retenção eliminados' },
    cansaço:    { dia: 'Dia 3-4',  evento: 'Energia notável — o corpo passa a usar gordura como combustível' },
    ansiedade:  { dia: 'Dia 4-5',  evento: 'Fome ansiosa reduz drasticamente — GLP-1 ativado' },
    inflamação: { dia: 'Dia 5-7',  evento: 'Alívio de dores articulares e sensação de leveza' },
  };
  const semana1 = semana1Map[symptoms] || { dia: 'Dias 2-4', evento: 'Primeiros resultados visíveis de desinchamento e energia' };

  // ── Score de Compatibilidade ──────────────────────────────
  let score = 70;
  if (goal === 'todas') score += 9;
  else if (goal === 'peso' || goal === 'desinchar') score += 7;
  if (commitment === 'hoje') score += 9;
  else if (commitment === 'tentaria') score += 5;
  if (ready === 'pronta') score += 7;
  else if (ready === 'comprovado' || ready === 'medo') score += 5;
  if (meals === 'carboidratos') score += 6;
  if (meals === 'descontrole') score += 4;
  if (symptoms === 'inchaço' || symptoms === 'ansiedade') score += 4;
  // Histórico de tentativas → mais tentativas = mais compatível (corpo já reagiu antes)
  if (tentativas === 'muitas' || tentativas === 'ciclo') score += 5;
  else if (tentativas === 'poucas') score += 3;
  // Motivação → sem fome e resultado rápido são ideais para este protocolo
  if (motivacao === 'sem-fome' || motivacao === 'resultado-rapido') score += 4;
  score = Math.min(99, score);

  // ── Urgência por Idade ────────────────────────────────────
  const urgenciaMap = { '55+': ['ALTA','#E85D4A'], '45-54': ['ALTA','#E85D4A'], '35-44': ['MODERADA-ALTA','#E8A838'], '25-34': ['MODERADA','#8CB369'] };
  const [urgencia, urgenciaColor] = urgenciaMap[age] || ['MODERADA','#8CB369'];

  // ── Protocolo recomendado — combina padrão alimentar + motivação ─────
  const protocoloMap = {
    carboidratos: 'Protocolo Detox de Carboidratos — eliminação gradual em 3 fases',
    pula:         'Protocolo de Estruturação de Refeições — 3 refeições fixas com proteína',
    tenta:        'Protocolo de Ancoragem de Hábitos — sistema de check-in diário',
    descontrole:  'Protocolo de Saciedade — GLP-1 e controle natural do apetite',
  };
  const motivacaoProtocolo = {
    'resultado-rapido': 'Protocolo Acelerado — máxima queima nas 3 primeiras semanas',
    'simplicidade':     'Protocolo Express — receitas de até 4 ingredientes, 10 minutos',
    'sem-fome':         'Protocolo de Saciedade — GLP-1 natural ativado desde o Dia 1',
    'bemestar':         'Protocolo Integral — energia, humor e emagrecimento juntos',
  };
  const protocolo = motivacaoProtocolo[motivacao] || protocoloMap[meals] || 'Protocolo Dieta da Selva 21 Dias';

  return { perfil, perfilEmoji, perfilColor, perfilDesc, padrao, bloqueador, semana1, score, urgencia, urgenciaColor, protocolo };
}

function Diagnosis({ name, bmi, bmiCat, weightToLose, timeWeeks, answers, onNext }) {
  const d = buildDiagnosis(answers, bmi, bmiCat, weightToLose, timeWeeks);
  const note = getDiagnosisNote(answers);

  return (
    <div className="diag-wrap">

      {/* Nota de abertura personalizada */}
      {note && (
        <div className="diag-note">
          <span style={{fontSize:'20px'}}>{note.emoji}</span>
          <p style={{fontSize:'13px',color:'#A8D08D',lineHeight:'1.65',flex:1}}>{note.text}</p>
        </div>
      )}

      {/* Header */}
      <div style={{textAlign:'center',marginBottom:'24px'}}>
        <div className="badge" style={{background:'rgba(232,168,56,0.08)',borderColor:'rgba(232,168,56,0.22)',color:'#E8A838',marginBottom:'14px'}}>
          📋 LAUDO DIAGNÓSTICO PERSONALIZADO
        </div>
        <h2 className="screen-title" style={{fontSize:'26px',marginBottom:'6px'}}>{name}, seu diagnóstico está pronto</h2>
        <p style={{fontSize:'13px',color:'#5C6652'}}>Gerado com base nas suas {Object.keys(answers).length} respostas + dados biométricos</p>
      </div>

      {/* Perfil Metabólico */}
      <div className="diag-perfil-card" style={{borderColor: d.perfilColor+'33'}}>
        <div className="diag-perfil-header">
          <span style={{fontSize:'28px'}}>{d.perfilEmoji}</span>
          <div>
            <p style={{fontSize:'10px',fontWeight:'700',color:'#5C6652',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'3px'}}>Perfil Metabólico Identificado</p>
            <p style={{fontSize:'15px',fontWeight:'800',color:d.perfilColor,lineHeight:'1.2'}}>{d.perfil}</p>
          </div>
        </div>
        <p style={{fontSize:'13px',color:'#9CA88E',lineHeight:'1.7',marginTop:'10px'}}>{d.perfilDesc}</p>
      </div>

      {/* Métricas */}
      <div className="diag-metricas">
        <div className="diag-metrica">
          <span className="diag-metrica-val" style={{color:bmiCat.color}}>{bmi}</span>
          <span className="diag-metrica-lbl">IMC · {bmiCat.label}</span>
        </div>
        <div className="diag-metrica">
          <span className="diag-metrica-val" style={{color:'#E8A838'}}>{weightToLose.toFixed(1)}kg</span>
          <span className="diag-metrica-lbl">a eliminar</span>
        </div>
        <div className="diag-metrica">
          <span className="diag-metrica-val" style={{color:'#A8D08D'}}>{timeWeeks}sem</span>
          <span className="diag-metrica-lbl">estimado</span>
        </div>
        <div className="diag-metrica">
          <span className="diag-metrica-val" style={{color:'#8CB369'}}>{d.score}%</span>
          <span className="diag-metrica-lbl">compatível</span>
        </div>
      </div>

      {/* Urgência */}
      <div className="diag-urgencia" style={{borderColor:d.urgenciaColor+'44',background:d.urgenciaColor+'0D'}}>
        <span style={{fontSize:'12px',fontWeight:'800',color:d.urgenciaColor,letterSpacing:'.06em'}}>⚠ PRIORIDADE {d.urgencia}</span>
        <p style={{fontSize:'12px',color:'#9CA88E',marginTop:'3px'}}>
          {d.urgencia === 'ALTA'
            ? 'Seu perfil indica que cada mês sem agir torna a perda mais difícil. Iniciar agora maximiza os resultados.'
            : 'Seu metabolismo ainda responde bem à intervenção. Iniciar agora garante resultados mais rápidos.'}
        </p>
      </div>

      {/* Padrão Alimentar */}
      <div className="diag-section">
        <div className="diag-section-header">
          <span className="diag-section-icon">🍽️</span>
          <span className="diag-section-title">Padrão Alimentar Identificado</span>
        </div>
        <p style={{fontSize:'13px',fontWeight:'700',color:'#F2F0E8',marginBottom:'6px'}}>{d.padrao.titulo}</p>
        <p style={{fontSize:'13px',color:'#9CA88E',lineHeight:'1.7'}}>{d.padrao.desc}</p>
      </div>

      {/* Bloqueador + Solução */}
      <div className="diag-section">
        <div className="diag-section-header">
          <span className="diag-section-icon">🔒</span>
          <span className="diag-section-title">Principal Bloqueador</span>
        </div>
        <p style={{fontSize:'13px',fontWeight:'700',color:'#F2F0E8',marginBottom:'6px'}}>{d.bloqueador.titulo}</p>
        <p style={{fontSize:'13px',color:'#9CA88E',lineHeight:'1.7',marginBottom:'10px'}}>{d.bloqueador.desc}</p>
        <div className="diag-solucao">
          <span style={{fontSize:'11px',fontWeight:'800',color:'#8CB369',letterSpacing:'.06em'}}>✓ COMO O PROTOCOLO RESOLVE</span>
          <p style={{fontSize:'13px',color:'#A8D08D',lineHeight:'1.6',marginTop:'4px'}}>{d.bloqueador.solucao}</p>
        </div>
      </div>

      {/* Previsão Semana 1 */}
      <div className="diag-section">
        <div className="diag-section-header">
          <span className="diag-section-icon">📅</span>
          <span className="diag-section-title">O que esperar na 1ª semana</span>
        </div>
        <div className="diag-timeline">
          {[
            { dia:'Dia 1', evento:'Primeiras refeições — carne, ovos e gordura. Sem fome entre refeições.' },
            { dia: d.semana1.dia, evento: d.semana1.evento },
            { dia:'Dia 7', evento:'Check-in do Desafio — peso, medidas e energia avaliados no app.' },
            { dia:'Semana 3', evento:`Meta: eliminar ${(weightToLose * 0.35).toFixed(1)}kg e atingir ${Math.round(d.score * 0.98)}% do seu potencial metabólico.` },
          ].map((t,i)=>(
            <div key={i} className="diag-timeline-item">
              <div className="diag-tl-dot"/>
              <div>
                <span className="diag-tl-dia">{t.dia}</span>
                <p className="diag-tl-evento">{t.evento}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protocolo Recomendado */}
      <div className="diag-protocolo">
        <p style={{fontSize:'10px',fontWeight:'700',color:'#5C6652',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'6px'}}>Protocolo Recomendado para {name}</p>
        <p style={{fontSize:'14px',fontWeight:'800',color:'#F2F0E8',marginBottom:'4px'}}>🌿 {d.protocolo}</p>
        <p style={{fontSize:'12px',color:'#9CA88E'}}>21 dias · App com guia diário · IA disponível 24h · Garantia de 7 dias</p>
      </div>

      <button className="cta" onClick={onNext} style={{width:'100%',marginTop:'20px'}}>
        Ver como iniciar o protocolo →
      </button>
      <p className="micro" style={{marginTop:'10px'}}>🔒 Diagnóstico exclusivo gerado para {name} com base nas suas respostas</p>
    </div>
  );
}

/* ══════════════════════
   10. RESULT + OFFER
   ══════════════════════ */
function Result({ name, weightToLose, timeWeeks, bmi, bmiCat, answers }) {
  const profile = getLeadProfile(answers);
  const headlines = {
    decidida:  `${name}, você está pronta. Só falta começar.`,
    cetica:    `${name}, você tentou o método errado. Esse é diferente.`,
    medo:      `E se desta vez funcionasse de verdade, ${name}?`,
    ocupada:   `${name}, em 15 minutos por dia seu corpo vai mudar.`,
    hormonal:  `${name}, seu metabolismo não é o problema — a alimentação é a solução.`,
    economica: `${name}, R$27 para testar. 7 dias para provar. Risco zero.`,
  };
  const subtitles = {
    decidida:  'Você tem tudo que precisa para começar hoje — incluindo o protocolo certo.',
    cetica:    'Desta vez você tem evidências, um método que respeita seu corpo e 7 dias de garantia.',
    medo:      'Você merece uma chance justa. Esta é ela — com garantia total de devolução.',
    ocupada:   'Simples, sem academia, sem fome. Cabe na sua vida como ela é agora.',
    hormonal:  'O protocolo que trabalha com o seu metabolismo, não contra ele.',
    economica: 'Menos que um lanche. Risco zero. Resultado garantido ou dinheiro de volta.',
  };
  const headline = headlines[profile] || `${name}, tudo está pronto para sua transformação`;
  const subtitle = subtitles[profile] || 'Você tem alta compatibilidade com o Protocolo Dieta da Selva';
  const offerNote = getOfferNote(answers, name);
  const [pixStep, setPixStep] = useState("idle"); // idle | form | loading | qr | paid
  const [pixData, setPixData] = useState(null);   // { transactionId, pixPayload, qrCodeSrc }
  const [form, setForm] = useState({ email:"", phone:"", cpf:"" });
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);
  const [magicLink, setMagicLink] = useState(null);
  const [loadingLink, setLoadingLink] = useState(false);
  const pollRef = useRef(null);

  // Polling: verifica pagamento a cada 3s quando QR está visível
  useEffect(() => {
    if (pixStep !== "qr" || !pixData?.transactionId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/pix/check?tid=${pixData.transactionId}`);
        const json = await res.json();
        if (json.paid) {
          clearInterval(pollRef.current);
          track('payment_confirmed', {});
          if (typeof fbq !== "undefined") fbq("track", "Purchase", { value: 27, currency: "BRL" });
          setPixStep("paid");
        }
      } catch (_) {}
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [pixStep, pixData]);

  async function handleGeneratePix(e) {
    e.preventDefault();
    setFormError("");

    const cpfClean = form.cpf.replace(/\D/g, "");
    const phoneClean = form.phone.replace(/\D/g, "");

    if (!form.email.includes("@")) { setFormError("Email inválido."); return; }
    if (phoneClean.length < 10)    { setFormError("Telefone inválido."); return; }
    if (cpfClean.length !== 11)    { setFormError("CPF inválido (11 dígitos)."); return; }

    setPixStep("loading");
    try {
      const res = await fetch("/api/pix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: form.email, phone: phoneClean, cpf: cpfClean }),
      });
      let data;
      try {
        data = await res.json();
      } catch (_) {
        const text = await res.text().catch(() => "sem resposta");
        console.error("[PIX create] resposta não-JSON:", res.status, text);
        setFormError(`Erro ${res.status}: resposta inválida do servidor.`);
        setPixStep("form");
        return;
      }
      if (!res.ok || data.error) {
        setFormError(data.error || "Erro ao gerar PIX. Tente novamente.");
        setPixStep("form");
        return;
      }
      setPixData(data);
      setPixStep("qr");
      track('checkout_initiated', {});
      if (typeof fbq !== "undefined") fbq("track", "InitiateCheckout", { value: 27, currency: "BRL" });
    } catch (err) {
      console.error("[PIX create] fetch error:", err);
      setFormError("Erro de conexão. Tente novamente.");
      setPixStep("form");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(pixData.pixPayload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  // ── Bloco PIX: substitui os CTAs quando ativado ──
  function PixBlock() {
    if (pixStep === "idle") return (
      <button className="cta cta-final" onClick={() => setPixStep("form")}>
        PAGAR COM PIX — R$27 →
      </button>
    );

    if (pixStep === "form") return (
      <form onSubmit={handleGeneratePix} className="pix-form">
        <p className="pix-form-title">Preencha para gerar o QR Code PIX</p>
        <input className="name-input pix-input" type="email" required placeholder="Seu e-mail"
          value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
        <input className="name-input pix-input" type="tel" required placeholder="Telefone (com DDD)"
          value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
        <input className="name-input pix-input" type="text" required placeholder="CPF (só números)"
          maxLength={14} value={form.cpf} onChange={e=>setForm(f=>({...f,cpf:e.target.value}))} />
        {formError && <p className="pix-error">{formError}</p>}
        <button type="submit" className="cta cta-final">GERAR QR CODE PIX →</button>
        <button type="button" className="pix-back" onClick={()=>setPixStep("idle")}>← voltar</button>
      </form>
    );

    if (pixStep === "loading") return (
      <div className="pix-loading">
        <div className="pix-spinner" />
        <p style={{color:"#9CA88E",fontSize:"14px",marginTop:"16px"}}>Gerando seu QR Code PIX...</p>
      </div>
    );

    if (pixStep === "qr") return (
      <div className="pix-qr-wrap">
        <p className="pix-qr-title">Escaneie o QR Code ou copie o código</p>
        <div className="pix-qr-box">
          <img src={pixData.qrCodeSrc} alt="QR Code PIX" className="pix-qr-img" />
        </div>
        <button className="pix-copy-btn" onClick={handleCopy}>
          {copied ? "✅ Copiado!" : "📋 Copiar código PIX"}
        </button>
        <div className="pix-waiting">
          <div className="pix-waiting-dot" />
          <span>Aguardando confirmação do pagamento...</span>
        </div>
        <button className="pix-force-check" onClick={async()=>{
          const res = await fetch(`/api/pix/check?tid=${pixData.transactionId}`);
          const d = await res.json();
          if(d.paid){ clearInterval(pollRef.current); setPixStep("paid"); }
        }}>
          Já paguei — verificar agora
        </button>
        <p style={{fontSize:"11px",color:"#5C6652",marginTop:"8px"}}>
          O pagamento é confirmado automaticamente em até 30 segundos.
        </p>
      </div>
    );

    if (pixStep === "paid") {
      async function handleAcessar() {
        if (magicLink) { window.location.href = magicLink; return; }
        setLoadingLink(true);
        try {
          const res = await fetch(`/api/pix/magic-link?tid=${pixData?.transactionId}`);
          const data = await res.json();
          if (data.link) {
            setMagicLink(data.link);
            window.location.href = data.link;
          }
        } catch (_) {}
        setLoadingLink(false);
      }

      return (
        <div className="pix-paid">
          {/* Header */}
          <div style={{fontSize:"64px",marginBottom:"8px"}}>🌿</div>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",color:"#F2F0E8",marginBottom:"6px"}}>
            Bem-vinda à Selva, {name}!
          </h3>
          <p style={{fontSize:"14px",color:"#8CB369",fontWeight:"600",marginBottom:"24px",letterSpacing:"0.05em"}}>
            ✅ PAGAMENTO CONFIRMADO
          </p>

          {/* O que você recebe */}
          <div style={{background:"#111608",border:"1px solid rgba(140,179,105,0.15)",borderRadius:"16px",padding:"20px",marginBottom:"20px",width:"100%",maxWidth:"400px",textAlign:"left"}}>
            <p style={{fontSize:"11px",fontWeight:"700",color:"#5C6652",letterSpacing:"0.1em",marginBottom:"12px"}}>SEU ACESSO INCLUI</p>
            {[
              ["🥩","Plano alimentar completo de 21 dias"],
              ["📖","Biblioteca de receitas carnívoras"],
              ["🏆","Desafio 21 dias sem falhar"],
              ["🏋️","Treinos em casa semana a semana"],
              ["🌿","Selva IA para tirar suas dúvidas"],
              ["⭐","5 receitas exclusivas da Selva"],
            ].map(([emoji, text], i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
                <span style={{fontSize:"16px"}}>{emoji}</span>
                <span style={{fontSize:"13px",color:"#9CA88E"}}>{text}</span>
              </div>
            ))}
          </div>

          {/* Botão magic link */}
          <button
            onClick={handleAcessar}
            disabled={loadingLink}
            style={{
              width:"100%",maxWidth:"400px",padding:"18px",
              background: loadingLink ? "#5C6652" : "#E8A838",
              color:"#000",fontWeight:"800",fontSize:"16px",
              borderRadius:"14px",border:"none",cursor:"pointer",
              marginBottom:"14px",letterSpacing:"0.02em",
            }}
          >
            {loadingLink ? "Gerando seu acesso..." : "ACESSAR MEU PROTOCOLO →"}
          </button>

          {/* Instrução email */}
          <div style={{background:"#0D1309",border:"1px solid rgba(140,179,105,0.1)",borderRadius:"12px",padding:"14px",maxWidth:"400px",width:"100%"}}>
            <p style={{fontSize:"12px",color:"#9CA88E",lineHeight:"1.6",margin:0}}>
              📧 Também enviamos o link de acesso para o seu e-mail.<br/>
              <span style={{color:"#5C6652"}}>Verifique a caixa de entrada e o spam.</span>
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div style={{paddingTop:"24px"}}>
      <div style={{textAlign:"center",marginBottom:"32px"}}>
        <h2 className="screen-title" style={{fontSize:"26px"}}>{headline}</h2>
        <p className="screen-sub">{subtitle}</p>
        {offerNote && (
          <p style={{marginTop:'12px',fontSize:'14px',fontWeight:'600',color:'#A8D08D',lineHeight:'1.6',maxWidth:'400px',margin:'12px auto 0'}}>
            {offerNote}
          </p>
        )}
      </div>

      {/* App Demo */}
      <AppDemo onComprar={() => document.querySelector('.price-card')?.scrollIntoView({behavior:'smooth',block:'center'})} />

      {/* What you get */}
      <h3 className="section-title">O que você recebe hoje</h3>
      <div className="features-grid">
        {[
          {icon:"📱",title:"App Exclusivo",desc:"Webapp completo no seu celular com tudo que você precisa"},
          {icon:"🥩",title:"Cardápios Prontos",desc:"Receitas dia a dia da dieta da selva, fáceis e deliciosas"},
          {icon:"📊",title:"Calendário de Evolução",desc:"Acompanhe sua transformação com gráficos e metas"},
          {icon:"🧮",title:"Calculadora de Peso/IMC",desc:"Monitore seu progresso com precisão"},
          {icon:"🏋️",title:"Exercícios Caseiros",desc:"Treinos de 15min que aceleram resultados sem academia"},
          {icon:"🍳",title:"Receitas Exclusivas",desc:"Pratos que parecem proibidos mas queimam gordura"},
        ].map((f,i)=>(
          <div key={i} className="feat-card">
            <span style={{fontSize:"24px"}}>{f.icon}</span>
            <div><strong style={{color:"#F2F0E8",fontSize:"14px"}}>{f.title}</strong><br/><span className="dim" style={{fontSize:"12.5px"}}>{f.desc}</span></div>
          </div>
        ))}
      </div>

      {/* WhatsApp social proof */}
      <h3 className="section-title">O que dizem quem já fez</h3>
      <div className="whatsapp-grid">
        {["/depo-3.webp","/depo-4.webp","/depo-5.webp","/depo-6.webp"].map((src,i) => (
          <img key={i} src={src} alt={`Depoimento ${i+1}`} className="whatsapp-img" />
        ))}
      </div>

      {/* Guarantee */}
      <div className="guarantee">
        <div style={{fontSize:"36px"}}>🛡️</div>
        <h3 style={{fontSize:"18px",color:"#F2F0E8",marginBottom:"6px"}}>Garantia Incondicional de 7 Dias</h3>
        <p className="dim" style={{fontSize:"14px",lineHeight:"1.7",maxWidth:"440px",margin:"0 auto"}}>{name}, se em 7 dias você não sentir que o Protocolo está funcionando, devolvemos <strong style={{color:"#A8D08D"}}>100% do seu dinheiro</strong>. Sem perguntas.</p>
      </div>

      {/* Price + PIX */}
      <div className="price-card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",marginBottom:"8px"}}>
          <span style={{fontSize:"16px",color:"#5C6652",textDecoration:"line-through"}}>De R$ 197,00</span>
          <span className="discount-badge">-86% OFF</span>
        </div>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:"2px",marginBottom:"4px"}}>
          <span style={{fontSize:"20px",fontWeight:"700",color:"#9CA88E",marginTop:"10px"}}>R$</span>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:"68px",fontWeight:"900",color:"#F2F0E8",lineHeight:"1"}}>27</span>
          <span style={{fontSize:"22px",fontWeight:"700",color:"#9CA88E",marginTop:"10px"}}>,00</span>
        </div>
        <p style={{fontSize:"14px",color:"#5C6652",marginBottom:"20px"}}>pagamento único via PIX — acesso imediato</p>

        {PixBlock()}

        {pixStep === "idle" && (
          <div className="urgency" style={{marginTop:"14px"}}>
            <div className="urgency-dot" />
            <span>127 pessoas estão vendo esta página agora</span>
          </div>
        )}

        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"14px",marginTop:"14px",fontSize:"12px",color:"#5C6652",flexWrap:"wrap"}}>
          <span>🔒 Compra segura</span><span>✅ Acesso imediato</span><span>🛡️ 7 dias de garantia</span>
        </div>
      </div>

      {/* FAQ */}
      <h3 className="section-title" style={{marginTop:"44px"}}>Perguntas Frequentes</h3>
      {[
        {q:"A Dieta da Selva funciona mesmo?",a:"Sim. É baseada nos princípios da dieta carnívora/ancestral. O chef Henrique Fogaça eliminou 17kg em 3 meses com este método. O protocolo foi adaptado para mulheres acima de 30."},
        {q:"Vou passar fome?",a:"Pelo contrário! Carnes, queijos, ovos e gorduras boas estimulam o GLP-1 — o hormônio natural da saciedade. Você se sente satisfeita por horas."},
        {q:"Preciso ir à academia?",a:"Não. O app inclui exercícios caseiros de 15 minutos. A alimentação é o pilar principal."},
        {q:"Como funciona o pagamento?",a:"100% via PIX. Você gera o QR Code, paga pelo app do seu banco, e o acesso é liberado automaticamente em segundos."},
        {q:"E se não funcionar?",a:"Garantia de 7 dias. Devolvemos 100% sem perguntas."},
      ].map((f,i)=>(<FaqItem key={i} q={f.q} a={f.a} />))}

      {/* Final CTA */}
      {pixStep === "idle" && (
        <div style={{textAlign:"center",margin:"44px 0"}}>
          <p style={{fontSize:"17px",color:"#9CA88E",lineHeight:"1.7",marginBottom:"20px"}}>{name}, você merece se sentir bem no seu corpo.<br/><strong style={{color:"#F2F0E8"}}>O primeiro passo é agora.</strong></p>
          <button className="cta cta-final" onClick={()=>{ window.scrollTo({top:0,behavior:"smooth"}); setTimeout(()=>setPixStep("form"),400); }}>
            GARANTIR MEU ACESSO POR R$27 →
          </button>
        </div>
      )}

      <footer style={{textAlign:"center",padding:"24px 16px",borderTop:"1px solid rgba(140,179,105,0.08)",fontSize:"12px",color:"#5C6652"}}>
        <p>© 2025 Protocolo Dieta da Selva. Todos os direitos reservados.</p>
        <p style={{fontSize:"11px",marginTop:"4px",opacity:0.6}}>Este produto não substitui orientação médica. Resultados variam.</p>
      </footer>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open?"faq-open":""}`} onClick={()=>setOpen(!open)}>
      <div className="faq-q"><span>{q}</span><span className="faq-toggle">{open?"−":"+"}</span></div>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

/* ══════════════════════
   INLINE STYLES (constants)
   ══════════════════════ */
const S = {
  page: {minHeight:"100vh",background:"#0C0F0A",color:"#F2F0E8",position:"relative",overflow:"hidden"},
  grain: {position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:0.03,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"},
  glow1: {position:"fixed",top:"-200px",left:"50%",transform:"translateX(-50%)",width:"800px",height:"500px",borderRadius:"50%",background:"radial-gradient(ellipse,rgba(140,179,105,0.06) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  glow2: {position:"fixed",bottom:"-150px",right:"-100px",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(ellipse,rgba(232,168,56,0.04) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  container: {maxWidth:"680px",margin:"0 auto",padding:"24px 20px 60px",position:"relative",zIndex:1},
};

/* ══════════════════════
   CSS (all classes)
   ══════════════════════ */
const CSS = `
.badge{display:inline-block;padding:8px 20px;border-radius:100px;background:rgba(140,179,105,0.08);border:1px solid rgba(140,179,105,0.2);font-size:12px;font-weight:600;letter-spacing:.5px;color:#A8D08D;margin-bottom:24px}

.landing-wrap{padding-top:20px;text-align:center}
.landing-source{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:#5C6652;margin-bottom:12px;background:rgba(140,179,105,0.04);border:1px solid rgba(140,179,105,0.1);padding:4px 10px;border-radius:100px}
.landing-source-dot{width:6px;height:6px;border-radius:50%;background:#8CB369;flex-shrink:0;animation:blink 1.4s infinite}

.hero-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;line-height:1.25;color:#F2F0E8;margin-bottom:14px}

/* card original (mantido mas não usado no novo layout) */
.fogaca-card{margin:0 auto 16px;max-width:480px;border-radius:18px;overflow:hidden;border:1px solid rgba(140,179,105,0.15);box-shadow:0 8px 40px rgba(0,0,0,0.5)}
.fogaca-img{width:100%;display:block;object-fit:cover;max-height:320px}
.fogaca-caption{background:#0B0F07;padding:13px 15px;text-align:left}
.fogaca-caption-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.fogaca-caption-tag{font-size:10px;font-weight:700;color:#8CB369;letter-spacing:.06em;text-transform:uppercase}
.fogaca-caption-date{font-size:10px;color:#354030}
.fogaca-caption p{font-size:13px;color:#C8D4B8;line-height:1.6;font-style:italic}

/* card compacto — foto lateral + quote em linha */
.fogaca-card-compact{display:flex;align-items:center;gap:0;text-align:left;padding:0;border-radius:16px;margin-bottom:14px}
.fogaca-img-compact{width:90px;min-width:90px;height:90px;object-fit:cover;object-position:top;border-radius:12px 0 0 12px;display:block;flex-shrink:0}
.fogaca-caption-compact{background:#0B0F07;padding:10px 13px;flex:1;border-radius:0 12px 12px 0}
.fogaca-caption-compact .fogaca-caption-tag{display:block;font-size:9px;font-weight:700;color:#8CB369;letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px}
.fogaca-caption-compact p{font-size:12px;color:#C8D4B8;line-height:1.5;font-style:italic;margin:0}

.landing-article-block{max-width:480px;margin:0 auto 18px;text-align:left;background:rgba(140,179,105,0.04);border:1px solid rgba(140,179,105,0.1);border-left:3px solid #8CB369;border-radius:0 12px 12px 0;padding:14px 16px}
.landing-article-lead{font-size:15px;color:#D4D9CC;line-height:1.65;margin-bottom:10px}
.landing-article-body{font-size:13px;color:#9CA88E;line-height:1.65}

.landing-divider{display:flex;align-items:center;gap:10px;margin:0 auto 14px;max-width:480px;color:#5C6652;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.landing-divider::before,.landing-divider::after{content:'';flex:1;height:1px;background:rgba(140,179,105,0.1)}

.landing-bullets{display:flex;flex-direction:column;gap:6px;margin:0 auto 20px;max-width:480px;text-align:left}
.landing-bullets-sm{gap:5px;margin-bottom:18px}
.landing-bullet{display:flex;align-items:center;gap:10px;background:rgba(140,179,105,0.04);border:1px solid rgba(140,179,105,0.1);border-radius:10px;padding:8px 13px}
.landing-bullet-em{font-size:17px;flex-shrink:0}
.landing-bullet-txt{font-size:13px;color:#C8D4B8;line-height:1.4}

/* proof row compact variant */
.proof-row-sm{margin-bottom:16px}
.hl{color:#A8D08D}.hl-accent{color:#E8A838}
.hero-sub{font-size:16px;line-height:1.7;color:#9CA88E;margin-bottom:28px;max-width:520px;margin-left:auto;margin-right:auto}
.proof-row{display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:32px;flex-wrap:wrap}
.proof-item{text-align:center}.proof-num{display:block;font-family:'Playfair Display',serif;font-size:26px;font-weight:800;color:#E8A838}
.proof-lbl{font-size:12px;color:#5C6652}.proof-div{width:1px;height:36px;background:rgba(140,179,105,0.12)}
.cta{display:inline-flex;align-items:center;gap:10px;padding:17px 36px;border-radius:14px;border:none;font-size:16px;font-weight:700;font-family:'DM Sans',sans-serif;background:linear-gradient(135deg,#8CB369,#6B9B45);color:#fff;box-shadow:0 4px 24px rgba(140,179,105,0.25);transition:all .3s;text-decoration:none;justify-content:center}
.cta:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(140,179,105,0.35)}
.cta:disabled{opacity:.5;cursor:default;transform:none}
.cta-final{width:100%;padding:20px;font-size:16px}
.micro{font-size:13px;color:#5C6652;margin-top:14px}
.dim{color:#9CA88E}
.faces-row{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:28px}
.face{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#8CB369;background:rgba(140,179,105,0.1);border:2px solid rgba(140,179,105,0.2);margin-left:-5px}
.face:first-child{margin-left:0}.faces-txt{font-size:12px;color:#5C6652;margin-left:8px}

.name-input{width:100%;padding:16px 20px;border-radius:14px;border:1px solid rgba(140,179,105,0.15);background:rgba(18,24,14,0.8);color:#F2F0E8;font-size:18px;font-family:'DM Sans',sans-serif;text-align:center;transition:border .2s}
.name-input:focus{border-color:rgba(140,179,105,0.5)}
.name-input::placeholder{color:#5C6652}

.screen-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#F2F0E8;margin-bottom:8px;line-height:1.3}
.screen-sub{font-size:15px;color:#9CA88E}

.progress-wrap{display:flex;align-items:center;gap:12px;margin-bottom:32px}
.progress-bar{flex:1;height:6px;border-radius:10px;background:rgba(140,179,105,0.1);overflow:hidden}
.progress-fill{height:100%;border-radius:10px;transition:width .5s;background:linear-gradient(90deg,#8CB369,#E8A838)}
.progress-txt{font-size:13px;color:#5C6652;font-weight:600;white-space:nowrap}

.question{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;line-height:1.3;color:#F2F0E8;margin-bottom:6px}
.question-sub{font-size:14px;color:#9CA88E}

.options{display:flex;flex-direction:column;gap:10px}
.option{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:14px;border:1px solid rgba(140,179,105,0.1);background:rgba(18,24,14,0.85);backdrop-filter:blur(8px);transition:all .3s;text-align:left;font-size:15px;color:#F2F0E8;width:100%;font-family:'DM Sans',sans-serif}
.option:hover{border-color:rgba(140,179,105,0.3);background:rgba(140,179,105,0.06);transform:translateX(4px)}
.option-sel{border-color:#8CB369!important;background:rgba(140,179,105,0.1)!important}
.option-sel .opt-check{opacity:1}
.opt-emoji{font-size:22px;flex-shrink:0}.opt-text{flex:1;font-weight:500}.opt-check{margin-left:auto;opacity:0;font-weight:700;color:#8CB369;transition:opacity .3s}

/* ── Slim progress bar ── */
.progress-slim{height:3px;border-radius:10px;background:rgba(140,179,105,0.1);overflow:hidden;margin-bottom:0}
.progress-slim-fill{height:100%;border-radius:10px;transition:width .5s;background:linear-gradient(90deg,#8CB369,#E8A838)}

/* ── Grid card layout (Q1 goal, Q7 motivacao) ── */
.opt-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.opt-grid-card{display:flex;flex-direction:column;align-items:center;gap:10px;padding:16px 12px;border-radius:18px;border:1.5px solid rgba(140,179,105,0.1);background:rgba(18,24,14,0.85);transition:all .3s;color:#F2F0E8;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;text-align:center;width:100%;cursor:pointer}
.opt-grid-card:hover{border-color:rgba(140,179,105,0.35);background:rgba(140,179,105,0.07);transform:translateY(-2px)}
.opt-grid-card.opt-sel{border-color:#8CB369!important;background:rgba(140,179,105,0.12)!important;box-shadow:0 0 0 3px rgba(140,179,105,0.12)}
.opt-grid-illus{width:80px;height:80px;flex-shrink:0}
.opt-grid-label{line-height:1.3;color:#F2F0E8}

/* ── Chip layout (Q2 age, Q4 meals) ── */
.opt-chips{display:flex;flex-direction:column;gap:10px}
.opt-chip{display:flex;align-items:center;gap:14px;padding:15px 20px;border-radius:50px;border:1.5px solid rgba(140,179,105,0.1);background:rgba(18,24,14,0.85);transition:all .25s;color:#F2F0E8;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;width:100%;cursor:pointer;text-align:left}
.opt-chip:hover{border-color:rgba(140,179,105,0.35);background:rgba(140,179,105,0.07)}
.opt-chip.opt-sel{border-color:#8CB369!important;background:rgba(140,179,105,0.1)!important}
.opt-chip-emoji{font-size:22px;flex-shrink:0}
.opt-check-pill{margin-left:auto;font-weight:700;color:#8CB369;font-size:16px}

/* ── Card-icon layout (Q3 frustration, Q6 tentativas, Q8 commitment) ── */
.opt-card-list{display:flex;flex-direction:column;gap:10px}
.opt-card-icon{display:flex;align-items:center;gap:16px;padding:14px 18px;border-radius:16px;border:1.5px solid rgba(140,179,105,0.1);background:rgba(18,24,14,0.85);transition:all .3s;color:#F2F0E8;font-family:'DM Sans',sans-serif;font-size:15px;width:100%;cursor:pointer;text-align:left}
.opt-card-icon:hover{border-color:rgba(140,179,105,0.3);background:rgba(140,179,105,0.06);transform:translateX(3px)}
.opt-card-icon.opt-sel{border-color:#8CB369!important;background:rgba(140,179,105,0.1)!important}
.opt-card-icon.opt-sel .opt-card-icon-check{opacity:1}
.opt-card-icon-img{width:52px;height:52px;flex-shrink:0}
.opt-card-icon-emoji{width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;border-radius:12px;background:rgba(140,179,105,0.08)}
.opt-card-icon-title{flex:1;font-weight:500;line-height:1.35}
.opt-card-icon-check{margin-left:auto;opacity:0;font-weight:700;color:#8CB369;font-size:17px;transition:opacity .25s;flex-shrink:0}

/* ── Grid icon layout (Q5 symptoms) ── */
.opt-grid-icons{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.opt-grid-icon-card{display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 12px;border-radius:18px;border:1.5px solid rgba(140,179,105,0.1);background:rgba(18,24,14,0.85);transition:all .3s;color:#F2F0E8;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;text-align:center;width:100%;cursor:pointer;line-height:1.35}
.opt-grid-icon-card:hover{border-color:rgba(140,179,105,0.35);background:rgba(140,179,105,0.07);transform:translateY(-2px)}
.opt-grid-icon-card.opt-sel{border-color:#8CB369!important;background:rgba(140,179,105,0.12)!important;box-shadow:0 0 0 3px rgba(140,179,105,0.12)}
.opt-grid-icon-svg{width:56px;height:56px;flex-shrink:0}
.opt-grid-icon-label{color:#F2F0E8}

/* ── Emoji-centered layout (Q9 ready) ── */
.opt-emoji-list{display:flex;flex-direction:column;gap:10px}
.opt-emoji-card{display:flex;align-items:center;gap:16px;padding:16px 22px;border-radius:16px;border:1.5px solid rgba(140,179,105,0.1);background:rgba(18,24,14,0.85);transition:all .3s;color:#F2F0E8;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;width:100%;cursor:pointer;text-align:left}
.opt-emoji-card:hover{border-color:rgba(140,179,105,0.3);background:rgba(140,179,105,0.07)}
.opt-emoji-card.opt-sel{border-color:#8CB369!important;background:rgba(140,179,105,0.1)!important}
.opt-emoji-big{font-size:30px;flex-shrink:0}
.opt-emoji-label{flex:1;line-height:1.35}

.input-group{margin-bottom:14px}.label{display:block;font-size:13px;font-weight:600;color:#9CA88E;margin-bottom:5px}
.field{width:100%;padding:14px 16px;border-radius:12px;border:1px solid rgba(140,179,105,0.12);background:rgba(10,14,8,0.8);color:#F2F0E8;font-size:16px;font-family:'DM Sans',sans-serif;box-sizing:border-box;transition:border .2s}
.field:focus{border-color:rgba(140,179,105,0.4)}
.field::placeholder{color:#5C6652}

.edu-card{border-radius:20px;border:1px solid rgba(140,179,105,0.12);background:rgba(18,24,14,0.85);padding:28px 24px;backdrop-filter:blur(10px)}
.edu-badge{text-align:center;font-size:12px;font-weight:600;letter-spacing:.8px;color:#A8D08D;margin-bottom:16px}
.edu-title{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:#F2F0E8;text-align:center;margin-bottom:20px;line-height:1.3}
.edu-body{font-size:15px;color:#9CA88E;line-height:1.75}
.edu-body p{margin-bottom:14px}
.edu-list{display:flex;flex-direction:column;gap:14px;margin:16px 0}
.edu-item{display:flex;gap:12px;align-items:flex-start}
.edu-icon{font-size:22px;flex-shrink:0;margin-top:2px}
.edu-highlight{padding:16px 20px;border-radius:14px;background:rgba(140,179,105,0.06);border:1px solid rgba(140,179,105,0.15);margin:18px 0;font-size:14px;line-height:1.7}

.edu-compare{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}
.edu-compare-col{border-radius:14px;padding:16px;font-size:13px}
.edu-bad{background:rgba(232,85,74,0.06);border:1px solid rgba(232,85,74,0.15)}
.edu-good{background:rgba(140,179,105,0.06);border:1px solid rgba(140,179,105,0.15)}
.compare-header{font-weight:700;font-size:14px;margin-bottom:10px;color:#F2F0E8}
.compare-item{padding:4px 0;color:#9CA88E;line-height:1.5}

.edu-quote{padding:16px 20px;border-radius:14px;background:rgba(232,168,56,0.05);border-left:3px solid #E8A838;margin:18px 0;font-style:italic;font-size:14px;color:#9CA88E;line-height:1.7}
.edu-quote-author{display:block;margin-top:8px;font-style:normal;font-weight:600;font-size:13px;color:#E8A838}

.testimonials{display:flex;flex-direction:column;gap:14px;margin-bottom:20px}
.testi-card{padding:20px;border-radius:16px;border:1px solid rgba(140,179,105,0.08);background:rgba(18,24,14,0.8);overflow:hidden}
.testi-img{width:100%;border-radius:10px;margin-bottom:14px;object-fit:cover;max-height:280px}
.testi-stars{color:#E8A838;font-size:15px;letter-spacing:2px;margin-bottom:10px}
.testi-text{font-size:14px;color:#9CA88E;line-height:1.7;margin-bottom:14px;font-style:italic}
.testi-footer{display:flex;align-items:center;gap:10px}
.testi-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#8CB369;background:rgba(140,179,105,0.1);border:2px solid rgba(140,179,105,0.2);flex-shrink:0}
.testi-name{font-size:13px;font-weight:600;color:#F2F0E8}.testi-city{font-size:11px;color:#5C6652}
.testi-result{margin-left:auto;padding:5px 12px;border-radius:100px;background:rgba(232,168,56,0.1);border:1px solid rgba(232,168,56,0.2);font-size:11px;font-weight:700;color:#E8A838;white-space:nowrap}

.social-counter{display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:#5C6652;margin-top:16px}
.counter-dot{width:8px;height:8px;border-radius:50%;background:#8CB369;animation:blink 1.5s infinite}

.pulse-wrap{position:relative;width:100px;height:100px;margin:0 auto;display:flex;align-items:center;justify-content:center}
@keyframes pulse{0%{transform:scale(.8);opacity:.6}100%{transform:scale(1.8);opacity:0}}
.pulse-ring{position:absolute;inset:0;border-radius:50%;border:2px solid #8CB369;animation:pulse 2s ease-out infinite}
.pulse-ring-2{animation-delay:1s}

.analysis-bar-wrap{max-width:380px;margin:0 auto;display:flex;align-items:center;gap:12px}
.analysis-bar{flex:1;height:8px;border-radius:10px;background:rgba(140,179,105,0.1);overflow:hidden}
.analysis-fill{height:100%;border-radius:10px;transition:width .15s linear;background:linear-gradient(90deg,#8CB369,#E8A838)}
.analysis-pct{font-size:16px;font-weight:700;color:#E8A838;font-variant-numeric:tabular-nums;min-width:40px}

.diag-card{border-radius:16px;border:1px solid rgba(140,179,105,0.12);background:rgba(18,24,14,0.85);padding:4px 0;margin-bottom:24px;overflow:hidden}
.diag-row{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid rgba(140,179,105,0.06)}
.diag-row:last-child{border-bottom:none}
.diag-label{font-size:14px;color:#9CA88E}.diag-value{font-size:15px;font-weight:700}

.diag-analysis{padding:24px;border-radius:16px;border:1px solid rgba(140,179,105,0.1);background:rgba(18,24,14,0.7);margin-bottom:8px}

.diag-wrap{padding-top:20px;max-width:520px;margin:0 auto}
.diag-perfil-card{border-radius:16px;border:1px solid;background:rgba(12,16,9,0.9);padding:16px;margin-bottom:14px}
.diag-perfil-header{display:flex;align-items:flex-start;gap:12px}
.diag-metricas{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}
.diag-metrica{background:rgba(12,16,9,0.9);border:1px solid rgba(140,179,105,0.1);border-radius:12px;padding:10px 6px;text-align:center;display:flex;flex-direction:column;gap:3px}
.diag-metrica-val{font-size:18px;font-weight:800;font-family:'Playfair Display',serif;line-height:1}
.diag-metrica-lbl{font-size:9px;color:#5C6652;font-weight:500;line-height:1.2}
.diag-urgencia{border-radius:12px;border:1px solid;padding:10px 14px;margin-bottom:14px;text-align:center}
.diag-section{background:rgba(12,16,9,0.85);border:1px solid rgba(140,179,105,0.1);border-radius:14px;padding:14px;margin-bottom:10px}
.diag-section-header{display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(140,179,105,0.07)}
.diag-section-icon{font-size:16px}
.diag-section-title{font-size:11px;font-weight:700;color:#5C6652;letter-spacing:.07em;text-transform:uppercase}
.diag-solucao{background:rgba(140,179,105,0.06);border:1px solid rgba(140,179,105,0.15);border-radius:10px;padding:10px 12px}
.diag-timeline{display:flex;flex-direction:column;gap:0}
.diag-timeline-item{display:flex;gap:12px;position:relative;padding-bottom:14px}
.diag-timeline-item:last-child{padding-bottom:0}
.diag-timeline-item:not(:last-child)::before{content:'';position:absolute;left:7px;top:16px;bottom:0;width:1px;background:rgba(140,179,105,0.15)}
.diag-tl-dot{width:14px;height:14px;border-radius:50%;background:rgba(140,179,105,0.15);border:2px solid rgba(140,179,105,0.35);flex-shrink:0;margin-top:2px}
.diag-tl-dia{font-size:10px;font-weight:700;color:#E8A838;letter-spacing:.04em;display:block;margin-bottom:2px}
.diag-tl-evento{font-size:12px;color:#9CA88E;line-height:1.5}
.diag-protocolo{background:linear-gradient(135deg,rgba(26,32,16,.9),rgba(12,16,9,.9));border:1px solid rgba(140,179,105,0.2);border-radius:16px;padding:16px;text-align:center;margin-top:6px}

.section-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;text-align:center;color:#F2F0E8;margin-bottom:24px}

.features-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:36px}
.feat-card{display:flex;gap:12px;padding:16px;border-radius:14px;border:1px solid rgba(140,179,105,0.08);background:rgba(18,24,14,0.7);align-items:flex-start}

/* ── Lifestyle screens ── */
.lifestyle-hero-img{width:100%;max-height:220px;object-fit:cover;object-position:center;border-radius:0 0 20px 20px;display:block}
.whatsapp-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:36px}
.whatsapp-img{width:100%;border-radius:14px;object-fit:cover;display:block}
.guarantee{text-align:center;padding:28px 22px;border-radius:20px;margin-bottom:36px;background:linear-gradient(135deg,rgba(140,179,105,0.06),rgba(140,179,105,0.02));border:1px solid rgba(140,179,105,0.15)}

.price-card{text-align:center;padding:32px 24px;border-radius:24px;background:linear-gradient(180deg,rgba(140,179,105,0.08) 0%,rgba(18,24,14,0.95) 100%);border:2px solid rgba(140,179,105,0.2);box-shadow:0 0 60px rgba(140,179,105,0.06);margin-bottom:8px}
.discount-badge{padding:4px 12px;border-radius:100px;font-size:12px;font-weight:700;background:rgba(232,85,74,0.15);color:#E85D4A}

.urgency{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;font-size:13px;color:#5C6652}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.urgency-dot{width:8px;height:8px;border-radius:50%;background:#E85D4A;animation:blink 1.5s infinite}

.faq-item{border:1px solid rgba(140,179,105,0.08);border-radius:12px;margin-bottom:8px;background:rgba(18,24,14,0.7);cursor:pointer;overflow:hidden;transition:border-color .3s}
.faq-item:hover{border-color:rgba(140,179,105,0.2)}
.faq-open{border-color:rgba(140,179,105,0.25)}
.faq-q{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;font-size:14px;font-weight:600;color:#F2F0E8}
.faq-toggle{font-size:18px;color:#8CB369;font-weight:300}
.faq-a{padding:0 18px 16px;font-size:13px;line-height:1.7;color:#9CA88E}

@media(max-width:640px){
  .hero-title{font-size:24px}
  .fogaca-img{max-height:260px}
  .screen-title{font-size:22px}
  .question{font-size:20px}
  .edu-title{font-size:20px}
  .edu-compare{grid-template-columns:1fr}
  .features-grid{grid-template-columns:1fr}
  .price-card span[style*="68px"]{font-size:54px!important}
}

/* ── PIX ── */
.pix-form{display:flex;flex-direction:column;gap:10px;width:100%}
.pix-form-title{font-size:14px;color:#9CA88E;margin-bottom:4px;text-align:center}
.pix-input{text-align:left!important;font-size:15px!important;padding:14px 18px!important}
.pix-error{font-size:13px;color:#E85D4A;text-align:center;margin:0}
.pix-back{background:none;border:none;color:#5C6652;font-size:13px;cursor:pointer;margin-top:4px;font-family:'DM Sans',sans-serif}
.pix-back:hover{color:#9CA88E}
.pix-loading{display:flex;flex-direction:column;align-items:center;padding:32px 0}
.pix-spinner{width:44px;height:44px;border-radius:50%;border:3px solid rgba(140,179,105,0.15);border-top-color:#8CB369;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.pix-qr-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%}
.pix-qr-title{font-size:14px;color:#9CA88E;text-align:center}
.pix-qr-box{padding:12px;background:#fff;border-radius:14px;display:inline-block}
.pix-qr-img{width:220px;height:220px;display:block}
.pix-copy-btn{width:100%;padding:14px;border-radius:12px;border:1px solid rgba(140,179,105,0.3);background:rgba(140,179,105,0.06);color:#A8D08D;font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s}
.pix-copy-btn:hover{background:rgba(140,179,105,0.12)}
.pix-waiting{display:flex;align-items:center;gap:8px;font-size:13px;color:#9CA88E}
.pix-waiting-dot{width:8px;height:8px;border-radius:50%;background:#8CB369;animation:blink 1.2s infinite;flex-shrink:0}
.pix-force-check{background:none;border:none;color:#5C6652;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline}
.pix-force-check:hover{color:#9CA88E}
.pix-paid{display:flex;flex-direction:column;align-items:center;text-align:center;padding:16px 0}

.demo-wrap{margin-bottom:36px;text-align:center}
.demo-headline{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#F2F0E8;margin-bottom:6px}
.demo-sub{font-size:13px;color:#9CA88E;margin-bottom:20px}

.phone-frame{position:relative;width:300px;margin:0 auto;background:#080D06;border-radius:44px;border:2px solid rgba(140,179,105,0.18);box-shadow:0 0 0 7px rgba(8,13,6,0.9),0 0 0 9px rgba(140,179,105,0.07),0 28px 70px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.04);overflow:hidden;user-select:none}

.phone-status{display:flex;align-items:center;justify-content:space-between;padding:12px 20px 4px;background:#080D06;color:rgba(242,240,232,0.85)}
.phone-time{font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;letter-spacing:.01em}
.phone-status-icons{display:flex;align-items:center;gap:5px}

.phone-body{height:460px;overflow-y:auto;overflow-x:hidden;background:#0C0F0A;scrollbar-width:none}
.phone-body::-webkit-scrollbar{display:none}

.phone-nav{display:flex;border-top:1px solid rgba(140,179,105,0.08);background:#080D06;padding:8px 0 4px}
.phone-home-ind{height:20px;background:#080D06;display:flex;align-items:center;justify-content:center}
.phone-home-ind::after{content:'';display:block;width:100px;height:4px;border-radius:100px;background:rgba(242,240,232,0.2)}

.pnav-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;padding:4px 0;color:#5C6652;transition:color .2s}
.pnav-btn:hover{color:#9CA88E}
.pnav-active{color:#E8A838}
.pnav-label{font-size:9px;font-family:'DM Sans',sans-serif;font-weight:500}

.app-home{padding:14px 12px 16px}
.app-top-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.app-greeting{font-size:10px;color:#9CA88E;margin-bottom:1px}
.app-name-txt{font-size:16px;font-weight:800;color:#F2F0E8}
.app-av{width:32px;height:32px;border-radius:50%;background:#1A2010;border:1px solid rgba(140,179,105,0.2);display:flex;align-items:center;justify-content:center;font-size:14px}

.app-card{background:#111608;border:1px solid rgba(140,179,105,0.1);border-radius:14px;padding:12px;margin-bottom:8px;cursor:pointer;transition:border-color .2s}
.app-card:hover{border-color:rgba(140,179,105,0.28)}
.app-lbl{font-size:9px;font-weight:700;color:#5C6652;letter-spacing:.08em;margin-bottom:5px}
.app-bar{height:5px;background:rgba(140,179,105,0.1);border-radius:4px;overflow:hidden;margin-bottom:8px}
.app-bar-fill{height:100%;background:linear-gradient(90deg,#8CB369,#E8A838);border-radius:4px;transition:width .4s}
.app-stats-row{display:flex;gap:5px}
.app-stat{flex:1;background:#1A2010;border-radius:8px;padding:6px 4px;text-align:center}
.app-stat-l{display:block;font-size:9px;color:#9CA88E;margin-bottom:2px}
.app-stat-v{display:block;font-size:11px;font-weight:700}

.app-meal{display:flex;align-items:center;gap:8px;background:#111608;border:1px solid rgba(140,179,105,0.08);border-radius:12px;padding:10px;cursor:pointer;transition:border-color .2s;margin-bottom:0}
.app-meal:hover{border-color:rgba(140,179,105,0.25)}
.app-meal-icon{width:36px;height:36px;background:#1A2010;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}

.app-tip{display:flex;gap:8px;align-items:flex-start;background:#1A2010;border-radius:12px;padding:10px;cursor:pointer;margin-bottom:0}

.app-ia-cta{display:flex;align-items:center;gap:10px;margin-top:8px;background:linear-gradient(135deg,rgba(26,32,16,.9),rgba(17,22,8,.9));border:1px solid rgba(232,168,56,0.18);border-radius:14px;padding:10px 12px;cursor:pointer;transition:border-color .2s}
.app-ia-cta:hover{border-color:rgba(232,168,56,0.35)}
.app-ia-icon{width:32px;height:32px;background:rgba(232,168,56,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}

.app-section{padding:12px 12px 16px}
.app-page-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:#F2F0E8;margin-bottom:2px}

.app-semana-row{display:flex;gap:5px;margin-bottom:10px}
.app-semana-btn{flex:1;padding:6px 4px;border-radius:10px;border:none;background:#1A2010;color:#9CA88E;font-size:10px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s}
.app-semana-active{background:#E8A838;color:#000}

.app-dias-row{display:flex;gap:5px;overflow-x:auto;padding-bottom:4px;margin-bottom:10px;scrollbar-width:none}
.app-dias-row::-webkit-scrollbar{display:none}
.app-dia-pill{flex-shrink:0;width:38px;height:52px;border-radius:14px;border:1px solid rgba(140,179,105,0.12);background:#111608;color:#5C6652;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
.app-dia-active{background:#E8A838;border-color:#E8A838;color:#000}
.app-dia-done{color:#9CA88E}

.app-dia-header{margin-bottom:8px}
.app-dia-tag{display:inline-block;font-size:10px;padding:2px 8px;border-radius:100px;background:rgba(232,168,56,0.1);color:#E8A838;border:1px solid rgba(232,168,56,0.2);margin-top:2px}

.app-ref-card{background:#111608;border:1px solid rgba(140,179,105,0.08);border-radius:12px;padding:10px;margin-bottom:6px;cursor:pointer;transition:border-color .2s}
.app-ref-card:hover{border-color:rgba(140,179,105,0.25)}
.app-ref-head{display:flex;align-items:center;gap:5px;margin-bottom:5px}
.app-ref-tipo{font-size:9px;font-weight:700;color:#5C6652;letter-spacing:.06em;text-transform:uppercase;flex:1}
.app-ref-hora{font-size:9px;color:#354030}

.app-checkin-card{background:#111608;border:1px solid rgba(140,179,105,0.1);border-radius:12px;padding:10px;cursor:pointer}
.app-checkin-btn{background:#E8A838;color:#000;border-radius:10px;padding:8px;font-size:10px;font-weight:800;text-align:center;font-family:'DM Sans',sans-serif;letter-spacing:.04em}

.app-days-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.app-day{aspect-ratio:1;border-radius:5px;background:#1A2010;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:600;color:#5C6652}
.app-day-today{background:rgba(232,168,56,0.15);border:1px solid rgba(232,168,56,0.3);color:#E8A838}

.app-chat-wrap{display:flex;flex-direction:column;height:100%}
.app-chat-hd{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#080D06;border-bottom:1px solid rgba(140,179,105,0.08)}
.app-chat-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#1A2010,#2A3A1A);border:1px solid rgba(140,179,105,0.2);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.app-chat-msgs{padding:10px 10px;display:flex;flex-direction:column;gap:6px;flex:1}
.app-chat-bot-msg{background:#1A2010;border-radius:0 10px 10px 10px;padding:8px 10px;font-size:10px;color:#D4D9CC;line-height:1.5;max-width:85%;border:1px solid rgba(140,179,105,0.08)}
.app-chat-user-msg{background:rgba(140,179,105,0.12);border-radius:10px 0 10px 10px;padding:8px 10px;font-size:10px;color:#A8D08D;line-height:1.5;max-width:75%;align-self:flex-end;border:1px solid rgba(140,179,105,0.15)}
.app-chat-blur-wrap{position:relative;display:flex;flex-direction:column;gap:6px;cursor:pointer}
.app-chat-lock-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(6,9,4,0.5);backdrop-filter:blur(2px);border-radius:8px}

.demo-paywall{position:absolute;inset:0;background:rgba(4,6,3,0.8);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;z-index:10;animation:s-msg-in .2s ease both}
.demo-pw-card{background:linear-gradient(160deg,#131A0A,#0C0F0A);border:1px solid rgba(140,179,105,0.22);border-radius:22px;padding:22px 18px;text-align:center;width:88%;max-width:250px;box-shadow:0 20px 60px rgba(0,0,0,0.5)}
.demo-pw-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:#F2F0E8;margin-bottom:5px}
.demo-pw-sub{font-size:11px;color:#9CA88E;line-height:1.55;margin-bottom:12px}
.demo-pw-price{margin-bottom:12px;display:flex;align-items:center;justify-content:center}
.demo-pw-perks{display:flex;flex-direction:column;gap:4px;margin-bottom:14px;text-align:left}
.demo-pw-perk{font-size:10px;color:#A8D08D;padding:3px 0}
.demo-pw-cta{width:100%;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#E8A838,#D4941A);color:#000;font-size:12px;font-weight:800;font-family:'DM Sans',sans-serif;cursor:pointer;margin-bottom:8px;transition:opacity .2s;box-shadow:0 4px 16px rgba(232,168,56,0.3)}
.demo-pw-cta:hover{opacity:.9}
.demo-pw-guarantee{font-size:10px;color:#5C6652;margin-bottom:8px}
.demo-pw-back{background:none;border:none;color:#5C6652;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif}
.demo-pw-back:hover{color:#9CA88E}

/* ── SELVA CHAT ── */
@keyframes s-fab-in{from{opacity:0;transform:translateY(16px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes s-chat-in{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:translateY(0)}}
@keyframes s-msg-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes s-dot-b{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}

.s-fab{position:fixed;bottom:28px;right:20px;display:flex;align-items:center;gap:8px;padding:11px 18px 11px 14px;border-radius:100px;border:1px solid rgba(140,179,105,0.3);background:rgba(13,18,9,0.97);backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 0 1px rgba(140,179,105,0.06);color:#F2F0E8;font-size:13.5px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;z-index:9999;animation:s-fab-in .55s cubic-bezier(.34,1.56,.64,1) both;transition:transform .2s,box-shadow .2s,border-color .2s;position:fixed}
.s-fab:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.55),0 0 0 1px rgba(140,179,105,0.18);border-color:rgba(140,179,105,0.45)}
.s-fab-icon{font-size:18px;line-height:1}
.s-fab-label{white-space:nowrap}
.s-fab-dot{position:absolute;top:-4px;right:-4px;width:11px;height:11px;border-radius:50%;background:#E85D4A;border:2px solid #0C0F0A;animation:blink 1.5s infinite}

.s-chat{position:fixed;bottom:0;right:0;width:100%;max-width:400px;height:500px;display:flex;flex-direction:column;background:#0B100A;border:1px solid rgba(140,179,105,0.18);border-bottom:none;border-radius:20px 20px 0 0;box-shadow:0 -12px 60px rgba(0,0,0,0.65);z-index:9999;animation:s-chat-in .35s cubic-bezier(.34,1.56,.64,1) both;overflow:hidden}

.s-hd{display:flex;align-items:center;gap:11px;padding:13px 15px;background:rgba(15,20,11,0.98);border-bottom:1px solid rgba(140,179,105,0.1);flex-shrink:0}
.s-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#162010,#243018);border:2px solid rgba(140,179,105,0.3);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
.s-meta{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
.s-nm{font-size:13.5px;font-weight:700;color:#F2F0E8}
.s-st{display:flex;align-items:center;gap:5px;font-size:11px;color:#8CB369}
.s-st-dot{width:6px;height:6px;border-radius:50%;background:#8CB369;flex-shrink:0;animation:blink 2.5s infinite}
.s-close{width:30px;height:30px;border-radius:50%;background:rgba(140,179,105,0.06);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s;flex-shrink:0}
.s-close:hover{background:rgba(140,179,105,0.13)}

.s-body{flex:1;overflow-y:auto;padding:14px 13px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(140,179,105,0.12) transparent}
.s-body::-webkit-scrollbar{width:3px}
.s-body::-webkit-scrollbar-thumb{background:rgba(140,179,105,0.18);border-radius:3px}

.s-group{display:flex;flex-direction:column;gap:7px}
.s-msg{max-width:84%;padding:10px 13px;font-size:13px;line-height:1.65;font-family:'DM Sans',sans-serif;animation:s-msg-in .22s ease both}
.s-bot{background:rgba(20,27,14,0.92);border:1px solid rgba(140,179,105,0.1);color:#CDD0C4;border-radius:4px 16px 16px 16px;align-self:flex-start}
.s-user{background:linear-gradient(135deg,#3A5C1A,#2D4914);color:#F2F0E8;border-radius:16px 4px 16px 16px;align-self:flex-end;border:1px solid rgba(140,179,105,0.18)}
.s-typing{display:flex;gap:5px;align-items:center;padding:12px 14px}
.s-dot{width:6px;height:6px;border-radius:50%;background:#8CB369;opacity:.4;animation:s-dot-b .85s ease infinite}
.s-dot:nth-child(2){animation-delay:.14s}.s-dot:nth-child(3){animation-delay:.28s}

.s-chips{display:flex;flex-wrap:wrap;gap:5px;padding-left:2px}
.s-chip{padding:5px 11px;border-radius:100px;background:rgba(140,179,105,0.05);border:1px solid rgba(140,179,105,0.18);color:#A8D08D;font-size:11.5px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .18s;white-space:nowrap}
.s-chip:hover{background:rgba(140,179,105,0.11);border-color:rgba(140,179,105,0.38);transform:translateY(-1px)}

.s-ft{display:flex;gap:8px;padding:10px 12px;background:rgba(15,20,11,0.98);border-top:1px solid rgba(140,179,105,0.08);flex-shrink:0}
.s-inp{flex:1;padding:9px 15px;border-radius:100px;border:1px solid rgba(140,179,105,0.13);background:rgba(8,12,6,0.9);color:#F2F0E8;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border .2s}
.s-inp:focus{border-color:rgba(140,179,105,0.38)}
.s-inp::placeholder{color:#354030}
.s-send{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#8CB369,#6B9B45);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.s-send:hover:not(:disabled){transform:scale(1.08);box-shadow:0 4px 16px rgba(140,179,105,0.28)}
.s-send:disabled{opacity:.3;cursor:default}
.s-cta{display:block;width:calc(100% - 4px);margin:6px 2px 2px;padding:11px 16px;border-radius:12px;background:linear-gradient(135deg,#E8A838,#D4941A);border:none;color:#000;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;text-align:center;transition:all .2s;box-shadow:0 4px 16px rgba(232,168,56,0.3)}
.s-cta:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(232,168,56,0.45)}

@media(max-width:440px){.s-chat{max-width:100%;border-radius:16px 16px 0 0}.s-fab{bottom:88px;right:16px}}

/* ── Open loop hint ── */
@keyframes ol-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.open-loop-hint{display:flex;align-items:center;gap:8px;margin-top:18px;padding:10px 16px;border-radius:100px;background:rgba(140,179,105,0.06);border:1px solid rgba(140,179,105,0.15);font-size:13px;font-weight:600;color:#A8D08D;animation:ol-in .35s ease both;justify-content:center}
.ol-dot{width:7px;height:7px;border-radius:50%;background:#8CB369;flex-shrink:0;animation:blink 1.4s infinite}

/* ── Analyzing personalized ── */
.analyzing-headline{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#F2F0E8;text-align:center;line-height:1.35;margin-bottom:8px}
.analyzing-photo-wrap{position:relative;margin:16px auto;max-width:320px;border-radius:16px;overflow:hidden}
.analyzing-photo{width:100%;max-height:220px;object-fit:cover;display:block;border-radius:16px;animation:fadeIn .5s ease}
.analyzing-photo-badge{position:absolute;top:12px;right:12px;background:rgba(232,168,56,0.92);color:#0A0E08;font-weight:800;font-size:14px;padding:5px 12px;border-radius:100px}
.analyzing-photo-name{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.7));padding:18px 14px 10px;font-size:13px;font-weight:600;color:#fff}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.analyzing-sub{font-size:14px;color:#9CA88E;text-align:center;margin-bottom:24px}
.analyzing-bullets{display:flex;flex-direction:column;gap:10px}
@keyframes ab-spin{to{transform:rotate(360deg)}}
.analyzing-bullet{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;border:1px solid rgba(140,179,105,0.08);background:rgba(12,16,9,0.7);transition:all .4s}
.ab-waiting{opacity:.35}
.ab-active{border-color:rgba(232,168,56,0.25);background:rgba(232,168,56,0.04)}
.ab-done{border-color:rgba(140,179,105,0.25);background:rgba(140,179,105,0.06)}
.ab-icon{width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0}
.ab-done .ab-icon{color:#8CB369}
.ab-active .ab-icon{color:#E8A838}
.ab-waiting .ab-icon{color:#354030}
.ab-spinner{width:12px;height:12px;border-radius:50%;border:2px solid rgba(232,168,56,0.2);border-top-color:#E8A838;display:inline-block;animation:ab-spin .7s linear infinite}
.ab-text{font-size:13px;color:#9CA88E;font-weight:500}
.ab-done .ab-text{color:#C8D4B8}

/* ── Diagnosis note ── */
.diag-note{display:flex;align-items:flex-start;gap:12px;background:rgba(140,179,105,0.05);border:1px solid rgba(140,179,105,0.18);border-left:3px solid #8CB369;border-radius:0 14px 14px 0;padding:14px 16px;margin-bottom:18px}

/* ── Medo Screen ── */
.medo-card{background:rgba(12,16,9,0.9);border:1px solid rgba(140,179,105,0.15);border-left:3px solid #8CB369;border-radius:0 16px 16px 0;padding:20px;margin-bottom:16px}
.medo-card-title{font-size:13px;font-weight:700;color:#F2F0E8;margin-bottom:10px}
.medo-card-body{font-size:14px;color:#9CA88E;line-height:1.7}
.medo-guarantee{display:flex;align-items:flex-start;gap:14px;background:rgba(140,179,105,0.05);border:1px solid rgba(140,179,105,0.18);border-radius:16px;padding:18px}

/* ── Testi Slider ── */
.tslider-wrap{margin:0 -4px}
.tslider-track{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:4px 4px 8px;-webkit-overflow-scrolling:touch}
.tslider-track::-webkit-scrollbar{display:none}
.tslider-card{flex:0 0 220px;scroll-snap-align:start;border-radius:14px;border:1px solid rgba(140,179,105,0.1);background:rgba(10,14,8,0.85);overflow:hidden}
.tslider-photo{width:100%;height:130px;object-fit:cover;object-position:top;display:block}
.tslider-body{padding:10px 12px 12px}
.tslider-stars{color:#E8A838;font-size:10px;letter-spacing:2px;margin-bottom:5px}
.tslider-text{font-size:11px;color:#9CA88E;line-height:1.55;font-style:italic;margin-bottom:8px}
.tslider-footer{display:flex;align-items:flex-end;justify-content:space-between;gap:6px}
.tslider-name{font-size:11px;font-weight:700;color:#F2F0E8;line-height:1.2}
.tslider-city{font-size:10px;color:#5C6652;margin-top:1px}
.tslider-result{font-size:10px;font-weight:700;color:#E8A838;white-space:nowrap;padding:2px 7px;border-radius:100px;background:rgba(232,168,56,0.08);border:1px solid rgba(232,168,56,0.18);flex-shrink:0}
.tslider-dots{display:flex;justify-content:center;gap:5px;margin-top:6px}
.tslider-dot{width:6px;height:6px;border-radius:50%;background:rgba(140,179,105,0.2);border:none;cursor:pointer;padding:0;transition:all .2s}
.tsd-active{background:#8CB369;width:18px;border-radius:3px}

/* ── Edu Unificada ── */
.edu-mechanism{display:flex;flex-direction:column;gap:14px;margin:0 0 16px}
.edu-mech-item{display:flex;gap:12px;align-items:flex-start;background:rgba(8,12,6,0.6);border:1px solid rgba(140,179,105,0.08);border-radius:12px;padding:12px 14px}
.edu-mech-item strong{display:block;font-size:13px;font-weight:700;color:#F2F0E8;margin-bottom:3px}
.edu-mech-item p{font-size:12px;color:#9CA88E;line-height:1.6;margin:0}
.edu-mech-icon{font-size:22px;flex-shrink:0;margin-top:1px}
.edu-provas{display:flex;flex-direction:column;gap:10px}
.edu-prova{background:rgba(8,12,6,0.7);border:1px solid rgba(140,179,105,0.1);border-radius:12px;padding:12px 14px}
.edu-prova-stars{color:#E8A838;font-size:12px;letter-spacing:2px;margin-bottom:6px}
.edu-prova-txt{font-size:12px;color:#9CA88E;line-height:1.6;font-style:italic;margin-bottom:8px}
.edu-prova-name{font-size:11px;font-weight:600;color:#F2F0E8}
.edu-prova-result{font-size:11px;font-weight:700;color:#E8A838;padding:2px 8px;background:rgba(232,168,56,0.08);border:1px solid rgba(232,168,56,0.2);border-radius:100px}

/* ── Gender screen ── */
.gen-wrap{padding-top:20px;max-width:480px;margin:0 auto}
.gen-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px}
.gen-card{display:flex;flex-direction:column;align-items:center;gap:0;border-radius:20px;border:1.5px solid rgba(140,179,105,0.12);background:rgba(18,24,14,0.85);overflow:hidden;transition:all .3s;cursor:pointer;padding:0}
.gen-card:hover{border-color:rgba(140,179,105,0.4);transform:translateY(-3px)}
.gen-card-img{width:100%;height:180px;object-fit:cover;object-position:top;display:block}
.gen-card-label{font-family:'DM Sans',sans-serif;font-size:18px;font-weight:700;color:#F2F0E8;padding:14px 0;width:100%;text-align:center;background:rgba(10,14,8,0.6)}

/* ── Age screen ── */
.age-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.age-card{display:flex;flex-direction:column;align-items:center;gap:0;border-radius:18px;border:1.5px solid rgba(140,179,105,0.1);background:rgba(18,24,14,0.85);overflow:hidden;transition:all .3s;cursor:pointer;padding:0}
.age-card:hover{border-color:rgba(140,179,105,0.4);transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.4)}
.age-card-img{width:100%;height:160px;object-fit:cover;object-position:top center;display:block}
.age-card-label{font-size:15px;font-weight:700;color:#F2F0E8;padding:12px 0;width:100%;text-align:center;font-family:'DM Sans',sans-serif}

/* ── Social proof screen ── */
.comunidade-img{width:100%;border-radius:16px;max-height:200px;object-fit:cover;margin-bottom:16px;display:block}
.sp-depo-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:4px}
.sp-depo-badge{padding:5px 12px;border-radius:100px;background:rgba(140,179,105,0.08);border:1px solid rgba(140,179,105,0.2);font-size:12px;font-weight:700;color:#A8D08D}

/* ── Authority screen ── */
/* ── News portal (AuthorityScreen) ── */
.news-portal-bar{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:2px solid rgba(140,179,105,0.2);margin-bottom:0}
.news-portal-logo{font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#F2F0E8;letter-spacing:-.02em}
.news-portal-section{font-size:10px;font-weight:700;letter-spacing:.08em;color:#5C6652;text-transform:uppercase}
.news-portal-date{font-size:11px;color:#5C6652}
.news-article-wrap{padding:0}
.news-tag-row{display:flex;align-items:center;gap:8px;margin:16px 0 10px}
.news-tag-cat{font-size:10px;font-weight:700;letter-spacing:.08em;color:#E8A838;text-transform:uppercase;border-left:3px solid #E8A838;padding-left:7px}
.news-tag-verified{font-size:10px;font-weight:700;color:#8CB369;background:rgba(140,179,105,0.1);padding:2px 8px;border-radius:100px}
.news-headline{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;line-height:1.3;color:#F2F0E8;margin-bottom:8px}
.news-byline{font-size:11px;color:#5C6652;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(140,179,105,0.08)}
.news-main-img{width:100%;border-radius:12px;object-fit:cover;object-position:top;max-height:280px;display:block;margin-bottom:6px}
.news-img-caption{font-size:11px;color:#5C6652;font-style:italic;margin-bottom:14px;text-align:center}
.news-lead{font-size:15px;color:#D4D9CC;line-height:1.7;margin-bottom:14px;font-weight:500}
.news-quote{margin:14px 0;padding:12px 16px;border-left:3px solid #E8A838;background:rgba(232,168,56,0.05);border-radius:0 10px 10px 0;font-size:14px;color:#C8D4B8;font-style:italic;line-height:1.65}
.news-quote cite{display:block;margin-top:8px;font-style:normal;font-size:12px;font-weight:700;color:#E8A838}
.news-body{font-size:14px;color:#9CA88E;line-height:1.7;margin-bottom:16px}
.news-stats-row{display:flex;align-items:center;justify-content:center;gap:16px;padding:16px;background:rgba(140,179,105,0.05);border:1px solid rgba(140,179,105,0.12);border-radius:14px;margin-top:4px}
.news-stat{text-align:center}
.news-stat-num{display:block;font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:#E8A838}
.news-stat-lbl{font-size:11px;color:#5C6652}
.news-stat-div{width:1px;height:32px;background:rgba(140,179,105,0.15)}
/* auth legacy kept for any residual refs */
.auth-news-card{border-radius:18px;border:1px solid rgba(140,179,105,0.15);background:rgba(10,14,8,0.9);overflow:hidden}
.auth-news-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid rgba(140,179,105,0.08)}
.auth-news-tag{font-size:10px;font-weight:700;color:#8CB369;letter-spacing:.05em;text-transform:uppercase}
.auth-news-date{font-size:10px;color:#354030}
.auth-news-body{display:flex;gap:12px;padding:14px}
.auth-news-img{width:90px;height:90px;border-radius:10px;object-fit:cover;object-position:top;flex-shrink:0}
.auth-news-text p{font-size:13px;color:#C8D4B8;line-height:1.55;font-style:italic}
.auth-stats-row{display:flex;align-items:center;justify-content:center;gap:16px;padding:12px 14px;border-top:1px solid rgba(140,179,105,0.08)}
.auth-stat{text-align:center}
.auth-stat-num{display:block;font-family:'Playfair Display',serif;font-size:20px;font-weight:800;color:#E8A838}
.auth-stat-lbl{font-size:11px;color:#5C6652}
.auth-stat-div{width:1px;height:28px;background:rgba(140,179,105,0.1)}

/* ── Mechanism screen ── */
.mech-card{border-radius:16px;border:1px solid rgba(140,179,105,0.12);background:rgba(18,24,14,0.85);padding:18px;margin-bottom:14px}
.mech-card-badge{font-size:11px;font-weight:700;color:#E8A838;letter-spacing:.05em;text-transform:uppercase;margin-bottom:10px}
.mech-card-body{font-size:14px;color:#C8D4B8;line-height:1.65}
.mech-compare{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.mech-compare-col{border-radius:14px;padding:14px;font-size:13px;color:#9CA88E;line-height:1.7}
.mech-bad{background:rgba(232,85,74,0.06);border:1px solid rgba(232,85,74,0.15)}
.mech-good{background:rgba(140,179,105,0.06);border:1px solid rgba(140,179,105,0.15)}
.mech-compare-head{font-weight:700;font-size:13px;color:#F2F0E8;margin-bottom:6px}
.mech-solucao{padding:14px 16px;border-radius:14px;background:rgba(140,179,105,0.05);border-left:3px solid #8CB369}
`;

