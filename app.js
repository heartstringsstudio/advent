/* Advent Devotional — Heartstrings Studio
   One day per page: wreath → verse (narrated) → devotional → prayer.
   Testing: add ?date=2026-12-14 to the address to see any day. */
(function(){
'use strict';

var DAYS=[], START=null, todayIdx=0, viewIdx=0, lastLit=-1;
var $=function(id){ return document.getElementById(id); };
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var WEEKDAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/* The five candles, in lighting order. a = angle around the wreath (degrees, 90 = nearest you). */
var CANDLES=[
  {key:'hope',  name:'Hope',  sub:'The Prophecy Candle',  color:'purple', a:118,
   note:'Lit the first Sunday. The prophets held on to God’s promise for centuries — hope that something good was coming.'},
  {key:'peace', name:'Peace', sub:'The Bethlehem Candle', color:'purple', a:203,
   note:'Lit the second Sunday. The road to Bethlehem, and the peace the Prince of Peace brings with Him.'},
  {key:'joy',   name:'Joy',   sub:'The Shepherds’ Candle',color:'rose',   a:337,
   note:'The rose candle, lit the third Sunday — a breath of joy in the middle of the waiting, like the shepherds’ good tidings.'},
  {key:'love',  name:'Love',  sub:'The Angels’ Candle',   color:'purple', a:62,
   note:'Lit the fourth Sunday. “For God so loved the world, that he gave…” Love holds the other three up.'},
  {key:'christ',name:'Christ',sub:'The Christ Candle',    color:'white',  a:null,
   note:'The white center candle, lit on Christmas Eve. The Light of the World has come — and stays lit through Christmastide.'}
];

/* ---------- dates ---------- */
function parseISO(s){ var p=s.split('-'); return Date.UTC(+p[0],+p[1]-1,+p[2]); }
function localISO(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function todayISO(){
  var q=new URLSearchParams(location.search).get('date');
  return (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) ? q : localISO(new Date());
}
function diffDays(a,b){ return Math.round((parseISO(b)-parseISO(a))/864e5); }
function prettyDate(iso){
  var t=new Date(parseISO(iso));
  return WEEKDAYS[t.getUTCDay()]+', '+MONTHS[t.getUTCMonth()]+' '+t.getUTCDate();
}

/* ---------- season ---------- */
function litFor(i){            // how many of the 4 ring candles, plus Christ candle
  if(i<0) return {ring:0,christ:false};
  return {ring:Math.min(4,Math.floor(i/7)+1), christ:i>=25};
}
function seasonFor(i){
  if(i<7)  return {week:1,name:'Hope',  pill:'Advent · Hope',  theme:'advent'};
  if(i<14) return {week:2,name:'Peace', pill:'Advent · Peace', theme:'advent'};
  if(i<21) return {week:3,name:'Joy',   pill:'Advent · Joy',   theme:'joy'};
  if(i<25) return {week:4,name:'Love',  pill:'Advent · Love',  theme:'advent'};
  if(i===25) return {name:'Christmas Eve', pill:'Christmas Eve', theme:'christmas'};
  if(i===26) return {name:'Christmas Day', pill:'Christmas Day', theme:'christmas'};
  if(i===33) return {name:'New Year’s Day',pill:'New Year’s Day',theme:'christmas'};
  return {name:'Christmastide', pill:'Christmastide', theme:'christmas'};
}

/* ---------- seeded random so the wreath looks the same every day ---------- */
function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

/* ---------- the wreath ---------- */
var W={cx:200,cy:224,rx:152,ry:58};
var NS='http://www.w3.org/2000/svg';
function f(n){ return Math.round(n*10)/10; }

function defs(){
  function lin(id,stops,horiz){
    return '<linearGradient id="'+id+'" x1="0" y1="0" x2="'+(horiz?1:0)+'" y2="'+(horiz?0:1)+'">'+
      stops.map(function(s){ return '<stop offset="'+s[0]+'" stop-color="'+s[1]+'"'+(s[2]!=null?' stop-opacity="'+s[2]+'"':'')+'/>'; }).join('')+'</linearGradient>';
  }
  return '<defs>'+
    lin('wax-purple',[[0,'#2E1240'],[.22,'#5B2C7C'],[.5,'#8650AC'],[.62,'#9A68BE'],[.85,'#4E2369'],[1,'#26103A']],true)+
    lin('wax-rose',  [[0,'#7E3550'],[.22,'#C06E8C'],[.5,'#E7A2BB'],[.62,'#F3BDD0'],[.85,'#AD5C7A'],[1,'#6E2C45']],true)+
    lin('wax-white', [[0,'#A99F8C'],[.22,'#E6DCC8'],[.5,'#FFF9EE'],[.62,'#FFFFFF'],[.85,'#D8CDB7'],[1,'#968C78']],true)+
    lin('top-purple',[[0,'#A779C8'],[1,'#6B3A8D']])+
    lin('top-rose',  [[0,'#F7C9D8'],[1,'#CF7F9C']])+
    lin('top-white', [[0,'#FFFFFF'],[1,'#E9E0CE']])+
    lin('warm',[[0,'#FFC46A',.55],[.35,'#FFB050',.18],[1,'#FFB050',0]])+
    lin('flame',[[0,'#FFFDF2'],[.35,'#FFE9A6'],[.7,'#FFB43F'],[1,'#F0771E']])+
    '<radialGradient id="halo"><stop offset="0" stop-color="#FFD27A" stop-opacity=".75"/><stop offset=".35" stop-color="#FFB24A" stop-opacity=".28"/><stop offset="1" stop-color="#FF9A3A" stop-opacity="0"/></radialGradient>'+
    '<radialGradient id="spill"><stop offset="0" stop-color="#FFC66E" stop-opacity=".5"/><stop offset="1" stop-color="#FFC66E" stop-opacity="0"/></radialGradient>'+
    '<radialGradient id="berry" cx=".35" cy=".35"><stop offset="0" stop-color="#FF7B6E"/><stop offset=".45" stop-color="#C81E2C"/><stop offset="1" stop-color="#6E0A14"/></radialGradient>'+
    '<radialGradient id="brass" cx=".5" cy=".3"><stop offset="0" stop-color="#F3D38A"/><stop offset=".6" stop-color="#B9862F"/><stop offset="1" stop-color="#6E4A14"/></radialGradient>'+
    '<radialGradient id="shadow"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'+
  '</defs>';
}

var GREENS=['#163A25','#1D4A2F','#24573A','#2D6644','#367550','#3F835A','#22503A','#1A4431'];
function sprig(r,x,y,rot,len,col){
  var d='M0 0L'+f(len)+' 0', n=Math.floor(len/2.3);
  for(var k=1;k<=n;k++){
    var t=k*2.3, l=4.2*(1-k/(n+3));
    d+='M'+f(t)+' 0l'+f(l*.75)+' '+f(-l)+'M'+f(t)+' 0l'+f(l*.75)+' '+f(l);
  }
  return '<path d="'+d+'" transform="translate('+f(x)+' '+f(y)+') rotate('+f(rot)+')" stroke="'+col+'" stroke-width="1.15" stroke-linecap="round" fill="none"/>';
}
function hollyLeaf(len,w){
  var pts=[[0,0],[.14,-.5],[.22,-.34],[.36,-.92],[.46,-.62],[.6,-1],[.7,-.6],[.84,-.72],[1,0],[.84,.72],[.7,.6],[.6,1],[.46,.62],[.36,.92],[.22,.34],[.14,.5]];
  return 'M'+pts.map(function(p){ return f(p[0]*len)+' '+f(p[1]*w); }).join('L')+'Z';
}
function holly(r,x,y,rot){
  var s='<g transform="translate('+f(x)+' '+f(y)+') rotate('+f(rot)+')">';
  [[-28,'#0F3A22'],[22,'#14472A'],[-150,'#123F26']].forEach(function(l){
    s+='<g transform="rotate('+l[0]+')"><path d="'+hollyLeaf(19,6.5)+'" fill="'+l[1]+'" stroke="#0A2615" stroke-width=".6"/><path d="M1 0L17 0" stroke="#4E8A5E" stroke-width=".7" opacity=".7"/><path d="M5 -2.2L12 -3.2" stroke="#7FB58C" stroke-width=".9" stroke-linecap="round" opacity=".35"/></g>';
  });
  [[0,-1],[4.6,1.8],[-3.2,3.4]].forEach(function(b){
    s+='<circle cx="'+b[0]+'" cy="'+b[1]+'" r="3.5" fill="url(#berry)"/><circle cx="'+f(b[0]-1.1)+'" cy="'+f(b[1]-1.2)+'" r=".9" fill="#fff" opacity=".75"/>';
  });
  return s+'</g>';
}
function pinecone(x,y,rot,sc){
  var s='<g transform="translate('+f(x)+' '+f(y)+') rotate('+f(rot)+') scale('+f(sc)+')"><ellipse rx="6.2" ry="9.5" fill="#5A3A20"/>';
  for(var row=-3;row<=3;row++){ s+='<path d="M-5.6 '+(row*2.4)+' Q0 '+(row*2.4+3.6)+' 5.6 '+(row*2.4)+'" stroke="#2E1C0E" stroke-width="1" fill="none"/>'; }
  return s+'<ellipse rx="2.4" ry="6" cx="-1.8" cy="-1" fill="#8A5E36" opacity=".35"/></g>';
}

function candleSVG(c,i,lit,isNew){
  var ang=c.a, x, y, s;
  if(ang==null){ x=W.cx; y=W.cy-6; s=1.06; }
  else{ var t=ang*Math.PI/180; x=W.cx+W.rx*Math.cos(t); y=W.cy+W.ry*Math.sin(t); s=.86+.14*(Math.sin(t)+1)/2; }
  var w=(c.key==='christ'?30:24)*s, h=(c.key==='christ'?150:116)*s;
  var lighten = lit?'':'<rect x="'+f(-w/2)+'" y="'+f(-h)+'" width="'+f(w)+'" height="'+f(h)+'" fill="#0B0816" opacity="'+(c.color==='white'?.2:.3)+'"/>';
  var g='<g class="candle'+(isNew?' light-in':'')+'" data-i="'+i+'" tabindex="0" role="button" aria-label="'+c.name+' candle'+(lit?', lit':', not yet lit')+'" transform="translate('+f(x)+' '+f(y)+')">';
  if(c.key==='christ') g+='<ellipse cx="0" cy="2" rx="'+f(w*1.05)+'" ry="'+f(w*.32)+'" fill="url(#brass)"/>';
  g+='<rect class="body" x="'+f(-w/2)+'" y="'+f(-h)+'" width="'+f(w)+'" height="'+f(h)+'" rx="2" fill="url(#wax-'+c.color+')"/>';
  g+=lighten;
  if(lit) g+='<rect x="'+f(-w/2)+'" y="'+f(-h)+'" width="'+f(w)+'" height="'+f(h*.6)+'" fill="url(#warm)"/>';
  // top of candle: a soft melted dip when lit
  g+='<ellipse cx="0" cy="'+f(-h)+'" rx="'+f(w/2)+'" ry="'+f(w*.2)+'" fill="url(#top-'+c.color+')"'+(lit?'':' opacity=".75"')+'/>';
  if(lit){
    g+='<ellipse cx="0" cy="'+f(-h+.6)+'" rx="'+f(w*.33)+'" ry="'+f(w*.11)+'" fill="#FFE4A8" opacity=".55"/>';
    var dx=(i%2?1:-1)*w*.28;
    g+='<path d="M'+f(dx-2.2)+' '+f(-h+1)+' q0 '+f(9*s)+' 2.2 '+f(11*s)+' q2.2 -2 2.2 '+f(-11*s)+'z" fill="url(#top-'+c.color+')" opacity=".9"/>';
  }
  g+='<rect x="'+f(-w/2+2.2)+'" y="'+f(-h+3)+'" width="'+f(w*.1)+'" height="'+f(h-6)+'" rx="1" fill="#fff" opacity=".14"/>';
  // wick
  g+='<path d="M0 '+f(-h)+' q.8 -3.5 -.3 -'+f(7*s)+'" stroke="'+(lit?'#2A170B':'#1A120C')+'" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  if(lit){
    var fy=-h-6*s, fs=s*(c.key==='christ'?1.12:1), ft=(1.4+((i*37)%10)/12).toFixed(2), fd=(-((i*53)%10)/7).toFixed(2);
    g+='<g style="--ft:'+ft+'s;--fd:'+fd+'s" transform="translate(0 '+f(fy)+') scale('+f(fs)+')">'+
       '<circle class="halo" cx="0" cy="-12" r="34" fill="url(#halo)"/>'+
       '<path class="flame" d="M0 -32 C7 -20 10.5 -10 7 -3 C5 1.5 -5 1.5 -7 -3 C-10.5 -10 -7 -20 0 -32Z" fill="url(#flame)"/>'+
       '<ellipse class="flame" cx="0" cy="-5" rx="2.6" ry="4.2" fill="#6FA8FF" opacity=".55"/>'+
       '<ellipse class="flame" cx="0" cy="-11" rx="3" ry="7" fill="#FFFFF4" opacity=".9"/>'+
       '</g>';
  }
  return {y:y+(c.key==='christ'?0:.5), svg:g+'</g>', x:x, lit:lit};
}

function drawWreath(i, animateNew){
  var L=litFor(i), r=rng(1225), items=[], k, t, rr, x, y;
  // fir sprigs, three layers deep
  for(k=0;k<520;k++){
    t=r()*Math.PI*2; rr=.76+r()*.48;
    x=W.cx+W.rx*rr*Math.cos(t); y=W.cy+W.ry*rr*Math.sin(t)-r()*r()*20;
    var tang=Math.atan2(W.ry*Math.cos(t),-W.rx*Math.sin(t))*180/Math.PI;
    var front=(Math.sin(t)+1)/2, ci=Math.min(GREENS.length-1,Math.floor(r()*4+front*4));
    items.push({y:y+12, svg:sprig(r,x,y,tang+(r()-.5)*80+(r()<.5?180:0),14+r()*14,GREENS[ci])});
  }
  // holly & berries
  for(k=0;k<11;k++){
    t=(k/11)*Math.PI*2+.35; rr=1+(r()-.5)*.1;
    x=W.cx+W.rx*rr*Math.cos(t); y=W.cy+W.ry*rr*Math.sin(t)-6;
    items.push({y:y+14, svg:holly(r,x,y,r()*360)});
  }
  // pinecones
  [0.9,2.0,3.3,4.3,5.5].forEach(function(a){
    x=W.cx+W.rx*1.03*Math.cos(a); y=W.cy+W.ry*1.03*Math.sin(a)-3;
    items.push({y:y+13, svg:pinecone(x,y,(a*57)%360-90,.9+.2*Math.sin(a))});
  });
  // candles
  var cs=[];
  CANDLES.forEach(function(c,ci){
    var lit = ci<4 ? ci<L.ring : L.christ;
    var isNew = animateNew && lit && ((ci<4 && ci===L.ring-1 && (i%7===0) && i<25) || (ci===4 && i===25));
    var o=candleSVG(c,ci,lit,isNew); items.push(o); cs.push(o);
  });
  items.sort(function(a,b){ return a.y-b.y; });

  var svg=defs()+
    '<ellipse cx="'+W.cx+'" cy="'+(W.cy+26)+'" rx="'+(W.rx*1.25)+'" ry="'+(W.ry*1.1)+'" fill="url(#shadow)"/>'+
    '<ellipse cx="'+W.cx+'" cy="'+(W.cy+2)+'" rx="'+W.rx+'" ry="'+W.ry+'" fill="none" stroke="#0C2616" stroke-width="34"/>'+
    '<ellipse cx="'+W.cx+'" cy="'+(W.cy-4)+'" rx="'+W.rx+'" ry="'+W.ry+'" fill="none" stroke="#123620" stroke-width="22"/>'+
    items.map(function(o){ return o.svg; }).join('');
  // warm light spilling onto the greenery
  cs.forEach(function(o){ if(o.lit) svg+='<ellipse cx="'+f(o.x)+'" cy="'+f(o.y-4)+'" rx="62" ry="30" fill="url(#spill)" style="mix-blend-mode:screen" pointer-events="none"/>'; });
  $('wreath').innerHTML=svg;
  var n=L.ring+(L.christ?1:0);
  $('glow').style.setProperty('--g', n ? (.25+n*.15).toFixed(2) : '.08');

  // key chips
  $('candleKey').innerHTML=CANDLES.map(function(c,ci){
    var lit = ci<4 ? ci<L.ring : L.christ;
    var col = c.color==='purple'?'#9A68BE':c.color==='rose'?'#EBA4BD':'#FFF6E6';
    return '<button type="button" class="'+(lit?'lit':'')+'" data-i="'+ci+'" aria-expanded="false" style="--c:'+col+'"><i></i>'+c.name+'</button>';
  }).join('');
}

function showCandle(ci){
  var c=CANDLES[ci], note=$('candleNote'), btns=$('candleKey').querySelectorAll('button');
  var open = note.dataset.i===String(ci);
  btns.forEach(function(b){ b.setAttribute('aria-expanded', (!open && b.dataset.i===String(ci))?'true':'false'); });
  if(open){ note.innerHTML=''; note.dataset.i=''; return; }
  note.dataset.i=String(ci);
  note.innerHTML='<b>'+c.sub+' · '+c.name+'</b>'+c.note;
}

/* ---------- sky ---------- */
function drawSky(){
  var r=rng(7), s='';
  for(var k=0;k<80;k++){
    var o=(.35+r()*.6).toFixed(2);
    s+='<circle cx="'+f(r()*100)+'%" cy="'+f(r()*100)+'%" r="'+f(.4+r()*r()*1.4)+'" style="--o:'+o+';--t:'+f(2.5+r()*4)+'s;--d:'+f(-r()*6)+'s"/>';
  }
  $('sky').innerHTML=s;
  var sn='';
  for(k=0;k<26;k++){
    sn+='<i style="left:'+f(r()*100)+'%;--s:'+f(1.5+r()*2.5)+'px;--o:'+f(.25+r()*.5)+';--t:'+f(9+r()*10)+'s;--d:'+f(-r()*18)+'s;--x:'+f((r()-.5)*80)+'px"></i>';
  }
  $('snow').innerHTML=sn;
}

/* ---------- render a day ---------- */
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

function render(animate){
  stopAudio();
  var before = todayIdx<0;
  var d = DAYS[viewIdx], se = seasonFor(viewIdx);
  document.documentElement.dataset.season = se.theme;
  drawWreath(before && !$('today').dataset.peek ? -1 : viewIdx, animate);
  $('candleNote').innerHTML=''; $('candleNote').dataset.i='';

  if(before && !$('today').dataset.peek){
    var n=-todayIdx;
    $('pill').textContent='Advent is coming';
    $('daycount').textContent='';
    $('date').textContent=prettyDate(todayISO());
    $('countTitle').textContent=n===1?'Advent begins tomorrow':'Advent begins in '+n+' days';
    $('countSub').textContent='Come back Sunday, November 29, to light the first candle. Each day brings one verse and a short devotional from the hills.';
    $('before').hidden=false; $('today').hidden=true;
    return;
  }
  $('before').hidden=true; $('today').hidden=false;
  $('pill').textContent=se.pill;
  $('daycount').textContent='Day '+d.day+' of '+DAYS.length;
  $('date').textContent=prettyDate(d.date);
  var preview = before ? 'Preview · ' : '';
  $('kicker').textContent=preview+(se.week ? 'Week '+se.week+' · '+se.name : se.name);
  $('title').textContent=d.title;
  $('verse').textContent='“'+d.verse+'”';
  $('ref').textContent=d.ref+' (KJV)';
  $('devo').innerHTML=d.body.map(function(p){ return '<p>'+esc(p)+'</p>'; }).join('');
  $('prayer').textContent=d.prayer;

  var maxIdx = Math.max(0,Math.min(todayIdx,DAYS.length-1));
  $('prevBtn').disabled = viewIdx<=0;
  $('nextBtn').disabled = viewIdx>=maxIdx || before;
  $('prevLabel').textContent = viewIdx===todayIdx ? 'Yesterday' : 'Previous';
  $('nextLabel').textContent = viewIdx+1===todayIdx ? 'Today' : 'Next day';
  $('todayBtn').hidden = before || viewIdx===maxIdx || viewIdx+1===maxIdx;
  if(history.replaceState){
    var u=new URL(location.href); u.hash = viewIdx===maxIdx ? '' : 'day'+d.day;
    history.replaceState(null,'',u.pathname+u.search+u.hash);
  }
}

function go(i){
  viewIdx=i; render(true);
  $('today').scrollIntoView({behavior:'smooth',block:'start'});
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ---------- audio ---------- */
var audio=$('audio'), speaking=false;
function setPlaying(on){
  $('playBtn').setAttribute('aria-pressed',on?'true':'false');
  $('playIco').textContent=on?'■':'▶';
  $('playLabel').textContent=on?'Stop':'Hear the verse';
}
function stopAudio(){
  try{ audio.pause(); audio.currentTime=0; }catch(e){}
  if(speaking && window.speechSynthesis){ speechSynthesis.cancel(); }
  speaking=false; setPlaying(false);
}
function speak(d){
  if(!window.speechSynthesis){ setPlaying(false); return; }
  var u=new SpeechSynthesisUtterance(d.verse+' — '+d.ref.replace('–',' through '));
  u.rate=.9; u.onend=function(){ speaking=false; setPlaying(false); };
  speaking=true; speechSynthesis.speak(u); setPlaying(true);
}
function play(){
  var d=DAYS[viewIdx];
  if($('playBtn').getAttribute('aria-pressed')==='true'){ stopAudio(); return; }
  audio.src='audio/day-'+String(d.day).padStart(2,'0')+'.mp3';
  audio.onended=function(){ setPlaying(false); };
  audio.onerror=function(){ speak(d); };
  var p=audio.play(); setPlaying(true);
  if(p && p.catch) p.catch(function(){ speak(d); });
}

/* ---------- share ---------- */
function toast(msg){ var t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(function(){ t.classList.remove('show'); },2600); }
function share(){
  var d=DAYS[viewIdx], url=location.origin+location.pathname;
  var text='“'+d.verse+'” — '+d.ref+'\n\nToday’s Advent devotional: “'+d.title+'.” Light a candle with us 🕯️';
  if(navigator.share){
    navigator.share({title:'Advent Devotional — '+d.title, text:text, url:url}).catch(function(){});
  } else if(navigator.clipboard){
    navigator.clipboard.writeText(text+'\n'+url).then(function(){ toast('Copied — paste it anywhere to share'); },function(){ toast(url); });
  } else toast(url);
}

/* ---------- install hint ---------- */
var deferred=null;
function setupInstall(){
  var standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if(standalone) return;
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  $('installText').textContent = ios
    ? 'Tap the Share button ⬆︎ in Safari, then “Add to Home Screen.” It opens like an app and works offline.'
    : 'Add it to your home screen so a new candle is one tap away each morning.';
  $('install').hidden=false;
  window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); deferred=e; $('installBtn').hidden=false; });
  $('installBtn').onclick=function(){ if(deferred){ deferred.prompt(); deferred=null; $('installBtn').hidden=true; } };
}

