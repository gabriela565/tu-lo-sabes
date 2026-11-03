const BANKJSON=[];
// ---------- Utilidades ----------
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const R = (a,b) => a + Math.floor(Math.random()*(b-a+1));
const pick = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const nf = n => Number(n).toLocaleString('es-ES',{maximumFractionDigits:2});
const mmss = s => { s=Math.max(0,Math.round(s)); const m=Math.floor(s/60); return m+':'+String(s%60).padStart(2,'0'); };
const LET = ['A','B','C','D'];

const TRAPS = {
  neg:{n:'Pregunta en negativo',tip:'Antes de mirar las opciones, rodea mentalmente el NO o el EXCEPTO. Buscas la única opción falsa.'},
  cifra:{n:'Cifra o plazo cambiado',tip:'Los distractores son cifras reales de otro artículo. Repasa en tablas comparadas: mandatos, plazos y mayorías.'},
  organo:{n:'Órgano intercambiado',tip:'Pregúntate quién propone, quién nombra y a quién solo se oye. El examen cambia los papeles.'},
  parecido:{n:'Concepto parecido',tip:'Dos opciones verdaderas en general; solo una responde exactamente a lo que se pregunta. Relee el enunciado.'},
  regla:{n:'Regla general frente a excepción',tip:'Cuando el enunciado concreta un caso, sospecha que preguntan por la excepción.'},
  calc:{n:'Paso de cálculo omitido',tip:'Escribe el paso intermedio. La opción trampa es el resultado de saltarse un paso.'},
  atajo:{n:'Atajo cruzado',tip:'El examen usa Office en español: Ctrl+N negrita, Ctrl+K cursiva, Ctrl+S subrayado, Ctrl+G guardar.'},
  serie:{n:'Patrón incompleto',tip:'Comprueba el patrón con TODOS los términos, no solo con los dos últimos.'}
};

// ---------- Psicotécnicos generados ----------
function mkQ(tema, q, correct, ds, tt, e, t){
  const opts=[String(correct)]; for(const d of ds){ const s=String(d); if(!opts.includes(s)&&opts.length<4) opts.push(s); }
  let k=1; while(opts.length<4){ const s=String(Number(String(correct).replace(',','.'))+k*(k%2?1:-1)).replace('.',','); if(!opts.includes(s)) opts.push(s); k++; }
  return {tema,q,o:opts,tt,e,t};
}
const GEN = [
 function(){ const a=R(2,20),d=R(2,5),k=R(1,3); const t=[a]; for(let i=0;i<5;i++) t.push(t[i]+d+i*k);
   return mkQ('Series numéricas',`¿Qué número continúa la serie? ${t.slice(0,5).join(', ')}, …`,t[5],[t[4]+d+3*k,t[4]+d+5*k,t[5]+1],'serie',
   `Las diferencias son ${d}, ${d+k}, ${d+2*k}, ${d+3*k}: crecen de ${k} en ${k}. La siguiente es ${d+4*k}, así que ${t[4]} + ${d+4*k} = ${t[5]}.`,
   `Si respondiste ${t[4]+d+3*k}, repetiste la última diferencia en vez de seguir aumentándola. Calcula siempre las diferencias de las diferencias.`); },
 function(){ const a=R(1,9),p=R(2,4),b=R(20,40),q=-R(2,4); const s=[]; for(let i=0;i<8;i++) s.push(i%2===0? a+(i/2)*p : b+((i-1)/2)*q);
   return mkQ('Series numéricas',`¿Qué número continúa la serie? ${s.slice(0,7).join(', ')}, …`,s[7],[a+4*p,s[7]+q,s[6]+p+1],'serie',
   `Son dos series intercaladas. Posiciones impares: ${a}, ${a+p}, ${a+2*p}, ${a+3*p} (+${p}). Posiciones pares: ${b}, ${b+q}, ${b+2*q} (${q}). Toca la serie par: ${b+2*q} ${q} = ${s[7]}.`,
   `Si respondiste ${a+4*p}, continuaste la serie que no tocaba. En series que suben y bajan, separa las posiciones pares e impares.`); },
 function(){ const m=R(2,3),sm=pick([-1,1,2,3]); const t=[R(1,4)]; for(let i=0;i<5;i++) t.push(t[i]*m+sm);
   return mkQ('Series numéricas',`¿Qué número continúa la serie? ${t.slice(0,5).join(', ')}, …`,t[5],[t[4]*m,t[4]+(t[4]-t[3]),t[5]+m],'serie',
   `Cada término se obtiene multiplicando por ${m} y ${sm>0?'sumando '+sm:'restando '+(-sm)}: ${t[4]} × ${m} ${sm>0?'+ '+sm:'− '+(-sm)} = ${t[5]}.`,
   `Si respondiste ${t[4]*m}, olvidaste el ${sm>0?'+'+sm:sm}. Si respondiste ${t[4]+(t[4]-t[3])}, buscaste una suma cuando el patrón es multiplicativo: cuando la serie crece muy rápido, prueba con multiplicar.`); },
 function(){ const P=pick([80,120,150,200,240,250,300,400,500]),x=pick([10,20,25,30,40]),y=pick([10,20,25]); const f=v=>Math.round(v*100)/100;
   const c=f(P*(1-x/100)*(1+y/100)), tr=f(P*(1-(x-y)/100));
   return mkQ('Razonamiento numérico',`Un producto cuesta ${P} €. Se rebaja un ${x} % y, después, el precio rebajado sube un ${y} %. ¿Cuál es el precio final?`,nf(c),[nf(tr),nf(f(P*(1-x/100)*(1-y/100))),nf(f(P*(1-x/100)+y))],'calc',
   `Rebaja: ${P} × ${nf(1-x/100)} = ${nf(f(P*(1-x/100)))} €. Subida: ${nf(f(P*(1-x/100)))} × ${nf(1+y/100)} = ${nf(c)} €.`,
   `Si respondiste ${nf(tr)} €, restaste los porcentajes (${x} − ${y}). No se puede: la subida se aplica sobre un precio ya rebajado, no sobre el original.`); },
 function(){ let W,D,W2,tries=0; do{ W=pick([3,4,5,6,8,10,12]); D=pick([6,8,9,10,12,15,20]); const tot=W*D; const ds=[]; for(let i=2;i<=24;i++) if(tot%i===0&&i!==W&&tot/i!==D) ds.push(i); W2=ds.length?pick(ds):0; tries++; }while(!W2&&tries<20);
   const c=W*D/W2, dir=Math.round(D*W2/W*100)/100;
   return mkQ('Razonamiento numérico',`${W} personas tardan ${D} días en tramitar un lote de expedientes. Al mismo ritmo, ¿cuántos días tardarían ${W2} personas?`,nf(c),[nf(dir),nf(c+2),nf(Math.abs(D+W-W2))],'calc',
   `Proporción inversa: más personas, menos días. ${W} × ${D} = ${W*D} jornadas de trabajo; ${W*D} ÷ ${W2} = ${nf(c)} días.`,
   `Si respondiste ${nf(dir)}, planteaste una regla de tres directa. Antes de calcular, pregúntate: si aumenta una magnitud, ¿la otra aumenta o disminuye?`); },
 function(){ const A='ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', A26='ABCDEFGHIJKLMNOPQRSTUVWXYZ'; let k,L,s; do{ k=R(2,4); L=R(14-k,13); s=L-3*k; }while(s<0);
   const shown=[0,1,2,3].map(i=>A[s+i*k]); const c=A[L+k], tr=A26[A26.indexOf(A[L])+k]; const cand=[A[L+k+1],A[L+k-1],A[L+k+2],A[L+k-3]].filter(x=>x&&x!==c&&x!==tr&&!shown.includes(x));
   return mkQ('Series de letras',`¿Qué letra continúa la serie? ${shown.join(', ')}, …`,c,[tr,...cand],'serie',
   `Salto de ${k} posiciones en el abecedario español (27 letras, con Ñ). Desde ${A[L]}, contando ${k}: ${A.slice(L+1,L+k+1).split('').join(' → ')}.`,
   `Si respondiste ${tr}, contaste sin la Ñ. En los psicotécnicos españoles la Ñ cuenta, salvo que el enunciado diga otra cosa.`); },
 function(){ const pairs=[[2,3],[3,4],[2,5],[3,5],[4,5],[5,6],[3,7],[3,8],[5,8]]; const [a,b]=pick(pairs); const m=R(3,15); const X=a*m,N=b*m;
   return mkQ('Razonamiento numérico',`Los ${a}/${b} de un número son ${X}. ¿Cuál es ese número?`,N,[Math.round(X*a/b*100)/100,X*b,Math.round(X/a*100)/100].map(nf),'calc',
   `Si ${a}/${b} del número = ${X}, entonces 1/${b} = ${X} ÷ ${a} = ${m}, y el número completo = ${m} × ${b} = ${N}.`,
   `Si respondiste ${nf(Math.round(X*a/b*100)/100)}, calculaste los ${a}/${b} DE ${X}. Aquí ${X} ya es una parte: hay que dividir entre ${a} y multiplicar por ${b}.`); },
 function(){ const n=pick([4,5]), M=R(6,15), Y=R(M+5,M+20); const c=(n*M+Y)/(n+1); if(!Number.isInteger(c)) return GEN[7]();
   return mkQ('Razonamiento numérico',`La media de ${n} números es ${M}. Si se añade el número ${Y}, ¿cuál es la nueva media?`,c,[nf((M+Y)/2),nf(M+1),nf(c+1)],'calc',
   `Suma de los ${n} números: ${n} × ${M} = ${n*M}. Nueva suma: ${n*M} + ${Y} = ${n*M+Y}. Nueva media: ${n*M+Y} ÷ ${n+1} = ${c}.`,
   `Si respondiste ${nf((M+Y)/2)}, hiciste la media entre la media y el número nuevo. La media anterior representa ${n} números, no uno.`); }
];
let genSeq=0;
function genPsico(){ const g=pick(GEN)(); return {...g,id:'g'+(++genSeq)+'_'+Date.now(),b:'P'}; }

