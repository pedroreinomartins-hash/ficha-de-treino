/* Exportação em PDF, gerada no próprio aparelho (sem servidor): ficha de treino e relatório de progressão.
   Usa jsPDF + AutoTable (MIT), em js/vendor, carregados só na primeira exportação. */
const PDF_LIB=['js/vendor/jspdf.umd.min.js','js/vendor/jspdf.plugin.autotable.min.js'];
async function pdfLib(){for(const s of PDF_LIB)await carregaScript(s);return window.jspdf.jsPDF}
const PDF_COR={ink:[18,24,33],muted:[90,101,115],line:[211,218,226],soft:[243,245,248],good:[31,122,77],warn:[166,107,0],bad:[178,40,38]};
function pdfAcento(){const c=CORES[apCfg()[PM()?'personal':'aluno'].cor]||CORES.azul;const h=c.claro.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16))}
const LETRA_COR=[[35,71,214],[13,127,134],[140,62,158],[181,83,27],[47,125,50]];
const dmy=t=>{const d=new Date(t);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()};
const pdfTxt=s=>String(s??'').replace(/[^\u0000-ÿ–—‘’“”…•]/g,'').trim();
function personalDe(aid){const pid=perfil(aid)?.personalId;if(!pid)return null;const px=pid===S.me?(S.pdoc||{}):(pub(pid)||{});return {nome:px.nome||nomeP(pid)||ME()?.nome||'Personal',cref:px.cref||''}}
const pdfNome=(tipo,nome)=>`${tipo}-${nk(nome).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'arquivo'}-${isoData(new Date())}.pdf`;

/* Cabeçalho e rodapé comuns. Retorna a altura (y) onde o conteúdo começa. */
function pdfCabecalho(doc,ac,eyebrow,titulo,linhas){const W=doc.internal.pageSize.getWidth();
 doc.setFillColor(...ac);doc.rect(0,0,W,4,'F');
 doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(...ac);doc.text(pdfTxt(eyebrow).toUpperCase(),14,14,{charSpace:.6});
 doc.setFontSize(20);doc.setTextColor(...PDF_COR.ink);const tl=doc.splitTextToSize(pdfTxt(titulo),W-28);doc.text(tl,14,23);let y=23+(tl.length-1)*8+7;
 doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(...PDF_COR.muted);
 linhas.filter(Boolean).forEach(l=>{const w=doc.splitTextToSize(pdfTxt(l),W-28);doc.text(w,14,y);y+=w.length*4.6});
 doc.setDrawColor(...PDF_COR.line);doc.setLineWidth(.3);doc.line(14,y,W-14,y);return y+7}
function pdfRodape(doc,aid){const n=doc.getNumberOfPages(),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();const px=personalDe(aid);
 for(let i=1;i<=n;i++){doc.setPage(i);doc.setDrawColor(...PDF_COR.line);doc.setLineWidth(.2);doc.line(14,H-12,W-14,H-12);
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(...PDF_COR.muted);
  doc.text(pdfTxt(`Pro Treino · gerado em ${dmy(Date.now())}${px?` · Personal: ${px.nome}${px.cref?' (CREF '+px.cref+')':''}`:''}`),14,H-7);
  doc.text(`Página ${i} de ${n}`,W-14,H-7,{align:'right'})}}
function pdfSecao(doc,y,txt,ac){y=pdfQuebra(doc,y,14);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(...PDF_COR.ink);doc.text(pdfTxt(txt),14,y);doc.setFillColor(...ac);doc.rect(14,y+1.8,12,.9,'F');return y+8}
function pdfQuebra(doc,y,precisa){const H=doc.internal.pageSize.getHeight();if(y+precisa>H-18){doc.addPage();return 18}return y}
const pdfTabela=(doc,y,head,body,o={})=>{doc.autoTable({startY:y,head:[head],body,margin:{left:14,right:14,bottom:18},theme:'grid',
 styles:{font:'helvetica',fontSize:8.6,cellPadding:{top:2.2,bottom:2.2,left:2.4,right:2.4},textColor:PDF_COR.ink,lineColor:PDF_COR.line,lineWidth:.2,valign:'middle'},
 headStyles:{fillColor:PDF_COR.soft,textColor:PDF_COR.muted,fontStyle:'bold',fontSize:7.6},alternateRowStyles:{fillColor:[251,252,253]},...o});return doc.lastAutoTable.finalY+8};
