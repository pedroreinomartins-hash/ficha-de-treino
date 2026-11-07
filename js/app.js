/* Ficha de Treino · alunos + Personal · Firebase Auth + Firestore
   Coleções: perfis, fichas, sessions, admins (Personal; criado no console). */
const REST={c:60,i:45,t:45};
const TIPOS={c:'Composto',i:'Isolador',t:'Por tempo'};
const LETRAS='ABCDEFG';
const DIAS=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
const PA='u-paugusto';
const E=(id,n,s,r,tipo,o={})=>({id,n,s,r,tipo,desc:REST[tipo],...o});
const BIKE=id=>E(id,'Bicicleta ergométrica (aquecimento)',1,'8 min','t',{hold:480,desc:30,nota:'Carga leve, cadência confortável e sem dor'});
const TPL_CONDRO={id:'f-condro',nome:'Full Body ABC – condropatia patelar',semanas:8,arquivada:false,criada:Date.UTC(2026,9,31,23,45),treinos:[
 {id:'tA',nome:'Glúteos, quadríceps em arco curto, peito e costas',dia:'Segunda',ex:[
  BIKE('a-bike'),
  E('a-legpress','Leg press 45°',3,'12-15','c',{knee:1,nota:'Arco de 0° a 60° de flexão do joelho; trave antes de descer mais'}),
  E('a-supino','Supino reto com barra',4,'6-10','c'),
  E('a-puxada','Puxada alta pela frente',4,'8-12','c'),
  E('a-hipthrust','Hip thrust',3,'8-12','c',{nota:'Foco em glúteos; afaste os pés se o joelho incomodar'}),
  E('a-desenv','Desenvolvimento com halteres (sentado)',3,'8-12','c'),
  E('a-flexora','Mesa flexora',3,'10-12','i'),
  E('a-elevlat','Elevação lateral',3,'12-15','i'),
  E('a-pant','Panturrilha em pé',3,'12-15','i'),
  E('a-spanish','Spanish squat raso (com faixa)',4,'30-45 s','t',{hold:30,knee:1,reab:1,nota:'Isométrico com joelho entre 30° e 45°; dor até 2'})]},
 {id:'tB',nome:'Posterior de coxa, costas e braços',dia:'Quarta',ex:[
  BIKE('b-bike'),
  E('b-stiff','Stiff com halteres',4,'8-10','c',{nota:'Joelhos levemente flexionados e fixos'}),
  E('b-remada','Remada baixa',4,'8-12','c'),
  E('b-supinc','Supino inclinado com halteres',3,'8-12','c'),
  E('b-extensora','Cadeira extensora (arco 90°–45°)',3,'12-15','i',{knee:1,nota:'Só de 90° até 45°; limite a amplitude na máquina; carga leve a moderada'}),
  E('b-abdutora','Cadeira abdutora',3,'15','i'),
  E('b-cruc','Crucifixo na polia',3,'12-15','i'),
  E('b-rosca','Rosca direta',3,'10-12','i'),
  E('b-triceps','Tríceps na polia',3,'10-12','i'),
  E('b-pantsent','Panturrilha sentada',3,'15','i')]},
 {id:'tC',nome:'Full Body e quadríceps isométrico',dia:'Sexta',ex:[
  BIKE('c-bike'),
  E('c-legpress','Leg press horizontal',3,'12-15','c',{knee:1,nota:'Arco de 0° a 60°; sem travar os joelhos no fim'}),
  E('c-supmaq','Supino máquina',3,'8-12','c'),
  E('c-remart','Remada articulada',3,'8-12','c'),
  E('c-pullthr','Pull-through na polia',3,'12','c',{nota:'Movimento de quadril; joelhos quase estendidos'}),
  E('c-flexsent','Flexora sentada',3,'10-12','i'),
  E('c-elevpol','Elevação lateral na polia',3,'12-15','i'),
  E('c-martelo','Rosca martelo',3,'10-12','i'),
  E('c-corda','Tríceps corda',3,'10-12','i'),
  E('c-isoext','Isometria na extensora (joelho a 60°)',4,'30-45 s','t',{hold:30,knee:1,reab:1,nota:'Carga que mantenha dor até 2'}),
  E('c-prancha','Prancha',3,'30-45 s','t',{hold:40,desc:45})]}
]};
const TPL_TEND={id:'f-tendinite',nome:'Full Body ABC – tendinite (anterior)',semanas:8,arquivada:true,criada:Date.UTC(2026,9,31,23,0),treinos:[
 {id:'A',nome:'Quadríceps, peito e estabilidade',dia:'Segunda',ex:[
  E('agachamento-smith','Agachamento no Smith',3,'10-12','c',{knee:1,nota:'Amplitude tolerada'}),E('supino-reto','Supino reto com barra',4,'8-10','c'),E('remada-baixa','Remada baixa',3,'10-12','c'),E('leg-press','Leg press',3,'12','c',{knee:1,nota:'Amplitude sem dor'}),E('desenvolvimento','Desenvolvimento com halteres',3,'10','c'),E('mesa-flexora','Mesa flexora',3,'12','i'),E('triceps-polia','Tríceps na polia',3,'12','i'),E('panturrilha-pe','Panturrilha em pé',3,'15','i'),E('spanish-squat','Spanish squat (com faixa)',4,'30-45 s','t',{knee:1,reab:1,hold:30})]},
 {id:'B',nome:'Posterior, costas e braços',dia:'Quarta',ex:[
  E('stiff','Levantamento terra romeno (stiff)',4,'8-10','c'),E('puxada-alta','Puxada alta pela frente',4,'10-12','c'),E('supino-inclinado','Supino inclinado com halteres',3,'10','c'),E('hip-thrust','Hip thrust',3,'10-12','c'),E('remada-unilateral','Remada unilateral',3,'10','c'),E('mesa-flexora','Mesa flexora',3,'12','i'),E('rosca-direta','Rosca direta',3,'10-12','i'),E('elevacao-lateral','Elevação lateral',3,'12-15','i'),E('panturrilha-sentada','Panturrilha sentada',3,'15','i'),E('extensao-isometrica','Extensão isométrica de joelho',4,'30 s','t',{knee:1,reab:1,hold:30})]},
 {id:'C',nome:'Full Body e hipertrofia',dia:'Sexta',ex:[
  E('leg-press','Leg press',3,'12','c',{knee:1}),E('supino-maquina','Supino máquina',3,'10-12','c'),E('remada-articulada','Remada articulada',3,'10-12','c'),E('cadeira-extensora','Cadeira extensora',3,'12-15','i',{knee:1}),E('mesa-flexora','Mesa flexora',3,'12','i'),E('crucifixo-polia','Crucifixo na polia',3,'12','i'),E('rosca-martelo','Rosca martelo',3,'12','i'),E('triceps-corda','Tríceps corda',3,'12','i'),E('abdominal-polia','Abdominal na polia',3,'15','i'),E('step-up','Step-up em plataforma baixa',2,'10 por perna','i',{knee:1,reab:1})]}
]};
const LEGACY={};TPL_TEND.treinos.forEach(t=>t.ex.forEach(e=>LEGACY[e.id]=e.n));
const LIB=['Abdominal infra','Abdominal na polia','Abdominal supra','Agachamento livre','Agachamento no Smith','Agachamento sumô','Bicicleta ergométrica (aquecimento)','Cadeira abdutora','Cadeira adutora','Cadeira extensora','Cadeira flexora','Crossover','Crucifixo com halteres','Crucifixo na polia','Crucifixo inverso','Desenvolvimento com barra','Desenvolvimento com halteres (sentado)','Desenvolvimento na máquina','Elevação frontal','Elevação lateral','Elevação lateral na polia','Elevação pélvica','Elíptico','Encolhimento com halteres','Esteira (caminhada)','Face pull','Flexora sentada','Glúteo na polia','Hip thrust','Leg press 45°','Leg press horizontal','Levantamento terra','Mesa flexora','Panturrilha em pé','Panturrilha no leg press','Panturrilha sentada','Peck deck','Prancha','Prancha lateral','Pull-through na polia','Pulldown com braços estendidos','Puxada alta pela frente','Puxada com triângulo','Remada articulada','Remada baixa','Remada cavalinho','Remada curvada','Remada unilateral','Rosca alternada','Rosca concentrada','Rosca direta','Rosca martelo','Rosca Scott','Spanish squat (com faixa)','Stiff com halteres','Supino declinado','Supino inclinado com barra','Supino inclinado com halteres','Supino máquina','Supino reto com barra','Supino reto com halteres','Tríceps corda','Tríceps francês','Tríceps na polia','Tríceps testa','Mergulho no banco'];
const APP_VERSAO='2026.11.07-2';
const IMG_BASE='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

/* ================= Utilidades ================= */
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(Math.floor(n)).padStart(2,'0');
const mmss=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+pad(s%60)};
const hms=s=>{s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600);return (h?h+':'+pad((s%3600)/60):Math.floor(s/60))+':'+pad(s%60)};
const fmtSec=s=>s>=60?mmss(s)+' min':s+' s';
/* Tempo digitado em minutos: "1:30" = 1 min 30 s; "2" = 2 min; "1,5" = 1 min 30 s; "45s" = 45 segundos. */
const fmtMS=s=>{s=Math.max(0,Math.round(+s||0));return Math.floor(s/60)+':'+pad(s%60)};
function parseMS(v){const t=String(v??'').trim().toLowerCase().replace(',','.');if(!t)return 0;
 let m=t.match(/^(\d+)\s*:\s*(\d{1,2})$/);if(m)return +m[1]*60+Math.min(59,+m[2]);
 m=t.match(/^(\d+(?:\.\d+)?)\s*(s|seg|segundos?)$/);if(m)return Math.round(+m[1]);
 m=t.match(/^(\d+(?:\.\d+)?)\s*(min|minutos?|m)?$/);if(m)return Math.round(+m[1]*60);return 0}
const metaDe=f=>f?Math.min(7,Math.max(1,+f.meta||f.treinos.length||3)):3;
const DAY=864e5;
function weekStart(t){const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d.getTime()}
const ddmm=t=>{const d=new Date(t);return pad(d.getDate())+'/'+pad(d.getMonth()+1)};
const dataLonga=t=>new Date(t).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short'}).replace('.','');
const firstNum=r=>parseInt(String(r).match(/\d+/)?.[0]||'10',10);
const nk=n=>String(n).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
const lcol=l=>`var(--t${Math.max(0,LETRAS.indexOf(l))%5})`;
const letter=(l,cls='')=>`<span class="letter ${cls}" style="background:${lcol(l)}">${esc(l)}</span>`;
const hcol=id=>{let h=0;for(const c of String(id))h=(h*31+c.charCodeAt(0))|0;return `var(--t${Math.abs(h)%5})`};
const ini=n=>String(n).replace(/\./g,' ').split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const fotoDe=p=>p.foto||(p.id&&(perfil(p.id)?.foto||(typeof pub==='function'?pub(p.id)?.foto:'')))||'';
const avatar=(p,cls='')=>fotoDe(p)?`<img class="av ${cls}" src="${esc(fotoDe(p))}" alt="" referrerpolicy="no-referrer">`:`<span class="av ${cls}" style="background:${p.papel==='personal'?'var(--ink)':hcol(p.id)};${p.papel==='personal'?'color:var(--bg)':''}">${esc(ini(p.nome))}</span>`;
function fmtKg(v){v=+v||0;return Number.isInteger(v)?String(v):v.toFixed(1).replace('.',',')}
const totalSets=t=>t.ex.reduce((a,e)=>a+(+e.s||0),0);
const sortS=()=>S.sessions.sort((a,b)=>b.inicio-a.inicio);
function media(name){const k=nk(name);for(const[re,id]of (window.EXMAP||[]))if(new RegExp(re).test(k))return window.EXDB[id]?{id,...window.EXDB[id]}:null;return null}
function ytEmbed(u){const m=String(u||'').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);return m?'https://www.youtube-nocookie.com/embed/'+m[1]:null}

/* ================= Normalização (inclui dados da versão anterior) ================= */
function normP(p){return p}
function normF(f){let ch=false;
 if(!f.mig1){f.treinos.forEach(t=>t.ex.forEach(e=>{if((+e.desc||0)>60)e.desc=60}));f.mig1=1;ch=true}
 return f}
function normS(s){s.letra=s.letra||s.treino||'A';s.fichaId=s.fichaId||'f-tendinite';s.treinoId=s.treinoId||s.letra;
 const ex={};for(const[k,r]of Object.entries(s.ex||{}))ex[k]={...r,n:r.n||LEGACY[k]||k};s.ex=ex;delete s.pending;delete s._p;return s}
const NORM={perfis:normP,fichas:normF,sessions:normS,vinculos:x=>x,academias:x=>x,pubs:x=>x,denuncias:x=>x};

/* ================= Estado ================= */
const S={perfis:[],fichas:[],sessions:[],personais:[],vinculos:[],academias:[],pubs:[],denuncias:[],modo:LS.get('ft4.modo','personal'),pdoc:null,me:null,g:false,p:false,gsub:'alunos',gf:'',view:'login',auth:{mode:'entrar',email:'',nome:'',err:'',ok:''},newU:null,
 sel:null,sub:'fichas',edit:null,back:'fichas',form:null,conf:null,newF:null,confirmEnd:false,confirmDel:null,
 chartEx:LS.get('ft.chartEx',''),evoF:'ativa',fb:null,fbv:null,cloud:false,ready:false,imp:null,vid:null,
 coms:{},active:LS.get('ft4.active',null)};
const cacheCol=()=>{};
const saveActive=()=>{LS.set('ft4.active',S.active);if(typeof andSync==='function')andSync()};

/* ================= Firebase (login + banco de dados na nuvem) ================= */
let fbAuth=null,fdb=null,unsubs=[],wake=null,actx=null;const SRC={};
const CFG=window.FIREBASE_CONFIG||{};
const configOK=!!(window.firebase&&CFG.apiKey&&!/COLE/.test(CFG.apiKey));
function initFirebase(){
 if(!configOK){S.view='config';render();return}
 firebase.initializeApp(CFG);fbAuth=firebase.auth();fbAuth.languageCode='pt-BR';fdb=firebase.firestore();
 fdb.enablePersistence({synchronizeTabs:true}).catch(()=>{});
 fbAuth.onAuthStateChanged(onAuth);
}
/* Contas com e-mail e senha só entram depois de confirmar o e-mail (login Google já vem confirmado). O gestor fica isento para nunca perder o acesso. */
function precisaConfirmar(u){return !!u&&!u.emailVerified&&!S.g&&(u.providerData||[]).some(x=>x.providerId==='password')}
/* Senha: mínimo 8 caracteres, com letras e números. */
const SENHA_REGRA='A senha precisa ter pelo menos 8 caracteres, com letras e números.';
function senhaOK(x){x=x||'';return x.length>=8&&/[A-Za-z]/.test(x)&&/\d/.test(x)}
async function onAuth(u){
 unsubs.forEach(f=>f());unsubs=[];if(modP.un)modP.un();modP={pid:null,un:null};for(const k in SRC)delete SRC[k];S.perfis=[];S.fichas=[];S.sessions=[];S.personais=[];S.vinculos=[];S.academias=[];S.pubs=[];S.pp=null;S.ac=null;S.inv=null;
 S.needVerify=false;
 if(!u){S.me=null;S.g=false;S.p=false;S.ready=true;S.view='login';render();return}
 S.me=u.uid;S.ready=false;render();
 const uid=u.uid,C=c=>fdb.collection(c);
 try{S.g=(await C('gestores').doc(uid).get()).exists}catch(e){S.g=false}
 try{S.p=(await C('personais').doc(uid).get()).exists}catch(e){S.p=false}
 try{const ref=C('perfis').doc(uid),ps=await ref.get();
  if(!ps.exists)await ref.set({id:uid,nome:(S.auth.nome||'').trim()||u.displayName||u.email.split('@')[0],email:u.email,papel:'aluno',personalId:'',ativo:true,ativa:null,criado:Date.now()});
 }catch(e){console.warn(e)}
 S.needVerify=precisaConfirmar(u);if(S.needVerify){S.ready=true;render();return}
 if(S.g){listen('perfis','perfis',C('perfis'));listen('fichas','fichas',C('fichas'));listen('sessions','sessions',C('sessions'));
  unsubs.push(C('personais').onSnapshot(sn=>{S.personais=sn.docs.map(d=>({...d.data(),id:d.id}));soft()},e=>console.warn(e)))}
 else if(S.p){listen('me','perfis',C('perfis').doc(uid));listen('meus','perfis',C('perfis').where('personalId','==',uid));
  listen('fichasP','fichas',C('fichas').where('personalId','==',uid));listen('globais','fichas',C('fichas').where('global','==',true));
  listen('sessP','sessions',C('sessions').where('personalId','==',uid));
  listen('fichasMe','fichas',C('fichas').where('alunoId','==',uid));listen('sessMe','sessions',C('sessions').where('alunoId','==',uid))}
 else{listen('me','perfis',C('perfis').doc(uid));listen('fichasMe','fichas',C('fichas').where('alunoId','==',uid));
  listen('globais','fichas',C('fichas').where('global','==',true));listen('sessMe','sessions',C('sessions').where('alunoId','==',uid))}
 const em=(u.email||'').toLowerCase();
 if(S.g){listen('vincG','vinculos',C('vinculos'));listen('acadG','academias',C('academias'));listen('denG','denuncias',C('denuncias'))}
 else{listen('acadOk','academias',C('academias').where('aprovada','==',true));listen('pubs','pubs',C('personais').where('publico','==',true));
  if(S.p){listen('vincP','vinculos',C('vinculos').where('personalId','==',uid));listen('acadMinhas','academias',C('academias').where('sugeridaPor','==',uid))}}
 if(!S.g){listen('vincA','vinculos',C('vinculos').where('alunoId','==',uid));if(u.emailVerified&&em)listen('vincE','vinculos',C('vinculos').where('alunoEmail','==',em))}
 andListen(uid);
 if(!S.g)unsubs.push(C('personais').doc(uid).onSnapshot(d=>{S.pdoc=d.exists?d.data():null;if(S.ready&&d.exists!==S.p)onAuth(fbAuth.currentUser);else soft()},()=>{}));
 S.view=myActive()?'treino':PM()?'alunos':'inicio';
}
let modP={pid:null,un:null};
function syncModP(){if(S.g)return;const pid=ME()?.personalId||'';if(pid===modP.pid)return;
 if(modP.un)modP.un();delete SRC.modelosP;modP={pid,un:null};
 if(pid)modP.un=fdb.collection('fichas').where('modelo','==',true).where('personalId','==',pid).where('alunos','==',true).onSnapshot(sn=>{SRC.modelosP={c:'fichas',docs:sn.docs.map(d=>NORM.fichas({...d.data(),id:d.id}))};merge('fichas');soft()},e=>console.warn(e));
 else merge('fichas')}
