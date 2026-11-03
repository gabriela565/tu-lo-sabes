
// ---------- v9: soporte, datos de contacto, consentimiento de ofertas, privacidad ----------
var SUPPORT_EMAIL_V='gbsmedeiros@gmail.com';
// perfil de contacto: nombre, proveedor de acceso y última visita
async function syncProfile(){ const sb=sbReady(); if(!sb||!AUTH.user) return; const m=AUTH.user.user_metadata||{}; const prov=(AUTH.user.app_metadata&&AUTH.user.app_metadata.provider)||'email';
  const upd={nombre:(m.nombre||m.full_name||m.name||'').trim()||null,proveedor:prov,last_seen_at:new Date().toISOString()};
  if(AUTH.pendingMkt!==undefined){ upd.marketing=!!AUTH.pendingMkt; upd.marketing_at=new Date().toISOString(); delete AUTH.pendingMkt; }
  await sb.from('profiles').update(upd).eq('id',AUTH.user.id);
  const {data}=await sb.from('profiles').select('marketing').eq('id',AUTH.user.id).maybeSingle(); AUTH.marketing=!!(data&&data.marketing); }
const _postTerms0=postTerms; postTerms=async function(){ await syncProfile(); await _postTerms0(); };
// en el aviso inicial: casilla opcional (desmarcada) de ofertas
const _termsHtml0=termsHtml; termsHtml=function(){ return _termsHtml0()+`<label class="ck mk"><input type="checkbox" id="tm_mk"> Quiero recibir por correo ofertas, novedades y avisos de renovación de Tú Lo Sabes. Es opcional y puedo darme de baja cuando quiera en Ajustes.</label>`; };
const _acceptTerms0=acceptTerms; acceptTerms=async function(){ const mk=document.getElementById('tm_mk'); if(mk) AUTH.pendingMkt=mk.checked; await _acceptTerms0(); };
async function setMarketing(v){ const sb=sbReady(); await sb.from('profiles').update({marketing:v,marketing_at:new Date().toISOString()}).eq('id',AUTH.user.id); AUTH.marketing=v; render(); }
const _vSettings7=vSettings; vSettings=function(){ return _vSettings7()+(AUTH.ok?`<section class="set"><h3>Comunicaciones</h3><label class="ck"><input type="checkbox" ${AUTH.marketing?'checked':''} onchange="setMarketing(this.checked)"> Recibir ofertas, novedades y avisos de renovación por correo</label><p class="sub">Los avisos sobre tu cuenta y tu suscripción se envían siempre. <button class="link" onclick="location.hash='privacidad'">Política de privacidad</button></p></section>`:''); };
// soporte
const _vAyuda0=vAyuda; vAyuda=function(){ return _vAyuda0().replace(/Envíalo a: <b>[\s\S]*?<\/b>/,`Envíalo a: <b class="sel">${SUPPORT_EMAIL_V}</b> <button class="link" onclick="navigator.clipboard&&navigator.clipboard.writeText('${SUPPORT_EMAIL_V}').then(()=>{this.textContent='copiado'})">copiar correo</button> · <a href="mailto:${SUPPORT_EMAIL_V}?subject=${encodeURIComponent('[Tú Lo Sabes] Soporte')}">abrir mi correo</a>`); };
// política de privacidad pública (#privacidad)
function vPrivacidad(){ return `<section class="legal"><p class="eyebrow">Tú Lo Sabes</p><h1>Política de privacidad</h1>
 <p><b>Contacto:</b> <span class="sel">${SUPPORT_EMAIL_V}</span></p>
 <h3>Qué datos tratamos</h3><p>Tu correo electrónico, tu nombre, el método de acceso (correo, Google o Facebook), tu progreso de estudio, la aceptación de las condiciones de uso y, si lo autorizas, tu consentimiento para recibir comunicaciones comerciales.</p>
 <h3>Para qué</h3><ul><li>Prestarte el servicio: cuenta, sincronización del progreso y soporte (base: ejecución del contrato).</li><li>Proteger el contenido frente a copias y usos indebidos: sesión única, límites de uso y registro de accesos (base: interés legítimo).</li><li>Enviarte ofertas, novedades y avisos de renovación solo si marcas la casilla correspondiente (base: consentimiento, que puedes retirar en Ajustes en cualquier momento).</li></ul>
 <h3>Cuánto tiempo</h3><p>Mientras tengas cuenta. Si la eliminas, borramos tus datos salvo los que la ley obligue a conservar.</p>
 <h3>Con quién</h3><p>No vendemos tus datos. Los almacena nuestro proveedor de base de datos (Supabase). Si entras con Google o Facebook, ellos nos facilitan tu nombre y correo.</p>
 <h3>Tus derechos</h3><p>Puedes pedir acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <span class="sel">${SUPPORT_EMAIL_V}</span>. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
 <h3>Eliminación de datos</h3><p>Para borrar tu cuenta y tus datos, escribe a <span class="sel">${SUPPORT_EMAIL_V}</span> con el asunto «Eliminar mi cuenta» desde el correo con el que te registraste. Lo hacemos en un plazo máximo de 30 días.</p>
 <p><a href="#" onclick="location.hash='';return false">Volver</a></p></section>`; }
const _render6=render; render=function(){ if(location.hash==='#privacidad'){ $('#app').innerHTML=vPrivacidad(); $('#nav').hidden=true; return; } _render6(); };
window.addEventListener('hashchange',()=>render());
// enlace a la política en la pantalla de acceso
const _vLogin0=vLogin; vLogin=function(){ return _vLogin0().replace('</section>',`<p class="sub fine"><a href="#privacidad">Política de privacidad</a> · Soporte: <span class="sel">${SUPPORT_EMAIL_V}</span></p></section>`); };
// penalización: las dos reglas visibles en Inicio
function penPick(v){ S.pen=v; save(); render(); }
const _vHomePen=vHome; vHome=function(){ return _vHomePen().replace(/<p class="foot">Penalización activa:[\s\S]*?<\/p>/,`<section class="set pen"><h3>¿Cuánto resta cada error en tu examen?</h3><div class="ckl">
 <label class="ck"><input type="radio" name="penh" ${Math.abs(S.pen-1/3)<1e-9?'checked':''} onchange="penPick(1/3)"> 1/3 de acierto <small>(Auxiliar del Estado)</small></label>
 <label class="ck"><input type="radio" name="penh" ${S.pen===1?'checked':''} onchange="penPick(1)"> Una errada anula una acertada</label></div>
 <p class="sub">Elige la regla de las bases de tu convocatoria. Se aplica a las notas de todos tus simulacros.</p></section>`); };
// Google/Facebook: el botón solo aparece cuando el proveedor está activado en el servidor
AUTH.providers=null;
fetch(SB_URL+'/auth/v1/settings',{headers:{apikey:SB_KEY}}).then(r=>r.json()).then(j=>{ AUTH.providers=(j&&j.external)||{}; if(!AUTH.ok) render(); }).catch(()=>{ AUTH.providers={}; });
const _vLogin1=vLogin; vLogin=function(){ let h=_vLogin1(); const P=AUTH.providers||{};
  if(!P.google) h=h.replace(/<button class="btn" onclick="oauth\('google'\)">[^<]*<\/button>/,'');
  if(!P.facebook) h=h.replace(/<button class="btn" onclick="oauth\('facebook'\)">[^<]*<\/button>/,'');
  if(!P.google&&!P.facebook) h=h.replace(/<div class="oauth"><\/div>\s*<p class="or">o con tu correo<\/p>/,'');
  return h; };
