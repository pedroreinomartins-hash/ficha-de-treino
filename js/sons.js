/* Sons e alertas: sino suave, voz, apito e vibração, gerados no próprio aparelho (sem arquivos de áudio).
   Também mantém uma "sessão de áudio" durante o treino, para o celular não pausar o app com a tela apagada,
   e mostra o passo atual no controle de mídia da tela de bloqueio. */
const SOM_PADRAO={musc:'sino',corr:'voz',tic3:true,metade:true};
const SOM_ESTILOS={sino:'Sino suave',voz:'Voz',apito:'Apito',vibra:'Só vibração'};
const somPref=()=>({...SOM_PADRAO,...LS.get('ft5.sons',{})});
let somCtx=null;
function somAudio(){try{if(!somCtx){const C=window.AudioContext||window.webkitAudioContext;if(C)somCtx=new C()}if(somCtx&&somCtx.state==='suspended')somCtx.resume()}catch(e){}return somCtx}
/* Nota de sino: fundamental + harmônicos com decaimento exponencial. */
function sino(freq,quando=0,dur=1.1,vol=.32){const c=somAudio();if(!c)return;const t=c.currentTime+quando;
 [[1,1],[2.76,.32],[5.4,.12]].forEach(([h,g])=>{const o=c.createOscillator(),a=c.createGain();o.type='sine';o.frequency.value=freq*h;
  a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(vol*g,t+.008);a.gain.exponentialRampToValueAtTime(.0001,t+dur/(h>1?h*.6:1));
  o.connect(a).connect(c.destination);o.start(t);o.stop(t+dur+.05)})}
function tic(quando=0){const c=somAudio();if(!c)return;const t=c.currentTime+quando;const o=c.createOscillator(),a=c.createGain();o.type='triangle';o.frequency.value=1500;
 a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(.18,t+.004);a.gain.exponentialRampToValueAtTime(.0001,t+.07);o.connect(a).connect(c.destination);o.start(t);o.stop(t+.09)}
function apito(n=3,quando=0){const c=somAudio();if(!c)return;const t=c.currentTime+quando;for(let i=0;i<n;i++){const o=c.createOscillator(),a=c.createGain();o.frequency.value=i===n-1?1175:880;
 a.gain.setValueAtTime(.0001,t+i*.28);a.gain.exponentialRampToValueAtTime(.4,t+i*.28+.02);a.gain.exponentialRampToValueAtTime(.0001,t+i*.28+.22);o.connect(a).connect(c.destination);o.start(t+i*.28);o.stop(t+i*.28+.25)}}
function gongo(quando=0){const c=somAudio();if(!c)return;const t=c.currentTime+quando;[[98,.5],[196,.25],[293,.12]].forEach(([f,g])=>{const o=c.createOscillator(),a=c.createGain();o.type='sine';o.frequency.value=f;
 a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(g,t+.02);a.gain.exponentialRampToValueAtTime(.0001,t+2.2);o.connect(a).connect(c.destination);o.start(t);o.stop(t+2.3)})}
const N={C5:523.25,D5:587.33,E5:659.25,G5:783.99,A5:880,C6:1046.5,E6:1318.5};
const SINO={
 tic:()=>tic(),
 fimDescanso:()=>{sino(N.E5,0);sino(N.A5,.22)},
 metade:()=>sino(N.G5,0,.8,.22),
 fimTempo:()=>{sino(N.C5,0);sino(N.E5,.16);sino(N.G5,.32,1.4)},
 inicioBloco:()=>{gongo(0);sino(N.E5,.5);sino(N.A5,.72)},
 recuperacao:()=>{sino(N.A5,0);sino(N.E5,.22)},
 faltam10:()=>sino(N.G5,0,.6,.2),
 fim:()=>{sino(N.C5,0);sino(N.E5,.15);sino(N.G5,.3);sino(N.C6,.48,1.8)}
};
const VIBRA={tic:[30],fimDescanso:[600],metade:[120],fimTempo:[150,90,150,90,150],inicioBloco:[400,120,400],recuperacao:[200,100,200],faltam10:[80],fim:[200,100,200,100,600]};
function falar(texto){try{const s=window.speechSynthesis;if(!s||!texto)return false;s.cancel();const u=new SpeechSynthesisUtterance(texto);u.lang='pt-BR';u.rate=1.05;
 const v=s.getVoices().find(x=>/pt[-_]BR/i.test(x.lang))||s.getVoices().find(x=>/^pt/i.test(x.lang));if(v)u.voice=v;s.speak(u);return true}catch(e){return false}}
