import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Box } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Package, Maximize2 } from "lucide-react";

/**
 * V21.4 - Visualizador 3D de Almoxarifado
 * Mostra produtos em suas localizações físicas (zona/corredor/prateleira)
 */

function Prateleira({ posicao, codigo, ocupadoKG, capacidadeKG }) {
  const percentualOcupacao = capacidadeKG > 0 ? (ocupadoKG / capacidadeKG) * 100 : 0;
  
  const cor = percentualOcupacao > 90 ? '#ef4444' :
              percentualOcupacao > 70 ? '#f59e0b' :
              percentualOcupacao > 30 ? '#22c55e' : '#64748b';

  return (
    <group position={posicao}>
      <Box args={[1, 0.3, 0.5]}>
        <meshStandardMaterial color={cor} />
      </Box>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {codigo}
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.1}
        color={cor}
        anchorX="center"
      >
        {percentualOcupacao.toFixed(0)}%
      </Text>
    </group>
  );
}

function Almoxarifado3D({ localEstoque }) {
  const zonas = localEstoque?.zonas_armazenagem || [];
  const prateleirasRender = [];

  zonas.forEach((zona, zIdx) => {
    zona.corredores?.forEach((corredor, cIdx) => {
      corredor.prateleiras?.forEach((prat, pIdx) => {
        prateleirasRender.push({
          ...prat,
          posicao: [cIdx * 2 - 4, pIdx * 0.8, zIdx * 2 - 2]
        });
      });
    });
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Prateleiras */}
      {prateleirasRender.map((prat, idx) => (
        <Prateleira
          key={idx}
          posicao={prat.posicao}
          codigo={prat.codigo_prateleira}
          ocupadoKG={prat.ocupado_kg || 0}
          capacidadeKG={prat.capacidade_kg || 100}
        />
      ))}

      <OrbitControls />
    </>
  );
}

export default function VisualizadorEstoque3D({ localEstoqueId }) {
  const { data: local } = useQuery({
    queryKey: ['local-estoque-3d', localEstoqueId],
    queryFn: () => base44.entities.LocalEstoque.get(localEstoqueId),
    enabled: !!localEstoqueId
  });

  const totalPrateleiras = local?.zonas_armazenagem?.reduce((sum, z) => 
    sum + (z.corredores?.reduce((s, c) => s + (c.prateleiras?.length || 0), 0) || 0)
  , 0) || 0;

  const prateleirasOcupadas = local?.zonas_armazenagem?.reduce((sum, z) => 
    sum + (z.corredores?.reduce((s, c) => 
      s + (c.prateleiras?.filter(p => (p.ocupado_kg || 0) > 0).length || 0)
    , 0) || 0)
  , 0) || 0;

  return (
    <Card className="border-2 border-cyan-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>📦 Visualização 3D - {local?.nome_local}</CardTitle>
              <p className="text-sm text-slate-600">Mapa físico do almoxarifado</p>
            </div>
          </div>
          <Badge className="bg-cyan-600">
            {prateleirasOcupadas}/{totalPrateleiras} prateleiras em uso
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="w-full h-[500px] bg-slate-900 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [8, 5, 8], fov: 50 }}>
            <Almoxarifado3D localEstoque={local} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <p className="text-xs text-green-700">Capacidade OK</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <p className="font-bold text-green-900">0-30%</p>
            </div>
          </div>

          <div className="p-3 bg-yellow-100 rounded-lg">
            <p className="text-xs text-yellow-700">Atenção</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              <p className="font-bold text-yellow-900">30-70%</p>
            </div>
          </div>

          <div className="p-3 bg-orange-100 rounded-lg">
            <p className="text-xs text-orange-700">Alto</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <p className="font-bold text-orange-900">70-90%</p>
            </div>
          </div>

          <div className="p-3 bg-red-100 rounded-lg">
            <p className="text-xs text-red-700">Crítico</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <p className="font-bold text-red-900">90-100%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}