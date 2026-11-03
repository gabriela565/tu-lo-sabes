
// ---------- v5: auditoría, filtros, estudiar, notas, ayuda ----------
const SUPPORT_EMAIL='';  // pendiente: correo de soporte
function audHtml(q){ const A=q.aud||{};
  const m={ok:['good','Auditada','Resuelta a ciegas por la banca de auditoría: coincide con la respuesta del banco.'],
    oficial:['good','Plantilla oficial','Respuesta según la plantilla definitiva publicada por el tribunal.'],
    corr:['warn','Corregida','La banca de auditoría corrigió la respuesta original.'],
    aviso:['warn','Aviso de vigencia','La norma puede haber cambiado; compruébala en el BOE.']}[A.s]||['bad','Sin auditar',''];
  return `<div class="orig"><dt>Auditoría</dt><dd><span class="pill ${m[0]}">${m[1]}</span> ${esc(m[2])}${A.n?' <em>'+esc(A.n)+'</em>':''}</dd></div>`; }
const anyo=q=>q.org&&q.org.fecha?q.org.fecha.slice(-4):'';
function bFilter(q,B){
  if(q.org){ if(!B.srcs.includes(q.org.convocatoria)) return false; } else if(!B.srcs.includes('propia')) return false;
  if(B.temas.length&&!B.temas.includes(q.tema)) return false;
  if((B.subs||[]).length&&!B.subs.includes(q.tema+'›'+q.sub)) return false;
  if((B.difs||[]).length&&!B.difs.includes(q.dif)) return false;
  if((B.ambitos||[]).length&&!(q.org&&B.ambitos.includes(q.org.ambito))) return false;
  if((B.anyos||[]).length&&!B.anyos.includes(anyo(q))) return false;
  const st=B.estado||'todas'; const r=S.seen[q.id];
  if(st==='nuevas'&&r) return false; if(st==='falladas'&&!(r&&!r.ok)) return false;
  if(st==='nose'&&!(S.nose&&S.nose[q.id])) return false; if(st==='notas'&&!(S.notes&&S.notes[q.id])) return false;
  if(B.soloAud&&!(q.aud&&['ok','oficial','corr'].includes(q.aud.s))) return false;
  return true; }
