/* ================= Gestão de aulas do Personal =================
   Contratos com horários fixos (individual ou dupla), aulas geradas automaticamente, check do aluno e do Personal,
   faltas com justificativa (12 h de antecedência dão direito a reposição), créditos de reposição (30 dias),
   renovações, planos, pagamentos (registro manual, "Já paguei" do aluno, Pix copia e cola com QR Code) e recibo em PDF.
   Coleções: planos, contratos, aulas, creditos, pagamentos, pagcfg/{personalId}. Dados financeiros: só o Personal e o próprio aluno. */
const AU={key:'',un:[],contratos:[],aulas:[],creditos:[],pagamentos:[],planos:[],pix:null,ok:{},gerSig:''};
const AU_H12=12*3600e3,AU_CRED=30*864e5,AU_CK_ANTES=3600e3,AU_CK_DEPOIS=24*3600e3,AU_JANELA=28;
const AU_DIAS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],AU_D3=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const AU_MOTIVOS=['Saúde','Trabalho','Viagem','Compromisso familiar','Outro'];
const AU_PLANOS={mensal:['Mensal',1],trimestral:['Trimestral',3],semestral:['Semestral',6]};
const AU_FORMAS=['Pix','Dinheiro','Cartão de débito','Cartão de crédito','Transferência'];
const brl=v=>(+v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const auMes=t=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)};
const auMeses=()=>{const d=new Date();return [-2,-1,0,1].map(k=>auMes(new Date(d.getFullYear(),d.getMonth()+k,1)))};
function auAddMeses(iso,k){const d=dataLocal(iso);if(!d)return iso;const y=d.getFullYear(),m=d.getMonth()+k,last=new Date(y,m+1,0).getDate();return isoData(new Date(y,m,Math.min(d.getDate(),last)))}
const auMenos1=iso=>isoData(new Date(dataLocal(iso).getTime()-DAY));
const auIni=(data,hora)=>{const d=dataLocal(data),[h,mi]=String(hora||'0:0').split(':').map(Number);return new Date(d.getFullYear(),d.getMonth(),d.getDate(),h||0,mi||0).getTime()};
const auFim=a=>a.inicioMs+(+a.dur||60)*60000;
const auDataTxt=a=>{const d=dataLocal(a.data);const hoje=hoje0().getTime(),t=d.getTime();const rel=t===hoje?'Hoje':t===hoje+DAY?'Amanhã':t===hoje-DAY?'Ontem':AU_D3[d.getDay()]+' '+ddmm(t);return `${rel} · ${a.hora}`};
const auPCampo=()=>PM()?'personalId':'alunoId';

/* ---------- Leitura do banco ---------- */
function auStop(){AU.un.forEach(f=>f());AU.un=[];AU.key='';AU.ok={};['contratos','aulas','creditos','pagamentos','planos'].forEach(c=>AU[c]=[]);AU.pix=null}
function auWatch(){if(!fdb||!S.ready||!S.me||!ME()){if(AU.key)auStop();return}
 const modo=PM()?'p':'a',pid=modo==='p'?S.me:(ME().personalId||''),key=S.me+'|'+modo+'|'+pid+'|'+auMes(Date.now());if(key===AU.key)return;auStop();AU.key=key;
 if(modo==='a'&&!pid)return;
 const campo=modo==='p'?'personalId':'alunoId';
 const L=(c,q,cb)=>AU.un.push(q.onSnapshot(sn=>{AU[c]=sn.docs.map(d=>({...d.data(),id:d.id}));if(!sn.metadata.fromCache)AU.ok[c]=true;cb&&cb();soft()},e=>console.warn('aulas:'+c,e)));
 L('contratos',fdb.collection('contratos').where(campo,'==',S.me),modo==='p'?auGerar:null);
 L('aulas',fdb.collection('aulas').where(campo,'==',S.me).where('mes','in',auMeses()),modo==='p'?auGerar:null);
 L('creditos',fdb.collection('creditos').where(campo,'==',S.me));
 L('pagamentos',fdb.collection('pagamentos').where(campo,'==',S.me));
 if(modo==='p')L('planos',fdb.collection('planos').where('personalId','==',S.me));
 AU.un.push(fdb.collection('pagcfg').doc(pid).onSnapshot(d=>{AU.pix=d.exists?d.data():null;soft()},()=>{}))}
setInterval(auWatch,1500);
const auTemContrato=()=>!PM()&&AU.contratos.some(c=>c.status!=='encerrado');

/* ---------- Situação de cada aula ---------- */
const AU_ST={prevista:['Prevista',''],avisou:['Falta avisada · aguardando','warn'],aguardando:['Aguardando confirmação','warn'],semcheck:['Sem check','warn'],
 realizada:['Realizada','good'],falta:['Falta','bad'],falta_just:['Falta justificada','info'],cancelada:['Cancelada','']};
function auSt(a){if(a.situacao)return a.situacao;if(a.ckAluno&&a.ckPersonal)return 'realizada';
 if(a.aviso)return a.aviso.decisao==='aceita'?'falta_just':a.aviso.decisao==='recusada'?'falta':'avisou';
 if(Date.now()>auFim(a))return a.ckAluno||a.ckPersonal?'aguardando':'semcheck';return 'prevista'}
const auChip=a=>{const [l,c]=AU_ST[auSt(a)];return `<span class="chip st-${c||'muted'}">${l}</span>`};
const auPodeCkAluno=a=>!a.ckAluno&&!a.situacao&&!a.aviso&&Date.now()>=a.inicioMs-AU_CK_ANTES&&Date.now()<=auFim(a)+AU_CK_DEPOIS;
const auCredSt=c=>c.usadoEm?'usado':Date.now()>c.vence?'expirado':'aberto';
const auPagSt=p=>p.status==='pago'?'pago':p.status==='informado'?'informado':(dataLocal(p.vence)?.getTime()||0)<hoje0().getTime()?'atrasado':'pendente';
const AU_PST={pago:['Pago','good'],informado:['Aluno informou pagamento','info'],atrasado:['Atrasado','bad'],pendente:['A vencer','']};
const auParc=x=>x&&x.cobranca==='parcelado'&&x.meses>1?Math.max(2,Math.min(x.meses,+x.parcelas||x.meses)):1;
const auCobTxt=x=>x.meses>1?(auParc(x)>1?` em ${auParc(x)}× de ${brl(x.valor/auParc(x))}`:' à vista'):'';
const auVigente=c=>c.status!=='encerrado'&&isoData(new Date())<=c.fim;

/* ---------- Geração automática das aulas (no aparelho do Personal) ---------- */
function auGerar(){if(!PM()||!AU.ok.contratos||!AU.ok.aulas)return;const sig=AU.contratos.map(c=>c.id+c.status+c.fim+JSON.stringify(c.horarios)).join('|')+'|'+isoData(new Date());if(sig===AU.gerSig)return;AU.gerSig=sig;
 const tem=new Set(AU.aulas.map(a=>a.id)),novos=[],h0=hoje0().getTime();
 AU.contratos.filter(c=>c.status!=='encerrado').forEach(c=>{const ini=Math.max(h0,dataLocal(c.inicio).getTime()),fim=Math.min(h0+AU_JANELA*DAY,dataLocal(c.fim).getTime());
  for(let t=ini;t<=fim;t+=DAY){const d=new Date(t);d.setHours(0,0,0,0);const data=isoData(d);(c.horarios||[]).filter(h=>+h.dia===d.getDay()).forEach(h=>{const id=`${c.id}_${data.replace(/-/g,'')}_${h.hora.replace(':','')}`;if(tem.has(id))return;
   const ims=auIni(data,h.hora);novos.push({id,personalId:S.me,alunoId:c.alunoId,alunoNome:c.alunoNome,contratoId:c.id,tipo:'regular',data,hora:h.hora,dur:+h.dur||60,local:h.local||'',inicioMs:ims,mes:auMes(ims),criado:Date.now()})})}});
 for(let i=0;i<novos.length;i+=400){const b=fdb.batch();novos.slice(i,i+400).forEach(({id,...a})=>b.set(fdb.collection('aulas').doc(id),a));b.commit().catch(e=>console.warn('gerar aulas',e))}}

/* ---------- Dupla: no máximo 2 alunos no mesmo horário, e no mesmo local ---------- */
function auConflito(data,hora,local,ignorarAluno){const ims=auIni(data,hora);const mesmo=AU.aulas.filter(a=>a.inicioMs===ims&&auSt(a)!=='cancelada'&&a.alunoId!==ignorarAluno);
 if(mesmo.length>=2)return 'Esse horário já tem 2 alunos (limite da aula em dupla).';
 if(mesmo.length===1&&nk(mesmo[0].local||'')!==nk(local||''))return `Para treinar em dupla, o local precisa ser o mesmo da outra aula: “${mesmo[0].local||'sem local'}”.`;return ''}
