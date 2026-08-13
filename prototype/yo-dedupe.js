/* yo-skill 重复项演示状态：合并/忽略选择持久化（localStorage yo-dedupe）。
   重复项页（dedupe.html）与主屏提醒条（index.html [data-dupe-notice]）共用同一份组注册表，
   两边数字实时一致；设置页"清除全部数据"复位本状态。 */
(function () {
  var KEY = 'yo-dedupe';

  /* 组注册表：演示数据的唯一真相源。pending = 待处理时的副标题；done = 各处理结果对应的完成文案。 */
  var GROUPS = [
    {
      id: 'xhs-copy',
      pending: '同一个 Skill，装了 2 份',
      done: {
        'merged': '已合并成一份 · 一处更新、2 个助手同时生效',
        'dismissed': '已保持现状，不再提醒'
      }
    },
    {
      id: 'translate-pair',
      pending: '两个 Skill 很像，可能只需要留一个',
      done: {
        'kept-a': '已留「中英互译润色」，另一个已移除',
        'kept-b': '已留「翻译小帮手」，另一个已移除',
        'kept-both': '已保持两个都留'
      }
    }
  ];

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function write(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }
  function byId(id) {
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].id === id) return GROUPS[i];
    return null;
  }

  window.yoDupe = {
    groups: GROUPS,
    state: read,
    unresolvedCount: function () {
      var s = read();
      return GROUPS.filter(function (g) { return !s[g.id]; }).length;
    },
    resolve: function (id, action) { var s = read(); s[id] = action; write(s); },
    undo: function (id) { var s = read(); delete s[id]; write(s); },
    onChange: function (fn) {
      window.addEventListener('storage', function (e) { if (e.key === KEY) fn(); });
    }
  };

  /* ---- dedupe.html：每组按状态渲染 待处理 ↔ 已处理（含撤销，方便演示来回切换） ---- */
  var FLAG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  function renderGroup(el, def) {
    var action = window.yoDupe.state()[def.id];
    var head = el.querySelector('.dupe-head');
    var instances = el.querySelector('.dupe-instances');
    var actions = el.querySelector('.dupe-actions');
    var countEl = el.querySelector('.dupe-count');
    head.querySelectorAll('.resolved-flag, [data-undo]').forEach(function (n) { n.remove(); });

    if (action) {
      el.classList.add('resolved');
      if (instances) instances.style.display = 'none';
      if (actions) actions.style.display = 'none';
      head.style.marginBottom = '0';
      countEl.textContent = def.done[action] || '已处理';
      var flag = document.createElement('span');
      flag.className = 'resolved-flag';
      flag.style.marginLeft = 'auto';
      flag.innerHTML = FLAG_SVG + '已处理';
      var undo = document.createElement('button');
      undo.className = 'btn btn-ghost btn-sm';
      undo.setAttribute('data-undo', '');
      undo.textContent = '撤销';
      undo.addEventListener('click', function () {
        window.yoDupe.undo(def.id);
        renderGroup(el, def);
      });
      head.appendChild(flag);
      head.appendChild(undo);
    } else {
      el.classList.remove('resolved');
      if (instances) instances.style.display = '';
      if (actions) actions.style.display = '';
      head.style.marginBottom = '';
      countEl.textContent = def.pending;
    }
  }

  function initPage() {
    document.querySelectorAll('.dupe-group[data-dupe]').forEach(function (el) {
      var def = byId(el.getAttribute('data-dupe'));
      if (!def) return;
      renderGroup(el, def);
      el.querySelectorAll('[data-act]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          window.yoDupe.resolve(def.id, btn.getAttribute('data-act'));
          renderGroup(el, def);
        });
      });
    });
  }

  /* ---- index.html：提醒条数字 = 未处理组数；全部处理完则整条隐藏（没重复项就不打扰） ---- */
  function initNotice() {
    var notice = document.querySelector('[data-dupe-notice]');
    if (!notice) return;
    function refresh() {
      var n = window.yoDupe.unresolvedCount();
      var num = notice.querySelector('[data-dupe-num]');
      if (num) num.textContent = n;
      notice.style.display = n > 0 ? '' : 'none';
    }
    refresh();
    window.yoDupe.onChange(refresh);
  }

  function init() { initPage(); initNotice(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
