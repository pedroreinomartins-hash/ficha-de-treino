/* Recursos da atualização de nov/2026 (sugestões do Personal Carlos Igor):
   técnicas avançadas, grupos (bi-set/tri-set), aniversário, vencimento da ficha,
   avisos ao Personal quando o aluno termina o treino e condução do treino pelo Personal. */

/* ================= Técnicas avançadas ================= */
const TECNICAS={
 drop:{n:'Drop-set',d:'Ao terminar a série, reduza a carga em 20% a 30% e continue sem descanso até a falha. Pode repetir o drop 1 ou 2 vezes.',sub:'drop'},
 restpause:{n:'Rest-pause',d:'Perto da falha, pause 10 a 20 s e faça mais algumas repetições com a mesma carga.',sub:'pausa',pausa:15},
 cluster:{n:'Cluster',d:'A série é dividida em blocos curtos, com pausas de 10 a 20 s entre eles, mantendo a carga.',sub:'pausa',pausa:15},
 bi:{n:'Bi-set',d:'Este exercício e o seguinte são feitos em sequência, sem descanso entre eles. O descanso vem depois do segundo.',grupo:2},
 tri:{n:'Tri-set',d:'Este exercício e os dois seguintes são feitos em sequência, sem descanso entre eles. O descanso vem depois do terceiro.',grupo:3},
 piramideC:{n:'Pirâmide crescente',d:'Aumente a carga e reduza as repetições a cada série.'},
 piramideD:{n:'Pirâmide decrescente',d:'Comece com a carga mais alta e, a cada série, reduza a carga e aumente as repetições.'},
 negativa:{n:'Ênfase na negativa',d:'Controle a descida do peso, em 3 a 5 segundos, na fase excêntrica.'},
 fst7:{n:'FST-7',d:'7 séries de 8 a 12 repetições com descanso curto (30 a 45 s), em geral no último exercício do grupo muscular.'}
};
const tecNome=k=>TECNICAS[k]?.n||'';
/* Índices do treino que formam bi-set/tri-set: {índice: [índices do grupo]} */
function grupos(L){const g={};for(let i=0;i<L.length;i++){const k=TECNICAS[L[i].tec]?.grupo;if(!k||g[i])continue;const ids=[];for(let j=i;j<Math.min(L.length,i+k);j++)ids.push(j);if(ids.length>1)ids.forEach(j=>g[j]=ids)}return g}
function tecSelect(d){return `<div class="field"><label class="lbl" for="fx-tec">Técnica (opcional)</label><select id="fx-tec" data-f="tec"><option value="">Série tradicional</option>${Object.entries(TECNICAS).map(([k,t])=>`<option value="${k}" ${d.tec===k?'selected':''}>${t.n}</option>`).join('')}</select>${d.tec&&TECNICAS[d.tec]?`<div class="small muted">${esc(TECNICAS[d.tec].d)}</div>`:''}</div>`}
/* Série com drops/blocos: 60 kg × 10 + 45×6 */
function fmtSet(x,curto){if(x.sec!=null)return fmtSec(x.sec);const base=curto?`${fmtKg(x.kg)}×${x.reps}`:`${fmtKg(x.kg)} kg × ${x.reps}`;return base+(x.x?.length?' + '+x.x.map(y=>`${fmtKg(y.kg)}×${y.reps}`).join(' + '):'')}

