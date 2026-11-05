/* Corrida: treino em blocos dentro da ficha, execução guiada por voz, registro da corrida (manual ou por arquivo do relógio),
   tênis e evolução de volume e ritmo. */
const BLOCOS={aquec:'Aquecimento',cont:'Corrida contínua',int:'Intervalado (tiros)',desaq:'Desaquecimento'};
const temConteudo=t=>t.tipo==='corrida'?(t.blocos||[]).length>0:t.ex.length>0;
/* ---------- Formatação ---------- */
const fmtDist=m=>{m=+m||0;return m<1000?Math.round(m)+' m':String(+(m/1000).toFixed(2)).replace('.',',')+' km'};
const fmtRitmo=s=>s?fmtMS(s)+'/km':'—';
const fmtHMS=s=>{s=Math.max(0,Math.round(s||0));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+':'+pad(m):String(m))+':'+pad(x)};
function parseDist(v){const t=String(v??'').trim().toLowerCase().replace(',','.');if(!t)return 0;const m=t.match(/^(\d+(?:\.\d+)?)\s*(km|m)?$/);if(!m)return 0;
 return Math.round(m[2]==='m'?+m[1]:(+m[1]>=50&&!m[2]?+m[1]:+m[1]*1000))}
function parseHMS(v){const t=String(v??'').trim();const p=t.split(':').map(Number);if(p.some(isNaN))return 0;if(p.length===3)return p[0]*3600+p[1]*60+p[2];if(p.length===2)return p[0]*60+p[1];return Math.round((+t.replace(',','.')||0)*60)}
function falaTempo(s){s=Math.round(s);const m=Math.floor(s/60),x=s%60;if(!m)return x+' segundos';if(!x)return m+(m===1?' minuto':' minutos');return m+(m===1?' minuto':' minutos')+' e '+x}
const falaDist=m=>m<1000?Math.round(m)+' metros':String(+(m/1000).toFixed(2)).replace('.',' vírgula ')+(m===1000?' quilômetro':' quilômetros');
const falaRitmo=s=>{const m=Math.floor(s/60),x=s%60;return 'ritmo '+m+(m===1?' minuto':' minutos')+(x?' e '+x:'')+' por quilômetro'};
function blocoTxt(b){const med=x=>x.medida==='dist'?fmtDist(x.valor):fmtMS(x.valor)+' min';const r=x=>x.ritmo?' a '+fmtRitmo(x.ritmo):'';
 if(b.tipo==='int')return `${b.reps} × ${med(b)}${r(b)} · recuperação ${fmtMS(b.rec)}`;return `${BLOCOS[b.tipo]} · ${med(b)}${r(b)}`}
function corridaResumo(t){const p=passosDe(t);const dur=p.reduce((a,x)=>a+(x.dur||0),0),dist=p.reduce((a,x)=>a+(x.dist||(x.dur&&x.ritmo?x.dur/x.ritmo*1000:0)),0);
 return `${(t.blocos||[]).length} bloco${(t.blocos||[]).length===1?'':'s'}${dist?' · cerca de '+fmtDist(dist):''}${dur?' · ~'+Math.round(dur/60)+' min':''}`}

/* ---------- Passos da execução ---------- */
function passosDe(t){const out=[];(t.blocos||[]).forEach(b=>{
 const base=x=>{const dur=x.medida==='tempo'?x.valor:(x.ritmo?Math.round(x.valor/1000*x.ritmo):null);return {medida:x.medida,valor:x.valor,ritmo:x.ritmo||0,dur,dist:x.medida==='dist'?x.valor:null,estimado:x.medida==='dist'&&!!x.ritmo}};
 if(b.tipo==='int'){for(let k=1;k<=b.reps;k++){out.push({...base(b),tipo:'tiro',k,n:b.reps});if(k<b.reps&&b.rec)out.push({tipo:'rec',medida:'tempo',valor:b.rec,ritmo:0,dur:b.rec,dist:null,k,n:b.reps})}}
 else out.push({...base(b),tipo:b.tipo})});return out}
function passoTitulo(p){return p.tipo==='tiro'?`Tiro ${p.k} de ${p.n}`:p.tipo==='rec'?`Recuperação ${p.k} de ${p.n-1}`:BLOCOS[p.tipo]}
function passoDesc(p){if(p.tipo==='rec')return fmtMS(p.dur)+' min · trote leve ou caminhada';return (p.medida==='dist'?fmtDist(p.valor):fmtMS(p.valor)+' min')+(p.ritmo?' · '+fmtRitmo(p.ritmo):'')}
function passoFala(p){if(p.tipo==='rec')return 'Recupere. '+falaTempo(p.dur)+'.';
 const med=p.medida==='dist'?falaDist(p.valor):falaTempo(p.valor);return passoTitulo(p)+': '+med+(p.ritmo?', '+falaRitmo(p.ritmo):'')+'.'}

