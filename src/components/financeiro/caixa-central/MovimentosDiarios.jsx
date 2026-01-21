import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import useContextoVisual from '@/components/lib/useContextoVisual';
import { 
  Calendar, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign,
  Printer 
} from 'lucide-react';

export default function MovimentosDiarios() {
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [abaOperador, setAbaOperador] = useState("todos");
  const { empresaAtual } = useContextoVisual();

  const { data: movimentos = [], isLoading } = useQuery({
    queryKey: ['movimentos-caixa', dataFiltro, empresaAtual?.id],
    queryFn: async () => {
      const movimentosCaixa = await base44.entities.CaixaMovimento.filter({
        data_movimento: {
          $gte: new Date(dataFiltro + 'T00:00:00').toISOString(),
          $lt: new Date(dataFiltro + 'T23:59:59').toISOString()
        },
        empresa_id: empresaAtual?.id,
        cancelado: false
      });

      return movimentosCaixa.map(m => ({
        ...m,
        tipo: m.tipo_movimento === 'Entrada' ? 'entrada' : 'saida',
        hora: new Date(m.data_movimento).toLocaleTimeString('pt-BR'),
        valor_movimento: m.valor,
        descricao: m.descricao,
        categoria: m.origem,
        forma_recebimento: m.forma_pagamento,
        forma_pagamento: m.forma_pagamento,
        numero_documento: m.pedido_id || m.conta_receber_id || m.conta_pagar_id
      })).sort((a, b) => new Date(a.data_movimento) - new Date(b.data_movimento));
    },
    enabled: !!empresaAtual?.id
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-movimentos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const operadoresUnicos = [...new Set(movimentos.map(m => m.usuario_operador_nome).filter(Boolean))];
  const movimentosFiltrados = abaOperador === "todos" 
    ? movimentos 
    : movimentos.filter(m => m.usuario_operador_nome === abaOperador);

  const totalEntradas = movimentosFiltrados.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + (m.valor_movimento || 0), 0);
  const totalSaidas = movimentosFiltrados.filter(m => m.tipo === 'saida').reduce((sum, m) => sum + (m.valor_movimento || 0), 0);
  const saldoCaixa = totalEntradas - totalSaidas;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-slate-500">
          Carregando movimentos...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com Data */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold">Movimentos do Dia</h3>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <Input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Tabela de Movimentos por Operador */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Movimentos por Operador PDV</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={abaOperador} onValueChange={setAbaOperador}>
            <TabsList className="w-full justify-start border-b rounded-none bg-slate-50">
              <TabsTrigger value="todos">
                📊 Todos ({movimentos.length})
              </TabsTrigger>
              {operadoresUnicos.map(operador => {
                const movsOperador = movimentos.filter(m => m.usuario_operador_nome === operador);
                return (
                  <TabsTrigger key={operador} value={operador}>
                    👤 {operador} ({movsOperador.length})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={abaOperador} className="mt-0">
              {/* Resumo do Operador */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border-b">
                <div>
                  <p className="text-sm text-slate-600">Entradas</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalEntradas.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {movimentosFiltrados.filter(m => m.tipo === 'entrada').length} movimentos
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Saídas</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {totalSaidas.toFixed(2)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {movimentosFiltrados.filter(m => m.tipo === 'saida').length} movimentos
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Saldo</p>
                  <p className={`text-2xl font-bold ${saldoCaixa >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    R$ {saldoCaixa.toFixed(2)}
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente / Pedido</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Forma</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentosFiltrados.map((mov) => {
                    const pedidoVinculado = pedidos.find(p => p.id === mov.pedido_id);

                    return (
                      <TableRow key={mov.id}>
                        <TableCell className="text-sm">{mov.hora}</TableCell>
                        <TableCell>
                          {mov.tipo === 'entrada' ? (
                            <Badge className="bg-green-100 text-green-700">
                              <ArrowUpCircle className="w-3 h-3 mr-1" />
                              Entrada
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">
                              <ArrowDownCircle className="w-3 h-3 mr-1" />
                              Saída
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {pedidoVinculado ? (
                            <div>
                              <p className="font-semibold">{pedidoVinculado.cliente_nome}</p>
                              <p className="text-xs text-slate-500">📋 {pedidoVinculado.numero_pedido}</p>
                            </div>
                          ) : (
                            <p>{mov.descricao || '-'}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{mov.categoria}</TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline" className="text-xs">
                            {mov.forma_recebimento || mov.forma_pagamento}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-semibold ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                          {mov.tipo === 'entrada' ? '+' : '-'} R$ {mov.valor_movimento.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {movimentosFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                        <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>Nenhum movimento registrado</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}