/* ================= Datas: aniversário e vencimento ================= */
function dataLocal(s){const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3]):null}
const isoData=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const hoje0=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
function idade(nasc){const d=dataLocal(nasc);if(!d)return null;const h=new Date();let a=h.getFullYear()-d.getFullYear();if(h.getMonth()<d.getMonth()||(h.getMonth()===d.getMonth()&&h.getDate()<d.getDate()))a--;return a}
/* Dias até o próximo aniversário (0 = hoje). */
function diasAniv(nasc){const d=dataLocal(nasc);if(!d)return null;const h=hoje0();let p=new Date(h.getFullYear(),d.getMonth(),d.getDate());if(p<h)p=new Date(h.getFullYear()+1,d.getMonth(),d.getDate());return Math.round((p-h)/DAY)}
/* Dias até o vencimento da ficha (negativo = vencida). */
function diasVence(f){const d=dataLocal(f?.vence);return d?Math.round((d-hoje0())/DAY):null}
const ddmmaa=s=>{const d=dataLocal(s);return d?pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear():''};
function fimDoCiclo(f){const ss=S.sessions.filter(s=>s.fichaId===f.id);const ini=ss.length?Math.min(...ss.map(s=>s.inicio)):(f.criada||Date.now());const d=new Date(ini);d.setHours(0,0,0,0);d.setDate(d.getDate()+(f.semanas||8)*7);return isoData(d)}
function venceTxt(f){const n=diasVence(f);if(n==null)return '';return n<0?`venceu em ${ddmmaa(f.vence)}`:n===0?'vence hoje':`vence em ${n} dia${n>1?'s':''} (${ddmmaa(f.vence)})`}
/* Alertas extras para o painel do Personal. */
function alertasExtras(aid){const out=[],p=perfil(aid),f=ativaDe(aid),now=Date.now();
 const da=diasAniv(p?.nasc);if(da!=null&&da<=7)out.push({c:'info',t:da===0?`Aniversário hoje (${idade(p.nasc)} anos) 🎉`:`Aniversário em ${da} dia${da>1?'s':''} (${ddmmaa(p.nasc).slice(0,5)})`});
 const dv=diasVence(f);if(dv!=null&&dv<=7)out.push({c:dv<0?'warn':'info',t:`Ficha “${f.nome}” ${venceTxt(f)}`});
 sessDe(aid).filter(s=>s.pulados?.length&&now-s.inicio<7*DAY).forEach(s=>out.push({c:'info',t:`Pulou ${s.pulados.length} exercício${s.pulados.length>1?'s':''} em ${ddmm(s.inicio)}: ${s.pulados.join(', ')}`}));
 return out}
/* Avisos para o próprio aluno, no Início. */
function avisosAluno(){const p=ME(),f=ativaDe(S.me);let h='';
 if(diasAniv(p?.nasc)===0)h+=`<section class="panel cele"><div class="eyebrow">Hoje é o seu dia</div><h2>Feliz aniversário, ${esc(p.nome)}! 🎉</h2><div class="small muted">Que o novo ano venha com muita saúde e novos recordes.</div></section>`;
 const dv=diasVence(f);if(dv!=null&&dv<=7)h+=`<div class="note ${dv<0?'bad':'warn'}">Sua ficha ${venceTxt(f)}. ${p?.personalId?'Combine a próxima com o seu Personal.':'Que tal montar a próxima?'}</div>`;
 return h}
/* Mensagem de meta semanal, mostrada ao concluir o treino. */
function metaMsgHTML(){const m=S.metaMsg;if(!m)return '';
 if(m.wk===m.meta)return `<div class="note good cele"><b>🏆 Parabéns, meta da semana cumprida!</b><br>Você concluiu os ${m.meta} treinos previstos para esta semana. Continue assim!</div>`;
 if(m.wk>m.meta)return `<div class="note good"><b>Treino extra!</b> Já são ${m.wk} nesta semana, acima da meta de ${m.meta}.</div>`;
 const f=m.meta-m.wk;return `<div class="note good">Muito bem! ${m.wk} de ${m.meta} treinos da semana. ${f===1?'Falta só 1 para a meta.':'Faltam '+f+' para a meta.'}</div>`}

/* ================= Personal: treinos concluídos em tempo real ================= */
const VISTO={ini:false,ids:{}};
const fbSig=s=>s.feedback?'f'+(s.feedback.pse||'')+'|'+(s.feedback.txt||''):'s';
function novosTreinos(){const docs=SRC.sessP?.docs||[];
 if(!VISTO.ini){docs.forEach(s=>VISTO.ids[s.id]=fbSig(s));VISTO.ini=true;return}
 docs.forEach(s=>{const sig=fbSig(s),antes=VISTO.ids[s.id];if(antes===sig)return;VISTO.ids[s.id]=sig;
  if(s.conduzidoPor===S.me||Date.now()-(s.fim||0)>6*3600e3)return;
  const nome=perfil(s.alunoId)?.nome||'Aluno';let t;
  if(antes===undefined)t=`${nome} concluiu o treino ${s.letra} · ${Math.round((s.dur||0)/60)} min`;
  else if(s.feedback)t=`${nome} avaliou o treino ${s.letra}: esforço ${s.feedback.pse||'—'}/10${s.feedback.txt?' · “'+s.feedback.txt+'”':''}`;
  else return;
  toast(t);try{navigator.vibrate&&navigator.vibrate([120,80,120])}catch(e){}avisoNav(t)})}
