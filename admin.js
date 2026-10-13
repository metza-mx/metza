/* ---------- Panel de administración (demostración: usa los datos guardados en este navegador) ---------- */
(function(){
const root=$('#adm');if(!root)return;
/* Sin sesión iniciada no se muestra el panel: se regresa a la tienda */
if(!isAdmin()){location.replace('index.html');return}
const fdt=d=>new Date(d).toLocaleString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const badge=([t,k])=>`<span class="bd ${k}">${t}</span>`;
const RST=r=>['Solicitud aprobada','Pieza en camino','Pieza recibida','Revisión de calidad',RFIN[r.s]];
const rKey=r=>r.cancel?'can':r.rej?'rej':rStage(r)===4?'done':'open';
const RB={open:['En proceso','go'],done:['Completada','ok'],rej:['Rechazada','no'],can:['Cancelada por el cliente','no']};
const cli=o=>orders.find(x=>x.folio===o.folio)||{};
const TABS=[['resumen','📊','Resumen'],['pedidos','📦','Pedidos'],['devoluciones','↩️','Devoluciones'],['productos','🏺','Productos'],['clientes','👥','Clientes']];
let tab=TABS.some(t=>t[0]===location.hash.slice(1))?location.hash.slice(1):'resumen',fo='',fr='',q='';

/* Pedidos y devoluciones de ejemplo de varios clientes (solo los ve el admin) */
function seed(){
  if(orders.some(o=>o.adm))return;
  const ago=d=>new Date(Date.now()-d*DAY).toISOString();
  const C=[['Ana López','ana.lopez@ejemplo.com','Av. Tecnológico 300, Metepec',0],['Luis Hernández','luis.h@ejemplo.com','Insurgentes Sur 1500, CDMX',1],
    ['Sofía Ramírez','sofia.r@ejemplo.com','Av. Vallarta 2200, Guadalajara',2],['Carlos Méndez','carlos.m@ejemplo.com','Av. Constitución 450, Monterrey',2],
    ['María Torres','maria.t@ejemplo.com','Paseo Tollocan 800, Toluca',0],['Jorge Castillo','jorge.c@ejemplo.com','Av. Universidad 1000, CDMX',1]];
  // [cliente, días atrás, método de pago, piezas [id, cantidad], descuento, estado fijo]
  const D=[[3,16,3,[[1,1]],0],[0,12,0,[[8,1],[12,2]],0],[5,9,2,[[11,1]],0],[1,6,1,[[6,1]],0,'can'],[3,5,1,[[10,1],[7,1]],0],
    [4,3,0,[[6,1],[9,2]],.1],[2,2,3,[[3,1],[4,1]],0],[1,.6,1,[[2,2]],.1],[0,.2,0,[[1,1],[5,1]],0],[2,.1,1,[[9,1],[5,1],[7,1]],0]];
  const made=D.map(([c,d,m,it,dr,st])=>{const [n,e,a,z]=C[c];
    const o=mkOrder({folio:'MTZ-'+rnd(6),adm:1,date:ago(d),n,e,a,z,m,dr,items:it.map(([id,q])=>({id,q,p:prod(id).p0}))});
    if(st)o.st=st;return o});
  orders.unshift(...made);
  const mk=(o,days,r,s,st,ph,c)=>{const items=[{id:o.items[0].id,q:1,u:o.items[0].p*(1-o.dr)}],fee=r==='arrep'&&s!=='credito'?RET_SHIP:0;
    return{id:'DEV-'+rnd(6),g:'GR-'+rnd(10),adm:1,folio:o.folio,date:ago(days),items,r,c,ph,s,m:'recoleccion',a:o.a,fee,amt:s==='cambio'?0:items[0].u-fee,st}};
  rets.unshift(mk(made[2],2,'desc','reembolso',4,1,'El color es más claro que en la foto.'),mk(made[5],.3,'dano','cambio',0,2,'Se despostilló una orilla.'));
  saveOrders();saveRets()}

/* ---------- Vistas ---------- */
function kpi(t,v,h){return `<div class="kpi"><small>${t}</small><b>${v}</b>${h?`<span>${h}</span>`:''}</div>`}
function vResumen(){
  const val=orders.filter(o=>oKey(o)!=='can'),sales=val.reduce((a,o)=>a+o.total,0);
  const ref=rets.filter(r=>rStage(r)===4&&r.s!=='cambio').reduce((a,r)=>a+r.amt,0);
  const open=rets.filter(r=>rKey(r)==='open'),ship=orders.filter(o=>oKey(o)==='prep');
  const bc={};val.forEach(o=>o.items.forEach(i=>{const c=prod(i.id).c;bc[c]=(bc[c]||0)+i.p*i.q*(1-o.dr)}));
  const mx=Math.max(1,...Object.values(bc));
  return `<div class="ah2"><div><h2>Resumen</h2><p class="mut">Así va la tienda hoy.</p></div><button class="btn sm ghost" data-reseed>Restablecer datos de ejemplo</button></div>
  <div class="kpis">${kpi('Ventas',money(sales),val.length+' pedidos válidos')}${kpi('Ticket promedio',money(val.length?sales/val.length:0))}
  ${kpi('Por enviar',ship.length,'pedidos en preparación')}${kpi('Devoluciones abiertas',open.length)}${kpi('Reembolsado',money(ref))}</div>
  <div class="agrid">
  <div class="card"><h3>Ventas por categoría</h3><div class="bars">${CATS.map(c=>`<div class="br" title="${esc(c)}: ${money(bc[c]||0)}"><span>${esc(c)}</span><i><em style="width:${(bc[c]||0)/mx*100}%"></em></i><b>${money(bc[c]||0)}</b></div>`).join('')}</div></div>
  <div class="card"><h3>Pendientes</h3><ul class="todo">
   ${ship.map(o=>`<li><span>📦 Enviar <b>${o.folio}</b> · ${esc(o.n)}</span><button class="btn sm ghost" data-vo="${o.folio}">Ver</button></li>`).join('')}
   ${open.map(r=>`<li><span>↩️ ${RST(r)[rStage(r)+1]||'Revisar'}: <b>${r.id}</b></span><button class="btn sm ghost" data-vr="${r.id}">Ver</button></li>`).join('')}
   ${ship.length||open.length?'':'<li class="mut">Todo al día. 🎉</li>'}</ul></div></div>
  <div class="card" style="margin-top:20px"><div class="ah2"><h3>Últimos pedidos</h3><button class="lnk2" data-tab="pedidos">Ver todos</button></div>${oTable(orders.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5))}</div>`}
function oTable(L){
  return L.length?`<div class="tw"><table class="tb"><thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Piezas</th><th class="n">Total</th><th>Estado</th><th></th></tr></thead><tbody>
  ${L.map(o=>`<tr><td><b>${o.folio}</b></td><td>${fdt(o.date)}</td><td>${esc(o.n)}<br><small class="mut">${esc(o.e)}</small></td><td>${o.items.reduce((a,i)=>a+i.q,0)}</td><td class="n">${money(o.total)}</td><td>${badge(oStatus(o))}</td><td><button class="btn sm ghost" data-vo="${o.folio}">Ver</button></td></tr>`).join('')}
  </tbody></table></div>`:'<p class="mut">No hay pedidos con ese filtro.</p>'}
const pills=(L,cur,attr)=>`<div class="pills">${L.map(([k,t,n])=>`<button class="pill${k===cur?' on':''}" ${attr}="${k}">${t} <small>${n}</small></button>`).join('')}</div>`;
const hit=(...f)=>!q||f.join(' ').toLowerCase().includes(q);
function vPedidos(){
  const L=orders.filter(o=>(!fo||oKey(o)===fo)&&hit(o.folio,o.n,o.e)).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const n=k=>orders.filter(o=>!k||oKey(o)===k).length;
  return `<div class="ah2"><div><h2>Pedidos</h2><p class="mut">${orders.length} pedidos en total.</p></div></div>
  <div class="tool"><input id="aq" type="search" placeholder="Buscar por folio, cliente o correo" value="${esc(q)}" aria-label="Buscar pedidos"></div>
  ${pills([['','Todos',n('')],['prep','En preparación',n('prep')],['env','En camino',n('env')],['ent','Entregados',n('ent')],['can','Cancelados',n('can')]],fo,'data-fo')}
  <div class="card">${oTable(L)}</div>`}
function vDevs(){
  const L=rets.filter(r=>(!fr||rKey(r)===fr||(fr==='rej'&&rKey(r)==='can'))&&hit(r.id,r.folio,cli(r).n)).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const n=k=>rets.filter(r=>!k||rKey(r)===k||(k==='rej'&&rKey(r)==='can')).length;
  return `<div class="ah2"><div><h2>Devoluciones</h2><p class="mut">Revisa, avanza o rechaza las solicitudes de los clientes.</p></div></div>
  <div class="tool"><input id="aq" type="search" placeholder="Buscar por devolución, pedido o cliente" value="${esc(q)}" aria-label="Buscar devoluciones"></div>
  ${pills([['','Todas',n('')],['open','Abiertas',n('open')],['done','Completadas',n('done')],['rej','Rechazadas o canceladas',n('rej')]],fr,'data-fr')}
  <div class="card">${L.length?`<div class="tw"><table class="tb"><thead><tr><th>Devolución</th><th>Cliente</th><th>Motivo</th><th>Solución</th><th class="n">Importe</th><th>Estado</th><th></th></tr></thead><tbody>
  ${L.map(r=>`<tr><td><b>${r.id}</b><br><small class="mut">${r.folio} · ${fdt(r.date)}</small></td><td>${esc(cli(r).n||'')}</td><td>${lab(REAS,r.r)}</td><td>${lab(SOL,r.s)}</td><td class="n">${r.s==='cambio'?'—':money(r.amt)}</td>
  <td>${badge(RB[rKey(r)])}${rKey(r)==='open'?`<br><small class="mut">${RST(r)[rStage(r)]}</small>`:''}</td><td><button class="btn sm ghost" data-vr="${r.id}">Ver</button></td></tr>`).join('')}
  </tbody></table></div>`:'<p class="mut">No hay devoluciones con ese filtro.</p>'}</div>`}
function vProds(){
  const sold={};orders.filter(o=>oKey(o)!=='can').forEach(o=>o.items.forEach(i=>sold[i.id]=(sold[i.id]||0)+i.q));
  return `<div class="ah2"><div><h2>Productos</h2><p class="mut">Cambia precios y marca piezas como agotadas. Se refleja al momento en la tienda.</p></div><button class="btn sm ghost" data-resetp>Restablecer precios</button></div>
  <div class="card"><div class="tw"><table class="tb"><thead><tr><th>Pieza</th><th>Categoría</th><th class="n">Vendidas</th><th>Precio</th><th>Disponible</th></tr></thead><tbody>
  ${cfg.products.map(p=>`<tr${p.off?' class="off"':''}><td><span class="e2">${pic(p)}</span> <b>${esc(p.n)}</b></td><td>${esc(p.c)}</td><td class="n">${sold[p.id]||0}</td>
  <td><label class="pin">$<input type="number" min="1" step="10" value="${p.p}" data-price="${p.id}" aria-label="Precio de ${esc(p.n)}"></label>${p.p!==p.p0?`<br><small class="mut">Antes ${money(p.p0)}</small>`:''}</td>
  <td><label class="sw"><input type="checkbox" data-avail="${p.id}"${p.off?'':' checked'}><span>${p.off?'Agotado':'Disponible'}</span></label></td></tr>`).join('')}
  </tbody></table></div></div>`}
function vClientes(){
  const M={};orders.forEach(o=>{const k=o.e.toLowerCase(),c=M[k]=M[k]||{n:o.n,e:o.e,k:0,t:0,last:0};
    if(oKey(o)!=='can'){c.k++;c.t+=o.total}c.last=Math.max(c.last,new Date(o.date));c.n=o.n});
  const L=Object.values(M).filter(c=>hit(c.n,c.e)).sort((a,b)=>b.t-a.t);
  return `<div class="ah2"><div><h2>Clientes</h2><p class="mut">${Object.keys(M).length} clientes con compras.</p></div></div>
  <div class="tool"><input id="aq" type="search" placeholder="Buscar por nombre o correo" value="${esc(q)}" aria-label="Buscar clientes"></div>
  <div class="card">${L.length?`<div class="tw"><table class="tb"><thead><tr><th>Cliente</th><th class="n">Pedidos</th><th class="n">Total gastado</th><th>Última compra</th></tr></thead><tbody>
  ${L.map(c=>`<tr><td><b>${esc(c.n)}</b><br><small class="mut">${esc(c.e)}</small></td><td class="n">${c.k}</td><td class="n">${money(c.t)}</td><td>${fdate(c.last)}</td></tr>`).join('')}
  </tbody></table></div>`:'<p class="mut">Sin resultados.</p>'}</div>`}
const V={resumen:vResumen,pedidos:vPedidos,devoluciones:vDevs,productos:vProds,clientes:vClientes};
function draw(focus){
  seed();
  root.innerHTML=`<div class="adm"><div class="side" role="navigation" aria-label="Secciones del panel">${TABS.map(([k,i,t])=>`<button data-tab="${k}"${k===tab?' class="on" aria-current="page"':''}><span aria-hidden="true">${i}</span>${t}</button>`).join('')}</div>
  <section class="amain">${V[tab]()}</section></div>`;
  if(focus&&$('#aq')){const e=$('#aq');e.focus();e.setSelectionRange(e.value.length,e.value.length)}}

/* ---------- Detalle de pedido y de devolución ---------- */
function openModal(h){$('#admBody').innerHTML=h;closeAll();$('#mAdm').classList.add('open')}
function showOrder(f){const o=findO(f),k=oKey(o),R=rets.filter(r=>r.folio===o.folio);
  $('#admT').textContent='Pedido '+o.folio;
  openModal(`<div class="oh"><span class="mut">Comprado el ${fdt(o.date)}</span>${badge(oStatus(o))}</div>
  <div class="cols2"><div><small class="lbt">CLIENTE</small><p>${esc(o.n)}<br><a href="mailto:${esc(o.e)}">${esc(o.e)}</a></p></div>
  <div><small class="lbt">ENVÍO</small><p>${esc(o.a)}<br>${ZN[o.z][0]} · ${ZN[o.z][1]}</p></div></div>
  ${o.items.map(i=>`<div class="ol"><span class="e2">${pic(prod(i.id))}</span><span style="flex:1">${i.q}× ${esc(prod(i.id).n)}</span><b>${money(i.p*i.q)}</b></div>`).join('')}
  ${o.disc?`<div class="tr"><span class="mut">Descuento METZA10</span><span>−${money(o.disc)}</span></div>`:''}
  <div class="tr"><span class="mut">Envío</span><span>${o.ship?money(o.ship):'Gratis'}</span></div>
  <div class="tr t"><span>Total</span><span>${money(o.total)}</span></div>
  <p class="mut">${PAYS[o.m]}${delivered(o)?' · Entregado el '+fdate(delivered(o)):k==='can'?'':' · Entrega estimada: '+fdate(estDel(o))}</p>
  ${R.length?`<p class="mut" style="margin-top:8px">Devoluciones: ${R.map(r=>`<button class="lnk2" data-vr="${r.id}">${r.id}</button>`).join(', ')}</p>`:''}
  <div class="acts">${k==='prep'?`<button class="btn sm" data-ost="${o.folio}|env">Marcar como enviado</button><button class="btn sm ghost" data-ost="${o.folio}|can">Cancelar pedido</button>`:''}
  ${k==='env'?`<button class="btn sm" data-ost="${o.folio}|ent">Marcar como entregado</button>`:''}
  ${k==='ent'||k==='can'?'<span class="mut">Este pedido ya no tiene acciones pendientes.</span>':''}</div>`)}
function showRet(id){const r=rets.find(x=>x.id===id),o=findO(r.folio),st=rStage(r),S=RST(r),k=rKey(r);
  $('#admT').textContent='Devolución '+r.id;
  openModal(`<div class="oh"><span class="mut">Pedido <button class="lnk2" data-vo="${r.folio}">${r.folio}</button> · ${fdt(r.date)}</span>${badge(RB[k])}</div>
  <div class="cols2"><div><small class="lbt">CLIENTE</small><p>${esc(o.n)}<br><a href="mailto:${esc(o.e)}">${esc(o.e)}</a></p></div>
  <div><small class="lbt">RETORNO</small><p>${lab(MET,r.m)}${r.m==='recoleccion'?'<br>'+esc(r.a):''}<br>Guía ${r.g}</p></div></div>
  ${r.items.map(i=>`<div class="ol"><span class="e2">${pic(prod(i.id))}</span><span style="flex:1">${i.q}× ${esc(prod(i.id).n)}</span><b>${money(i.u*i.q)}</b></div>`).join('')}
  <div class="tr"><span class="mut">Motivo</span><span>${lab(REAS,r.r)}</span></div>
  <div class="tr"><span class="mut">Solución</span><span>${lab(SOL,r.s)}</span></div>
  ${r.fee?`<div class="tr"><span class="mut">Costo de guía</span><span>${money(r.fee)}</span></div>`:''}
  <div class="tr t"><span>${r.s==='cambio'?'Pieza de cambio':r.s==='credito'?'Saldo a favor':'Reembolso'}</span><span>${r.s==='cambio'?'—':money(r.amt)}</span></div>
  ${r.c?`<p class="note">“${esc(r.c)}”</p>`:''}<p class="mut">${r.ph?`📷 ${r.ph} foto${r.ph>1?'s':''} adjunta${r.ph>1?'s':''}`:'Sin fotos adjuntas'}</p>
  ${r.rej?`<p class="note">Rechazada: ${esc(r.rej)}</p>`:''}
  ${st>=0?`<ul class="tl">${S.map((t,i)=>`<li class="${i<st||st===4?'done':i===st?'cur':''}"><b>${t}</b></li>`).join('')}</ul>`:''}
  <div class="acts">${k==='open'?`<button class="btn sm" data-rnext="${r.id}">Avanzar: ${S[st+1]}</button>`:''}
  ${k==='open'&&st<=2?`<button class="btn sm ghost" data-rrej="${r.id}">Rechazar</button>`:''}
  ${k!=='can'&&k!=='rej'?`<button class="btn sm ghost" data-lbl="${r.id}">Ver guía</button>`:''}</div>`)}

/* ---------- Eventos ---------- */
function refresh(){draw();const m=$('#mAdm');if(m.classList.contains('open')){const t=$('#admT').textContent.split(' ');t[0]==='Pedido'?showOrder(t[1]):showRet(t[1])}}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(b.id==='bOut'){setAdmin(0);location.href='index.html';return}
  if(d.tab){tab=d.tab;q='';history.replaceState(null,'','#'+tab);closeAll();draw()}
  else if('fo' in d){fo=d.fo;draw()}
  else if('fr' in d){fr=d.fr;draw()}
  else if(d.vo)showOrder(d.vo);
  else if(d.vr)showRet(d.vr);
  else if(d.ost){const [f,st]=d.ost.split('|'),o=findO(f);
    if(st==='can'&&!confirm('¿Cancelar el pedido '+f+'? Se avisará al cliente y se reembolsará el pago.'))return;
    o.st=st;if(st==='ent')o.entAt=new Date().toISOString();saveOrders();refresh();toast('Pedido '+f+': '+OST[st][0].toLowerCase())}
  else if(d.rnext){const r=rets.find(x=>x.id===d.rnext);r.st=rStage(r)+1;saveRets();refresh();toast(r.id+': '+RST(r)[r.st].toLowerCase())}
  else if(d.rrej){const r=rets.find(x=>x.id===d.rrej),why=prompt('Motivo del rechazo (lo verá el cliente):','La pieza no cumple con la política de devoluciones.');
    if(!why)return;r.rej=why.trim();saveRets();refresh();toast('Devolución '+r.id+' rechazada')}
  else if('reseed' in d){if(!confirm('¿Borrar los pedidos y devoluciones de ejemplo y crearlos de nuevo? Las compras reales de este navegador no se tocan.'))return;
    const F=new Set(orders.filter(o=>o.adm).map(o=>o.folio));
    orders=orders.filter(o=>!o.adm);rets=rets.filter(r=>!r.adm&&!F.has(r.folio));seed();draw();toast('Datos de ejemplo restablecidos')}
  else if('resetp' in d){if(!confirm('¿Volver a los precios originales y marcar todo como disponible?'))return;
    ls.set('metza_prod',{});cfg.products.forEach(p=>{p.p=p.p0;delete p.off});draw();toast('Precios restablecidos')}});
document.addEventListener('input',e=>{if(e.target.id==='aq'){q=e.target.value.trim().toLowerCase();draw(1)}});
document.addEventListener('change',e=>{const t=e.target,d=t.dataset;if(!d.price&&!d.avail)return;
  const p=prod(d.price||d.avail),ov=ls.get('metza_prod',{}),o=ov[p.id]=ov[p.id]||{};
  if(d.price){const v=Math.round(+t.value);if(!(v>0)){toast('Escribe un precio válido');t.value=p.p;return}p.p=o.p=v;toast(p.n+': ahora '+money(v))}
  else{p.off=o.off=!t.checked;toast(p.n+(p.off?' marcado como agotado':' disponible de nuevo'))}
  ls.set('metza_prod',ov);draw()});
draw();
})();
