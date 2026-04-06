import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import VisualizadorUniversalEntidadeV24 from "@/components/cadastros/VisualizadorUniversalEntidadeV24";
import { Landmark, CreditCard, Wallet, Calculator, FolderKanban, Banknote, LineChart, Layers, BookText, DollarSign, Settings, Blocks } from "lucide-react";
import CountBadgeSimplificado from "@/components/cadastros/CountBadgeSimplificado";

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

export default function Bloco3Financeiro({ allCounts }) {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();
  const openList = (entidade, titulo, Icon, campos, FormComp) => () => openWindow(VisualizadorUniversalEntidadeV24, { nomeEntidade: entidade, tituloDisplay: titulo, icone: Icon, camposPrincipais: campos, componenteEdicao: FormComp, windowMode: true }, { title: titulo, width: 1400, height: 800 });

  const tiles = [
    { k: 'Banco', t: 'Bancos', i: Landmark, c: ['codigo','nome','agencia','conta'], f: BancoForm },
    { k: 'FormaPagamento', t: 'Formas de Pagamento', i: CreditCard, c: ['nome','tipo','ativo'], f: FormaPagamentoFormCompleto },
    { k: 'PlanoDeContas', t: 'Plano de Contas', i: BookText, c: ['codigo','descricao','tipo'], f: PlanoContasForm },
    { k: 'CentroCusto', t: 'Centros de Custo', i: Layers, c: ['codigo','descricao','tipo','responsavel'], f: CentroCustoForm },
    { k: 'CentroResultado', t: 'Centros de Resultado', i: LineChart, c: ['codigo','descricao'], f: CentroResultadoForm },
    { k: 'TipoDespesa', t: 'Tipos de Despesa', i: FolderKanban, c: ['codigo','nome','categoria','ativo'], f: TipoDespesaForm },
    { k: 'MoedaIndice', t: 'Moedas & Índices', i: DollarSign, c: ['moeda','indice','variacao'], f: MoedaIndiceForm },
    { k: 'OperadorCaixa', t: 'Operadores de Caixa', i: Wallet, c: ['nome','matricula','ativo'], f: OperadorCaixaForm },
    { k: 'GatewayPagamento', t: 'Gateways de Pagamento', i: Settings, custom: true },
    { k: 'ConfiguracaoDespesaRecorrente', t: 'Despesas Recorrentes', i: Calculator, c: ['descricao','periodicidade','valor','ativo'], f: ConfiguracaoDespesaRecorrenteForm },
    { k: 'TabelaFiscal', t: 'Tabelas Fiscais', i: Blocks, c: ['descricao','uf','vigencia'], f: TabelaFiscalForm },
    { k: 'CondicaoComercial', t: 'Condições Comerciais', i: Banknote, c: ['nome','desconto_maximo','prazo_padrao'], f: CondicaoComercialForm },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="rounded-sm shadow-sm border bg-white/80 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b rounded-t-sm">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-700"/> Financeiro & Fiscal
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-sm text-slate-600">Total consolidado do grupo.</CardContent>
      </Card>
      {tiles.map(({ k, t, i: Icon, c, f: FormComp, custom }) => (
        <Card key={k} className="rounded-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group border"
          onClick={!hasPermission('Financeiro', null, 'visualizar') ? undefined : (custom ? (() => openWindow(GestorGatewaysPagamento, { windowMode: true }, { title: t, width: 1200, height: 720 })) : openList(k, t, Icon, c, FormComp))}>
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                <div className="p-1.5 rounded-sm bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                {t}
                <CountBadgeSimplificado entities={[k]} allCounts={allCounts} />
              </CardTitle>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-sm text-xs h-7"
                onClick={(e) => { e.stopPropagation(); (custom ? (() => openWindow(GestorGatewaysPagamento, { windowMode: true }, { title: t, width: 1200, height: 720 })) : openList(k, t, Icon, c, FormComp))(); }}
                disabled={!hasPermission('Financeiro', null, 'visualizar')}>
                Abrir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 text-xs text-slate-500">Clique para listar, criar e editar.</CardContent>
        </Card>
      ))}
    </div>
  );
}