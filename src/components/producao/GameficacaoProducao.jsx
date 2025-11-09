import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap, Target, TrendingUp, Award } from "lucide-react";

/**
 * V21.2 - Gamificação de Produção
 * Ranking de operadores, conquistas, pontos
 */
export default function GameficacaoProducao({ empresaId }) {
  const { data: apontamentos = [] } = useQuery({
    queryKey: ['apontamentos-gamificacao', empresaId],
    queryFn: async () => {
      const ops = await base44.entities.OrdemProducao.filter({
        empresa_id: empresaId,
        status: { $in: ['Finalizada', 'Em Corte', 'Em Dobra', 'Em Armação'] }
      }, '-data_emissao', 200);

      const todosApontamentos = [];
      ops.forEach(op => {
        (op.apontamentos || []).forEach(apt => {
          todosApontamentos.push({
            ...apt,
            op_id: op.id,
            numero_op: op.numero_op
          });
        });
      });

      return todosApontamentos;
    }
  });

  // Calcular ranking
  const calcularRanking = () => {
    const operadores = {};

    apontamentos.forEach(apt => {
      const operador = apt.operador || 'Desconhecido';
      
      if (!operadores[operador]) {
        operadores[operador] = {
          nome: operador,
          operador_id: apt.operador_id,
          pontos: 0,
          total_kg_produzido: 0,
          total_pecas: 0,
          total_refugo_kg: 0,
          tempo_total_min: 0,
          conquistas: []
        };
      }

      const peso = apt.peso_produzido_kg || 0;
      const refugo = apt.peso_refugado_kg || 0;
      const tempo = apt.tempo_minutos || 0;

      operadores[operador].total_kg_produzido += peso;
      operadores[operador].total_pecas += apt.quantidade_produzida || 0;
      operadores[operador].total_refugo_kg += refugo;
      operadores[operador].tempo_total_min += tempo;

      // Calcular pontos
      let pontos = 0;
      pontos += peso * 10; // 10 pontos por kg
      pontos += (apt.quantidade_produzida || 0) * 5; // 5 pontos por peça
      
      // Bônus de eficiência
      const percentualRefugo = peso > 0 ? (refugo / peso) * 100 : 0;
      if (percentualRefugo < 2) pontos += 50; // Bonus baixo refugo
      if (tempo > 0 && peso / tempo > 0.5) pontos += 30; // Bonus produtividade (kg/min)

      operadores[operador].pontos += Math.floor(pontos);
    });

    // Conquistas
    Object.values(operadores).forEach(op => {
      const conquistas = [];
      
      if (op.total_kg_produzido > 1000) conquistas.push({ titulo: '🏆 Mestre do Aço', descricao: '+1 tonelada produzida' });
      if (op.total_pecas > 500) conquistas.push({ titulo: '⚡ Produtivo', descricao: '+500 peças' });
      if ((op.total_refugo_kg / op.total_kg_produzido) * 100 < 2) conquistas.push({ titulo: '💎 Perfeição', descricao: 'Refugo < 2%' });
      if (op.tempo_total_min > 2400) conquistas.push({ titulo: '⏱️ Dedicado', descricao: '+40h trabalhadas' });
      if (op.pontos > 10000) conquistas.push({ titulo: '🌟 Lendário', descricao: '+10k pontos' });

      op.conquistas = conquistas;
    });

    return Object.values(operadores).sort((a, b) => b.pontos - a.pontos);
  };

  const ranking = calcularRanking();

  return (
    <div className="space-y-6">
      <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Gamificação - Ranking de Operadores
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {ranking.slice(0, 10).map((operador, idx) => {
            const percentualRefugo = operador.total_kg_produzido > 0
              ? (operador.total_refugo_kg / operador.total_kg_produzido) * 100
              : 0;

            const produtividade = operador.tempo_total_min > 0
              ? operador.total_kg_produzido / (operador.tempo_total_min / 60)
              : 0;

            return (
              <Card 
                key={idx} 
                className={`border-2 ${
                  idx === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-100 to-orange-100' :
                  idx === 1 ? 'border-slate-400 bg-slate-50' :
                  idx === 2 ? 'border-orange-400 bg-orange-50' :
                  'border-slate-200'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Posição */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                      idx === 0 ? 'bg-yellow-500 text-white' :
                      idx === 1 ? 'bg-slate-400 text-white' :
                      idx === 2 ? 'bg-orange-500 text-white' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-lg">{operador.nome}</p>
                        {idx === 0 && <Trophy className="w-5 h-5 text-yellow-600" />}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                        <span>🔨 {operador.total_pecas} peças</span>
                        <span>⚖️ {operador.total_kg_produzido.toFixed(0)} kg</span>
                        <span>⏱️ {Math.floor(operador.tempo_total_min / 60)}h</span>
                      </div>

                      {/* Estatísticas */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-white rounded">
                          <p className="text-slate-500">Refugo:</p>
                          <p className={`font-bold ${
                            percentualRefugo < 3 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {percentualRefugo.toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-2 bg-white rounded">
                          <p className="text-slate-500">Produtividade:</p>
                          <p className="font-bold text-blue-600">
                            {produtividade.toFixed(1)} kg/h
                          </p>
                        </div>
                      </div>

                      {/* Conquistas */}
                      {operador.conquistas.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {operador.conquistas.map((conquista, cidx) => (
                            <Badge 
                              key={cidx} 
                              className="bg-purple-600 text-xs"
                              title={conquista.descricao}
                            >
                              {conquista.titulo}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pontos */}
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Pontos</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {operador.pontos.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {ranking.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Trophy className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p>Nenhum apontamento registrado no período</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}