async function pdfEntrega(doc,nome){const blob=doc.output('blob');const file=new File([blob],nome,{type:'application/pdf'});
 try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:nome.replace(/\.pdf$/,'')});return}}catch(e){if(e?.name==='AbortError')return}
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=nome;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}

/* ================= Ficha de treino ================= */
async function pdfFicha(fid){const f=ficha(fid);if(!f)return;const jsPDF=await pdfLib();const doc=new jsPDF({unit:'mm',format:'a4'});const ac=pdfAcento();
 const aid=f.alunoId,al=perfil(aid),px=personalDe(aid);
 let y=pdfCabecalho(doc,ac,f.modelo?'Modelo de ficha':'Ficha de treino',f.nome,[
  [al&&!f.modelo?'Aluno: '+al.nome:'',px?`Personal: ${px.nome}${px.cref?' · CREF '+px.cref:''}`:''].filter(Boolean).join('   ·   '),
  [`Ciclo de ${f.semanas||8} semanas`,`Meta: ${metaDe(f)} treino${metaDe(f)>1?'s':''} por semana`,f.vence?'Vencimento: '+ddmmaa(f.vence):'',`${f.treinos.length} treino${f.treinos.length===1?'':'s'} em sequência`].filter(Boolean).join('   ·   ')]);
 if(!f.treinos.length){doc.setFontSize(10);doc.setTextColor(...PDF_COR.muted);doc.text('Esta ficha ainda não tem treinos.',14,y)}
 f.treinos.forEach((t,i)=>{const L=LETRAS[i],cor=LETRA_COR[i%5];y=pdfQuebra(doc,y,30);
  doc.setFillColor(...cor);doc.roundedRect(14,y-5.5,8,8,1.5,1.5,'F');doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(255,255,255);doc.text(L,18,y+.4,{align:'center'});
  doc.setTextColor(...PDF_COR.ink);doc.setFontSize(12.5);doc.text(pdfTxt(t.nome||'Treino '+L),25,y);
  if(t.dia){doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...PDF_COR.muted);doc.text(pdfTxt(t.dia),doc.internal.pageSize.getWidth()-14,y,{align:'right'})}
  y+=5;
  if(t.tipo==='corrida'){y=pdfTabela(doc,y,['#','Bloco'],(t.blocos||[]).map((b,j)=>[j+1,pdfTxt(blocoTxt(b))]),{columnStyles:{0:{cellWidth:9,halign:'center'}}});return}
  const G=grupos(t.ex),soft=ac.map(c=>Math.round(c+(255-c)*.86));const body=[];
  t.ex.forEach((e,j)=>{const g=G[j],GI=g?grpInfo(t.ex,g):null,tc=TECNICAS[e.tec];
   if(g&&g[0]===j)body.push([{content:pdfTxt(`${GI.nome} · ${g.length} exercícios em sequência · ${grpResumo(GI)}`),colSpan:6,styles:{fillColor:soft,textColor:ac,fontStyle:'bold',fontSize:8}}]);
   const obs=[tc&&!tc.grupo?tc.n:'',e.nota||'',e.knee?'Escala de dor':'',e.reab?'Reabilitação':''].filter(Boolean).join(' · ');
   const desc=g?(g[g.length-1]===j?mmss(GI.dr)+' (rodada)':GI.dx?mmss(GI.dx):'sem'):mmss(e.desc||0);
   body.push([g?{content:j+1,styles:{fillColor:soft}}:j+1,pdfTxt(e.n),pdfTxt(g?`${GI.r} × ${e.r}`:`${e.s} × ${e.r}`),e.tipo==='t'?pdfTxt('tempo '+fmtSec(e.hold||30)):(+e.kg>0?fmtKg(e.kg):''),desc,pdfTxt(obs)])});
  y=pdfTabela(doc,y,['#','Exercício','Séries × reps','Carga (kg)','Descanso','Técnica e observações'],body,{columnStyles:{0:{cellWidth:8,halign:'center',textColor:PDF_COR.muted},1:{cellWidth:52,fontStyle:'bold'},2:{cellWidth:24,halign:'center'},3:{cellWidth:20,halign:'center'},4:{cellWidth:18,halign:'center'}}})});
 y=pdfQuebra(doc,y,20);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...PDF_COR.muted);
 doc.text(doc.splitTextToSize('Os treinos se alternam em sequência, sem depender do dia da semana. Carga é a referência atual; ajuste conforme a orientação do seu Personal. Em caso de dor ou desconforto, interrompa o exercício e procure orientação profissional.',doc.internal.pageSize.getWidth()-28),14,y);
 pdfRodape(doc,aid);await pdfEntrega(doc,pdfNome('ficha',f.nome))}

