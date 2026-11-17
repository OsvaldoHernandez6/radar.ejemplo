
const fmt=(n,d=0)=>Number(n).toLocaleString('es-CL',{minimumFractionDigits:d,maximumFractionDigits:d});
const k=n=>n>=100000?fmt(n/1000)+'K':n>=1000?fmt(n/1000,1).replace(/,0$/,'')+'K':fmt(n);
const pct=(n,d=3)=>fmt(n,d)+'%';
const VER='<span class="badge b-ver">verificado</span>', EST='<span class="badge b-est">estimado</span>';
const C=id=>`var(--c-${id})`;
let D;
const B=id=>D.brands.find(b=>b.id===id);
const nm=b=>`<span class="bn"><span class="sw" style="--c:${C(b.id)}"></span>${b.name}</span>`;
const SECTIONS=[['resumen','Resumen','RES'],['panorama','Panorama','CAT'],['instagram','Instagram','IG'],['facebook','Facebook','FB'],['ads','Meta Ads','ADS'],['oportunidades','Oportunidades','OPP'],['diagnostico','Diagnóstico','DX'],['fuentes','Fuentes','SRC']];

function shead(id,title,desc,chan){return `<div class="shead"><div class="row"><span class="chan"><i></i>${chan}</span></div><h2>${title}</h2>${desc?`<p>${desc}</p>`:''}</div>`}
function bars(title,cap,get,f,opts={}){
  const rows=[...D.brands].sort((a,b)=>get(b)-get(a)), max=Math.max(...rows.map(get))||1;
  return `<div class="panel"><div class="ptitle"><h4>${title}</h4>${opts.badge??VER}</div><p class="cap">${cap}</p><div class="bars">${rows.map(b=>`
   <div class="bar ${b.isClient?'client':''}" data-b="${b.id}" data-tip="${b.name} · ${f(get(b))}${opts.tip?' · '+opts.tip(b):''}">
    <div class="n"><span class="sw" style="--c:${C(b.id)}"></span>${b.name}</div>
    <div class="t"><i style="--c:${C(b.id)};--w:${Math.max(1.5,get(b)/max*100)}%"></i></div>
    <div class="v">${f(get(b))}</div></div>`).join('')}</div></div>`;
}
function finds(arr,prefix){return `<div class="finds ${arr.length%2?'odd':''}">${arr.map((c,i)=>`<div class="find" data-search="${prefix} · ${c.title}" id="${prefix.toLowerCase()}-h${i+1}"><span class="id">${prefix} · H${String(i+1).padStart(2,'0')}</span><h3>${c.title}</h3><p>${c.text}</p></div>`).join('')}</div>`}
function recs(arr){return `<div class="recs">${arr.map(r=>`<div class="rec"><span class="prio ${r.priority}">${r.priority}</span><div><h3>${r.title}</h3><p>${r.text}</p></div></div>`).join('')}</div>`}

