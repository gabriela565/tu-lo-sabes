
// ---------- Origen de las preguntas ----------
function origenTxt(q){ const o=q.org;
  if(!o) return q.id.startsWith('g')?'Psicotécnico generado por el sistema':'Elaboración propia, al estilo del examen de la AGE (no procede de un examen oficial)';
  return `Examen oficial · ${o.prueba} · ${o.convocatoria} · examen del ${o.fecha} · ámbito: ${o.ambito} (${o.organismo}) · ${o.parte}, pregunta ${o.reserva?'de reserva ':''}${o.n}, modelo ${o.modelo}`; }
function origenHtml(q){ const o=q.org; return `<div class="orig ${o?'of':''}"><dt>Origen</dt><dd>${o?'<span class="pill good">Oficial</span> ':''}${esc(origenTxt(q))}${o?` · <a href="${esc(o.url)}" target="_blank" rel="noopener">cuadernillo</a> · <a href="${esc(o.plantilla)}" target="_blank" rel="noopener">plantilla ${esc(o.plantilla_tipo||'')}</a>`:''}</dd></div>`; }
function convocatorias(){ return [...new Set(BANK.filter(q=>q.org).map(q=>q.org.convocatoria))]; }

// ---------- Temario y cobertura ----------
function vTemario(){
  const row=x=>{ const qs=BANK.filter(q=>x.temas.includes(q.tema)); const n=qs.length; const gen=x.temas.some(t=>GEN_TEMAS.includes(t));
    const vistas=qs.filter(q=>S.seen[q.id]).length; let a=0,e=0; x.temas.forEach(t=>{const T=S.temas[t]; if(T){a+=T.a;e+=T.e;}}); const pct=a+e?Math.round(a/(a+e)*100):null;
    const st=n>=20||gen?['good','Amplia']:n>=10?['warn','Buena']:n?['bad','Básica']:['bad','Sin preguntas'];
    return `<tr><td class="num">${x.n==='P'?'—':x.n}</td><td><b>${esc(x.t)}</b><small>${esc(x.normas)}</small><small class="sub2">Subtemas en el sistema: ${x.temas.map(esc).join(' · ')}</small></td><td class="num">${n}${gen?' + ∞':''}</td><td><span class="pill ${st[0]}">${st[1]}</span></td><td class="num">${n?Math.round(vistas/n*100)+' %':'—'}</td><td class="num">${pct===null?'—':pct+' %'}</td></tr>`; };
  const tbl=b=>`<h3>${BLOCKS[b]}</h3><div class="tw"><table class="parts tem"><thead><tr><th>Nº</th><th>Tema del programa y normas</th><th>Preguntas</th><th>Cobertura</th><th>Vistas</th><th>Acierto</th></tr></thead><tbody>${TEMARIO.filter(x=>x.b===b).map(row).join('')}</tbody></table></div>`;
  return `<h2 class="vt">Temario y cobertura</h2>
  <p class="sub">Programa del Cuerpo General Auxiliar de la Administración del Estado según las últimas convocatorias. Compruébalo siempre con el BOE de tu convocatoria. «Vistas» indica cuántas preguntas de ese tema has respondido alguna vez.</p>
  <div class="strip"><div><span class="k">Preguntas en el banco</span><span class="v">${BANK.length}</span></div><div><span class="k">Psicotécnicos</span><span class="v">∞<small> generados</small></span></div><div><span class="k">Temas cubiertos</span><span class="v">${TEMARIO.filter(x=>BANK.some(q=>x.temas.includes(q.tema))).length}/${TEMARIO.length}</span></div></div>
  ${tbl('1')}${tbl('2')}${tbl('P')}
  <h3>Estructura del ejercicio</h3>
  <div class="tw"><table class="parts"><tbody>
  <tr><td>Primera parte</td><td>30 preguntas del Bloque I + 30 psicotécnicas</td></tr>
  <tr><td>Segunda parte</td><td>50 preguntas del Bloque II (ofimática)</td></tr>
  <tr><td>Tiempo</td><td>90 minutos en total</td></tr>
  <tr><td>Opciones</td><td>4 por pregunta, una sola correcta</td></tr>
  <tr><td>Penalización</td><td>Cada error resta ${penLabel().split(' ')[0]} de acierto (ajustable)</td></tr>
  </tbody></table></div>`;
}

