import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, Users, TrendingUp, Brain, AlertTriangle, CircleCheck } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.5 - Folha de Pagamento com Integração Financeira
 * Gera ContaPagar + LancamentoContabil automaticamente
 */
export default function FolhaPagamentoTab({ empresaId }) {
  const [showGerar, setShowGerar] = useState(false);
  const [mesReferencia, setMesReferencia] = useState(new Date().toISOString().substring(0, 7));
  const queryClient = useQueryClient();

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-folha', empresaId],
    queryFn: () => base44.entities.Colaborador.filter({
      empresa_alocada_id: empresaId,
      status: 'Ativo'
    })
  });

  const { data: folhasGeradas = [] } = useQuery({
    queryKey: ['folhas-geradas', empresaId],
    queryFn: async () => {
      // Buscar ContaPagar com categoria = Salários
      const contas = await base44.entities.ContaPagar.filter({
        empresa_id: empresaId,
        categoria: 'Salários'
      }, '-data_emissao', 12);
      
      return contas;
    }
  });

  const gerarFolhaMutation = useMutation({
    mutationFn: async () => {
      console.log('💰 Gerando Folha de Pagamento...');

      const folha = {
        mes_referencia: mesReferencia,
        colaboradores_processados: [],
        total_salarios: 0,
        total_inss: 0,
        total_fgts: 0,
        total_liquido: 0
      };

      const contasGeradas = [];
      const lancamentosGerados = [];

      for (const colab of colaboradores) {
        const salarioBruto = colab.salario || 0;
        
        // Cálculo simplificado (em produção usar biblioteca específica)
        const inss = salarioBruto * 0.11; // 11% (simplificado)
        const fgts = salarioBruto * 0.08; // 8%
        const salarioLiquido = salarioBruto - inss;

        folha.colaboradores_processados.push({
          colaborador_id: colab.id,
          nome: colab.nome_completo,
          cargo: colab.cargo,
          salario_bruto: salarioBruto,
          inss,
          fgts,
          salario_liquido: salarioLiquido
        });

        folha.total_salarios += salarioBruto;
        folha.total_inss += inss;
        folha.total_fgts += fgts;
        folha.total_liquido += salarioLiquido;

        // V21.5: Criar ContaPagar para o salário
        const contaSalario = await base44.entities.ContaPagar.create({
          empresa_id: empresaId,
          origem: 'empresa',
          descricao: `Salário ${colab.nome_completo} - ${mesReferencia}`,
          favorecido_cpf_cnpj: colab.cpf,
          categoria: 'Salários',
          valor: salarioLiquido,
          data_emissao: new Date().toISOString().split('T')[0],
          data_vencimento: `${mesReferencia}-05`, // Dia 5 do mês
          status: 'Pendente',
          status_pagamento: 'Pendente',
          centro_custo_id: colab.centro_custo_id,
          observacoes: `Folha ${mesReferencia}`
        });

        contasGeradas.push(contaSalario);
      }

      // V21.5: Criar ContaPagar para INSS
      const contaINSS = await base44.entities.ContaPagar.create({
        empresa_id: empresaId,
        origem: 'empresa',
        descricao: `INSS Patronal + Descontado - ${mesReferencia}`,
        categoria: 'Impostos',
        valor: folha.total_inss + (folha.total_salarios * 0.20), // INSS patronal 20%
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: `${mesReferencia}-20`, // Dia 20
        status: 'Pendente',
        observacoes: `Folha ${mesReferencia}`
      });

      contasGeradas.push(contaINSS);

      // V21.5: Criar ContaPagar para FGTS
      const contaFGTS = await base44.entities.ContaPagar.create({
        empresa_id: empresaId,
        origem: 'empresa',
        descricao: `FGTS - ${mesReferencia}`,
        categoria: 'Impostos',
        valor: folha.total_fgts,
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: `${mesReferencia}-07`, // Dia 7
        status: 'Pendente',
        observacoes: `Folha ${mesReferencia}`
      });

      contasGeradas.push(contaFGTS);

      // V21.5: Lançamento Contábil - Provisão Folha
      const lancamento = await base44.entities.LancamentoContabil.create({
        empresa_id: empresaId,
        data_lancamento: new Date().toISOString().split('T')[0],
        historico: `Provisão Folha de Pagamento - ${mesReferencia}`,
        documento: `FOLHA-${mesReferencia}`,
        tipo_documento: 'Folha de Pagamento',
        conta_debito_codigo: '3.1.01',
        conta_debito_descricao: 'Despesas com Pessoal',
        conta_credito_codigo: '2.1.02',
        conta_credito_descricao: 'Salários a Pagar',
        valor: folha.total_liquido,
        origem: 'Folha de Pagamento',
        automatico: true,
        status: 'Efetivado',
        periodo_competencia: mesReferencia
      });

      lancamentosGerados.push(lancamento);

      // V21.5: Provisão 13º e Férias (simplificado)
      const provisao13 = await base44.entities.LancamentoContabil.create({
        empresa_id: empresaId,
        data_lancamento: new Date().toISOString().split('T')[0],
        historico: `Provisão 13º Salário - ${mesReferencia}`,
        documento: `FOLHA-${mesReferencia}`,
        tipo_documento: 'Folha de Pagamento',
        conta_debito_codigo: '3.1.01',
        conta_debito_descricao: 'Despesas com Pessoal',
        conta_credito_codigo: '2.1.03',
        conta_credito_descricao: '13º Salário a Pagar',
        valor: folha.total_salarios / 12, // 1/12 por mês
        origem: 'Folha de Pagamento',
        automatico: true,
        status: 'Efetivado',
        periodo_competencia: mesReferencia
      });

      lancamentosGerados.push(provisao13);

      console.log(`✅ Folha gerada: ${contasGeradas.length} contas + ${lancamentosGerados.length} lançamentos.`);
      return { folha, contasGeradas, lancamentosGerados };
    },
    onSuccess: ({ folha, contasGeradas, lancamentosGerados }) => {
      queryClient.invalidateQueries({ queryKey: ['folhas-geradas'] });
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
      
      setShowGerar(false);
      
      toast.success(
        `✅ Folha ${mesReferencia} gerada!\n` +
        `${folha.colaboradores_processados.length} colaborador(es)\n` +
        `${contasGeradas.length} conta(s) a pagar\n` +
        `${lancamentosGerados.length} lançamento(s) contábil(is)`
      );
    }
  });

  const calcularKPIs = () => {
    const totalFolha = colaboradores.reduce((sum, c) => sum + (c.salario || 0), 0);
    const totalINSS = totalFolha * 0.31; // INSS total (11% + 20%)
    const totalFGTS = totalFolha * 0.08;
    const custoTotal = totalFolha + totalINSS + totalFGTS;

    return { totalFolha, totalINSS, totalFGTS, custoTotal };
  };

  const kpis = calcularKPIs();

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <Users className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-blue-700 mb-1">Colaboradores</p>
            <p className="text-3xl font-bold text-blue-600">{colaboradores.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <DollarSign className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-green-700 mb-1">Folha Mensal</p>
            <p className="text-xl font-bold text-green-600">
              R$ {kpis.totalFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-orange-600 mb-2" />
            <p className="text-xs text-orange-700 mb-1">Encargos</p>
            <p className="text-xl font-bold text-orange-600">
              R$ {(kpis.totalINSS + kpis.totalFGTS).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardContent className="p-4">
            <Brain className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-xs text-purple-700 mb-1">Custo Total</p>
            <p className="text-xl font-bold text-purple-600">
              R$ {kpis.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Botão Gerar Folha */}
      <Card className="border-2 border-purple-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Gerar Folha de Pagamento</h3>
              <p className="text-sm text-slate-600">
                Processa salários e cria contas a pagar + lançamentos contábeis
              </p>
            </div>
            <Button onClick={() => setShowGerar(true)} className="bg-purple-600">
              <DollarSign className="w-4 h-4 mr-2" />
              Gerar Folha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Folhas Geradas */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Folhas Geradas (Últimos 12 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {folhasGeradas.map(folha => {
              const mes = folha.observacoes?.match(/Folha (\d{4}-\d{2})/)?.[1] || 'N/A';
              
              return (
                <div
                  key={folha.id}
                  className="p-3 border-2 border-slate-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold">{folha.descricao}</p>
                      <p className="text-sm text-slate-600">
                        Vencimento: {new Date(folha.data_vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        R$ {folha.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Badge className={
                        folha.status === 'Pago' ? 'bg-green-600' :
                        folha.status === 'Pendente' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }>
                        {folha.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}

            {folhasGeradas.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <DollarSign className="w-12 h-12 mx-auto mb-3" />
                <p>Nenhuma folha gerada ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Gerar Folha */}
      <Dialog open={showGerar} onOpenChange={setShowGerar}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerar Folha de Pagamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label>Mês de Referência*</Label>
              <Input
                type="month"
                value={mesReferencia}
                onChange={(e) => setMesReferencia(e.target.value)}
              />
            </div>

            {/* Preview */}
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm">Preview da Folha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">Colaboradores</p>
                    <p className="font-bold text-lg">{colaboradores.length}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Salários</p>
                    <p className="font-bold text-lg text-green-600">
                      R$ {kpis.totalFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Encargos</p>
                    <p className="font-bold text-lg text-orange-600">
                      R$ {(kpis.totalINSS + kpis.totalFGTS).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Custo Total</p>
                    <p className="font-bold text-lg text-purple-600">
                      R$ {kpis.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerta IA */}
            <Alert className="border-purple-300 bg-purple-50">
              <Brain className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-sm text-purple-800">
                <strong>IA Automação Ativa:</strong> Ao gerar folha, o sistema irá:
                <ul className="mt-2 space-y-1 text-xs">
                  <li>✅ Criar {colaboradores.length + 2} Conta(s) a Pagar (Salários + INSS + FGTS)</li>
                  <li>✅ Criar 2 Lançamento(s) Contábil(is) (Provisão + 13º)</li>
                  <li>✅ Atualizar DRE automaticamente</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowGerar(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => gerarFolhaMutation.mutate()}
                disabled={gerarFolhaMutation.isPending}
                className="bg-purple-600"
              >
                {gerarFolhaMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <CircleCheck className="w-4 h-4 mr-2" />
                    Confirmar e Gerar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}