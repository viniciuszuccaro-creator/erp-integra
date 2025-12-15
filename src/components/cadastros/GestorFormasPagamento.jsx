import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWindow } from '@/components/lib/useWindow';
import { Plus, Edit, Trash2, CreditCard, DollarSign, Zap, CheckCircle2, XCircle, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import FormaPagamentoFormCompleto from './FormaPagamentoFormCompleto';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GestorFormasPagamento({ windowMode = false }) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();

  const { data: formasPagamento = [], isLoading } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FormaPagamento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
      toast.success('✅ Forma de pagamento excluída!');
    }
  });

  const toggleAtivaMutation = useMutation({
    mutationFn: ({ id, ativa }) => base44.entities.FormaPagamento.update(id, { ativa }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
      toast.success('✅ Status atualizado!');
    }
  });

  const formasFiltradas = formasPagamento
    .filter(f => filtroStatus === 'todas' || (filtroStatus === 'ativas' ? f.ativa : !f.ativa))
    .filter(f => 
      f.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      f.tipo?.toLowerCase().includes(busca.toLowerCase()) ||
      f.codigo?.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => (a.ordem_exibicao || 0) - (b.ordem_exibicao || 0));

  const handleNova = () => {
    openWindow(FormaPagamentoFormCompleto, {
      windowMode: true,
      onSubmit: async (data) => {
        try {
          await base44.entities.FormaPagamento.create(data);
          queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
          toast.success('✅ Forma criada!');
        } catch (error) {
          toast.error('❌ Erro: ' + error.message);
        }
      }
    }, {
      title: '🏦 Nova Forma de Pagamento',
      width: 900,
      height: 700
    });
  };

  const handleEditar = (forma) => {
    openWindow(FormaPagamentoFormCompleto, {
      formaPagamento: forma,
      windowMode: true,
      onSubmit: async (data) => {
        try {
          await base44.entities.FormaPagamento.update(forma.id, data);
          queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
          toast.success('✅ Forma atualizada!');
        } catch (error) {
          toast.error('❌ Erro: ' + error.message);
        }
      }
    }, {
      title: `✏️ Editar: ${forma.descricao}`,
      width: 900,
      height: 700
    });
  };

  return (
    <div className={`space-y-6 ${windowMode ? 'w-full h-full p-6 overflow-auto' : ''}`}>
      <Alert className="border-blue-300 bg-blue-50">
        <AlertDescription>
          <strong>🏦 Gestão Centralizada:</strong> Formas configuradas aqui aparecem em PDV, Pedidos, Contas a Receber/Pagar, Portal e E-commerce
        </AlertDescription>
      </Alert>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Formas de Pagamento</h2>
          <p className="text-sm text-slate-600">Configuração centralizada de métodos de pagamento</p>
        </div>
        <Button onClick={handleNova} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Forma
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Total</p>
                <p className="text-2xl font-bold">{formasPagamento.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Ativas</p>
                <p className="text-2xl font-bold text-green-600">{formasPagamento.filter(f => f.ativa).length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">PDV</p>
                <p className="text-2xl font-bold text-purple-600">{formasPagamento.filter(f => f.disponivel_pdv).length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">E-commerce</p>
                <p className="text-2xl font-bold text-orange-600">{formasPagamento.filter(f => f.disponivel_ecommerce).length}</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Buscar por nome, tipo ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-md"
            />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="todas">Todas</option>
              <option value="ativas">Ativas</option>
              <option value="inativas">Inativas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* TABELA */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Formas Cadastradas ({formasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12">
                  <ArrowUpDown className="w-4 h-4" />
                </TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Acréscimo</TableHead>
                <TableHead>Parcelamento</TableHead>
                <TableHead>Disponibilidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formasFiltradas.map((forma) => (
                <TableRow key={forma.id}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {forma.ordem_exibicao}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{forma.icone}</span>
                      <div>
                        <p className="font-semibold">{forma.descricao}</p>
                        <p className="text-xs text-slate-500">{forma.codigo}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{forma.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    {forma.aceita_desconto && forma.percentual_desconto_padrao > 0 ? (
                      <Badge className="bg-green-100 text-green-700">
                        -{forma.percentual_desconto_padrao}%
                      </Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {forma.aplicar_acrescimo && forma.percentual_acrescimo_padrao > 0 ? (
                      <Badge className="bg-orange-100 text-orange-700">
                        +{forma.percentual_acrescimo_padrao}%
                      </Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {forma.permite_parcelamento ? (
                      <Badge className="bg-purple-100 text-purple-700">
                        Até {forma.maximo_parcelas}x
                      </Badge>
                    ) : (
                      <span className="text-slate-400">Não</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {forma.disponivel_pdv && <Badge className="bg-blue-100 text-blue-700 text-xs">PDV</Badge>}
                      {forma.disponivel_ecommerce && <Badge className="bg-green-100 text-green-700 text-xs">Web</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleAtivaMutation.mutate({ id: forma.id, ativa: !forma.ativa })}
                      className="flex items-center gap-1"
                    >
                      {forma.ativa ? (
                        <Badge className="bg-green-600 cursor-pointer hover:bg-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Ativa
                        </Badge>
                      ) : (
                        <Badge className="bg-red-600 cursor-pointer hover:bg-red-700">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inativa
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditar(forma)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Excluir "${forma.descricao}"?`)) {
                            deleteMutation.mutate(forma.id);
                          }
                        }}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {formasFiltradas.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma forma de pagamento encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}