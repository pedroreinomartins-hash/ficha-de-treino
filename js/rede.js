/* Rede: vínculo aluno–Personal com aceite, termos/consentimento, perfil público do Personal,
   academias e busca. Carregado antes de app.js; só define funções e trata cliques próprios. */
const TERMOS_V='2026-11';
const CONSENT='Autorizo este Personal a acessar minhas fichas, treinos, cargas, frequência, recados, registros de dor e esforço e medidas corporais, para acompanhar meu treinamento. Posso encerrar o acompanhamento a qualquer momento em Meu perfil.';
const ESPEC=['Hipertrofia','Emagrecimento','Reabilitação e lesões','Iniciantes','Idosos','Gestantes','Força','Funcional','Mobilidade','Corrida','Condicionamento'];
const UFS='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const MODS={presencial:'Presencial',online:'Online',ambos:'Presencial e online'};
const emailMe=()=>(fbAuth?.currentUser?.email||'').toLowerCase();
const verificado=()=>!!fbAuth?.currentUser?.emailVerified;
const vincs=()=>S.vinculos||[];
const pub=pid=>(S.pubs||[]).find(x=>x.id===pid)||(S.personais||[]).find(x=>x.id===pid)||(pid===S.me&&S.pdoc?{...S.pdoc,id:S.me}:null);
const acad=id=>(S.academias||[]).find(a=>a.id===id);
async function upd(c,id,patch){const o=(S[c]||[]).find(x=>x.id===id);if(o)Object.assign(o,patch);await fdb.collection(c).doc(id).update(patch)}
async function setDoc(c,o){const arr=S[c]||(S[c]=[]);const i=arr.findIndex(x=>x.id===o.id);if(i>=0)arr[i]=o;else arr.unshift(o);await fdb.collection(c).doc(o.id).set(clone(o))}
const crefTxt=x=>x?.cref?'CREF '+x.cref:'';
function selo(x){if(!x?.cref)return '';return `<span class="selo${x.crefVerificado?' ok':''}" title="${x.crefVerificado?'CREF conferido pela plataforma':'CREF informado pelo profissional'}">${x.crefVerificado?'✓ ':''}${esc(crefTxt(x))}</span>`}
const errMsg=e=>e?.code==='permission-denied'?'Operação não permitida. Recarregue o app e tente de novo.':(e?.message||String(e));

/* ---------- Vínculo: lado do aluno ---------- */
async function solicitar(pid,via){
 if(pid===S.me)throw new Error('Você não pode solicitar acompanhamento a si mesmo.');
 const ja=vincs().find(v=>v.alunoId===S.me&&v.personalId===pid&&v.iniciadoPor!=='gestor');
 if(ME()?.personalId===pid)throw new Error('Este já é o seu Personal.');
 if(ja&&ja.status==='pendente')throw new Error('Já existe uma solicitação pendente com este Personal.');
 const p=pub(pid)||{};
 const base={alunoId:S.me,alunoEmail:emailMe(),alunoNome:ME().nome,personalId:pid,personalNome:p.nome||nomeP(pid)||'Personal',status:'pendente',iniciadoPor:'aluno',criado:Date.now(),respondido:null,via};
 if(ja&&ja.status!=='ativo')await setDoc('vinculos',{...ja,...base});else await setDoc('vinculos',{id:uid('v'),...base});
 return base.personalNome}
async function vincular(code){code=String(code||'').trim().toUpperCase();if(!code)throw new Error('Informe o código do Personal.');
 let c;try{c=await fdb.collection('convites').doc(code).get()}catch(e){throw new Error('Não foi possível verificar o código. Confira a conexão.')}
 if(!c.exists)throw new Error('Código não encontrado. Confira com o seu Personal.');
 return solicitar(c.data().personalId,'codigo')}
async function aplicarVinculo(vid,pid){const p=ME();p.personalId=pid;p.vinculoId=vid;p.convite='';await putNow('perfis',p);restamp(S.me)}
async function alunoAceita(v){
 const outros=vincs().filter(x=>x.alunoId===S.me&&x.status==='ativo'&&x.id!==v.id);
 await setDoc('vinculos',{...v,alunoId:S.me,alunoNome:ME().nome,alunoEmail:emailMe(),status:'ativo',respondido:Date.now(),consentimento:{versao:TERMOS_V,em:Date.now(),texto:CONSENT}});
 for(const o of outros)await upd('vinculos',o.id,{status:'encerrado',encerrado:Date.now(),encerradoPor:'aluno'});
 await aplicarVinculo(v.id,v.personalId)}
async function alunoEncerra(){const p=ME();const v=vincs().find(x=>x.id===p.vinculoId)||vincs().find(x=>x.alunoId===S.me&&x.status==='ativo');
 if(v&&v.status==='ativo')await upd('vinculos',v.id,{status:'encerrado',encerrado:Date.now(),encerradoPor:'aluno'});
 p.personalId='';p.vinculoId='';p.convite='';await putNow('perfis',p);restamp(S.me)}
async function desvincular(){return alunoEncerra()}
let syncing=false;
async function syncVinculo(){if(syncing||!fdb)return;const p=ME();if(!p||!p.aceite)return;syncing=true;
 try{const ativos=vincs().filter(v=>v.alunoId===S.me&&v.status==='ativo').sort((a,b)=>(b.respondido||0)-(a.respondido||0));const v=ativos[0];
  if(v&&(p.personalId!==v.personalId||p.vinculoId!==v.id)){
   if(!S.g||!p.personalId||p.vinculoId){for(const o of ativos.slice(1))await upd('vinculos',o.id,{status:'encerrado',encerrado:Date.now(),encerradoPor:'aluno'});
    await aplicarVinculo(v.id,v.personalId);toast(v.personalNome+' agora acompanha seus treinos.')}}
  else if(!v&&p.personalId&&p.vinculoId){const cur=vincs().find(x=>x.id===p.vinculoId);if(cur&&cur.status!=='ativo'){p.personalId='';p.vinculoId='';await putNow('perfis',p);restamp(S.me)}}
 }catch(e){console.warn('sync vinculo',e)}syncing=false;soft()}

/* ---------- Vínculo: lado do Personal e do gestor ---------- */
async function convidarEmail(email,nome){email=String(email||'').trim().toLowerCase();
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))throw new Error('Informe um e-mail válido.');
 if(vincs().some(v=>v.personalId===S.me&&v.status==='pendente'&&v.alunoEmail===email))throw new Error('Já existe um convite pendente para este e-mail.');
 await setDoc('vinculos',{id:uid('v'),alunoId:'',alunoEmail:email,alunoNome:(nome||'').trim()||email,personalId:S.me,personalNome:ME().nome,status:'pendente',iniciadoPor:'personal',criado:Date.now(),respondido:null,via:'email'})}
async function personalEncerra(aid){
 const fs=fichasDe(aid).filter(f=>f.personalId===S.me),ss=sessDe(aid).filter(s=>s.personalId===S.me);
 for(const v of vincs().filter(x=>x.alunoId===aid&&x.personalId===S.me&&x.status==='ativo'))await upd('vinculos',v.id,{status:'encerrado',encerrado:Date.now(),encerradoPor:'personal'});
 if(perfil(aid)?.personalId===S.me){await fdb.collection('perfis').doc(aid).update({personalId:'',convite:'',vinculoId:''});
  await Promise.all([...fs.map(f=>fdb.collection('fichas').doc(f.id).update({personalId:''})),...ss.map(s=>fdb.collection('sessions').doc(s.id).update({personalId:''}))])}}
async function transferir(aid,pid){const p=perfil(aid);if(!p)return;
 for(const v of vincs().filter(x=>x.alunoId===aid&&x.status==='ativo'))await upd('vinculos',v.id,{status:'encerrado',encerrado:Date.now(),encerradoPor:'gestor'});
 let vid='';if(pid){vid=uid('v');await setDoc('vinculos',{id:vid,alunoId:aid,alunoEmail:(p.email||'').toLowerCase(),alunoNome:p.nome,personalId:pid,personalNome:nomeP(pid)||'Personal',status:'ativo',iniciadoPor:'gestor',criado:Date.now(),respondido:Date.now(),via:'gestor'})}
 p.personalId=pid;p.vinculoId=vid;p.convite='';put('perfis',p);restamp(aid)}
async function criarAlunoPeloPersonal(nome,email,senha){
 const app2=firebase.apps.find(a=>a.name==='cadastro')||firebase.initializeApp(CFG,'cadastro');
 const cred=await app2.auth().createUserWithEmailAndPassword(email,senha);const id=cred.user.uid;try{await cred.user.sendEmailVerification()}catch(e){}await app2.auth().signOut();
 const p={id,nome,email,papel:'aluno',personalId:'',ativo:true,ativa:null,criado:Date.now()};await setDoc('perfis',p);
 if(S.p)await setDoc('vinculos',{id:uid('v'),alunoId:id,alunoEmail:email.toLowerCase(),alunoNome:nome,personalId:S.me,personalNome:ME().nome,status:'pendente',iniciadoPor:'personal',criado:Date.now(),respondido:null,via:'cadastro'});
 return p}