// ---------- Evolución ----------
function linreg(pts){ const n=pts.length; const mx=pts.reduce((s,p)=>s+p[0],0)/n, my=pts.reduce((s,p)=>s+p[1],0)/n; let num=0,den=0; pts.forEach(([x,y])=>{num+=(x-mx)*(y-my);den+=(x-mx)**2;}); const m=den?num/den:0; return {m,b:my-m*mx}; }
function vEvol(){
  const meta=S.meta||9; const sims=S.hist.filter(h=>['full','half','express'].includes(h.kind)).slice().reverse();
  const day0=sims.length?sims[0].date:Date.now(); const DAY=864e5;
  const pts=sims.map(h=>[(h.date-day0)/DAY,h.nota]);
  let proj='';
  if(pts.length>=3){ const last5=pts.slice(-8); const {m,b}=linreg(last5); const nowX=(Date.now()-day0)/DAY; const recent=sims.slice(-3);
    if(recent.every(h=>h.nota>=meta)) proj=`<p class="hl good">Tus 3 últimos simulacros superan ${nf(meta)}. Estás en nota de plaza: ahora toca mantenerla.</p>`;
    else if(m>0.001){ const xT=(meta-b)/m; const days=Math.max(0,Math.ceil(xT-nowX)); const d=new Date(Date.now()+days*DAY);
      proj=`<p class="hl">Al ritmo actual (+${nf(Math.round(m*7*100)/100)} puntos por semana) alcanzarías ${nf(meta)} en unos <b>${days} días</b>, hacia el <b>${d.toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}</b>.</p><p class="sub">Es una estimación lineal con tus últimos simulacros; se recalcula con cada uno que hagas.</p>`; }
    else proj=`<p class="hl">Tus últimas notas están estables o bajando. Repasa las falladas y los temas en rojo antes del próximo simulacro.</p>`;
  } else proj=`<p class="sub">Haz al menos 3 simulacros (completos, medios o contrarreloj) para calcular la previsión. Llevas ${pts.length}.</p>`;
  // gráfico
  const W=640,H=240,P=34; const maxX=Math.max(1,...pts.map(p=>p[0]),pts.length?pts[pts.length-1][0]+1:1);
  const X=x=>P+(x/maxX)*(W-P-12), Y=y=>H-P-(y/10)*(H-P-12);
  const line=pts.map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join(' ');
  const chart=`<div class="tw"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución de la nota">
    ${[0,2,4,6,8,10].map(v=>`<line x1="${P}" x2="${W-12}" y1="${Y(v)}" y2="${Y(v)}" class="gl"/><text x="${P-8}" y="${Y(v)+4}" text-anchor="end" class="ax">${v}</text>`).join('')}
    <line x1="${P}" x2="${W-12}" y1="${Y(meta)}" y2="${Y(meta)}" class="meta"/><text x="${W-14}" y="${Y(meta)-6}" text-anchor="end" class="ax mt">objetivo ${nf(meta)}</text>
    ${pts.length?`<path d="${line}" class="ln"/>${pts.map((p,i)=>`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="${i===pts.length-1?5:3.5}" class="pt${p[1]>=meta?' ok':''}"/>`).join('')}`:`<text x="${W/2}" y="${H/2}" text-anchor="middle" class="ax">Aquí aparecerán tus simulacros</text>`}
    <text x="${P}" y="${H-8}" class="ax">${sims.length?new Date(day0).toLocaleDateString('es-ES'):''}</text><text x="${W-12}" y="${H-8}" text-anchor="end" class="ax">${sims.length?'hoy':''}</text>
  </svg></div>`;
  // checklist
  const statN=BANK.length, vistos=Object.keys(S.seen).length, cov=Math.round(vistos/statN*100);
  const blk=b=>{ let a=0,e=0; temasDe(b).forEach(t=>{const T=S.temas[t]; if(T){a+=T.a;e+=T.e;}}); return a+e?Math.round(a/(a+e)*100):null; };
  const last3=sims.slice(-3); const I=S.intu;
  const checks=[
    [last3.length===3&&last3.every(h=>h.nota>=meta),`3 últimos simulacros con ${nf(meta)} o más`,last3.length?last3.map(h=>nf(h.nota)).join(' · '):'sin datos'],
    [cov>=90,'Banco visto al 90 % o más',cov+' %'],
    [(blk('1')||0)>=meta*10,`Bloque I con ${meta*10} % de acierto`,blk('1')===null?'—':blk('1')+' %'],
    [(blk('P')||0)>=meta*10,`Psicotécnicos con ${meta*10} % de acierto`,blk('P')===null?'—':blk('P')+' %'],
    [(blk('2')||0)>=meta*10,`Bloque II con ${meta*10} % de acierto`,blk('2')===null?'—':blk('2')+' %'],
    [I.rw+I.wr>0&&I.rw<=I.wr,'Cambias más a bien que a mal',`${I.rw} a mal · ${I.wr} a bien`]
  ];
  const ok=checks.filter(c=>c[0]).length;
  // tiempo de estudio 14 días
  const days=S.days||{}; const arr=[...Array(14)].map((_,i)=>{const d=new Date(Date.now()-(13-i)*DAY).toISOString().slice(0,10); return [d,(days[d]||{t:0}).t];});
  const maxT=Math.max(600,...arr.map(x=>x[1]));
  const weak=Object.entries(S.temas).map(([t,T])=>[t,T.a+T.e?T.a/(T.a+T.e):1,T.a+T.e]).filter(x=>x[2]>=3).sort((a,b)=>a[1]-b[1]).slice(0,5);
  return `<h2 class="vt">Mi evolución</h2>
  <section class="set"><div class="row"><label for="meta"><b>Nota objetivo (sobre 10)</b></label><input id="meta" type="number" min="5" max="10" step="0.25" value="${meta}" onchange="S.meta=Math.min(10,Math.max(5,parseFloat(this.value)||9));save();render()"><span class="sub">La nota de corte cambia en cada convocatoria; pon la que necesitas para entrar con margen.</span></div></section>
  ${chart}
  ${proj}
  <h3>¿Estoy lista? <span class="pill ${ok===6?'good':ok>=4?'warn':'bad'}">${ok}/6</span></h3>
  <ul class="checks">${checks.map(c=>`<li class="${c[0]?'good':''}"><span>${c[0]?'✓':'○'}</span><span>${c[1]}</span><span class="pv">${c[2]}</span></li>`).join('')}</ul>
  <h3>Tiempo de estudio, últimos 14 días</h3>
  <div class="bars">${arr.map(([d,t])=>`<div title="${d}: ${mmss(t)}"><i style="height:${Math.round(t/maxT*100)}%"></i><span>${d.slice(8)}</span></div>`).join('')}</div>
  <p class="sub">Total: ${mmss(arr.reduce((s,x)=>s+x[1],0))} (min:s) en ${arr.filter(x=>x[1]>0).length} días con estudio.</p>
  ${weak.length?`<h3>Temas a reforzar</h3><div class="prog">${weak.map(([t,p])=>`<div class="prow"><span>${esc(t)}</span><span class="pbar"><i class="${p>=.7?'good':p>=.5?'warn':'bad'}" style="width:${Math.round(p*100)}%"></i></span><span class="pv">${Math.round(p*100)} %</span></div>`).join('')}</div>`:''}
  <h3>Compartir mi evolución</h3>
  <p class="sub">Copia este resumen y envíalo por WhatsApp. Para ver el detalle completo en otro dispositivo, usa el código de Ajustes › Copia de seguridad.</p>
  <textarea id="rep" rows="7" readonly>${esc(report(meta,sims,cov,ok,checks))}</textarea>
  <div class="row"><button class="btn" onclick="copyTxt('rep','repmsg')">Copiar resumen</button><span id="repmsg" class="sub"></span></div>`;
}
function report(meta,sims,cov,ok,checks){
  const l=sims.slice(-5).map(h=>`${new Date(h.date).toLocaleDateString('es-ES')}: ${nf(h.nota)}`).join('\n');
  return `Evolución de ${userName()||'la opositora'} (${new Date().toLocaleDateString('es-ES')})\nObjetivo: ${nf(meta)} · Preparación: ${ok}/6\nBanco visto: ${cov} %\nÚltimos simulacros:\n${l||'—'}\n${checks.map(c=>(c[0]?'✓ ':'○ ')+c[1]+': '+c[2]).join('\n')}`;
}
function copyTxt(id,msg){ const t=$('#'+id); try{ navigator.clipboard.writeText(t.value).then(()=>{$('#'+msg).textContent='Copiado';},()=>{t.select();$('#'+msg).textContent='Selecciona el texto y cópialo';}); }catch(e){ t.select(); } }

