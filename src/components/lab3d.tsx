import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STAGES, PATHWAYS, PathwayKey, Gene } from "../data/biology";
import { prefersReduced } from "./ui";

/* ================================================================== */
/*  data prep                                                          */
/* ================================================================== */
const PATH_KEYS = Object.keys(PATHWAYS) as PathwayKey[];

type OrbGene = { gene: Gene; pk: PathwayKey };

function collectOrbGenes(): OrbGene[] {
  const seen = new Set<string>();
  const out: OrbGene[] = [];
  for (const pk of PATH_KEYS) {
    let count = 0;
    for (const st of STAGES) {
      for (const grp of st.groups) {
        for (const g of grp.genes) {
          if (g.pathway === pk && !seen.has(g.symbol) && count < 5) {
            seen.add(g.symbol);
            out.push({ gene: g, pk });
            count++;
          }
        }
      }
    }
  }
  return out;
}

const stageGenes = (i: number): Gene[] => STAGES[i].groups.flatMap((grp) => grp.genes);

const ORB_GENES = collectOrbGenes();
const PATH_COUNTS = PATH_KEYS.map(
  (pk) => ORB_GENES.filter((o) => o.pk === pk).length
);

/* symbol → full Gene record (first occurrence across stages) */
const GENE_BY_SYMBOL = new Map<string, Gene>();
STAGES.forEach((st) =>
  st.groups.forEach((gr) =>
    gr.genes.forEach((g) => {
      if (!GENE_BY_SYMBOL.has(g.symbol)) GENE_BY_SYMBOL.set(g.symbol, g);
    })
  )
);

/* ================================================================== */
/*  anatomy atlas parts                                                */
/* ================================================================== */
export type PartInfo = {
  id: string;
  stage: number;
  label: string;
  fn: string;
  genes: string[];
  pos: [number, number, number];
};

const PARTS: PartInfo[] = [
  /* ---- EGG ---- */
  { id: "egg-appendage", stage: 0, label: "Dorsal appendages", pos: [-0.2, 1.42, 0.14], fn: "Two respiratory filaments laid down by Gurken/EGFR dorsal–ventral signaling; they pipe oxygen into the egg.", genes: ["Egfr", "spi", "rho"] },
  { id: "egg-micropyle", stage: 0, label: "Micropyle", pos: [0.02, 1.18, 0.12], fn: "The single sperm-entry channel at the anterior tip. The same pole is patterned by Torso/Tsl terminal signaling.", genes: ["tor", "tsl"] },
  { id: "egg-chorion", stage: 0, label: "Chorion & vitelline membrane", pos: [0.44, -0.2, 0.42], fn: "Protective eggshell built by nurse and follicle cells — whose chorion genes are amplified under ovarian ecdysone signaling.", genes: ["EcR", "usp", "kkv"] },
  { id: "egg-anterior", stage: 0, label: "Anterior morphogen source", pos: [0.3, 0.8, 0.36], fn: "bicoid mRNA anchored at the front; its protein gradient is the embryo's first coordinate system, activating hunchback.", genes: ["bcd", "hb"] },
  { id: "egg-posterior", stage: 0, label: "Posterior pole plasm", pos: [0.16, -0.9, 0.34], fn: "oskar-nucleated germ plasm: it seeds the future germ line and lets the abdomen form by repressing hunchback.", genes: ["osk", "nos", "tll"] },
  { id: "egg-germband", stage: 0, label: "Germ band embryo", pos: [0, -0.05, 0.64], fn: "The embryo proper, mid-gastrulation: gap → pair-rule → segment-polarity genes are carving 14 segments.", genes: ["eve", "ftz", "en", "wg"] },

  /* ---- LARVA ---- */
  { id: "larva-hooks", stage: 1, label: "Mouth hooks", pos: [-1.52, 0.2, 0.18], fn: "Sclerotized feeding jaws of the cephalopharyngeal skeleton — the engine of the 200-fold mass increase, wired to insulin/TOR growth.", genes: ["InR", "chico", "Myc"] },
  { id: "larva-ring", stage: 1, label: "Ring gland (prothoracic)", pos: [-0.55, 0.52, -0.36], fn: "The ecdysone factory. PTTH from two brain neurons hits the Torso receptor here and every Halloween gene fires — one pulse each time.", genes: ["ptth", "tor", "phm", "sad"] },
  { id: "larva-polytene", stage: 1, label: "Salivary gland polytene chromosomes", pos: [-0.85, -0.2, 0.46], fn: "Giant banded chromosomes where each ecdysone pulse paints a visible 'puff' — the first place the gene cascade was ever seen.", genes: ["E74", "E75", "Br-C", "ftz-f1"] },
  { id: "larva-discs", stage: 1, label: "Imaginal discs", pos: [-0.42, 0.72, 0.36], fn: "Sac-like adult primordia (wing, leg, eye…) growing quietly inside the larva, patterned by Dpp/Wg/Hh organizers.", genes: ["vg", "ey", "Dll", "dpp"] },
  { id: "larva-segments", stage: 1, label: "Body wall segments", pos: [0, 0.68, 0.24], fn: "Twelve peristaltic units maintained by the engrailed↔wingless feedback loop; their muscles drive crawling.", genes: ["en", "wg", "hh"] },
  { id: "larva-fatbody", stage: 1, label: "Fat body", pos: [0.78, 0.22, -0.48], fn: "The nutrient command center: Slimfast senses amino acids, TOR reports them, and Dilp8 reports damaged discs to delay metamorphosis.", genes: ["slif", "TOR", "Dilp8"] },
  { id: "larva-gut", stage: 1, label: "Midgut", pos: [0.25, -0.35, 0.48], fn: "Digestion and copper cells; its anterior identity is a Hox readout (labial) set in the embryo and kept ever since.", genes: ["lab", "hkb"] },
  { id: "larva-spiracles", stage: 1, label: "Posterior spiracles", pos: [1.5, 0.12, 0.34], fn: "Breathing ports of the tracheal tree; their identity is written by the terminal Hox gene Abd-B.", genes: ["Abd-B", "tll"] },

  /* ---- PUPA ---- */
  { id: "pupa-case", stage: 2, label: "Puparium", pos: [0.52, 0.3, 0.22], fn: "The last larval skin, tanned into a rigid amber barrel. It is a coffin for the larva and a cradle for the adult.", genes: ["Lac2", "yellow", "kkv"] },
  { id: "pupa-operculum", stage: 2, label: "Operculum", pos: [0.18, 1.08, 0.38], fn: "The pre-cut escape lid at the anterior end, popped open by the ETH→EH→CCAP eclosion behavior cascade at dawn.", genes: ["ETH", "Eh", "Ccap"] },
  { id: "pupa-horns", stage: 2, label: "Anterior horns", pos: [0.24, 1.36, 0.14], fn: "Spiracular horns keeping the respiratory line open while everything inside is rebuilt.", genes: ["tll", "hkb"] },
  { id: "pupa-discs", stage: 2, label: "Everted imaginal discs", pos: [0.36, 0.74, 0.4], fn: "Within hours of the prepupal pulse the discs flip inside-out and fuse into the head and thorax — the adult's first appearance.", genes: ["Dll", "ey", "vg", "shg"] },
  { id: "pupa-pharate", stage: 2, label: "Pharate adult", pos: [0, 0.2, 0.54], fn: "The nearly-finished fly developing in secret. E93 is its master switch: adult program ON, larval program OFF.", genes: ["E93", "Abd-B", "dsx"] },
  { id: "pupa-histolysis", stage: 2, label: "Histolyzing larval tissues", pos: [0.46, -0.45, 0.36], fn: "Salivary glands, larval muscles and midgut are digested by reaper/caspase apoptosis plus Atg-driven autophagy.", genes: ["rpr", "Dronc", "Atg8a", "Drice"] },
  { id: "pupa-muscles", stage: 2, label: "Muscle remodeling", pos: [0.4, -0.86, -0.3], fn: "Most larval muscles die; adult myoblasts fuse into flight muscle, anchored by integrins to the new cuticle.", genes: ["mys", "arm", "Atg1"] },

  /* ---- ADULT ---- */
  { id: "fly-eye", stage: 3, label: "Compound eye", pos: [-0.98, 0.34, 0.46], fn: "~800 ommatidia built by the eyeless/Pax6 selector and Notch lateral inhibition — the classic 'master control' organ.", genes: ["ey", "N", "Dl"] },
  { id: "fly-antenna", stage: 3, label: "Antenna & arista", pos: [-1.3, 0.18, 0.24], fn: "The olfactory organ. Its identity is 'proximal limb' (homothorax) — force Antennapedia on it and it grows a leg instead.", genes: ["hth", "Dll", "Antp"] },
  { id: "fly-proboscis", stage: 3, label: "Proboscis", pos: [-1.1, -0.48, 0.14], fn: "The feeding organ of labial identity — specified by the Hox genes proboscipedia and Sex combs reduced.", genes: ["pb", "Scr"] },
  { id: "fly-wing", stage: 3, label: "Wing", pos: [0.42, 0.7, 0.48], fn: "The vestigial/scalloped selector organ, inflated after eclosion by bursicon and anchored by dumpy to take its shape.", genes: ["vg", "sd", "apt", "burs"] },
  { id: "fly-haltere", stage: 3, label: "Haltere", pos: [0.28, 0.46, 0.6], fn: "The T3 balancing gyroscope — a wing that never was, because Ultrabithorax represses the wing program in the third segment.", genes: ["Ubx"] },
  { id: "fly-thorax", stage: 3, label: "Thorax & legs", pos: [0.05, -0.15, 0.64], fn: "Antennapedia territory: six legs with distal identity from Distal-less and nuclear Hox co-factors.", genes: ["Antp", "Dll", "exd"] },
  { id: "fly-abdomen", stage: 3, label: "Abdominal segments", pos: [1.15, 0.4, 0.42], fn: "The posterior Hox code (abd-A, Abd-B) in stripes — and the tissue doublesex sculpts differently in each sex.", genes: ["abd-A", "Abd-B", "dsx"] },
  { id: "fly-cuticle", stage: 3, label: "Cuticle & pigment", pos: [1.48, -0.15, -0.44], fn: "Tanned and hardened after eclosion: Ple→Ddc make dopamine, ebony/tan set the shade, yellow lays black melanin.", genes: ["Ple", "ebony", "tan", "yellow"] },
  { id: "fly-gonad", stage: 3, label: "Ovary — the loop closes", pos: [0.9, -0.38, 0.46], fn: "The adult no longer has a prothoracic gland — the ovary itself now makes ecdysone (via shade) to run oogenesis.", genes: ["EcR", "shd", "Sxl"] },
];

