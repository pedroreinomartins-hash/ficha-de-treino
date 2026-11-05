/* Comunidades: grupos criados por aluno ou Personal, com entrada aprovada pelo criador,
   mural de textos curtos, check-in de treino, aviso fixado, ranking e desafios.
   Coleções: comunidades/{cid} (+ membros, posts, desafios/{did}/prog) e codigosCom/{codigo}.
   Ninguém lê os treinos de outra pessoa: cada membro publica só o próprio placar, e as regras
   do Firestore recusam números implausíveis (2 treinos/dia, 14/semana, km limitados). */
const COM_LIM={criadas:5,membros:100,texto:280,nome:40,desc:200,apelido:30};
const REACOES=['👏','🔥','💪'];
const DESAF={treinos:{n:'Número de treinos',u:'treinos'},km:{n:'Km de corrida',u:'km'},semanas:{n:'Semanas cumprindo a meta',u:'semanas'}};
const COM={uid:null,subs:{},cur:{key:null,un:[]},posts:[],membros:[],desafios:[],prog:{},dsubs:{},dlist:{},psubs:{}};

/* ---------- Treino válido e placar (calculado no celular de cada membro) ---------- */
const sessValida=s=>(s.dur||0)>=900&&(s.corrida?(+s.corrida.dist||0)>0:Object.values(s.ex||{}).some(r=>r.sets?.length));
function validas(desde,ate=Infinity){const ss=sessDe(S.me).filter(s=>s.inicio>=desde&&s.inicio<=ate&&sessValida(s)).sort((a,b)=>a.inicio-b.inicio);const dia={};
 return ss.filter(s=>{const k=new Date(s.inicio).toDateString();dia[k]=(dia[k]||0)+1;return dia[k]<=2})}
const km=s=>s.corrida?(+s.corrida.dist||0)/1000:0;
const mesKey=t=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)};
const mesIni=t=>{const d=new Date(t);return new Date(d.getFullYear(),d.getMonth(),1).getTime()};
const r1=v=>Math.round(v*10)/10;
function seqSemanas(desde){const meta=metaDe(ativaDe(S.me));const vs=validas(desde);const por={};vs.forEach(s=>{const w=weekStart(s.inicio);por[w]=(por[w]||0)+1});
 let w=weekStart(Date.now()),n=0;if((por[w]||0)>=meta)n++;w-=7*DAY;while((por[w]||0)>=meta&&n<520){n++;w-=7*DAY}return n}
function meuPlacar(zerado){const z=zerado||0,now=Date.now(),ws=weekStart(now),mi=mesIni(now);
 const sem=validas(Math.max(z,ws)),mes=validas(Math.max(z,mi));
 return {sem:ws,semN:Math.min(14,sem.length),mes:mesKey(now),mesN:Math.min(62,mes.length),kmSem:Math.min(300,r1(sem.reduce((a,s)=>a+km(s),0))),kmMes:Math.min(1000,r1(mes.reduce((a,s)=>a+km(s),0))),seq:seqSemanas(Math.max(z,now-200*7*DAY))}}
function progDesafio(d,zerado){const ini=Math.max(d.inicio,zerado||0),dias=(d.fim-d.inicio)/DAY+1;const vs=validas(ini,d.fim);
 if(d.tipo==='treinos')return Math.min(Math.floor(dias*2),vs.length);
 if(d.tipo==='km')return Math.min(Math.floor(dias*50),r1(vs.reduce((a,s)=>a+km(s),0)));
 const meta=metaDe(ativaDe(S.me)),por={};vs.forEach(s=>{const w=weekStart(s.inicio);por[w]=(por[w]||0)+1});return Math.min(Math.floor((d.fim-d.inicio)/(7*DAY))+1,Object.values(por).filter(n=>n>=meta).length)}
const placarSem=p=>p&&p.sem===weekStart(Date.now())?p.semN||0:0;
const placarMes=p=>p&&p.mes===mesKey(Date.now())?p.mesN||0:0;
const placarSeq=p=>p&&p.sem>=weekStart(Date.now())-7*DAY?p.seq||0:0;
const placarKm=p=>p&&p.mes===mesKey(Date.now())?p.kmMes||0:0;

/* ---------- Assinaturas: minhas comunidades e a comunidade aberta ---------- */
const comRef=cid=>fdb.collection('comunidades').doc(cid);
const ehCriador=cid=>S.coms[cid]?.c?.criadorId===S.me;
const ativo=cid=>S.coms[cid]?.m?.status==='ativo';
function comPararTudo(){Object.values(COM.subs).forEach(x=>x.forEach(f=>f()));COM.subs={};Object.values(COM.dsubs).forEach(f=>f());COM.dsubs={};COM.dlist={};Object.values(COM.psubs).forEach(x=>x.un());COM.psubs={};S.comPend={};comPararCur();S.coms={}}
function comPararCur(){COM.cur.un.forEach(f=>f());COM.cur={key:null,un:[]};COM.posts=[];COM.membros=[];COM.desafios=[];COM.prog={}}
function comWatch(){if(!fdb||!S.ready||!S.me||!ME()){if(COM.uid){comPararTudo();COM.uid=null}return}
 if(COM.uid!==S.me){comPararTudo();COM.uid=S.me}
 const ids=new Set(ME().comunidades||[]);
 for(const cid of Object.keys(COM.subs))if(!ids.has(cid)){COM.subs[cid].forEach(f=>f());if(COM.psubs[cid]){COM.psubs[cid].un();delete COM.psubs[cid]}delete COM.subs[cid];delete S.coms[cid];if(COM.dsubs[cid]){COM.dsubs[cid]();delete COM.dsubs[cid];delete COM.dlist[cid]}}
 for(const cid of ids)if(!COM.subs[cid]){S.coms[cid]=S.coms[cid]||{c:undefined,m:undefined};
  COM.subs[cid]=[comRef(cid).onSnapshot(d=>{S.coms[cid].c=d.exists?{...d.data(),id:cid}:null;if(!d.exists&&!d.metadata.fromCache)comLimpa(cid);comPendWatch(cid);soft()},()=>{S.coms[cid].c=null;soft()}),
   comRef(cid).collection('membros').doc(S.me).onSnapshot(d=>{S.coms[cid].m=d.exists?d.data():null;if(!d.exists&&!d.metadata.fromCache&&!S.coms[cid].criando)comLimpa(cid);comDesafiosWatch(cid);soft()},()=>{})]}
 const cur=S.view==='comunidade'&&S.com&&ativo(S.com)?S.com+'|'+(ehCriador(S.com)?'c':'m'):null;
 if(cur!==COM.cur.key){comPararCur();if(cur)comAbre(S.com)}
 comPlacarSync()}
