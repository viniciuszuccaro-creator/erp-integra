import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import VisualizadorUniversalEntidade from './VisualizadorUniversalEntidade';
import BotoesImportacaoProduto from './BotoesImportacaoProduto';
import ProdutoFormV22_Completo from './ProdutoFormV22_Completo';
import { Package, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function VisualizadorProdutos(props) {
  const queryClient = useQueryClient();
  const [selectedProdutos, setSelectedProdutos] = useState(new Set());
  const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
  const [targetSetorId, setTargetSetorId] = useState(null);

  const { data: setores = [] } = useQuery({
    queryKey: ['setores-atividade'],
    queryFn: () => base44.entities.SetorAtividade.list(),
  });

  const updateSetorMutation = useMutation({
    mutationFn: async ({ setorId, setorNome }) => {
      const updates = Array.from(selectedProdutos).map(produtoId => 
        base44.entities.Produto.update(produtoId, {
          setor_atividade_id: setorId,
          setor_atividade_nome: setorNome,
        })
      );
      return Promise.all(updates);
    },
    onSuccess: () => {
      toast({ title: '✅ Sucesso!', description: `${selectedProdutos.size} produtos atualizados.` });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setSelectedProdutos(new Set());
      setIsSetorModalOpen(false);
    },
    onError: (error) => {
      toast({ title: '❌ Erro', description: `Não foi possível atualizar os produtos: ${error.message}`, variant: 'destructive' });
    }
  });

  const handleUpdateSetor = () => {
    if (!targetSetorId) {
      toast({ title: 'Atenção', description: 'Por favor, selecione um setor de destino.', variant: 'destructive' });
      return;
    }
    const setorSelecionado = setores.find(s => s.id === targetSetorId);
    if (setorSelecionado) {
      updateSetorMutation.mutate({ setorId: setorSelecionado.id, setorNome: setorSelecionado.nome });
    }
  };

  const visualizadorProps = {
    nomeEntidade: 'Produto',
    tituloDisplay: 'Produtos',
    icone: Package,
    queryKey: "produtos",
    camposBusca: ['descricao', 'codigo', 'ncm', 'tags_busca_ia'],
    camposPrincipais: ['descricao', 'codigo', 'setor_atividade_nome', 'grupo_produto_nome', 'marca_nome', 'status', 'estoque_atual'],
    componenteEdicao: ProdutoFormV22_Completo,
    onSelectionChange: setSelectedProdutos,
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
      <div className="p-4 border-b bg-white flex items-center gap-4">
        <BotoesImportacaoProduto onProdutosCriados={() => queryClient.invalidateQueries({ queryKey: ['produtos'] })} />
        <Button
          variant="outline"
          onClick={() => setIsSetorModalOpen(true)}
          disabled={selectedProdutos.size === 0}
          className="border-blue-300 hover:bg-blue-50"
        >
          <Edit className="w-4 h-4 mr-2" />
          Atualizar Setor ({selectedProdutos.size})
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <VisualizadorUniversalEntidade {...visualizadorProps} />
      </div>

      <Dialog open={isSetorModalOpen} onOpenChange={setIsSetorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Setor em Massa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-sm text-slate-600">
              Você está prestes a alterar o setor de <span className="font-bold">{selectedProdutos.size}</span> produtos selecionados.
            </p>
            <Select onValueChange={setTargetSetorId} value={targetSetorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o novo setor..." />
              </SelectTrigger>
              <SelectContent>
                {setores.map(setor => (
                  <SelectItem key={setor.id} value={setor.id}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSetorModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateSetor} disabled={!targetSetorId || updateSetorMutation.isPending}>
              {updateSetorMutation.isPending ? 'Atualizando...' : 'Atualizar Produtos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}