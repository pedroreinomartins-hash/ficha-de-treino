/* Leitura de arquivos de atividade exportados de relógios e apps (Garmin, Polar, Coros, Suunto, Amazfit/Zepp, Strava…).
   GPX e TCX são XML; FIT é binário (formato da Garmin, usado pela maioria dos relógios). Tudo é lido no próprio aparelho. */
function haversine(a,b){const R=6371000,r=x=>x*Math.PI/180;const dl=r(b.lat-a.lat),dg=r(b.lon-a.lon);const h=Math.sin(dl/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function resumoPontos(pts){/* pts: {t (ms), lat, lon, hr, dist?} em ordem */
 pts=pts.filter(p=>p.t);if(pts.length<2)throw new Error('O arquivo não tem pontos suficientes da atividade.');
 let dist=0,mov=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];const dt=(b.t-a.t)/1000;let dd=0;
  if(b.dist!=null&&a.dist!=null)dd=Math.max(0,b.dist-a.dist);else if(a.lat!=null&&b.lat!=null)dd=haversine(a,b);dist+=dd;
  if(dt>0&&dt<=30&&dd/dt>0.5)mov+=dt}
 const hrs=pts.map(p=>p.hr).filter(Boolean);const total=(pts[pts.length-1].t-pts[0].t)/1000;
 return {dist:Math.round(dist),tempo:Math.round(mov>total*0.5?mov:total),fc:hrs.length?Math.round(hrs.reduce((a,b)=>a+b,0)/hrs.length):null,fcMax:hrs.length?Math.max(...hrs):null,inicio:pts[0].t}}
function xmlDoc(txt){const d=new DOMParser().parseFromString(txt,'application/xml');if(d.getElementsByTagName('parsererror').length)throw new Error('O arquivo está corrompido ou não é GPX/TCX.');return d}
const porNome=(el,n)=>[...el.getElementsByTagName('*')].filter(x=>x.localName===n);
const filho=(el,n)=>[...el.children].find(x=>x.localName===n);
function lerGPX(txt){const d=xmlDoc(txt);const pts=porNome(d,'trkpt').map(p=>({lat:+p.getAttribute('lat'),lon:+p.getAttribute('lon'),t:Date.parse(filho(p,'time')?.textContent||'')||0,hr:+(porNome(p,'hr')[0]?.textContent||0)||null}));
 if(!pts.length)throw new Error('Não há trajeto (trkpt) neste GPX.');return {...resumoPontos(pts),fonte:'gpx'}}
function lerTCX(txt){const d=xmlDoc(txt);const laps=porNome(d,'Lap');
 if(laps.length){let tempo=0,dist=0,hrS=0,hrT=0,hrMax=0;laps.forEach(l=>{const t=+(filho(l,'TotalTimeSeconds')?.textContent||0),m=+(filho(l,'DistanceMeters')?.textContent||0);tempo+=t;dist+=m;
   const av=+(porNome(l,'AverageHeartRateBpm')[0]?.textContent||0),mx=+(porNome(l,'MaximumHeartRateBpm')[0]?.textContent||0);if(av){hrS+=av*t;hrT+=t}if(mx>hrMax)hrMax=mx});
  const ini=Date.parse(laps[0].getAttribute('StartTime')||porNome(d,'Id')[0]?.textContent||'')||null;
  if(dist>0&&tempo>0)return {dist:Math.round(dist),tempo:Math.round(tempo),fc:hrT?Math.round(hrS/hrT):null,fcMax:hrMax||null,inicio:ini,fonte:'tcx'}}
 const pts=porNome(d,'Trackpoint').map(p=>({t:Date.parse(filho(p,'Time')?.textContent||'')||0,dist:filho(p,'DistanceMeters')?+filho(p,'DistanceMeters').textContent:null,lat:+(porNome(p,'LatitudeDegrees')[0]?.textContent||NaN)||null,lon:+(porNome(p,'LongitudeDegrees')[0]?.textContent||NaN)||null,hr:+(porNome(p,'HeartRateBpm')[0]?.textContent||0)||null}));
 return {...resumoPontos(pts),fonte:'tcx'}}