function bld(){ const B=S.builder||(S.builder={srcs:[],temas:[],n:20,timed:true}); ['subs','difs','ambitos','anyos'].forEach(k=>{if(!B[k])B[k]=[];}); if(!B.srcs.length) B.srcs=[...convocatorias(),'propia']; return B; }
const ck=(k,v,l,B)=>`<label class="ck"><input type="checkbox" ${B[k].includes(v)?'checked':''} onchange="bTog('${k}','${String(v).replace(/'/g,"\\'")}',this.checked)">${esc(l)}</label>`;
function vExamenes(){
  const B=bld(); const convs=convocatorias();
  const card=c=>{ const qs=BANK.filter(q=>q.org&&q.org.convocatoria===c), f=qs[0].org, res=qs.filter(q=>q.org.reserva).length, seen=qs.filter(q=>S.seen[q.id]).length;
    return `<article class="ex"><span class="pill good">Oficial · ${esc(f.ambito)}</span><h4>${esc(f.prueba)} · ${esc(f.fecha)}</h4>
    <p>${esc(c)} · ${esc(f.organismo)} · modelo ${esc(f.modelo)}</p><p>${qs.length} preguntas (${res} de reserva) · plantilla ${esc(f.plantilla_tipo||'definitiva')} · vistas ${seen}/${qs.length}</p>
    <p><a href="${esc(f.url)}" target="_blank" rel="noopener">Cuadernillo</a> · <a href="${esc(f.plantilla)}" target="_blank" rel="noopener">Plantilla</a> · <button class="link" onclick="newSession('oficial',{conv:'${c.replace(/'/g,"\\'")}'})">Hacer este examen completo</button></p></article>`; };
  const prop=BANK.filter(q=>!q.org).length;
  const temas=['1','P','2'].map(b=>`<p class="k sm">${BLOCKS[b]}</p><div class="ckl">${temasDe(b).map(t=>ck('temas',t,t,B)).join('')}</div>`).join('');
  const subsAvail=B.temas.length?[...new Set(BANK.filter(q=>B.temas.includes(q.tema)&&q.sub).map(q=>q.tema+'›'+q.sub))]:[];
  const ambs=[...new Set(BANK.filter(q=>q.org).map(q=>q.org.ambito))], anys=[...new Set(BANK.filter(q=>q.org).map(anyo))].sort();
  const pool=BANK.filter(q=>bFilter(q,B)).length; const gen=B.srcs.includes('propia')&&(!B.temas.length||B.temas.some(t=>GEN_TEMAS.includes(t)))&&!B.subs.length&&!B.ambitos.length&&!B.anyos.length;
  return `<h2 class="vt">Exámenes y tests</h2>
  <p class="sub">Exámenes oficiales importados con su plantilla definitiva, y banco propio redactado al estilo de esos exámenes.</p>
  <div class="exl">${convs.map(card).join('')}
  <article class="ex"><span class="pill warn">Elaboración propia</span><h4>Banco propio estilo AGE</h4><p>${prop} preguntas auditadas + psicotécnicos generados sin límite</p></article></div>
  <section class="set"><h3>Crear test personalizado</h3>
  <p class="sub">Combina los filtros que quieras. Lo que no marques, entra entero.</p>
  <p class="k">Fuentes</p><div class="ckl">${convs.map(c=>{const f=BANK.find(q=>q.org&&q.org.convocatoria===c).org; return ck('srcs',c,'Oficial '+f.fecha,B);}).join('')}${ck('srcs','propia','Elaboración propia',B)}</div>
  <p class="k">Ámbito y año (solo exámenes oficiales)</p><div class="ckl">${ambs.map(x=>ck('ambitos',x,x,B)).join('')}${anys.map(x=>ck('anyos',x,x,B)).join('')}</div>
  <p class="k">Temas <button class="link" onclick="S.builder.temas=[];S.builder.subs=[];save();render()">limpiar</button></p>${temas}
  ${subsAvail.length?`<p class="k">Subtemas de los temas elegidos</p><div class="ckl">${subsAvail.map(s=>ck('subs',s,s.split('›')[1],B)).join('')}</div>`:''}
  <p class="k">Dificultad</p><div class="ckl">${[['facil','Fácil'],['media','Media'],['dificil','Difícil']].map(([v,l])=>ck('difs',v,l,B)).join('')}</div>
  <p class="k">Estado</p><div class="ckl">${[['todas','Todas'],['nuevas','No vistas'],['falladas','Falladas'],['nose','Marcadas «No lo sé»'],['notas','Con anotación']].map(([v,l])=>`<label class="ck"><input type="radio" name="est" ${(B.estado||'todas')===v?'checked':''} onchange="S.builder.estado='${v}';save();render()">${l}</label>`).join('')}
  <label class="ck"><input type="checkbox" ${B.soloAud?'checked':''} onchange="S.builder.soloAud=this.checked;save();render()">Solo auditadas</label></div>
  <div class="row"><label for="bn"><b>Nº de preguntas</b></label><select id="bn" onchange="S.builder.n=+this.value;save();render()">${[10,20,30,50,60,110].map(n=>`<option ${B.n===n?'selected':''}>${n}</option>`).join('')}</select>
  <label class="ck"><input type="checkbox" id="bt" ${B.timed?'checked':''} onchange="S.builder.timed=this.checked;save()">Con reloj (49 s por pregunta)</label>
  <label class="ck"><input type="checkbox" id="bi" ${S.inmediata?'checked':''} onchange="S.inmediata=this.checked;save()">Corrección inmediata</label></div>
  <p class="sub">Disponibles con estos filtros: <b>${pool}</b> preguntas${gen?' + psicotécnicos generados':''}.</p>
  <button class="btn primary" ${pool||gen?'':'disabled'} onclick="newSession('custom',S.builder)">Empezar test</button></section>`;
}

