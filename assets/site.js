(function () {
  'use strict';
  const all = Array.isArray(window.TIN_HOC_GAMES) ? window.TIN_HOC_GAMES : [];
  const curriculum = Array.isArray(window.TIN_HOC_CURRICULUM) ? window.TIN_HOC_CURRICULUM : [];
  const themes = [...new Map(curriculum.map(e => [e.themeNumber, e.themeTitle])).entries()].sort((a,b)=>a[0]-b[0]);
  const byLesson = new Map();
  all.forEach(game => {
    const key = `${game.grade}-${game.lessonCode}`;
    if (!byLesson.has(key)) byLesson.set(key, []);
    byLesson.get(key).push(game);
  });
  const list = document.getElementById('game-list');
  const empty = document.getElementById('no-results');
  const search = document.getElementById('game-search');
  const counter = document.getElementById('game-count');
  const filters = [...document.querySelectorAll('[data-filter-grade]')];
  const catalogTabs = [...document.querySelectorAll('[data-catalog-grade]')];
  const themeSelect = document.getElementById('theme-filter');
  const lessonSelect = document.getElementById('lesson-filter');
  const catalogList = document.getElementById('curriculum-list');
  let grade = 'all';
  let catalogGrade = 3;
  document.getElementById('year').textContent = String(new Date().getFullYear());

  function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
  }
  function el(tag, cls, value) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = String(value);
    return node;
  }
  function lessonName(g) { return `Bài ${g.lessonCode}: ${g.lessonTitle}`; }
  function gameCard(game) {
    const card = el('article', 'game-card');
    const cover = el('div', `game-cover cover-${game.accent || 'violet'}${game.thumbnail ? ' has-thumb' : ''}`);
    if (game.thumbnail) {
      const img = el('img', 'cover-thumb');
      img.src = game.thumbnail;
      img.alt = `Thumbnail Bài ${game.lessonCode}: ${game.lessonTitle}`;
      img.loading = 'lazy';
      cover.append(img);
    } else {
      const icon = el('span', 'cover-icon', game.icon || '🎮');
      icon.setAttribute('aria-hidden','true');
      cover.append(icon);
    }
    const chip = el('span', 'cover-grade', `LỚP ${game.grade} · BÀI ${game.lessonCode}`);
    cover.append(chip);
    const body = el('div', 'game-content');
    const eyebrow = el('div', 'game-topic', `CHỦ ĐỀ ${game.themeNumber} · ${game.themeTitle}`);
    const title = el('h3', 'lesson-heading', lessonName(game));
    const sub = el('p', 'game-original-title');
    sub.append(el('span', 'game-format-label', '🎮 Trò chơi: '),document.createTextNode(game.gameTitle || game.title));
    const meta = el('div', 'game-meta');
    meta.append(el('span', '', `📚 Tin học ${game.grade}`), el('span', '', game.gameNumber ? `🎯 Trò chơi ${game.gameNumber}` : '🎯 Ôn tập'));
    const footer = el('div', 'game-bottom');
    footer.append(el('span', 'demo-chip', `Bài ${game.lessonCode}`));
    const link = el('a', 'game-play', 'Chơi ngay →');
    link.href = `choi.html?id=${encodeURIComponent(game.id)}`;
    link.setAttribute('aria-label', `Chơi ${game.gameTitle || game.title}, ${lessonName(game)}, lớp ${game.grade}`);
    footer.append(link);
    body.append(eyebrow,title,sub,meta,footer);
    card.append(cover,body);
    return card;
  }
  function updateThemeOptions() {
    const old = themeSelect.value;
    const possible = new Set(curriculum.filter(e=>grade==='all'||String(e.grade)===grade).map(e=>String(e.themeNumber)));
    themeSelect.replaceChildren(new Option('Tất cả chủ đề','all'), ...themes.filter(([n])=>possible.has(String(n))).map(([n,t])=>new Option(`Chủ đề ${n}: ${t}`,String(n))));
    themeSelect.value = possible.has(old) ? old : 'all';
  }
  function updateLessonOptions() {
    const old = lessonSelect.value;
    const available = curriculum.filter(e=>(grade==='all'||String(e.grade)===grade) && (themeSelect.value==='all'||String(e.themeNumber)===themeSelect.value));
    if (grade==='all') {
      lessonSelect.replaceChildren(new Option('Chọn lớp để chọn bài','all'));
      lessonSelect.disabled = true;
      return;
    }
    lessonSelect.disabled = false;
    lessonSelect.replaceChildren(new Option('Tất cả bài','all'), ...available.map(e=>new Option(`Bài ${e.lessonCode} – ${e.lessonTitle}`,e.lessonCode)));
    lessonSelect.value = available.some(e=>e.lessonCode===old) ? old : 'all';
  }
  function renderGames() {
    const q = normalize(search.value);
    const matched = all.filter(game =>
      (grade==='all'||String(game.grade)===grade) &&
      (themeSelect.value==='all'||String(game.themeNumber)===themeSelect.value) &&
      (lessonSelect.value==='all'||game.lessonCode===lessonSelect.value) &&
      normalize([game.gameTitle,game.title,game.lessonTitle,game.topic,game.themeTitle,`bai ${game.lessonCode}`,`lop ${game.grade}`].join(' ')).includes(q));
    list.replaceChildren(...matched.map(gameCard));
    empty.hidden = matched.length>0;
    counter.textContent = `${matched.length} / ${all.length} trò chơi`;
    filters.forEach(button=>{
      const active=button.dataset.filterGrade===grade;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
  }
  function setGrade(nextGrade) {
    grade = String(nextGrade);
    themeSelect.value='all';
    updateThemeOptions();
    updateLessonOptions();
    renderGames();
  }
  filters.forEach(button=>button.addEventListener('click',()=>setGrade(button.dataset.filterGrade)));
  themeSelect.addEventListener('change',()=>{updateLessonOptions();renderGames();});
  lessonSelect.addEventListener('change',renderGames);
  search.addEventListener('input',renderGames);
  document.querySelectorAll('[data-choose-grade]').forEach(button=>button.addEventListener('click',()=>{
    setGrade(button.dataset.chooseGrade);
    search.value='';
    setCatalogGrade(Number(button.dataset.chooseGrade));
    renderGames();
    document.getElementById('tro-choi').scrollIntoView({behavior:'smooth',block:'start'});
  }));
  document.getElementById('reset-filters').addEventListener('click',()=>{
    search.value='';setGrade('all');
  });

  function openLesson(item) {
    setGrade(item.grade);
    search.value='';
    themeSelect.value=String(item.themeNumber);
    updateLessonOptions();
    lessonSelect.value=item.lessonCode;
    renderGames();
    document.getElementById('tro-choi').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function setCatalogGrade(nextGrade) {
    catalogGrade=Number(nextGrade);
    catalogTabs.forEach(b=>{
      const active=Number(b.dataset.catalogGrade)===catalogGrade;
      b.classList.toggle('active',active);
      b.setAttribute('aria-pressed',String(active));
    });
    const group=curriculum.filter(e=>e.grade===catalogGrade);
    const completed=group.filter(e=>byLesson.has(`${e.grade}-${e.lessonCode}`));
    document.getElementById('curriculum-help').textContent=`${completed.length}/${group.length} bài đã có trò chơi`;
    document.getElementById('curriculum-status').textContent=`Lớp ${catalogGrade} · ${group.length} mục bài`;
    catalogList.replaceChildren();
    themes.forEach(([themeNum,themeTitle])=>{
      const lessons=group.filter(e=>e.themeNumber===themeNum);
      if(!lessons.length)return;
      const section=el('section','curriculum-theme');
      const header=el('div','curriculum-theme-header');
      const number=el('span','theme-number',String(themeNum));
      const label=el('h3','',`Chủ đề ${themeNum}. ${themeTitle}`);
      const qty=el('span','theme-quantity',`${lessons.length} mục bài`);
      header.append(number,label,qty);
      const rows=el('div','curriculum-rows');
      lessons.forEach(item=>{
        const key=`${item.grade}-${item.lessonCode}`;
        const count=byLesson.get(key)?.length || 0;
        const row=el('div','curriculum-row'+(count?'':' curriculum-row-missing'));
        if (item.thumbnail) {
          const preview = el('img','curriculum-thumb');
          preview.src = item.thumbnail;
          preview.loading = 'lazy';
          preview.decoding = 'async';
          preview.alt = `Minh họa Tin học lớp ${item.grade}, Bài ${item.lessonCode}: ${item.lessonTitle}`;
          row.append(preview);
        }
        const code=el('span','curriculum-code',`Bài ${item.lessonCode}`);
        const name=el('span','curriculum-lesson',item.lessonTitle);
        row.append(code,name);
        if (count) {
          const btn=el('button','curriculum-open',count===1?'Chơi ngay →':`${count} trò chơi →`);
          btn.type='button';
          btn.setAttribute('aria-label',`Xem trò chơi Bài ${item.lessonCode}: ${item.lessonTitle}, lớp ${item.grade}`);
          btn.addEventListener('click',()=>openLesson(item));
          row.append(btn);
        } else {
          row.append(el('span','curriculum-unavailable','Chưa có trò chơi'));
        }
        rows.append(row);
      });
      section.append(header,rows);
      catalogList.append(section);
    });
  }
  catalogTabs.forEach(btn=>btn.addEventListener('click',()=>setCatalogGrade(btn.dataset.catalogGrade)));
  updateThemeOptions();
  updateLessonOptions();
  renderGames();
  setCatalogGrade(3);
}());