// ---------- Corrector / impugnaciones ----------
const MOTIVOS={
  dos:{n:'Hay más de una respuesta correcta',pide:'anular',g:'Cita la norma que hace correcta cada una de las dos opciones. Es el motivo que más prospera.'},
  ninguna:{n:'Ninguna respuesta es correcta',pide:'anular',g:'Transcribe el artículo literal y muestra que ninguna opción coincide con él.'},
  plantilla:{n:'La plantilla da por buena una respuesta incorrecta',pide:'cambiar',g:'Indica qué opción es la correcta y por qué, con el artículo literal.'},
  fuera:{n:'La pregunta está fuera del temario de la convocatoria',pide:'anular',g:'Cita el programa del anexo de la convocatoria y explica por qué la materia no está incluida.'},
  vigencia:{n:'Se basa en normativa no vigente o modificada',pide:'anular',g:'Las bases suelen exigir la normativa vigente a la fecha de publicación de la convocatoria. Indica la norma modificadora y su fecha.'},
  redaccion:{n:'Enunciado ambiguo o con errores',pide:'anular',g:'Señala el error material o la ambigüedad y por qué impide una única respuesta inequívoca.'}
};
const impDefault=()=>({nombre:'',conv:'proceso selectivo para ingreso, por el sistema general de acceso libre, en el Cuerpo General Auxiliar de la Administración del Estado',res:'',org:'Tribunal Calificador del proceso selectivo para ingreso en el Cuerpo General Auxiliar de la Administración del Estado',fecha:'',lugar:'',qs:[impQ()]});
function impQ(){ return {num:'',modelo:'',enun:'',ops:['','','',''],plant:'A',motivo:'dos',prop:'A',fund:'',norma:''}; }
let SAMPLE=null;
(async()=>{ try{ if(window.claude?.use){ SAMPLE=await window.claude.use('sample'); if(view==='impugnar') render(); } }catch(e){} })();