function merge(c){const m=new Map();Object.values(SRC).filter(x=>x.c===c).forEach(x=>x.docs.forEach(d=>m.set(d.id,d)));S[c]=[...m.values()];if(c==='sessions')sortS()}
function listen(key,c,ref){unsubs.push(ref.onSnapshot(sn=>{
  const docs=sn.docs?sn.docs.filter(d=>d.exists!==false):(sn.exists?[sn]:[]);
  SRC[key]={c,docs:docs.map(d=>NORM[c]({...d.data(),id:d.id}))};S.cloud=!sn.metadata.fromCache;merge(c);
  if(key==='me')syncModP();
  if(key==='sessP')novosTreinos();
  if(c==='vinculos'||key==='me')setTimeout(syncVinculo,0);
  if(!S.ready&&SRC[S.g?'perfis':'me']){S.ready=true;render()}else soft();
 },e=>{console.warn(key,e);if(!S.ready){S.ready=true;render()}}))}
function stamp(c,o){
 if(c==='fichas'){if(o.modelo){if(o.global)o.personalId='';else if(!o.personalId)o.personalId=S.me}else o.personalId=perfil(o.alunoId)?.personalId||''}
 if(c==='sessions')o.personalId=perfil(o.alunoId)?.personalId||''}
function put(c,o){stamp(c,o);const arr=S[c];const i=arr.findIndex(x=>x.id===o.id);if(i>=0)arr[i]=o;else arr.unshift(o);if(c==='sessions')sortS();
 if(fdb)fdb.collection(c).doc(o.id).set(clone(o)).catch(e=>{console.warn(e);toast('Não foi possível salvar. Verifique a conexão e tente de novo.')})}
function del(c,id){S[c]=S[c].filter(x=>x.id!==id);if(fdb)fdb.collection(c).doc(id).delete().catch(e=>console.warn(e))}
function soft(){if(S.view==='treino'||document.activeElement?.matches?.('#app input,#app textarea,#app select'))return;render()}
function toast(t){let el=$('#toast');if(!el){el=document.createElement('div');el.id='toast';document.body.appendChild(el)}el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,3500)}
const AUTH_ERR={'auth/invalid-email':'E-mail inválido.','auth/missing-password':'Informe a senha.','auth/weak-password':SENHA_REGRA,'auth/email-already-in-use':'Este e-mail já tem cadastro. Use "Entrar".','auth/invalid-credential':'E-mail ou senha incorretos.','auth/wrong-password':'E-mail ou senha incorretos.','auth/user-not-found':'E-mail não cadastrado.','auth/too-many-requests':'Muitas tentativas. Aguarde alguns minutos.','auth/network-request-failed':'Sem conexão com a internet.','auth/operation-not-allowed':'Esse tipo de login não está ativado no Firebase.','auth/unauthorized-domain':'Este endereço não está autorizado no Firebase (Authentication → Settings → Domínios autorizados).','auth/account-exists-with-different-credential':'Este e-mail já tem cadastro com senha. Entre com e-mail e senha.'};
const authMsg=e=>AUTH_ERR[e?.code]||('Não foi possível concluir: '+(e?.message||e));
async function putNow(c,o){stamp(c,o);const arr=S[c];const i=arr.findIndex(x=>x.id===o.id);if(i>=0)arr[i]=o;else arr.unshift(o);await fdb.collection(c).doc(o.id).set(clone(o))}
function restamp(aid){fichasDe(aid).forEach(f=>put('fichas',f));sessDe(aid).forEach(x=>put('sessions',x))}
function novoCodigo(nome){const base=nk(nome).replace(/[^a-z]/g,'').toUpperCase().slice(0,4).padEnd(3,'X');const usados=new Set(S.personais.map(x=>x.codigo));
 for(let i=0;i<200;i++){const c=base+String(10+Math.floor(Math.random()*90));if(!usados.has(c))return c}return base+Date.now().toString(36).slice(-3).toUpperCase()}
async function liberarPersonal(uid){const p=perfil(uid);const codigo=novoCodigo(p.nome);const b=fdb.batch();
 b.set(fdb.collection('personais').doc(uid),{nome:p.nome,codigo,criado:Date.now(),foto:p.foto||''});b.set(fdb.collection('convites').doc(codigo),{personalId:uid});
 b.update(fdb.collection('perfis').doc(uid),{papel:'personal'});await b.commit();return codigo}
async function revogarPersonal(uid){const x=S.personais.find(y=>y.id===uid);const b=fdb.batch();b.delete(fdb.collection('personais').doc(uid));
 if(x?.codigo)b.delete(fdb.collection('convites').doc(x.codigo));b.update(fdb.collection('perfis').doc(uid),{papel:'aluno'});await b.commit()}
const pnCache={};
function nomeP(pid){if(!pid)return '';const x=S.personais?.find(y=>y.id===pid);if(x)return x.nome;if(pid===S.me)return ME()?.nome||'';
 if(pnCache[pid]===undefined){pnCache[pid]='';fdb.collection('personais').doc(pid).get().then(d=>{pnCache[pid]=d.exists?d.data().nome:'';soft()}).catch(()=>{})}return pnCache[pid]||'seu Personal'}
/* ================= Consultas ================= */
const perfil=id=>S.perfis.find(p=>p.id===id);
const ME=()=>perfil(S.me);
const isPT=()=>S.p||S.g;
const PM=()=>S.p&&S.modo!=='aluno';
const canEdit=f=>!f.modelo||S.g||(!f.global&&f.personalId===S.me);
const alunos=(todos)=>S.perfis.filter(p=>(p.papel==='aluno'||!!p.personalId)&&!(PM()&&p.id===S.me)&&(todos||p.ativo!==false)).sort((a,b)=>a.nome.localeCompare(b.nome,'pt'));
const ficha=id=>S.fichas.find(f=>f.id===id);
/* Modelos visíveis: gestor vê todos; Personal vê os globais e os próprios; aluno vê os globais e os que o Personal dele disponibilizou. */
const modeloVisivel=f=>S.g||f.global||(PM()||S.p)&&f.personalId===S.me||(f.alunos===true&&f.personalId&&f.personalId===ME()?.personalId);
const fichasDe=o=>o==='modelos'?S.fichas.filter(f=>f.modelo&&modeloVisivel(f)):S.fichas.filter(f=>f.alunoId===o&&!f.modelo);
const sessDe=aid=>S.sessions.filter(s=>s.alunoId===aid);
function ativaDe(aid){const p=perfil(aid),f=p&&ficha(p.ativa);return f&&!f.arquivada&&f.alunoId===aid?f:null}
function setAtiva(aid,fid){const p=perfil(aid);if(!p)return;p.ativa=fid;put('perfis',p)}
function lastFor(name,aid){const k=nk(name);for(const s of S.sessions){if(s.alunoId!==aid)continue;for(const r of Object.values(s.ex||{}))if(nk(r.n)===k&&r.sets?.length)return {s,r}}return null}
function nextIdx0(f){const ss=S.sessions.filter(s=>s.fichaId===f.id);if(!ss.length||!f.treinos.length)return 0;const i=f.treinos.findIndex(t=>t.id===ss[0].treinoId);return i<0?0:(i+1)%f.treinos.length}
function weekCount(ws,aid,fid){return S.sessions.filter(s=>s.alunoId===aid&&weekStart(s.inicio)===ws&&(!fid||s.fichaId===fid)).length}
function programWeek(f){const ss=S.sessions.filter(s=>s.fichaId===f.id);if(!ss.length)return 1;return Math.floor((weekStart(Date.now())-weekStart(Math.min(...ss.map(s=>s.inicio))))/(7*DAY))+1}
/* Alertas do painel do Personal. Cada um tem uma chave (k): o Personal marca "Ciente" e ele some,
   voltando só com um fato novo. Ausência volta 7 dias depois do "Ciente" se o aluno seguir sem treinar. */
function alertasTodos(aid){const out=[],now=Date.now(),ss=sessDe(aid);
 fichasDe(aid).filter(f=>f.origem==='ia'&&f.autorId===aid&&now-(f.criada||0)<14*DAY).forEach(f=>out.push({k:'ia:'+f.id,c:'info',t:`Criou a ficha “${f.nome}” com sugestão de IA em ${ddmm(f.criada)}. Vale revisar.`}));
 if(!ss.length){out.push({k:'semreg',c:'warn',t:'Ainda não registrou treinos'});out.push(...alertasExtras(aid));return out}
 const dias=Math.floor((now-ss[0].fim)/DAY);if(dias>=5)out.push({k:'aus:'+ss[0].id,c:'warn',t:`Sem treinar há ${dias} dias`,volta:7*DAY});
 ss.filter(s=>!s.corrida&&now-s.inicio<14*DAY).forEach(s=>{const rs=Object.values(s.ex||{}).filter(r=>r.dor!=null);const pior=rs.sort((a,b)=>b.dor-a.dor)[0];
  if(pior&&pior.dor>=5)out.push({k:'dor:'+s.id,c:'bad',t:`Dor ${pior.dor}/10 em ${pior.n} (${ddmm(s.inicio)})`});
  if(s.dor24==='pior')out.push({k:'d24:'+s.id,c:'bad',t:`Dor piorou nas 24 h após o treino de ${ddmm(s.inicio)}`});
  if(s.feedback?.pse>=9)out.push({k:'pse:'+s.id,c:'warn',t:`Esforço ${s.feedback.pse}/10 em ${ddmm(s.inicio)}`});
  if(s.feedback?.txt&&now-s.inicio<7*DAY)out.push({k:'rec:'+s.id,c:'info',t:`“${s.feedback.txt}” (${ddmm(s.inicio)})`})});
 out.push(...corridaAlertas(aid));
 out.push(...alertasExtras(aid));
 return out}
function alertaVisto(p,a){const t=p?.vistos?.[a.k];return !!t&&(!a.volta||Date.now()-t<a.volta)}
function alertas(aid){const p=perfil(aid);return alertasTodos(aid).filter(a=>!a.k||!alertaVisto(p,a))}
function marcarCiente(aid,ks){const p=perfil(aid);if(!p||!ks.length)return;const now=Date.now(),v={};
 Object.entries(p.vistos||{}).forEach(([k,t])=>{if(now-t<120*DAY)v[k]=t});ks.forEach(k=>v[k]=now);p.vistos=v;render();
 if(fdb)fdb.collection('perfis').doc(aid).update({vistos:v}).catch(e=>{console.warn(e);toast('Não foi possível salvar. Verifique a conexão.')})}

/* ================= Som, vibração, tela ativa ================= */
function unlockAudio(){somAudio()}
function beep(){try{if(!actx)return;const t=actx.currentTime;[0,.28,.56].forEach((d,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=i===2?1175:880;g.gain.setValueAtTime(.0001,t+d);g.gain.exponentialRampToValueAtTime(.4,t+d+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d+.22);o.connect(g).connect(actx.destination);o.start(t+d);o.stop(t+d+.25)})}catch(e){}}
function alertDone(){alertaSom('fimDescanso')}
/* Sessão de áudio da musculação: mantém o app ativo com a tela apagada e mostra o passo no controle de mídia. */
function mediaMusc(){const a=myActive();if(!a||a.tipo==='corrida')return;
 sessaoAudio.iniciar({next:()=>{const x=myActive();if(x&&x.restEnd){x.restEnd=null;saveActive();render()}},pause:null,play:null});infoMusc()}
function infoMusc(){const a=myActive();if(!a||a.tipo==='corrida')return;const ex=curEx();const n=Math.min((a.ex[ex.id]?.sets.length||0)+1,ex.s);const now=Date.now();
 if(a.holdEnd)sessaoAudio.info('Tempo · '+mmss((a.holdEnd-now)/1000),ex.n);
 else if(a.restEnd&&a.restEnd>now)sessaoAudio.info('Descanso · '+mmss((a.restEnd-now)/1000),'A seguir: '+ex.n+' · série '+n+' de '+ex.s);
 else sessaoAudio.info(ex.n,'Série '+n+' de '+ex.s+' · treino '+a.letra)}
async function keepAwake(){if(!S.active||document.visibilityState!=='visible')return;try{if('wakeLock' in navigator&&!wake){wake=await navigator.wakeLock.request('screen');wake.addEventListener('release',()=>{wake=null;const w=$('#wakeTag');if(w)w.textContent='Tela pode apagar'})}}catch(e){wake=null}const w=$('#wakeTag');if(w)w.textContent=wake?'Tela ativa':'Tela pode apagar'}
function releaseAwake(){try{wake&&wake.release()}catch(e){}wake=null}

/* ================= Sessão de treino ================= */
const myActive=()=>S.active&&(S.active.alunoId===S.me||S.active.cond===S.me)?S.active:null;
const curEx=()=>S.active.exList[S.active.idx];
function rec(ex){const a=S.active;return a.ex[ex.id]||(a.ex[ex.id]={n:ex.n,sets:[],dor:null,...(ex.knee?{ad:1}:{})})}
/* O treino teve exercício com escala de dor? (para a pergunta das 24 h) */
function temEscalaDor(s){if(s.corrida)return s.corrida.dor!=null;const rs=Object.values(s.ex||{});if(rs.some(r=>r.ad||r.dor!=null))return true;
 const t=ficha(s.fichaId)?.treinos?.find(x=>x.id===s.treinoId);return !!t&&t.ex.some(e=>e.knee&&s.ex?.[e.id])}
function draft(ex){const a=S.active;if(!a.draft[ex.id]){const l=lastFor(ex.n,a.alunoId);const ls=l?.r.sets[l.r.sets.length-1];a.draft[ex.id]=ex.tipo==='t'?{sec:ls?.sec??ex.hold??30}:{kg:(+ex.kg>0?+ex.kg:ls?.kg)??0,reps:ls?.reps??firstNum(ex.r)}}return a.draft[ex.id]}
function startSession(fid,tid,aid){unlockAudio();const f=ficha(fid),ti=f.treinos.findIndex(t=>t.id===tid),t=f.treinos[ti];if(!t||!temConteudo(t))return;const cond=aid&&aid!==S.me;{const d=andDe(cond?aid:S.me);if(d&&d.controle!==S.me&&t.tipo!=='corrida')return toast(cond?'Este aluno já está com um treino em andamento. Use “Assumir e continuar”.':'Seu treino está em andamento em outro celular. Use “Retomar no meu celular”.')}if(t.tipo==='corrida'){if(cond)return toast('A condução pelo Personal vale para treinos de musculação.');return startCorrida(f,t,ti)}const now=Date.now();
 S.active={id:uid('s'),alunoId:cond?aid:S.me,fichaId:f.id,treinoId:t.id,letra:LETRAS[ti],treinoNome:t.nome,exList:clone(t.ex),inicio:now,idx:0,ex:{},draft:{},skip:{},restEnd:null,holdEnd:null};migraGrupos(S.active.exList);
 if(cond){S.active.cond=S.me;S.active.condNome=ME()?.nome||'Personal';S.active.alunoNome=perfil(aid)?.nome||'aluno'}
 S.view='treino';S.confirmEnd=false;saveActive();render();keepAwake();mediaMusc()}
const isDone=ex=>(S.active.ex[ex.id]?.sets.length||0)>=ex.s||!!S.active.skip?.[ex.id];
const isSkip=ex=>!!S.active.skip?.[ex.id]&&!(S.active.ex[ex.id]?.sets.length>=ex.s);
function nextIdx(from){const L=S.active.exList;for(let k=1;k<=L.length;k++){const j=(from+k)%L.length;if(!isDone(L[j]))return j}return from}
function startRest(ex,seg){const a=S.active;if(a.exList.every(isDone)){a.restEnd=null;return}const sec=seg!=null?+seg:(+ex.desc||0);if(!sec){a.restEnd=null;return}a.restEnd=Date.now()+sec*1000;a.restTotal=sec;a.restEx=ex.id;a.restAlerted=false}
function logSet(vals){const a=S.active,ex=curEx();rec(ex).sets.push({...vals,t:Date.now()});
 const tc=TECNICAS[ex.tec];
 if(tc?.sub&&vals.sec==null){a.restEnd=null;a.sub={ex:ex.id,tipo:tc.sub};a.subd=tc.sub==='drop'?{kg:Math.round((+vals.kg||0)*.75*2)/2,reps:+vals.reps||0}:{kg:+vals.kg||0,reps:Math.max(1,Math.round((+vals.reps||0)/3))};
  if(tc.pausa){a.miniEnd=Date.now()+tc.pausa*1000;a.miniTot=tc.pausa;a.miniAlert=false}saveActive();render();return}
 avancar(ex)}
/* Depois da série: descanso e próximo exercício. Nos exercícios combinados, passa ao seguinte do grupo
   (com o descanso entre exercícios, se houver) e, no fim da rodada, aplica o descanso entre rodadas. */
function avancar(ex){const a=S.active;a.sub=null;a.miniEnd=null;const g=grupos(a.exList)[a.idx];
 if(g){const G=grpInfo(a.exList,g);const pend=g.filter(j=>!isDone(a.exList[j]));const seg=pend.find(j=>j>a.idx);
  if(seg!=null){if(G.dx>0)startRest(ex,G.dx);else a.restEnd=null;a.idx=seg}else{startRest(ex,G.dr);a.idx=pend.length?pend[0]:nextIdx(a.idx)}saveActive();render();return}
 startRest(ex);if(isDone(ex))a.idx=nextIdx(a.idx);saveActive();render()}
function subLog(){const a=S.active,ex=curEx(),r=rec(ex),ls=r.sets[r.sets.length-1];if(!ls)return;(ls.x=ls.x||[]).push({kg:+a.subd.kg||0,reps:+a.subd.reps||0});
 const tc=TECNICAS[ex.tec];if(tc?.sub==='drop')a.subd.kg=Math.round((+a.subd.kg||0)*.75*2)/2;if(tc?.pausa){a.miniEnd=Date.now()+tc.pausa*1000;a.miniTot=tc.pausa;a.miniAlert=false}saveActive();render()}