function auConflitoFixo(h,alunoId,contratoId){const outros=AU.contratos.filter(c=>c.id!==contratoId&&c.alunoId!==alunoId&&auVigente(c));const mesmo=[];
 outros.forEach(c=>(c.horarios||[]).forEach(x=>{if(+x.dia===+h.dia&&x.hora===h.hora)mesmo.push({c,x})}));
 if(mesmo.length>=2)return `${AU_DIAS[h.dia]} às ${h.hora} já tem 2 alunos (limite da aula em dupla).`;
 if(mesmo.length===1&&nk(mesmo[0].x.local||'')!==nk(h.local||''))return `${AU_DIAS[h.dia]} às ${h.hora} já tem ${mesmo[0].c.alunoNome} em “${mesmo[0].x.local||'sem local'}”. Para a dupla, o local precisa ser o mesmo.`;return ''}

/* ---------- Ações do Personal ---------- */
const auRef=(c,id)=>fdb.collection(c).doc(id);
function auCredito(a,motivo){const id=uid('cr');return [id,{personalId:a.personalId,alunoId:a.alunoId,alunoNome:a.alunoNome,contratoId:a.contratoId,origemAula:a.id,origemData:a.data,motivo,criado:Date.now(),vence:Date.now()+AU_CRED,usadoEm:null}]}
async function auDecidir(a,acao){const r=auRef('aulas',a.id),b=fdb.batch();
 if(acao==='ck')b.update(r,{ckPersonal:Date.now()});
 else if(acao==='realizada')b.update(r,{situacao:'realizada'});
 else if(acao==='falta')b.update(r,{situacao:'falta',...(a.aviso?{'aviso.decisao':'recusada'}:{})});
 else if(acao==='aceitar'){const [id,c]=auCredito(a,'Falta justificada: '+(a.aviso?.motivo||''));b.update(r,{situacao:'falta_just','aviso.decisao':'aceita',creditoId:id});b.set(auRef('creditos',id),c)}
 else if(acao==='cancelar'){const [id,c]=auCredito(a,'Aula cancelada pelo Personal');b.update(r,{situacao:'cancelada',creditoId:id});b.set(auRef('creditos',id),c)}
 else if(acao==='desfazer'){const cr=AU.creditos.find(c=>c.id===a.creditoId);if(cr?.usadoEm)throw new Error('A reposição gerada por esta aula já foi agendada. Desfaça a reposição primeiro.');
  b.update(r,{situacao:firebase.firestore.FieldValue.delete(),creditoId:firebase.firestore.FieldValue.delete(),...(a.aviso?{'aviso.decisao':'pendente'}:{})});if(cr)b.delete(auRef('creditos',cr.id))}
 await b.commit()}
async function auAgendarRepo(F){const cr=AU.creditos.find(c=>c.id===F.cred);if(!cr)throw new Error('Escolha o crédito de reposição.');if(auCredSt(cr)!=='aberto')throw new Error('Este crédito não está mais disponível.');
 if(!dataLocal(F.data)||!/^\d{2}:\d{2}$/.test(F.hora||''))throw new Error('Informe a data e o horário.');const ims=auIni(F.data,F.hora);
 if(ims<Date.now()-3600e3)throw new Error('Escolha um horário futuro.');if(ims>cr.vence+DAY)throw new Error(`O crédito vence em ${ddmm(cr.vence)}. Escolha uma data até lá.`);
 const conf=auConflito(F.data,F.hora,F.local,cr.alunoId);if(conf)throw new Error(conf);
 const id=uid('au'),b=fdb.batch();b.set(auRef('aulas',id),{personalId:S.me,alunoId:cr.alunoId,alunoNome:cr.alunoNome,contratoId:cr.contratoId,tipo:'reposicao',creditoId:cr.id,data:F.data,hora:F.hora,dur:+F.dur||60,local:(F.local||'').trim(),inicioMs:ims,mes:auMes(ims),criado:Date.now()});
 b.update(auRef('creditos',cr.id),{usadoEm:id});await b.commit()}
async function auDesfazerRepo(a){if(a.ckAluno||a.ckPersonal||a.situacao)throw new Error('Esta reposição já tem registro de presença.');const b=fdb.batch();b.delete(auRef('aulas',a.id));if(a.creditoId)b.update(auRef('creditos',a.creditoId),{usadoEm:null});await b.commit()}
/* Contratos */
function auPagamentosDe(c){const out=[];const n=auParc(c);const v=Math.round(c.valor/n*100)/100;
 for(let k=0;k<n;k++)out.push({personalId:c.personalId,alunoId:c.alunoId,alunoNome:c.alunoNome,contratoId:c.id,ref:n>1?`${c.planoNome} · parcela ${k+1} de ${n}`:`${c.planoNome} · ${ddmmaa(c.inicio)} a ${ddmmaa(c.fim)}`,valor:k===n-1?Math.round((c.valor-v*(n-1))*100)/100:v,vence:auAddMeses(c.inicio,k),status:'pendente',criado:Date.now()});return out}
function auValidaContrato(F){const al=perfil(F.aluno);if(!al)throw new Error('Escolha o aluno.');const pl=AU.planos.find(p=>p.id===F.plano);if(!pl)throw new Error('Escolha o plano.');
 if(!dataLocal(F.inicio))throw new Error('Informe a data de início.');const hs=(F.horarios||[]).filter(h=>h.hora);if(!hs.length)throw new Error('Inclua ao menos um horário fixo.');
 for(const h of hs){if(!/^\d{2}:\d{2}$/.test(h.hora))throw new Error('Confira os horários.');const e=auConflitoFixo(h,F.aluno,F.renovaDe?AU.contratos.find(c=>c.id===F.renovaDe)?.id:null);if(e)throw new Error(e)}
 const valor=parseFloat(String(F.valor??pl.valor).replace(/\./g,'').replace(',','.'));if(!(valor>0))throw new Error('Confira o valor.');return {al,pl,hs,valor}}
async function auSalvarContrato(F){const {al,pl,hs,valor}=auValidaContrato(F);const id=uid('ct'),fim=auMenos1(auAddMeses(F.inicio,pl.meses));
 const c={personalId:S.me,alunoId:al.id,alunoNome:al.nome,planoId:pl.id,planoNome:pl.nome,tipo:pl.tipo,meses:pl.meses,aulasSemana:pl.aulasSemana,valor,cobranca:pl.meses>1?pl.cobranca:'avista',parcelas:auParc(pl),inicio:F.inicio,fim,
  horarios:hs.map(h=>({dia:+h.dia,hora:h.hora,dur:Math.max(15,Math.min(240,+h.dur||60)),local:(h.local||'').trim().slice(0,60)})),status:'ativo',criado:Date.now(),...(F.renovaDe?{renovadoDe:F.renovaDe}:{})};
 const b=fdb.batch();b.set(auRef('contratos',id),c);auPagamentosDe({...c,id}).forEach(p=>b.set(auRef('pagamentos',uid('pg')),p));
 if(F.renovaDe)b.update(auRef('contratos',F.renovaDe),{status:'renovado',renovadoPara:id});await b.commit();return id}
async function auEncerrar(c){const b=fdb.batch();b.update(auRef('contratos',c.id),{status:'encerrado',encerradoEm:Date.now()});
 AU.aulas.filter(a=>a.contratoId===c.id&&a.tipo==='regular'&&a.inicioMs>Date.now()&&!a.ckAluno&&!a.ckPersonal&&!a.situacao&&!a.aviso).forEach(a=>b.delete(auRef('aulas',a.id)));await b.commit()}
/* Planos */
async function auSalvarPlano(F){const nome=(F.nome||'').trim();if(nome.length<2)throw new Error('Dê um nome ao plano.');const [,meses]=AU_PLANOS[F.tipo]||AU_PLANOS.mensal;
 const valor=parseFloat(String(F.valor||'').replace(/\./g,'').replace(',','.'));if(!(valor>0))throw new Error('Informe o valor do período.');const aps=Math.round(+F.aulasSemana||0);if(!(aps>=1&&aps<=7))throw new Error('Aulas por semana: de 1 a 7.');
 await auRef('planos',F.id||uid('pl')).set({personalId:S.me,nome:nome.slice(0,40),tipo:F.tipo,meses,aulasSemana:aps,valor,cobranca:meses>1?(F.cobranca==='parcelado'?'parcelado':'avista'):'avista',parcelas:meses>1&&F.cobranca==='parcelado'?Math.max(2,Math.min(meses,+F.parcelas||meses)):1,ativo:true,criado:Date.now()})}
/* Pagamentos */
async function auRegistrarPag(p,F){await auRef('pagamentos',p.id).update({status:'pago',pagoEm:dataLocal(F.data)?F.data:isoData(new Date()),forma:AU_FORMAS.includes(F.forma)?F.forma:'Pix',confirmadoEm:Date.now()})}

/* ---------- Ações do aluno ---------- */
async function auCheckAluno(a){await auRef('aulas',a.id).update({ckAluno:Date.now()})}
async function auAvisar(a,F){const noPrazo=Date.now()<=a.inicioMs-AU_H12;await auRef('aulas',a.id).update({aviso:{em:Date.now(),motivo:AU_MOTIVOS.includes(F.motivo)?F.motivo:'Outro',texto:(F.texto||'').trim().slice(0,300),noPrazo,decisao:'pendente'}})}
async function auPedirRepo(c,texto){await auRef('creditos',c.id).update({pedido:{em:Date.now(),texto:(texto||'').trim().slice(0,200)}})}
async function auInformarPag(p){await auRef('pagamentos',p.id).update({status:'informado',informadoEm:Date.now()})}

