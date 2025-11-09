
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, TestTube, Zap } from "lucide-react";
import TesteIntegracaoV21_3 from "@/components/sistema/TesteIntegracaoV21_3";
import TesteIntegracaoV21_5 from "@/components/sistema/TesteIntegracaoV21_5";
import TesteIntegracaoV21_5_RH from "@/components/sistema/TesteIntegracaoV21_5_RH";
import { useUser } from "@/hooks/useUser"; // Assuming useUser hook path

/**
 * V21.3 - Página de Testes do Golden Thread
 * Testa todas as fases: V21.1, V21.2, V21.3, V21.5 (Compras e RH)
 */
export default function TesteGoldenThread() {
  const [aba, setAba] = useState('v21_3');
  const { empresaAtual } = useUser();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">🧪 Testes Golden Thread</h1>
                <p className="text-purple-100">Cenários de teste automatizados V21.1 + V21.2 + V21.3 + V21.5</p>
              </div>
              <Rocket className="w-16 h-16" />
            </div>
          </CardHeader>
        </Card>

        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="bg-white p-1 shadow-md">
            <TabsTrigger value="v21_3">
              <Zap className="w-4 h-4 mr-2" />
              V21.3 - Financeiro & Fiscal
            </TabsTrigger>
            <TabsTrigger value="v21_2">
              <TestTube className="w-4 h-4 mr-2" />
              V21.2 - Produção & Logística
            </TabsTrigger>
            <TabsTrigger value="v21_1">
              <Rocket className="w-4 h-4 mr-2" />
              V21.1 - Etapas & Omnichannel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="v21_3">
            <TesteIntegracaoV21_3 empresaId={empresaAtual?.id || "empresa_teste"} />
          </TabsContent>

          <TabsContent value="v21_2">
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <TestTube className="w-16 h-16 mx-auto mb-3" />
                <p>Testes V21.2 em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="v21_1">
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <Rocket className="w-16 h-16 mx-auto mb-3" />
                <p>Testes V21.1 em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* V21.5: NOVO - Teste Compras */}
        <TesteIntegracaoV21_5 empresaId={empresaAtual?.id} />

        {/* V21.5: NOVO - Teste RH */}
        <TesteIntegracaoV21_5_RH empresaId={empresaAtual?.id} />
      </div>
    </div>
  );
}
