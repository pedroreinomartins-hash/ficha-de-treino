/* ================= Treino em andamento compartilhado (aluno ⇄ Personal) =================
   O treino de musculação em andamento é gravado em andamento/{alunoId}. Só um celular controla
   o treino por vez (campo "controle"); o outro acompanha ao vivo e pode assumir ou retomar.
   Quando o treino termina ou é descartado, o documento é apagado. */
const AND_VIDA=3*3600e3;            // sem atividade por 3 h: deixa de aparecer como em andamento
const ANDSRC={};let andT=null;

function andListen(uid){
 S.and={};for(const k in ANDSRC)delete ANDSRC[k];
 const C=fdb.collection('andamento');
 const ouvir=(key,ref)=>unsubs.push(ref.onSnapshot(sn=>{
   const docs=sn.docs?sn.docs:(sn.exists?[sn]:[]);
   ANDSRC[key]=docs.map(d=>({...d.data(),id:d.id}));
   const m={};Object.values(ANDSRC).forEach(l=>l.forEach(d=>m[d.alunoId||d.id]=d));S.and=m;andReconcilia();
 },e=>console.warn('andamento',e)));
 if(S.g)ouvir('todos',C);
 else{ouvir('meu',C.doc(uid));if(S.p)ouvir('carteira',C.where('personalId','==',uid))}
}

/* Treino em andamento de um aluno (só o que ainda está "vivo"). */
function andDe(aid){const d=S.and?.[aid];return d&&Date.now()-(d.atualizado||0)<AND_VIDA?d:null}
/* O treino do próprio usuário está aberto em outro celular. */
function andOutro(){const d=andDe(S.me);return !!d&&d.controle!==S.me}
function andEstado(d){try{return JSON.parse(d.estado)}catch(e){return null}}

/* Chamado sempre que o treino local muda (saveActive). Grava com uma pequena espera para juntar toques seguidos. */
function andSync(){clearTimeout(andT);const a=S.active;if(!fdb||!S.me||!a||a.tipo==='corrida')return;andT=setTimeout(()=>andGrava(false),700)}
function andGrava(forcar){clearTimeout(andT);const a=S.active;if(!fdb||!a||a.tipo==='corrida'||!myActive())return;
 const d=S.and?.[a.alunoId];if(!forcar&&d&&d.sessId===a.id&&d.controle!==S.me)return;
 const L=a.exList||[];
 const doc={alunoId:a.alunoId,personalId:perfil(a.alunoId)?.personalId||'',sessId:a.id,controle:S.me,controleNome:ME()?.nome||'',
  porPersonal:!!a.cond,letra:a.letra||'',treinoNome:a.treinoNome||'',fichaId:a.fichaId||'',inicio:a.inicio,
  feitos:L.filter(e=>(a.ex[e.id]?.sets.length||0)>=e.s||a.skip?.[e.id]).length,total:L.length,
  atualizado:Date.now(),estado:JSON.stringify(a)};
 fdb.collection('andamento').doc(a.alunoId).set(doc).catch(e=>console.warn('andamento',e))}
/* Fim do treino (salvo ou descartado): apaga o registro compartilhado. */
function andFim(a){clearTimeout(andT);if(!fdb||!a||a.tipo==='corrida')return;const d=S.and?.[a.alunoId];
 if(d&&d.sessId!==a.id)return;if(d)delete S.and[a.alunoId];
 fdb.collection('andamento').doc(a.alunoId).delete().catch(e=>console.warn('andamento',e))}

/* Se outro celular assumiu o treino que está aberto aqui, este celular passa a só acompanhar. */
function andReconcilia(){const a=S.active;
 if(a&&a.tipo!=='corrida'&&myActive()){const d=S.and?.[a.alunoId];
  if(d&&d.sessId===a.id&&d.controle!==S.me){
   const eraCond=!!a.cond,nome=a.alunoNome||'O aluno';
   clearTimeout(andT);releaseAwake();try{sessaoAudio.parar()}catch(e){}
   S.active=null;S.confirmEnd=false;LS.set('ft4.active',null);
   if(eraCond){toast(d.porPersonal?`${d.controleNome||'Outro celular'} assumiu o treino.`:`${nome} retomou o treino pelo próprio celular.`);S.sel=a.alunoId;S.view='aluno'}
   else{toast(`${d.controleNome||'Seu Personal'} assumiu o seu treino.`);S.view='inicio'}
   render();return}}
 soft()}

