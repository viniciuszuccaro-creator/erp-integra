
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Box, Maximize2, Sparkles } from 'lucide-react';
import * as THREE from 'three';

/**
 * Gêmeo Digital 3D da Peça em Produção
 * Visualização 3D simplificada usando Three.js
 */
export default function DigitalTwin3D({ itemProducao }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !itemProducao) return;

    // Setup Three.js
    const width = containerRef.current.clientWidth;
    const height = 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10, 0x94a3b8, 0xe2e8f0);
    scene.add(gridHelper);

    // Criar geometria baseada nos dados
    const geometria = criarGeometriaItem(itemProducao);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.5,
      roughness: 0.5
    });
    const mesh = new THREE.Mesh(geometria, material);
    scene.add(mesh);

    // Wireframe
    const wireframe = new THREE.EdgesGeometry(geometria);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1e293b });
    const lineSegments = new THREE.LineSegments(wireframe, lineMaterial);
    mesh.add(lineSegments);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Animação de rotação
    let rotation = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      rotation += 0.005;
      mesh.rotation.y = rotation;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [itemProducao]);

  const criarGeometriaItem = (item) => {
    // Converter medidas de cm para unidades Three.js (dividir por 100)
    const comprimento = (item.comprimento || 300) / 100;
    const largura = (item.largura || 20) / 100;
    const altura = (item.altura || 20) / 100;

    // Criar geometria simples baseada no tipo
    if (item.tipo_peca === 'Coluna' || item.tipo_peca === 'Viga') {
      return new THREE.BoxGeometry(largura, altura, comprimento);
    } else if (item.tipo_peca === 'Bloco') {
      return new THREE.BoxGeometry(largura, altura, comprimento);
    } else {
      return new THREE.BoxGeometry(largura, altura, comprimento);
    }
  };

  if (!itemProducao) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-slate-500">
          <Box className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecione um item para visualizar em 3D</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-600" />
            Gêmeo Digital 3D
          </CardTitle>
          <Badge className="bg-purple-600">
            <Maximize2 className="w-3 h-3 mr-1" />
            Vista 3D
          </Badge>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          {itemProducao.tipo_peca} - {itemProducao.identificador}
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div ref={containerRef} className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50"></div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <p className="text-blue-700">Comprimento</p>
            <p className="font-bold text-blue-900">{itemProducao.comprimento || '-'} cm</p>
          </div>
          <div className="p-2 bg-green-50 rounded border border-green-200">
            <p className="text-green-700">Largura</p>
            <p className="font-bold text-green-900">{itemProducao.largura || '-'} cm</p>
          </div>
          <div className="p-2 bg-orange-50 rounded border border-orange-200">
            <p className="text-orange-700">Altura</p>
            <p className="font-bold text-orange-900">{itemProducao.altura || '-'} cm</p>
          </div>
        </div>

        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs text-purple-800">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Modelo 3D gerado automaticamente a partir das dimensões do projeto
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
