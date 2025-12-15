import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Download, BarChart3, Calendar, Filter, Printer } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function RelatorioFinanceiroAvancado() {
  const { toast } = useToast();
  const [dataInicio, setDataInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [tipoRelatorio, setTipoRelatorio] = useState("fluxo");
  const [agruparPor, setAgruparPor] = useState("dia");

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  // Filtrar por período
  const contasReceberFiltradas = contasReceber.filter(c => {
    const data = new Date(c.data_vencimento);
    return data >= new Date(dataInicio) && data <= new Date(dataFim);
  });

  const contasPagarFiltradas = contasPagar.filter(c => {
    const data = new Date(c.data_vencimento);
    return data >= new Date(dataInicio) && data <= new Date(dataFim);
  });

  // Gerar dados do fluxo de caixa
  const gerarDadosFluxo = () => {
    const dados = {};
    
    contasReceberFiltradas.forEach(c => {
      const chave = agruparPorFuncao(c.data_vencimento);
      if (!dados[chave]) dados[chave] = { periodo: chave, entradas: 0, saidas: 0, saldo: 0 };
      dados[chave].entradas += c.valor || 0;
    });

    contasPagarFiltradas.forEach(c => {
      const chave = agruparPorFuncao(c.data_vencimento);
      if (!dados[chave]) dados[chave] = { periodo: chave, entradas: 0, saidas: 0, saldo: 0 };
      dados[chave].saidas += c.valor || 0;
    });

    Object.values(dados).forEach(d => {
      d.saldo = d.entradas - d.saidas;
    });

    return Object.values(dados).sort((a, b) => a.periodo.localeCompare(b.periodo));
  };

  const agruparPorFuncao = (dataStr) => {
    const data = new Date(dataStr);
    if (agruparPor === 'dia') {
      return data.toISOString().split('T')[0];
    } else if (agruparPor === 'semana') {
      const semana = Math.ceil((data.getDate()) / 7);
      return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-S${semana}`;
    } else if (agruparPor === 'mes') {
      return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    }
    return dataStr;
  };

  // Gerar dados por empresa
  const gerarDadosPorEmpresa = () => {
    const dados = {};
    
    empresas.forEach(emp => {
      dados[emp.id] = {
        empresa: emp.nome_fantasia || emp.razao_social,
        entradas: 0,
        saidas: 0,
        saldo: 0
      };
    });

    contasReceberFiltradas.forEach(c => {
      if (dados[c.empresa_id]) {
        dados[c.empresa_id].entradas += c.valor || 0;
      }
    });

    contasPagarFiltradas.forEach(c => {
      if (dados[c.empresa_id]) {
        dados[c.empresa_id].saidas += c.valor || 0;
      }
    });

    Object.values(dados).forEach(d => {
      d.saldo = d.entradas - d.saidas;
    });

    return Object.values(dados).filter(d => d.entradas > 0 || d.saidas > 0);
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const dadosFluxo = gerarDadosFluxo();
    let csv = 'Periodo,Entradas,Saidas,Saldo\n';
    dadosFluxo.forEach(d => {
      csv += `${d.periodo},${d.entradas},${d.saidas},${d.saldo}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_financeiro_${dataInicio}_${dataFim}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "✅ Relatório exportado!" });
  };

  const dadosFluxo = gerarDadosFluxo();
  const dadosPorEmpresa = gerarDadosPorEmpresa();

  const totais = {
    entradas: contasReceberFiltradas.reduce((sum, c) => sum + (c.valor || 0), 0),
    saidas: contasPagarFiltradas.reduce((sum, c) => sum + (c.valor || 0), 0)
  };
  totais.saldo = totais.entradas - totais.saidas;

  return (
    <div className="space-y-6 w-full h-full overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Relatório Financeiro Avançado
          </h2>
          <p className="text-sm text-slate-600">Análise detalhada de entradas, saídas e fluxo de caixa</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportarCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={() => window.print()} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div>
              <Label>Tipo de Relatório</Label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fluxo">Fluxo de Caixa</SelectItem>
                  <SelectItem value="empresa">Por Empresa</SelectItem>
                  <SelectItem value="comparativo">Comparativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Agrupar Por</Label>
              <Select value={agruparPor} onValueChange={setAgruparPor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Dia</SelectItem>
                  <SelectItem value="semana">Semana</SelectItem>
                  <SelectItem value="mes">Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs do Período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Total de Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              R$ {totais.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500">{contasReceberFiltradas.length} contas a receber</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Total de Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              R$ {totais.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500">{contasPagarFiltradas.length} contas a pagar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Saldo do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totais.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {totais.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500">{totais.saldo >= 0 ? 'Positivo' : 'Negativo'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Principal */}
      {tipoRelatorio === 'fluxo' && (
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Fluxo de Caixa - Entradas vs Saídas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dadosFluxo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="entradas" name="Entradas" fill="#10b981" />
                <Bar dataKey="saidas" name="Saídas" fill="#ef4444" />
                <Bar dataKey="saldo" name="Saldo" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {tipoRelatorio === 'empresa' && (
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Performance por Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dadosPorEmpresa}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="empresa" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="entradas" name="Entradas" fill="#10b981" />
                <Bar dataKey="saidas" name="Saídas" fill="#ef4444" />
                <Bar dataKey="saldo" name="Saldo" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}