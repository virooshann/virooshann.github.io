// Turns the data in content.js into real, accessible HTML.
// Has no library imports, so the content renders even if the CDN fails.
import { site, stages, about, projects, experience, education, skills, contact, footer } from './content.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const hud = (id) => stages.find((s) => s.id === id) || stages[0];
const initials = site.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

// Small inline icons (stroke-based, inherit currentColor)
const icon = {
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 6 8.5 7 8.5-7"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
  file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>',
  expand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>',
};

const stageAttrs = (scene) => {
  const s = hud(scene);
  return `data-stage data-scene="${scene}" data-hud-code="${s.code}" data-hud-label="${esc(s.label)}" data-hud-detail="${esc(s.detail)}"`;
};
const eyebrow = (scene, text) => {
  const s = hud(scene);
  return `<p class="eyebrow mono"><span aria-hidden="true">${s.code} · ${esc(s.label)} ·</span> ${esc(text)}</p>`;
};
const extLink = (href, label, ico, cls = 'btn') => (
  `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${icon[ico] || ''}<span>${esc(label)}</span></a>`
);
const resumeLink = (label = 'Resume', cls = 'btn') => (
  `<a class="${cls}" href="${esc(site.resume)}" target="_blank" rel="noopener">${icon.file}<span>${label}</span></a>`
);

function heroHTML() {
  return `
  <section id="hero" class="stage hero" ${stageAttrs('hero')} aria-labelledby="hero-name">
    <div class="wrap">
      <div class="hero__text">
        <p class="hero__tag mono" aria-hidden="true"><span class="pulse-dot"></span>SUBJECT DETECTED · ID_001</p>
        <div class="label-box">
          <span class="corners" aria-hidden="true"></span>
          <h1 id="hero-name" class="hero__name">${esc(site.name)}</h1>
          <p class="hero__title">${esc(site.title)}</p>
        </div>
        <p class="hero__meta mono">${esc(site.location)}</p>
        <div class="hero__cta">
          <a class="btn btn--primary" href="#projects" data-scroll>View projects</a>
          ${resumeLink()}
        </div>
      </div>
    </div>
    <p class="scroll-cue mono" aria-hidden="true"><span></span>SCROLL TO RUN</p>
  </section>`;
}

function aboutHTML() {
  const photo = site.photo
    ? `<img src="${esc(site.photo)}" alt="${esc(site.photoAlt)}" width="600" height="700" loading="lazy" decoding="async">`
    : `<div class="avatar__ph" role="img" aria-label="Profile photo placeholder"><span>${esc(initials)}</span><small class="mono">PHOTO · TODO</small></div>`;
  const involvements = about.involvements.length
    ? `<h3 class="sub-h">Leadership &amp; involvements</h3>
       <ul class="involve">${about.involvements.map(([r, d]) => `<li><strong>${esc(r)}</strong> <span>${esc(d)}</span></li>`).join('')}</ul>`
    : '';
  return `
  <section id="about" class="stage" ${stageAttrs('about')} aria-labelledby="about-h">
    <div class="wrap">
      <div class="about">
        <div class="panel card" data-anim="card">
          ${eyebrow('about', 'Who I am')}
          <h2 id="about-h">${esc(about.heading)}</h2>
          ${about.paragraphs.map((p, i) => `<p class="${i ? '' : 'lead'}">${esc(p)}</p>`).join('')}
          <dl class="facts mono">
            <div><dt>Name</dt><dd>${esc(site.fullName)}</dd></div>
            <div><dt>Based in</dt><dd>${esc(site.location)}</dd></div>
            <div><dt>Languages</dt><dd>${esc(about.languages)}</dd></div>
          </dl>
          ${involvements}
        </div>
        <figure class="avatar" data-anim="card">
          <span class="corners" aria-hidden="true"></span>
          ${photo}
          <figcaption class="avatar__tag mono" aria-hidden="true">ID_001 · VERIFIED</figcaption>
        </figure>
      </div>
    </div>
  </section>`;
}

