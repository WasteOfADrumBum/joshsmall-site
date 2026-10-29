import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Look } from "@/lib/look";

/**
 * Chibi Joshua (public/models/chibi.glb). The model comes from Joshua's mock-up; this file tunes it
 * to match his portrait: a curly top knot over the undercut instead of a swept quiff, a long auburn
 * beard, blue-grey eyes, rectangular navy glasses and gauged ears. The head turns toward the cursor
 * from the neck, the eyes a little further, and the body follows slightly.
 *
 * This module pulls in three.js, so it is only ever loaded with a dynamic import.
 */

export type AvatarScene = {
  render: (look: Look, t: number, still: boolean) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

/** Every part that belongs to the head, by node name in the model. */
const HEAD_PART =
  /^(HERO_head|HERO_ear|Ear_inner|HERO_brown_undercut|Undercut_ridge|HERO_eye|Eye_glint|HERO_brow|HERO_square_glasses|Glasses_|HERO_glasses|HERO_nose|HERO_full_brown_beard|HERO_sideburn|Beard_|HERO_smile|HERO_moustache|Moustache_)/;
const BEARD_PART = /^(HERO_full_brown_beard|Beard_flowing_strand)/;
const NECK = new THREE.Vector3(0, 1.8, 0);
/** Head centre and radii, from the model's head mesh. */
const HEAD = { x: 0, y: 2.29, z: -0.02, rx: 0.515, ry: 0.565, rz: 0.407 };

const colors = {
  hairTop: "#2e1c12",
  bun: "#3a2214",
  bunTip: "#7a4524",
  beard: "#3d2112",
  beardStrand: "#5a2f18",
  beardHighlight: "#8a4f28",
  iris: "#6f8ea3",
  glasses: "#1b2233",
  gauge: "#060607",
  metal: "#b8b8bf",
};

/** Cheap deterministic bumps, enough to read as curls under light. */
const curl = (x: number, y: number, z: number, f: number) =>
  (Math.sin(x * f * 1.7 + y * f * 0.6 + 1.3) +
    Math.sin(y * f * 2.3 - z * f * 0.8 + 0.4) +
    Math.sin(z * f * 1.9 + x * f * 1.1 + 2.1)) /
  3;

function curlySphere(radius: number) {
  const g = new THREE.SphereGeometry(radius, 40, 28);
  const pos = g.attributes.position;
  const normal = g.attributes.normal;
  const tint = new Float32Array(pos.count * 3);
  const a = new THREE.Color(colors.bun);
  const b = new THREE.Color(colors.bunTip);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = curl(x, y, z, 40);
    const k = radius * 0.08 * n;
    pos.setXYZ(i, x + normal.getX(i) * k, y + normal.getY(i) * k, z + normal.getZ(i) * k);
    c.copy(a).lerp(b, THREE.MathUtils.clamp(0.45 + n * 0.7, 0, 1));
    tint.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(tint, 3));
  g.computeVertexNormals();
  return g;
}

/** Stretch the beard to his real length (well down the chest) and taper it toward the end. */
function lengthenBeard(mesh: THREE.Mesh, top: number, stretch: number) {
  const g = mesh.geometry;
  const pos = g.attributes.position;
  const bottom = 1.52;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y >= top) continue;
    const t = (top - y) / (top - bottom);
    pos.setY(i, top - (top - y) * stretch);
    pos.setX(i, pos.getX(i) * (1 - 0.28 * t));
    pos.setZ(i, pos.getZ(i) + 0.05 * t);
  }
  // The file stores normals as 8-bit; rebuild them as floats so the sums don't clip.
  g.deleteAttribute("normal");
  g.computeVertexNormals();
  g.computeBoundingSphere();
}

