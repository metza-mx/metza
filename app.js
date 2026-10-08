/* ---------- Estructura común (encabezado, pie, carrito, ventanas) ---------- */
(function(){
const P=document.body.dataset.page;
const L=[['index.html','inicio','Inicio'],['catalogo.html','catalogo','Catálogo'],['mis-compras.html','compras','Mis compras'],['devoluciones.html','devoluciones','Devoluciones'],['pagos.html','pagos','Pagos y envíos'],['contacto.html','contacto','Contacto']];
document.body.insertAdjacentHTML('afterbegin',`<header><div class="hd">
<a href="index.html" class="logo"><b id="brand"></b><small id="tag"></small></a>
<nav>${L.map(([h,k,t])=>`<a href="${h}"${k===P?' class="act" aria-current="page"':''}>${t}</a>`).join('')}</nav>
<div class="ic"><button id="bCart" aria-label="Abrir carrito">🛍️<span id="cnt">0</span></button></div>
</div></header>`);
document.body.insertAdjacentHTML('beforeend',`
<footer><b id="fbrand"></b><span id="femail"></span><br>Hecho con orgullo en Metepec, Estado de México</footer>
<div class="ov" id="ov"></div>
<aside class="drawer" id="drawer" aria-label="Carrito">
<div class="mh"><h2>Tu carrito</h2><button class="x" data-close aria-label="Cerrar">✕</button></div>
<div class="mb" id="cartBody"></div><div class="mf" style="display:block" id="cartFoot"></div></aside>
<div class="modal" id="mPay"><div class="box"><div class="mh"><h2>Finalizar compra</h2><button class="x" data-close aria-label="Cerrar">✕</button></div><div class="mb" id="payBody"></div></div></div>
<div class="modal" id="mProd"><div class="box"><div class="mh"><h2>Detalle de la pieza</h2><button class="x" data-close aria-label="Cerrar">✕</button></div><div class="mb" id="prodBody"></div></div></div>
<div class="modal" id="mLbl"><div class="box"><div class="mh"><h2>Guía de retorno</h2><button class="x" data-close aria-label="Cerrar">✕</button></div><div class="mb" id="lblBody"></div></div></div>
<div class="toast" id="toast" role="status"></div>`);
})();

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const money=n=>'$'+Math.round(n).toLocaleString('es-MX');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
          set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const DAY=864e5;
const fdate=d=>new Date(d).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'});
const rnd=n=>Array.from({length:n},()=>Math.floor(Math.random()*10)).join('');

/* ---------- Datos ---------- */
const cfg={brand:'METZA',tag:'Historias hechas a mano',
heroT:'Historias que cobran vida.',
heroP:'Descubre piezas inspiradas en la tradición artesanal de Metepec y llévalas contigo.',
about:'Somos una marca dedicada a la comercialización y difusión de artesanías de Metepec. Buscamos conectar a las personas con piezas que cuentan una historia, una tradición y una identidad cultural.',
email:'hola@metza.mx',
products:[
{id:1,e:'🌳',c:'Árbol de la Vida',n:'Árbol de la Vida',d:'Pieza decorativa inspirada en una tradición representativa de Metepec.',p:850},
{id:2,e:'💀',c:'Catrinas',n:'Catrina de Barro',d:'Figura decorativa con detalles inspirados en la tradición artesanal.',p:620},
{id:3,e:'🧜',c:'Tlanchanas',n:'Tlanchana',d:'Pieza inspirada en la figura tradicional de la Tlanchana.',p:540},
{id:4,e:'🏺',c:'Barro',n:'Vasija de Barro',d:'Pieza de barro para decoración, con carácter artesanal.',p:390},
{id:5,e:'🌱',c:'Árbol de la Vida',n:'Mini Árbol',d:'Versión compacta del árbol, ideal para escritorio o repisa.',p:280},
{id:6,e:'🌸',c:'Catrinas',n:'Catrina Floral',d:'Catrina con acabados florales pintados a mano.',p:690},
{id:7,e:'🐚',c:'Tlanchanas',n:'Tlanchana Mini',d:'Tlanchana pequeña, perfecta para regalo.',p:320},
{id:8,e:'🫖',c:'Barro',n:'Jarra de Barro',d:'Jarra tradicional de barro cocido, con acabado natural.',p:450},
{id:9,e:'🪴',c:'Barro',n:'Maceta Artesanal',d:'Maceta de barro decorada a mano para tus plantas.',p:260},
{id:10,e:'🌲',c:'Árbol de la Vida',n:'Árbol de la Vida Grande',d:'Pieza de gran formato, protagonista de cualquier espacio.',p:1450},
{id:11,e:'🎭',c:'Catrinas',n:'Catrina Elegante',d:'Catrina con sombrero y vestido detallado a mano.',p:780},
{id:12,e:'🍲',c:'Barro',n:'Cazuela de Barro',d:'Cazuela para cocinar y servir, de barro tradicional.',p:310}]};

