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
      mouseOn: false,
      waves: [] as Wave[],
      bursts: [] as Burst[],
      pointers: new Map<number, { x: number; y: number }>(),
      pinchDist: 0,
    };

    const tmpV = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();

    const spawnBurst = (hex: string, power = 1) => {
      const n = 90;
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
      if (i === sim.targetStage) return;
      sim.targetStage = i;
      sim.cycle = 0;
      sim.kick = Math.max(sim.kick, 0.55);
      glowTarget.set(STAGES[i].accent);
      spawnBurst(STAGES[i].accent, 0.9);
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
      pulse,
    };

    /* ---------------- pointer interaction ---------------- */
    const el = renderer.domElement;

    const updateMouse = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      sim.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
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
        const hit = raycaster.intersectObjects(orbMeshes, false)[0];
        if (hit) {
          const idx = hit.object.userData.orbIndex as number;
          sim.selectedIdx = idx;
          setSelected(orbs[idx].gene);
          tmpV.copy(orbs[idx].pos).normalize().multiplyScalar(1.6);
          orbs[idx].vel.add(tmpV);
        } else {
          sim.selectedIdx = -1;
          setSelected(null);
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

      /* stage morph */
      for (let i = 0; i < 4; i++) {
        const target = i === sim.targetStage ? 1 : 0;
        sim.anim[i] += (target - sim.anim[i]) * Math.min(1, dt * 4.2);
        const v = sim.anim[i];
        const h = handles[i];
        h.group.visible = v > 0.02;
        if (!h.group.visible) continue;
        const eased = v * v * (3 - 2 * v);
        const sc = h.baseScale * (0.05 + 0.95 * eased) * (1 + sim.kick * 0.12 * eased);
        h.group.scale.setScalar(sc);
        setGroupOpacity(h.group, eased);
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

      /* rings filter */
      rings.forEach((r, i) => {
        const target = sim.filter === null ? 0.16 : sim.filter === PATH_KEYS[i] ? 0.55 : 0.04;
        r.mat.opacity += (target - r.mat.opacity) * Math.min(1, dt * 6);
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
        o.group.scale.setScalar(o.dim * hoverScale * breathe);
        o.mat.opacity = 0.95 * o.dim;
        o.spriteMat.opacity = (isSel || idx === sim.hoverIdx ? 1 : 0.85) * o.dim;
      });

      /* hover raycast */
      if (sim.mouseOn && !sim.dragging) {
        raycaster.setFromCamera(sim.mouse, camera);
        const hit = raycaster.intersectObjects(orbMeshes, false)[0];
        sim.hoverIdx = hit ? (hit.object.userData.orbIndex as number) : -1;
        el.style.cursor = sim.hoverIdx >= 0 ? "pointer" : "grab";
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

      /* auto-cycle */
      if (sim.auto && tNow - sim.lastInteract > 4) {
        sim.cycle += dt;
        if (sim.cycle > 5.5) {
          sim.cycle = 0;
          stageSetterRef.current((sim.targetStage + 1) % 4);
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
          drag · scroll · pinch — double-click fires a hormone pulse
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
    </div>
  );
}
