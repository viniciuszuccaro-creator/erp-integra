import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Factory,
  Package,
  Brain,
  Layers,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  Box
} from "lucide-react";
import Canvas3D from "./Canvas3D";

/**
 * V21.2 - Painel Lateral de Detalhes da OP
 * COM: Gêmeo Digital 3D, Score IA MES, Materiais Faltantes
 */
export default function ProducaoCardDetalhe({ isOpen, onClose, op, onAtualizarStatus }) {
  const [aba, setAba] = useState('geral');

  // Calcular Score IA MES
  const calcularScoreIA = () => {
    let score = 50;
    const diasRestantes = op.data_prevista_conclusao 
      ? Math.floor((new Date(op.data_prevista_conclusao) - new Date()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (diasRestantes < 0) score += 40;
    else if (diasRestantes < 3) score += 30;
    else if (diasRestantes < 7) score += 15;
    
    if (!op.bloqueio_material) score += 20;
    else score -= 30;
    
    if (op.oee_calculado?.oee_total > 80) score += 10;
    
    return Math.min(100, Math.max(0, score));
  };

  const scoreIA = calcularScoreIA();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[800px] sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-purple-600" />
            OP {op.numero_op}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Header com Score IA */}
          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-purple-700">Cliente</p>
                  <p className="font-bold text-lg">{op.cliente_nome}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-purple-700">Score IA MES</p>
                  <div className={`text-3xl font-bold ${
                    scoreIA >= 80 ? 'text-red-600' :
                    scoreIA >= 60 ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {scoreIA}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-purple-700">Progresso</span>
                  <span className="font-semibold">{op.percentual_conclusao || 0}%</span>
                </div>
                <Progress value={op.percentual_conclusao || 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Alertas Críticos */}
          {op.bloqueio_material && (
            <Alert className="border-red-300 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription>
                <p className="font-bold text-red-900 mb-2">⚠️ Material Indisponível</p>
                <div className="space-y-1 text-xs text-red-700">
                  {(op.materiais_faltantes || []).map((mat, idx) => (
                    <p key={idx}>
                      • {mat.descricao}: <strong>{mat.quantidade_faltante} {mat.unidade || 'KG'}</strong>
                      {mat.data_previsao_chegada && (
                        <span className="ml-2">
                          (Prev: {new Date(mat.data_previsao_chegada).toLocaleDateString('pt-BR')})
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {op.alerta_refugo_alto && (
            <Alert className="border-orange-300 bg-orange-50">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <AlertDescription className="text-sm text-orange-800">
                <strong>Refugo Alto Detectado:</strong> {op.perda_percentual_real?.toFixed(1)}% vs {op.perda_percentual_configurada}% esperado
              </AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={aba} onValueChange={setAba}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="3d">🎯 Gêmeo Digital</TabsTrigger>
              <TabsTrigger value="materiais">Materiais</TabsTrigger>
            </TabsList>

            {/* Aba Geral */}
            <TabsContent value="geral" className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Pedido</p>
                      <p className="font-bold">{op.numero_pedido}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Tipo</p>
                      <Badge>{op.tipo_producao}</Badge>
                    </div>
                    <div>
                      <p className="text-slate-500">Peso Total</p>
                      <p className="font-bold">{op.peso_teorico_total_kg?.toFixed(2)} kg</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Itens</p>
                      <p className="font-bold">{op.itens_total || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Início</p>
                      <p className="font-semibold text-xs">
                        {op.data_inicio_real ? new Date(op.data_inicio_real).toLocaleDateString('pt-BR') : 'Não iniciado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Conclusão Prev.</p>
                      <p className="font-semibold text-xs">
                        {op.data_prevista_conclusao ? new Date(op.data_prevista_conclusao).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* OEE */}
              {op.oee_calculado && (
                <Card className="border-blue-300 bg-blue-50">
                  <CardContent className="p-4">
                    <p className="text-xs font-bold text-blue-900 mb-3">OEE (Overall Equipment Effectiveness)</p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-blue-700">Disponibilidade</p>
                        <p className="font-bold text-lg">{op.oee_calculado.disponibilidade?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-blue-700">Performance</p>
                        <p className="font-bold text-lg">{op.oee_calculado.performance?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-blue-700">Qualidade</p>
                        <p className="font-bold text-lg">{op.oee_calculado.qualidade?.toFixed(1)}%</p>
                      </div>
                      <div className="col-span-3 pt-2 border-t border-blue-300">
                        <p className="text-blue-700">OEE Total</p>
                        <p className="font-bold text-2xl text-blue-600">{op.oee_calculado.oee_total?.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ações */}
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => onAtualizarStatus('Em Corte')}>
                  Iniciar Corte
                </Button>
                <Button size="sm" variant="outline" onClick={() => onAtualizarStatus('Pronta para Expedição')}>
                  Finalizar OP
                </Button>
              </div>
            </TabsContent>

            {/* V21.2: Aba Gêmeo Digital 3D */}
            <TabsContent value="3d" className="space-y-4">
              <Alert className="border-purple-300 bg-purple-50">
                <Layers className="w-4 h-4 text-purple-600" />
                <AlertDescription className="text-sm text-purple-800">
                  <strong>Gêmeo Digital:</strong> Visualização 3D em tempo real do status de produção
                </AlertDescription>
              </Alert>

              <Card className="border-2 border-purple-300">
                <CardContent className="p-0">
                  <Canvas3D 
                    itens={op.itens_producao || []} 
                    percentualConclusao={op.percentual_conclusao || 0}
                    tipo={op.tipo_producao}
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-green-100 rounded">
                  <CheckCircle className="w-3 h-3 text-green-600 inline mr-1" />
                  <span className="text-green-800">Concluído: {op.itens_concluidos || 0}</span>
                </div>
                <div className="p-2 bg-orange-100 rounded">
                  <Clock className="w-3 h-3 text-orange-600 inline mr-1" />
                  <span className="text-orange-800">Pendente: {(op.itens_total || 0) - (op.itens_concluidos || 0)}</span>
                </div>
              </div>
            </TabsContent>

            {/* Aba Materiais */}
            <TabsContent value="materiais" className="space-y-3">
              {(op.materiais_necessarios || []).map((mat, idx) => (
                <Card key={idx} className={`border ${mat.disponivel_estoque ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{mat.descricao}</p>
                        <p className="text-xs text-slate-600">
                          {mat.quantidade_kg?.toFixed(2)} kg necessários
                        </p>
                      </div>
                      <Badge className={mat.disponivel_estoque ? 'bg-green-600' : 'bg-red-600'}>
                        {mat.disponivel_estoque ? 'Disponível' : 'Faltando'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}