/* ================= Relatório de progressão ================= */
const PERIODOS=[['4','Últimas 4 semanas'],['8','Últimas 8 semanas'],['12','Últimas 12 semanas'],['ciclo','Ciclo da ficha ativa'],['tudo','Todo o histórico']];
function periodoIni(aid,k){const ws=weekStart(Date.now());if(/^\d+$/.test(k))return ws-(+k-1)*7*DAY;const ss=sessDe(aid);
 if(k==='ciclo'){const f=ativaDe(aid);const fs=ss.filter(s=>s.fichaId===f?.id);return fs.length?weekStart(Math.min(...fs.map(s=>s.inicio))):ws}
 return ss.length?weekStart(Math.min(...ss.map(s=>s.inicio))):ws}
const D24={melhor:'Melhorou',igual:'Igual',pior:'Piorou'};
function pdfBarras(doc,x,y,w,h,itens,meta,ac){const max=Math.max(meta||0,...itens.map(i=>i.v),1);const n=itens.length,gap=Math.min(3,w/n*.25),bw=(w-gap*(n-1))/n;
 doc.setDrawColor(...PDF_COR.line);doc.setLineWidth(.2);doc.line(x,y+h,x+w,y+h);
 itens.forEach((it,i)=>{const bh=it.v/max*h,bx=x+i*(bw+gap);doc.setFillColor(...(meta&&it.v>=meta?ac:[175,185,198]));if(bh>0)doc.rect(bx,y+h-bh,bw,bh,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(...PDF_COR.ink);if(it.v>0)doc.text(String(it.v),bx+bw/2,y+h-bh-1.2,{align:'center'});
  if(n<=16||i%2===0){doc.setFont('helvetica','normal');doc.setFontSize(6.3);doc.setTextColor(...PDF_COR.muted);doc.text(it.l,bx+bw/2,y+h+3.6,{align:'center'})}});
 if(meta){const my=y+h-meta/max*h;doc.setDrawColor(...PDF_COR.bad);doc.setLineWidth(.35);doc.setLineDashPattern([1.2,1],0);doc.line(x,my,x+w,my);doc.setLineDashPattern([],0);
  doc.setFontSize(6.5);doc.setTextColor(...PDF_COR.bad);doc.text(`meta ${meta}`,x+w,my-1,{align:'right'})}}
function pdfLinha(doc,x,y,w,h,pts,ac,titulo){doc.setDrawColor(...PDF_COR.line);doc.setLineWidth(.2);doc.roundedRect(x,y,w,h,1.5,1.5,'S');
 doc.setFont('helvetica','bold');doc.setFontSize(7.8);doc.setTextColor(...PDF_COR.ink);doc.text(doc.splitTextToSize(pdfTxt(titulo),w-6)[0],x+3,y+5);
 if(pts.length<2){doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...PDF_COR.muted);doc.text('Poucos registros no período',x+3,y+h/2+4);return}
 const vs=pts.map(p=>p.v),mn=Math.min(...vs),mx=Math.max(...vs),rg=mx-mn||1,px=x+4,py=y+9,pw=w-8,ph=h-17;
 const P=pts.map((p,i)=>[px+i/(pts.length-1)*pw,py+ph-(p.v-mn)/rg*ph]);doc.setDrawColor(...ac);doc.setLineWidth(.6);for(let i=1;i<P.length;i++)doc.line(P[i-1][0],P[i-1][1],P[i][0],P[i][1]);
 doc.setFillColor(...ac);P.forEach(p=>doc.circle(p[0],p[1],.7,'F'));
 doc.setFont('helvetica','normal');doc.setFontSize(6.5);doc.setTextColor(...PDF_COR.muted);doc.text(`${fmtKg(pts[0].v)} kg · ${ddmm(pts[0].t)}`,x+3,y+h-2.5);doc.text(`${fmtKg(pts[pts.length-1].v)} kg · ${ddmm(pts[pts.length-1].t)}`,x+w-3,y+h-2.5,{align:'right'})}
