import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Wizard Etapa 2 - Itens
 * Conexão Hub V16.1: Lê Produto.json e TabelaPreco.json
 */
export default function WizardEtapa2Itens({ dadosPedido, onChange }) {
  const [itemForm, setItemForm] = useState({
    produto_id: '',
    quantidade: 1,
    preco_unitario: 0,
    desconto_percentual: 0,
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco'],
    queryFn: () => base44.entities.TabelaPreco.list(),
  });

  const adicionarItem = () => {
    if (!itemForm.produto_id) {
      toast.error('Selecione um produto');
      return;
    }

    const produto = produtos.find(p => p.id === itemForm.produto_id);
    const valorTotal = itemForm.quantidade * itemForm.preco_unitario * (1 - itemForm.desconto_percentual / 100);

    const novoItem = {
      id: Date.now().toString(),
      produto_id: itemForm.produto_id,
      codigo_produto: produto?.codigo || '',
      descricao: produto?.descricao || '',
      quantidade: itemForm.quantidade,
      unidade: produto?.unidade_medida || 'UN',
      preco_unitario: itemForm.preco_unitario,
      desconto_percentual: itemForm.desconto_percentual,
      valor_total: valorTotal,
    };

    const novosItens = [...(dadosPedido.itens_revenda || []), novoItem];
    const valorTotalPedido = novosItens.reduce((sum, item) => sum + item.valor_total, 0);

    onChange({
      ...dadosPedido,
      itens_revenda: novosItens,
      valor_total: valorTotalPedido,
      valor_produtos: valorTotalPedido,
    });

    setItemForm({ produto_id: '', quantidade: 1, preco_unitario: 0, desconto_percentual: 0 });
  };

  const removerItem = (itemId) => {
    const novosItens = dadosPedido.itens_revenda.filter(i => i.id !== itemId);
    const valorTotalPedido = novosItens.reduce((sum, item) => sum + item.valor_total, 0);

    onChange({
      ...dadosPedido,
      itens_revenda: novosItens,
      valor_total: valorTotalPedido,
      valor_produtos: valorTotalPedido,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="col-span-2">
          <Label>Produto</Label>
          <Select 
            value={itemForm.produto_id} 
            onValueChange={(val) => {
              const produto = produtos.find(p => p.id === val);
              setItemForm({
                ...itemForm, 
                produto_id: val,
                preco_unitario: produto?.preco_venda || 0
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {produtos.map(produto => (
                <SelectItem key={produto.id} value={produto.id}>
                  {produto.descricao} - R$ {(produto.preco_venda || 0).toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Quantidade</Label>
          <Input
            type="number"
            value={itemForm.quantidade}
            onChange={(e) => setItemForm({...itemForm, quantidade: parseFloat(e.target.value) || 0})}
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <Label>Desconto %</Label>
          <Input
            type="number"
            value={itemForm.desconto_percentual}
            onChange={(e) => setItemForm({...itemForm, desconto_percentual: parseFloat(e.target.value) || 0})}
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        <div className="col-span-4">
          <Button onClick={adicionarItem} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Qtd</TableHead>
            <TableHead>Preço Unit.</TableHead>
            <TableHead>Desc %</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dadosPedido.itens_revenda?.map(item => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.descricao}</TableCell>
              <TableCell>{item.quantidade} {item.unidade}</TableCell>
              <TableCell>R$ {item.preco_unitario.toFixed(2)}</TableCell>
              <TableCell>{item.desconto_percentual}%</TableCell>
              <TableCell className="text-right font-semibold">
                R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => removerItem(item.id)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {dadosPedido.itens_revenda?.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>Nenhum item adicionado</p>
        </div>
      )}
    </div>
  );
}