/* ---------- Telas: aceite de termos ---------- */
function viewTermos(){return `<main class="wrap" style="max-width:520px"><header style="padding-top:6vh"><div class="eyebrow">Antes de começar</div><h1>Termos e privacidade</h1></header>
 <section class="panel"><p style="margin:0">Para usar o app, leia e aceite os documentos abaixo. Em resumo:</p>
 <ul class="small" style="margin:0;padding-left:18px;display:grid;gap:6px"><li>Seus treinos e registros de dor e esforço são <b>dados de saúde</b> e ficam visíveis só para você e para o Personal que <b>você autorizar</b>.</li><li>Você pode encerrar o acompanhamento de um Personal e excluir sua conta quando quiser.</li><li>Alunos não aparecem em buscas.</li></ul>
 <div class="row" style="gap:16px;flex-wrap:wrap"><a href="termos.html" target="_blank" rel="noopener">Termos de Uso</a><a href="privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a></div>
 <label class="check"><input type="checkbox" id="tm-ok">Li e aceito os Termos de Uso e a Política de Privacidade.</label>
 ${S.tmErr?`<div class="note bad">${esc(S.tmErr)}</div>`:''}<button class="btn primary big" data-act="tmok">Aceitar e continuar</button><button class="btn ghost" data-act="logout">Sair</button></section></main>`}

/* ---------- Telas: Meu perfil ---------- */
function verifBox(){const u=fbAuth?.currentUser;if(!u||u.emailVerified)return '';
 return `<div class="note warn">Confirme seu e-mail para receber convites de Personais enviados para ${esc(u.email)}. <span class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn sm ghost" data-act="vfsend">Reenviar confirmação</button><button class="btn sm ghost" data-act="vfok">Já confirmei</button></span></div>`}
function convitesRecebidos(){return vincs().filter(v=>v.status==='pendente'&&v.iniciadoPor==='personal'&&(v.alunoId===S.me||(!v.alunoId&&v.alunoEmail===emailMe())))}
function cardConvite(v){const x=pub(v.personalId)||{nome:v.personalNome};const ck='cs-'+v.id;
 return `<div class="form" style="gap:10px"><div class="row">${avatar({id:v.personalId,nome:v.personalNome,papel:'aluno'},'s')}<div class="grow"><b>${esc(v.personalNome)}</b> quer acompanhar seus treinos ${selo(x)}</div></div>
 <div class="small muted">${esc(CONSENT)}</div><label class="check"><input type="checkbox" id="${ck}">Li e autorizo</label>
 <div class="nav2"><button class="btn ghost" data-act="vrec" data-v="${v.id}">Recusar</button><button class="btn primary" data-act="vace" data-v="${v.id}">Aceitar</button></div></div>`}
function meuPersonalBox(){const p=ME()||{};const P=S.pf||{};const C=S.conf;
 const at=p.personalId?(pub(p.personalId)||{nome:nomeP(p.personalId)}):null;
 const rec=convitesRecebidos();const env=vincs().filter(v=>v.alunoId===S.me&&v.status==='pendente'&&v.iniciadoPor==='aluno');
 return `<section class="panel"><div class="eyebrow">Meu Personal</div>
  ${at?`<div class="row">${avatar({id:p.personalId,nome:at.nome||'P',papel:'aluno'},'s')}<div class="grow"><b>${esc(at.nome||'Personal')}</b> ${selo(at)}</div></div><div class="small muted">Acompanha suas fichas, treinos e evolução.</div>
   ${C==='desv'?`<div class="miniconf"><span class="grow">Encerrar o acompanhamento? O Personal deixa de ver seus dados.</span><button class="btn sm danger" data-act="pfdesv">Encerrar</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`:`<button class="btn sm ghost" style="align-self:flex-start" data-act="conf" data-v="desv">Encerrar acompanhamento</button>`}`
   :'<div class="small muted">Você ainda não tem um Personal acompanhando seus treinos.</div>'}
  ${rec.map(cardConvite).join('')}
  ${env.map(v=>`<div class="row small" style="gap:8px"><span class="grow">Solicitação enviada a <b>${esc(v.personalNome)}</b> · aguardando aceite</span><button class="btn sm ghost" data-act="vcan" data-v="${v.id}">Cancelar</button></div>`).join('')}
  ${P.err?`<div class="note bad">${esc(P.err)}</div>`:''}${P.ok?`<div class="note good">${esc(P.ok)}</div>`:''}
  <button class="btn primary" data-act="tab" data-v="busca">Encontrar um Personal</button>
  <div class="field"><label class="lbl" for="pf-cod">Tenho o código do Personal</label><div class="row" style="gap:8px"><input id="pf-cod" class="txt grow" autocapitalize="characters" value="${esc(P.cod||'')}" placeholder="Ex.: RAFA27"><button class="btn ghost" data-act="pfvinc" ${P.busy?'disabled':''}>Solicitar</button></div></div>
 </section>`}
function viewPerfil(){const p=ME()||{nome:'',email:''};
 const u=fbAuth?.currentUser;const gfoto=u?.photoURL||'';const prev=S.crop;
 const fotoBox=prev?cropBox():`<div class="fotoed">${avatar({...p,id:S.me},'xl')}<div style="display:flex;flex-direction:column;gap:6px">
  ${S.fotoMsg?`<div class="small muted">${esc(S.fotoMsg)}</div>`:`<label class="btn sm ghost" for="ft-arq">${p.foto?'Trocar foto':'Adicionar foto'}</label><input id="ft-arq" type="file" accept="image/*,.heic,.heif" hidden>
    ${gfoto&&p.foto!==gfoto?'<button class="btn sm ghost" data-act="ftgoogle">Usar foto do Google</button>':''}${p.foto?'<button class="btn sm ghost" data-act="ftdel">Remover foto</button>':''}`}
  ${S.fotoErr?`<div class="note bad">${esc(S.fotoErr)}</div>`:''}</div></div>`;
 const head=`<section class="panel">${fotoBox}<div class="field"><label class="lbl" for="pf-nome">Nome exibido</label><input id="pf-nome" class="txt" data-ch="meunome" value="${esc(p.nome)}"></div><div class="small muted">E-mail: ${esc(p.email||'—')}</div><div class="field"><label class="lbl" for="pf-nasc">Data de nascimento (opcional)</label><input id="pf-nasc" class="txt" type="date" data-ch="meunasc" value="${esc(p.nasc||'')}"><div class="small muted">Visível só para você, seu Personal e o gestor. Usada para lembrar o seu aniversário.</div></div>${verifBox()}</section>`;
 const modo=S.p?`<section class="panel" style="gap:8px"><div class="eyebrow">Como usar o app agora</div><div class="seg" style="grid-template-columns:1fr 1fr"><button data-act="modo" data-v="personal" class="${PM()?'on':''}">Modo Personal</button><button data-act="modo" data-v="aluno" class="${PM()?'':'on'}">Modo aluno (meus treinos)</button></div></section>`:'';
 const corpo=PM()?`<section class="panel"><div class="eyebrow">Acesso de Personal</div>${codigoCard()||'<div class="small muted">Código em preparação.</div>'}</section>${perfilPublicoForm()}${sonsBox()}`:meuPersonalBox()+sonsBox()+tenisBox()+(S.p?'':souPersonalBox());
 return page(S.g?'Gestor':PM()?'Personal':'Aluno','Meu perfil',`${head}${modo}${corpo}<div class="row" style="gap:16px;justify-content:center" class="small"><a class="small" href="termos.html" target="_blank" rel="noopener">Termos de Uso</a><a class="small" href="privacidade.html" target="_blank" rel="noopener">Privacidade</a></div>${aparenciaBox()}<button class="btn danger" data-act="logout">Sair da conta</button><div class="small muted" style="text-align:center">Versão ${APP_VERSAO}</div>`)}

/* ---------- Perfil público do Personal ---------- */
function ppDraft(){if(!S.pp){const d=S.pdoc||{};const m=String(d.cref||'').match(/^(\d+)-?([GP])\/?([A-Z]{2})$/)||[];
  S.pp={publico:!!d.publico,bio:d.bio||'',especialidades:[...(d.especialidades||[])],cidade:d.cidade||'',uf:d.uf||'SP',bairros:(d.bairros||[]).join(', '),academias:[...(d.academias||[])],modalidade:d.modalidade||'presencial',faixaPreco:d.faixaPreco||'',contato:d.contato||'',crefNum:m[1]||'',crefCat:m[2]||'G',crefUF:m[3]||'SP'}}return S.pp}