function finishHold(){const a=S.active;if(!a?.holdEnd)return;const sec=a.holdSec;a.holdEnd=null;alertaSom('fimTempo',{texto:'Tempo! Série concluída.'});logSet({sec})}
function endSession(keep){const a=S.active;releaseAwake();sessaoAudio.parar();if(keep)alertaSom('fim',{texto:'Treino concluído. Parabéns!'});
 if(keep){const ex={};for(const[k,v]of Object.entries(a.ex))if(v.sets.length)ex[k]={n:v.n,sets:v.sets.map(({t,a,...x})=>x),dor:v.dor};const fim=Date.now();
  const s={id:a.id,alunoId:a.alunoId,fichaId:a.fichaId,treinoId:a.treinoId,letra:a.letra,treinoNome:a.treinoNome,inicio:a.inicio,fim,dur:Math.round((fim-a.inicio)/1000),ex,dor24:null,feedback:null};
  const pul=a.exList.filter(e=>a.skip?.[e.id]&&!(a.ex[e.id]?.sets.length)).map(e=>e.n);if(pul.length)s.pulados=pul;
  if(a.cond){s.conduzidoPor=a.cond;s.conduzidoNome=a.condNome}
  put('sessions',s);S.fb=s.id;S.fbv=null;atualizaCargas(a);
  if(!a.cond){const meta=metaDe(ficha(a.fichaId));S.metaMsg={wk:weekCount(weekStart(a.inicio),a.alunoId),meta}}}
 andFim(a);const cond=a.cond;S.active=null;S.confirmEnd=false;saveActive();
 if(cond){S.sel=a.alunoId;S.sub='historico';S.view='aluno';if(!keep)S.fb=null}else S.view='inicio';render()}
/* A maior carga usada em cada exercício passa a ser a carga de referência da ficha. */
function atualizaCargas(a){const f=ficha(a.fichaId);if(!f||!canEdit(f))return;const t=f.treinos.find(x=>x.id===a.treinoId);if(!t)return;let mud=false;
 t.ex.forEach(e=>{const r=a.ex[e.id];if(!r||e.tipo==='t')return;const mx=Math.max(0,...r.sets.map(x=>+x.kg||0));if(mx>0&&mx!==+e.kg){e.kg=mx;mud=true}});if(mud)saveF(f)}

/* ================= Peças comuns ================= */
const IC={
 comunidade:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>',
 inicio:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
 fichas:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/></svg>',
 progresso:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/></svg>',
 perfil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
 ficha_old:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
 evolucao:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M5 16l4-5 4 3 6-8"/></svg>',
 historico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
 alunos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.8c1.8.7 3 2.5 3.5 5.2"/></svg>',
 gestao:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
 modelos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M17.5 14v7M14 17.5h7"/></svg>'
};
function tabs(){const list=(PM()?[['alunos','Alunos'],['modelos','Modelos'],['comunidade','Comunidade']]:[['inicio','Início'],['fichas','Treinos'],['progresso','Progresso'],['comunidade','Comunidade'],['perfil','Perfil']]).concat(S.g?[['gestao','Gestão']]:[]);
 const home=PM()?'alunos':S.g?'gestao':'alunos';const map={ficha:S.back==='aluno'?home:S.back,aluno:home,perfil:PM()?'':'perfil',busca:'',ia:S.ia?.back||'',corridaReg:'inicio',evolucao:'progresso',historico:'progresso'};const cur=S.view in map?map[S.view]:S.view;
 return `<nav class="tabs"><div class="in" style="grid-template-columns:repeat(${list.length},1fr)">${list.map(([k,l])=>`<button data-act="tab" data-v="${k}" class="${cur===k?'on':''}">${IC[k]}${l}</button>`).join('')}</div></nav>`}
function syncTag(){return `<div id="syncTag" class="sync ${S.cloud?'on':''}"><i></i><span>${S.cloud?'Sincronizado':'Sem conexão · salva depois'}</span></div>`}
function meChip(){const p=ME()||{id:S.me,nome:'Conta',papel:'aluno'};return `<button class="me" data-act="tab" data-v="perfil" aria-label="Meu perfil">${avatar(p,'s')}<span>${esc(p.nome)}</span></button>`}
function activeBanner(){const a=myActive();if(!a)return andBannerAluno();return `<button class="banner" data-act="tab" data-v="treino"><span class="letter s" style="background:rgba(255,255,255,.22)">${esc(a.letra)}</span><span class="grow"><b>Treino em andamento${a.cond?' · '+esc(a.alunoNome):''}</b><br><span class="small">Toque para voltar à sessão</span></span><span class="num" id="elapsed" style="font-size:22px"></span></button>`}
function page(eyebrow,title,body,{back}={}){return `<main class="wrap"><header class="top"><div style="min-width:0">${back?`<button class="btn sm ghost" data-act="tab" data-v="${back}" style="margin-bottom:8px">‹ Voltar</button>`:''}<div class="eyebrow">${eyebrow}</div><h1>${title}</h1></div><div class="topR">${meChip()}${syncTag()}</div></header>${activeBanner()}${body}</main>${tabs()}`}

/* ================= Login ================= */
function viewConfig(){return `<main class="wrap"><div><div class="eyebrow">Configuração pendente</div><h1>Ficha de Treino</h1></div><section class="panel"><p>O app ainda não está ligado ao Firebase. Abra o arquivo <b>js/config.js</b> no GitHub e cole a configuração do seu projeto Firebase, conforme o passo a passo do README.</p></section></main>`}
function viewVerificar(){const em=fbAuth?.currentUser?.email||'';
 return `<main class="wrap" style="max-width:440px"><header style="padding-top:8vh"><div class="eyebrow">Falta só um passo</div><h1 style="font-size:36px">Confirme seu e-mail</h1></header>
 <section class="panel"><p>Enviamos um link de confirmação para <b>${esc(em)}</b>. Abra o e-mail, toque no link e depois volte aqui.</p>
 <div class="small muted">Não encontrou? Confira a caixa de spam ou lixo eletrônico.</div>
 ${S.pf?.err?`<div class="note bad">${esc(S.pf.err)}</div>`:''}
 <button class="btn primary big" data-act="vfok">Já confirmei</button>
 <button class="btn ghost" data-act="vfsend">Reenviar e-mail de confirmação</button>
 <button class="btn ghost" data-act="logout">Sair e usar outra conta</button></section></main>`}
function viewSplash(){return `<main class="wrap"><div class="center" style="padding-top:30vh"><h1>Ficha de Treino</h1><div class="muted">Carregando…</div></div></main>`}
function viewLogin(){const A=S.auth,cad=A.mode==='criar',rec=A.mode==='senha';
 return `<main class="wrap" style="max-width:440px"><header style="padding-top:8vh"><div class="eyebrow">Treino, carga e frequência</div><h1 style="font-size:40px">Ficha de Treino</h1></header>
 ${rec?'':`<button class="btn gbtn" type="button" data-act="google" ${A.busy?'disabled':''}><svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Entrar com Google</button>
 <div class="or"><span>ou com e-mail e senha</span></div>
 <div class="subtabs"><button data-act="amode" data-v="entrar" class="${!cad?'on':''}">Entrar</button><button data-act="amode" data-v="criar" class="${cad?'on':''}">Criar conta</button></div>`}
 <form class="panel" id="authForm" novalidate>
  ${rec?'<h2>Redefinir senha</h2><div class="small muted">Enviaremos um link para o seu e-mail.</div>':''}
  ${cad?`<div class="field"><label class="lbl" for="au-nome">Seu nome</label><input id="au-nome" class="txt" autocomplete="name" value="${esc(A.nome)}" placeholder="Ex.: P. Augusto"></div>`:''}
  <div class="field"><label class="lbl" for="au-email">E-mail</label><input id="au-email" class="txt" type="email" autocomplete="email" inputmode="email" value="${esc(A.email)}"></div>
  ${rec?'':`<div class="field"><label class="lbl" for="au-senha">Senha${cad?' (mínimo 8, com letras e números)':''}</label><input id="au-senha" class="txt" type="password" autocomplete="${cad?'new-password':'current-password'}"></div>`}
  ${A.err?`<div class="note bad">${esc(A.err)}</div>`:''}${A.ok?`<div class="note good">${esc(A.ok)}</div>`:''}
  <button class="btn primary big" type="submit" ${A.busy?'disabled':''}>${rec?'Enviar link':cad?'Criar conta':'Entrar'}</button>
  ${rec?`<button class="btn ghost" type="button" data-act="amode" data-v="entrar">Voltar</button>`:cad?'':`<button class="btn ghost" type="button" data-act="amode" data-v="senha">Esqueci minha senha</button>`}
 </form>
 <div class="small muted" style="text-align:center">Alunos podem criar a própria conta. O acesso de Personal é liberado pelo administrador.</div></main>`}
async function googleLogin(){const A=S.auth;A.err='';A.ok='';const prov=new firebase.auth.GoogleAuthProvider();prov.setCustomParameters({prompt:'select_account'});
 try{await fbAuth.signInWithPopup(prov)}
 catch(e){if(e?.code==='auth/popup-blocked'||e?.code==='auth/operation-not-supported-in-this-environment'){try{await fbAuth.signInWithRedirect(prov);return}catch(e2){e=e2}}
  if(e?.code==='auth/popup-closed-by-user'||e?.code==='auth/cancelled-popup-request')return;A.err=authMsg(e);render()}}
async function submitAuth(){const A=S.auth;A.email=($('#au-email')?.value||'').trim();if($('#au-nome'))A.nome=$('#au-nome').value;const senha=$('#au-senha')?.value||'';A.err='';A.ok='';
 if(A.mode==='criar'&&!A.nome.trim()){A.err='Informe seu nome.';render();return}
 if(A.mode==='criar'&&!senhaOK(senha)){A.err=SENHA_REGRA;render();return}
 A.busy=true;render();
 try{if(A.mode==='senha'){await fbAuth.sendPasswordResetEmail(A.email);A.ok='Link enviado. Confira sua caixa de entrada e o spam.'}
  else if(A.mode==='criar'){const cr=await fbAuth.createUserWithEmailAndPassword(A.email,senha);try{await cr.user.sendEmailVerification()}catch(e){}}
  else await fbAuth.signInWithEmailAndPassword(A.email,senha)}
 catch(e){A.err=authMsg(e)}
 A.busy=false;if(!S.me)render()}

/* ================= Aluno: Início ================= */
function fbPanel(){const s=S.sessions.find(x=>x.id===S.fb);if(!s)return '';const pc=!!s.conduzidoPor;
 return `<section class="form"><div class="eyebrow">Treino ${esc(s.letra)} salvo · ${Math.round(s.dur/60)} min${pc?' · conduzido por você':''}</div>${pc?'':metaMsgHTML()}<h2>${pc?'Como o aluno avaliou o treino?':'Como foi o treino?'}</h2>${pc?'':checkinBox(s)}
 <div class="field"><span class="lbl">Esforço percebido (1 = muito leve · 10 = máximo)</span><div class="pse">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button data-act="fbv" data-v="${n}" class="${S.fbv===n?'sel':''}">${n}</button>`).join('')}</div></div>
 <div class="field"><label class="lbl" for="fb-txt">${pc?'Observação sobre o treino (opcional)':'Recado para o Personal (opcional)'}</label><textarea id="fb-txt" class="txt" placeholder="Ex.: senti incômodo no leg press na última série"></textarea></div>
 <div class="nav2"><button class="btn ghost" data-act="fbskip">Pular</button><button class="btn primary" data-act="fbsave">Enviar</button></div></section>`}
function diaFeito(t){const i=(new Date(t).getDay()+6)%7;return (i>=5?'no ':'na ')+DIAS[i].toLowerCase()}
function saudacao(){const h=new Date().getHours();return h>=5&&h<12?'Bom dia':h>=12&&h<18?'Boa tarde':'Boa noite'}
/* Faixa colorida do topo das telas do aluno: marca, saudação/título e o Personal vinculado. */
function heroTopo(titulo,sub,{personal}={}){const p=ME()||{id:S.me,nome:'',papel:'aluno'};
 const pid=personal&&p.personalId;const px=pid?(pub(pid)||{nome:nomeP(pid)}):null;
 const pchip=px?`<button class="hpers" data-act="tab" data-v="perfil">${avatar({id:pid,nome:px.nome||'P',papel:'personal',foto:px.foto},'s')}<span><b>Seu Personal: ${esc(px.nome||'Personal')}</b>${px.cref?`<small>${esc(crefTxt(px))}</small>`:''}</span></button>`:'';
 return `<header class="hero"><div class="in"><div class="hbar"><span class="hbrand">Pro Treino</span><span class="hsync ${S.cloud?'on':''}" id="syncTag" title="${S.cloud?'Sincronizado':'Sem conexão · salva depois'}"><i></i><span>${S.cloud?'Sincronizado':'Offline'}</span></span><button class="hav" data-act="tab" data-v="perfil" aria-label="Meu perfil">${avatar({...p,id:S.me},'s')}</button></div>
 <h1>${titulo}</h1>${sub?`<div class="hsub">${sub}</div>`:''}${pchip}</div></header>`}
function pageHero(titulo,sub,body,o={}){return `${heroTopo(titulo,sub,o)}<main class="wrap pull${o.personal?' deep':''}">${activeBanner()}${body}</main>${tabs()}`}
const ICK={check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
 play:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
 halter:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/></svg>',
 grafico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/></svg>',
 relogio:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 corrida:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="14" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 2 1 4M11 15l1-5 4 3h3M12 10l-3-1-3 3"/></svg>',
 seta:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'};
function ehHoje(t){if(!t?.dia)return false;const i=(new Date().getDay()+6)%7;return nk(t.dia)===nk(DIAS[i])}
function durMedia(f,t,aid){const ss=sessDe(aid).filter(s=>s.fichaId===f.id&&s.treinoId===t.id&&s.dur>0).slice(0,5);if(!ss.length)return 0;return Math.round(ss.reduce((a,s)=>a+s.dur,0)/ss.length/60)}
function viewInicio(){
 if(!ME())return page('Conta','Ficha de Treino',`<div class="empty">Seu cadastro não foi encontrado ou foi desativado. Fale com o Personal.</div>`);
 const aid=S.me,f=ativaDe(aid),now=Date.now(),ws=weekStart(now),ss=sessDe(aid);
 const last=ss[0];let check='';
 if(!S.fb&&last&&last.dor24==null&&!myActive()&&now-last.fim>16*3600e3&&now-last.fim<6*DAY&&temEscalaDor(last))
  check=`<section class="panel"><div class="eyebrow">Dor · resposta em 24 h</div><h2>Como você ficou depois do treino ${esc(last.letra)} de ${dataLonga(last.inicio)}?</h2><div class="small muted">Pense nos pontos avaliados na escala de dor.</div><div class="choices">${[['melhor','Melhor'],['igual','Igual'],['pior','Pior']].map(([k,l])=>`<button class="btn ghost" data-act="dor24" data-v="${k}">${l}</button>`).join('')}</div></section>`;
 const meta=metaDe(f),wk=weekCount(ws,aid);
 const dias=['S','T','Q','Q','S','S','D'].map((d,i)=>{const t0=ws+i*DAY;const s=ss.find(x=>x.inicio>=t0&&x.inicio<t0+DAY);const hj=now>=t0&&now<t0+DAY;
  return `<div class="fday ${hj?'hj':''}"><span class="fc ${s?'ok':''}" ${s?`title="Treino ${esc(s.letra)}"`:''}>${s?ICK.check:''}</span>${d}<span class="sr">${DIAS[i]}${s?', treino feito':hj?', hoje':''}</span></div>`}).join('');
 const freq=`<section class="card freq"><div class="fhead"><h2>Frequência da semana</h2><span class="small muted"><b class="num">${wk}</b> de ${meta} treinos</span></div>
  <div class="fweek">${dias}</div>${f?`<div class="small muted">${wk>=meta?'<b class="ok">Meta da semana cumprida ✓</b> · ':''}Semana ${programWeek(f)} de ${f.semanas||8} do ciclo</div>`:''}</section>`;
 const atalhos=`<nav class="atalhos" aria-label="Atalhos">
  <button data-act="tab" data-v="fichas"><span class="ai">${ICK.halter}</span>Meus treinos</button>
  <button data-act="psub" data-v="graficos"><span class="ai">${ICK.grafico}</span>Meu progresso</button>
  <button data-act="psub" data-v="historico"><span class="ai">${ICK.relogio}</span>Histórico</button>
  <button data-act="regnova" ${myActive()?'disabled':''}><span class="ai">${ICK.corrida}</span>Registrar corrida</button></nav>`;
 let hoje='';
 if(!f)hoje=`<section class="card"><h2>Você ainda não tem uma ficha</h2><div class="small muted">O Personal pode montar uma para você, ou você mesmo pode criar a sua.</div><button class="btn primary" data-act="tab" data-v="fichas">Montar minha ficha</button></section>`;
 else if(!myActive()&&!andOutro()){const ni=nextIdx0(f),nt=f.treinos[ni];
  if(!nt)hoje=`<section class="card"><h2>A ficha “${esc(f.nome)}” ainda não tem treinos</h2><button class="btn primary" data-act="open" data-v="${f.id}">Montar treinos</button></section>`;
  else{const hj=ehHoje(nt),dm=durMedia(f,nt,aid);
   const lastNote=last?.dor24==='pior'&&now-last.fim<7*DAY?`<div class="note bad">Na última avaliação, a dor piorou nas 24 h seguintes. Reduza a carga ou o volume dos exercícios com escala de dor nesta sessão.</div>`:'';
   const desc=nt.tipo==='corrida'?'Corrida · '+esc(corridaResumo(nt)):`${nt.ex.length} exercícios${dm?' · cerca de '+dm+' min':' · '+totalSets(nt)+' séries'}`;
   hoje=`<section class="card"><div class="row">${letter(LETRAS[ni],'l')}<div class="grow"><div class="klabel" style="color:${lcol(LETRAS[ni])}">${hj?'Seu treino de hoje':nt.dia?'Próximo treino · '+esc(nt.dia.toLowerCase()):'Seu próximo treino'}</div><h2>${esc(nt.nome)}</h2><div class="small muted">${desc}</div></div></div>${lastNote}
   ${temConteudo(nt)?`<button class="btn primary go" data-act="start" data-f="${f.id}" data-v="${nt.id}">${ICK.play}Começar treino</button>`:`<div class="note warn">Este treino ainda não tem exercícios. Inclua-os em Treinos.</div>`}
   ${f.treinos.length>1?`<button class="lnk" data-act="tab" data-v="fichas">Prefere outro? Ver ${f.treinos.length===2?'o outro treino':'os outros treinos'}</button>`:''}</section>`}}
 return pageHero(`${saudacao()}, ${esc(ME().nome)}!`,'',`${fbPanel()}${freq}${avisosAluno()}${semPersonal()}${check}${hoje}${atalhos}`,{personal:true})}
/* Aba Treinos do aluno: treinos da ficha atual em cartões; demais fichas abaixo. */
function viewTreinos(){const aid=S.me,f=ativaDe(aid),ws=weekStart(Date.now()),ss=sessDe(aid);
 let body='';
 if(f){const ni=nextIdx0(f);
  const cards=f.treinos.map((t,i)=>{const L=LETRAS[i];const feito=ss.find(s=>s.fichaId===f.id&&s.treinoId===t.id&&weekStart(s.inicio)===ws);const prox=i===ni&&!feito;
   const st=feito?`feito ${diaFeito(feito.inicio)}`:ehHoje(t)?'sugerido para hoje':t.dia?'sugerido para '+esc(t.dia.toLowerCase()):prox?'próximo da sequência':'';
   const tag=feito?'<span class="tag ok">Feito</span>':prox?`<span class="tag on" style="background:${lcol(L)}">${ehHoje(t)?'Hoje':'Próximo'}</span>`:'';
   const exs=t.tipo==='corrida'?`<div class="small muted">${esc(corridaResumo(t))}</div>`:t.ex.map(e=>`<li><span class="grow">${esc(e.n)}</span><span class="muted">${e.s} × ${esc(e.r)}${+e.kg>0?' · '+fmtKg(e.kg)+' kg':''}</span></li>`).join('');
   return `<details class="tcard ${prox?'prox':''}" ${S.tOpen===t.id?'open':''} data-tid="${t.id}" style="--lc:${lcol(L)}"><summary>${letter(L)}<span class="grow"><b>${esc(t.nome)}</b><span class="small muted">${t.tipo==='corrida'?'Corrida':t.ex.length+' exercícios'}${st?' · '+st:''}</span></span>${tag}<span class="chev">${ICK.seta}</span></summary>
    <div class="tbody">${t.tipo==='corrida'?exs:`<ol class="exl">${exs||'<li class="muted">Nenhum exercício ainda.</li>'}</ol>`}
    ${myActive()||andOutro()?'':temConteudo(t)?`<button class="btn primary go" data-act="start" data-f="${f.id}" data-v="${t.id}">${ICK.play}Começar treino ${L}</button>`:''}</div></details>`}).join('');
  body=`<div class="tlist">${cards||'<div class="empty">Esta ficha ainda não tem treinos.</div>'}</div><div class="small muted" style="padding:0 4px">Toque em um treino para ver os exercícios e começar.</div>
  ${canEdit(f)?`<button class="btn ghost" data-act="open" data-v="${f.id}">Editar ficha atual</button>`:''}`}
 body+=`<h2 class="sec">${f?'Todas as minhas fichas':'Minhas fichas'}</h2>${fichasList(aid)}`;
 return pageHero('Meus treinos',f?`Ficha atual: ${esc(f.nome)} · semana ${programWeek(f)} de ${f.semanas||8}`:'Escolha ou crie uma ficha',body)}
/* Aba Progresso do aluno: gráficos e histórico juntos. */
function viewProgresso(){const sub=['historico','musculos','medidas'].includes(S.psub)?S.psub:'graficos';
 const st=`<div class="subtabs">${[['graficos','Gráficos'],['musculos','Músculos'],['medidas','Medidas'],['historico','Histórico']].map(([k,l])=>`<button data-act="psub" data-v="${k}" class="${sub===k?'on':''}">${l}</button>`).join('')}</div>`;
 const body=sub==='historico'?historico(S.me):sub==='musculos'?musculos(S.me):sub==='medidas'?medidas(S.me):relBox(S.me)+evolucao(S.me);
 return pageHero('Meu progresso',`${sessDe(S.me).length} treinos registrados`,`${st}${body}`)}
function itemRow(s){if(s.corrida)return `<div class="item">${letter(s.letra,'s')}<div class="grow"><b>${dataLonga(s.inicio)}</b><div class="small muted">${esc(s.treinoNome||'Corrida')}</div></div><div style="text-align:right"><b class="num" style="font-size:20px">${fmtDist(s.corrida.dist)}</b><div class="small muted">${fmtRitmo(s.corrida.ritmo)}</div></div></div>`;const n=Object.values(s.ex||{}).reduce((a,r)=>a+r.sets.length,0);return `<div class="item">${letter(s.letra,'s')}<div class="grow"><b>${dataLonga(s.inicio)}</b><div class="small muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.treinoNome||'')}</div></div><div style="text-align:right"><b class="num" style="font-size:20px">${Math.round(s.dur/60)} min</b><div class="small muted">${n} séries</div></div></div>`}