function pdfKpis(doc,y,kpis,ac){const W=doc.internal.pageSize.getWidth(),n=kpis.length,gap=3,w=(W-28-gap*(n-1))/n;
 kpis.forEach((k,i)=>{const x=14+i*(w+gap);doc.setFillColor(...PDF_COR.soft);doc.roundedRect(x,y,w,19,2,2,'F');doc.setFillColor(...ac);doc.rect(x,y+3,.9,13,'F');
  doc.setFont('helvetica','bold');doc.setFontSize(15);doc.setTextColor(...PDF_COR.ink);doc.text(pdfTxt(k.v),x+4,y+9.5);
  doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...PDF_COR.muted);doc.text(doc.splitTextToSize(pdfTxt(k.l),w-6),x+4,y+14)});return y+26}
async function pdfRelatorio(aid,per,comDor){const jsPDF=await pdfLib();const doc=new jsPDF({unit:'mm',format:'a4'});const ac=pdfAcento();const W=doc.internal.pageSize.getWidth();
 const ini=periodoIni(aid,per),fim=Date.now(),al=perfil(aid),fa=ativaDe(aid),meta=metaDe(fa),px=personalDe(aid);
 const ss=sessDe(aid).filter(s=>s.inicio>=ini).sort((a,b)=>a.inicio-b.inicio);
 const nW=Math.max(1,Math.round((weekStart(fim)-ini)/(7*DAY))+1);
 const weeks=[...Array(nW)].map((_,i)=>{const w=ini+i*7*DAY;return {l:ddmm(w),v:ss.filter(s=>s.inicio>=w&&s.inicio<w+7*DAY).length,w}});
 const comp=weeks.filter(w=>w.w+7*DAY<=fim||w.v>=meta);const okW=comp.filter(w=>w.v>=meta).length;
 const musc=ss.filter(s=>!s.corrida),corr=ss.filter(s=>s.corrida),pses=ss.map(s=>+s.feedback?.pse).filter(v=>v>0);
 const km=corr.reduce((a,s)=>a+(+s.corrida.dist||0),0)/1000;
 let y=pdfCabecalho(doc,ac,'Relatório de progressão',al?.nome||'Aluno',[
  `Período: ${dmy(ini)} a ${dmy(fim)} (${nW} semana${nW>1?'s':''})${fa?'   ·   Ficha ativa: '+fa.nome:''}`,
  px?`Personal: ${px.nome}${px.cref?' · CREF '+px.cref:''}`:'']);
 if(!ss.length){doc.setFontSize(10);doc.setTextColor(...PDF_COR.muted);doc.text('Nenhum treino registrado no período escolhido.',14,y);pdfRodape(doc,aid);return pdfEntrega(doc,pdfNome('relatorio',al?.nome||'aluno'))}
 const kp=[{v:String(ss.length),l:'treinos no período'},{v:(ss.length/nW).toFixed(1).replace('.',','),l:`por semana (meta ${meta})`},{v:comp.length?Math.round(okW/comp.length*100)+'%':'—',l:'semanas com a meta cumprida'},{v:Math.round(ss.reduce((a,s)=>a+(s.dur||0),0)/ss.length/60)+' min',l:'duração média'}];
 if(km>0)kp.push({v:fmtKg(Math.round(km*10)/10)+' km',l:'de corrida'});else if(pses.length)kp.push({v:(pses.reduce((a,b)=>a+b,0)/pses.length).toFixed(1).replace('.',','),l:'esforço médio (0 a 10)'});
 y=pdfKpis(doc,y,kp,ac);
 y=pdfSecao(doc,y,'Frequência semanal',ac);y=pdfQuebra(doc,y,50);pdfBarras(doc,14,y,W-28,34,weeks,meta,ac);y+=43;
 doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(...PDF_COR.muted);doc.text('Barras na cor de destaque: semana com a meta cumprida. Linha tracejada: meta semanal da ficha ativa.',14,y);y+=9;
 /* Evolução de carga por exercício */
 const ex={};musc.forEach(s=>Object.values(s.ex||{}).forEach(r=>{const ks=r.sets.filter(x=>+x.kg>0);if(!ks.length)return;const k=nk(r.n);const top=ks.reduce((a,b)=>(+b.kg>+a.kg||(+b.kg===+a.kg&&+b.reps>+a.reps))?b:a);
  (ex[k]=ex[k]||{n:r.n,pts:[]}).pts.push({t:s.inicio,v:+top.kg,reps:+top.reps||0,rm:Math.max(...ks.map(x=>e1rm(+x.kg,+x.reps||0)))})}));
 const lista=Object.values(ex).sort((a,b)=>b.pts.length-a.pts.length||a.n.localeCompare(b.n,'pt'));
 if(lista.length){y=pdfSecao(doc,y,'Evolução de carga',ac);
  const body=lista.slice(0,20).map(e=>{const a=e.pts[0],b=e.pts[e.pts.length-1],mx=Math.max(...e.pts.map(p=>p.v)),vr=a.v?Math.round((b.v-a.v)/a.v*100):0;const r0=e.pts.find(p=>p.rm>0)?.rm,r1=[...e.pts].reverse().find(p=>p.rm>0)?.rm;
   return [pdfTxt(e.n),e.pts.length,`${fmtKg(a.v)} × ${a.reps}\n${ddmm(a.t)}`,`${fmtKg(b.v)} × ${b.reps}\n${ddmm(b.t)}`,fmtKg(mx),{content:(vr>0?'+':'')+vr+'%',styles:{textColor:vr>0?PDF_COR.good:vr<0?PDF_COR.bad:PDF_COR.muted,fontStyle:'bold'}},r0&&r1?`${Math.round(r0)} › ${Math.round(r1)}`:'—']});
  y=pdfTabela(doc,y,['Exercício','Sessões','Início (kg × reps)','Atual (kg × reps)','Maior (kg)','Variação','1RM est. (kg)'],body,{columnStyles:{0:{cellWidth:50,fontStyle:'bold'},1:{halign:'center',cellWidth:17},2:{halign:'center'},3:{halign:'center'},4:{halign:'center',cellWidth:18},5:{halign:'center',cellWidth:18},6:{halign:'center',cellWidth:22}}});
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(...PDF_COR.muted);doc.text('Carga considerada: a maior série de cada sessão. 1RM estimado pela fórmula de Epley (séries de até 12 repetições).',14,y-4);y+=2;
  const top=lista.filter(e=>e.pts.length>=2).slice(0,6);if(top.length){y=pdfQuebra(doc,y,6+Math.ceil(top.length/3)*34);const cw=(W-28-6)/3;
   top.forEach((e,i)=>pdfLinha(doc,14+(i%3)*(cw+3),y+Math.floor(i/3)*34,cw,31,e.pts,ac,e.n));y+=Math.ceil(top.length/3)*34+6}}
 /* Corrida */
 if(corr.length){y=pdfSecao(doc,y,'Corrida',ac);y=pdfTabela(doc,y,['Data','Treino','Distância','Tempo','Ritmo','FC média'],corr.slice(-30).map(s=>[dmy(s.inicio),pdfTxt(s.treinoNome||'Corrida'),fmtDist(s.corrida.dist),hms(s.corrida.tempo||s.dur||0),pdfTxt(fmtRitmo(s.corrida.ritmo)),s.corrida.fc?s.corrida.fc+' bpm':'—']),{columnStyles:{0:{cellWidth:22}}})}
 /* Sessões */
 y=pdfSecao(doc,y,'Sessões do período',ac);
 y=pdfTabela(doc,y,['Data','Treino','Duração','Séries','Esforço (0 a 10)'],[...ss].reverse().map(s=>[dmy(s.inicio),pdfTxt(`${s.letra||''} · ${s.treinoNome||''}`)+(s.conduzidoPor?' (conduzido pelo Personal)':''),Math.round((s.dur||0)/60)+' min',s.corrida?fmtDist(s.corrida.dist):Object.values(s.ex||{}).reduce((a,r)=>a+r.sets.length,0),s.feedback?.pse||'—']),{columnStyles:{0:{cellWidth:22},2:{halign:'center',cellWidth:20},3:{halign:'center',cellWidth:18},4:{halign:'center',cellWidth:28}}});
 /* Dor (opcional) */
 if(comDor){const linhas=[];ss.forEach(s=>{const it=Object.values(s.ex||{}).filter(r=>r.dor!=null).map(r=>`${r.n}: ${r.dor}`);if(s.corrida?.dor!=null)it.push('Corrida: '+s.corrida.dor);
   if(it.length||s.dor24)linhas.push([dmy(s.inicio),pdfTxt(s.letra||''),pdfTxt(it.join(' · ')||'—'),D24[s.dor24]||(s.dor24?pdfTxt(s.dor24):'—')])});
  y=pdfSecao(doc,y,'Registros de dor',ac);
  if(linhas.length)y=pdfTabela(doc,y,['Data','Treino','Dor durante o exercício (0 a 10)','Em 24 h'],linhas.reverse(),{columnStyles:{0:{cellWidth:22},1:{cellWidth:16,halign:'center'},3:{cellWidth:22,halign:'center'}},
   didParseCell:d=>{if(d.section==='body'&&d.column.index===3&&d.cell.raw==='Piorou')d.cell.styles.textColor=PDF_COR.bad}});
  else{doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...PDF_COR.muted);doc.text('Nenhum registro de dor no período.',14,y);y+=8}
  y=pdfQuebra(doc,y,10);doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(...PDF_COR.muted);doc.text('Escala: 0 a 2 geralmente aceitável; 3 a 4 monitorar; 5 ou mais interromper ou modificar o exercício.',14,y)}
 pdfRodape(doc,aid);await pdfEntrega(doc,pdfNome('relatorio',al?.nome||'aluno'))}

