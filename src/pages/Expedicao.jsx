
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Truck,
  Package,
  MapPin,
  RefreshCcw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useUser } from "@/components/lib/useUser";
import RoteirizadorSmartPlus from "@/components/expedicao/RoteirizadorSmartPlus";
import ChecklistQualidadeDevolucao from "@/components/expedicao/ChecklistQualidadeDevolucao";

/**
 * V21.2 - Expedição e Logística
 * COM: SmartRoute+, Checklist Qualidade, App Motorista v2
 */
export default function Expedicao() {
  const { user, empresaAtual, isLoading: isLoadingUser } = useUser();
  const [aba, setAba] = useState('entregas');
  const [entregaDevolucao, setEntregaDevolucao] = useState(null);

  const { data: entregas = [], isLoading: loadingEntregas } = useQuery({
    queryKey: ['entregas', empresaAtual?.id],
    queryFn: () => base44.entities.Entrega.filter({
      empresa_id: empresaAtual?.id
    }, '-data_saida', 100),
    enabled: !!empresaAtual?.id, // Only fetch if empresaAtual.id is available
  });

  const entregasPendentes = entregas.filter(e =>
    e.status === 'Aguardando Separação' ||
    e.status === 'Pronto para Expedir'
  );

  if (isLoadingUser || loadingEntregas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-slate-700">Carregando expedição...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-[95vw] mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Expedição e Logística</h1>
                <p className="text-blue-100">v21.2 - SmartRoute+ IA Preditiva</p>
              </div>
              <Truck className="w-16 h-16" />
            </div>
          </CardHeader>
        </Card>

        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="bg-white p-1 shadow-md">
            <TabsTrigger value="entregas">
              <Package className="w-4 h-4 mr-2" />
              Entregas
            </TabsTrigger>
            <TabsTrigger value="roteirizador">
              <MapPin className="w-4 h-4 mr-2" />
              Roteirizador IA
            </TabsTrigger>
            <TabsTrigger value="reversa">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Logística Reversa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entregas">
            <Card>
              <CardContent className="p-6">
                <p className="text-slate-600">A lista detalhada de entregas, com filtros e ações, será apresentada aqui. <br />Esta é uma visualização para a nova estrutura do Expedição v21.2.</p>
                <p className="text-sm mt-2 text-slate-500">Utilize o Roteirizador IA para otimizar suas entregas pendentes.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roteirizador">
            <RoteirizadorSmartPlus
              entregas={entregasPendentes}
              empresaId={empresaAtual?.id}
              onRotaCriada={(rota) => {
                alert(`Rota ${rota.nome_rota} criada! Clientes notificados.`);
              }}
            />
          </TabsContent>

          <TabsContent value="reversa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-orange-600" />
                  Logística Reversa (Devoluções)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Alert className="border-orange-300 bg-orange-50 mb-4">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <AlertDescription className="text-sm text-orange-800">
                    <strong>V21.2:</strong> Devoluções exigem Checklist de Qualidade OBRIGATÓRIO antes de aceitar no estoque.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  {entregas
                    .filter(e => e.status === 'Entrega Frustrada' && e.logistica_reversa?.ativada)
                    .map((entrega) => (
                      <Card key={entrega.id} className="border border-red-300 bg-red-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-800">{entrega.cliente_nome}</p>
                              <p className="text-xs text-slate-600">
                                Pedido: {entrega.numero_pedido || '-'} | Motivo: {entrega.logistica_reversa?.motivo || 'N/A'}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => setEntregaDevolucao(entrega)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              Iniciar Checklist
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  {entregas.filter(e => e.status === 'Entrega Frustrada' && e.logistica_reversa?.ativada).length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                      <p>Nenhuma devolução pendente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal Checklist */}
        {entregaDevolucao && (
          <ChecklistQualidadeDevolucao
            isOpen={!!entregaDevolucao}
            onClose={() => setEntregaDevolucao(null)}
            entrega={entregaDevolucao}
            motivoDevolucao={entregaDevolucao.logistica_reversa?.motivo}
          />
        )}
      </div>
    </div>
  );
}
