import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';

function BrainModel() {
  const brainGroup = useRef();

  useEffect(() => {
    const group = brainGroup.current;
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
    group.add(brain);

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
      group.add(line);
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
      group.add(node);
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
    group.add(ring1);
    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring2.rotation.x = Math.PI / 2;
    group.add(ring2);
    const ring3 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring3.rotation.y = Math.PI / 2;
    group.add(ring3);
  }, []);

  useFrame(() => {
    if (brainGroup.current) {
      brainGroup.current.rotation.y += 0.005;
      brainGroup.current.rotation.x += 0.002;
    }
  });

  return (
    <group ref={brainGroup}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={0.8} />
    </group>
  );
}

function Hero({ title, subtitle, showButtons = false }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="reveal-text">{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {showButtons && (
          <div className="cta-buttons">
            <a href="#features" className="btn primary">Explore Features</a>
            <a href="#contact" className="btn secondary">Get Started</a>
          </div>
        )}
      </div>
      <div className="hero-visual">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <BrainModel />
        </Canvas>
      </div>
    </section>
  );
}

export default Hero;