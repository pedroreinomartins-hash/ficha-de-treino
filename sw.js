/* Service worker: permite instalar o app e abrir sem internet (os dados sincronizam depois). */
const CACHE='ficha-v12';
const ARQ=['./','index.html','js/app.js','js/config.js','js/exercicios.js','js/sons.js','js/arquivos.js','js/corrida.js','js/modelos.js','js/rede.js','js/ia.js','termos.html','privacidade.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQ)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  /* rede primeiro (pega atualizações), cache se estiver offline */
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
});