// ---------- Banco ----------
const BANK=[]; const conv=(arr,b,pre)=>arr.forEach((r,i)=>BANK.push({id:pre+i,b,tema:r[0],q:r[1],o:r[2],tt:r[3],e:r[4],t:r[5],f:r[6]||'',org:r[7]||null}));
BANKJSON.forEach(x=>BANK.push(x));


const BYID=Object.fromEntries(BANK.map(q=>[q.id,q]));
const BLOCKS={'1':'Bloque I · Organización pública','P':'Psicotécnicos','2':'Bloque II · Ofimática'};
const GEN_TEMAS=['Series numéricas','Series de letras','Razonamiento numérico'];

// Programa de las últimas convocatorias (Cuerpo General Auxiliar de la AGE). Comprobar siempre con el BOE de la convocatoria vigente.
const TEMARIO=[
 {b:'1',n:1,t:'La Constitución Española de 1978: estructura y contenido. Derechos y deberes fundamentales; su garantía y suspensión. El Defensor del Pueblo.',normas:'Constitución Española (Títulos Preliminar y I); LO 3/1981 del Defensor del Pueblo',temas:['Constitución']},
 {b:'1',n:2,t:'El Tribunal Constitucional. La reforma de la Constitución. La Corona.',normas:'CE Títulos II, IX y X; LO 2/1979 del Tribunal Constitucional',temas:['Corona, TC y reforma']},
 {b:'1',n:3,t:'Las Cortes Generales: composición y funciones. Elaboración de las leyes. Tribunal de Cuentas.',normas:'CE Título III; Reglamentos del Congreso y del Senado; LO 2/1982 del Tribunal de Cuentas',temas:['Cortes Generales']},
 {b:'1',n:4,t:'El Poder Judicial. El Consejo General del Poder Judicial. El Tribunal Supremo. El Ministerio Fiscal. Organización judicial.',normas:'CE Título VI; LO 6/1985 del Poder Judicial',temas:['Poder Judicial']},
 {b:'1',n:5,t:'El Gobierno y la Administración. Relaciones entre el Gobierno y las Cortes Generales.',normas:'CE Títulos IV y V; Ley 50/1997 del Gobierno',temas:['Gobierno']},
 {b:'1',n:6,t:'El Gobierno Abierto. La Agenda 2030 y los Objetivos de Desarrollo Sostenible.',normas:'Planes de Gobierno Abierto; Agenda 2030 (ONU)',temas:['Gobierno Abierto y Agenda 2030']},
 {b:'1',n:7,t:'La Ley de Transparencia, acceso a la información pública y buen gobierno.',normas:'Ley 19/2013',temas:['Transparencia']},
 {b:'1',n:8,t:'La Administración General del Estado: organización central y periférica. El sector público institucional.',normas:'Ley 40/2015 (Títulos I y II)',temas:['Administración General del Estado']},
 {b:'1',n:9,t:'La organización territorial del Estado. Las Comunidades Autónomas. La Administración local.',normas:'CE Título VIII; Ley 7/1985 de Bases del Régimen Local',temas:['Organización territorial']},
 {b:'1',n:10,t:'La Unión Europea: instituciones, fuentes del Derecho de la UE.',normas:'TUE y TFUE',temas:['Unión Europea']},
 {b:'1',n:11,t:'Las Leyes del Procedimiento Administrativo Común y de Régimen Jurídico del Sector Público.',normas:'Ley 39/2015; Ley 40/2015',temas:['Procedimiento (Ley 39/2015)','Régimen jurídico (Ley 40/2015)']},
 {b:'1',n:12,t:'La protección de datos personales.',normas:'Reglamento (UE) 2016/679 (RGPD); LO 3/2018 (LOPDGDD)',temas:['Protección de datos']},
 {b:'1',n:13,t:'El personal funcionario al servicio de las Administraciones Públicas. Acceso, carrera, provisión, situaciones.',normas:'RDLeg 5/2015 (TREBEP)',temas:['Empleo público']},
 {b:'1',n:14,t:'Derechos y deberes de los funcionarios. Incompatibilidades. Régimen disciplinario.',normas:'TREBEP; Ley 53/1984 de incompatibilidades',temas:['Empleo público']},
 {b:'1',n:15,t:'El presupuesto del Estado en España.',normas:'CE art. 134; Ley 47/2003 General Presupuestaria',temas:['Presupuestos']},
 {b:'1',n:16,t:'Políticas de igualdad de género, violencia de género, discapacidad y dependencia.',normas:'LO 3/2007; LO 1/2004; RDLeg 1/2013; Ley 39/2006',temas:['Igualdad, discapacidad y dependencia']},
 {b:'2',n:1,t:'Atención al público: acogida e información. Los servicios de información administrativa.',normas:'RD 208/1996',temas:['Atención a la ciudadanía']},
 {b:'2',n:2,t:'Iniciativas, reclamaciones, quejas y sugerencias.',normas:'RD 951/2005',temas:['Atención a la ciudadanía']},
 {b:'2',n:3,t:'Concepto de documento, registro y archivo. Funciones del registro y del archivo. Clases de archivo.',normas:'Ley 39/2015 (arts. 16 y 17)',temas:['Registro y archivo']},
 {b:'2',n:4,t:'Administración electrónica y servicios al ciudadano.',normas:'Ley 39/2015; Ley 40/2015; RD 203/2021',temas:['Administración electrónica']},
 {b:'2',n:5,t:'Informática básica: conceptos fundamentales sobre el hardware y el software.',normas:'—',temas:['Informática básica']},
 {b:'2',n:6,t:'Sistema operativo Windows.',normas:'Windows 11',temas:['Windows 11 y Explorador']},
 {b:'2',n:7,t:'El explorador de Windows.',normas:'Windows 11',temas:['Windows 11 y Explorador']},
 {b:'2',n:8,t:'Procesadores de texto: Word.',normas:'Microsoft 365',temas:['Word']},
 {b:'2',n:9,t:'Hojas de cálculo: Excel.',normas:'Microsoft 365',temas:['Excel']},
 {b:'2',n:10,t:'Bases de datos: Access.',normas:'Microsoft 365',temas:['Access']},
 {b:'2',n:11,t:'Correo electrónico: Outlook.',normas:'Microsoft 365',temas:['Outlook']},
 {b:'2',n:12,t:'La red Internet.',normas:'—',temas:['Internet y seguridad']},
 {b:'P',n:'P',t:'Psicotécnicos: razonamiento verbal, numérico, series, ortografía.',normas:'—',temas:['Razonamiento verbal','Ortografía y gramática','Razonamiento numérico','Series numéricas','Series de letras']}
];
const temaEdital=tema=>TEMARIO.filter(x=>x.temas.includes(tema));
const temasDe=b=>{ const s=[...new Set(BANK.filter(q=>q.b===b).map(q=>q.tema))].filter(t=>{const e=temaEdital(t)[0]; return !e||e.b===b;}); if(b==='P') GEN_TEMAS.forEach(t=>{ if(!s.includes(t)) s.push(t); }); return s; };

