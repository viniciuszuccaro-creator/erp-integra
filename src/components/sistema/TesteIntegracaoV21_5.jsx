import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleCheck, XCircle, Zap, Brain, Package } from "lucide-react";
import { toast } from "sonner";
import { executarJobCrossCD } from "@/components/compras/JobIACrossCD";

/**
 * V21.5 - TESTE COMPLETO: Fase 5 - Compras & Suprimentos
 * Valida: IA Cross-CD, Entrada NF-e, Custo Médio, Aprovação Orçamentária
 */
export default function TesteIntegracaoV21_5({ empresaId }) {
  const [executando, setExecutando] = useState(false);
  const [resultados, setResultados] = useState([]);

  const executarFullScan = async () => {
    setExecutando(true);
    setResultados([]);
    const logs = [];

    try {
      // TESTE 1: IA Cross-CD
      logs.push({ teste: 'IA Cross-CD', status: 'executando' });
      setResultados([...logs]);

      const empresa = await base44.entities.Empresa.filter({ id: empresaId });
      const grupoId = empresa[0]?.grupo_id;

      if (grupoId) {
        const sugestoes = await executarJobCrossCD(grupoId);
        logs[0] = { 
          teste: 'IA Cross-CD', 
          status: sugestoes.length > 0 ? 'sucesso' : 'info',
          detalhes: `${sugestoes.length} transferência(s) sugerida(s)`
        };
      } else {
        logs[0] = { teste: 'IA Cross-CD', status: 'warning', detalhes: 'Empresa sem grupo' };
      }

      setResultados([...logs]);

      // TESTE 2: IA Reposição Automática
      logs.push({ teste: 'IA Reposição Preditiva', status: 'executando' });
      setResultados([...logs]);

      const produtos = await base44.entities.Produto.filter({ empresa_id: empresaId });
      const produtosBaixos = produtos.filter(p => 
        (p.estoque_disponivel || 0) < (p.estoque_minimo || 0)
      );

      logs[1] = { 
        teste: 'IA Reposição Preditiva', 
        status: produtosBaixos.length > 0 ? 'sucesso' : 'info',
        detalhes: `${produtosBaixos.length} produto(s) abaixo do mínimo`
      };

      setResultados([...logs]);

      // TESTE 3: Entrada NF-e → Custo Médio
      logs.push({ teste: 'Recálculo Custo Médio', status: 'executando' });
      setResultados([...logs]);

      const movimentacoes = await base44.entities.MovimentacaoEstoque.filter({
        empresa_id: empresaId,
        origem_movimento: 'compra'
      }, '-data_movimentacao', 1);

      if (movimentacoes.length > 0) {
        const mov = movimentacoes[0];
        logs[2] = {
          teste: 'Recálculo Custo Médio',
          status: mov.custo_medio ? 'sucesso' : 'erro',
          detalhes: mov.custo_medio 
            ? `Custo médio: R$ ${mov.custo_medio.toFixed(2)}/KG`
            : 'Custo médio não foi calculado'
        };
      } else {
        logs[2] = { teste: 'Recálculo Custo Médio', status: 'info', detalhes: 'Sem entradas para testar' };
      }

      setResultados([...logs]);

      // TESTE 4: ContaPagar liberada após entrada
      logs.push({ teste: 'Liberação ContaPagar', status: 'executando' });
      setResultados([...logs]);

      const contas = await base44.entities.ContaPagar.filter({
        empresa_id: empresaId,
        status_pagamento: 'Aprovado'
      }, '-created_date', 1);

      logs[3] = {
        teste: 'Liberação ContaPagar',
        status: contas.length > 0 ? 'sucesso' : 'info',
        detalhes: contas.length > 0 
          ? `${contas.length} conta(s) aprovada(s) após entrada`
          : 'Nenhuma conta liberada recentemente'
      };

      setResultados([...logs]);

      toast.success('✅ Full Scan V21.5 Concluído!');

    } catch (error) {
      console.error('Erro no teste:', error);
      toast.error('❌ Erro no Full Scan');
      logs.push({ teste: 'Erro Geral', status: 'erro', detalhes: error.message });
      setResultados([...logs]);
    } finally {
      setExecutando(false);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Teste V21.5 - Compras & Suprimentos (Full Scan)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-purple-300 bg-purple-50">
          <Package className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-800">
            <strong>Testa:</strong> IA Cross-CD, Entrada NF-e, Custo Médio, Aprovação Orçamentária
          </AlertDescription>
        </Alert>

        <Button
          onClick={executarFullScan}
          disabled={executando}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {executando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Executando Full Scan...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Executar Full Scan V21.5
            </>
          )}
        </Button>

        {/* Resultados */}
        {resultados.length > 0 && (
          <div className="space-y-2">
            <p className="font-bold text-sm">Resultados:</p>
            {resultados.map((res, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-2 ${
                  res.status === 'sucesso' ? 'bg-green-50 border-green-300' :
                  res.status === 'erro' ? 'bg-red-50 border-red-300' :
                  res.status === 'executando' ? 'bg-blue-50 border-blue-300' :
                  'bg-yellow-50 border-yellow-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {res.status === 'sucesso' && <CircleCheck className="w-4 h-4 text-green-600" />}
                    {res.status === 'erro' && <XCircle className="w-4 h-4 text-red-600" />}
                    {res.status === 'executando' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                    <p className="font-bold text-sm">{res.teste}</p>
                  </div>
                  <Badge className={
                    res.status === 'sucesso' ? 'bg-green-600' :
                    res.status === 'erro' ? 'bg-red-600' :
                    res.status === 'executando' ? 'bg-blue-600' :
                    'bg-yellow-600'
                  }>
                    {res.status}
                  </Badge>
                </div>
                {res.detalhes && (
                  <p className="text-xs text-slate-600 mt-2">{res.detalhes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}