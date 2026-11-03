
// ---------- v8: banco protegido en el servidor + medidas anti-copia ----------
const FULLKEYS=['q','o','tt','e','t','f','razon','aud','basada_en'];
let BANK_STATE='vacio'; // vacio | cargando | ok | error
function setBank(rows){ BANK.length=0; Object.keys(BYID).forEach(k=>delete BYID[k]);
  rows.forEach(r=>{ const org=r.conv?{tipo:'oficial',convocatoria:r.conv,ambito:r.ambito,fecha:r.fecha,parte:r.parte,n:r.n,reserva:r.reserva,prueba:r.prueba,organismo:r.organismo,modelo:r.modelo,url:r.url,plantilla:r.plantilla,plantilla_tipo:r.plantilla_tipo}:null;
    const q={id:r.id,b:r.b,tema:r.tema,sub:r.sub||'',dif:r.dif||'',org,aud:{s:org?'oficial':'ok'}}; BANK.push(q); BYID[q.id]=q; }); }
async function loadMeta(){ const sb=sbReady(); BANK_STATE='cargando'; const {data,error}=await sb.rpc('bank_meta'); if(error){ BANK_STATE='error'; AUTH.msg=error.message; return; } setBank(data||[]); BANK_STATE='ok'; }
const isFull=q=>q&&Array.isArray(q.o);
async function fetchFull(ids){ const sb=sbReady(); const miss=[...new Set(ids)].filter(id=>BYID[id]&&!isFull(BYID[id])); if(!miss.length) return true;
  for(let i=0;i<miss.length;i+=110){ const {data,error}=await sb.rpc('get_questions',{ids:miss.slice(i,i+110)});
    if(error){ AUTH.msg=/limite_diario/.test(error.message)?'Has llegado al máximo de preguntas de hoy. Mañana podrás seguir. Así protegemos el banco de copias automáticas.':'No se pudieron cargar las preguntas. Revisa tu conexión.'; return false; }
    (data||[]).forEach(r=>{ const d=r.data||{}; FULLKEYS.forEach(k=>{ if(d[k]!==undefined) BYID[r.id][k]=d[k]; }); }); }
  return true; }
// los tests se crean con preguntas «ligeras» y se completan desde el servidor
const _toItem=toItem; toItem=function(q){ return isFull(q)?_toItem(q):{...q,opts:null,c:-1,_lazy:true}; };
const _newSession=newSession; newSession=function(kind,opt){ _newSession(kind,opt); hydrateCur(); };
async function hydrateCur(){ const s=S.cur; if(!s) return; const lazy=s.qs.filter(q=>q._lazy).map(q=>q.id); if(!lazy.length) return;
  const ok=await fetchFull(lazy); if(!ok){ S.cur=null; save(); go('home'); return; }
  s.qs=s.qs.map(q=>q._lazy?_toItem(BYID[q.id]):q); save(); render(); }
const _vRun=vRun; vRun=function(){ if(S.cur&&S.cur.qs.some(q=>q._lazy)) return `<section class="login"><p class="sub">Preparando tu test…</p>${AUTH.msg?`<p class="note">${esc(AUTH.msg)}</p>`:''}</section>`; return _vRun(); };
// vistas que muestran textos: cargan solo lo necesario
function needFull(ids,cb){ const miss=ids.filter(id=>BYID[id]&&!isFull(BYID[id])); if(!miss.length) return true; fetchFull(miss.slice(0,110)).then(()=>render()); return false; }
const _vEstudiar=vEstudiar; vEstudiar=function(){ const ids=[...Object.keys(S.nose||{}),...Object.entries(S.seen).filter(([id,r])=>!r.ok).map(([id])=>id)].filter(id=>BYID[id]); if(!needFull(ids)) return '<p class="sub">Cargando…</p>'; return _vEstudiar(); };
const _reportQ=reportQ; reportQ=function(id){ if(!isFull(BYID[id])) BYID[id].q=BYID[id].q||''; _reportQ(id); };
const _vHome2=vHome; vHome=function(){ if(!REQUIRE_LOGIN&&!BANK.length) return `<section class="hero"><h1>Tú Lo Sabes</h1><p class="lead">Esta copia no contiene el banco de preguntas. Entra en la versión oficial con tu cuenta.</p></section>`; return _vHome2(); };
// tras iniciar sesión, cargar el índice del banco
const TERMS_V='2026-11-03';
const _afterLoginOrig=_afterLogin; _afterLogin=async function(user){ await _afterLoginOrig(user); if(!AUTH.ok) return;
  const {data:pf}=await sbReady().from('profiles').select('terms_version').eq('id',user.id).maybeSingle();
  if(!pf||pf.terms_version!==TERMS_V){ showTerms(true); return; }
  await postTerms(); };