// ---------- Estado (en este navegador) ----------
const KEY='manuela-lo-sabe-v1';
let S={pen:1/3,seen:{},temas:{},hist:[],cur:null,intu:{rw:0,wr:0,dudoOk:0,dudoN:0,seguraOk:0,seguraN:0}};
try{ const raw=localStorage.getItem(KEY); if(raw) S=Object.assign(S,JSON.parse(raw)); }catch(e){}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }

// ---------- Construcción de sesiones ----------
function prioritized(pool,n){
  if(S.soloOficial){ const of=pool.filter(q=>q.org); if(of.length) pool=of; }
  const unseen=shuffle(pool.filter(q=>!S.seen[q.id]));
  const failed=shuffle(pool.filter(q=>S.seen[q.id]&&!S.seen[q.id].ok));
  const rest=shuffle(pool.filter(q=>S.seen[q.id]&&S.seen[q.id].ok));
  const out=[...unseen,...failed,...rest].slice(0,n);
  while(out.length<n&&pool.length) out.push(pick(pool));
  return out;
}
function toItem(q){ const correct=q.o[0]; const opts=shuffle(q.o); return {...q,opts,c:opts.indexOf(correct)}; }
function psicoSet(n){ const v=Math.min(Math.round(n*0.6),BANK.filter(q=>q.b==='P').length); const verb=prioritized(BANK.filter(q=>q.b==='P'),v); const g=[]; for(let i=0;i<n-v;i++) g.push(genPsico()); return shuffle([...g,...verb]); }

function newSession(kind,opt={}){
  let qs=[],title='',dur=0,mode='exam';
  if(kind==='full'||kind==='half'){
    const f=kind==='full'?1:0.5;
    const n1=Math.round(30*f),np=Math.round(30*f),n2=Math.round(50*f);
    qs=[...prioritized(BANK.filter(q=>q.b==='1'),n1),...psicoSet(np),...prioritized(BANK.filter(q=>q.b==='2'),n2)];
    title=kind==='full'?'Simulacro oficial completo':'Medio simulacro'; dur=kind==='full'?90*60:45*60;
  } else if(kind==='custom'){
    const B=opt; const pool=BANK.filter(q=>bFilter(q,B));
    const genOk=B.srcs.includes('propia'); const genT=B.temas.length?B.temas.filter(t=>GEN_TEMAS.includes(t)):GEN_TEMAS;
    const nStat=(genOk&&B.temas.length&&genT.length)?Math.round(B.n*(1-genT.length/B.temas.length)):B.n;
    const saveOf=S.soloOficial; S.soloOficial=false; qs=prioritized(pool,Math.min(nStat,pool.length)); S.soloOficial=saveOf;
    let guard=0; while(genOk&&genT.length&&qs.length<B.n&&guard++<5000){ const g=genPsico(); if(genT.includes(g.tema)) qs.push(g); }
    qs=shuffle(qs); title='Test personalizado'+(B.temas.length===1?' · '+B.temas[0]:''); dur=B.timed?Math.round(qs.length*49):0;
  } else if(kind==='oficial'){
    const all=BANK.filter(q=>q.org&&q.org.convocatoria===opt.conv&&!q.org.reserva);
    const ord=q=>(q.org.parte==='Segunda parte'?1000:0)+q.org.n; qs=all.sort((x,y)=>ord(x)-ord(y));
    title='Examen oficial '+opt.conv.split(' (')[0]+' · '+all[0].org.fecha; dur=Math.round(90*60*qs.length/110);
  } else if(kind==='tema'){
    mode='practice'; title=opt.tema;
    const stat=BANK.filter(q=>q.tema===opt.tema);
    if(GEN_TEMAS.includes(opt.tema)){ qs=prioritized(stat,Math.min(5,stat.length)); while(qs.length<10){ let g; do{g=genPsico();}while(g.tema!==opt.tema); qs.push(g);} qs=shuffle(qs); }
    else qs=prioritized(stat,10);
  } else if(kind==='bloque'){
    mode='practice'; title=BLOCKS[opt.b];
    qs = opt.b==='P' ? psicoSet(15) : prioritized(BANK.filter(q=>q.b===opt.b),15);
  } else if(kind==='fails'){
    mode='practice'; title='Repaso de falladas';
    qs=shuffle(BANK.filter(q=>S.seen[q.id]&&!S.seen[q.id].ok)).slice(0,20);
  } else if(kind==='express'){
    mode='exam'; title='Contrarreloj 20 preguntas'; dur=20*49;
    qs=shuffle([...prioritized(BANK.filter(q=>q.b==='1'),6),...psicoSet(6),...prioritized(BANK.filter(q=>q.b==='2'),8)]);
  }
  if(!qs.length) return;
  S.cur={kind,mode,immediate:mode==='exam'&&!!S.inmediata,title,dur,qs:qs.map(toItem),ans:qs.map(()=>({first:null,cur:null,conf:null,flag:false,checked:false,t:0})),i:0,elapsed:0,done:false,date:Date.now()};
  save(); go('run');
}

