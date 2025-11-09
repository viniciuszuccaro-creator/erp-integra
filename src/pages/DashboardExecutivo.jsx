import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  AlertTriangle,
  Target,
  Factory,
  Building2,
  Brain,
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useUser } from "@/components/lib/UserContext";

/**
 * V21.7 - Dashboard Executivo (Nível 2 - Visão Diretoria)
 * Foco em tendências, rentabilidade e riscos estratégicos
 */
export default function DashboardExecutivo() {
  const { grupoAtual } = useUser();
  const [periodoAnalise, setPeriodoAnalise] = useState("30"); // dias

  // Dados consolidados
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-executivo'],
    queryFn: () => base44.entities.Pedido.list('-data_pedido', 500),
  });

  const { data: ops = [] } = useQuery({
    queryKey: ['ops-executivo'],
    queryFn: () => base44.entities.OrdemProducao.list('-data_emissao', 300),
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas-executivo'],
    queryFn: () => base44.entities.Entrega.list('-data_previsao', 300),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-executivo'],
    queryFn: () => base44.entities.ContaReceber.list('-data_vencimento', 500),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-executivo'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-executivo'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-executivo'],
    queryFn: () => base44.entities.Empresa.filter({ grupo_id: grupoAtual?.id }),
    enabled: !!grupoAtual?.id
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos-executivo'],
    queryFn: () => base44.entities.Veiculo.list(),
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['nfes-executivo'],
    queryFn: () => base44.entities.NotaFiscal.list('-data_emissao', 200),
  });

  // Filtrar por período
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - parseInt(periodoAnalise));

  const pedidosPeriodo = pedidos.filter(p => new Date(p.data_pedido) >= dataInicio);
  const opsPeriodo = ops.filter(op => new Date(op.data_emissao) >= dataInicio);
  const entregasPeriodo = entregas.filter(e => new Date(e.data_previsao || e.created_date) >= dataInicio);
  const nfesPeriodo = notasFiscais.filter(nf => new Date(nf.data_emissao) >= dataInicio);

  // Refugos do período
  const refugosPeriodo = [];
  opsPeriodo.forEach(op => {
    if (op.refugos && op.refugos.length > 0) {
      op.refugos.forEach(ref => refugosPeriodo.push({ ...ref, op_numero: op.numero_op }));
    }
  });

  // === VENDAS E CONVERSÃO ===
  const vendaPorOrigem = {};
  pedidosPeriodo.forEach(p => {
    const origem = p.origem_pedido || 'Manual';
    if (!vendaPorOrigem[origem]) {
      vendaPorOrigem[origem] = { origem, quantidade: 0, valor: 0 };
    }
    vendaPorOrigem[origem].quantidade += 1;
    vendaPorOrigem[origem].valor += p.valor_total || 0;
  });

  const dadosConversaoOrigem = Object.values(vendaPorOrigem).map(d => ({
    ...d,
    ticket_medio: d.quantidade > 0 ? d.valor / d.quantidade : 0
  }));

  // === PRODUÇÃO X VENDAS ===
  const vendasKG = pedidosPeriodo.reduce((sum, p) => {
    let kgPedido = 0;
    (p.itens_revenda || []).forEach(item => {
      if (item.unidade === 'KG') kgPedido += item.quantidade;
      else if (item.peso_total_kg) kgPedido += item.peso_total_kg;
    });
    (p.itens_armado_padrao || []).forEach(item => kgPedido += item.peso_total_kg || 0);
    (p.itens_corte_dobra || []).forEach(item => kgPedido += item.peso_total_kg || 0);
    return sum + kgPedido;
  }, 0);

  const pesoTotalProduzido = opsPeriodo.reduce((sum, op) => sum + (op.peso_real_total_kg || 0), 0);
  const pesoTotalRefugado = refugosPeriodo.reduce((sum, r) => sum + (r.peso_refugado_kg || 0), 0);

  const percentualReaproveitamento = pesoTotalProduzido > 0 
    ? ((pesoTotalProduzido - pesoTotalRefugado) / pesoTotalProduzido) * 100 
    : 100;

  // === LOGÍSTICA E SLA ===
  const entregasNoPrazo = entregasPeriodo.filter(e => {
    if (e.status !== 'Entregue' || !e.data_entrega || !e.data_previsao) return false;
    return new Date(e.data_entrega) <= new Date(e.data_previsao);
  }).length;

  const totalEntregasFinalizadas = entregasPeriodo.filter(e => e.status === 'Entregue').length;
  const otd = totalEntregasFinalizadas > 0 
    ? (entregasNoPrazo / totalEntregasFinalizadas) * 100 
    : 0;

  const veiculosManutencao = veiculos.filter(v => v.status === 'Em Manutenção').length;

  // === FINANCEIRO/FISCAL ===
  const contasPorFaixa = {
    '0_dias': contasReceber.filter(c => c.dias_atraso === 0 && c.status === 'Pendente').length,
    '7_dias': contasReceber.filter(c => c.dias_atraso > 0 && c.dias_atraso <= 7).length,
    '30_dias': contasReceber.filter(c => c.dias_atraso > 7 && c.dias_atraso <= 30).length,
    '60_dias': contasReceber.filter(c => c.dias_atraso > 30 && c.dias_atraso <= 60).length,
    'acima_60': contasReceber.filter(c => c.dias_atraso > 60).length
  };

  const dadosContasPorFaixa = [
    { faixa: 'A Vencer', quantidade: contasPorFaixa['0_dias'] },
    { faixa: '1-7 dias', quantidade: contasPorFaixa['7_dias'] },
    { faixa: '8-30 dias', quantidade: contasPorFaixa['30_dias'] },
    { faixa: '31-60 dias', quantidade: contasPorFaixa['60_dias'] },
    { faixa: '>60 dias', quantidade: contasPorFaixa['acima_60'] }
  ];

  const nfesAutorizadas = nfesPeriodo.filter(nf => nf.status === 'Autorizada').length;
  const nfesRejeitadas = nfesPeriodo.filter(nf => nf.status === 'Rejeitada').length;
  const taxaSucessoNFe = (nfesAutorizadas + nfesRejeitadas) > 0
    ? (nfesAutorizadas / (nfesAutorizadas + nfesRejeitadas)) * 100
    : 0;

  // === MULTI-EMPRESA (Comparativo) ===
  const dadosComparativoEmpresas = empresas.map(emp => {
    const pedidosEmp = pedidosPeriodo.filter(p => p.empresa_id === emp.id);
    const opsEmp = opsPeriodo.filter(op => op.empresa_id === emp.id);
    const entregasEmp = entregasPeriodo.filter(e => e.empresa_id === emp.id);
    
    const faturamento = pedidosEmp.reduce((sum, p) => sum + (p.valor_total || 0), 0);
    const opsFinalizadas = opsEmp.filter(op => op.status === 'Finalizada').length;
    const entregasNoPrazoEmp = entregasEmp.filter(e => 
      e.status === 'Entregue' && 
      e.data_entrega && 
      e.data_previsao &&
      new Date(e.data_entrega) <= new Date(e.data_previsao)
    ).length;
    const totalEntregasEmp = entregasEmp.filter(e => e.status === 'Entregue').length;
    const otdEmp = totalEntregasEmp > 0 ? (entregasNoPrazoEmp / totalEntregasEmp) * 100 : 0;

    return {
      empresa: emp.nome_fantasia || emp.razao_social,
      faturamento,
      ops_finalizadas: opsFinalizadas,
      otd: otdEmp
    };
  });

  // IA de Saúde Operacional
  const alertasIA = [];
  
  if (percentualReaproveitamento < 95) {
    alertasIA.push({
      tipo: 'refugo_alto',
      severidade: 'alto',
      mensagem: `Taxa de reaproveitamento em ${percentualReaproveitamento.toFixed(1)}% (abaixo de 95%)`,
      modulo: 'Produção',
      acao: 'Revisar processos de corte e dobra para reduzir refugo'
    });
  }

  // IA de Gargalo Interdepartamental
  const opsAguardandoMaterial = ops.filter(op => 
    op.status === 'Aguardando Matéria-Prima' || op.bloqueio_material
  ).length;

  if (opsAguardandoMaterial >= 3 && veiculosManutencao > 0) {
    alertasIA.push({
      tipo: 'gargalo_interdepartamental',
      severidade: 'critico',
      mensagem: `${opsAguardandoMaterial} OPs bloqueadas por material + ${veiculosManutencao} veículo(s) parado(s)`,
      modulo: 'Logística + Produção',
      acao: 'Priorizar manutenção de veículos ou buscar transporte alternativo'
    });
  }

  if (otd < 85) {
    alertasIA.push({
      tipo: 'otd_baixo',
      severidade: 'alto',
      mensagem: `OTD em ${otd.toFixed(1)}% (meta: >90%)`,
      modulo: 'Logística',
      acao: 'Revisar roteirização e prazos prometidos'
    });
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">📊 Dashboard Executivo</h1>
          <p className="text-slate-600">Visão estratégica e análise de tendências</p>
        </div>
        <Select value={periodoAnalise} onValueChange={setPeriodoAnalise}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alertas da IA */}
      {alertasIA.length > 0 && (
        <Alert className="border-2 border-red-300 bg-red-50">
          <Brain className="w-5 h-5 text-red-600" />
          <AlertDescription>
            <p className="font-bold text-red-900 mb-3">🧠 IA - Alertas Estratégicos</p>
            <div className="space-y-3">
              {alertasIA.map((alerta, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      alerta.severidade === 'critico' ? 'bg-red-600 animate-pulse' : 'bg-orange-600'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-red-800 font-semibold mb-1">
                        [{alerta.modulo}] {alerta.mensagem}
                      </p>
                      <p className="text-xs text-red-600">
                        💡 <strong>Ação recomendada:</strong> {alerta.acao}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-700 mb-1">Faturamento Período</p>
                <p className="text-2xl font-bold text-blue-900">
                  R$ {pedidosPeriodo.reduce((sum, p) => sum + (p.valor_total || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-purple-700 mb-1">Produção (KG)</p>
                <p className="text-2xl font-bold text-purple-900">
                  {opsPeriodo.reduce((sum, op) => sum + (op.peso_real_total_kg || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <Factory className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-700 mb-1">OTD</p>
                <p className="text-3xl font-bold text-green-900">
                  {(() => {
                    const noPrazo = entregasPeriodo.filter(e => 
                      e.status === 'Entregue' && 
                      e.data_entrega && 
                      e.data_previsao &&
                      new Date(e.data_entrega) <= new Date(e.data_previsao)
                    ).length;
                    const total = entregasPeriodo.filter(e => e.status === 'Entregue').length;
                    return total > 0 ? ((noPrazo / total) * 100).toFixed(1) : 0;
                  })()}%
                </p>
              </div>
              <Truck className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-md bg-gradient-to-br ${
          percentualReaproveitamento >= 95 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'
        }`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm mb-1 ${percentualReaproveitamento >= 95 ? 'text-green-700' : 'text-red-700'}`}>
                  Reaproveitamento
                </p>
                <p className={`text-3xl font-bold ${percentualReaproveitamento >= 95 ? 'text-green-900' : 'text-red-900'}`}>
                  {percentualReaproveitamento.toFixed(1)}%
                </p>
              </div>
              {percentualReaproveitamento >= 95 ? (
                <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 opacity-50" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Estratégicos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vendas por Origem - Ticket Médio */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Conversão por Origem - Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosConversaoOrigem}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="origem" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} />
                <Legend />
                <Bar yAxisId="left" dataKey="quantidade" fill="#3b82f6" name="Qtd Pedidos" />
                <Bar yAxisId="right" dataKey="ticket_medio" fill="#10b981" name="Ticket Médio (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contas a Receber por Faixa */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Aging - Contas a Receber</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosContasPorFaixa}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ faixa, quantidade }) => `${faixa}: ${quantidade}`}
                  outerRadius={100}
                  dataKey="quantidade"
                >
                  {dadosContasPorFaixa.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Comparativo Multi-Empresa */}
        {empresas.length > 1 && (
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Comparativo de Performance (Grupo)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dadosComparativoEmpresas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="empresa" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => value.toLocaleString('pt-BR')} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="faturamento" fill="#3b82f6" name="Faturamento (R$)" />
                  <Bar yAxisId="left" dataKey="ops_finalizadas" fill="#8b5cf6" name="OPs Finalizadas" />
                  <Line yAxisId="right" type="monotone" dataKey="otd" stroke="#10b981" name="OTD (%)" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* NF-e - Taxa de Sucesso */}
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-base">Emissão Fiscal (NF-e)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Autorizadas:</span>
                <Badge className="bg-green-600 text-lg px-3">
                  {nfesAutorizadas}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Rejeitadas:</span>
                <Badge className="bg-red-600 text-lg px-3">
                  {nfesRejeitadas}
                </Badge>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-sm text-slate-600">Taxa de Sucesso:</span>
                <Badge className={taxaSucessoNFe >= 95 ? 'bg-green-600 text-xl px-4 py-1' : 'bg-orange-600 text-xl px-4 py-1'}>
                  {taxaSucessoNFe.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}