/* ---------- start ---------- */
function bind(){
  $('playBtn').onclick=play;
  $('shareBtn').onclick=share;
  $('prevBtn').onclick=function(){ if(viewIdx>0) go(viewIdx-1); };
  $('nextBtn').onclick=function(){ if(viewIdx<Math.min(todayIdx,DAYS.length-1)) go(viewIdx+1); };
  $('todayBtn').onclick=function(){ go(Math.min(todayIdx,DAYS.length-1)); };
  $('peekBtn').onclick=function(){ $('today').dataset.peek='1'; viewIdx=0; render(true); };
  function candleTap(e){
    var g=e.target.closest('[data-i]'); if(!g) return;
    if(e.type==='keydown' && e.key!=='Enter' && e.key!==' ') return;
    if(e.type==='keydown') e.preventDefault();
    showCandle(+g.dataset.i);
  }
  $('wreath').addEventListener('click',candleTap);
  $('wreath').addEventListener('keydown',candleTap);
  $('candleKey').addEventListener('click',candleTap);
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible'){            // new day while app sat open
      var t=diffDays(START,todayISO()); if(t!==todayIdx){ todayIdx=t; viewIdx=Math.max(0,Math.min(t,DAYS.length-1)); render(true); }
    }
  });
}

function init(data){
  DAYS=data.days; START=data.start;
  todayIdx=diffDays(START,todayISO());
  viewIdx=Math.max(0,Math.min(todayIdx,DAYS.length-1));
  var m=/^#day(\d+)$/.exec(location.hash);
  if(m){ var h=+m[1]-1; if(h>=0 && h<=Math.min(todayIdx,DAYS.length-1)) viewIdx=h; }
  drawSky(); bind(); render(true); setupInstall();
}

fetch('content/days.json').then(function(r){ return r.json(); }).then(init).catch(function(){
  $('pill').textContent='Offline'; $('date').textContent='Couldn’t load today’s devotional. Check your connection and reopen.';
});

if('serviceWorker' in navigator){ window.addEventListener('load',function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }); }
})();
