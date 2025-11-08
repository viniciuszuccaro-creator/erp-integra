import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";

/**
 * Plano de Contas Tree - V21.3
 * Visualização hierárquica do plano de contas
 */
export default function PlanoDeContasTree({ planoContas = [] }) {
  const [expandido, setExpandido] = useState({});

  const toggleExpand = (contaId) => {
    setExpandido(prev => ({...prev, [contaId]: !prev[contaId]}));
  };

  const contasNivel1 = planoContas.filter(c => c.nivel === 1);

  const getContasFilhas = (contaId) => {
    return planoContas.filter(c => c.conta_superior_id === contaId);
  };

  const renderConta = (conta, nivel = 0) => {
    const filhas = getContasFilhas(conta.id);
    const temFilhas = filhas.length > 0;
    const isExpandido = expandido[conta.id];

    return (
      <div key={conta.id} style={{ marginLeft: `${nivel * 24}px` }}>
        <div className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded group">
          {temFilhas && (
            <button onClick={() => toggleExpand(conta.id)} className="p-1">
              {isExpandido ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}
          {!temFilhas && <div className="w-6" />}
          
          <div className="flex-1 flex items-center gap-3">
            <span className="font-mono text-sm text-slate-600">{conta.codigo_conta}</span>
            <span className="font-medium text-sm">{conta.descricao_conta}</span>
            <Badge variant="outline" className="text-xs">{conta.tipo}</Badge>
            {!conta.aceita_lancamento && (
              <Badge className="bg-slate-200 text-slate-600 text-xs">Sintética</Badge>
            )}
          </div>

          <div className="text-sm text-slate-600 font-semibold min-w-[120px] text-right">
            R$ {(conta.saldo_atual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {temFilhas && isExpandido && (
          <div>
            {filhas.map(filha => renderConta(filha, nivel + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Plano de Contas Hierárquico</CardTitle>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-[600px] overflow-y-auto">
          {contasNivel1.map(conta => renderConta(conta, 0))}
        </div>
      </CardContent>
    </Card>
  );
}