const V='block-rush-v1';
const FILES=['./','index.html','manifest.json','icon-180.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.open(V).then(c=>c.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(res=>{if(res.ok)c.put(e.request,res.clone());return res}).catch(()=>hit||c.match('index.html'));
    return hit||net;
  })));
});