/* Comunidade encerrada ou membro removido: tira da lista do perfil. */
function comLimpa(cid){const p=ME();if(!p||!(p.comunidades||[]).includes(cid))return;p.comunidades=p.comunidades.filter(x=>x!==cid);put('perfis',p);if(S.com===cid){S.com=null}}
function comAbre(cid){const r=comRef(cid),key=cid+'|'+(ehCriador(cid)?'c':'m');COM.cur.key=key;const U=COM.cur.un;
 U.push(r.collection('posts').orderBy('criado','desc').limit(60).onSnapshot(sn=>{COM.posts=sn.docs.map(d=>({...d.data(),id:d.id}));soft()},e=>console.warn('posts',e)));
 const mq=ehCriador(cid)?r.collection('membros'):r.collection('membros').where('status','==','ativo');
 U.push(mq.onSnapshot(sn=>{COM.membros=sn.docs.map(d=>({...d.data(),id:d.id}));soft()},e=>console.warn('membros',e)));
 U.push(r.collection('desafios').onSnapshot(sn=>{COM.desafios=sn.docs.map(d=>({...d.data(),id:d.id})).sort((a,b)=>b.inicio-a.inicio);
  const vivos=new Set(COM.desafios.map(d=>d.id));for(const did of Object.keys(COM.prog))if(!vivos.has(did))delete COM.prog[did];
  COM.desafios.forEach(d=>{if(COM.prog[d.id])return;COM.prog[d.id]={};U.push(r.collection('desafios').doc(d.id).collection('prog').onSnapshot(s2=>{const o={};s2.docs.forEach(x=>o[x.id]=x.data());COM.prog[d.id]=o;soft()},()=>{}))});soft()},e=>console.warn('desafios',e)))}
/* Pedidos pendentes nas comunidades que eu criei (para o aviso na lista). */
function comPendWatch(cid){const cri=ehCriador(cid),cur=COM.psubs[cid];if(cri&&cur)return;if(!cri){if(cur){cur.un();delete COM.psubs[cid];if(S.comPend)delete S.comPend[cid]}return}
 COM.psubs[cid]={un:comRef(cid).collection('membros').where('status','==','pendente').onSnapshot(sn=>{S.comPend=S.comPend||{};S.comPend[cid]=sn.size;soft()},()=>{})}}
/* Desafios em andamento de cada comunidade ativa, para manter o meu progresso em dia. */
function comDesafiosWatch(cid){if(!ativo(cid)||COM.dsubs[cid])return;
 COM.dsubs[cid]=comRef(cid).collection('desafios').where('fim','>=',Date.now()-2*DAY).onSnapshot(sn=>{COM.dlist[cid]=sn.docs.map(d=>({...d.data(),id:d.id}));comPlacarSync(true)},()=>{})}
let comSig='';
function comPlacarSync(forca){const sig=S.sessions.length+'|'+(S.sessions[0]?.id||'')+'|'+Object.keys(S.coms).map(c=>c+(S.coms[c].m?.status||'')+(S.coms[c].m?.zeradoEm||'')).join(',')+'|'+weekStart(Date.now());
 if(!forca&&sig===comSig)return;comSig=sig;const cache=LS.get('ft8.prog',{});
 for(const[cid,x]of Object.entries(S.coms)){if(x.m?.status!=='ativo')continue;const z=x.m.zeradoEm||0;
  const p=meuPlacar(z),old=x.m.placar||{};const {at,...o}=old;if(JSON.stringify(o)!==JSON.stringify(p))comRef(cid).collection('membros').doc(S.me).update({placar:{...p,at:Date.now()}}).catch(e=>console.warn('placar',e));
  (COM.dlist[cid]||[]).forEach(d=>{if(d.inicio>Date.now())return;const n=progDesafio(d,z),k=cid+'|'+d.id+'|'+z;if(cache[k]===n)return;
   comRef(cid).collection('desafios').doc(d.id).collection('prog').doc(S.me).set({n,nome:x.m.nome||ME().nome,at:Date.now()}).then(()=>{const c=LS.get('ft8.prog',{});c[k]=n;LS.set('ft8.prog',c)}).catch(e=>console.warn('prog',e))})}}
setInterval(comWatch,1500);

/* ---------- Ações ---------- */
function novoCodigoCom(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<6;i++)c+=A[Math.floor(Math.random()*A.length)];return c}
async function codigoLivre(){for(let i=0;i<8;i++){const c=novoCodigoCom();const d=await fdb.collection('codigosCom').doc(c).get();if(!d.exists)return c}throw new Error('Não foi possível gerar o código. Tente de novo.')}
function addMinha(cid){const p=ME();p.comunidades=[...new Set([...(p.comunidades||[]),cid])];return putNow('perfis',p)}
async function comCriar(F){const nome=F.nome.trim(),desc=(F.desc||'').trim(),apel=(F.apelido||'').trim()||ME().nome;
 if(nome.length<2)throw new Error('Dê um nome à comunidade (mínimo 2 letras).');
 if(Object.values(S.coms).filter(x=>x.c?.criadorId===S.me).length>=COM_LIM.criadas)throw new Error(`Você já criou ${COM_LIM.criadas} comunidades, o limite por pessoa.`);
 const cid=uid('c'),codigo=await codigoLivre(),now=Date.now();S.coms[cid]={criando:true};
 const b=fdb.batch();b.set(comRef(cid),{nome:nome.slice(0,COM_LIM.nome),desc:desc.slice(0,COM_LIM.desc),cor:F.cor||'azul',criadorId:S.me,criadorNome:ME().nome,codigo,criado:now,aviso:''});
 b.set(fdb.collection('codigosCom').doc(codigo),{cid});b.set(comRef(cid).collection('membros').doc(S.me),{uid:S.me,nome:apel.slice(0,COM_LIM.apelido),status:'ativo',pedido:now,entrou:now});
 await b.commit();await addMinha(cid);delete S.coms[cid].criando;return cid}
