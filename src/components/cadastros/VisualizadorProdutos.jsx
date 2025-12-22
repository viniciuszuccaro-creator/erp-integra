import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import VisualizadorUniversalEntidade from './VisualizadorUniversalEntidade';
import BotoesImportacaoProduto from './BotoesImportacaoProduto';
import ProdutoFormV22_Completo from './ProdutoFormV22_Completo';
import { Package } from 'lucide-react';

export default function VisualizadorProdutos(props) {
  const queryClient = useQueryClient();

  const visualizadorProps = {
    nomeEntidade: 'Produto',
    tituloDisplay: 'Produtos',
    icone: Package,
    queryKey: "produtos", // Adicionado para que a invalidação funcione
    camposBusca: ['descricao', 'codigo', 'ncm'],
    camposPrincipais: ['descricao', 'codigo', 'setor_atividade_nome', 'grupo_produto_nome', 'marca_nome', 'status', 'estoque_atual'],
    componenteEdicao: ProdutoFormV22_Completo,
    opcoesOrdenacao: {
      '-created_date': 'Mais Recentes',
      'descricao': 'Descrição (A-Z)',
      '-descricao': 'Descrição (Z-A)',
      'estoque_atual': 'Estoque (Menor)',
      '-estoque_atual': 'Estoque (Maior)',
    },
    defaultSort: '-created_date',
    ...props,
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      <div className="p-4 border-b bg-white">
        <BotoesImportacaoProduto onProdutosCriados={() => queryClient.invalidateQueries({ queryKey: ['produtos'] })} />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <VisualizadorUniversalEntidade {...visualizadorProps} />
      </div>
    </div>
  );
}