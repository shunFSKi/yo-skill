/* yo-skill 浅/深模式切换：URL ?mode= 参数（截图/演示用）> localStorage 记忆 > 跟随系统 */
(function () {
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem('yo-mode'); } catch (e) {}
  var param = null;
  try { param = new URLSearchParams(location.search).get('mode'); } catch (e) {}
  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var mode = param || stored || (systemDark ? 'dark' : 'light');
  root.setAttribute('data-mode', mode);
  window.yoToggleMode = function () {
    mode = mode === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-mode', mode);
    try { localStorage.setItem('yo-mode', mode); } catch (e) {}
  };
  /* 三选一设置（设置页"外观"用）：light / dark / system（system = 清除记忆、跟随系统） */
  window.yoSetMode = function (m) {
    if (m === 'system') {
      try { localStorage.removeItem('yo-mode'); } catch (e) {}
      mode = systemDark ? 'dark' : 'light';
    } else {
      mode = m === 'dark' ? 'dark' : 'light';
      try { localStorage.setItem('yo-mode', mode); } catch (e) {}
    }
    root.setAttribute('data-mode', mode);
  };
})();

/* 内容识别色层：Skill/MCP 图标按名称哈希固定分配 8 色（同名条目在任何助手、任何页面同色）。
   与功能语义色分层——翡翠/琥珀/红仍只表达"可点/提醒/危险"，图标色只是识别色，不含语义。 */
(function () {
  var TONES = ['tone-mint', 'tone-blue', 'tone-iris', 'tone-purple', 'tone-tomato', 'tone-orange', 'tone-teal', 'tone-ink'];
  function paint() {
    document.querySelectorAll('.card-icon').forEach(function (icon) {
      var host = icon.parentElement;
      var nameEl = host && host.querySelector('.list-name, .card-name, .dupe-title');
      if (!nameEl) return;
      var name = nameEl.textContent.trim();
      var h = 0;
      for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
      icon.classList.remove('tone-mint', 'tone-ink', 'tone-orange');
      icon.classList.add(TONES[h % TONES.length]);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
  window.yoPaintIcons = paint; /* 动态生成的列表（如主屏新助手演示面板）插入 DOM 后可手动补着色 */
})();