/* ---------- Pix copia e cola (padrão EMV do Banco Central) ---------- */
const auSemAcento=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9 .,\-]/g,'').trim();
function auCrc16(s){let c=0xFFFF;for(let i=0;i<s.length;i++){c^=s.charCodeAt(i)<<8;for(let j=0;j<8;j++)c=(c&0x8000)?((c<<1)^0x1021):(c<<1);c&=0xFFFF}return c.toString(16).toUpperCase().padStart(4,'0')}
function auChavePix(cfg){let k=String(cfg?.chave||'').trim();if(cfg?.tipo==='telefone'){k=k.replace(/\D/g,'');if(!k.startsWith('55'))k='55'+k;k='+'+k}else if(cfg?.tipo==='cpf')k=k.replace(/\D/g,'');else if(cfg?.tipo==='email')k=k.toLowerCase();return k}
function auPix(cfg,valor,txid){const f=(id,v)=>id+String(v.length).padStart(2,'0')+v;const nome=auSemAcento(cfg.nome).toUpperCase().slice(0,25)||'PERSONAL',cid=auSemAcento(cfg.cidade).toUpperCase().slice(0,15)||'BRASIL';
 let p=f('00','01')+f('26',f('00','br.gov.bcb.pix')+f('01',auChavePix(cfg)))+f('52','0000')+f('53','986')+(valor>0?f('54',(+valor).toFixed(2)):'')+f('58','BR')+f('59',nome)+f('60',cid)+f('62',f('05',String(txid||'').replace(/[^A-Za-z0-9]/g,'').slice(0,25)||'***'))+'6304';
 return p+auCrc16(p)}
async function auQr(txt){await carregaScript('js/vendor/qrcode-generator.js');const q=qrcode(0,'M');q.addData(txt);q.make();return q.createSvgTag({cellSize:5,margin:3,scalable:true})}

/* ---------- Recibo em PDF ---------- */
async function auRecibo(p){const jsPDF=await pdfLib();const doc=new jsPDF({unit:'mm',format:'a4'});const ac=pdfAcento();const W=doc.internal.pageSize.getWidth();const c=AU.contratos.find(x=>x.id===p.contratoId);
 const pid=p.personalId,px=pid===S.me?(S.pdoc||{}):(pub(pid)||{}),pnome=px.nome||nomeP(pid)||'Personal';
 let y=pdfCabecalho(doc,ac,'Recibo de pagamento',brl(p.valor),[`Recibo nº ${p.id.slice(-8).toUpperCase()}   ·   emitido em ${ddmmaa(isoData(new Date()))}`]);
 doc.setFont('helvetica','normal');doc.setFontSize(11.5);doc.setTextColor(...PDF_COR.ink);
 const txt=`Recebi de ${p.alunoNome} a quantia de ${brl(p.valor)}, referente a ${p.ref}${c?`, do contrato de ${ddmmaa(c.inicio)} a ${ddmmaa(c.fim)} (${c.aulasSemana} aula${c.aulasSemana>1?'s':''} por semana)`:''}, paga em ${ddmmaa(p.pagoEm||isoData(new Date()))} por ${p.forma||'Pix'}.`;
 const lin=doc.splitTextToSize(pdfTxt(txt),W-28);doc.text(lin,14,y+2);y+=lin.length*6.2+22;
 doc.setDrawColor(...PDF_COR.ink);doc.setLineWidth(.3);doc.line(W/2-45,y,W/2+45,y);doc.setFontSize(10.5);doc.text(pdfTxt(pnome),W/2,y+6,{align:'center'});
 if(px.cref){doc.setFontSize(9);doc.setTextColor(...PDF_COR.muted);doc.text('CREF '+pdfTxt(px.cref),W/2,y+11,{align:'center'})}
 y+=22;doc.setFontSize(8);doc.setTextColor(...PDF_COR.muted);doc.text(doc.splitTextToSize('Recibo emitido pelo Personal por meio do Pro Treino, ferramenta de registro. O aplicativo não intermedeia nem processa pagamentos.',W-28),14,y);
 pdfRodape(doc,p.alunoId);await pdfEntrega(doc,pdfNome('recibo',p.alunoNome+'-'+p.vence))}

