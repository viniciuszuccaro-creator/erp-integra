import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import useContextoVisual from '@/components/lib/useContextoVisual';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

/**
 * INVENTÁRIO CONTAGEM - Interface para contagem física e ajustes
 * ETAPA 2: Cria AjusteEstoque com fluxo de aprovação
 */

export default function InventarioContagem() {
  const { empresaAtual, carimbarContexto } = useContextoVisual();
  const [itens, setItens] = useState([]);
  const [status, setStatus] = useState('pendente');
  const [motivo, setMotivo] = useState('inventario');
  const [responsavel, setResponsavel] = useState('');

  const adicionarItem = () => {
    setItens([...itens, {
      produto_id: '',
      quantidade_sistema: 0,
      quantidade_fisica: 0,
      observacao: ''
    }]);
  };

  const removerItem = (idx) => {
    setItens(itens.filter((_, i) => i !== idx));
  };

  const atualizarItem = (idx, field, value) => {
    const novoItem = { ...itens[idx], [field]: value };
    setItens(itens.map((item, i) => i === idx ? novoItem : item));
  };

  const handleSubmit = async () => {
    try {
      const ajuste = await base44.entities.AjusteEstoque.create(
        carimbarContexto({
          numero_ajuste: `ADJ-${Date.now()}`,
          data_ajuste: new Date().toISOString().split('T')[0],
          tipo_ajuste: motivo,
          itens_ajuste: itens.map(item => ({
            ...item,
            quantidade_ajuste: item.quantidade_fisica - item.quantidade_sistema
          })),
          status: 'pendente',
          responsavel_contagem: responsavel
        })
      );

      setItens([]);
      alert('Ajuste criado: ' + ajuste.id);
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl h-full overflow-auto">
      <h2 className="text-2xl font-bold text-slate-900">Contagem de Inventário</h2>

      {/* Cabeçalho */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600">Responsável</label>
            <input
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Nome do responsável"
              className="w-full p-2 border border-slate-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Tipo de Ajuste</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-sm"
            >
              <option value="inventario">Inventário</option>
              <option value="avaria">Avaria</option>
              <option value="perda">Perda</option>
              <option value="devolucao">Devolução</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Itens de Contagem */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {itens.map((item, idx) => (
          <Card key={idx}>
            <CardContent className="pt-4 space-y-2">
              <div className="grid grid-cols-4 gap-2 text-sm">
                <input
                  placeholder="Produto ID"
                  value={item.produto_id}
                  onChange={(e) => atualizarItem(idx, 'produto_id', e.target.value)}
                  className="p-2 border border-slate-300 rounded"
                />
                <input
                  type="number"
                  placeholder="Sistema"
                  value={item.quantidade_sistema}
                  onChange={(e) => atualizarItem(idx, 'quantidade_sistema', parseFloat(e.target.value))}
                  className="p-2 border border-slate-300 rounded"
                />
                <input
                  type="number"
                  placeholder="Físico"
                  value={item.quantidade_fisica}
                  onChange={(e) => atualizarItem(idx, 'quantidade_fisica', parseFloat(e.target.value))}
                  className="p-2 border border-slate-300 rounded"
                />
                <input
                  type="number"
                  placeholder="Ajuste"
                  value={item.quantidade_fisica - item.quantidade_sistema}
                  disabled
                  className="p-2 border border-slate-300 rounded bg-slate-100"
                />
              </div>
              <input
                placeholder="Observação"
                value={item.observacao}
                onChange={(e) => atualizarItem(idx, 'observacao', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-sm"
              />
              <Button
                onClick={() => removerItem(idx)}
                variant="ghost"
                size="sm"
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remover
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <Button
          onClick={adicionarItem}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar Item
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={itens.length === 0}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" /> Finalizar Contagem
        </Button>
      </div>
    </div>
  );
}