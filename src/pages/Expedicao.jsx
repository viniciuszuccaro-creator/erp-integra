import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Package, CheckCircle2, AlertCircle, Route, Navigation } from "lucide-react";
import DashboardLogistico from "../components/expedicao/DashboardLogistico";
import RoteirizacaoMapa from "../components/expedicao/RoteirizacaoMapa";
import SeparacaoConferencia from "../components/expedicao/SeparacaoConferencia";
import RelatoriosLogistica from "../components/expedicao/RelatoriosLogistica";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RomaneioForm from "../components/expedicao/RomaneioForm";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";

/**
 * Módulo Expedição - V21.2 Fase 2
 * Roteirização IA + Rastreamento + Logística Reversa
 */
export default function Expedicao() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [romaneioFormOpen, setRomaneioFormOpen] = useState(false);
  const [editingRomaneio, setEditingRomaneio] = useState(null);
  const queryClient = useQueryClient();

  const { data: entregas = [], isLoading: loadingEntregas } = useQuery({
    queryKey: ['entregas'],
    queryFn: () => base44.entities.Entrega.list('-data_saida'),
  });

  const { data: romaneios = [], isLoading: loadingRomaneios } = useQuery({
    queryKey: ['romaneios'],
    queryFn: () => base44.entities.Romaneio.list('-data_romaneio'),
  });

  const { data: rotas = [] } = useQuery({
    queryKey: ['rotas'],
    queryFn: () => base44.entities.Rota.list('-data_rota'),
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => base44.entities.Veiculo.list(),
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => base44.entities.Motorista.list(),
  });

  const entregasPendentes = entregas.filter(e => e.status === 'Aguardando Separação').length;
  const entregasEmRota = entregas.filter(e => ['Saiu para Entrega', 'Em Trânsito'].includes(e.status)).length;
  const entregasRealizadas = entregas.filter(e => e.status === 'Entregue').length;
  const entregasFrustradas = entregas.filter(e => e.status === 'Entrega Frustrada').length;

  const romaneiosAbertos = romaneios.filter(r => r.status === 'Aberto').length;
  const romaneiosEmRota = romaneios.filter(r => r.status === 'Em Rota').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Expedição e Logística</h1>
          <p className="text-slate-600">Romaneios, roteirização inteligente e rastreamento em tempo real</p>
        </div>
        
        <div className="flex gap-2">
          {entregasFrustradas > 0 && (
            <Badge className="bg-red-100 text-red-700 px-4 py-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              {entregasFrustradas} entrega(s) frustrada(s)
            </Badge>
          )}
          <Button onClick={() => { setEditingRomaneio(null); setRomaneioFormOpen(true); }}>
            <Package className="w-4 h-4 mr-2" />
            Novo Romaneio
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pendentes</CardTitle>
            <Package className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{entregasPendentes}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Em Rota</CardTitle>
            <Truck className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{entregasEmRota}</div>
            <p className="text-xs text-slate-500 mt-1">
              {romaneiosEmRota} romaneio(s) ativo(s)
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Entregues</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{entregasRealizadas}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Frustradas</CardTitle>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{entregasFrustradas}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Veículos</CardTitle>
            <Truck className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{veiculos.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {veiculos.filter(v => v.status === 'Disponível').length} disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="separacao" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <ListChecks className="w-4 h-4 mr-2" />
            Separação
          </TabsTrigger>
          <TabsTrigger value="roteirizacao" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Route className="w-4 h-4 mr-2" />
            Roteirização
          </TabsTrigger>
          <TabsTrigger value="rastreamento" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Navigation className="w-4 h-4 mr-2" />
            Rastreamento
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardLogistico 
            entregas={entregas} 
            romaneios={romaneios} 
            veiculos={veiculos}
            motoristas={motoristas}
          />
        </TabsContent>

        <TabsContent value="separacao">
          <SeparacaoConferencia entregas={entregas} />
        </TabsContent>

        <TabsContent value="roteirizacao">
          <RoteirizacaoMapa 
            entregas={entregas} 
            romaneios={romaneios}
            veiculos={veiculos}
            motoristas={motoristas}
            onCriarRomaneio={() => setRomaneioFormOpen(true)}
          />
        </TabsContent>

        <TabsContent value="rastreamento">
          <Card>
            <CardHeader>
              <CardTitle>Rastreamento em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Mapa de rastreamento em desenvolvimento</p>
                <p className="text-xs mt-2">Integração com App Motorista e GPS</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosLogistica 
            entregas={entregas} 
            romaneios={romaneios} 
            veiculos={veiculos}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={romaneioFormOpen} onOpenChange={setRomaneioFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRomaneio ? 'Editar Romaneio' : 'Novo Romaneio de Entrega'}
            </DialogTitle>
          </DialogHeader>
          <RomaneioForm
            romaneio={editingRomaneio}
            entregas={entregas}
            veiculos={veiculos}
            motoristas={motoristas}
            onClose={() => setRomaneioFormOpen(false)}
            onSuccess={() => {
              queryClient.invalidateQueries(['romaneios']);
              setRomaneioFormOpen(false);
              setEditingRomaneio(null);
              toast.success('Romaneio salvo com sucesso!');
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}