async function comBuscar(codigo){const c=codigo.trim().toUpperCase().replace(/[^A-Z0-9]/g,'');if(c.length<4)throw new Error('Digite o código da comunidade.');
 const d=await fdb.collection('codigosCom').doc(c).get();if(!d.exists)throw new Error('Código não encontrado. Confira com quem criou a comunidade.');
 const cid=d.data().cid,cd=await comRef(cid).get();if(!cd.exists)throw new Error('Esta comunidade foi encerrada.');
 let m=null;try{const md=await comRef(cid).collection('membros').doc(S.me).get();m=md.exists?md.data():null}catch(e){}
 return {cid,...cd.data(),meu:m}}
async function comPedir(cid,apelido){const nome=(apelido||'').trim()||ME().nome,ref=comRef(cid).collection('membros').doc(S.me),now=Date.now();
 let m=null;try{const md=await ref.get();m=md.exists?md.data():null}catch(e){}
 if(m?.status==='recusado')await ref.update({status:'pendente',nome:nome.slice(0,COM_LIM.apelido),pedido:now});
 else if(!m)await ref.set({uid:S.me,nome:nome.slice(0,COM_LIM.apelido),status:'pendente',pedido:now});
 await addMinha(cid)}
const membroRef=(cid,u)=>comRef(cid).collection('membros').doc(u);
async function comAprovar(cid,u){const n=COM.membros.filter(x=>x.status==='ativo').length;if(n>=COM_LIM.membros)throw new Error(`A comunidade já tem ${COM_LIM.membros} membros, o limite.`);await membroRef(cid,u).update({status:'ativo',entrou:Date.now()})}
async function comZerar(cid,u){await membroRef(cid,u).update({placar:{},zeradoEm:Date.now()});for(const d of COM.desafios)await comRef(cid).collection('desafios').doc(d.id).collection('prog').doc(u).delete().catch(()=>{})}
async function comRemoverMembro(cid,u){for(const d of COM.desafios)await comRef(cid).collection('desafios').doc(d.id).collection('prog').doc(u).delete().catch(()=>{});await membroRef(cid,u).delete()}
async function comSair(cid){const ds=COM.cur.key?.startsWith(cid)?COM.desafios:(COM.dlist[cid]||[]);for(const d of ds)await comRef(cid).collection('desafios').doc(d.id).collection('prog').doc(S.me).delete().catch(()=>{});
 await membroRef(cid,S.me).delete().catch(()=>{});const p=ME();p.comunidades=(p.comunidades||[]).filter(x=>x!==cid);await putNow('perfis',p);S.com=null}
async function comEncerrar(cid){const r=comRef(cid),c=S.coms[cid]?.c;
 const del=async q=>{const sn=await q.get();for(const d of sn.docs)await d.ref.delete()};
 await del(r.collection('posts'));for(const d of (await r.collection('desafios').get()).docs){await del(d.ref.collection('prog'));await d.ref.delete()}
 for(const d of (await r.collection('membros').get()).docs)if(d.id!==S.me)await d.ref.delete();
 if(c?.codigo)await fdb.collection('codigosCom').doc(c.codigo).delete().catch(()=>{});
 await membroRef(cid,S.me).delete();await r.delete();const p=ME();p.comunidades=(p.comunidades||[]).filter(x=>x!==cid);await putNow('perfis',p);S.com=null}
async function comNovoCodigo(cid){const c=S.coms[cid].c,novo=await codigoLivre();await fdb.collection('codigosCom').doc(novo).set({cid});await comRef(cid).update({codigo:novo});if(c.codigo)await fdb.collection('codigosCom').doc(c.codigo).delete().catch(()=>{})}
async function comPostar(cid,texto,tipo='texto'){const t=String(texto||'').trim().slice(0,COM_LIM.texto);if(!t)return;const m=S.coms[cid]?.m;
 await comRef(cid).collection('posts').doc(uid('p')).set({autorId:S.me,autorNome:m?.nome||ME().nome,texto:t,tipo,criado:Date.now(),reacoes:{}})}
async function comReagir(cid,post,e){const atual=post.reacoes?.[S.me];const ref=comRef(cid).collection('posts').doc(post.id);
 if(atual===e)await ref.update({['reacoes.'+S.me]:firebase.firestore.FieldValue.delete()});else await ref.update({['reacoes.'+S.me]:e})}
async function comDenunciar(cid,post,motivo){await fdb.collection('denuncias').doc(uid('d')).set({tipo:'post',comId:cid,comNome:S.coms[cid]?.c?.nome||'',postId:post.id,alvoId:post.autorId,alvoNome:post.autorNome,motivo,texto:post.texto,autorId:S.me,status:'aberta',criado:Date.now()})}
const diaIni=s=>{const d=dataLocal(s);return d?d.getTime():NaN};
async function comDesafioSalvar(cid,F){const titulo=(F.titulo||'').trim(),meta=parseFloat(String(F.meta).replace(',','.')),ini=diaIni(F.inicio),fim=diaIni(F.fim)+DAY-1;
 if(titulo.length<2)throw new Error('Dê um título ao desafio.');if(!(meta>0))throw new Error('Informe a meta do desafio.');
 if(!(ini>0)||!(fim>ini))throw new Error('Confira as datas: o fim precisa ser depois do início.');if(fim-ini>366*DAY)throw new Error('O desafio pode durar no máximo 1 ano.');
 await comRef(cid).collection('desafios').doc(F.id||uid('d')).set({titulo:titulo.slice(0,60),tipo:F.tipo,meta:Math.min(5000,meta),inicio:ini,fim,criado:Date.now()})}