/* FIT: lê as mensagens "session" (18) e, se faltar, os pontos "record" (20). */
function lerFIT(buf){const dv=new DataView(buf);if(buf.byteLength<14)throw new Error('Arquivo FIT inválido.');
 const hs=dv.getUint8(0);const tag=String.fromCharCode(dv.getUint8(8),dv.getUint8(9),dv.getUint8(10),dv.getUint8(11));if(tag!=='.FIT')throw new Error('Arquivo FIT inválido.');
 const fim=Math.min(buf.byteLength,hs+dv.getUint32(4,true));const defs={};let p=hs;const sessoes=[],recs=[];const EPOCH=631065600000;
 const ler=(tipo,tam,le,o)=>{const bt=tipo&0x1f;if(tam===1)return bt===1?dv.getInt8(o):dv.getUint8(o);if(tam===2)return bt===3?dv.getInt16(o,le):dv.getUint16(o,le);if(tam===4)return bt===5?dv.getInt32(o,le):(bt===8?dv.getFloat32(o,le):dv.getUint32(o,le));return null};
 const INV={1:0xff,2:0xffff,4:0xffffffff};
 while(p<fim){const h=dv.getUint8(p);p++;let local,def;
  if(h&0x80){local=(h>>5)&3;def=defs[local]}
  else if(h&0x40){local=h&0x0f;const le=dv.getUint8(p+1)===0;const g=dv.getUint16(p+2,le);const n=dv.getUint8(p+4);p+=5;const campos=[];for(let i=0;i<n;i++){campos.push({num:dv.getUint8(p),tam:dv.getUint8(p+1),tipo:dv.getUint8(p+2)});p+=3}
   let dev=0;if(h&0x20){const nd=dv.getUint8(p);p++;for(let i=0;i<nd;i++){dev+=dv.getUint8(p+1);p+=3}}defs[local]={g,le,campos,dev};continue}
  else{local=h&0x0f;def=defs[local]}
  if(!def)throw new Error('Arquivo FIT com formato não reconhecido.');
  const m={};for(const c of def.campos){if(c.tam<=4&&p+c.tam<=fim){const v=ler(c.tipo,c.tam,def.le,p);{const bt=c.tipo&0x1f;const inval=v===null||v===INV[c.tam]||(bt===1&&v===0x7f)||(bt===3&&v===0x7fff)||(bt===5&&v===0x7fffffff)||(bt===8&&!isFinite(v));if(!inval)m[c.num]=v}}p+=c.tam}p+=def.dev;
  if(def.g===18)sessoes.push(m);else if(def.g===20)recs.push(m)}
 if(sessoes.length){const tot=sessoes.reduce((a,s)=>({dist:a.dist+(s[9]||0)/100,tempo:a.tempo+(s[8]||s[7]||0)/1000,fcS:a.fcS+(s[16]||0)*((s[8]||s[7]||0)/1000),fcT:a.fcT+(s[16]?(s[8]||s[7]||0)/1000:0),fcMax:Math.max(a.fcMax,s[17]||0)}),{dist:0,tempo:0,fcS:0,fcT:0,fcMax:0});
  if(tot.dist>0&&tot.tempo>0)return {dist:Math.round(tot.dist),tempo:Math.round(tot.tempo),fc:tot.fcT?Math.round(tot.fcS/tot.fcT):null,fcMax:tot.fcMax||null,inicio:sessoes[0][2]?EPOCH+sessoes[0][2]*1000:null,fonte:'fit'}}
 const pts=recs.filter(r=>r[253]).map(r=>({t:EPOCH+r[253]*1000,dist:r[5]!=null?r[5]/100:null,lat:r[0]!=null?r[0]*180/2147483648:null,lon:r[1]!=null?r[1]*180/2147483648:null,hr:r[3]||null}));
 return {...resumoPontos(pts),fonte:'fit'}}
async function lerArquivoAtividade(file){const nome=(file.name||'').toLowerCase();
 if(file.size>40*1024*1024)throw new Error('Arquivo muito grande. Exporte apenas a atividade.');
 let r;if(nome.endsWith('.fit'))r=lerFIT(await file.arrayBuffer());
 else{const txt=await file.text();if(nome.endsWith('.gpx')||/<gpx[\s>]/i.test(txt.slice(0,500)))r=lerGPX(txt);else if(nome.endsWith('.tcx')||/TrainingCenterDatabase/.test(txt.slice(0,800)))r=lerTCX(txt);
  else throw new Error('Formato não reconhecido. Use um arquivo GPX, TCX ou FIT.')}
 if(!r.dist||r.dist<100)throw new Error('Não encontrei distância nesse arquivo. Confira se é uma atividade de corrida com GPS ou sensor.');return r}