function perfilPublicoForm(){const d=ppDraft();const ac=(S.academias||[]).filter(a=>a.aprovada||a.sugeridaPor===S.me).sort((a,b)=>a.nome.localeCompare(b.nome,'pt'));
 const x={...S.pdoc,cref:d.crefNum?crefFmt(d):''};
 return `<section class="panel"><div class="eyebrow">Perfil público</div><div class="small muted">É o que os alunos veem na busca. Só aparece se você marcar a opção abaixo.</div>
  <label class="check"><input type="checkbox" data-pp="publico" ${d.publico?'checked':''}>Aparecer na busca de Personais</label>
  <div class="field"><label class="lbl" for="pp-bio">Apresentação</label><textarea id="pp-bio" class="txt" data-pp="bio" maxlength="500" placeholder="Formação, experiência e como você trabalha">${esc(d.bio)}</textarea></div>
  <div class="field"><span class="lbl">Especialidades</span><div class="chips">${ESPEC.map(e=>`<button type="button" class="chipb ${d.especialidades.includes(e)?'on':''}" data-act="ppesp" data-v="${esc(e)}">${esc(e)}</button>`).join('')}</div></div>
  <div class="grid2"><div class="field"><label class="lbl" for="pp-cid">Cidade</label><input id="pp-cid" class="txt" data-pp="cidade" value="${esc(d.cidade)}" placeholder="Campinas"></div><div class="field"><label class="lbl" for="pp-uf">UF</label><select id="pp-uf" data-pp="uf">${UFS.map(u=>`<option ${d.uf===u?'selected':''}>${u}</option>`).join('')}</select></div></div>
  <div class="field"><label class="lbl" for="pp-bai">Bairros onde atende (separe por vírgula)</label><input id="pp-bai" class="txt" data-pp="bairros" value="${esc(d.bairros)}" placeholder="Cambuí, Taquaral"></div>
  <div class="field"><span class="lbl">Modalidade</span><div class="seg">${Object.entries(MODS).map(([k,l])=>`<button type="button" data-act="ppmod" data-v="${k}" class="${d.modalidade===k?'on':''}">${l}</button>`).join('')}</div></div>
  <div class="field"><span class="lbl">Academias onde atende</span>${ac.length?ac.map(a=>`<label class="check"><input type="checkbox" data-ppac="${a.id}" ${d.academias.includes(a.id)?'checked':''}>${esc(a.nome)} <span class="small muted">· ${esc(a.bairro||'')}${a.aprovada?'':' · aguardando aprovação'}</span></label>`).join(''):'<div class="small muted">Nenhuma academia cadastrada ainda.</div>'}
   ${academiaForm()}</div>
  <div class="grid2"><div class="field"><label class="lbl" for="pp-preco">Faixa de preço (opcional)</label><input id="pp-preco" class="txt" data-pp="faixaPreco" value="${esc(d.faixaPreco)}" placeholder="R$ 80 a 120 por aula"></div><div class="field"><label class="lbl" for="pp-cont">Contato (opcional)</label><input id="pp-cont" class="txt" data-pp="contato" value="${esc(d.contato)}" placeholder="@instagram ou WhatsApp"></div></div>
  <div class="field"><span class="lbl">CREF (opcional · exibe o selo no perfil)</span><div class="grid3"><input class="txt" data-pp="crefNum" inputmode="numeric" maxlength="6" value="${esc(d.crefNum)}" placeholder="Número" aria-label="Número do CREF"><select data-pp="crefCat" aria-label="Categoria"><option value="G" ${d.crefCat==='G'?'selected':''}>G</option><option value="P" ${d.crefCat==='P'?'selected':''}>P</option></select><select data-pp="crefUF" aria-label="UF do CREF">${UFS.map(u=>`<option ${d.crefUF===u?'selected':''}>${u}</option>`).join('')}</select></div>
   <div class="small muted">${x.cref?'Prévia: '+selo(x):'Sem CREF, o perfil aparece sem selo.'}</div></div>
  ${S.ppMsg?`<div class="note ${S.ppMsg.c}">${esc(S.ppMsg.t)}</div>`:''}
  <button class="btn primary" data-act="ppsave">Salvar perfil público</button></section>`}
const crefFmt=d=>`${String(d.crefNum).replace(/\D/g,'').padStart(6,'0')}-${d.crefCat}/${d.crefUF}`;
async function salvarPerfilPublico(){const d=ppDraft();
 if(d.publico&&(!d.cidade.trim()||!d.uf))throw new Error('Para aparecer na busca, informe cidade e UF.');
 const num=String(d.crefNum||'').replace(/\D/g,'');if(num&&(num.length<3||num.length>6))throw new Error('O número do CREF deve ter de 3 a 6 dígitos.');
 const cref=num?crefFmt(d):'';const old=S.pdoc||{};
 const patch={publico:!!d.publico,bio:d.bio.trim(),especialidades:d.especialidades,cidade:d.cidade.trim(),uf:d.uf,bairros:d.bairros.split(',').map(s=>s.trim()).filter(Boolean),academias:d.academias,modalidade:d.modalidade,faixaPreco:d.faixaPreco.trim(),contato:d.contato.trim(),cref,crefVerificado:cref===(old.cref||'')?!!old.crefVerificado:false,nome:ME().nome,atualizado:Date.now()};
 await fdb.collection('personais').doc(S.me).update(patch);S.pdoc={...old,...patch}}

/* ---------- Academias ---------- */
function academiaForm(){const A=S.ac;
 if(!A)return `<button type="button" class="btn sm ghost" style="align-self:flex-start" data-act="acopen">+ ${S.g?'Cadastrar':'Sugerir'} academia</button>`;
 return `<div class="form" style="margin-top:6px"><h3>${S.g?'Nova academia':'Sugerir academia'}</h3>
  <div class="field"><label class="lbl" for="ac-nome">Nome</label><input id="ac-nome" class="txt" data-ac="nome" value="${esc(A.nome||'')}" placeholder="Ex.: Academia Central"></div>
  <div class="field"><label class="lbl" for="ac-cep">CEP</label><div class="row" style="gap:8px"><input id="ac-cep" class="txt grow" data-ac="cep" inputmode="numeric" maxlength="9" value="${esc(A.cep||'')}" placeholder="00000-000"><button type="button" class="btn ghost" data-act="accep">Buscar</button></div></div>
  <div class="field"><label class="lbl" for="ac-end">Endereço</label><input id="ac-end" class="txt" data-ac="endereco" value="${esc(A.endereco||'')}"></div>
  <div class="grid2"><div class="field"><label class="lbl" for="ac-num">Número</label><input id="ac-num" class="txt" data-ac="numero" value="${esc(A.numero||'')}"></div><div class="field"><label class="lbl" for="ac-bai">Bairro</label><input id="ac-bai" class="txt" data-ac="bairro" value="${esc(A.bairro||'')}"></div></div>
  <div class="grid2"><div class="field"><label class="lbl" for="ac-cid">Cidade</label><input id="ac-cid" class="txt" data-ac="cidade" value="${esc(A.cidade||'')}"></div><div class="field"><label class="lbl" for="ac-uf">UF</label><select id="ac-uf" data-ac="uf">${UFS.map(u=>`<option ${(A.uf||'SP')===u?'selected':''}>${u}</option>`).join('')}</select></div></div>
  ${A.err?`<div class="note bad">${esc(A.err)}</div>`:''}${S.g?'':'<div class="small muted">A academia aparece na busca depois da aprovação do gestor.</div>'}
  <div class="nav2"><button type="button" class="btn ghost" data-act="accancel">Cancelar</button><button type="button" class="btn primary" data-act="acsave">${S.g?'Cadastrar':'Enviar sugestão'}</button></div></div>`}
async function buscarCep(){const A=S.ac;const cep=String(A.cep||'').replace(/\D/g,'');if(cep.length!==8){A.err='O CEP deve ter 8 dígitos.';return}
 try{const r=await fetch('https://viacep.com.br/ws/'+cep+'/json/');const j=await r.json();if(j.erro){A.err='CEP não encontrado.';return}
  Object.assign(A,{endereco:j.logradouro||A.endereco,bairro:j.bairro||A.bairro,cidade:j.localidade||A.cidade,uf:j.uf||A.uf,err:''})}catch(e){A.err='Não foi possível consultar o CEP agora. Preencha manualmente.'}}
