/* Criar ficha a partir de texto gerado por IA (ChatGPT, Claude, Gemini…).
   1) monta o pedido para a IA a partir de um formulário; 2) lê o texto colado;
   3) mostra uma prévia editável; 4) cria a ficha. Nada é enviado a serviços externos pelo app. */
const IA_OBJ=['Hipertrofia','Emagrecimento','Força','Condicionamento','Saúde e mobilidade','Reabilitação'];
const IA_NIV=['Iniciante','Intermediário','Avançado'];
const IA_LOCAL=['Academia completa','Academia de condomínio','Em casa com halteres e elásticos','Só peso corporal'];
const IA_LINKS=[['ChatGPT','https://chatgpt.com/'],['Claude','https://claude.ai/new'],['Gemini','https://gemini.google.com/app']];

function iaPrompt(f){
 const L=[`Monte uma ficha de treino de musculação com as características abaixo.`,
  `- Objetivo: ${f.objetivo}`,`- Nível: ${f.nivel}`,
  `- Frequência: ${f.dias} treinos por semana, com cerca de ${f.duracao} minutos cada`,
  `- Local e equipamentos: ${f.local}`];
 if(f.idade)L.push(`- Idade: ${f.idade} anos`);
 L.push(`- Lesões, dores ou restrições: ${f.restricoes.trim()||'nenhuma'}`);
 if(f.evitar.trim())L.push(`- Exercícios que prefiro evitar: ${f.evitar.trim()}`);
 if(f.obs.trim())L.push(`- Observações: ${f.obs.trim()}`);
 L.push('','Regras:',
  '- Respeite as restrições: prefira exercícios seguros para elas e indique amplitude ou cuidados na observação do exercício.',
  '- Use nomes de exercícios comuns em academias do Brasil.',
  '- Inclua aquecimento quando fizer sentido.',
  '- Para exercícios por tempo (prancha, isometria, bicicleta), informe a duração em segundos ou minutos no lugar das repetições.',
  '','Responda SOMENTE no formato abaixo, sem tabelas e sem texto antes ou depois:',
  'FICHA: nome da ficha',
  'TREINO A: nome do treino | dia da semana sugerido',
  '- Nome do exercício | 3x10-12 | descanso 60s | observação curta',
  '- Prancha | 3x30s | descanso 45s |',
  'TREINO B: nome do treino | dia da semana sugerido',
  '- ...','(repita para cada treino)');
 return L.join('\n')}

