# Virooshan Naidu — Portfolio

A 3D, scroll-driven portfolio at **https://virooshann.github.io**.

The concept is **"Through the Lens"**: scrolling the page runs a computer-vision pipeline on its owner. A cloud of particles morphs from shape to shape (face → constellation → multi-camera face → licence plate → network graph → skill clusters → a single point). A HUD rail on the left tracks the pipeline stage and a confidence meter that reaches `0.99 MATCH` at the contact section.

## Tech

| Piece | What it does |
|---|---|
| **Three.js** `0.180.0` | One `THREE.Points` cloud with a custom shader. Every shape is generated in code (no 3D model files). The GPU blends two shapes at a time. |
| **GSAP + ScrollTrigger** `3.13.0` | Ties scroll position to the morphs, the HUD and the entrance animations. |
| **Lenis** `1.3.11` | Smooth scrolling on desktop, synced with ScrollTrigger. |
| Plain HTML / CSS / ES modules | No build step. Libraries load from jsDelivr through the import map in `index.html`, pinned to exact versions. |

## Files

```
index.html          page shell, meta/SEO tags, import map
css/style.css       all styling (colour tokens at the top)
js/content.js       ★ ALL TEXT CONTENT — edit this file
js/render.js        turns content.js into HTML
js/main.js          scroll wiring, HUD, animations, fallbacks
js/scene.js         Three.js scene, shapes, shaders
assets/img/         photo, demo images, og-image.png
assets/Virooshan_Naidu_Resume.pdf   placeholder résumé
favicon.svg
```

## Preview locally

ES modules don't run if you double-click `index.html`. Start a small local server instead:

```bash
# in this folder
python -m http.server 8000
```

Then open http://localhost:8000. Alternatively, use the VS Code **Live Server** extension: right-click `index.html` → *Open with Live Server*.

## Editing content

Everything you'd normally change is in **`js/content.js`**:

- **LinkedIn:** set `linkedin: 'https://www.linkedin.com/in/…'`. The button appears automatically.
- **Profile photo:** save it as `assets/img/profile.jpg` (portrait, about 480×560), then set `photo: 'assets/img/profile.jpg'`.
- **Project repo / demo:** fill in `repo: 'https://github.com/…'` and `demo: 'assets/img/attendance-demo.gif'` (save the file in `assets/img/`). Keep GIFs under about 3 MB, or use a short MP4 converted to GIF/WebP.
- **Third project:** fill in the third entry in `projects` and set `enabled: true`.
- **Résumé:** replace `assets/Virooshan_Naidu_Resume.pdf` with your real PDF, using the same file name.
- **Share image:** replace `assets/img/og-image.png` (1200×630) if you want a custom one.

## Accessibility and fallbacks

- All text is real HTML. The 3D canvas is decorative (`aria-hidden`).
- **Reduced motion** (OS setting): no smooth scroll, no intro or scan animations. The scene changes with a short fade instead of a morph.
- **No WebGL** (or if the CDN fails): the canvas is replaced by a static CSS "lens" background, and all content still works.
- Rendering pauses when the tab is hidden. Pixel ratio is capped (1.75 desktop, 1.5 mobile). Mobile uses about 3,200 particles instead of 9,000.

## Updating the live site

```bash
git add .
git commit -m "Describe your change"
git push
```

GitHub Pages redeploys automatically within a minute or two.