/* ---------- Execução ---------- */
function startCorrida(f,t,ti){somAudio();const now=Date.now();
 S.active={id:uid('s'),alunoId:S.me,fichaId:f.id,treinoId:t.id,letra:LETRAS[ti],treinoNome:t.nome,tipo:'corrida',passos:passosDe(t),i:0,inicio:now,passoIni:now,pausa:null,pausaTot:0,avisos:{}};
 S.view='treino';S.confirmEnd=false;saveActive();mediaCorrida();anunciaPasso();render();keepAwake()}
const crAtiva=()=>{const a=myActive();return a&&a.tipo==='corrida'?a:null};
function crElapsed(a,now=Date.now()){return ((a.pausa||now)-a.passoIni)/1000}
function anunciaPasso(){const a=crAtiva();if(!a)return;const p=a.passos[a.i];if(!p)return;alertaSom(p.tipo==='rec'?'recuperacao':'inicioBloco',{modo:'corr',texto:passoFala(p)})}
function crAvancar(){const a=crAtiva();if(!a)return;const now=Date.now();a.i++;a.passoIni=now;a.pausa=null;a.avisos={};
 if(a.i>=a.passos.length){crFinalizar(true);return}saveActive();anunciaPasso();render()}
function crPausar(){const a=crAtiva();if(!a)return;const now=Date.now();if(a.pausa){a.pausaTot+=now-a.pausa;a.passoIni+=now-a.pausa;a.pausa=null;alertaSom('faltam10',{modo:'corr',texto:'Retomando.'})}else{a.pausa=now;alertaSom('faltam10',{modo:'corr',texto:'Pausado.'})}
 try{navigator.mediaSession&&(navigator.mediaSession.playbackState=a.pausa?'paused':'playing')}catch(e){}saveActive();render()}
function crFinalizar(completo){const a=crAtiva();if(!a)return;const now=Date.now();if(a.pausa){a.pausaTot+=now-a.pausa;a.pausa=null}
 const tempo=Math.round((now-a.inicio-a.pausaTot)/1000);
 const feitos=a.passos.slice(0,Math.min(a.i+(completo?0:1),a.passos.length));
 const dist=feitos.reduce((s,p)=>s+(p.dist||(p.dur&&p.ritmo?p.dur/p.ritmo*1000:0)),0);
 if(completo)alertaSom('fim',{modo:'corr',texto:'Treino concluído. Parabéns!'});
 sessaoAudio.parar();releaseAwake();
 S.reg={id:a.id,fichaId:a.fichaId,treinoId:a.treinoId,letra:a.letra,treinoNome:a.treinoNome,inicio:a.inicio,dist:dist?String(+(dist/1000).toFixed(2)).replace('.',','):'',tempo:fmtHMS(tempo),fc:'',pse:null,dor:null,tenis:(ME()?.tenis||[]).find(x=>x.ativo!==false)?.id||'',obs:'',fonte:'plano',plano:true};
 S.active=null;saveActive();S.view='corridaReg';S.confirmEnd=false;render();window.scrollTo(0,0)}
function mediaCorrida(){sessaoAudio.iniciar({next:crAvancar,pause:crPausar,play:crPausar});infoCorrida()}
function infoCorrida(){const a=crAtiva();if(!a)return;const p=a.passos[a.i];if(!p)return;const el=crElapsed(a);
 const t=p.dur?fmtMS(Math.max(0,p.dur-el)):fmtMS(el);sessaoAudio.info(passoTitulo(p)+' · '+t+(a.pausa?' · pausado':''),passoDesc(p))}
function tickCorrida(){const a=crAtiva();if(!a)return;const now=Date.now();const p=a.passos[a.i];if(!p)return;
 document.querySelectorAll('#elapsed').forEach(el=>el.textContent=hms((now-a.inicio-a.pausaTot-(a.pausa?now-a.pausa:0))/1000));
 const el=crElapsed(a,now);
 if(!a.pausa&&p.dur){const left=p.dur-el;
  if(p.dur>=25&&left<=10&&!a.avisos.f10){a.avisos.f10=1;alertaSom('faltam10',{modo:'corr',texto:'10 segundos.'})}
  const lc=Math.ceil(left);if(lc<=3&&lc>=1&&a.avisos.t!==lc){a.avisos.t=lc;alertaSom('tic',{modo:'corr'})}
  if(left<=0){crAvancar();return}}
 const c=$('#crClock');if(c)c.textContent=p.dur?fmtMS(Math.max(0,p.dur-el)):fmtMS(el);
 const bar=$('#crBar');if(bar&&p.dur)bar.style.width=Math.min(100,el/p.dur*100)+'%';
 infoCorrida()}