const PART_BY_ID = new Map(PARTS.map((p) => [p.id, p]));

/* morph captions over morphT ∈ [0, 3] */
const CAPTIONS: { a: number; b: number; label: string; sub: string }[] = [
  { a: -1, b: 0.5, label: "Embryogenesis", sub: "bcd/nos gradients → gap → pair-rule → Hox: one cell becomes a segmented larva." },
  { a: 0.5, b: 1.0, label: "Hatching", sub: "βFTZ-F1 gates the first molt; the larva swells with air and chews free of the chorion." },
  { a: 1.0, b: 1.5, label: "Larval growth — 3 instars", sub: "~200× mass on insulin/TOR. Every 20E pulse is only a molt while JH holds the status quo." },
  { a: 1.5, b: 2.0, label: "Wandering → pupariation", sub: "JH crashes, the prepupal pulse fires, EcR-A rises — larval skin tans into the puparium." },
  { a: 2.0, b: 2.5, label: "Pupal remodeling", sub: "E93 ON: histolysis digests the larva while everted discs assemble the adult in secret." },
  { a: 2.5, b: 2.95, label: "Eclosion", sub: "ETH → EH → CCAP behaviors; the ptilinum inflates and the operculum pops at dawn." },
  { a: 2.95, b: 4, label: "Adult imago", sub: "Bursicon inflates the wings, Lac2 hardens the cuticle — and the ovary takes over ecdysone." },
];

function makeLabel(text: string, color: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 80;
  const ctx = c.getContext("2d")!;
  ctx.font = "700 40px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#eef8f2";
  ctx.fillText(text, 128, 42);
  ctx.shadowBlur = 0;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ================================================================== */
/*  stage model builders                                               */
/* ================================================================== */
type StageHandles = {
  group: THREE.Group;
  baseScale: number;
  larvaSegs?: { mesh: THREE.Mesh; baseX: number }[];
  pupaLight?: THREE.PointLight;
  pharate?: THREE.Group;
  wingL?: THREE.Group;
  wingR?: THREE.Group;
};

function buildEgg(): StageHandles {
  const g = new THREE.Group();
  const chorionMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6d5ac,
    roughness: 0.42,
    clearcoat: 0.55,
    clearcoatRoughness: 0.35,
    emissive: 0x191307,
    emissiveIntensity: 0.6,
  });
  const chorion = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), chorionMat);
  chorion.scale.set(0.66, 1, 0.66);
  g.add(chorion);

  // dorsal appendages
  const appMat = new THREE.MeshStandardMaterial({ color: 0xcbb98d, roughness: 0.55, emissive: 0x141006, emissiveIntensity: 0.5 });
  for (const side of [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.1, 0.88, 0.05 * side),
      new THREE.Vector3(side * 0.22, 1.18, 0.1 * side),
      new THREE.Vector3(side * 0.16, 1.5, 0.16 * side),
    ]);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.055, 10, false), appMat);
    tube.scale.set(1, 1, 0.5);
    g.add(tube);
  }

  // micropyle glow
  const micro = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0x4fe0d0 })
  );
  micro.position.set(0, 1.02, 0);
  g.add(micro);

  // equatorial band
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.012, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x4fe0d0, transparent: true, opacity: 0.35 })
  );
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.3;
  g.add(band);

  return { group: g, baseScale: 1.25 };
}

function buildLarva(): StageHandles {
  const g = new THREE.Group();
  const radii = [0.32, 0.42, 0.5, 0.55, 0.57, 0.55, 0.5, 0.42, 0.3];
  const segMat = new THREE.MeshStandardMaterial({ color: 0xefe0b6, roughness: 0.5, emissive: 0x171106, emissiveIntensity: 0.6 });
  const grooveMat = new THREE.MeshBasicMaterial({ color: 0x6b5636, transparent: true, opacity: 0.55 });
  const segs: { mesh: THREE.Mesh; baseX: number }[] = [];

  radii.forEach((r, i) => {
    const x = -1.2 + (i * 2.4) / (radii.length - 1);
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 26, 20), segMat);
    m.scale.set(0.8, 1, 1);
    m.position.set(x, 0, 0);
    g.add(m);
    segs.push({ mesh: m, baseX: x });
    if (i < radii.length - 1) {
      const groove = new THREE.Mesh(new THREE.TorusGeometry(Math.min(r, radii[i + 1]) * 0.94, 0.012, 8, 40), grooveMat);
      groove.rotation.y = Math.PI / 2;
      groove.position.set(x + 1.2 / (radii.length - 1), 0, 0);
      g.add(groove);
    }
  });

  // mouth hooks
  const hookMat = new THREE.MeshStandardMaterial({ color: 0x241a0e, roughness: 0.4 });
  for (const side of [-1, 1]) {
    const hook = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 10), hookMat);
    hook.position.set(-1.5, side * 0.08, 0);
    hook.rotation.z = Math.PI / 2 + side * 0.4;
    g.add(hook);
  }

  // posterior spiracles (glowing)
  const spMat = new THREE.MeshBasicMaterial({ color: 0x5bc9ff });
  for (const dy of [-0.1, 0, 0.1]) {
    const sp = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), spMat);
    sp.position.set(1.42, dy, 0.12);
    g.add(sp);
  }

  // imaginal discs
  const discMat = new THREE.MeshBasicMaterial({ color: 0x4fe0d0 });
  for (const [dx, dz] of [[-0.4, 0.25], [-0.05, -0.3]]) {
    const disc = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), discMat);
    disc.position.set(dx, 0.5, dz);
    g.add(disc);
  }

  return { group: g, baseScale: 1.0, larvaSegs: segs };
}

