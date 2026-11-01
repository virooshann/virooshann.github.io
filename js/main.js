// Entry point: renders the content, then progressively adds smooth scroll, animations and 3D.
// If any library fails to load, the page stays a fully readable static site.
import { render } from './render.js';
import { projects } from './content.js';

const root = document.documentElement;
const stageEls = render();
const scenes = stageEls.map((el) => el.dataset.scene);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = matchMedia('(max-width: 899px), (pointer: coarse)').matches;
const $ = (sel) => document.querySelector(sel);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

setupMenu();

function setupMenu() {
  const btn = $('#menu-btn'), nav = $('#nav');
  const set = (open) => { nav.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => set(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); btn.focus(); }
  });
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

async function init() {
  const webgl = hasWebGL();
  if (!webgl) root.classList.add('no-webgl');

  const [gsapMod, stMod, lenisMod, sceneMod] = await Promise.allSettled([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    reduced || lowPower ? Promise.resolve(null) : import('lenis'),
    webgl ? import('./scene.js') : Promise.resolve(null),
  ]);
  if (gsapMod.status === 'rejected' || stMod.status === 'rejected') {
    root.classList.add('no-webgl');
    console.warn('Animation libraries unavailable; showing the static site.');
    return;
  }
  const { gsap } = gsapMod.value;
  const { ScrollTrigger } = stMod.value;
  gsap.registerPlugin(ScrollTrigger);

  // ── 3D scene ──
  const canvas = $('#scene');
  let scene = null;
  if (sceneMod.status === 'fulfilled' && sceneMod.value) {
    try {
      scene = await sceneMod.value.createScene(canvas, {
        scenes,
        mobile: lowPower,
        reduced,
        plateText: projects.find((p) => p.enabled && p.scene === 'plate')?.readout,
        keyNodes: document.querySelectorAll('.tl__item').length,
        onContextLost: () => { scene = null; root.classList.add('no-webgl'); },
      });
    } catch (err) {
      console.warn('3D scene unavailable:', err);
      root.classList.add('no-webgl');
    }
  } else if (webgl) {
    root.classList.add('no-webgl');
  }

  // ── Smooth scrolling (desktop, motion allowed) ──
  let lenis = null;
  if (lenisMod.status === 'fulfilled' && lenisMod.value) {
    const Lenis = lenisMod.value.default;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // In-page links: smooth scroll + move keyboard focus to the target
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    if (lenis) {
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.6 });
      history.replaceState(null, '', `#${id}`);
    }
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: !!lenis });
  });

  // ── Scroll → stage progress ──
  // One trigger per gap between sections: progress runs 0→1 while the next section scrolls in.
  const trans = stageEls.slice(1).map((el) => ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'top top' }));
  const stageFloat = () => trans.reduce((s, st) => s + st.progress, 0);

  // ── HUD ──
  const railItems = [...document.querySelectorAll('.rail__list li')];
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const confVal = $('#conf-val'), confBar = $('#conf-bar'), frmVal = $('#frm-val'), brandStage = $('#brand-stage');
  const navFor = (scene) => ({ attendance: 'projects', plate: 'projects', hero: '' }[scene] ?? scene);
  let active = -1, dirty = true;

  function setActive(i) {
    if (i === active) return;
    active = i;
    railItems.forEach((li, k) => { li.classList.toggle('is-active', k === i); li.classList.toggle('is-done', k < i); });
    const el = stageEls[i];
    brandStage.textContent = i > 0 ? `· ${el.dataset.hudCode} ${el.dataset.hudLabel}` : '';
    const nav = navFor(el.dataset.scene);
    navLinks.forEach((a) => {
      const on = a.dataset.nav === nav;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (reduced && scene) { // gentle crossfade instead of a morph
      gsap.timeline()
        .to(scene.uniforms.uOpacity, { value: 0, duration: 0.25, onUpdate: () => { dirty = true; } })
        .call(() => { scene.setStage(i, 0); dirty = true; })
        .to(scene.uniforms.uOpacity, { value: 1, duration: 0.4, onUpdate: () => { dirty = true; } });
    }
  }
  // Active section = the last one whose top has passed the middle of the viewport
  const marks = stageEls.map((el) => ScrollTrigger.create({ trigger: el, start: 'top center' }));
  const activeIndex = () => {
    const y = window.scrollY;
    let i = 0;
    marks.forEach((m, k) => { if (y >= m.start) i = k; });
    return i;
  };
  setActive(activeIndex());

  let lastConf = -1;
  function updateConf(s) {
    const conf = 0.1 + 0.89 * (s / Math.max(1, stageEls.length - 1));
    if (Math.abs(conf - lastConf) < 0.004) return;
    lastConf = conf;
    confVal.textContent = conf.toFixed(2);
    confBar.style.transform = `scaleX(${conf.toFixed(3)})`;
    confBar.classList.toggle('is-match', conf > 0.985);
  }

  // ── Lock-on box over the face ──
  const lock = $('#lock'), lockLabel = lock.querySelector('.lock__label'), lockScan = lock.querySelector('.lock__scan');
  const lockState = { in: reduced ? 1 : 0, conf: reduced ? 0.97 : 0 };
  let lockShown = false, lockMode = '';
  if (reduced) lock.classList.add('is-locked');

  function updateLock(i, t) {
    const a = scenes[i], b = scenes[Math.min(i + 1, scenes.length - 1)];
    const isFace = (s) => s === 'hero' || s === 'attendance';
    const w = (isFace(a) ? 1 - t : 0) + (isFace(b) ? t : 0);
    const op = smooth(0.65, 1, w) * lockState.in;
    if (op < 0.01) {
      if (lockShown) { lock.style.opacity = '0'; lockShown = false; }
      return;
    }
    lockShown = true;
    const r = scene.faceRect();
    const grow = (1 - lockState.in) * 90;
    const pad = 6 + grow;
    lock.style.opacity = op.toFixed(3);
    lock.style.transform = `translate(${(r.x - pad).toFixed(1)}px, ${(r.y - pad).toFixed(1)}px)`;
    lock.style.width = `${(r.w + pad * 2).toFixed(1)}px`;
    lock.style.height = `${(r.h + pad * 2).toFixed(1)}px`;
    const mode = (t < 0.5 ? a : b) === 'attendance' ? 'att' : 'hero';
    const label = mode === 'att' ? 'ID_001 · PRESENT' : `FACE_01 · CONF ${lockState.conf.toFixed(2)}`;
    if (label !== lockMode) { lockLabel.textContent = label; lockMode = label; }
    const sc = scene.state.heroScan;
    lockScan.style.opacity = sc > 0 && sc < 1 ? '1' : '0';
    if (sc > 0) lockScan.style.top = `${(sc * 100).toFixed(1)}%`;
  }

  // ── Render loop (paused when the tab is hidden or the canvas is off-screen) ──
  let visible = !document.hidden, onScreen = true, frame = 0;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; dirty = true; });
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(canvas);

  const pointer = { x: 0, y: 0 };
  if (!reduced && !lowPower) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  let lastW = window.innerWidth, lastH = window.innerHeight;
  window.addEventListener('resize', () => {
    // ignore small height changes from mobile browser toolbars
    if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 120) return;
    lastW = window.innerWidth; lastH = window.innerHeight;
    scene?.resize(); dirty = true;
  });

  gsap.ticker.add((time, deltaMs) => {
    setActive(activeIndex());
    const s = reduced ? active : stageFloat();
    updateConf(s);
    if (!scene || !visible || !onScreen) return;
    if (reduced && !dirty) return;
    const i = Math.floor(s), t = smooth(0.15, 0.85, s - i);
    if (!reduced) {
      scene.setStage(i, t);
      scene.state.px += (pointer.x - scene.state.px) * 0.04;
      scene.state.py += (pointer.y - scene.state.py) * 0.04;
    }
    scene.render(time, Math.min(deltaMs / 1000, 0.05));
    updateLock(reduced ? active : i, reduced ? 0 : t);
    if (++frame % 6 === 0) frmVal.textContent = String(frame).padStart(6, '0');
    dirty = false;
  });

  // ── Hero intro: particles assemble → scan sweep → brackets lock on ──
  if (!reduced) {
    // The name itself is never hidden (it is the page's largest paint); only its surroundings animate in.
    gsap.from('.hero__tag, .hero__meta, .hero__cta', {
      opacity: 0, y: 18, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.1,
    });
    if (scene) {
      const lockOn = () => {
        lock.classList.add('is-locked');
        $('.label-box')?.classList.add('is-locked');
      };
      gsap.timeline({ delay: 0.25 })
        .to(scene.state, { assemble: 1, duration: 2.6, ease: 'power2.inOut' }, 0)
        .fromTo(scene.state, { heroScan: 0 }, { heroScan: 1, duration: 1.3, ease: 'power1.inOut' }, 1.6)
        .set(scene.state, { heroScan: -1 })
        .to(lockState, { in: 1, duration: 0.8, ease: 'expo.out' }, 1.8)
        .to(lockState, { conf: 0.97, duration: 1.2, ease: 'power2.out' }, 1.8)
        .call(lockOn, null, 2.9)
        .to(scene.state, { flash: 1, duration: 0.12 }, 2.9)
        .to(scene.state, { flash: 0, duration: 0.9, ease: 'power2.out' }, 3.02);
    } else {
      $('.label-box')?.classList.add('is-locked');
    }
    gsap.to('.scroll-cue', { opacity: 0, scrollTrigger: { trigger: '#hero', start: 'top top', end: '15% top', scrub: true } });
  } else {
    $('.label-box')?.classList.add('is-locked');
  }

  // ── Section entrance animations ──
  if (!reduced) {
    gsap.utils.toArray('[data-anim="card"]').forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 48, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
      const kids = el.querySelectorAll('.highlights li, .chips li');
      if (kids.length) {
        gsap.from(kids, {
          opacity: 0, x: -10, duration: 0.5, stagger: 0.04, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 75%', once: true },
        });
      }
    });
  }

  // ── Project HUD readouts ──
  document.querySelectorAll('.readout--cams').forEach((ro) => {
    const cams = [...ro.querySelectorAll('.cam')], status = ro.querySelector('[data-cam-status]');
    ScrollTrigger.create({
      trigger: ro, start: 'top 80%', once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        cams.forEach((c, k) => tl.call(() => c.classList.add('is-on'), null, reduced ? 0 : 0.2 + k * 0.45));
        tl.call(() => { status.textContent = 'PRESENT'; status.classList.add('is-ok'); }, null, reduced ? 0 : 0.3 + cams.length * 0.45);
      },
    });
  });

  const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  document.querySelectorAll('.readout--plate').forEach((ro) => {
    const chars = [...ro.querySelectorAll('.ch')].filter((c) => c.dataset.final.trim());
    const status = ro.querySelector('[data-ocr-status]');
    ScrollTrigger.create({
      trigger: ro, start: 'top 80%', once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        chars.forEach((ch, k) => {
          const done = () => { ch.textContent = ch.dataset.final; ch.classList.add('is-set'); };
          if (reduced) { done(); return; }
          tl.to({}, {
            duration: 0.35,
            onUpdate: () => { ch.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]; },
            onComplete: done,
          }, 0.2 + k * 0.16);
        });
        tl.call(() => { status.textContent = 'FORMAT OK'; status.classList.add('is-ok'); });
      },
    });
  });

  // ── Timeline entries light up network nodes ──
  document.querySelectorAll('.tl__item').forEach((li) => {
    const n = Number(li.dataset.node);
    const setLit = (v) => {
      if (!scene) return;
      gsap.to(scene.state, { netLit: v, duration: reduced ? 0 : 0.8, ease: 'power2.out', onUpdate: () => { dirty = true; } });
    };
    ScrollTrigger.create({
      trigger: li, start: 'top 78%',
      onEnter: () => { li.classList.add('is-lit'); setLit(n + 1); },
      onLeaveBack: () => { li.classList.remove('is-lit'); setLit(n); },
    });
  });

  // ── Hovering a skill card highlights its cluster ──
  document.querySelectorAll('.skill').forEach((card) => {
    const k = Number(card.dataset.cluster);
    card.addEventListener('mouseenter', () => { if (scene) { scene.state.skillHi = k; dirty = true; } });
    card.addEventListener('mouseleave', () => { if (scene) { scene.state.skillHi = -1; dirty = true; } });
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

init().catch((err) => {
  console.warn('Enhancements failed; static content remains.', err);
  root.classList.add('no-webgl');
});
