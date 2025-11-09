import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useToast } from "@/components/ui/use-toast";

export default function FolhaPagamentoTab({ empresaId }) {
  const [mesReferencia, setMesReferencia] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar colaboradores ativos
  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-folha', empresaId],
    queryFn: () => base44.entities.Colaborador.filter({
      empresa_alocada_id: empresaId,
      status: 'Ativo'
    }),
    enabled: !!empresaId
  });

  // Buscar pontos do mês
  const { data: pontos = [] } = useQuery({
    queryKey: ['pontos-mes', mesReferencia],
    queryFn: () => {
      const [ano, mes] = mesReferencia.split('-');
      const dataInicio = `${ano}-${mes}-01`;
      const dataFim = new Date(parseInt(ano), parseInt(mes), 0).toISOString().split('T')[0];
      
      return base44.entities.Ponto.filter({
        data: { $gte: dataInicio, $lte: dataFim }
      });
    }
  });

  // Calcular folha de pagamento
  const calcularFolha = () => {
    return colaboradores.map(colab => {
      const pontosColab = pontos.filter(p => p.colaborador_id === colab.id);
      
      const horasNormais = pontosColab.reduce((sum, p) => sum + (p.horas_trabalhadas || 0), 0);
      const horasExtras = pontosColab.reduce((sum, p) => sum + (p.horas_extras || 0), 0);
      
      const salarioBase = colab.salario || 0;
      const valorHoraNormal = salarioBase / 220; // 220h padrão/mês
      const valorHoraExtra = valorHoraNormal * 1.5; // 50% adicional
      
      const totalHorasExtras = horasExtras * valorHoraExtra;
      
      // Benefícios
      const beneficios = colab.beneficios || [];
      const totalBeneficios = beneficios.reduce((sum, b) => 
        b.ativo ? sum + (b.valor || 0) : sum, 0
      );
      
      // Descontos (INSS, IRRF - simplificado)
      const inss = salarioBase * 0.11; // 11% exemplo
      const irrf = salarioBase > 2500 ? salarioBase * 0.075 : 0; // Simplificado
      const totalDescontos = inss + irrf;
      
      const totalProventos = salarioBase + totalHorasExtras + totalBeneficios;
      const salarioLiquido = totalProventos - totalDescontos;

      return {
        colaborador: colab,
        horasNormais,
        horasExtras,
        salarioBase,
        totalHorasExtras,
        totalBeneficios,
        inss,
        irrf,
        totalDescontos,
        totalProventos,
        salarioLiquido
      };
    });
  };

  const folhaCalculada = calcularFolha();

  // KPIs da Folha
  const totalColaboradores = colaboradores.length;
  const totalFolhaBruta = folhaCalculada.reduce((sum, f) => sum + f.totalProventos, 0);
  const totalFolhaLiquida = folhaCalculada.reduce((sum, f) => sum + f.salarioLiquido, 0);
  const totalHorasExtras = folhaCalculada.reduce((sum, f) => sum + f.totalHorasExtras, 0);
  const totalDescontos = folhaCalculada.reduce((sum, f) => sum + f.totalDescontos, 0);
  const mediaHorasExtras = totalColaboradores > 0 
    ? folhaCalculada.reduce((sum, f) => sum + f.horasExtras, 0) / totalColaboradores 
    : 0;

  // Dados para gráficos
  const dadosPorDepartamento = {};
  folhaCalculada.forEach(f => {
    const dept = f.colaborador.departamento || 'Sem Departamento';
    if (!dadosPorDepartamento[dept]) {
      dadosPorDepartamento[dept] = { 
        departamento: dept, 
        total: 0, 
        quantidade: 0 
      };
    }
    dadosPorDepartamento[dept].total += f.salarioLiquido;
    dadosPorDepartamento[dept].quantidade += 1;
  });

  const dadosDepartamentos = Object.values(dadosPorDepartamento);

  // Dados de proventos vs descontos
  const dadosProventosDescontos = [
    { nome: 'Salário Base', valor: folhaCalculada.reduce((sum, f) => sum + f.salarioBase, 0) },
    { nome: 'Horas Extras', valor: totalHorasExtras },
    { nome: 'Benefícios', valor: folhaCalculada.reduce((sum, f) => sum + f.totalBeneficios, 0) },
    { nome: 'Descontos', valor: -totalDescontos }
  ];

  // Distribuição por faixa salarial
  const faixasSalariais = [
    { faixa: 'Até R$ 2.000', min: 0, max: 2000, quantidade: 0 },
    { faixa: 'R$ 2.001 - R$ 4.000', min: 2001, max: 4000, quantidade: 0 },
    { faixa: 'R$ 4.001 - R$ 6.000', min: 4001, max: 6000, quantidade: 0 },
    { faixa: 'R$ 6.001 - R$ 10.000', min: 6001, max: 10000, quantidade: 0 },
    { faixa: 'Acima de R$ 10.000', min: 10001, max: Infinity, quantidade: 0 }
  ];

  folhaCalculada.forEach(f => {
    const salario = f.salarioBase;
    const faixa = faixasSalariais.find(fx => salario >= fx.min && salario <= fx.max);
    if (faixa) faixa.quantidade += 1;
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const exportarFolha = () => {
    const csv = [
      ['Colaborador', 'CPF', 'Cargo', 'Dept.', 'Salário Base', 'H. Extras', 'Benefícios', 'Proventos', 'INSS', 'IRRF', 'Descontos', 'Líquido'].join(';'),
      ...folhaCalculada.map(f => [
        f.colaborador.nome_completo,
        f.colaborador.cpf,
        f.colaborador.cargo,
        f.colaborador.departamento,
        f.salarioBase.toFixed(2),
        f.totalHorasExtras.toFixed(2),
        f.totalBeneficios.toFixed(2),
        f.totalProventos.toFixed(2),
        f.inss.toFixed(2),
        f.irrf.toFixed(2),
        f.totalDescontos.toFixed(2),
        f.salarioLiquido.toFixed(2)
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `folha_pagamento_${mesReferencia}.csv`;
    link.click();

    toast({
      title: "✅ Exportado!",
      description: `Folha de ${mesReferencia} exportada com sucesso`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm text-slate-600 block mb-1">Mês de Referência</label>
                <input
                  type="month"
                  value={mesReferencia}
                  onChange={(e) => setMesReferencia(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
            </div>
            <Button onClick={exportarFolha} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar Folha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-700 mb-1">Colaboradores</p>
                <p className="text-3xl font-bold text-blue-900">{totalColaboradores}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-700 mb-1">Folha Bruta</p>
                <p className="text-2xl font-bold text-green-900">
                  R$ {totalFolhaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-purple-700 mb-1">Folha Líquida</p>
                <p className="text-2xl font-bold text-purple-900">
                  R$ {totalFolhaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-orange-700 mb-1">Horas Extras</p>
                <p className="text-2xl font-bold text-orange-900">
                  R$ {totalHorasExtras.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Média: {mediaHorasExtras.toFixed(1)}h por pessoa
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-red-700 mb-1">Descontos</p>
                <p className="text-2xl font-bold text-red-900">
                  R$ {totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {((totalDescontos / totalFolhaBruta) * 100).toFixed(1)}% da folha
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Custo por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosDepartamentos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="departamento" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              Distribuição por Faixa Salarial
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={faixasSalariais.filter(f => f.quantidade > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ faixa, quantidade }) => `${faixa}: ${quantidade}`}
                  outerRadius={100}
                  dataKey="quantidade"
                >
                  {faixasSalariais.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Composição da Folha
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosProventosDescontos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="valor" fill="#3b82f6">
                  {dadosProventosDescontos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.nome === 'Descontos' ? '#ef4444' : COLORS[index % COLORS.length]
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            Detalhamento da Folha - {mesReferencia}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">Colaborador</th>
                  <th className="text-left p-3 text-sm font-semibold">Cargo</th>
                  <th className="text-right p-3 text-sm font-semibold">Salário Base</th>
                  <th className="text-right p-3 text-sm font-semibold">H. Extras</th>
                  <th className="text-right p-3 text-sm font-semibold">Benefícios</th>
                  <th className="text-right p-3 text-sm font-semibold">Proventos</th>
                  <th className="text-right p-3 text-sm font-semibold">Descontos</th>
                  <th className="text-right p-3 text-sm font-semibold">Líquido</th>
                </tr>
              </thead>
              <tbody>
                {folhaCalculada.map((f, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{f.colaborador.nome_completo}</p>
                        <p className="text-xs text-slate-500">{f.colaborador.cpf}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">
                        {f.colaborador.cargo}
                      </Badge>
                    </td>
                    <td className="text-right p-3 font-semibold">
                      R$ {f.salarioBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right p-3">
                      <span className={f.horasExtras > 0 ? 'text-orange-600 font-semibold' : ''}>
                        {f.horasExtras > 0 && `${f.horasExtras.toFixed(1)}h - `}
                        R$ {f.totalHorasExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="text-right p-3 text-blue-600">
                      R$ {f.totalBeneficios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right p-3 font-bold text-green-700">
                      R$ {f.totalProventos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right p-3 text-red-600">
                      R$ {f.totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right p-3 font-bold text-purple-900 text-lg">
                      R$ {f.salarioLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-blue-50 font-bold">
                <tr>
                  <td colSpan="2" className="p-3 text-blue-900">TOTAIS</td>
                  <td className="text-right p-3 text-blue-900">
                    R$ {folhaCalculada.reduce((sum, f) => sum + f.salarioBase, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right p-3 text-blue-900">
                    R$ {totalHorasExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right p-3 text-blue-900">
                    R$ {folhaCalculada.reduce((sum, f) => sum + f.totalBeneficios, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right p-3 text-blue-900">
                    R$ {totalFolhaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right p-3 text-blue-900">
                    R$ {totalDescontos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right p-3 text-blue-900 text-xl">
                    R$ {totalFolhaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        {mediaHorasExtras > 20 && (
          <Card className="border-2 border-orange-300 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-orange-900 mb-1">⚠️ Horas Extras Elevadas</p>
                  <p className="text-sm text-orange-800">
                    Média de {mediaHorasExtras.toFixed(1)} horas extras por colaborador.
                    Considere contratar reforço ou redistribuir demanda.
                  </p>
                  <p className="text-xs text-orange-700 mt-2">
                    Impacto financeiro: R$ {totalHorasExtras.toFixed(2)} adicionais na folha
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 mb-1">💡 Insights da IA</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Custo médio por colaborador: R$ {(totalFolhaLiquida / totalColaboradores).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                  <li>• Departamento mais custoso: {dadosDepartamentos.sort((a, b) => b.total - a.total)[0]?.departamento}</li>
                  <li>• Taxa de encargos: {((totalDescontos / totalFolhaBruta) * 100).toFixed(1)}%</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}