function buildPupa(): StageHandles {
  const g = new THREE.Group();
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0.001, 1.18),
    new THREE.Vector2(0.22, 1.1),
    new THREE.Vector2(0.4, 0.85),
    new THREE.Vector2(0.48, 0.45),
    new THREE.Vector2(0.5, 0),
    new THREE.Vector2(0.47, -0.45),
    new THREE.Vector2(0.38, -0.85),
    new THREE.Vector2(0.2, -1.08),
    new THREE.Vector2(0.001, -1.15),
  ];
  const caseMat = new THREE.MeshPhysicalMaterial({
    color: 0xa9743f,
    roughness: 0.28,
    transmission: 0.45,
    thickness: 1.6,
    transparent: true,
    opacity: 0.92,
    emissive: 0x2a1608,
    emissiveIntensity: 0.45,
  });
  const kase = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), caseMat);
  g.add(kase);

  // segment rings
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x5d3d1e, transparent: true, opacity: 0.7 });
  for (const [y, r] of [[0.62, 0.44], [0.1, 0.49], [-0.42, 0.47], [-0.86, 0.36]] as const) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.013, 8, 56), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    g.add(ring);
  }

  // anterior horns
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x7a5327, roughness: 0.5 });
  for (const side of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.24, 10), hornMat);
    horn.position.set(side * 0.14, 1.24, 0);
    horn.rotation.z = -side * 0.35;
    g.add(horn);
  }

  // pharate adult inside
  const pharate = new THREE.Group();
  const phMat = new THREE.MeshStandardMaterial({
    color: 0x33200f,
    emissive: 0xff7e9e,
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 0.9,
    roughness: 0.6,
  });
  const phHead = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), phMat);
  phHead.position.y = 0.62;
  const phThorax = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), phMat);
  phThorax.scale.set(1, 0.85, 0.85);
  phThorax.position.y = 0.12;
  const phAbd = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 16), phMat);
  phAbd.scale.set(1, 1.5, 0.9);
  phAbd.position.y = -0.55;
  pharate.add(phHead, phThorax, phAbd);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff4d6d });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), eyeMat);
    eye.position.set(side * 0.2, 0.72, 0.18);
    pharate.add(eye);
  }
  pharate.scale.setScalar(0.72);
  g.add(pharate);

  const pupaLight = new THREE.PointLight(0xff7e9e, 0.9, 4.5);
  g.add(pupaLight);

  return { group: g, baseScale: 1.15, pupaLight, pharate };
}

function buildFly(): StageHandles {
  const g = new THREE.Group();
  const cuticle = new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.52, emissive: 0x171006, emissiveIntensity: 0.5 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x33230f, roughness: 0.55 });

  // thorax + abdomen along X
  const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 24), cuticle);
  thorax.scale.set(1.0, 0.92, 0.88);
  g.add(thorax);

  const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.58, 32, 24), cuticle);
  abdomen.scale.set(1.55, 0.8, 0.76);
  abdomen.position.x = 0.95;
  g.add(abdomen);

  // abdominal stripes
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0x2c1d0c, transparent: true, opacity: 0.85 });
  for (const [x, r] of [[0.55, 0.42], [0.8, 0.41], [1.05, 0.37], [1.28, 0.29], [1.46, 0.19]] as const) {
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(r, 0.026, 8, 48), stripeMat);
    stripe.rotation.y = Math.PI / 2;
    stripe.position.x = x;
    g.add(stripe);
  }

  // head + eyes
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 28, 22), cuticle);
  head.position.x = -0.78;
  g.add(head);

  const eyeMat = new THREE.MeshPhysicalMaterial({
    color: 0xb3243a,
    roughness: 0.12,
    metalness: 0.25,
    clearcoat: 1,
    emissive: 0x5c0f1e,
    emissiveIntensity: 0.8,
  });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 16), eyeMat);
    eye.scale.set(0.8, 1, 0.9);
    eye.position.set(-0.9, 0.1, side * 0.24);
    g.add(eye);
  }

  // ocelli
  const ocellusMat = new THREE.MeshBasicMaterial({ color: 0xf0a95e });
  for (const [dy, dz] of [[0.38, 0], [0.34, 0.07], [0.34, -0.07]] as const) {
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), ocellusMat);
    o.position.set(-0.72, dy, dz);
    g.add(o);
  }

  // antennae + proboscis
  for (const side of [-1, 1]) {
    const ant = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.14, 4, 8), dark);
    ant.position.set(-1.14, -0.02, side * 0.13);
    ant.rotation.x = side * 0.4;
    g.add(ant);
  }
  const prob = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 10), dark);
  prob.position.set(-1.02, -0.36, 0);
  prob.rotation.z = Math.PI;
  g.add(prob);

  // wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.bezierCurveTo(0.25, 0.28, 0.9, 0.44, 1.5, 0.24);
  wingShape.bezierCurveTo(1.72, 0.15, 1.74, 0.02, 1.5, -0.02);
  wingShape.bezierCurveTo(0.95, -0.12, 0.35, -0.18, 0, 0);
  const wingGeo = new THREE.ShapeGeometry(wingShape, 24);
  wingGeo.rotateX(-Math.PI / 2);
  const wingMat = new THREE.MeshPhysicalMaterial({
    color: 0xcfe9ff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.08,
    clearcoat: 1,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const wingPivotR = new THREE.Group();
  wingPivotR.position.set(-0.05, 0.5, -0.14);
  const wingR = new THREE.Mesh(wingGeo, wingMat);
  wingPivotR.add(wingR);
  const wingPivotL = new THREE.Group();
  wingPivotL.position.set(-0.05, 0.5, 0.14);
  const wingL = new THREE.Mesh(wingGeo, wingMat);
  wingL.scale.z = -1;
  wingPivotL.add(wingL);
  g.add(wingPivotR, wingPivotL);

  // halteres
  const halMat = new THREE.MeshStandardMaterial({ color: 0xd9b878, roughness: 0.4 });
  for (const side of [-1, 1]) {
    const hal = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), halMat);
    hal.position.set(0.22, 0.28, side * 0.42);
    g.add(hal);
  }

  // legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x4a3517, roughness: 0.6 });
  for (const x of [-0.3, 0.02, 0.32]) {
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.5, 4, 8), legMat);
      leg.position.set(x, -0.52, side * 0.5);
      leg.rotation.z = -side * 0.5;
      leg.rotation.x = x * 0.6;
      g.add(leg);
    }
  }

  g.position.y = 0.15;
  return { group: g, baseScale: 1.3, wingL: wingPivotL, wingR: wingPivotR };
}

/* ================================================================== */
/*  sim types                                                          */
/* ================================================================== */
type Orb = {
  group: THREE.Group;
  mat: THREE.MeshBasicMaterial;
  spriteMat: THREE.SpriteMaterial;
  quat: THREE.Quaternion;
  radius: number;
  angle: number;
  speed: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  pk: PathwayKey;
  gene: Gene;
  dim: number;
  phase: number;
};

type Ring = { mat: THREE.LineBasicMaterial; quat: THREE.Quaternion };
type Wave = { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; life: number };
type Burst = { points: THREE.Points; mat: THREE.PointsMaterial; vel: Float32Array; life: number };

type LabAPI = {
  gotoStage: (i: number) => void;
  setFilter: (pk: PathwayKey | null) => void;
  setBeat: (b: boolean) => void;
  setAuto: (b: boolean) => void;
  setMode: (m: "orrery" | "atlas") => void;
  setMorph: (v: number) => void;
  setPlaying: (b: boolean) => void;
  pulse: () => void;
};