async function salvarAcademia(){const A=S.ac;if(!(A.nome||'').trim()||!(A.cidade||'').trim())throw new Error('Informe ao menos o nome e a cidade.');
 const a={id:uid('a'),nome:A.nome.trim(),cep:String(A.cep||'').replace(/\D/g,''),endereco:(A.endereco||'').trim(),numero:(A.numero||'').trim(),bairro:(A.bairro||'').trim(),cidade:A.cidade.trim(),uf:A.uf||'SP',aprovada:!!S.g,sugeridaPor:S.me,criado:Date.now()};
 await setDoc('academias',a);if(S.p&&S.pp&&!S.pp.academias.includes(a.id))S.pp.academias.push(a.id);return a}
function gestaoAcademias(){const C=S.conf;const l=[...(S.academias||[])].sort((a,b)=>(a.aprovada?1:0)-(b.aprovada?1:0)||a.nome.localeCompare(b.nome,'pt'));
 return `${osmBox()}${academiaForm()}${l.map(a=>{const n=(S.personais||[]).filter(x=>(x.academias||[]).includes(a.id)).length;const k='delac:'+a.id;
  return `<section class="panel" style="gap:8px"><div class="row"><div class="grow"><h3>${esc(a.nome)}</h3><div class="small muted">${esc([a.endereco&&(a.endereco+(a.numero?', '+a.numero:'')),a.bairro,a.cidade&&(a.cidade+'/'+a.uf)].filter(Boolean).join(' · '))}</div><div class="small muted">${n} Personal${n===1?'':'s'} · sugerida por ${esc(nomeP(a.sugeridaPor)||perfil(a.sugeridaPor)?.nome||'—')}</div></div><span class="chip ${a.aprovada?'on':''}">${a.aprovada?'Aprovada':'Pendente'}</span></div>
  ${C===k?`<div class="miniconf"><span class="grow">Excluir esta academia?</span><button class="btn sm danger" data-act="acdel" data-v="${a.id}">Excluir</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`:`<div class="nav2">${a.aprovada?'<span></span>':`<button class="btn primary" data-act="acapr" data-v="${a.id}">Aprovar</button>`}<button class="btn danger" data-act="conf" data-v="${k}">Excluir</button></div>`}</section>`}).join('')||'<div class="empty">Nenhuma academia cadastrada.</div>'}`}