function vImpugnar(){
  const I=S.imp||(S.imp=impDefault());
  const fld=(k,l,ph='')=>`<label class="fl"><span>${l}</span><input id="imp_${k}" value="${esc(I[k]||'')}" placeholder="${esc(ph)}" oninput="impSet('${k}',this.value)"></label>`;
  return `<h2 class="vt">Corrector e impugnaciones</h2>
  <p class="sub">Cuando se publique la plantilla provisional, compara tus respuestas y prepara aquí el escrito de alegaciones para pedir la anulación o el cambio de respuesta de las preguntas dudosas. El plazo y la forma de presentarlo los fijan las bases: suele ser de 10 días hábiles desde el día siguiente a la publicación de la plantilla.</p>
  <section class="set"><h3>Tus datos y la convocatoria</h3>
    ${fld('nombre','Nombre y apellidos')}
    <label class="fl"><span>DNI/NIE (no se guarda)</span><input id="imp_dni" oninput="impOut()" placeholder="Solo para el escrito"></label>
    ${fld('conv','Proceso selectivo')}
    ${fld('res','Resolución de convocatoria','p. ej. Resolución de [fecha] de la Secretaría de Estado de Función Pública')}
    ${fld('org','Dirigido a')}
    <label class="fl"><span>Fecha de publicación de la plantilla</span><input type="date" id="imp_fecha" value="${esc(I.fecha)}" oninput="impSet('fecha',this.value)"></label>
    <p class="sub" id="plazo">${plazoTxt(I.fecha)}</p>
    ${fld('lugar','Lugar de firma','p. ej. Madrid')}
  </section>
  ${I.qs.map((q,i)=>impQForm(q,i)).join('')}
  <div class="row"><button class="btn" onclick="S.imp.qs.push(impQ());save();render()">Añadir otra pregunta</button></div>
  <section class="set"><h3>Escrito de alegaciones</h3><p class="sub">Revísalo, añade el texto literal de los artículos y preséntalo por el medio que indiquen las bases (normalmente la sede electrónica o un registro).</p>
  <textarea id="impout" rows="18" readonly></textarea>
  <div class="row"><button class="btn primary" onclick="copyTxt('impout','impmsg')">Copiar escrito</button><span id="impmsg" class="sub"></span><button class="btn danger" onclick="if(impArm){S.imp=impDefault();impArm=false;save();render();}else{impArm=true;this.textContent='Pulsa otra vez para vaciar';}">Vaciar todo</button></div></section>`;
}
let impArm=false;
function impQForm(q,i){
  const M=MOTIVOS[q.motivo];
  return `<section class="set imp"><div class="phead"><h3>Pregunta ${i+1}</h3>${S.imp.qs.length>1?`<button class="link" onclick="S.imp.qs.splice(${i},1);save();render()">Quitar</button>`:''}</div>
  <div class="two"><label class="fl"><span>Nº de pregunta</span><input id="iq${i}num" value="${esc(q.num)}" oninput="impQSet(${i},'num',this.value)"></label>
  <label class="fl"><span>Modelo de examen</span><input id="iq${i}mod" value="${esc(q.modelo)}" oninput="impQSet(${i},'modelo',this.value)"></label></div>
  <label class="fl"><span>Enunciado</span><textarea id="iq${i}en" rows="2" oninput="impQSet(${i},'enun',this.value)">${esc(q.enun)}</textarea></label>
  ${q.ops.map((o,j)=>`<label class="fl"><span>Opción ${LET[j]}</span><input id="iq${i}o${j}" value="${esc(o)}" oninput="impQOp(${i},${j},this.value)"></label>`).join('')}
  <div class="two"><label class="fl"><span>Respuesta de la plantilla</span><select id="iq${i}pl" onchange="impQSet(${i},'plant',this.value)">${LET.map(l=>`<option ${q.plant===l?'selected':''}>${l}</option>`).join('')}</select></label>
  <label class="fl"><span>Motivo</span><select id="iq${i}mo" onchange="impQSet(${i},'motivo',this.value);render()">${Object.entries(MOTIVOS).map(([k,v])=>`<option value="${k}" ${q.motivo===k?'selected':''}>${v.n}</option>`).join('')}</select></label></div>
  ${M.pide==='cambiar'?`<label class="fl"><span>Respuesta que debería ser la correcta</span><select id="iq${i}pr" onchange="impQSet(${i},'prop',this.value)">${LET.map(l=>`<option ${q.prop===l?'selected':''}>${l}</option>`).join('')}</select></label>`:''}
  <p class="trap"><b>Cómo argumentarlo.</b> ${M.g}</p>
  <label class="fl"><span>Normativa aplicable</span><input id="iq${i}no" value="${esc(q.norma)}" placeholder="p. ej. art. 21.3 de la Ley 39/2015" oninput="impQSet(${i},'norma',this.value)"></label>
  <label class="fl"><span>Fundamentación</span><textarea id="iq${i}fu" rows="4" oninput="impQSet(${i},'fund',this.value)" placeholder="Explica por qué procede la anulación o el cambio">${esc(q.fund)}</textarea></label>
  ${SAMPLE?`<div class="row"><button class="btn" id="iq${i}ai" onclick="impAI(${i})">Analizar con Claude</button><span class="sub" id="iq${i}aim"></span></div>`:''}
  </section>`;
}
function impSet(k,v){ S.imp[k]=v; save(); if(k==='fecha'){ const p=$('#plazo'); if(p) p.textContent=plazoTxt(v);} impOut(); }
function impQSet(i,k,v){ S.imp.qs[i][k]=v; save(); impOut(); }
function impQOp(i,j,v){ S.imp.qs[i].ops[j]=v; save(); impOut(); }
function initImp(){ impOut(); }
function plazoTxt(f){ if(!f) return 'Indica la fecha para calcular el plazo orientativo.'; let d=new Date(f+'T12:00:00'), n=0; while(n<10){ d.setDate(d.getDate()+1); const w=d.getDay(); if(w!==0&&w!==6) n++; }
  return `Plazo orientativo (10 días hábiles, sin contar sábados ni domingos): hasta el ${d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}. Resta los festivos y confirma el plazo exacto en las bases.`; }