function tune(model: THREE.Object3D, pivot: THREE.Group) {
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const heads: THREE.Object3D[] = [];
  model.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const m = o.material as THREE.MeshStandardMaterial;
    materials.set(m.name, m);
    if (o.name.startsWith("HERO_swept")) o.visible = false;
    if (BEARD_PART.test(o.name)) lengthenBeard(o, 2.2, 1.45);
    if (o.name.startsWith("HERO_square_glasses")) o.geometry.scale(1.04, 0.84, 1).translate(0, 0.39, 0);
    if (HEAD_PART.test(o.name)) heads.push(o);
  });

  materials.get("Deep brown beard")?.color.set(colors.beard);
  materials.get("Brown beard strands")?.color.set(colors.beardStrand);
  materials.get("Beard strand highlights")?.color.set(colors.beardHighlight);
  materials.get("Dark brown eyes")?.color.set(colors.iris);
  materials.get("Black acetate glasses")?.color.set(colors.glasses);

  for (const part of heads) pivot.attach(part);

  // Slicked-back top and a curly top knot where the swept quiff was.
  const hair = new THREE.MeshStandardMaterial({ color: colors.hairTop, roughness: 0.55 });
  const top = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.38), hair);
  top.scale.set(HEAD.rx * 1.035, HEAD.ry * 1.035, HEAD.rz * 1.06);
  top.position.set(HEAD.x, HEAD.y + 0.02, HEAD.z - 0.02);
  top.rotation.x = -0.22;
  const bunMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
  const bun = new THREE.Mesh(curlySphere(0.19), bunMat);
  bun.position.set(0, 2.93, -0.16);
  bun.scale.set(1, 0.9, 1);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 10, 28), hair);
  band.position.set(0, 2.79, -0.13);
  band.rotation.x = Math.PI / 2 + 0.3;

  // Black gauges in both lobes and a small hoop up top.
  const gaugeMat = new THREE.MeshStandardMaterial({ color: colors.gauge, roughness: 0.25, metalness: 0.3 });
  const metal = new THREE.MeshStandardMaterial({ color: colors.metal, roughness: 0.25, metalness: 1 });
  const extras: THREE.Object3D[] = [top, bun, band];
  for (const side of [-1, 1]) {
    const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 24), gaugeMat);
    gauge.position.set(side * 0.57, 2.2, 0.0);
    gauge.rotation.z = Math.PI / 2;
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.009, 8, 20), metal);
    hoop.position.set(side * 0.6, 2.43, -0.01);
    hoop.rotation.y = Math.PI / 2;
    extras.push(gauge, hoop);
  }
  // These were placed in model space; the pivot sits at the neck.
  for (const e of extras) {
    e.position.sub(NECK);
    pivot.add(e);
  }

  // Eyes: irises and glints lead the head, and to blink each eye squashes toward its own centre.
  const eyes = heads
    .filter((o): o is THREE.Mesh => o instanceof THREE.Mesh && /^(HERO_eye|Eye_glint)/.test(o.name))
    .map((mesh) => {
      mesh.geometry.computeBoundingBox();
      return {
        mesh,
        home: mesh.position.clone(),
        centre: mesh.geometry.boundingBox!.getCenter(new THREE.Vector3()).y,
        pupil: !mesh.name.startsWith("HERO_eye_white"),
      };
    });
  return eyes;
}

export async function loadChibiScene(canvas: HTMLCanvasElement, url: string): Promise<AvatarScene> {
  const gltf = await new GLTFLoader().loadAsync(url);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight("#dfe6ff", "#2a1d18", 1.4));
  const key = new THREE.DirectionalLight("#fff1e4", 2.6);
  key.position.set(-2, 4, 6);
  const warmRim = new THREE.DirectionalLight("#ff9440", 3);
  warmRim.position.set(4, 3, -3);
  const coolRim = new THREE.DirectionalLight("#4a86ff", 1.4);
  coolRim.position.set(-5, 2, -2);
  scene.add(key, warmRim, coolRim);

  const body = gltf.scene;
  scene.add(body);
  const pivot = new THREE.Group();
  pivot.position.copy(NECK);
  body.add(pivot);
  const eyes = tune(body, pivot);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.7, 6.3);
  camera.lookAt(0, 1.58, 0);

  let width = 1;
  let height = 1;

  return {
    render(look, t, still) {
      pivot.rotation.y = look.x * 0.55;
      pivot.rotation.x = look.y * 0.3;
      pivot.rotation.z = -look.x * 0.06;
      body.rotation.y = look.x * 0.18;
      body.position.y = still ? 0 : Math.sin(t / 900) * 0.012;
      // Eyes lead the head a little; a quick blink every few seconds.
      const blink = !still && Math.abs(((t / 1000) % 5.2) - 5.05) < 0.08;
      const lid = blink ? 0.12 : 1;
      for (const { mesh, home, centre, pupil } of eyes) {
        mesh.scale.y = lid;
        mesh.position.set(
          home.x + (pupil ? look.x * 0.025 : 0),
          home.y + centre * (1 - lid) - (pupil ? look.y * 0.02 : 0),
          home.z,
        );
      }
      renderer.render(scene, camera);
    },
    resize(w, h) {
      if (w === width && h === height) return;
      width = w;
      height = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    dispose() {
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
    },
  };
}