/* ---------- Busca de Personais ---------- */
function viewBusca(){const B=S.busca||(S.busca={cidade:'',bairro:'',acad:'',esp:'',mod:'',cref:''});
 const todos=((S.g?S.personais:S.pubs)||[]).filter(x=>x.publico&&x.id!==S.me);
 const cidades=[...new Set(todos.map(x=>x.cidade&&x.cidade+'/'+x.uf).filter(Boolean))].sort();
 const acs=(S.academias||[]).filter(a=>a.aprovada&&(!B.cidade||a.cidade+'/'+a.uf===B.cidade)).sort((a,b)=>a.nome.localeCompare(b.nome,'pt'));
 const bq=nk(B.bairro||'');
 const res=todos.filter(x=>(!B.cidade||x.cidade+'/'+x.uf===B.cidade)&&(!bq||(x.bairros||[]).some(b=>nk(b).includes(bq)))&&(!B.acad||(x.academias||[]).includes(B.acad))&&(!B.esp||(x.especialidades||[]).includes(B.esp))&&(!B.mod||x.modalidade===B.mod||x.modalidade==='ambos')&&(!B.cref||!!x.cref))
  .sort((a,b)=>(b.cref?1:0)-(a.cref?1:0)||(a.nome||'').localeCompare(b.nome||'','pt'));
 const meu=ME()?.personalId;
 const card=x=>{const v=vincs().find(y=>y.alunoId===S.me&&y.personalId===x.id&&y.status==='pendente');const ac=(x.academias||[]).map(acad).filter(a=>a&&a.aprovada);
  return `<section class="panel" style="gap:10px"><div class="row">${avatar({id:x.id,nome:x.nome||'P',papel:'aluno'})}<div class="grow"><h2>${esc(x.nome||'Personal')}</h2><div>${selo(x)}</div></div></div>
   <div class="small muted">${esc([x.cidade&&x.cidade+'/'+x.uf,(x.bairros||[]).join(', '),MODS[x.modalidade]].filter(Boolean).join(' · '))}</div>
   ${(x.especialidades||[]).length?`<div class="chips">${x.especialidades.map(e=>`<span class="chipb">${esc(e)}</span>`).join('')}</div>`:''}
   ${x.bio?`<div class="small">${esc(x.bio)}</div>`:''}
   ${ac.length?`<div class="small">Academias: ${ac.map(a=>`<button class="lnk" data-act="bacad" data-v="${a.id}">${esc(a.nome)}</button>`).join(', ')}</div>`:''}
   ${x.faixaPreco||x.contato?`<div class="small muted">${esc([x.faixaPreco,x.contato].filter(Boolean).join(' · '))}</div>`:''}
   ${denunciaForm(x)}
   ${PM()?'':meu===x.id?'<span class="chip on" style="align-self:flex-start">Seu Personal</span>':v?`<div class="row small" style="gap:8px"><span class="grow">Solicitação enviada · aguardando aceite</span><button class="btn sm ghost" data-act="vcan" data-v="${v.id}">Cancelar</button></div>`:`<button class="btn primary" data-act="bsol" data-v="${x.id}">Solicitar acompanhamento</button>`}</section>`};
 const sel=(k,lab,opts)=>`<select data-bs="${k}" aria-label="${lab}"><option value="">${lab}</option>${opts.map(([v,l])=>`<option value="${esc(v)}" ${B[k]===v?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
 return page('Busca','Encontrar um Personal',`<section class="panel" style="gap:8px">${sel('cidade','Todas as cidades',cidades.map(c=>[c,c]))}
  <input class="txt" data-bs="bairro" value="${esc(B.bairro)}" placeholder="Bairro" aria-label="Bairro">
  ${sel('acad','Todas as academias',acs.map(a=>[a.id,a.nome+(a.bairro?' · '+a.bairro:'')]))}
  <div class="grid2">${sel('esp','Especialidade',ESPEC.map(e=>[e,e]))}${sel('mod','Modalidade',Object.entries(MODS).filter(([k])=>k!=='ambos'))}</div>
  <label class="check"><input type="checkbox" data-bs="cref" ${B.cref?'checked':''}>Somente com CREF informado</label>
  ${Object.values(B).some(Boolean)?'<button class="btn sm ghost" data-act="bclear">Limpar filtros</button>':''}</section>
  ${S.bMsg?`<div class="note ${S.bMsg.c}">${esc(S.bMsg.t)}</div>`:''}
  <div class="eyebrow">${res.length} Personal${res.length===1?'':'s'} encontrado${res.length===1?'':'s'}</div>
  ${res.map(card).join('')||'<div class="empty">Nenhum Personal com esses filtros. Tente ampliar a busca.</div>'}
  ${(S.academias||[]).some(a=>a.fonte==='osm')?'<div class="small muted" style="text-align:center">Parte dos dados de academias © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">contribuidores do OpenStreetMap</a> (ODbL).</div>':''}`,{back:'perfil'})}

/* ---------- Painel do Personal com solicitações ---------- */
function solicitacoesBox(){const meus=vincs().filter(v=>v.personalId===S.me);const I=S.inv;
 const rec=meus.filter(v=>v.status==='pendente'&&v.iniciadoPor==='aluno'),env=meus.filter(v=>v.status==='pendente'&&v.iniciadoPor==='personal');
 const aguard=meus.filter(v=>v.status==='ativo'&&!alunos(true).some(a=>a.id===v.alunoId));
 const conv=I?`<section class="form"><h3>Convidar aluno</h3><div class="small muted">O aluno vê o convite ao entrar no app com este e-mail e decide se aceita.</div>
  <div class="field"><label class="lbl" for="inv-email">E-mail do aluno</label><input id="inv-email" class="txt" type="email" data-inv="email" value="${esc(I.email||'')}"></div>
  <div class="field"><label class="lbl" for="inv-nome">Nome (opcional)</label><input id="inv-nome" class="txt" data-inv="nome" value="${esc(I.nome||'')}"></div>
  ${I.err?`<div class="note bad">${esc(I.err)}</div>`:''}<div class="nav2"><button class="btn ghost" data-act="invcancel">Cancelar</button><button class="btn primary" data-act="invsend">Enviar convite</button></div></section>`:'';
 return `${S.vMsg?`<div class="note ${S.vMsg.c}">${esc(S.vMsg.t)}</div>`:''}
  ${rec.length?`<section class="panel"><div class="eyebrow">Solicitações de alunos</div>${rec.map(v=>`<div class="row" style="gap:8px">${avatar({id:v.alunoId,nome:v.alunoNome,papel:'aluno'},'s')}<div class="grow"><b>${esc(v.alunoNome)}</b><div class="small muted">${v.via==='codigo'?'pelo seu código':'pela busca'} · ${ddmm(v.criado)}</div></div></div><div class="nav2"><button class="btn ghost" data-act="prec" data-v="${v.id}">Recusar</button><button class="btn primary" data-act="pace" data-v="${v.id}">Aceitar</button></div>`).join('')}</section>`:''}
  ${aguard.length?`<div class="note good">${aguard.map(v=>esc(v.alunoNome)).join(', ')}: vínculo aceito. O aluno aparece aqui assim que abrir o app.</div>`:''}
  ${env.length?`<section class="panel" style="gap:8px"><div class="eyebrow">Convites enviados</div>${env.map(v=>`<div class="row small" style="gap:8px"><span class="grow"><b>${esc(v.alunoNome)}</b>${v.alunoNome!==v.alunoEmail?' · '+esc(v.alunoEmail):''} · aguardando aceite</span><button class="btn sm ghost" data-act="pcan" data-v="${v.id}">Cancelar</button></div>`).join('')}</section>`:''}
  ${conv||`<button class="btn ghost" data-act="invopen">+ Convidar aluno por e-mail</button>`}`}
function viewAlunos(){return page('Painel do Personal','Alunos',codigoCard()+solicitacoesBox()+alunosBody())}

/* ---------- Gestão ---------- */
function viewGestao(){const g=S.gsub;
 const st=`<div class="subtabs">${[['alunos','Alunos'],['personais','Personais'+((S.denuncias||[]).some(d=>d.status==='aberta')?'<i class="badge" aria-label="denúncia aberta"></i>':'')],['academias','Academias'],['modelos','Modelos']].map(([k,l])=>`<button data-act="gsub" data-v="${k}" class="${g===k?'on':''}">${l}</button>`).join('')}</div>`;
 let body;
 if(g==='modelos')body=`<div class="small muted">Modelos do gestor ficam disponíveis para todos os Personais e alunos.</div>`+fichasList('modelos');
 else if(g==='academias')body=`${S.gmsg?`<div class="note ${S.gmsg.c}">${esc(S.gmsg.t)}</div>`:''}`+gestaoAcademias();
 else if(g==='personais'){const C=S.conf;const cand=S.perfis.filter(p=>p.papel!=='personal'&&!S.personais.some(x=>x.id===p.id)).sort((a,b)=>a.nome.localeCompare(b.nome,'pt'));
  body=`${S.gmsg?`<div class="note ${S.gmsg.c}">${esc(S.gmsg.t)}</div>`:''}${denunciasBox()}
  <div class="small muted">Os usuários podem ativar o acesso de Personal em Meu perfil. Use a opção abaixo apenas para liberar alguém manualmente.</div>
  <section class="form"><h3>Liberar novo Personal</h3><div class="small muted">A pessoa precisa ter entrado no app ao menos uma vez.</div>
  <select id="lp-sel" aria-label="Usuário"><option value="">Escolha o usuário</option>${cand.map(p=>`<option value="${p.id}">${esc(p.nome)}${p.email?' · '+esc(p.email):''}</option>`).join('')}</select>
  <button class="btn primary" data-act="lpgo">Liberar como Personal</button></section>
  ${S.personais.map(x=>{const n=alunos(true).filter(a=>a.personalId===x.id).length;const k='rev:'+x.id;return `<section class="panel" style="gap:8px"><div class="row">${avatar({id:x.id,nome:x.nome,papel:'aluno'})}<div class="grow"><h2>${esc(x.nome)}</h2><div class="small muted">${n} aluno${n===1?'':'s'} · código <b class="num" style="color:var(--ink);font-size:16px">${esc(x.codigo||'')}</b> · ${x.publico?'na busca':'fora da busca'}${x.autoCadastro?' · autocadastro':''}</div><div>${selo(x)||'<span class="small muted">Sem CREF informado</span>'}</div></div></div>
   ${x.cref?`<button class="btn sm ghost" style="align-self:flex-start" data-act="crefv" data-v="${x.id}">${x.crefVerificado?'Remover marcação de CREF conferido':'Marcar CREF como conferido'}</button>`:''}
   ${C===k?(n?`<div class="note warn">Transfira os ${n} alunos antes de revogar (aba Alunos → aluno → Cadastro). <button class="btn sm ghost" data-act="conf" data-v="">Ok</button></div>`:`<div class="miniconf"><span class="grow">Revogar o acesso de Personal?</span><button class="btn sm danger" data-act="revgo" data-v="${x.id}">Revogar</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`):`<div class="nav2"><button class="btn ghost" data-act="gfgo" data-v="${x.id}">Ver alunos</button><button class="btn danger" data-act="conf" data-v="${k}">Revogar acesso</button></div>`}</section>`}).join('')||'<div class="empty">Nenhum Personal liberado ainda.</div>'}`}
 else body=alunosBody();
 return page('Painel do gestor','Gestão',st+body)}

/* ---------- Cartões da tela inicial do aluno ---------- */
function semPersonal(){if(PM())return '';const rec=convitesRecebidos();
 if(rec.length)return `<button class="banner" data-act="tab" data-v="perfil"><span class="grow"><b>${esc(rec[0].personalNome)}</b> quer acompanhar seus treinos<br><span class="small">Toque para ver e responder</span></span><span>›</span></button>`;
 if(ME()?.personalId||LS.get('ft4.semP',0))return '';
 return `<section class="panel" style="gap:8px"><div class="eyebrow">Tem um Personal?</div><div class="small">Encontre um Personal na sua região ou informe o código dele para que acompanhe seus treinos.</div><div class="nav2"><button class="btn ghost" data-act="semPno">Agora não</button><button class="btn primary" data-act="tab" data-v="busca">Encontrar Personal</button></div></section>`}

/* ---------- Entradas de formulário e cliques próprios ---------- */
document.addEventListener('input',e=>{const el=e.target;
 if(el.dataset.pp&&S.pp){S.pp[el.dataset.pp]=el.type==='checkbox'?el.checked:el.value}
 if(el.dataset.ac&&S.ac)S.ac[el.dataset.ac]=el.value;
 if(el.dataset.inv&&S.inv)S.inv[el.dataset.inv]=el.value;
 if(el.dataset.bs==='bairro'&&S.busca){S.busca.bairro=el.value;clearTimeout(S._bt);S._bt=setTimeout(()=>{const pos=el.selectionStart;render();const n=document.querySelector('[data-bs=bairro]');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}},350)}
});
document.addEventListener('change',e=>{const el=e.target;
 if(el.dataset.pp&&S.pp){S.pp[el.dataset.pp]=el.type==='checkbox'?el.checked:el.value;if(el.tagName==='SELECT'&&el.dataset.pp.startsWith('cref'))render()}
 if(el.dataset.ppac&&S.pp){const id=el.dataset.ppac,l=S.pp.academias;if(el.checked&&!l.includes(id))l.push(id);if(!el.checked)S.pp.academias=l.filter(x=>x!==id)}
 if(el.dataset.ac&&S.ac)S.ac[el.dataset.ac]=el.value;
 if(el.dataset.bs&&el.dataset.bs!=='bairro'&&S.busca){S.busca[el.dataset.bs]=el.type==='checkbox'?(el.checked?'1':''):el.value;if(el.dataset.bs==='cidade')S.busca.acad='';render()}
});
function run(p,ok,errKey){p.then(ok).catch(e=>{console.warn(e);const t=errMsg(e);if(errKey==='pf')S.pf={...(S.pf||{}),busy:false,err:t};else if(errKey==='v')S.vMsg={c:'bad',t};else if(errKey==='pp')S.ppMsg={c:'bad',t};else if(errKey==='ac'){S.ac&&(S.ac.err=t)}else if(errKey==='b')S.bMsg={c:'bad',t};else S.gmsg={c:'bad',t};render()})}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const v=b.dataset.v;
 const V=id=>vincs().find(x=>x.id===id);
 switch(b.dataset.act){
  case 'tmok':{if(!$('#tm-ok')?.checked){S.tmErr='Marque a caixa para aceitar.';render();break}const p=ME();p.aceite={versao:TERMOS_V,em:Date.now()};S.tmErr='';run(putNow('perfis',p),()=>{render();syncVinculo()});break}
  case 'vfsend':run(fbAuth.currentUser.sendEmailVerification(),()=>toast('E-mail de confirmação enviado.'),'pf');break;
  case 'vfok':run(fbAuth.currentUser.reload().then(()=>fbAuth.currentUser.getIdToken(true)),()=>{if(verificado()){toast('E-mail confirmado.');onAuth(fbAuth.currentUser)}else toast('Ainda não consta a confirmação. Abra o link enviado ao seu e-mail.')},'pf');break;
  case 'pfvinc':{S.pf={cod:$('#pf-cod')?.value||'',busy:true};render();run(vincular(S.pf.cod),n=>{S.pf={ok:`Solicitação enviada a ${n}. Assim que ele aceitar, passa a acompanhar seus treinos.`};render()},'pf');break}
  case 'pfdesv':run(alunoEncerra(),()=>{S.conf=null;S.pf={ok:'Acompanhamento encerrado. O Personal não vê mais seus dados.'};render()},'pf');break;
  case 'vace':{if(!$('#cs-'+v)?.checked){S.pf={err:'Marque “Li e autorizo” para aceitar o convite.'};render();break}run(alunoAceita(V(v)),()=>{S.pf={ok:'Convite aceito. Seu Personal já pode acompanhar seus treinos.'};render()},'pf');break}
  case 'vrec':run(upd('vinculos',v,{status:'recusado',respondido:Date.now(),alunoId:S.me}),()=>{S.pf={ok:'Convite recusado.'};render()},'pf');break;
  case 'vcan':run(upd('vinculos',v,{status:'cancelado',respondido:Date.now()}),()=>{S.pf={ok:'Solicitação cancelada.'};S.bMsg=null;render()},'pf');break;
  case 'bsol':run(solicitar(v,'busca'),n=>{S.bMsg={c:'good',t:`Solicitação enviada a ${n}. Você será avisado quando ele aceitar.`};render()},'b');break;
  case 'bacad':S.busca={...(S.busca||{}),acad:v};render();window.scrollTo(0,0);break;
  case 'bclear':S.busca={cidade:'',bairro:'',acad:'',esp:'',mod:'',cref:''};render();break;
  case 'pace':run(upd('vinculos',v,{status:'ativo',respondido:Date.now()}),()=>{S.vMsg={c:'good',t:'Solicitação aceita. O aluno aparece na sua lista assim que abrir o app.'};render()},'v');break;
  case 'prec':run(upd('vinculos',v,{status:'recusado',respondido:Date.now()}),()=>{S.vMsg={c:'good',t:'Solicitação recusada.'};render()},'v');break;
  case 'pcan':run(upd('vinculos',v,{status:'cancelado',respondido:Date.now()}),()=>{S.vMsg={c:'good',t:'Convite cancelado.'};render()},'v');break;
  case 'invopen':S.inv={email:'',nome:''};render();setTimeout(()=>$('#inv-email')?.focus(),0);break;
  case 'invcancel':S.inv=null;render();break;
  case 'invsend':run(convidarEmail(S.inv.email,S.inv.nome),()=>{S.vMsg={c:'good',t:`Convite enviado para ${S.inv.email}. O aluno vê o convite ao entrar no app com esse e-mail.`};S.inv=null;render()},'v');break;
  case 'penc':run(personalEncerra(S.sel),()=>{S.conf=null;S.vMsg={c:'good',t:'Acompanhamento encerrado.'};go('alunos')},'v');break;
  case 'ppesp':{const d=ppDraft();d.especialidades=d.especialidades.includes(v)?d.especialidades.filter(x=>x!==v):[...d.especialidades,v];render();break}
  case 'ppmod':ppDraft().modalidade=v;render();break;
  case 'ppsave':S.ppMsg=null;run(salvarPerfilPublico(),()=>{S.ppMsg={c:'good',t:ppDraft().publico?'Perfil salvo. Você já aparece na busca.':'Perfil salvo. Você não aparece na busca.'};render()},'pp');break;
  case 'acopen':S.ac={uf:'SP'};render();setTimeout(()=>$('#ac-nome')?.focus(),0);break;
  case 'accancel':S.ac=null;render();break;
  case 'accep':buscarCep().then(render);break;
  case 'acsave':run(salvarAcademia(),a=>{S.ac=null;const t=S.g?`Academia ${a.nome} cadastrada.`:`Sugestão de ${a.nome} enviada. Ela aparece na busca depois da aprovação.`;if(S.g)S.gmsg={c:'good',t};else S.ppMsg={c:'good',t:t+' Lembre de salvar o perfil público.'};render()},'ac');break;
  case 'acapr':run(upd('academias',v,{aprovada:true}),()=>{S.gmsg={c:'good',t:'Academia aprovada.'};render()});break;
  case 'acdel':run(fdb.collection('academias').doc(v).delete().then(()=>{S.academias=S.academias.filter(a=>a.id!==v)}),()=>{S.conf=null;S.gmsg={c:'good',t:'Academia excluída.'};render()});break;
  case 'crefv':{const x=S.personais.find(y=>y.id===v);run(upd('personais',v,{crefVerificado:!x.crefVerificado}),()=>render());break}
 }
});