/* ---------- Telas ---------- */
const corCom=c=>{const x=CORES[c?.cor]||CORES.azul;return document.documentElement.getAttribute('data-theme')==='dark'?x.escuro:x.claro};
const comIcone=(c,cls='')=>`<span class="comic ${cls}" style="background:${corCom(c)}">${esc(ini(c?.nome||'?'))}</span>`;
function tempo(t){const s=(Date.now()-t)/1000;if(s<60)return 'agora';if(s<3600)return Math.floor(s/60)+' min';if(s<86400)return Math.floor(s/3600)+' h';if(s<7*86400)return Math.floor(s/86400)+' d';return ddmm(t)}
function viewComunidades(){if(S.com&&S.coms[S.com])return viewComunidade(S.com);S.com=null;
 const lista=Object.entries(S.coms).filter(([,x])=>x.c&&x.m);const at=lista.filter(([,x])=>x.m.status==='ativo'),pend=lista.filter(([,x])=>x.m.status!=='ativo');
 const F=S.cf;const criar=F?.modo==='criar'?`<section class="form"><h3>Nova comunidade</h3>
  <div class="field"><label class="lbl" for="cf-nome">Nome</label><input id="cf-nome" class="txt" data-cf="nome" maxlength="${COM_LIM.nome}" value="${esc(F.nome||'')}" placeholder="Ex.: Turma das 7h"></div>
  <div class="field"><label class="lbl" for="cf-desc">Descrição (opcional)</label><textarea id="cf-desc" class="txt" data-cf="desc" maxlength="${COM_LIM.desc}" placeholder="Para quem é e como funciona">${esc(F.desc||'')}</textarea></div>
  <div class="field"><span class="lbl">Cor</span><div class="row" style="gap:8px;flex-wrap:wrap">${Object.entries(CORES).map(([k,x])=>`<button class="swatch ${(F.cor||'azul')===k?'on':''}" data-act="cfcor" data-v="${k}"><i style="background:${corCom({cor:k})}"></i>${x.n}</button>`).join('')}</div></div>
  <div class="field"><label class="lbl" for="cf-apel">Seu nome nesta comunidade</label><input id="cf-apel" class="txt" data-cf="apelido" maxlength="${COM_LIM.apelido}" value="${esc(F.apelido??ME().nome)}"></div>
  <div class="small muted">Você será o criador: aprova quem entra, fixa avisos, propõe desafios e modera o mural.</div>
  ${F.err?`<div class="note bad">${esc(F.err)}</div>`:''}<div class="nav2"><button class="btn ghost" data-act="cfno">Cancelar</button><button class="btn primary" data-act="cfcriar" ${F.busy?'disabled':''}>Criar</button></div></section>`
 :F?.modo==='entrar'?`<section class="form"><h3>Entrar com código</h3>${F.achada?`<div class="row">${comIcone(F.achada)}<div class="grow"><h3>${esc(F.achada.nome)}</h3><div class="small muted">Criada por ${esc(F.achada.criadorNome||'')}</div></div></div>${F.achada.desc?`<div class="small">${esc(F.achada.desc)}</div>`:''}
  ${F.achada.meu?.status==='ativo'?'<div class="note good">Você já participa desta comunidade.</div>':F.achada.meu?.status==='pendente'?'<div class="note warn">Seu pedido já foi enviado e aguarda aprovação.</div>':`
  <div class="field"><label class="lbl" for="cf-apel2">Seu nome nesta comunidade</label><input id="cf-apel2" class="txt" data-cf="apelido" maxlength="${COM_LIM.apelido}" value="${esc(F.apelido??ME().nome)}"></div>
  <div class="note info">Participando, seu nome, os treinos que você concluir e o seu progresso aparecem no ranking e nos desafios desta comunidade. Carga, dor, esforço e recados ao Personal nunca são compartilhados. Você pode sair quando quiser.</div>
  <label class="check"><input type="checkbox" data-cf="ok" ${F.ok?'checked':''}>Concordo em participar do ranking e dos desafios</label>`}`
  :`<div class="field"><label class="lbl" for="cf-cod">Código da comunidade</label><input id="cf-cod" class="txt" data-cf="codigo" value="${esc(F.codigo||'')}" placeholder="Ex.: K7M2QX" autocapitalize="characters" style="text-transform:uppercase;letter-spacing:.1em"></div>`}
  ${F.err?`<div class="note bad">${esc(F.err)}</div>`:''}<div class="nav2"><button class="btn ghost" data-act="cfno">Cancelar</button>${F.achada?(F.achada.meu?.status==='ativo'?`<button class="btn primary" data-act="comabrir" data-v="${F.achada.cid}">Abrir comunidade</button>`:F.achada.meu?.status==='pendente'?`<button class="btn primary" data-act="cfno">Fechar</button>`:`<button class="btn primary" data-act="cfpedir" ${F.busy?'disabled':''}>Pedir para entrar</button>`):`<button class="btn primary" data-act="cfbuscar" ${F.busy?'disabled':''}>Buscar</button>`}</div></section>`
 :`<div class="nav2"><button class="btn primary" data-act="cfopen" data-v="criar">+ Criar comunidade</button><button class="btn ghost" data-act="cfopen" data-v="entrar">Entrar com código</button></div>`;
 const card=([cid,x])=>{const pn=x.m.status==='ativo'&&x.c.criadorId===S.me?(S.comPend?.[cid]||0):0;return `<button class="panel stud" data-act="comabrir" data-v="${cid}"><div class="row">${comIcone(x.c)}<div class="grow"><h2>${esc(x.c.nome)}</h2><div class="small muted">${x.c.criadorId===S.me?'Você é o criador':'Criada por '+esc(x.c.criadorNome||'')}</div></div>${x.m.status==='pendente'?'<span class="chip">Aguardando aprovação</span>':x.m.status==='recusado'?'<span class="chip" style="color:var(--bad)">Pedido recusado</span>':`${pn?`<span class="chip" style="background:var(--accent);color:var(--on-accent)">${pn} pedido${pn>1?'s':''}</span>`:''}`}</div>${x.m.status==='ativo'?`<div class="small muted">${placarSem(x.m.placar)} treino${placarSem(x.m.placar)===1?'':'s'} seu${placarSem(x.m.placar)===1?'':'s'} nesta semana${x.c.aviso?' · 📌 '+esc(x.c.aviso.slice(0,60))+(x.c.aviso.length>60?'…':''):''}</div>`:''}</button>`};
 const pendCards=pend.map(([cid,x])=>`<section class="panel" style="gap:8px"><div class="row">${comIcone(x.c,'s')}<div class="grow"><b>${esc(x.c.nome)}</b><div class="small muted">${x.m.status==='pendente'?'Pedido enviado · aguardando aprovação do criador':'O criador recusou o pedido'}</div></div></div><button class="btn sm ghost" data-act="comcancelar" data-v="${cid}">${x.m.status==='pendente'?'Cancelar pedido':'Remover da lista'}</button></section>`).join('');
 return page('Treinar junto','Comunidades',`${criar}${at.map(card).join('')}${pendCards}${!lista.length&&!F?`<div class="empty">Crie uma comunidade para a sua turma ou peça o código para quem já criou. No mural, vocês trocam recados curtos e acompanham o ranking e os desafios.</div>`:''}`)}
