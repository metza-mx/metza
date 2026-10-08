/* ---------- Estructura común (encabezado, pie, carrito, ventanas) ---------- */
(function(){
const P=document.body.dataset.page;
const L=[['index.html','inicio','Inicio'],['catalogo.html','catalogo','Catálogo'],['simulacion.html','simulacion','Simulación de compras'],['pagos.html','pagos','Pagos y devoluciones'],['contacto.html','contacto','Contacto']];
document.body.insertAdjacentHTML('afterbegin',`<header><div class="hd">
<a href="index.html" class="logo"><b id="brand"></b><small id="tag"></small></a>
<nav>${L.map(([h,k,t])=>`<a href="${h}"${k===P?' class="act" aria-current="page"':''}>${t}</a>`).join('')}</nav>
<div class="ic"><button id="bSet" aria-label="Configuración de la tienda">⚙️</button><button id="bCart" aria-label="Abrir carrito">🛍️<span id="cnt">0</span></button></div>
</div></header>`);
document.body.insertAdjacentHTML('beforeend',`
<footer><b id="fbrand"></b><span id="femail"></span><br>Hecho con orgullo en Metepec, Estado de México</footer>
<div class="ov" id="ov"></div>
<aside class="drawer" id="drawer" aria-label="Carrito">
<div class="mh"><h2>Tu carrito</h2><button class="x" data-close aria-label="Cerrar">✕</button></div>
<div class="mb" id="cartBody"></div><div class="mf" style="display:block" id="cartFoot"></div></aside>
<div class="modal" id="mPay"><div class="box"><div class="mh"><h2>Finalizar compra</h2><button class="x" data-close aria-label="Cerrar">✕</button></div><div class="mb" id="payBody"></div></div></div>
<div class="modal" id="mSet"><div class="box"><div class="mh"><h2>Configuración de tienda</h2><button class="x" data-close aria-label="Cerrar">✕</button></div><div class="mb" id="setBody"></div>
<div class="mf"><button class="lnk" id="reset">Restaurar valores por defecto</button><button class="btn dk" id="save">Guardar cambios</button></div></div></div>
<div class="toast" id="toast" role="status"></div>`);
})();

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const money=n=>'$'+Math.round(n).toLocaleString('es-MX');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
          set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
          del(k){try{localStorage.removeItem(k)}catch(e){}}};

