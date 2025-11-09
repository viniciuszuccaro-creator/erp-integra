
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Users, 
  ShoppingCart, 
  Package, 
  Truck,
  FileText,
  Building2,
  DollarSign, // This icon is now explicitly used
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * Pesquisa Universal (Ctrl+K)
 * Busca em todas as entidades do sistema
 */
export default function PesquisaUniversal({ open, onOpenChange }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If query is too short, clear results and stop any pending search indication
    if (query.length < 2) {
      setResultados([]);
      setBuscando(false);
      return; // Exit early
    }

    // Debounce the search for queries of sufficient length
    // Set buscando to true immediately to show loader while waiting for debounce
    setBuscando(true); 
    const handler = setTimeout(() => {
      buscar();
    }, 300); // 300ms debounce

    // Cleanup function: clear timeout if query changes before search initiates
    // This prevents outdated searches from running.
    return () => {
      clearTimeout(handler);
    };
  }, [query]); // Re-run effect when query changes

  const buscar = async () => {
    try {
      const q = query.toLowerCase();

      // Buscar em paralelo em múltiplas entidades
      const [clientes, pedidos, produtos, entregas, fornecedores, ops, faturas] = await Promise.all([
        base44.entities.Cliente.list().then(list => 
          list.filter(c => 
            c.nome?.toLowerCase().includes(q) ||
            c.razao_social?.toLowerCase().includes(q) ||
            c.cnpj?.includes(q) ||
            c.cpf?.includes(q)
          ).slice(0, 5)
        ),
        base44.entities.Pedido.list().then(list =>
          list.filter(p =>
            p.numero_pedido?.toLowerCase().includes(q) ||
            p.cliente_nome?.toLowerCase().includes(q)
          ).slice(0, 5)
        ),
        base44.entities.Produto.list().then(list =>
          list.filter(p =>
            p.descricao?.toLowerCase().includes(q) ||
            p.codigo?.toLowerCase().includes(q)
          ).slice(0, 5)
        ),
        base44.entities.Entrega.list().then(list =>
          list.filter(e =>
            e.cliente_nome?.toLowerCase().includes(q) ||
            e.qr_code?.toLowerCase().includes(q)
          ).slice(0, 3)
        ),
        base44.entities.Fornecedor.list().then(list =>
          list.filter(f =>
            f.nome?.toLowerCase().includes(q) ||
            f.cnpj?.includes(q)
          ).slice(0, 3)
        ),
        base44.entities.OrdemProducao.list().then(list =>
          list.filter(op =>
            op.numero_op?.toLowerCase().includes(q) ||
            op.cliente_nome?.toLowerCase().includes(q)
          ).slice(0, 3)
        ),
        // NEW: Search for Faturas entity
        base44.entities.Fatura.list().then(list =>
          list.filter(f =>
            f.numero_fatura?.toLowerCase().includes(q) ||
            f.cliente_nome?.toLowerCase().includes(q)
          ).slice(0, 3)
        )
      ]);

      const todosResultados = [
        ...clientes.map(c => ({
          tipo: 'Cliente',
          icone: Users,
          cor: 'blue',
          titulo: c.nome_fantasia || c.razao_social || c.nome,
          subtitulo: c.cnpj || c.cpf,
          url: createPageUrl('Cadastros') + '?tab=clientes&view=' + c.id,
          data: c
        })),
        ...pedidos.map(p => ({
          tipo: 'Pedido',
          icone: ShoppingCart,
          cor: 'purple',
          titulo: p.numero_pedido,
          subtitulo: `${p.cliente_nome} - R$ ${p.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          url: createPageUrl('Comercial') + '?tab=pedidos&edit=' + p.id,
          data: p
        })),
        ...produtos.map(p => ({
          tipo: 'Produto',
          icone: Package,
          cor: 'green',
          titulo: p.descricao,
          subtitulo: `SKU: ${p.codigo} | Estoque: ${p.estoque_atual || 0}`,
          url: createPageUrl('Estoque') + '?tab=produtos&view=' + p.id,
          data: p
        })),
        ...entregas.map(e => ({
          tipo: 'Entrega',
          icone: Truck,
          cor: 'orange',
          titulo: `Entrega - ${e.cliente_nome}`,
          subtitulo: e.status,
          url: createPageUrl('Expedicao') + '?tab=entregas&view=' + e.id,
          data: e
        })),
        ...fornecedores.map(f => ({
          tipo: 'Fornecedor',
          icone: Building2,
          cor: 'slate',
          titulo: f.nome,
          subtitulo: f.cnpj,
          url: createPageUrl('Compras') + '?tab=fornecedores&view=' + f.id,
          data: f
        })),
        ...ops.map(op => ({
          tipo: 'OP',
          icone: FileText,
          cor: 'indigo',
          titulo: op.numero_op,
          subtitulo: `${op.cliente_nome} - ${op.status}`,
          url: createPageUrl('Producao') + '?op=' + op.id,
          data: op
        })),
        // NEW: Map Faturas results
        ...faturas.map(f => ({
            tipo: 'Fatura',
            icone: DollarSign,
            cor: 'yellow', // Using a new color for Faturas
            titulo: f.numero_fatura,
            subtitulo: `${f.cliente_nome} - R$ ${f.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            url: createPageUrl('Financiero') + '?tab=faturas&view=' + f.id,
            data: f
        }))
      ];

      setResultados(todosResultados);

    } catch (error) {
      console.error('Erro ao buscar:', error);
      // Clear results or show an error state if search fails
      setResultados([]); 
    } finally {
      setBuscando(false);
    }
  };

  const handleSelect = (resultado) => {
    navigate(resultado.url);
    onOpenChange(false);
    setQuery(''); // Clear query after selection
  };

  const cores = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    slate: 'bg-slate-100 text-slate-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    yellow: 'bg-yellow-100 text-yellow-700' // NEW: Added yellow color for Faturas
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar clientes, pedidos, produtos, entregas, faturas..." // Updated placeholder
              className="pl-10 text-lg border-0 focus-visible:ring-0"
              autoFocus
            />
            {buscando && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 w-5 h-5 animate-spin" />
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {resultados.length > 0 ? (
            <div className="space-y-1">
              {resultados.map((resultado, idx) => {
                const Icon = resultado.icone;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(resultado)}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3"
                  >
                    <div className={`p-2 rounded-lg ${cores[resultado.cor]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{resultado.titulo}</p>
                        <Badge variant="outline" className="text-xs">
                          {resultado.tipo}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{resultado.subtitulo}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.length >= 2 && !buscando ? (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum resultado encontrado para "{query}"</p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Digite para buscar em todo o sistema</p>
              <p className="text-xs mt-2">Clientes • Pedidos • Produtos • Entregas • OPs • Faturas</p> {/* Updated hint text */}
            </div>
          )}
        </div>

        <div className="border-t p-3 bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>↑↓ Navegar</span>
              <span>↵ Selecionar</span>
              <span>Esc Fechar</span>
            </div>
            <span>{resultados.length} resultado(s)</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
