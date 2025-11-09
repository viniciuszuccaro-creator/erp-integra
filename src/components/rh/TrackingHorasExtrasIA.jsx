
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Clock, AlertTriangle, TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react";

/**
 * V21.5 - Tracking Inteligente de Horas Extras
 * IA detecta padrões anormais e prevê custos
 */
export default function TrackingHorasExtrasIA({ empresaId }) {
  const { data: pontos = [] } = useQuery({
    queryKey: ['pontos-extras', empresaId],
    queryFn: () => base44.entities.Ponto.filter({}, '-data', 500)
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-extras', empresaId],
    queryFn: () => base44.entities.Colaborador.filter({
      empresa_alocada_id: empresaId,
      status: 'Ativo'
    })
  });

  const analisarHorasExtras = () => {
    const hoje = new Date();
    const mes_atual = hoje.getMonth();
    const ano_atual = hoje.getFullYear();
    
    // Calculate previous month, handling year change
    const mes_passado_data = new Date(hoje);
    mes_passado_data.setMonth(mes_passado_data.getMonth() - 1);
    const mes_passado_idx = mes_passado_data.getMonth();
    const ano_passado_idx = mes_passado_data.getFullYear();

    const pontosMesAtual = pontos.filter(p => {
      const pData = new Date(p.data);
      return pData.getMonth() === mes_atual && pData.getFullYear() === ano_atual;
    });
    
    const pontosMesPassado = pontos.filter(p => {
      const pData = new Date(p.data);
      return pData.getMonth() === mes_passado_idx && pData.getFullYear() === ano_passado_idx;
    });

    const horasExtrasMesAtual = pontosMesAtual.reduce((sum, p) => sum + (p.horas_extras || 0), 0);
    const horasExtrasMesPassado = pontosMesPassado.reduce((sum, p) => sum + (p.horas_extras || 0), 0);

    const tendencia = horasExtrasMesPassado > 0
      ? ((horasExtrasMesAtual - horasExtrasMesPassado) / horasExtrasMesPassado * 100)
      : (horasExtrasMesAtual > 0 ? 100 : 0); // If previous was 0 but current is > 0, it's 100% increase

    // Análise por colaborador
    const analiseColaboradores = colaboradores.map(colab => {
      const pontosColab = pontosMesAtual.filter(p => p.colaborador_nome === colab.nome_completo);
      const horasExtras = pontosColab.reduce((sum, p) => sum + (p.horas_extras || 0), 0);
      
      // Calculate distinct days worked with overtime
      const diasComHorasExtras = new Set(pontosColab.map(p => new Date(p.data).toDateString())).size;
      const mediaHorasDia = diasComHorasExtras > 0 ? horasExtras / diasComHorasExtras : 0;

      // Custo de hora extra (50% adicional)
      const salarioHora = (colab.salario || 0) / 220; // 220h mensais padrão
      const custoHoraExtra = salarioHora * 1.5;
      const custoTotal = horasExtras * custoHoraExtra;

      // Detectar padrão anormal (ex: mais de 2h extras/dia em média)
      const padraoAnormal = mediaHorasDia > 2; 

      return {
        colaborador: colab.nome_completo,
        cargo: colab.cargo,
        horasExtras,
        mediaHorasDia,
        custoTotal,
        padraoAnormal
      };
    }).filter(a => a.horasExtras > 0)
      .sort((a, b) => b.horasExtras - a.horasExtras);

    const custoTotalExtras = analiseColaboradores.reduce((sum, a) => sum + a.custoTotal, 0);

    const colaboradoresAnormais = analiseColaboradores.filter(a => a.padraoAnormal);

    return {
      horasExtrasMesAtual,
      horasExtrasMesPassado,
      tendencia,
      analiseColaboradores,
      custoTotalExtras,
      colaboradoresAnormais
    };
  };

  const analise = analisarHorasExtras();

  return (
    <div className="space-y-6">
      {/* Header IA */}
      <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            IA - Tracking de Horas Extras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-600">Horas Extras (Mês)</p>
              <p className="text-2xl font-bold text-purple-600">
                {analise.horasExtrasMesAtual.toFixed(1)}h
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-600">Mês Anterior</p>
              <p className="text-2xl font-bold text-slate-600">
                {analise.horasExtrasMesPassado.toFixed(1)}h
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-600">Tendência</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${
                  analise.tendencia > 0 ? 'text-red-600' : (analise.tendencia < 0 ? 'text-green-600' : 'text-slate-600')
                }`}>
                  {analise.tendencia > 0 ? '+' : ''}{analise.tendencia.toFixed(0)}%
                </p>
                {analise.tendencia > 0 ? (
                  <TrendingUp className="w-5 h-5 text-red-600" />
                ) : analise.tendencia < 0 ? (
                  <TrendingDown className="w-5 h-5 text-green-600" />
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-600">Custo Estimado</p>
              <p className="text-2xl font-bold text-orange-600">
                R$ {analise.custoTotalExtras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas IA */}
      {analise.colaboradoresAnormais.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-sm">
            <p className="font-bold text-red-900 mb-2">
              ⚠️ IA detectou {analise.colaboradoresAnormais.length} padrão(ões) anormal(is):
            </p>
            <ul className="space-y-1 text-xs text-red-800">
              {analise.colaboradoresAnormais.map((a, idx) => (
                <li key={idx}>
                  <strong>{a.colaborador}</strong>: Média de {a.mediaHorasDia.toFixed(1)}h extras/dia
                  (Total: {a.horasExtras.toFixed(1)}h, Custo: R$ {a.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Ranking */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Ranking de Horas Extras (Mês Atual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analise.analiseColaboradores.map((colab, index) => (
              <div
                key={index}
                className={`p-3 border-2 rounded-lg transition-all ${
                  colab.padraoAnormal
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{colab.colaborador}</p>
                      <Badge variant="outline">{colab.cargo}</Badge>
                      {colab.padraoAnormal && (
                        <Badge className="bg-red-600 text-white">Padrão Anormal</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                      <div>
                        <p className="text-slate-500">Total Horas</p>
                        <p className="font-bold text-purple-600">{colab.horasExtras.toFixed(1)}h</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Média/Dia</p>
                        <p className={`font-bold ${
                          colab.mediaHorasDia > 2 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {colab.mediaHorasDia.toFixed(1)}h
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Custo Estimado</p>
                        <p className="font-bold text-orange-600">
                          R$ {colab.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {analise.analiseColaboradores.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-3" />
                <p>Nenhuma hora extra registrada no mês atual</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
