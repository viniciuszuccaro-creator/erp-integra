import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * V21.2 - Canvas 3D para Gêmeo Digital
 * Visualiza peças de produção em 3D com status em tempo real
 */
export default function Canvas3D({ itens = [], percentualConclusao = 0, tipo }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 10);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Luz
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xe0e0e0);
    scene.add(gridHelper);

    // V21.2: Renderizar Peças
    itens.forEach((item, idx) => {
      const concluido = item.apontado || false;
      const cor = concluido ? 0x10b981 : 0x6366f1; // Verde se concluído, roxo se pendente

      // Geometria simples (box)
      const largura = (item.largura || 10) / 100;
      const altura = (item.altura || 10) / 100;
      const comprimento = (item.comprimento || 100) / 100;

      const geometry = new THREE.BoxGeometry(largura, altura, comprimento);
      const material = new THREE.MeshStandardMaterial({ 
        color: cor,
        metalness: 0.3,
        roughness: 0.6,
        transparent: true,
        opacity: concluido ? 1 : 0.6
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(idx * 0.5 - (itens.length * 0.25), altura / 2, 0);

      // Borda
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);

      scene.add(mesh);
    });

    // Animação
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [itens]);

  return (
    <div className="relative">
      <div ref={mountRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-purple-300" />
      
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-3 rounded-lg border shadow-md">
        <p className="text-xs font-bold text-purple-900 mb-1">Gêmeo Digital 3D</p>
        <p className="text-xs text-purple-700">
          {itens.length} peças • {percentualConclusao.toFixed(0)}% concluído
        </p>
      </div>

      <div className="mt-3 text-xs text-slate-600 text-center">
        🖱️ Arraste para rotacionar • Scroll para zoom
      </div>
    </div>
  );
}