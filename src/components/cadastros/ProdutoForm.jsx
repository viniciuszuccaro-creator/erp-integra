import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ProdutoForm({ produto, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(produto || {
    descricao: '',
    codigo: '',
    tipo_item: 'Revenda',
    grupo: 'Outros',
    eh_bitola: false,
    peso_teorico_kg_m: 0,
    bitola_diametro_mm: 0,
    tipo_aco: 'CA-50',
    unidade_medida: 'UN',
    unidade_compra: 'UN',
    unidade_estoque: 'UN',
    unidade_venda: 'UN',
    comprimento_barra_padrao_m: 12,
    custo_aquisicao: 0,
    preco_venda: 0,
    estoque_minimo: 0,
    ncm: '',
    status: 'Ativo'
  });

  const [iaSugestao, setIaSugestao] = useState(null);
  const [processandoIA, setProcessandoIA] = useState(false);

  // IA de Classificação Mestra (V18.0)
  const analisarDescricaoIA = async (descricao) => {
    if (!descricao || descricao.length < 5) return;
    
    setProcessandoIA(true);
    
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta descrição de produto: "${descricao}".
        
Se for uma bitola de aço (ex: "Barra 8mm 12m CA-50", "Vergalhão 10mm"), retorne:
- eh_bitola: true
- peso_teorico_kg_m: peso teórico em kg/m (8mm=0.395, 10mm=0.617, 12.5mm=0.963, etc)
- bitola_diametro_mm: diâmetro em mm
- tipo_aco: CA-25, CA-50 ou CA-60
- ncm: "7214.20.00" (vergalhões)
- grupo_produto: "Bitolas"
- comprimento_barra_m: 12 (padrão)

Caso contrário, sugira:
- grupo_produto adequado
- ncm provável
- unidades de medida apropriadas`,
        response_json_schema: {
          type: "object",
          properties: {
            eh_bitola: { type: "boolean" },
            peso_teorico_kg_m: { type: "number" },
            bitola_diametro_mm: { type: "number" },
            tipo_aco: { type: "string" },
            ncm: { type: "string" },
            grupo_produto: { type: "string" },
            comprimento_barra_m: { type: "number" },
            unidade_compra_sugerida: { type: "string" },
            unidade_estoque_sugerida: { type: "string" },
            explicacao: { type: "string" }
          }
        }
      });

      setIaSugestao(resultado);
      toast.success('✨ IA analisou o produto!');
    } catch (error) {
      toast.error('Erro ao processar IA');
    } finally {
      setProcessandoIA(false);
    }
  };

  const aplicarSugestaoIA = () => {
    if (!iaSugestao) return;
    
    setFormData({
      ...formData,
      eh_bitola: iaSugestao.eh_bitola || false,
      peso_teorico_kg_m: iaSugestao.peso_teorico_kg_m || 0,
      bitola_diametro_mm: iaSugestao.bitola_diametro_mm || 0,
      tipo_aco: iaSugestao.tipo_aco || 'CA-50',
      ncm: iaSugestao.ncm || '',
      grupo: iaSugestao.grupo_produto || formData.grupo,
      comprimento_barra_padrao_m: iaSugestao.comprimento_barra_m || 12,
      unidade_compra: iaSugestao.unidade_compra_sugerida || formData.unidade_compra,
      unidade_estoque: iaSugestao.unidade_estoque_sugerida || formData.unidade_estoque
    });
    
    toast.success('✅ Sugestões aplicadas!');
    setIaSugestao(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.descricao || !formData.unidade_medida) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Descrição do Produto *</Label>
        <div className="flex gap-2">
          <Input
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            placeholder="Ex: Vergalhão 8mm 12m CA-50"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => analisarDescricaoIA(formData.descricao)}
            disabled={processandoIA}
          >
            {processandoIA ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-1">✨ IA vai preencher campos automaticamente</p>
      </div>

      {iaSugestao && (
        <Alert className="border-purple-200 bg-purple-50">
          <AlertDescription>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-sm text-purple-900 mb-1">🤖 IA Classificou o Produto:</p>
                <p className="text-xs text-purple-800">{iaSugestao.explicacao}</p>
              </div>
              <Button size="sm" onClick={aplicarSugestaoIA} className="bg-purple-600">
                Aplicar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código/SKU</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
          />
        </div>

        <div>
          <Label>Tipo de Item</Label>
          <Select value={formData.tipo_item} onValueChange={(v) => setFormData({...formData, tipo_item: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Revenda">Revenda</SelectItem>
              <SelectItem value="Matéria-Prima Produção">Matéria-Prima Produção</SelectItem>
              <SelectItem value="Produto Acabado">Produto Acabado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>É uma Bitola de Aço?</Label>
          <p className="text-xs text-slate-500">Habilita campos específicos</p>
        </div>
        <Switch
          checked={formData.eh_bitola}
          onCheckedChange={(v) => setFormData({...formData, eh_bitola: v})}
        />
      </div>

      {formData.eh_bitola && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded border border-blue-200">
          <div>
            <Label>Diâmetro (mm)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.bitola_diametro_mm}
              onChange={(e) => setFormData({...formData, bitola_diametro_mm: parseFloat(e.target.value)})}
            />
          </div>

          <div>
            <Label>Peso Teórico (kg/m)</Label>
            <Input
              type="number"
              step="0.001"
              value={formData.peso_teorico_kg_m}
              onChange={(e) => setFormData({...formData, peso_teorico_kg_m: parseFloat(e.target.value)})}
            />
          </div>

          <div>
            <Label>Tipo de Aço</Label>
            <Select value={formData.tipo_aco} onValueChange={(v) => setFormData({...formData, tipo_aco: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CA-25">CA-25</SelectItem>
                <SelectItem value="CA-50">CA-50</SelectItem>
                <SelectItem value="CA-60">CA-60</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Unidade Compra</Label>
          <Select value={formData.unidade_compra} onValueChange={(v) => setFormData({...formData, unidade_compra: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TON">Tonelada</SelectItem>
              <SelectItem value="KG">Quilograma</SelectItem>
              <SelectItem value="MT">Metro</SelectItem>
              <SelectItem value="BARRA">Barra</SelectItem>
              <SelectItem value="UN">Unidade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Unidade Estoque</Label>
          <Select value={formData.unidade_estoque} onValueChange={(v) => setFormData({...formData, unidade_estoque: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KG">Quilograma</SelectItem>
              <SelectItem value="MT">Metro</SelectItem>
              <SelectItem value="UN">Unidade</SelectItem>
              <SelectItem value="PC">Peça</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Unidade Venda</Label>
          <Select value={formData.unidade_venda} onValueChange={(v) => setFormData({...formData, unidade_venda: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KG">Quilograma</SelectItem>
              <SelectItem value="MT">Metro</SelectItem>
              <SelectItem value="PEÇA">Peça</SelectItem>
              <SelectItem value="UN">Unidade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>NCM (Nomenclatura Comum Mercosul)</Label>
        <Input
          value={formData.ncm}
          onChange={(e) => setFormData({...formData, ncm: e.target.value})}
          placeholder="0000.00.00"
          maxLength={10}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {produto ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );
}