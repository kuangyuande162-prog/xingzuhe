/* Visual interactions progressively enhance an otherwise fully usable page. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const heroImage = hero.querySelector('img');
  const slides = [
    {id:'006', brand:'TCL / SPATIAL VISUAL', title:'在光影之间，构建生活的想象。', alt:'湖畔现代建筑与厨房空间的三维场景',position:'center 56%'},
    {id:'050', brand:'VIOMI / SURREAL SCENE', title:'在现实之外，探索产品的另一面。', alt:'云米冰箱置于山水雾气之中的超现实场景',position:'center'},
    {id:'078', brand:'BKT / PRODUCT VISUAL', title:'把舒适，带进每一个日常。', alt:'窗边暖光照耀下的粉色人体工学坐姿椅',position:'center 60%'}
  ];
  let active = 0;
  let token = 0;
  const caption = hero.querySelector('figcaption>span');
  const index = hero.querySelector('.hero-index');
  hero.setAttribute('role','region');
  hero.setAttribute('aria-label','精选视觉画廊，左右轻扫或使用切换按钮浏览');
  const controls = document.createElement('div');
  controls.className = 'hero-controls';
  const hint = document.createElement('span'); hint.className='drag-hint'; hint.textContent='DRAG TO EXPLORE / 拖动探索'; controls.append(hint);
  slides.forEach((slide, i) => {
    const button = document.createElement('button'); button.textContent=String(i+1).padStart(2,'0');
    button.setAttribute('aria-label',`查看画面 ${i+1}：${slide.brand}`);
    button.setAttribute('aria-pressed',String(i===0));
    button.addEventListener('click',()=>show(i)); controls.append(button);
  });
  hero.append(controls);
  function show(next) {
    active=(next+slides.length)%slides.length;
    const slide=slides[active]; const ownToken=++token;
    const pending=new Image(); pending.src=`assets/images/${slide.id}.jpg`;
    hero.classList.add('switching');
    const update=()=>{
      if(ownToken!==token)return;
      heroImage.src=pending.src; heroImage.alt=slide.alt; heroImage.style.objectPosition=slide.position;
      caption.replaceChildren(); const small=document.createElement('small'); small.textContent=slide.brand;
      caption.append(small,document.createTextNode(slide.title));
      index.textContent=`0${active+1} — 03`;
      controls.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(active===i)));
      hero.classList.remove('switching');
    };
    if(pending.complete)update(); else {pending.onload=update;pending.onerror=()=>hero.classList.remove('switching');}
  }
  index.textContent='01 — 03';
  let start=null;
  hero.style.touchAction='pan-y';
  heroImage.draggable=false;
  hero.addEventListener('pointerdown',event=>{
    if(event.target.closest('a,button') || event.button!==0)return;
    start={x:event.clientX,y:event.clientY}; hero.setPointerCapture(event.pointerId);hero.classList.add('dragging');
  });
  hero.addEventListener('pointerup',event=>{
    if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))show(active+(dx<0?1:-1));
    start=null;hero.classList.remove('dragging');
  });
  hero.addEventListener('pointercancel',()=>{start=null;hero.classList.remove('dragging');});
  const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
  let scrollPending=false;
  const onScroll=()=>{
    if(scrollPending)return;scrollPending=true;
    requestAnimationFrame(()=>{
      const max=document.documentElement.scrollHeight-innerHeight;
      progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;
      if(!reduced.matches&&fine.matches){const bounds=hero.getBoundingClientRect();
        if(bounds.bottom>0&&bounds.top<innerHeight)heroImage.style.transform=`scale(1.04) translateY(${Math.max(-15,Math.min(15,(innerHeight/2-bounds.top-bounds.height/2)*.035))}px)`;
      }scrollPending=false;
    });
  };addEventListener('scroll',onScroll,{passive:true});onScroll();
  if(!reduced.matches&&'IntersectionObserver'in window){
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');reveal.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll('.section-top,.section-heading,.project-card,.motion-heading,.motion-card,.about-layout,.contact-cta').forEach(el=>{el.classList.add('reveal');reveal.observe(el);});
  }
  const cursor=document.createElement('div');cursor.className='visual-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
  let mouseX=0,mouseY=0,cursorFrame=false;
  document.addEventListener('pointermove',event=>{
    if(!fine.matches||reduced.matches)return;
    mouseX=event.clientX;mouseY=event.clientY;
    const target=event.target.closest('.project-cover,.motion-cover,.hero');
    const enabled=target&&!event.target.closest('.hero-controls button,a.hero-open')&&!document.querySelector('dialog[open]');
    cursor.classList.toggle('visible',!!enabled);
    if(enabled)cursor.textContent=target===hero?'← 拖动 →':target.classList.contains('motion-cover')?'播放 ↗':'查看 ↗';
    if(!cursorFrame){cursorFrame=true;requestAnimationFrame(()=>{cursor.style.transform=`translate3d(${mouseX}px,${mouseY}px,0)`;cursorFrame=false;});}
  },{passive:true});
  document.addEventListener('pointerleave',()=>cursor.classList.remove('visible'));
  document.getElementById('viewer').addEventListener('close',()=>cursor.classList.remove('visible'));
  document.querySelectorAll('.project-card').forEach(card=>{
    const cover=card.querySelector('.project-cover');
    card.addEventListener('pointermove',event=>{if(!fine.matches||reduced.matches)return;const rect=cover.getBoundingClientRect();
      cover.style.setProperty('--rx',`${-(event.clientY-rect.top-rect.height/2)/rect.height*3}deg`);
      cover.style.setProperty('--ry',`${(event.clientX-rect.left-rect.width/2)/rect.width*3}deg`);
    });card.addEventListener('pointerleave',()=>{cover.style.setProperty('--rx','0deg');cover.style.setProperty('--ry','0deg');});
  });
  const mobile=document.createElement('nav');mobile.className='mobile-nav';mobile.setAttribute('aria-label','手机快捷导航');
  [['work','作品'],['motion','影像'],['about','关于'],['contact','联系']].forEach(([id,text])=>{const a=document.createElement('a');a.href=`#${id}`;a.textContent=text;mobile.append(a);});
  document.body.append(mobile);
  const sections=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){mobile.querySelectorAll('a').forEach(link=>{const current=link.hash===`#${entry.target.id}`;link.classList.toggle('active',current);if(current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}),{rootMargin:'-15% 0px -45% 0px'});
  document.querySelectorAll('#work,#motion,#about,#contact').forEach(el=>sections.observe(el));
})();
