/* client.js — fælles hjælpere til alle tre roller (socket, DOM, format, motiver). */
(function () {
  const socket = io({ transports: ['websocket', 'polling'] });

  // Promisificeret emit med ack.
  function emit(event, payload) {
    return new Promise((resolve) => socket.emit(event, payload || {}, (res) => resolve(res || { ok: true })));
  }

  const API = {
    socket,
    emit,
    onState(cb) { socket.on('state', cb); },
    on(ev, cb) { socket.on(ev, cb); },
    join(role, opts) { return emit('join', Object.assign({ role }, opts || {})); },
    money(n) { return (Math.round(n) || 0).toLocaleString('da-DK'); },
    sd(n) { return API.money(n) + ' SD'; },
    save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  // DOM builder: el('div.klasse', {attrs}, [children|text])
  function el(sel, attrs, children) {
    const parts = sel.split(/(?=[.#])/);
    const tag = parts[0].match(/^[a-z0-9]+/i) ? parts[0].replace(/[.#].*/, '') : 'div';
    const node = document.createElement(tag || 'div');
    parts.forEach((p) => { if (p[0] === '.') node.classList.add(p.slice(1)); if (p[0] === '#') node.id = p.slice(1); });
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'onclick') node.addEventListener('click', v);
      else if (k === 'oninput') node.addEventListener('input', v);
      else if (k === 'onchange') node.addEventListener('change', v);
      else if (k === 'style') node.setAttribute('style', v);
      else if (v != null) node.setAttribute(k, v);
    }
    if (children != null) {
      const arr = Array.isArray(children) ? children : [children];
      arr.forEach((c) => { if (c == null) return; node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    }
    return node;
  }
  API.el = el;
  API.clear = (n) => { while (n.firstChild) n.removeChild(n.firstChild); };

  function toast(msg, kind) {
    let box = document.getElementById('toasts');
    if (!box) { box = el('div#toasts'); document.body.appendChild(box); }
    const t = el('div.toast' + (kind ? '.' + kind : ''), { text: msg });
    box.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2600);
  }
  API.toast = toast;
  API.check = (res) => { if (res && res.ok === false) toast(res.error || 'Der skete en fejl.', 'err'); return res; };

  API.motif = {
    compass: (fill) => `<svg viewBox="0 0 64 64" width="100%" height="100%"><circle cx="32" cy="32" r="30" fill="${fill || '#C9A227'}"/><path d="M32 12 L38 30 L32 52 L26 30 Z" fill="#FAF6EA"/><circle cx="32" cy="32" r="3" fill="#1F3E63"/></svg>`,
    horse: (fill) => `<svg viewBox="0 0 64 64" width="100%" height="100%"><path fill="${fill || '#1F3E63'}" d="M20 54 L22 34 C16 32 12 26 14 18 C18 22 22 22 26 20 C28 12 36 8 44 12 C42 14 42 16 44 18 L52 20 C50 26 44 30 38 30 L40 54 L34 54 L32 38 L30 54 Z"/></svg>`,
  };

  API.countdown = (endsAt) => {
    if (!endsAt) return '';
    const s = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };

  window.TG = API;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
})();