// ---------- Navegación ----------
let view='home', tick=null, lastTick=0, showGrid=false, confirmEnd=false, reviewFilter='wrong';
function go(v){ view=v; showGrid=false; confirmEnd=false; render(); window.scrollTo(0,0); }

function startTimer(){
  stopTimer(); lastTick=performance.now();
  tick=setInterval(()=>{
    const s=S.cur; if(!s||s.done||view!=='run') return;
    const now=performance.now(), dt=(now-lastTick)/1000; lastTick=now;
    s.elapsed+=dt; s.ans[s.i].t+=dt;
    if(s.dur&&s.elapsed>=s.dur){ finish(); return; }
    updateClock(); if(Math.floor(s.elapsed)%5===0) save();
  },250);
}
function stopTimer(){ if(tick) clearInterval(tick); tick=null; }
document.addEventListener('visibilitychange',()=>{ lastTick=performance.now(); });

// ---------- Respuestas ----------
function choose(idx){
  const s=S.cur, a=s.ans[s.i]; if(a.checked) return;
  if(a.first===null) a.first=idx;
  a.cur = (a.cur===idx) ? null : idx;
  save(); render();
}
function setConf(c){ const a=S.cur.ans[S.cur.i]; if(a.checked) return; a.conf=a.conf===c?null:c; save(); render(); }
function blank(){ const a=S.cur.ans[S.cur.i]; if(a.checked) return; a.cur=-1; a.nose=false; save(); render(); }
function noSe(){ const s=S.cur,a=s.ans[s.i]; if(a.checked) return; a.cur=-1; a.nose=true; S.nose=S.nose||{}; S.nose[s.qs[s.i].id]=Date.now(); save(); if(s.mode==='practice'||s.immediate){ check(); } else render(); }
function flag(){ const a=S.cur.ans[S.cur.i]; a.flag=!a.flag; save(); render(); }
function move(d){ const s=S.cur; s.i=Math.max(0,Math.min(s.qs.length-1,s.i+d)); confirmEnd=false; save(); render(); window.scrollTo(0,0); }
function jump(i){ S.cur.i=i; showGrid=false; save(); render(); window.scrollTo(0,0); }
function check(){ const a=S.cur.ans[S.cur.i]; if(a.cur===null) return; a.checked=true; record(S.cur.qs[S.cur.i],a); save(); render(); }

function record(q,a){
  const ok=a.cur===q.c, answered=a.cur!==null&&a.cur!==-1;
  if(!q.id.startsWith('g')){ const r=S.seen[q.id]||{n:0,ok:false,f:0}; r.n++; if(answered){ r.ok=ok; if(!ok) r.f++; } S.seen[q.id]=r; }
  const T=S.temas[q.tema]||{a:0,e:0,bl:0}; if(!answered) T.bl++; else if(ok) T.a++; else T.e++; S.temas[q.tema]=T;
  const I=S.intu;
  if(answered&&a.first!==null&&a.first!==a.cur){ if(a.first===q.c) I.rw++; else if(ok) I.wr++; }
  if(answered&&a.conf==='dudo'){ I.dudoN++; if(ok) I.dudoOk++; }
  if(answered&&a.conf==='segura'){ I.seguraN++; if(ok) I.seguraOk++; }
}

function finish(){
  const s=S.cur; if(!s||s.done) return; stopTimer();
  if(s.mode==='exam') s.qs.forEach((q,i)=>{ if(!s.ans[i].checked) record(q,s.ans[i]); });
  s.done=true; const r=score(s); S.hist.unshift({date:Date.now(),title:s.title,kind:s.kind,...r.sum});
  const dk=new Date().toISOString().slice(0,10); S.days=S.days||{}; const D=S.days[dk]||(S.days[dk]={t:0,n:0,ac:0}); D.t+=r.sum.time; D.n+=r.sum.n; D.ac+=r.sum.ac;
  S.hist=S.hist.slice(0,60); S.last=s; S.cur=null; save(); reviewFilter='wrong'; go('result');
}

function score(s){
  const parts={}; let ac=0,er=0,bl=0,rw=0,wr=0,blankRight=0,dudoN=0,dudoOk=0,timeTot=0,firstNet=0;
  s.qs.forEach((q,i)=>{ const a=s.ans[i]; if(s.mode==='practice'&&!a.checked) return;
    const P=parts[q.b]||(parts[q.b]={ac:0,er:0,bl:0,t:0,n:0}); P.n++; P.t+=a.t; timeTot+=a.t;
    const answered=a.cur!==null&&a.cur!==-1;
    if(!answered){P.bl++;bl++; if(a.first===q.c) blankRight++;}
    else if(a.cur===q.c){P.ac++;ac++;} else {P.er++;er++;}
    if(answered&&a.first!==null&&a.first!==a.cur){ if(a.first===q.c) rw++; else if(a.cur===q.c) wr++; }
    if(answered&&a.conf==='dudo'){dudoN++; if(a.cur===q.c) dudoOk++;}
    const f=a.first; if(f!==null&&f!==-1){ firstNet+= f===q.c?1:-S.pen; }
  });
  const n=ac+er+bl, net=ac-er*S.pen, nota=n?Math.max(0,net)/n*10:0;
  const firstNota=n?Math.max(0,firstNet)/n*10:0;
  return {parts,sum:{n,ac,er,bl,net:Math.round(net*100)/100,nota:Math.round(nota*100)/100,rw,wr,blankRight,dudoN,dudoOk,time:Math.round(timeTot),firstNota:Math.round(firstNota*100)/100}};
}

