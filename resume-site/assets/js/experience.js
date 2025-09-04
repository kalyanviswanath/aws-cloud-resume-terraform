// cleaned: removed duplicate/legacy ambient + audio block to avoid conflicts

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

  // (Audio removed)

  // Controls
  function enter(){
    if(gate) gate.setAttribute('aria-hidden','true');
    startAnim();
    document.body && document.body.classList.add('ui-reveal');
    try{ localStorage.setItem('kv_entered', '1'); }catch(e){}
  }

  if(gateBtn) gateBtn.addEventListener('click', enter);
  if(gate) gate.addEventListener('click', (e) => { if(e.target === gate) enter(); });
  // no sound toggle

  // Start
  function startAnim(){ cancelAnimationFrame(rafId); resize(); last=performance.now(); rafId=requestAnimationFrame(loop); }
  // If user already entered once, do not show the gate again on home
  const enteredBefore = (()=>{ try{ return localStorage.getItem('kv_entered') === '1'; }catch(e){ return false; } })();
  if(document.body && document.body.classList.contains('home')){
    if(enteredBefore && gate){ gate.setAttribute('aria-hidden','true'); document.body.classList.add('ui-reveal'); }
  }
  // If motion reduced, skip canvas anim
  if(reduceMotion){ if(gate) gate.setAttribute('aria-hidden','true'); document.body && document.body.classList.add('ui-reveal'); }
  startAnim();
})();