/* Assumir (Personal) ou retomar (aluno) um treino em andamento, do ponto em que está. */
function andAssumir(aid){const d=andDe(aid);if(!d)return toast('Esse treino não está mais em andamento.');
 const at=myActive();if(at&&at.id!==d.sessId)return toast('Encerre o treino aberto neste celular antes de assumir outro.');
 const e=andEstado(d);if(!e||!e.exList)return toast('Não foi possível abrir o treino. Tente de novo.');
 if(aid===S.me){delete e.cond;delete e.condNome;delete e.alunoNome}
 else{e.cond=S.me;e.condNome=ME()?.nome||'Personal';e.alunoNome=perfil(aid)?.nome||'aluno'}
 unlockAudio();S.active=e;S.view='treino';S.confirmEnd=false;S.eset=null;LS.set('ft4.active',e);andGrava(true);
 render();keepAwake();mediaMusc();window.scrollTo(0,0)}

/* Resumo ao vivo de um treino em andamento (para quem está só acompanhando). */
function andResumo(d){const e=andEstado(d);if(!e)return '';const L=e.exList||[],ex=L[e.idx]||L[0],now=Date.now();
 const n=ex?Math.min((e.ex?.[ex.id]?.sets.length||0)+1,ex.s):0;
 const desc=e.restEnd&&e.restEnd>now?`<span class="andtag">Descanso <b class="num andrest" data-end="${e.restEnd}">${mmss((e.restEnd-now)/1000)}</b></span>`:'';
 const pills=L.map((x,i)=>{const k=e.ex?.[x.id]?.sets.length||0,pk=!!e.skip?.[x.id]&&k<x.s;return `<i class="${pk?'skip':k>=x.s?'done':i===e.idx?'cur':k?'part':''}"></i>`}).join('');
 return `<div class="andres"><div class="row" style="gap:10px">${letter(e.letra,'s')}<div class="grow" style="min-width:0"><b>${esc(e.treinoNome||'Treino '+e.letra)}</b><div class="small muted">${d.feitos} de ${d.total} exercícios · <span class="num andclk" data-ini="${e.inicio}">${hms((now-e.inicio)/1000)}</span></div></div>${desc}</div>
 <div class="andbar">${pills}</div>${ex?`<div class="small">Agora: <b>${esc(ex.n)}</b> · série ${n} de ${ex.s}</div>`:''}</div>`}

/* Aluno: aviso em todas as telas quando o Personal está conduzindo o treino dele. */
function andBannerAluno(){const d=andDe(S.me);if(!d||d.controle===S.me||myActive())return '';
 return `<section class="panel andpanel"><div class="eyebrow">Treino em andamento</div><div><b>${esc(d.controleNome||'Seu Personal')} está conduzindo o seu treino.</b><div class="small muted">Você pode deixar o celular de lado. Tudo o que for marcado vai para o seu histórico.</div></div>${andResumo(d)}<button class="btn ghost" data-act="andassume" data-v="${S.me}">Retomar no meu celular</button></section>`}

