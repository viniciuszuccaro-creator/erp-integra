import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import BadgeOrigemPedido from "@/components/comercial/BadgeOrigemPedido";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  Filter,
  Eye,
  TrendingUp,
  Calendar
} from "lucide-react";
import { useWindow } from "@/components/lib/useWindow";
import PedidoFormCompleto from "@/components/comercial/PedidoFormCompleto";

/**
 * V21.6 - Relatório de Pedidos por Origem
 * Filtro, análise e exportação de pedidos agrupados por canal
 */
export default function RelatorioPedidosPorOrigem({ empresaId, windowMode = false }) {
  const { openWindow } = useWindow();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [origemFiltro, setOrigemFiltro] = useState('todos');

  // Buscar pedidos
  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos', empresaId],
    queryFn: () => {
      if (empresaId) {
        return base44.entities.Pedido.filter({ empresa_id: empresaId });
      }
      return base44.entities.Pedido.list('-created_date', 500);
    },
    initialData: [],
  });

  // Buscar clientes para referência
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
    initialData: [],
  });

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    let valido = true;

    if (dataInicio && p.data_pedido < dataInicio) valido = false;
    if (dataFim && p.data_pedido > dataFim) valido = false;
    if (origemFiltro !== 'todos' && p.origem_pedido !== origemFiltro) valido = false;

    return valido;
  });

  // Agrupar por origem
  const pedidosPorOrigem = pedidosFiltrados.reduce((acc, p) => {
    const origem = p.origem_pedido || 'Não Definido';
    if (!acc[origem]) {
      acc[origem] = {
        pedidos: [],
        total: 0,
        valorTotal: 0,
        aprovados: 0
      };
    }
    acc[origem].pedidos.push(p);
    acc[origem].total++;
    acc[origem].valorTotal += (p.valor_total || 0);
    if (p.status === 'Aprovado' || p.status === 'Faturado' || p.status === 'Entregue') {
      acc[origem].aprovados++;
    }
    return acc;
  }, {});

  const origens = Object.keys(pedidosPorOrigem);

  const handleExportar = () => {
    // Lógica de exportação para Excel/PDF
    const csvContent = [
      ['Origem', 'Total Pedidos', 'Valor Total', 'Aprovados', 'Taxa Conversão'],
      ...origens.map(origem => {
        const dados = pedidosPorOrigem[origem];
        const taxa = dados.total > 0 ? ((dados.aprovados / dados.total) * 100).toFixed(1) : 0;
        return [
          origem,
          dados.total,
          `R$ ${dados.valorTotal.toFixed(2)}`,
          dados.aprovados,
          `${taxa}%`
        ];
      })
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_por_origem_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const containerClass = windowMode 
    ? "w-full h-full flex flex-col overflow-hidden" 
    : "space-y-6";

  return (
    <div className={containerClass}>
      
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="canais">
              <List className="w-4 h-4 mr-2" />
              Lista de Canais
            </TabsTrigger>
            <TabsTrigger value="relatorio">
              <FileText className="w-4 h-4 mr-2" />
              Relatório Detalhado
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard Analytics
            </TabsTrigger>
          </TabsList>

          <Button onClick={handleExportar} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* ABA: LISTA DE CANAIS */}
        <TabsContent value="canais" className="mt-0">{/* ... keep existing code ... */}