// Estudiar: lo marcado «No lo sé» y lo fallado
function vEstudiar(){
  const ids=Object.keys(S.nose||{}).filter(id=>BYID[id]); const fail=Object.entries(S.seen).filter(([id,r])=>!r.ok&&BYID[id]&&!ids.includes(id)).map(([id])=>id);
  const group=list=>{ const g={}; list.forEach(id=>{const q=BYID[id];(g[q.tema]=g[q.tema]||[]).push(q);}); return Object.entries(g).sort((a,b)=>b[1].length-a[1].length); };
  const item=q=>`<article class="ritem"><p class="eyebrow">${esc(q.tema)}${q.sub?' › '+esc(q.sub):''}</p><h4>${esc(q.q)}</h4><p><b class="good">Respuesta: ${esc(q.o[0])}</b></p>${q.razon?`<p class="razon">${esc(q.razon)}</p>`:''}<p>${esc(q.e)}</p><p class="sub">Fundamento: <b>${esc(q.f||'')}</b></p><div class="row">${S.nose&&S.nose[q.id]?`<button class="btn" onclick="delete S.nose['${q.id}'];save();render()">Ya lo he estudiado</button>`:''}<button class="btn" onclick="openNote('${q.id}')">✎ Anotar</button></div></article>`;
  const sec=(t,list)=>list.length?`<h3>${t} (${list.length})</h3>${group(list).map(([tema,qs])=>`<details class="grp"><summary><b>${esc(tema)}</b> · ${qs.length}</summary>${qs.map(item).join('')}</details>`).join('')}`:'';
  return `<h2 class="vt">Estudiar</h2><p class="sub">Aquí va lo que marcaste «No lo sé» y lo que fallaste, agrupado por tema, con la respuesta, el razonamiento y el artículo para leer.</p>
  ${ids.length||fail.length?`<div class="row"><button class="btn primary" ${ids.length?'':'disabled'} onclick="S.builder=Object.assign(bld(),{estado:'nose',temas:[],subs:[],n:20});newSession('custom',S.builder)">Repasar las «No lo sé»</button><button class="btn" ${fail.length?'':'disabled'} onclick="newSession('fails')">Repasar falladas</button></div>`:''}
  ${sec('No lo sé',ids)}${sec('Falladas',fail)}${!ids.length&&!fail.length?'<p class="empty">Todavía no hay nada aquí. Cuando no sepas una pregunta, pulsa «No lo sé» en vez de adivinar.</p>':''}`;
}

// Notas
function noteBox(){ let p=document.getElementById('notepanel'); if(!p){ p=document.createElement('aside'); p.id='notepanel'; p.hidden=true; document.body.appendChild(p);} return p; }
function openNote(id){ S.notes=S.notes||{}; const q=BYID[id]||(S.cur&&S.cur.qs.find(x=>x.id===id)); const n=S.notes[id]||{txt:''}; const p=noteBox();
  p.innerHTML=`<div class="np-h"><b>Anotación</b><button class="btn ghost" onclick="closeNote()">Cerrar</button></div>
  <p class="sub">${q?esc(q.tema)+' · '+esc(q.q.slice(0,140))+(q.q.length>140?'…':''):'Nota general'}</p>
  <textarea id="notetxt" rows="6" placeholder="Escribe aquí lo que quieras recordar: un truco, un artículo, una duda…">${esc(n.txt)}</textarea>
  <div class="row"><span class="sub" id="notemsg">Se guarda sola mientras escribes.</span><button class="link" onclick="go('notas');closeNote()">Ver todas mis notas</button></div>`;
  p.hidden=false; const t=document.getElementById('notetxt'); t.focus();
  t.oninput=()=>{ const v=t.value; if(v.trim()) S.notes[id]={txt:v,date:Date.now(),tema:q?q.tema:'General',q:q?q.q.slice(0,200):''}; else delete S.notes[id]; save(); document.getElementById('notemsg').textContent='Guardada'; }; }
