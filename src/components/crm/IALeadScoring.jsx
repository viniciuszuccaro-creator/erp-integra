import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Zap, Target } from 'lucide-react';

export default function IALeadScoring({ lead }) {
  const calcularScore = () => {
    let score = 50;
    
    // Valor estimado
    if (lead.valor_estimado > 50000) score += 20;
    else if (lead.valor_estimado > 20000) score += 10;
    
    // Interações
    if (lead.interacoes?.length > 5) score += 15;
    
    // Dias sem contato
    if (lead.dias_sem_contato < 3) score += 10;
    
    // Produtos de interesse
    if (lead.produtos_interesse?.length > 3) score += 5;
    
    return Math.min(score, 100);
  };

  const score = lead.prioridade_ia || calcularScore();

  const getNivelPrioridade = () => {
    if (score >= 80) return { texto: 'Altíssima', cor: 'red', icon: Star };
    if (score >= 60) return { texto: 'Alta', cor: 'orange', icon: TrendingUp };
    if (score >= 40) return { texto: 'Média', cor: 'blue', icon: Target };
    return { texto: 'Baixa', cor: 'slate', icon: Zap };
  };

  const nivel = getNivelPrioridade();
  const Icon = nivel.icon;

  return (
    <Card className={`border-${nivel.cor}-300 bg-${nivel.cor}-50`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`w-5 h-5 text-${nivel.cor}-600`} />
          <span>Score de Priorização IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-${nivel.cor}-400 to-${nivel.cor}-600 text-white mb-3`}>
            <span className="text-3xl font-bold">{score}</span>
          </div>
          <p className={`font-semibold text-${nivel.cor}-900`}>
            Prioridade {nivel.texto}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Score Geral</span>
            <span className="font-medium">{score}/100</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {lead.motivo_priorizacao && (
          <div className="bg-white rounded p-3 text-sm">
            <p className="font-medium text-slate-700 mb-1">Análise da IA:</p>
            <p className="text-slate-600">{lead.motivo_priorizacao}</p>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Valor Estimado:</span>
            <span className="font-medium">
              R$ {(lead.valor_estimado || 0).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Probabilidade:</span>
            <Badge variant="secondary">{lead.probabilidade || 0}%</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Interações:</span>
            <span className="font-medium">{lead.interacoes?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Dias sem Contato:</span>
            <span className={`font-medium ${
              lead.dias_sem_contato > 7 ? 'text-red-600' : 'text-green-600'
            }`}>
              {lead.dias_sem_contato || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}