function mediaHTML(p) {
  if (p.demo === null) return '';
  if (p.demo) {
    const [w, h] = p.demoSize || [];
    const size = w && h ? ` width="${w}" height="${h}"` : '';
    return `<figure class="media">
        <a class="media__link" href="${esc(p.demo)}" target="_blank" rel="noopener" aria-label="Open full-size image: ${esc(p.demoAlt)}">
          <img src="${esc(p.demo)}" alt="${esc(p.demoAlt)}"${size} loading="lazy" decoding="async">
          <span class="media__zoom mono" aria-hidden="true">${icon.expand}VIEW</span>
        </a>
      </figure>`;
  }
  return `<figure class="media media--ph" role="img" aria-label="Demo coming soon">
      <span class="corners" aria-hidden="true"></span>
      <span class="media__ph mono" aria-hidden="true"><b>NO SIGNAL</b>Demo coming soon</span>
    </figure>`;
}

function readoutHTML(p) {
  if (typeof p.readout === 'string') {
    const chars = [...p.readout].map((c) => `<span class="ch" data-final="${esc(c)}">${c === ' ' ? '&nbsp;' : '_'}</span>`).join('');
    return `<div class="readout readout--plate mono" aria-hidden="true">
        <span class="readout__k">OCR ▸</span><span class="plate-chars">${chars}</span><span class="readout__s" data-ocr-status>SCANNING</span>
      </div>`;
  }
  const items = (p.readout || []).map((c) => `<span class="cam"><i></i>${esc(c)}</span>`).join('');
  return `<div class="readout readout--items mono" aria-hidden="true" data-done="${esc(p.readoutDone || 'OK')}">${items}<span class="readout__s" data-items-status>SEARCHING</span></div>`;
}

function projectHTML(p, i) {
  let repo = '';
  if (p.repo) repo = extLink(p.repo, 'View on GitHub', 'github');
  else if (p.repo === '') repo = '<span class="btn btn--disabled" aria-disabled="true">Repository · coming soon</span>';
  const highlights = p.highlights.length
    ? `<ul class="highlights">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`
    : '';
  return `
    <article id="${esc(p.id)}" class="stage project" ${stageAttrs(p.scene)} aria-labelledby="${esc(p.id)}-h">
      <div class="wrap">
        <div class="card project__card" data-anim="card">
          ${eyebrow(p.scene, `Project ${String(i + 1).padStart(2, '0')}`)}
          <h3 id="${esc(p.id)}-h" class="project__title">${esc(p.title)}</h3>
          ${p.badge ? `<p class="badge mono">${esc(p.badge)}</p>` : ''}
          <ul class="tags mono" aria-label="Technologies">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          ${readoutHTML(p)}
          <p>${esc(p.summary)}</p>
          ${highlights}
          ${mediaHTML(p)}
          ${repo ? `<div class="links">${repo}</div>` : ''}
        </div>
      </div>
    </article>`;
}

function projectsHTML() {
  const list = projects.filter((p) => p.enabled);
  return `
  <section id="projects" class="projects" aria-labelledby="projects-h">
    <h2 id="projects-h" class="visually-hidden">Projects</h2>
    ${list.map(projectHTML).join('')}
  </section>`;
}