// ---------- Vistas ----------
function render(){
  const app=$('#app');
  if(view==='run'&&S.cur){ app.innerHTML=vRun(); startTimer(); updateClock(); }
  else { stopTimer(); app.innerHTML = view==='result'?vResult(): view==='practice'?vPractice(): view==='progress'?vProgress(): view==='settings'?vSettings(): view==='temario'?vTemario(): view==='evol'?vEvol(): view==='impugnar'?vImpugnar(): view==='examenes'?vExamenes(): view==='estudiar'?vEstudiar(): view==='notas'?vNotas(): view==='ayuda'?vAyuda(): vHome(); if(view==='impugnar') initImp(); }
  $('#nav').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===view));
  $('#nav').hidden = view==='run';
}

const PHRASES=['Tu primera respuesta suele ser la buena.','Lo sabes. Ahora toca creértelo.','Una pregunta cada vez. Sin prisa y sin miedo.','Duda del enunciado, no de ti.','Lo que ya has estudiado sigue ahí.'];
function vHome(){
  const seenN=Object.keys(S.seen).length, fails=Object.values(S.seen).filter(r=>!r.ok).length, last=S.hist[0];
  const I=S.intu, totalCh=I.rw+I.wr;
  return `
  <section class="hero">
    <p class="eyebrow">Auxiliar Administrativo del Estado · Subgrupo C2</p>
    <h1>${userName()?`Hola, ${esc(userName())}.`:'Hola.'}</h1>
    <p class="lead">${pick(PHRASES)}</p>
  </section>
  ${S.cur?`<div class="resume"><div><strong>Tienes un ${esc(S.cur.title.toLowerCase())} a medias</strong><span>Pregunta ${S.cur.i+1} de ${S.cur.qs.length}${S.cur.dur?' · quedan '+mmss(S.cur.dur-S.cur.elapsed):''}</span></div><button class="btn primary" onclick="go('run')">Continuar</button></div>`:''}
  <label class="switch"><input type="checkbox" id="inm" ${S.inmediata?'checked':''} onchange="S.inmediata=this.checked;save()"><span><b>Corrección inmediata en los simulacros</b><small>Ves la respuesta correcta, la explicación y la norma después de cada pregunta, sin parar el reloj. Desactívala para practicar como el día del examen.</small></span></label>
  <label class="switch"><input type="checkbox" id="sof" ${S.soloOficial?'checked':''} onchange="S.soloOficial=this.checked;save()"><span><b>Priorizar preguntas de exámenes oficiales</b><small>Usa primero preguntas reales (${BANK.filter(q=>q.org).length} importadas) y completa con las de elaboración propia cuando no haya suficientes.</small></span></label>
  <div class="modes">
    ${convocatorias().map(c=>{const n=BANK.filter(q=>q.org&&q.org.convocatoria===c&&!q.org.reserva).length, f=BANK.find(q=>q.org&&q.org.convocatoria===c).org; return `<button class="mode big of" onclick="newSession('oficial',{conv:'${c.replace(/'/g,"\\'")}'})"><span class="tag">Examen oficial real · ${esc(f.ambito)}</span><strong>${esc(f.prueba)}</strong><span>${esc(c)} · examen del ${esc(f.fecha)}</span><span class="mini">${n} preguntas en su orden original · ${Math.round(90*n/110)} min · plantilla ${esc(f.plantilla_tipo)}</span></button>`;}).join('')}
    <button class="mode big" onclick="newSession('full')"><span class="tag">Como el examen real</span><strong>Simulacro oficial</strong><span>110 preguntas · 90 minutos</span><span class="mini">30 Bloque I · 30 psicotécnicos · 50 ofimática</span></button>
    <button class="mode" onclick="newSession('half')"><strong>Medio simulacro</strong><span>55 preguntas · 45 minutos</span></button>
    <button class="mode" onclick="newSession('express')"><strong>Contrarreloj</strong><span>20 preguntas · 16 min 20 s, al ritmo real</span></button>
    <button class="mode" onclick="go('practice')"><strong>Practicar por tema</strong><span>Corrección y explicación al momento</span></button>
    <button class="mode" ${fails?'':'disabled'} onclick="newSession('fails')"><strong>Repasar falladas</strong><span>${fails?fails+' preguntas pendientes':'Aún no tienes falladas'}</span></button>
  </div>
  <section class="strip">
    <div><span class="k">Preguntas vistas</span><span class="v">${seenN}<small> / ${BANK.length} + psicotécnicos ilimitados</small></span></div>
    <div><span class="k">Último resultado</span><span class="v">${last?nf(last.nota)+'<small> sobre 10</small>':'—'}</span></div>
    <div><span class="k">Cambios de respuesta</span><span class="v">${totalCh?`<span class="bad">${I.rw}</span> <small>de bien a mal ·</small> <span class="good">${I.wr}</span> <small>de mal a bien</small>`:'—'}</span></div>
  </section>
  <p class="foot">Penalización activa: cada error resta ${penLabel()} de acierto. <button class="link" onclick="go('settings')">Cambiar</button></p>`;
}
function penLabel(){ const p=S.pen; return p===1?'1 (una errada anula una acertada)':p===1/2?'1/2':p===1/4?'1/4':'1/3'; }

function vPractice(){
  const block=b=>{ const ts=temasDe(b); return `<div class="pblock"><div class="phead"><h3>${BLOCKS[b]}</h3><button class="btn" onclick="newSession('bloque',{b:'${b}'})">Mezcla de ${b==='P'?15:15}</button></div><div class="temas">${ts.map(t=>{
    const all=BANK.filter(q=>q.tema===t), seen=all.filter(q=>S.seen[q.id]).length, T=S.temas[t];
    const pct=T&&(T.a+T.e)?Math.round(T.a/(T.a+T.e)*100):null;
    return `<button class="tema" onclick="newSession('tema',{b:'${b}',tema:'${t.replace(/'/g,"\\'")}'})"><span>${esc(t)}</span><span class="meta">${all.length?`${seen}/${all.length} vistas`:'ilimitadas'}${pct!==null?` · <b class="${pct>=70?'good':pct>=50?'warn':'bad'}">${pct} %</b>`:''}</span><span class="bar"><i style="width:${all.length?seen/all.length*100:(T?100:0)}%"></i></span></button>`;}).join('')}</div></div>`; };
  return `<h2 class="vt">Practicar por tema</h2><p class="sub">Cada tanda prioriza las preguntas que aún no has visto y después las falladas.</p>${block('1')}${block('P')}${block('2')}`;
}

function vRun(){
  const s=S.cur, q=s.qs[s.i], a=s.ans[s.i], n=s.qs.length, done=s.ans.filter(x=>x.cur!==null).length;
  const prac=s.mode==='practice'||s.immediate, showFb=prac&&a.checked;
  const pace=s.dur?s.dur/n:49;
  const opt=(o,i)=>{ let cls='opt'; if(a.cur===i) cls+=' sel'; if(showFb){ if(i===q.c) cls+=' right'; else if(a.cur===i) cls+=' wrong'; }
    return `<button class="${cls}" onclick="choose(${i})" ${showFb?'disabled':''}><span class="l">${LET[i]}</span><span>${esc(o)}</span></button>`; };
  const part = q.b==='2'?'Segunda parte':'Primera parte';
  const sec = BLOCKS[q.b];
  return `
  <div class="runbar">
    <button class="btn ghost" onclick="go('home')" aria-label="Salir">← Salir</button>
    <div class="clocks">
      ${s.dur?`<div class="clock"><span class="k">Tiempo restante</span><span class="v" id="ck-total">--:--</span></div>`:`<div class="clock"><span class="k">Tiempo</span><span class="v" id="ck-total">--:--</span></div>`}
      <div class="clock"><span class="k">Esta pregunta</span><span class="v" id="ck-q">0:00</span></div>
      <div class="clock hide-s"><span class="k">Ritmo</span><span class="v" id="ck-pace">—</span></div>
    </div>
    <button class="btn ghost" onclick="showGrid=!showGrid;render()">${done}/${n}</button>
  </div>
  <div class="qtimer"><i id="qbar"></i></div>
  ${showGrid?vGrid():''}
  <article class="qcard">
    <p class="eyebrow">${s.mode==='exam'?part+' · ':''}${esc(sec)} · ${esc(q.tema)}</p>
    <div class="qnum">Pregunta ${s.i+1} <small>de ${n}</small>${a.checked?'':seenBadge(q)}</div>
    <h2 class="qtext">${esc(q.q)}</h2>
    <div class="opts">${q.opts.map(opt).join('')}</div>
    ${!showFb?`<div class="tools">
      <span class="k">¿Cómo de segura estás?</span>
      <button class="chip ${a.conf==='segura'?'on':''}" onclick="setConf('segura')">Segura</button>
      <button class="chip ${a.conf==='dudo'?'on':''}" onclick="setConf('dudo')">Dudo</button>
      <span class="sp"></span>
      <button class="chip ${a.cur===-1&&!a.nose?'on':''}" onclick="blank()">En blanco</button>
      <button class="chip nose ${a.nose?'on':''}" onclick="noSe()">No lo sé</button>
      ${s.mode==='exam'?`<button class="chip ${a.flag?'on':''}" onclick="flag()">Revisar luego</button>`:''}
    </div>
    ${a.first!==null&&a.cur!==null&&a.cur!==-1&&a.first!==a.cur?`<p class="note">Has cambiado tu primera respuesta (${LET[a.first]}). ¿Tienes un motivo concreto o es solo duda? Si no encuentras el motivo, vuelve a ${LET[a.first]}.</p>`:''}
    `:fb(q,a)}
  </article>
  <div class="runnav">
    <button class="btn" onclick="move(-1)" ${s.i===0?'disabled':''}>Anterior</button>
    <button class="btn" onclick="openNote('${q.id}')">✎ Anotar${S.notes&&S.notes[q.id]?' •':''}</button>
    ${prac&&!a.checked?`<button class="btn primary" onclick="check()" ${a.cur===null?'disabled':''}>Corregir</button>`:
      s.i<n-1?`<button class="btn primary" onclick="move(1)">Siguiente</button>`:''}
    ${s.i===n-1||s.mode==='exam'?`<button class="btn ${s.i===n-1?'primary':''}" onclick="confirmEnd=true;render()">${prac?'Terminar':'Entregar'}</button>`:''}
  </div>
  ${confirmEnd?`<div class="confirm"><p>${s.mode==='exam'?`Has respondido ${s.ans.filter(x=>x.cur!==null&&x.cur!==-1).length} de ${n}. ${s.ans.filter(x=>x.flag).length?s.ans.filter(x=>x.flag).length+' marcadas para revisar. ':''}`:''}¿Quieres ${prac?'terminar la práctica':'entregar el examen'}?</p><div><button class="btn" onclick="confirmEnd=false;render()">Seguir</button><button class="btn primary" onclick="finish()">${prac?'Terminar':'Entregar'}</button></div></div>`:''}
  <p class="paceinfo">Ritmo del examen real: 90 min ÷ 110 preguntas ≈ ${Math.round(pace)} s por pregunta. Si una se atasca, márcala y sigue.</p>`;
}
function seenBadge(q){ const r=S.seen[q.id]; if(!r) return ''; return ` <span class="badge ${r.ok?'good':'bad'}">Ya la respondiste: ${r.ok?'acertada':'fallada'}</span>`; }
function vGrid(){ const s=S.cur; return `<div class="grid">${s.qs.map((q,i)=>{const a=s.ans[i]; let c='g'; if(a.cur!==null&&a.cur!==-1)c+=' done'; if(a.cur===-1)c+=' bl'; if(a.flag)c+=' fl'; if(i===s.i)c+=' now'; if(s.mode==='practice'&&a.checked)c+= a.cur===q.c?' ok':' ko'; return `<button class="${c}" onclick="jump(${i})">${i+1}</button>`;}).join('')}</div><p class="legend"><span class="g done"></span>respondida <span class="g bl"></span>en blanco <span class="g fl"></span>para revisar</p>`; }

function fb(q,a){
  const ok=a.cur===q.c, bl=a.cur===-1||a.cur===null; const T=TRAPS[q.tt]||TRAPS.parecido;
  const changedRight=a.first===q.c&&!ok;
  return `<div class="fb ${ok?'ok':bl?'bl':'ko'}">
    <p class="fbh">${ok?'Correcta':bl?'En blanco':'No es esta'} · la respuesta es la <b>${LET[q.c]}</b>${(!ok&&!bl)?` (marcaste la ${LET[a.cur]})`:''}</p>
    ${changedRight?`<p class="intu">Tu primera opción era la correcta. Cambiarla te costó el punto: confía más en tu primera lectura.</p>`:''}
    ${ok&&a.conf==='dudo'?`<p class="intu">Dudabas y acertaste. Lo sabías más de lo que creías.</p>`:''}
    ${a.nose?`<p class="intu">Marcaste «No lo sé». Está guardada en Estudiar: lee la explicación y el artículo con calma.</p>`:''}
    ${q.razon?`<h4>Cómo llegar a la respuesta</h4><p class="razon">${esc(q.razon)}</p>`:''}
    <h4>Explicación</h4><p>${esc(q.e)}</p>
    ${srcBlock(q)}
    ${!ok?`<h4>Por qué pudiste fallar</h4><p>${esc(q.t)}</p><p class="trap"><b>${T.n}.</b> ${T.tip}</p>`:''}
  </div>`;
}

function srcBlock(q){
  const te=temaEdital(q.tema)[0];
  const fund=q.f||(q.e.match(/(Art(?:s)?\.\s[^:;]*?(?:CE|Ley \d+\/\d+|TREBEP|RGPD|LOPDGDD|TUE|TFUE|LO \d+\/\d+|RD \d+\/\d+))/)||[])[1]||(q.id.startsWith('g')?'Cálculo (psicotécnico generado)':te?te.normas:'');
  return `<dl class="src">
    <div><dt>Bloque</dt><dd>${esc(BLOCKS[q.b])}</dd></div>
    <div><dt>Tema del programa</dt><dd>${te?(te.n==='P'?'Psicotécnicos':'Tema '+te.n+'. ')+esc(te.n==='P'?'':te.t):'—'}</dd></div>
    <div><dt>Subtema</dt><dd>${esc(q.tema)}${q.sub?' › '+esc(q.sub):''}</dd></div>
    <div><dt>De dónde sale la respuesta</dt><dd><b>${esc(fund)}</b></dd></div>
    ${origenHtml(q)}
    ${audHtml(q)}
  </dl>
  <button class="link small" onclick="reportQ('${q.id}')">Avisar de un error en esta pregunta</button>`;
}
function updateClock(){
  const s=S.cur; if(!s) return; const a=s.ans[s.i]; const pace=s.dur?s.dur/s.qs.length:49;
  const el=$('#ck-total'); if(el){ el.textContent= s.dur?mmss(s.dur-s.elapsed):mmss(s.elapsed); el.classList.toggle('bad',s.dur&&s.dur-s.elapsed<300); }
  const q=$('#ck-q'); if(q){ q.textContent=mmss(a.t); q.classList.toggle('warn',a.t>pace&&a.t<=pace*2); q.classList.toggle('bad',a.t>pace*2); }
  const b=$('#qbar'); if(b){ b.style.width=Math.min(100,a.t/pace*100)+'%'; b.className=a.t>pace*2?'bad':a.t>pace?'warn':''; }
  const p=$('#ck-pace'); if(p&&s.dur){ const expected=s.i*pace, diff=s.elapsed-expected; p.textContent=(diff>0?'+':'−')+mmss(Math.abs(diff)); p.className='v '+(diff>60?'bad':diff>0?'warn':'good'); }
  else if(p){ const answered=s.ans.filter(x=>x.cur!==null).length||1; p.textContent=mmss(s.elapsed/answered)+'/preg'; }
}

function vResult(){
  const s=S.last; if(!s) return vHome(); const r=score(s), m=r.sum;
  const partRow=b=>{ const P=r.parts[b]; if(!P) return ''; const net=P.ac-P.er*S.pen; return `<tr><td>${BLOCKS[b]}</td><td class="good">${P.ac}</td><td class="bad">${P.er}</td><td>${P.bl}</td><td>${nf(Math.round(net*100)/100)}</td><td>${mmss(P.n?P.t/P.n:0)}</td></tr>`; };
  const msgs=[];
  if(m.rw) msgs.push(`<b>${m.rw}</b> ${m.rw===1?'respuesta pasó':'respuestas pasaron'} de correcta a incorrecta porque cambiaste tu primera opción.`);
  if(m.wr) msgs.push(`<b>${m.wr}</b> ${m.wr===1?'cambio fue':'cambios fueron'} a mejor: esos sí tenían un motivo.`);
  if(m.blankRight) msgs.push(`Dejaste en blanco <b>${m.blankRight}</b> que habías empezado a contestar bien.`);
  if(m.dudoN) msgs.push(`Cuando marcaste «Dudo», acertaste <b>${Math.round(m.dudoOk/m.dudoN*100)} %</b> (${m.dudoOk} de ${m.dudoN}).`);
  const firstBetter=m.firstNota>m.nota;
  const verdict = m.nota>=8.5?'Resultado de plaza. Lo sabes.': m.nota>=7?'Muy cerca. Lo que falta es confianza, no temario.': m.nota>=5?'Buena base. Revisa las trampas de abajo.':'Cada fallo de hoy es un punto que no perderás el día del examen.';
  const list=s.qs.map((q,i)=>({q,a:s.ans[i],i})).filter(({q,a})=>{ if(s.mode==='practice'&&!a.checked) return false; const ok=a.cur===q.c, bl=a.cur===null||a.cur===-1;
    return reviewFilter==='all'||(reviewFilter==='wrong'&&!ok&&!bl)||(reviewFilter==='blank'&&bl)||(reviewFilter==='changed'&&a.first!==null&&a.first!==a.cur)||(reviewFilter==='nose'&&a.nose); });
  const slow=s.qs.map((q,i)=>({i,t:s.ans[i].t})).sort((x,y)=>y.t-x.t).slice(0,3);
  return `
  <section class="res-head">
    <p class="eyebrow">${esc(s.title)} · ${new Date(S.hist[0]?.date||Date.now()).toLocaleDateString('es-ES')}</p>
    <div class="score"><span class="big">${nf(m.nota)}</span><span class="of">sobre 10</span></div>
    <p class="lead">${verdict}</p>
    <div class="stats"><span><b class="good">${m.ac}</b> aciertos</span><span><b class="bad">${m.er}</b> errores</span><span><b>${m.bl}</b> en blanco</span><span>Netas: <b>${nf(m.net)}</b></span><span>Tiempo: <b>${mmss(m.time)}</b></span></div>
  </section>
  ${msgs.length||firstBetter?`<section class="intu-box"><h3>Tu intuición</h3>${msgs.map(x=>`<p>${x}</p>`).join('')}${firstBetter?`<p class="hl">Con tus primeras respuestas, sin cambiar ninguna, habrías sacado <b>${nf(m.firstNota)}</b> en lugar de ${nf(m.nota)}.</p>`:''}${m.rw>m.wr?`<p class="tip">Regla para el examen: solo cambia una respuesta si encuentras un dato concreto que la contradiga. «Me da mala espina» no es un motivo.</p>`:''}</section>`:''}
  <div class="tw"><table class="parts"><thead><tr><th>Parte</th><th>Aciertos</th><th>Errores</th><th>Blanco</th><th>Netas</th><th>Media/preg.</th></tr></thead><tbody>${partRow('1')}${partRow('P')}${partRow('2')}</tbody></table></div>
  <p class="foot">Netas = aciertos − errores × ${penLabel().split(' ')[0]}. La nota sobre 10 es orientativa; la nota oficial depende de las bases de cada convocatoria. Preguntas en las que más tardaste: ${slow.map(x=>`<button class="link" onclick="reviewFilter='all';render();document.getElementById('rq${x.i}')?.scrollIntoView()">nº ${x.i+1} (${mmss(x.t)})</button>`).join(', ')}.</p>
  <div class="filters">${[['wrong','Falladas'],['blank','En blanco'],['nose','No lo sé'],['changed','Cambiadas'],['all','Todas']].map(([k,l])=>`<button class="chip ${reviewFilter===k?'on':''}" onclick="reviewFilter='${k}';render()">${l}</button>`).join('')}</div>
  <div class="review">${list.length?list.map(({q,a,i})=>`<article class="ritem" id="rq${i}"><p class="eyebrow">Nº ${i+1} · ${esc(q.tema)} · ${mmss(a.t)} · ${q.org?'Oficial '+esc(q.org.convocatoria.split(' (')[0])+' (P'+(q.org.parte==='Segunda parte'?2:1)+'-'+q.org.n+')':'Propia'}</p><h4>${esc(q.q)}</h4><ul>${q.opts.map((o,j)=>`<li class="${j===q.c?'right':''} ${a.cur===j&&j!==q.c?'wrong':''}"><b>${LET[j]}</b> ${esc(o)}${a.first===j&&a.first!==a.cur?' <em>(tu primera opción)</em>':''}</li>`).join('')}</ul>${fb(q,a)}</article>`).join(''):'<p class="empty">No hay preguntas en este filtro.</p>'}</div>
  <div class="runnav"><button class="btn" onclick="go('home')">Volver al inicio</button><button class="btn primary" onclick="newSession('${s.kind==='tema'||s.kind==='bloque'?'fails':s.kind}')">${s.kind==='tema'||s.kind==='bloque'?'Repasar falladas':'Otro igual'}</button></div>`;
}

function vProgress(){
  const I=S.intu; const rows=['1','P','2'].map(b=>`<h3>${BLOCKS[b]}</h3><div class="prog">${temasDe(b).map(t=>{const T=S.temas[t]; const tot=T?T.a+T.e:0; const pct=tot?Math.round(T.a/tot*100):null; return `<div class="prow"><span>${esc(t)}</span><span class="pbar"><i class="${pct===null?'':pct>=70?'good':pct>=50?'warn':'bad'}" style="width:${pct||0}%"></i></span><span class="pv">${pct===null?'—':pct+' %'}</span></div>`;}).join('')}</div>`).join('');
  return `<h2 class="vt">Mi progreso</h2>
  <section class="intu-box"><h3>Tu intuición, acumulada</h3>
    <p>Cambios de correcta a incorrecta: <b class="bad">${I.rw}</b> · de incorrecta a correcta: <b class="good">${I.wr}</b></p>
    <p>Acierto cuando marcas «Dudo»: <b>${I.dudoN?Math.round(I.dudoOk/I.dudoN*100)+' %':'—'}</b> · cuando marcas «Segura»: <b>${I.seguraN?Math.round(I.seguraOk/I.seguraN*100)+' %':'—'}</b></p>
    ${I.dudoN>=5&&I.dudoOk/I.dudoN>=0.6?`<p class="hl">Incluso cuando dudas, aciertas la mayoría. Tu duda no es una señal fiable de error.</p>`:''}
  </section>
  ${rows}
  <h3>Historial</h3>
  ${S.hist.length?`<div class="tw"><table class="parts"><thead><tr><th>Fecha</th><th>Prueba</th><th>Nota</th><th>A/E/B</th><th>Primera intuición</th></tr></thead><tbody>${S.hist.map(h=>`<tr><td>${new Date(h.date).toLocaleDateString('es-ES')}</td><td>${esc(h.title)}</td><td><b>${nf(h.nota)}</b></td><td>${h.ac}/${h.er}/${h.bl}</td><td>${h.firstNota>h.nota?`<span class="warn">${nf(h.firstNota)}</span>`:nf(h.firstNota)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="empty">Aún no has hecho ninguna prueba.</p>'}
  `;
}

function vSettings(){
  const ps=[[1/3,'1/3 — Auxiliar Administrativo del Estado (bases recientes)'],[1/4,'1/4'],[1/2,'1/2'],[1,'1 — una errada anula una acertada']];
  const ev=k=>1/k-(k-1)/k*S.pen;
  return `<h2 class="vt">Ajustes</h2>
  <section class="set"><h3>Penalización por error</h3><p class="sub">Comprueba en las bases de tu convocatoria cuánto resta cada error.</p>
  ${ps.map(([v,l])=>`<label class="radio"><input type="radio" name="pen" id="pen${v}" ${Math.abs(S.pen-v)<1e-9?'checked':''} onchange="S.pen=${v};save();render()"> ${l}</label>`).join('')}</section>
  <section class="set"><h3>¿Merece la pena arriesgar?</h3><p class="sub">Valor esperado de responder, con la penalización actual y 4 opciones:</p>
  <div class="tw"><table class="parts"><thead><tr><th>Si dudas entre…</th><th>Ganas de media</th><th>Consejo</th></tr></thead><tbody>
  ${[4,3,2].map(k=>{const v=ev(k);return `<tr><td>${k} opciones</td><td class="${v>0.001?'good':v<-0.001?'bad':''}">${v>0?'+':''}${nf(Math.round(v*1000)/1000)} puntos</td><td>${v>0.001?'Responde':v<-0.001?'Mejor en blanco':'Da igual'}</td></tr>`;}).join('')}
  </tbody></table></div>
  <p class="sub">Con penalización 1/3, si has descartado al menos una opción, responder te favorece de media.</p></section>
  <section class="set"><h3>Copia de seguridad</h3><p class="sub">Tu progreso se guarda solo en este navegador. Para pasarlo a otro dispositivo, copia el código y pégalo allí.</p>
  <textarea id="bk" rows="3" readonly>${btoa(unescape(encodeURIComponent(JSON.stringify({...S,cur:null,last:null}))))}</textarea>
  <div class="row"><button class="btn" onclick="copyBk()">Copiar código</button><span id="bkmsg" class="sub"></span></div>
  <textarea id="bkin" rows="3" placeholder="Pega aquí un código para restaurar"></textarea>
  <div class="row"><button class="btn" onclick="restoreBk()">Restaurar</button></div>
  <div class="row"><button class="btn danger" onclick="resetStep()">${resetArm?'Pulsa otra vez para borrar todo':'Borrar todo el progreso'}</button></div></section>`;
}
let resetArm=false;
function resetStep(){ if(!resetArm){resetArm=true;render();return;} S={pen:S.pen,seen:{},temas:{},hist:[],cur:null,intu:{rw:0,wr:0,dudoOk:0,dudoN:0,seguraOk:0,seguraN:0}}; resetArm=false; save(); render(); }
function copyBk(){ const t=$('#bk'); navigator.clipboard?.writeText(t.value).then(()=>{$('#bkmsg').textContent='Copiado';}).catch(()=>{t.select();$('#bkmsg').textContent='Selecciona y copia el texto';}) ?? (t.select()); }
function restoreBk(){ try{ const d=JSON.parse(decodeURIComponent(escape(atob($('#bkin').value.trim())))); S=Object.assign(S,d); save(); go('progress'); }catch(e){ $('#bkin').value=''; $('#bkin').placeholder='Ese código no es válido. Cópialo de nuevo completo.'; } }