function viewComunidade(cid){const x=S.coms[cid];if(!x?.c||!x?.m){S.com=null;return viewComunidades()}
 const c=x.c,cri=c.criadorId===S.me;
 if(x.m.status!=='ativo'){S.com=null;return viewComunidades()}
 const pend=cri?COM.membros.filter(m=>m.status==='pendente').length:0;
 const sub=S.csub||'mural';const st=`<div class="subtabs">${[['mural','Mural'],['ranking','Ranking'],['desafios','Desafios'],['membros','Membros'+(pend?`<i class="badge" aria-label="${pend} pedidos"></i>`:'')]].map(([k,l])=>`<button data-act="csub" data-v="${k}" class="${sub===k?'on':''}">${l}</button>`).join('')}</div>`;
 const body=sub==='ranking'?comRanking(cid):sub==='desafios'?comDesafios(cid):sub==='membros'?comMembros(cid):comMural(cid);
 return page(cri?'Você é o criador':'Comunidade',`${esc(c.nome)}`,`${st}${body}`,{back:'comunidade'})}
function comMural(cid){const c=S.coms[cid].c,cri=c.criadorId===S.me,A=S.cav;
 const aviso=A?`<section class="form"><h3>Aviso fixado</h3><textarea id="cav-txt" class="txt" maxlength="${COM_LIM.texto}" data-cav="1">${esc(A.t)}</textarea><div class="small muted"><span id="cav-n">${A.t.length}</span>/${COM_LIM.texto}</div><div class="nav2"><button class="btn ghost" data-act="cavno">Cancelar</button><button class="btn primary" data-act="cavok">Salvar aviso</button></div></section>`
  :c.aviso?`<section class="panel aviso"><div class="row" style="align-items:flex-start"><span style="font-size:18px">📌</span><div class="grow"><div class="eyebrow">Aviso do criador</div><div>${esc(c.aviso)}</div></div>${cri?'<button class="btn sm ghost" data-act="cavopen">Editar</button>':''}</div></section>`
  :cri?`<button class="btn sm ghost" style="align-self:flex-start" data-act="cavopen">📌 Fixar um aviso</button>`:'';
 const comp=`<section class="panel" style="gap:8px"><textarea id="post-txt" class="txt" maxlength="${COM_LIM.texto}" placeholder="Escreva um recado curto para a comunidade" data-post="1">${esc(S.postTxt||'')}</textarea><div class="row"><span class="small muted grow"><span id="post-n">${(S.postTxt||'').length}</span>/${COM_LIM.texto}</span><button class="btn sm primary" data-act="postar">Publicar</button></div></section>`;
 const posts=COM.posts.map(p=>{const meu=p.autorId===S.me,pode=meu||cri;const cont={};Object.values(p.reacoes||{}).forEach(e=>cont[e]=(cont[e]||0)+1);const mine=p.reacoes?.[S.me];
  const den=S.cden===p.id?`<div class="form" style="gap:8px"><b>Denunciar este recado</b><select id="cden-mot">${['Ofensa ou assédio','Conteúdo impróprio','Spam ou propaganda','Informação perigosa','Outro'].map(m=>`<option>${m}</option>`).join('')}</select><div class="small muted">A denúncia vai para a administração da plataforma. O autor não sabe quem denunciou.</div><div class="nav2"><button class="btn sm ghost" data-act="cdenno">Cancelar</button><button class="btn sm danger" data-act="cdenok" data-v="${p.id}">Enviar denúncia</button></div></div>`:'';
  const conf=S.cdel===p.id?`<div class="miniconf"><span class="grow">Apagar este recado?</span><button class="btn sm danger" data-act="cdelok" data-v="${p.id}">Apagar</button><button class="btn sm ghost" data-act="cdelno">Não</button></div>`:'';
  return `<div class="post ${p.tipo==='checkin'?'ck':''}"><span class="av s" style="background:${hcol(p.autorId)}">${esc(ini(p.autorNome))}</span><div class="grow" style="display:flex;flex-direction:column;gap:6px"><div class="small"><b>${esc(p.autorNome)}</b> <span class="muted">· ${tempo(p.criado)}</span></div>
   <div>${p.tipo==='checkin'?'🏋️ ':''}${esc(p.texto)}</div>
   <div class="row" style="gap:6px;flex-wrap:wrap">${REACOES.map(e=>`<button class="reac ${mine===e?'on':''}" data-act="reagir" data-v="${p.id}" data-e="${e}" aria-pressed="${mine===e}">${e}${cont[e]?` <b>${cont[e]}</b>`:''}</button>`).join('')}<span class="grow"></span>${pode?`<button class="lnk small" style="color:var(--muted)" data-act="cdel" data-v="${p.id}">Apagar</button>`:''}${meu?'':`<button class="lnk small" style="color:var(--muted)" data-act="cden" data-v="${p.id}">Denunciar</button>`}</div>${conf}${den}</div></div>`}).join('');
 return `${aviso}${comp}<section class="panel" style="gap:0">${posts||'<div class="empty">Nenhum recado ainda. Que tal começar?</div>'}</section>`}
