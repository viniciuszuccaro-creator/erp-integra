import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Brain
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

/**
 * V21.3 - Dashboard Financeiro
 * Visão consolidada de recebimentos, pagamentos e fluxo
 */
export default function DashboardFinanceiro({ empresaId }) {
  const { data: contasReceber = [] } = useQuery({
    queryKey: ['dashboard-receber', empresaId],
    queryFn: () => base44.entities.ContaReceber.filter({ empresa_id: empresaId })
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['dashboard-pagar', empresaId],
    queryFn: () => base44.entities.ContaPagar.filter({ empresa_id: empresaId })
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-bloqueados'],
    queryFn: async () => {
      const todos = await base44.entities.Cliente.list();
      return todos.filter(c => c.condicao_comercial?.situacao_credito === 'Bloqueado');
    }
  });

  const calcularKPIs = () => {
    const hoje = new Date();
    
    const aReceberPendente = contasReceber
      .filter(c => c.status === 'Pendente')
      .reduce((sum, c) => sum + c.valor, 0);

    const aReceberAtrasado = contasReceber
      .filter(c => c.status === 'Atrasado')
      .reduce((sum, c) => sum + c.valor, 0);

    const aPagarPendente = contasPagar
      .filter(c => c.status === 'Pendente')
      .reduce((sum, c) => sum + c.valor, 0);

    const recebidoMes = contasReceber
      .filter(c => {
        if (!c.data_recebimento) return false;
        const data = new Date(c.data_recebimento);
        return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
      })
      .reduce((sum, c) => sum + (c.valor_recebido || 0), 0);

    const clientesBloqueados = clientes.length;

    return {
      aReceberPendente,
      aReceberAtrasado,
      aPagarPendente,
      recebidoMes,
      saldoProjetado: aReceberPendente - aPagarPendente,
      clientesBloqueados
    };
  };

  const kpis = calcularKPIs();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <Clock className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-blue-700 mb-1">A Receber</p>
            <p className="text-2xl font-bold text-blue-600">
              R$ {kpis.aReceberPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="p-4">
            <AlertTriangle className="w-5 h-5 text-red-600 mb-2" />
            <p className="text-xs text-red-700 mb-1">Atrasado</p>
            <p className="text-2xl font-bold text-red-600">
              R$ {kpis.aReceberAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <TrendingDown className="w-5 h-5 text-orange-600 mb-2" />
            <p className="text-xs text-orange-700 mb-1">A Pagar</p>
            <p className="text-2xl font-bold text-orange-600">
              R$ {kpis.aPagarPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-green-700 mb-1">Recebido (Mês)</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {kpis.recebidoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${
          kpis.saldoProjetado >= 0 
            ? 'border-purple-300 bg-purple-50' 
            : 'border-red-300 bg-red-50'
        }`}>
          <CardContent className="p-4">
            <TrendingUp className={`w-5 h-5 mb-2 ${
              kpis.saldoProjetado >= 0 ? 'text-purple-600' : 'text-red-600'
            }`} />
            <p className="text-xs mb-1">Saldo Projetado</p>
            <p className={`text-2xl font-bold ${
              kpis.saldoProjetado >= 0 ? 'text-purple-600' : 'text-red-600'
            }`}>
              R$ {kpis.saldoProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        {/* V21.3: NOVO - KPI Clientes Bloqueados */}
        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <Brain className="w-5 h-5 text-amber-600 mb-2" />
            <p className="text-xs text-amber-700 mb-1">Bloqueados IA</p>
            <p className="text-3xl font-bold text-amber-600">
              {kpis.clientesBloqueados}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* V21.3: NOVO - Alerta de Clientes Bloqueados */}
      {kpis.clientesBloqueados > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-sm text-red-800">
            <strong>Atenção:</strong> {kpis.clientesBloqueados} cliente(s) bloqueado(s) por inadimplência.
            Novos pedidos serão bloqueados automaticamente.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}