/* ================= Lista de fichas (aluno, aluno visto pelo Personal, modelos) ================= */
function fichasList(owner){
 const isM=owner==='modelos';const lista=fichasDe(owner).sort((a,b)=>(b.criada||0)-(a.criada||0));const at=isM?null:ativaDe(owner);
 const opts=[['Modelos básicos do app',BASICOS]];if(!isM)opts.push(['Modelos disponíveis',fichasDe('modelos')]);opts.push([isM?'Modelos':'Fichas deste aluno',lista]);
 if(isPT())alunos(true).filter(p=>p.id!==owner).forEach(p=>{const l=fichasDe(p.id);if(l.length)opts.push(['Fichas de '+p.nome,l])});
 const nf=S.newF&&S.newF.owner===owner?`<section class="form"><h3>${isM?'Novo modelo':'Nova ficha'}</h3>
  <div class="field"><label class="lbl" for="nf-nome">Nome</label><input id="nf-nome" class="txt" data-nf="nome" value="${esc(S.newF.nome)}" placeholder="Ex.: Ciclo 2 – hipertrofia"></div>
  <div class="field"><label class="lbl" for="nf-base">Começar com</label><select id="nf-base" data-nf="base"><option value="">Ficha vazia (sem treinos)</option>${opts.filter(o=>o[1].length).map(([g,l])=>`<optgroup label="${esc(g)}">${l.map(f=>`<option value="${f.id}" ${S.newF.base===f.id?'selected':''}>${esc(f.nome)}${f.basico?' · '+f.treinos.length+' treino'+(f.treinos.length>1?'s':'')+', meta '+f.meta+'x/sem.':''}</option>`).join('')}</optgroup>`).join('')}</select>${basico(S.newF.base)?`<div class="small muted">${esc(basico(S.newF.base).desc)}</div>`:''}</div>
  <div class="nav2"><button class="btn ghost" data-act="nfcancel">Cancelar</button><button class="btn primary" data-act="nfsave">Criar</button></div></section>`:`<div class="nav2"><button class="btn primary" data-act="nfopen" data-v="${owner}">+ ${isM?'Novo modelo':'Nova ficha'}</button><button class="btn ghost" data-act="iaopen" data-v="${owner}">✦ Criar com IA</button></div>`;
 if(isM&&S.p)lista.sort((a,b)=>(a.global?1:0)-(b.global?1:0));
 const card=f=>{const on=at&&at.id===f.id;const n=S.sessions.filter(s=>s.fichaId===f.id).length;return `<section class="panel" style="gap:10px">
  <div class="row"><div class="grow"><h2>${esc(f.nome)}</h2><div class="small muted">${f.treinos.length} treinos · ${f.treinos.reduce((a,t)=>a+t.ex.length,0)} exercícios${isM?'':` · ${n} sessões`}${f.autor?` · por ${esc(f.autor)}`:''}${f.origem==='ia'?' · sugestão de IA':''}${!isM&&f.vence?' · '+esc(venceTxt(f)):''}${isM&&S.g?(f.global?' · para todos':` · de ${esc(nomeP(f.personalId))}${f.alunos?' · disponível aos alunos':' · privado'}`):''}${isM&&!S.g&&!f.global&&f.personalId===S.me?(f.alunos?' · disponível para seus alunos':' · privado'):''}</div></div>${isM?'':`<span class="chip ${on?'on':''}">${on?'Atual':f.arquivada?'Arquivada':'Disponível'}</span>`}</div>
  <div class="row" style="gap:6px;flex-wrap:wrap">${f.treinos.map((t,i)=>letter(LETRAS[i],'s')).join('')}</div>
  <div class="nav2">${canEdit(f)?`<button class="btn ghost" data-act="open" data-v="${f.id}">Ver e editar</button>`:`<span class="small muted" style="align-self:center">Modelo da plataforma</span>`}${isM?`<button class="btn primary" data-act="nfopen" data-v="${owner}" data-b="${f.id}">Duplicar</button>`:on?`<button class="btn" disabled>Ficha atual ✓</button>`:`<button class="btn primary" data-act="ativar" data-v="${f.id}">Tornar atual</button>`}</div></section>`};
 const ativas=lista.filter(f=>!f.arquivada),arq=lista.filter(f=>f.arquivada);
 const seed=isM&&!fichasDe('modelos').some(f=>f.tpl==='condro'&&(S.g?f.global:f.personalId===S.me))?`<button class="btn dash" data-act="seedm">+ Carregar os 2 modelos iniciais (condropatia e tendinite)</button>`:'';
 return `${nf}${seed}${ativas.map(card).join('')||(S.newF?'':`<div class="empty">${isM?'Nenhum modelo ainda. Modelos servem de base para montar fichas dos alunos.':'Nenhuma ficha ainda.'}</div>`)}${arq.length?`<div class="eyebrow" style="margin-top:6px">Arquivadas</div>${arq.map(card).join('')}`:''}`}
