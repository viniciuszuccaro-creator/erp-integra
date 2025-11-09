import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Factory, Layers, FileText, CheckCircle, TrendingUp, BarChart3, Trophy } from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import KanbanProducao from "@/components/producao/KanbanProducao";
import DashboardRefugoIA from "@/components/producao/DashboardRefugoIA";
import RelatoriosProducao from "@/components/producao/RelatoriosProducao";
import GameficacaoProducao from "@/components/producao/GameficacaoProducao";

/**
 * V21.2 - Produção e Manufatura COMPLETO
 * COM: Kanban IA MES, Gêmeo Digital, Otimizador, Dashboard Refugo, Relatórios, Gamificação
 */
export default function Producao() {
  const { empresaAtual } = useUser();
  const [aba, setAba] = useState('kanban');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-[95vw] mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Produção e Manufatura</h1>
                <p className="text-purple-100">v21.2 COMPLETO - IA MES + Gêmeo Digital + Gamificação</p>
              </div>
              <Factory className="w-16 h-16" />
            </div>
          </CardHeader>
        </Card>

        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="bg-white p-1 shadow-md">
            <TabsTrigger value="kanban">
              <Layers className="w-4 h-4 mr-2" />
              Kanban IA MES
            </TabsTrigger>
            <TabsTrigger value="refugo">
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard Refugo
            </TabsTrigger>
            <TabsTrigger value="relatorios">
              <BarChart3 className="w-4 h-4 mr-2" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="gamificacao">
              <Trophy className="w-4 h-4 mr-2" />
              Ranking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <KanbanProducao empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="refugo">
            <DashboardRefugoIA empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="relatorios">
            <RelatoriosProducao empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="gamificacao">
            <GameficacaoProducao empresaId={empresaAtual?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}