const PAYS=['💳 Tarjeta de crédito o débito','🏦 Transferencia bancaria (SPEI)','🏪 Pago en efectivo en OXXO','📱 Mercado Pago'],
ZN=[['Metepec / Toluca','1 día',1],['CDMX y Edomex','2–3 días',3],['Resto del país','4–6 días',6]];

/* Devoluciones: plazo, costo de guía y opciones */
const RET_DAYS=7,RET_SHIP=99;
const REAS=[['dano','💔 Llegó dañada','Rota, despostillada o golpeada al recibirla.'],
 ['error','📦 Recibí una pieza distinta','No corresponde a lo que compré.'],
 ['desc','🔍 No coincide con la descripción','Color, tamaño o acabado diferentes a lo mostrado.'],
 ['arrep','💭 Cambié de opinión','Pieza sin uso y con su embalaje. La guía de retorno cuesta $'+RET_SHIP+'.']];
const SOL=[['reembolso','💵 Reembolso','Te devolvemos el dinero a tu método de pago original.'],
 ['cambio','🔄 Cambio por la misma pieza','Te enviamos una pieza nueva, sujeto a disponibilidad.'],
 ['credito','🎁 Saldo a favor','Recibe el importe completo como saldo para tu próxima compra.']];
const MET=[['recoleccion','🚚 Recolección a domicilio','La paquetería pasa por el paquete en 1–2 días hábiles.'],
 ['sucursal','🏪 Entrega en sucursal','Lleva el paquete con la guía impresa a cualquier sucursal.']];
const REFT=['a tu tarjeta en 5–10 días hábiles','a tu cuenta por transferencia en 2–3 días hábiles','por transferencia; como pagaste en efectivo, te pediremos tu cuenta por correo','a tu cuenta de Mercado Pago en 2–5 días hábiles'];
const RFIN={reembolso:'Reembolso emitido',cambio:'Pieza de cambio enviada',credito:'Saldo a favor disponible'};
const ROFF=[0,1,3,4,5];
const lab=(L,k)=>(L.find(x=>x[0]===k)||['',''])[1];

/* ---------- Estado ---------- */
let cart=ls.get('metza_cart',{}),coupon=ls.get('metza_coupon','');
const prod=id=>cfg.products.find(p=>p.id==id);
const saveCart=()=>{ls.set('metza_cart',cart);ls.set('metza_coupon',coupon)};
function totals(){
  const sub=Object.entries(cart).reduce((s,[id,q])=>s+(prod(id)?prod(id).p*q:0),0);
  const disc=coupon==='METZA10'?sub*.1:0,ship=sub===0?0:(sub>=1000?0:99);
  return{sub,disc,ship,total:sub-disc+ship}}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2600)}

/* Compras y devoluciones guardadas en este navegador */
function mkOrder(o){
  o.sub=o.items.reduce((a,i)=>a+i.p*i.q,0);o.disc=o.sub*o.dr;o.ship=o.sub>=1000?0:99;o.total=o.sub-o.disc+o.ship;
  o.folio=o.folio||'MTZ-'+rnd(6);return o}
let orders=ls.get('metza_orders',null),rets=ls.get('metza_returns',[]);
if(!orders){const ago=d=>new Date(Date.now()-d*DAY).toISOString();
  orders=[mkOrder({folio:'MTZ-371204',demo:1,date:ago(20),n:'Cliente de ejemplo',e:'cliente@ejemplo.com',a:'Calle Juárez 45, Metepec',z:0,m:2,dr:0,items:[{id:1,q:1,p:850}]}),
          mkOrder({folio:'MTZ-482913',demo:1,date:ago(4),n:'Cliente de ejemplo',e:'cliente@ejemplo.com',a:'Av. Hidalgo 120, Toluca',z:1,m:0,dr:.1,items:[{id:2,q:1,p:620},{id:8,q:2,p:450}]})];
  ls.set('metza_orders',orders)}
const saveOrders=()=>ls.set('metza_orders',orders),saveRets=()=>ls.set('metza_returns',rets);
const findO=f=>orders.find(o=>o.folio===String(f||'').trim().toUpperCase());
const delivered=o=>new Date(o.date).getTime()+ZN[o.z][2]*DAY;
function oStatus(o){const now=Date.now();
  return now>=delivered(o)?['Entregado','ok']:now-new Date(o.date)<DAY?['En preparación','pr']:['En camino','go']}
