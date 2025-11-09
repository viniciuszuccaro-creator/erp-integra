import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, TestTube, Zap, Brain } from "lucide-react";
import TesteIntegracaoV21_3 from "@/components/sistema/TesteIntegracaoV21_3";
import TesteIntegracaoV21_5 from "@/components/sistema/TesteIntegracaoV21_5";
import TesteIntegracaoV21_5_RH from "@/components/sistema/TesteIntegracaoV21_5_RH";
import TesteIntegracaoV21_6 from "@/components/sistema/TesteIntegracaoV21_6";
import { useUser } from "@/components/lib/UserContext";

/**
 * V21.6 - Página de Testes do Golden Thread
 * Testa todas as fases: V21.1, V21.2, V21.3, V21.5, V21.6
 */
export default function TesteGoldenThread() {
  const [aba, setAba] = useState('v21_6');
  const { empresaAtual } = useUser();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">🧪 Testes Golden Thread</h1>
                <p className="text-purple-100">Cenários de teste V21.1 → V21.6 (Automação Neural)</p>
              </div>
              <Rocket className="w-16 h-16" />
            </div>
          </CardHeader>
        </Card>

        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="bg-white p-1 shadow-md">
            <TabsTrigger value="v21_6">
              <Brain className="w-4 h-4 mr-2" />
              V21.6 - IA Avançada
            </TabsTrigger>
            <TabsTrigger value="v21_3">
              <Zap className="w-4 h-4 mr-2" />
              V21.3 - Financeiro
            </TabsTrigger>
            <TabsTrigger value="v21_5">
              <TestTube className="w-4 h-4 mr-2" />
              V21.5 - Compras & RH
            </TabsTrigger>
          </TabsList>

          <TabsContent value="v21_6">
            <TesteIntegracaoV21_6 empresaId={empresaAtual?.id || "empresa_teste"} />
          </TabsContent>

          <TabsContent value="v21_3">
            <TesteIntegracaoV21_3 empresaId={empresaAtual?.id || "empresa_teste"} />
          </TabsContent>

          <TabsContent value="v21_5">
            <div className="space-y-6">
              <TesteIntegracaoV21_5 empresaId={empresaAtual?.id} />
              <TesteIntegracaoV21_5_RH empresaId={empresaAtual?.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}