/* ================= Editor de ficha ================= */
function viewFicha(){
 const f=ficha(S.edit);if(!f){S.view=S.back;return render0()}
 if(canEdit(f)&&f.treinos.some(t=>(t.ex||[]).some(e=>TECNICAS[e.tec]?.grupo)))saveF(f);
 const C=S.conf,isM=!!f.modelo,at=!isM&&ativaDe(f.alunoId)?.id===f.id,dono=isM?'Modelo do Personal':'Ficha de '+esc(perfil(f.alunoId)?.nome||'aluno');
 const iaNota=f.origem==='ia'?`<div class="note warn">Ficha sugerida por IA${f.autor?' e criada por '+esc(f.autor):''}. Revise com um Personal ou profissional de saúde, principalmente se houver lesões ou dores.</div>`:'';
 const head=`<section class="panel">
  <div class="row"><span class="grow"></span>${pdfBtnFicha(f)}</div>
  <div class="field"><label class="lbl" for="f-nome">Nome da ficha</label><input id="f-nome" class="txt" data-ch="fnome" value="${esc(f.nome)}"></div>
  ${isM&&!f.global&&f.personalId===S.me?`<label class="check"><input type="checkbox" data-ch="falunos" ${f.alunos?'checked':''}>Disponível para meus alunos</label><div class="small muted">${f.alunos?'Seus alunos podem usar este modelo como base em “Nova ficha”.':'Privado: só você vê este modelo. Marque para que seus alunos possam usá-lo como base.'}</div>`:''}
  ${isM&&f.global?'<div class="small muted">Modelo da plataforma, disponível para todos os usuários.</div>':''}
  <div class="grid2"><div class="field"><label class="lbl" for="f-sem">Duração do ciclo (semanas)</label><input id="f-sem" class="txt" data-ch="fsem" inputmode="numeric" value="${f.semanas||8}"></div><div class="field"><label class="lbl" for="f-meta">Meta semanal</label><select id="f-meta" data-ch="fmeta">${[1,2,3,4,5,6,7].map(n=>`<option value="${n}" ${metaDe(f)===n?'selected':''}>${n}x por semana</option>`).join('')}</select></div></div>
  ${isM?'':`<div class="field"><label class="lbl" for="f-vence">Vencimento da ficha${f.vence?' · '+esc(venceTxt(f)):''}</label><input id="f-vence" class="txt" type="date" data-ch="fvence" value="${esc(f.vence||'')}"><div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ghost" data-act="usarciclo">Usar fim do ciclo (${esc(ddmmaa(fimDoCiclo(f)))})</button>${f.vence?'<button class="btn sm ghost" data-act="semvence">Sem vencimento</button>':''}</div></div>`}
  <div class="small muted">${f.treinos.length?`Os treinos se alternam em sequência (${f.treinos.slice(0,3).map((t,i)=>LETRAS[i]).join(', ')}${f.treinos.length>1?', '+LETRAS[0]+'…':' todos os dias'}), sem depender do dia da semana.`:'Ficha vazia: inclua o treino A no fim da página. Os treinos se alternam em sequência (A, B, A…), sem depender do dia da semana.'} A meta define quantas vezes por semana você pretende treinar.</div>
  ${isM?'':`<div class="nav2">${at?`<button class="btn" disabled>Ficha atual ✓</button>`:`<button class="btn primary" data-act="ativar" data-v="${f.id}">Tornar atual</button>`}<button class="btn ghost" data-act="dup" data-v="${f.id}">Duplicar</button></div>`}
  ${isPT()&&!isM?`<button class="btn ghost" data-act="tomodel" data-v="${f.id}">Salvar cópia como modelo</button>`:''}
  <div class="nav2">${isM?'<span></span>':`<button class="btn ghost" data-act="arq" data-v="${f.id}">${f.arquivada?'Desarquivar':'Arquivar'}</button>`}${C==='delf'?`<button class="btn danger" data-act="delf" data-v="${f.id}">Confirmar exclusão</button>`:`<button class="btn danger" data-act="conf" data-v="delf">Excluir ${isM?'modelo':'ficha'}</button>`}</div>
  ${C==='delf'?`<div class="note bad">${isM?'O modelo será excluído. Fichas já criadas a partir dele não mudam.':'A ficha será excluída. Os treinos já feitos continuam no histórico.'} <button class="btn sm ghost" data-act="conf" data-v="">Cancelar</button></div>`:''}
 </section>`;
 const treinos=f.treinos.map((t,ti)=>{if(t.tipo==='corrida')return corridaEditor(f,t,ti);
  const gr=grupos(t.ex);
  const rowsArr=t.ex.map((e,ei)=>{
   if(S.form&&S.form.t===t.id&&S.form.e===e.id)return exForm();
   const k='dele:'+t.id+':'+e.id;
   if(C===k)return `<div class="miniconf"><span class="grow">Excluir “${esc(e.n)}”?</span><button class="btn sm danger" data-act="dele" data-t="${t.id}" data-v="${e.id}">Excluir</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`;
   const mi=media(e.n),gi=gr[ei];
   return `<div class="exrow ${gi?'ingrp':''}">${mi?`<img class="thumb" src="${IMG_BASE+mi.img[0]}" alt="" loading="lazy">`:`<span class="n">${ei+1}</span>`}<div class="grow"><b>${esc(e.n)}</b><div class="meta">${gi?esc(e.r)+' por rodada':e.s+' × '+esc(e.r)} · ${TIPOS[e.tipo]}${e.tipo==='t'?' '+fmtSec(e.hold||30):''}${gi?'':' · descanso '+mmss(e.desc||0)}${e.knee?' · escala de dor':''}</div>${e.tec&&!TECNICAS[e.tec]?.grupo?`<div class="meta" style="color:var(--accent);font-weight:600">${esc(tecNome(e.tec))}</div>`:''}${e.tipo!=='t'?`<label class="kgline">Carga <input class="kgin" data-ch="exkg" data-t="${t.id}" data-e="${e.id}" inputmode="decimal" value="${+e.kg>0?fmtKg(e.kg):''}" placeholder="—" aria-label="Carga de ${esc(e.n)} em kg"> kg</label>`:''}</div><div class="icons"><button class="ib" data-act="mv" data-t="${t.id}" data-v="${e.id}" data-d="-1" ${ei===0?'disabled':''} aria-label="Subir">↑</button><button class="ib" data-act="mv" data-t="${t.id}" data-v="${e.id}" data-d="1" ${ei===t.ex.length-1?'disabled':''} aria-label="Descer">↓</button><button class="ib" data-act="edite" data-t="${t.id}" data-v="${e.id}" aria-label="Editar">✎</button><button class="ib del" data-act="conf" data-v="${k}" aria-label="Excluir">✕</button></div></div>`});
  const rows=montaGrupos(t,rowsArr,gr);
  const adding=S.form&&S.form.t===t.id&&!S.form.e;const kt='delt:'+t.id;
  return `<section class="panel">
   <div class="row">${letter(LETRAS[ti])}<div class="grow field"><label class="lbl" for="tn-${t.id}">Treino ${LETRAS[ti]}</label><input id="tn-${t.id}" class="txt" data-ch="tnome" data-t="${t.id}" value="${esc(t.nome)}"></div></div>
   <div class="field"><label class="lbl" for="td-${t.id}">Dia sugerido</label><select id="td-${t.id}" data-ch="tdia" data-t="${t.id}"><option value="">Sem dia fixo</option>${DIAS.map(d=>`<option ${t.dia===d?'selected':''}>${d}</option>`).join('')}</select></div>
   <div class="eyebrow">${t.ex.length} exercícios · ${totalSets(t)} séries</div>
   <div class="list">${rows||'<div class="small muted">Nenhum exercício ainda.</div>'}</div>
   ${adding?exForm():`<button class="btn dash" data-act="adde" data-t="${t.id}">+ Incluir exercício</button>`}
   ${C===kt?`<div class="miniconf"><span class="grow">Excluir o treino ${LETRAS[ti]} e seus exercícios?</span><button class="btn sm danger" data-act="delt" data-v="${t.id}">Excluir</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`:`<button class="btn sm ghost" style="align-self:flex-start;color:var(--bad)" data-act="conf" data-v="${kt}">Excluir treino ${LETRAS[ti]}</button>`}
  </section>`}).join('');
 return page(dono,esc(f.nome),`${iaNota}${head}${treinos}${f.treinos.length<7?`<div class="nav2"><button class="btn dash" data-act="addt">+ Treino ${LETRAS[f.treinos.length]} de musculação</button><button class="btn dash" data-act="addtc">+ Treino ${LETRAS[f.treinos.length]} de corrida</button></div>`:''}`,{back:S.back})}
function exForm(){const d=S.form.d;return `<div class="form" id="exform">
 <h3>${S.form.e?'Editar exercício':'Novo exercício'}</h3>
 <div class="field"><label class="lbl" for="fx-n">Nome</label><input id="fx-n" class="txt" data-f="n" list="exlib" value="${esc(d.n)}" placeholder="Digite ou escolha da lista"></div>
 <div class="field"><span class="lbl">Tipo</span><div class="seg">${Object.entries(TIPOS).map(([k,l])=>`<button data-act="ftipo" data-v="${k}" class="${d.tipo===k?'on':''}">${l}</button>`).join('')}</div></div>
 <div class="grid2"><div class="field"><label class="lbl" for="fx-s">Séries</label><input id="fx-s" class="txt" data-f="s" inputmode="numeric" value="${esc(d.s)}"></div><div class="field"><label class="lbl" for="fx-r">${d.tipo==='t'?'Duração (texto)':'Repetições'}</label><input id="fx-r" class="txt" data-f="r" value="${esc(d.r)}" placeholder="${d.tipo==='t'?'30-45 s':'8-12'}"></div></div>
 <div class="grid2"><div class="field"><label class="lbl" for="fx-desc">Descanso (min:seg)</label><input id="fx-desc" class="txt" data-f="desc" inputmode="decimal" value="${esc(d.desc)}" placeholder="1:00"></div>${d.tipo==='t'?`<div class="field"><label class="lbl" for="fx-hold">Tempo (min:seg)</label><input id="fx-hold" class="txt" data-f="hold" inputmode="decimal" value="${esc(d.hold)}" placeholder="0:30"></div>`:'<div></div>'}</div>
 <div class="small muted">Tempos em minutos e segundos: 1:00 = 1 minuto; 0:45 = 45 segundos; 2 = 2 minutos.</div>
 ${d.tipo!=='t'?`<div class="field"><label class="lbl" for="fx-kg">Carga de referência (kg, opcional)</label><input id="fx-kg" class="txt" data-f="kg" inputmode="decimal" value="${esc(d.kg||'')}" placeholder="Ex.: 20"></div>`:''}
 ${tecSelect(d)}
 <label class="check"><input type="checkbox" data-f="knee" ${d.knee?'checked':''}>Avaliar dor neste exercício (escala de 0 a 10)</label>
 <label class="check"><input type="checkbox" data-f="reab" ${d.reab?'checked':''}>Exercício de reabilitação</label>
 <div class="field"><label class="lbl" for="fx-nota">Observação</label><input id="fx-nota" class="txt" data-f="nota" value="${esc(d.nota)}" placeholder="Ex.: amplitude de 0° a 60°"></div>
 <div class="field"><label class="lbl" for="fx-video">Link do vídeo (YouTube, opcional)</label><input id="fx-video" class="txt" data-f="video" inputmode="url" value="${esc(d.video||'')}" placeholder="https://youtu.be/…"></div>
 ${(()=>{const m=media(d.n),bx=classifica(d.n);return (bx&&bx.p?`<div class="small muted">Músculos: <b style="color:var(--ink)">${esc(muscTxt(bx))}</b></div>`:'')+(m?`<div class="small muted">Fotos de referência encontradas para este nome.</div>`:d.n?`<div class="small muted">Sem fotos de referência para este nome. Use um nome da lista para ver as fotos.</div>`:'')})()}
 ${S.form.err?`<div class="note bad">${esc(S.form.err)}</div>`:''}
 <div class="nav2"><button class="btn ghost" data-act="fcancel">Cancelar</button><button class="btn primary" data-act="fsave">Salvar exercício</button></div></div>`}

/* ================= Sessão: tela ================= */
function viewTreino(){
 const a=S.active,ex=curEx(),r=a.ex[ex.id]||{sets:[],dor:null},d=draft(ex),L=a.exList,all=L.every(isDone),G=grupos(L),g=G[a.idx],GI=g?grpInfo(L,g):null,tc=TECNICAS[ex.tec],sk=isSkip(ex);
 const strip=L.map((e,i)=>{const n=a.ex[e.id]?.sets.length||0,pk=isSkip(e);return `<button class="pill ${i===a.idx?'cur':''} ${pk?'skip':n>=e.s?'done':n?'part':''} ${G[i]?'grp':''} ${G[i]&&G[i][0]===i?'g0':''}" data-act="go" data-v="${i}" aria-label="${esc(e.n)}${pk?' (pulado)':''}">${pk?'–':n>=e.s?'✓':i+1}</button>`}).join('');
 const l=lastFor(ex.n,a.alunoId);
 const lastTxt=l?`Última vez (${ddmm(l.s.inicio)}): ${l.r.sets.map(x=>fmtSet(x,1)).join(' · ')}`:'Primeira vez neste exercício';
 const ES=S.eset&&S.eset.ex===ex.id?S.eset.i:-1;
 const rows=r.sets.map((x,i)=>i===ES?setEditor(ex,x):`<button class="setrow" data-act="eset" data-v="${i}" aria-label="Editar série ${i+1}"><b>${i+1}</b><span class="grow">${fmtSet(x)}</span><span class="small muted">✎</span></button>`).join('');
 const nextRow=r.sets.length<ex.s&&!sk?`<div class="setrow next"><b>${r.sets.length+1}</b><span class="grow">Próxima série</span></div>`:'';
 const inputs=ex.tipo==='t'?`<div class="steppers" style="grid-template-columns:1fr">${stepper('sec','Tempo (min:seg)',fmtMS(d.sec),15)}</div>`:`<div class="steppers">${stepper('kg','Carga (kg)',fmtKg(d.kg),2.5)}${stepper('reps','Repetições',d.reps,1)}</div>`;
 const subOn=a.sub&&a.sub.ex===ex.id;
 let action;
 if(subOn)action=subBlock(ex);
 else if(a.holdEnd)action=`<button class="btn big danger" data-act="holdstop">Parar · <span id="holdClock">${mmss((a.holdEnd-Date.now())/1000)}</span></button>`;
 else if(sk)action=`<div class="note warn">Exercício pulado neste treino.</div><button class="btn ghost" data-act="unskip" data-v="${ex.id}">Desfazer: fazer este exercício</button>${all?`<button class="btn primary big" data-act="endask">Finalizar e salvar treino</button>`:`<button class="btn primary big" data-act="go" data-v="${nextIdx(a.idx)}">Próximo exercício</button>`}`;
 else if(r.sets.length>=ex.s)action=all?`<button class="btn primary big" data-act="endask">Finalizar e salvar treino</button>`:`<button class="btn primary big" data-act="go" data-v="${nextIdx(a.idx)}">Próximo exercício</button><button class="btn ghost" data-act="extra">Fazer série extra</button>`;
 else action=(ex.tipo==='t'?`<button class="btn primary big" data-act="holdgo">Iniciar cronômetro · ${fmtSec(d.sec)}</button>`:`<button class="btn primary big" data-act="set">${g?`Concluir rodada ${r.sets.length+1} de ${ex.s}`:`Concluir série ${r.sets.length+1} de ${ex.s}`}${g?(g.filter(j=>j>a.idx&&!isDone(L[j])).length?(GI.dx?' · descanso '+mmss(GI.dx):' · sem descanso'):' · fim da rodada'):''}</button>`)+`<button class="btn sm ghost" data-act="skip" data-v="${ex.id}">Pular este exercício</button>`;
 const nd=L.filter(e=>(a.ex[e.id]?.sets.length||0)>=e.s).length,np=L.filter(isSkip).length;
 const confirm=S.confirmEnd?`<div class="confirm"><b>Encerrar o treino agora?</b><span class="small muted">${nd} de ${L.length} exercícios concluídos${np?` · ${np} pulado${np>1?'s':''}`:''}.</span><button class="btn primary" data-act="end" data-v="1">Salvar e encerrar</button><div class="nav2"><button class="btn ghost" data-act="endcancel">Continuar treinando</button><button class="btn danger" data-act="end" data-v="0">Descartar treino</button></div></div>`:'';
 const gtag=g?`<span class="tag tec">${esc(GI.nome)} · rodada ${Math.min(GI.r,Math.min(...g.map(j=>a.ex[L[j].id]?.sets.length||0))+1)} de ${GI.r} · exercício ${g.indexOf(a.idx)+1} de ${g.length}</span>`:'';
 const tectag=tc&&!tc.grupo?`<span class="tag tec">${esc(tc.n)}</span>`:'';
 const tecInfo=g?`<div class="tecinfo"><b>${esc(GI.nome)}:</b> ${g.map(j=>esc(L[j].n)).join(' + ')}. ${GI.dx?'Descanso de '+mmss(GI.dx)+' entre os exercícios':'Sem descanso entre os exercícios'}; ${mmss(GI.dr)} de descanso ao fim de cada rodada.</div>`:tc?`<div class="tecinfo"><b>${esc(tc.n)}:</b> ${esc(tc.d)}</div>`:'';
 const cond=a.cond?`<div class="note info">Você está conduzindo o treino de <b>${esc(a.alunoNome)}</b>. Os registros vão para o histórico do aluno.</div>`:'';
 return `<main class="wrap" style="padding-bottom:${a.restEnd?'380px':'40px'}">
 <header class="shead">${letter(a.letra)}<div class="grow"><div class="clock" id="elapsed">${hms((Date.now()-a.inicio)/1000)}</div><div class="small muted" id="wakeTag">${wake?'Tela ativa':'Tela pode apagar'}</div></div><button class="btn sm ghost" data-act="tab" data-v="inicio">Menu</button><button class="btn sm danger" data-act="endask">Encerrar</button></header>
 ${confirm}${cond}<div class="strip">${strip}</div>${exLista()}
 <section class="panel" id="exCard">
  <div class="row" style="align-items:flex-start"><div class="grow"><div class="eyebrow">Exercício ${a.idx+1} de ${L.length}${ex.reab?' · reabilitação':''}</div><h2 class="exname">${esc(ex.n)}</h2></div><button class="btn sm ghost" data-act="adjopen">✎ Ajustar</button></div>
  ${S.adj&&S.adj.ex===ex.id?adjForm(ex):''}
  <div class="presc"><span class="tag">${ex.s} × ${esc(ex.r)}</span>${ex.tipo!=='t'&&+ex.kg>0?`<span class="tag kg">Carga ${fmtKg(ex.kg)} kg</span>`:''}${g?'':`<span class="tag">Descanso ${mmss(ex.desc||0)}</span>`}${gtag}${tectag}${ex.knee?'<span class="tag knee">Escala de dor</span>':''}${ex.nota?`<span class="tag ${ex.reab?'reab':''}">${esc(ex.nota)}</span>`:''}</div>
  ${tecInfo}
  ${demo(ex)}
  <div class="small muted">${lastTxt}</div>
  <div class="sets">${rows}${nextRow}</div>
  ${r.sets.length<ex.s&&!a.holdEnd&&!subOn&&!sk?inputs:''}${action}
 </section>
 ${ex.knee?painBlock(r.dor):''}
 <div class="nav2"><button class="btn ghost" data-act="go" data-v="${Math.max(0,a.idx-1)}" ${a.idx===0?'disabled':''}>‹ Anterior</button><button class="btn ghost" data-act="go" data-v="${Math.min(L.length-1,a.idx+1)}" ${a.idx===L.length-1?'disabled':''}>Seguinte ›</button></div>
 </main>${a.restEnd?restSheet():''}`}
/* Leva a tela ao cartão de execução do exercício escolhido (a lista do treino continua aberta). */
function irExecucao(){const c=document.getElementById('exCard');if(c)c.scrollIntoView({behavior:'smooth',block:'start'});else window.scrollTo(0,0)}
/* Lista do treino com marcação para pular exercícios. */
function exLista(){const a=S.active,L=a.exList;if(!S.exl)return `<button class="btn sm ghost" data-act="exl" style="align-self:flex-start">☰ Lista do treino</button>`;
 return `<section class="panel" style="gap:4px"><div class="row"><div class="eyebrow grow">Lista do treino · ✓ feito · ✕ pular</div><button class="btn sm ghost" data-act="exl">Fechar</button></div>
 ${L.map((e,i)=>{const n=a.ex[e.id]?.sets.length||0,pk=isSkip(e),m=media(e.n);return `<div class="exrow ${i===a.idx?'cur':''}"><span class="n">${i+1}</span>${m?`<img class="thumb" src="${IMG_BASE+m.img[0]}" alt="" loading="lazy">`:''}<button class="grow" style="text-align:left" data-act="go" data-v="${i}" ${i===a.idx?'aria-current="true"':''}><b style="${pk?'text-decoration:line-through;opacity:.6':''}">${esc(e.n)}</b><div class="meta">${n}/${e.s} séries${e.tec?' · '+esc(tecNome(e.tec)):''}${+e.kg>0?' · '+fmtKg(e.kg)+' kg':''}</div></button><div class="okbs"><button class="okb ok ${n>=e.s?'on':''}" data-act="exok" data-v="${e.id}" aria-pressed="${n>=e.s}" aria-label="Marcar ${esc(e.n)} como feito">✓</button><button class="okb off ${pk?'on':''}" data-act="exoff" data-v="${e.id}" aria-pressed="${pk}" aria-label="Pular ${esc(e.n)}">✕</button></div></div>`}).join('')}</section>`}
/* Editar uma série já registrada. */
function setEditor(ex,x){const D=S.eset.d;const ins=x.sec!=null?`<div class="steppers" style="grid-template-columns:1fr">${stepper('esec','Tempo (min:seg)',fmtMS(D.sec),15)}</div>`:`<div class="steppers">${stepper('ekg','Carga (kg)',fmtKg(D.kg),2.5)}${stepper('ereps','Repetições',D.reps,1)}</div>`;
 return `<div class="form" style="gap:10px"><div class="eyebrow">Editar série ${S.eset.i+1}${x.x?.length?' · drops/blocos mantidos':''}</div>${ins}<div class="nav2"><button class="btn ghost" data-act="esetno">Cancelar</button><button class="btn primary" data-act="esetok">Salvar</button></div><button class="btn sm ghost" style="color:var(--bad)" data-act="esetdel">Excluir esta série</button></div>`}
/* Ajustar a prescrição durante o treino (vale também para a ficha). */
function adjForm(ex){const D=S.adj.d;return `<div class="form" style="gap:10px"><div class="eyebrow">Ajustar exercício</div>
 <div class="steppers">${stepper('as','Séries',D.s,1)}${ex.tipo==='t'?stepper('ahold','Tempo (min:seg)',fmtMS(D.hold),15):stepper('akg','Carga ref. (kg)',fmtKg(D.kg),2.5)}</div>
 <div class="grid2"><div class="field"><label class="lbl" for="adj-r">${ex.tipo==='t'?'Duração (texto)':'Repetições'}</label><input id="adj-r" class="txt" data-adj="r" value="${esc(D.r)}"></div><div class="field"><label class="lbl" for="adj-desc">Descanso (min:seg)</label><input id="adj-desc" class="txt" data-adj="desc" inputmode="decimal" value="${esc(D.desc)}"></div></div>
 <div class="field"><label class="lbl" for="adj-tec">Técnica</label><select id="adj-tec" data-adj="tec"><option value="">Série tradicional</option>${Object.entries(TECNICAS).filter(([k,t])=>!t.grupo||D.tec===k).map(([k,t])=>`<option value="${k}" ${D.tec===k?'selected':''}>${t.n}</option>`).join('')}</select></div>
 ${S.adj.podeFicha?`<label class="check"><input type="checkbox" data-adj="ficha" ${D.ficha?'checked':''}>Salvar também na ficha (próximos treinos)</label>`:'<div class="small muted">A alteração vale só para este treino.</div>'}
 <div class="nav2"><button class="btn ghost" data-act="adjno">Cancelar</button><button class="btn primary" data-act="adjok">Aplicar</button></div></div>`}
/* Drop-set, rest-pause e cluster: blocos extras dentro da mesma série. */
function subBlock(ex){const a=S.active,tc=TECNICAS[ex.tec],r=rec(ex),ls=r.sets[r.sets.length-1],nb=(ls?.x?.length||0);const drop=tc.sub==='drop';
 const left=a.miniEnd?Math.max(0,(a.miniEnd-Date.now())/1000):0;
 return `<div class="tecbox"><div class="eyebrow">${esc(tc.n)} · série ${r.sets.length} de ${ex.s}</div>
 <div class="small">${drop?`Reduza a carga (sugestão: ${fmtKg(a.subd.kg)} kg) e continue sem descanso.`:`Pausa curta e mais repetições com a mesma carga.`}${nb?` Já registrado: ${nb} ${drop?'drop':'bloco'}${nb>1?'s':''}.`:''}</div>
 ${tc.pausa?`<div class="mini-clock ${left<=0?'ok':''}"><b id="miniClock">${left>0?mmss(left):'Vai!'}</b><span>pausa de ${tc.pausa} s</span></div>`:''}
 <div class="steppers">${stepper('dkg','Carga (kg)',fmtKg(a.subd.kg),2.5)}${stepper('dreps','Repetições',a.subd.reps,1)}</div>
 <button class="btn primary" data-act="sublog">Registrar ${drop?'drop':'bloco'}</button>
 <button class="btn ghost" data-act="subend">Encerrar série${a.exList.every(isDone)?'':' e descansar'}</button></div>`}
function demo(ex){const m=media(ex.n),yt=ytEmbed(ex.video),bx=classifica(ex.n);if(!m&&!ex.video&&!bx)return '';
 const passos=bx?`<details><summary>Como executar · passo a passo</summary><ol class="small muted">${bx.ps.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>${bx.p?`<div class="small muted">Músculos: ${esc(muscTxt(bx))}</div>`:''}</details>`:'';
 const vid=ex.video?(S.vid===ex.id&&yt?`<div class="vid"><iframe src="${yt}?rel=0" title="Vídeo: ${esc(ex.n)}" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`:yt?`<button class="btn ghost" data-act="vid" data-v="${ex.id}">▶ Ver vídeo</button>`:`<a class="btn ghost" href="${esc(ex.video)}" target="_blank" rel="noopener">▶ Abrir vídeo</a>`):'';
 const big=S.imgBig===ex.id;
 const pics=m?`<div class="demo"><button class="imgs ${big?'big':''}" data-act="imgbig" data-v="${ex.id}" aria-label="${big?'Reduzir fotos':'Ampliar fotos'}">${m.img.map((p,i)=>`<img src="${IMG_BASE+p}" alt="${esc(ex.n)}, posição ${i?'final':'inicial'}" loading="lazy">`).join('')}</button>${passos||`<details><summary>Como executar · passo a passo</summary><ol class="small muted">${m.ins.map(t=>`<li>${esc(t)}</li>`).join('')}</ol><div class="small muted">Instruções em inglês · Free Exercise DB</div></details>`}</div>`:passos?`<div class="demo">${passos}</div>`:'';
 return pics+vid}
function stepper(k,label,v,step){return `<div class="stepper"><label class="lbl" for="in-${k}">${label}</label><div class="ctl"><button data-act="step" data-k="${k}" data-d="${-step}" aria-label="Diminuir">−</button><input id="in-${k}" data-k="${k}" inputmode="decimal" value="${v}"><button data-act="step" data-k="${k}" data-d="${step}" aria-label="Aumentar">+</button></div></div>`}
function painBlock(v){
 const btns=[...Array(11)].map((_,i)=>`<button class="z${i<=2?0:i<=4?1:2} ${v===i?'sel':''}" data-act="dor" data-v="${i}">${i}</button>`).join('');
 const msg=v==null?'':v<=2?'<div class="note good">0 a 2: geralmente aceitável. Siga o plano.</div>':v<=4?'<div class="note warn">3 a 4: monitore e reduza carga ou amplitude se não ceder.</div>':'<div class="note bad">5 ou mais: interrompa ou modifique o exercício.</div>';
 return `<section class="panel"><div class="eyebrow">Dor durante o exercício</div><div class="pain">${btns}</div>${msg}</section>`}
function restSheet(){const a=S.active,nx=curEx(),n=(a.ex[nx.id]?.sets.length||0)+1;
 return `<div class="sheet" id="sheet"><div class="in"><div class="eyebrow">Descanso</div>
 <div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="var(--sunk)" stroke-width="8"/><circle id="ringArc" cx="60" cy="60" r="54" fill="none" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" stroke-dasharray="339.3" stroke-dashoffset="0"/></svg><div class="t"><div><b id="restClock">${mmss(a.restTotal)}</b><span id="restLbl">de ${mmss(a.restTotal)}</span></div></div></div>
 <div class="small muted" style="text-align:center">A seguir: <b style="color:var(--ink)">${esc(nx.n)}</b> · série ${Math.min(n,nx.s)} de ${nx.s}</div>
 <div class="acts"><button class="btn" data-act="restadj" data-v="-15">−15 s</button><button class="btn" data-act="restadj" data-v="15">+15 s</button><button class="btn primary" data-act="restskip" id="restBtn">Pular descanso</button></div>
 </div></div>`}

/* ================= Gráficos ================= */
function niceMax(v){if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v)));const n=v/p;return (n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p}
function bars(items,{target}={}){
 const W=340,H=170,L=30,R=6,T=10,B=24,iw=W-L-R,ih=H-T-B;
 const mx=niceMax(Math.max(target||0,...items.map(i=>i.v),1));const y=v=>T+ih-(v/mx)*ih;const bw=iw/items.length;
 const ticks=[0,mx/2,mx].map(t=>`<line class="grid" x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}"/><text x="${L-6}" y="${y(t)+3}" text-anchor="end">${+t.toFixed(1)}</text>`).join('');
 const tl=target?`<line class="target" x1="${L}" x2="${W-R}" y1="${y(target)}" y2="${y(target)}"/><text x="${W-R}" y="${y(target)-4}" text-anchor="end" style="fill:var(--ink)">meta ${target}</text>`:'';
 const b=items.map((it,i)=>{const x=L+i*bw+bw*.18,w=bw*.64,h=Math.max(it.v?2:0,(it.v/mx)*ih);return `<rect x="${x}" y="${T+ih-h}" width="${w}" height="${h}" rx="3" fill="${it.c||'var(--accent)'}"/>${it.v?`<text x="${x+w/2}" y="${T+ih-h-4}" text-anchor="middle" style="fill:var(--ink);font-weight:600">${it.v}</text>`:''}<text x="${x+w/2}" y="${H-8}" text-anchor="middle">${it.l}</text>`}).join('');
 return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img">${ticks}${tl}${b}</svg></div>`}
function line(pts,{unit='',min=null,max=null,bands=false,fmt=null,extra=null,extraCor='var(--t1)'}={}){const F=fmt||(v=>+(+v).toFixed(1));
 const W=340,H=180,L=34,R=12,T=14,B=24,iw=W-L-R,ih=H-T-B;
 const vs=pts.map(p=>p.v).concat((extra||[]).filter(v=>v>0));let lo=min??Math.min(...vs),hi=max??Math.max(...vs);
 if(min==null){const span=Math.max(hi-lo,hi*.1,1);lo=Math.max(0,Math.floor(lo-span*.25));hi=Math.ceil(hi+span*.25)}
 const x=i=>L+(pts.length===1?iw/2:i*iw/(pts.length-1));const y=v=>T+ih-((v-lo)/(hi-lo||1))*ih;
 const ticks=[lo,(lo+hi)/2,hi].map(t=>`<line class="grid" x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}"/><text x="${L-6}" y="${y(t)+3}" text-anchor="end">${F(t)}</text>`).join('');
 const bd=bands?`<rect x="${L}" y="${y(10)}" width="${iw}" height="${y(4.5)-y(10)}" fill="var(--bad-soft)"/><rect x="${L}" y="${y(4.5)}" width="${iw}" height="${y(2.5)-y(4.5)}" fill="var(--warn-soft)"/><rect x="${L}" y="${y(2.5)}" width="${iw}" height="${y(0)-y(2.5)}" fill="var(--good-soft)"/>`:'';
 const d=pts.map((p,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
 const area=bands||pts.length<2?'':`<path d="${d}L${x(pts.length-1)},${T+ih}L${x(0)},${T+ih}Z" fill="var(--accent)" opacity=".12"/>`;
 const step=Math.ceil(pts.length/6);
 const lab=pts.map((p,i)=>(i%step===0||i===pts.length-1)?`<text x="${x(i)}" y="${H-8}" text-anchor="middle">${p.l}</text>`:'').join('');
 const dots=pts.map((p,i)=>{const last=i===pts.length-1;return `<circle cx="${x(i)}" cy="${y(p.v)}" r="${last?5:3}" fill="${last?'var(--accent)':'var(--surface)'}" stroke="var(--accent)" stroke-width="2"/>`}).join('');
 const lp=pts[pts.length-1];
 const ex2=extra&&extra.some(v=>v>0)?(()=>{const q=extra.map((v,i)=>v>0?[x(i),y(v)]:null).filter(Boolean);return `<path d="${q.map((c,i)=>`${i?'L':'M'}${c[0].toFixed(1)},${c[1].toFixed(1)}`).join('')}" fill="none" stroke="${extraCor}" stroke-width="2.5" stroke-dasharray="6 4" stroke-linejoin="round"/>${q.map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="2.5" fill="${extraCor}"/>`).join('')}`})():'';
 return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img">${bd}${ticks}${area}${ex2}<path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>${dots}<text x="${Math.min(x(pts.length-1),W-R-4)}" y="${y(lp.v)-10}" text-anchor="end" style="fill:var(--ink);font-weight:600;font-size:12px">${fmt?F(lp.v):fmtKg(lp.v)}${unit}</text>${lab}</svg></div>`}

/* ================= Evolução e histórico (por aluno) ================= */
function fichaSel(aid){const fa=ativaDe(aid);return `<select id="evoSel" aria-label="Ficha">${fa?`<option value="ativa" ${S.evoF==='ativa'?'selected':''}>Ficha ativa: ${esc(fa.nome)}</option>`:''}<option value="todas" ${S.evoF==='todas'||(!fa&&S.evoF==='ativa')?'selected':''}>Todas as fichas</option>${fichasDe(aid).filter(f=>f.id!==fa?.id).map(f=>`<option value="${f.id}" ${S.evoF===f.id?'selected':''}>${esc(f.nome)}</option>`).join('')}</select>`}
function evolucao(aid){
 const fa=ativaDe(aid);const sel=S.evoF==='ativa'?(fa?.id||'todas'):S.evoF;
 const fsel=sel==='todas'?null:ficha(sel);
 const ss=sessDe(aid).filter(s=>!fsel||s.fichaId===fsel.id);
 const meta=metaDe(fsel||fa);
 const filtro=fichaSel(aid);
 if(!ss.length)return `${filtro}<div class="empty">Os gráficos de frequência, duração, carga e dor aparecem depois do primeiro treino salvo${fsel?' nesta ficha':''}.</div>`;
 const ws=weekStart(Date.now());
 const weeks=[...Array(8)].map((_,i)=>{const w=ws-(7-i)*7*DAY;return {l:ddmm(w),v:weekCount(w,aid,fsel?.id)}});
 const last4=weeks.slice(4).reduce((a,w)=>a+w.v,0)/4;
 const avgDur=Math.round(ss.reduce((a,s)=>a+s.dur,0)/ss.length/60);
 const durItems=ss.slice(0,10).reverse().map(s=>({l:ddmm(s.inicio),v:Math.round(s.dur/60),c:lcol(s.letra)}));
 const names={};ss.forEach(s=>Object.values(s.ex||{}).forEach(r=>{if(r.sets.some(x=>x.kg>0)){const k=nk(r.n);names[k]=names[k]||r.n}}));
 const keys=Object.keys(names).sort((a,b)=>names[a].localeCompare(names[b],'pt'));
 const ce=keys.includes(S.chartEx)?S.chartEx:keys[0];
 let carga='<div class="empty">Registre cargas em kg para acompanhar a evolução por exercício.</div>';
 if(ce){const pts=ss.filter(s=>Object.values(s.ex).some(r=>nk(r.n)===ce&&r.sets.some(x=>x.kg>0))).reverse().map(s=>{const st=Object.values(s.ex).find(r=>nk(r.n)===ce).sets;const b1=melhor1rm(st);return {l:ddmm(s.inicio),v:Math.max(...st.map(x=>+x.kg||0)),vol:st.reduce((a,x)=>a+(+x.kg||0)*(+x.reps||0),0),rm:b1?b1.v:0,b1:b1?{...b1,t:s.inicio}:null}});
  const rms=pts.map(p=>p.rm),best1=pts.reduce((m,p)=>p.b1&&(!m||p.b1.v>m.v)?p.b1:m,null);
  const first=pts[0].v,lastv=pts[pts.length-1].v,best=Math.max(...pts.map(p=>p.v)),diff=lastv-first;
  carga=`<select id="exSel" aria-label="Exercício">${keys.map(k=>`<option value="${esc(k)}" ${k===ce?'selected':''}>${esc(names[k])}</option>`).join('')}</select>${line(pts,{unit:' kg',extra:best1?rms:null})}${best1?`<div class="legend"><span><i style="background:var(--accent)"></i>Carga máxima</span><span><i style="background:var(--t1)"></i>1RM estimado (tracejado)</span></div>`:''}
  <div class="kpis"><div class="kpi"><b>${fmtKg(lastv)}</b><span>kg na última</span></div><div class="kpi"><b>${fmtKg(best)}</b><span>kg recorde</span></div><div class="kpi"><b style="color:${diff>0?'var(--good)':diff<0?'var(--bad)':'var(--ink)'}">${diff>0?'+':''}${fmtKg(diff)}</b><span>kg desde o início</span></div></div>
  <div class="small muted">Volume na última sessão: <b class="num" style="color:var(--ink)">${Math.round(pts[pts.length-1].vol).toLocaleString('pt-BR')} kg</b> (carga × repetições)</div>${bloco1rm(best1)}`}
 const painPts=ss.filter(s=>Object.values(s.ex||{}).some(r=>r.dor!=null)).slice(0,12).reverse().map(s=>({l:ddmm(s.inicio),v:Math.max(...Object.values(s.ex).filter(r=>r.dor!=null).map(r=>r.dor))}));
 const dor=painPts.length?`${line(painPts,{min:0,max:10,bands:true})}<div class="legend"><span><i style="background:var(--good-soft)"></i>0–2 aceitável</span><span><i style="background:var(--warn-soft)"></i>3–4 monitorar</span><span><i style="background:var(--bad-soft)"></i>5+ interromper</span></div>`:'<div class="empty">Marque a dor de 0 a 10 nos exercícios com escala de dor para ver a tendência aqui.</div>';
 const psePts=ss.filter(s=>s.feedback?.pse).slice(0,12).reverse().map(s=>({l:ddmm(s.inicio),v:s.feedback.pse}));
 const pse=psePts.length?`<section class="panel"><div class="eyebrow">Esforço percebido · 1 a 10</div>${line(psePts,{min:0,max:10})}</section>`:'';
 return `${filtro}
 <div class="kpis"><div class="kpi"><b>${ss.length}</b><span>treinos</span></div><div class="kpi"><b>${last4.toFixed(1).replace('.',',')}</b><span>por semana (4 sem.)</span></div><div class="kpi"><b>${avgDur}</b><span>min em média</span></div></div>
 <section class="panel"><div class="eyebrow">Frequência semanal · últimas 8 semanas</div>${bars(weeks,{target:meta})}</section>
 <section class="panel"><div class="eyebrow">Duração dos treinos (min)</div>${bars(durItems)}<div class="legend">${[...new Set(ss.slice(0,10).map(s=>s.letra))].sort().map(l=>`<span><i style="background:${lcol(l)}"></i>Treino ${esc(l)}</span>`).join('')}</div></section>
 <section class="panel"><div class="eyebrow">Carga máxima por exercício</div>${carga}</section>
 <section class="panel"><div class="eyebrow">Dor · pior nota de cada treino</div>${dor}</section>${pse}${corridaEvo(aid)}`}
function historico(aid){
 const ss=sessDe(aid);
 const list=ss.map(s=>{const lines=(s.corrida?`<div class="l"><span>${fmtDist(s.corrida.dist)} em ${fmtHMS(s.corrida.tempo)}</span><span>${fmtRitmo(s.corrida.ritmo)}${s.corrida.fc?' · FC '+s.corrida.fc:''}${s.corrida.dor!=null?' · dor '+s.corrida.dor:''}${s.corrida.fonte&&s.corrida.fonte!=='manual'&&s.corrida.fonte!=='plano'?' · '+s.corrida.fonte.toUpperCase():''}</span></div>`:'')+Object.values(s.ex||{}).map(r=>`<div class="l"><span>${esc(r.n)}${r.dor!=null?` · dor ${r.dor}`:''}</span><span>${r.sets.map(x=>fmtSet(x,1)).join(' · ')}</span></div>`).join('')+(s.pulados?.length?`<div class="l"><span class="muted">Pulados</span><span>${esc(s.pulados.join(', '))}</span></div>`:'')+(s.conduzidoPor?`<div class="small muted">Treino conduzido pelo Personal ${esc(s.conduzidoNome||'')}</div>`:'');
  const fb=s.feedback?`<div class="fb">${s.feedback.pse?`Esforço ${s.feedback.pse}/10`:''}${s.feedback.txt?`${s.feedback.pse?' · ':''}“${esc(s.feedback.txt)}”`:''}</div>`:'';
  const del=S.confirmDel===s.id?`<div class="nav2"><button class="btn sm danger" data-act="delok" data-v="${s.id}">Excluir de vez</button><button class="btn sm ghost" data-act="delno">Manter</button></div>`:`<button class="btn sm ghost" data-act="del" data-v="${s.id}" style="align-self:flex-start">Excluir treino</button>`;
  const fn=ficha(s.fichaId)?.nome;
  return `<details ${S.confirmDel===s.id?'open':''}><summary>${letter(s.letra,'s')}<div class="grow"><b>${dataLonga(s.inicio)}</b><div class="small muted">${new Date(s.inicio).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} · ${Math.round(s.dur/60)} min${s.feedback?.pse?` · esforço ${s.feedback.pse}`:''}${s.dor24?` · dor em 24 h: ${s.dor24}`:''}${s._p&&!S.cloud?' · aguardando envio':''}</div>${fn?`<div class="small muted">${esc(fn)}</div>`:''}</div><span class="muted">›</span></summary><div class="det">${fb}${lines||'<span class="muted">Sem séries registradas.</span>'}${del}</div></details>`}).join('');
 return `<section class="panel" style="gap:0">${list||'<div class="empty">Nenhum treino salvo ainda.</div>'}</section>`}

/* ================= Personal ================= */
function codigoCard(){const c=S.pdoc?.codigo;if(!c)return '';return `<section class="panel" style="gap:6px"><div class="eyebrow">Seu código de convite</div><div class="row"><b class="num grow" style="font-size:34px;letter-spacing:.08em">${esc(c)}</b><button class="btn sm ghost" data-act="copycode" data-v="${esc(c)}">Copiar</button></div><div class="small muted">O aluno informa este código em Meu perfil para entrar na sua carteira.</div></section>`}
function alunosBody(){
 const ws=weekStart(Date.now());let al=alunos(),inat=alunos(true).filter(p=>p.ativo===false);
 if(S.g&&S.gf){const f=x=>S.gf==='-'?!x.personalId:x.personalId===S.gf;al=al.filter(f);inat=inat.filter(f)}
 const tot=al.reduce((a,p)=>a+weekCount(ws,p.id),0),nal=al.reduce((a,p)=>a+alertas(p.id).filter(x=>x.c!=='info').length,0);
 const U=S.newU;
 const nu=U?`<section class="form"><h3>Cadastrar aluno</h3>
  <div class="field"><label class="lbl" for="nu-nome">Nome</label><input id="nu-nome" class="txt" data-nu="nome" value="${esc(U.nome)}" placeholder="Ex.: Eloisa"></div>
  <div class="field"><label class="lbl" for="nu-email">E-mail do aluno</label><input id="nu-email" class="txt" type="email" data-nu="email" value="${esc(U.email||'')}"></div>
  <div class="field"><label class="lbl" for="nu-senha">Senha provisória (mínimo 8, com letras e números)</label><input id="nu-senha" class="txt" data-nu="senha" value="${esc(U.senha||'')}"></div>
  ${U.err?`<div class="note bad">${esc(U.err)}</div>`:''}<div class="small muted">Passe o e-mail e a senha ao aluno. Ele pode trocar a senha em “Esqueci minha senha”.</div>
  <div class="nav2"><button class="btn ghost" data-act="nucancel">Cancelar</button><button class="btn primary" data-act="nusave" ${U.busy?'disabled':''}>Cadastrar</button></div></section>`:`<button class="btn primary" data-act="nuopen">+ Cadastrar aluno</button>`;
 const card=p=>{const f=ativaDe(p.id),meta=metaDe(f),wk=weekCount(ws,p.id),ss=sessDe(p.id),al=alertas(p.id),ax=andCardExtra(p);
  return `<div class="panel stud" role="button" tabindex="0" data-act="aluno" data-v="${p.id}"><div class="row">${avatar(p)}<div class="grow"><h2>${esc(p.nome)}</h2><div class="small muted">${f?esc(f.nome):'Sem ficha ativa'}</div>${S.g?`<div class="small muted">${p.personalId?'Personal: '+esc(nomeP(p.personalId)):'Sem Personal'}</div>`:''}</div><div style="text-align:right"><b class="num" style="font-size:24px">${wk}/${meta}</b><div class="small muted">na semana</div></div>${ax.btn}</div>${ax.tag}
  <div class="meter"><i style="width:${Math.min(100,wk/meta*100)}%"></i></div>
  <div class="small muted">${ss.length?`Último treino: ${dataLonga(ss[0].inicio)} · ${ss.length} no total`:'Nenhum treino registrado'}</div>
  ${al.length?`<div class="alerts">${al.slice(0,3).map(x=>`<div class="al ${x.c}">${esc(x.t)}</div>`).join('')}</div>`:''}</div>`};
 const filtro=S.g?`<select id="gfSel" aria-label="Filtrar por Personal"><option value="">Todos os Personais</option><option value="-" ${S.gf==='-'?'selected':''}>Sem Personal</option>${S.personais.map(x=>`<option value="${x.id}" ${S.gf===x.id?'selected':''}>${esc(x.nome)}</option>`).join('')}</select>`:'';
 return `${filtro}${PM()?feedHoje():''}<div class="kpis"><div class="kpi"><b>${al.length}</b><span>alunos ativos</span></div><div class="kpi"><b>${tot}</b><span>treinos na semana</span></div><div class="kpi"><b style="color:${nal?'var(--bad)':'var(--ink)'}">${nal}</b><span>alertas</span></div></div>
 ${nu}${al.map(card).join('')}${inat.length?`<div class="eyebrow">Inativos</div>${inat.map(p=>`<button class="panel stud" data-act="aluno" data-v="${p.id}"><div class="row">${avatar(p,'s')}<b class="grow">${esc(p.nome)}</b><span class="chip">Inativo</span></div></button>`).join('')}`:''}`}
function viewAluno(){
 const p=perfil(S.sel);if(!p){S.view='alunos';return viewAlunos()}
 const sub=S.sub;
 const st=`<div class="subtabs">${[['fichas','Fichas'],['evolucao','Evolução'],['historico','Histórico'],['cadastro','Cadastro']].map(([k,l])=>`<button data-act="sub" data-v="${k}" class="${sub===k?'on':''}">${l}</button>`).join('')}</div>`;
 let body='';
 if(sub==='fichas')body=fichasList(p.id);
 else if(sub==='evolucao'){const es=['musculos','medidas'].includes(S.esub)?S.esub:'graficos';body=`<div class="seg">${[['graficos','Gráficos'],['musculos','Músculos'],['medidas','Medidas']].map(([k,l])=>`<button data-act="esub" data-v="${k}" class="${es===k?'on':''}">${l}</button>`).join('')}</div>${es==='musculos'?musculos(p.id):es==='medidas'?medidas(p.id):relBox(p.id)+evolucao(p.id)}`}
 else if(sub==='historico')body=historico(p.id);
 else{const C=S.conf;body=`<section class="panel">
  <div class="field"><label class="lbl" for="cad-nome">Nome</label><input id="cad-nome" class="txt" data-ch="pnome" value="${esc(p.nome)}"></div>
  <div class="small muted">E-mail de acesso: <b style="color:var(--ink)">${esc(p.email||'—')}</b></div>
  <div class="field"><label class="lbl" for="cad-nasc">Data de nascimento${p.nasc?' · '+idade(p.nasc)+' anos':''}</label><input id="cad-nasc" class="txt" type="date" data-ch="pnasc" value="${esc(p.nasc||'')}"></div>
  ${S.g?`<div class="field"><label class="lbl" for="tr-sel">Personal responsável</label><select id="tr-sel" data-ch="transf"><option value="">Sem Personal</option>${S.personais.filter(x=>x.id!==p.id).map(x=>`<option value="${x.id}" ${p.personalId===x.id?'selected':''}>${esc(x.nome)}</option>`).join('')}</select><div class="small muted">Ao trocar, fichas, treinos e histórico vão junto para o novo Personal.</div></div>`:`<div class="small muted">Personal responsável: <b style="color:var(--ink)">${esc(nomeP(p.personalId)||'—')}</b></div>`}
  ${p.email?`<button class="btn ghost" data-act="rpin">Enviar link para redefinir a senha</button>`:''}${S.cadMsg?`<div class="note good">${esc(S.cadMsg)}</div>`:''}
  ${S.p&&p.personalId===S.me?(C==='enc'?`<div class="miniconf"><span class="grow">Encerrar o acompanhamento de ${esc(p.nome)}? Você deixa de ver os dados dele.</span><button class="btn sm danger" data-act="penc">Encerrar</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`:`<button class="btn danger" data-act="conf" data-v="enc">Encerrar acompanhamento</button>`):''}
  ${S.g?`<button class="btn ${p.ativo===false?'primary':'danger'}" data-act="pativo">`:'<span hidden>'}${p.ativo===false?'Reativar aluno':'Desativar aluno'}${S.g?'</button>':'</span>'}
  ${S.g?'<div class="small muted">Desativar esconde o aluno do painel. Fichas e histórico são mantidos. Transferências devem ter a concordância do aluno.</div>':''}</section>`}
 const al=alertas(p.id);
 const fbp=S.fb&&S.sessions.find(x=>x.id===S.fb)?.alunoId===p.id?fbPanel():'';
 return page(p.ativo===false?'Aluno inativo':'Aluno',esc(p.nome),`${fbp}${treinarJunto(p.id)}${al.length&&sub!=='cadastro'?`<div class="alerts">${al.map(x=>`<div class="al ${x.c} alr"><span class="grow">${esc(x.t)}</span>${x.k?`<button class="ciente" data-act="ciente" data-v="${esc(x.k)}">Ciente</button>`:''}</div>`).join('')}${al.filter(x=>x.k).length>1?`<button class="btn sm ghost" data-act="cientes" style="align-self:flex-end">Ciente de todos</button>`:''}</div>`:''}${st}${body}`,{back:S.g?'gestao':'alunos'})}
/* ================= Render ================= */
function render0(){
 if(!configOK)return viewConfig();
 if(!S.me)return S.ready?viewLogin():viewSplash();
 if(S.needVerify)return viewVerificar();
 if(!S.ready)return viewSplash();
 if(ME()&&!ME().aceite)return viewTermos();
 if(S.view==='login')S.view=PM()?'alunos':'inicio';
 if(S.view==='treino'&&!myActive())S.view='inicio';
 const v=S.view;
 if(v==='treino'&&myActive())return myActive().tipo==='corrida'?viewCorrida():viewTreino();
 if(v==='perfil')return viewPerfil();
 if(v==='comunidade')return viewComunidades();
 if(v==='busca')return viewBusca();
 if(v==='ia')return viewIA();
 if(v==='aluno'&&isPT())return viewAluno();
 if(v==='ficha'&&S.bib)return viewBiblio();
 if(v==='ficha')return viewFicha();
 if(PM()){if(v==='modelos')return page('Biblioteca do Personal','Modelos',fichasList('modelos'));if(S.g&&v==='gestao')return viewGestao();S.view='alunos';return viewAlunos()}
 if(S.g&&v==='gestao')return viewGestao();
 if(v==='treino')return myActive()?.tipo==='corrida'?viewCorrida():viewTreino();
 if(v==='corridaReg')return viewRegistro();
 if(v==='fichas')return viewTreinos();
 if(v==='evolucao'||v==='historico'){S.psub=v==='historico'?'historico':'graficos';S.view='progresso'}
 if(S.view==='progresso')return viewProgresso();
 if(v==='ficha')return viewFicha();
 S.view='inicio';return viewInicio()}
/* Para os botões − e + : qual valor cada um altera. */
function alvo(k){const a=S.active;if(!a)return [null];
 if(k==='dkg'||k==='dreps')return [a.subd,k.slice(1)];
 if(k==='ekg'||k==='ereps'||k==='esec')return [S.eset?.d,k.slice(1)];
 if(k==='as'||k==='akg'||k==='ahold')return [S.adj?.d,k.slice(1)];
 return [draft(curEx()),k]}
function render(){
 aplicaTema();$('#app').innerHTML=render0();if(S.crop&&typeof cropLiga==='function')cropLiga();tick();
 const sel=$('#exSel');if(sel)sel.onchange=()=>{S.chartEx=sel.value;LS.set('ft.chartEx',sel.value);render()};
 const gs=$('#gfSel');if(gs)gs.onchange=()=>{S.gf=gs.value;render()};
 const es=$('#evoSel');if(es)es.onchange=()=>{S.evoF=es.value;render()};
 document.querySelectorAll('#app input[data-k]').forEach(inp=>inp.onchange=()=>{const [o,k]=alvo(inp.dataset.k);if(!o)return;if(k==='sec'||k==='hold'){o[k]=Math.max(5,parseMS(inp.value)||30);saveActive();return}const v=parseFloat(inp.value.replace(',','.'));o[k]=isNaN(v)?0:Math.max(0,v);if(k==='s')o.s=Math.min(10,Math.max(1,Math.round(o.s)));saveActive()});
 const dl=$('#exlib');if(dl&&(S.view==='ficha'||S.view==='ia')){const set=new Set(LIB);S.fichas.forEach(f=>f.treinos.forEach(t=>t.ex.forEach(e=>set.add(e.n))));dl.innerHTML=[...set].sort((a,b)=>a.localeCompare(b,'pt')).map(n=>`<option value="${esc(n)}">`).join('')}
}
const go=v=>{S.view=v;S.bib=null;S.med=null;S.medDel=null;S.pf=null;S.gmsg=null;S.conf=null;S.form=null;S.confirmDel=null;S.newF=null;S.newU=null;S.imp=null;S.cadMsg='';render();window.scrollTo(0,0)};
function findEx(f,tid,eid){const t=f.treinos.find(x=>x.id===tid);return {t,i:t?t.ex.findIndex(e=>e.id===eid):-1}}
function copyFicha(base,owner,nome){const nf={...clone(base),id:uid('f'),nome,arquivada:false,basico:false,criada:Date.now(),modelo:owner==='modelos',global:owner==='modelos'&&S.g,alunoId:owner==='modelos'?null:owner,autor:ME().nome,tpl:null};delete nf._p;delete nf._seed;delete nf.personalId;delete nf.basico;delete nf.desc;delete nf.alunos;
 nf.treinos=nf.treinos.map(t=>({...t,id:uid('t'),ex:t.ex.map(x=>({...x,id:uid('e')}))}));return nf}
function openEditor(id){S.edit=id;S.back=S.view==='aluno'?'aluno':S.view==='modelos'?'modelos':S.view==='gestao'?'gestao':S.view==='ficha'?S.back:'fichas';S.view='ficha';S.conf=null;S.form=null;S.bib=null;render();window.scrollTo(0,0)}
function curFicha(){return ficha(S.edit)}
function saveF(f){(f.treinos||[]).forEach(t=>t.ex&&migraGrupos(t.ex));put('fichas',f)}

document.addEventListener('input',e=>{const el=e.target;
 if(el.dataset.f&&S.form)S.form.d[el.dataset.f]=el.type==='checkbox'?el.checked:el.value;
 if(el.dataset.nf&&S.newF)S.newF[el.dataset.nf]=el.value;
 if(el.dataset.nu&&S.newU)S.newU[el.dataset.nu]=el.value;
 if(el.dataset.adj&&S.adj)S.adj.d[el.dataset.adj]=el.type==='checkbox'?el.checked:el.value;
});
document.addEventListener('change',e=>{const el=e.target,ch=el.dataset.ch;
 if(el.dataset.f&&S.form&&el.type==='checkbox')S.form.d[el.dataset.f]=el.checked;
 if(el.dataset.f==='tec'&&S.form){S.form.d.tec=el.value;render();return}
 if(el.dataset.adj&&S.adj)S.adj.d[el.dataset.adj]=el.type==='checkbox'?el.checked:el.value;
 if(el.dataset.nf&&S.newF){S.newF[el.dataset.nf]=el.value;if(el.tagName==='SELECT')render()}
 if(!ch)return;
 if(ch==='meunome'){const p=ME(),v=el.value.trim();if(p&&v){p.nome=v;put('perfis',p);document.querySelectorAll('.me span').forEach(x=>x.textContent=v)}return}
 if(ch==='transf'){transferir(S.sel,el.value).then(()=>{toast('Personal responsável atualizado.');render()}).catch(e=>toast('Não foi possível transferir: '+(e.message||e)));return}
 if(ch==='pnasc'||ch==='meunasc'){const p=ch==='pnasc'?perfil(S.sel):ME();if(p){if(dataLocal(el.value))p.nasc=el.value;else delete p.nasc;put('perfis',p);render()}return}
 if(ch==='pnome'){const p=perfil(S.sel),v=el.value.trim();if(p&&v){p.nome=v;put('perfis',p);const h=$('main h1');if(h)h.textContent=v}return}
 const f=curFicha();if(!f)return;
 if(ch==='fnome'){const v=el.value.trim();if(v)f.nome=v}
 if(ch==='fsem'){const v=parseInt(el.value,10);if(v>0&&v<53)f.semanas=v}
 if(ch==='falunos'){f.alunos=el.checked;saveF(f);render();toast(el.checked?'Modelo disponível para os seus alunos.':'Modelo privado: só você vê.');return}
 if(ch==='fmeta'){const v=parseInt(el.value,10);if(v>=1&&v<=7)f.meta=v}
 if(ch==='exkg'){const t=f.treinos.find(x=>x.id===el.dataset.t),x=t?.ex.find(y=>y.id===el.dataset.e);if(x){const v=parseFloat(el.value.replace(',','.'));if(v>0)x.kg=Math.round(v*10)/10;else delete x.kg}}
 if(ch==='fvence'){if(dataLocal(el.value))f.vence=el.value;else delete f.vence;saveF(f);render();return}
 if(ch==='tnome'||ch==='tdia'){const t=f.treinos.find(x=>x.id===el.dataset.t);if(t){if(ch==='tnome'){const v=el.value.trim();if(v)t.nome=v}else t.dia=el.value}}
 saveF(f);if(ch==='fnome'){const h=$('main h1');if(h)h.textContent=f.nome}
});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b||b.disabled)return;unlockAudio();
 const act=b.dataset.act,v=b.dataset.v,a=S.active,f=curFicha();
 switch(act){
  /* entrada */
  case 'google':googleLogin();break;
  case 'amode':S.auth={...S.auth,mode:v,err:'',ok:'',email:($('#au-email')?.value||S.auth.email)};render();break;
  case 'logout':releaseAwake();S.view='login';S.newU=null;S.auth={mode:'entrar',email:'',nome:'',err:'',ok:''};fbAuth&&fbAuth.signOut();window.scrollTo(0,0);break;
  case 'nuopen':S.newU={nome:'',email:'',senha:''};render();setTimeout(()=>$('#nu-nome')?.focus(),0);break;
  case 'nucancel':S.newU=null;render();break;
  case 'nusave':{const U=S.newU,nome=(U.nome||'').trim(),email=(U.email||'').trim();U.err='';
   if(!nome){U.err='Informe o nome.';render();break}if(!email){U.err='Informe o e-mail do aluno.';render();break}if(!senhaOK(U.senha)){U.err='A senha provisória precisa ter pelo menos 8 caracteres, com letras e números.';render();break}
   U.busy=true;render();criarAlunoPeloPersonal(nome,email,U.senha).then(p=>{S.newU=null;S.sel=p.id;S.sub='fichas';go('aluno')}).catch(e=>{U.busy=false;U.err=authMsg(e);render()});break}
  case 'seedm':{const suf=S.g?'':'-'+S.me.slice(0,8);const mk=(t,id,tpl,nome)=>({...clone(t),id:id+suf,tpl,modelo:true,global:S.g,alunoId:null,arquivada:false,nome,autor:ME()?.nome||'Personal',mig1:1});put('fichas',mk(TPL_CONDRO,'m-condro','condro','Full Body ABC – condropatia patelar'));put('fichas',mk(TPL_TEND,'m-tend','tend','Full Body ABC – tendinite patelar'));render();break}
  case 'copycode':{const t=v;try{navigator.clipboard.writeText(t).then(()=>toast('Código copiado.'),()=>toast('Código: '+t))}catch(e){toast('Código: '+t)}break}
  case 'gsub':S.gsub=v;S.conf=null;S.gmsg=null;S.newU=null;S.newF=null;render();break;
  case 'gfgo':S.gf=v;S.gsub='alunos';S.conf=null;render();window.scrollTo(0,0);break;
  case 'lpgo':{const id=$('#lp-sel')?.value;if(!id){S.gmsg={c:'bad',t:'Escolha o usuário que será Personal.'};render();break}
   liberarPersonal(id).then(c=>{S.gmsg={c:'good',t:`${perfil(id)?.nome} agora é Personal. Código de convite: ${c}. Peça para ele sair e entrar de novo no app.`};render()}).catch(e=>{S.gmsg={c:'bad',t:'Não foi possível liberar: '+(e.message||e)};render()});break}
  case 'revgo':revogarPersonal(v).then(()=>{S.conf=null;S.gmsg={c:'good',t:'Acesso de Personal revogado.'};render()}).catch(e=>{S.gmsg={c:'bad',t:'Não foi possível revogar: '+(e.message||e)};render()});break;
  case 'vid':S.vid=v;render();break;
  case 'ciente':marcarCiente(S.sel,[v]);break;
  case 'cientes':marcarCiente(S.sel,alertas(S.sel).filter(x=>x.k).map(x=>x.k));break;
  case 'semPno':LS.set('ft4.semP',1);render();break;
  /* navegação */
  case 'tab':if(v==='comunidade'){S.com=null;S.cf=null}go(v);if(v==='treino')keepAwake();break;
  case 'aluno':S.sel=v;S.sub='fichas';S.evoF='ativa';go('aluno');break;
  case 'psub':S.psub=v;S.confirmDel=null;S.med=null;S.medDel=null;if(S.view!=='progresso'){go('progresso')}else render();break;
  case 'sub':S.sub=v;S.med=null;S.medDel=null;S.imp=null;S.cadMsg='';S.conf=null;S.newF=null;S.confirmDel=null;S.evoF='ativa';render();break;
  case 'start':startSession(b.dataset.f,v);window.scrollTo(0,0);break;
  /* feedback */
  case 'fbv':S.fbv=+v;{const t=$('#fb-txt');S.fbtxt=t?t.value:''}render();{const t=$('#fb-txt');if(t)t.value=S.fbtxt||''}break;
  case 'fbskip':S.fb=null;S.metaMsg=null;render();break;
  case 'fbsave':{const s=S.sessions.find(x=>x.id===S.fb);const txt=($('#fb-txt')?.value||'').trim();if(s&&(S.fbv||txt)){s.feedback={pse:S.fbv,txt};put('sessions',s)}S.fb=null;S.fbtxt='';S.metaMsg=null;render();if(s&&!s.conduzidoPor&&perfil(s.alunoId)?.personalId)toast('Avaliação enviada ao seu Personal.');break}
  /* fichas */
  case 'nfopen':S.newF={nome:'',base:b.dataset.b||'',owner:v};render();setTimeout(()=>$('#nf-nome')?.focus(),0);break;
  case 'nfcancel':S.newF=null;render();break;
  case 'nfsave':{const o=S.newF.owner,base=ficha(S.newF.base)||basico(S.newF.base);const nome=S.newF.nome.trim()||(base?(base.basico?base.nome:'Cópia de '+base.nome):'Nova ficha');
   const nf=base?copyFicha(base,o,nome):{id:uid('f'),nome,semanas:8,arquivada:false,criada:Date.now(),modelo:o==='modelos',global:o==='modelos'&&S.g,alunoId:o==='modelos'?null:o,autor:ME().nome,mig1:1,meta:3,treinos:[]};
   saveF(nf);if(o!=='modelos'&&!ativaDe(o))setAtiva(o,nf.id);S.newF=null;openEditor(nf.id);break}
  case 'open':openEditor(v);break;
  case 'ativar':{const x=ficha(v);if(x.arquivada){x.arquivada=false;saveF(x)}setAtiva(x.alunoId,v);render();break}
  case 'dup':{const nf=copyFicha(ficha(v),ficha(v).alunoId,'Cópia de '+ficha(v).nome);saveF(nf);openEditor(nf.id);break}
  case 'tomodel':{const nf=copyFicha(ficha(v),'modelos',ficha(v).nome);saveF(nf);S.conf=null;S.back=S.g?'gestao':'modelos';if(S.g)S.gsub='modelos';openEditor(nf.id);break}
  case 'arq':{f.arquivada=!f.arquivada;saveF(f);if(f.arquivada){const p=perfil(f.alunoId);if(p?.ativa===f.id){const o=fichasDe(f.alunoId).find(x=>!x.arquivada&&x.id!==f.id);setAtiva(f.alunoId,o?o.id:null)}}render();break}
  case 'delf':{const aid=f.alunoId;del('fichas',v);if(aid&&perfil(aid)?.ativa===v){const o=fichasDe(aid).find(x=>!x.arquivada);setAtiva(aid,o?o.id:null)}go(S.back);break}
  case 'conf':S.conf=v||null;render();break;
  case 'addt':{if(f.treinos.length>=7)break;f.treinos.push({id:uid('t'),nome:'Treino '+LETRAS[f.treinos.length],dia:'',ex:[]});saveF(f);render();break}
  case 'delt':{f.treinos=f.treinos.filter(t=>t.id!==v);S.conf=null;saveF(f);render();break}
  case 'adde':S.conf=null;S.form=null;S.bib={t:b.dataset.t,mus:'',eq:'Todos',q:'',det:null};render();window.scrollTo(0,0);break;
  case 'edite':{const {t,i}=findEx(f,b.dataset.t,v);const x=t.ex[i];S.conf=null;S.form={t:t.id,e:x.id,d:{n:x.n,tipo:x.tipo,s:String(x.s),r:x.r,desc:fmtMS(x.desc??REST[x.tipo]),hold:fmtMS(x.hold??30),knee:!!x.knee,reab:!!x.reab,nota:x.nota||'',video:x.video||'',kg:+x.kg>0?fmtKg(x.kg):'',tec:x.tec||''}};render();$('#exform')?.scrollIntoView({block:'center'});break}
  case 'ftipo':{const d=S.form.d;if(v==='t'&&!/s|min/.test(d.r))d.r='30-45 s';else if(v!=='t'&&/s|min/.test(d.r))d.r='8-12';d.tipo=v;render();break}
  case 'fcancel':S.form=null;render();break;
  case 'fsave':{const d=S.form.d;const n=d.n.trim();const s=parseInt(d.s,10);if(!n){S.form.err='Informe o nome do exercício.';render();break}if(!(s>0&&s<=10)){S.form.err='Séries deve ser um número entre 1 e 10.';render();break}
   const t=f.treinos.find(x=>x.id===S.form.t);const ex={id:S.form.e||uid('e'),n,s,r:d.r.trim()||'—',tipo:d.tipo,desc:parseMS(d.desc)};
   if(d.tipo==='t')ex.hold=Math.max(5,parseMS(d.hold)||30);if(d.knee)ex.knee=1;if(d.reab)ex.reab=1;if(d.nota.trim())ex.nota=d.nota.trim();if((d.video||'').trim())ex.video=d.video.trim();{const k=parseFloat(String(d.kg||'').replace(',','.'));if(d.tipo!=='t'&&k>0)ex.kg=Math.round(k*10)/10}if(d.tec&&TECNICAS[d.tec])ex.tec=d.tec;
   const i=t.ex.findIndex(x=>x.id===ex.id);if(i>=0)t.ex[i]=ex;else t.ex.push(ex);S.form=null;saveF(f);render();break}
  case 'mv':{const {t,i}=findEx(f,b.dataset.t,v);const j=i+ +b.dataset.d;if(j<0||j>=t.ex.length)break;const pos=k=>({liga:t.ex[k].liga,circ:t.ex[k].circ});const pi=pos(i),pj=pos(j);[t.ex[i],t.ex[j]]=[t.ex[j],t.ex[i]];
   /* a combinação pertence à posição: mover reordena dentro do grupo sem desfazê-lo */[[i,pi],[j,pj]].forEach(([k,p])=>{delete t.ex[k].liga;delete t.ex[k].circ;if(p.liga)t.ex[k].liga=true;if(p.circ)t.ex[k].circ=p.circ});saveF(f);render();break}
  case 'dele':{const t=f.treinos.find(x=>x.id===b.dataset.t);t.ex=t.ex.filter(x=>x.id!==v);S.conf=null;saveF(f);render();break}
  /* cadastro (Personal) */
  case 'rpin':{const p=perfil(S.sel);fbAuth.sendPasswordResetEmail(p.email).then(()=>{S.cadMsg='Link de redefinição enviado para '+p.email+'.';render()}).catch(e=>{S.cadMsg=authMsg(e);render()});break}
  case 'pativo':{const p=perfil(S.sel);p.ativo=p.ativo===false;put('perfis',p);render();break}
  /* sessão */
  case 'go':a.idx=+v;S.eset=null;S.adj=null;saveActive();render();irExecucao();break;
  case 'step':{const [o,k]=alvo(b.dataset.k);if(!o)break;o[k]=Math.max(0,Math.round(((+o[k]||0)+ +b.dataset.d)*10)/10);if(k==='s')o.s=Math.min(10,Math.max(1,o.s));if(k==='sec'||k==='hold')o[k]=Math.max(5,o[k]);saveActive();render();break}
  case 'eset':{const r=a.ex[curEx().id],x=r?.sets[+v];if(!x)break;S.adj=null;S.eset={ex:curEx().id,i:+v,d:x.sec!=null?{sec:x.sec}:{kg:x.kg,reps:x.reps}};render();break}
  case 'esetno':S.eset=null;render();break;
  case 'esetok':{const E=S.eset,x=a.ex[E.ex]?.sets[E.i];if(x){if(x.sec!=null)x.sec=E.d.sec;else{x.kg=+E.d.kg||0;x.reps=+E.d.reps||0}}S.eset=null;saveActive();render();toast('Série atualizada.');break}
  case 'esetdel':{const E=S.eset,r=a.ex[E.ex];if(r){r.sets.splice(E.i,1)}S.eset=null;a.restEnd=null;saveActive();render();break}
  case 'adjopen':{const ex=curEx(),fx=ficha(a.fichaId);S.eset=null;if(S.adj){S.adj=null;render();break}S.adj={ex:ex.id,podeFicha:!!fx&&canEdit(fx),d:{s:ex.s,r:ex.r,kg:+ex.kg||draft(ex).kg||0,hold:ex.hold??30,desc:fmtMS(ex.desc||0),tec:ex.tec||'',ficha:true}};render();break}
  case 'adjno':S.adj=null;render();break;
  case 'adjok':{const ex=curEx(),D=S.adj.d;const ch={s:Math.min(10,Math.max(1,+D.s||1)),r:String(D.r||'').trim()||ex.r,desc:parseMS(D.desc)};
   if(ex.tipo==='t')ch.hold=Math.max(5,+D.hold||30);else ch.kg=+D.kg||0;
   Object.assign(ex,ch);if(D.tec)ex.tec=D.tec;else delete ex.tec;if(ex.tipo!=='t'&&ch.kg>0){const dr=draft(ex);dr.kg=ch.kg}
   let msg='Ajuste aplicado a este treino.';
   if(S.adj.podeFicha&&D.ficha){const fx=ficha(a.fichaId),te=fx?.treinos.find(t=>t.id===a.treinoId)?.ex.find(x=>x.id===ex.id);if(te){Object.assign(te,ch);if(D.tec)te.tec=D.tec;else delete te.tec;if(!(+te.kg>0))delete te.kg;saveF(fx);msg='Ajuste salvo no treino e na ficha.'}}
   S.adj=null;saveActive();render();toast(msg);break}
  case 'skip':{const ex=curEx();a.skip=a.skip||{};a.skip[ex.id]=1;a.restEnd=null;a.sub=null;if(!a.exList.every(isDone))a.idx=nextIdx(a.idx);saveActive();render();window.scrollTo(0,0);toast('“'+ex.n+'” pulado.');break}
  case 'unskip':{a.skip=a.skip||{};delete a.skip[v];saveActive();render();break}
  case 'exok':{const ex=a.exList.find(x=>x.id===v);if(!ex)break;const r=rec(ex);a.skip=a.skip||{};
   if(r.sets.length>=ex.s){if(r.sets.some(x=>x.a)){r.sets=r.sets.filter(x=>!x.a);toast('Desmarcado: “'+ex.n+'” voltou a ficar pendente.')}else toast('Este exercício foi registrado série a série. Para corrigir, toque na série.');saveActive();render();break}
   delete a.skip[ex.id];const d=draft(ex);while(r.sets.length<ex.s)r.sets.push(ex.tipo==='t'?{sec:+d.sec||ex.hold||30,a:1,t:Date.now()}:{kg:+d.kg||0,reps:+d.reps||firstNum(ex.r),a:1,t:Date.now()});
   if(a.sub?.ex===ex.id){a.sub=null;a.miniEnd=null}if(a.restEx===ex.id)a.restEnd=null;saveActive();render();toast('“'+ex.n+'” feito: '+ex.s+' séries com os valores previstos. Toque numa série para corrigir.');break}
  case 'exoff':{const ex=a.exList.find(x=>x.id===v);if(!ex)break;const r=rec(ex);a.skip=a.skip||{};
   if(a.skip[ex.id]&&r.sets.length<ex.s){delete a.skip[ex.id];saveActive();render();break}
   if(r.sets.length>=ex.s){if(!r.sets.some(x=>x.a)){toast('Este exercício já foi concluído.');break}r.sets=r.sets.filter(x=>!x.a)}
   a.skip[ex.id]=1;if(a.sub?.ex===ex.id){a.sub=null;a.miniEnd=null}saveActive();render();break}
  case 'skipchk':{a.skip=a.skip||{};if(a.skip[v])delete a.skip[v];else a.skip[v]=1;if(curEx().id===v&&a.skip[v]){a.sub=null}saveActive();render();break}
  case 'exl':S.exl=!S.exl;render();break;
  case 'sublog':subLog();break;
  case 'subend':avancar(curEx());break;
  case 'imgbig':S.imgBig=S.imgBig===v?null:v;render();break;
  case 'set':{const d=draft(curEx());logSet({kg:+d.kg||0,reps:+d.reps||0});break}
  case 'extra':{const ex=curEx(),d=draft(ex);rec(ex);if(ex.tipo==='t'){a.restEnd=null;a.holdSec=d.sec;a.holdEnd=Date.now()+d.sec*1000}else{a.ex[ex.id].sets.push({kg:+d.kg||0,reps:+d.reps||0,t:Date.now()});startRest(ex)}saveActive();render();break}
  case 'holdgo':{const d=draft(curEx());a.restEnd=null;a.metadeOk=false;a.holdSec=d.sec;a.holdEnd=Date.now()+d.sec*1000;saveActive();render();break}
  case 'holdstop':{const el=Math.round((Date.now()-(a.holdEnd-a.holdSec*1000))/1000);a.holdEnd=null;if(el>=5)logSet({sec:el});else{saveActive();render()}break}
  case 'undo':{const r=a.ex[curEx().id];r&&r.sets.pop();a.restEnd=null;saveActive();render();break}
  case 'dor':rec(curEx()).dor=+v;saveActive();render();break;
  case 'restadj':{const d=+v;a.restEnd+=d*1000;a.restTotal=Math.max(15,a.restTotal+d);const le=a.exList.find(x=>x.id===a.restEx);if(le){le.desc=Math.max(15,(+le.desc||0)+d);const fx=ficha(a.fichaId);const te=fx?.treinos.find(t=>t.id===a.treinoId)?.ex.find(x=>x.id===le.id);if(te){te.desc=le.desc;saveF(fx)}}if(a.restEnd>Date.now())a.restAlerted=false;saveActive();render();break}
  case 'restskip':a.restEnd=null;saveActive();render();break;
  case 'endask':S.confirmEnd=true;render();window.scrollTo(0,0);break;
  case 'endcancel':S.confirmEnd=false;render();break;
  case 'end':endSession(v==='1');window.scrollTo(0,0);break;
  case 'dor24':{const s=sessDe(S.me)[0];s.dor24=v;put('sessions',s);render();break}
  case 'del':S.confirmDel=v;render();break;
  case 'delno':S.confirmDel=null;render();break;
  case 'delok':del('sessions',v);S.confirmDel=null;render();break;
 }
});
function tick(){
 const a=myActive();if(!a)return;const now=Date.now();
 document.querySelectorAll('#elapsed').forEach(el=>el.textContent=hms((now-a.inicio)/1000));
 if(a.tipo==='corrida')return;
 if(a.holdEnd){if(now>=a.holdEnd){finishHold();return}const left=Math.ceil((a.holdEnd-now)/1000);
  if(a.holdSec>60&&!a.metadeOk&&now>=a.holdEnd-a.holdSec*500){a.metadeOk=true;alertaSom('metade',{texto:'Metade do tempo.'})}
  if(left<=3&&left>=1&&a.ticH!==left){a.ticH=left;alertaSom('tic')}
  const c=$('#holdClock');if(c)c.textContent=mmss((a.holdEnd-now)/1000)}
 if(a.miniEnd){const left=(a.miniEnd-now)/1000,c=$('#miniClock');if(c)c.textContent=left>0?mmss(left):'Vai!';
  if(left<=0&&!a.miniAlert){a.miniAlert=true;saveActive();alertaSom('fimDescanso',{texto:'Pausa encerrada. Vai!'});const mc=c?.parentElement;if(mc)mc.classList.add('ok')}}
 if(a.restEnd){const left=(a.restEnd-now)/1000;
  const lc=Math.ceil(left);if(lc<=3&&lc>=1&&a.ticR!==lc+'@'+a.restEnd){a.ticR=lc+'@'+a.restEnd;alertaSom('tic')}
  if(left<=0&&!a.restAlerted){a.restAlerted=true;saveActive();const ex=curEx();const n=Math.min((a.ex[ex.id]?.sets.length||0)+1,ex.s);alertaSom('fimDescanso',{texto:`Bora! Série ${n} de ${ex.s}, ${ex.n}.`})}
  const c=$('#restClock'),arc=$('#ringArc'),sh=$('#sheet'),lb=$('#restLbl'),bt=$('#restBtn');
  if(c)c.textContent=left>0?mmss(left):'+'+mmss(-left);
  if(arc)arc.setAttribute('stroke-dashoffset',String(339.3*(1-Math.max(0,left)/(a.restTotal||1))));
  if(sh&&left<=0&&!sh.classList.contains('done')){sh.classList.add('done');if(lb)lb.textContent='Descanso concluído';if(bt)bt.textContent='Vamos à série'}
 }
 infoMusc()
}
setInterval(tick,250);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){tick();keepAwake()}});
document.addEventListener('click',()=>{const a=myActive();if(a&&!sessaoAudio.ativa){if(a.tipo==='corrida')typeof mediaCorrida==='function'&&mediaCorrida();else mediaMusc()}},true);
document.addEventListener('submit',e=>{if(e.target.id==='authForm'){e.preventDefault();submitAuth()}});
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').then(r=>r.update()).catch(()=>{});let recarregou=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(recarregou||S.view==='treino')return;recarregou=true;location.reload()})}
render();initFirebase();
/* Aba Treinos: lembra qual cartão está aberto entre uma atualização de tela e outra. */
document.addEventListener('toggle',e=>{const d=e.target;if(!d?.dataset?.tid)return;if(d.open)S.tOpen=d.dataset.tid;else if(S.tOpen===d.dataset.tid)S.tOpen=null},true);