setInterval(tickCorrida,250);
function viewCorrida(){const a=crAtiva();const p=a.passos[a.i];const prox=a.passos[a.i+1];const el=crElapsed(a);
 const conf=S.confirmEnd?`<div class="confirm"><b>Encerrar a corrida agora?</b><span class="small muted">${a.i} de ${a.passos.length} etapas concluídas.</span><button class="btn primary" data-act="crend" data-v="1">Encerrar e registrar</button><div class="nav2"><button class="btn ghost" data-act="endcancel">Continuar</button><button class="btn danger" data-act="crend" data-v="0">Descartar</button></div></div>`:'';
 return `<main class="wrap"><header class="shead">${letter(a.letra)}<div class="grow"><div class="clock" id="elapsed">0:00</div><div class="small muted" id="wakeTag">${wake?'Tela ativa':'Tela pode apagar'}</div></div><button class="btn sm ghost" data-act="tab" data-v="inicio">Menu</button><button class="btn sm danger" data-act="endask">Encerrar</button></header>
 ${conf}
 <section class="panel cr ${p.tipo}"><div class="eyebrow">Etapa ${a.i+1} de ${a.passos.length}${a.pausa?' · pausado':''}</div><h2 class="exname">${esc(passoTitulo(p))}</h2><div class="presc"><span class="tag">${esc(passoDesc(p))}</span>${p.estimado?'<span class="tag">tempo estimado pelo ritmo</span>':''}</div>
  <div class="center"><div class="clock" id="crClock" style="font-size:72px">${p.dur?fmtMS(Math.max(0,p.dur-el)):fmtMS(el)}</div><div class="small muted">${p.dur?'restante':'cronômetro · toque em Avançar ao terminar'}</div></div>
  ${p.dur?'<div class="meter"><i id="crBar" style="width:0%"></i></div>':''}
  <div class="nav2"><button class="btn big ${a.pausa?'primary':'ghost'}" data-act="crpausa">${a.pausa?'Retomar':'Pausar'}</button><button class="btn big primary" data-act="cravanca">${prox?'Avançar ›':'Concluir'}</button></div>
  ${prox?`<div class="small muted">A seguir: <b style="color:var(--ink)">${esc(passoTitulo(prox))}</b> · ${esc(passoDesc(prox))}</div>`:''}</section>
 <div class="small muted" style="text-align:center">Com fone de ouvido, os avisos continuam com a tela apagada. Use os botões de mídia (na tela de bloqueio ou no fone) para pausar e avançar.</div>
 <section class="panel" style="gap:4px"><div class="eyebrow">Etapas</div>${a.passos.map((x,k)=>`<div class="row small" style="gap:8px;${k<a.i?'opacity:.5':''}${k===a.i?';font-weight:700':''}"><span style="width:18px">${k<a.i?'✓':k===a.i?'›':''}</span><span class="grow">${esc(passoTitulo(x))}</span><span class="muted">${esc(passoDesc(x))}</span></div>`).join('')}</section></main>`}