function closeNote(){ noteBox().hidden=true; if(view==='run'||view==='notas') render(); }
let notesQ='';
function vNotas(){ const all=Object.entries(S.notes||{}).sort((a,b)=>b[1].date-a[1].date).filter(([id,n])=>!notesQ||(n.txt+' '+n.tema+' '+n.q).toLowerCase().includes(notesQ.toLowerCase()));
  return `<h2 class="vt">Mis anotaciones</h2><p class="sub">Durante cualquier pregunta pulsa «✎ Anotar» y se abre este cuaderno sin salir del test.</p>
  <div class="row"><input id="nq" class="search" placeholder="Buscar en mis notas" value="${esc(notesQ)}" oninput="notesQ=this.value;clearTimeout(window._nt);window._nt=setTimeout(()=>{render();const e=document.getElementById('nq');e.focus();e.setSelectionRange(e.value.length,e.value.length);},250)"><button class="btn" onclick="openNote('general_'+Date.now())">Nueva nota general</button></div>
  ${all.length?all.map(([id,n])=>`<article class="ritem"><p class="eyebrow">${esc(n.tema||'General')} · ${new Date(n.date).toLocaleDateString('es-ES')}</p>${n.q?`<p class="sub">${esc(n.q)}</p>`:''}<p class="notetxt">${esc(n.txt)}</p><div class="row"><button class="btn" onclick="openNote('${id}')">Editar</button><button class="link" onclick="delete S.notes['${id}'];save();render()">Borrar</button></div></article>`).join(''):'<p class="empty">Aún no tienes anotaciones.</p>'}`; }

// Ayuda / soporte
let ayudaPre='';
function reportQ(id){ const q=BYID[id]; ayudaPre=`Pregunta ${id} (${q?q.tema:''}): «${q?q.q.slice(0,160):''}»\n\nQué está mal: `; S.ayudaTipo='error'; go('ayuda'); }
function vAyuda(){ const tipo=S.ayudaTipo||'duda';
  return `<h2 class="vt">Ayuda y soporte</h2><p class="sub">Escríbenos para resolver dudas, avisar de un error en una pregunta o pedir ayuda con la plataforma.</p>
  <section class="set"><div class="ckl">${[['duda','Tengo una duda'],['error','Hay un error'],['ayuda','Necesito ayuda']].map(([v,l])=>`<label class="ck"><input type="radio" name="tp" ${tipo===v?'checked':''} onchange="S.ayudaTipo='${v}';save();buildMail()">${l}</label>`).join('')}</div>
  <label class="fl"><span>Tu nombre</span><input id="ay_n" value="${esc(S.ayudaNombre||userName()||'')}" oninput="S.ayudaNombre=this.value;save();buildMail()"></label>
  <label class="fl"><span>Mensaje</span><textarea id="ay_m" rows="6" oninput="buildMail()">${esc(ayudaPre)}</textarea></label>
  <label class="fl"><span>Correo listo para enviar</span><textarea id="ay_out" rows="7" readonly></textarea></label>
  <div class="row"><button class="btn primary" onclick="copyTxt('ay_out','aymsg')">Copiar mensaje</button><span id="aymsg" class="sub"></span></div>
  <p class="sub">Envíalo a: <b>${SUPPORT_EMAIL?esc(SUPPORT_EMAIL):'correo de soporte pendiente de configurar (por ahora, envíalo por WhatsApp a quien te dio acceso)'}</b></p></section>`; }
function buildMail(){ const o=document.getElementById('ay_out'); if(!o) return; const t={duda:'Duda',error:'Error en una pregunta',ayuda:'Ayuda'}[S.ayudaTipo||'duda'];
  o.value=`Asunto: [Tú Lo Sabes] ${t}\n\nNombre: ${S.ayudaNombre||userName()||''}\n\n${(document.getElementById('ay_m')||{}).value||''}\n\n— Enviado desde el simulador (${new Date().toLocaleString('es-ES')})`; }
const _render0=render; render=function(){ _render0(); if(view==='ayuda') buildMail(); };
