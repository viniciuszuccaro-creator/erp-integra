import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, MapPin, BarChart3, QrCode, ClipboardList, Brain, Boxes } from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import SaldosPorLocal from "@/components/estoque/SaldosPorLocal";
import MovimentacoesTab from "@/components/estoque/MovimentacoesTab";
import LotesEtiquetasTab from "@/components/estoque/LotesEtiquetasTab";
import InventarioAjustesTab from "@/components/estoque/InventarioAjustesTab";
import IAControlStockTab from "@/components/estoque/IAControlStockTab";
import VisualizadorEstoque3D from "@/components/estoque/VisualizadorEstoque3D";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Estoque e Almoxarifado COMPLETO
 * COM: Gêmeo Digital 3D, FIFO/LIFO, IA Reposição, Cross-CD, Rastreabilidade
 */
export default function Estoque() {
  const { empresaAtual } = useUser();
  const [aba, setAba] = useState('saldos');
  const [localSelecionado, setLocalSelecionado] = useState(null);

  const { data: locaisEstoque = [] } = useQuery({
    queryKey: ['locais-estoque', empresaAtual?.id],
    queryFn: () => base44.entities.LocalEstoque.filter({
      empresa_id: empresaAtual?.id,
      ativo: true
    }),
    enabled: !!empresaAtual?.id
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-[95vw] mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Estoque e Almoxarifado</h1>
                <p className="text-blue-100">v21.4 COMPLETO - Gêmeo Digital 3D + IA Reposição + Cross-CD + Rastreabilidade</p>
              </div>
              <Box className="w-16 h-16" />
            </div>
          </CardHeader>
        </Card>

        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="bg-white p-1 shadow-md">
            <TabsTrigger value="saldos">
              <MapPin className="w-4 h-4 mr-2" />
              Saldos por Local
            </TabsTrigger>
            <TabsTrigger value="3d">
              <Boxes className="w-4 h-4 mr-2" />
              Visualizador 3D
            </TabsTrigger>
            <TabsTrigger value="movimentacoes">
              <BarChart3 className="w-4 h-4 mr-2" />
              Movimentações
            </TabsTrigger>
            <TabsTrigger value="lotes">
              <QrCode className="w-4 h-4 mr-2" />
              Lotes / Etiquetas
            </TabsTrigger>
            <TabsTrigger value="inventario">
              <ClipboardList className="w-4 h-4 mr-2" />
              Inventário
            </TabsTrigger>
            <TabsTrigger value="ia">
              <Brain className="w-4 h-4 mr-2" />
              IA Control Stock
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saldos">
            <SaldosPorLocal empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="3d">
            <div className="space-y-4">
              {locaisEstoque.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {locaisEstoque.map(local => (
                    <Button
                      key={local.id}
                      size="sm"
                      variant={localSelecionado === local.id ? "default" : "outline"}
                      onClick={() => setLocalSelecionado(local.id)}
                    >
                      {local.nome_local}
                    </Button>
                  ))}
                </div>
              )}

              {localSelecionado ? (
                <VisualizadorEstoque3D localEstoqueId={localSelecionado} />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-slate-400">
                    <Boxes className="w-16 h-16 mx-auto mb-3" />
                    <p>Selecione um local de estoque para visualizar em 3D</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="movimentacoes">
            <MovimentacoesTab empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="lotes">
            <LotesEtiquetasTab empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="inventario">
            <InventarioAjustesTab empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="ia">
            <IAControlStockTab empresaId={empresaAtual?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}