/* ---------- Registro da corrida ---------- */
function novoRegistro(){S.reg={id:uid('s'),fichaId:'',treinoId:'',letra:'R',treinoNome:'Corrida avulsa',inicio:Date.now(),dist:'',tempo:'',fc:'',pse:null,dor:null,tenis:(ME()?.tenis||[]).find(x=>x.ativo!==false)?.id||'',obs:'',fonte:'manual'};S.view='corridaReg';render();window.scrollTo(0,0)}
function viewRegistro(){const R=S.reg;if(!R){S.view='inicio';return render0()}
 const dist=parseDist(R.dist),tempo=parseHMS(R.tempo),ritmo=dist>=100&&tempo?Math.round(tempo/(dist/1000)):0;
 const ten=(ME()?.tenis||[]).filter(x=>x.ativo!==false);const dt=new Date(R.inicio);const dtv=`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
 return page(R.plano?'Treino '+esc(R.letra)+' concluído':'Corrida','Registrar corrida',`
 <section class="panel"><div class="eyebrow">Do relógio ou de outro app</div><div class="small muted">Envie o arquivo da atividade exportado do relógio, do Strava ou do app do fabricante (GPX, TCX ou FIT). Distância, tempo, data e frequência cardíaca são preenchidos automaticamente.</div>
  <label class="btn ghost" for="cr-arq">Escolher arquivo</label><input id="cr-arq" type="file" hidden>
  ${R.arqMsg?`<div class="note ${R.arqMsg.c}">${esc(R.arqMsg.t)}</div>`:''}</section>
 <section class="panel">
  <div class="grid2"><div class="field"><label class="lbl" for="cr-dist">Distância (km)</label><input id="cr-dist" class="txt" inputmode="decimal" data-reg="dist" value="${esc(R.dist)}" placeholder="5,2"></div><div class="field"><label class="lbl" for="cr-tempo">Tempo (h:min:seg)</label><input id="cr-tempo" class="txt" inputmode="numeric" data-reg="tempo" value="${esc(R.tempo)}" placeholder="28:30"></div></div>
  <div class="kpi" style="text-align:center"><span>Ritmo médio</span><b id="cr-ritmo">${ritmo?fmtRitmo(ritmo):'—'}</b></div>
  <div class="grid2"><div class="field"><label class="lbl" for="cr-fc">FC média (opcional)</label><input id="cr-fc" class="txt" inputmode="numeric" data-reg="fc" value="${esc(R.fc)}" placeholder="bpm"></div><div class="field"><label class="lbl" for="cr-data">Data e hora</label><input id="cr-data" class="txt" type="datetime-local" data-reg="data" value="${dtv}"></div></div>
  <div class="field"><label class="lbl" for="cr-ten">Tênis</label>${ten.length?`<select id="cr-ten" data-reg="tenis"><option value="">Não informar</option>${ten.map(x=>`<option value="${x.id}" ${R.tenis===x.id?'selected':''}>${esc(x.nome)} · ${fmtKmT(kmTenis(x))}</option>`).join('')}</select>`:'<div class="small muted">Cadastre seus tênis em Meu perfil para acompanhar a quilometragem.</div>'}</div>
  <div class="field"><span class="lbl">Esforço percebido (1 = muito leve · 10 = máximo)</span><div class="pse">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button data-act="regpse" data-v="${n}" class="${R.pse===n?'sel':''}">${n}</button>`).join('')}</div></div>
  <div class="field"><span class="lbl">Dor (opcional)</span><div class="pain">${[...Array(11)].map((_,i)=>`<button class="z${i<=2?0:i<=4?1:2} ${R.dor===i?'sel':''}" data-act="regdor" data-v="${i}">${i}</button>`).join('')}</div></div>
  <div class="field"><label class="lbl" for="cr-obs">Observação</label><input id="cr-obs" class="txt" data-reg="obs" value="${esc(R.obs)}" placeholder="Ex.: calor, subida forte no km 3"></div>
  ${R.err?`<div class="note bad">${esc(R.err)}</div>`:''}
  <div class="nav2"><button class="btn ghost" data-act="regcancel">${R.plano?'Descartar':'Cancelar'}</button><button class="btn primary" data-act="regsave">Salvar corrida</button></div></section>`,{back:'inicio'})}
function salvarRegistro(){const R=S.reg;const dist=parseDist(R.dist),tempo=parseHMS(R.tempo);
 if(dist<100)throw new Error('Informe a distância em km (ex.: 5,2).');if(tempo<60)throw new Error('Informe o tempo (ex.: 28:30 ou 1:05:20).');
 const ritmo=Math.round(tempo/(dist/1000));const fc=parseInt(R.fc,10)||null;const inicio=R.inicio;
 const s={id:R.id,alunoId:S.me,fichaId:R.fichaId||'',treinoId:R.treinoId||'',letra:R.letra||'R',treinoNome:R.treinoNome||'Corrida avulsa',tipo:'corrida',inicio,fim:inicio+tempo*1000,dur:tempo,ex:{},dor24:null,
  corrida:{dist,tempo,ritmo,fc,fcMax:R.fcMax||null,tenisId:R.tenis||'',fonte:R.fonte||'manual',dor:R.dor},feedback:(R.pse||R.obs.trim())?{pse:R.pse,txt:R.obs.trim()}:null};
 put('sessions',s);return s}

