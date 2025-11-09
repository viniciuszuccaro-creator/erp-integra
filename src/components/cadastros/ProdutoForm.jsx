import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Package, Upload, Calculator, CheckCircle2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

/**
 * V22.0: REGRA MESTRE DE CONVERSÃO DE UNIDADES
 * Este formulário é o HUB central que define como o produto pode ser vendido/comprado
 */
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
    comprimento_barra_padrao_m: 12,
    
    // V22.0: CAMPOS CRÍTICOS
    unidade_principal: 'KG',
    unidades_secundarias: ['KG'],
    fatores_conversao: {
      kg_por_peca: 0,
      kg_por_metro: 0,
      metros_por_peca: 0,
      peca_por_ton: 0,
      kg_por_ton: 1000
    },
    
    foto_produto_url: '',
    custo_aquisicao: 0,
    preco_venda: 0,
    estoque_minimo: 0,
    ncm: '',
    status: 'Ativo'
  });

  const [iaSugestao, setIaSugestao] = useState(null);
  const [processandoIA, setProcessandoIA] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [calculoConversao, setCalculoConversao] = useState(null);

  // V22.0: Recalcular fatores quando mudam campos-chave
  useEffect(() => {
    if (formData.eh_bitola) {
      recalcularFatoresConversao();
    }
  }, [formData.peso_teorico_kg_m, formData.comprimento_barra_padrao_m, formData.eh_bitola]);

  // V22.0: MOTOR DE CONVERSÃO AUTOMÁTICA
  const recalcularFatoresConversao = () => {
    const pesoKgM = formData.peso_teorico_kg_m || 0;
    const comprimentoM = formData.comprimento_barra_padrao_m || 12;
    
    const kgPorPeca = pesoKgM * comprimentoM; // 1 peça (12m) = peso_kg_m * 12
    const pecaPorTon = kgPorPeca > 0 ? (1000 / kgPorPeca) : 0; // quantas peças em 1 TON
    
    const novosFatores = {
      kg_por_metro: pesoKgM,
      kg_por_peca: kgPorPeca,
      metros_por_peca: comprimentoM,
      peca_por_ton: pecaPorTon,
      kg_por_ton: 1000
    };

    setFormData(prev => ({
      ...prev,
      fatores_conversao: novosFatores
    }));

    setCalculoConversao(novosFatores);
  };

  // IA de Classificação Mestra (V18.0 + V22.0 Melhorado)
  const analisarDescricaoIA = async (descricao) => {
    if (!descricao || descricao.length < 5) return;
    
    setProcessandoIA(true);
    
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta descrição de produto: "${descricao}".

Se for uma bitola de aço (ex: "Barra 8mm 12m CA-50", "Vergalhão 10mm"), retorne:
- eh_bitola: true
- peso_teorico_kg_m: peso teórico em kg/m (tabela oficial):
  * 6.3mm = 0.245 kg/m
  * 8mm = 0.395 kg/m
  * 10mm = 0.617 kg/m
  * 12.5mm = 0.963 kg/m
  * 16mm = 1.578 kg/m
  * 20mm = 2.466 kg/m
  * 25mm = 3.853 kg/m
  * 32mm = 6.313 kg/m
- bitola_diametro_mm: diâmetro em mm
- tipo_aco: CA-25, CA-50 ou CA-60
- ncm: "7214.20.00" (vergalhões)
- grupo_produto: "Bitola"
- comprimento_barra_m: 12 (padrão)
- unidade_principal: "KG"
- unidades_secundarias: ["PÇ", "KG", "MT"] (sempre essas 3 para bitolas)

Caso contrário, sugira:
- grupo_produto adequado
- ncm provável
- unidade_principal e unidades_secundarias apropriadas`,
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
            unidade_principal: { type: "string" },
            unidades_secundarias: {
              type: "array",
              items: { type: "string" }
            },
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
      unidade_principal: iaSugestao.unidade_principal || 'KG',
      unidades_secundarias: iaSugestao.unidades_secundarias || ['KG']
    });
    
    toast.success('✅ Sugestões aplicadas!');
    setIaSugestao(null);
  };

  // Upload de Foto do Produto
  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFoto(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, foto_produto_url: file_url });
      toast.success('✅ Foto carregada!');
    } catch (error) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploadingFoto(false);
    }
  };

  // Toggle de unidades secundárias
  const toggleUnidadeSecundaria = (unidade) => {
    const unidades = formData.unidades_secundarias || [];
    if (unidades.includes(unidade)) {
      setFormData({
        ...formData,
        unidades_secundarias: unidades.filter(u => u !== unidade)
      });
    } else {
      setFormData({
        ...formData,
        unidades_secundarias: [...unidades, unidade]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.descricao) {
      toast.error('Preencha a descrição do produto');
      return;
    }

    if (!formData.unidades_secundarias || formData.unidades_secundarias.length === 0) {
      toast.error('Selecione pelo menos 1 unidade de venda/compra');
      return;
    }

    if (formData.eh_bitola && formData.peso_teorico_kg_m === 0) {
      toast.error('Bitolas precisam ter peso teórico preenchido');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SEÇÃO 1: Identificação */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold flex items-center gap-2 text-purple-900">
            <Package className="w-5 h-5" />
            Identificação do Produto
          </h3>

          <div>
            <Label>Descrição do Produto *</Label>
            <div className="flex gap-2">
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Ex: Vergalhão 8mm 12m CA-50"
                className="flex-1"
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
            <p className="text-xs text-slate-500 mt-1">✨ IA preenche automaticamente NCM, peso e unidades</p>
          </div>

          {iaSugestao && (
            <Alert className="border-purple-300 bg-purple-100">
              <AlertDescription>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm text-purple-900 mb-1">🤖 IA Classificou:</p>
                    <p className="text-xs text-purple-800">{iaSugestao.explicacao}</p>
                  </div>
                  <Button size="sm" onClick={aplicarSugestaoIA} className="bg-purple-600">
                    Aplicar Tudo
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
                placeholder="SKU-001"
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

          {/* UPLOAD DE FOTO - V22.0 */}
          <div>
            <Label>Foto do Produto</Label>
            <div className="flex items-center gap-4">
              {formData.foto_produto_url && (
                <img src={formData.foto_produto_url} alt="Produto" className="w-20 h-20 object-cover rounded border" />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFoto}
                  className="hidden"
                  id="foto-upload"
                />
                <label htmlFor="foto-upload">
                  <Button type="button" variant="outline" size="sm" disabled={uploadingFoto} asChild>
                    <span>
                      {uploadingFoto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {formData.foto_produto_url ? 'Alterar Foto' : 'Upload Foto'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">📸 Usada em Pedidos, E-commerce e Portal</p>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 2: É BITOLA? */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-dashed">
        <div>
          <Label className="text-base font-semibold">É uma Bitola de Aço?</Label>
          <p className="text-xs text-slate-500">Habilita campos específicos e conversão PÇ ↔ KG ↔ MT</p>
        </div>
        <Switch
          checked={formData.eh_bitola}
          onCheckedChange={(v) => {
            setFormData({...formData, eh_bitola: v});
            if (v) {
              setFormData(prev => ({
                ...prev,
                unidade_principal: 'KG',
                unidades_secundarias: ['PÇ', 'KG', 'MT']
              }));
            }
          }}
        />
      </div>

      {/* SEÇÃO 3: CAMPOS DE BITOLA */}
      {formData.eh_bitola && (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-blue-900">📏 Especificações da Bitola</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Diâmetro (mm) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.bitola_diametro_mm}
                  onChange={(e) => setFormData({...formData, bitola_diametro_mm: parseFloat(e.target.value) || 0})}
                  placeholder="8.0"
                />
              </div>

              <div>
                <Label>Peso Teórico (kg/m) *</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.peso_teorico_kg_m}
                  onChange={(e) => setFormData({...formData, peso_teorico_kg_m: parseFloat(e.target.value) || 0})}
                  placeholder="0.395"
                />
                <p className="text-xs text-slate-500 mt-1">Tabela oficial ABNT</p>
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

              <div className="col-span-3">
                <Label>Comprimento Padrão da Barra (metros)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.comprimento_barra_padrao_m}
                  onChange={(e) => setFormData({...formData, comprimento_barra_padrao_m: parseFloat(e.target.value) || 12})}
                  placeholder="12"
                />
                <p className="text-xs text-slate-500 mt-1">🔧 Usado para calcular kg_por_peca automaticamente</p>
              </div>
            </div>

            {/* V22.0: PREVIEW DE CONVERSÃO */}
            {calculoConversao && (
              <Alert className="border-green-300 bg-green-50">
                <Calculator className="w-4 h-4 text-green-700" />
                <AlertDescription>
                  <p className="font-semibold text-sm text-green-900 mb-2">✅ Conversões Calculadas:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                    <p>• 1 PÇ (barra) = <strong>{calculoConversao.kg_por_peca.toFixed(2)} KG</strong></p>
                    <p>• 1 MT = <strong>{calculoConversao.kg_por_metro.toFixed(3)} KG</strong></p>
                    <p>• 1 TON = <strong>{calculoConversao.peca_por_ton.toFixed(1)} PÇ</strong></p>
                    <p>• 1 PÇ = <strong>{calculoConversao.metros_por_peca} MT</strong></p>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    💡 Essas conversões serão usadas em Vendas, Compras e Estoque automaticamente
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* SEÇÃO 4: UNIDADES - V22.0 CRÍTICO */}
      <Card className="border-indigo-300 bg-indigo-50">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            V22.0: Unidades e Conversões
          </h3>

          <Alert className="border-indigo-400 bg-indigo-100">
            <AlertDescription className="text-sm text-indigo-900">
              🎯 <strong>REGRA MESTRE:</strong> As unidades selecionadas aqui estarão disponíveis em Vendas, Compras e Movimentações
            </AlertDescription>
          </Alert>

          <div>
            <Label>Unidade Principal (Relatórios e Dashboard)</Label>
            <Select value={formData.unidade_principal} onValueChange={(v) => setFormData({...formData, unidade_principal: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UN">Unidade (UN)</SelectItem>
                <SelectItem value="PÇ">Peça (PÇ)</SelectItem>
                <SelectItem value="KG">Quilograma (KG)</SelectItem>
                <SelectItem value="MT">Metro (MT)</SelectItem>
                <SelectItem value="TON">Tonelada (TON)</SelectItem>
                <SelectItem value="CX">Caixa (CX)</SelectItem>
                <SelectItem value="LT">Litro (LT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Unidades Habilitadas (Multi-Select) *</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white">
              {['UN', 'PÇ', 'KG', 'MT', 'TON', 'CX', 'BARRA'].map(unidade => (
                <Badge
                  key={unidade}
                  className={`cursor-pointer transition-all ${
                    (formData.unidades_secundarias || []).includes(unidade)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                  onClick={() => toggleUnidadeSecundaria(unidade)}
                >
                  {(formData.unidades_secundarias || []).includes(unidade) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {unidade}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ✅ Selecionadas: {(formData.unidades_secundarias || []).join(', ')}
            </p>
          </div>

          {/* V22.0: Visualização de Como Será Usado */}
          {formData.unidades_secundarias && formData.unidades_secundarias.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-sm text-blue-900">
                <p className="font-semibold mb-2">📦 Como será usado nos módulos:</p>
                <div className="space-y-1 text-xs">
                  <p>• <strong>Vendas:</strong> Dropdown terá opções: {formData.unidades_secundarias.join(', ')}</p>
                  <p>• <strong>Compras:</strong> Dropdown terá opções: {formData.unidades_secundarias.join(', ')}</p>
                  <p>• <strong>Estoque:</strong> Saldo sempre em KG (conversão automática)</p>
                  <p>• <strong>NF-e:</strong> Unidade do pedido + equivalente KG</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* SEÇÃO 5: Precificação */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold text-green-900">💰 Precificação</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Custo Aquisição</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.custo_aquisicao}
                onChange={(e) => setFormData({...formData, custo_aquisicao: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Preço Venda</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.preco_venda}
                onChange={(e) => setFormData({...formData, preco_venda: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Margem (%)</Label>
              <Input
                type="number"
                value={formData.custo_aquisicao > 0 ? (((formData.preco_venda - formData.custo_aquisicao) / formData.custo_aquisicao) * 100).toFixed(2) : 0}
                disabled
                className="bg-slate-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 6: Fiscal */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>NCM</Label>
          <Input
            value={formData.ncm}
            onChange={(e) => setFormData({...formData, ncm: e.target.value})}
            placeholder="0000.00.00"
            maxLength={10}
          />
        </div>

        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Descontinuado">Descontinuado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SUBMIT */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {produto ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>

      {/* V22.0: RESUMO FINAL */}
      {formData.eh_bitola && calculoConversao && (
        <Alert className="border-purple-300 bg-purple-100">
          <AlertDescription>
            <p className="font-semibold text-sm text-purple-900 mb-2">🎯 Resumo da Configuração:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-800">
              <p>✅ Produto: <strong>{formData.descricao || 'Não informado'}</strong></p>
              <p>✅ Unidade Principal: <strong>{formData.unidade_principal}</strong></p>
              <p>✅ Venda/Compra em: <strong>{(formData.unidades_secundarias || []).join(', ')}</strong></p>
              <p>✅ Estoque sempre em: <strong>KG</strong></p>
              <p>✅ 1 Peça = <strong>{calculoConversao.kg_por_peca.toFixed(2)} KG</strong></p>
              <p>✅ 1 Metro = <strong>{calculoConversao.kg_por_metro.toFixed(3)} KG</strong></p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}