async function postTerms(){ await loadMeta(); if(S.cur&&S.cur.qs.some(q=>!q.opts)) hydrateCur(); render(); }
function termsHtml(){ return `<h2>Aviso de seguridad y condiciones de uso</h2>
  <p class="sub">Versión ${TERMS_V}. Léelo antes de continuar.</p>
  <ol class="terms">
   <li><b>Acceso personal.</b> Tu cuenta es personal e intransferible. No compartas tu correo ni tu contraseña. Solo puede haber una sesión abierta: si entras desde otro dispositivo, la anterior se cierra.</li>
   <li><b>Contenido protegido.</b> Las preguntas de elaboración propia, las explicaciones, los razonamientos y la organización del banco están protegidos como obra y como base de datos (Texto Refundido de la Ley de Propiedad Intelectual, en particular sus arts. 12 y 133 y siguientes). Las preguntas de exámenes oficiales se muestran con fines de estudio, indicando su origen.</li>
   <li><b>Prohibido copiar o extraer.</b> No está permitido copiar, descargar, fotografiar de forma sistemática, reproducir ni redistribuir las preguntas, ni extraerlas mediante robots, scripts, extensiones o herramientas de inteligencia artificial.</li>
   <li><b>Marca de agua y registro.</b> Cada pantalla muestra tu correo y la fecha. Para proteger el servicio registramos los inicios de sesión y el número de preguntas consultadas. Hay un límite diario de preguntas por cuenta.</li>
   <li><b>Consecuencias.</b> El incumplimiento permite suspender o cancelar la cuenta sin reembolso y ejercer las acciones legales que correspondan.</li>
   <li><b>Tus datos.</b> Tratamos tu correo, tu nombre y tu progreso de estudio únicamente para prestarte el servicio y proteger su contenido. Puedes pedir el acceso, la rectificación o la supresión de tus datos desde la sección Ayuda.</li>
  </ol>`; }
function showTerms(gate){ let m=document.getElementById('termsmodal'); if(!m){ m=document.createElement('div'); m.id='termsmodal'; document.body.appendChild(m); }
  m.innerHTML=`<div class="tm-card">${termsHtml()}${gate?`<label class="ck"><input type="checkbox" id="tm_ok" onchange="document.getElementById('tm_b').disabled=!this.checked">He leído y acepto el aviso de seguridad y las condiciones de uso</label>
   <div class="row"><button class="btn primary" id="tm_b" disabled onclick="acceptTerms()">Aceptar y continuar</button><button class="btn" onclick="document.getElementById('termsmodal').remove();logout()">No acepto</button></div>`:`<div class="row"><button class="btn primary" onclick="document.getElementById('termsmodal').remove()">Cerrar</button></div>`}</div>`; }
async function acceptTerms(){ const b=document.getElementById('tm_b'); b.disabled=true; const sb=sbReady();
  const {error}=await sb.from('profiles').update({terms_version:TERMS_V,terms_at:new Date().toISOString(),terms_ua:navigator.userAgent.slice(0,200)}).eq('id',AUTH.user.id);
  if(error){ b.disabled=false; b.textContent="No se pudo guardar. Inténtalo de nuevo"; return; } document.getElementById('termsmodal').remove(); await postTerms(); }
