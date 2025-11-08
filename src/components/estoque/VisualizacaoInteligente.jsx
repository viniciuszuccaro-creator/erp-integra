import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * Visualização Inteligente de Estoque
 * Mostra disponível, reservado e crítico com alertas visuais
 */
export default function VisualizacaoInteligente({ produto, pedidos = [], ops = [] }) {
  const [reservasOpen, setReservasOpen] = useState(false);

  if (!produto) return null;

  const estoqueAtual = produto.estoque_atual || 0;
  const estoqueReservado = produto.estoque_reservado || 0;
  const estoqueDisponivel = estoqueAtual - estoqueReservado;
  const estoqueMinimo = produto.estoque_minimo || 0;

  const percentualDisponivel = estoqueAtual > 0 
    ? (estoqueDisponivel / estoqueAtual) * 100 
    : 0;

  const critico = estoqueDisponivel < estoqueMinimo;

  // Buscar reservas
  const reservasPedidos = pedidos.filter(p => 
    p.itens_revenda?.some(i => i.produto_id === produto.id) &&
    ['Aprovado', 'Em Produção'].includes(p.status)
  );

  const reservasOPs = ops.filter(op =>
    op.materiais_necessarios?.some(m => m.produto_id === produto.id) &&
    op.estoque_reservado &&
    !op.estoque_baixado
  );

  const totalReservas = reservasPedidos.length + reservasOPs.length;

  return (
    <div className="space-y-3">
      <Card className={`border-2 ${critico ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {produto.foto_produto_url && (
                <img 
                  src={produto.foto_produto_url} 
                  alt={produto.descricao}
                  className="w-12 h-12 rounded object-cover border"
                />
              )}
              <div>
                <p className="font-semibold text-slate-900">{produto.descricao}</p>
                <p className="text-xs text-slate-600">Código: {produto.codigo || '-'}</p>
              </div>
            </div>
            {critico && (
              <Badge className="bg-red-600 animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Crítico
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <p className="text-xs text-slate-500">Estoque Atual</p>
              <p className="text-lg font-bold text-slate-900">{estoqueAtual}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Reservado</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-orange-600">{estoqueReservado}</p>
                {totalReservas > 0 && (
                  <button
                    onClick={() => setReservasOpen(true)}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    Ver
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Disponível</p>
              <p className={`text-lg font-bold ${
                estoqueDisponivel < estoqueMinimo ? 'text-red-600' :
                estoqueDisponivel < (estoqueMinimo * 1.5) ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {estoqueDisponivel}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Nível de Estoque</span>
              <span className="text-slate-500">Mínimo: {estoqueMinimo}</span>
            </div>
            <Progress 
              value={percentualDisponivel} 
              className={`h-2 ${critico ? 'bg-red-200' : 'bg-slate-200'}`}
            />
          </div>

          {critico && (
            <div className="mt-3 p-3 border border-red-300 bg-red-100 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-xs text-red-800">
                Estoque abaixo do mínimo! Solicitar reposição urgente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Reservas */}
      <Dialog open={reservasOpen} onOpenChange={setReservasOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Reservas de Estoque - {produto.descricao}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {reservasPedidos.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-sm">Pedidos ({reservasPedidos.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Qtd Reservada</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservasPedidos.map(p => {
                      const item = p.itens_revenda?.find(i => i.produto_id === produto.id);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.numero_pedido}</TableCell>
                          <TableCell>{p.cliente_nome}</TableCell>
                          <TableCell>{item?.quantidade || 0}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{p.status}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {reservasOPs.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-sm">Ordens de Produção ({reservasOPs.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OP</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Qtd Reservada</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservasOPs.map(op => {
                      const material = op.materiais_necessarios?.find(m => m.produto_id === produto.id);
                      return (
                        <TableRow key={op.id}>
                          <TableCell className="font-medium">{op.numero_op}</TableCell>
                          <TableCell>{op.cliente_nome}</TableCell>
                          <TableCell>{material?.quantidade_kg || 0} kg</TableCell>
                          <TableCell>
                            <Badge variant="outline">{op.status}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {totalReservas === 0 && (
              <p className="text-center text-slate-500 py-8">Nenhuma reserva ativa</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}