import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, ShoppingCart } from "lucide-react";
import { format } from "date-fns";

function getStatusColor(status) {
  const cores = {
    'Rascunho': 'bg-slate-100 text-slate-700',
    'Aprovado': 'bg-blue-100 text-blue-700',
    'Em Produção': 'bg-purple-100 text-purple-700',
    'Faturado': 'bg-cyan-100 text-cyan-700',
    'Em Trânsito': 'bg-orange-100 text-orange-700',
    'Entregue': 'bg-green-100 text-green-700',
    'Cancelado': 'bg-red-100 text-red-700',
    'Pendente': 'bg-yellow-100 text-yellow-700',
    'Aberto': 'bg-blue-100 text-blue-700',
    'Em Atendimento': 'bg-orange-100 text-orange-700',
    'Concluído': 'bg-green-100 text-green-700',
  };
  return cores[status] || 'bg-slate-100 text-slate-700';
}

function PedidoProducao({ pedido }) {
  const temRevenda = (pedido.itens_revenda?.length || 0) > 0;
  const temArmado = (pedido.itens_armado_padrao?.length || 0) > 0;
  const temCorte = (pedido.itens_corte_dobra?.length || 0) > 0;

  return (
    <div className="space-y-6">
      {temRevenda && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="bg-blue-100 border-b border-blue-200">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="w-4 h-4" />
              Itens de Revenda
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-white">
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedido.itens_revenda.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell className="text-center">{item.quantidade} {item.unidade}</TableCell>
                    <TableCell className="text-right">R$ {item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {temArmado && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="bg-purple-100 border-b border-purple-200">
            <CardTitle className="text-sm font-semibold">Armação Padrão</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {pedido.itens_armado_padrao.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded border">
                <p className="font-semibold text-sm mb-2">{item.elemento} - {item.tipo_peca}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><strong>Bitola Principal:</strong> {item.bitola_principal}</p>
                  <p><strong>Quantidade:</strong> {item.quantidade_barras_principais} barras</p>
                  <p><strong>Estribo:</strong> {item.estribo_bitola} @ {item.estribo_distancia}cm</p>
                  <p><strong>Peso Total:</strong> {item.peso_teorico_total?.toFixed(2)} kg</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {temCorte && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="bg-green-100 border-b border-green-200">
            <CardTitle className="text-sm font-semibold">Corte e Dobra</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {pedido.itens_corte_dobra.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded border">
                <p className="font-semibold text-sm mb-2">{item.elemento} - {item.descricao_automatica}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><strong>Bitola:</strong> {item.bitola}</p>
                  <p><strong>Comprimento:</strong> {item.comprimento_barra}cm</p>
                  <p><strong>Quantidade:</strong> {item.quantidade_pecas} peças</p>
                  <p><strong>Peso:</strong> {item.peso_teorico_total?.toFixed(2)} kg</p>
                </div>
                {item.desenho_url && (
                  <img src={item.desenho_url} alt="Desenho" className="mt-2 w-full max-w-xs rounded border" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function OrdersLegacySection({ pedidos = [], onVerDetalhesPedido }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle>Histórico de Pedidos</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {pedidos.map((pedido) => {
            const hasProductionDetails = (pedido.itens_revenda?.length || 0) > 0 || (pedido.itens_armado_padrao?.length || 0) > 0 || (pedido.itens_corte_dobra?.length || 0) > 0;
            return (
              <Card key={pedido.id} className="border-2 border-blue-200">
                <CardHeader className="bg-blue-50 border-b">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-lg">Pedido #{pedido.numero_pedido}</p>
                      <p className="text-sm text-slate-600">{format(new Date(pedido.data_pedido), 'dd/MM/yyyy')}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <Badge className={getStatusColor(pedido.status)}>{pedido.status}</Badge>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        R$ {pedido.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {hasProductionDetails ? (
                    <Button variant="outline" size="sm" className="mb-4" onClick={() => onVerDetalhesPedido?.(pedido.id)}>
                      Ver Detalhes da Produção →
                    </Button>
                  ) : (
                    <p className="text-sm text-slate-500 mb-4">Detalhes de produção não disponíveis.</p>
                  )}
                  {hasProductionDetails && <PedidoProducao pedido={pedido} />}
                </CardContent>
              </Card>
            );
          })}
          {pedidos.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum pedido encontrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}