(function () {
  'use strict';
  document.getElementById('year').textContent = String(new Date().getFullYear());
  const id = new URLSearchParams(window.location.search).get('id');
  const games = Array.isArray(window.TIN_HOC_GAMES) ? window.TIN_HOC_GAMES : [];
  const game = games.find(g => g.id === id);
  const frame = document.getElementById('game-frame');
  const error = document.getElementById('game-error');
  const reload = document.getElementById('reload-game');
  const expand = document.getElementById('expand-game');
  if (!game || !/^games\/[a-zA-Z0-9_./-]+\.html$/.test(game.path) || game.path.includes('..')) {
    document.getElementById('play-title').textContent = 'Không tìm thấy trò chơi';
    document.getElementById('breadcrumb-current').textContent = 'Không tìm thấy';
    document.getElementById('play-description').textContent = 'Hãy quay lại thư viện và chọn một trò chơi khác.';
    document.getElementById('game-box').classList.add('has-error');
    error.hidden = false; reload.hidden = true; expand.hidden = true;
    return;
  }
  const lesson = `Bài ${game.lessonCode}: ${game.lessonTitle}`;
  document.title = `${lesson} · ${game.gameTitle || game.title} | Tin Học Thầy Trung`;
  document.getElementById('play-title').textContent = game.gameTitle || game.title;
  document.getElementById('play-curriculum').textContent = lesson;
  document.getElementById('play-description').textContent = `Chủ đề ${game.themeNumber}. ${game.themeTitle}`;
  document.getElementById('play-grade').textContent = `TIN HỌC LỚP ${game.grade} · KẾT NỐI TRI THỨC`;
  document.getElementById('breadcrumb-current').textContent = `Lớp ${game.grade} · Bài ${game.lessonCode}`;
  frame.title = `Trò chơi ${game.gameTitle || game.title}, ${lesson}, lớp ${game.grade}`;
  frame.src = game.path;
  frame.hidden = false;
  reload.addEventListener('click', () => { frame.src = game.path; });
  expand.addEventListener('click', () => {
    const target = document.getElementById('game-box');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (target.requestFullscreen) target.requestFullscreen().catch(() => {});
  });
}());
