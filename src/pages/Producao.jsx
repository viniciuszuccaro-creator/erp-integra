import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Factory, Layers, FileText, CheckCircle, TrendingUp } from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import KanbanProducao from "@/components/producao/KanbanProducao";

/**
 * V21.2 - Produção e Manufatura
 * COM: Kanban IA MES, Gêmeo Digital, Otimizador de Corte
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
                <p className="text-purple-100">v21.2 - IA MES Preditiva + Gêmeo Digital</p>
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
            <TabsTrigger value="ops">
              <FileText className="w-4 h-4 mr-2" />
              Ordens de Produção
            </TabsTrigger>
            <TabsTrigger value="qualidade">
              <CheckCircle className="w-4 h-4 mr-2" />
              Controle de Qualidade
            </TabsTrigger>
            <TabsTrigger value="refugo">
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard Refugo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <KanbanProducao empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="ops">
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <FileText className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p>Lista de OPs - Implementar conforme necessário</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualidade">
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <CheckCircle className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p>Controle de Qualidade - Implementar</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="refugo">
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <TrendingUp className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p>Dashboard de Refugo - Implementar</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}