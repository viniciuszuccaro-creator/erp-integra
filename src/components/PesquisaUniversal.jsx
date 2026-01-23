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
  DollarSign,
  Loader2,
  Sparkles,
  Target,
  UserCircle,
  TrendingUp,
  Calendar,
  Briefcase,
  Factory
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * Pesquisa Universal (Ctrl+K)
 * Busca em todas as entidades do sistema
 * V21.7: Integrada com sistema multiempresa
 */
export default function PesquisaUniversal({ open, onOpenChange }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const navigate = useNavigate();
  const { filtrarPorContexto, estaNoGrupo, empresaAtual } = useContextoVisual();

  useEffect(() => {
    if (query.length >= 2) {
      buscar();
    } else {
      setResultados([]);
    }
  }, [query]);

  const buscar = async () => {
    setBuscando(true);

    try {
      const q = query.toLowerCase();

      // Buscar em paralelo em TODAS as entidades do sistema
      const [
        clientesRaw, pedidosRaw, produtosRaw, entregasRaw, fornecedoresRaw, opsRaw,
        colaboradoresRaw, contasPagarRaw, contasReceberRaw, oportunidadesRaw,
        transportadorasRaw, notasFiscaisRaw, ordensCompraRaw, interacoesRaw
      ] = await Promise.all([
        base44.entities.Cliente.list('-created_date', 9999),
        base44.entities.Pedido.list('-created_date', 9999),
        base44.entities.Produto.list('-created_date', 9999),
        base44.entities.Entrega.list('-created_date', 9999),
        base44.entities.Fornecedor.list('-created_date', 9999),
        base44.entities.OrdemProducao.list('-created_date', 9999),
        base44.entities.Colaborador.list('-created_date', 9999),
        base44.entities.ContaPagar.list('-created_date', 9999),
        base44.entities.ContaReceber.list('-created_date', 9999),
        base44.entities.Oportunidade.list('-created_date', 9999),
        base44.entities.Transportadora.list('-created_date', 9999),
        base44.entities.NotaFiscal.list('-created_date', 9999),
        base44.entities.OrdemCompra.list('-created_date', 9999),
        base44.entities.Interacao.list('-created_date', 9999)
      ]);

      // Filtrar por contexto empresa/grupo
      const clientesFiltrados = filtrarPorContexto(clientesRaw, 'empresa_id');
      const pedidosFiltrados = filtrarPorContexto(pedidosRaw, 'empresa_id');
      const produtosFiltrados = filtrarPorContexto(produtosRaw, 'empresa_id');
      const entregasFiltradas = filtrarPorContexto(entregasRaw, 'empresa_id');
      const fornecedoresFiltrados = filtrarPorContexto(fornecedoresRaw, 'empresa_dona_id');
      const opsFiltradas = filtrarPorContexto(opsRaw, 'empresa_id');
      const colaboradoresFiltrados = filtrarPorContexto(colaboradoresRaw, 'empresa_alocada_id');
      const contasPagarFiltradas = filtrarPorContexto(contasPagarRaw, 'empresa_id');
      const contasReceberFiltradas = filtrarPorContexto(contasReceberRaw, 'empresa_id');
      const oportunidadesFiltradas = filtrarPorContexto(oportunidadesRaw, 'empresa_id');
      const transportadorasFiltradas = filtrarPorContexto(transportadorasRaw, 'empresa_dona_id');
      const notasFiscaisFiltradas = filtrarPorContexto(notasFiscaisRaw, 'empresa_faturamento_id');
      const ordensCompraFiltradas = filtrarPorContexto(ordensCompraRaw, 'empresa_id');
      const interacoesFiltradas = filtrarPorContexto(interacoesRaw, 'empresa_id');

      // Função helper para buscar em arrays de objetos
      const buscarEmArray = (array, campos) => {
        if (!Array.isArray(array)) return false;
        return array.some(item => 
          campos.some(campo => item[campo]?.toLowerCase().includes(q))
        );
      };

      // Aplicar busca textual UNIVERSAL em múltiplos campos
      const clientes = clientesFiltrados.filter(c => 
        c.nome?.toLowerCase().includes(q) ||
        c.razao_social?.toLowerCase().includes(q) ||
        c.nome_fantasia?.toLowerCase().includes(q) ||
        c.cnpj?.includes(q) ||
        c.cpf?.includes(q) ||
        c.rg?.includes(q) ||
        c.ramo_atividade?.toLowerCase().includes(q) ||
        c.segmento_cliente_id?.toLowerCase().includes(q) ||
        c.vendedor_responsavel?.toLowerCase().includes(q) ||
        c.indicador_nome?.toLowerCase().includes(q) ||
        c.observacoes?.toLowerCase().includes(q) ||
        buscarEmArray(c.contatos, ['nome', 'cargo', 'valor'])
      ).slice(0, 5);

      const pedidos = pedidosFiltrados.filter(p =>
        p.numero_pedido?.toLowerCase().includes(q) ||
        p.cliente_nome?.toLowerCase().includes(q) ||
        p.vendedor?.toLowerCase().includes(q) ||
        p.tipo_pedido?.toLowerCase().includes(q) ||
        p.origem_pedido?.toLowerCase().includes(q) ||
        p.status?.toLowerCase().includes(q) ||
        p.observacoes_publicas?.toLowerCase().includes(q) ||
        p.observacoes_internas?.toLowerCase().includes(q)
      ).slice(0, 5);

      const produtos = produtosFiltrados.filter(p =>
        p.descricao?.toLowerCase().includes(q) ||
        p.codigo?.toLowerCase().includes(q) ||
        p.codigo_barras?.includes(q) ||
        p.grupo?.toLowerCase().includes(q) ||
        p.grupo_produto_nome?.toLowerCase().includes(q) ||
        p.marca_nome?.toLowerCase().includes(q) ||
        p.setor_atividade_nome?.toLowerCase().includes(q) ||
        p.tipo_item?.toLowerCase().includes(q) ||
        p.fornecedor_principal?.toLowerCase().includes(q) ||
        p.ncm?.includes(q) ||
        p.observacoes?.toLowerCase().includes(q)
      ).slice(0, 5);

      const entregas = entregasFiltradas.filter(e =>
        e.cliente_nome?.toLowerCase().includes(q) ||
        e.numero_pedido?.toLowerCase().includes(q) ||
        e.qr_code?.toLowerCase().includes(q) ||
        e.status?.toLowerCase().includes(q) ||
        e.motorista?.toLowerCase().includes(q) ||
        e.transportadora?.toLowerCase().includes(q) ||
        e.regiao_entrega_nome?.toLowerCase().includes(q) ||
        e.endereco_entrega_completo?.cidade?.toLowerCase().includes(q) ||
        e.endereco_entrega_completo?.bairro?.toLowerCase().includes(q)
      ).slice(0, 4);

      const fornecedores = fornecedoresFiltrados.filter(f =>
        f.nome?.toLowerCase().includes(q) ||
        f.razao_social?.toLowerCase().includes(q) ||
        f.nome_fantasia?.toLowerCase().includes(q) ||
        f.cnpj?.includes(q) ||
        f.cpf?.includes(q) ||
        f.categoria?.toLowerCase().includes(q) ||
        f.tipo_fornecedor?.toLowerCase().includes(q) ||
        f.ramo_atividade?.toLowerCase().includes(q) ||
        f.contato_responsavel?.toLowerCase().includes(q) ||
        buscarEmArray(f.emails, ['email']) ||
        buscarEmArray(f.telefones, ['numero'])
      ).slice(0, 4);

      const ops = opsFiltradas.filter(op =>
        op.numero_op?.toLowerCase().includes(q) ||
        op.cliente_nome?.toLowerCase().includes(q) ||
        op.status?.toLowerCase().includes(q) ||
        op.tipo_producao?.toLowerCase().includes(q) ||
        op.descricao_produto?.toLowerCase().includes(q)
      ).slice(0, 4);

      const colaboradores = colaboradoresFiltrados.filter(c =>
        c.nome_completo?.toLowerCase().includes(q) ||
        c.cpf?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.telefone?.includes(q) ||
        c.whatsapp?.includes(q) ||
        c.cargo?.toLowerCase().includes(q) ||
        c.departamento?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q)
      ).slice(0, 3);

      const contasPagar = contasPagarFiltradas.filter(c =>
        c.descricao?.toLowerCase().includes(q) ||
        c.fornecedor?.toLowerCase().includes(q) ||
        c.numero_documento?.toLowerCase().includes(q) ||
        c.categoria?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q) ||
        c.favorecido_cpf_cnpj?.includes(q)
      ).slice(0, 3);

      const contasReceber = contasReceberFiltradas.filter(c =>
        c.descricao?.toLowerCase().includes(q) ||
        c.cliente?.toLowerCase().includes(q) ||
        c.numero_documento?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q) ||
        c.forma_cobranca?.toLowerCase().includes(q)
      ).slice(0, 3);

      const oportunidades = oportunidadesFiltradas.filter(o =>
        o.titulo?.toLowerCase().includes(q) ||
        o.cliente_nome?.toLowerCase().includes(q) ||
        o.cliente_email?.toLowerCase().includes(q) ||
        o.cliente_telefone?.includes(q) ||
        o.responsavel?.toLowerCase().includes(q) ||
        o.etapa?.toLowerCase().includes(q) ||
        o.origem?.toLowerCase().includes(q) ||
        o.status?.toLowerCase().includes(q)
      ).slice(0, 3);

      const transportadoras = transportadorasFiltradas.filter(t =>
        t.razao_social?.toLowerCase().includes(q) ||
        t.nome_fantasia?.toLowerCase().includes(q) ||
        t.cnpj?.includes(q) ||
        t.contato_responsavel?.toLowerCase().includes(q) ||
        t.rntrc?.includes(q) ||
        buscarEmArray(t.telefones, ['numero'])
      ).slice(0, 2);

      const notasFiscais = notasFiscaisFiltradas.filter(n =>
        n.numero?.toLowerCase().includes(q) ||
        n.cliente_fornecedor?.toLowerCase().includes(q) ||
        n.chave_acesso?.includes(q) ||
        n.tipo?.toLowerCase().includes(q) ||
        n.status?.toLowerCase().includes(q)
      ).slice(0, 3);

      const ordensCompra = ordensCompraFiltradas.filter(oc =>
        oc.numero_oc?.toLowerCase().includes(q) ||
        oc.fornecedor_nome?.toLowerCase().includes(q) ||
        oc.status?.toLowerCase().includes(q)
      ).slice(0, 2);

      const interacoes = interacoesFiltradas.filter(i =>
        i.titulo?.toLowerCase().includes(q) ||
        i.cliente_nome?.toLowerCase().includes(q) ||
        i.tipo?.toLowerCase().includes(q) ||
        i.responsavel?.toLowerCase().includes(q) ||
        i.descricao?.toLowerCase().includes(q)
      ).slice(0, 2);

      const todosResultados = [
        ...clientes.map(c => ({
          tipo: 'Cliente',
          icone: Users,
          cor: 'blue',
          titulo: c.nome_fantasia || c.razao_social || c.nome,
          subtitulo: c.cnpj || c.cpf || c.vendedor_responsavel,
          url: createPageUrl('Cadastros') + '?tab=clientes&view=' + c.id,
          data: c
        })),
        ...pedidos.map(p => ({
          tipo: 'Pedido',
          icone: ShoppingCart,
          cor: 'purple',
          titulo: p.numero_pedido,
          subtitulo: `${p.cliente_nome} • ${p.status} • R$ ${p.valor_total?.toLocaleString('pt-BR')}`,
          url: createPageUrl('Comercial') + '?tab=pedidos&edit=' + p.id,
          data: p
        })),
        ...produtos.map(p => ({
          tipo: 'Produto',
          icone: Package,
          cor: 'green',
          titulo: p.descricao,
          subtitulo: `SKU: ${p.codigo} | ${p.grupo_produto_nome || p.grupo || ''} | Estoque: ${p.estoque_atual || 0}`,
          url: createPageUrl('Estoque') + '?tab=produtos&view=' + p.id,
          data: p
        })),
        ...entregas.map(e => ({
          tipo: 'Entrega',
          icone: Truck,
          cor: 'orange',
          titulo: `Entrega - ${e.cliente_nome}`,
          subtitulo: `${e.status} • ${e.endereco_entrega_completo?.cidade || ''}`,
          url: createPageUrl('Expedicao') + '?tab=entregas&view=' + e.id,
          data: e
        })),
        ...fornecedores.map(f => ({
          tipo: 'Fornecedor',
          icone: Building2,
          cor: 'slate',
          titulo: f.nome || f.razao_social,
          subtitulo: `${f.cnpj || f.cpf || ''} • ${f.categoria || ''}`,
          url: createPageUrl('Compras') + '?tab=fornecedores&view=' + f.id,
          data: f
        })),
        ...ops.map(op => ({
          tipo: 'OP',
          icone: Factory,
          cor: 'indigo',
          titulo: op.numero_op,
          subtitulo: `${op.cliente_nome} • ${op.status}`,
          url: createPageUrl('Producao') + '?op=' + op.id,
          data: op
        })),
        ...colaboradores.map(c => ({
          tipo: 'Colaborador',
          icone: UserCircle,
          cor: 'blue',
          titulo: c.nome_completo,
          subtitulo: `${c.cargo || ''} • ${c.departamento || ''} • ${c.status || ''}`,
          url: createPageUrl('RH') + '?tab=colaboradores&view=' + c.id,
          data: c
        })),
        ...contasPagar.map(c => ({
          tipo: 'Conta a Pagar',
          icone: DollarSign,
          cor: 'red',
          titulo: c.descricao,
          subtitulo: `${c.fornecedor || ''} • R$ ${c.valor?.toLocaleString('pt-BR')} • ${c.status}`,
          url: createPageUrl('Financeiro') + '?tab=pagar&view=' + c.id,
          data: c
        })),
        ...contasReceber.map(c => ({
          tipo: 'Conta a Receber',
          icone: DollarSign,
          cor: 'green',
          titulo: c.descricao,
          subtitulo: `${c.cliente || ''} • R$ ${c.valor?.toLocaleString('pt-BR')} • ${c.status}`,
          url: createPageUrl('Financeiro') + '?tab=receber&view=' + c.id,
          data: c
        })),
        ...oportunidades.map(o => ({
          tipo: 'Oportunidade',
          icone: TrendingUp,
          cor: 'purple',
          titulo: o.titulo,
          subtitulo: `${o.cliente_nome} • ${o.etapa} • R$ ${o.valor_estimado?.toLocaleString('pt-BR')}`,
          url: createPageUrl('CRM') + '?tab=oportunidades&view=' + o.id,
          data: o
        })),
        ...transportadoras.map(t => ({
          tipo: 'Transportadora',
          icone: Truck,
          cor: 'orange',
          titulo: t.razao_social || t.nome_fantasia,
          subtitulo: `${t.cnpj || ''} • ${t.contato_responsavel || ''}`,
          url: createPageUrl('Cadastros') + '?tab=transportadoras&view=' + t.id,
          data: t
        })),
        ...notasFiscais.map(n => ({
          tipo: 'NF-e',
          icone: FileText,
          cor: 'blue',
          titulo: `NF ${n.numero}/${n.serie}`,
          subtitulo: `${n.cliente_fornecedor} • ${n.status} • R$ ${n.valor_total?.toLocaleString('pt-BR')}`,
          url: createPageUrl('Fiscal') + '?tab=notas&view=' + n.id,
          data: n
        })),
        ...ordensCompra.map(oc => ({
          tipo: 'Ordem de Compra',
          icone: Briefcase,
          cor: 'slate',
          titulo: oc.numero_oc,
          subtitulo: `${oc.fornecedor_nome} • ${oc.status} • R$ ${oc.valor_total?.toLocaleString('pt-BR')}`,
          url: createPageUrl('Compras') + '?tab=ordens&view=' + oc.id,
          data: oc
        })),
        ...interacoes.map(i => ({
          tipo: 'Interação',
          icone: Calendar,
          cor: 'purple',
          titulo: i.titulo,
          subtitulo: `${i.tipo} • ${i.cliente_nome} • ${i.responsavel}`,
          url: createPageUrl('CRM') + '?tab=interacoes&view=' + i.id,
          data: i
        }))
      ];

      setResultados(todosResultados);

    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setBuscando(false);
    }
  };

  const handleSelect = (resultado) => {
    navigate(resultado.url);
    onOpenChange(false);
    setQuery('');
  };

  const cores = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    slate: 'bg-slate-100 text-slate-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    red: 'bg-red-100 text-red-700'
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
              placeholder="Pesquisar clientes, pedidos, produtos, entregas..."
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
              <p className="text-xs mt-2">Clientes • Pedidos • Produtos • Entregas • Fornecedores • OPs • Colaboradores • Financeiro • CRM</p>
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
            <div className="flex items-center gap-2">
              {estaNoGrupo ? (
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  Todas Empresas
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Building2 className="w-3 h-3 mr-1" />
                  {empresaAtual?.nome_fantasia || 'Empresa Atual'}
                </Badge>
              )}
              <span>{resultados.length} resultado(s)</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}