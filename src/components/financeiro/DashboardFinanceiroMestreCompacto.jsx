import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import HeaderDashboardMestre from './dashboard-mestre/HeaderDashboardMestre';
import KPIsMestre from './dashboard-mestre/KPIsMestre';
import MetricasSecundariasMestre from './dashboard-mestre/MetricasSecundariasMestre';
import GraficosFinanceirosMestre from './dashboard-mestre/GraficosFinanceirosMestre';
import IAInsightsMestre from './dashboard-mestre/IAInsightsMestre';

/**
 * DASHBOARD FINANCEIRO MESTRE COMPACTO V22.0 ETAPA 2
 * Consolidação 100% modular, sem abas, dimensões fixas
 */
export default function DashboardFinanceiroMestreCompacto({ windowMode = false }) {
  const { empresaAtual, estaNoGrupo, filtrarPorContexto } = useContextoVisual();

  // DADOS
  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber-dashboard'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar-dashboard'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  const { data: tiposDespesa = [] } = useQuery({
    queryKey: ['tipos-despesa-dashboard'],
    queryFn: () => base44.entities.TipoDespesa.list(),
  });

  const { data: configsRecorrentes = [] } = useQuery({
    queryKey: ['configs-recorrentes-dashboard'],
    queryFn: () => base44.entities.ConfiguracaoDespesaRecorrente.list(),
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento-dashboard'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  const { data: gateways = [] } = useQuery({
    queryKey: ['gateways-dashboard'],
    queryFn: () => base44.entities.GatewayPagamento.list(),
  });

  const { data: conciliacoes = [] } = useQuery({
    queryKey: ['conciliacoes-dashboard'],
    queryFn: () => base44.entities.ConciliacaoBancaria.list(),
  });

  const { data: extratos = [] } = useQuery({
    queryKey: ['extratos-dashboard'],
    queryFn: () => base44.entities.ExtratoBancario.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-dashboard'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  // FILTROS POR CONTEXTO
  const crFiltradas = filtrarPorContexto(contasReceber, 'empresa_id');
  const cpFiltradas = filtrarPorContexto(contasPagar, 'empresa_id');

  // CÁLCULOS PRINCIPAIS
  const totalReceber = crFiltradas.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor || 0), 0);
  const totalPagar = cpFiltradas.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor || 0), 0);
  const saldoLiquido = totalReceber - totalPagar;
  const totalRecebido = crFiltradas.filter(c => c.status === 'Recebido').reduce((s, c) => s + (c.valor_recebido || 0), 0);
  const totalPago = cpFiltradas.filter(c => c.status === 'Pago').reduce((s, c) => s + (c.valor_pago || 0), 0);

  // MÉTRICAS IA
  const conciliacoesAutomaticas = conciliacoes.filter(c => c.conciliado_por_ia).length;
  const scoreMedioConciliacao = conciliacoes.reduce((s, c) => s + (c.score_confianca_ia || 0), 0) / (conciliacoes.length || 1);
  const extratosPendentes = extratos.filter(e => !e.conciliado).length;

  // MÉTRICAS RECORRENTES
  const totalRecorrentesAtivas = configsRecorrentes.filter(c => c.ativa).length;
  const valorMensalRecorrente = configsRecorrentes
    .filter(c => c.ativa && c.periodicidade === 'Mensal')
    .reduce((s, c) => s + (c.valor_base || 0), 0);

  // MÉTRICAS FORMAS E GATEWAYS
  const formasAtivas = formasPagamento.filter(f => f.ativa).length;
  const gatewaysAtivos = gateways.filter(g => g.ativo).length;

  // DADOS PARA GRÁFICOS
  const dadosFluxo = [
    { nome: 'A Receber', valor: totalReceber, fill: '#10b981' },
    { nome: 'A Pagar', valor: totalPagar, fill: '#ef4444' },
    { nome: 'Recebido', valor: totalRecebido, fill: '#3b82f6' },
    { nome: 'Pago', valor: totalPago, fill: '#f59e0b' }
  ];

  const dadosCategorias = tiposDespesa
    .map(tipo => {
      const totalPorTipo = cpFiltradas
        .filter(cp => cp.categoria === tipo.categoria)
        .reduce((s, cp) => s + (cp.valor || 0), 0);
      return { categoria: tipo.categoria, valor: totalPorTipo };
    })
    .filter(d => d.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-auto" : "w-full"}>
      <div className={windowMode ? "p-3 space-y-3 flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50" : "p-3 space-y-3 bg-gradient-to-br from-slate-50 to-blue-50"}>
        <HeaderDashboardMestre estaNoGrupo={estaNoGrupo} empresaAtual={empresaAtual} />

        <KPIsMestre 
          totalReceber={totalReceber}
          totalPagar={totalPagar}
          saldoLiquido={saldoLiquido}
          crFiltradas={crFiltradas}
          cpFiltradas={cpFiltradas}
          totalRecorrentesAtivas={totalRecorrentesAtivas}
          valorMensalRecorrente={valorMensalRecorrente}
          conciliacoesAutomaticas={conciliacoesAutomaticas}
          scoreMedioConciliacao={scoreMedioConciliacao}
        />

        <MetricasSecundariasMestre 
          formasAtivas={formasAtivas}
          gatewaysAtivos={gatewaysAtivos}
          tiposDespesa={tiposDespesa}
          configsRecorrentes={configsRecorrentes}
          empresas={empresas}
          extratosPendentes={extratosPendentes}
        />

        <GraficosFinanceirosMestre 
          dadosFluxo={dadosFluxo}
          dadosCategorias={dadosCategorias}
        />

        <IAInsightsMestre 
          totalReceber={totalReceber}
          totalPagar={totalPagar}
          scoreMedioConciliacao={scoreMedioConciliacao}
          conciliacoesAutomaticas={conciliacoesAutomaticas}
          conciliacoes={conciliacoes}
          extratosPendentes={extratosPendentes}
          totalRecorrentesAtivas={totalRecorrentesAtivas}
        />
      </div>
    </div>
  );
}