/* ---------- radar ---------- */
function radarSVG(){
  const ax=[['Alcance IG',b=>b.followers],['Alcance FB',b=>b.fb.followers],['Frecuencia',b=>b.postsPerWeek],['Engagement',b=>b.erMedian],['Reels',b=>b.reelsPct],['Pauta',b=>b.ads.count]];
  const cx=210,cy=190,R=135,n=ax.length;
  const max=ax.map(a=>Math.max(...D.brands.map(a[1]))||1);
  const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]};
  let g='';
  [.25,.5,.75,1].forEach(s=>{g+=`<polygon points="${ax.map((_,i)=>pt(i,R*s).join(',')).join(' ')}" fill="none" stroke="var(--line-2)" stroke-width="1"/>`});
  ax.forEach((a,i)=>{const [x,y]=pt(i,R);const [lx,ly]=pt(i,R+22);g+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)" stroke-width="1"/><text x="${lx}" y="${ly+4}" text-anchor="${Math.abs(lx-cx)<8?'middle':lx>cx?'start':'end'}" font-family="var(--f-mono)" font-size="10.5" fill="var(--mute)">${a[0].toUpperCase()}</text>`});
  const order=[...D.brands].reverse();
  order.forEach(b=>{const pts=ax.map((a,i)=>pt(i,Math.max(.04,a[1](b)/max[i])*R));
    g+=`<g class="rp" data-b="${b.id}"><polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${C(b.id)}" fill-opacity="${b.isClient?.16:.05}" stroke="${C(b.id)}" stroke-width="${b.isClient?2.2:1.4}" stroke-linejoin="round"/>${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="${b.isClient?3.2:2.4}" fill="${C(b.id)}" stroke="var(--panel)" stroke-width="1.5"/>`).join('')}</g>`});
  return `<svg viewBox="0 0 420 380" role="img" aria-label="Radar comparativo de 5 marcas en 6 dimensiones">${g}</svg>`;
}
function gaugeSVG(v,size=1){
  const r=52,c=2*Math.PI*r,seg=40;let ticks='';
  for(let i=0;i<seg;i++){const a=(-90+i*360/seg)*Math.PI/180,on=i<Math.round(v/100*seg);ticks+=`<line x1="${60+44*Math.cos(a)}" y1="${60+44*Math.sin(a)}" x2="${60+(on?56:53)*Math.cos(a)}" y2="${60+(on?56:53)*Math.sin(a)}" stroke="${on?'var(--accent)':'var(--line-2)'}" stroke-width="2" stroke-linecap="round"/>`}
  return `<svg viewBox="0 0 120 120" role="img" aria-label="Puntaje ${v} de 100">${ticks}<text x="60" y="64" text-anchor="middle" font-family="var(--f-mono)" font-size="${26}" font-weight="500" fill="var(--ink)">${v}</text><text x="60" y="80" text-anchor="middle" font-family="var(--f-mono)" font-size="8.5" fill="var(--mute)">/ 100</text></svg>`;
}

/* ---------- charts v4 (responsive SVG, redrawn on resize / text size) ---------- */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const T=(x,y,txt,cls='ct',anchor='start',extra='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}" ${extra}>${txt}</text>`;
const fzv=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fz'))||1;
const money=v=>'$'+fmt(v);

const CHARTS={
 /* 1. Alcance vs engagement (IG) */
 scatter(W){
  const fz=fzv(),H=Math.max(300,Math.min(420,W*.56)),m={l:54*fz,r:18,t:22,b:44*fz};
  const fl=D.brands.map(b=>b.followers),xs=[Math.min(...fl)*.8,Math.max(...fl)*1.15],lx=v=>m.l+(Math.log(v)-Math.log(xs[0]))/(Math.log(xs[1])-Math.log(xs[0]))*(W-m.l-m.r);
  const em=Math.max(...D.brands.map(b=>b.erMedian)),stp=em>2?.5:em>.8?.25:em>.2?.1:.01,ymax=Math.ceil(em*1.15/stp)*stp,ly=v=>H-m.b-(v/ymax)*(H-m.t-m.b);
  const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
  const mx=med(D.brands.map(b=>b.followers)),my=med(D.brands.map(b=>b.erMedian));
  let g='';
  Array.from({length:Math.round(ymax/stp)},(_,i)=>i*stp).forEach(v=>{g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${ly(v)}" y2="${ly(v)}" class="gl"/>`+T(m.l-8,ly(v)+4,fmt(v,2)+'%','ct','end')});
  [20000,40000,60000,100000,150000,250000,500000,1000000].filter(v=>v>=xs[0]&&v<=xs[1]).forEach(v=>{g+=`<line x1="${lx(v)}" x2="${lx(v)}" y1="${m.t}" y2="${H-m.b}" class="gl"/>`+T(lx(v),H-m.b+16*fz,k(v),'ct','middle')});
  g+=T((m.l+W-m.r)/2,H-6,W<560?'SEGUIDORES IG (log)':'SEGUIDORES EN INSTAGRAM (escala log)','ct cap2','middle');
  g+=`<line x1="${lx(mx)}" x2="${lx(mx)}" y1="${m.t}" y2="${H-m.b}" class="ml"/><line x1="${m.l}" x2="${W-m.r}" y1="${ly(my)}" y2="${ly(my)}" class="ml"/>`;
  const narrow=W<560;
  if(!narrow)g+=T(m.l+6,m.t+12,'COMUNIDAD CHICA · ACTIVA','ct q')+T(W-m.r-6,m.t+12,'GRANDE · ACTIVA','ct q','end')+T(m.l+6,H-m.b-8,'CHICA · DORMIDA','ct q')+T(W-m.r-6,H-m.b-8,'GRANDE · DORMIDA','ct q','end');
  [...D.brands].sort((a,b)=>b.postsPerWeek-a.postsPerWeek).forEach(b=>{
    const x=lx(b.followers),y=ly(b.erMedian),r=5+b.postsPerWeek*2.1,left=x>W*.72;
    g+=`<g data-b="${b.id}" data-tip="${esc(b.name)} · ${k(b.followers)} seguidores · ER mediano ${pct(b.erMedian)} · ${fmt(b.postsPerWeek,1)} posts/sem"><circle cx="${x}" cy="${y}" r="${r}" fill="${C(b.id)}" fill-opacity="${b.isClient?.85:.55}" stroke="${C(b.id)}" stroke-width="${b.isClient?2.5:1.2}"/><circle cx="${x}" cy="${y}" r="${r+12}" fill="transparent"/>`+
       (narrow?(()=>{const nb=D.brands.some(o=>o!==b&&lx(o.followers)>x&&lx(o.followers)-x<80&&Math.abs(ly(o.erMedian)-y)<30);const nm=esc(b.name.split(' ').slice(-1)[0]);return nb?T(x,y-r-6,nm,'ct lbl2','middle'):x>W*.8?T(x+r,y+r+14*fz,nm,'ct lbl2','end'):T(x,y+r+14*fz,nm,'ct lbl2','middle')})():T(left?x-r-6:x+r+6,y+4,esc(b.name),'ct lbl2',left?'end':'start'))+`</g>`});
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Dispersión: seguidores en Instagram contra engagement mediano">${g}</svg>
   <div class="ckey"><span><i class="kb"></i>Tamaño de la burbuja = posts propios por semana</span><span><i class="kl"></i>Líneas punteadas = mediana de la categoría</span></div>`;
 },
 /* 2. Interacciones por publicación */
 dots(W){
  const fz=fzv(),row=46*fz,m={l:Math.min(130*fz,W*.32),r:16,t:10,b:34*fz},H=m.t+row*D.brands.length+m.b;
  const xs=[1,5000],lx=v=>m.l+(Math.log10(Math.max(1,v))-0)/(Math.log10(xs[1]))*(W-m.l-m.r);
  let g='';
  [1,10,100,1000,5000].forEach(v=>{g+=`<line x1="${lx(v)}" x2="${lx(v)}" y1="${m.t}" y2="${H-m.b}" class="gl"/>`+T(lx(v),H-m.b+16*fz,fmt(v),'ct','middle')});
  g+=T((m.l+W-m.r)/2,H-4,W<560?'INTERACCIONES POR POST (log)':'INTERACCIONES POR PUBLICACIÓN (likes + comentarios, escala log)','ct cap2','middle');
  D.brands.forEach((b,i)=>{
    const cy=m.t+row*i+row/2;
    let s=`<g data-b="${b.id}">`+T(8,cy+4,esc(b.name),'ct lbl2'+(b.isClient?' strong':''))+`<line x1="${m.l}" x2="${W-m.r}" y1="${cy}" y2="${cy}" class="gl"/>`;
    b.grid.filter(p=>p.likes+p.comments>0).forEach((p,j)=>{const v=p.likes+p.comments,y=cy+((j%3)-1)*7*fz;
      s+=`<circle cx="${lx(v)}" cy="${y}" r="${4.6*fz}" ${p.own?`fill="${C(b.id)}" fill-opacity=".8"`:`fill="var(--panel)"`} stroke="${C(b.id)}" stroke-width="1.6" data-tip="${esc(b.name)} · ${esc(p.topic)} · ${fmt(v)} int. · ${p.date}${p.own?'':' · collab'}"/>`});
    const md=b.medianInteractions;s+=`<line x1="${lx(md)}" x2="${lx(md)}" y1="${cy-15*fz}" y2="${cy+15*fz}" stroke="var(--ink)" stroke-width="2" data-tip="${esc(b.name)} · mediana propia ${fmt(md)}"/>`;
    g+=s+'</g>'});
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Interacciones de cada publicación por marca">${g}</svg>
   <div class="ckey"><span><i class="kf"></i>Publicación propia</span><span><i class="kh"></i>Colaboración</span><span><i class="km"></i>Mediana de posts propios</span></div>`;
 },
 /* 3. Composición de la grilla (waffle) */
 waffle(W){
  const fz=fzv(),cell=Math.max(16,Math.min(30,(W-(W<520?0:150*fz))/12-4)),gap=4,lab=W<520?0:150*fz,row=W<520?cell+30*fz:cell+16;
  const H=row*D.brands.length+6;let g='';
  D.brands.forEach((b,i)=>{
    const y=i*row+(W<520?22*fz:6);
    const items=[...b.grid].sort((a,c)=>(a.own?0:2)+(a.type==='Reel'?0:1)-((c.own?0:2)+(c.type==='Reel'?0:1)));
    g+=`<g data-b="${b.id}">`+T(W<520?0:0,W<520?y-6*fz:y+cell/2+4,esc(b.name),'ct lbl2'+(b.isClient?' strong':''));
    items.forEach((p,j)=>{const x=lab+j*(cell+gap),cls=!p.own?'w-col':p.type==='Reel'?'w-reel':'w-post';
      g+=`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="4" class="${cls}" data-tip="${esc(b.name)} · ${p.own?(p.type==='Reel'?'Reel propio':'Post propio'):'Colaboración'} · ${esc(p.topic)}"/>`});
    const r=b.grid.filter(p=>p.own&&p.type==='Reel').length,c=b.grid.filter(p=>!p.own).length;
    if(W>=520)g+=T(lab+12*(cell+gap)+6,y+cell/2+4,`${r}R · ${c}C`,'ct');
    g+='</g>'});
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Composición de las últimas 12 publicaciones">${g}</svg>
   <div class="ckey"><span><i class="w-reel sq"></i>Reel propio</span><span><i class="w-post sq"></i>Post o carrusel propio</span><span><i class="w-col sq"></i>Colaboración</span></div>`;
 },
 /* 4. Escala de precios */
 prices(W){
  const fz=fzv(),P=D.metaAds.prices,row=80*fz,m={l:12,r:22,t:6,b:26*fz},H=m.t+row*P.length+m.b,max=Math.ceil(Math.max(...P.flatMap(o=>Object.values(o.values)))*1.12/1000)*1000;
  const lx=v=>m.l+v/max*(W-m.l-m.r);let g='';
  (()=>{const st=max>40000?10000:max>15000?5000:2000;return Array.from({length:Math.floor(max/st)+1},(_,i)=>i*st)})().forEach(v=>{g+=`<line x1="${lx(v)}" x2="${lx(v)}" y1="${m.t+16*fz}" y2="${H-m.b}" class="gl"/>`+T(lx(v),H-6,money(v),'ct','middle')});
  P.forEach((o,i)=>{const y=m.t+row*i+16*fz;g+=T(m.l,y,o.offer.toUpperCase(),'ct cap2');const cy=y+24*fz;
    g+=`<line x1="${m.l}" x2="${W-m.r}" y1="${cy}" y2="${cy}" stroke="var(--line-2)"/>`;
    let lastX=null;const groups={};Object.entries(o.values).forEach(([id,v])=>(groups[v]=groups[v]||[]).push(id));
    Object.entries(groups).sort((a,c)=>a[0]-c[0]).forEach(([v,ids])=>{v=+v;ids.forEach((id,n)=>{const b=B(id),dx=(n-(ids.length-1)/2)*15*fz,x=lx(v)+dx;
      g+=`<g data-b="${id}" data-tip="${esc(b.name)} · ${esc(o.offer)} · ${money(v)}${o.note?' · '+esc(o.note):''}"><circle cx="${x}" cy="${cy}" r="${(b.isClient?7.5:6)*fz}" fill="${C(id)}" stroke="var(--panel)" stroke-width="2"/>`+
        (b.isClient?T(x,cy-12*fz,money(v),'ct strong','middle'):(()=>{const bump=(lastX!==null&&x-lastX<56*fz);lastX=bump?null:x;return T(x,cy+(bump?33:20)*fz,esc(b.name.split(' ').slice(-1)[0]),'ct','middle')})())+`</g>`})});
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Precios comparables en la pauta">${g}</svg>`;
 },
 /* 5. Mapa de territorios de pauta */
 heat(W){
  const t=D.metaAds.territories,fz=fzv(),cols=t.labels.length,lab=W<620?Math.min(104*fz,W*.34):Math.min(140*fz,W*.3),cw=(W-lab-38*fz)/cols,ch=34*fz,head=W<620?128*fz:40*fz;
  const H=head+ch*D.brands.length+30*fz;let g='';
  t.labels.forEach((l,j)=>{const x=lab+j*cw+cw/2;
    g+=W<620?`<text class="ct" transform="translate(${x+4},${head-8}) rotate(-90)" text-anchor="start">${l}</text>`:T(x,head-12,l.split(' ')[0],'ct','middle',`data-tip="${esc(l)}"`)+(l.includes(' ')?T(x,head-12+12*fz,l.split(' ').slice(1).join(' '),'ct','middle'):'')});
  D.brands.forEach((b,i)=>{const y=head+i*ch;const vals=t.values[b.id];
    g+=`<g data-b="${b.id}">`+T(0,y+ch/2+4,esc(b.name),(W<620?'ct':'ct lbl2')+(b.isClient?' strong':''));
    vals.forEach((v,j)=>{const x=lab+j*cw+3,w=cw-6,h=ch-8,note=(t.notes[b.id]||{})[j];
      g+=`<rect x="${x}" y="${y+4}" width="${w}" height="${h}" rx="5" fill="${v?C(b.id):'var(--panel-2)'}" fill-opacity="${v===1?.85:v?.35:1}" stroke="${v?C(b.id):'var(--line)'}" data-tip="${esc(b.name)} · ${esc(t.labels[j])}: ${v===1?'sí':v?'parcial':'no'}${note?' · '+esc(note):''}"/>`});
    g+=T(lab+cols*cw+8,y+ch/2+4,`${vals.filter(Boolean).length}/${cols}`,'ct','start')+'</g>'});
  const y=head+D.brands.length*ch+18*fz;
  t.labels.forEach((l,j)=>{const n=D.brands.filter(b=>t.values[b.id][j]).length;g+=T(lab+j*cw+cw/2,y,cw<40?`${n}`:`${n}/${D.brands.length}`,'ct'+(n>=4?' hot':n===1?' cold':''),'middle',`data-tip="${esc(l)}: ${n} de 5 marcas"`)});
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Territorios de comunicación en la pauta por marca">${g}</svg>
   <div class="ckey"><span><i class="kf"></i>Pauta activa en ese territorio</span><span><i class="kp"></i>Parcial</span><span><b class="hot mono">4/5</b>&nbsp;Territorio saturado</span><span><b class="cold mono">1/5</b>&nbsp;Territorio exclusivo</span></div>`;
 },
 /* 6. Cliente vs promedio de la competencia */
 diverge(W){
  const fz=fzv(),fp=D.brands.find(b=>b.isClient),comp=D.brands.filter(b=>!b.isClient),avg=f=>comp.reduce((s,b)=>s+f(b),0)/comp.length;
  const M=[['Seguidores IG',b=>b.followers,k],['Seguidores FB',b=>b.fb.followers,k],['Posts por semana',b=>b.postsPerWeek,v=>fmt(v,1)],['Engagement mediano',b=>b.erMedian,v=>pct(v)],['% Reels',b=>b.reelsPct,v=>fmt(v)+'%'],['Colaboraciones',b=>b.collabs,v=>fmt(v,1).replace(/,0$/,'')],['Anuncios activos',b=>b.ads.count,v=>'~'+fmt(v,0)]];
  const rows=M.map(([n,f,F])=>{const a=avg(f),v=f(fp);return{n,v,a,F,d:(v-a)/a*100}});
  const row=34*fz,lab=Math.min(150*fz,W*.34),val=W<520?0:120*fz,m={t:24*fz,b:10},H=m.t+row*rows.length+m.b,cx=lab+(W-lab-val)/2,half=(W-lab-val)/2-28*fz,sc=v=>Math.max(-100,Math.min(100,v))/100*half;
  let g=T(cx-6,14*fz,W<560?'− BAJO':'BAJO EL PROMEDIO','ct','end')+T(cx+6,14*fz,W<560?'SOBRE +':'SOBRE EL PROMEDIO','ct','start')+`<line x1="${cx}" x2="${cx}" y1="${m.t-4}" y2="${H-m.b}" stroke="var(--ink-2)" stroke-width="1"/>`;
  rows.forEach((r,i)=>{const y=m.t+i*row,w=sc(r.d),pos=r.d>=0;
    g+=`<g data-tip="${esc(r.n)} · ${esc(D.meta.client)} ${r.F(r.v)} vs promedio competencia ${r.F(r.a)} (${pos?'+':''}${fmt(r.d)}%)">`+T(0,y+row/2+4,r.n,'ct lbl2')+
      `<rect x="${pos?cx:cx+w}" y="${y+8*fz}" width="${Math.max(2,Math.abs(w))}" height="${row-16*fz}" rx="3" fill="${pos?'var(--ok)':'var(--bad)'}" fill-opacity=".85"/>`+
      T(pos?cx+w+6:cx+w-6,y+row/2+4,`${pos?'+':''}${fmt(r.d)}%`,'ct strong',pos?'start':'end')+
      (val?T(W,y+row/2+4,`${r.F(r.v)} vs ${r.F(r.a)}`,'ct','end'):'')+`<rect x="0" y="${y}" width="${W}" height="${row}" fill="transparent"/></g>`});
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(D.meta.client)} contra el promedio de la competencia">${g}</svg>`;
 }
};
function drawCharts(){document.querySelectorAll('[data-chart]').forEach(el=>{const w=Math.floor(el.clientWidth);if(!w)return;el.innerHTML=CHARTS[el.dataset.chart](w)});applyLens()}
let _rz;addEventListener('resize',()=>{clearTimeout(_rz);_rz=setTimeout(drawCharts,120)});

/* ---------- sections ---------- */
function resumen(){
  const fp=D.brands.find(b=>b.isClient),M=D.meta,v=D.diagnosticBrand.verdict,rank=key=>[...D.brands].sort((a,b)=>key(b)-key(a)).findIndex(b=>b.isClient)+1;
  return `<section id="resumen">${M.demo?`<div class="demo-note"><b>DEMO</b><span>${M.demoNote}</span></div>`:''}<div class="hero">
   <div class="lead">
    <div class="eyebrow">Radar competitivo<span>/ ${M.category} / ${M.market} / ${M.extractionDate}</span></div>
    <h1>${M.thesis}</h1>
    <p class="sub">${M.sub}</p>
    <div class="verdict">${gaugeSVG(v.scoreValue)}<div><span class="lbl">Diagnóstico ${M.client}</span><b>${v.label}</b><p>${v.description.split('. ').slice(0,2).join('. ')}.</p></div></div>
    <div class="kpis">
     <div class="kpi"><div class="v num">${k(fp.followers)}</div><div class="l">Seguidores IG</div><div class="r">#${rank(b=>b.followers)} de ${D.brands.length}</div></div>
     <div class="kpi"><div class="v num">${fmt(fp.postsPerWeek,1)}</div><div class="l">Posts propios por semana</div><div class="r">#${rank(b=>b.postsPerWeek)} de ${D.brands.length}</div></div>
     <div class="kpi"><div class="v num">${pct(fp.er)}</div><div class="l">Engagement promedio</div><div class="r">${M.kpi3}</div></div>
     <div class="kpi"><div class="v num">~${fp.ads.count}</div><div class="l">Anuncios activos Meta</div><div class="r">#${rank(b=>b.ads.count)} de ${D.brands.length}</div></div>
    </div>
   </div>
   <div class="panel radar-panel"><div class="ptitle"><h4>Huella digital comparada</h4>${VER}</div><p class="cap">Cada eje está normalizado contra el líder de esa dimensión. Toca una marca para aislarla.</p>${radarSVG()}
    <div class="legend">${D.brands.map(b=>`<button type="button" data-lens="${b.id}" data-b="${b.id}"><span class="sw" style="--c:${C(b.id)}"></span>${b.name}</button>`).join('')}</div></div>
  </div></section>`;
}
function panorama(){
  const rows=D.brands.map(b=>`<tr class="${b.isClient?'client':''}" data-b="${b.id}"><td>${nm(b)}</td><td class="r">${k(b.followers)}</td><td class="r">${k(b.fb.followers)}</td><td class="r">${fmt(b.postsPerWeek,1)}</td><td class="r">${pct(b.erMedian)}</td><td class="r">${b.reelsPct}%</td><td class="r">${b.collabs}/12</td><td class="r">${b.ads.active?'~'+b.ads.count:'0'}</td><td style="min-width:280px">${b.footprint} ${b.footprintConf==='verificado'?VER:EST}</td></tr>`).join('');
  const pos=D.brands.map(b=>`<tr class="${b.isClient?'client':''}" data-b="${b.id}"><td>${nm(b)}</td><td>${b.pos.tone}</td><td>${b.pos.focus}</td><td>${b.pos.cta}</td><td>${b.pos.community}</td></tr>`).join('');
  return `<section id="panorama">${shead('panorama','Panorama de la categoría',D.meta.panoramaDesc,'CAT · 5 marcas')}
   <div class="logos">${D.brands.map(b=>`<button type="button" class="logo-card ${b.isClient?'client':''}" data-lens="${b.id}" data-b="${b.id}"><div class="lw"><img src="${b.logo}" alt="${b.name}"></div><div class="meta"><b><span class="sw" style="--c:${C(b.id)}"></span>${b.name}</b>${b.isClient?'<span class="tagc">cliente</span>':''}</div><span class="mono" style="font-size:calc(11px * var(--fz));color:var(--mute)">${b.handle}</span></button>`).join('')}</div>
   <div class="subh"><h3>Comparativa general</h3><span>Desliza la tabla en pantallas chicas</span></div>
   <div class="tw"><table><thead><tr><th>Marca</th><th class="r">IG seguidores</th><th class="r">FB seguidores</th><th class="r">Posts/sem</th><th class="r">ER mediano</th><th class="r">Reels</th><th class="r">Collabs</th><th class="r">Ads</th><th>Huella física</th></tr></thead><tbody>${rows}</tbody></table></div>
   <div class="subh"><h3>Posicionamiento</h3><span>Lectura de las últimas 12 publicaciones y la pauta activa</span></div>
   <div class="tw"><table><thead><tr><th>Marca</th><th>Tono</th><th>Foco de contenido</th><th>CTA principal</th><th>Comunidad</th></tr></thead><tbody>${pos}</tbody></table></div>
  </section>`;
}
function instagram(){
  const I=D.instagram;
  const best=b=>b.grid.filter(p=>p.own&&!/fijado/.test(p.topic)).sort((a,c)=>(c.likes+c.comments)-(a.likes+a.comments))[0];
  const posts=D.brands.map(b=>{const p=best(b);return `<article class="post" data-b="${b.id}" style="--c:${C(b.id)}"><header>${nm(b)}<small>TOP PROPIO · ${fmt(p.likes+p.comments)} INT.</small></header>
    ${(window.__NO_EMBEDS__||!p.code)?`<div class="lk nolink"><span class="big num">${fmt(p.likes+p.comments)}</span><small>${fmt(p.likes)} likes · ${fmt(p.comments)} comentarios · ${p.type}</small>${p.code?`<a class="btn" style="margin-top:8px" href="https://www.instagram.com/p/${p.code}/" target="_blank" rel="noopener">Abrir en Instagram ↗</a>`:`<span class="btn off" style="margin-top:8px;white-space:normal;text-align:center">${D.meta.demo?'Post real en versión cliente':'Sin enlace'}</span>`}</div>`:`<iframe loading="lazy" src="https://www.instagram.com/p/${p.code}/embed/captioned/" title="Post de ${b.name}"></iframe>`}
    <footer>${p.topic} · <span class="mono" style="font-size:calc(11px * var(--fz));color:var(--mute)">${p.date}</span></footer></article>`}).join('');
  const feeds=D.brands.map(b=>`<div class="feed" data-b="${b.id}">${nm(b)}<ol>${b.grid.map(p=>`<li><span class="m"><span class="ty">${p.type==='Reel'?'REEL':'POST'}</span>${p.date}${p.own?'':' · <span class="co">COLLAB</span>'}</span><span class="x">${p.likes||p.comments?fmt(p.likes+p.comments):'—'}</span><span class="tp">${p.topic.replace(/^Collab /,'')}</span></li>`).join('')}</ol></div>`).join('');
  return `<section id="instagram">${shead('instagram','Instagram','Alcance, frecuencia, engagement y colaboraciones según las últimas 12 publicaciones de cada marca.','IG · orgánico')}
   <div class="grid g2">
    ${bars('Seguidores','Tamaño de la audiencia',b=>b.followers,k)}
    ${bars('Posts propios por semana','Sin fijados ni colaboraciones',b=>b.postsPerWeek,v=>fmt(v,1))}
    ${bars('Engagement mediano','Mediana de interacciones ÷ seguidores; resiste los virales',b=>b.erMedian,v=>pct(v),{tip:b=>'promedio '+pct(b.er)})}
    ${bars('Colaboraciones','Piezas de creadores o marcas aliadas en las últimas 12',b=>b.collabs,v=>v+' de 12')}
   </div>
   <div class="panel"><div class="ptitle"><h4>Alcance vs. engagement</h4>${VER}</div><p class="cap">${D.meta.scatterCap}</p><div class="chart" data-chart="scatter"></div></div>
   <div class="panel"><div class="ptitle"><h4>Interacciones de cada publicación</h4>${VER}</div><p class="cap">${D.meta.dotsCap}</p><div class="chart" data-chart="dots"></div></div>
   <div class="panel"><div class="ptitle"><h4>Composición de la grilla</h4>${VER}</div><p class="cap">${D.meta.waffleCap}</p><div class="chart" data-chart="waffle"></div></div>
   <div class="subh"><h3>Hallazgos</h3></div>${finds(I.conclusions,'IG')}
   <div class="subh"><h3>Recomendaciones para ${D.meta.client}</h3></div>${recs(I.recommendations)}
   <div class="subh"><h3>Mejor publicación propia por marca</h3><span>${D.meta.demo?'En la versión cliente se ven los posts reales':window.__NO_EMBEDS__?'Enlace a la publicación original':'Embeds en vivo'}</span></div>
   <div class="posts">${posts}</div>
   <div class="subh"><h3>Últimas 12 publicaciones</h3><span>Tipo · fecha · interacciones (likes + comentarios)</span></div>
   <div class="feeds">${feeds}</div>
  </section>`;
}
function facebook(){
  const F=D.facebook;
  return `<section id="facebook">${shead('facebook','Facebook',D.meta.facebookDesc,'FB · orgánico')}
   <div class="grid g2">${bars('Seguidores en Facebook','Comunidad total de la página',b=>b.fb.followers,k)}<div>${finds(F.conclusions.slice(0,2),'FB').replace('class="finds','style="grid-template-columns:1fr" class="finds')}</div></div>
   <div class="grid g5">${D.brands.map(b=>`<div class="bcard ${b.isClient?'client':''}" data-b="${b.id}">${nm(b)}<div class="fbv num">${k(b.fb.followers)} ${VER}</div><p style="font-size:calc(13px * var(--fz))">${b.fb.note}</p>${b.fb.url?`<a class="btn" href="${b.fb.url}" target="_blank" rel="noopener">Ver página ↗</a>`:`<span class="btn off">Ver página ↗</span>`}</div>`).join('')}</div>
   ${finds([F.conclusions[2]],'FB').replace('H01','H03')}
   ${recs(F.recommendations)}
  </section>`;
}
function ads(){
  const A=D.metaAds;
  const cards=D.brands.map(b=>{const a=b.ads;return `<div class="bcard ${b.isClient?'client':''}" data-b="${b.id}" id="ads-${b.id}">
   <div class="top">${nm(b)}<span class="state ${a.active?'on':'off'}"><i></i>${a.active?'activo':'sin pauta'}</span></div>
   <div class="mini"><div><b>${a.active?'~'+a.count:'0'}</b><span>anuncios</span></div><div><b style="font-size:calc(12px * var(--fz));line-height:1.7">${a.since||'—'}</b><span>más antiguo</span></div><div><b>${a.ctas.length}</b><span>CTAs</span></div></div>
   <p style="font-size:calc(13.5px * var(--fz))">${a.summary}</p>
   ${a.themes.length?`<div class="tags">${a.themes.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`:''}
   ${a.ctas.length?`<div class="spec">CTA → ${a.ctas.join(' · ')}<br>FMT → ${a.formats}</div>`:''}
   ${a.alert?`<div class="alert"><b>Alerta de ejecución</b>${a.alert}</div>`:''}
   ${a.library?`<a class="btn" href="${a.library}" target="_blank" rel="noopener">Biblioteca de anuncios ↗</a>`:`<span class="btn off">Biblioteca de anuncios ↗</span>`}</div>`}).join('');
  return `<section id="ads">${shead('ads','Meta Ads','Anuncios activos en '+D.meta.market+' según la Biblioteca de anuncios de Meta.','ADS · pagado')}
   <div class="grid g2">${bars('Anuncios activos','Conteo aproximado en '+D.meta.market,b=>b.ads.count,v=>v?'~'+v:'0')}
    <div class="panel"><div class="ptitle"><h4>Escala de precios en la pauta</h4>${VER}</div><p class="cap">${D.meta.pricesCap}</p><div class="chart" data-chart="prices"></div></div></div>
   <div class="panel"><div class="ptitle"><h4>Territorios de la pauta</h4>${VER}</div><p class="cap">${D.meta.heatCap}</p><div class="chart" data-chart="heat"></div></div>
   <div class="grid g3">${cards}</div>
   <div class="subh"><h3>Hallazgos</h3></div>${finds(A.conclusions,'ADS')}
   <div class="subh"><h3>Recomendaciones para ${D.meta.client}</h3></div>${recs(A.recommendations)}
  </section>`;
}
function oportunidades(){
  const O=D.strategicOpportunities;
  return `<section id="oportunidades">${shead('oportunidades',O.title,O.subtitle+'. Cada una parte de una brecha visible en los datos del benchmark.','OPP · estrategia')}
   <div class="stats">${O.industryStats.map(s=>`<div class="stat"><div class="v num">${s.value}</div><div class="l">${s.label}</div><div class="s">${s.source}</div></div>`).join('')}</div>
   <div class="grid g3">${O.opportunities.map((o,i)=>`<div class="opp" id="opp-${i+1}" data-search="Oportunidad · ${o.title}"><div class="code"><span>OPP-${String(i+1).padStart(2,'0')}</span><span>${o.platforms.join(' · ')}</span></div><h3>${o.title}</h3><p>${o.description}</p><div class="hook"><b>Idea de activación</b>${o.hook}</div></div>`).join('')}</div>
  </section>`;
}
function diagnostico(){
  const G=D.diagnosticBrand,v=G.verdict;
  const segs=(p,w)=>`<div class="seg" style="grid-template-columns:repeat(${w},1fr)">${Array.from({length:w},(_,i)=>`<i class="${i<p?'f':''}"></i>`).join('')}</div>`;
  return `<section id="diagnostico">${shead('diagnostico','Diagnóstico '+D.meta.client,D.meta.dxDesc,'DX · cliente')}
   <div class="diag">
    <div class="panel gauge"><span class="lbl">Puntaje</span>${gaugeSVG(v.scoreValue)}<div class="lab">${v.label}</div><p>${v.description}</p></div>
    <div class="panel"><div class="ptitle"><h4>Desglose por dimensión</h4><span class="mono" style="font-size:calc(11px * var(--fz));color:var(--mute)">1 bloque = 1 punto</span></div>
     ${G.scoreRows.map(r=>`<div class="srow"><div class="d">${r.dim}<small>${r.note}</small></div>${segs(r.pts,r.weight)}<div class="p">${r.pts}/${r.weight}</div></div>`).join('')}</div>
   </div>
   <div class="panel"><div class="ptitle"><h4>${D.meta.client} frente al promedio de la competencia</h4>${VER}</div><p class="cap">${D.meta.divergeCap}</p><div class="chart" data-chart="diverge"></div></div>
   <div class="subh"><h3>Brechas frente a la competencia</h3><span>Columna de ${D.meta.client} resaltada</span></div>
   <div class="tw"><table><thead><tr><th>Dimensión</th>${D.brands.map(b=>`<th class="r">${b.name}</th>`).join('')}<th>Lectura estratégica</th><th>Nivel</th></tr></thead><tbody>
    ${G.gaps.map(g=>`<tr><td style="font-weight:600;white-space:nowrap">${g.dimension}</td>${D.brands.map(b=>`<td class="r ${b.isClient?'hl':''}">${g.values[b.id]}</td>`).join('')}<td style="min-width:300px">${g.gapText}</td><td><span class="sev ${g.severity}">${g.severity}</span></td></tr>`).join('')}
   </tbody></table></div>
   <div class="lists">
    <div class="panel"><h3><i style="background:var(--ok)"></i>Fortalezas</h3><ul class="l-ok">${v.strengths.map(s=>`<li>${s}</li>`).join('')}</ul></div>
    <div class="panel"><h3><i style="background:var(--bad)"></i>Debilidades</h3><ul class="l-ko">${v.weaknesses.map(s=>`<li>${s}</li>`).join('')}</ul></div>
    <div class="panel"><h3><i style="background:var(--accent)"></i>Prioridades</h3><ol class="l-pr">${v.priority.map(s=>`<li>${s}</li>`).join('')}</ol></div>
   </div>
  </section>`;
}
function fuentes(){
  return `<section id="fuentes">${shead('fuentes','Metodología y fuentes','','SRC')}
   <div class="method"><p>${D.meta.method} ${VER} indica un dato leído directamente en la plataforma; ${EST}, una cifra inferida de fuentes secundarias.</p>
   <ol>${D.sources.map(s=>`<li>${s.u?`<a href="${s.u}" target="_blank" rel="noopener">${s.t}</a>`:s.t}</li>`).join('')}</ol>
   <span class="mono" style="font-size:calc(11px * var(--fz));color:var(--mute)">RADAR · CUANDO QUIERAS · ${D.meta.extractionDate.toUpperCase()}</span></div></section>`;
}

/* ---------- interaction ---------- */
let focusId=null;
function setLens(id){focusId=(id&&id!==focusId)?id:null;applyLens()}
function applyLens(){
  document.body.classList.toggle('focusing',!!focusId);
  document.querySelectorAll('[data-b]').forEach(el=>el.classList.toggle('lit',el.dataset.b===focusId));
  document.querySelectorAll('[data-lens-btn]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.lensBtn===focusId));
  document.querySelectorAll('.rp').forEach(g=>{const p=g.querySelector('polygon');const on=!focusId?B(g.dataset.b).isClient:g.dataset.b===focusId;p.setAttribute('fill-opacity',on?.2:.05)});
}
function buildRail(){
  document.getElementById('toc').innerHTML=SECTIONS.map(s=>`<li><a href="#${s[0]}" data-sec="${s[0]}"><span class="tg">${s[2]}</span>${s[1]}<span class="pg"><i></i></span></a></li>`).join('');
  document.getElementById('dock').innerHTML=SECTIONS.filter(x=>['resumen','instagram','ads','oportunidades','diagnostico'].includes(x[0])).map(s=>`<a href="#${s[0]}" data-sec="${s[0]}" aria-label="${s[1]}"><b>${s[2]}</b></a>`).join('')+`<button type="button" id="dock-prefs" aria-label="Ajustes de lectura: tema y tamaño de texto"><b style="font-size:13px;font-family:var(--f-sans)">Aa</b></button><button type="button" id="dock-search" aria-label="Buscar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></button>`;
  const lensBtns=D.brands.map((b,i)=>`<button type="button" data-lens-btn="${b.id}" aria-pressed="false"><span class="sw" style="--c:${C(b.id)}"></span>${b.name}<span class="k">${i+1}</span></button>`).join('');
  document.getElementById('lens').innerHTML=lensBtns;
  const lb=document.createElement('div');lb.className='lens-bar';lb.innerHTML=lensBtns.replace(/<span class="k">\d<\/span>/g,'');
  document.getElementById('resumen').after(lb);
  document.getElementById('live-txt').textContent=(D.meta.demo?'Demo · datos ficticios':'Verificado · '+D.meta.extractionDate);document.getElementById('rail-date').textContent=D.meta.railTag||D.meta.client.toUpperCase();document.title=D.meta.title;
  if(!/Mac|iPhone|iPad/.test(navigator.platform||''))document.getElementById('kbd-hint').textContent='Ctrl K';
}
function spy(){
  const secs=SECTIONS.map(s=>document.getElementById(s[0])).filter(Boolean);
  const upd=()=>{
    const y=innerHeight*.3;let cur=secs[0];
    secs.forEach(s=>{if(s.getBoundingClientRect().top<=y)cur=s});
    if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)cur=secs[secs.length-1];
    document.querySelectorAll('[data-sec]').forEach(a=>a.classList.toggle('on',a.dataset.sec===cur.id));
    secs.forEach(s=>{const r=s.getBoundingClientRect();const p=Math.min(1,Math.max(0,(y-r.top)/r.height));const a=document.querySelector(`.toc [data-sec="${s.id}"] .pg i`);if(a)a.style.width=(p*100)+'%'});
  };
  addEventListener('scroll',upd,{passive:true});upd();
}
function go(id){const el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});el.classList.remove('flash');void el.offsetWidth;if(!el.matches('section'))el.classList.add('flash')}
let CMD=[],sel=0;
function cmdItems(){
  CMD=[...SECTIONS.map(s=>({t:'Módulo',x:s[1],a:()=>go(s[0])})),
    ...D.brands.map(b=>({t:'Lente',x:'Aislar '+b.name,a:()=>{focusId=null;setLens(b.id)}})),
    {t:'Lente',x:'Ver todas las marcas',a:()=>setLens(null)},
    ...D.brands.map(b=>({t:'Pauta',x:b.name+' en Meta Ads',a:()=>go('ads-'+b.id)})),
    ...[...document.querySelectorAll('[data-search]')].map(el=>({t:el.dataset.search.split(' · ')[0],x:el.dataset.search.split(' · ').slice(1).join(' · '),a:()=>go(el.id)})),
    {t:'Tema',x:'Cambiar a modo oscuro',a:()=>setTheme('dark')},{t:'Tema',x:'Cambiar a modo claro',a:()=>setTheme('light')},{t:'Texto',x:'Agrandar texto',a:()=>setFz(fzI+1)},{t:'Texto',x:'Achicar texto',a:()=>setFz(fzI-1)},{t:'Texto',x:'Tamaño normal',a:()=>setFz(1)}];
}
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function renderCmd(q=''){
  const qq=norm(q.trim());const list=CMD.filter(c=>!qq||norm(c.t+' '+c.x).includes(qq)).slice(0,40);
  sel=Math.min(sel,Math.max(0,list.length-1));
  const ul=document.getElementById('cmd-list');
  ul.innerHTML=list.length?list.map((c,i)=>`<li role="option" data-i="${i}" aria-selected="${i===sel}"><span class="ty">${c.t}</span><span class="tx">${c.x}</span></li>`).join(''):'<div class="empty">Sin resultados. Prueba con ${D.meta.searchHint}.</div>';
  ul._list=list;
  ul.querySelector('[aria-selected="true"]')?.scrollIntoView({block:'nearest'});
}
let lastFocus=null;
function openCmd(){lastFocus=document.activeElement;const m=document.getElementById('cmdk');m.hidden=false;const i=document.getElementById('cmd-in');i.value='';sel=0;renderCmd();i.focus()}
function closeCmd(){document.getElementById('cmdk').hidden=true;lastFocus?.focus?.()}
function runCmd(){const l=document.getElementById('cmd-list')._list;if(l&&l[sel]){closeCmd();l[sel].a()}}

const FZ=[0.9,1,1.12,1.25,1.4];let fzI=1;
const ICS={light:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',system:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',dark:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'};
function prefsHTML(){return `<div class="row"><span class="lbl">Tema</span><div class="seg-ctl" role="group" aria-label="Tema">${[['light','Claro'],['system','Auto'],['dark','Oscuro']].map(t=>`<button type="button" data-th="${t[0]}" aria-pressed="false" title="Tema ${t[1].toLowerCase()}">${ICS[t[0]]}<span>${t[1]}</span></button>`).join('')}</div></div>
<div class="row"><span class="lbl">Texto</span><div class="seg-ctl" role="group" aria-label="Tamaño del texto"><button type="button" data-fz="-1" aria-label="Achicar texto">A−</button><output data-fz-out aria-live="polite">100%</output><button type="button" data-fz="1" aria-label="Agrandar texto">A+</button></div></div>`}
function setFz(i){fzI=Math.max(0,Math.min(FZ.length-1,i));document.documentElement.style.setProperty('--fz',FZ[fzI]);
  document.querySelectorAll('[data-fz-out]').forEach(o=>o.textContent=Math.round(FZ[fzI]*100)+'%');
  document.querySelectorAll('[data-fz="-1"]').forEach(b=>b.disabled=fzI===0);document.querySelectorAll('[data-fz="1"]').forEach(b=>b.disabled=fzI===FZ.length-1);
  try{localStorage.setItem('radar-fz',fzI)}catch(e){}
  if(typeof D!=='undefined'&&D)requestAnimationFrame(drawCharts)}
function openSheet(){lastFocus=document.activeElement;document.getElementById('sheet').hidden=false;document.querySelector('#sheet [data-th][aria-pressed="true"]')?.focus()}
function closeSheet(){document.getElementById('sheet').hidden=true;lastFocus?.focus?.()}
function setTheme(t){try{t==='system'?localStorage.removeItem('radar-theme'):localStorage.setItem('radar-theme',t)}catch(e){} if(t==='system')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);document.querySelectorAll('[data-th]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.th===t))}
function wire(){
  document.addEventListener('click',e=>{
    const l=e.target.closest('[data-lens],[data-lens-btn]');if(l)setLens(l.dataset.lens||l.dataset.lensBtn);
    if(e.target.closest('#open-cmd,#dock-search'))openCmd();
    if(e.target.id==='cmdk')closeCmd();
    const li=e.target.closest('#cmd-list li');if(li){sel=+li.dataset.i;runCmd()}
    const th=e.target.closest('[data-th]');if(th)setTheme(th.dataset.th);
    const fz=e.target.closest('[data-fz]');if(fz&&!fz.disabled)setFz(fzI+(+fz.dataset.fz));
    if(e.target.closest('#dock-prefs'))openSheet();
    if(e.target.id==='sheet'||e.target.closest('#sheet-close'))closeSheet();
  });
  document.getElementById('cmd-in').addEventListener('input',e=>{sel=0;renderCmd(e.target.value)});
  document.addEventListener('keydown',e=>{
    const open=!document.getElementById('cmdk').hidden;
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open?closeCmd():openCmd();return}
    if(open){
      if(e.key==='Escape')closeCmd();
      else if(e.key==='ArrowDown'){e.preventDefault();sel++;renderCmd(document.getElementById('cmd-in').value)}
      else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(0,sel-1);renderCmd(document.getElementById('cmd-in').value)}
      else if(e.key==='Enter'){e.preventDefault();runCmd()}
      else if(e.key==='Tab'){e.preventDefault();document.getElementById('cmd-in').focus()}
      return;
    }
    if(!document.getElementById('sheet').hidden&&e.key==='Escape'){closeSheet();return}
    if(/input|textarea/i.test(document.activeElement.tagName)||e.metaKey||e.ctrlKey||e.altKey)return;
    if(e.key==='+'||e.key==='='){setFz(fzI+1);return}
    if(e.key==='-'||e.key==='_'){setFz(fzI-1);return}
    if(e.key==='/'){e.preventDefault();openCmd()}
    else if(e.key==='Escape')setLens(null);
    else if(/^[1-5]$/.test(e.key))setLens(D.brands[+e.key-1].id);
    else if(e.key==='0')setLens(null);
    else if(e.key==='j'||e.key==='k'){const cur=document.querySelector('.toc a.on')?.dataset.sec;const i=SECTIONS.findIndex(s=>s[0]===cur);const n=SECTIONS[Math.min(SECTIONS.length-1,Math.max(0,i+(e.key==='j'?1:-1)))];go(n[0])}
  });
  const tip=document.getElementById('tip');
  document.addEventListener('mousemove',e=>{const r=e.target.closest('[data-tip]');if(!r){tip.style.opacity=0;return}tip.textContent=r.dataset.tip;tip.style.opacity=1;tip.style.left=Math.min(e.clientX+14,innerWidth-tip.offsetWidth-8)+'px';tip.style.top=(e.clientY+16)+'px'});
  document.querySelectorAll('[data-prefs]').forEach(el=>el.innerHTML=prefsHTML());
  setTheme('light');
  let f=1;try{const v=localStorage.getItem('radar-fz');if(v!==null)f=+v}catch(e){} setFz(isNaN(f)?1:f);
}
async function init(){
  if(window.__DATA__)D=window.__DATA__;else{const r=await fetch('data.json',{cache:'no-store'});D=await r.json()}
  document.getElementById('app').innerHTML=resumen()+panorama()+instagram()+facebook()+ads()+oportunidades()+diagnostico()+fuentes();
  buildRail();wire();spy();cmdItems();drawCharts();
  if(location.hash&&/^#[\w-]+$/.test(location.hash))setTimeout(()=>go(location.hash.slice(1)),50);
}
init();
