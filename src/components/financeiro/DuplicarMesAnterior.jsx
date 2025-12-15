import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Calendar, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DuplicarMesAnterior({ empresaId, onComplete }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mesReferencia, setMesReferencia] = useState("");
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);

  const categorias = ["Fornecedores", "Salários", "Impostos", "Aluguel", "Energia", "Água", "Telefone", "Internet", "Marketing", "Outros"];

  const { data: contasMesAnterior = [] } = useQuery({
    queryKey: ['contas-pagar-mes-anterior', empresaId, mesReferencia],
    queryFn: async () => {
      if (!mesReferencia) return [];
      
      const [ano, mes] = mesReferencia.split('-').map(Number);
      const dataInicio = new Date(ano, mes - 1, 1);
      const dataFim = new Date(ano, mes, 0);

      const contas = await base44.entities.ContaPagar.filter({ empresa_id: empresaId });
      
      return contas.filter(c => {
        const dataEmissao = new Date(c.data_emissao);
        return dataEmissao >= dataInicio && dataEmissao <= dataFim;
      });
    },
    enabled: !!mesReferencia
  });

  const duplicarMutation = useMutation({
    mutationFn: async () => {
      const contasFiltradas = contasMesAnterior.filter(c => 
        categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(c.categoria)
      );

      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      const novasContas = await Promise.all(contasFiltradas.map(async (conta) => {
        const diaVencimento = new Date(conta.data_vencimento).getDate();
        const novaDataVencimento = new Date(anoAtual, mesAtual + 1, diaVencimento);

        return await base44.entities.ContaPagar.create({
          group_id: conta.group_id,
          empresa_id: conta.empresa_id,
          descricao: conta.descricao,
          fornecedor: conta.fornecedor,
          fornecedor_id: conta.fornecedor_id,
          valor: conta.valor,
          data_emissao: new Date().toISOString().split('T')[0],
          data_vencimento: novaDataVencimento.toISOString().split('T')[0],
          status: "Pendente",
          forma_pagamento: conta.forma_pagamento,
          categoria: conta.categoria,
          centro_custo: conta.centro_custo,
          centro_custo_id: conta.centro_custo_id,
          observacoes: `Duplicado de ${mesReferencia} - Ref: ${conta.id}`
        });
      }));

      return novasContas;
    },
    onSuccess: (novasContas) => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      setDialogOpen(false);
      toast({ title: `✅ ${novasContas.length} contas duplicadas!` });
      if (onComplete) onComplete();
    }
  });

  const toggleCategoria = (cat) => {
    setCategoriasSelecionadas(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const contasFiltradas = contasMesAnterior.filter(c =>
    categoriasSelecionadas.length === 0 || categoriasSelecionadas.includes(c.categoria)
  );

  const totalDuplicar = contasFiltradas.reduce((sum, c) => sum + (c.valor || 0), 0);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} variant="outline">
        <Copy className="w-4 h-4 mr-2" />
        Duplicar Mês Anterior
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Duplicar Contas do Mês Anterior
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-blue-300 bg-blue-50">
              <AlertDescription className="text-xs text-blue-900">
                💡 Selecione o mês de referência para duplicar as contas a pagar. Você pode filtrar por categorias específicas.
              </AlertDescription>
            </Alert>

            <div>
              <Label>Mês de Referência *</Label>
              <Input
                type="month"
                value={mesReferencia}
                onChange={(e) => setMesReferencia(e.target.value)}
                required
              />
            </div>

            {mesReferencia && (
              <>
                <div>
                  <Label className="mb-2 block">Filtrar por Categorias (opcional)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {categorias.map(cat => (
                      <div key={cat} className="flex items-center gap-2">
                        <Checkbox
                          checked={categoriasSelecionadas.includes(cat)}
                          onCheckedChange={() => toggleCategoria(cat)}
                        />
                        <Label className="text-xs cursor-pointer">{cat}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="border-green-300 bg-green-50">
                  <AlertDescription>
                    <p className="font-semibold text-green-900">
                      📊 {contasFiltradas.length} contas serão duplicadas
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Total: R$ {totalDuplicar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  <p className="text-xs font-semibold mb-2 text-slate-600">Preview:</p>
                  {contasFiltradas.map(c => (
                    <div key={c.id} className="text-xs flex items-center justify-between py-1 border-b">
                      <span className="truncate flex-1">{c.descricao}</span>
                      <Badge variant="outline" className="text-xs">{c.categoria}</Badge>
                      <span className="font-semibold ml-2">R$ {c.valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => duplicarMutation.mutate()}
                disabled={duplicarMutation.isPending || !mesReferencia || contasFiltradas.length === 0}
                className="bg-green-600"
              >
                {duplicarMutation.isPending ? 'Duplicando...' : `Duplicar ${contasFiltradas.length} Contas`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}