function avisoNav(t){try{if(document.visibilityState==='visible'||!('Notification' in window)||Notification.permission!=='granted')return;
 navigator.serviceWorker?.ready.then(r=>r.showNotification('Treino concluído',{body:t,icon:'icons/icon-192.png',tag:'treino-'+Date.now()}))}catch(e){}}
function avisosBtn(){if(!('Notification' in window))return '';const p=Notification.permission;
 if(p==='granted')return `<div class="small muted">Avisos do navegador ativados: com o app aberto (mesmo em segundo plano), você é avisado quando um aluno termina o treino.</div>`;
 if(p==='denied')return `<div class="small muted">Os avisos do navegador estão bloqueados para este app. Libere nas configurações do navegador para receber o aviso em segundo plano.</div>`;
 return `<button class="btn sm ghost" data-act="avisoson">🔔 Avisar quando um aluno terminar o treino</button>`}
/* Painel "Treinos de hoje" no topo da lista de alunos. */
function feedHoje(){const t0=hoje0().getTime();const ids=new Set(alunos().map(p=>p.id));
 const ss=S.sessions.filter(s=>ids.has(s.alunoId)&&s.inicio>=t0).slice(0,8);
 const linhas=ss.map(s=>{const p=perfil(s.alunoId);const fb=s.feedback;
  return `<button class="item" data-act="aluno" data-v="${s.alunoId}" style="width:100%;text-align:left">${avatar(p,'s')}<div class="grow"><b>${esc(p.nome)}</b> · treino ${esc(s.letra)}<div class="small muted">${new Date(s.fim||s.inicio).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} · ${Math.round((s.dur||0)/60)} min${s.conduzidoPor?' · conduzido por você':''}${s.pulados?.length?' · '+s.pulados.length+' pulado'+(s.pulados.length>1?'s':''):''}</div>${fb?.txt?`<div class="fb">“${esc(fb.txt)}”</div>`:''}</div><div style="text-align:right">${fb?.pse?`<b class="num" style="font-size:22px">${fb.pse}</b><div class="small muted">esforço</div>`:'<span class="small muted">sem avaliação</span>'}</div></button>`}).join('');
 return `<section class="panel" style="gap:6px"><div class="row"><div class="eyebrow grow">Treinos de hoje · em tempo real</div><span class="chip ${ss.length?'on':''}">${ss.length}</span></div>${linhas?`<div class="list">${linhas}</div>`:'<div class="small muted">Quando um aluno concluir o treino, ele aparece aqui na hora, com o esforço e o recado.</div>'}${avisosBtn()}</section>`}

/* ================= Personal conduz o treino do aluno ================= */
function conduzirBox(aid){if(!S.p||perfil(aid)?.personalId!==S.me)return '';const f=ativaDe(aid);
 if(myActive())return myActive().alunoId===aid?`<button class="banner" data-act="tab" data-v="treino"><span class="grow"><b>Treino em andamento</b><br><span class="small">Toque para voltar à sessão</span></span></button>`:'';
 if(!f)return '';const ni=nextIdx0(f);
 const bt=f.treinos.map((t,i)=>t.tipo==='corrida'?'':`<button data-act="conduzir" data-a="${aid}" data-f="${f.id}" data-v="${t.id}" ${temConteudo(t)?'':'disabled'} ${i===ni?'class="on"':''}><b>${LETRAS[i]}</b><span>${esc(t.nome)}</span></button>`).join('');
 return `<section class="panel"><div class="eyebrow">Conduzir treino no seu celular</div><div class="small muted">Use quando o aluno estiver sem bateria ou para evitar distrações. Os registros vão para o histórico dele, marcados como conduzidos por você. Próximo da sequência: treino ${LETRAS[ni]}.</div><div class="alt">${bt}</div></section>`}

document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const v=b.dataset.v;
 switch(b.dataset.act){
  case 'avisoson':try{Notification.requestPermission().then(()=>render())}catch(e){}break;
  case 'conduzir':startSession(b.dataset.f,v,b.dataset.a);window.scrollTo(0,0);break;
  case 'usarciclo':{const f=curFicha();if(f){f.vence=fimDoCiclo(f);saveF(f);render()}break}
  case 'semvence':{const f=curFicha();if(f){delete f.vence;saveF(f);render()}break}
 }});