/* ---------- Tênis ---------- */
const kmTenis=t=>(+t.km0||0)+S.sessions.filter(s=>s.alunoId===S.me&&s.corrida?.tenisId===t.id).reduce((a,s)=>a+s.corrida.dist/1000,0);
const fmtKmT=k=>String(Math.round(k)).replace('.',',')+' km';
function tenisBox(){const l=ME()?.tenis||[];const T=S.ten;
 return `<section class="panel"><div class="eyebrow">Meus tênis de corrida</div>
  ${l.length?l.map(x=>{const k=kmTenis(x);return `<div class="row" style="gap:8px;${x.ativo===false?'opacity:.55':''}"><div class="grow"><b>${esc(x.nome)}</b><div class="small ${k>=600&&x.ativo!==false?'':'muted'}" style="${k>=600&&x.ativo!==false?'color:var(--warn);font-weight:600':''}">${fmtKmT(k)}${k>=600&&x.ativo!==false?' · perto da faixa de troca (600 a 800 km)':''}${x.ativo===false?' · aposentado':''}</div></div><button class="btn sm ghost" data-act="tenatv" data-v="${x.id}">${x.ativo===false?'Reativar':'Aposentar'}</button></div>`}).join(''):'<div class="small muted">Nenhum tênis cadastrado.</div>'}
  ${T?`<div class="form"><div class="grid2"><div class="field"><label class="lbl" for="tn-nome">Nome do tênis</label><input id="tn-nome" class="txt" data-ten="nome" value="${esc(T.nome||'')}" placeholder="Ex.: Nike Pegasus 41"></div><div class="field"><label class="lbl" for="tn-km">Km já rodados</label><input id="tn-km" class="txt" inputmode="numeric" data-ten="km0" value="${esc(T.km0||'')}" placeholder="0"></div></div>${T.err?`<div class="note bad">${esc(T.err)}</div>`:''}<div class="nav2"><button class="btn ghost" data-act="tencancel">Cancelar</button><button class="btn primary" data-act="tensave">Salvar tênis</button></div></div>`:`<button class="btn sm ghost" style="align-self:flex-start" data-act="tenopen">+ Cadastrar tênis</button>`}</section>`}

/* ---------- Evolução e alertas de corrida ---------- */
const kmSemana=(aid,ws)=>S.sessions.filter(s=>s.alunoId===aid&&s.corrida&&weekStart(s.inicio)===ws).reduce((a,s)=>a+s.corrida.dist/1000,0);
function volumeAlerta(aid){const ws=weekStart(Date.now()),W=7*DAY;const atual=kmSemana(aid,ws),ant=kmSemana(aid,ws-W),ant2=kmSemana(aid,ws-2*W);
 const r=(a,b)=>b>0&&a>b*1.1?Math.round((a/b-1)*100):0;
 if(r(atual,ant))return {k:'vol:'+ws,c:'warn',t:`Volume de corrida desta semana (${atual.toFixed(1).replace('.',',')} km) já está ${r(atual,ant)}% acima da semana passada (${ant.toFixed(1).replace('.',',')} km). A regra prática é aumentar no máximo cerca de 10% por semana.`};
 if(r(ant,ant2))return {k:'vol:'+(ws-W),c:'warn',t:`Na semana passada o volume de corrida subiu ${r(ant,ant2)}% (de ${ant2.toFixed(1).replace('.',',')} para ${ant.toFixed(1).replace('.',',')} km). A regra prática é aumentar no máximo cerca de 10% por semana.`};
 return null}
function corridaAlertas(aid){const out=[];const v=volumeAlerta(aid);if(v)out.push(v);const now=Date.now();
 S.sessions.filter(s=>s.alunoId===aid&&s.corrida&&now-s.inicio<14*DAY&&s.corrida.dor>=5).forEach(s=>out.push({k:'cdor:'+s.id,c:'bad',t:`Dor ${s.corrida.dor}/10 na corrida de ${ddmm(s.inicio)}`}));return out}
function corridaEvo(aid){const cs=S.sessions.filter(s=>s.alunoId===aid&&s.corrida).sort((a,b)=>a.inicio-b.inicio);if(!cs.length)return '';
 const ws=weekStart(Date.now());const weeks=[...Array(8)].map((_,i)=>{const w=ws-(7-i)*7*DAY;return {l:ddmm(w),v:+kmSemana(aid,w).toFixed(1)}});
 const m4=weeks.slice(4).reduce((a,w)=>a+w.v,0)/4;const maior=Math.max(...cs.map(s=>s.corrida.dist));const bons=cs.filter(s=>s.corrida.dist>=1000);const melhor=bons.length?Math.min(...bons.map(s=>s.corrida.ritmo)):0;
 const pts=cs.slice(-12).map(s=>({l:ddmm(s.inicio),v:s.corrida.ritmo}));const va=volumeAlerta(aid);
 const ten=aid===S.me?(ME()?.tenis||[]).filter(x=>x.ativo!==false&&kmTenis(x)>=600):[];
 return `<div class="eyebrow" style="margin-top:8px">Corrida</div>
 ${va?`<div class="note warn">${esc(va.t)}</div>`:''}${ten.map(x=>`<div class="note warn">Tênis ${esc(x.nome)} com ${fmtKmT(kmTenis(x))}: perto da faixa usual de troca (600 a 800 km).</div>`).join('')}
 <div class="kpis"><div class="kpi"><b>${weeks[7].v.toFixed(1).replace('.',',')}</b><span>km nesta semana</span></div><div class="kpi"><b>${m4.toFixed(1).replace('.',',')}</b><span>km/semana (4 sem.)</span></div><div class="kpi"><b>${fmtDist(maior)}</b><span>maior distância</span></div></div>
 <section class="panel"><div class="eyebrow">Volume de corrida · km por semana</div>${bars(weeks)}</section>
 ${pts.length>1?`<section class="panel"><div class="eyebrow">Ritmo médio por corrida (min/km · menor é mais rápido)</div>${line(pts,{fmt:v=>fmtMS(v)})}<div class="small muted">Melhor ritmo em corridas de 1 km ou mais: <b style="color:var(--ink)">${fmtRitmo(melhor)}</b></div></section>`:''}`}

