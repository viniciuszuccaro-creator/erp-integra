import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Truck, 
  Package, 
  MapPin, 
  RefreshCcw, 
  AlertTriangle,
  CheckCircle,
  Map,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/lib/UserContext";
import RoteirizadorSmartPlus from "@/components/expedicao/RoteirizadorSmartPlus";
import ChecklistQualidadeDevolucao from "@/components/expedicao/ChecklistQualidadeDevolucao";
import MapaRastreamentoRealTime from "@/components/expedicao/MapaRastreamentoRealTime";
import AppMotoristaCompleto from "@/components/expedicao/AppMotoristaCompleto";

/**
 * V21.2 - Expedição e Logística COMPLETO
 * COM: SmartRoute+, Mapa Real-time, App Motorista, Checklist Qualidade
 */
export default function Expedicao() {
  const { empresaAtual, user } = useUser();
  const [aba, setAba] = useState('entregas');
  const [entregaDevolucao, setEntregaDevolucao] = useState(null);

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', empresaAtual?.id],
    queryFn: () => base44.entities.Entrega.filter({ 
      empresa_id: empresaAtual?.id 
    }, '-data_saida', 100),
    enabled: !!empresaAtual?.id
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-motoristas', empresaAtual?.id],
    queryFn: () => base44.entities.Colaborador.filter({
      empresa_alocada_id: empresaAtual?.id,
      pode_dirigir: true
    }),
    enabled: !!empresaAtual?.id
  });

  const entregasPendentes = entregas.filter(e => 
    e.status === 'Aguardando Separação' || 
    e.status === 'Pronto para Expedir'
  );

  // Verificar se usuário é motorista
  const motoristaAtual = colaboradores.find(c => c.vincular_a_usuario_id === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-[95vw] mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Expedição e Logística</h1>
                <p className="text-blue-100">v21.2 COMPLETO - SmartRoute+ IA + GPS Real-time</p>
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
            <TabsTrigger value="mapa">
              <Map className="w-4 h-4 mr-2" />
              Rastreamento
            </TabsTrigger>
            <TabsTrigger value="roteirizador">
              <MapPin className="w-4 h-4 mr-2" />
              Roteirizador IA
            </TabsTrigger>
            {motoristaAtual && (
              <TabsTrigger value="app-motorista">
                <Smartphone className="w-4 h-4 mr-2" />
                App Motorista
              </TabsTrigger>
            )}
            <TabsTrigger value="reversa">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Logística Reversa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entregas">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Todas as Entregas</h2>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600">Nova Entrega</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {entregas.map((entrega) => (
                    <Card key={entrega.id} className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{entrega.cliente_nome}</p>
                            <p className="text-sm text-slate-600">
                              Pedido: {entrega.numero_pedido}
                            </p>
                            <p className="text-xs text-slate-500">
                              {entrega.endereco_entrega_completo?.cidade}
                            </p>
                          </div>
                          <Badge className={
                            entrega.status === 'Entregue' ? 'bg-green-600' :
                            entrega.status === 'Em Trânsito' ? 'bg-blue-600' :
                            entrega.status === 'Entrega Frustrada' ? 'bg-red-600' :
                            'bg-orange-600'
                          }>
                            {entrega.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {entregas.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <Package className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                      <p>Nenhuma entrega encontrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapa">
            <MapaRastreamentoRealTime empresaId={empresaAtual?.id} />
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

          {motoristaAtual && (
            <TabsContent value="app-motorista">
              <AppMotoristaCompleto motoristaId={motoristaAtual.id} />
            </TabsContent>
          )}

          <TabsContent value="reversa">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-orange-600" />
                  <h2 className="text-xl font-bold">Logística Reversa (Devoluções)</h2>
                </div>
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
                              <p className="font-semibold">{entrega.cliente_nome}</p>
                              <p className="text-xs text-slate-600">
                                Motivo: {entrega.logistica_reversa.motivo}
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

                  {entregas.filter(e => e.logistica_reversa?.ativada).length === 0 && (
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