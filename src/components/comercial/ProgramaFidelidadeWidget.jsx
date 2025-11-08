import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, DollarSign, TrendingUp, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ProgramaFidelidadeWidget({ 
  cliente, 
  valorPedidoAtual = 0,
  onUsarCashback 
}) {
  const pontosFidelidade = cliente?.pontos_fidelidade || 0;
  const cashbackDisponivel = cliente?.cashback_disponivel || 0;
  
  // Configurações do programa (devem vir da ConfiguracaoSistema)
  const percentualCashback = 1; // 1% do valor
  const pontosAcumulados = Math.floor(valorPedidoAtual * 1); // 1 ponto por R$
  const cashbackAcumular = (valorPedidoAtual * percentualCashback) / 100;

  // Níveis de fidelidade
  const nivelAtual = pontosFidelidade < 1000 ? 'Bronze' :
                    pontosFidelidade < 5000 ? 'Prata' :
                    pontosFidelidade < 10000 ? 'Ouro' :
                    'Diamante';

  const proximoNivel = nivelAtual === 'Bronze' ? 'Prata' :
                      nivelAtual === 'Prata' ? 'Ouro' :
                      nivelAtual === 'Ouro' ? 'Diamante' :
                      'Máximo';

  const pontosProximoNivel = nivelAtual === 'Bronze' ? 1000 :
                            nivelAtual === 'Prata' ? 5000 :
                            nivelAtual === 'Ouro' ? 10000 :
                            10000;

  const progressoProximoNivel = (pontosFidelidade / pontosProximoNivel) * 100;

  const corNivel = {
    'Bronze': 'bg-orange-600',
    'Prata': 'bg-slate-400',
    'Ouro': 'bg-yellow-500',
    'Diamante': 'bg-blue-500'
  };

  const beneficiosNivel = {
    'Bronze': ['Cashback de 1%', 'Descontos exclusivos'],
    'Prata': ['Cashback de 1.5%', 'Descontos de até 10%', 'Frete grátis'],
    'Ouro': ['Cashback de 2%', 'Descontos de até 15%', 'Frete grátis', 'Atendimento prioritário'],
    'Diamante': ['Cashback de 3%', 'Descontos de até 20%', 'Frete grátis', 'Atendimento VIP', 'Gerente de contas']
  };

  if (!cliente) return null;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Programa de Fidelidade
          </span>
          <Badge className={`${corNivel[nivelAtual]} text-white`}>
            <Star className="w-3 h-3 mr-1" />
            {nivelAtual}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pontos e Cashback */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white border-purple-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <p className="text-xs text-slate-600">Pontos</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {pontosFidelidade.toLocaleString()}
              </p>
              {pontosAcumulados > 0 && (
                <Badge className="bg-purple-100 text-purple-700 text-xs mt-1">
                  +{pontosAcumulados} neste pedido
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <p className="text-xs text-slate-600">Cashback</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                R$ {cashbackDisponivel.toFixed(2)}
              </p>
              {cashbackAcumular > 0 && (
                <Badge className="bg-green-100 text-green-700 text-xs mt-1">
                  +R$ {cashbackAcumular.toFixed(2)}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usar Cashback */}
        {cashbackDisponivel > 0 && (
          <Card className="bg-green-50 border-green-300">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-800 mb-1">
                    💰 Você tem cashback disponível!
                  </p>
                  <p className="text-xs text-green-700">
                    Use R$ {cashbackDisponivel.toFixed(2)} neste pedido
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onUsarCashback && onUsarCashback(cashbackDisponivel)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Usar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progresso Próximo Nível */}
        {nivelAtual !== 'Diamante' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-600">
                Progresso para <strong>{proximoNivel}</strong>
              </span>
              <span className="text-xs font-semibold">
                {pontosFidelidade.toLocaleString()} / {pontosProximoNivel.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={Math.min(progressoProximoNivel, 100)} 
              className="h-3 bg-purple-200"
            />
            <p className="text-xs text-slate-600 mt-1">
              Faltam {(pontosProximoNivel - pontosFidelidade).toLocaleString()} pontos
            </p>
          </div>
        )}

        {/* Benefícios do Nível Atual */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Gift className="w-4 h-4 mr-2" />
              Ver Benefícios
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                Programa de Fidelidade - Nível {nivelAtual}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Benefícios Atuais */}
              <Card className={`${corNivel[nivelAtual]} text-white`}>
                <CardContent className="p-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Seus Benefícios Atuais
                  </h4>
                  <ul className="space-y-2">
                    {beneficiosNivel[nivelAtual].map((beneficio, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {beneficio}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Próximo Nível */}
              {nivelAtual !== 'Diamante' && (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardContent className="p-4">
                    <h4 className="font-bold mb-2 text-purple-800">
                      Próximo: {proximoNivel}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      Acumule mais {(pontosProximoNivel - pontosFidelidade).toLocaleString()} pontos
                    </p>
                    <ul className="space-y-2">
                      {beneficiosNivel[proximoNivel]?.map((beneficio, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {beneficio}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Tabela de Níveis */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-bold mb-3">Todos os Níveis</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <span className="font-semibold text-orange-700">🥉 Bronze</span>
                      <span className="text-sm">0 - 999 pontos</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-100 rounded">
                      <span className="font-semibold text-slate-700">🥈 Prata</span>
                      <span className="text-sm">1.000 - 4.999 pontos</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="font-semibold text-yellow-700">🥇 Ouro</span>
                      <span className="text-sm">5.000 - 9.999 pontos</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="font-semibold text-blue-700">💎 Diamante</span>
                      <span className="text-sm">10.000+ pontos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}