const retQ=(folio,id)=>rets.filter(r=>r.folio===folio&&!r.cancel).reduce((a,r)=>a+((r.items.find(i=>i.id==id)||{}).q||0),0);
function canReturn(o){const now=Date.now(),lim=delivered(o)+RET_DAYS*DAY;
  if(now<delivered(o))return[false,'Podrás solicitar una devolución cuando recibas tu pedido.'];
  if(now>lim)return[false,'El plazo para devoluciones terminó el '+fdate(lim)+'.'];
  if(o.items.every(i=>retQ(o.folio,i.id)>=i.q))return[false,'Todas las piezas ya están en una devolución.'];
  return[true,'Puedes solicitar una devolución hasta el '+fdate(lim)+'.']}
function rStage(r){if(r.cancel)return -1;const d=(Date.now()-new Date(r.date))/DAY;return ROFF.filter(x=>d>=x).length-1}
const sumItems=o=>o.items.map(i=>i.q+'× '+prod(i.id).n).join(', ');

/* ---------- Render ---------- */
function renderTexts(){
  document.title=document.body.dataset.title?document.body.dataset.title+' · '+cfg.brand:cfg.brand+' · '+cfg.tag;
  $('#brand').textContent=cfg.brand;$('#tag').textContent=cfg.tag;
  [['#heroT','heroT'],['#heroP','heroP'],['#about','about']].forEach(([s,k])=>{const e=$(s);if(e)e.textContent=cfg[k]});
  $('#fbrand').textContent=cfg.brand;$('#femail').textContent=cfg.email}
function renderCats(){if(!$('#cat'))return;
  const cs=[...new Set(cfg.products.map(p=>p.c))],cur=$('#cat').value;
  $('#cat').innerHTML='<option value="">Todas las categorías</option>'+cs.map(c=>`<option>${esc(c)}</option>`).join('');
  $('#cat').value=cur}
function renderGrid(){const g=$('#grid');if(!g)return;
  const f=$('#cat')?$('#cat').value:'',lim=+g.dataset.limit||99;
  g.innerHTML=cfg.products.filter(p=>!f||p.c===f).slice(0,lim).map(p=>`
  <article class="card prod"><button class="em" data-view="${p.id}" aria-label="Ver detalle de ${esc(p.n)}">${p.e}</button>
  <span class="chip">${esc(p.c.toUpperCase())}</span><h3>${esc(p.n)}</h3><p>${esc(p.d)}</p>
  <div class="pr"><b>${money(p.p)}</b><span><button class="btn sm ghost" data-view="${p.id}">Ver</button> <button class="btn sm" data-add="${p.id}">Agregar</button></span></div></article>`).join('')}
function renderCart(){
  const ids=Object.keys(cart).filter(id=>prod(id)),t=totals();
  $('#cnt').textContent=ids.reduce((a,id)=>a+cart[id],0);
  $('#cartBody').innerHTML=ids.length?ids.map(id=>{const p=prod(id);return `
  <div class="ci"><span class="e">${p.e}</span><div><b>${esc(p.n)}</b><br>${money(p.p)}</div>
  <span class="q"><button data-dec="${id}" aria-label="Quitar uno">−</button>${cart[id]}<button data-inc="${id}" aria-label="Agregar uno">+</button></span>
  <button class="x" data-del="${id}" aria-label="Eliminar">✕</button></div>`}).join(''):'<p>Tu carrito está vacío. Agrega piezas desde el catálogo.</p>';
  $('#cartFoot').innerHTML=`
  <div class="cp"><input id="cpIn" placeholder="Código de descuento" value="${esc(coupon)}"><button class="btn dk sm" id="cpBtn">Aplicar</button></div>
  <div class="tr"><span>Subtotal</span><span>${money(t.sub)}</span></div>
  ${t.disc?`<div class="tr"><span>Descuento METZA10</span><span>−${money(t.disc)}</span></div>`:''}
  <div class="tr"><span>Envío</span><span>${t.sub?(t.ship?money(t.ship):'Gratis'):'—'}</span></div>
  <div class="tr t"><span>Total</span><span>${money(t.total)}</span></div>
  <button class="btn" style="width:100%;margin-top:12px" id="goPay">Proceder al pago</button>`;
  saveCart()}