function timelineItem(e, node, h = 'h3') {
  const points = e.points?.length ? `<ul class="tl__points">${e.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : '';
  const achievement = e.achievement ? `<p class="tl__key"><strong>Key achievement:</strong> ${esc(e.achievement)}</p>` : '';
  const grade = e.grade ? ` <span class="tl__period mono">· ${esc(e.grade)}</span>` : '';
  const modules = e.modules ? `<p class="tl__text"><span class="tl__label">Relevant modules:</span> ${esc(e.modules)}</p>` : '';
  return `<li class="tl__item" data-node="${node}">
      <span class="tl__node" aria-hidden="true"></span>
      <${h} class="tl__role">${esc(e.role)}</${h}>
      <p class="tl__org">${esc(e.org)}${e.period ? ` <span class="tl__period mono">· ${esc(e.period)}</span>` : ''}${grade}</p>
      ${points}${achievement}${modules}
    </li>`;
}

function experienceHTML() {
  return `
  <section id="experience" class="stage" ${stageAttrs('experience')} aria-labelledby="exp-h">
    <div class="wrap">
      <div class="card panel panel--wide" data-anim="card">
        ${eyebrow('experience', 'Career path')}
        <h2 id="exp-h">Experience</h2>
        <ol class="tl">${experience.map((e, i) => timelineItem(e, i)).join('')}</ol>
        <h3 class="sub-h">Education</h3>
        <ol class="tl">${education.map((e, i) => timelineItem(e, experience.length + i, 'h4')).join('')}</ol>
      </div>
    </div>
  </section>`;
}

function skillsHTML() {
  return `
  <section id="skills" class="stage" ${stageAttrs('skills')} aria-labelledby="skills-h">
    <div class="wrap">
      <div class="skills">
        <div class="skills__head" data-anim="card">
          ${eyebrow('skills', 'Toolkit')}
          <h2 id="skills-h">Skills</h2>
        </div>
        <div class="skills__grid">
          ${skills.map((g, i) => `
          <div class="card skill" data-cluster="${i}" data-anim="card">
            <h3 class="skill__h"><span class="mono" aria-hidden="true">C${i + 1}</span> ${esc(g.group)}</h3>
            <ul class="chips">${g.items.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </section>`;
}

function contactHTML() {
  const linkedin = site.linkedin ? extLink(site.linkedin, 'LinkedIn', 'linkedin') : '';
  return `
  <section id="contact" class="stage contact" ${stageAttrs('contact')} aria-labelledby="contact-h">
    <div class="wrap">
      <div class="contact__inner" data-anim="card">
        <p class="match mono" aria-hidden="true">MATCH FOUND</p>
        <h2 id="contact-h">${esc(contact.heading)}</h2>
        <a class="contact__email" href="mailto:${esc(site.email)}">${icon.mail}<span>${esc(site.email)}</span></a>
        <div class="contact__links">
          ${extLink(site.github, 'GitHub', 'github')}
          ${linkedin}
          ${resumeLink('Resume (PDF)')}
        </div>
      </div>
    </div>
  </section>`;
}

function topbarHTML() {
  const links = [['about', 'About'], ['projects', 'Projects'], ['experience', 'Experience'], ['skills', 'Skills'], ['contact', 'Contact']];
  return `
    <a class="brand mono" href="#hero" data-scroll><span class="brand__mark" aria-hidden="true"></span>${esc(initials)}<span class="visually-hidden"> · ${esc(site.name)}, back to top</span><span class="brand__stage" id="brand-stage" aria-hidden="true"></span></a>
    <button class="menu-btn mono" id="menu-btn" aria-expanded="false" aria-controls="nav">MENU</button>
    <nav class="nav" id="nav" aria-label="Main">
      <ul>${links.map(([id, l]) => `<li><a href="#${id}" data-scroll data-nav="${id}">${l}</a></li>`).join('')}</ul>
      ${resumeLink('Resume', 'btn btn--small')}
    </nav>`;
}

function railHTML(stageEls) {
  const items = stageEls.map((el) => (
    `<li><span class="rail__code">${el.dataset.hudCode}</span><span class="rail__label">${el.dataset.hudLabel}</span></li>`
  )).join('');
  return `
    <p class="rail__title">PIPELINE</p>
    <ol class="rail__list">${items}</ol>
    <div class="rail__meter"><span class="rail__bar" id="progress-bar"></span></div>`;
}

export function render() {
  document.getElementById('main').innerHTML =
    heroHTML() + aboutHTML() + projectsHTML() + experienceHTML() + skillsHTML() + contactHTML();
  document.getElementById('topbar').innerHTML = topbarHTML();
  document.getElementById('footer').innerHTML = `<p class="mono">${esc(footer)}</p>`;
  const stageEls = [...document.querySelectorAll('[data-stage]')];
  document.getElementById('rail').innerHTML = railHTML(stageEls);
  return stageEls;
}
