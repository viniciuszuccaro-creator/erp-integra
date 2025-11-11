import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Package, MapPin } from "lucide-react";

/**
 * V21.4 - Visualizador de Almoxarifado (Mapa de Calor 2D)
 * Mostra produtos em suas localizações físicas (zona/corredor/prateleira)
 */

function Prateleira({ codigo, ocupadoKG, capacidadeKG, onClick }) {
  const percentualOcupacao = capacidadeKG > 0 ? (ocupadoKG / capacidadeKG) * 100 : 0;
  
  const corBg = percentualOcupacao > 90 ? 'bg-red-600' :
                percentualOcupacao > 70 ? 'bg-orange-500' :
                percentualOcupacao > 30 ? 'bg-green-500' : 'bg-slate-300';
  
  const corBorder = percentualOcupacao > 90 ? 'border-red-700' :
                    percentualOcupacao > 70 ? 'border-orange-600' :
                    percentualOcupacao > 30 ? 'border-green-600' : 'border-slate-400';

  return (
    <div
      onClick={onClick}
      className={`${corBg} ${corBorder} border-2 rounded-lg p-2 cursor-pointer hover:scale-105 transition-all shadow-md`}
      title={`${codigo}\n${ocupadoKG.toFixed(0)}/${capacidadeKG.toFixed(0)} KG\n${percentualOcupacao.toFixed(0)}% ocupado`}
    >
      <p className="text-white font-bold text-xs text-center">{codigo}</p>
      <p className="text-white text-xs text-center">{percentualOcupacao.toFixed(0)}%</p>
    </div>
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
              <CardTitle>📦 Mapa do Almoxarifado - {local?.nome_local}</CardTitle>
              <p className="text-sm text-slate-600">Visualização de ocupação por zona (Mapa de Calor)</p>
            </div>
          </div>
          <Badge className="bg-cyan-600">
            {prateleirasOcupadas}/{totalPrateleiras} prateleiras em uso
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {local?.zonas_armazenagem?.map((zona, idx) => (
            <div key={idx} className="space-y-3">
              <div className="p-3 bg-slate-100 rounded-lg border-2 border-slate-300">
                <p className="font-bold text-sm text-slate-900">{zona.codigo_zona}</p>
                <p className="text-xs text-slate-600">{zona.descricao}</p>
                {zona.tipo_produto && (
                  <Badge variant="outline" className="text-xs mt-1">{zona.tipo_produto}</Badge>
                )}
              </div>

              <div className="space-y-3">
                {zona.corredores?.map((corredor, cIdx) => (
                  <div key={cIdx} className="p-3 bg-white rounded-lg border">
                    <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {corredor.codigo_corredor}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {corredor.prateleiras?.map((prat, pIdx) => (
                        <Prateleira
                          key={pIdx}
                          codigo={prat.codigo_prateleira}
                          ocupadoKG={prat.ocupado_kg || 0}
                          capacidadeKG={prat.capacidade_kg || 100}
                          onClick={() => console.log('Prateleira', prat)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {(!local?.zonas_armazenagem || local.zonas_armazenagem.length === 0) && (
            <div className="col-span-2 text-center py-12 text-slate-400">
              <MapPin className="w-16 h-16 mx-auto mb-3" />
              <p>Configure as zonas de armazenagem em Cadastros → Locais de Estoque</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3 mt-6">
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