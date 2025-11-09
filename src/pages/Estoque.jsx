import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, MapPin, BarChart3, QrCode, ClipboardList, Brain } from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import SaldosPorLocal from "@/components/estoque/SaldosPorLocal";
import MovimentacoesTab from "@/components/estoque/MovimentacoesTab";
import LotesEtiquetasTab from "@/components/estoque/LotesEtiquetasTab";
import InventarioAjustesTab from "@/components/estoque/InventarioAjustesTab";
import IAControlStockTab from "@/components/estoque/IAControlStockTab";

/**
 * V21.4 - Estoque e Almoxarifado COMPLETO
 * COM: Gêmeo Digital, FIFO/LIFO, IA Reposição, Cross-CD
 */
export default function Estoque() {
  const { empresaAtual } = useUser();
  const [aba, setAba] = useState('saldos');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-[95vw] mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Estoque e Almoxarifado</h1>
                <p className="text-blue-100">v21.4 COMPLETO - Gêmeo Digital + IA Reposição + FIFO/LIFO + Cross-CD</p>
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