/* ---------- Editor do treino de corrida ---------- */
function corridaEditor(f,t,ti){const C=S.conf;const kt='delt:'+t.id;
 const rows=(t.blocos||[]).map((b,bi)=>{if(S.bf&&S.bf.t===t.id&&S.bf.b===b.id)return blocoForm();const k='delb:'+t.id+':'+b.id;
  if(C===k)return `<div class="miniconf"><span class="grow">Excluir este bloco?</span><button class="btn sm danger" data-act="delb" data-t="${t.id}" data-v="${b.id}">Excluir</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`;
  return `<div class="exrow"><span class="n">${bi+1}</span><div class="grow"><b>${BLOCOS[b.tipo]}</b><div class="meta">${esc(blocoTxt(b).replace(BLOCOS[b.tipo]+' · ',''))}</div></div><div class="icons"><button class="ib" data-act="mvb" data-t="${t.id}" data-v="${b.id}" data-d="-1" ${bi===0?'disabled':''} aria-label="Subir">↑</button><button class="ib" data-act="mvb" data-t="${t.id}" data-v="${b.id}" data-d="1" ${bi===t.blocos.length-1?'disabled':''} aria-label="Descer">↓</button><button class="ib" data-act="editb" data-t="${t.id}" data-v="${b.id}" aria-label="Editar">✎</button><button class="ib del" data-act="conf" data-v="${k}" aria-label="Excluir">✕</button></div></div>`}).join('');
 const adding=S.bf&&S.bf.t===t.id&&!S.bf.b;
 return `<section class="panel">
  <div class="row">${letter(LETRAS[ti])}<div class="grow field"><label class="lbl" for="tn-${t.id}">Treino ${LETRAS[ti]} · corrida</label><input id="tn-${t.id}" class="txt" data-ch="tnome" data-t="${t.id}" value="${esc(t.nome)}"></div></div>
  <div class="field"><label class="lbl" for="td-${t.id}">Dia sugerido</label><select id="td-${t.id}" data-ch="tdia" data-t="${t.id}"><option value="">Sem dia fixo</option>${DIAS.map(d=>`<option ${t.dia===d?'selected':''}>${d}</option>`).join('')}</select></div>
  <div class="eyebrow">${esc(corridaResumo(t))}</div>
  <div class="list">${rows||'<div class="small muted">Nenhum bloco ainda. Comece pelo aquecimento.</div>'}</div>
  ${adding?blocoForm():`<button class="btn dash" data-act="addb" data-t="${t.id}">+ Incluir bloco</button>`}
  ${C===kt?`<div class="miniconf"><span class="grow">Excluir o treino ${LETRAS[ti]}?</span><button class="btn sm danger" data-act="delt" data-v="${t.id}">Excluir</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`:`<button class="btn sm ghost" style="align-self:flex-start;color:var(--bad)" data-act="conf" data-v="${kt}">Excluir treino ${LETRAS[ti]}</button>`}
 </section>`}
