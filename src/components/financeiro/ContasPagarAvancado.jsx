import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, CheckCircle, DollarSign } from 'lucide-react';
import { usePermissions } from '@/components/lib/usePermissions';
import { toast } from 'sonner';

export default function ContasPagarAvancado() {
  const queryClient = useQueryClient();
  const { hasGranularPermission } = usePermissions();
  const [busca, setBusca] = useState('');
  const [titulosSelecionados, setTitulosSelecionados] = useState([]);

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas_pagar'],
    queryFn: () => base44.entities.ContaPagar.list('-data_vencimento')
  });

  const pagarLoteMutation = useMutation({
    mutationFn: async (titulosIds) => {
      for (const id of titulosIds) {
        await base44.entities.ContaPagar.update(id, {
          status: 'Pago',
          status_pagamento: 'Pago',
          data_pagamento: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contas_pagar']);
      toast.success(`${titulosSelecionados.length} títulos pagos em lote`);
      setTitulosSelecionados([]);
    }
  });

  const toggleTitulo = (id) => {
    if (titulosSelecionados.includes(id)) {
      setTitulosSelecionados(titulosSelecionados.filter(tid => tid !== id));
    } else {
      setTitulosSelecionados([...titulosSelecionados, id]);
    }
  };

  const contasFiltradas = contas.filter(c =>
    !busca ||
    c.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
    c.fornecedor?.toLowerCase().includes(busca.toLowerCase()) ||
    c.favorecido_cpf_cnpj?.includes(busca)
  );

  const totais = {
    pendente: contasFiltradas.filter(c => c.status === 'Pendente').reduce((acc, c) => acc + c.valor, 0),
    pago: contasFiltradas.filter(c => c.status === 'Pago').reduce((acc, c) => acc + c.valor, 0),
    atrasado: contasFiltradas.filter(c => c.status === 'Atrasado').reduce((acc, c) => acc + c.valor, 0)
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-auto">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Contas a Pagar</h1>
            <p className="text-sm text-slate-600">
              ETAPA 7 - Pagamento • Lote • Múltiplas Formas • Aprovação
            </p>
          </div>

          {titulosSelecionados.length > 0 && hasGranularPermission('financeiro', 'pagar_lote') && (
            <Button
              onClick={() => pagarLoteMutation.mutate(titulosSelecionados)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Pagar {titulosSelecionados.length} em Lote
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Pendente</p>
              <p className="text-2xl font-bold text-yellow-700">
                R$ {totais.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Pago</p>
              <p className="text-2xl font-bold text-green-700">
                R$ {totais.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Atrasado</p>
              <p className="text-2xl font-bold text-red-700">
                R$ {totais.atrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar por fornecedor, NF, CPF/CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {contasFiltradas.map(conta => (
          <Card key={conta.id} className={
            titulosSelecionados.includes(conta.id) ? 'border-blue-500 bg-blue-50' : ''
          }>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={titulosSelecionados.includes(conta.id)}
                  onCheckedChange={() => toggleTitulo(conta.id)}
                />

                <div className="flex-1">
                  <p className="font-medium">{conta.descricao}</p>
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>{conta.fornecedor}</span>
                    <span>Venc: {conta.data_vencimento}</span>
                    {conta.categoria && <Badge variant="outline" className="text-xs">{conta.categoria}</Badge>}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold">
                    R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <Badge variant={
                    conta.status === 'Pago' ? 'success' :
                    conta.status === 'Atrasado' ? 'destructive' :
                    'default'
                  }>
                    {conta.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}