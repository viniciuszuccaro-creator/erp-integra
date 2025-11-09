import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box, MapPin, Package } from "lucide-react";
import * as THREE from "three";

/**
 * V21.4 - Gêmeo Digital 3D do Centro de Distribuição
 * Visualização 3D do layout do CD com ocupação em tempo real
 */
export default function GemeoDigital3D({ localEstoque, produtos }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Configurar cena Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 15, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Chão do CD
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe2e8f0,
      side: THREE.DoubleSide 
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Criar zonas de armazenagem
    const zonas = localEstoque.zonas_armazenagem || [];
    
    zonas.forEach((zona, zIdx) => {
      const corredores = zona.corredores || [];
      
      corredores.forEach((corredor, cIdx) => {
        const prateleiras = corredor.prateleiras || [];
        
        prateleiras.forEach((prat, pIdx) => {
          // Calcular posição 3D
          const x = (zIdx - zonas.length / 2) * 5;
          const z = (cIdx - corredores.length / 2) * 3;
          const y = pIdx * 1.5;

          const ocupacao = prat.capacidade_kg > 0 
            ? (prat.ocupado_kg / prat.capacidade_kg)
            : 0;

          // Cor baseada em ocupação
          const cor = ocupacao > 0.9 ? 0xef4444 :
                      ocupacao > 0.7 ? 0xf59e0b :
                      ocupacao > 0.3 ? 0x3b82f6 :
                      0x10b981;

          // Criar prateleira 3D
          const geometry = new THREE.BoxGeometry(1, 0.2, 1);
          const material = new THREE.MeshStandardMaterial({ color: cor });
          const prateleira = new THREE.Mesh(geometry, material);
          
          prateleira.position.set(x, y, z);
          scene.add(prateleira);

          // Adicionar label (simulado com pequeno cubo)
          const labelGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
          const labelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
          const label = new THREE.Mesh(labelGeometry, labelMaterial);
          label.position.set(x, y + 0.3, z);
          scene.add(label);
        });
      });
    });

    // Animação
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Rotação suave da câmera
      camera.position.x = Math.cos(Date.now() * 0.0001) * 15;
      camera.position.z = Math.sin(Date.now() * 0.0001) * 15;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [localEstoque, produtos]);

  const calcularOcupacao = () => {
    const zonas = localEstoque.zonas_armazenagem || [];
    let capacidadeTotal = 0;
    let ocupadoTotal = 0;

    zonas.forEach(zona => {
      zona.corredores?.forEach(corredor => {
        corredor.prateleiras?.forEach(prat => {
          capacidadeTotal += prat.capacidade_kg || 0;
          ocupadoTotal += prat.ocupado_kg || 0;
        });
      });
    });

    return capacidadeTotal > 0 ? ((ocupadoTotal / capacidadeTotal) * 100) : 0;
  };

  const ocupacao = calcularOcupacao();

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Box className="w-5 h-5 text-purple-600" />
            Gêmeo Digital 3D - {localEstoque.nome_local}
          </CardTitle>
          <Badge className={
            ocupacao > 90 ? 'bg-red-600' :
            ocupacao > 70 ? 'bg-orange-600' :
            'bg-green-600'
          }>
            {ocupacao.toFixed(1)}% Ocupado
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={mountRef} 
          className="w-full h-[500px] bg-slate-50 rounded-lg border-2 border-slate-300"
        />

        <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>0-30% Ocupação</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>30-70%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>70-90%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>90-100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}