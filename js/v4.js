
// ---------- v6: cuentas (Supabase): login, sincronización, sesión única, acceso ----------
const SB_URL='https://dftqzjbniwbxbkpeuobf.supabase.co', SB_KEY='sb_publishable_dxtNbLkfXEXgVLANVrwuuA_mgcaMHSS';
const REQUIRE_LOGIN=/github\.io$|tulosabes/i.test(location.hostname);
const AUTH={sb:null,user:null,ok:false,state:'cargando',msg:'',token:null,timer:null,syncT:null};
function sbReady(){ try{ if(!AUTH.sb&&window.supabase) AUTH.sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,detectSessionInUrl:true}}); }catch(e){} return AUTH.sb; }

function vLogin(){
  const st=AUTH.state, m=AUTH.msg?`<p class="note">${esc(AUTH.msg)}</p>`:'';
  if(st==='cargando') return `<section class="login"><h1>Tú Lo Sabes</h1><p class="sub">Cargando…</p></section>`;
  if(st==='sinacceso') return `<section class="login"><h1>Casi lista</h1><p class="lead">Tu cuenta (${esc(AUTH.user&&AUTH.user.email||'')}) todavía no tiene acceso al simulador.</p><p class="sub">Si ya lo has contratado, escribe a soporte con este correo. El acceso se activa en cuanto se confirma.</p>${m}<button class="btn" onclick="logout()">Cerrar sesión</button></section>`;
  const reg=st==='registro';
  return `<section class="login">
    <p class="eyebrow">Auxiliar Administrativo del Estado · C2</p><h1>Tú Lo Sabes</h1>
    <p class="lead">${reg?'Crea tu cuenta para guardar tu progreso en todos tus dispositivos.':'Entra para seguir donde lo dejaste, en el móvil o en el ordenador.'}</p>
    ${m}
    <div class="oauth"><button class="btn" onclick="oauth('google')">Continuar con Google</button><button class="btn" onclick="oauth('facebook')">Continuar con Facebook</button></div>
    <p class="or">o con tu correo</p>
    <form onsubmit="event.preventDefault();emailAuth()">
      ${reg?`<label class="fl"><span>Tu nombre</span><input id="lg_n" autocomplete="given-name" required placeholder="Cómo quieres que te saludemos"></label>`:''}
      <label class="fl"><span>Correo electrónico</span><input id="lg_e" type="email" autocomplete="email" required></label>
      <label class="fl"><span>Contraseña${reg?' (mínimo 8 caracteres)':''}</span><input id="lg_p" type="password" minlength="${reg?8:6}" autocomplete="${reg?'new-password':'current-password'}" required></label>
      <button class="btn primary" type="submit" id="lg_b">${reg?'Crear cuenta':'Entrar'}</button>
    </form>
    <p class="sub">${reg?'¿Ya tienes cuenta? <button class="link" onclick="AUTH.state=\'login\';AUTH.msg=\'\';render()">Entrar</button>':'¿Primera vez? <button class="link" onclick="AUTH.state=\'registro\';AUTH.msg=\'\';render()">Crear cuenta</button>'}</p>
    <p class="sub fine">Solo se permite una sesión abierta por cuenta: si entras en otro dispositivo, se cerrará la anterior.</p>
    <p class="sub fine">El acceso es personal e intransferible. Está prohibido copiar, descargar o extraer las preguntas, también mediante robots o herramientas de inteligencia artificial. Cada pantalla lleva una marca con tu correo.</p>
  </section>`;
}
async function emailAuth(){ const sb=sbReady(); if(!sb) return; const e=$('#lg_e').value.trim().toLowerCase(), p=$('#lg_p').value, b=$('#lg_b'); b.disabled=true;
  try{ const r= AUTH.state==='registro' ? await sb.auth.signUp({email:e,password:p,options:{emailRedirectTo:location.origin+location.pathname,data:{nombre:($('#lg_n')||{}).value?.trim()||''}}}) : await sb.auth.signInWithPassword({email:e,password:p});
    if(r.error) throw r.error; if(!r.data.session){ AUTH.msg='Revisa tu correo para confirmar la cuenta y después entra.'; AUTH.state='login'; render(); return; }
    await afterLogin(r.data.session.user);
  }catch(err){ AUTH.msg=traduce(err.message); b.disabled=false; render(); } }
function traduce(m){ m=String(m||''); if(/Invalid login/i.test(m)) return 'Correo o contraseña incorrectos.'; if(/already registered/i.test(m)) return 'Ese correo ya tiene cuenta. Pulsa «Entrar».'; if(/Password should/i.test(m)) return 'La contraseña debe tener al menos 8 caracteres.'; if(/provider is not enabled|Unsupported provider/i.test(m)) return 'Este acceso estará disponible muy pronto. Usa tu correo y contraseña.'; if(/rate limit/i.test(m)) return 'Demasiados intentos. Espera unos minutos.'; return 'No se pudo completar: '+m; }
async function oauth(provider){ const sb=sbReady(); if(!sb) return; const {error}=await sb.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+location.pathname}}); if(error){ AUTH.msg=traduce(error.message); render(); } }

async function afterLogin(user){
  if(AUTH.busy||AUTH.ok) return; AUTH.busy=true; try{ await _afterLogin(user); } finally { AUTH.busy=false; } }
