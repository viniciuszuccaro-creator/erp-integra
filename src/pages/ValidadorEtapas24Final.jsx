import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function ValidadorEtapas24Final() {
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-validacao'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-validacao'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-validacao'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  // VALIDAÇÃO ETAPA 2
  const produtosTributadosCompletos = produtos.filter(p => 
    p.tributacao?.icms_aliquota !== undefined &&
    p.tributacao?.pis_aliquota !== undefined &&
    p.tributacao?.cofins_aliquota !== undefined &&
    p.tributacao?.ipi_aliquota !== undefined &&
    p.setor_atividade_nome &&
    p.grupo_produto_nome &&
    p.marca_nome
  );

  const produtosComSnapshots = produtos.filter(p =>
    p.setor_atividade_nome &&
    p.grupo_produto_nome &&
    p.marca_nome
  );

  // VALIDAÇÃO ETAPA 4
  const perfisFinanceiros = perfis.filter(p => {
    const fin = p.permissoes?.financeiro;
    return fin && (
      (Array.isArray(fin.contas_receber) && fin.contas_receber.length > 0) ||
      (Array.isArray(fin.contas_pagar) && fin.contas_pagar.length > 0) ||
      (Array.isArray(fin.caixa_diario) && fin.caixa_diario.length > 0) ||
      fin.pode_baixar_titulos === true ||
      (fin.limite_aprovacao_pagamento !== undefined && fin.limite_aprovacao_pagamento >= 0)
    );
  });

  const perfisAprovacao = perfis.filter(p => {
    const comercial = p.permissoes?.comercial;
    const financeiro = p.permissoes?.financeiro;
    return (comercial?.pedidos?.includes('aprovar') || 
            comercial?.orcamentos?.includes('aprovar')) ||
           (financeiro?.limite_aprovacao_pagamento !== undefined && financeiro.limite_aprovacao_pagamento > 0);
  });

  const pedidosComAprovacao = pedidos.filter(p =>
    p.status_aprovacao &&
    p.margem_minima_produto !== undefined &&
    p.margem_aplicada_vendedor !== undefined
  );

  const validacoes = [
    {
      etapa: "ETAPA 2",
      itens: [
        {
          nome: "Produtos com Tributação Completa (ICMS+PIS+COFINS+IPI)",
          esperado: 4,
          atual: produtosTributadosCompletos.length,
          ok: produtosTributadosCompletos.length >= 4,
          detalhes: produtosTributadosCompletos.map(p => p.codigo).join(', ')
        },
        {
          nome: "Snapshots Sincronizados (setor/grupo/marca)",
          esperado: 4,
          atual: produtosComSnapshots.length,
          ok: produtosComSnapshots.length >= 4,
          detalhes: `${produtosComSnapshots.length} produtos com snapshots completos`
        }
      ]
    },
    {
      etapa: "ETAPA 4",
      itens: [
        {
          nome: "Perfis com Permissões Financeiras",
          esperado: 6,
          atual: perfisFinanceiros.length,
          ok: perfisFinanceiros.length >= 6,
          detalhes: perfisFinanceiros.map(p => p.nome_perfil).join(', ')
        },
        {
          nome: "Perfis com Permissões de Aprovação",
          esperado: 4,
          atual: perfisAprovacao.length,
          ok: perfisAprovacao.length >= 4,
          detalhes: perfisAprovacao.map(p => p.nome_perfil).join(', ')
        },
        {
          nome: "Pedidos com Campos de Aprovação",
          esperado: 2,
          atual: pedidosComAprovacao.length,
          ok: pedidosComAprovacao.length >= 2,
          detalhes: pedidosComAprovacao.map(p => p.numero_pedido).join(', ')
        }
      ]
    }
  ];

  const totalItens = validacoes.reduce((sum, v) => sum + v.itens.length, 0);
  const itensOk = validacoes.reduce((sum, v) => sum + v.itens.filter(i => i.ok).length, 0);
  const percentual = Math.round((itensOk / totalItens) * 100);
  const tudoOk = percentual === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Card className={`border-2 ${tudoOk ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl flex items-center gap-3">
                {tudoOk ? (
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-yellow-600" />
                )}
                Validador Etapas 2 e 4 - Final
              </CardTitle>
              <div className="text-right">
                <div className={`text-6xl font-bold ${tudoOk ? 'text-green-600' : 'text-yellow-600'}`}>
                  {percentual}%
                </div>
                <p className="text-sm text-slate-600">{itensOk}/{totalItens} validações</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {validacoes.map((etapa, idx) => (
              <Card key={idx} className="border-slate-200">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="text-xl">{etapa.etapa}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {etapa.itens.map((item, itemIdx) => (
                      <div key={itemIdx} className={`p-4 rounded-lg border-2 ${item.ok ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {item.ok ? (
                              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 mb-1">{item.nome}</h4>
                              <p className="text-sm text-slate-600 mb-2">
                                Esperado: {item.esperado} | Encontrado: {item.atual}
                              </p>
                              <p className="text-xs text-slate-500 bg-white/50 p-2 rounded">
                                {item.detalhes}
                              </p>
                            </div>
                          </div>
                          <Badge className={item.ok ? 'bg-green-600' : 'bg-red-600'}>
                            {item.ok ? 'OK' : 'FALTA'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {tudoOk && (
              <Card className="border-2 border-green-500 bg-gradient-to-r from-green-100 to-emerald-100">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-900 mb-2">
                    🎉 ETAPAS 2 E 4 - 100% COMPLETAS!
                  </h3>
                  <p className="text-green-800 text-lg">
                    Todas as validações passaram com sucesso. Sistema aprovado para produção!
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}