/* Dispara o alerta de um evento no estilo escolhido para musculação ('musc') ou corrida ('corr'). */
function alertaSom(ev,{modo='musc',texto=''}={}){const p=somPref();const estilo=p[modo]||'sino';
 if(ev==='tic'&&!p.tic3)return;if(ev==='metade'&&!p.metade)return;
 try{navigator.vibrate&&navigator.vibrate(VIBRA[ev]||[200])}catch(e){}
 if(estilo==='vibra')return;
 if(estilo==='apito'){if(ev==='tic')tic();else apito(ev==='fim'||ev==='fimTempo'?4:3);return}
 if(estilo==='voz'&&texto&&ev!=='tic'){const ok=falar(texto);if(!ok||document.visibilityState!=='visible')(SINO[ev]||SINO.fimDescanso)();return}
 (SINO[ev]||SINO.fimDescanso)()}
function ouvirEstilo(estilo,modo){const antes=LS.get('ft5.sons',{});LS.set('ft5.sons',{...antes,[modo]:estilo});
 alertaSom('fimDescanso',{modo,texto:modo==='corr'?'Tiro 3 de 6: 400 metros, ritmo 5 minutos por quilômetro.':'Bora! Série 3 de 4, supino reto.'});
 setTimeout(()=>LS.set('ft5.sons',antes),50)}

/* ---------- Sessão de áudio para o modo segundo plano ---------- */
let somEl=null,somUrl=null;
function somWavSilencioso(){const sr=8000,n=sr*2,buf=new ArrayBuffer(44+n*2),d=new DataView(buf);const w=(o,s)=>[...s].forEach((c,i)=>d.setUint8(o+i,c.charCodeAt(0)));
 w(0,'RIFF');d.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,sr,true);d.setUint32(28,sr*2,true);d.setUint16(32,2,true);d.setUint16(34,16,true);w(36,'data');d.setUint32(40,n*2,true);
 for(let i=0;i<n;i++)d.setInt16(44+i*2,(Math.random()*2-1)*3,true);return URL.createObjectURL(new Blob([buf],{type:'audio/wav'}))}
const sessaoAudio={
 ativa:false,
 iniciar(acoes={}){somAudio();try{if(!somEl){somUrl=somWavSilencioso();somEl=new Audio(somUrl);somEl.loop=true;somEl.setAttribute('playsinline','')}somEl.volume=1;const p=somEl.play();if(p&&p.catch)p.catch(()=>{})}catch(e){}
  this.ativa=true;try{const ms=navigator.mediaSession;if(ms){ms.playbackState='playing';
   [['play',acoes.play],['pause',acoes.pause],['nexttrack',acoes.next],['previoustrack',null],['seekbackward',null],['seekforward',null]].forEach(([k,f])=>{try{ms.setActionHandler(k,f||null)}catch(_){}})}}catch(e){}},
 info(titulo,detalhe){if(!this.ativa)return;try{if(navigator.mediaSession&&window.MediaMetadata){const k=titulo+'|'+detalhe;if(k===this._k)return;this._k=k;
  navigator.mediaSession.metadata=new MediaMetadata({title:titulo,artist:detalhe||'',album:'Ficha de Treino',artwork:[{src:'icons/icon-192.png',sizes:'192x192',type:'image/png'},{src:'icons/icon-512.png',sizes:'512x512',type:'image/png'}]})}}catch(e){}},
 parar(){this.ativa=false;this._k='';try{somEl&&somEl.pause()}catch(e){}try{if(navigator.mediaSession){navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none'}}catch(e){}}
};
if(window.speechSynthesis)try{speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices()}catch(e){}

/* ---------- Preferências em Meu perfil ---------- */
function sonsBox(){const p=somPref();const sel=(modo,lab)=>`<div class="field"><label class="lbl" for="som-${modo}">${lab}</label><div class="row" style="gap:8px"><select id="som-${modo}" class="grow" data-som="${modo}">${Object.entries(SOM_ESTILOS).map(([k,l])=>`<option value="${k}" ${p[modo]===k?'selected':''}>${l}</option>`).join('')}</select><button class="btn sm ghost" data-act="somouvir" data-v="${modo}">Ouvir</button></div></div>`;
 return `<section class="panel"><div class="eyebrow">Sons e alertas</div>${sel('musc','Musculação')}${sel('corr','Corrida')}
  <label class="check"><input type="checkbox" data-som="tic3" ${p.tic3?'checked':''}>Contagem nos 3 últimos segundos</label>
  <label class="check"><input type="checkbox" data-som="metade" ${p.metade?'checked':''}>Aviso na metade de exercícios por tempo acima de 1 minuto</label>
  <div class="small muted">Os sons usam o volume de mídia e saem no fone quando conectado. Durante o treino, o app aparece como um player na tela de bloqueio para continuar avisando com a tela apagada. Se o aparelho estiver em economia de bateria, desative-a para o navegador.</div></section>`}
document.addEventListener('change',e=>{const el=e.target;if(!el.dataset.som)return;const p=LS.get('ft5.sons',{});p[el.dataset.som]=el.type==='checkbox'?el.checked:el.value;LS.set('ft5.sons',p)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="somouvir"]');if(!b)return;const modo=b.dataset.v;ouvirEstilo($('#som-'+modo)?.value||somPref()[modo],modo)});
