import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidade";
import { Landmark, CreditCard, Wallet, Calculator, FolderKanban, Banknote, LineChart, Layers, BookText, DollarSign, Settings, Blocks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

import BancoForm from "@/components/cadastros/BancoForm";
import FormaPagamentoFormCompleto from "@/components/cadastros/FormaPagamentoFormCompleto";
import GestorGatewaysPagamento from "@/components/cadastros/GestorGatewaysPagamento";
import ConfiguracaoDespesaRecorrenteForm from "@/components/cadastros/ConfiguracaoDespesaRecorrenteForm";
import TabelaFiscalForm from "@/components/cadastros/TabelaFiscalForm";
import CondicaoComercialForm from "@/components/cadastros/CondicaoComercialForm";
import CentroCustoForm from "@/components/cadastros/CentroCustoForm";
import CentroResultadoForm from "@/components/cadastros/CentroResultadoForm";
import PlanoContasForm from "@/components/cadastros/PlanoContasForm";
import TipoDespesaForm from "@/components/cadastros/TipoDespesaForm";
import MoedaIndiceForm from "@/components/cadastros/MoedaIndiceForm";
import OperadorCaixaForm from "@/components/cadastros/OperadorCaixaForm";

function CountBadge({ entityName }) {
  const { getFiltroContexto } = useContextoVisual();
  const { data: count = 0 } = useQuery({
    queryKey: ['count','cadastros',entityName],
    queryFn: async () => {
      const resp = await base44.functions.invoke('countEntities', { entityName, filter: getFiltroContexto('empresa_id', true) });
      return resp?.data?.count || 0;
    },
    staleTime: 60000
  });
  return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">{count}</Badge>;
}

export default function Bloco3Financeiro() {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();
  const openList = (entidade, titulo, Icon, campos, FormComp) => () => openWindow(VisualizadorUniversalEntidade, { nomeEntidade: entidade, tituloDisplay: titulo, icone: Icon, camposPrincipais: campos, componenteEdicao: FormComp, windowMode: true }, { title: titulo, width: 1400, height: 800 });

  const tiles = [
    { k: 'Banco', t: 'Bancos', i: Landmark, c: ['codigo','nome','agencia','conta'], f: BancoForm },
    { k: 'FormaPagamento', t: 'Formas de Pagamento', i: CreditCard, c: ['nome','tipo','ativo'], f: FormaPagamentoFormCompleto },
    { k: 'PlanoDeContas', t: 'Plano de Contas', i: BookText, c: ['codigo','descricao','tipo'], f: PlanoContasForm },
    { k: 'CentroCusto', t: 'Centros de Custo', i: Layers, c: ['codigo','descricao','tipo','responsavel'], f: CentroCustoForm },
    { k: 'CentroResultado', t: 'Centros de Resultado', i: LineChart, c: ['codigo','descricao'], f: CentroResultadoForm },
    { k: 'TipoDespesa', t: 'Tipos de Despesa', i: FolderKanban, c: ['descricao','categoria'], f: TipoDespesaForm },
    { k: 'MoedaIndice', t: 'Moedas & Índices', i: DollarSign, c: ['moeda','indice','variacao'], f: MoedaIndiceForm },
    { k: 'OperadorCaixa', t: 'Operadores de Caixa', i: Wallet, c: ['nome','matricula','ativo'], f: OperadorCaixaForm },
    { k: 'GatewayPagamento', t: 'Gateways de Pagamento', i: Settings, custom: true },
    { k: 'ConfiguracaoDespesaRecorrente', t: 'Despesas Recorrentes', i: Calculator, c: ['descricao','periodicidade','valor','ativo'], f: ConfiguracaoDespesaRecorrenteForm },
    { k: 'TabelaFiscal', t: 'Tabelas Fiscais', i: Blocks, c: ['descricao','uf','vigencia'], f: TabelaFiscalForm },
    { k: 'CondicaoComercial', t: 'Condições Comerciais', i: Banknote, c: ['nome','desconto_maximo','prazo_padrao'], f: CondicaoComercialForm },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {tiles.map(({ k, t, i: Icon, c, f: FormComp, custom }) => (
        <Card key={k} className="hover:shadow-lg transition-all">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                                <Icon className="w-5 h-5 text-slate-600"/> {t}
                                <span className="ml-2"><CountBadge entityName={k} /></span>
                              </CardTitle>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={custom ? (()=>openWindow(GestorGatewaysPagamento, { windowMode: true }, { title: t, width: 1200, height: 720 })) : openList(k, t, Icon, c, FormComp)} disabled={!hasPermission('financeiro','ver')}>
                Abrir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-sm text-slate-600">Gerencie {t} em janelas redimensionáveis.</CardContent>
        </Card>
      ))}
    </div>
  );
}