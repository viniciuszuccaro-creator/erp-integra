import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, ZoomIn, Activity } from "lucide-react";

/**
 * V21.2 - Gêmeo Digital 3D da Produção
 * Visualização em tempo real do chão de fábrica
 */

function Maquina({ posicao, nome, status, producaoAtual }) {
  const meshRef = useRef();
  
  const corPorStatus = {
    'Operando': '#22c55e',
    'Parada': '#ef4444',
    'Setup': '#f59e0b',
    'Manutenção': '#8b5cf6'
  };

  useFrame(() => {
    if (status === 'Operando' && meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={posicao}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 1.5, 1]} />
        <meshStandardMaterial color={corPorStatus[status] || '#64748b'} />
      </mesh>
      
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {nome}
      </Text>

      <Text
        position={[0, -1, 0]}
        fontSize={0.2}
        color={corPorStatus[status]}
        anchorX="center"
        anchorY="middle"
      >
        {status}
      </Text>

      {producaoAtual && (
        <Text
          position={[0, -1.3, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          OP: {producaoAtual.numero_op}
        </Text>
      )}
    </group>
  );
}

function ChaoFabrica({ ops = [] }) {
  const maquinas = [
    { id: 1, nome: 'Corte CNC-1', posicao: [-6, 0, 0], tipo: 'corte' },
    { id: 2, nome: 'Corte CNC-2', posicao: [-3, 0, 0], tipo: 'corte' },
    { id: 3, nome: 'Dobra HD-1', posicao: [0, 0, 0], tipo: 'dobra' },
    { id: 4, nome: 'Dobra HD-2', posicao: [3, 0, 0], tipo: 'dobra' },
    { id: 5, nome: 'Mesa Armação 1', posicao: [6, 0, -3], tipo: 'armacao' },
    { id: 6, nome: 'Mesa Armação 2', posicao: [6, 0, 0], tipo: 'armacao' }
  ];

  // Associar OPs às máquinas
  const maquinasComOP = maquinas.map(m => {
    const opNaMaquina = ops.find(op => {
      const etapaAtual = op.etapas_producao?.find(e => e.status === 'Em Andamento');
      return etapaAtual?.maquina_nome?.toLowerCase().includes(m.nome.toLowerCase());
    });

    return {
      ...m,
      status: opNaMaquina ? 'Operando' : 'Parada',
      producaoAtual: opNaMaquina
    };
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Chão da fábrica */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Máquinas */}
      {maquinasComOP.map(m => (
        <Maquina
          key={m.id}
          posicao={m.posicao}
          nome={m.nome}
          status={m.status}
          producaoAtual={m.producaoAtual}
        />
      ))}

      <OrbitControls />
      <PerspectiveCamera makeDefault position={[0, 8, 15]} />
    </>
  );
}

export default function GemeoDigital3D({ empresaId }) {
  const [paused, setPaused] = useState(false);
  const [ops, setOps] = useState([]);

  useEffect(() => {
    if (paused) return;

    const fetchOPs = async () => {
      const opsAtivas = await base44.entities.OrdemProducao.filter({
        empresa_id: empresaId,
        status: { $in: ['Em Corte', 'Em Dobra', 'Em Armação'] }
      });
      setOps(opsAtivas);
    };

    fetchOPs();
    const interval = setInterval(fetchOPs, 10000); // atualiza a cada 10s

    return () => clearInterval(interval);
  }, [empresaId, paused]);

  const maquinasOperando = ops.filter(op => 
    op.etapas_producao?.some(e => e.status === 'Em Andamento')
  ).length;

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>🏭 Gêmeo Digital 3D - Chão de Fábrica</CardTitle>
              <p className="text-sm text-slate-600">Visualização em tempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-green-600 text-white">
              {maquinasOperando} máquinas ativas
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="w-full h-[500px] bg-slate-900 rounded-lg overflow-hidden">
          <Canvas>
            <ChaoFabrica ops={ops} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <p className="text-xs text-green-700">Operando</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <p className="font-bold text-green-900">
                {ops.filter(op => op.etapas_producao?.some(e => e.status === 'Em Andamento')).length}
              </p>
            </div>
          </div>

          <div className="p-3 bg-red-100 rounded-lg">
            <p className="text-xs text-red-700">Paradas</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <p className="font-bold text-red-900">
                {6 - maquinasOperando}
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-700">OPs Ativas</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <p className="font-bold text-blue-900">{ops.length}</p>
            </div>
          </div>

          <div className="p-3 bg-purple-100 rounded-lg">
            <p className="text-xs text-purple-700">Utilização</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <p className="font-bold text-purple-900">
                {((maquinasOperando / 6) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}