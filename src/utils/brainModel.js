import * as THREE from 'three';

export const initBrainModel = (container) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 10, 5);
  scene.add(directionalLight);

  const brainGroup = new THREE.Group();

  // Core brain structure (sphere)
  const brainGeometry = new THREE.SphereGeometry(1.5, 32, 32);
  const brainMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    wireframe: true,
    emissive: 0x222222,
    transparent: true,
    opacity: 0.8,
  });
  const brain = new THREE.Mesh(brainGeometry, brainMaterial);
  brainGroup.add(brain);

  // Neural connections (random lines)
  const neuralMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
  });
  for (let i = 0; i < 15; i++) {
    const points = [];
    for (let j = 0; j < 2; j++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = Math.random() * 1.4;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      points.push(new THREE.Vector3(x, y, z));
    }
    const neuralGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(neuralGeometry, neuralMaterial);
    brainGroup.add(line);
  }

  // Neural nodes (small spheres)
  const nodeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 20; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const radius = Math.random() * 1.4;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(x, y, z);
    brainGroup.add(node);
  }

  // Orbiting rings
  const ringGeometry = new THREE.RingGeometry(2, 2.1, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2,
  });
  const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
  brainGroup.add(ring1);
  const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
  ring2.rotation.x = Math.PI / 2;
  brainGroup.add(ring2);
  const ring3 = new THREE.Mesh(ringGeometry, ringMaterial);
  ring3.rotation.y = Math.PI / 2;
  brainGroup.add(ring3);

  scene.add(brainGroup);

  function animate() {
    requestAnimationFrame(animate);
    brainGroup.rotation.y += 0.005;
    brainGroup.rotation.x += 0.002;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  });

  return { scene, camera, renderer };
};