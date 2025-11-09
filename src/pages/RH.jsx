import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCircle, Calendar, DollarSign, Shield, TrendingUp, Clock } from "lucide-react";
import ColaboradorForm from "../components/rh/ColaboradorForm";
import PontoTab from "../components/rh/PontoTab";
import FolhaPagamentoTab from "../components/rh/FolhaPagamentoTab";
import ComplianceTab from "../components/rh/ComplianceTab";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useUser } from "@/components/lib/UserContext";

export default function RH() {
  const [activeTab, setActiveTab] = useState("colaboradores");
  const { empresaAtual } = useUser();

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores', empresaAtual?.id],
    queryFn: () => base44.entities.Colaborador.filter({
      empresa_alocada_id: empresaAtual?.id
    }),
    enabled: !!empresaAtual?.id
  });

  const { data: ferias = [] } = useQuery({
    queryKey: ['ferias'],
    queryFn: () => base44.entities.Ferias.list('-data_solicitacao'),
  });

  const totalFolha = colaboradores
    .filter(c => c.status === 'Ativo')
    .reduce((sum, c) => sum + (c.salario || 0), 0);

  const colaboradoresAtivos = colaboradores.filter(c => c.status === 'Ativo').length;
  const feriasPendentes = ferias.filter(f => f.status === 'Solicitado').length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Recursos Humanos & Governança</h1>
        <p className="text-slate-600">Gestão de pessoas, folha e compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Colaboradores</CardTitle>
            <Users className="w-5 h-5 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{colaboradores.length}</div>
            <p className="text-xs text-slate-500 mt-1">{colaboradoresAtivos} ativos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Folha Mensal</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Férias Pendentes</CardTitle>
            <Calendar className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{feriasPendentes}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md border-2 border-purple-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Compliance</CardTitle>
            <Shield className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">IA</div>
            <p className="text-xs text-purple-600 mt-1">Monitoramento ativo</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="colaboradores" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="ponto" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Ponto
          </TabsTrigger>
          <TabsTrigger value="folha" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-2" />
            Folha de Pagamento
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            Compliance & Governança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colaboradores">
          <Card className="border-2 border-blue-300 bg-blue-50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">Cadastros Centralizados</p>
                  <p className="text-xs text-blue-600">
                    Para criar ou editar colaboradores, acesse <strong>Cadastros Gerais → Colaboradores</strong>
                  </p>
                </div>
                <Link to={createPageUrl('Cadastros') + '?tab=colaboradores'}>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Ir para Cadastros
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Colaboradores Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {colaboradores.filter(c => c.status === 'Ativo').map(colab => (
                  <div
                    key={colab.id}
                    className="p-3 border-2 border-slate-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold">{colab.nome_completo}</p>
                        <p className="text-sm text-slate-600">{colab.cargo} - {colab.departamento}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          R$ {(colab.salario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {colab.pode_dirigir && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">🚗 Motorista</span>
                          )}
                          {colab.pode_apontar_producao && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">🏭 Produção</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ponto">
          <PontoTab colaboradores={colaboradores} />
        </TabsContent>

        <TabsContent value="folha">
          <FolhaPagamentoTab empresaId={empresaAtual?.id} />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceTab empresaId={empresaAtual?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}