function comRanking(cid){const rs=S.crk||'sem';const ms=COM.membros.filter(m=>m.status==='ativo');
 const val={sem:m=>placarSem(m.placar),mes:m=>placarMes(m.placar),seq:m=>placarSeq(m.placar),km:m=>placarKm(m.placar)}[rs];
 const un={sem:'treinos',mes:'treinos',seq:'semanas',km:'km'}[rs];const temKm=ms.some(m=>placarKm(m.placar)>0);
 const ord=[...ms].sort((a,b)=>val(b)-val(a)||a.nome.localeCompare(b.nome,'pt'));let pos=0,ant=null;
 const linhas=ord.map((m,i)=>{const v=val(m);if(v!==ant){pos=i+1;ant=v}const med=v>0&&pos<=3?['🥇','🥈','🥉'][pos-1]:pos+'º';
  return `<div class="item ${m.id===S.me?'eu':''}"><span class="pos">${med}</span><span class="av s" style="background:${hcol(m.id)}">${esc(ini(m.nome))}</span><b class="grow">${esc(m.nome)}${m.id===S.me?' <span class="small muted">(você)</span>':''}</b><b class="num" style="font-size:22px">${rs==='km'?fmtKg(v):v}</b><span class="small muted" style="width:56px">${un}</span></div>`}).join('');
 const tabs=[['sem','Semana'],['mes','Mês'],['seq','Constância']].concat(temKm?[['km','Km no mês']]:[]);
 return `<div class="seg" style="grid-template-columns:repeat(${tabs.length},1fr)">${tabs.map(([k,l])=>`<button data-act="crk" data-v="${k}" class="${rs===k?'on':''}">${l}</button>`).join('')}</div>
 <div class="small muted">${{sem:'Treinos concluídos nesta semana (segunda a domingo).',mes:'Treinos concluídos neste mês.',seq:'Semanas seguidas cumprindo a meta da própria ficha.',km:'Quilômetros de corrida neste mês.'}[rs]} Contam treinos de pelo menos 15 minutos com alguma série registrada, até 2 por dia. Carga não entra no ranking.</div>
 <section class="panel" style="gap:0">${linhas||'<div class="empty">Ainda sem membros ativos.</div>'}</section>`}
function comDesafios(cid){const cri=ehCriador(cid),F=S.dsf,now=Date.now();
 const form=F?`<section class="form"><h3>${F.id?'Editar desafio':'Novo desafio'}</h3>
  <div class="field"><label class="lbl" for="dsf-t">Título</label><input id="dsf-t" class="txt" data-dsf="titulo" maxlength="60" value="${esc(F.titulo||'')}" placeholder="Ex.: 12 treinos em novembro"></div>
  <div class="field"><span class="lbl">Tipo</span><div class="seg">${Object.entries(DESAF).map(([k,x])=>`<button data-act="dsftipo" data-v="${k}" class="${F.tipo===k?'on':''}">${x.n}</button>`).join('')}</div></div>
  <div class="grid3" style="grid-template-columns:1fr 1fr 1fr"><div class="field"><label class="lbl" for="dsf-m">Meta (${DESAF[F.tipo].u})</label><input id="dsf-m" class="txt" data-dsf="meta" inputmode="decimal" value="${esc(F.meta||'')}"></div><div class="field"><label class="lbl" for="dsf-i">Início</label><input id="dsf-i" class="txt" type="date" data-dsf="inicio" value="${esc(F.inicio||'')}"></div><div class="field"><label class="lbl" for="dsf-f">Fim</label><input id="dsf-f" class="txt" type="date" data-dsf="fim" value="${esc(F.fim||'')}"></div></div>
  ${F.tipo==='semanas'?'<div class="small muted">Conta as semanas em que cada membro cumpre a meta semanal da própria ficha.</div>':''}
  ${F.err?`<div class="note bad">${esc(F.err)}</div>`:''}<div class="nav2"><button class="btn ghost" data-act="dsfno">Cancelar</button><button class="btn primary" data-act="dsfok">${F.id?'Salvar':'Lançar desafio'}</button></div></section>`
  :cri?`<button class="btn primary" data-act="dsfopen">+ Novo desafio</button>`:'';
 const ms=new Map(COM.membros.filter(m=>m.status==='ativo').map(m=>[m.id,m]));
 const card=d=>{const pr=COM.prog[d.id]||{};const st=d.inicio>now?'Começa em '+ddmm(d.inicio):d.fim<now?'Encerrado em '+ddmm(d.fim):'Termina em '+ddmm(d.fim);
  const lin=[...ms.values()].map(m=>({m,n:+pr[m.id]?.n||0})).sort((a,b)=>b.n-a.n);const okN=lin.filter(l=>l.n>=d.meta).length;
  const conf=S.cdelD===d.id?`<div class="miniconf"><span class="grow">Excluir o desafio?</span><button class="btn sm danger" data-act="dsfdelok" data-v="${d.id}">Excluir</button><button class="btn sm ghost" data-act="dsfdelno">Não</button></div>`:'';
  return `<section class="panel"><div class="row" style="align-items:flex-start"><div class="grow"><div class="eyebrow">${esc(DESAF[d.tipo]?.n||'')} · ${st}</div><h2>${esc(d.titulo)}</h2><div class="small muted">Meta: ${fmtKg(d.meta)} ${DESAF[d.tipo]?.u||''} · ${ddmm(d.inicio)} a ${ddmm(d.fim)} · ${okN} concluíram</div></div>${cri?`<button class="ib" data-act="dsfedit" data-v="${d.id}" aria-label="Editar">✎</button><button class="ib del" data-act="dsfdel" data-v="${d.id}" aria-label="Excluir">✕</button>`:''}</div>${conf}
   <div class="list">${lin.map(({m,n})=>{const pc=Math.min(100,n/d.meta*100);return `<div class="dsl ${m.id===S.me?'eu':''}"><div class="row"><span class="grow small"><b>${esc(m.nome)}</b>${m.id===S.me?' (você)':''}</span><span class="small num">${fmtKg(n)} / ${fmtKg(d.meta)}${n>=d.meta?' 🏅':''}</span></div><div class="meter"><i style="width:${pc}%;${n>=d.meta?'':'background:var(--accent)'}"></i></div></div>`}).join('')}</div></section>`};
 const ativos=COM.desafios.filter(d=>d.fim>=now),fim=COM.desafios.filter(d=>d.fim<now);
 return `${form}${ativos.map(card).join('')||(F?'':`<div class="empty">${cri?'Lance um desafio para a comunidade: número de treinos, km de corrida ou semanas cumprindo a meta.':'Nenhum desafio em andamento. Quem cria os desafios é o criador da comunidade.'}</div>`)}${fim.length?`<div class="eyebrow">Encerrados</div>${fim.map(card).join('')}`:''}`}
