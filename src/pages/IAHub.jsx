import React, { useState } from "react";
import { useUser } from "@/components/lib/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BarChart3, Settings, Zap } from "lucide-react";
import DashboardIA from "@/components/dashboard/DashboardIA";
import ConfiguracaoIAGlobal from "@/components/sistema/ConfiguracaoIAGlobal";

/**
 * V21.4 - Hub Central de IA
 * Unifica TODAS as IAs do sistema em um único painel
 */
export default function IAHub() {
  const { empresaAtual } = useUser();
  const [aba, setAba] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-[95vw] mx-auto space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">🧠 Hub Central de IA</h1>
                <p className="text-purple-100">
                  Inteligência Artificial Integrada - 10+ IAs Ativas
                </p>
              </div>
              <Brain className="w-16 h-16" />
            </div>
          </CardContent>
        </Card>

        {/* Módulos de IA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">IA Comercial</p>
                  <p className="text-xs text-slate-600">Upsell, Leitura Projeto, Precificação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">IA Financeiro</p>
                  <p className="text-xs text-slate-600">Régua Cobrança, Previsão, Conciliação PLN</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">IA Estoque</p>
                  <p className="text-xs text-slate-600">Reposição, Cross-CD, Auditoria</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">IA Produção</p>
                  <p className="text-xs text-slate-600">MES, Refugo, OEE, Otimização Corte</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-300 bg-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">IA Logística</p>
                  <p className="text-xs text-slate-600">SmartRoute+, ETA Dinâmico</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-300 bg-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">IA Fiscal</p>
                  <p className="text-xs text-slate-600">DIFAL Update, Validação Pré-Emissão</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard e Configurações */}
        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="bg-white p-1 shadow-md">
            <TabsTrigger value="dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard IA
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardIA 
              empresaId={empresaAtual?.id} 
              grupoId={empresaAtual?.grupo_id} 
            />
          </TabsContent>

          <TabsContent value="config">
            <ConfiguracaoIAGlobal 
              empresaId={empresaAtual?.id} 
              grupoId={empresaAtual?.grupo_id} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}