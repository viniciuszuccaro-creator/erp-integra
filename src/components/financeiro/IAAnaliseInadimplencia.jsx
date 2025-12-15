import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, TrendingDown, AlertTriangle, CheckCircle2, Target, Clock, DollarSign } from "lucide-react";

export default function IAAnaliseInadimplencia({ contasReceber = [] }) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  // Análise de inadimplência por IA
  const contasAtrasadas = contasReceber.filter(c => 
    c.status === 'Atrasado' || 
    (c.status === 'Pendente' && new Date(c.data_vencimento) < new Date())
  );

  const analiseClientes = clientes.map(cliente => {
    const contasCliente = contasReceber.filter(c => c.cliente_id === cliente.id);
    const contasAtrasadasCliente = contasAtrasadas.filter(c => c.cliente_id === cliente.id);
    
    const totalDevedor = contasAtrasadasCliente.reduce((sum, c) => sum + (c.valor || 0), 0);
    const diasAtrasoMedio = contasAtrasadasCliente.length > 0
      ? contasAtrasadasCliente.reduce((sum, c) => {
          const dias = Math.floor((new Date() - new Date(c.data_vencimento)) / (1000 * 60 * 60 * 24));
          return sum + dias;
        }, 0) / contasAtrasadasCliente.length
      : 0;

    const scoreHistorico = cliente.score_pagamento || 100;
    const scoreIA = cliente.score_confianca_ia || 50;
    
    // Score combinado de risco
    const scoreFinal = Math.round(
      scoreHistorico * 0.5 +
      scoreIA * 0.3 +
      (diasAtrasoMedio > 0 ? Math.max(0, 100 - diasAtrasoMedio * 2) : 100) * 0.2
    );

    let nivelRisco = 'Baixo';
    let corRisco = 'text-green-600';
    if (scoreFinal < 40) { nivelRisco = 'Crítico'; corRisco = 'text-red-600'; }
    else if (scoreFinal < 60) { nivelRisco = 'Alto'; corRisco = 'text-orange-600'; }
    else if (scoreFinal < 80) { nivelRisco = 'Médio'; corRisco = 'text-yellow-600'; }

    return {
      cliente,
      totalDevedor,
      contasAtrasadas: contasAtrasadasCliente.length,
      diasAtrasoMedio,
      scoreFinal,
      nivelRisco,
      corRisco,
      probabilidadePagamento: scoreFinal
    };
  }).filter(a => a.totalDevedor > 0)
    .sort((a, b) => a.scoreFinal - b.scoreFinal);

  const totalInadimplencia = contasAtrasadas.reduce((sum, c) => sum + (c.valor || 0), 0);
  const clientesEmRisco = analiseClientes.filter(a => a.scoreFinal < 60).length;
  const acoesSugeridas = analiseClientes.filter(a => a.scoreFinal < 80 && a.totalDevedor > 0);

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 w-full">
      <CardHeader className="border-b bg-white/50">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-orange-600" />
          IA - Análise de Inadimplência
          <Badge className="bg-orange-100 text-orange-700 ml-auto">
            {clientesEmRisco} clientes em risco
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Resumo Executivo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs text-slate-600">Inadimplência Total</span>
            </div>
            <p className="text-xl font-bold text-red-600">
              R$ {totalInadimplencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500">{contasAtrasadas.length} títulos</p>
          </div>
          
          <div className="bg-white p-3 rounded border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-slate-600">Clientes em Risco</span>
            </div>
            <p className="text-xl font-bold text-orange-600">{clientesEmRisco}</p>
            <p className="text-xs text-slate-500">Score {'<'} 60</p>
          </div>
          
          <div className="bg-white p-3 rounded border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-600">Ações Sugeridas</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{acoesSugeridas.length}</p>
            <p className="text-xs text-slate-500">Intervenções recomendadas</p>
          </div>
        </div>

        {/* Top 5 Devedores Críticos */}
        {analiseClientes.length > 0 && (
          <>
            <Alert className="border-red-300 bg-red-50">
              <AlertDescription>
                <p className="font-semibold text-red-900 mb-2">🚨 Clientes Críticos</p>
                <div className="space-y-2">
                  {analiseClientes.slice(0, 5).map((analise, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-sm">{analise.cliente.nome}</span>
                          <Badge className={`ml-2 text-xs ${analise.corRisco} bg-white border`}>
                            {analise.nivelRisco}
                          </Badge>
                        </div>
                        <span className={`text-lg font-bold ${analise.corRisco}`}>
                          {analise.scoreFinal}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Devedor:</span>
                          <p className="font-semibold text-red-600">R$ {analise.totalDevedor.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Títulos:</span>
                          <p className="font-semibold">{analise.contasAtrasadas}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Atraso Médio:</span>
                          <p className="font-semibold">{Math.round(analise.diasAtrasoMedio)}d</p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <p className="text-xs text-slate-700">
                          <strong>Ação Sugerida:</strong> {
                            analise.scoreFinal < 40 
                              ? '🔴 Suspender crédito e acionar jurídico'
                              : analise.scoreFinal < 60
                              ? '🟠 Contato urgente + renegociação'
                              : '🟡 Enviar lembrete de cobrança'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
              className="w-full"
            >
              {mostrarDetalhes ? '▼' : '►'} Ver Análise Completa ({analiseClientes.length} clientes)
            </Button>

            {mostrarDetalhes && (
              <div className="space-y-2 max-h-96 overflow-y-auto p-2 bg-white rounded">
                {analiseClientes.map((analise, idx) => (
                  <div key={idx} className="p-2 border rounded hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{analise.cliente.nome}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={`${analise.corRisco} bg-white border text-xs`}>
                          {analise.nivelRisco}
                        </Badge>
                        <span className={`text-sm font-bold ${analise.corRisco}`}>
                          {analise.scoreFinal}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs mt-2">
                      <div>
                        <span className="text-slate-500">Devedor:</span>
                        <p className="font-semibold">R$ {analise.totalDevedor.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Títulos:</span>
                        <p className="font-semibold">{analise.contasAtrasadas}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Atraso:</span>
                        <p className="font-semibold">{Math.round(analise.diasAtrasoMedio)}d</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Prob. Pgto:</span>
                        <p className="font-semibold">{analise.probabilidadePagamento}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {analiseClientes.length === 0 && (
          <Alert className="border-green-300 bg-green-50">
            <AlertDescription className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">✨ Nenhum cliente com inadimplência detectada!</span>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}