/* ---------- Autocadastro de Personal ---------- */
const DECL='Declaro que sou profissional de Educação Física habilitado(a) a prescrever e acompanhar treinos, nos termos da Lei nº 9.696/1998, que as informações do meu perfil são verdadeiras e que respondo pelas orientações que der aos alunos.';
function souPersonalBox(){const F=S.sp;
 if(!F)return `<section class="panel" style="gap:8px"><div class="eyebrow">Você é Personal?</div><div class="small">Ative o acesso de Personal para montar fichas, acompanhar alunos e aparecer na busca. Você continua podendo registrar os seus próprios treinos.</div><button class="btn ghost" data-act="spopen">Sou Personal</button></section>`;
 return `<section class="form"><h3>Ativar acesso de Personal</h3>
  <div class="field"><label class="lbl" for="sp-nome">Nome profissional</label><input id="sp-nome" class="txt" data-sp="nome" value="${esc(F.nome)}"></div>
  <div class="grid2"><div class="field"><label class="lbl" for="sp-cid">Cidade</label><input id="sp-cid" class="txt" data-sp="cidade" value="${esc(F.cidade)}" placeholder="Campinas"></div><div class="field"><label class="lbl" for="sp-uf">UF</label><select id="sp-uf" data-sp="uf">${UFS.map(u=>`<option ${F.uf===u?'selected':''}>${u}</option>`).join('')}</select></div></div>
  <div class="field"><span class="lbl">CREF (opcional · exibe o selo no perfil)</span><div class="grid3"><input class="txt" data-sp="crefNum" inputmode="numeric" maxlength="6" value="${esc(F.crefNum)}" placeholder="Número" aria-label="Número do CREF"><select data-sp="crefCat" aria-label="Categoria"><option ${F.crefCat==='G'?'selected':''}>G</option><option ${F.crefCat==='P'?'selected':''}>P</option></select><select data-sp="crefUF" aria-label="UF do CREF">${UFS.map(u=>`<option ${F.crefUF===u?'selected':''}>${u}</option>`).join('')}</select></div></div>
  <div class="small muted">${esc(DECL)}</div><label class="check"><input type="checkbox" id="sp-ok">Li e declaro</label>
  ${F.err?`<div class="note bad">${esc(F.err)}</div>`:''}
  <div class="nav2"><button class="btn ghost" data-act="spcancel">Cancelar</button><button class="btn primary" data-act="spgo" ${F.busy?'disabled':''}>Ativar acesso</button></div></section>`}
async function autoCadastroPersonal(){const F=S.sp;const nome=(F.nome||'').trim()||ME().nome;
 if(!(F.cidade||'').trim())throw new Error('Informe a cidade onde atende.');
 const num=String(F.crefNum||'').replace(/\D/g,'');if(num&&(num.length<3||num.length>6))throw new Error('O número do CREF deve ter de 3 a 6 dígitos.');
 let codigo='';for(let i=0;i<8&&!codigo;i++){const c=novoCodigo(nome);const d=await fdb.collection('convites').doc(c).get();if(!d.exists)codigo=c}
 if(!codigo)throw new Error('Não foi possível gerar o código agora. Tente de novo.');
 const cref=num?crefFmt({crefNum:num,crefCat:F.crefCat,crefUF:F.crefUF}):'';
 const b=fdb.batch();
 b.set(fdb.collection('personais').doc(S.me),{nome,codigo,criado:Date.now(),publico:false,cidade:F.cidade.trim(),uf:F.uf,bairros:[],especialidades:[],academias:[],modalidade:'presencial',bio:'',faixaPreco:'',contato:'',cref,crefVerificado:false,autoCadastro:true,foto:ME()?.foto||'',declaracao:{versao:TERMOS_V,em:Date.now(),texto:DECL}});
 b.set(fdb.collection('convites').doc(codigo),{personalId:S.me});
 b.update(fdb.collection('perfis').doc(S.me),{papel:'personal'});
 await b.commit();S.modo='personal';LS.set('ft4.modo','personal');S.sp=null;S.pp=null;
 if(S.g)await onAuth(fbAuth.currentUser);return codigo}