/* ---------- Leitor de texto ---------- */
const IA_COMPOSTO=/agach|leg ?press|supino|remada|puxada|pulldown|desenvolv|terra|stiff|hip ?thrust|eleva[cç][aã]o p[eé]lvica|afundo|avan[cç]o|passada|b[uú]lgaro|barra fixa|mergulho|pull[- ]?through|levantamento|hack|good ?morning|clean|arranco|flex[aã]o de bra[cç]o/;
const IA_TEMPO=/prancha|isometr|bicicleta|esteira|el[ií]ptico|wall ?sit|cadeira isom|spanish|alongamento|mobilidade|caminhada|corrida|remo ergom|escada|polichinelo|pular corda/;
const IA_JOELHO=/agach|leg ?press|extensora|afundo|avan[cç]o|passada|b[uú]lgaro|step|hack|spanish|wall ?sit|sissy/;
const DIA_RE=/\b(segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado|domingo)/i;
const DIAS_CAP={segunda:'Segunda',terca:'Terça',quarta:'Quarta',quinta:'Quinta',sexta:'Sexta',sabado:'Sábado',domingo:'Domingo'};
function iaDia(t){const m=String(t||'').match(DIA_RE);if(!m)return '';return DIAS_CAP[nk(m[1])]||''}
function iaSegundos(txt){const s=nk(txt);const m=s.match(/(\d+(?:[.,]\d+)?)\s*(?:-|a|–)?\s*(\d+)?\s*(min|minutos?|'|s\b|seg|segundos?|")?/);if(!m)return null;
 const v=parseFloat(m[1].replace(',','.'));const u=m[3]||'';return Math.round(/min|'/.test(u)?v*60:v)}
function iaLimpa(t){return String(t||'').replace(/\*\*|__|`/g,'').replace(/^\s*(?:[-*•·▪◦–—]|\d{1,2}[.)º°]|[a-z]\))\s+/i,'').trim()}
function iaSeries(t){const s=String(t);
 let m=s.match(/(\d{1,2})\s*(?:x|×|X)\s*(\d+(?:\s*(?:-|–|a|ou|\/)\s*\d+)?\s*(?:s\b|seg[a-zà-ú]*|min[a-zà-ú]*|''|'|"|rep[a-zà-ú]*)?(?:\s*(?:por|cada)\s*(?:perna|lado|bra[cç]o))?)/i);
 if(m)return {i:m.index,len:m[0].length,s:+m[1],r:m[2].trim()};
 m=s.match(/(\d{1,2})\s*s[ée]ries?\s*(?:de|com|x|×|:)?\s*(\d+(?:\s*(?:-|–|a|ou|\/)\s*\d+)?\s*(?:s\b|seg[a-zà-ú]*|min[a-zà-ú]*|rep[a-zà-ú]*)?(?:\s*(?:por|cada)\s*(?:perna|lado|bra[cç]o))?)?/i);
 if(m)return {i:m.index,len:m[0].length,s:+m[1],r:(m[2]||'').trim()};
 return null}
function iaDescanso(t){const s=nk(t);let m=s.match(/(?:descanso|intervalo|pausa)\s*(?:de|:)?\s*(\d+(?:[.,]\d+)?)\s*(?:-|a|–)?\s*\d*\s*(min[a-zà-ú]*|'|s\b|seg[a-zà-ú]*|")?/);
 if(!m)m=s.match(/(\d+(?:[.,]\d+)?)\s*(min[a-zà-ú]*|s\b|seg[a-zà-ú]*)\s*(?:de\s*)?(?:descanso|intervalo|pausa)/);
 if(!m)return null;const v=parseFloat(m[1].replace(',','.'));return Math.round(/min|'/.test(m[2]||'')?v*60:(m[2]?v:(v<=5?v*60:v)))}
function iaTipo(nome,reps){const n=nk(nome),r=nk(reps);if(IA_TEMPO.test(n)||/\d\s*(s\b|seg|min|'|")/.test(r))return 't';return IA_COMPOSTO.test(n)?'c':'i'}
function iaEx(nome,s,r,desc,nota){nome=nome.replace(/\s*[:\-–—|(]+\s*$/,'').replace(/^\s*[:\-–—|]+\s*/,'').trim();if(!nome)return null;
 const tipo=iaTipo(nome,r||'');const e={id:uid('e'),n:nome.charAt(0).toUpperCase()+nome.slice(1),s:Math.min(10,Math.max(1,s||3)),r:(r||(tipo==='t'?'30 s':'10-12')).replace(/\s+/g,' '),tipo,desc:desc??(tipo==='t'?30:60)};
 if(tipo==='t')e.hold=Math.max(5,iaSegundos(e.r)||30);
 if(IA_JOELHO.test(nk(nome)))e.knee=1;if(/reab|isometr|spanish/.test(nk(nome)))e.reab=1;
 if(nota&&nota.trim())e.nota=nota.trim().replace(/^[(\-–—:|,;]+|[)\s]+$/g,'').trim().slice(0,140);
 if(!e.nota)delete e.nota;e.semSeries=!s;return e}
function iaParse(texto){
 const linhas=String(texto||'').replace(/\r/g,'').split('\n');const out={nome:'',treinos:[],avisos:[]};let cur=null,pend=null,colunas=null;
 const novoTreino=(nome,dia)=>{cur={id:uid('t'),nome:nome||'',dia:dia||'',ex:[]};out.treinos.push(cur);pend=null;colunas=null};
 const garante=()=>{if(!cur)novoTreino('','')};
 for(let raw of linhas){let l=raw.trim();if(!l)continue;
  const lc=iaLimpa(l.replace(/^#+\s*/,''));
  // Nome da ficha
  let m=lc.match(/^ficha\s*(?:de treino)?\s*[:\-–—]\s*(.+)$/i);if(m){out.nome=m[1].replace(/[*_#]/g,'').trim();continue}
  // Cabeçalho de treino
  m=lc.match(/^(?:treino|dia|sess[aã]o|workout|day)\s*([A-Ga-g]|\d{1,2})\b\s*[:\-–—|.)]?\s*(.*)$/i);
  if(m&&!iaSeries(m[2])){const resto=m[2].replace(/[*_#]/g,'').split('|').map(x=>x.trim());novoTreino(resto[0]||'',iaDia(resto.slice(1).join(' ')||resto[0]));continue}
  // Tabela markdown
  if(/^\|.*\|$/.test(l)){const cel=l.slice(1,-1).split('|').map(c=>iaLimpa(c));
   if(cel.every(c=>/^:?-{2,}:?$/.test(c)||!c))continue;
   if(cel.some(c=>/exerc/i.test(c))){colunas=cel.map(c=>nk(c));continue}
   garante();const idx=k=>colunas?colunas.findIndex(c=>k.test(c)):-1;
   const iN=Math.max(0,idx(/exerc/)),iS=idx(/serie|sets/),iR=idx(/rep|tempo|dura/),iD=idx(/desc|interv|pausa/),iO=idx(/obs|nota|dica|cuidado/);
   const nome=cel[iN]||'';const ss=iaSeries(cel.join(' | '));
   const s=iS>=0?parseInt(cel[iS],10):ss?.s;const r=iR>=0?cel[iR]:ss?.r;const d=iD>=0?iaSegundos(cel[iD]):iaDescanso(l);
   const e=iaEx(nome.replace(/^\d+[.)]\s*/,''),s,r,d,iO>=0?cel[iO]:'');if(e)cur.ex.push(e);continue}
  colunas=null;
  // Formato com barras: Exercício | 3x10 | descanso 60s | obs
  if(lc.includes('|')){const p=lc.split('|').map(x=>x.trim());const ss=iaSeries(p.slice(1).join(' | '));
   if(ss||p.length>=3){garante();const e=iaEx(p[0],ss?.s,ss?.r,iaDescanso(p.slice(1).join(' ')),p.slice(1).filter(x=>!iaSeries(x)&&!/descanso|intervalo|pausa/i.test(x)).join('; '));if(e){cur.ex.push(e);pend=e.semSeries?e:null}continue}}
  const ss=iaSeries(lc);
  if(ss){const antes=lc.slice(0,ss.i),depois=lc.slice(ss.i+ss.len);
   if(!/[a-zà-ú]{3}/i.test(antes.replace(/s[ée]ries?/i,''))&&pend){pend.s=ss.s;if(ss.r){pend.r=ss.r;pend.tipo=iaTipo(pend.n,ss.r);if(pend.tipo==='t')pend.hold=iaSegundos(ss.r)||30}const d=iaDescanso(lc);if(d!=null)pend.desc=d;pend.semSeries=false;pend=null;continue}
   garante();const d=iaDescanso(lc);const nota=depois.replace(/(?:com\s*)?(?:descanso|intervalo|pausa)\s*(?:de|:)?\s*[\d.,]+\s*(?:-|a|–)?\s*\d*\s*(?:min[a-zà-ú]*|'|s\b|seg[a-zà-ú]*|")?/i,'').replace(/^[\s,;:\-–—.]+/,'');
   const e=iaEx(antes,ss.s,ss.r,d,nota);if(e){cur.ex.push(e);pend=null}continue}
  // Linha só com descanso, para o exercício anterior
  const d=iaDescanso(lc);if(d!=null&&cur?.ex.length&&lc.length<40){cur.ex[cur.ex.length-1].desc=d;continue}
  // Linha com nome de exercício sem séries (as séries podem vir na linha seguinte)
  const nome=lc.replace(/[*_]/g,'');
  if(cur&&nome.length<=70&&/[a-zà-ú]{3}/i.test(nome)&&!/[.!?]$/.test(nome)&&!/:$/.test(nome)&&nome.split(' ').length<=9&&(/^\s*(?:[-*•·]|\d{1,2}[.)])\s+/.test(l)||IA_COMPOSTO.test(nk(nome))||IA_TEMPO.test(nk(nome))||media(nome))){const e=iaEx(nome,null,null,null,'');if(e){cur.ex.push(e);pend=e}}
 }
 out.treinos=out.treinos.filter(t=>t.ex.length);
 out.treinos.forEach((t,i)=>{if(!t.nome)t.nome='Treino '+LETRAS[i];t.ex.forEach(e=>{if(e.semSeries)out.avisos.push(`“${e.n}” veio sem séries e repetições. Confira os valores sugeridos.`);delete e.semSeries})});
 if(out.treinos.length>7){out.avisos.push('O texto tinha mais de 7 treinos. Foram mantidos os 7 primeiros.');out.treinos=out.treinos.slice(0,7)}
 return out}

/* ---------- Tela ---------- */
function iaNovo(owner,back){const aluno=owner!=='modelos'?perfil(owner):null;
 S.ia={owner,back,etapa:'pedido',f:{objetivo:'Hipertrofia',nivel:'Intermediário',dias:3,duracao:60,local:'Academia completa',idade:'',restricoes:'',evitar:'',obs:''},texto:'',prev:null,err:'',copiado:false,alunoNome:aluno?.nome||''}}
function viewIA(){const I=S.ia;if(!I){S.view='fichas';return render0()}
 const st=`<div class="subtabs"><button data-act="iaetapa" data-v="pedido" class="${I.etapa==='pedido'?'on':''}">1. Pedido para a IA</button><button data-act="iaetapa" data-v="colar" class="${I.etapa!=='pedido'?'on':''}">2. Colar resposta</button></div>`;
 let body='';const F=I.f;
 if(I.etapa==='pedido'){const sel=(k,l,ops)=>`<div class="field"><label class="lbl" for="ia-${k}">${l}</label><select id="ia-${k}" data-iaf="${k}">${ops.map(o=>`<option ${String(F[k])===String(o)?'selected':''}>${o}</option>`).join('')}</select></div>`;
  body=`<section class="panel"><div class="small muted">Preencha e toque em “Copiar pedido”. Cole o pedido no ChatGPT, Claude ou Gemini, copie a resposta e volte para a etapa 2.</div>
   <div class="grid2">${sel('objetivo','Objetivo',IA_OBJ)}${sel('nivel','Nível',IA_NIV)}</div>
   <div class="grid2">${sel('dias','Treinos por semana',[2,3,4,5,6])}${sel('duracao','Minutos por treino',[30,45,60,75,90])}</div>
   ${sel('local','Local e equipamentos',IA_LOCAL)}
   <div class="field"><label class="lbl" for="ia-rest">Lesões, dores ou restrições</label><textarea id="ia-rest" class="txt" data-iaf="restricoes" placeholder="Ex.: condropatia patelar grau 4 nos dois joelhos">${esc(F.restricoes)}</textarea></div>
   <div class="field"><label class="lbl" for="ia-evit">Exercícios que prefere evitar (opcional)</label><input id="ia-evit" class="txt" data-iaf="evitar" value="${esc(F.evitar)}"></div>
   <div class="grid2"><div class="field"><label class="lbl" for="ia-idade">Idade (opcional)</label><input id="ia-idade" class="txt" inputmode="numeric" data-iaf="idade" value="${esc(F.idade)}"></div><div class="field"><label class="lbl" for="ia-obs">Outras observações</label><input id="ia-obs" class="txt" data-iaf="obs" value="${esc(F.obs)}" placeholder="Ex.: priorizar glúteos"></div></div>
   <button class="btn primary big" data-act="iacopy">${I.copiado?'Pedido copiado ✓':'Copiar pedido'}</button>
   <div class="row" style="gap:8px;flex-wrap:wrap;justify-content:center">${IA_LINKS.map(([n,u])=>`<a class="btn sm ghost" href="${u}" target="_blank" rel="noopener">Abrir ${n}</a>`).join('')}</div>
   <details><summary class="small muted" style="padding:6px 0;cursor:pointer">Ver o texto do pedido</summary><textarea id="ia-prompt" class="txt" style="min-height:220px;font-size:13px" readonly>${esc(iaPrompt(F))}</textarea></details>
   <button class="btn ghost" data-act="iaetapa" data-v="colar">Já tenho a resposta da IA ›</button></section>
   <div class="small muted" style="text-align:center">O app não envia seus dados a nenhuma IA. Você decide o que copiar e colar.</div>`}
 else if(!I.prev){body=`<section class="panel"><div class="field"><label class="lbl" for="ia-txt">Cole aqui o treino gerado pela IA</label><textarea id="ia-txt" class="txt" style="min-height:240px" placeholder="FICHA: …&#10;TREINO A: …&#10;- Supino reto | 4x8-10 | descanso 90s |">${esc(I.texto)}</textarea></div>
   <div class="small muted">Funciona melhor com o formato do pedido da etapa 1, mas também lê listas e tabelas comuns.</div>
   ${I.err?`<div class="note bad">${esc(I.err)}</div>`:''}<button class="btn primary big" data-act="ialer">Ler treino</button></section>`}
 else{const P=I.prev;
  body=`<section class="panel" style="gap:10px"><div class="note warn">Sugestão gerada por IA. Revise com seu Personal ou profissional de saúde antes de treinar, principalmente se houver lesões ou dores.</div>
   ${P.avisos.length?`<div class="note warn">${P.avisos.map(esc).join('<br>')}</div>`:''}
   <div class="field"><label class="lbl" for="iap-nome">Nome da ficha</label><input id="iap-nome" class="txt" data-iap="nome" value="${esc(P.nome)}" placeholder="Ex.: Full Body – sugestão da IA"></div></section>
   ${P.treinos.map((t,ti)=>`<section class="panel" style="gap:8px"><div class="row">${letter(LETRAS[ti])}<input class="txt grow" data-iapt="${ti}" data-k="nome" value="${esc(t.nome)}" aria-label="Nome do treino ${LETRAS[ti]}"><button class="ib del" data-act="iadelt" data-v="${ti}" aria-label="Excluir treino">✕</button></div>
    <select data-iapt="${ti}" data-k="dia" aria-label="Dia sugerido"><option value="">Sem dia fixo</option>${DIAS.map(d=>`<option ${t.dia===d?'selected':''}>${d}</option>`).join('')}</select>
    ${t.ex.map((e,ei)=>`<div class="iaex"><div class="row" style="gap:6px"><input class="txt grow" list="exlib" data-iae="${ti}.${ei}" data-k="n" value="${esc(e.n)}" aria-label="Exercício"><button class="ib del" data-act="iadele" data-v="${ti}.${ei}" aria-label="Excluir exercício">✕</button></div>
     <div class="grid4"><label class="mini">Séries<input class="txt" inputmode="numeric" data-iae="${ti}.${ei}" data-k="s" value="${e.s}"></label><label class="mini">${e.tipo==='t'?'Tempo':'Reps'}<input class="txt" data-iae="${ti}.${ei}" data-k="r" value="${esc(e.r)}"></label><label class="mini">Desc. (s)<input class="txt" inputmode="numeric" data-iae="${ti}.${ei}" data-k="desc" value="${e.desc}"></label><label class="mini">Tipo<select data-iae="${ti}.${ei}" data-k="tipo">${Object.entries({c:'Composto',i:'Isolador',t:'Tempo'}).map(([k,l])=>`<option value="${k}" ${e.tipo===k?'selected':''}>${l}</option>`).join('')}</select></label></div>
     ${e.nota?`<div class="small muted">${esc(e.nota)}</div>`:''}</div>`).join('')}
    <button class="btn sm dash" data-act="iaadde" data-v="${ti}">+ Exercício</button></section>`).join('')}
   ${I.err?`<div class="note bad">${esc(I.err)}</div>`:''}
   <div class="nav2"><button class="btn ghost" data-act="iarelr">Colar outro texto</button><button class="btn primary" data-act="iacriar">Criar ficha</button></div>`}
 const quem=I.owner==='modelos'?'Novo modelo':I.owner===S.me?'Nova ficha':'Ficha de '+esc(I.alunoNome);
 return page(quem,'Ficha com IA',st+body,{back:I.back})}

function iaCriar(){const I=S.ia,P=I.prev;if(!P.treinos.length)throw new Error('Nenhum treino para criar.');
 P.treinos.forEach(t=>{t.ex=t.ex.filter(e=>e.n.trim())});if(!P.treinos.some(t=>t.ex.length))throw new Error('Inclua ao menos um exercício.');
 const o=I.owner;const f={id:uid('f'),nome:(P.nome||'').trim()||'Ficha sugerida pela IA',semanas:8,arquivada:false,criada:Date.now(),modelo:o==='modelos',global:o==='modelos'&&S.g,alunoId:o==='modelos'?null:o,autor:ME().nome,autorId:S.me,origem:'ia',mig1:1,
  treinos:P.treinos.filter(t=>t.ex.length).map(t=>({id:t.id,nome:t.nome.trim()||'Treino',dia:t.dia||'',ex:t.ex.map(e=>{const x={...e,n:e.n.trim(),s:Math.min(10,Math.max(1,parseInt(e.s,10)||3)),desc:Math.max(0,parseInt(e.desc,10)||0)};if(x.tipo==='t')x.hold=Math.max(5,iaSegundos(x.r)||x.hold||30);else delete x.hold;return x})}))};
 put('fichas',f);if(o!=='modelos'&&!ativaDe(o))setAtiva(o,f.id);return f}

document.addEventListener('input',e=>{const el=e.target,I=S.ia;if(!I)return;
 if(el.dataset.iaf){I.f[el.dataset.iaf]=el.value;I.copiado=false;const pr=$('#ia-prompt');if(pr)pr.value=iaPrompt(I.f)}
 if(el.id==='ia-txt')I.texto=el.value;
 if(el.dataset.iap&&I.prev)I.prev[el.dataset.iap]=el.value;
 if(el.dataset.iapt!==undefined&&I.prev)I.prev.treinos[+el.dataset.iapt][el.dataset.k]=el.value;
 if(el.dataset.iae&&I.prev){const[a,b]=el.dataset.iae.split('.').map(Number);I.prev.treinos[a].ex[b][el.dataset.k]=el.value}
});
document.addEventListener('change',e=>{const el=e.target,I=S.ia;if(!I)return;
 if(el.dataset.iaf){I.f[el.dataset.iaf]=el.value;I.copiado=false;if(el.tagName==='SELECT')render()}
 if(el.dataset.iapt!==undefined&&I.prev)I.prev.treinos[+el.dataset.iapt][el.dataset.k]=el.value;
 if(el.dataset.iae&&I.prev){const[a,b]=el.dataset.iae.split('.').map(Number);const ex=I.prev.treinos[a].ex[b];ex[el.dataset.k]=el.value;if(el.dataset.k==='tipo'){if(el.value==='t'&&!/s|min/.test(ex.r))ex.r='30 s';render()}}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const v=b.dataset.v,I=S.ia;
 switch(b.dataset.act){
  case 'iaopen':iaNovo(v,S.view==='aluno'?'aluno':S.view==='gestao'?'gestao':S.view==='modelos'?'modelos':'fichas');S.newF=null;S.view='ia';render();window.scrollTo(0,0);break;
  case 'iaetapa':I.etapa=v;render();window.scrollTo(0,0);break;
  case 'iacopy':{const t=iaPrompt(I.f);const ok=()=>{I.copiado=true;render()};try{navigator.clipboard.writeText(t).then(ok,()=>{const d=document.querySelector('details');if(d)d.open=true;const x=$('#ia-prompt');x&&x.select();toast('Selecione o texto do pedido e copie.')})}catch(_){toast('Selecione o texto do pedido e copie.')}break}
  case 'ialer':{I.texto=$('#ia-txt')?.value||I.texto;const p=iaParse(I.texto);if(!p.treinos.length){I.err='Não encontrei exercícios no texto. Confira se colou a resposta completa da IA, ou use o pedido da etapa 1, que gera o formato ideal.';render();break}
   I.err='';I.prev=p;render();window.scrollTo(0,0);break}
  case 'iarelr':I.prev=null;render();break;
  case 'iadelt':I.prev.treinos.splice(+v,1);render();break;
  case 'iadele':{const[a,c]=v.split('.').map(Number);I.prev.treinos[a].ex.splice(c,1);render();break}
  case 'iaadde':I.prev.treinos[+v].ex.push({id:uid('e'),n:'',s:3,r:'10-12',tipo:'i',desc:60});render();break;
  case 'iacriar':{try{const f=iaCriar();const back=I.back;S.ia=null;S.view=back;toast('Ficha criada. Revise os detalhes antes de treinar.');openEditor(f.id)}catch(err){I.err=err.message;render()}break}
 }
});
