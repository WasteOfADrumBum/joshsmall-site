import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { JoshuaScene } from "./joshuaScene";

/**
 * Joshua's phone scan (public/models/joshua.glb). The model is trimmed of room scraps, turned to
 * face forward, quantized and given a WebP texture, so it's about 0.9 MB. Its lighting is baked into
 * the texture, so it's drawn unlit. The whole bust turns from a pivot at the neck; the scan has no
 * rig, and the back of the head was never captured, so the turn stays small.
 */

/** Neck position in the scan's own coordinates (metres, y up, facing +z). */
const PIVOT = new THREE.Vector3(0, 1.0, -0.1);
const MAX_YAW = 0.4;
const MAX_PITCH = 0.15;

export async function loadScanScene(canvas: HTMLCanvasElement, url: string): Promise<JoshuaScene> {
  const gltf = await new GLTFLoader().loadAsync(url);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pivot = new THREE.Group();
  scene.add(pivot);
  gltf.scene.position.copy(PIVOT).negate();
  pivot.add(gltf.scene);

  // Frame head to chest; the cut-off bottom of the scan sits below the box.
  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 20);
  camera.position.set(-0.06, 0.08, 3.1);
  camera.lookAt(-0.06, 0.06, 0);

  let width = 1;
  let height = 1;

  return {
    render(look) {
      pivot.rotation.y = look.x * MAX_YAW;
      pivot.rotation.x = look.y * MAX_PITCH;
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
          const materials: THREE.Material[] = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of materials) {
            if (m instanceof THREE.MeshBasicMaterial) m.map?.dispose();
            m.dispose();
          }
        }
      });
      renderer.dispose();
    },
  };
}
