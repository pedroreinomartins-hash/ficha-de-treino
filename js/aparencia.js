/* Aparência por modo (aluno e Personal): tema claro, escuro ou automático e cor de destaque.
   Salva no perfil (acompanha a conta) e numa cópia local, usada antes de o perfil carregar. */
const CORES={
 laranja:{n:'Laranja',claro:'#C2410C',escuro:'#FF7A1A'},
 azul:{n:'Azul',claro:'#2347D6',escuro:'#5B86FF'},
 verde:{n:'Verde-água',claro:'#0D7F86',escuro:'#2CC9B4'},
 roxo:{n:'Roxo',claro:'#7C3AED',escuro:'#B18CFF'},
 vermelho:{n:'Vermelho',claro:'#C81E5A',escuro:'#FF5C7A'},
 amarelo:{n:'Amarelo',claro:'#A16207',escuro:'#FFC72C'}};
const TEMAS=[['claro','Claro'],['escuro','Escuro'],['auto','Automático']];
const AP_PADRAO={aluno:{tema:'escuro',cor:'laranja'},personal:{tema:'claro',cor:'azul'}};
/* Configuração antiga (um tema para tudo e cor só no escuro) vira o ponto de partida. */
function apLegado(){const t=LS.get('ft6.tema',null),c=LS.get('ft6.acento',null);if(!t&&!c)return null;
 const a=clone(AP_PADRAO);if(t==='escuro'||t==='claro'){a.aluno.tema=t;a.personal.tema=t}if(c&&CORES[c])a.aluno.cor=c;return a}
function apCfg(){const p=S.me&&S.ready?ME():null;const base=p?.aparencia||LS.get('ft7.ap',null)||apLegado()||AP_PADRAO;
 return {aluno:{...AP_PADRAO.aluno,...(base.aluno||{})},personal:{...AP_PADRAO.personal,...(base.personal||{})}}}
const sistemaEscuro=()=>{try{return matchMedia('(prefers-color-scheme: dark)').matches}catch(e){return false}};
const ehEscuro=c=>c.tema==='escuro'||(c.tema==='auto'&&sistemaEscuro());
function aplicaTema(){const modo=S.me&&S.ready&&PM()?'personal':'aluno';const c=apCfg()[modo];const escuro=ehEscuro(c);
 const el=document.documentElement,t=escuro?'dark':'light',cor=CORES[c.cor]?c.cor:AP_PADRAO[modo].cor;
 if(el.getAttribute('data-acento')!==cor)el.setAttribute('data-acento',cor);
 if(el.getAttribute('data-theme')!==t)el.setAttribute('data-theme',t);
 const m=document.querySelector('meta[name=theme-color]');const tc=escuro?'#0E1217':CORES[cor].claro;if(m&&m.content!==tc)m.content=tc}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{aplicaTema();if(S.view==='perfil')render()})}catch(e){}
function apSalva(modo,campo,valor){const a=apCfg();a[modo][campo]=valor;LS.set('ft7.ap',a);const p=ME();if(p){p.aparencia=a;put('perfis',p)}render()}
/* Prévia em miniatura, com as cores do tema escolhido. */
function apPrevia(c){const e=ehEscuro(c),ac=CORES[c.cor][e?'escuro':'claro'];const bg=e?'#0E1217':'#ECEFF3',sf=e?'#171C23':'#FFFFFF',ink=e?'#EEF1F5':'#121821',mu=e?'#98A2AF':'#5A6573',ln=e?'#2A323D':'#D3DAE2';
 const on=e&&c.cor!=='azul'?'#14100C':'#FFFFFF';
 return `<div class="apprev" style="background:${bg};border-color:${ln}" aria-label="Prévia"><div class="apcard" style="background:${sf};border-color:${ln}"><span class="aplet" style="background:${ac};color:${on}">A</span><div class="grow"><div style="font-size:10px;letter-spacing:.1em;color:${mu};font-weight:600">PRÓXIMO TREINO</div><b style="color:${ink};font-size:15px">Peito e costas</b></div><span class="apbtn" style="background:${ac};color:${on}">Começar</span></div></div>`}
function apBloco(modo,titulo){const c=apCfg()[modo];const e=ehEscuro(c);
 return `<div class="apbloco"><b>${titulo}</b>
  <div class="seg">${TEMAS.map(([k,l])=>`<button data-act="aptema" data-m="${modo}" data-v="${k}" class="${c.tema===k?'on':''}">${l}</button>`).join('')}</div>
  ${c.tema==='auto'?`<div class="small muted">Segue o modo claro ou escuro do celular (agora: ${e?'escuro':'claro'}).</div>`:''}
  <div class="row" style="gap:8px;flex-wrap:wrap">${Object.entries(CORES).map(([k,x])=>`<button class="swatch ${c.cor===k?'on':''}" data-act="apcor" data-m="${modo}" data-v="${k}" aria-pressed="${c.cor===k}"><i style="background:${x[e?'escuro':'claro']}"></i>${x.n}</button>`).join('')}</div>
  ${apPrevia(c)}</div>`}
function aparenciaBox(){return `<section class="panel"><div class="eyebrow">Aparência</div>${apBloco('aluno',S.p?'Modo aluno':'Tema e cor')}${S.p?apBloco('personal','Modo Personal'):''}<div class="small muted">A escolha fica salva na sua conta e vale em qualquer celular.</div></section>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;
 if(b.dataset.act==='aptema')apSalva(b.dataset.m,'tema',b.dataset.v);
 if(b.dataset.act==='apcor')apSalva(b.dataset.m,'cor',b.dataset.v)});