/* ---------- Denúncias ---------- */
const MOTIVOS=['Perfil falso','CREF incorreto','Conduta inadequada','Outro'];
function denunciaForm(x){const D=S.den;if(!D||D.alvo!==x.id)return PM()?'':`<button class="lnk small" style="align-self:flex-start;color:var(--muted)" data-act="denopen" data-v="${x.id}">Denunciar perfil</button>`;
 return `<div class="form" style="gap:8px"><h3>Denunciar perfil</h3><select data-den="motivo" aria-label="Motivo">${MOTIVOS.map(m=>`<option ${D.motivo===m?'selected':''}>${m}</option>`).join('')}</select>
  <textarea class="txt" data-den="texto" maxlength="600" placeholder="Conte o que aconteceu (opcional)">${esc(D.texto||'')}</textarea>
  <div class="small muted">A denúncia vai para a administração da plataforma. O Personal não vê quem denunciou.</div>
  <div class="nav2"><button class="btn ghost" data-act="dencancel">Cancelar</button><button class="btn danger" data-act="densend">Enviar denúncia</button></div></div>`}
function denunciasBox(){const ab=(S.denuncias||[]).filter(d=>d.status==='aberta').sort((a,b)=>b.criado-a.criado);if(!ab.length)return '';
 const post=d=>`<div style="display:grid;gap:4px"><div><b>Recado de ${esc(d.alvoNome||'membro')}</b> · comunidade “${esc(d.comNome||'')}” · ${esc(d.motivo)}</div><div class="small">“${esc(d.texto||'')}”</div><div class="small muted">por ${esc(perfil(d.autorId)?.nome||'usuário')} · ${ddmm(d.criado)}</div>
  <div class="nav2"><button class="btn sm ghost" data-act="denarq" data-v="${d.id}">Arquivar</button><button class="btn sm danger" data-act="denpost" data-v="${d.id}">Apagar recado</button></div></div>`;
 return `<section class="panel" style="gap:10px;border-color:var(--bad)"><div class="eyebrow" style="color:var(--bad)">Denúncias abertas · ${ab.length}</div>
 ${ab.map(d=>d.tipo==='post'?post(d):`<div style="display:grid;gap:4px"><div><b>${esc(d.alvoNome)}</b> · ${esc(d.motivo)}</div>${d.texto?`<div class="small">“${esc(d.texto)}”</div>`:''}<div class="small muted">por ${esc(perfil(d.autorId)?.nome||'usuário')} · ${ddmm(d.criado)}</div>
  <div class="nav2"><button class="btn sm ghost" data-act="denarq" data-v="${d.id}">Arquivar</button><button class="btn sm danger" data-act="conf" data-v="rev:${d.alvoId}">Revogar Personal</button></div></div>`).join('<hr style="border:0;border-top:1px solid var(--line);width:100%">')}</section>`}

/* ---------- Importação de academias do OpenStreetMap ---------- */
const OSM_URL='https://overpass-api.de/api/interpreter';
function osmBox(){const O=S.osm||(S.osm={cidade:'Campinas',uf:'SP'});
 const head=`<section class="form" style="gap:10px"><h3>Importar do OpenStreetMap</h3><div class="small muted">Busca academias cadastradas no OpenStreetMap para a cidade escolhida. Você revisa a lista e escolhe quais importar.</div>
  <div class="grid2"><input class="txt" data-osm="cidade" value="${esc(O.cidade)}" aria-label="Cidade"><select data-osm="uf" aria-label="UF">${UFS.map(u=>`<option ${O.uf===u?'selected':''}>${u}</option>`).join('')}</select></div>
  <button class="btn primary" data-act="osmgo" ${O.loading?'disabled':''}>${O.loading?'Buscando… pode levar até 1 minuto':'Buscar academias'}</button>
  ${O.err?`<div class="note bad">${esc(O.err)}</div>`:''}${O.ok?`<div class="note good">${esc(O.ok)}</div>`:''}`;
 if(!O.items)return head+'</section>';
 const novos=O.items.filter(i=>!i.dup),sel=O.items.filter(i=>i.sel).length;
 return head+`<div class="row small" style="gap:8px;flex-wrap:wrap"><b class="grow">${O.items.length} encontradas · ${O.items.length-novos.length} já cadastradas</b><button class="btn sm ghost" data-act="osmall" data-v="1">Marcar todas</button><button class="btn sm ghost" data-act="osmall" data-v="0">Desmarcar</button></div>
  <div style="max-height:420px;overflow:auto;display:grid;gap:2px">${O.items.map((i,k)=>`<label class="check" style="align-items:flex-start"><input type="checkbox" data-osmi="${k}" ${i.sel?'checked':''} ${i.dup?'disabled':''}><span><b>${esc(i.nome)}</b>${i.dup?' <span class="small muted">· já cadastrada</span>':''}<br><span class="small muted">${esc([i.endereco&&(i.endereco+(i.numero?', '+i.numero:'')),i.bairro,i.cep].filter(Boolean).join(' · ')||'Sem endereço no OpenStreetMap')}</span></span></label>`).join('')}</div>
  <button class="btn primary" data-act="osmimp" ${sel&&!O.saving?'':'disabled'}>${O.saving?'Importando…':`Importar ${sel} academia${sel===1?'':'s'}`}</button>
  <div class="small muted">Dados © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">contribuidores do OpenStreetMap</a>, licença ODbL.</div></section>`}
