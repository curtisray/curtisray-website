import * as THREE from 'three';
import { motionTokens } from '../../design/motion';

/** A small portfolio scene inspired by TensorView's standing-wave preset and Plasma palette.
 * Source: github.com/curtisray/tensorview, src/tensor.js and src/colormaps.js.
 * Render during input and its damped settling, or on resize; no idle animation loop.
 */
export function createTensorScene(
  host: HTMLElement,
  onRotate: (x: number, y: number) => void,
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 18);
  const volume = new THREE.Group();
  scene.add(volume);
  scene.add(new THREE.AmbientLight(0xffffff, 2));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(3, 5, 8);
  scene.add(light);
  const geometry = new THREE.BoxGeometry(0.83, 0.83, 0.83);
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.22,
  });
  const colors = ['#0d0887', '#7e03a8', '#cb4677', '#f69446', '#f0f921'].map(
    (c) => new THREE.Color(c),
  );
  const materials: THREE.MeshStandardMaterial[] = [];
  const layers: THREE.Group[] = [];
  for (let t = 0; t < 4; t++) {
    const layer = new THREE.Group();
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        const value =
          (Math.sin((2 * Math.PI * t) / 4 - Math.hypot(x - 2, y - 2)) + 1) / 2;
        const index = Math.min(3, Math.floor(value * 4));
        const color = colors[index]
          .clone()
          .lerp(colors[index + 1], value * 4 - index);
        const material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.42,
          metalness: 0.08,
        });
        materials.push(material);
        const voxel = new THREE.Mesh(geometry, material);
        voxel.position.set(x - 1.5, y - 1.5, 0);
        const outline = new THREE.LineSegments(edges, lineMaterial);
        voxel.add(outline);
        layer.add(voxel);
      }
    layers.push(layer);
    volume.add(layer);
  }
  let visible = true;
  let disposed = false;
  const draw = () => {
    if (!disposed && visible && !document.hidden)
      renderer.render(scene, camera);
  };
  let frame = 0;
  let previousTime = 0;
  let pendingX = 0;
  let pendingY = 0;
  const stopRotation = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    pendingX = pendingY = 0;
  };
  const applyRotation = (x: number, y: number) => {
    volume.rotation.x = Math.max(-1.2, Math.min(1.2, volume.rotation.x + x));
    volume.rotation.y += y;
    onRotate(volume.rotation.x, volume.rotation.y);
    draw();
  };
  const settle = (time: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden) {
      stopRotation();
      return;
    }
    // Match TensorView's 0.06 damping at 60Hz, with the same feel at other refresh rates.
    const elapsed = previousTime
      ? Math.min(time - previousTime, 50)
      : 1000 / 60;
    previousTime = time;
    const fraction =
      1 - Math.pow(1 - motionTokens.orbitDamping, elapsed / (1000 / 60));
    const dx = pendingX * fraction,
      dy = pendingY * fraction;
    pendingX -= dx;
    pendingY -= dy;
    applyRotation(dx, dy);
    if (Math.abs(pendingX) + Math.abs(pendingY) > 0.0001)
      frame = requestAnimationFrame(settle);
    else {
      applyRotation(pendingX, pendingY);
      stopRotation();
    }
  };
  const rotateBy = (x: number, y: number, damped: boolean) => {
    if (!damped) {
      stopRotation();
      applyRotation(x, y);
      return;
    }
    pendingX += x;
    pendingY += y;
    if (!frame) frame = requestAnimationFrame(settle);
  };
  const setPose = (x: number, y: number, separation: number) => {
    stopRotation();
    volume.rotation.set(x, y, 0);
    layers.forEach((layer, index) => {
      layer.position.z = (index - 1.5) * (1 + separation * 0.85);
    });
    draw();
  };
  const visibilityChange = () => {
    if (document.hidden) stopRotation();
    else draw();
  };
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    // Keep even the separated cube within the narrow mobile frame.
    camera.position.z = camera.aspect < 1 ? 21 : 18;
    camera.updateProjectionMatrix();
    draw();
  });
  resize.observe(host);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) stopRotation();
    draw();
  });
  observer.observe(host);
  document.addEventListener('visibilitychange', visibilityChange);
  return {
    setPose,
    rotateBy,
    stopRotation,
    destroy() {
      disposed = true;
      stopRotation();
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibilityChange);
      geometry.dispose();
      edges.dispose();
      lineMaterial.dispose();
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