/* ================= Telas ================= */
const auSub=(lista,cur,act)=>`<div class="subtabs au">${lista.map(([k,l,n])=>`<button data-act="${act}" data-v="${k}" class="${cur===k?'on':''}">${l}${n?`<i class="badge" aria-label="${n} pendências"></i>`:''}</button>`).join('')}</div>`;
function auAulaLinha(a,o={}){const st=auSt(a),sel=S.auSel===a.id;const P=PM();
 const cks=`<span class="cks" aria-label="Check do aluno ${a.ckAluno?'feito':'pendente'}; check do Personal ${a.ckPersonal?'feito':'pendente'}"><i class="${a.ckAluno?'on':''}">A</i><i class="${a.ckPersonal?'on':''}">P</i></span>`;
 const titulo=P?esc(a.alunoNome):esc(o.semData?a.hora:auDataTxt(a));
 const sub=[P?(o.semData?'':auDataTxt(a)):'',`${a.dur} min`,a.local?esc(a.local):'',a.tipo==='reposicao'?'reposição':''].filter(Boolean).join(' · ');
 let acts='';
 if(sel&&P){const pend=a.aviso&&a.aviso.decisao==='pendente';
  acts=`<div class="auacts">${a.aviso?`<div class="note ${a.aviso.noPrazo?'info':'warn'}"><b>Aviso de falta:</b> ${esc(a.aviso.motivo)}${a.aviso.texto?' · “'+esc(a.aviso.texto)+'”':''}<br><span class="small">Enviado ${new Date(a.aviso.em).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · ${a.aviso.noPrazo?'com 12 h ou mais de antecedência':'com menos de 12 h: só gera reposição como exceção'}</span></div>`:''}
   <div class="row" style="gap:6px;flex-wrap:wrap">${pend?`<button class="btn sm primary" data-act="audec" data-x="aceitar" data-v="${a.id}">${a.aviso.noPrazo?'Aceitar justificativa':'Aceitar como exceção'} (gera reposição)</button><button class="btn sm ghost" data-act="audec" data-x="falta" data-v="${a.id}">Recusar (falta)</button>`:''}
   ${!a.situacao&&!a.aviso?`${!a.ckPersonal?`<button class="btn sm primary" data-act="audec" data-x="ck" data-v="${a.id}">✓ Confirmar presença</button>`:''}${Date.now()>a.inicioMs?`<button class="btn sm ghost" data-act="audec" data-x="realizada" data-v="${a.id}">Marcar realizada</button><button class="btn sm ghost" data-act="audec" data-x="falta" data-v="${a.id}">Marcar falta</button>`:''}${Date.now()<auFim(a)?`<button class="btn sm ghost" data-act="audec" data-x="cancelar" data-v="${a.id}">Cancelar (gera reposição)</button>`:''}`:''}
   ${a.situacao?`<button class="btn sm ghost" data-act="audec" data-x="desfazer" data-v="${a.id}">Desfazer decisão</button>`:''}
   ${a.tipo==='reposicao'&&!a.ckAluno&&!a.ckPersonal&&!a.situacao?`<button class="btn sm ghost" style="color:var(--bad)" data-act="aurepodel" data-v="${a.id}">Desmarcar reposição</button>`:''}</div></div>`}
 if(sel&&!P){const F=S.auAv&&S.auAv.id===a.id?S.auAv:null;const noPrazo=Date.now()<=a.inicioMs-AU_H12;
  acts=`<div class="auacts">${a.aviso?`<div class="note ${a.aviso.decisao==='aceita'?'good':a.aviso.decisao==='recusada'?'bad':'info'}">Você avisou: ${esc(a.aviso.motivo)}${a.aviso.texto?' · “'+esc(a.aviso.texto)+'”':''}. ${a.aviso.decisao==='aceita'?'Justificativa aceita: você ganhou uma reposição.':a.aviso.decisao==='recusada'?'O Personal registrou como falta.':a.aviso.noPrazo?'Aguardando o Personal. Se aceita, gera uma reposição.':'Aviso com menos de 12 h: só gera reposição se o Personal abrir exceção.'}</div>`
   :F?`<div class="form" style="gap:10px"><b>Não vou poder ir</b><div class="field"><label class="lbl" for="av-mot">Motivo</label><select id="av-mot" data-auav="motivo">${AU_MOTIVOS.map(m=>`<option ${F.motivo===m?'selected':''}>${m}</option>`).join('')}</select></div><div class="field"><label class="lbl" for="av-txt">Detalhes (opcional)</label><textarea id="av-txt" class="txt" maxlength="300" data-auav="texto">${esc(F.texto||'')}</textarea></div>
     <div class="note ${noPrazo?'info':'warn'}">${noPrazo?'Aviso com 12 h ou mais de antecedência: se o Personal aceitar, você ganha uma reposição válida por 30 dias.':'Faltam menos de 12 h para a aula: a falta não gera reposição, a não ser que o Personal abra exceção.'}</div>
     <div class="nav2"><button class="btn ghost" data-act="auavno">Voltar</button><button class="btn primary" data-act="auavok" data-v="${a.id}">Enviar aviso</button></div></div>`
   :`<div class="row" style="gap:6px;flex-wrap:wrap">${auPodeCkAluno(a)?`<button class="btn sm primary" data-act="auck" data-v="${a.id}">✓ Fazer check-in</button>`:''}${!a.ckAluno&&!a.situacao&&Date.now()<a.inicioMs?`<button class="btn sm ghost" data-act="auav" data-v="${a.id}">Não vou poder ir</button>`:''}${!auPodeCkAluno(a)&&!a.ckAluno&&!a.situacao&&Date.now()<a.inicioMs-AU_CK_ANTES?`<span class="small muted">O check-in abre 1 h antes da aula.</span>`:''}</div>`}</div>`}
 return `<div class="auitem ${sel?'sel':''}"><button class="aulinha" data-act="ausel" data-v="${a.id}"><div class="grow"><b>${titulo}</b><div class="small muted">${sub}</div></div><div class="aust">${auChip(a)}${cks}</div></button>${acts}</div>`}
function auGrupoHora(lista,o){const g={};lista.forEach(a=>{const k=a.data+' '+a.hora+'|'+nk(a.local||'');(g[k]=g[k]||[]).push(a)});
 return Object.entries(g).sort(([a],[b])=>a.localeCompare(b)).map(([k,as])=>as.length>1?`<div class="dupla"><div class="eyebrow">Dupla · ${esc(as[0].hora)}${as[0].local?' · '+esc(as[0].local):''}</div>${as.map(a=>auAulaLinha(a,o)).join('')}</div>`:auAulaLinha(as[0],o)).join('')}

/* ---------- Personal ---------- */
function auPendencias(){const h0=hoje0().getTime(),lim=h0-14*DAY;
 const avisos=AU.aulas.filter(a=>a.aviso&&a.aviso.decisao==='pendente'&&!a.situacao);
 const conf=AU.aulas.filter(a=>a.inicioMs>=lim&&['aguardando','semcheck'].includes(auSt(a))&&!a.aviso);
 const pedidos=AU.creditos.filter(c=>c.pedido&&auCredSt(c)==='aberto');
 const renov=AU.contratos.filter(c=>c.status==='ativo'&&(dataLocal(c.fim).getTime()-h0)<=15*DAY);
 const pags=AU.pagamentos.filter(p=>['informado','atrasado'].includes(auPagSt(p)));
 return {avisos,conf,pedidos,renov,pags,n:avisos.length+conf.length+pedidos.length+renov.length+pags.length}}
function viewAulasP(){const sub=S.ausub||'hoje',P=auPendencias();
 const st=auSub([['hoje','Hoje',P.n],['agenda','Agenda'],['repos','Reposição',P.pedidos.length],['contratos','Contratos',P.renov.length],['financeiro','Finanças',P.pags.length]],sub,'ausub');
 const body=sub==='agenda'?auAgenda():sub==='repos'?auRepos():sub==='contratos'?auContratos():sub==='financeiro'?auFinanceiro():auHoje(P);
 return pageHero('Aulas','Agenda, presença, reposições e pagamentos',st+body,{personal:true})}
function auHoje(P){const h=isoData(new Date()),hoje=AU.aulas.filter(a=>a.data===h).sort((a,b)=>a.inicioMs-b.inicioMs);
 const real=hoje.filter(a=>auSt(a)==='realizada').length;
 const kp=`<div class="kpis"><div class="kpi"><b>${hoje.filter(a=>auSt(a)!=='cancelada').length}</b><span>aulas hoje</span></div><div class="kpi"><b>${real}</b><span>realizadas</span></div><div class="kpi"><b>${P.n}</b><span>pendências</span></div></div>`;
 const sec=(t,h)=>h?`<section class="panel" style="gap:6px"><div class="eyebrow">${t}</div>${h}</section>`:'';
 const avisos=sec(`Avisos de falta para avaliar · ${P.avisos.length}`,P.avisos.sort((a,b)=>a.inicioMs-b.inicioMs).map(a=>auAulaLinha(a)).join(''));
 const conf=sec(`Presenças para resolver · ${P.conf.length}`,P.conf.sort((a,b)=>a.inicioMs-b.inicioMs).map(a=>auAulaLinha(a)).join('')+(P.conf.length?'<div class="small muted">Aulas passadas sem os dois checks. Toque para marcar como realizada ou falta.</div>':''));
 const ped=sec('Pedidos de reposição',P.pedidos.map(c=>`<button class="item" data-act="ausub" data-v="repos" style="width:100%;text-align:left"><div class="grow"><b>${esc(c.alunoNome)}</b><div class="small muted">“${esc(c.pedido.texto||'sem preferência')}” · vence ${ddmm(c.vence)}</div></div><span class="chip">Agendar</span></button>`).join(''));
 const ren=sec('Contratos para renovar',P.renov.map(c=>`<button class="item" data-act="ausub" data-v="contratos" style="width:100%;text-align:left"><div class="grow"><b>${esc(c.alunoNome)}</b><div class="small muted">${esc(c.planoNome)} · ${dataLocal(c.fim).getTime()<hoje0().getTime()?'venceu':'vence'} em ${ddmmaa(c.fim)}</div></div><span class="chip">Renovar</span></button>`).join(''));
 const pg=sec('Pagamentos',P.pags.map(p=>`<button class="item" data-act="ausub" data-v="financeiro" style="width:100%;text-align:left"><div class="grow"><b>${esc(p.alunoNome)}</b><div class="small muted">${esc(p.ref)} · ${brl(p.valor)} · vence ${ddmmaa(p.vence)}</div></div><span class="chip st-${AU_PST[auPagSt(p)][1]}">${AU_PST[auPagSt(p)][0]}</span></button>`).join(''));
 return `${kp}<section class="panel" style="gap:6px"><div class="eyebrow">Aulas de hoje</div>${hoje.length?auGrupoHora(hoje,{semData:true}):`<div class="small muted">Nenhuma aula hoje.${AU.contratos.length?'':' Cadastre o contrato de um aluno em Contratos: as aulas são geradas sozinhas a partir dos horários fixos.'}</div>`}</section>${avisos}${conf}${ped}${ren}${pg}`}
function auAgenda(){const off=S.auwk||0,ws=weekStart(Date.now())+off*7*DAY;const dias=[...Array(7)].map((_,i)=>ws+i*DAY);
 const nav=`<div class="row" style="gap:8px"><button class="ib" data-act="auwk" data-v="-1" aria-label="Semana anterior">‹</button><div class="grow" style="text-align:center"><b class="num" style="font-size:20px">${off===0?'Esta semana':ddmm(ws)+' a '+ddmm(ws+6*DAY)}</b><div class="small muted">Toque numa aula para confirmar presença, registrar falta ou cancelar</div></div><button class="ib" data-act="auwk" data-v="1" aria-label="Próxima semana">›</button></div>`;
 const corpo=dias.map(t=>{const d=isoData(new Date(t)),as=AU.aulas.filter(a=>a.data===d);if(!as.length)return '';return `<section class="panel" style="gap:6px"><div class="eyebrow">${AU_DIAS[new Date(t).getDay()]} · ${ddmm(t)}</div>${auGrupoHora(as,{semData:true})}</section>`}).join('');
 return `<section class="panel">${nav}</section>${corpo||'<div class="empty">Nenhuma aula nesta semana.</div>'}<div class="small muted" style="text-align:center">A agenda mostra as aulas geradas até 4 semanas à frente.</div>`}
function auRepos(){const F=S.aurp;const ab=AU.creditos.filter(c=>auCredSt(c)==='aberto').sort((a,b)=>(b.pedido?1:0)-(a.pedido?1:0)||a.vence-b.vence);
 const form=F?`<section class="form"><h3>Agendar reposição</h3><div class="field"><label class="lbl" for="rp-cr">Crédito</label><select id="rp-cr" data-aurp="cred">${ab.map(c=>`<option value="${c.id}" ${F.cred===c.id?'selected':''}>${esc(c.alunoNome)} · vence ${ddmm(c.vence)}</option>`).join('')}</select></div>
  <div class="grid2"><div class="field"><label class="lbl" for="rp-d">Data</label><input id="rp-d" class="txt" type="date" data-aurp="data" value="${esc(F.data||'')}"></div><div class="field"><label class="lbl" for="rp-h">Horário</label><input id="rp-h" class="txt" type="time" data-aurp="hora" value="${esc(F.hora||'')}"></div></div>
  <div class="grid2" style="grid-template-columns:90px 1fr"><div class="field"><label class="lbl" for="rp-du">Minutos</label><input id="rp-du" class="txt" inputmode="numeric" data-aurp="dur" value="${esc(F.dur||'60')}"></div><div class="field"><label class="lbl" for="rp-l">Local</label><input id="rp-l" class="txt" data-aurp="local" value="${esc(F.local||'')}"></div></div><div class="small muted">Pode ser num horário livre ou como vaga numa aula de outro aluno, desde que no mesmo local (máximo de 2 por horário).</div>
  ${F.err?`<div class="note bad">${esc(F.err)}</div>`:''}<div class="nav2"><button class="btn ghost" data-act="aurpno">Cancelar</button><button class="btn primary" data-act="aurpok">Agendar</button></div></section>`:'';
 const lin=ab.map(c=>`<div class="item" style="flex-wrap:wrap"><div class="grow"><b>${esc(c.alunoNome)}</b><div class="small muted">${esc(c.motivo)} · aula de ${ddmm(dataLocal(c.origemData).getTime())} · vence em ${ddmmaa(isoData(new Date(c.vence)))} (${Math.max(0,Math.ceil((c.vence-Date.now())/DAY))} dias)</div>${c.pedido?`<div class="fb">Pedido do aluno: “${esc(c.pedido.texto||'sem preferência')}”</div>`:''}</div><button class="btn sm primary" data-act="aurpopen" data-v="${c.id}">Agendar</button></div>`).join('');
 const ag=AU.aulas.filter(a=>a.tipo==='reposicao'&&a.inicioMs>=hoje0().getTime()).sort((a,b)=>a.inicioMs-b.inicioMs);
 const usados=AU.creditos.filter(c=>auCredSt(c)!=='aberto').sort((a,b)=>b.criado-a.criado).slice(0,30);
 return `${form}<section class="panel" style="gap:6px"><div class="eyebrow">Créditos disponíveis · ${ab.length}</div>${lin||'<div class="small muted">Nenhum crédito em aberto. Créditos surgem quando você aceita uma justificativa ou cancela uma aula.</div>'}</section>
 ${ag.length?`<section class="panel" style="gap:6px"><div class="eyebrow">Reposições agendadas</div>${ag.map(a=>auAulaLinha(a)).join('')}</section>`:''}
 ${usados.length?`<details class="panel"><summary><b>Usados e expirados (${usados.length})</b></summary><div class="list">${usados.map(c=>`<div class="item"><div class="grow">${esc(c.alunoNome)}<div class="small muted">${esc(c.motivo)} · ${auCredSt(c)==='usado'?'reposição agendada':'expirou em '+ddmm(c.vence)}</div></div></div>`).join('')}</div></details>`:''}
 <div class="small muted" style="text-align:center">Cada crédito vale por 30 dias. Depois disso, expira.</div>`}
function auContratos(){const F=S.auct,PF=S.aupl;const vig=AU.contratos.filter(c=>c.status!=='encerrado').sort((a,b)=>a.alunoNome.localeCompare(b.alunoNome,'pt')||a.inicio.localeCompare(b.inicio));
 const planos=AU.planos.filter(p=>p.ativo!==false);
 const form=F?auContratoForm(F,planos):`<button class="btn primary" data-act="auctopen" ${planos.length?'':'disabled'}>+ Novo contrato</button>${planos.length?'':'<div class="small muted">Cadastre um plano primeiro (abaixo).</div>'}`;
 const card=c=>{const dias=Math.round((dataLocal(c.fim).getTime()-hoje0().getTime())/DAY);const conf=S.conf==='auenc:'+c.id;
  return `<section class="panel" style="gap:8px"><div class="row" style="align-items:flex-start"><div class="grow"><h2>${esc(c.alunoNome)}</h2><div class="small muted">${esc(c.planoNome)} · ${c.aulasSemana}× por semana · ${brl(c.valor)}${auCobTxt(c)}</div></div>${c.status==='renovado'?'<span class="chip st-good">Renovado</span>':dias<0?'<span class="chip st-bad">Vencido</span>':dias<=15?`<span class="chip st-warn">Vence em ${dias} d</span>`:''}</div>
  <div class="small">${ddmmaa(c.inicio)} a ${ddmmaa(c.fim)}</div><div class="small muted">${(c.horarios||[]).map(h=>`${AU_D3[h.dia]} ${h.hora} (${h.dur} min)${h.local?' · '+esc(h.local):''}`).join('<br>')}</div>
  ${conf?`<div class="miniconf"><span class="grow">Encerrar o contrato de ${esc(c.alunoNome)}? As aulas futuras sem registro são removidas.</span><button class="btn sm danger" data-act="auencok" data-v="${c.id}">Encerrar</button><button class="btn sm ghost" data-act="conf" data-v="">Não</button></div>`
   :`<div class="row" style="gap:6px;flex-wrap:wrap">${c.status==='ativo'?`<button class="btn sm ${dias<=15?'primary':'ghost'}" data-act="aurenov" data-v="${c.id}">Renovar</button>`:''}<button class="btn sm ghost" style="color:var(--bad)" data-act="conf" data-v="auenc:${c.id}">Encerrar</button></div>`}</section>`};
 const pform=PF?`<section class="form"><h3>${PF.id?'Editar plano':'Novo plano'}</h3><div class="field"><label class="lbl" for="pl-n">Nome</label><input id="pl-n" class="txt" maxlength="40" data-aupl="nome" value="${esc(PF.nome||'')}" placeholder="Ex.: Trimestral 3×"></div>
  <div class="field"><span class="lbl">Tipo</span><div class="seg">${Object.entries(AU_PLANOS).map(([k,[l]])=>`<button data-act="aupltipo" data-v="${k}" class="${PF.tipo===k?'on':''}">${l}</button>`).join('')}</div></div>
  <div class="grid2"><div class="field"><label class="lbl" for="pl-a">Aulas por semana</label><input id="pl-a" class="txt" inputmode="numeric" data-aupl="aulasSemana" value="${esc(PF.aulasSemana||'')}"></div><div class="field"><label class="lbl" for="pl-v">Valor do período (R$)</label><input id="pl-v" class="txt" inputmode="decimal" data-aupl="valor" value="${esc(PF.valor||'')}" placeholder="Ex.: 900,00"></div></div>
  ${PF.tipo!=='mensal'?`<div class="field"><span class="lbl">Cobrança</span><div class="seg" style="grid-template-columns:1fr 1fr">${[['avista','À vista'],['parcelado','Parcelas mensais']].map(([k,l])=>`<button data-act="auplcob" data-v="${k}" class="${(PF.cobranca||'avista')===k?'on':''}">${l}</button>`).join('')}</div></div>${(PF.cobranca||'avista')==='parcelado'?(()=>{const mx=(AU_PLANOS[PF.tipo]||AU_PLANOS.mensal)[1],v=parseFloat(String(PF.valor||'').replace(/\./g,'').replace(',','.'))||0,cur=Math.max(2,Math.min(mx,+PF.parcelas||mx));
   return `<div class="field"><label class="lbl" for="pl-p">Número de parcelas</label><select id="pl-p" data-aupl="parcelas">${Array.from({length:mx-1},(_,k)=>k+2).map(n=>`<option value="${n}" ${cur===n?'selected':''}>${n}×${v?' de '+brl(v/n):''}</option>`).join('')}</select><div class="small muted">Uma parcela por mês, a partir do início do contrato.</div></div>`})():''}`:''}
  ${PF.err?`<div class="note bad">${esc(PF.err)}</div>`:''}<div class="nav2"><button class="btn ghost" data-act="auplno">Cancelar</button><button class="btn primary" data-act="auplok">Salvar plano</button></div></section>`
  :`<button class="btn sm ghost" data-act="auplopen" style="align-self:flex-start">+ Novo plano</button>`;
 const plin=planos.map(p=>`<div class="item"><div class="grow"><b>${esc(p.nome)}</b><div class="small muted">${AU_PLANOS[p.tipo]?.[0]||''} · ${p.aulasSemana}× por semana · ${brl(p.valor)}${auCobTxt(p)}</div></div><button class="ib" data-act="aupledit" data-v="${p.id}" aria-label="Editar plano">✎</button><button class="ib del" data-act="aupldel" data-v="${p.id}" aria-label="Arquivar plano">✕</button></div>`).join('');
 return `${form}${vig.map(card).join('')||(F?'':'<div class="empty">Nenhum contrato ainda.</div>')}<section class="panel" style="gap:6px"><div class="eyebrow">Planos</div>${plin||'<div class="small muted">Nenhum plano cadastrado.</div>'}${pform}</section>`}
function auContratoForm(F,planos){const pl=planos.find(p=>p.id===F.plano);const fim=pl&&dataLocal(F.inicio)?auMenos1(auAddMeses(F.inicio,pl.meses)):'';
 const lins=(F.horarios||[]).map((h,i)=>`<div class="hrow"><select data-auh="dia" data-i="${i}" aria-label="Dia">${[1,2,3,4,5,6,0].map(d=>`<option value="${d}" ${+h.dia===d?'selected':''}>${AU_D3[d]}</option>`).join('')}</select><input class="txt" type="time" data-auh="hora" data-i="${i}" value="${esc(h.hora||'')}" aria-label="Horário"><input class="txt" inputmode="numeric" data-auh="dur" data-i="${i}" value="${esc(h.dur||60)}" aria-label="Duração em minutos"><input class="txt" data-auh="local" data-i="${i}" value="${esc(h.local||'')}" placeholder="Local" aria-label="Local"><button class="ib del" data-act="auhdel" data-v="${i}" aria-label="Remover horário">✕</button></div>`).join('');
 return `<section class="form"><h3>${F.renovaDe?'Renovar contrato':'Novo contrato'}</h3>
 <div class="field"><label class="lbl" for="ct-al">Aluno</label><select id="ct-al" data-auct="aluno" ${F.renovaDe?'disabled':''}><option value="">Escolha</option>${alunos().map(p=>`<option value="${p.id}" ${F.aluno===p.id?'selected':''}>${esc(p.nome)}</option>`).join('')}</select></div>
 <div class="field"><label class="lbl" for="ct-pl">Plano</label><select id="ct-pl" data-auct="plano"><option value="">Escolha</option>${planos.map(p=>`<option value="${p.id}" ${F.plano===p.id?'selected':''}>${esc(p.nome)} · ${brl(p.valor)}</option>`).join('')}</select></div>
 <div class="grid2"><div class="field"><label class="lbl" for="ct-in">Início</label><input id="ct-in" class="txt" type="date" data-auct="inicio" value="${esc(F.inicio||'')}"></div><div class="field"><label class="lbl" for="ct-v">Valor (R$)${F.renovaDe?' · reajuste aqui':''}</label><input id="ct-v" class="txt" inputmode="decimal" data-auct="valor" value="${esc(F.valor??(pl?String(pl.valor).replace('.',','):''))}"></div></div>
 ${fim?`<div class="small muted">Vigência até ${ddmmaa(fim)}${pl.meses>1?` · cobrança${auParc(pl)>1?` em ${auParc(pl)} parcelas mensais`:' à vista'}`:''}.</div>`:''}
 <div class="field"><span class="lbl">Horários fixos${pl?` (plano: ${pl.aulasSemana} por semana)`:''}</span>${lins}<button class="btn sm ghost" data-act="auhadd" style="align-self:flex-start">+ Horário</button></div>
 ${pl&&(F.horarios||[]).filter(h=>h.hora).length!==pl.aulasSemana?`<div class="note warn">O plano prevê ${pl.aulasSemana} aula${pl.aulasSemana>1?'s':''} por semana, e há ${(F.horarios||[]).filter(h=>h.hora).length} horário(s). Confira antes de salvar.</div>`:''}
 <div class="small muted">Aula em dupla: cadastre o mesmo dia, horário e local nos contratos dos dois alunos (máximo de 2 por horário).</div>
 ${F.err?`<div class="note bad">${esc(F.err)}</div>`:''}<div class="nav2"><button class="btn ghost" data-act="auctno">Cancelar</button><button class="btn primary" data-act="auctok" ${F.busy?'disabled':''}>${F.renovaDe?'Renovar':'Salvar contrato'}</button></div></section>`}
function auFinanceiro(){const off=S.aufm||0,ref=new Date(new Date().getFullYear(),new Date().getMonth()+off,1),mk=auMes(ref.getTime());
 const doMes=AU.pagamentos.filter(p=>p.vence.slice(0,7)===mk),prev=doMes.reduce((a,p)=>a+p.valor,0),rec=doMes.filter(p=>p.status==='pago').reduce((a,p)=>a+p.valor,0);
 const atr=AU.pagamentos.filter(p=>auPagSt(p)==='atrasado'),inf=AU.pagamentos.filter(p=>p.status==='informado');
 const nav=`<div class="row" style="gap:8px"><button class="ib" data-act="aufm" data-v="-1" aria-label="Mês anterior">‹</button><div class="grow" style="text-align:center"><b class="num" style="font-size:20px">${ref.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</b></div><button class="ib" data-act="aufm" data-v="1" aria-label="Próximo mês">›</button></div>`;
 const kp=`<div class="kpis money"><div class="kpi"><b>${brl(prev)}</b><span>previsto no mês</span></div><div class="kpi"><b>${brl(rec)}</b><span>recebido</span></div><div class="kpi"><b>${brl(prev-rec)}</b><span>em aberto</span></div></div>`;
 const pl=p=>{const st=auPagSt(p),R=S.aupg&&S.aupg.id===p.id?S.aupg:null;
  return `<div class="item" style="flex-wrap:wrap"><div class="grow"><b>${esc(p.alunoNome)}</b> · ${brl(p.valor)}<div class="small muted">${esc(p.ref)} · vence ${ddmmaa(p.vence)}${p.status==='pago'?` · pago em ${ddmmaa(p.pagoEm)} (${esc(p.forma||'')})`:''}</div></div><span class="chip st-${AU_PST[st][1]||'muted'}">${AU_PST[st][0]}</span>
   <div style="width:100%">${R?`<div class="form" style="gap:8px"><div class="grid2"><div class="field"><label class="lbl" for="pg-f">Forma</label><select id="pg-f" data-aupg="forma">${AU_FORMAS.map(f=>`<option ${R.forma===f?'selected':''}>${f}</option>`).join('')}</select></div><div class="field"><label class="lbl" for="pg-d">Data do pagamento</label><input id="pg-d" class="txt" type="date" data-aupg="data" value="${esc(R.data)}"></div></div><div class="nav2"><button class="btn sm ghost" data-act="aupgno">Cancelar</button><button class="btn sm primary" data-act="aupgok" data-v="${p.id}">Confirmar pagamento</button></div></div>`
    :`<div class="row" style="gap:6px;flex-wrap:wrap">${p.status!=='pago'?`<button class="btn sm ${st==='informado'?'primary':'ghost'}" data-act="aupgopen" data-v="${p.id}">${st==='informado'?'Confirmar recebimento':'Registrar pagamento'}</button>`:`<button class="btn sm ghost" data-act="aurecibo" data-v="${p.id}">Recibo em PDF</button><button class="btn sm ghost" data-act="aupgdesf" data-v="${p.id}">Desfazer</button>`}</div>`}</div></div>`};
 const sec=(t,l)=>l.length?`<section class="panel" style="gap:0"><div class="eyebrow" style="padding-bottom:6px">${t}</div>${l.map(pl).join('')}</section>`:'';
 const X=S.aupix||AU.pix||{};const pixF=S.aupix?`<div class="form" style="gap:10px"><div class="field"><span class="lbl">Tipo de chave</span><div class="seg" style="grid-template-columns:repeat(4,1fr)">${[['cpf','CPF/CNPJ'],['email','E-mail'],['telefone','Celular'],['aleatoria','Aleatória']].map(([k,l])=>`<button data-act="aupixtipo" data-v="${k}" class="${X.tipo===k?'on':''}">${l}</button>`).join('')}</div></div>
  <div class="field"><label class="lbl" for="px-k">Chave Pix</label><input id="px-k" class="txt" data-aupix="chave" value="${esc(X.chave||'')}"></div><div class="grid2"><div class="field"><label class="lbl" for="px-n">Nome do recebedor</label><input id="px-n" class="txt" maxlength="25" data-aupix="nome" value="${esc(X.nome||'')}"></div><div class="field"><label class="lbl" for="px-c">Cidade</label><input id="px-c" class="txt" maxlength="15" data-aupix="cidade" value="${esc(X.cidade||'')}"></div></div>
  <div class="small muted">A chave aparece só para os seus alunos, na hora de pagar. O código Pix é gerado no celular deles, com o valor da mensalidade.</div><div class="nav2"><button class="btn ghost" data-act="aupixno">Cancelar</button><button class="btn primary" data-act="aupixok">Salvar chave</button></div></div>`
  :`<div class="row"><div class="grow small">${AU.pix?.chave?`Chave ${esc(AU.pix.tipo==='cpf'?'CPF/CNPJ':AU.pix.tipo||'')}: <b>${esc(AU.pix.chave)}</b> · ${esc(AU.pix.nome||'')}`:'Cadastre a sua chave para os alunos pagarem com Pix copia e cola.'}</div><button class="btn sm ghost" data-act="aupixopen">${AU.pix?.chave?'Alterar':'Cadastrar'}</button></div>`;
 return `<section class="panel">${nav}</section>${kp}${sec('Informados pelo aluno · confirme o recebimento',inf)}${sec('Atrasados',atr)}${sec('Do mês',doMes.filter(p=>!inf.includes(p)&&!atr.includes(p)).sort((a,b)=>a.vence.localeCompare(b.vence)))}
 ${!doMes.length&&!atr.length&&!inf.length?'<div class="empty">Nenhum pagamento neste mês.</div>':''}<section class="panel" style="gap:8px"><div class="eyebrow">Pix copia e cola</div>${pixF}</section>
 <div class="small muted" style="text-align:center">As mensalidades são geradas pelos contratos. O app registra os pagamentos; não processa nem intermedeia valores.</div>`}

/* ---------- Aluno ---------- */
function viewAulasA(){const sub=S.ausub||'proximas',ab=AU.creditos.filter(c=>auCredSt(c)==='aberto'),pend=AU.pagamentos.filter(p=>['pendente','atrasado'].includes(auPagSt(p))&&dataLocal(p.vence).getTime()<=hoje0().getTime()+7*DAY);
 const st=auSub([['proximas','Aulas'],['repos','Reposições',ab.length],['pagamentos','Pagamentos',pend.length],['contrato','Contrato']],sub,'ausub');
 const body=sub==='repos'?auReposA(ab):sub==='pagamentos'?auPagamentosA():sub==='contrato'?auContratoA():auProximasA();
 return pageHero('Minhas aulas','Agenda com o seu Personal',st+body)}
function auProximasA(){const now=Date.now(),h0=hoje0().getTime();const prox=AU.aulas.filter(a=>auFim(a)+AU_CK_DEPOIS>=now&&a.inicioMs<=h0+15*DAY&&auSt(a)!=='cancelada').sort((a,b)=>a.inicioMs-b.inicioMs);
 const pass=AU.aulas.filter(a=>a.inicioMs<now&&a.inicioMs>=now-60*DAY).sort((a,b)=>b.inicioMs-a.inicioMs);const feitas=pass.filter(a=>auSt(a)==='realizada').length,cont=pass.filter(a=>['realizada','falta','falta_just','semcheck'].includes(auSt(a))).length;
 const canc=AU.aulas.filter(a=>a.situacao==='cancelada'&&a.inicioMs>=h0);
 return `<section class="panel" style="gap:6px"><div class="eyebrow">Próximas aulas</div>${prox.map(a=>auAulaLinha(a)).join('')||'<div class="small muted">Nenhuma aula nos próximos dias.</div>'}<div class="small muted">Toque na aula para fazer check-in (abre 1 h antes) ou avisar que não vai. A aula só conta como realizada com o seu check e o do Personal.</div></section>
 ${canc.length?`<div class="note warn">${canc.length} aula${canc.length>1?'s':''} cancelada${canc.length>1?'s':''} pelo Personal: ${canc.map(a=>auDataTxt(a)).join(', ')}. Cada uma gerou uma reposição.</div>`:''}
 ${cont?`<section class="panel" style="gap:6px"><div class="row"><div class="eyebrow grow">Últimos 60 dias</div><b class="num">${Math.round(feitas/cont*100)}%</b><span class="small muted">de presença</span></div><details><summary class="small">Ver histórico (${pass.length})</summary><div class="list">${pass.map(a=>auAulaLinha(a)).join('')}</div></details></section>`:''}`}
function auReposA(ab){const ag=AU.aulas.filter(a=>a.tipo==='reposicao'&&auFim(a)>=Date.now()).sort((a,b)=>a.inicioMs-b.inicioMs);const R=S.aurpa;
 return `<section class="panel" style="gap:6px"><div class="eyebrow">Créditos de reposição · ${ab.length}</div>${ab.map(c=>`<div class="item" style="flex-wrap:wrap"><div class="grow"><b>Vale até ${ddmmaa(isoData(new Date(c.vence)))}</b><div class="small muted">${esc(c.motivo)} · aula de ${ddmm(dataLocal(c.origemData).getTime())}</div>${c.pedido?`<div class="fb">Pedido enviado: “${esc(c.pedido.texto||'sem preferência')}”</div>`:''}</div>
  ${R&&R.id===c.id?`<div class="form" style="gap:8px;width:100%"><label class="lbl" for="rpa-t">Dias e horários de preferência</label><input id="rpa-t" class="txt" maxlength="200" data-aurpa="texto" value="${esc(R.texto||'')}" placeholder="Ex.: terça ou quinta à tarde"><div class="nav2"><button class="btn sm ghost" data-act="aurpano">Cancelar</button><button class="btn sm primary" data-act="aurpaok" data-v="${c.id}">Enviar pedido</button></div></div>`:c.pedido?'':`<button class="btn sm ghost" data-act="aurpaopen" data-v="${c.id}">Pedir reposição</button>`}</div>`).join('')||'<div class="small muted">Nenhum crédito. Avisando a falta com 12 h ou mais de antecedência e com a justificativa aceita, você ganha uma reposição válida por 30 dias.</div>'}</section>
 ${ag.length?`<section class="panel" style="gap:6px"><div class="eyebrow">Reposições agendadas</div>${ag.map(a=>auAulaLinha(a)).join('')}</section>`:''}`}
function auPagamentosA(){const L=[...AU.pagamentos].sort((a,b)=>a.vence.localeCompare(b.vence));const abertos=L.filter(p=>p.status!=='pago'),pagos=L.filter(p=>p.status==='pago').reverse();
 const lin=p=>{const st=auPagSt(p),X=S.aupixA===p.id;return `<div class="item" style="flex-wrap:wrap"><div class="grow"><b>${brl(p.valor)}</b> · vence ${ddmmaa(p.vence)}<div class="small muted">${esc(p.ref)}${p.status==='pago'?` · pago em ${ddmmaa(p.pagoEm)}`:''}</div></div><span class="chip st-${AU_PST[st][1]||'muted'}">${st==='informado'?'Aguardando confirmação':AU_PST[st][0]}</span>
  <div style="width:100%">${p.status==='pago'?`<button class="btn sm ghost" data-act="aurecibo" data-v="${p.id}">Recibo em PDF</button>`:p.status==='informado'?'<div class="small muted">Você informou o pagamento. O Personal confirma o recebimento.</div>'
   :X?`<div class="pixbox"><div id="pixqr" class="qr" aria-label="QR Code Pix"></div><textarea id="pixcod" class="txt" readonly rows="3">${esc(auPix(AU.pix,p.valor,p.id))}</textarea><div class="nav2"><button class="btn sm primary" data-act="aupixcopy">Copiar código Pix</button><button class="btn sm ghost" data-act="aupaguei" data-v="${p.id}">Já paguei</button></div><div class="small muted">Pague no app do seu banco (Pix → Copia e cola, ou leia o QR Code de outro aparelho). Depois toque em “Já paguei”.</div></div>`
   :`<div class="row" style="gap:6px;flex-wrap:wrap">${AU.pix?.chave?`<button class="btn sm primary" data-act="aupixa" data-v="${p.id}">Pagar com Pix</button>`:''}<button class="btn sm ghost" data-act="aupaguei" data-v="${p.id}">Já paguei</button></div>`}</div></div>`};
 return `${abertos.length?`<section class="panel" style="gap:0"><div class="eyebrow" style="padding-bottom:6px">Em aberto</div>${abertos.map(lin).join('')}</section>`:'<div class="note good">Nenhum pagamento em aberto.</div>'}
 ${pagos.length?`<section class="panel" style="gap:0"><div class="eyebrow" style="padding-bottom:6px">Pagos</div>${pagos.map(lin).join('')}</section>`:''}`}
function auContratoA(){const vs=AU.contratos.filter(c=>c.status!=='encerrado').sort((a,b)=>b.inicio.localeCompare(a.inicio));if(!vs.length)return '<div class="empty">Nenhum contrato ativo.</div>';
 return vs.map(c=>`<section class="panel" style="gap:8px"><div class="eyebrow">${c.status==='renovado'?'Contrato atual (já renovado)':'Contrato'}</div><h2>${esc(c.planoNome)}</h2><div class="small">${ddmmaa(c.inicio)} a ${ddmmaa(c.fim)} · ${c.aulasSemana}× por semana · ${brl(c.valor)}${auCobTxt(c)}</div>
  <div class="list">${(c.horarios||[]).map(h=>`<div class="item"><b style="width:80px">${AU_DIAS[h.dia]}</b><span class="grow">${h.hora} · ${h.dur} min</span><span class="small muted">${esc(h.local||'')}</span></div>`).join('')}</div>
  <div class="small muted">Regras: a aula conta como realizada com o check do aluno e o do Personal. Falta avisada com 12 h ou mais e justificativa aceita gera reposição válida por 30 dias.</div></section>`).join('')}
/* Card no Início do aluno: próxima aula e pendências */
function auCardInicio(){if(PM()||!AU.aulas.length&&!AU.pagamentos.length)return '';const now=Date.now();const a=AU.aulas.filter(x=>auFim(x)+AU_CK_DEPOIS>=now&&!['cancelada','falta','falta_just','realizada'].includes(auSt(x))&&!x.aviso).sort((x,y)=>x.inicioMs-y.inicioMs)[0];
 const pg=AU.pagamentos.filter(p=>auPagSt(p)==='atrasado').length;if(!a&&!pg)return '';
 return `<section class="panel" style="gap:8px"><div class="row"><div class="eyebrow grow">Próxima aula com o Personal</div><button class="lnk small" data-act="tab" data-v="aulas">Ver aulas</button></div>${a?auAulaLinha(a):''}${pg?`<div class="note bad">${pg} pagamento${pg>1?'s':''} em atraso. <button class="lnk" data-act="auir" data-v="pagamentos">Ver</button></div>`:''}</section>`}
{const _av=avisosAluno;avisosAluno=function(){return auCardInicio()+_av()}}
function viewAulas(){return PM()?viewAulasP():viewAulasA()}

/* ---------- Eventos ---------- */
const auRun=(p,ok,msg)=>p.then(()=>{ok&&ok();if(msg)toast(msg);render()}).catch(e=>{console.warn(e);toast(e?.code==='permission-denied'?'Ação não permitida.':(e.message||'Não foi possível concluir.'));render()});
document.addEventListener('input',e=>{const el=e.target,d=el.dataset;
 if(d.auav&&S.auAv)S.auAv[d.auav]=el.value;if(d.aurp&&S.aurp)S.aurp[d.aurp]=el.value;if(d.auct&&S.auct)S.auct[d.auct]=el.value;if(d.aupl&&S.aupl)S.aupl[d.aupl]=el.value;
 if(d.aupg&&S.aupg)S.aupg[d.aupg]=el.value;if(d.aupix&&S.aupix)S.aupix[d.aupix]=el.value;if(d.aurpa&&S.aurpa)S.aurpa[d.aurpa]=el.value;
 if(d.auh&&S.auct){S.auct.horarios[+d.i][d.auh]=el.value}});
document.addEventListener('change',e=>{const el=e.target,d=el.dataset;
 if(d.auct==='plano'&&S.auct){S.auct.plano=el.value;delete S.auct.valor;render()}
 if(d.auct==='aluno'&&S.auct){S.auct.aluno=el.value}
 if(d.aurp==='cred'&&S.aurp){S.aurp.cred=el.value;auRepoDefaults();render()}
 if(d.auh&&S.auct){S.auct.horarios[+d.i][d.auh]=el.value;if(d.auh==='dia')render()}});
function auRepoDefaults(){const cr=AU.creditos.find(c=>c.id===S.aurp.cred),ct=AU.contratos.find(c=>c.id===cr?.contratoId),h=ct?.horarios?.[0];if(h){S.aurp.dur=String(h.dur||60);S.aurp.local=h.local||''}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const v=b.dataset.v,A=id=>AU.aulas.find(a=>a.id===id);
 switch(b.dataset.act){
  case 'ausub':S.ausub=v;S.auSel=null;render();window.scrollTo(0,0);break;
  case 'auir':S.ausub=v;go('aulas');break;
  case 'ausel':S.auSel=S.auSel===v?null:v;S.auAv=null;render();break;
  case 'auwk':S.auwk=(S.auwk||0)+ +v;render();break;
  case 'aufm':S.aufm=(S.aufm||0)+ +v;render();break;
  case 'audec':{const a=A(v);if(a)auRun(auDecidir(a,b.dataset.x),null,{ck:'Presença confirmada.',realizada:'Aula marcada como realizada.',falta:'Falta registrada.',aceitar:'Justificativa aceita: crédito de reposição criado.',cancelar:'Aula cancelada: crédito de reposição criado.',desfazer:'Decisão desfeita.'}[b.dataset.x]);break}
  case 'aurepodel':{const a=A(v);if(a)auRun(auDesfazerRepo(a),()=>{S.auSel=null},'Reposição desmarcada; o crédito voltou a ficar disponível.');break}
  case 'auck':{const a=A(v);if(a)auRun(auCheckAluno(a),null,'Check-in feito. Falta só o check do Personal.');break}
  case 'auav':S.auAv={id:v,motivo:AU_MOTIVOS[0],texto:''};render();break;
  case 'auavno':S.auAv=null;render();break;
  case 'auavok':{const a=A(v);if(a)auRun(auAvisar(a,S.auAv),()=>{S.auAv=null},'Aviso enviado ao Personal.');break}
  case 'aurpopen':S.aurp={cred:v,data:'',hora:'',dur:'60',local:''};auRepoDefaults();render();window.scrollTo(0,0);break;
  case 'aurpno':S.aurp=null;render();break;
  case 'aurpok':{const F=S.aurp;F.err='';auAgendarRepo(F).then(()=>{S.aurp=null;render();toast('Reposição agendada.')}).catch(err=>{F.err=err.code==='permission-denied'?'Ação não permitida.':err.message;render()});break}
  case 'aurpaopen':S.aurpa={id:v,texto:''};render();break;
  case 'aurpano':S.aurpa=null;render();break;
  case 'aurpaok':{const c=AU.creditos.find(x=>x.id===v);if(c)auRun(auPedirRepo(c,S.aurpa?.texto),()=>{S.aurpa=null},'Pedido enviado ao Personal.');break}
  case 'auctopen':S.auct={aluno:'',plano:'',inicio:isoData(new Date()),horarios:[{dia:1,hora:'',dur:60,local:''}]};render();break;
  case 'auctno':S.auct=null;render();break;
  case 'auhadd':{const h=S.auct.horarios,u=h[h.length-1];h.push({dia:u?(+u.dia%6)+1:1,hora:u?.hora||'',dur:u?.dur||60,local:u?.local||''});render();break}
  case 'auhdel':S.auct.horarios.splice(+v,1);render();break;
  case 'auctok':{const F=S.auct;F.err='';F.busy=true;render();auSalvarContrato(F).then(()=>{S.auct=null;render();toast(F.renovaDe?'Contrato renovado. Mensalidades geradas.':'Contrato salvo. Aulas e mensalidades geradas.')}).catch(err=>{F.busy=false;F.err=err.code==='permission-denied'?'Ação não permitida.':err.message;render()});break}
  case 'aurenov':{const c=AU.contratos.find(x=>x.id===v);if(!c)break;S.auct={renovaDe:c.id,aluno:c.alunoId,plano:AU.planos.some(p=>p.id===c.planoId)?c.planoId:'',inicio:isoData(new Date(dataLocal(c.fim).getTime()+DAY)),valor:String(c.valor).replace('.',','),horarios:clone(c.horarios||[])};render();window.scrollTo(0,0);break}
  case 'auencok':{const c=AU.contratos.find(x=>x.id===v);if(c)auRun(auEncerrar(c),()=>{S.conf=null},'Contrato encerrado.');break}
  case 'auplopen':S.aupl={tipo:'mensal',cobranca:'avista'};render();break;
  case 'aupledit':{const p=AU.planos.find(x=>x.id===v);if(p)S.aupl={id:p.id,nome:p.nome,tipo:p.tipo,aulasSemana:String(p.aulasSemana),valor:String(p.valor).replace('.',','),cobranca:p.cobranca,parcelas:String(auParc(p))};render();break}
  case 'aupltipo':{S.aupl.tipo=v;const mx=(AU_PLANOS[v]||AU_PLANOS.mensal)[1];if(+S.aupl.parcelas>mx||!S.aupl.parcelas)S.aupl.parcelas=String(mx);render();break}
  case 'auplcob':{S.aupl.cobranca=v;if(!S.aupl.parcelas)S.aupl.parcelas=String((AU_PLANOS[S.aupl.tipo]||AU_PLANOS.mensal)[1]);render();break}
  case 'auplno':S.aupl=null;render();break;
  case 'auplok':{const F=S.aupl;F.err='';auSalvarPlano(F).then(()=>{S.aupl=null;render();toast('Plano salvo.')}).catch(err=>{F.err=err.code==='permission-denied'?'Ação não permitida.':err.message;render()});break}
  case 'aupldel':auRun(auRef('planos',v).update({ativo:false}),null,'Plano arquivado. Os contratos existentes continuam valendo.');break;
  case 'aupgopen':S.aupg={id:v,forma:'Pix',data:isoData(new Date())};render();break;
  case 'aupgno':S.aupg=null;render();break;
  case 'aupgok':{const p=AU.pagamentos.find(x=>x.id===v);if(p)auRun(auRegistrarPag(p,S.aupg),()=>{S.aupg=null},'Pagamento registrado.');break}
  case 'aupgdesf':auRun(auRef('pagamentos',v).update({status:'pendente',pagoEm:firebase.firestore.FieldValue.delete(),forma:firebase.firestore.FieldValue.delete()}),null,'Pagamento voltou para pendente.');break;
  case 'aurecibo':{const p=AU.pagamentos.find(x=>x.id===v);if(p){toast('Gerando recibo…');auRecibo(p).catch(err=>{console.warn(err);toast('Não foi possível gerar o recibo.')})}break}
  case 'aupixopen':S.aupix={tipo:'cpf',...(AU.pix||{})};render();break;
  case 'aupixtipo':S.aupix.tipo=v;render();break;
  case 'aupixno':S.aupix=null;render();break;
  case 'aupixok':{const X=S.aupix;if(!(X.chave||'').trim()){toast('Informe a chave Pix.');break}if(!(X.nome||'').trim()||!(X.cidade||'').trim()){toast('Informe nome e cidade do recebedor.');break}
   auRun(auRef('pagcfg',S.me).set({tipo:X.tipo,chave:X.chave.trim().slice(0,77),nome:X.nome.trim().slice(0,25),cidade:X.cidade.trim().slice(0,15),at:Date.now()}),()=>{S.aupix=null},'Chave Pix salva.');break}
  case 'aupixa':S.aupixA=S.aupixA===v?null:v;render();if(S.aupixA){const p=AU.pagamentos.find(x=>x.id===v);auQr(auPix(AU.pix,p.valor,p.id)).then(svg=>{const el=$('#pixqr');if(el)el.innerHTML=svg}).catch(()=>{const el=$('#pixqr');if(el)el.textContent='QR Code indisponível sem internet; use o código abaixo.'})}break;
  case 'aupixcopy':{const t=$('#pixcod');if(!t)break;(navigator.clipboard?.writeText(t.value)||Promise.reject()).then(()=>toast('Código Pix copiado. Cole no app do seu banco.')).catch(()=>{t.select();document.execCommand('copy');toast('Código Pix copiado.')});break}
  case 'aupaguei':{const p=AU.pagamentos.find(x=>x.id===v);if(p)auRun(auInformarPag(p),()=>{S.aupixA=null},'Pagamento informado. O Personal vai confirmar.');break}
 }});
