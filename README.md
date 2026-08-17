# METAMORPHOSIS · A Genetic Atlas of Complete Transformation

> One genome builds four different animals. This is the interactive atlas of how —
> every mapped gene at every stage of *Drosophila melanogaster* metamorphosis,
> the ecdysone pulses that conduct them, and the questions science still can't answer.

**Live demo →** `https://<your-username>.github.io/<repo-name>/`
*(replace with your GitHub Pages URL after deploying — steps below)*

---

## What's inside

### 🧬 Tab 1 — The Atlas (2D)
- **Stage-by-stage genome** — 200+ gene annotations across 4 life stages
  (egg → larva → pupa → adult), organized into 8 color-coded molecular pathways:
  ecdysone cascade · juvenile hormone · insulin/TOR growth · segmentation &
  patterning · Hox · histolysis & autophagy · eclosion & neural remodeling · differentiation
- Click any gene chip for its alias, gene class, molecular function, and
  stage-specific role
- **The ecdysone clock** — interactive titer curve with all **6 hormonal pulses**;
  click a pulse to see exactly which genes it fires
- **Pupal transcriptional cascade** — the six-layer nuclear-receptor waterfall
  (EcR/USP → E74A/E75A/Br-C → βFTZ-F1 → HR3/HR4 → E93/Kr-h1), fully clickable
- **The hormone switch** — JH vs. 20E states that make metamorphosis irreversible
- **Terra incognita** — 10 genuine research gaps, each split into
  *established* vs. *not yet answered* (enhancer grammar, 3D genome re-wiring,
  lncRNAs, single-cell atlases, pulse timing, origin of the pupa, metabolic
  reprogramming, connectomics, environmental plasticity, translational control)

### ⬡ Tab 2 — The 3D Lab (Three.js)
- **Four sculpted stage models** — chorion egg with dorsal appendages, a larva
  with live peristaltic crawling, a translucent amber puparium with a glowing
  pharate adult inside, and a fly with articulated wings and glossy compound eyes
- **Morph timeline** — press ▶ and watch the organism visibly transform through
  the full life cycle (scrub 0–240 h; every transition has a biology caption)
- **Anatomy atlas mode** — toggle `◉ atlas` to reveal **30 clickable hotspot
  markers** pinned to real anatomy on all four stages (imaginal discs, ring
  gland, polytene chromosomes, halteres, tanning cuticle…); each links its
  working genes (haltere → *Ubx*, ring gland → *ptth/tor/phm/sad*…) straight
  into the gene database
- **Physics** — drag-to-spin with inertia, wheel/pinch zoom, and 40 gene orbs
  riding tilted pathway rings on spring–damper physics; click an orb for its
  gene card, double-click (or the ⚡ button) to fire a 20E pulse that scatters
  the whole genome before the springs pull it back

Built with **React 18 · TypeScript · Vite · Tailwind CSS v4 · Three.js**,
plus custom SVG specimen illustration, canvas-baked 3D labels, and
`prefers-reduced-motion` support throughout.

---

## Run it locally

Requires **Node.js 18+**.

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
npm install
npm run dev        # → http://localhost:5173
```

Production build:

```bash
npm run build      # outputs to dist/
npm run preview    # serve the built site locally
```

---

## Publish to GitHub + GitHub Pages

### 1 · Push the code

```bash
git init                       # skip if already a repo
git add .
git commit -m "Metamorphosis atlas — initial release"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 2 · Enable Pages (automatic deploys, already wired up)

This repo ships a GitHub Actions workflow
(`.github/workflows/deploy.yml`) that builds the site **with a relative asset
base** — so it works on *any* repo name with zero config changes:

1. On GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**
2. Push to `main` — the workflow builds with `vite build --base=./` and
   publishes `dist/` automatically
3. Your site appears at `https://<your-username>.github.io/<repo-name>/`
   (first run takes ~1 minute; check the *Actions* tab)

### 3 · (Optional) manual deploy instead

If you prefer deploying by hand:

```bash
npx vite build --base=./       # relative base = works on any Pages URL
npx gh-pages -d dist           # or upload dist/ to a gh-pages branch
```

Then set **Settings → Pages → Source → Deploy from a branch → `gh-pages` / `/(root)`**.

> ⚠️ Don't use plain `npm run build` for Pages — it emits absolute `/assets/…`
> paths, which 404 under `github.io/<repo>/`. Always pass `--base=./`
> (or set `base: './'` in `vite.config`).

---

## Project structure

```
index.html                        # entry, fonts, meta/social preview
src/
  main.tsx                        # React mount
  App.tsx                         # atlas tab — backdrop, specimen dish, sections
  index.css                       # design system, ambient layers, motion
  data/
    biology.ts                    # ★ all the science: 4 stages, 200+ genes,
                                  #   6 pulses, cascade, switch states, 10 gaps
  components/
    ui.tsx                        # reveal, scramble, gene chips, tags
    creatures.tsx                 # SVG specimens (egg/larva/pupa/fly)
    explorer.tsx                  # sticky stage-by-stage gene explorer
    cascade.tsx                   # pulse timeline, cascade, hormone switch
    gaps.tsx                      # research-gap dossier + references
    lab3d.tsx                     # ★ Three.js lab: models, physics, atlas, morph
```

## Data & accuracy

Gene annotations follow FlyBase nomenclature (*D. melanogaster*, Release 6).
Functions and stage roles are distilled from the classical metamorphosis
literature (Thummel 2001; Yamanaka et al. 2013; Rewitz et al. 2013;
Truman 2019; Ghbeish et al. 2001; Baehrecke 2002; among others — see the
references in the site footer). Educational visualization, not an exhaustive
omics database; the research-gaps section deliberately marks what is *not* known.

## License

MIT © 2026 — see [LICENSE](LICENSE). Built as an open science-communication piece;
fork it, teach with it, extend it.

---

**Found a gene we got wrong?** Open an issue — the atlas is only as good as its
annotations. 🔬