const _vSettings6=vSettings; vSettings=function(){ return _vSettings6()+`<section class="set"><h3>Aviso de seguridad y condiciones</h3><p class="sub">Aceptado en tu cuenta (versión ${TERMS_V}).</p><button class="btn" onclick="showTerms(false)">Leer de nuevo</button></section>`; };

// ---------- disuasión de copia ----------
(function(){
  const block=e=>{ if(e.target.closest&&e.target.closest('input,textarea')) return; e.preventDefault(); };
  ['copy','cut','contextmenu','dragstart','selectstart'].forEach(ev=>document.addEventListener(ev,block));
  document.addEventListener('keydown',e=>{ const k=(e.key||'').toLowerCase(); if((e.metaKey||e.ctrlKey)&&['c','x','p','s','u','a'].includes(k)&&!(e.target.closest&&e.target.closest('input,textarea'))){ e.preventDefault(); } if(k==='f12'){ e.preventDefault(); } });
  const st=document.createElement('style'); st.textContent='#app{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}#app input,#app textarea{-webkit-user-select:text;user-select:text}@media print{body{display:none!important}}#wm{position:fixed;inset:0;pointer-events:none;z-index:30;opacity:.06;overflow:hidden;font:600 14px var(--f-body);color:var(--ink);display:flex;flex-wrap:wrap;gap:60px 80px;padding:40px;transform:rotate(-18deg) scale(1.3)}'; document.head.appendChild(st);
})();
function watermark(){ let w=document.getElementById('wm'); if(!AUTH.ok){ if(w) w.remove(); return; } if(!w){ w=document.createElement('div'); w.id='wm'; w.setAttribute('aria-hidden','true'); document.body.appendChild(w); }
  const t=(AUTH.user.email||'')+' · '+new Date().toLocaleDateString('es-ES'); if(w.dataset.t!==t){ w.dataset.t=t; w.textContent=''; for(let i=0;i<60;i++){ const s=document.createElement('span'); s.textContent=t; w.appendChild(s);} } }
const _render2=render; render=function(){ _render2(); watermark(); };
// con cuenta en la nube, la copia de seguridad manual ya no hace falta
const _vSettings5=vSettings; vSettings=function(){ const h=_vSettings5(); if(!REQUIRE_LOGIN) return h; const rep='<section class="set"><h3>Tu progreso</h3><p class="sub">Se guarda automáticamente en tu cuenta y lo verás en cualquier dispositivo al entrar con tu correo.</p><div class="row"><button class="btn danger" onclick="resetStep()">'+(resetArm?'Pulsa otra vez para borrar todo':'Borrar todo mi progreso')+'</button></div></section>'; return h.replace(/<section class="set"><h3>Copia de seguridad<\/h3>[\s\S]*?<\/section>/,rep); };
// ---------- módulo Impugnar: servicio aparte (solo cuentas con la función contratada) ----------
const hasFeat=f=>!REQUIRE_LOGIN||(AUTH.features||[]).includes(f);
function vImpLocked(){ return `<h2 class="vt">Corrector e impugnaciones</h2>
  <section class="set"><p class="lead">Servicio aparte</p>
  <p>Cuando se publique la plantilla provisional, nuestro corrector compara tus respuestas, detecta las preguntas impugnables según el temario y la normativa, y prepara el escrito de alegaciones al Tribunal listo para presentar.</p>
  <button class="btn primary" onclick="ayudaPre='Quiero contratar el servicio de corrector e impugnaciones.';S.ayudaTipo='ayuda';go('ayuda')">Solicitar información</button></section>`; }
const _render3=render; render=function(){ if(view==='impugnar'&&!hasFeat('impugnar')){ _render3(); $('#app').innerHTML=(AUTH.ok?topBar():'')+vImpLocked(); }else _render3();
  const nb=document.querySelector('#nav [data-v="impugnar"]'); if(nb) nb.hidden=!hasFeat('impugnar'); };
