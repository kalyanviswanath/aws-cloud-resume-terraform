// Shared lightweight ambience + canvas background
(function(){
  // ---------------- Audio ----------------
  let audioCtx, osc, gain, isOn = false;
  const btn = document.getElementById('sound-toggle');
  const saved = (typeof localStorage !== 'undefined') && localStorage.getItem('kv_sound') === 'on';

  function ensureAudio(){
    if(audioCtx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return;
    audioCtx = new Ctx();
    osc = audioCtx.createOscillator();
    gain = audioCtx.createGain();
    // soft ambient tone
    osc.type = 'sine';
    osc.frequency.value = 220;
    gain.gain.value = 0;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
  }
  function setSound(on){
    ensureAudio(); if(!gain) return;
    isOn = !!on; if(btn){ btn.dataset.state = isOn ? 'on' : 'off'; }
    const t = audioCtx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.linearRampToValueAtTime(isOn ? 0.025 : 0.0, t + 0.15);
    try{ localStorage.setItem('kv_sound', isOn ? 'on' : 'off'); }catch(_){ }
  }
  if(btn){
    btn.addEventListener('click', async () => {
      ensureAudio();
      if(audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
      setSound(!isOn);
    });
  }
  // If previously on, wait for first interaction to resume
  if(saved){
    const kick = async () => { ensureAudio(); if(audioCtx && audioCtx.state==='suspended') await audioCtx.resume(); setSound(true); cleanup(); };
    const cleanup = () => { ['pointerdown','keydown','wheel','touchstart'].forEach(t=>window.removeEventListener(t,kick)); };
    ['pointerdown','keydown','wheel','touchstart'].forEach(t=>window.addEventListener(t,kick,{passive:true, once:false}));
  }

  // Intro gate support (home only)
  const gate = document.getElementById('intro-gate');
  const gateBtn = document.getElementById('intro-btn');
  if(gateBtn){
    gateBtn.addEventListener('click', async () => {
      ensureAudio(); if(audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
      if(saved) setSound(true);
      gate && gate.setAttribute('aria-hidden', 'true');
    });
  }

  // ---------------- Canvas backdrop ----------------
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('hero-canvas');
  if(!canvas || prefersReduce) return;
  const ctx = canvas.getContext('2d');
  let width=0,height=0,dpr=Math.max(1, window.devicePixelRatio||1);
  const dots=[]; let mx=0.5,my=0.5;
  function resize(){
    width = Math.floor(window.innerWidth); height = Math.floor(window.innerHeight);
    canvas.width = Math.floor(width*dpr); canvas.height = Math.floor(height*dpr);
    canvas.style.width = width+'px'; canvas.style.height = height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if(dots.length === 0){
      const n = Math.max(160, Math.floor(width*height/12000));
      for(let i=0;i<n;i++) dots.push(spawn());
    }
  }
  function spawn(){
    return { x:Math.random()*width, y:Math.random()*height, z:0.3+Math.random()*1.0, s:1+Math.random()*2.5, vx:(Math.random()-0.5)*0.35, vy:(Math.random()-0.5)*0.35 };
  }
  function step(){
    ctx.clearRect(0,0,width,height);
    const ox=(mx-0.5)*36, oy=(my-0.5)*36;
    // vignette background
    const g = ctx.createRadialGradient(width/2, height/2, Math.min(width,height)*0.1, width/2, height/2, Math.max(width,height)*0.8);
    g.addColorStop(0,'rgba(0,40,80,0.25)'); g.addColorStop(1,'rgba(0,0,0,0.0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,width,height);
    for(const p of dots){
      p.x+=p.vx*(0.6+p.z); p.y+=p.vy*(0.6+p.z);
      if(p.x<-10) p.x=width+10; if(p.x>width+10) p.x=-10;
      if(p.y<-10) p.y=height+10; if(p.y>height+10) p.y=-10;
      const x=p.x-ox*(1-p.z), y=p.y-oy*(1-p.z);
      ctx.beginPath(); ctx.fillStyle=`rgba(80,170,255,${0.12+0.5*p.z})`;
      ctx.arc(x,y,p.s*p.z,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(step);
  }
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e=>{ mx = e.clientX/Math.max(1,window.innerWidth); my=e.clientY/Math.max(1,window.innerHeight); });
  window.addEventListener('touchmove', e=>{ const t=e.touches[0]; if(t){ mx=t.clientX/innerWidth; my=t.clientY/innerHeight; } }, {passive:true});
  resize(); step();
})();

/*
  Fullscreen animated background + ambient soundscape
  - Respects prefers-reduced-motion
  - Starts on user gesture via intro gate
*/
// 2D glow background + scroll-driven 3D-ish section transforms
(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('hero-canvas');

  const gate = document.getElementById('intro-gate');
  const gateBtn = document.getElementById('intro-btn');
  const soundToggle = document.getElementById('sound-toggle');
  const hero = document.querySelector('.hero');

  // Background particles (2D) — only if canvas exists (home page)
  const ctx = canvas ? canvas.getContext('2d') : null;
  let width=0, height=0, dpr=Math.min(2, window.devicePixelRatio||1);
  let time=0, rafId=0;
  const pointer={x:0.5,y:0.5};
  const particles=[];
  const DENSITY = reduceMotion ? 0.00010 : 0.00022; // per px^2

  function resize(){
    width = Math.max(1, Math.floor(window.innerWidth));
    height = Math.max(1, Math.floor(window.innerHeight));
    if(canvas && ctx){
      canvas.width = Math.floor(width*dpr);
      canvas.height = Math.floor(height*dpr);
      canvas.style.width = width+'px'; canvas.style.height = height+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const target = Math.max(90, Math.floor(width*height*DENSITY));
      while(particles.length < target) spawn(1);
      particles.length = target;
    }
  }
  function rand(a,b){ return a + Math.random()*(b-a); }
  function spawn(n){
    for(let i=0;i<n;i++) particles.push({
      x: Math.random()*width, y: Math.random()*height,
      vx: rand(-0.15,0.15), vy: rand(-0.15,0.15),
      r: rand(12,36), hue: rand(200,250), sat: rand(70,95), a: rand(0.08,0.35), p: rand(0.2,1)
    });
  }
  function field(x,y,t){
    const s1 = Math.sin((x*0.0012)+t*0.2), c1=Math.cos((y*0.0011)-t*0.18);
    const s2 = Math.sin((x*0.0006+y*0.0009)+t*0.07);
    return {x:(s1+s2*0.7)*0.26, y:(c1-s2*0.7)*0.26};
  }
  function update(){
    const px=(pointer.x-0.5)*120, py=(pointer.y-0.5)*120;
    for(const p of particles){
    const f=field(p.x,p.y,time*0.001);
      p.vx+=f.x*(reduceMotion?0.12:0.22); p.vy+=f.y*(reduceMotion?0.12:0.22);
      p.vx+=(px-(p.x-width/2))*0.00002*p.p; p.vy+=(py-(p.y-height/2))*0.00002*p.p;
      p.vx*=0.985; p.vy*=0.985; p.x+=p.vx*(0.6+p.p*0.6); p.y+=p.vy*(0.6+p.p*0.6);
      if(p.x<-50)p.x=width+50; else if(p.x>width+50)p.x=-50;
      if(p.y<-50)p.y=height+50; else if(p.y>height+50)p.y=-50;
    }
  }
  function draw(){
    if(!ctx) return; // no canvas on subpages
    ctx.clearRect(0,0,width,height);
    // subtle wash
    const g=ctx.createRadialGradient(width*0.6,height*0.35,30,width*0.6,height*0.35,Math.max(width,height));
    g.addColorStop(0,'rgba(26,163,255,0.08)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,width,height);
    ctx.globalCompositeOperation='lighter';
    for(const p of particles){
      const rad=Math.max(6,p.r*(0.6+0.4*Math.sin((p.x+p.y+time*0.2)*0.004)));
      const grad=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rad);
      grad.addColorStop(0,`hsla(${p.hue},${p.sat}%,55%,${p.a})`);
      grad.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(p.x,p.y,rad,0,Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';
  }
  let last=performance.now();
  function loop(now){ const dt=Math.min(64,now-last); last=now; time+=dt; if(ctx){ update(); draw(); } rafId=requestAnimationFrame(loop); }

  // Pointer
  function onMove(e){
    if(e.touches&&e.touches[0]){ pointer.x=e.touches[0].clientX/Math.max(1,window.innerWidth); pointer.y=e.touches[0].clientY/Math.max(1,window.innerHeight); }
    else { pointer.x=e.clientX/Math.max(1,window.innerWidth); pointer.y=e.clientY/Math.max(1,window.innerHeight); }
  }
  if(canvas){
    window.addEventListener('mousemove', onMove, {passive:true});
    window.addEventListener('touchmove', onMove, {passive:true});
  }

  // Section smoke/zoom transitions (no 3D transforms)
  const sectionNodes = Array.from(document.querySelectorAll('.hero, .section'));
  let activeSection = null;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if(entry.isIntersecting && entry.intersectionRatio >= 0.6){
        const next = entry.target;
        if(next === activeSection) return;
        // leaving
        if(activeSection){
          activeSection.classList.remove('entering');
          activeSection.classList.add('leaving');
          activeSection.addEventListener('animationend', function h(){ activeSection.classList.remove('leaving'); activeSection.removeEventListener('animationend', h); });
        }
        // entering
        next.classList.add('entering');
        next.addEventListener('animationend', function h(){ next.classList.remove('entering'); next.removeEventListener('animationend', h); });
        activeSection = next;
      }
    });
  }, { threshold: [0.6] });
  sectionNodes.forEach(n => io.observe(n));
  window.addEventListener('resize', resize);

  // Audio graph (pad + air), with reliable mute/unmute
  const audio = { ctx:null, master:null, filter:null, drones:[], noise:null, sfx:null, running:false, muted:true };
  const LS_ENTERED = 'kv_entered';
  const LS_SOUND = 'kv_sound';
  function createNoiseBuffer(ctx){
    const len = 2 * ctx.sampleRate; const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0);
    for(let i=0;i<len;i++){ d[i] = (Math.random()*2-1) * 0.6; } return b;
  }
  function buildAudio(){
    if(audio.running) return;
    audio.ctx = audio.ctx || new (window.AudioContext || window.webkitAudioContext)();
    const A = audio.ctx;
    audio.master = A.createGain(); audio.master.gain.value = 0.0; audio.master.connect(A.destination);
    audio.sfx = A.createGain(); audio.sfx.gain.value = 0.0; audio.sfx.connect(audio.master);
    audio.filter = A.createBiquadFilter(); audio.filter.type='lowpass'; audio.filter.frequency.value=900; audio.filter.connect(audio.master);
    const partials = [110, 110*2.01, 110*2.98, 110*4.03];
    audio.drones = partials.map((f,i)=>{ const o=A.createOscillator(); o.type=i%2?'sine':'triangle'; o.frequency.value=f; const g=A.createGain(); g.gain.value=0.03+i*0.012; o.connect(g).connect(audio.filter); o.start(); return {o,g}; });
    const lfo=A.createOscillator(); lfo.frequency.value=0.05; const lg=A.createGain(); lg.gain.value=600; lfo.connect(lg).connect(audio.filter.frequency); lfo.start();
    const noise=A.createBufferSource(); noise.buffer=createNoiseBuffer(A); noise.loop=true; const nf=A.createBiquadFilter(); nf.type='bandpass'; nf.frequency.value=2000; nf.Q.value=0.9; const ng=A.createGain(); ng.gain.value=0.03; noise.connect(nf).connect(ng).connect(audio.master); noise.start(); audio.noise=ng;
    audio.running = true;
  }
  function playWhoosh(){
    if(!audio.ctx) return; const A=audio.ctx; const now=A.currentTime;
    const src=A.createBufferSource(); src.buffer=createNoiseBuffer(A); src.loop=false;
    const bp=A.createBiquadFilter(); bp.type='bandpass'; bp.frequency.setValueAtTime(1800, now); bp.Q.value=0.6; bp.frequency.exponentialRampToValueAtTime(400, now+0.5);
    const g=A.createGain(); g.gain.setValueAtTime(0.0, now); g.gain.linearRampToValueAtTime(0.22, now+0.08); g.gain.exponentialRampToValueAtTime(0.001, now+0.65);
    src.connect(bp).connect(g).connect(audio.sfx);
    src.start();
  }
  function setMuted(m){
    audio.muted = m;
    if(!audio.ctx) return;
    if(audio.ctx.state === 'suspended') audio.ctx.resume();
    const now = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    if(m){
      audio.master.gain.linearRampToValueAtTime(0.0, now + 0.25);
    } else {
      audio.master.gain.linearRampToValueAtTime(0.35, now + 0.6);
    }
  }

  // Controls
  function enter(){
    if(gate) gate.setAttribute('aria-hidden','true');
    startAnim();
    document.body && document.body.classList.add('ui-reveal');
    try{ localStorage.setItem(LS_ENTERED, '1'); }catch(e){}
    if(!reduceMotion){
      buildAudio(); setMuted(false);
      if(soundToggle){ soundToggle.dataset.state='on'; soundToggle.setAttribute('aria-pressed','true'); }
      try{ localStorage.setItem(LS_SOUND, 'on'); }catch(e){}
      playWhoosh();
    }
  }
  function toggleSound(){
    if(!audio.running){ buildAudio(); setMuted(false); soundToggle.dataset.state='on'; return; }
    const willMute = soundToggle.dataset.state !== 'off' && soundToggle.dataset.state === 'on';
    if(willMute){ setMuted(true); soundToggle.dataset.state='off'; soundToggle.setAttribute('aria-pressed','false'); }
    else { setMuted(false); soundToggle.dataset.state='on'; soundToggle.setAttribute('aria-pressed','true'); }
    try{ localStorage.setItem(LS_SOUND, soundToggle.dataset.state); }catch(e){}
  }

  if(gateBtn) gateBtn.addEventListener('click', enter);
  if(gate) gate.addEventListener('click', (e) => { if(e.target === gate) enter(); });
  if(soundToggle) soundToggle.addEventListener('click', toggleSound);

  // Start
  function startAnim(){ cancelAnimationFrame(rafId); resize(); last=performance.now(); rafId=requestAnimationFrame(loop); }
  // If user already entered once, do not show the gate again on home
  const enteredBefore = (()=>{ try{ return localStorage.getItem(LS_ENTERED) === '1'; }catch(e){ return false; } })();
  const savedSound = (()=>{ try{ return localStorage.getItem(LS_SOUND) || 'off'; }catch(e){ return 'off'; } })();
  if(document.body && document.body.classList.contains('home')){
    if(enteredBefore && gate){ gate.setAttribute('aria-hidden','true'); document.body.classList.add('ui-reveal'); }
  }
  // Initialize toggle state from storage
  if(soundToggle){ soundToggle.dataset.state = savedSound; soundToggle.setAttribute('aria-pressed', savedSound === 'on' ? 'true' : 'false'); }
  // If motion reduced, skip canvas anim
  if(reduceMotion){ if(gate) gate.setAttribute('aria-hidden','true'); document.body && document.body.classList.add('ui-reveal'); }
  // Attempt to resume audio if previously on; attach a one-time user-gesture fallback
  function resumeIfAllowed(){ if(savedSound === 'on'){ buildAudio(); setMuted(false); } cleanupGesture(); }
  function cleanupGesture(){
    ['pointerdown','keydown','wheel','touchstart','click'].forEach(t=>window.removeEventListener(t, resumeIfAllowed, true));
  }
  if(savedSound === 'on'){
    ['pointerdown','keydown','wheel','touchstart','click'].forEach(t=>window.addEventListener(t, resumeIfAllowed, true));
  }
  startAnim();
})();
