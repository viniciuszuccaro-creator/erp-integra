
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Factory, ListChecks, BarChart3, Settings, AlertTriangle, TrendingUp, Package } from "lucide-react";
import KanbanProducao from "../components/producao/KanbanProducao";
import ApontamentoProducao from "../components/producao/ApontamentoProducao";
import ControleRefugo from "../components/producao/ControleRefugo";
import RelatoriosProducao from "../components/producao/RelatoriosProducao";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConfiguracaoProducao from "../components/producao/ConfiguracaoProducao";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";

/**
 * Módulo Produção - V21.2 Fase 2
 * Kanban Operacional + IAs de MES, Otimização de Corte e Custo Real
 */
export default function Producao() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("kanban");
  const [configOpen, setConfigOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: ops = [], isLoading: loadingOps } = useQuery({
    queryKey: ['ordens-producao'],
    queryFn: () => base44.entities.OrdemProducao.list('-data_emissao'),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const opsAguardandoMaterial = ops.filter(op => op.status === 'Aguardando Matéria-Prima').length;
  const opsEmProducaoList = ops.filter(op => ['Em Corte', 'Em Dobra', 'Em Armação'].includes(op.status));
  const opsEmProducao = opsEmProducaoList.length;
  const opsProntas = ops.filter(op => op.status === 'Pronta para Expedição').length;
  const opsBloqueadas = ops.filter(op => op.bloqueio_material).length;

  const pesoTotalEmProducao = opsEmProducaoList.reduce((sum, op) => sum + (op.peso_teorico_total_kg || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Produção e Manufatura</h1>
          <p className="text-slate-600">Gestão de ordens, apontamento, refugo e eficiência (OEE)</p>
        </div>
        
        <div className="flex gap-2">
          {opsBloqueadas > 0 && (
            <Badge className="bg-red-100 text-red-700 px-4 py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {opsBloqueadas} OP(s) sem material
            </Badge>
          )}
          <Button variant="outline" onClick={() => setConfigOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total OPs</CardTitle>
            <Factory className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{ops.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Aguardando Material</CardTitle>
            <Package className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{opsAguardandoMaterial}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Em Produção</CardTitle>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{opsEmProducao}</div>
            <p className="text-xs text-slate-500 mt-1">
              {pesoTotalEmProducao.toFixed(0)} kg em processo
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Prontas</CardTitle>
            <ListChecks className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{opsProntas}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Bloqueadas</CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{opsBloqueadas}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="kanban" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Factory className="w-4 h-4 mr-2" />
            Kanban Produção
          </TabsTrigger>
          <TabsTrigger value="apontamento" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <ListChecks className="w-4 h-4 mr-2" />
            Apontamento
          </TabsTrigger>
          <TabsTrigger value="refugo" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Controle de Refugo
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios OEE
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <KanbanProducao ops={ops} empresas={empresas} produtos={produtos} />
        </TabsContent>

        <TabsContent value="apontamento">
          <ApontamentoProducao ops={ops} />
        </TabsContent>

        <TabsContent value="refugo">
          <ControleRefugo ops={ops} />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosProducao ops={ops} />
        </TabsContent>
      </Tabs>

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurações de Produção</DialogTitle>
          </DialogHeader>
          <ConfiguracaoProducao onClose={() => setConfigOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