function blocoForm(){const d=S.bf.d;const int=d.tipo==='int';
 return `<div class="form" id="bform"><h3>${S.bf.b?'Editar bloco':'Novo bloco'}</h3>
  <div class="field"><span class="lbl">Tipo</span><div class="seg" style="grid-template-columns:repeat(2,1fr)">${Object.entries(BLOCOS).map(([k,l])=>`<button type="button" data-act="bftipo" data-v="${k}" class="${d.tipo===k?'on':''}">${l}</button>`).join('')}</div></div>
  ${int?`<div class="field"><label class="lbl" for="bf-reps">Repetições (tiros)</label><input id="bf-reps" class="txt" inputmode="numeric" data-bf="reps" value="${esc(d.reps)}"></div>`:''}
  <div class="field"><span class="lbl">${int?'Cada tiro por':'Medir por'}</span><div class="seg" style="grid-template-columns:1fr 1fr"><button type="button" data-act="bfmed" data-v="tempo" class="${d.medida==='tempo'?'on':''}">Tempo</button><button type="button" data-act="bfmed" data-v="dist" class="${d.medida==='dist'?'on':''}">Distância</button></div></div>
  <div class="grid2"><div class="field"><label class="lbl" for="bf-val">${d.medida==='tempo'?'Tempo (min:seg)':'Distância (km ou m)'}</label><input id="bf-val" class="txt" inputmode="decimal" data-bf="valor" value="${esc(d.valor)}" placeholder="${d.medida==='tempo'?'10:00':int?'400 m':'5'}"></div>
   <div class="field"><label class="lbl" for="bf-rit">Ritmo (min:seg por km)</label><input id="bf-rit" class="txt" inputmode="decimal" data-bf="ritmo" value="${esc(d.ritmo)}" placeholder="opcional, ex.: 6:00"></div></div>
  ${int?`<div class="field"><label class="lbl" for="bf-rec">Recuperação entre tiros (min:seg)</label><input id="bf-rec" class="txt" inputmode="decimal" data-bf="rec" value="${esc(d.rec)}" placeholder="1:30"></div>`:''}
  <div class="small muted">Sem GPS, blocos por distância usam o ritmo para estimar o tempo e avisar por voz. Sem ritmo, você avança manualmente ao concluir (pelo botão ou pelo fone).</div>
  ${S.bf.err?`<div class="note bad">${esc(S.bf.err)}</div>`:''}
  <div class="nav2"><button type="button" class="btn ghost" data-act="bfcancel">Cancelar</button><button type="button" class="btn primary" data-act="bfsave">Salvar bloco</button></div></div>`}
function blocoDeForm(){const d=S.bf.d;const b={id:S.bf.b||uid('b'),tipo:d.tipo,medida:d.medida};
 b.valor=d.medida==='tempo'?parseMS(d.valor):parseDist(d.valor);if(!b.valor)throw new Error(d.medida==='tempo'?'Informe o tempo (ex.: 10:00).':'Informe a distância (ex.: 5 ou 400 m).');
 const r=parseMS(d.ritmo);if(r){if(r<120||r>1200)throw new Error('Ritmo fora do comum. Use min:seg por km, ex.: 6:00.');b.ritmo=r}
 if(d.tipo==='int'){b.reps=Math.min(30,Math.max(1,parseInt(d.reps,10)||0));if(!parseInt(d.reps,10))throw new Error('Informe o número de tiros.');b.rec=parseMS(d.rec)||0}
 return b}
function blocoPadrao(tipo){return tipo==='int'?{tipo,medida:'dist',valor:'400 m',ritmo:'',reps:'6',rec:'1:30'}:tipo==='cont'?{tipo,medida:'dist',valor:'5',ritmo:'',reps:'',rec:''}:{tipo,medida:'tempo',valor:tipo==='aquec'?'10:00':'5:00',ritmo:'',reps:'',rec:''}}

