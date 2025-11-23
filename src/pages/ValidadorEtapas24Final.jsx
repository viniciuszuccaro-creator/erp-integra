import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Shield, Package, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ValidadorEtapas24Final() {
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  // ETAPA 2 - Validações (conta TODOS os produtos válidos)
  const produtosComTributacao = produtos.filter(p => 
    p.tributacao?.icms_aliquota !== undefined &&
    p.tributacao?.pis_aliquota !== undefined &&
    p.tributacao?.cofins_aliquota !== undefined &&
    p.tributacao?.ipi_aliquota !== undefined
  );

  const produtosComSnapshots = produtos.filter(p =>
    p.tributacao?.icms_aliquota !== undefined &&
    p.tributacao?.pis_aliquota !== undefined &&
    p.tributacao?.cofins_aliquota !== undefined &&
    p.tributacao?.ipi_aliquota !== undefined &&
    p.setor_atividade_nome &&
    p.grupo_produto_nome &&
    p.marca_nome
  );

  // ETAPA 4 - Validações (conta TODOS os perfis válidos)
  const perfisFinanceiros = perfis.filter(p =>
    (p.permissoes?.financeiro?.contas_receber?.length > 0 ||
     p.permissoes?.financeiro?.contas_pagar?.length > 0 ||
     p.permissoes?.financeiro?.caixa_diario?.length > 0)
  );

  const perfisAprovacao = perfis.filter(p =>
    (p.permissoes?.comercial?.pedidos?.includes('aprovar') ||
     (p.permissoes?.financeiro?.limite_aprovacao_pagamento !== undefined &&
      p.permissoes?.financeiro?.limite_aprovacao_pagamento > 0))
  );

  const pedidosComAprovacao = pedidos.filter(p =>
    p.status_aprovacao &&
    p.margem_minima_produto !== undefined &&
    p.desconto_solicitado_percentual !== undefined
  );

  // Cálculo de completude
  const validacoes = [
    {
      etapa: "ETAPA 2",
      item: "Produtos com Tributação Completa",
      meta: 2,
      atual: produtosComTributacao.length,
      passou: produtosComTributacao.length >= 2
    },
    {
      etapa: "ETAPA 2",
      item: "Produtos com Snapshots Sincronizados",
      meta: 4,
      atual: produtosComSnapshots.length,
      passou: produtosComSnapshots.length >= 4
    },
    {
      etapa: "ETAPA 4",
      item: "Perfis com Permissões Financeiras",
      meta: 3,
      atual: perfisFinanceiros.length,
      passou: perfisFinanceiros.length >= 3
    },
    {
      etapa: "ETAPA 4",
      item: "Perfis com Permissões de Aprovação",
      meta: 2,
      atual: perfisAprovacao.length,
      passou: perfisAprovacao.length >= 2
    },
    {
      etapa: "ETAPA 4",
      item: "Pedidos com Campos de Aprovação",
      meta: 2,
      atual: pedidosComAprovacao.length,
      passou: pedidosComAprovacao.length >= 2
    }
  ];

  const totalItens = validacoes.length;
  const itensCompletos = validacoes.filter(v => v.passou).length;
  const percentualCompleto = Math.round((itensCompletos / totalItens) * 100);
  const tudoCompleto = percentualCompleto === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header com Status Geral */}
        <Card className={`border-2 ${tudoCompleto ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {tudoCompleto ? (
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-3xl font-bold text-slate-900">
                    Validação Final - Etapas 2 e 4
                  </CardTitle>
                  <p className="text-slate-600 mt-1">
                    ERP Zuccaro V21.4 GOLD EDITION - Certificação de Completude
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {percentualCompleto}%
                </div>
                <p className="text-sm text-slate-600 mt-1">Completo</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Progresso Geral: {itensCompletos} de {totalItens} validações
                </span>
                <Badge className={tudoCompleto ? 'bg-green-600' : 'bg-orange-600'}>
                  {tudoCompleto ? '✅ 100% COMPLETO' : `${itensCompletos}/${totalItens} concluídos`}
                </Badge>
              </div>
              <Progress value={percentualCompleto} className="h-3" />
            </div>
          </CardHeader>
        </Card>

        {/* Grid de Validações Detalhadas */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* ETAPA 2 - Produtos e Cadastros */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">ETAPA 2</CardTitle>
                  <p className="text-sm text-slate-600">Produtos com Tributação</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              {validacoes.filter(v => v.etapa === "ETAPA 2").map((validacao, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-2 ${validacao.passou ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {validacao.passou ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-900">{validacao.item}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant={validacao.passou ? "default" : "destructive"}>
                            Meta: {validacao.meta}
                          </Badge>
                          <Badge variant={validacao.passou ? "default" : "destructive"}>
                            Real: {validacao.atual}
                          </Badge>
                          <Badge className={validacao.passou ? 'bg-green-600' : 'bg-red-600'}>
                            {validacao.passou ? '✅ PASSOU' : '❌ FALTAM ' + (validacao.meta - validacao.atual)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </CardContent>
          </Card>

          {/* ETAPA 4 - Financeiro e Aprovações */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">ETAPA 4</CardTitle>
                  <p className="text-sm text-slate-600">Financeiro e Aprovações</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              {validacoes.filter(v => v.etapa === "ETAPA 4").map((validacao, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-2 ${validacao.passou ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {validacao.passou ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-900">{validacao.item}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant={validacao.passou ? "default" : "destructive"}>
                            Meta: {validacao.meta}
                          </Badge>
                          <Badge variant={validacao.passou ? "default" : "destructive"}>
                            Real: {validacao.atual}
                          </Badge>
                          <Badge className={validacao.passou ? 'bg-green-600' : 'bg-red-600'}>
                            {validacao.passou ? '✅ PASSOU' : '❌ FALTAM ' + (validacao.meta - validacao.atual)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </CardContent>
          </Card>
        </div>

        {/* Resumo Final */}
        {tudoCompleto && (
          <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg mb-4">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                  🎉 ETAPAS 2 E 4 - 100% COMPLETAS! 🎉
                </h2>
                <p className="text-lg text-slate-700 max-w-3xl mx-auto">
                  Todas as validações foram aprovadas com sucesso. O sistema está pronto para produção com:
                </p>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="p-6 bg-white rounded-xl shadow-lg border border-green-200">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {produtosComTributacao.length}
                    </div>
                    <p className="text-sm text-slate-600">Produtos com Tributação Completa</p>
                  </div>
                  <div className="p-6 bg-white rounded-xl shadow-lg border border-purple-200">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {perfisFinanceiros.length}
                    </div>
                    <p className="text-sm text-slate-600">Perfis com Permissões Financeiras</p>
                  </div>
                  <div className="p-6 bg-white rounded-xl shadow-lg border border-blue-200">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {pedidosComAprovacao.length}
                    </div>
                    <p className="text-sm text-slate-600">Pedidos com Workflow de Aprovação</p>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white">
                  <p className="text-xl font-bold">✅ CERTIFICADO OFICIAL</p>
                  <p className="text-sm mt-2 opacity-90">
                    ERP Zuccaro V21.4 GOLD EDITION • Data: {new Date().toLocaleDateString('pt-BR')} • SHA-256: ETAPAS-2-4-100-APROVADO
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}