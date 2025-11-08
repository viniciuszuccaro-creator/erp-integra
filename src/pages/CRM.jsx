import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Users, Calendar, MessageCircle, Target, 
  DollarSign, Phone, Mail, AlertTriangle 
} from "lucide-react";
import FunilVisual from "@/components/crm/FunilVisual";
import { useUser } from "@/components/lib/UserContext";

/**
 * CRM - RELACIONAMENTO V21.1
 * Funil Visual, Oportunidades e IA de Lead Scoring
 */
export default function CRM() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('funil');

  const { data: oportunidades = [] } = useQuery({
    queryKey: ['oportunidades'],
    queryFn: async () => {
      if (user?.role !== 'admin') {
        return await base44.entities.Oportunidade.filter({ responsavel_id: user.id });
      }
      return await base44.entities.Oportunidade.list('-created_date');
    }
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list()
  });

  const { data: interacoes = [] } = useQuery({
    queryKey: ['interacoes'],
    queryFn: () => base44.entities.Interacao.list('-data_interacao', 50)
  });

  const clientesRiscoChurn = clientes.filter(c => c.risco_churn === 'Alto' || c.risco_churn === 'Crítico');
  const oportEmAberto = oportunidades.filter(o => o.status === 'Aberto' || o.status === 'Em Andamento');
  const valorPipeline = oportunidades.reduce((sum, o) => sum + (o.valor_estimado || 0), 0);
  const taxaConversao = oportunidades.length > 0 
    ? (oportunidades.filter(o => o.status === 'Ganho').length / oportunidades.length * 100).toFixed(1)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">🎯 CRM - Relacionamento</h1>
        <p className="text-slate-600">Pipeline de Vendas e Gestão de Oportunidades</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{oportEmAberto.length}</div>
            <p className="text-xs text-slate-600">Oportunidades Ativas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              R$ {(valorPipeline/1000).toFixed(0)}k
            </div>
            <p className="text-xs text-slate-600">Valor Pipeline</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{taxaConversao}%</div>
            <p className="text-xs text-slate-600">Taxa Conversão</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{clientesRiscoChurn.length}</div>
            <p className="text-xs text-slate-600">Risco Churn (IA)</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="funil">
            <Target className="w-4 h-4 mr-2" />
            Funil de Vendas
          </TabsTrigger>
          <TabsTrigger value="interacoes">
            <MessageCircle className="w-4 h-4 mr-2" />
            Interações
          </TabsTrigger>
          <TabsTrigger value="churn">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alerta Churn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funil">
          <FunilVisual />
        </TabsContent>

        <TabsContent value="interacoes">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Interações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {interacoes.slice(0, 10).map(int => (
                  <div key={int.id} className="p-3 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm">{int.titulo}</p>
                        <p className="text-xs text-slate-600">{int.cliente_nome}</p>
                      </div>
                      <Badge className="text-xs">{int.tipo}</Badge>
                    </div>
                    <p className="text-sm text-slate-700">{int.descricao}</p>
                    <p className="text-xs text-slate-500 mt-2">{int.responsavel} • {int.data_interacao}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Clientes em Risco de Churn (IA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {clientesRiscoChurn.map(cliente => (
                  <Card key={cliente.id} className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{cliente.nome}</p>
                          <p className="text-sm text-slate-600">
                            {cliente.dias_sem_comprar} dias sem comprar
                          </p>
                        </div>
                        <Badge className="bg-orange-600 text-white">
                          {cliente.risco_churn}
                        </Badge>
                      </div>
                      <Button size="sm" className="mt-3 w-full" variant="outline">
                        Criar Oportunidade Recuperação
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {clientesRiscoChurn.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhum cliente em risco detectado pela IA</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}