function renderOrders(){const c=$('#orders');if(!c)return;
  c.innerHTML=orders.length?orders.slice().reverse().map(o=>{const [s,k]=oStatus(o),[ok,msg]=canReturn(o);
  return `<article class="card oc"><div class="oh"><div><h3>${o.folio}${o.demo?' <span class="chip">EJEMPLO</span>':''}</h3><span class="mut">Comprado el ${fdate(o.date)}</span></div><span class="bd ${k}">${s}</span></div>
  ${o.items.map(i=>{const p=prod(i.id),rq=retQ(o.folio,i.id);return `<div class="ol"><span class="e2">${p.e}</span><span style="flex:1">${i.q}× ${esc(p.n)}${rq?` <small class="mut">(${rq} en devolución)</small>`:''}</span><b>${money(i.p*i.q)}</b></div>`}).join('')}
  ${o.disc?`<div class="tr"><span class="mut">Descuento</span><span>−${money(o.disc)}</span></div>`:''}
  <div class="tr"><span class="mut">Envío</span><span>${o.ship?money(o.ship):'Gratis'}</span></div>
  <div class="tr t"><span>Total</span><span>${money(o.total)}</span></div>
  <p class="mut">${PAYS[o.m]} · Envío a ${esc(o.a)} (${ZN[o.z][0]})<br>${k==='ok'?'Entregado el ':'Entrega estimada: '}${fdate(delivered(o))}</p>
  <p class="mut" style="margin-top:6px">↩️ ${esc(msg)}</p>
  <div class="acts">${ok?`<a class="btn sm" href="devoluciones.html?pedido=${o.folio}">Solicitar devolución</a>`:''}<button class="btn sm ghost" data-rebuy="${o.folio}">Volver a comprar</button></div></article>`}).join('')
  :'<p class="mut">Todavía no tienes compras. <a href="catalogo.html">Ve al catálogo</a>.</p>'}
function renderRets(){const c=$('#rets');if(!c)return;
  c.innerHTML=rets.length?rets.slice().reverse().map(r=>{const st=rStage(r),done=st===4,
  ST=['Solicitud aprobada','Pieza en camino a METZA','Pieza recibida','Revisión de calidad',RFIN[r.s]];
  return `<article class="card oc"><div class="oh"><div><h3>${r.id}</h3><span class="mut">Pedido ${r.folio} · ${fdate(r.date)}</span></div>${r.cancel?'<span class="bd no">Cancelada</span>':done?'<span class="bd ok">Completada</span>':'<span class="bd go">En proceso</span>'}</div>
  ${r.items.map(i=>`<div class="ol"><span class="e2">${prod(i.id).e}</span><span style="flex:1">${i.q}× ${esc(prod(i.id).n)}</span></div>`).join('')}
  <div class="tr"><span class="mut">Motivo</span><span>${lab(REAS,r.r)}</span></div>
  <div class="tr"><span class="mut">Solución</span><span>${lab(SOL,r.s)}${r.s!=='cambio'?' · '+money(r.amt):''}</span></div>
  ${r.cancel?'':`<ul class="tl">${ST.map((t,i)=>`<li class="${i<st||done?'done':i===st?'cur':''}"><b>${t}</b><small>${i<=st?'':'Estimado: '}${fdate(new Date(r.date).getTime()+ROFF[i]*DAY)}</small></li>`).join('')}</ul>`}
  <div class="acts">${r.cancel?'':`<button class="btn sm ghost" data-lbl="${r.id}">Ver guía</button>`}${st===0?`<button class="btn sm ghost" data-cancel="${r.id}">Cancelar solicitud</button>`:''}</div></article>`}).join('')
  :'<p class="mut">Aún no tienes devoluciones.</p>'}

/* ---------- Ventanas ---------- */
function openDrawer(){$('#drawer').classList.add('open');$('#ov').classList.add('open')}
function closeAll(){$$('.modal,.drawer,.ov').forEach(e=>e.classList.remove('open'))}
function openProd(id){const p=prod(id);
  $('#prodBody').innerHTML=`<div class="pd"><div class="big2" aria-hidden="true">${p.e}</div><div>
  <span class="chip">${esc(p.c.toUpperCase())}</span><h2 style="margin:8px 0">${esc(p.n)}</h2><p>${esc(p.d)}</p><b class="pp">${money(p.p)}</b>
  <ul class="mut feats"><li>✋ Hecha a mano en Metepec; cada pieza es única.</li><li>📦 Llega en 1 a 6 días según tu zona; envío gratis desde $1,000.</li><li>↩️ Tienes ${RET_DAYS} días para devolverla.</li></ul>
  <div class="pr"><span class="q"><button data-pq="-1" aria-label="Menos">−</button><span id="pq">1</span><button data-pq="1" aria-label="Más">+</button></span><button class="btn" data-addq="${p.id}">Agregar al carrito</button></div></div></div>`;
  closeAll();$('#mProd').classList.add('open')}
