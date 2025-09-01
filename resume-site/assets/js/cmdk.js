// Minimal Command Palette (Cmd/Ctrl+K)
(function(){
  function create(){
    const overlay = document.createElement('div');
    overlay.className = 'cmdk-overlay';
    overlay.innerHTML = `
      <div class="cmdk" role="dialog" aria-modal="true" aria-label="Command Palette">
        <div class="bar">
          <input type="text" placeholder="Type a command or search..." aria-label="Command input" />
          <span class="hint"><span class="kbd">Esc</span> to close</span>
        </div>
        <div class="list"></div>
      </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }
  const overlay = create();
  const input = overlay.querySelector('input');
  const list = overlay.querySelector('.list');

  function openContactMenu(){
    const menu = document.querySelector('.contact-menu');
    if(!menu) return;
    const header = document.querySelector('.topnav');
    if(header) header.scrollIntoView({behavior:'smooth', block:'start'});
    menu.classList.add('open');
    const btn = menu.querySelector('.contact-toggle');
    if(btn) btn.setAttribute('aria-expanded','true');
    if(btn) btn.focus();
  }

  const items = [
    {label: 'Go to Home', action: () => location.href = 'index.html', kbd: 'G H'},
    {label: 'Go to Work', action: () => location.href = 'projects.html', kbd: 'G W'},
    {label: 'Go to Certifications', action: () => location.href = 'certifications.html', kbd: 'G C'},
    {label: 'Contact links', action: () => { setTimeout(openContactMenu, 0); }, kbd: 'O C'},
    // Known cross-page items so searches like "aquabean" work from any page
    {label: 'Open project: AquaBean', action: () => { location.href = 'projects.html#work-aquabean'; }, kbd: ''},
    {label: 'Open project: AWS Cloud Resume', action: () => { location.href = 'projects.html#work-aws-resume'; }, kbd: ''},
    {label: 'Open project: Hormone Therapy Site', action: () => { location.href = 'projects.html#work-hormone'; }, kbd: ''},
    {label: 'Jump to: Focus & Experience', action: () => { location.href = 'projects.html#focus'; }, kbd: ''},
    // search anchors and headings across the page
    ...Array.from(document.querySelectorAll('a, .title, h1, h2, h3, h4, h5'))
      .map(el => {
        const text = (el.textContent||'').trim();
        if(!text) return null;
        const tag = el.tagName.toLowerCase();
        if(tag === 'a'){
          const href = el.getAttribute('href') || '';
          const label = `Go to: ${text}`.substring(0,120);
          const action = () => {
            // internal anchors vs page links
            if(href.startsWith('#')){
              const target = document.querySelector(href);
              if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
            } else if(href){
              location.href = href;
            }
          };
          return { label, action, kbd: '' };
        }
        const label = `Jump to: ${text}`.substring(0,120);
        const action = () => { el.scrollIntoView({behavior:'smooth', block:'center'}); };
        return { label, action, kbd: '' };
      })
      .filter(Boolean)
  ];

  function render(filter){
    const term = (filter||'').trim().toLowerCase();
    list.innerHTML = '';
    if(!term){
      // No default suggestions; show only the input bar
      return;
    }
    items.filter(i => i.label.toLowerCase().includes(term)).slice(0, 30).forEach(i => {
      const el = document.createElement('div');
      el.className = 'item'; el.tabIndex = 0;
      el.innerHTML = `<span>${i.label}</span><span class="kbd">${i.kbd}</span>`;
      el.addEventListener('click', () => { close(); i.action(); });
      el.addEventListener('keydown', e => { if(e.key==='Enter'){ close(); i.action(); }});
      list.appendChild(el);
    });
  }
  render('');

  function open(){ overlay.classList.add('open'); input.value=''; render(''); input.focus(); document.body.classList.add('cmdk-open'); }
  function close(){ overlay.classList.remove('open'); document.body.classList.remove('cmdk-open'); }
  overlay.addEventListener('click', e => { if(e.target === overlay) close(); });
  window.addEventListener('keydown', e => { if(e.key === 'Escape' && overlay.classList.contains('open')) close(); });

  function onKShortcut(e){
    const isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
    if((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase()==='k'){
      e.preventDefault(); overlay.classList.contains('open') ? close() : open();
    }
  }
  window.addEventListener('keydown', onKShortcut);
  input.addEventListener('input', e => render(e.target.value));
  window.openCommandPalette = open;
  // switch the displayed OS key symbol
  try{
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    document.querySelectorAll('.os-key').forEach(el => el.textContent = isMac ? '⌘' : 'Ctrl');
  }catch(_){/* no-op */}

  // Cyber toggle helper
  // remove legacy toggleCyber exposure
})();


