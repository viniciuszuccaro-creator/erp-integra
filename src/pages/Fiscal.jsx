import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Database, Shield, Calculator, AlertCircle, Zap, CheckCircle2 } from "lucide-react";
import NotasFiscaisTab from "../components/comercial/NotasFiscaisTab";
import PlanoDeContasTree from "../components/fiscal/PlanoDeContasTree";
import RelatorioDRE from "../components/fiscal/RelatorioDRE";
import ExportacaoSPED from "../components/fiscal/ExportacaoSPED";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";

/**
 * Módulo Fiscal - V21.3 Fase 3
 * NF-e, SPED, DRE e IAs de Compliance Tributário
 */
export default function Fiscal() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("nfe");
  const queryClient = useQueryClient();

  const { data: notasFiscais = [], isLoading: loadingNotas } = useQuery({
    queryKey: ['notas-fiscais'],
    queryFn: () => base44.entities.NotaFiscal.list('-data_emissao'),
  });

  const { data: planoContas = [] } = useQuery({
    queryKey: ['plano-contas'],
    queryFn: () => base44.entities.PlanoDeContas.list(),
  });

  const { data: dre = [] } = useQuery({
    queryKey: ['dre'],
    queryFn: () => base44.entities.DRE.list('-periodo'),
  });

  const { data: sped = [] } = useQuery({
    queryKey: ['sped'],
    queryFn: () => base44.entities.SPEDFiscal.list('-periodo_apuracao'),
  });

  const { data: configFiscal = [] } = useQuery({
    queryKey: ['config-fiscal'],
    queryFn: () => base44.entities.ConfigFiscalEmpresa.list(),
  });

  // KPIs
  const notasAutorizadas = notasFiscais.filter(n => n.status === 'Autorizada').length;
  const notasPendentes = notasFiscais.filter(n => ['Rascunho', 'Processando'].includes(n.status)).length;
  const notasRejeitadas = notasFiscais.filter(n => n.status === 'Rejeitada').length;

  const valorTotalEmitido = notasFiscais
    .filter(n => n.status === 'Autorizada')
    .reduce((sum, n) => sum + (n.valor_total || 0), 0);

  const configsAtivas = configFiscal.filter(c => c.ativo).length;
  const certificadosVencendo = configFiscal.filter(c => {
    if (!c.data_validade_certificado) return false;
    const dias = Math.floor((new Date(c.data_validade_certificado) - new Date()) / (1000 * 60 * 60 * 24));
    return dias <= 30 && dias > 0;
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Fiscal e Tributário</h1>
          <p className="text-slate-600">NF-e, SPED, DRE e compliance fiscal automatizado</p>
        </div>
        
        <div className="flex gap-2">
          {certificadosVencendo > 0 && (
            <Badge className="bg-red-100 text-red-700 px-4 py-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              {certificadosVencendo} certificado(s) vencendo
            </Badge>
          )}
          {notasRejeitadas > 0 && (
            <Badge className="bg-orange-100 text-orange-700 px-4 py-2">
              {notasRejeitadas} nota(s) rejeitada(s)
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">NF-e Autorizadas</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{notasAutorizadas}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pendentes</CardTitle>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{notasPendentes}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Rejeitadas</CardTitle>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{notasRejeitadas}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Valor Emitido</CardTitle>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {valorTotalEmitido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Configs Ativas</CardTitle>
            <Shield className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{configsAtivas}</div>
            <p className="text-xs text-slate-500 mt-1">empresa(s)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-blue-900">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">IAs Fiscais Ativas:</span>
            <span>IA DIFAL • Validador SEFAZ • Anti-Erros Fiscais • Atualizadora Tributária</span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap">
          <TabsTrigger value="nfe" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Notas Fiscais
          </TabsTrigger>
          <TabsTrigger value="plano-contas" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Database className="w-4 h-4 mr-2" />
            Plano de Contas
          </TabsTrigger>
          <TabsTrigger value="dre" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            DRE Gerencial
          </TabsTrigger>
          <TabsTrigger value="sped" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            SPED Fiscal
          </TabsTrigger>
          <TabsTrigger value="impostos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Calculator className="w-4 h-4 mr-2" />
            Impostos e Retenções
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nfe">
          <NotasFiscaisTab 
            notasFiscais={notasFiscais} 
            isLoading={loadingNotas}
          />
        </TabsContent>

        <TabsContent value="plano-contas">
          <PlanoDeContasTree planoContas={planoContas} />
        </TabsContent>

        <TabsContent value="dre">
          <RelatorioDRE dre={dre} />
        </TabsContent>

        <TabsContent value="sped">
          <ExportacaoSPED sped={sped} />
        </TabsContent>

        <TabsContent value="impostos">
          <Card>
            <CardHeader>
              <CardTitle>Impostos e Retenções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Calculator className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Calculadora de impostos em desenvolvimento</p>
                <p className="text-xs mt-2">IRRF, INSS, ISS, PIS/COFINS</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}