async function _afterLogin(user){
  const sb=sbReady(); AUTH.user=user;
  const {data:prof,error}=await sb.from('profiles').select('access,active_session,features').eq('id',user.id).maybeSingle(); AUTH.features=(prof&&prof.features)||[];
  if(error||!prof||!prof.access){ AUTH.state='sinacceso'; AUTH.ok=false; render(); return; }
  // sesión única
  AUTH.token=(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)); try{ sessionStorage.setItem('mls_tok',AUTH.token); }catch(e){}
  await sb.from('profiles').update({active_session:AUTH.token,session_at:new Date().toISOString()}).eq('id',user.id);
  // progreso: el más reciente gana
  const {data:pr}=await sb.from('progress').select('state,updated_at').eq('user_id',user.id).maybeSingle();
  const localTs=S._ts||0, srvTs=pr&&pr.state&&pr.state._ts||0;
  if(pr&&srvTs>localTs){ S=Object.assign({pen:1/3,seen:{},temas:{},hist:[],cur:null,intu:{rw:0,wr:0,dudoOk:0,dudoN:0,seguraOk:0,seguraN:0}},pr.state); _saveLocal(); }
  else pushProgress(true);
  AUTH.ok=true; AUTH.state='ok'; AUTH.msg=''; view='home'; render();
  clearInterval(AUTH.timer); AUTH.timer=setInterval(checkSession,30000);
}
async function checkSession(){ const sb=sbReady(); if(!sb||!AUTH.user) return;
  const {data}=await sb.from('profiles').select('active_session,access').eq('id',AUTH.user.id).maybeSingle();
  if(data&&(data.active_session!==AUTH.token||!data.access)){ clearInterval(AUTH.timer); await sb.auth.signOut(); AUTH.ok=false; AUTH.user=null; AUTH.state='login';
    AUTH.msg=data.access?'Se ha iniciado sesión con tu cuenta en otro dispositivo, así que aquí se ha cerrado. Tu progreso está guardado.':'Tu acceso ha caducado.'; render(); } }
document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&AUTH.ok) checkSession(); });
async function logout(){ const sb=sbReady(); clearInterval(AUTH.timer); await pushProgress(true); if(sb) await sb.auth.signOut(); AUTH.ok=false; AUTH.user=null; AUTH.state='login'; AUTH.msg=''; render(); }

// guardar: local + nube (con retardo)
const _saveLocal=save;
save=function(){ S._ts=Date.now(); _saveLocal(); if(AUTH.ok){ clearTimeout(AUTH.syncT); AUTH.syncT=setTimeout(()=>pushProgress(),3000); } };
async function pushProgress(now){ const sb=sbReady(); if(!sb||!AUTH.user) return; try{ await sb.from('progress').upsert({user_id:AUTH.user.id,state:S,updated_at:new Date().toISOString()}); }catch(e){} }
window.addEventListener('pagehide',()=>{ if(AUTH.ok) pushProgress(true); });

// barra de cuenta en Inicio y Ajustes
function userName(){ const m=(AUTH.user&&AUTH.user.user_metadata)||{}; const n=m.nombre||m.given_name||m.full_name||m.name||S.nombre||''; return String(n).trim().split(/\s+/)[0]||''; }
async function setNombre(n){ n=n.trim(); S.nombre=n; save(); const sb=sbReady(); if(AUTH.ok&&sb){ const r=await sb.auth.updateUser({data:{nombre:n}}); if(r.data&&r.data.user) AUTH.user=r.data.user; } render(); }
const _vSettings=vSettings; vSettings=function(){ return _vSettings()+`<section class="set"><h3>Tu nombre</h3><div class="row"><input id="st_n" class="search" value="${esc(userName())}" placeholder="Tu nombre"><button class="btn" onclick="setNombre($('#st_n').value)">Guardar</button></div></section>`+(AUTH.ok?`<section class="set"><h3>Cuenta</h3><p>Conectada como <b>${esc(AUTH.user.email||'')}</b>. Tu progreso se guarda en la nube y lo verás en cualquier dispositivo.</p><button class="btn" onclick="logout()">Cerrar sesión</button></section>`:''); };
function topBar(){ const n=userName(); return `<header class="topbar"><span class="brand">Tú Lo Sabes</span><span class="hello">${n?'Hola, <b>'+esc(n)+'</b>':''}${AUTH.ok?' · <span class="sync" title="Progreso sincronizado">☁</span> <button class="link" onclick="logout()">Salir</button>':''}</span></header>`; }

// puerta de acceso
const _render1=render;
render=function(){ if(REQUIRE_LOGIN&&!AUTH.ok){ $('#app').innerHTML=vLogin(); $('#nav').hidden=true; return; } _render1(); if(view!=='run') $('#app').insertAdjacentHTML('afterbegin',topBar()); };
async function bootAuth(){
  if(!REQUIRE_LOGIN) return;
  let tries=0; while(!window.supabase&&tries++<50) await new Promise(r=>setTimeout(r,100));
  const sb=sbReady(); if(!sb){ AUTH.state='login'; AUTH.msg='No se pudo conectar. Revisa tu conexión y recarga la página.'; render(); return; }
  const {data}=await sb.auth.getSession();
  if(data.session) await afterLogin(data.session.user); else { AUTH.state='login'; render(); }
  sb.auth.onAuthStateChange((ev,session)=>{ if(ev==='SIGNED_IN'&&session&&!AUTH.ok) afterLogin(session.user); });
}
