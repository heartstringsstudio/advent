/* Advent Devotional — service worker
   App files + devotional text: network first, cache fallback (works offline).
   Audio and images: cache first. Bump VERSION when app files change. */
var VERSION='v1.0.1';
var SHELL='adv-shell-'+VERSION, MEDIA='adv-media';
var SHELL_FILES=['./','index.html','app.css','app.js','manifest.webmanifest','content/days.json',
  'icons/icon.svg','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(SHELL).then(function(c){ return c.addAll(SHELL_FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k.indexOf('adv-shell-')===0 && k!==SHELL; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
function isMedia(u){ return /\.(mp3|webp|png|jpe?g|svg)$/i.test(u.pathname); }
/* iPhone Safari asks for audio in byte ranges; answer from the cached file. */
function rangeResponse(req,res){
  var range=req.headers.get('range'); if(!range) return res;
  return res.arrayBuffer().then(function(buf){
    var m=/bytes=(\d*)-(\d*)/.exec(range)||[], size=buf.byteLength;
    var start=m[1]?parseInt(m[1],10):0, end=m[2]?parseInt(m[2],10):size-1;
    if(!m[1]&&m[2]){ start=size-parseInt(m[2],10); end=size-1; }
    end=Math.min(end,size-1);
    return new Response(buf.slice(start,end+1),{status:206,statusText:'Partial Content',headers:{
      'Content-Type':res.headers.get('Content-Type')||'audio/mpeg','Content-Range':'bytes '+start+'-'+end+'/'+size,
      'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
  });
}
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET') return;
  var url=new URL(req.url); if(url.origin!==self.location.origin) return;
  if(isMedia(url)){
    var key=url.origin+url.pathname;
    e.respondWith(caches.open(MEDIA).then(function(c){
      return c.match(key).then(function(hit){
        if(hit) return rangeResponse(req,hit);
        return fetch(key).then(function(r){ if(r.ok&&r.status===200){ c.put(key,r.clone()); return rangeResponse(req,r); } return r; })
          .catch(function(){ return Response.error(); });
      });
    }));
    return;
  }
  e.respondWith(fetch(url.href,{cache:'no-cache',credentials:'same-origin'}).then(function(r){
    if(r.ok){ var copy=r.clone(); caches.open(SHELL).then(function(c){ c.put(req,copy); }); }
    return r;
  }).catch(function(){
    return caches.match(req,{ignoreSearch:true}).then(function(hit){ return hit||(req.mode==='navigate'?caches.match('index.html'):Response.error()); });
  }));
});