function showLabel(id){const r=rets.find(x=>x.id===id),o=findO(r.folio);
  $('#lblBody').innerHTML=`<div class="lbl"><div class="tr"><b>GUÍA DE RETORNO</b><b>${r.g}</b></div><div class="bar" aria-hidden="true"></div>
  <div class="cols2"><div><small>REMITENTE</small><p>${esc(o.n)}<br>${esc(r.m==='recoleccion'?r.a:o.a)}</p></div><div><small>DESTINATARIO</small><p>Devoluciones ${esc(cfg.brand)}<br>Bodega Metepec, Estado de México</p></div></div>
  <div class="tr"><span>Devolución</span><b>${r.id}</b></div><div class="tr"><span>Pedido</span><b>${r.folio}</b></div>
  <div class="tr"><span>Piezas</span><b>${r.items.reduce((a,i)=>a+i.q,0)}</b></div><div class="tr"><span>Servicio</span><b>${lab(MET,r.m)}</b></div></div>
  <button class="btn dk" style="width:100%;margin-top:16px" id="bPrint">Imprimir guía</button>`;
  closeAll();$('#mLbl').classList.add('open')}

document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const d=b.dataset;
  if(d.add){cart[d.add]=(cart[d.add]||0)+1;renderCart();toast(prod(d.add).n+' agregado al carrito')}
  else if(d.view)openProd(d.view);
  else if(d.pq){const q=$('#pq');q.textContent=Math.min(10,Math.max(1,+q.textContent+ +d.pq))}
  else if(d.addq){cart[d.addq]=(cart[d.addq]||0)+ +$('#pq').textContent;closeAll();renderCart();toast(prod(d.addq).n+' agregado al carrito')}
  else if(d.inc){cart[d.inc]++;renderCart()}
  else if(d.dec){if(--cart[d.dec]<1)delete cart[d.dec];renderCart()}
  else if(d.del){delete cart[d.del];renderCart()}
  else if(d.rebuy){findO(d.rebuy).items.forEach(i=>cart[i.id]=(cart[i.id]||0)+i.q);renderCart();openDrawer()}
  else if(d.lbl)showLabel(d.lbl);
  else if(d.cancel){if(!confirm('¿Cancelar la solicitud '+d.cancel+'? Las piezas volverán a estar disponibles para devolución.'))return;
    rets.find(r=>r.id===d.cancel).cancel=1;saveRets();renderRets();renderOrders();toast('Solicitud cancelada')}
  else if(b.id==='bPrint')window.print();
  else if(b.id==='cpBtn'){const v=$('#cpIn').value.trim().toUpperCase();
    if(!v){coupon=''}else if(v==='METZA10'){coupon=v;toast('Descuento aplicado')}else{coupon='';toast('Código no válido')}renderCart()}
  else if(b.id==='goPay')openPay();
  else if(d.close!==undefined)closeAll()});
$('#bCart').onclick=openDrawer;
$('#ov').onclick=closeAll;
$$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeAll()}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
if($('#cat'))$('#cat').onchange=renderGrid;