async function osmBuscar(){const O=S.osm;O.err='';O.ok='';O.items=null;O.loading=true;render();
 const cid=String(O.cidade||'').trim().replace(/"/g,'');
 const q=`[out:json][timeout:60];area["ISO3166-2"="BR-${O.uf}"]->.uf;rel(area.uf)["boundary"="administrative"]["admin_level"="8"]["name"="${cid}"];map_to_area->.a;(nwr["leisure"="fitness_centre"](area.a);nwr["sport"~"fitness|crossfit|bodybuilding"](area.a););out center tags;`;
 try{const r=await fetch(OSM_URL,{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'}});
  if(!r.ok)throw new Error('O OpenStreetMap respondeu com erro '+r.status+'. Tente de novo em alguns minutos.');
  const j=await r.json();const vistos=new Set();
  const ex=new Set((S.academias||[]).map(a=>nk(a.nome)+'|'+(a.cep||'')));const exNome=new Set((S.academias||[]).map(a=>nk(a.nome)));const exOsm=new Set((S.academias||[]).map(a=>a.osm).filter(Boolean));
  O.items=(j.elements||[]).filter(e=>e.tags&&e.tags.name).map(e=>{const t=e.tags;const cep=String(t['addr:postcode']||'').replace(/\D/g,'');
   const it={osm:e.type+'/'+e.id,nome:t.name.trim(),endereco:t['addr:street']||'',numero:t['addr:housenumber']||'',bairro:t['addr:suburb']||t['addr:neighbourhood']||t['addr:district']||'',cep,cidade:t['addr:city']||cid,uf:O.uf,lat:e.lat??e.center?.lat??null,lon:e.lon??e.center?.lon??null};
   it.dup=exOsm.has(it.osm)||ex.has(nk(it.nome)+'|'+cep)||(!cep&&exNome.has(nk(it.nome)));it.sel=!it.dup;return it})
   .filter(i=>{const k=nk(i.nome)+'|'+i.endereco;if(vistos.has(k))return false;vistos.add(k);return true}).sort((a,b)=>a.nome.localeCompare(b.nome,'pt'));
  if(!O.items.length)O.err=`Nenhuma academia encontrada no OpenStreetMap para ${cid}/${O.uf}. Confira o nome da cidade, com acentos.`;
 }catch(e){O.err=e.message.startsWith('O Open')?e.message:'Não foi possível consultar o OpenStreetMap agora. Verifique a conexão e tente de novo.'}
 O.loading=false;render()}
async function osmImportar(){const O=S.osm;const sel=O.items.filter(i=>i.sel&&!i.dup);O.saving=true;render();
 for(let k=0;k<sel.length;k+=400){const b=fdb.batch();sel.slice(k,k+400).forEach(i=>{const id='osm-'+i.osm.replace('/','-');const a={id,nome:i.nome,cep:i.cep,endereco:i.endereco,numero:i.numero,bairro:i.bairro,cidade:i.cidade,uf:i.uf,lat:i.lat,lon:i.lon,aprovada:true,sugeridaPor:S.me,fonte:'osm',osm:i.osm,criado:Date.now()};b.set(fdb.collection('academias').doc(id),a);i.dup=true;i.sel=false});await b.commit()}
 O.saving=false;O.ok=`${sel.length} academia${sel.length===1?' importada':'s importadas'}. Elas já aparecem na busca e no perfil dos Personais.`;render()}

/* ---------- Cliques e campos da etapa 3 ---------- */
document.addEventListener('input',e=>{const el=e.target;
 if(el.dataset.sp&&S.sp)S.sp[el.dataset.sp]=el.value;
 if(el.dataset.den&&S.den)S.den[el.dataset.den]=el.value;
 if(el.dataset.osm&&S.osm)S.osm[el.dataset.osm]=el.value;
});
document.addEventListener('change',e=>{const el=e.target;
 if(el.dataset.sp&&S.sp)S.sp[el.dataset.sp]=el.value;
 if(el.dataset.den&&S.den)S.den[el.dataset.den]=el.value;
 if(el.dataset.osm&&S.osm)S.osm[el.dataset.osm]=el.value;
 if(el.dataset.osmi!==undefined&&S.osm?.items){S.osm.items[+el.dataset.osmi].sel=el.checked;render()}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const v=b.dataset.v;
 switch(b.dataset.act){
  case 'modo':S.modo=v;LS.set('ft4.modo',v);S.view=v==='personal'?'alunos':'inicio';render();window.scrollTo(0,0);break;
  case 'spopen':S.sp={nome:ME()?.nome||'',cidade:'',uf:'SP',crefNum:'',crefCat:'G',crefUF:'SP'};render();break;
  case 'spcancel':S.sp=null;render();break;
  case 'spgo':{if(!$('#sp-ok')?.checked){S.sp.err='Marque “Li e declaro” para continuar.';render();break}S.sp.busy=true;S.sp.err='';render();
   autoCadastroPersonal().then(c=>{toast('Acesso de Personal ativado. Seu código: '+c)}).catch(err=>{S.sp.busy=false;S.sp.err=errMsg(err);render()});break}
  case 'denopen':S.den={alvo:v,motivo:MOTIVOS[0],texto:''};render();break;
  case 'dencancel':S.den=null;render();break;
  case 'densend':{const D=S.den,x=pub(D.alvo)||{};run(fdb.collection('denuncias').doc(uid('d')).set({alvoId:D.alvo,alvoNome:x.nome||'',motivo:D.motivo,texto:(D.texto||'').trim(),autorId:S.me,status:'aberta',criado:Date.now()}),()=>{S.den=null;S.bMsg={c:'good',t:'Denúncia enviada. Obrigado por avisar.'};render()},'b');break}
  case 'denpost':{const d=(S.denuncias||[]).find(x=>x.id===v);if(!d)break;run(fdb.collection('comunidades').doc(d.comId).collection('posts').doc(d.postId).delete().catch(()=>{}).then(()=>upd('denuncias',v,{status:'tratada',tratada:Date.now()})),()=>{toast('Recado apagado.');render()});break}
  case 'denarq':run(upd('denuncias',v,{status:'arquivada',tratada:Date.now()}),()=>render());break;
  case 'osmgo':osmBuscar();break;
  case 'osmall':S.osm.items.forEach(i=>{if(!i.dup)i.sel=v==='1'});render();break;
  case 'osmimp':osmImportar().catch(err=>{S.osm.saving=false;S.osm.err='Falha ao importar: '+errMsg(err);render()});break;
 }
});

/* ---------- Foto de perfil (compacta, guardada no próprio perfil) ---------- */
const ehHeic=f=>/\.(heic|heif)$/i.test(f.name||'')||/hei[cf]/i.test(f.type||'');
function carregaScript(src){return new Promise((ok,er)=>{if(document.querySelector(`script[src="${src}"]`))return ok();const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>er(new Error('Não foi possível carregar o conversor de fotos. Verifique a conexão.'));document.head.appendChild(s)})}
async function abreImagem(file){
 if(!file)throw new Error('Nenhuma foto escolhida.');
 if(file.size>25*1024*1024)throw new Error('Foto muito grande. Escolha uma imagem de até 25 MB.');
 let blob=file;
 if(ehHeic(file)){S.fotoErr='';S.fotoMsg='Convertendo foto HEIC…';render();await carregaScript('js/vendor/heic2any.min.js');
  try{const r=await heic2any({blob:file,toType:'image/jpeg',quality:.9});blob=Array.isArray(r)?r[0]:r}catch(e){throw new Error('Não foi possível converter essa foto HEIC. Tente outra imagem ou envie em JPG.')}}
 else if(file.type&&!/^image\//.test(file.type))throw new Error('Escolha um arquivo de imagem (JPG, PNG, WEBP ou HEIC).');
 try{return await createImageBitmap(blob)}catch(e){return await new Promise((ok,er)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>er(new Error('Não foi possível abrir essa imagem. Tente outra ou envie em JPG.'));i.src=URL.createObjectURL(blob)})}}
/* Editor de enquadramento: arrastar para posicionar e controle de zoom. */
const CROP=240;
function cropGeo(C){const w=C.img.width,h=C.img.height;const esc0=CROP/Math.min(w,h);const sc=esc0*C.zoom;const vis=CROP/sc;
 C.cx=Math.min(Math.max(C.cx,vis/2/w),1-vis/2/w);C.cy=Math.min(Math.max(C.cy,vis/2/h),1-vis/2/h);return {sx:C.cx*w-vis/2,sy:C.cy*h-vis/2,vis,sc}}
function cropDesenha(cv,tam){const C=S.crop;if(!C||!cv)return;const g=cropGeo(C);const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,tam,tam);x.drawImage(C.img,g.sx,g.sy,g.vis,g.vis,0,0,tam,tam)}
function cropFinal(){const cv=document.createElement('canvas');cv.width=cv.height=256;cropDesenha(cv,256);let q=.85,u=cv.toDataURL('image/jpeg',q);while(u.length>70000&&q>.45){q-=.1;u=cv.toDataURL('image/jpeg',q)}return u}
function cropBox(){return `<div class="cropbox"><div class="small muted">Arraste a foto para posicionar e use o controle para aproximar.</div>
 <canvas id="crop-cv" width="${CROP*2}" height="${CROP*2}" class="cropcv" aria-label="Enquadramento da foto"></canvas>
 <label class="row" style="gap:10px;width:100%;max-width:280px"><span class="small muted">−</span><input id="crop-zoom" type="range" min="1" max="4" step="0.01" value="${S.crop.zoom}" class="grow" aria-label="Zoom"><span class="small muted">+</span></label>
 <div class="row" style="gap:8px"><button class="btn sm ghost" data-act="ftcancel">Cancelar</button><button class="btn sm primary" data-act="ftsave">Salvar foto</button></div></div>`}
function cropLiga(){const cv=$('#crop-cv');if(!cv||!S.crop)return;cropDesenha(cv,CROP*2);
 let arr=null;cv.onpointerdown=e=>{arr={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId)};
 cv.onpointermove=e=>{if(!arr||!S.crop)return;const C=S.crop,g=cropGeo(C);const k=cv.getBoundingClientRect().width/CROP;
  C.cx-=(e.clientX-arr.x)/k/g.sc/C.img.width;C.cy-=(e.clientY-arr.y)/k/g.sc/C.img.height;arr={x:e.clientX,y:e.clientY};cropDesenha(cv,CROP*2)};
 cv.onpointerup=cv.onpointercancel=()=>{arr=null};
 const z=$('#crop-zoom');if(z)z.oninput=()=>{S.crop.zoom=+z.value;cropDesenha(cv,CROP*2)}}
async function fotoSalva(url){const p=ME();p.foto=url;await putNow('perfis',p);if(S.p)try{await fdb.collection('personais').doc(S.me).update({foto:url});if(S.pdoc)S.pdoc.foto=url}catch(e){console.warn(e)}}
document.addEventListener('change',async e=>{const el=e.target;
 if(el.id==='ft-arq'&&el.files?.[0]){S.fotoErr='';try{const img=await abreImagem(el.files[0]);S.crop={img,zoom:1,cx:.5,cy:.5}}catch(err){S.fotoErr=err.message}S.fotoMsg='';render()}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;
 switch(b.dataset.act){
  case 'ftsave':{if(!S.crop)break;const u=cropFinal();S.crop=null;fotoSalva(u).then(()=>{toast('Foto atualizada.');render()}).catch(err=>{S.fotoErr=errMsg(err);render()});render();break}
  case 'ftcancel':S.crop=null;render();break;
  case 'ftgoogle':fotoSalva(fbAuth.currentUser.photoURL).then(()=>{toast('Foto do Google aplicada.');render()}).catch(err=>{S.fotoErr=errMsg(err);render()});break;
  case 'ftdel':fotoSalva('').then(()=>{toast('Foto removida.');render()}).catch(err=>{S.fotoErr=errMsg(err);render()});break;
 }});
