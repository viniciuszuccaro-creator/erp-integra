import React, { useState, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { ImprimirBoleto } from "@/components/lib/ImprimirBoleto";
import ContaPagarForm from "./ContaPagarForm";
import { useWindow } from "@/components/lib/useWindow";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";
import { useUser } from "@/components/lib/UserContext";
import HeaderPagarCompacto from "./contas-pagar/HeaderPagarCompacto";
import KPIsPagar from "./contas-pagar/KPIsPagar";
import FiltrosPagar from "./contas-pagar/FiltrosPagar";
import TabelaPagar from "./contas-pagar/TabelaPagar";

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[600px]">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      <p className="text-slate-600 text-sm">Carregando...</p>
    </div>
  </div>
);

function ContasPagarTabContent({ contas: contasProp, windowMode = false }) {
  const contas = contasProp || [];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const { formasPagamento } = useFormasPagamento();
  const { user: authUser } = useUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dialogBaixaOpen, setDialogBaixaOpen] = useState(false);
  const [contasSelecionadas, setContasSelecionadas] = useState([]);
  const [contaAtual, setContaAtual] = useState(null);
  const [dadosBaixa, setDadosBaixa] = useState({
    data_pagamento: new Date().toISOString().split('T')[0],
    valor_pago: 0,
    forma_pagamento: "PIX",
    juros: 0,
    multa: 0,
    desconto: 0,
    observacoes: ""
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
    initialData: [],
    enabled: true
  });

  const enviarParaCaixaMutation = useMutation({
    mutationFn: async (titulos) => {
      const ordens = await Promise.all(titulos.map(async (titulo) => {
        return await base44.entities.CaixaOrdemLiquidacao.create({
          empresa_id: titulo.empresa_id,
          tipo_operacao: 'Pagamento',
          origem: 'Contas a Pagar',
          valor_total: titulo.valor,
          forma_pagamento_pretendida: 'Transferência',
          status: 'Pendente',
          titulos_vinculados: [{
            titulo_id: titulo.id,
            tipo_titulo: 'ContaPagar',
            numero_titulo: titulo.numero_documento || titulo.descricao,
            cliente_fornecedor_nome: titulo.fornecedor,
            valor_titulo: titulo.valor
          }],
          data_ordem: new Date().toISOString()
        });
      }));
      return ordens;
    },
    onSuccess: (ordens) => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      toast({ title: `✅ ${ordens.length} título(s) enviado(s) para o Caixa!` });
      setContasSelecionadas([]);
    }
  });

  const baixarTituloMutation = useMutation({
    mutationFn: async ({ id, dados }) => {
      const conta = contas.find(c => c.id === id);
      const valorTotal = (conta?.valor || 0) + (dados.juros || 0) + (dados.multa || 0) - (dados.desconto || 0);
      
      await base44.entities.CaixaMovimento.create({
        empresa_id: conta.empresa_id,
        group_id: conta.group_id,
        tipo_movimento: 'Saída',
        categoria: 'Pagamento Fornecedor',
        subcategoria: conta.categoria,
        descricao: `Pagamento: ${conta.descricao}`,
        valor: valorTotal,
        forma_pagamento: dados.forma_pagamento,
        data_movimento: dados.data_pagamento,
        conta_pagar_id: id,
        favorecido: conta.fornecedor,
        documento_numero: conta.numero_documento,
        centro_custo_id: conta.centro_custo_id,
        observacoes: dados.observacoes,
        usuario_responsavel: authUser?.full_name || authUser?.email,
        usuario_responsavel_id: authUser?.id
      });

      return await base44.entities.ContaPagar.update(id, {
        status: "Pago",
        data_pagamento: dados.data_pagamento,
        valor_pago: valorTotal,
        forma_pagamento: dados.forma_pagamento,
        juros: dados.juros,
        multa: dados.multa,
        desconto: dados.desconto,
        observacoes: dados.observacoes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      queryClient.invalidateQueries({ queryKey: ['caixa-movimentos'] });
      setDialogBaixaOpen(false);
      setContaAtual(null);
      toast({ title: "✅ Título pago!" });
    }
  });

  const baixarMultiplaMutation = useMutation({
    mutationFn: async (dados) => {
      await Promise.all(contasSelecionadas.map(async (contaId) => {
        const conta = contas.find(c => c.id === contaId);
        if (conta) {
          await baixarTituloMutation.mutateAsync({ id: contaId, dados });
        }
      }));
    },
    onSuccess: () => {
      setContasSelecionadas([]);
      setDialogBaixaOpen(false);
      toast({ title: `✅ ${contasSelecionadas.length} título(s) pago(s)!` });
    }
  });

  const aprovarPagamentoMutation = useMutation({
    mutationFn: async (contaId) => {
      return await base44.entities.ContaPagar.update(contaId, {
        status_pagamento: "Aprovado",
        aprovado_por: authUser?.full_name || authUser?.email,
        aprovado_por_id: authUser?.id,
        data_aprovacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      toast({ title: "✅ Pagamento aprovado!" });
    }
  });

  const contasFiltradas = contas
    .filter(c => statusFilter === "todos" || c.status === statusFilter)
    .filter(c => {
      const searchLower = searchTerm.toLowerCase();
      return c.fornecedor?.toLowerCase().includes(searchLower) ||
        c.descricao?.toLowerCase().includes(searchLower) ||
        c.numero_documento?.toLowerCase().includes(searchLower) ||
        c.favorecido_cpf_cnpj?.includes(searchLower) ||
        c.categoria?.toLowerCase().includes(searchLower) ||
        c.status?.toLowerCase().includes(searchLower) ||
        c.origem_tipo?.toLowerCase().includes(searchLower) ||
        c.canal_origem?.toLowerCase().includes(searchLower) ||
        c.centro_custo?.toLowerCase().includes(searchLower) ||
        c.projeto_obra?.toLowerCase().includes(searchLower) ||
        c.observacoes?.toLowerCase().includes(searchLower);
    });

  const totalSelecionado = contas
    .filter(c => contasSelecionadas.includes(c.id))
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const totais = {
    total: contasFiltradas.reduce((sum, c) => sum + (c.valor || 0), 0),
    pendente: contasFiltradas.filter(c => c.status === 'Pendente').reduce((sum, c) => sum + (c.valor || 0), 0),
    pago: contasFiltradas.filter(c => c.status === 'Pago').reduce((sum, c) => sum + (c.valor || 0), 0),
    vencido: contasFiltradas.filter(c => c.status === 'Atrasado').reduce((sum, c) => sum + (c.valor || 0), 0)
  };

  const toggleSelecao = (contaId) => {
    setContasSelecionadas(prev =>
      prev.includes(contaId) ? prev.filter(id => id !== contaId) : [...prev, contaId]
    );
  };

  const handleBaixar = (conta) => {
    setContaAtual(conta);
    setDadosBaixa({
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: conta.valor,
      forma_pagamento: "PIX",
      juros: 0,
      multa: 0,
      desconto: 0,
      observacoes: ""
    });
    setDialogBaixaOpen(true);
  };

  const handleBaixarMultipla = () => {
    if (contasSelecionadas.length === 0) {
      toast({ title: "⚠️ Selecione pelo menos um título", variant: "destructive" });
      return;
    }
    setContaAtual(null);
    setDadosBaixa({
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: 0,
      forma_pagamento: "PIX",
      juros: 0,
      multa: 0,
      desconto: 0,
      observacoes: ""
    });
    setDialogBaixaOpen(true);
  };

  const handleSubmitBaixa = (e) => {
    e.preventDefault();
    if (contaAtual) {
      baixarTituloMutation.mutate({ id: contaAtual.id, dados: dadosBaixa });
    } else {
      baixarMultiplaMutation.mutate(dadosBaixa);
    }
  };

  const content = (
    <div className="space-y-1.5">
      <HeaderPagarCompacto />
      <KPIsPagar totais={totais} />
      <FiltrosPagar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        contasSelecionadas={contasSelecionadas}
        totalSelecionado={totalSelecionado}
        onExportar={() => {
          const itens = contasSelecionadas.length > 0
            ? contas.filter(c => contasSelecionadas.includes(c.id))
            : contasFiltradas;
          const headers = ['fornecedor','descricao','empresa_id','data_vencimento','valor','status'];
          const csv = [headers.join(','), ...itens.map(c => headers.map(h => JSON.stringify(c[h] ?? '')).join(','))].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `contas_pagar_${new Date().toISOString().slice(0,10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        onBaixarMultipla={handleBaixarMultipla}
        onNovaConta={() => openWindow(ContaPagarForm, {
          windowMode: true,
          onSubmit: async (data) => {
            const created = await base44.entities.ContaPagar.create({
              ...data,
              criado_por: authUser?.full_name || authUser?.email,
              criado_por_id: authUser?.id
            });
            queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
            toast({ title: "✅ Conta criada!" });
          }
        }, { title: '💸 Nova Conta a Pagar', width: 900, height: 600 })}
        onEnviarCaixa={() => {
          const titulos = contas.filter(c => contasSelecionadas.includes(c.id));
          enviarParaCaixaMutation.mutate(titulos);
        }}
        empresaId={empresas[0]?.id}
        baixarPending={baixarMultiplaMutation.isPending}
        enviarPending={enviarParaCaixaMutation.isPending}
      />
      
      <TabelaPagar
        contas={contasFiltradas}
        empresas={empresas}
        contasSelecionadas={contasSelecionadas}
        toggleSelecao={toggleSelecao}
        onPrint={(conta, empresa) => ImprimirBoleto({ conta, empresa, tipo: 'pagar' })}
        onEdit={(conta) => openWindow(ContaPagarForm, {
          conta,
          windowMode: true,
          onSubmit: async (data) => {
            await base44.entities.ContaPagar.update(conta.id, data);
            queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
            toast({ title: "✅ Conta atualizada!" });
          }
        }, { title: `✏️ Editar: ${conta.fornecedor}`, width: 900, height: 600 })}
        onAprovar={(contaId) => aprovarPagamentoMutation.mutate(contaId)}
        onBaixar={handleBaixar}
        aprovarPending={aprovarPagamentoMutation.isPending}
      />

      <Dialog open={dialogBaixaOpen} onOpenChange={setDialogBaixaOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {contaAtual ? 'Registrar Pagamento' : `Pagar Múltiplos Títulos (${contasSelecionadas.length})`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBaixa} className="space-y-4">
            {!contaAtual && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription>
                  <p className="font-semibold text-blue-900">Pagando {contasSelecionadas.length} título(s)</p>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {contaAtual && (
                <div>
                  <Label>Fornecedor</Label>
                  <Input value={contaAtual?.fornecedor || ''} disabled />
                </div>
              )}
              <div className={contaAtual ? '' : 'col-span-2'}>
                <Label>Data Pagamento *</Label>
                <Input
                  type="date"
                  value={dadosBaixa.data_pagamento}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, data_pagamento: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Forma de Pagamento *</Label>
              <Select value={dadosBaixa.forma_pagamento} onValueChange={(v) => setDadosBaixa({ ...dadosBaixa, forma_pagamento: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {formasPagamento.map(forma => (
                    <SelectItem key={forma.id} value={forma.descricao}>
                      {forma.icone && `${forma.icone} `}{forma.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div><Label>Juros (R$)</Label><Input type="number" step="0.01" value={dadosBaixa.juros} onChange={(e) => setDadosBaixa({ ...dadosBaixa, juros: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Multa (R$)</Label><Input type="number" step="0.01" value={dadosBaixa.multa} onChange={(e) => setDadosBaixa({ ...dadosBaixa, multa: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Desconto (R$)</Label><Input type="number" step="0.01" value={dadosBaixa.desconto} onChange={(e) => setDadosBaixa({ ...dadosBaixa, desconto: parseFloat(e.target.value) || 0 })} /></div>
            </div>

            {contaAtual && (
              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Valor Total:</span>
                  <span className="text-xl font-bold text-red-700">
                    R$ {((contaAtual?.valor || 0) + (dadosBaixa.juros || 0) + (dadosBaixa.multa || 0) - (dadosBaixa.desconto || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogBaixaOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={baixarTituloMutation.isPending || baixarMultiplaMutation.isPending} className="bg-green-600">
                {(baixarTituloMutation.isPending || baixarMultiplaMutation.isPending) ? 'Registrando...' : 'Confirmar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-red-50 overflow-auto p-1.5">{content}</div>;
  }

  return content;
}

export default function ContasPagarTab(props) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ContasPagarTabContent {...props} />
    </Suspense>
  );
}