/* ---------- Datos ---------- */
const DEF={brand:'METZA',tag:'Historias hechas a mano',
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

const SIM=[
{cli:'Ana · Metepec',items:{1:1,5:1},zona:'Metepec, Edomex',emb:'Caja de cartón con papel kraft',embC:35,svc:'Entrega local',env:50,dias:'1 día'},
{cli:'Luis · CDMX',items:{2:2},zona:'Ciudad de México',emb:'Caja de cartón con papel kraft',embC:60,svc:'Paquetería estándar',env:140,dias:'2–3 días'},
{cli:'Sofía · Guadalajara',items:{3:1,4:1},zona:'Guadalajara, Jal.',emb:'Caja de cartón con papel kraft',embC:45,svc:'Paquetería estándar',env:180,dias:'3–5 días'},
{cli:'Carlos · Monterrey',items:{10:1,7:1},zona:'Monterrey, N.L.',emb:'Caja reforzada con relleno',embC:90,svc:'Paquetería express',env:220,dias:'4–6 días'}];
const COSTO=.5,PAYS=['💳 Tarjeta de crédito o débito','🏦 Transferencia bancaria (SPEI)','🏪 Pago en efectivo en OXXO','📱 Mercado Pago'],
ZN=[['Metepec / Toluca','1 día'],['CDMX y Edomex','2–3 días'],['Resto del país','4–6 días']];

/* ---------- Estado ---------- */
function load(){const s=ls.get('metza_cfg',{});const c={...DEF,...s};
  c.products=DEF.products.map(p=>({...p,...((s.products||[]).find(x=>x.id===p.id)||{})}));return c}
let cfg=load(),cart=ls.get('metza_cart',{}),coupon=ls.get('metza_coupon','');
const prod=id=>cfg.products.find(p=>p.id==id);
const saveCart=()=>{ls.set('metza_cart',cart);ls.set('metza_coupon',coupon)};
function totals(){
  const sub=Object.entries(cart).reduce((s,[id,q])=>s+(prod(id)?prod(id).p*q:0),0);
  const disc=coupon==='METZA10'?sub*.1:0,ship=sub===0?0:(sub>=1000?0:99);
  return{sub,disc,ship,total:sub-disc+ship}}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}

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
  <article class="card prod"><div class="em" aria-hidden="true">${p.e}</div>
  <span class="chip">${esc(p.c.toUpperCase())}</span><h3>${esc(p.n)}</h3><p>${esc(p.d)}</p>
  <div class="pr"><b>${money(p.p)}</b><button class="btn sm" data-add="${p.id}">Agregar</button></div></article>`).join('')}
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
function renderSim(){if(!$('#sim'))return;
  let tI=0,tG=0;
  $('#sim').innerHTML=SIM.map((s,i)=>{
    const its=Object.entries(s.items).map(([id,q])=>q+'× '+prod(id).n).join(', ');
    const sub=Object.entries(s.items).reduce((a,[id,q])=>a+prod(id).p*q,0);
    const cob=sub>=1000?0:s.env,ing=sub+cob,pro=sub*COSTO,gan=ing-pro-s.embC-s.env;
    tI+=ing;tG+=gan;
    return `<article class="card sim"><h3>Compra ${i+1}</h3><p class="mut" style="margin-bottom:8px">${esc(s.cli)}<br>${esc(its)}</p>
    <div class="l"><span>Subtotal</span><b>${money(sub)}</b></div>
    <div class="l"><span>Envío cobrado</span><b>${cob?money(cob):'Gratis'}</b></div>
    <div class="l"><span>Ingresos</span><b>${money(ing)}</b></div>
    <div class="l"><span>Costo de producción</span><b>−${money(pro)}</b></div>
    <div class="l"><span>Embalaje: ${esc(s.emb)}</span><b>−${money(s.embC)}</b></div>
    <div class="l"><span>Envío (${esc(s.svc)})</span><b>−${money(s.env)}</b></div>
    <div class="l"><span>Tiempo de envío a ${esc(s.zona)}</span><b>${esc(s.dias)}</b></div>
    <div class="l g"><span style="color:inherit">Ganancia</span><b>${money(gan)}</b></div></article>`}).join('');
  const m=tI?tG/tI*100:0;
  $('#concl').innerHTML=`<h3 style="margin-bottom:8px">Conclusiones</h3><ul>
  <li>Las 4 compras suman ${money(tI)} en ingresos y ${money(tG)} de ganancia neta (margen de ${m.toFixed(1)}%).</li>
  <li>El envío gratis desde $1,000 anima a comprar más piezas, pero reduce el margen en destinos lejanos.</li>
  <li>El embalaje reforzado cuesta poco frente al precio y evita devoluciones por piezas de barro rotas.</li>
  <li>Metepec entrega en 1 día; el resto del país tarda entre 2 y 6 días, por lo que conviene avisarlo antes del pago.</li>
  <li>El código METZA10 resta cerca de 10% de los ingresos, así que conviene usarlo en campañas puntuales.</li></ul>`}

/* ---------- Carrito ---------- */
function openDrawer(){$('#drawer').classList.add('open');$('#ov').classList.add('open')}
function closeAll(){$$('.modal,.drawer,.ov').forEach(e=>e.classList.remove('open'))}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const d=b.dataset;
  if(d.add){cart[d.add]=(cart[d.add]||0)+1;renderCart();toast(prod(d.add).n+' agregado al carrito')}
  else if(d.inc){cart[d.inc]++;renderCart()}
  else if(d.dec){if(--cart[d.dec]<1)delete cart[d.dec];renderCart()}
  else if(d.del){delete cart[d.del];renderCart()}
  else if(b.id==='cpBtn'){const v=$('#cpIn').value.trim().toUpperCase();
    if(!v){coupon=''}else if(v==='METZA10'){coupon=v;toast('Descuento aplicado')}else{coupon='';toast('Código no válido')}renderCart()}
  else if(b.id==='goPay')openPay();
  else if(d.close!==undefined)closeAll()});
$('#bCart').onclick=openDrawer;
$('#ov').onclick=closeAll;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
if($('#cat'))$('#cat').onchange=renderGrid;

/* ---------- Pago simulado ---------- */
function openPay(){
  const t=totals();if(!t.sub){toast('Tu carrito está vacío');return}
  closeAll();
  $('#payBody').innerHTML=`<form class="fm" id="fPay">
  <label>Nombre<input name="n" required></label><label>Correo<input name="e" type="email" required></label>
  <label class="w">Dirección de entrega<input name="a" required></label>
  <label class="w">Destino<select name="z">${ZN.map((z,i)=>`<option value="${i}">${z[0]} · ${z[1]}</option>`).join('')}</select></label>
  <fieldset class="w"><legend>Método de pago</legend>${PAYS.map((m,i)=>`<label class="rd"><input type="radio" name="m" value="${i}" ${i?'':'checked'}>${m}</label>`).join('')}</fieldset>
  <p class="w mut">Total a pagar: <b>${money(t.total)}</b>. Es una simulación: no se realiza ningún cobro real.</p>
  <button class="btn dk w" style="padding:15px">Confirmar pedido</button></form>`;
  $('#mPay').classList.add('open');
  $('#fPay').onsubmit=ev=>{ev.preventDefault();
    const f=new FormData(ev.target),z=ZN[f.get('z')],pz=Object.values(cart).reduce((a,b)=>a+b,0);
    const big=Object.keys(cart).some(id=>prod(id)&&prod(id).p>=1000);
    const emb=(pz>=3||big)?'Caja reforzada con relleno de papel kraft':'Caja de cartón con papel kraft';
    const folio='MTZ-'+Date.now().toString().slice(-6);
    $('#payBody').innerHTML=`<div class="ok"><div class="big">✅</div><h2>¡Gracias, ${esc(f.get('n'))}!</h2>
    <p class="mut" style="margin:6px 0 16px">Pedido ${folio} registrado. Enviaremos el resumen a ${esc(f.get('e'))}.</p>
    <div class="card" style="text-align:left;box-shadow:none;border:1px solid #eee">
    <div class="tr"><span>Pago</span><b>${PAYS[f.get('m')]}</b></div>
    <div class="tr"><span>Embalaje</span><b>${emb}</b></div>
    <div class="tr"><span>Tiempo de envío</span><b>${z[1]} (${z[0]})</b></div>
    <div class="tr t"><span>Total</span><span>${money(t.total)}</span></div></div></div>`;
    cart={};coupon='';renderCart()}}

/* ---------- Configuración ---------- */
const FIELDS=[['brand','Nombre de marca'],['tag','Eslogan'],['heroT','Título principal'],['heroP','Texto principal','t'],['about','Texto nosotros','t'],['email','Correo de contacto']];
$('#bSet').onclick=()=>{
  $('#setBody').innerHTML=`<div class="sec" style="margin-top:0">Identidad</div>`+
  FIELDS.map(([k,l,t])=>`<label class="mut" style="font-weight:600">${l.toUpperCase()}</label>${t?`<textarea id="f_${k}" rows="3" style="margin:4px 0 12px">${esc(cfg[k])}</textarea>`:`<input id="f_${k}" value="${esc(cfg[k])}" style="margin:4px 0 12px">`}`).join('')+
  `<div class="sec">Precios y nombres de productos</div>`+
  cfg.products.map(p=>`<div class="pg"><input id="n_${p.id}" value="${esc(p.n)}" aria-label="Nombre"><input id="p_${p.id}" type="number" min="0" value="${p.p}" aria-label="Precio"></div>`).join('');
  $('#mSet').classList.add('open')};
$('#save').onclick=()=>{
  const s={};FIELDS.forEach(([k])=>s[k]=$('#f_'+k).value.trim()||DEF[k]);
  s.products=cfg.products.map(p=>({id:p.id,n:$('#n_'+p.id).value.trim()||p.n,p:Math.max(0,+$('#p_'+p.id).value||0)}));
  ls.set('metza_cfg',s);cfg=load();refresh();closeAll();toast('Cambios guardados')};
$('#reset').onclick=()=>{if(confirm('¿Restaurar todos los valores originales?')){ls.del('metza_cfg');cfg=load();refresh();closeAll();toast('Valores restaurados')}};

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

function refresh(){renderTexts();renderCats();renderGrid();renderCart();renderSim()}
refresh();
