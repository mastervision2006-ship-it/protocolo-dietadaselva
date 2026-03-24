"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   PROTOCOLO DIETA DA SELVA v2.0 — FUNIL QUIZ IMERSIVO
   Público: Mulheres 30+ | R$27 | Garantia 7 dias
   ═══════════════════════════════════════════════════════════ */

const CHECKOUT_URL = "https://SEU-CHECKOUT-GG.com/protocolo-dieta-da-selva";

/* ── SCREENS FLOW ──
  1. landing
  2. name        → Pega nome
  3. quiz (8 perguntas)
  4. body-data   → Peso, altura, meta
  5. edu-glp1    → Tela educacional GLP-1
  6. edu-science → Tela ciência da saciedade
  7. social-proof → Tela prova social pesada
  8. analyzing   → Loading
  9. diagnosis   → Diagnóstico personalizado
  10. result     → Oferta final + CTA
*/

const QUIZ_QUESTIONS = [
  {
    id: "goal",
    question: "{{name}}, qual é o seu principal objetivo hoje?",
    subtitle: "Escolha o que mais te representa neste momento",
    options: [
      { text: "Perder peso de forma definitiva", emoji: "🔥", value: "peso" },
      { text: "Desinchar e me sentir leve", emoji: "✨", value: "desinchar" },
      { text: "Ter mais energia e disposição", emoji: "⚡", value: "energia" },
      { text: "Todas as anteriores", emoji: "💎", value: "todas" },
    ],
  },
  {
    id: "age",
    question: "Qual a sua faixa de idade?",
    subtitle: "Isso nos ajuda a calibrar seu protocolo, {{name}}",
    options: [
      { text: "25 a 34 anos", emoji: "🌸", value: "25-34" },
      { text: "35 a 44 anos", emoji: "🌺", value: "35-44" },
      { text: "45 a 54 anos", emoji: "🌹", value: "45-54" },
      { text: "55 anos ou mais", emoji: "💐", value: "55+" },
    ],
  },
  {
    id: "frustration",
    question: "{{name}}, qual dessas situações mais te frustra?",
    subtitle: "Seja honesta consigo mesma — isso é importante",
    options: [
      { text: "Já tentei várias dietas e nada funciona", emoji: "😞", value: "dietas" },
      { text: "Perco peso mas sempre volto a engordar", emoji: "🔄", value: "sanfona" },
      { text: "Sinto fome o tempo todo nas dietas", emoji: "😫", value: "fome" },
      { text: "Não tenho tempo para dietas complicadas", emoji: "⏰", value: "tempo" },
    ],
  },
  {
    id: "meals",
    question: "Como é sua alimentação hoje?",
    subtitle: "Não se preocupe, aqui não tem julgamento",
    options: [
      { text: "Como muito pão, massa e doces", emoji: "🍞", value: "carboidratos" },
      { text: "Pulo refeições com frequência", emoji: "⏭️", value: "pula" },
      { text: "Tento comer saudável mas não consigo manter", emoji: "🥗", value: "tenta" },
      { text: "Como de tudo sem controle", emoji: "🍕", value: "descontrole" },
    ],
  },
  {
    id: "symptoms",
    question: "Você sente algum desses sintomas, {{name}}?",
    subtitle: "Esses sinais podem estar ligados à sua alimentação",
    options: [
      { text: "Inchaço abdominal constante", emoji: "🎈", value: "inchaço" },
      { text: "Cansaço e falta de energia", emoji: "😴", value: "cansaço" },
      { text: "Ansiedade e compulsão alimentar", emoji: "🧠", value: "ansiedade" },
      { text: "Dores articulares e inflamação", emoji: "🦴", value: "inflamação" },
    ],
  },
  {
    id: "knowledge",
    question: "Você já ouviu falar da Dieta da Selva?",
    subtitle: "O método que fez o chef Fogaça perder 17kg em 3 meses",
    options: [
      { text: "Sim! Quero começar logo", emoji: "🙋‍♀️", value: "sim-quer" },
      { text: "Sim, mas não sei como fazer direito", emoji: "🤔", value: "sim-duvida" },
      { text: "Já ouvi falar mas nunca pesquisei", emoji: "👀", value: "ouviu" },
      { text: "Não, é a primeira vez", emoji: "🆕", value: "nao" },
    ],
  },
  {
    id: "commitment",
    question: "Se existisse um método simples e gostoso para emagrecer...",
    subtitle: "Imagine comer o que ama e ainda perder peso, {{name}}",
    options: [
      { text: "Eu começaria HOJE mesmo", emoji: "🚀", value: "hoje" },
      { text: "Eu tentaria se fosse fácil de seguir", emoji: "👍", value: "tentaria" },
      { text: "Preciso saber mais antes", emoji: "📖", value: "saber" },
      { text: "Estou cansada de promessas", emoji: "😒", value: "descrente" },
    ],
  },
  {
    id: "ready",
    question: "{{name}}, você está pronta para mudar sua relação com a comida?",
    subtitle: "Esta é a pergunta mais importante do quiz",
    options: [
      { text: "SIM! Estou pronta para mudar", emoji: "💪", value: "pronta" },
      { text: "Sim, se o método for comprovado", emoji: "✅", value: "comprovado" },
      { text: "Tenho medo de falhar de novo", emoji: "🥺", value: "medo" },
      { text: "Quero ver meu resultado primeiro", emoji: "📊", value: "resultado" },
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
   MAIN COMPONENT
   ══════════════════════ */
export default function Quiz() {
  const [screen, setScreen] = useState("landing");
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [bodyData, setBodyData] = useState({ weight:"", height:"", goal:"" });
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const formRef = useRef(null);

  const t = useCallback((cb) => {
    setFadeIn(false);
    setTimeout(() => { cb(); setFadeIn(true); }, 380);
  }, []);

  const n = (text) => text.replace(/\{\{name\}\}/g, userName || "");

  const handleName = () => {
    if (nameInput.trim().length >= 2) {
      const first = nameInput.trim().split(" ")[0];
      const capitalized = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
      setUserName(capitalized);
      t(() => setScreen("quiz"));
    }
  };

  const handleAnswer = (qId, val) => {
    setSelectedOpt(val);
    setTimeout(() => {
      setAnswers(p => ({ ...p, [qId]: val }));
      setSelectedOpt(null);
      if (currentQ < QUIZ_QUESTIONS.length - 1) {
        t(() => setCurrentQ(q => q + 1));
      } else {
        t(() => setScreen("body-data"));
      }
    }, 500);
  };

  const handleBodySubmit = () => {
    if (bodyData.weight && bodyData.height && bodyData.goal) {
      t(() => setScreen("edu-glp1"));
    }
  };

  const goNext = (next) => () => t(() => setScreen(next));

  const startAnalysis = () => {
    t(() => {
      setScreen("analyzing");
      let p = 0;
      const steps = [
        {to:18,d:45},{to:35,d:55},{to:52,d:35},{to:70,d:65},{to:88,d:40},{to:100,d:50}
      ];
      let si = 0;
      const run = () => {
        if (si >= steps.length) { setTimeout(() => t(() => setScreen("diagnosis")), 700); return; }
        const {to,d} = steps[si];
        const iv = setInterval(() => {
          p++;
          setAnalysisProgress(p);
          if (p >= to) { clearInterval(iv); si++; setTimeout(run, 250); }
        }, d);
      };
      run();
    });
  };

  const bmi = bodyData.weight && bodyData.height ? (
    parseFloat(bodyData.weight) / ((parseFloat(bodyData.height)/100) ** 2)
  ).toFixed(1) : 0;

  const weightToLose = bodyData.weight && bodyData.goal ? Math.max(0, parseFloat(bodyData.weight) - parseFloat(bodyData.goal)) : 0;

  const timeWeeks = Math.max(3, Math.ceil(weightToLose / 1.2));

  const progress = screen === "quiz" ? ((currentQ + 1) / QUIZ_QUESTIONS.length) * 100 :
                   screen === "body-data" ? 100 : 0;

  const getBmiCategory = (v) => {
    const b = parseFloat(v);
    if (b < 18.5) return { label:"Abaixo do peso", color:"#60A5FA" };
    if (b < 25) return { label:"Peso normal", color:"#8CB369" };
    if (b < 30) return { label:"Sobrepeso", color:"#E8A838" };
    if (b < 35) return { label:"Obesidade grau I", color:"#E85D4A" };
    return { label:"Obesidade grau II+", color:"#DC2626" };
  };

  const frustrationText = {
    dietas: "que já tentou diversas dietas sem sucesso duradouro",
    sanfona: "que sofre com o efeito sanfona e não consegue manter o peso",
    fome: "que sente fome constante em qualquer dieta restritiva",
    tempo: "que não tem tempo para dietas complicadas",
  };

  return (
    <div style={S.page}>
      <div style={S.grain} />
      <div style={S.glow1} />
      <div style={S.glow2} />
      <div style={{...S.container, opacity: fadeIn?1:0, transform: fadeIn?"translateY(0)":"translateY(14px)", transition:"all 0.4s ease"}}>
        {screen === "landing" && <Landing onStart={goNext("name")} />}
        {screen === "name" && <NameScreen value={nameInput} onChange={setNameInput} onSubmit={handleName} />}
        {screen === "quiz" && <QuizScreen q={QUIZ_QUESTIONS[currentQ]} progress={progress} cur={currentQ} total={QUIZ_QUESTIONS.length} onAnswer={handleAnswer} sel={selectedOpt} n={n} />}
        {screen === "body-data" && <BodyDataScreen data={bodyData} onChange={setBodyData} onSubmit={handleBodySubmit} name={userName} />}
        {screen === "edu-glp1" && <EduGLP1 name={userName} onNext={goNext("edu-science")} />}
        {screen === "edu-science" && <EduScience name={userName} onNext={goNext("social-proof")} />}
        {screen === "social-proof" && <SocialProof name={userName} onNext={startAnalysis} />}
        {screen === "analyzing" && <Analyzing progress={analysisProgress} name={userName} />}
        {screen === "diagnosis" && <Diagnosis name={userName} bmi={bmi} bmiCat={getBmiCategory(bmi)} weightToLose={weightToLose} timeWeeks={timeWeeks} answers={answers} frustrationText={frustrationText} onNext={goNext("result")} />}
        {screen === "result" && <Result name={userName} weightToLose={weightToLose} timeWeeks={timeWeeks} bmi={bmi} bmiCat={getBmiCategory(bmi)} />}
      </div>
      {screen === "result" && <SelvaChat name={userName} />}
      <style>{CSS}</style>
    </div>
  );
}

/* ══════════════════════
   APP DEMO — Interactive Preview
   ══════════════════════ */
const DEMO_RECEITAS = [
  {emoji:'🥚',nome:'Ovos mexidos com bacon',tag:'Café da manhã',tempo:'10 min'},
  {emoji:'🥩',nome:'Picanha grelhada com manteiga',tag:'Almoço',tempo:'20 min'},
  {emoji:'🍗',nome:'Frango na manteiga',tag:'Jantar',tempo:'25 min'},
  {emoji:'🐟',nome:'Salmão com ervas frescas',tag:'Jantar',tempo:'20 min'},
  {emoji:'🧀',nome:'Omelete de queijo cremoso',tag:'Café da manhã',tempo:'8 min'},
  {emoji:'🦴',nome:'Costela na Laje — Exclusiva',tag:'Exclusiva',tempo:'3h',exclusiva:true},
];
const DEMO_TREINOS = [
  {dia:1,titulo:'Ativação de Glúteos',tempo:'15 min',nivel:'Iniciante',emoji:'🍑'},
  {dia:2,titulo:'Core e Abdômen',tempo:'12 min',nivel:'Iniciante',emoji:'💪'},
  {dia:3,titulo:'Descanso Ativo',tempo:'20 min',nivel:'Leve',emoji:'🧘'},
  {dia:4,titulo:'Membros Inferiores',tempo:'18 min',nivel:'Moderado',emoji:'🦵'},
  {dia:5,titulo:'Corpo Inteiro HIIT',tempo:'15 min',nivel:'Intenso',emoji:'🔥'},
  {dia:6,titulo:'Força + Resistência',tempo:'20 min',nivel:'Moderado',emoji:'⚡'},
];

function AppDemo({ onComprar }) {
  const [tab, setTab]           = useState('inicio');
  const [locked, setLocked]     = useState(false);
  const [lockedItem, setLockedItem] = useState('');

  function tryAccess(item) { setLockedItem(item); setLocked(true); }

  return (
    <div className="demo-wrap">
      <p className="demo-headline">📱 Explore o app antes de comprar</p>
      <p className="demo-sub">Toque nas receitas, treinos e seções para ver o que está te esperando</p>

      <div className="phone-frame">
        {/* notch */}
        <div className="phone-notch"><div className="phone-camera"/></div>

        {/* scrollable content */}
        <div className="phone-body">

          {tab==='inicio' && (
            <div className="app-home">
              <div className="app-top-bar">
                <div><p className="app-greeting">Bem-vinda,</p><p className="app-name-txt">Você 👋</p></div>
                <div className="app-av">🌿</div>
              </div>
              <div className="app-card" onClick={()=>tryAccess('Progresso do Protocolo')}>
                <p className="app-lbl">MEU PROTOCOLO</p>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'6px'}}>
                  <span style={{fontSize:'24px',fontWeight:'800',color:'#F2F0E8'}}>0%</span>
                  <span style={{fontSize:'11px',color:'#9CA88E'}}>Dia 1/21</span>
                </div>
                <div className="app-bar"><div className="app-bar-fill" style={{width:'4%'}}/></div>
                <div className="app-stats-row">
                  {[['Perdeu','-0kg'],['Meta','Emagrecer'],['Dias','21']].map(([l,v],i)=>(
                    <div key={i} className="app-stat"><span className="app-stat-l">{l}</span><strong className="app-stat-v">{v}</strong></div>
                  ))}
                </div>
              </div>
              <p className="app-lbl" style={{marginTop:'12px',marginBottom:'6px'}}>PRÓXIMA REFEIÇÃO</p>
              <div className="app-meal" onClick={()=>tryAccess('Plano Alimentar Completo')}>
                <div className="app-meal-icon">🥩</div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:'10px',color:'#E8A838',fontWeight:'600',marginBottom:'2px'}}>Café da manhã</p>
                  <p style={{fontSize:'12px',fontWeight:'700',color:'#F2F0E8',marginBottom:'1px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Ovos mexidos com bacon</p>
                  <p style={{fontSize:'10px',color:'#9CA88E'}}>420 kcal · 28g proteína</p>
                </div>
                <span style={{color:'#E8A838',fontSize:'18px'}}>›</span>
              </div>
              <p className="app-lbl" style={{marginTop:'12px',marginBottom:'6px'}}>DICA DO DIA</p>
              <div className="app-tip" onClick={()=>tryAccess('Dicas Diárias')}>
                <span style={{fontSize:'18px'}}>💧</span>
                <p style={{fontSize:'11px',color:'#9CA88E',lineHeight:'1.5',flex:1}}>Beba pelo menos 2,5L de água hoje. A hidratação acelera a queima de gordura...</p>
              </div>
            </div>
          )}

          {tab==='receitas' && (
            <div className="app-section">
              <p className="app-page-title">Receitas</p>
              {DEMO_RECEITAS.map((r,i)=>(
                <div key={i} className={`app-recipe ${r.exclusiva?'app-recipe-ex':''}`} onClick={()=>tryAccess(r.nome)}>
                  <span className="app-recipe-em">{r.emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:'12px',fontWeight:'600',color:r.exclusiva?'#E8A838':'#F2F0E8',marginBottom:'2px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.nome}</p>
                    <p style={{fontSize:'10px',color:'#9CA88E'}}>{r.tag} · {r.tempo}</p>
                  </div>
                  <span style={{fontSize:'14px',opacity:.5}}>🔒</span>
                </div>
              ))}
            </div>
          )}

          {tab==='treinos' && (
            <div className="app-section">
              <p className="app-page-title">Treinos 21 Dias</p>
              {DEMO_TREINOS.map((t,i)=>(
                <div key={i} className="app-treino" onClick={()=>tryAccess(`Treino Dia ${t.dia} — ${t.titulo}`)}>
                  <div className="app-treino-em">{t.emoji}</div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:'12px',fontWeight:'600',color:'#F2F0E8',marginBottom:'2px'}}>Dia {t.dia} — {t.titulo}</p>
                    <p style={{fontSize:'10px',color:'#9CA88E'}}>{t.tempo}</p>
                  </div>
                  <span className={`app-nivel nivel-${i}`}>{t.nivel}</span>
                </div>
              ))}
            </div>
          )}

          {tab==='desafio' && (
            <div className="app-section">
              <p className="app-page-title">Desafio 21 Dias</p>
              <div className="app-card" style={{marginBottom:'10px'}} onClick={()=>tryAccess('Desafio 21 Dias')}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
                  <div><p style={{fontSize:'24px',fontWeight:'800',color:'#F2F0E8'}}>0%</p><p style={{fontSize:'10px',color:'#9CA88E'}}>concluído</p></div>
                  <div style={{textAlign:'right'}}><p style={{fontSize:'20px',fontWeight:'700',color:'#E8A838'}}>🔥 0</p><p style={{fontSize:'10px',color:'#9CA88E'}}>dias seguidos</p></div>
                </div>
                <div className="app-days-grid">
                  {Array.from({length:21},(_,i)=>(
                    <div key={i} className={`app-day ${i===0?'app-day-today':''}`}>{i===0?'●':i+1}</div>
                  ))}
                </div>
              </div>
              <div className="app-meal" onClick={()=>tryAccess('Check-in do Dia')}>
                <span style={{fontSize:'20px'}}>📋</span>
                <div>
                  <p style={{fontSize:'12px',fontWeight:'600',color:'#F2F0E8'}}>Check-in — Dia 1</p>
                  <p style={{fontSize:'10px',color:'#9CA88E'}}>Marque quando concluir o cardápio de hoje</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* bottom nav */}
        <div className="phone-nav">
          {[
            {id:'inicio',icon:'🏠',label:'Início'},
            {id:'receitas',icon:'🥩',label:'Receitas'},
            {id:'treinos',icon:'🏋️',label:'Treinos'},
            {id:'desafio',icon:'🏆',label:'Desafio'},
          ].map(n=>(
            <button key={n.id} className={`pnav-btn ${tab===n.id?'pnav-active':''}`} onClick={()=>setTab(n.id)}>
              <span style={{fontSize:'16px'}}>{n.icon}</span>
              <span className="pnav-label">{n.label}</span>
            </button>
          ))}
        </div>

        {/* paywall */}
        {locked && (
          <div className="demo-paywall" onClick={()=>setLocked(false)}>
            <div className="demo-pw-card" onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:'32px',marginBottom:'6px'}}>🔒</div>
              <p className="demo-pw-title">Conteúdo Exclusivo</p>
              <p className="demo-pw-sub">"{lockedItem}" está disponível para membros do Protocolo Dieta da Selva</p>
              <button className="demo-pw-cta" onClick={()=>{ setLocked(false); onComprar(); }}>
                GARANTIR ACESSO POR R$27 →
              </button>
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
  // Pagamento / PIX
  {
    triggers: ['pagar','pagamento','pix','cartao','cartão','boleto','parcelar','parcelamento','como pago','forma de pagamento'],
    text: `O pagamento é 100% via PIX. 💳\n\n✅ Confirmação em menos de 30 segundos\n✅ Acesso liberado imediatamente\n✅ Sem dados de cartão — sem risco\n✅ Você vê tudo no app do seu banco\n\nÉ só gerar o QR Code aqui, abrir o app do banco e pagar. Simples assim.`,
    suggestions: ['Como acesso depois?','E a garantia?','Quero garantir agora'],
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
   1. LANDING
   ══════════════════════ */
function Landing({ onStart }) {
  return (
    <div style={{textAlign:"center",paddingTop:"36px"}}>
      <div className="badge">🌿 PROTOCOLO VALIDADO POR +10.000 MULHERES</div>
      <h1 className="hero-title">Descubra como mulheres <span className="hl">acima de 30</span> estão perdendo até <span className="hl-accent">17kg em 3 meses</span> comendo <span className="hl">carnes, queijos e ovos</span></h1>
      <p className="hero-sub">O mesmo método que transformou o corpo do chef Henrique Fogaça — agora adaptado para a realidade da mulher brasileira, com um app exclusivo que guia você dia a dia.</p>
      <div className="proof-row">
        <div className="proof-item"><span className="proof-num">17kg</span><span className="proof-lbl">eliminados por Fogaça</span></div>
        <div className="proof-div" />
        <div className="proof-item"><span className="proof-num">3 meses</span><span className="proof-lbl">para resultados</span></div>
        <div className="proof-div" />
        <div className="proof-item"><span className="proof-num">0</span><span className="proof-lbl">fome ou sofrimento</span></div>
      </div>
      <button className="cta" onClick={onStart}>Fazer minha análise gratuita →</button>
      <p className="micro">⏱️ Leva 2 minutos • 100% gratuito • Resultado personalizado</p>
      <div className="faces-row">
        {["M","C","P","A","R"].map((l,i)=>(<div key={i} className="face">{l}</div>))}
        <span className="faces-txt">+2.847 mulheres fizeram o quiz hoje</span>
      </div>
    </div>
  );
}

/* ══════════════════════
   2. NAME SCREEN
   ══════════════════════ */
function NameScreen({ value, onChange, onSubmit }) {
  return (
    <div style={{textAlign:"center",paddingTop:"60px",maxWidth:"440px",margin:"0 auto"}}>
      <div style={{fontSize:"48px",marginBottom:"20px"}}>🌿</div>
      <h2 className="screen-title">Antes de começarmos...</h2>
      <p className="screen-sub">Como você gostaria de ser chamada?</p>
      <input
        type="text" placeholder="Seu primeiro nome" value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSubmit()}
        className="name-input"
        autoFocus
      />
      <button className="cta" onClick={onSubmit} style={{marginTop:"16px",width:"100%"}} disabled={value.trim().length < 2}>
        Continuar →
      </button>
      <p className="micro" style={{marginTop:"12px"}}>🔒 Seu nome é usado apenas para personalizar sua experiência</p>
    </div>
  );
}

/* ══════════════════════
   3. QUIZ SCREEN
   ══════════════════════ */
function QuizScreen({ q, progress, cur, total, onAnswer, sel, n }) {
  return (
    <div style={{paddingTop:"16px"}}>
      <div className="progress-wrap">
        <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}} /></div>
        <span className="progress-txt">{cur+1}/{total}</span>
      </div>
      <div style={{textAlign:"center",marginBottom:"28px"}}>
        <h2 className="question">{n(q.question)}</h2>
        <p className="question-sub">{n(q.subtitle)}</p>
      </div>
      <div className="options">
        {q.options.map(o=>(
          <button key={o.value} className={`option ${sel===o.value?"option-sel":""}`} onClick={()=>onAnswer(q.id,o.value)} disabled={sel!==null}>
            <span className="opt-emoji">{o.emoji}</span>
            <span className="opt-text">{o.text}</span>
            <span className="opt-check">✓</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════
   4. BODY DATA
   ══════════════════════ */
function BodyDataScreen({ data, onChange, onSubmit, name }) {
  const set = (k,v) => onChange({...data,[k]:v});
  const valid = data.weight && data.height && data.goal;
  return (
    <div style={{paddingTop:"32px",maxWidth:"460px",margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:"28px"}}>
        <div style={{fontSize:"36px",marginBottom:"12px"}}>📊</div>
        <h2 className="screen-title">{name}, agora vamos personalizar</h2>
        <p className="screen-sub">Esses dados nos permitem criar um diagnóstico exclusivo para o seu corpo</p>
      </div>
      <div className="input-group">
        <label className="label">Peso atual (kg)</label>
        <input type="number" placeholder="Ex: 78" value={data.weight} onChange={e=>set("weight",e.target.value)} className="field" />
      </div>
      <div className="input-group">
        <label className="label">Altura (cm)</label>
        <input type="number" placeholder="Ex: 165" value={data.height} onChange={e=>set("height",e.target.value)} className="field" />
      </div>
      <div className="input-group">
        <label className="label">Peso desejado (kg)</label>
        <input type="number" placeholder="Ex: 65" value={data.goal} onChange={e=>set("goal",e.target.value)} className="field" />
      </div>
      <button className="cta" onClick={onSubmit} style={{width:"100%",marginTop:"8px"}} disabled={!valid}>
        Analisar meu perfil →
      </button>
      <p className="micro" style={{marginTop:"12px"}}>🔒 Seus dados são confidenciais e não serão compartilhados</p>
    </div>
  );
}

/* ══════════════════════
   5. EDU GLP-1
   ══════════════════════ */
function EduGLP1({ name, onNext }) {
  return (
    <div style={{paddingTop:"32px"}}>
      <div className="edu-card">
        <div className="edu-badge">🧬 CIÊNCIA POR TRÁS DO PROTOCOLO</div>
        <h2 className="edu-title">{name}, você sabia que seu corpo produz um "Ozempic natural"?</h2>
        <div className="edu-body">
          <p>Existe um hormônio chamado <strong style={{color:"#A8D08D"}}>GLP-1</strong> que é produzido naturalmente pelo seu intestino. Ele é <strong>o mesmo hormônio que o Ozempic e a Semaglutida imitam</strong> — aqueles medicamentos que custam milhares de reais.</p>
          <p>O GLP-1 faz 3 coisas poderosas no seu corpo:</p>
          <div className="edu-list">
            <div className="edu-item"><span className="edu-icon">🎯</span><div><strong>Elimina a fome</strong><br/><span className="dim">Envia sinais de saciedade para o cérebro — você se sente satisfeita por horas</span></div></div>
            <div className="edu-item"><span className="edu-icon">🔥</span><div><strong>Ativa a queima de gordura</strong><br/><span className="dim">Reduz insulina e força o corpo a usar gordura como combustível</span></div></div>
            <div className="edu-item"><span className="edu-icon">⚡</span><div><strong>Estabiliza sua energia</strong><br/><span className="dim">Acaba com os picos e quedas de açúcar que causam cansaço e compulsão</span></div></div>
          </div>
          <div className="edu-highlight">
            <p>💡 <strong>A grande descoberta:</strong> Estudos mostram que dietas ricas em <strong>proteínas e gorduras boas</strong> — como carnes, ovos, queijos — <strong>aumentam naturalmente a produção de GLP-1</strong>, gerando saciedade sem precisar de medicamentos.</p>
          </div>
          <p style={{fontSize:"14px",color:"#9CA88E",textAlign:"center"}}>É exatamente isso que o Protocolo Dieta da Selva faz no seu corpo.</p>
        </div>
      </div>
      <button className="cta" onClick={onNext} style={{width:"100%",marginTop:"20px"}}>Entendi! Continuar →</button>
    </div>
  );
}

/* ══════════════════════
   6. EDU SCIENCE
   ══════════════════════ */
function EduScience({ name, onNext }) {
  return (
    <div style={{paddingTop:"32px"}}>
      <div className="edu-card">
        <div className="edu-badge">🥩 POR QUE A DIETA DA SELVA FUNCIONA</div>
        <h2 className="edu-title">{name}, entenda por que você vai emagrecer comendo comidas que ama</h2>
        <div className="edu-body">
          <p>Nas dietas tradicionais, você corta calorias e passa fome. O resultado? Seu corpo <strong style={{color:"#E85D4A"}}>diminui o metabolismo</strong>, você fica irritada, ansiosa e desiste em semanas.</p>
          <p>O Protocolo Dieta da Selva funciona ao contrário:</p>
          <div className="edu-compare">
            <div className="edu-compare-col edu-bad">
              <div className="compare-header">❌ Dietas comuns</div>
              <div className="compare-item">Cortam calorias drasticamente</div>
              <div className="compare-item">Causam fome constante</div>
              <div className="compare-item">Grelina (hormônio da fome) dispara</div>
              <div className="compare-item">Metabolismo desacelera</div>
              <div className="compare-item">Efeito sanfona garantido</div>
            </div>
            <div className="edu-compare-col edu-good">
              <div className="compare-header">✅ Dieta da Selva</div>
              <div className="compare-item">Alimenta o corpo com proteínas e gorduras</div>
              <div className="compare-item">GLP-1 gera saciedade natural</div>
              <div className="compare-item">Grelina controlada automaticamente</div>
              <div className="compare-item">Metabolismo acelerado pela proteína</div>
              <div className="compare-item">Perda de peso sustentável</div>
            </div>
          </div>
          <div className="edu-quote">
            <p>"Emagreci 17kg nos últimos três meses fazendo a dieta da selva. Cortei praticamente todo o carboidrato e incluí mais gordura animal."</p>
            <span className="edu-quote-author">— Chef Henrique Fogaça, jurado do MasterChef</span>
          </div>
        </div>
      </div>
      <button className="cta" onClick={onNext} style={{width:"100%",marginTop:"20px"}}>Quero ver as provas →</button>
    </div>
  );
}

/* ══════════════════════
   7. SOCIAL PROOF
   ══════════════════════ */
function SocialProof({ name, onNext }) {
  return (
    <div style={{paddingTop:"32px"}}>
      <div style={{textAlign:"center",marginBottom:"24px"}}>
        <h2 className="screen-title">{name}, veja o que mulheres reais estão dizendo</h2>
        <p className="screen-sub">Resultados de mulheres que seguiram o Protocolo Dieta da Selva</p>
      </div>
      <div className="testimonials">
        {TESTIMONIALS.map((t,i)=>(
          <div key={i} className="testi-card">
            {t.img && <img src={t.img} alt={`Resultado ${t.name}`} className="testi-img" />}
            <div className="testi-stars">{"★★★★★"}</div>
            <p className="testi-text">"{t.text}"</p>
            <div className="testi-footer">
              <div className="testi-avatar">{t.name.charAt(0)}</div>
              <div>
                <div className="testi-name">{t.name} — {t.age} anos</div>
                <div className="testi-city">{t.city}</div>
              </div>
              <div className="testi-result">{t.result}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="social-counter">
        <div className="counter-dot" />
        <span>3.847 mulheres já começaram o protocolo este mês</span>
      </div>
      <button className="cta" onClick={onNext} style={{width:"100%",marginTop:"20px"}}>Ver meu diagnóstico personalizado →</button>
    </div>
  );
}

/* ══════════════════════
   8. ANALYZING
   ══════════════════════ */
function Analyzing({ progress, name }) {
  const steps = [
    {l:`Analisando perfil metabólico de ${name}...`,t:0},
    {l:"Calculando taxa de queima de gordura...",t:20},
    {l:"Estimando produção natural de GLP-1...",t:40},
    {l:"Avaliando compatibilidade com o protocolo...",t:60},
    {l:"Gerando diagnóstico personalizado...",t:80},
    {l:"Finalizando...",t:95},
  ];
  const cur = [...steps].reverse().find(s=>progress>=s.t);
  return (
    <div style={{textAlign:"center",paddingTop:"80px"}}>
      <div className="pulse-wrap">
        <div className="pulse-ring" /><div className="pulse-ring pulse-ring-2" />
        <span style={{fontSize:"40px",position:"relative",zIndex:2}}>🧬</span>
      </div>
      <h2 className="screen-title" style={{marginTop:"28px"}}>Analisando suas respostas...</h2>
      <p style={{color:"#A8D08D",fontSize:"14px",minHeight:"20px",marginBottom:"24px"}}>{cur?.l}</p>
      <div className="analysis-bar-wrap">
        <div className="analysis-bar"><div className="analysis-fill" style={{width:`${progress}%`}} /></div>
        <span className="analysis-pct">{progress}%</span>
      </div>
      <p className="micro" style={{marginTop:"20px"}}>Cruzando seus dados com milhares de perfis de sucesso</p>
    </div>
  );
}

/* ══════════════════════
   9. DIAGNOSIS
   ══════════════════════ */
function Diagnosis({ name, bmi, bmiCat, weightToLose, timeWeeks, answers, frustrationText, onNext }) {
  return (
    <div style={{paddingTop:"24px"}}>
      <div style={{textAlign:"center",marginBottom:"24px"}}>
        <div className="badge" style={{background:"rgba(232,168,56,0.1)",borderColor:"rgba(232,168,56,0.25)",color:"#E8A838"}}>📋 DIAGNÓSTICO EXCLUSIVO</div>
        <h2 className="screen-title" style={{fontSize:"28px"}}>{name}, aqui está seu diagnóstico</h2>
      </div>

      <div className="diag-card">
        <div className="diag-row"><span className="diag-label">Seu IMC atual</span><span className="diag-value" style={{color:bmiCat.color}}>{bmi} — {bmiCat.label}</span></div>
        <div className="diag-row"><span className="diag-label">Meta de eliminação</span><span className="diag-value" style={{color:"#E8A838"}}>{weightToLose.toFixed(1)} kg</span></div>
        <div className="diag-row"><span className="diag-label">Tempo estimado</span><span className="diag-value" style={{color:"#A8D08D"}}>{timeWeeks} semanas</span></div>
        <div className="diag-row"><span className="diag-label">Compatibilidade</span><span className="diag-value" style={{color:"#8CB369"}}>97% com o Protocolo</span></div>
      </div>

      <div className="diag-analysis">
        <h3 style={{fontSize:"16px",color:"#F2F0E8",marginBottom:"12px"}}>📝 Análise personalizada para {name}:</h3>
        <p style={{fontSize:"14px",color:"#9CA88E",lineHeight:"1.8"}}>
          Com base nas suas respostas, identificamos que você é uma mulher {answers.frustration && frustrationText[answers.frustration] ? frustrationText[answers.frustration] : "que busca uma transformação real"}. 
          Seu IMC de <strong style={{color:bmiCat.color}}>{bmi}</strong> indica <strong>{bmiCat.label.toLowerCase()}</strong>, e seu objetivo de eliminar <strong style={{color:"#E8A838"}}>{weightToLose.toFixed(1)}kg</strong> é totalmente alcançável com o Protocolo Dieta da Selva.
        </p>
        <p style={{fontSize:"14px",color:"#9CA88E",lineHeight:"1.8",marginTop:"12px"}}>
          A alta ingestão de <strong style={{color:"#A8D08D"}}>proteínas e gorduras boas</strong> do protocolo vai estimular seu GLP-1 naturalmente, eliminando a fome e a compulsão. Seu corpo vai começar a <strong>queimar gordura como combustível</strong> — provavelmente já nas primeiras 72 horas.
        </p>
        <p style={{fontSize:"14px",color:"#9CA88E",lineHeight:"1.8",marginTop:"12px"}}>
          Estimamos que em <strong style={{color:"#A8D08D"}}>{timeWeeks} semanas</strong> você pode atingir seu peso desejado, perdendo em média <strong>1 a 1,2kg por semana</strong> de forma saudável e sustentável — sem fome, sem academia obrigatória e comendo comidas que você ama.
        </p>
      </div>

      <button className="cta" onClick={onNext} style={{width:"100%",marginTop:"24px"}}>
        Ver como alcançar esse resultado →
      </button>
    </div>
  );
}

/* ══════════════════════
   10. RESULT + OFFER
   ══════════════════════ */
function Result({ name, weightToLose, timeWeeks, bmi, bmiCat }) {
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
        <h2 className="screen-title" style={{fontSize:"26px"}}>{name}, tudo está pronto para sua transformação</h2>
        <p className="screen-sub">Você tem 97% de compatibilidade com o Protocolo Dieta da Selva</p>
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
.hero-title{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;line-height:1.25;color:#F2F0E8;margin-bottom:18px}
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

.section-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;text-align:center;color:#F2F0E8;margin-bottom:24px}

.features-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:36px}
.feat-card{display:flex;gap:12px;padding:16px;border-radius:14px;border:1px solid rgba(140,179,105,0.08);background:rgba(18,24,14,0.7);align-items:flex-start}

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
  .hero-title{font-size:26px}
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

/* ── APP DEMO ── */
.demo-wrap{margin-bottom:36px;text-align:center}
.demo-headline{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#F2F0E8;margin-bottom:6px}
.demo-sub{font-size:13px;color:#9CA88E;margin-bottom:20px}

.phone-frame{position:relative;width:280px;margin:0 auto;background:#080D06;border-radius:36px;border:2px solid rgba(140,179,105,0.2);box-shadow:0 0 0 6px rgba(10,14,8,0.8),0 0 0 8px rgba(140,179,105,0.08),0 24px 60px rgba(0,0,0,0.6);overflow:hidden;user-select:none}
.phone-notch{display:flex;justify-content:center;padding:10px 0 6px;background:#080D06}
.phone-camera{width:10px;height:10px;border-radius:50%;background:#111608;border:1px solid rgba(140,179,105,0.15)}
.phone-body{height:440px;overflow-y:auto;overflow-x:hidden;background:#0C0F0A;scrollbar-width:none}
.phone-body::-webkit-scrollbar{display:none}
.phone-nav{display:flex;border-top:1px solid rgba(140,179,105,0.1);background:#080D06;padding:6px 0 10px}
.pnav-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:none;cursor:pointer;padding:4px 0;transition:opacity .2s}
.pnav-btn:hover{opacity:.8}
.pnav-label{font-size:9px;color:#5C6652;font-family:'DM Sans',sans-serif;font-weight:500}
.pnav-active .pnav-label{color:#E8A838}

.app-home{padding:16px 12px}
.app-top-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.app-greeting{font-size:10px;color:#9CA88E;margin-bottom:1px}
.app-name-txt{font-size:16px;font-weight:800;color:#F2F0E8}
.app-av{width:32px;height:32px;border-radius:50%;background:#1A2010;border:1px solid rgba(140,179,105,0.2);display:flex;align-items:center;justify-content:center;font-size:14px}
.app-card{background:#111608;border:1px solid rgba(140,179,105,0.1);border-radius:14px;padding:12px;margin-bottom:10px;cursor:pointer;transition:border-color .2s}
.app-card:hover{border-color:rgba(140,179,105,0.3)}
.app-lbl{font-size:9px;font-weight:700;color:#5C6652;letter-spacing:.08em;margin-bottom:6px}
.app-bar{height:4px;background:rgba(140,179,105,0.1);border-radius:4px;overflow:hidden;margin-bottom:10px}
.app-bar-fill{height:100%;background:linear-gradient(90deg,#8CB369,#E8A838);border-radius:4px}
.app-stats-row{display:flex;gap:6px}
.app-stat{flex:1;background:#1A2010;border-radius:8px;padding:6px 4px;text-align:center}
.app-stat-l{display:block;font-size:9px;color:#9CA88E;margin-bottom:2px}
.app-stat-v{display:block;font-size:12px;font-weight:700;color:#E8A838}
.app-meal{display:flex;align-items:center;gap:8px;background:#111608;border:1px solid rgba(140,179,105,0.08);border-radius:12px;padding:10px;cursor:pointer;transition:border-color .2s}
.app-meal:hover{border-color:rgba(140,179,105,0.25)}
.app-meal-icon{width:36px;height:36px;background:#1A2010;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.app-tip{display:flex;gap:8px;align-items:flex-start;background:#1A2010;border-radius:12px;padding:10px;cursor:pointer}

.app-section{padding:12px}
.app-page-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#F2F0E8;margin-bottom:10px}
.app-recipe{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:12px;border:1px solid rgba(140,179,105,0.07);background:#111608;margin-bottom:6px;cursor:pointer;transition:border-color .2s}
.app-recipe:hover{border-color:rgba(140,179,105,0.25)}
.app-recipe-ex{border-color:rgba(232,168,56,0.2)!important;background:rgba(232,168,56,0.04)!important}
.app-recipe-em{font-size:20px;flex-shrink:0}
.app-treino{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:12px;border:1px solid rgba(140,179,105,0.07);background:#111608;margin-bottom:6px;cursor:pointer;transition:border-color .2s}
.app-treino:hover{border-color:rgba(140,179,105,0.25)}
.app-treino-em{width:30px;height:30px;background:#1A2010;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.app-nivel{padding:3px 7px;border-radius:100px;font-size:9px;font-weight:700;white-space:nowrap}
.nivel-0,.nivel-1{background:rgba(140,179,105,0.12);color:#8CB369}
.nivel-2{background:rgba(232,168,56,0.12);color:#E8A838}
.nivel-3{background:rgba(232,93,74,0.12);color:#E85D4A}
.nivel-4,.nivel-5{background:rgba(232,168,56,0.12);color:#E8A838}
.app-days-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.app-day{aspect-ratio:1;border-radius:6px;background:#1A2010;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#5C6652}
.app-day-today{background:rgba(232,168,56,0.15);border:1px solid rgba(232,168,56,0.3);color:#E8A838}

/* Paywall overlay */
.demo-paywall{position:absolute;inset:0;background:rgba(6,9,4,0.75);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:10;animation:s-msg-in .2s ease both}
.demo-pw-card{background:#111608;border:1px solid rgba(140,179,105,0.2);border-radius:20px;padding:22px 18px;text-align:center;width:90%;max-width:240px}
.demo-pw-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#F2F0E8;margin-bottom:6px}
.demo-pw-sub{font-size:11px;color:#9CA88E;line-height:1.55;margin-bottom:16px}
.demo-pw-cta{width:100%;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#8CB369,#6B9B45);color:#fff;font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;margin-bottom:8px;transition:opacity .2s}
.demo-pw-cta:hover{opacity:.9}
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
`;
