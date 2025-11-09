import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Brain } from "lucide-react";

/**
 * V21.5 - Análise de Variação Salarial com IA
 * Detecta anomalias e compara salários entre cargos/mercado
 */
export default function AnaliseVariacaoSalarial({ empresaId }) {
  const [cargoFiltro, setCargoFiltro] = useState("todos");

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-salario', empresaId],
    queryFn: () => base44.entities.Colaborador.filter({
      empresa_alocada_id: empresaId,
      status: 'Ativo'
    })
  });

  const { data: cargos = [] } = useQuery({
    queryKey: ['cargos'],
    queryFn: () => base44.entities.Cargo.list()
  });

  const analisarCargo = (cargo) => {
    const colaboradoresCargo = colaboradores.filter(c => c.cargo === cargo);
    
    if (colaboradoresCargo.length === 0) return null;

    const salarios = colaboradoresCargo.map(c => c.salario || 0);
    const mediaSalarial = salarios.reduce((sum, s) => sum + s, 0) / salarios.length;
    const menorSalario = Math.min(...salarios);
    const maiorSalario = Math.max(...salarios);
    const variacao = ((maiorSalario - menorSalario) / mediaSalarial * 100);

    // Buscar salário base do cargo
    const cargoCadastro = cargos.find(c => c.nome_cargo === cargo);
    const salarioBaseCargo = cargoCadastro?.salario_base || 0;

    // Detectar anomalias
    const anomalias = [];

    // Anomalia 1: Variação muito alta
    if (variacao > 50) {
      anomalias.push({
        tipo: 'Variação Alta',
        descricao: `Diferença de ${variacao.toFixed(0)}% entre menor e maior salário`,
        severidade: 'Alto'
      });
    }

    // Anomalia 2: Abaixo do mercado
    colaboradoresCargo.forEach(colab => {
      if (salarioBaseCargo > 0 && colab.salario < salarioBaseCargo * 0.8) {
        anomalias.push({
          tipo: 'Abaixo do Mercado',
          colaborador: colab.nome_completo,
          descricao: `Salário ${((colab.salario / salarioBaseCargo - 1) * 100).toFixed(0)}% abaixo da base`,
          severidade: 'Médio'
        });
      }
    });

    // Anomalia 3: Muito acima do mercado
    colaboradoresCargo.forEach(colab => {
      if (salarioBaseCargo > 0 && colab.salario > salarioBaseCargo * 1.5) {
        anomalias.push({
          tipo: 'Acima do Mercado',
          colaborador: colab.nome_completo,
          descricao: `Salário ${((colab.salario / salarioBaseCargo - 1) * 100).toFixed(0)}% acima da base`,
          severidade: 'Info'
        });
      }
    });

    return {
      cargo,
      quantidade: colaboradoresCargo.length,
      mediaSalarial,
      menorSalario,
      maiorSalario,
      variacao,
      salarioBaseCargo,
      anomalias
    };
  };

  const cargosUnicos = [...new Set(colaboradores.map(c => c.cargo))];
  const analises = cargosUnicos.map(cargo => analisarCargo(cargo)).filter(a => a !== null);

  const analisesFiltradas = cargoFiltro === "todos"
    ? analises
    : analises.filter(a => a.cargo === cargoFiltro);

  const totalAnomalias = analises.reduce((sum, a) => sum + a.anomalias.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-blue-900">IA Análise Salarial</h3>
                <p className="text-sm text-blue-700">Detecta variações e anomalias automaticamente</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-orange-600">{totalAnomalias}</p>
              <p className="text-xs text-orange-700">Anomalias Detectadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtro */}
      <div className="flex gap-3">
        <Select value={cargoFiltro} onValueChange={setCargoFiltro}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Cargos</SelectItem>
            {cargosUnicos.map(cargo => (
              <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Análises por Cargo */}
      <div className="space-y-4">
        {analisesFiltradas.map(analise => (
          <Card key={analise.cargo} className="border-2 border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{analise.cargo}</CardTitle>
                <Badge className="bg-blue-600">{analise.quantidade} pessoa(s)</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estatísticas */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-green-50 border border-green-300 rounded">
                  <p className="text-xs text-green-700">Média Salarial</p>
                  <p className="text-xl font-bold text-green-600">
                    R$ {analise.mediaSalarial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-300 rounded">
                  <p className="text-xs text-blue-700">Base Mercado</p>
                  <p className="text-xl font-bold text-blue-600">
                    R$ {analise.salarioBaseCargo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-300 rounded">
                  <p className="text-xs text-orange-700">Variação</p>
                  <p className="text-xl font-bold text-orange-600">{analise.variacao.toFixed(0)}%</p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-300 rounded">
                  <p className="text-xs text-purple-700">Range</p>
                  <p className="text-sm font-bold text-purple-600">
                    R$ {analise.menorSalario.toLocaleString('pt-BR')} - R$ {analise.maiorSalario.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Anomalias */}
              {analise.anomalias.length > 0 && (
                <Alert className="border-orange-300 bg-orange-50">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <AlertDescription>
                    <p className="font-bold text-sm text-orange-900 mb-2">
                      {analise.anomalias.length} Anomalia(s) Detectada(s):
                    </p>
                    <div className="space-y-1">
                      {analise.anomalias.map((anomalia, idx) => (
                        <div key={idx} className="text-xs text-orange-800 flex items-start gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            anomalia.severidade === 'Crítico' ? 'bg-red-200 text-red-800' :
                            anomalia.severidade === 'Alto' ? 'bg-orange-200 text-orange-800' :
                            anomalia.severidade === 'Médio' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {anomalia.severidade}
                          </span>
                          <div className="flex-1">
                            <strong>{anomalia.tipo}</strong>
                            {anomalia.colaborador && `: ${anomalia.colaborador}`}
                            <br />
                            {anomalia.descricao}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}