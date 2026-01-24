import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * CONCILIAÇÃO DETALHADA - Matching banco ↔ sistema
 * ETAPA 2: Análise visual de divergências
 */

export default function ConciliacaoDetalhada({ conciliacaoId }) {
  const [conciliacao, setConciliacao] = useState(null);
  const [itemsConciliados, setItemsConciliados] = useState([]);

  useEffect(() => {
    const carregarConciliacao = async () => {
      const c = await base44.entities.ConciliacaoBancaria.get(conciliacaoId);
      setConciliacao(c);

      // Comparar banco vs sistema
      const movBanco = c.movimentacoes_banco || [];
      const movSistema = c.movimentacoes_sistema || [];

      const itens = movBanco.map((movBanco, idx) => {
        const movSist = movSistema.find(m =>
          m.data_prevista === movBanco.data && Math.abs(m.valor - movBanco.valor) < 0.01
        );
        return {
          banco: movBanco,
          sistema: movSist,
          conciliado: !!movSist,
          diferenca: movSist ? movSist.valor - movBanco.valor : movBanco.valor
        };
      });

      setItemsConciliados(itens);
    };
    carregarConciliacao();
  }, [conciliacaoId]);

  if (!conciliacao) return <div className="p-4">Carregando...</div>;

  const totalConciliado = itemsConciliados.filter(i => i.conciliado).length;
  const percentualConciliacao = itemsConciliados.length > 0 
    ? (totalConciliado / itemsConciliados.length) * 100 
    : 0;

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl overflow-auto h-full">
      <h2 className="text-xl font-bold text-slate-900">Conciliação Detalhada</h2>

      {/* Resumo */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Movimentações</span>
            <p className="font-bold text-lg">{itemsConciliados.length}</p>
          </div>
          <div>
            <span className="text-slate-600">Conciliadas</span>
            <p className="font-bold text-green-600 text-lg">{totalConciliado}</p>
          </div>
          <div>
            <span className="text-slate-600">Pendentes</span>
            <p className="font-bold text-yellow-600 text-lg">{itemsConciliados.length - totalConciliado}</p>
          </div>
        </CardContent>
      </Card>

      {/* Barra de Progresso */}
      <div className="space-y-2">
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all"
            style={{ width: `${percentualConciliacao}%` }}
          />
        </div>
        <span className="text-sm text-slate-600">{Math.round(percentualConciliacao)}% conciliado</span>
      </div>

      {/* Itens de Conciliação */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {itemsConciliados.map((item, idx) => (
          <Card key={idx} className={`border-l-4 ${
            item.conciliado ? 'border-l-green-600' : 'border-l-yellow-600'
          }`}>
            <CardContent className="pt-4 grid grid-cols-5 gap-2 text-sm">
              <div>
                <span className="text-slate-600">Data</span>
                <p className="font-semibold">{item.banco.data}</p>
              </div>
              <div>
                <span className="text-slate-600">Descrição</span>
                <p className="font-semibold">{item.banco.descricao}</p>
              </div>
              <div>
                <span className="text-slate-600">Banco</span>
                <p className="font-bold">R$ {item.banco.valor.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-slate-600">Sistema</span>
                <p className="font-bold">{item.sistema ? `R$ ${item.sistema.valor.toFixed(2)}` : '-'}</p>
              </div>
              <div className="flex items-center justify-end">
                {item.conciliado ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ação */}
      {percentualConciliacao === 100 && (
        <Button className="w-full bg-green-600 hover:bg-green-700">
          ✅ Finalizar Conciliação
        </Button>
      )}
    </div>
  );
}