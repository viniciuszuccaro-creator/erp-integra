import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DollarSign, 
  Search, 
  Filter,
  Link2,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { usePermissions } from '@/components/lib/usePermissions';
import { toast } from 'sonner';

export default function ContasReceberAvancado() {
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const { hasGranularPermission } = usePermissions();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [titulosSelecionados, setTitulosSelecionados] = useState([]);

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas_receber'],
    queryFn: () => base44.entities.ContaReceber.list('-data_vencimento')
  });

  const gerarLinkPagamentoMutation = useMutation({
    mutationFn: async (contaId) => {
      const conta = contas.find(c => c.id === contaId);
      
      // Simular geração de link
      const linkPagamento = `https://pay.example.com/${Math.random().toString(36).substr(2, 9)}`;
      
      await base44.entities.ContaReceber.update(contaId, {
        forma_cobranca: 'Link de Pagamento',
        url_fatura: linkPagamento,
        status_cobranca: 'gerada'
      });

      return { linkPagamento };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['contas_receber']);
      toast.success('Link de pagamento gerado!');
      navigator.clipboard.writeText(data.linkPagamento);
      toast.info('Link copiado para área de transferência');
    }
  });

  const receberLoteMutation = useMutation({
    mutationFn: async (titulosIds) => {
      for (const id of titulosIds) {
        await base44.entities.ContaReceber.update(id, {
          status: 'Recebido',
          data_recebimento: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contas_receber']);
      toast.success(`${titulosSelecionados.length} títulos recebidos em lote`);
      setTitulosSelecionados([]);
    }
  });

  const toggleTitulo = (titulo) => {
    if (titulosSelecionados.includes(titulo.id)) {
      setTitulosSelecionados(titulosSelecionados.filter(id => id !== titulo.id));
    } else {
      setTitulosSelecionados([...titulosSelecionados, titulo.id]);
    }
  };

  const contasFiltradas = contas.filter(c => {
    const matchBusca = !busca ||
      c.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      c.cliente?.toLowerCase().includes(busca.toLowerCase()) ||
      c.numero_documento?.includes(busca);
    
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  const calcularTotais = () => {
    const pendente = contasFiltradas.filter(c => c.status === 'Pendente').reduce((acc, c) => acc + c.valor, 0);
    const recebido = contasFiltradas.filter(c => c.status === 'Recebido').reduce((acc, c) => acc + c.valor, 0);
    const atrasado = contasFiltradas.filter(c => c.status === 'Atrasado').reduce((acc, c) => acc + c.valor, 0);

    return { pendente, recebido, atrasado };
  };

  const totais = calcularTotais();

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
            <h1 className="text-2xl font-bold">Contas a Receber</h1>
            <p className="text-sm text-slate-600">
              ETAPA 7 - Recebimento • Links de Pagamento • Lote • Parcial
            </p>
          </div>

          <div className="flex gap-2">
            {titulosSelecionados.length > 0 && hasGranularPermission('financeiro', 'receber_lote') && (
              <Button
                onClick={() => receberLoteMutation.mutate(titulosSelecionados)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Receber {titulosSelecionados.length} em Lote
              </Button>
            )}
          </div>
        </div>

        {/* Totalizadores */}
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
              <p className="text-sm text-slate-600 mb-1">Recebido</p>
              <p className="text-2xl font-bold text-green-700">
                R$ {totais.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

        {/* Filtros */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar por cliente, pedido, CPF/CNPJ, NF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="todos">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Recebido">Recebido</option>
            <option value="Atrasado">Atrasado</option>
            <option value="Parcial">Parcial</option>
          </select>
        </div>
      </div>

      {/* Lista de Contas */}
      <div className="flex-1 space-y-2">
        {contasFiltradas.map(conta => (
          <Card key={conta.id} className={
            titulosSelecionados.includes(conta.id) ? 'border-blue-500 bg-blue-50' : ''
          }>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={titulosSelecionados.includes(conta.id)}
                  onCheckedChange={() => toggleTitulo(conta)}
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{conta.descricao}</p>
                    {conta.origem_tipo && (
                      <Badge variant="outline" className="text-xs">
                        {conta.origem_tipo}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>{conta.cliente}</span>
                    <span>Venc: {conta.data_vencimento}</span>
                    {conta.numero_documento && <span>Doc: {conta.numero_documento}</span>}
                  </div>

                  {conta.forma_cobranca && (
                    <Badge variant="secondary" className="text-xs mt-2">
                      {conta.forma_cobranca}
                    </Badge>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold">
                    R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <Badge variant={
                    conta.status === 'Recebido' ? 'success' :
                    conta.status === 'Atrasado' ? 'destructive' :
                    'default'
                  }>
                    {conta.status}
                  </Badge>

                  {/* Ações Rápidas */}
                  <div className="flex gap-2 mt-3">
                    {conta.status === 'Pendente' && !conta.url_fatura && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => gerarLinkPagamentoMutation.mutate(conta.id)}
                      >
                        <Link2 className="w-3 h-3 mr-1" />
                        Link
                      </Button>
                    )}

                    {conta.url_fatura && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(conta.url_fatura);
                          toast.success('Link copiado');
                        }}
                      >
                        <Link2 className="w-3 h-3 mr-1" />
                        Copiar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}