function comMembros(cid){const x=S.coms[cid],c=x.c,cri=c.criadorId===S.me,C=S.conf;
 const pend=cri?COM.membros.filter(m=>m.status==='pendente'):[],at=COM.membros.filter(m=>m.status==='ativo').sort((a,b)=>(a.id===c.criadorId?-1:b.id===c.criadorId?1:a.nome.localeCompare(b.nome,'pt')));
 const conv=cri?`<section class="panel" style="gap:6px"><div class="eyebrow">Código de convite</div><div class="row"><b class="num grow" style="font-size:32px;letter-spacing:.1em">${esc(c.codigo)}</b><button class="btn sm ghost" data-act="copycode" data-v="${esc(c.codigo)}">Copiar</button></div><div class="small muted">Quem tiver o código pede para entrar, e você aprova aqui. Se o código vazar, gere outro.</div><button class="btn sm ghost" style="align-self:flex-start" data-act="cnovocod">Gerar novo código</button></section>`:'';
 const pd=pend.length?`<section class="panel" style="gap:8px;border-color:var(--accent)"><div class="eyebrow">Pedidos para entrar · ${pend.length}</div>${pend.map(m=>`<div class="item"><span class="av s" style="background:${hcol(m.id)}">${esc(ini(m.nome))}</span><div class="grow"><b>${esc(m.nome)}</b><div class="small muted">pediu em ${ddmm(m.pedido||Date.now())}</div></div><button class="btn sm ghost" data-act="crecusar" data-v="${m.id}">Recusar</button><button class="btn sm primary" data-act="caprovar" data-v="${m.id}">Aprovar</button></div>`).join('')}</section>`:'';
 const lin=at.map(m=>{const k='cm:'+m.id;const acts=cri&&m.id!==S.me?(C===k+':z'?`<div class="miniconf"><span class="grow">Zerar o placar de ${esc(m.nome)}? Ranking e desafios recomeçam a contar a partir de agora.</span><button class="btn sm danger" data-act="czerar" data-v="${m.id}">Zerar</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`:C===k+':r'?`<div class="miniconf"><span class="grow">Remover ${esc(m.nome)} da comunidade?</span><button class="btn sm danger" data-act="cremover" data-v="${m.id}">Remover</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`:`<div class="row" style="gap:6px"><button class="btn sm ghost" data-act="conf" data-v="${k}:z">Zerar placar</button><button class="btn sm ghost" style="color:var(--bad)" data-act="conf" data-v="${k}:r">Remover</button></div>`):'';
  return `<div class="item" style="flex-wrap:wrap"><span class="av s" style="background:${hcol(m.id)}">${esc(ini(m.nome))}</span><div class="grow"><b>${esc(m.nome)}</b>${m.id===c.criadorId?' <span class="chip on">Criador</span>':''}${m.id===S.me?' <span class="small muted">(você)</span>':''}<div class="small muted">${placarSem(m.placar)} treinos na semana${m.zeradoEm?' · placar zerado em '+ddmm(m.zeradoEm):''}</div></div>${acts?`<div style="width:100%">${acts}</div>`:''}</div>`}).join('');
 const outros=at.filter(m=>m.id!==S.me);
 const meu=`<section class="panel" style="gap:10px"><div class="eyebrow">Sua participação</div><div class="field"><label class="lbl" for="cm-apel">Seu nome nesta comunidade</label><input id="cm-apel" class="txt" maxlength="${COM_LIM.apelido}" data-ch="comapel" value="${esc(x.m.nome||'')}"></div>
  ${cri?`${outros.length?`<div class="field"><label class="lbl" for="ctr-sel">Passar a comunidade para outro membro</label><select id="ctr-sel"><option value="">Escolha um membro</option>${outros.map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('')}</select><button class="btn sm ghost" style="align-self:flex-start" data-act="ctransf">Passar comunidade</button><div class="small muted">O novo criador passa a aprovar pedidos, fixar avisos e propor desafios. Depois disso você pode sair.</div></div>`:''}
   ${C==='cenc'?`<div class="miniconf"><span class="grow">Encerrar “${esc(c.nome)}”? Mural, ranking e desafios serão apagados para todos.</span><button class="btn sm danger" data-act="cencok">Encerrar</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`:`<button class="btn danger" data-act="conf" data-v="cenc">Encerrar comunidade</button>`}`
  :C==='csair'?`<div class="miniconf"><span class="grow">Sair de “${esc(c.nome)}”? Você some do ranking e dos desafios.</span><button class="btn sm danger" data-act="csairok">Sair</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`:`<button class="btn danger" data-act="conf" data-v="csair">Sair da comunidade</button>`}</section>`;
 return `${conv}${pd}<section class="panel" style="gap:0"><div class="eyebrow" style="padding-bottom:6px">${at.length} membro${at.length===1?'':'s'}</div>${lin}</section>${meu}`}