/* ================================================================== */
/*  component                                                          */
/* ================================================================== */
export function MetamorphosisLab({ onOpenAtlas }: { onOpenAtlas: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<LabAPI | null>(null);
  const stageSetterRef = useRef<(i: number) => void>(() => {});

  const [stage, setStage] = useState(0);
  const [selected, setSelected] = useState<Gene | null>(null);
  const [filter, setFilter] = useState<PathwayKey | null>(null);
  const [auto, setAuto] = useState(() => !prefersReduced());
  const [beat, setBeat] = useState(false);
  const [pulses, setPulses] = useState(0);
  const [mode, setMode] = useState<"orrery" | "atlas">("orrery");
  const [playing, setPlaying] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null);

  const captionRef = useRef<HTMLSpanElement | null>(null);
  const subRef = useRef<HTMLSpanElement | null>(null);
  const hoursRef = useRef<HTMLSpanElement | null>(null);
  const scrubRef = useRef<HTMLInputElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const scrubbingRef = useRef(false);

  stageSetterRef.current = setStage;

  /* ---------------- mount scene ---------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduced = prefersReduced();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050f14, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050f14, 0.036);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 1.05, 12);

    /* lights */
    scene.add(new THREE.AmbientLight(0x8fb3bd, 0.55));
    const key = new THREE.DirectionalLight(0xfff4dd, 1.5);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.PointLight(0x6ef0a3, 26, 40);
    rim.position.set(-6, 3, -4);
    scene.add(rim);
    const warm = new THREE.PointLight(0xffc44f, 18, 40);
    warm.position.set(6, -2, 3);
    scene.add(warm);
    const flash = new THREE.PointLight(0x6ef0a3, 0, 34);
    flash.position.set(0, 2.4, 2.4);
    scene.add(flash);

    /* floor grid + under-glow */
    const grid = new THREE.PolarGridHelper(11, 12, 6, 48, 0x1c3b46, 0x123039);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.5;
    grid.position.y = -2.15;
    scene.add(grid);

    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(STAGES[0].accent),
      transparent: true,
      opacity: 0.13,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(new THREE.CircleGeometry(2.7, 48), glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -2.13;
    scene.add(glow);
    const glowTarget = new THREE.Color(STAGES[0].accent);

    /* dust */
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(340 * 3);
    for (let i = 0; i < 340; i++) {
      const r = 4 + Math.random() * 9;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      dustPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      dustPos[i * 3 + 1] = r * Math.cos(ph) * 0.7;
      dustPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x9fd8c8,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    /* stage models */
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    const handles: StageHandles[] = [buildEgg(), buildLarva(), buildPupa(), buildFly()];
    handles.forEach((h) => {
      h.group.visible = false;
      h.group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh || (o as THREE.Line).isLine) {
          const mat = mesh.material as THREE.Material;
          mat.transparent = true;
          mat.userData.baseOpacity = mat.opacity;
        }
      });
      modelGroup.add(h.group);
    });

    const setGroupOpacity = (grp: THREE.Group, v: number) => {
      grp.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh || (o as THREE.Line).isLine) {
          const mat = mesh.material as THREE.Material;
          mat.opacity = (mat.userData.baseOpacity ?? 1) * v;
        }
      });
    };

    /* anatomy hotspots (atlas mode) */
    type Hotspot = {
      mesh: THREE.Mesh;
      ring: THREE.Mesh;
      mat: THREE.MeshBasicMaterial;
      ringMat: THREE.MeshBasicMaterial;
      part: PartInfo;
      op: number;
    };
    const hotspots: Hotspot[] = [];
    const hsGeo = new THREE.SphereGeometry(0.085, 14, 12);
    const hsRingGeo = new THREE.TorusGeometry(0.17, 0.011, 8, 40);
    PARTS.forEach((part) => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xeafff3,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(hsGeo, mat);
      mesh.position.set(part.pos[0], part.pos[1], part.pos[2]);
      mesh.userData.partId = part.id;
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(STAGES[part.stage].accent),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(hsRingGeo, ringMat);
      mesh.add(ring);
      handles[part.stage].group.add(mesh);
      hotspots.push({ mesh, ring, mat, ringMat, part, op: 0 });
    });

    /* gene rings + orbs */
    const rings: Ring[] = [];
    const orbs: Orb[] = [];
    const orbMeshes: THREE.Mesh[] = [];
    const orbGeo = new THREE.SphereGeometry(0.085, 16, 12);
    const ringQuats: THREE.Quaternion[] = [];

    PATH_KEYS.forEach((pk, pi) => {
      const radius = 2.35 + pi * 0.22;
      const tilt = new THREE.Euler(0.55 + pi * 0.13, pi * 0.42, 0);
      const q = new THREE.Quaternion().setFromEuler(tilt);
      ringQuats.push(q);

      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius).applyQuaternion(q));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({ color: PATHWAYS[pk].color, transparent: true, opacity: 0.16 });
      const line = new THREE.LineLoop(lineGeo, lineMat);
      scene.add(line);
      rings.push({ mat: lineMat, quat: q });
    });

    ORB_GENES.forEach((og, i) => {
      const pi = PATH_KEYS.indexOf(og.pk);
      const radius = 2.35 + pi * 0.22;
      const color = new THREE.Color(PATHWAYS[og.pk].color);

      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
      const mesh = new THREE.Mesh(orbGeo, mat);
      mesh.userData.orbIndex = i;

      const spriteMat = new THREE.SpriteMaterial({
        map: makeLabel(og.gene.symbol, PATHWAYS[og.pk].color),
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.8, 0.25, 1);
      sprite.position.y = 0.26;

      const group = new THREE.Group();
      group.add(mesh, sprite);
      scene.add(group);
      orbMeshes.push(mesh);

      const angle = Math.random() * Math.PI * 2;
      const pos = new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius).applyQuaternion(ringQuats[pi]);
      group.position.copy(pos);

      orbs.push({
        group,
        mat,
        spriteMat,
        quat: ringQuats[pi],
        radius,
        angle,
        speed: (i % 2 ? -1 : 1) * (0.22 + (i % 5) * 0.055),
        pos: pos.clone(),
        vel: new THREE.Vector3(),
        pk: og.pk,
        gene: og.gene,
        dim: 1,
        phase: Math.random() * Math.PI * 2,
      });
    });

    /* ---------------- sim state ---------------- */
    const sim = {
      targetStage: 0,
      anim: [0, 0, 0, 0],
      rotVelX: 0,
      rotVelY: 0,
      dragging: false,
      lastPX: 0,
      lastPY: 0,
      moved: 0,
      camDist: 12.5,
      camTarget: 8.4,
      kick: 0,
      flashV: 0,
      auto: !reduced,
      cycle: 0,
      lastInteract: 0,
      hoverIdx: -1,
      selectedIdx: -1,
      filter: null as PathwayKey | null,
      beat: false,
      mouse: new THREE.Vector2(-10, -10),
      mouseCX: 0,
      mouseCY: 0,
      mouseOn: false,
      waves: [] as Wave[],
      bursts: [] as Burst[],
      pointers: new Map<number, { x: number; y: number }>(),
      pinchDist: 0,
      /* morph timeline + atlas */
      mode: "orrery" as "orrery" | "atlas",
      playing: false,
      morphT: 0,
      morphTarget: 0,
      prevMorphT: 0,
      lastNearest: 0,
      captionIdx: -1,
      selectedPartId: null as string | null,
      hoverPartId: null as string | null,
    };

    const tmpV = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();

    const spawnBurst = (hex: string, power = 1, n = 90, at?: THREE.Vector3) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3);
      const vel = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const dx = Math.sin(ph) * Math.cos(th);
        const dy = Math.cos(ph);
        const dz = Math.sin(ph) * Math.sin(th);
        pos[i * 3] = dx * 0.3;
        pos[i * 3 + 1] = dy * 0.3;
        pos[i * 3 + 2] = dz * 0.3;
        const sp = (1.4 + Math.random() * 2.6) * power;
        vel[i * 3] = dx * sp;
        vel[i * 3 + 1] = dy * sp;
        vel[i * 3 + 2] = dz * sp;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: new THREE.Color(hex),
        size: 0.055,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geo, mat);
      if (at) points.position.copy(at);
      scene.add(points);
      sim.bursts.push({ points, mat, vel, life: 1 });
    };

    const spawnWave = (hex: string) => {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(hex),
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.68, 64), mat);
      scene.add(mesh);
      sim.waves.push({ mesh, mat, life: 1 });
    };

    const pulse = () => {
      sim.kick = 1;
      sim.flashV = 1;
      spawnWave(STAGES[sim.targetStage].accent);
      spawnBurst("#6ef0a3", 1.2);
      orbs.forEach((o) => {
        tmpV.copy(o.pos).normalize().multiplyScalar(2.4);
        o.vel.add(tmpV);
      });
      setPulses((p) => p + 1);
    };

    const gotoStage = (i: number) => {
      sim.playing = false;
      sim.cycle = 0;
      sim.morphTarget = i;
      sim.kick = Math.max(sim.kick, 0.55);
      glowTarget.set(STAGES[i].accent);
      spawnBurst(STAGES[i].accent, 0.9, 60);
      spawnWave(STAGES[i].accent);
    };

    apiRef.current = {
      gotoStage,
      setFilter: (pk) => {
        sim.filter = pk;
      },
      setBeat: (b) => {
        sim.beat = b;
      },
      setAuto: (b) => {
        sim.auto = b;
        sim.cycle = 0;
      },
      setMode: (m) => {
        sim.mode = m;
        sim.selectedPartId = null;
        sim.camTarget = m === "atlas" ? 6.3 : 8.4;
      },
      setMorph: (v) => {
        sim.playing = false;
        sim.morphTarget = THREE.MathUtils.clamp(v, 0, 3);
        glowTarget.set(STAGES[Math.round(sim.morphTarget)].accent);
      },
      setPlaying: (b) => {
        if (b && sim.morphTarget > 2.9) {
          sim.morphT = 0;
          sim.morphTarget = 0;
          sim.prevMorphT = 0;
          spawnBurst(STAGES[0].accent, 0.8, 50);
        }
        sim.playing = b;
      },
      pulse,
    };

    /* ---------------- pointer interaction ---------------- */
    const el = renderer.domElement;

    const updateMouse = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      sim.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      sim.mouseCX = e.clientX;
      sim.mouseCY = e.clientY;
      sim.mouseOn = true;
    };

    const onPointerDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      sim.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (sim.pointers.size === 1) {
        sim.dragging = true;
        sim.lastPX = e.clientX;
        sim.lastPY = e.clientY;
        sim.moved = 0;
      } else if (sim.pointers.size === 2) {
        const [a, b] = [...sim.pointers.values()];
        sim.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
        sim.dragging = false;
      }
      sim.lastInteract = tNow;
    };

    const onPointerMove = (e: PointerEvent) => {
      updateMouse(e);
      if (sim.pointers.has(e.pointerId)) {
        sim.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      if (sim.pointers.size === 2) {
        const [a, b] = [...sim.pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        sim.camTarget = THREE.MathUtils.clamp(sim.camTarget - (d - sim.pinchDist) * 0.02, 4.4, 13);
        sim.pinchDist = d;
        sim.lastInteract = tNow;
        return;
      }
      if (sim.dragging) {
        const dx = e.clientX - sim.lastPX;
        const dy = e.clientY - sim.lastPY;
        sim.moved += Math.abs(dx) + Math.abs(dy);
        modelGroup.rotation.y += dx * 0.0062;
        modelGroup.rotation.x += dy * 0.0052;
        sim.rotVelY = dx * 0.0062;
        sim.rotVelX = dy * 0.0052;
        sim.lastPX = e.clientX;
        sim.lastPY = e.clientY;
        sim.lastInteract = tNow;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      sim.pointers.delete(e.pointerId);
      if (sim.pointers.size === 0) sim.dragging = false;
      if (sim.moved < 8) {
        updateMouse(e);
        raycaster.setFromCamera(sim.mouse, camera);
        if (sim.mode === "atlas") {
          const targets = hotspots.filter((h) => h.mesh.visible).map((h) => h.mesh);
          const hit = raycaster.intersectObjects(targets, false)[0];
          if (hit) {
            const partId = hit.object.userData.partId as string;
            const part = PART_BY_ID.get(partId) ?? null;
            sim.selectedPartId = partId;
            sim.selectedIdx = -1;
            setSelected(null);
            setSelectedPart(part);
            if (part) {
              hit.object.getWorldPosition(tmpV);
              spawnBurst(STAGES[part.stage].accent, 0.5, 26, tmpV);
            }
          } else {
            sim.selectedPartId = null;
            setSelectedPart(null);
          }
        } else {
          const hit = raycaster.intersectObjects(orbMeshes, false)[0];
          if (hit) {
            const idx = hit.object.userData.orbIndex as number;
            sim.selectedIdx = idx;
            sim.selectedPartId = null;
            setSelectedPart(null);
            setSelected(orbs[idx].gene);
            tmpV.copy(orbs[idx].pos).normalize().multiplyScalar(1.6);
            orbs[idx].vel.add(tmpV);
          } else {
            sim.selectedIdx = -1;
            setSelected(null);
          }
        }
      }
      sim.lastInteract = tNow;
    };

    const onPointerLeave = () => {
      sim.mouseOn = false;
      sim.dragging = false;
      sim.pointers.clear();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sim.camTarget = THREE.MathUtils.clamp(sim.camTarget + e.deltaY * 0.004, 4.4, 13);
      sim.lastInteract = tNow;
    };

    const onDbl = () => pulse();

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointerleave", onPointerLeave);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("dblclick", onDbl);
    el.style.cursor = "grab";

    /* ---------------- resize ---------------- */
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    /* ---------------- tick ---------------- */
    const clock = new THREE.Clock();
    let tNow = 0;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      tNow += dt;

      /* camera */
      sim.camDist += (sim.camTarget - sim.camDist) * Math.min(1, dt * 3);
      camera.position.set(0, 1.05, sim.camDist);
      camera.lookAt(0, 0.05, 0);

      /* rotation inertia + idle spin */
      if (!sim.dragging) {
        sim.rotVelX *= Math.pow(0.05, dt);
        sim.rotVelY *= Math.pow(0.05, dt);
        modelGroup.rotation.x += sim.rotVelX;
        modelGroup.rotation.y += sim.rotVelY;
        if (!reduced) modelGroup.rotation.y += dt * 0.22;
      }

      /* decay */
      sim.kick = Math.max(0, sim.kick - dt * 1.8);
      sim.flashV *= Math.pow(0.015, dt);
      flash.intensity = sim.flashV * 90;

      /* morph timeline drive */
      if (sim.playing) {
        sim.morphTarget += dt * 0.115;
        if (sim.morphTarget >= 3) {
          sim.morphTarget = 3;
          sim.playing = false;
          setPlaying(false);
          spawnBurst(STAGES[3].accent, 0.9, 60);
        }
        glowTarget.set(
          new THREE.Color(STAGES[Math.min(3, Math.round(sim.morphTarget))].accent)
        );
      }
      sim.morphT += (sim.morphTarget - sim.morphT) * Math.min(1, dt * 3.4);
      if (Math.abs(sim.morphTarget - sim.morphT) < 0.0006) sim.morphT = sim.morphTarget;

      /* stage morph — weights from morphT (triangle across stages) */
      const w: number[] = [0, 1, 2, 3].map((i) =>
        THREE.MathUtils.clamp(1 - Math.abs(sim.morphT - i), 0, 1)
      );
      for (let i = 0; i < 4; i++) {
        const h = handles[i];
        const eased = w[i] * w[i] * (3 - 2 * w[i]);
        h.group.visible = eased > 0.02;
        if (!h.group.visible) continue;
        const sc = h.baseScale * (0.06 + 0.94 * eased) * (1 + sim.kick * 0.12 * eased);
        h.group.scale.setScalar(sc);
        setGroupOpacity(h.group, eased);
      }

      /* dissolve motes while actually transitioning */
      const dm = Math.abs(sim.morphT - sim.prevMorphT);
      sim.prevMorphT = sim.morphT;
      if (dm > 0.0018 && Math.random() < 0.4) {
        const near = Math.round(THREE.MathUtils.clamp(sim.morphT, 0, 3));
        spawnBurst(STAGES[near].accent, 0.28, 7);
      }

      /* nearest stage → React readout */
      const nearest = Math.round(THREE.MathUtils.clamp(sim.morphT, 0, 3));
      if (nearest !== sim.lastNearest) {
        sim.lastNearest = nearest;
        stageSetterRef.current(nearest);
      }

      /* timeline DOM readouts (no React re-render) */
      if (captionRef.current && subRef.current) {
        const ci = CAPTIONS.findIndex((c) => sim.morphT >= c.a && sim.morphT < c.b);
        if (ci !== sim.captionIdx && ci >= 0) {
          sim.captionIdx = ci;
          captionRef.current.textContent = CAPTIONS[ci].label;
          subRef.current.textContent = CAPTIONS[ci].sub;
        }
      }
      if (hoursRef.current) {
        hoursRef.current.textContent = `T+${String(Math.round((sim.morphT / 3) * 240)).padStart(3, "0")} h`;
      }
      if (scrubRef.current && !scrubbingRef.current) {
        scrubRef.current.value = String(Math.round((sim.morphT / 3) * 1000));
      }

      /* stage-internal life */
      const eggH = handles[0];
      if (eggH.group.visible) eggH.group.position.y = Math.sin(tNow * 1.1) * 0.08;
      const larvaH = handles[1];
      if (larvaH.group.visible && larvaH.larvaSegs) {
        larvaH.larvaSegs.forEach((s, i) => {
          const w = Math.sin(tNow * 3.1 + i * 0.75);
          s.mesh.position.y = w * 0.08;
          s.mesh.position.x = s.baseX + Math.sin(tNow * 3.1 + i * 0.75 - 0.9) * 0.05;
          s.mesh.scale.set(0.8 + 0.1 * w, 1 - 0.07 * w, 1);
        });
      }
      const pupaH = handles[2];
      if (pupaH.group.visible) {
        if (pupaH.pupaLight) pupaH.pupaLight.intensity = 14 + Math.sin(tNow * 2) * 8;
        if (pupaH.pharate) pupaH.pharate.rotation.y += dt * 0.55;
      }
      const flyH = handles[3];
      if (flyH.group.visible) {
        flyH.group.position.y = 0.15 + Math.sin(tNow * 2) * 0.07;
        if (flyH.wingL && flyH.wingR) {
          const amp = (sim.beat ? 0.62 : 0.15) * (reduced ? 0.4 : 1);
          const fr = sim.beat ? 14 : 2.3;
          const flap = Math.sin(tNow * fr) * amp;
          flyH.wingR.rotation.x = flap;
          flyH.wingL.rotation.x = -flap;
        }
      }

      /* under-glow */
      glowMat.color.lerp(glowTarget, Math.min(1, dt * 2.5));
      glowMat.opacity = 0.11 + sim.kick * 0.1;

      /* dust */
      dust.rotation.y += dt * 0.012;

      /* rings filter (+ atlas fade) */
      const atlasVis = sim.mode === "atlas" ? 0 : 1;
      rings.forEach((r, i) => {
        const base = sim.filter === null ? 0.16 : sim.filter === PATH_KEYS[i] ? 0.55 : 0.04;
        r.mat.opacity += (base * atlasVis - r.mat.opacity) * Math.min(1, dt * 6);
      });

      /* anatomy hotspots */
      hotspots.forEach((hs, i) => {
        const want = sim.mode === "atlas" && w[hs.part.stage] > 0.55 ? 1 : 0;
        hs.op += (want - hs.op) * Math.min(1, dt * 5);
        const vis = hs.op > 0.03;
        hs.mesh.visible = vis;
        if (!vis) return;
        const pulseS = 1 + 0.14 * Math.sin(tNow * 3 + i * 1.3);
        const sel = sim.selectedPartId === hs.part.id ? 1.55 : 1;
        const hov = sim.hoverPartId === hs.part.id ? 1.35 : 1;
        hs.mesh.scale.setScalar(pulseS * sel * hov);
        hs.ring.rotation.x = tNow * 1.4 + i;
        hs.ring.rotation.y = tNow * 0.9;
        hs.mat.opacity = 0.9 * hs.op;
        hs.ringMat.opacity = (sel > 1 ? 0.95 : 0.55) * hs.op;
      });

      /* gene orbs — spring physics toward orbit path */
      const K = 26;
      const D = 5.2;
      orbs.forEach((o, idx) => {
        o.angle += dt * o.speed * (reduced ? 0.35 : 1);
        tmpV.set(Math.cos(o.angle) * o.radius, 0, Math.sin(o.angle) * o.radius).applyQuaternion(o.quat);
        o.vel.x += ((tmpV.x - o.pos.x) * K - o.vel.x * D) * dt;
        o.vel.y += ((tmpV.y - o.pos.y) * K - o.vel.y * D) * dt;
        o.vel.z += ((tmpV.z - o.pos.z) * K - o.vel.z * D) * dt;
        o.pos.x += o.vel.x * dt;
        o.pos.y += o.vel.y * dt;
        o.pos.z += o.vel.z * dt;
        o.group.position.copy(o.pos);

        const active = sim.filter === null || o.pk === sim.filter;
        const dimTarget = active ? 1 : 0.14;
        o.dim += (dimTarget - o.dim) * Math.min(1, dt * 6);
        const isSel = idx === sim.selectedIdx;
        const hoverScale = isSel ? 1.65 : idx === sim.hoverIdx ? 1.45 : 1;
        const breathe = 0.92 + 0.08 * Math.sin(tNow * 2 + o.phase);
        o.group.scale.setScalar(o.dim * hoverScale * breathe * (0.15 + 0.85 * atlasVis));
        o.mat.opacity = 0.95 * o.dim * atlasVis;
        o.spriteMat.opacity = (isSel || idx === sim.hoverIdx ? 1 : 0.85) * o.dim * atlasVis;
      });

      /* hover raycast (atlas: body hotspots · orrery: gene orbs) */
      if (sim.mouseOn && !sim.dragging) {
        raycaster.setFromCamera(sim.mouse, camera);
        let label = "";
        if (sim.mode === "atlas") {
          const targets = hotspots.filter((h) => h.mesh.visible).map((h) => h.mesh);
          const hit = raycaster.intersectObjects(targets, false)[0];
          sim.hoverPartId = hit ? (hit.object.userData.partId as string) : null;
          sim.hoverIdx = -1;
          if (sim.hoverPartId) label = PART_BY_ID.get(sim.hoverPartId)?.label ?? "";
        } else {
          const hit = raycaster.intersectObjects(orbMeshes, false)[0];
          sim.hoverIdx = hit ? (hit.object.userData.orbIndex as number) : -1;
          sim.hoverPartId = null;
          if (sim.hoverIdx >= 0) label = orbs[sim.hoverIdx].gene.symbol;
        }
        el.style.cursor = label ? "pointer" : "grab";
        const tip = tooltipRef.current;
        if (tip) {
          if (label) {
            tip.textContent = label;
            tip.style.opacity = "1";
            tip.style.transform = `translate(${sim.mouseCX + 16}px, ${sim.mouseCY + 14}px)`;
          } else {
            tip.style.opacity = "0";
          }
        }
      } else if (tooltipRef.current) {
        tooltipRef.current.style.opacity = "0";
      }

      /* waves */
      for (let i = sim.waves.length - 1; i >= 0; i--) {
        const w = sim.waves[i];
        w.life -= dt * 1.1;
        const s = 1 + (1 - w.life) * 7;
        w.mesh.scale.setScalar(s);
        w.mat.opacity = 0.65 * Math.max(0, w.life);
        w.mesh.lookAt(camera.position);
        if (w.life <= 0) {
          scene.remove(w.mesh);
          w.mesh.geometry.dispose();
          w.mat.dispose();
          sim.waves.splice(i, 1);
        }
      }

      /* bursts */
      for (let i = sim.bursts.length - 1; i >= 0; i--) {
        const b = sim.bursts[i];
        b.life -= dt * 1.15;
        const pos = b.points.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let j = 0; j < pos.count; j++) {
          pos.setXYZ(
            j,
            pos.getX(j) + b.vel[j * 3] * dt,
            pos.getY(j) + b.vel[j * 3 + 1] * dt,
            pos.getZ(j) + b.vel[j * 3 + 2] * dt
          );
          b.vel[j * 3] *= 0.965;
          b.vel[j * 3 + 1] *= 0.965;
          b.vel[j * 3 + 2] *= 0.965;
        }
        pos.needsUpdate = true;
        b.mat.opacity = Math.max(0, b.life) * 0.95;
        if (b.life <= 0) {
          scene.remove(b.points);
          b.points.geometry.dispose();
          b.mat.dispose();
          sim.bursts.splice(i, 1);
        }
      }

      /* auto-cycle (orrery only, when idle and not playing the timeline) */
      if (sim.auto && !sim.playing && sim.mode === "orrery" && tNow - sim.lastInteract > 4) {
        sim.cycle += dt;
        if (sim.cycle > 5.5) {
          sim.cycle = 0;
          sim.morphTarget = (sim.lastNearest + 1) % 4;
          glowTarget.set(STAGES[(sim.lastNearest + 1) % 4].accent);
        }
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    /* ---------------- cleanup ---------------- */
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("dblclick", onDbl);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh || (o as THREE.Line).isLine || (o as THREE.Points).isPoints || (o as THREE.Sprite).isSprite) {
          mesh.geometry?.dispose();
          const mat = mesh.material as THREE.Material & { map?: THREE.Texture };
          mat.map?.dispose();
          mat.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- state → sim ---------------- */
  useEffect(() => {
    apiRef.current?.gotoStage(stage);
  }, [stage]);
  useEffect(() => {
    apiRef.current?.setFilter(filter);
  }, [filter]);
  useEffect(() => {
    apiRef.current?.setBeat(beat);
  }, [beat]);
  useEffect(() => {
    apiRef.current?.setAuto(auto);
  }, [auto]);
  useEffect(() => {
    apiRef.current?.setMode(mode);
    setSelectedPart(null);
    setPlaying(false);
  }, [mode]);
  useEffect(() => {
    apiRef.current?.setPlaying(playing);
  }, [playing]);

  const s = STAGES[stage];

  /* ---------------- render ---------------- */
  return (
    <div className="fixed inset-0 z-30 bg-abyss">
      <div ref={containerRef} className="absolute inset-0" />

      {/* scanline vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 110% 90% at 50% 42%, transparent 55%, rgba(2,8,11,0.6) 100%)" }}
      />

      {/* ---------- top-left: readout ---------- */}
      <div className="absolute left-4 md:left-7 top-[76px] pointer-events-none max-w-[46vw]">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.32em] text-faint">
          3D lab · physics genome orrery
        </div>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="font-display font-extrabold text-3xl md:text-5xl transition-colors duration-500" style={{ color: s.accent }}>
            {s.num}
          </span>
          <div>
            <div className="font-display font-bold text-lg md:text-2xl leading-tight">{s.name}</div>
            <div className="font-mono text-[10.5px] text-dim mt-1">{s.window}</div>
          </div>
        </div>
        <div className="mt-3 hidden md:block font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          {mode === "atlas"
            ? "click the glowing markers on the specimen to read its anatomy"
            : "drag · scroll · pinch — double-click fires a hormone pulse"}
        </div>
      </div>

      {/* ---------- top-right: counters ---------- */}
      <div className="absolute right-4 md:right-7 top-[76px] text-right pointer-events-none">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
          {ORB_GENES.length} genes in orbit
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint mt-1">
          8 pathway rings
        </div>
        {pulses > 0 && (
          <div className="mt-2 inline-block font-mono text-[10px] px-2.5 py-1 rounded border border-ecd/50 text-ecd bg-ecd/5">
            20E PULSE × {pulses}
          </div>
        )}
      </div>

      {/* ---------- left rail: pathway filters ---------- */}
      <div className="absolute left-4 md:left-7 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setFilter(null)}
          className="gene-chip text-left font-mono text-[10.5px] uppercase tracking-[0.16em] px-3 py-2 rounded-md border cursor-pointer"
          style={{
            borderColor: filter === null ? "#e9f5f0" : "rgba(28,59,70,0.9)",
            color: filter === null ? "#e9f5f0" : "#93aeb1",
            background: filter === null ? "rgba(233,245,240,0.07)" : "rgba(11,34,43,0.55)",
          }}
        >
          all pathways
        </button>
        {PATH_KEYS.map((pk, i) => {
          const on = filter === pk;
          const c = PATHWAYS[pk].color;
          return (
            <button
              key={pk}
              type="button"
              onClick={() => setFilter(on ? null : pk)}
              className="gene-chip flex items-center gap-2 text-left font-mono text-[10.5px] uppercase tracking-[0.14em] px-3 py-[7px] rounded-md border cursor-pointer"
              style={{
                borderColor: on ? c : "rgba(28,59,70,0.9)",
                color: on ? c : "#93aeb1",
                background: on ? `${c}12` : "rgba(11,34,43,0.55)",
                boxShadow: on ? `0 0 16px ${c}2e` : "none",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
              {pk}
              <span className="ml-auto pl-2 text-faint">{PATH_COUNTS[i]}</span>
            </button>
          );
        })}
      </div>

      {/* ---------- mobile filter row ---------- */}
      <div className="absolute left-0 right-0 top-[150px] lg:hidden px-3 flex gap-1.5 overflow-x-auto pointer-events-auto [scrollbar-width:none]">
        {PATH_KEYS.map((pk) => {
          const on = filter === pk;
          const c = PATHWAYS[pk].color;
          return (
            <button
              key={pk}
              type="button"
              onClick={() => setFilter(on ? null : pk)}
              className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] px-2.5 py-1.5 rounded-md border"
              style={{
                borderColor: on ? c : "rgba(28,59,70,0.9)",
                color: on ? c : "#93aeb1",
                background: "rgba(11,34,43,0.7)",
              }}
            >
              {pk}
            </button>
          );
        })}
      </div>

      {/* ---------- bottom-left: stage dossier ---------- */}
      <div className="absolute left-4 md:left-7 bottom-6 md:bottom-8 max-w-[340px] hidden sm:block pointer-events-none">
        <div className="border border-line rounded-lg bg-abyss/75 backdrop-blur-sm p-4">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-faint mb-2">stage dossier</div>
          <p className="text-[12.5px] text-dim leading-relaxed">{s.summary}</p>
          <div className="mt-3 font-mono text-[10px] text-dim uppercase tracking-[0.14em]">
            {stageGenes(stage).length} annotated genes · top drivers
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stageGenes(stage).slice(0, 8).map((g) => {
              const c = PATHWAYS[g.pathway].color;
              return (
                <span key={g.symbol} className="font-mono text-[10.5px] px-2 py-0.5 rounded border" style={{ borderColor: `${c}55`, color: c }}>
                  {g.symbol}
                </span>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onOpenAtlas}
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-seg hover:text-ink transition-colors cursor-pointer pointer-events-auto"
          >
            ↳ full gene tables in the atlas
          </button>
        </div>
      </div>

      {/* ---------- gene inspector ---------- */}
      {selected && (
        <div className="absolute right-3 md:right-7 top-[200px] md:top-[150px] w-[300px] max-w-[86vw]">
          <div
            className="border rounded-xl bg-abyss/85 backdrop-blur-md p-5"
            style={{ borderColor: `${PATHWAYS[selected.pathway].color}66`, boxShadow: `0 0 40px ${PATHWAYS[selected.pathway].color}1c` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <em className="font-mono font-bold text-xl" style={{ color: PATHWAYS[selected.pathway].color }}>
                  {selected.symbol}
                </em>
                <div className="text-dim text-[12px] italic mt-0.5">{selected.alias}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="font-mono text-faint hover:text-ink text-lg leading-none px-1 cursor-pointer"
                aria-label="Close gene panel"
              >
                ×
              </button>
            </div>
            <div className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.18em]" style={{ color: PATHWAYS[selected.pathway].color }}>
              ▸ {selected.pathway}
              {selected.klass && <span className="text-faint ml-2">· {selected.klass}</span>}
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink/90">{selected.fn}</p>
            <div
              className="mt-3 pt-3 border-t text-[11.5px] leading-relaxed text-dim"
              style={{ borderColor: `${PATHWAYS[selected.pathway].color}33` }}
            >
              {selected.note}
            </div>
          </div>
        </div>
      )}

      {/* ---------- anatomy part panel ---------- */}
      {selectedPart && mode === "atlas" && (
        <div className="absolute right-3 md:right-7 top-[150px] lg:top-[150px] w-[302px] max-w-[86vw]">
          <div
            className="border rounded-xl bg-abyss/85 backdrop-blur-md p-5"
            style={{
              borderColor: `${STAGES[selectedPart.stage].accent}66`,
              boxShadow: `0 0 40px ${STAGES[selectedPart.stage].accent}1c`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.22em] px-2 py-1 rounded border"
                style={{
                  color: STAGES[selectedPart.stage].accent,
                  borderColor: `${STAGES[selectedPart.stage].accent}55`,
                }}
              >
                {STAGES[selectedPart.stage].num} · anatomy atlas
              </span>
              <button
                type="button"
                onClick={() => setSelectedPart(null)}
                className="font-mono text-faint hover:text-ink text-lg leading-none px-1 cursor-pointer"
                aria-label="Close anatomy panel"
              >
                ×
              </button>
            </div>
            <div className="mt-3 font-display font-bold text-xl leading-tight">
              {selectedPart.label}
            </div>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink/90">{selectedPart.fn}</p>
            <div className="mt-3 pt-3 border-t border-line/60">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-faint mb-2">
                genes at work here
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedPart.genes.map((sym) => {
                  const g = GENE_BY_SYMBOL.get(sym);
                  const c = g ? PATHWAYS[g.pathway].color : "#93aeb1";
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => {
                        if (g) {
                          setSelected(g);
                          setSelectedPart(null);
                        }
                      }}
                      className="gene-chip font-mono text-[11px] px-2 py-1 rounded border cursor-pointer"
                      style={{ borderColor: `${c}55`, color: c, background: `${c}0d` }}
                      title={g ? g.fn : sym}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
              {GENE_BY_SYMBOL.get(selectedPart.genes[0]) && (
                <div className="mt-2 font-mono text-[9.5px] text-faint">
                  ↳ click a gene for its molecular function
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------- morph timeline ---------- */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[168px] md:bottom-[104px] w-[min(94vw,640px)] z-20">
        <div className="border border-line rounded-xl bg-abyss/80 backdrop-blur-md px-4 pt-3 pb-2.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="gene-chip w-9 h-9 shrink-0 rounded-lg border border-ecd/60 bg-ecd/5 text-ecd grid place-items-center cursor-pointer hover:bg-ecd/15"
              style={{ boxShadow: "0 0 16px rgba(110,240,163,0.2)" }}
              aria-label={playing ? "Pause lifecycle" : "Play full lifecycle"}
            >
              {playing ? (
                <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor">
                  <rect x="0" y="0" width="4" height="12" rx="1" />
                  <rect x="7" y="0" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor">
                  <path d="M0 0 L11 6 L0 12 Z" />
                </svg>
              )}
            </button>
            <div className="relative flex-1">
              <input
                ref={scrubRef}
                type="range"
                min={0}
                max={1000}
                defaultValue={0}
                onPointerDown={() => {
                  scrubbingRef.current = true;
                }}
                onPointerUp={() => {
                  scrubbingRef.current = false;
                }}
                onChange={(e) => {
                  apiRef.current?.setMorph((Number(e.target.value) / 1000) * 3);
                }}
                className="w-full accent-[#6ef0a3] cursor-pointer"
                aria-label="Metamorphosis timeline"
              />
              <div className="flex justify-between mt-0.5 px-0.5">
                {STAGES.map((st, i) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => {
                      setPlaying(false);
                      apiRef.current?.setMorph(i);
                    }}
                    className="font-mono text-[8.5px] tracking-[0.14em] cursor-pointer transition-colors hover:opacity-100"
                    style={{ color: stage === i ? st.accent : "#5d7a80", opacity: 0.85 }}
                  >
                    {st.name.split(" · ")[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <span ref={hoursRef} className="font-mono text-[10.5px] text-ecd w-[64px] text-right shrink-0">
              T+000 h
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2.5 min-h-[32px]">
            <span ref={captionRef} className="font-display font-bold text-[13px] text-jh shrink-0">
              Embryogenesis
            </span>
            <span ref={subRef} className="text-[11px] text-dim leading-snug">
              bcd/nos gradients → gap → pair-rule → Hox: one cell becomes a segmented larva.
            </span>
          </div>
        </div>
      </div>

      {/* ---------- bottom dock ---------- */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 md:right-7 w-[min(94vw,620px)] sm:w-auto">
        <div className="border border-line rounded-xl bg-abyss/80 backdrop-blur-md px-3 py-3 flex items-center gap-2 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => setStage((stage + 3) % 4)}
            className="font-mono text-dim hover:text-ink px-2 py-2 cursor-pointer"
            aria-label="Previous stage"
          >
            ‹
          </button>
          {STAGES.map((st, i) => {
            const on = i === stage;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setStage(i)}
                className="gene-chip font-mono text-[10px] md:text-[11px] uppercase tracking-[0.1em] px-2.5 md:px-3.5 py-2 rounded-lg border cursor-pointer"
                style={{
                  borderColor: on ? st.accent : "rgba(28,59,70,0.9)",
                  color: on ? st.accent : "#93aeb1",
                  background: on ? `${st.accent}14` : "rgba(11,34,43,0.6)",
                  boxShadow: on ? `0 0 18px ${st.accent}33` : "none",
                }}
              >
                <span className="opacity-60 mr-1.5">{st.num}</span>
                {st.name.split(" · ")[0]}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setStage((stage + 1) % 4)}
            className="font-mono text-dim hover:text-ink px-2 py-2 cursor-pointer"
            aria-label="Next stage"
          >
            ›
          </button>

          <span className="w-px h-7 bg-line mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={() => setAuto(!auto)}
            className="font-mono text-[10px] uppercase tracking-[0.14em] px-3 py-2 rounded-lg border cursor-pointer transition-colors"
            style={{
              borderColor: auto ? "#6ef0a3" : "rgba(28,59,70,0.9)",
              color: auto ? "#6ef0a3" : "#93aeb1",
              background: auto ? "rgba(110,240,163,0.1)" : "rgba(11,34,43,0.6)",
            }}
          >
            auto {auto ? "●" : "○"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "atlas" ? "orrery" : "atlas")}
            className="font-mono text-[10px] uppercase tracking-[0.14em] px-3 py-2 rounded-lg border cursor-pointer transition-colors"
            style={{
              borderColor: mode === "atlas" ? "#4fe0d0" : "rgba(28,59,70,0.9)",
              color: mode === "atlas" ? "#4fe0d0" : "#93aeb1",
              background: mode === "atlas" ? "rgba(79,224,208,0.1)" : "rgba(11,34,43,0.6)",
              boxShadow: mode === "atlas" ? "0 0 18px rgba(79,224,208,0.25)" : "none",
            }}
            title="Toggle anatomy atlas mode"
          >
            {mode === "atlas" ? "◉ atlas" : "○ atlas"}
          </button>

          <button
            type="button"
            onClick={() => apiRef.current?.pulse()}
            className="gene-chip font-mono text-[10px] uppercase tracking-[0.14em] px-3 py-2 rounded-lg border border-jh/60 text-jh bg-jh/5 hover:bg-jh/15 cursor-pointer"
            style={{ boxShadow: "0 0 18px rgba(255,196,79,0.15)" }}
          >
            ⚡ 20E pulse
          </button>

          {stage === 3 && (
            <button
              type="button"
              onClick={() => setBeat(!beat)}
              className="font-mono text-[10px] uppercase tracking-[0.14em] px-3 py-2 rounded-lg border cursor-pointer transition-colors"
              style={{
                borderColor: beat ? "#c4a9ff" : "rgba(28,59,70,0.9)",
                color: beat ? "#c4a9ff" : "#93aeb1",
                background: beat ? "rgba(196,169,255,0.1)" : "rgba(11,34,43,0.6)",
              }}
            >
              wings {beat ? "fast" : "idle"}
            </button>
          )}
        </div>
      </div>

      {/* hover tooltip */}
      <div
        ref={tooltipRef}
        className="fixed top-0 left-0 z-50 pointer-events-none font-mono text-[11px] px-2.5 py-1.5 rounded-md border border-ecd/40 bg-abyss/90 text-ink whitespace-nowrap transition-opacity duration-150"
        style={{ opacity: 0, boxShadow: "0 0 18px rgba(110,240,163,0.15)" }}
      />
    </div>
  );
}