/* ---------- Pago (simulado) ---------- */
function openPay(){
  const t=totals();if(!t.sub){toast('Tu carrito está vacío');return}
  closeAll();
  $('#payBody').innerHTML=`<form class="fm" id="fPay">
  <label>Nombre<input name="n" required autocomplete="name"></label><label>Correo<input name="e" type="email" required autocomplete="email"></label>
  <label class="w">Dirección de entrega<input name="a" required autocomplete="street-address"></label>
  <label class="w">Destino<select name="z">${ZN.map((z,i)=>`<option value="${i}">${z[0]} · ${z[1]}</option>`).join('')}</select></label>
  <fieldset class="w"><legend>Método de pago</legend>${PAYS.map((m,i)=>`<label class="rd"><input type="radio" name="m" value="${i}" ${i?'':'checked'}>${m}</label>`).join('')}</fieldset>
  <p class="w mut">Total a pagar: <b>${money(t.total)}</b>. Es una simulación: no se realiza ningún cobro real.</p>
  <button class="btn dk w" style="padding:15px">Confirmar pedido</button></form>`;
  $('#mPay').classList.add('open');
  $('#fPay').onsubmit=ev=>{ev.preventDefault();
    const f=new FormData(ev.target),z=ZN[f.get('z')],pz=Object.values(cart).reduce((a,b)=>a+b,0);
    const big=Object.keys(cart).some(id=>prod(id)&&prod(id).p>=1000);
    const emb=(pz>=3||big)?'Caja reforzada con relleno de papel kraft':'Caja de cartón con papel kraft';
    const o=mkOrder({date:new Date().toISOString(),n:f.get('n'),e:f.get('e'),a:f.get('a'),z:+f.get('z'),m:+f.get('m'),dr:coupon==='METZA10'?.1:0,
      items:Object.entries(cart).filter(([id])=>prod(id)).map(([id,q])=>({id:+id,q,p:prod(id).p}))});
    orders.push(o);saveOrders();
    $('#payBody').innerHTML=`<div class="ok"><div class="big">✅</div><h2>¡Gracias, ${esc(o.n)}!</h2>
    <p class="mut" style="margin:6px 0 16px">Pedido ${o.folio} registrado. Enviaremos el resumen a ${esc(o.e)}.</p>
    <div class="card" style="text-align:left;box-shadow:none;border:1px solid #eee">
    <div class="tr"><span>Pago</span><b>${PAYS[o.m]}</b></div>
    <div class="tr"><span>Embalaje</span><b>${emb}</b></div>
    <div class="tr"><span>Tiempo de envío</span><b>${z[1]} (${z[0]})</b></div>
    <div class="tr t"><span>Total</span><span>${money(o.total)}</span></div></div>
    <a class="btn sm" style="margin-top:16px" href="mis-compras.html">Ver mis compras</a></div>`;
    cart={};coupon='';renderCart();renderOrders()}}

/* ---------- Contacto (abre el correo del visitante) ---------- */
if($('#fContact'))$('#fContact').onsubmit=e=>{e.preventDefault();
  const f=new FormData(e.target);
  location.href='mailto:'+cfg.email+'?subject='+encodeURIComponent('Mensaje de '+f.get('n'))+'&body='+encodeURIComponent(f.get('m')+'\n\n'+f.get('n')+' · '+f.get('e'));
  toast('Abriendo tu aplicación de correo…');e.target.reset()};

/* ---------- Banners ---------- */
let bi=0;const slides=$$('.slide'),dots=$$('#dots i');
function showBn(i){bi=i;slides.forEach((s,j)=>s.classList.toggle('on',j===i));dots.forEach((d,j)=>d.classList.toggle('on',j===i))}
dots.forEach((d,i)=>d.onclick=()=>showBn(i));
if(slides.length>1)setInterval(()=>showBn((bi+1)%slides.length),6000);

renderTexts();renderCats();renderGrid();renderCart();renderOrders();renderRets();

