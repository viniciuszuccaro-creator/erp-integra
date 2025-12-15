import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { 
  Sparkles, DollarSign, Calendar, TrendingDown, 
  CheckCircle2, AlertTriangle, Calculator, FileText 
} from "lucide-react";

export default function RenegociacaoInteligente({ conta, onClose, windowMode = false }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [etapaAtual, setEtapaAtual] = useState(1);
  
  const [dadosRenegociacao, setDadosRenegociacao] = useState({
    valor_original: conta?.valor || 0,
    desconto_percentual: 0,
    desconto_valor: 0,
    valor_novo: conta?.valor || 0,
    numero_parcelas: 1,
    valor_parcela: conta?.valor || 0,
    intervalo_dias: 30,
    primeira_parcela_data: new Date().toISOString().split('T')[0],
    juros_parcela_percentual: 0,
    motivo_renegociacao: "",
    observacoes: ""
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  // Calcular valores automaticamente
  const calcularRenegociacao = () => {
    const valorOriginal = dadosRenegociacao.valor_original;
    const descontoValor = dadosRenegociacao.desconto_percentual > 0
      ? valorOriginal * (dadosRenegociacao.desconto_percentual / 100)
      : dadosRenegociacao.desconto_valor;
    
    const valorNovo = valorOriginal - descontoValor;
    const jurosTotal = valorNovo * (dadosRenegociacao.juros_parcela_percentual / 100);
    const valorComJuros = valorNovo + jurosTotal;
    const valorParcela = valorComJuros / (dadosRenegociacao.numero_parcelas || 1);

    setDadosRenegociacao(prev => ({
      ...prev,
      desconto_valor: descontoValor,
      valor_novo: valorNovo,
      valor_parcela: valorParcela
    }));
  };

  const renegociarMutation = useMutation({
    mutationFn: async () => {
      // Cancelar título original
      await base44.entities.ContaReceber.update(conta.id, {
        status: "Cancelado",
        observacoes: `${conta.observacoes || ''}\n\nREALIZADO ACORDO DE RENEGOCIAÇÃO em ${new Date().toLocaleDateString('pt-BR')}. Desconto: ${dadosRenegociacao.desconto_percentual}%. Motivo: ${dadosRenegociacao.motivo_renegociacao}`
      });

      // Criar novos títulos parcelados
      const parcelas = [];
      for (let i = 1; i <= dadosRenegociacao.numero_parcelas; i++) {
        const dataVencimento = new Date(dadosRenegociacao.primeira_parcela_data);
        dataVencimento.setDate(dataVencimento.getDate() + (i - 1) * dadosRenegociacao.intervalo_dias);

        parcelas.push(
          await base44.entities.ContaReceber.create({
            group_id: conta.group_id,
            empresa_id: conta.empresa_id,
            cliente: conta.cliente,
            cliente_id: conta.cliente_id,
            descricao: `${conta.descricao} - Renegociação Parcela ${i}/${dadosRenegociacao.numero_parcelas}`,
            valor: dadosRenegociacao.valor_parcela,
            data_emissao: new Date().toISOString().split('T')[0],
            data_vencimento: dataVencimento.toISOString().split('T')[0],
            status: "Pendente",
            origem_tipo: "renegociacao",
            numero_parcela: `${i}/${dadosRenegociacao.numero_parcelas}`,
            observacoes: `TÍTULO RENEGOCIADO\nOrigem: ${conta.numero_documento || conta.id}\nDesconto Concedido: R$ ${dadosRenegociacao.desconto_valor.toFixed(2)} (${dadosRenegociacao.desconto_percentual}%)\nMotivo: ${dadosRenegociacao.motivo_renegociacao}\nAprovado por: ${user?.full_name || 'Sistema'}`
          })
        );
      }

      // Registrar histórico do cliente
      if (conta.cliente_id) {
        await base44.entities.HistoricoCliente.create({
          group_id: conta.group_id,
          empresa_id: conta.empresa_id,
          cliente_id: conta.cliente_id,
          cliente_nome: conta.cliente,
          modulo_origem: "Financeiro",
          referencia_id: conta.id,
          referencia_tipo: "Renegociacao",
          tipo_evento: "Acordo de Renegociação",
          titulo_evento: `Renegociação de Dívida - ${dadosRenegociacao.numero_parcelas}x`,
          descricao_detalhada: `Título original de R$ ${conta.valor.toFixed(2)} renegociado com desconto de ${dadosRenegociacao.desconto_percentual}% em ${dadosRenegociacao.numero_parcelas} parcelas de R$ ${dadosRenegociacao.valor_parcela.toFixed(2)}`,
          usuario_responsavel: user?.full_name || "Sistema",
          data_evento: new Date().toISOString(),
          valor_relacionado: dadosRenegociacao.valor_novo,
          resolvido: false
        });
      }

      return parcelas;
    },
    onSuccess: (parcelas) => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      toast({ 
        title: `✅ Renegociação concluída!`,
        description: `${parcelas.length} novas parcelas criadas`
      });
      if (onClose) onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro na renegociação",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className={windowMode ? "w-full h-full p-6 overflow-auto" : ""}>
      <Card className="border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Renegociação Inteligente
            <Badge className="bg-purple-100 text-purple-700 ml-auto">
              Etapa {etapaAtual}/3
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Informações do Título */}
          <Alert className="border-blue-300 bg-blue-50">
            <AlertDescription>
              <p className="font-semibold text-blue-900 mb-2">📄 Título Original</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">Cliente:</span>
                  <p className="font-semibold">{conta?.cliente}</p>
                </div>
                <div>
                  <span className="text-slate-600">Valor Original:</span>
                  <p className="font-semibold text-red-600">R$ {conta?.valor?.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-slate-600">Vencimento:</span>
                  <p className="font-semibold">{new Date(conta?.data_vencimento).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Etapa 1: Definir Desconto */}
          {etapaAtual === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-600" />
                1. Definir Desconto para Acordo
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Desconto (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={dadosRenegociacao.desconto_percentual}
                    onChange={(e) => {
                      setDadosRenegociacao({
                        ...dadosRenegociacao,
                        desconto_percentual: parseFloat(e.target.value) || 0
                      });
                      calcularRenegociacao();
                    }}
                    placeholder="Ex: 10"
                  />
                </div>
                <div>
                  <Label>Desconto (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={dadosRenegociacao.desconto_valor}
                    onChange={(e) => {
                      setDadosRenegociacao({
                        ...dadosRenegociacao,
                        desconto_valor: parseFloat(e.target.value) || 0,
                        desconto_percentual: 0
                      });
                      calcularRenegociacao();
                    }}
                    placeholder="Ex: 150.00"
                  />
                </div>
              </div>

              <Alert className="border-green-300 bg-green-50">
                <AlertDescription>
                  <p className="font-semibold text-green-900">💰 Novo Valor do Acordo</p>
                  <p className="text-2xl font-bold text-green-700">
                    R$ {dadosRenegociacao.valor_novo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Desconto: R$ {dadosRenegociacao.desconto_valor.toFixed(2)} ({((dadosRenegociacao.desconto_valor / dadosRenegociacao.valor_original) * 100).toFixed(1)}%)
                  </p>
                </AlertDescription>
              </Alert>

              <div>
                <Label>Motivo da Renegociação *</Label>
                <Select
                  value={dadosRenegociacao.motivo_renegociacao}
                  onValueChange={(v) => setDadosRenegociacao({ ...dadosRenegociacao, motivo_renegociacao: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dificuldade Financeira">Dificuldade Financeira</SelectItem>
                    <SelectItem value="Acordo Comercial">Acordo Comercial</SelectItem>
                    <SelectItem value="Fidelização">Fidelização de Cliente</SelectItem>
                    <SelectItem value="Atraso Prolongado">Atraso Prolongado</SelectItem>
                    <SelectItem value="Recuperação de Crédito">Recuperação de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => { calcularRenegociacao(); setEtapaAtual(2); }}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={!dadosRenegociacao.motivo_renegociacao}
              >
                Próximo: Definir Parcelamento →
              </Button>
            </div>
          )}

          {/* Etapa 2: Configurar Parcelamento */}
          {etapaAtual === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                2. Configurar Parcelamento
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número de Parcelas *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={dadosRenegociacao.numero_parcelas}
                    onChange={(e) => {
                      setDadosRenegociacao({
                        ...dadosRenegociacao,
                        numero_parcelas: parseInt(e.target.value) || 1
                      });
                      calcularRenegociacao();
                    }}
                  />
                </div>
                <div>
                  <Label>Intervalo entre Parcelas (dias)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={dadosRenegociacao.intervalo_dias}
                    onChange={(e) => setDadosRenegociacao({ ...dadosRenegociacao, intervalo_dias: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data da 1ª Parcela *</Label>
                  <Input
                    type="date"
                    value={dadosRenegociacao.primeira_parcela_data}
                    onChange={(e) => setDadosRenegociacao({ ...dadosRenegociacao, primeira_parcela_data: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Juros sobre Parcelas (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={dadosRenegociacao.juros_parcela_percentual}
                    onChange={(e) => {
                      setDadosRenegociacao({
                        ...dadosRenegociacao,
                        juros_parcela_percentual: parseFloat(e.target.value) || 0
                      });
                      calcularRenegociacao();
                    }}
                    placeholder="0"
                  />
                </div>
              </div>

              <Alert className="border-blue-300 bg-blue-50">
                <AlertDescription>
                  <p className="font-semibold text-blue-900 mb-2">📊 Simulação do Acordo</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Valor com Desconto:</span>
                      <p className="font-bold text-green-600">R$ {dadosRenegociacao.valor_novo.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Valor da Parcela:</span>
                      <p className="font-bold text-blue-600">R$ {dadosRenegociacao.valor_parcela.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    {dadosRenegociacao.numero_parcelas}x de R$ {dadosRenegociacao.valor_parcela.toFixed(2)} • Total: R$ {(dadosRenegociacao.valor_parcela * dadosRenegociacao.numero_parcelas).toFixed(2)}
                  </p>
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setEtapaAtual(1)}
                  variant="outline"
                  className="flex-1"
                >
                  ← Voltar
                </Button>
                <Button 
                  onClick={() => setEtapaAtual(3)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Próximo: Revisar Acordo →
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 3: Revisão e Confirmação */}
          {etapaAtual === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                3. Revisar e Confirmar Acordo
              </h3>

              <Alert className="border-yellow-300 bg-yellow-50">
                <AlertDescription>
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mb-2" />
                  <p className="text-sm text-yellow-900">
                    <strong>Atenção:</strong> O título original será <strong>cancelado</strong> e {dadosRenegociacao.numero_parcelas} {dadosRenegociacao.numero_parcelas > 1 ? 'novos títulos serão criados' : 'novo título será criado'}.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="bg-slate-50 p-4 rounded border space-y-3">
                <h4 className="font-semibold text-sm">Resumo do Acordo:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">Valor Original:</span>
                    <p className="font-semibold">R$ {dadosRenegociacao.valor_original.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Desconto Concedido:</span>
                    <p className="font-semibold text-green-600">
                      R$ {dadosRenegociacao.desconto_valor.toFixed(2)} ({dadosRenegociacao.desconto_percentual}%)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Novo Valor Total:</span>
                    <p className="font-semibold text-blue-600">R$ {dadosRenegociacao.valor_novo.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Parcelamento:</span>
                    <p className="font-semibold">
                      {dadosRenegociacao.numero_parcelas}x de R$ {dadosRenegociacao.valor_parcela.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Primeira Parcela:</span>
                    <p className="font-semibold">
                      {new Date(dadosRenegociacao.primeira_parcela_data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Última Parcela:</span>
                    <p className="font-semibold">
                      {(() => {
                        const ultimaData = new Date(dadosRenegociacao.primeira_parcela_data);
                        ultimaData.setDate(ultimaData.getDate() + (dadosRenegociacao.numero_parcelas - 1) * dadosRenegociacao.intervalo_dias);
                        return ultimaData.toLocaleDateString('pt-BR');
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Observações do Acordo</Label>
                <Textarea
                  value={dadosRenegociacao.observacoes}
                  onChange={(e) => setDadosRenegociacao({ ...dadosRenegociacao, observacoes: e.target.value })}
                  placeholder="Observações sobre a renegociação..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setEtapaAtual(2)}
                  variant="outline"
                  className="flex-1"
                >
                  ← Voltar
                </Button>
                <Button 
                  onClick={() => renegociarMutation.mutate()}
                  disabled={renegociarMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {renegociarMutation.isPending ? (
                    <>Processando...</>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirmar Renegociação
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}