/* Personal: bloco "Treinar junto" no topo da página do aluno. */
function treinarJunto(aid){const p=perfil(aid);if(!S.p||!p||p.personalId!==S.me)return '';
 const at=myActive(),d=andDe(aid);
 if(at&&at.alunoId===aid)return `<button class="banner" data-act="tab" data-v="treino"><span class="letter s" style="background:rgba(255,255,255,.22)">${esc(at.letra)}</span><span class="grow"><b>Você está conduzindo o treino</b><br><span class="small">Toque para voltar à sessão</span></span></button>`;
 if(d&&d.controle!==S.me)return `<section class="panel andpanel"><div class="row"><div class="eyebrow grow">Em treino agora</div><span class="livedot">Ao vivo</span></div><div class="small muted">${esc(p.nome)} está treinando${d.controle===aid?' pelo próprio celular':' com '+esc(d.controleNome||'outro celular')}. Ao assumir, o treino continua no seu celular de onde parou.</div>${andResumo(d)}<button class="btn primary" data-act="andassume" data-v="${aid}" ${at?'disabled':''}>Assumir e continuar</button>${at?'<div class="small muted">Encerre o treino aberto no seu celular para assumir este.</div>':''}</section>`;
 if(at)return '';
 const f=ativaDe(aid);
 if(!f)return `<section class="panel"><div class="eyebrow">Treinar junto · aluno livre do celular</div><div class="small muted">Defina uma ficha ativa para ${esc(p.nome)} e conduza o treino pelo seu celular.</div><button class="btn ghost" data-act="sub" data-v="fichas">Escolher ficha ativa</button></section>`;
 const ni=nextIdx0(f);
 const bt=f.treinos.map((t,i)=>t.tipo==='corrida'?'':`<button data-act="conduzir" data-a="${aid}" data-f="${f.id}" data-v="${t.id}" ${temConteudo(t)?'':'disabled'} ${i===ni?'class="on"':''}><b>${LETRAS[i]}</b><span>${esc(t.nome)}</span></button>`).join('');
 return `<section class="panel"><div class="eyebrow">Treinar junto · aluno livre do celular</div><div class="small muted">Conduza o treino pelo seu celular: marque as séries e controle o descanso. Tudo vai para o histórico de ${esc(p.nome)}. Próximo da sequência: treino ${LETRAS[ni]}.</div><div class="alt">${bt}</div></section>`}

/* Personal: atalho e selo no cartão do aluno, na lista. */
function andCardExtra(p){if(!S.p||p.personalId!==S.me)return {tag:'',btn:''};const d=andDe(p.id),at=myActive();
 const tag=d?`<span class="livedot">Em treino agora · ${esc(d.letra)} · ${d.feitos}/${d.total}</span>`:'';
 let btn='';
 if(at&&at.alunoId===p.id)btn=`<button class="qbtn on" data-act="tab" data-v="treino" aria-label="Voltar ao treino de ${esc(p.nome)}">▶</button>`;
 else if(d&&d.controle!==S.me&&!at)btn=`<button class="qbtn on" data-act="andassume" data-v="${p.id}" aria-label="Assumir o treino de ${esc(p.nome)}">▶</button>`;
 else if(!at&&!d){const f=ativaDe(p.id);if(f){const ni=nextIdx0(f),t=f.treinos[ni];if(t&&t.tipo!=='corrida'&&temConteudo(t))btn=`<button class="qbtn" data-act="conduzir" data-a="${p.id}" data-f="${f.id}" data-v="${t.id}" aria-label="Treinar junto: treino ${LETRAS[ni]} de ${esc(p.nome)}">▶</button>`}}
 return {tag,btn}}

document.addEventListener('click',e=>{const b=e.target.closest('[data-act="andassume"]');if(!b||b.disabled)return;andAssumir(b.dataset.v)});
/* Cartões clicáveis feitos com div (para poder ter botões dentro): Enter e espaço também abrem. */
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('[role="button"][data-act]')){e.preventDefault();e.target.click()}});
/* Relógios ao vivo de quem acompanha. */
setInterval(()=>{const now=Date.now();
 document.querySelectorAll('.andclk').forEach(el=>el.textContent=hms((now-+el.dataset.ini)/1000));
 document.querySelectorAll('.andrest').forEach(el=>{const s=(+el.dataset.end-now)/1000;el.textContent=s>0?mmss(s):'0:00'})},1000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&andT&&S.active)andGrava(false)});