/* ---------- Solicitud de devolución (paso a paso) ---------- */
(function(){
const box=$('#rw');if(!box)return;
let w;
const reset=()=>{w={step:1,folio:'',sel:{},r:'',c:'',photos:[],s:'',m:'',a:'',res:null}};
reset();
const ord=()=>findO(w.folio);
const pick=o=>{if(o.folio!==w.folio){w.sel={};w.a=o.a}w.folio=o.folio;w.step=2};
const pre=findO(new URLSearchParams(location.search).get('pedido'));
if(pre&&canReturn(pre)[0])pick(pre);
const lines=()=>{const o=ord();return Object.entries(w.sel).map(([id,q])=>({id:+id,q,u:o.items.find(i=>i.id==id).p*(1-o.dr)}))};
function calc(){const val=lines().reduce((a,l)=>a+l.u*l.q,0),fee=w.r==='arrep'&&w.s!=='credito'?RET_SHIP:0;
  return{val,fee,amt:w.s==='cambio'?0:val-fee}}
const head=()=>`<ol class="steps">${['Pedido','Piezas','Motivo','Solución','Confirmar'].map((t,i)=>`<li class="${i+1<w.step?'done':i+1===w.step?'cur':''}"${i+1===w.step?' aria-current="step"':''}><span>${i+1}</span>${t}</li>`).join('')}</ol>`;
const radios=(L,name,cur)=>`<div class="opts">${L.map(([k,t,h])=>`<label class="opt"><input type="radio" name="${name}" value="${k}"${cur===k?' checked':''} required><span><b>${t}</b><small>${h}</small></span></label>`).join('')}</div>`;
const back='<button type="button" class="btn sm ghost" data-a="back">Atrás</button>';
const V={
1:()=>`<form id="w1"><p class="mut" style="margin-bottom:12px">Elige el pedido del que quieres devolver piezas.</p>
<div class="opts">${orders.slice().reverse().map(o=>{const [ok,msg]=canReturn(o);return `<label class="opt${ok?'':' dis'}"><input type="radio" name="o" value="${o.folio}"${ok?'':' disabled'}${w.folio===o.folio?' checked':''} required><span><b>${o.folio} · ${fdate(o.date)}</b><small>${esc(sumItems(o))} · ${money(o.total)}</small><small>${esc(msg)}</small></span></label>`}).join('')||'<p class="mut">No hay compras registradas en este navegador.</p>'}</div>
<div class="nav2"><span></span><button class="btn dk sm">Continuar</button></div></form>
<details class="lk"><summary>¿No ves tu pedido? Búscalo con tu número y correo</summary>
<form id="wL" class="fm" style="margin-top:12px"><label>Número de pedido<input name="f" required placeholder="MTZ-482913"></label><label>Correo de la compra<input name="e" type="email" required placeholder="cliente@ejemplo.com"></label><button class="btn sm ghost w">Buscar pedido</button></form></details>`,
2:()=>{const o=ord();return `<form id="w2"><p class="mut" style="margin-bottom:12px">Pedido <b>${o.folio}</b>. Selecciona las piezas y cuántas quieres devolver.</p>
<div class="opts">${o.items.map(i=>{const p=prod(i.id),rest=i.q-retQ(o.folio,i.id);
  if(rest<1)return `<div class="opt dis"><span class="e2">${p.e}</span><span><b>${esc(p.n)}</b><small>Ya está en una devolución.</small></span></div>`;
  return `<label class="opt"><input type="checkbox" name="i" value="${i.id}"${w.sel[i.id]?' checked':''}><span class="e2">${p.e}</span><span style="flex:1"><b>${esc(p.n)}</b><small>${money(i.p*(1-o.dr))} c/u${o.dr?' (con descuento aplicado)':''}</small></span>${rest>1?`<select name="q${i.id}" aria-label="Cantidad a devolver" style="width:auto">${Array.from({length:rest},(_,k)=>`<option${w.sel[i.id]===k+1?' selected':''}>${k+1}</option>`).join('')}</select>`:'<span class="mut">1 pza</span>'}</label>`}).join('')}</div>
<div class="nav2">${back}<button class="btn dk sm">Continuar</button></div></form>`},
3:()=>`<form id="w3">${radios(REAS,'r',w.r)}
<div id="fotos"${w.r&&w.r!=='arrep'?'':' hidden'}><label class="mut" style="font-weight:600">Fotos de la pieza y del embalaje <span id="freq">${w.r==='dano'?'(obligatorias)':'(recomendadas)'}</span><input type="file" id="fi" accept="image/*" multiple style="margin-top:6px"></label><div class="thumbs" id="th"></div></div>
<label class="mut" style="display:flex;flex-direction:column;gap:6px;font-weight:600;margin-top:8px">Cuéntanos más (opcional)<textarea name="c" rows="3" maxlength="500">${esc(w.c)}</textarea></label>
<div class="nav2">${back}<button class="btn dk sm">Continuar</button></div></form>`,
4:()=>`<form id="w4"><p class="sec2">¿Cómo lo resolvemos?</p>${radios(SOL,'s',w.s)}
<p class="sec2">¿Cómo nos envías la pieza?</p>${radios(MET,'m',w.m)}
<label id="dir" class="mut" style="display:${w.m==='recoleccion'?'flex':'none'};flex-direction:column;gap:6px;font-weight:600">Dirección de recolección<input name="a" value="${esc(w.a)}" autocomplete="street-address"></label>
<div class="nav2">${back}<button class="btn dk sm">Revisar solicitud</button></div></form>`,
5:()=>{const o=ord(),c=calc();
 const dest=w.s==='reembolso'?`Recibirás ${money(c.amt)} ${REFT[o.m]}, después de revisar la pieza.`
  :w.s==='cambio'?'Enviaremos la pieza nueva cuando recibamos la devolución.'+(c.fee?` El costo de la guía (${money(c.fee)}) se cargará a tu método de pago original.`:'')
  :`Te enviaremos un código de saldo por ${money(c.amt)} a ${esc(o.e)} para tu próxima compra.`;
 return `<form id="w5"><div class="sumr">
${lines().map(l=>`<div class="tr"><span>${l.q}× ${esc(prod(l.id).n)}</span><span>${money(l.u*l.q)}</span></div>`).join('')}
<div class="tr"><span class="mut">Motivo</span><span>${lab(REAS,w.r)}</span></div>
<div class="tr"><span class="mut">Solución</span><span>${lab(SOL,w.s)}</span></div>
<div class="tr"><span class="mut">Envío de retorno</span><span>${lab(MET,w.m)}</span></div>
<div class="tr"><span class="mut">Guía de retorno</span><span>${c.fee?(w.s==='cambio'?'':'−')+money(c.fee):'Gratis'}</span></div>
<div class="tr t"><span>${w.s==='reembolso'?'Reembolso':w.s==='credito'?'Saldo a favor':'Costo para ti'}</span><span>${money(w.s==='cambio'?c.fee:c.amt)}</span></div>
<p class="mut">${dest}</p></div>
<label class="rd"><input type="checkbox" required> Confirmo que la pieza está completa y con su embalaje${w.r==='arrep'?', sin uso,':''} y acepto la política de devoluciones.</label>
<div class="nav2">${back}<button class="btn sm">Enviar solicitud</button></div></form>`},
6:()=>{const r=w.res;return `<div class="ok"><div class="big">✅</div><h3>Devolución ${r.id} aprobada</h3><p class="mut" style="margin:6px 0 16px">Enviamos la confirmación a ${esc(ord().e)}. Tu guía de retorno es <b>${r.g}</b>.</p></div>
<ol class="mut" style="margin:0 0 16px 20px"><li>Envuelve la pieza en papel y colócala en su caja original o en una caja firme.</li><li>Imprime la guía y pégala por fuera del paquete.</li>
<li>${r.m==='recoleccion'?'Ten el paquete listo: la paquetería pasará a '+esc(r.a)+' en 1–2 días hábiles.':'Llévalo a cualquier sucursal de la paquetería en los próximos 5 días.'}</li></ol>
<div class="acts"><button class="btn sm" data-lbl="${r.id}">Ver e imprimir guía</button><a class="btn sm ghost" href="mis-compras.html#devs">Ver mis devoluciones</a><button class="btn sm ghost" data-a="reset">Iniciar otra devolución</button></div>`}
};
const thumbs=()=>{const t=$('#th');if(t)t.innerHTML=w.photos.map(u=>`<img src="${u}" alt="Foto adjunta">`).join('')};
function draw(){box.innerHTML=(w.step<6?head():'')+V[w.step]();if(w.step===3)thumbs()}
box.onsubmit=e=>{e.preventDefault();const f=e.target,fd=new FormData(f);
  if(f.id==='wL'){const o=findO(fd.get('f'));
    if(!o||o.e.toLowerCase()!==String(fd.get('e')).trim().toLowerCase()){toast('No encontramos un pedido con esos datos');return}
    const [ok,msg]=canReturn(o);if(!ok){toast(msg);return}pick(o)}
  else if(f.id==='w1')pick(findO(fd.get('o')));
  else if(f.id==='w2'){const s={};fd.getAll('i').forEach(id=>s[id]=+(fd.get('q'+id)||1));
    if(!Object.keys(s).length){toast('Selecciona al menos una pieza');return}w.sel=s;w.step=3}
  else if(f.id==='w3'){w.r=fd.get('r');w.c=String(fd.get('c')||'').trim();
    if(w.r==='dano'&&!w.photos.length){toast('Agrega al menos una foto de la pieza dañada');return}w.step=4}
  else if(f.id==='w4'){w.s=fd.get('s');w.m=fd.get('m');w.a=String(fd.get('a')||'').trim();
    if(w.m==='recoleccion'&&!w.a){toast('Escribe la dirección de recolección');return}w.step=5}
  else if(f.id==='w5'){const c=calc();
    w.res={id:'DEV-'+rnd(6),g:'GR-'+rnd(10),folio:w.folio,date:new Date().toISOString(),items:lines(),r:w.r,c:w.c,ph:w.photos.length,s:w.s,m:w.m,a:w.a,fee:c.fee,amt:c.amt};
    rets.push(w.res);saveRets();renderRets();w.step=6}
  draw();box.scrollIntoView({block:'start',behavior:'smooth'})};
box.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;
  if(b.dataset.a==='back')w.step=Math.max(1,w.step-1);else reset();
  draw()};
box.onchange=e=>{const t=e.target;
  if(t.name==='r'){$('#fotos').hidden=t.value==='arrep';$('#freq').textContent=t.value==='dano'?'(obligatorias)':'(recomendadas)'}
  else if(t.name==='m')$('#dir').style.display=t.value==='recoleccion'?'flex':'none';
  else if(t.id==='fi'){w.photos=[...t.files].map(f=>URL.createObjectURL(f));thumbs()}};
draw();
})();