/* ---------- Cliques e campos ---------- */
document.addEventListener('input',e=>{const el=e.target;
 if(el.dataset.bf&&S.bf)S.bf.d[el.dataset.bf]=el.value;
 if(el.dataset.ten&&S.ten)S.ten[el.dataset.ten]=el.value;
 if(el.dataset.reg&&S.reg){if(el.dataset.reg==='data'){const t=new Date(el.value).getTime();if(t)S.reg.inicio=t}else S.reg[el.dataset.reg]=el.value;
  if(el.dataset.reg==='dist'||el.dataset.reg==='tempo'){const d=parseDist(S.reg.dist),t=parseHMS(S.reg.tempo);const r=$('#cr-ritmo');if(r)r.textContent=d>=100&&t?fmtRitmo(Math.round(t/(d/1000))):'—'}}
});
document.addEventListener('change',async e=>{const el=e.target;
 if(el.dataset.reg==='tenis'&&S.reg)S.reg.tenis=el.value;
 if(el.id==='cr-arq'&&el.files?.[0]&&S.reg){const R=S.reg;R.arqMsg={c:'good',t:'Lendo o arquivo…'};render();
  try{const r=await lerArquivoAtividade(el.files[0]);R.dist=String(+(r.dist/1000).toFixed(2)).replace('.',',');R.tempo=fmtHMS(r.tempo);if(r.fc)R.fc=String(r.fc);if(r.fcMax)R.fcMax=r.fcMax;if(r.inicio&&!R.plano)R.inicio=r.inicio;R.fonte=r.fonte;
   R.arqMsg={c:'good',t:`Arquivo lido: ${fmtDist(r.dist)} em ${fmtHMS(r.tempo)}${r.fc?' · FC média '+r.fc:''}. Confira e salve.`}}
  catch(err){R.arqMsg={c:'bad',t:err.message||'Não foi possível ler o arquivo.'}}render()}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const v=b.dataset.v,f=typeof curFicha==='function'?curFicha():null;
 switch(b.dataset.act){
  case 'cravanca':crAvancar();break;
  case 'crpausa':crPausar();break;
  case 'crend':if(v==='1')crFinalizar(false);else{sessaoAudio.parar();releaseAwake();S.active=null;saveActive();S.confirmEnd=false;S.view='inicio';render()}break;
  case 'regnova':novoRegistro();break;
  case 'regpse':S.reg.pse=+v;render();break;
  case 'regdor':S.reg.dor=S.reg.dor===+v?null:+v;render();break;
  case 'regcancel':S.reg=null;S.view='inicio';render();break;
  case 'regsave':{try{salvarRegistro();S.reg=null;S.view='inicio';toast('Corrida registrada.');render();window.scrollTo(0,0)}catch(err){S.reg.err=err.message;render()}break}
  case 'tenopen':S.ten={nome:'',km0:''};render();setTimeout(()=>$('#tn-nome')?.focus(),0);break;
  case 'tencancel':S.ten=null;render();break;
  case 'tensave':{const T=S.ten;if(!(T.nome||'').trim()){T.err='Informe o nome do tênis.';render();break}const p=ME();p.tenis=[...(p.tenis||[]),{id:uid('k'),nome:T.nome.trim(),km0:Math.max(0,parseFloat(String(T.km0).replace(',','.'))||0),ativo:true,criado:Date.now()}];put('perfis',p);S.ten=null;render();break}
  case 'tenatv':{const p=ME();p.tenis=(p.tenis||[]).map(x=>x.id===v?{...x,ativo:x.ativo===false}:x);put('perfis',p);render();break}
  case 'addtc':{if(!f||f.treinos.length>=7)break;f.treinos.push({id:uid('t'),nome:'Corrida',dia:'',tipo:'corrida',ex:[],blocos:[]});saveF(f);render();break}
  case 'addb':S.conf=null;S.form=null;S.bf={t:b.dataset.t,b:null,d:blocoPadrao('aquec')};render();setTimeout(()=>$('#bform')?.scrollIntoView({block:'center'}),0);break;
  case 'editb':{const t=f.treinos.find(x=>x.id===b.dataset.t),x=t.blocos.find(y=>y.id===v);S.conf=null;S.bf={t:t.id,b:x.id,d:{tipo:x.tipo,medida:x.medida,valor:x.medida==='tempo'?fmtMS(x.valor):(x.valor<1000?x.valor+' m':String(x.valor/1000).replace('.',',')),ritmo:x.ritmo?fmtMS(x.ritmo):'',reps:String(x.reps||''),rec:x.rec?fmtMS(x.rec):''}};render();break}
  case 'bftipo':{const d=S.bf.d;if(d.tipo!==v){const n=blocoPadrao(v);S.bf.d={...n,valor:S.bf.b?d.valor:n.valor,medida:S.bf.b?d.medida:n.medida,ritmo:d.ritmo}}render();break}
  case 'bfmed':{const d=S.bf.d;if(d.medida!==v){d.medida=v;d.valor=v==='tempo'?'10:00':(d.tipo==='int'?'400 m':'5')}render();break}
  case 'bfcancel':S.bf=null;render();break;
  case 'bfsave':{try{const nb=blocoDeForm();const t=f.treinos.find(x=>x.id===S.bf.t);t.blocos=t.blocos||[];const i=t.blocos.findIndex(x=>x.id===nb.id);if(i>=0)t.blocos[i]=nb;else t.blocos.push(nb);S.bf=null;saveF(f);render()}catch(err){S.bf.err=err.message;render()}break}
  case 'mvb':{const t=f.treinos.find(x=>x.id===b.dataset.t);const i=t.blocos.findIndex(x=>x.id===v),j=i+ +b.dataset.d;if(j<0||j>=t.blocos.length)break;[t.blocos[i],t.blocos[j]]=[t.blocos[j],t.blocos[i]];saveF(f);render();break}
  case 'delb':{const t=f.treinos.find(x=>x.id===b.dataset.t);t.blocos=t.blocos.filter(x=>x.id!==v);S.conf=null;saveF(f);render();break}
 }
});
