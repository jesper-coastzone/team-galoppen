/* screen.js — den indbyggede præsentation. Renderer den aktuelle slide styret af host. */
(function () {
  const { el, clear, sd, money } = TG;
  const root = document.getElementById('root');
  let S = null; const base = location.origin;

  // join
  const q = new URLSearchParams(location.search);
  const code = q.get('code') || TG.load('tg_screen_code');
  if (code) TG.join('screen', { code: code.toUpperCase() }).then((r) => { if (r.ok) TG.save('tg_screen_code', r.code); else askCode(); });
  else askCode();

  function askCode() {
    clear(root);
    const w = el('div.stage'); const c = el('div.content.center');
    c.appendChild(el('div.eyebrow', { text: 'Storskærm' }));
    c.appendChild(el('h1', { text: 'Indtast spilkode' }));
    const inp = el('input', { type: 'text', style: 'max-width:400px;text-align:center;font-size:2vw;letter-spacing:6px;text-transform:uppercase;margin:2vh auto' });
    const b = el('button.btn.lg', { text: 'Forbind' });
    b.addEventListener('click', () => TG.join('screen', { code: inp.value.trim().toUpperCase() }).then((r) => { if (r.ok) TG.save('tg_screen_code', r.code); else TG.toast(r.error, 'err'); }));
    c.appendChild(inp); c.appendChild(b); w.appendChild(c); root.appendChild(w);
  }

  TG.onState((st) => { S = st; render(); });

  function render() {
    if (!S) return;
    clear(root);
    const stage = el('div.stage');
    stage.appendChild(el('div.corner-motif', { html: TG.motif.horse('#C9A227') }));
    stage.appendChild(brandbar());
    const content = el('div.content');
    content.appendChild(slideContent());
    stage.appendChild(content);
    root.appendChild(stage);
  }

  function brandbar() {
    const b = el('div.brandbar');
    const star = el('div', { style: 'width:2.6vw;height:2.6vw', html: TG.motif.compass('#C9A227') });
    b.appendChild(star);
    b.appendChild(el('div.eyebrow', { text: S.eventName + ' · CoastZone' }));
    const showCode = ['intro-coastzone', 'program', 'derby-intro', 'stable-setup', 'ready-check'].includes(S.slide.kind);
    if (showCode) b.appendChild(el('div.code', {}, [el('div.lbl', { text: 'Spilkode' }), el('div.val', { text: S.code })]));
    return b;
  }

  function slideContent() {
    if (S.screenMessageOverride) return el('div.center', {}, [el('h1', { text: S.screenMessageOverride })]);
    switch (S.slide.kind) {
      case 'intro-coastzone': return intro();
      case 'program': return program();
      case 'derby-intro': return derbyIntro();
      case 'how-to-win': return howToWin();
      case 'game-flow': return gameFlow();
      case 'stable-setup': return stableSetup();
      case 'ready-check': return readyCheck();
      case 'pre-season': return preseason();
      case 'warmup-race': return raceTrack('Warm-up løb');
      case 'auction': return auction();
      case 'round': return round();
      case 'race': return raceTrack(S.slide.screenTitle);
      case 'leaderboard': return leaderboard('Stilling');
      case 'derby-readiness': return readiness();
      case 'final-race': return raceTrack('The Great Team Derby');
      case 'final-reveal': return reveal();
      default: return el('div', {}, [el('h1', { text: S.slide.screenTitle })]);
    }
  }

  // ---- intro slides ----
  function intro() {
    const c = el('div');
    c.appendChild(el('div.eyebrow', { text: 'Velkommen til' }));
    c.appendChild(el('h1', { text: 'CoastZone' }));
    c.appendChild(el('p.lead', { text: 'Vi skaber teamoplevelser der bliver husket. I dag går vi på banen til The Great Team Derby.' }));
    return c;
  }
  function derbyIntro() {
    const c = el('div');
    c.appendChild(el('div.eyebrow', { text: 'Dagens dyst' }));
    c.appendChild(el('h1', { text: 'The Great Team Derby' }));
    c.appendChild(el('p.lead', { text: 'Samarbejde, strategi, investeringer og performance. Byg jeres stald — og gør den mest værdifuld.' }));
    return c;
  }
  function program() {
    const c = el('div');
    c.appendChild(el('h1', { text: 'Dagens program', style: 'font-size:4.5vw' }));
    const list = el('div', { style: 'margin-top:2vh' });
    (S.programItems || []).forEach((p, i) => { const row = el('div.row', { style: 'font-size:2vw;padding:.8vh 0;border-bottom:1px solid var(--line)' }, [el('span.num', { style: 'color:var(--gold);width:2.5vw', text: String(i + 1) }), el('span', { text: p })]); list.appendChild(row); });
    c.appendChild(list);
    return c;
  }
  function howToWin() {
    const c = el('div');
    c.appendChild(el('h1', { text: 'Sådan vinder I', style: 'font-size:5vw' }));
    const steps = ['Løs opgaver og tjen Staldollars', 'Vind løb og få præmiepenge', 'Investér i hest, jockey og stald', 'Byt og træf skarpe beslutninger'];
    const list = el('div', { style: 'margin-top:1vh' });
    steps.forEach((s, i) => list.appendChild(el('div.row', { style: 'font-size:2vw;padding:.6vh 0' }, [el('span.num', { style: 'color:var(--gold);width:2.5vw', text: String(i + 1) }), el('span', { text: s })])));
    c.appendChild(list);
    c.appendChild(el('p.lead', { style: 'margin-top:2vh', html: 'Den mest værdifulde stald vinder — <b>ikke</b> nødvendigvis vinderen af finaleløbet.' }));
    return c;
  }
  function gameFlow() {
    const c = el('div');
    c.appendChild(el('h1', { text: 'Spillets gang', style: 'font-size:5vw' }));
    const steps = ['Pre-season', 'Warm-up', 'Auktion', 'Runde', 'Løb', 'Stilling', 'Finale', 'Afsløring'];
    const flow = el('div.flow');
    steps.forEach((s, i) => { flow.appendChild(el('div.step', { text: s })); if (i < steps.length - 1) flow.appendChild(el('div.arrow', { text: '→' })); });
    c.appendChild(flow);
    return c;
  }
  function preseason() {
    const c = el('div');
    c.appendChild(el('div.eyebrow', { text: 'Planlægning' }));
    c.appendChild(el('h1', { text: 'Pre-season' }));
    c.appendChild(el('p.lead', { text: 'Læs opgaverne på jeres tablet, forstå strategien og planlæg jeres første træk.' }));
    return c;
  }

  // ---- setup / ready ----
  function stableSetup() {
    const c = el('div');
    c.appendChild(el('h2', { text: 'Skab jeres stald' }));
    const row = el('div.row', { style: 'gap:2vw;align-items:flex-start;margin-top:1vh' });
    const grid = el('div.teamgrid', { style: 'flex:1' });
    S.teams.forEach((t) => grid.appendChild(teamCard(t)));
    row.appendChild(grid);
    const qr = el('div.qr.center'); qr.appendChild(el('img', { src: '/qr.png?data=' + encodeURIComponent(base + '/team') })); qr.appendChild(el('div', { style: 'font-weight:700;margin-top:.5vw;font-size:1vw', text: 'Scan for at tilslutte' }));
    row.appendChild(qr);
    c.appendChild(row);
    return c;
  }
  function teamCard(t) {
    const card = el('div.teamcard');
    card.appendChild(el('div.badge', { style: `background:${t.color.hex}`, text: String(t.teamNumber) }));
    const info = el('div', { style: 'flex:1' });
    info.appendChild(el('div.tn', { text: t.joined ? t.stableName : 'Ledig plads' }));
    info.appendChild(el('div.sub', { text: t.joined ? (t.horseName || '—') + ' · ' + (t.jockeyName || '—') : 'Venter på tablet' }));
    card.appendChild(info);
    if (t.ready) card.appendChild(el('span.chip.turf', { text: '✓ Klar' }));
    return card;
  }
  function readyCheck() {
    const c = el('div');
    const ready = S.teams.filter((t) => t.ready).length; const joined = S.teams.filter((t) => t.joined).length;
    c.appendChild(el('h2', { text: `Er alle stalde klar? (${ready}/${joined})` }));
    const grid = el('div.teamgrid', { style: 'margin-top:1vh' });
    S.teams.filter((t) => t.joined).forEach((t) => grid.appendChild(teamCard(t)));
    c.appendChild(grid);
    return c;
  }

  // ---- auction ----
  function auction() {
    const a = S.auction; const c = el('div');
    const cd = a.endsAt ? TG.countdown(a.endsAt) : '';
    c.appendChild(el('div.row.between', {}, [el('h2', { text: a.status === 'resolved' ? 'Auktionen er afgjort' : a.status === 'closed' ? 'Auktionen er lukket' : 'Auktionen er åben' }), cd ? el('div.big-num', { style: 'font-size:4vw', text: cd, 'data-endsat': a.endsAt }) : null]));
    if (a.status === 'resolved') {
      const list = el('div', { style: 'margin-top:1vh' });
      (a.results || []).forEach((r) => list.appendChild(el('div.reveal-row', {}, [el('span.num', { text: '' }), el('span', { text: r.stableName + ' → ' + r.exerciseName }), el('span.num', { text: sd(r.amount) })])));
      c.appendChild(list); return c;
    }
    const grid = el('div.teamgrid', { style: 'grid-template-columns:repeat(4,1fr);margin-top:1vh' });
    a.exercises.forEach((ex) => {
      const card = el('div.card'); card.appendChild(el('div.cat ' + ex.category, { style: 'font-size:1vw;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--gold)', text: ex.name }));
      card.appendChild(el('div', { style: 'font-size:1vw;color:var(--text-dim);min-height:3vw', text: ex.short }));
      card.appendChild(ex.currentOwnerTeamId ? el('span.chip', { text: teamName(ex.currentOwnerTeamId) }) : el('span.chip.gold', { text: 'Ledig' }));
      grid.appendChild(card);
    });
    c.appendChild(grid);
    return c;
  }

  // ---- round ----
  function round() {
    const c = el('div');
    const t = S.timers && S.timers.round ? TG.countdown(S.timers.round.endsAt) : null;
    c.appendChild(el('div.row.between', {}, [el('h1', { text: S.slide.screenTitle, style: 'font-size:5vw' }), t ? el('div.big-num', { text: t, 'data-endsat': S.timers.round.endsAt }) : null]));
    c.appendChild(el('p.lead', { text: 'Løs opgaver, byt øvelser, investér — og gør jer klar til løbet.' }));
    c.appendChild(miniLeaderboard());
    return c;
  }
  function miniLeaderboard() {
    const box = el('div', { style: 'margin-top:2vh' });
    (S.ranking || []).slice(0, 5).forEach((r) => box.appendChild(el('div.row.between', { style: 'font-size:1.6vw;padding:.5vh 0;border-bottom:1px solid var(--line)' }, [el('span', { html: `<b>${r.place}.</b> ${r.stableName}` }), el('span.num', { text: sd(r.totalValue) })])));
    return box;
  }

  // ---- race track ----
  function raceTrack(title) {
    const c = el('div', { style: 'display:flex;flex-direction:column;height:100%' });
    const race = S.race;
    c.appendChild(el('div.row.between', {}, [el('h2', { text: title }), race ? el('span.chip' + (race.rollingOpen ? '.turf' : ''), { text: race.rollingOpen ? 'Rolling åben' : (race.status === 'finished' ? 'Afsluttet' : 'Afventer') }) : null]));
    if (!race) { c.appendChild(el('p.lead', { text: 'Klargør løb…' })); return c; }
    const track = el('div.track');
    S.teams.forEach((t) => {
      const pos = race.positions[t.id] || 0; const pct = Math.min(100, (pos / race.trackLength) * 92);
      const lane = el('div.lane');
      lane.appendChild(el('div.tag', { text: t.stableName }));
      lane.appendChild(el('div.finish'));
      const horse = el('div.horse', { style: `left:${pct}%`, html: TG.motif.horse(t.color.hex) });
      lane.appendChild(horse);
      track.appendChild(lane);
    });
    c.appendChild(track);
    if (race.results && race.results.length) {
      const podium = el('div.row', { style: 'gap:1.4vw;margin-top:1vh;justify-content:center' });
      race.results.slice(0, 3).forEach((r) => podium.appendChild(el('div.chip.gold', { style: 'font-size:1.4vw;padding:.6vw 1.2vw', text: `${r.place}. ${r.stableName} · +${money(r.prize)} SD` })));
      c.appendChild(podium);
    }
    return c;
  }

  // ---- leaderboard ----
  function leaderboard(title) {
    const c = el('div');
    c.appendChild(el('h1', { text: title, style: 'font-size:5vw' }));
    const box = el('div', { style: 'margin-top:1vh' });
    (S.ranking || []).forEach((r) => {
      box.appendChild(el('div.lb-row', {}, [
        el('div.badge', { style: `background:${r.color.hex}`, text: String(r.place) }),
        el('span', { text: r.stableName }),
        el('span.num', { text: sd(r.totalValue) }),
      ]));
    });
    c.appendChild(box);
    return c;
  }

  // ---- readiness ----
  function readiness() {
    const c = el('div');
    c.appendChild(el('h2', { text: 'Klar til The Great Team Derby' }));
    const grid = el('div.teamgrid', { style: 'margin-top:1vh' });
    S.teams.filter((t) => t.joined).forEach((t) => {
      const card = el('div.teamcard');
      card.appendChild(el('div.badge', { style: `background:${t.color.hex}`, text: String(t.teamNumber) }));
      card.appendChild(el('div', { style: 'flex:1' }, [el('div.tn', { text: t.stableName }), el('div.sub', { text: 'Total ' + sd(t.totalValue) })]));
      card.appendChild(t.derbyLicense ? el('span.chip.turf', { text: '✓ Licens' }) : el('span.chip.red', { text: 'Ingen licens' }));
      grid.appendChild(card);
    });
    c.appendChild(grid);
    return c;
  }

  // ---- final reveal ----
  function reveal() {
    const winner = (S.ranking || [])[0];
    const c = el('div.winner-hero');
    if (!winner) return el('h1', { text: 'Afsløring' });
    c.appendChild(el('div.crown', { text: '👑' }));
    c.appendChild(el('div.eyebrow', { text: 'Vinderen af The Great Team Derby' }));
    c.appendChild(el('h1', { text: winner.stableName, style: 'font-size:6vw' }));
    c.appendChild(el('div.big-num', { text: sd(winner.totalValue), style: 'margin:1vh 0' }));
    const bd = el('div.row', { style: 'justify-content:center;gap:1.4vw;margin-top:1vh' });
    [['Kontant', winner.cash], ['Hest', winner.horseValue], ['Jockey', winner.jockeyValue], ['Stald', winner.stableValue]].forEach(([k, v]) => bd.appendChild(el('div.chip', { style: 'font-size:1.4vw;padding:.6vw 1.2vw', text: `${k}: ${money(v)}` })));
    c.appendChild(bd);
    return c;
  }

  function teamName(id) { const t = S.teams.find((x) => x.id === id); return t ? t.stableName : '—'; }

  // opdater countdowns hvert sekund
  setInterval(() => { document.querySelectorAll('[data-endsat]').forEach((n) => { n.textContent = TG.countdown(Number(n.getAttribute('data-endsat'))); }); }, 500);
})();