const ORD=['PRIMERA','SEGUNDA','TERCERA','CUARTA','QUINTA','SEXTA','SÉPTIMA','OCTAVA','NOVENA','DÉCIMA'];
function impOut(){
  const I=S.imp, o=$('#impout'); if(!o) return; const dni=($('#imp_dni')||{}).value||'[DNI/NIE]';
  const fecha=I.fecha?new Date(I.fecha+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'}):'[fecha]';
  const al=I.qs.map((q,i)=>{ const M=MOTIVOS[q.motivo];
    const pide= M.pide==='cambiar'?`la rectificación de la plantilla, considerando correcta la opción ${q.prop}`:'la anulación de la pregunta';
    return `${ORD[i]||(i+1)+'ª'}.– Pregunta nº ${q.num||'[nº]'}${q.modelo?' (modelo '+q.modelo+')':''}.\n\nEnunciado: «${q.enun||'[enunciado]'}»\n${q.ops.map((x,j)=>`${LET[j]}) ${x||'[opción]'}`).join('\n')}\n\nRespuesta según la plantilla provisional: ${q.plant}.\n\nMotivo: ${M.n.toLowerCase()}.\n\n${q.fund||'[Fundamentación]'}${q.norma?`\n\nNormativa aplicable: ${q.norma}.`:''}\n\nPor ello, se solicita ${pide}.`; });
  const pet=I.qs.map(q=>`– Pregunta nº ${q.num||'[nº]'}: ${MOTIVOS[q.motivo].pide==='cambiar'?'rectificar la respuesta correcta a la opción '+q.prop:'anular la pregunta'}.`).join('\n');
  o.value=`A LA ATENCIÓN DEL ${I.org.toUpperCase()}\n\n${I.nombre||'[Nombre y apellidos]'}, con DNI/NIE ${dni}, aspirante en el ${I.conv}${I.res?', convocado por '+I.res:''}, comparece ante ese Tribunal y, como mejor proceda en Derecho,\n\nEXPONE\n\nQue con fecha ${fecha} se publicó la plantilla provisional de respuestas del ejercicio de la fase de oposición y que, dentro del plazo concedido al efecto, formula las siguientes\n\nALEGACIONES\n\n${al.join('\n\n')}\n\nPor lo expuesto,\n\nSOLICITA\n\nQue tenga por presentado este escrito, admita las alegaciones formuladas y, en su virtud, acuerde:\n${pet}\nasí como la corrección de la plantilla definitiva y el recálculo de las puntuaciones que correspondan.\n\nEn ${I.lugar||'[lugar]'}, a ${new Date().toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}.\n\nFdo.: ${I.nombre||'[Nombre y apellidos]'}`;
}
async function impAI(i){
  const q=S.imp.qs[i], m=$('#iq'+i+'aim'), b=$('#iq'+i+'ai'); if(!SAMPLE||!q.enun){ if(m) m.textContent='Escribe primero el enunciado y las opciones.'; return; }
  b.disabled=true; m.textContent='Analizando…';
  const temario=TEMARIO.map(x=>`${x.b==='P'?'Psicotécnicos':'Bloque '+(x.b==='1'?'I':'II')+' tema '+x.n}: ${x.t} (${x.normas})`).join('\n');
  const prompt=`Eres un experto en oposiciones de la Administración General del Estado de España y en Derecho administrativo. Analiza si esta pregunta del examen de Auxiliar Administrativo del Estado (C2) es impugnable.\n\nPregunta: ${q.enun}\n${q.ops.map((x,j)=>LET[j]+') '+x).join('\n')}\nRespuesta según la plantilla provisional: ${q.plant}\n\nPrograma de la convocatoria:\n${temario}\n\nResponde SOLO con JSON: {"impugnable": true|false, "motivo": "dos"|"ninguna"|"plantilla"|"fuera"|"vigencia"|"redaccion"|"ninguno", "respuestaCorrecta": "A"|"B"|"C"|"D"|"", "normativa": "norma y artículo", "fundamentacion": "argumentación jurídica formal en español de España, en tercera persona, 4-8 frases, citando el artículo", "confianza": "alta"|"media"|"baja"}. Si no estás seguro de un dato normativo, dilo en la fundamentación.`;
  try{ const r=await SAMPLE.json(prompt,{modelTier:'complex',cache:false});
    if(r&&r.motivo&&MOTIVOS[r.motivo]){ q.motivo=r.motivo; } if(r&&r.respuestaCorrecta) q.prop=r.respuestaCorrecta;
    if(r&&r.normativa) q.norma=r.normativa; if(r&&r.fundamentacion) q.fund=r.fundamentacion; save(); render();
    const m2=$('#iq'+i+'aim'); if(m2) m2.textContent=r.impugnable?`Claude la ve impugnable (confianza ${r.confianza||'—'}). Revisa y completa el texto.`:`Claude no ve motivo claro de impugnación (confianza ${r.confianza||'—'}). Revisa su razonamiento antes de presentarla.`;
  }catch(e){ m.textContent=e&&e.code==='rate_limited'?'Demasiadas consultas seguidas. Espera un poco.':'No se pudo analizar ahora.'; b.disabled=false; }
}

// ---------- Test personalizado (la vista está en v3.js) ----------
function bTog(k,v,on){ const B=bld(); const a=B[k]; const i=a.indexOf(v); if(on&&i<0)a.push(v); if(!on&&i>=0)a.splice(i,1); save(); render(); }