/* ================= Telas ================= */
function relBox(aid){const R=S.rel&&S.rel.aid===aid?S.rel:null;
 if(!R)return `<button class="btn ghost" data-act="relopen" data-v="${aid}">Exportar relatório em PDF</button>`;
 return `<section class="form"><h3>Relatório de progressão em PDF</h3>
 <div class="field"><label class="lbl" for="rel-per">Período</label><select id="rel-per" data-rel="per">${PERIODOS.map(([k,l])=>`<option value="${k}" ${R.per===k?'selected':''}>${l}</option>`).join('')}</select></div>
 <label class="check"><input type="checkbox" data-rel="dor" ${R.dor?'checked':''}>Incluir registros de dor</label>
 <div class="small muted">Inclui frequência semanal, evolução de carga por exercício, corrida e lista de sessões. Os registros de dor são dados de saúde: inclua só se for compartilhar com quem acompanha o treino.</div>
 ${R.err?`<div class="note bad">${esc(R.err)}</div>`:''}
 <div class="nav2"><button class="btn ghost" data-act="relno">Cancelar</button><button class="btn primary" data-act="relgo" ${R.busy?'disabled':''}>${R.busy?'Gerando…':'Gerar PDF'}</button></div></section>`}
const pdfBtnFicha=f=>`<button class="btn sm ghost" data-act="pdfficha" data-v="${f.id}" ${S.pdfBusy?'disabled':''}>${S.pdfBusy?'Gerando…':'Exportar PDF'}</button>`;
document.addEventListener('change',e=>{const el=e.target;if(el.dataset.rel&&S.rel){S.rel[el.dataset.rel]=el.type==='checkbox'?el.checked:el.value}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const v=b.dataset.v;
 switch(b.dataset.act){
  case 'relopen':S.rel={aid:v,per:'8',dor:false};render();break;
  case 'relno':S.rel=null;render();break;
  case 'relgo':{const R=S.rel;R.busy=true;R.err='';render();pdfRelatorio(R.aid,R.per,R.dor).then(()=>{S.rel=null;render()}).catch(err=>{console.warn(err);R.busy=false;R.err='Não foi possível gerar o PDF. Verifique a conexão na primeira vez (a ferramenta de PDF é baixada) e tente de novo.';render()});break}
  case 'pdfficha':S.pdfBusy=true;render();pdfFicha(v).catch(err=>{console.warn(err);toast('Não foi possível gerar o PDF. Tente de novo.')}).finally(()=>{S.pdfBusy=false;render()});break;
 }});