/* Check-in no fim do treino (aparece no painel "Como foi o treino?"). */
function checkinBox(s){if(s.conduzidoPor)return '';const at=Object.entries(S.coms).filter(([,x])=>x.m?.status==='ativo'&&x.c);if(!at.length)return '';
 const on=LS.get('ft8.checkin',false);return `<label class="check"><input type="checkbox" id="ck-com" ${on?'checked':''}>Compartilhar na comunidade: ${at.map(([,x])=>esc(x.c.nome)).join(', ')}</label><div class="small muted" style="margin-top:-6px">Vai só “concluiu o treino ${esc(s.letra)} · ${Math.round(s.dur/60)} min”. Esforço e recado ficam só com o seu Personal.</div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="fbsave"],[data-act="fbskip"]');if(!b)return;const ck=$('#ck-com');if(!ck)return;LS.set('ft8.checkin',ck.checked);if(!ck.checked)return;
 const s=S.sessions.find(x=>x.id===S.fb);if(!s)return;const txt=`concluiu o treino ${s.letra}${s.treinoNome?' ('+s.treinoNome+')':''} · ${Math.round(s.dur/60)} min`;
 Object.entries(S.coms).filter(([,x])=>x.m?.status==='ativo'&&x.c).forEach(([cid])=>comPostar(cid,txt,'checkin').catch(err=>console.warn('checkin',err)));setTimeout(()=>toast('Treino compartilhado na comunidade.'),400)},true);

/* ---------- Eventos ---------- */
const comRun=(p,ok,msg)=>p.then(()=>{ok&&ok();if(msg)toast(msg);render()}).catch(err=>{console.warn(err);toast(err?.message?.startsWith?.('Missing')||err?.code==='permission-denied'?'Ação não permitida.':(err.message||'Não foi possível concluir.'))});
document.addEventListener('input',e=>{const el=e.target;
 if(el.dataset.cf&&S.cf)S.cf[el.dataset.cf]=el.type==='checkbox'?el.checked:el.value;
 if(el.dataset.dsf&&S.dsf)S.dsf[el.dataset.dsf]=el.value;
 if(el.dataset.post){S.postTxt=el.value;const n=$('#post-n');if(n)n.textContent=el.value.length}
 if(el.dataset.cav&&S.cav){S.cav.t=el.value;const n=$('#cav-n');if(n)n.textContent=el.value.length}});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset.cf&&el.type==='checkbox'&&S.cf)S.cf[el.dataset.cf]=el.checked;
 if(el.dataset.ch==='comapel'&&S.com){const v=el.value.trim().slice(0,COM_LIM.apelido);if(v)comRun(membroRef(S.com,S.me).update({nome:v}),null,'Nome atualizado.')}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const v=b.dataset.v,cid=S.com;
 switch(b.dataset.act){
  case 'cfopen':S.cf={modo:v,cor:'azul'};render();setTimeout(()=>$(v==='criar'?'#cf-nome':'#cf-cod')?.focus(),0);break;
  case 'cfno':S.cf=null;render();break;
  case 'cfcor':S.cf.cor=v;render();break;
  case 'cfcriar':{const F=S.cf;F.err='';F.busy=true;render();comCriar(F).then(id=>{S.cf=null;S.com=id;S.csub='membros';render();toast('Comunidade criada. Compartilhe o código de convite.')}).catch(err=>{F.busy=false;F.err=err.message;render()});break}
  case 'cfbuscar':{const F=S.cf;F.err='';F.busy=true;render();comBuscar(F.codigo||'').then(a=>{F.busy=false;F.achada=a;render()}).catch(err=>{F.busy=false;F.err=err.message;render()});break}
  case 'cfpedir':{const F=S.cf;if(!F.ok){F.err='Para entrar, marque que concorda em participar do ranking e dos desafios.';render();break}F.busy=true;F.err='';render();
   comPedir(F.achada.cid,F.apelido).then(()=>{S.cf=null;render();toast('Pedido enviado. Você entra assim que o criador aprovar.')}).catch(err=>{F.busy=false;F.err=err.message;render()});break}
  case 'comabrir':S.cf=null;S.com=v;S.csub='mural';S.conf=null;render();window.scrollTo(0,0);break;
  case 'comcancelar':comRun(comSair(v));break;
  case 'csub':S.csub=v;S.conf=null;S.dsf=null;S.cden=null;S.cdel=null;render();break;
  case 'crk':S.crk=v;render();break;
  case 'postar':{const t=($('#post-txt')?.value||'').trim();if(!t)break;comRun(comPostar(cid,t),()=>{S.postTxt=''});break}
  case 'reagir':{const p=COM.posts.find(x=>x.id===v);if(p)comRun(comReagir(cid,p,b.dataset.e));break}
  case 'cdel':S.cdel=v;S.cden=null;render();break;
  case 'cdelno':S.cdel=null;render();break;
  case 'cdelok':comRun(comRef(cid).collection('posts').doc(v).delete(),()=>{S.cdel=null});break;
  case 'cden':S.cden=v;S.cdel=null;render();break;
  case 'cdenno':S.cden=null;render();break;
  case 'cdenok':{const p=COM.posts.find(x=>x.id===v);if(p)comRun(comDenunciar(cid,p,$('#cden-mot')?.value||'Outro'),()=>{S.cden=null},'Denúncia enviada à administração.');break}
  case 'cavopen':S.cav={t:S.coms[cid]?.c?.aviso||''};render();break;
  case 'cavno':S.cav=null;render();break;
  case 'cavok':comRun(comRef(cid).update({aviso:(S.cav.t||'').trim().slice(0,COM_LIM.texto),avisoEm:Date.now()}),()=>{S.cav=null},'Aviso atualizado.');break;
  case 'caprovar':comRun(comAprovar(cid,v),null,'Membro aprovado.');break;
  case 'crecusar':comRun(membroRef(cid,v).update({status:'recusado'}),null,'Pedido recusado.');break;
  case 'czerar':comRun(comZerar(cid,v),()=>{S.conf=null},'Placar zerado.');break;
  case 'cremover':comRun(comRemoverMembro(cid,v),()=>{S.conf=null},'Membro removido.');break;
  case 'cnovocod':comRun(comNovoCodigo(cid),null,'Novo código gerado. O anterior deixou de valer.');break;
  case 'ctransf':{const u=$('#ctr-sel')?.value;if(!u){toast('Escolha o membro.');break}const m=COM.membros.find(x=>x.id===u);comRun(comRef(cid).update({criadorId:u,criadorNome:m?.nome||''}),null,'Comunidade passada para '+(m?.nome||'o novo criador')+'.');break}
  case 'cencok':comRun(comEncerrar(cid),()=>{S.conf=null},'Comunidade encerrada.');break;
  case 'csairok':comRun(comSair(cid),()=>{S.conf=null},'Você saiu da comunidade.');break;
  case 'dsfopen':{const h=new Date();S.dsf={tipo:'treinos',meta:'12',inicio:isoData(h),fim:isoData(new Date(h.getTime()+27*DAY))};render();break}
  case 'dsfedit':{const d=COM.desafios.find(x=>x.id===v);if(d)S.dsf={id:d.id,titulo:d.titulo,tipo:d.tipo,meta:String(d.meta),inicio:isoData(new Date(d.inicio)),fim:isoData(new Date(d.fim))};render();break}
  case 'dsftipo':S.dsf.tipo=v;render();break;
  case 'dsfno':S.dsf=null;render();break;
  case 'dsfok':{const F=S.dsf;F.err='';comDesafioSalvar(cid,F).then(()=>{S.dsf=null;render();toast('Desafio publicado.')}).catch(err=>{F.err=err.code==='permission-denied'?'Ação não permitida.':err.message;render()});break}
  case 'dsfdel':S.cdelD=v;render();break;
  case 'dsfdelno':S.cdelD=null;render();break;
  case 'dsfdelok':comRun((async()=>{const r=comRef(cid).collection('desafios').doc(v);for(const d of (await r.collection('prog').get()).docs)await d.ref.delete();await r.delete()})(),()=>{S.cdelD=null},'Desafio excluído.');break;
 }});
