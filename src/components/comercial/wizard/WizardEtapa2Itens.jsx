import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Hammer, Scissors, ChevronRight, ChevronLeft } from "lucide-react";
import AdicionarItemRevendaModal from "../AdicionarItemRevendaModal";
import ItemPedidoUniversal from "../ItemPedidoUniversal";
import FormularioArmadoCompleto from "@/components/producao/FormularioArmadoCompleto";
import FormularioCorteDobraCompleto from "@/components/producao/FormularioCorteDobraCompleto";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * V21.1: ABA 2 - ITENS DO PEDIDO (3 SUB-ABAS)
 * - Revenda (com Conversão V22.0)
 * - Armado (com campo obra_destino)
 * - Corte/Dobra (com campo obra_destino)
 */
export default function WizardEtapa2Itens({ formData, onChange, onNext, onBack }) {
  const [subAba, setSubAba] = useState("revenda");
  const [modalRevendaOpen, setModalRevendaOpen] = useState(false);
  const [modalArmadoOpen, setModalArmadoOpen] = useState(false);
  const [modalCorteOpen, setModalCorteOpen] = useState(false);
  const [editandoItem, setEditandoItem] = useState(null);

  const itensRevenda = formData.itens_revenda || [];
  const itensArmado = formData.itens_armado_padrao || [];
  const itensCorte = formData.itens_corte_dobra || [];

  const totalItens = itensRevenda.length + itensArmado.length + itensCorte.length;
  const valorTotal = 
    itensRevenda.reduce((s, i) => s + (i.preco_venda_total || 0), 0) +
    itensArmado.reduce((s, i) => s + (i.preco_venda_total || 0), 0) +
    itensCorte.reduce((s, i) => s + (i.preco_venda_total || 0), 0);

  const pesoTotal = 
    itensRevenda.reduce((s, i) => s + ((i.peso_equivalente_kg || 0) * (i.quantidade || 0)), 0) +
    itensArmado.reduce((s, i) => s + (i.peso_total_kg || 0), 0) +
    itensCorte.reduce((s, i) => s + (i.peso_total_kg || 0), 0);

  const handleAdicionarRevenda = (item) => {
    const novosItens = [...itensRevenda, item];
    onChange({ 
      ...formData, 
      itens_revenda: novosItens,
      valor_total: valorTotal
    });
    setModalRevendaOpen(false);
  };

  const handleAdicionarArmado = (item) => {
    const novosItens = [...itensArmado, item];
    onChange({ 
      ...formData, 
      itens_armado_padrao: novosItens,
      valor_total: valorTotal
    });
    setModalArmadoOpen(false);
  };

  const handleAdicionarCorte = (item) => {
    const novosItens = [...itensCorte, item];
    onChange({ 
      ...formData, 
      itens_corte_dobra: novosItens,
      valor_total: valorTotal
    });
    setModalCorteOpen(false);
  };

  const handleRemoverItem = (tipo, index) => {
    if (tipo === 'revenda') {
      onChange({ ...formData, itens_revenda: itensRevenda.filter((_, i) => i !== index) });
    } else if (tipo === 'armado') {
      onChange({ ...formData, itens_armado_padrao: itensArmado.filter((_, i) => i !== index) });
    } else if (tipo === 'corte') {
      onChange({ ...formData, itens_corte_dobra: itensCorte.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="space-y-6">
      {/* RESUMO DO PEDIDO */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-600">Total de Itens</p>
            <p className="text-2xl font-bold text-blue-600">{totalItens}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-600">Peso Total (KG)</p>
            <p className="text-2xl font-bold text-purple-600">{pesoTotal.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-600">Valor Total</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3 SUB-ABAS */}
      <Tabs value={subAba} onValueChange={setSubAba}>
        <TabsList className="w-full bg-white border">
          <TabsTrigger value="revenda" className="flex-1">
            <Package className="w-4 h-4 mr-2" />
            Revenda ({itensRevenda.length})
          </TabsTrigger>
          <TabsTrigger value="armado" className="flex-1">
            <Hammer className="w-4 h-4 mr-2" />
            Armado ({itensArmado.length})
          </TabsTrigger>
          <TabsTrigger value="corte" className="flex-1">
            <Scissors className="w-4 h-4 mr-2" />
            Corte/Dobra ({itensCorte.length})
          </TabsTrigger>
        </TabsList>

        {/* SUB-ABA 1: REVENDA */}
        <TabsContent value="revenda" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Itens de Revenda</h3>
            <Button onClick={() => setModalRevendaOpen(true)} size="sm" className="bg-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>

          {itensRevenda.length > 0 ? (
            <div className="space-y-3">
              {itensRevenda.map((item, idx) => (
                <ItemPedidoUniversal
                  key={idx}
                  item={item}
                  onRemove={() => handleRemoverItem('revenda', idx)}
                />
              ))}
            </div>
          ) : (
            <Alert className="border-dashed">
              <AlertDescription className="text-center">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum item de revenda adicionado</p>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* SUB-ABA 2: ARMADO */}
        <TabsContent value="armado" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Itens de Armação</h3>
            <Button onClick={() => setModalArmadoOpen(true)} size="sm" className="bg-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Nova Peça Armada
            </Button>
          </div>

          {itensArmado.length > 0 ? (
            <div className="space-y-3">
              {itensArmado.map((item, idx) => (
                <ItemPedidoUniversal
                  key={idx}
                  item={{
                    ...item,
                    descricao: item.descricao_automatica || `Armado ${item.tipo_armacao}`,
                    quantidade: item.quantidade,
                    unidade: 'UN'
                  }}
                  onRemove={() => handleRemoverItem('armado', idx)}
                />
              ))}
            </div>
          ) : (
            <Alert className="border-dashed">
              <AlertDescription className="text-center">
                <Hammer className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma peça armada adicionada</p>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* SUB-ABA 3: CORTE/DOBRA */}
        <TabsContent value="corte" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Itens de Corte e Dobra</h3>
            <Button onClick={() => setModalCorteOpen(true)} size="sm" className="bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Nova Peça C/D
            </Button>
          </div>

          {itensCorte.length > 0 ? (
            <div className="space-y-3">
              {itensCorte.map((item, idx) => (
                <ItemPedidoUniversal
                  key={idx}
                  item={{
                    ...item,
                    descricao: item.descricao_automatica || `${item.tipo_peca} - ${item.ferro_principal_bitola}`,
                    quantidade: item.quantidade,
                    unidade: 'UN'
                  }}
                  onRemove={() => handleRemoverItem('corte', idx)}
                />
              ))}
            </div>
          ) : (
            <Alert className="border-dashed">
              <AlertDescription className="text-center">
                <Scissors className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma peça de corte/dobra adicionada</p>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* NAVEGAÇÃO */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={onNext}
          disabled={totalItens === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Próximo: Financeiro →
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* MODAIS */}
      <AdicionarItemRevendaModal
        isOpen={modalRevendaOpen}
        onClose={() => setModalRevendaOpen(false)}
        onAdd={handleAdicionarRevenda}
      />

      <FormularioArmadoCompleto
        isOpen={modalArmadoOpen}
        onClose={() => setModalArmadoOpen(false)}
        onSubmit={handleAdicionarArmado}
        obraDestino={formData.obra_destino_nome}
      />

      <FormularioCorteDobraCompleto
        isOpen={modalCorteOpen}
        onClose={() => setModalCorteOpen(false)}
        onSubmit={handleAdicionarCorte}
        obraDestino={formData.obra_destino_nome}
      />
    </div>
  );
}