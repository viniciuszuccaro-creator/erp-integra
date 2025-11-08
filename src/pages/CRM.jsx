import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Target, TrendingUp, AlertCircle, Zap, Plus } from "lucide-react";
import FunilVisual from "../components/crm/FunilVisual";
import AgendarFollowUp from "../components/crm/AgendarFollowUp";
import ConverterOportunidade from "../components/crm/ConverterOportunidade";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";

/**
 * Módulo CRM - V21.1 Fase 1
 * Funil de Vendas + IA Lead Scoring + Gestão de Oportunidades
 */
export default function CRM() {
  const { user } = useUser();
  const [oportunidadeSelecionada, setOportunidadeSelecionada] = useState(null);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [converterOpen, setConverterOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: oportunidades = [], isLoading } = useQuery({
    queryKey: ['oportunidades'],
    queryFn: () => base44.entities.Oportunidade.list('-data_abertura'),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: interacoes = [] } = useQuery({
    queryKey: ['interacoes'],
    queryFn: () => base44.entities.Interacao.list('-data_interacao'),
  });

  // KPIs
  const oportunidadesAbertas = oportunidades.filter(o => o.status === 'Aberto');
  const oportunidadesGanhas = oportunidades.filter(o => o.status === 'Ganho');
  const oportunidadesPerdidas = oportunidades.filter(o => o.status === 'Perdido');
  
  const valorTotalPipeline = oportunidadesAbertas.reduce((sum, o) => sum + (o.valor_estimado || 0), 0);
  const valorGanho = oportunidadesGanhas.reduce((sum, o) => sum + (o.valor_estimado || 0), 0);
  
  const taxaConversao = oportunidades.length > 0 
    ? ((oportunidadesGanhas.length / oportunidades.length) * 100).toFixed(1) 
    : 0;

  // Oportunidades em risco (sem contato há mais de 7 dias)
  const oportunidadesEmRisco = oportunidadesAbertas.filter(o => {
    return o.dias_sem_contato > 7;
  });

  // Oportunidades do chatbot pendentes
  const oportunidadesChatbot = oportunidades.filter(o => 
    o.origem === 'Chatbot' && o.etapa === 'Prospecção'
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">CRM - Relacionamento com Cliente</h1>
          <p className="text-slate-600">Funil de vendas, oportunidades e gestão de leads</p>
        </div>
        
        <div className="flex gap-2">
          {oportunidadesChatbot.length > 0 && (
            <Badge className="bg-purple-100 text-purple-700 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              {oportunidadesChatbot.length} lead(s) do chatbot
            </Badge>
          )}
          {oportunidadesEmRisco.length > 0 && (
            <Badge className="bg-orange-100 text-orange-700 px-4 py-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              {oportunidadesEmRisco.length} em risco de churn
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pipeline Total</CardTitle>
            <Target className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {valorTotalPipeline.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {oportunidadesAbertas.length} oportunidade(s)
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Oportunidades Ganhas</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{oportunidadesGanhas.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              R$ {valorGanho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa de Conversão</CardTitle>
            <Target className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{taxaConversao}%</div>
            <p className="text-xs text-slate-500 mt-1">
              {oportunidadesGanhas.length} / {oportunidades.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Clientes</CardTitle>
            <Users className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{clientes.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {clientes.filter(c => c.status === 'Ativo').length} ativo(s)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-green-900">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">IAs CRM Ativas:</span>
            <span>Lead Scoring • Priorização Inteligente • Detecção de Churn • Sentimento de Oportunidade</span>
          </div>
        </CardContent>
      </Card>

      <FunilVisual 
        oportunidades={oportunidades}
        isLoading={isLoading}
        onSelectOportunidade={(op) => {
          setOportunidadeSelecionada(op);
          setFollowUpOpen(true);
        }}
        onConverterOportunidade={(op) => {
          setOportunidadeSelecionada(op);
          setConverterOpen(true);
        }}
      />

      <AgendarFollowUp 
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
        oportunidade={oportunidadeSelecionada}
      />

      <ConverterOportunidade
        open={converterOpen}
        onOpenChange={setConverterOpen}
        oportunidade={oportunidadeSelecionada}
      />
    </div>
  );
}