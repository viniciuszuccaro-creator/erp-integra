import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, Shield, TrendingUp, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StatusWidgetEtapas24Final() {
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-etapas24'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-etapas24'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-etapas24'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  // ETAPA 2
  const produtosEtapa2 = produtos.filter(p => 
    p.codigo?.startsWith('ETAPA2-') &&
    p.tributacao?.icms_aliquota !== undefined &&
    p.tributacao?.pis_aliquota !== undefined &&
    p.tributacao?.cofins_aliquota !== undefined &&
    p.tributacao?.ipi_aliquota !== undefined &&
    p.setor_atividade_nome &&
    p.grupo_produto_nome &&
    p.marca_nome
  );

  // ETAPA 4
  const perfisFinanceiros = perfis.filter(p =>
    p.nome_perfil?.includes('E4') &&
    (p.permissoes?.financeiro?.contas_receber?.length > 0 ||
     p.permissoes?.financeiro?.contas_pagar?.length > 0 ||
     p.permissoes?.financeiro?.caixa_diario?.length > 0)
  );

  const perfisAprovacao = perfis.filter(p =>
    p.nome_perfil?.includes('E4') &&
    (p.permissoes?.comercial?.pedidos?.includes('aprovar') ||
     (p.permissoes?.financeiro?.limite_aprovacao_pagamento !== undefined &&
      p.permissoes?.financeiro?.limite_aprovacao_pagamento > 0))
  );

  const pedidosEtapa4 = pedidos.filter(p =>
    p.numero_pedido?.startsWith('E4-') &&
    p.status_aprovacao &&
    p.margem_minima_produto !== undefined &&
    p.desconto_solicitado_percentual !== undefined
  );

  const etapa2Completa = produtosEtapa2.length >= 4;
  const etapa4Completa = perfisFinanceiros.length >= 6 && perfisAprovacao.length >= 4 && pedidosEtapa4.length >= 2;
  const tudoCompleto = etapa2Completa && etapa4Completa;

  return (
    <Card className={`border-2 ${tudoCompleto ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50'} w-full h-full`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tudoCompleto ? (
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Etapas 2 e 4
              </CardTitle>
              <p className="text-sm text-slate-600">Status de Completude</p>
            </div>
          </div>
          <Badge className={`text-lg px-4 py-2 ${tudoCompleto ? 'bg-green-600' : 'bg-orange-600'}`}>
            {tudoCompleto ? '✅ 100%' : '⚠️ Em Progresso'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* ETAPA 2 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-slate-900">ETAPA 2 - Produtos</span>
            </div>
            <Badge className={etapa2Completa ? 'bg-green-600' : 'bg-red-600'}>
              {produtosEtapa2.length}/4
            </Badge>
          </div>
          <Progress value={(produtosEtapa2.length / 4) * 100} className="h-2" />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle2 className={`w-4 h-4 ${produtosEtapa2.length >= 4 ? 'text-green-600' : 'text-gray-400'}`} />
              <span>Tributação Completa</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className={`w-4 h-4 ${produtosEtapa2.length >= 4 ? 'text-green-600' : 'text-gray-400'}`} />
              <span>Snapshots Sincronizados</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4"></div>

        {/* ETAPA 4 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-slate-900">ETAPA 4 - Financeiro</span>
            </div>
            <Badge className={etapa4Completa ? 'bg-green-600' : 'bg-red-600'}>
              {etapa4Completa ? '✅' : '❌'}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700">Perfis Financeiros</span>
              <Badge variant="outline" className={perfisFinanceiros.length >= 6 ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}>
                {perfisFinanceiros.length}/6
              </Badge>
            </div>
            <Progress value={(perfisFinanceiros.length / 6) * 100} className="h-1.5" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700">Perfis Aprovação</span>
              <Badge variant="outline" className={perfisAprovacao.length >= 4 ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}>
                {perfisAprovacao.length}/4
              </Badge>
            </div>
            <Progress value={(perfisAprovacao.length / 4) * 100} className="h-1.5" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700">Pedidos c/ Aprovação</span>
              <Badge variant="outline" className={pedidosEtapa4.length >= 2 ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}>
                {pedidosEtapa4.length}/2
              </Badge>
            </div>
            <Progress value={(pedidosEtapa4.length / 2) * 100} className="h-1.5" />
          </div>
        </div>

        {tudoCompleto && (
          <>
            <div className="border-t border-green-300 pt-4"></div>
            <div className="text-center p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-6 h-6" />
                <span className="font-bold text-lg">CERTIFICADO EMITIDO</span>
              </div>
              <p className="text-xs opacity-90">
                Etapas 2 e 4 - 100% Completas
              </p>
            </div>
          </>
        )}

      </CardContent>
    </Card>
  );
}