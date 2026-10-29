import * as THREE from "three";
import type { Look } from "@/lib/look";

/**
 * A 3D bust of Joshua built from primitives, styled on the portrait photo: top knot over an
 * undercut, rectangular navy glasses, blue-grey eyes, a long curly auburn beard, gauged ears
 * and a black hoodie. Lit like the photo, warm orange from the back right and blue from the left.
 *
 * This module pulls in three.js, so it is only ever loaded with a dynamic import.
 */

export type JoshuaScene = {
  render: (look: Look, t: number, still: boolean) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

const palette = {
  skin: "#f1b394",
  beard: "#3a2115",
  beardTip: "#8f522d",
  hair: "#3a2416",
  bun: "#5a331d",
  stubble: "#8f6e5c",
  glasses: "#1b2233",
  iris: "#7f99ab",
  hoodie: "#141418",
  cord: "#0b0b0d",
  metal: "#a3a3aa",
};

/** Cheap deterministic bumps, enough to read as curls under light. */
const curl = (x: number, y: number, z: number, f: number) =>
  (Math.sin(x * f * 1.7 + y * f * 0.6 + 1.3) +
    Math.sin(y * f * 2.3 - z * f * 0.8 + 0.4) +
    Math.sin(z * f * 1.9 + x * f * 1.1 + 2.1) +
    Math.sin((x + y + z) * f * 3.1) * 0.6) /
  3.6;

/** Long hair: ridges that run downward and wander a little, with fine curls on top. */
const strands = (x: number, y: number, z: number) => {
  const around = Math.atan2(z, x);
  return Math.sin(around * 38 + Math.sin(y * 2.4) * 2.2) * 0.55 + curl(x, y, z, 26) * 0.45;
};

/** Pushes each vertex along its normal by a hair pattern and tints it, so hair isn't a smooth blob. */
function curlify(
  geometry: THREE.BufferGeometry,
  amount: number,
  freq: number,
  base: string,
  tip: string,
  pattern: (x: number, y: number, z: number) => number = (x, y, z) => curl(x, y, z, freq),
) {
  const pos = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const colors = new Float32Array(pos.count * 3);
  const a = new THREE.Color(base);
  const b = new THREE.Color(tip);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = pattern(x, y, z);
    pos.setXYZ(i, x + normal.getX(i) * n * amount, y + normal.getY(i) * n * amount, z + normal.getZ(i) * n * amount);
    c.copy(a).lerp(b, THREE.MathUtils.clamp(0.5 + n * 0.6 + curl(z, x, y, freq * 2.3) * 0.25, 0, 1));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** The beard: a tube that starts at the cheeks, hangs well down the chest, and narrows to a rounded end. */
function beardGeometry() {
  const length = 2.65;
  const g = new THREE.CylinderGeometry(1, 1, 1, 56, 48, false);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = 0.5 - pos.getY(i); // 0 at the top, 1 at the bottom
    const angle = Math.atan2(pos.getZ(i), pos.getX(i));
    // Round off the end, a little unevenly, like real hair.
    const end = (t > 0.8 ? Math.sqrt(Math.max(0, 1 - ((t - 0.8) / 0.2) ** 2)) : 1) * (1 + Math.sin(angle * 5) * 0.06 * t);
    const halfWidth =
      (t < 0.18 ? THREE.MathUtils.lerp(0.86, 0.97, t / 0.18) : THREE.MathUtils.lerp(0.97, 0.4, ((t - 0.18) / 0.82) ** 0.9)) * end;
    const halfDepth = THREE.MathUtils.lerp(0.6, 0.32, t) * end;
    const zCenter = THREE.MathUtils.lerp(0.14, 0.5, Math.min(1, t * 1.8));
    // Higher at the sideburns, lower in front so the mouth and moustache show.
    const near = Math.max(0, 1 - t / 0.3);
    const lift = near * (Math.cos(angle) ** 2 * 0.3 - Math.max(0, Math.sin(angle)) ** 2 * 0.1);
    pos.setXYZ(i, Math.cos(angle) * halfWidth, -t * length + lift, zCenter + Math.sin(angle) * halfDepth);
  }
  g.computeVertexNormals();
  return curlify(g, 0.04, 26, palette.beard, palette.beardTip, strands);
}

export function createJoshuaScene(canvas: HTMLCanvasElement): JoshuaScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 12.2);
  camera.lookAt(0, -0.35, 0);

  scene.add(new THREE.HemisphereLight("#cdd8ff", "#1a1010", 0.7));
  const key = new THREE.DirectionalLight("#ffe9d6", 2.4);
  key.position.set(-3, 3, 6);
  const warmRim = new THREE.DirectionalLight("#ff9440", 3.2);
  warmRim.position.set(4.5, 2.5, -3);
  const coolRim = new THREE.DirectionalLight("#4a86ff", 1.6);
  coolRim.position.set(-5, 1, -2.5);
  scene.add(key, warmRim, coolRim);

  const mat = (color: string, roughness = 0.7, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  const skin = mat(palette.skin, 0.55);
  const hairMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });

  const add = (parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material, p: number[] = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(p[0], p[1], p[2]);
    parent.add(mesh);
    return mesh;
  };

  // ----- Body: hoodie, hood and drawstrings. Stays put while the head turns.
  const body = new THREE.Group();
  scene.add(body);
  const torso = add(body, new THREE.CapsuleGeometry(0.95, 2.1, 12, 32), mat(palette.hoodie, 0.9), [0, -3.15, -0.2]);
  torso.rotation.z = Math.PI / 2;
  torso.scale.set(1.25, 1, 1.05);
  const hood = add(body, new THREE.TorusGeometry(0.7, 0.22, 16, 48), mat(palette.hoodie, 0.9), [0, -1.95, -0.3]);
  hood.rotation.x = Math.PI / 2.3;
  hood.scale.set(1.15, 1, 1);
  add(body, new THREE.CylinderGeometry(0.36, 0.42, 1.4, 24), skin, [0, -1.15, -0.05]);
  for (const side of [-1, 1]) {
    const cord = add(body, new THREE.CylinderGeometry(0.025, 0.025, 1.25, 8), mat(palette.cord, 0.6), [side * 0.48, -2.45, 0.92]);
    cord.rotation.z = side * 0.06;
    add(body, new THREE.CylinderGeometry(0.035, 0.035, 0.16, 10), mat(palette.metal, 0.3, { metalness: 0.9 }), [
      side * 0.52,
      -3.1,
      0.92,
    ]);
  }

  // ----- Head: everything in here turns toward the cursor, pivoting at the neck.
  const pivot = new THREE.Group();
  pivot.position.set(0, -0.6, 0);
  scene.add(pivot);
  const head = new THREE.Group();
  head.position.set(0, 1.55, 0);
  pivot.add(head);

  // Skull, with a narrower jaw.
  const skull = new THREE.SphereGeometry(1, 64, 48);
  {
    const p = skull.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const taper = y < 0 ? 1 - 0.2 * -y : 1;
      p.setX(i, p.getX(i) * 0.86 * taper);
      p.setY(i, y > 0 ? y * 0.93 : y);
      p.setZ(i, p.getZ(i) * 0.92 * (y < 0 ? 1 - 0.08 * -y : 1));
    }
    skull.computeVertexNormals();
  }
  add(head, skull, skin);

  // Nose.
  const nose = add(head, new THREE.SphereGeometry(0.12, 24, 16), skin, [0, -0.06, 0.86]);
  nose.scale.set(0.9, 1.4, 1);

  // Ears with black gauges and a small hoop.
  for (const side of [-1, 1]) {
    const ear = add(head, new THREE.SphereGeometry(0.2, 20, 16), skin, [side * 0.8, 0.02, -0.02]);
    ear.scale.set(0.45, 1, 0.7);
    const gauge = add(head, new THREE.CylinderGeometry(0.075, 0.075, 0.08, 20), mat("#050506", 0.25, { metalness: 0.4 }), [
      side * 0.86,
      -0.15,
      0.02,
    ]);
    gauge.rotation.z = Math.PI / 2;
    const hoop = add(head, new THREE.TorusGeometry(0.045, 0.011, 8, 20), mat(palette.metal, 0.25, { metalness: 1 }), [
      side * 0.88,
      0.17,
      0.02,
    ]);
    hoop.rotation.y = Math.PI / 2;
  }

  // Eyes turn a little further than the head, which makes it feel alive.
  const eyes: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.3, 0.1, 0.78);
    add(eye, new THREE.SphereGeometry(0.12, 24, 16), mat("#f4efe9", 0.3));
    const iris = add(eye, new THREE.SphereGeometry(0.068, 20, 12), mat(palette.iris, 0.3), [0, 0, 0.085]);
    iris.scale.z = 0.5;
    const pupil = add(eye, new THREE.SphereGeometry(0.03, 12, 8), mat("#050506", 0.2), [0, 0, 0.11]);
    pupil.scale.z = 0.5;
    head.add(eye);
    eyes.push(eye);
    const brow = add(head, new THREE.CapsuleGeometry(0.035, 0.24, 4, 10), mat(palette.hair, 0.9), [side * 0.31, 0.35, 0.8]);
    brow.rotation.z = Math.PI / 2 - side * 0.1;
  }

  // Glasses: rectangular navy frames, faint lenses, temples back to the ears.
  const frameMat = mat(palette.glasses, 0.35, { metalness: 0.3 });
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: "#cfe0ff",
    transparent: true,
    opacity: 0.12,
    roughness: 0.05,
    metalness: 0,
  });
  const lensShape = roundedRect(0.46, 0.31, 0.07);
  const rim = roundedRect(0.46, 0.31, 0.07);
  rim.holes.push(roundedRect(0.38, 0.23, 0.05));
  const rimGeo = new THREE.ExtrudeGeometry(rim, { depth: 0.035, bevelEnabled: false, curveSegments: 8 });
  for (const side of [-1, 1]) {
    add(head, rimGeo, frameMat, [side * 0.3, 0.12, 0.93]);
    add(head, new THREE.ShapeGeometry(lensShape), lensMat, [side * 0.3, 0.12, 0.945]);
    const temple = add(head, new THREE.BoxGeometry(0.03, 0.04, 0.95), frameMat, [side * 0.56, 0.17, 0.47]);
    temple.rotation.y = side * -0.12;
  }
  add(head, new THREE.BoxGeometry(0.16, 0.035, 0.03), frameMat, [0, 0.19, 0.95]);

  // Hair: shaved sides, slicked-back top, curly top knot.
  const stubble = new THREE.SphereGeometry(1.012, 48, 32, Math.PI / 2 + Math.PI / 3.2, Math.PI * 2 - (2 * Math.PI) / 3.2, 0, Math.PI * 0.58);
  const sides = add(head, stubble, mat(palette.stubble, 1));
  sides.scale.set(0.82, 1.04, 0.92);
  const top = add(head, new THREE.SphereGeometry(1.04, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.3), mat(palette.hair, 0.6), [0, 0.03, -0.04]);
  top.scale.set(0.84, 1.05, 0.95);
  top.rotation.x = -0.18;
  const bun = add(head, curlify(new THREE.SphereGeometry(0.36, 40, 28), 0.05, 14, palette.bun, palette.beardTip), hairMat, [0, 1.08, -0.3]);
  bun.scale.set(1, 0.9, 1);

  // Beard and moustache.
  add(head, beardGeometry(), hairMat, [0, -0.3, 0]);
  const stache = add(
    head,
    curlify(new THREE.CapsuleGeometry(0.075, 0.42, 6, 16), 0.015, 22, palette.beard, palette.beardTip),
    hairMat,
    [0.02, -0.36, 0.85],
  );
  // Tipped up on one side, for his half smile.
  stache.rotation.z = Math.PI / 2 - 0.1;
  stache.scale.set(0.75, 1, 0.8);

  let width = 1;
  let height = 1;

  return {
    render(look, t, still) {
      pivot.rotation.y = look.x * 0.5;
      pivot.rotation.x = look.y * 0.28;
      pivot.rotation.z = -look.x * 0.05;
      body.rotation.y = look.x * 0.12;
      for (const eye of eyes) {
        eye.rotation.y = look.x * 0.35;
        eye.rotation.x = look.y * 0.3;
        // A quick blink every few seconds.
        const blink = still ? 1 : Math.abs(((t / 1000) % 5.2) - 5.05) < 0.08 ? 0.1 : 1;
        eye.scale.y = blink;
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
