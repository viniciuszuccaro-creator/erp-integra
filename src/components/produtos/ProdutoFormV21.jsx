import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, Sparkles, Loader2, Upload, Calculator, CheckCircle2, 
  FileText, Camera, Globe, History, Boxes
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useMultitarefa } from '../lib/useMultitarefa';

/**
 * V21.1.2 - FORMULÁRIO PRODUTO EM 9 ABAS
 * Modal 90vw, multitarefa, IA em cada etapa
 */
export default function ProdutoFormV21({ produto }) {
  const queryClient = useQueryClient();
  const { fecharJanela } = useMultitarefa();
  const [abaSelecionada, setAbaSelecionada] = useState('basico');
  const [processandoIA, setProcessandoIA] = useState(false);
  const [salvando, setSalvando] = useState(false);

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
    unidade_principal: 'KG',
    unidades_secundarias: ['KG'],
    fatores_conversao: {
      kg_por_peca: 0,
      kg_por_metro: 0,
      metros_por_peca: 0,
      peca_por_ton: 0,
      kg_por_ton: 1000
    },
    peso_liquido_kg: 0,
    peso_bruto_kg: 0,
    altura_cm: 0,
    largura_cm: 0,
    comprimento_cm: 0,
    volume_m3: 0,
    ncm: '',
    cest: '',
    origem_mercadoria: '0 - Nacional',
    custo_aquisicao: 0,
    preco_venda: 0,
    margem_minima_percentual: 10,
    status: 'Ativo',
    foto_produto_url: ''
  });

  const analisarDescricaoIA = async () => {
    if (!formData.descricao || formData.descricao.length < 5) {
      toast.error('Digite uma descrição para usar a IA');
      return;
    }

    setProcessandoIA(true);

    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta descrição de produto: "${formData.descricao}".

Se for uma bitola de aço (ex: "Barra 8mm 12m CA-50", "Vergalhão 10mm"), retorne:
- eh_bitola: true
- peso_teorico_kg_m: peso teórico em kg/m conforme NBR 7480
- bitola_diametro_mm: diâmetro em mm
- tipo_aco: CA-25, CA-50 ou CA-60
- ncm: "7214.20.00"
- grupo: "Bitola"
- unidades_secundarias: ["PÇ", "KG", "MT"]

Caso contrário, sugira:
- grupo adequado
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
            grupo: { type: "string" },
            unidade_principal: { type: "string" },
            unidades_secundarias: { type: "array", items: { type: "string" } },
            explicacao: { type: "string" }
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        eh_bitola: resultado.eh_bitola || false,
        peso_teorico_kg_m: resultado.peso_teorico_kg_m || 0,
        bitola_diametro_mm: resultado.bitola_diametro_mm || 0,
        tipo_aco: resultado.tipo_aco || 'CA-50',
        ncm: resultado.ncm || prev.ncm,
        grupo: resultado.grupo || prev.grupo,
        unidade_principal: resultado.unidade_principal || 'KG',
        unidades_secundarias: resultado.unidades_secundarias || ['KG']
      }));

      toast.success('✨ IA analisou: ' + resultado.explicacao);
    } catch (error) {
      toast.error('Erro ao processar IA');
    } finally {
      setProcessandoIA(false);
    }
  };

  const handleSalvar = async () => {
    if (!formData.descricao) {
      toast.error('Descrição é obrigatória');
      return;
    }

    setSalvando(true);

    try {
      if (produto?.id) {
        await base44.entities.Produto.update(produto.id, formData);
        toast.success('✅ Produto atualizado!');
      } else {
        await base44.entities.Produto.create(formData);
        toast.success('✅ Produto criado!');
      }

      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      fecharJanela(`produto-${produto?.id || 'novo'}`);
    } catch (error) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const uploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, foto_produto_url: file_url }));
      toast.success('✅ Foto carregada!');
    } catch (error) {
      toast.error('Erro no upload');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid grid-cols-5 lg:grid-cols-9 bg-slate-100">
          <TabsTrigger value="basico">📦 Básico</TabsTrigger>
          <TabsTrigger value="classificacao">🧱 Classificação</TabsTrigger>
          <TabsTrigger value="bitolas">📏 Bitolas</TabsTrigger>
          <TabsTrigger value="unidades">🔄 Unidades</TabsTrigger>
          <TabsTrigger value="fiscal">🧾 Fiscal</TabsTrigger>
          <TabsTrigger value="fotos">📸 Fotos</TabsTrigger>
          <TabsTrigger value="precos">💰 Preços</TabsTrigger>
          <TabsTrigger value="ecommerce">🛒 E-commerce</TabsTrigger>
          <TabsTrigger value="historico">📊 Histórico</TabsTrigger>
        </TabsList>

        {/* ABA 1: BÁSICO */}
        <TabsContent value="basico" className="space-y-4">
          <Card>
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Identificação do Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Descrição do Produto *</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Ex: Vergalhão 8mm 12m CA-50"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={analisarDescricaoIA}
                    disabled={processandoIA}
                    variant="outline"
                  >
                    {processandoIA ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">✨ IA preenche NCM, peso e unidades</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código/SKU</Label>
                  <Input
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="SKU-001"
                  />
                </div>

                <div>
                  <Label>Tipo de Item</Label>
                  <Select 
                    value={formData.tipo_item} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_item: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Revenda">Revenda</SelectItem>
                      <SelectItem value="Matéria-Prima Produção">Matéria-Prima</SelectItem>
                      <SelectItem value="Produto Acabado">Produto Acabado</SelectItem>
                      <SelectItem value="Consumo Interno">Consumo Interno</SelectItem>
                      <SelectItem value="Serviço">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição Longa (SEO)</Label>
                <Textarea
                  value={formData.observacoes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Descrição detalhada..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: CLASSIFICAÇÃO */}
        <TabsContent value="classificacao" className="space-y-4">
          <Card>
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                Classificação e Categorias
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Grupo</Label>
                  <Select value={formData.grupo} onValueChange={(v) => setFormData(prev => ({ ...prev, grupo: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bitola">Bitola</SelectItem>
                      <SelectItem value="Matéria Prima">Matéria Prima</SelectItem>
                      <SelectItem value="Produto Acabado">Produto Acabado</SelectItem>
                      <SelectItem value="Insumo">Insumo</SelectItem>
                      <SelectItem value="Ferramentas">Ferramentas</SelectItem>
                      <SelectItem value="EPIs">EPIs</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Subgrupo</Label>
                  <Input
                    value={formData.subgrupo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, subgrupo: e.target.value }))}
                    placeholder="Subcategoria"
                  />
                </div>
              </div>

              <div>
                <Label>É uma Bitola de Aço?</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Switch
                    checked={formData.eh_bitola}
                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, eh_bitola: v }))}
                  />
                  <span className="text-sm text-slate-600">
                    {formData.eh_bitola ? 'Sim - Habilita campos específicos' : 'Não'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: BITOLAS */}
        <TabsContent value="bitolas" className="space-y-4">
          {formData.eh_bitola ? (
            <Card className="border-blue-300 bg-blue-50">
              <CardHeader className="border-b">
                <CardTitle className="text-base">📏 Especificações da Bitola</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Diâmetro (mm) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.bitola_diametro_mm}
                      onChange={(e) => setFormData(prev => ({ ...prev, bitola_diametro_mm: parseFloat(e.target.value) || 0 }))}
                      placeholder="8.0"
                    />
                  </div>

                  <div>
                    <Label>Peso Teórico (kg/m) *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.peso_teorico_kg_m}
                      onChange={(e) => setFormData(prev => ({ ...prev, peso_teorico_kg_m: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.395"
                    />
                  </div>

                  <div>
                    <Label>Tipo de Aço</Label>
                    <Select value={formData.tipo_aco} onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_aco: v }))}>
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

                {formData.peso_teorico_kg_m > 0 && (
                  <Alert className="border-green-300 bg-green-50">
                    <Calculator className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-900">
                      <p className="font-semibold mb-1">✅ Conversões Calculadas:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <p>• 1 PÇ (12m) = <strong>{(formData.peso_teorico_kg_m * 12).toFixed(2)} KG</strong></p>
                        <p>• 1 MT = <strong>{formData.peso_teorico_kg_m.toFixed(3)} KG</strong></p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Alert className="border-slate-200">
              <AlertDescription className="text-sm">
                ℹ️ Esta aba está disponível apenas para bitolas de aço. Marque "É uma bitola" na aba Classificação.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* ABA 4: UNIDADES */}
        <TabsContent value="unidades" className="space-y-4">
          <Card>
            <CardHeader className="bg-indigo-50 border-b">
              <CardTitle className="text-base">🔄 Sistema de Conversão V22.0</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Alert className="border-indigo-300 bg-indigo-100">
                <AlertDescription className="text-sm text-indigo-900">
                  🎯 <strong>REGRA MESTRE:</strong> As unidades selecionadas aqui estarão disponíveis em Vendas, Compras e Movimentações
                </AlertDescription>
              </Alert>

              <div>
                <Label>Unidade Principal (Relatórios)</Label>
                <Select value={formData.unidade_principal} onValueChange={(v) => setFormData(prev => ({ ...prev, unidade_principal: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UN">Unidade (UN)</SelectItem>
                    <SelectItem value="PÇ">Peça (PÇ)</SelectItem>
                    <SelectItem value="KG">Quilograma (KG)</SelectItem>
                    <SelectItem value="MT">Metro (MT)</SelectItem>
                    <SelectItem value="TON">Tonelada (TON)</SelectItem>
                    <SelectItem value="LT">Litro (LT)</SelectItem>
                    <SelectItem value="CX">Caixa (CX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Unidades Habilitadas (Multi-Select)</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white mt-2">
                  {['UN', 'PÇ', 'KG', 'MT', 'TON', 'LT', 'CX', 'BARRA'].map(unidade => {
                    const selecionada = (formData.unidades_secundarias || []).includes(unidade);
                    return (
                      <Badge
                        key={unidade}
                        className={`cursor-pointer transition-all ${
                          selecionada ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        onClick={() => {
                          const unidades = formData.unidades_secundarias || [];
                          if (selecionada) {
                            setFormData(prev => ({
                              ...prev,
                              unidades_secundarias: unidades.filter(u => u !== unidade)
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              unidades_secundarias: [...unidades, unidade]
                            }));
                          }
                        }}
                      >
                        {selecionada && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {unidade}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 5: FISCAL */}
        <TabsContent value="fiscal" className="space-y-4">
          <Card>
            <CardHeader className="bg-orange-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                Configuração Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>NCM</Label>
                  <Input
                    value={formData.ncm || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, ncm: e.target.value }))}
                    placeholder="00000000"
                    maxLength={8}
                  />
                </div>

                <div>
                  <Label>CEST</Label>
                  <Input
                    value={formData.cest || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cest: e.target.value }))}
                    placeholder="00.000.00"
                  />
                </div>
              </div>

              <div>
                <Label>Origem da Mercadoria</Label>
                <Select 
                  value={formData.origem_mercadoria} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, origem_mercadoria: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0 - Nacional">0 - Nacional</SelectItem>
                    <SelectItem value="1 - Estrangeira Importação Direta">1 - Importação Direta</SelectItem>
                    <SelectItem value="2 - Estrangeira Mercado Interno">2 - Mercado Interno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 6: FOTOS */}
        <TabsContent value="fotos" className="space-y-4">
          <Card>
            <CardHeader className="bg-cyan-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-600" />
                Galeria de Imagens
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {formData.foto_produto_url && (
                <div className="flex justify-center">
                  <img 
                    src={formData.foto_produto_url} 
                    alt="Produto" 
                    className="max-w-xs h-auto rounded-lg border shadow-md"
                  />
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadFoto}
                  className="hidden"
                  id="foto-upload"
                />
                <label htmlFor="foto-upload">
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {formData.foto_produto_url ? 'Alterar Foto' : 'Upload Foto'}
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 7: PREÇOS */}
        <TabsContent value="precos" className="space-y-4">
          <Card>
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="text-base">💰 Precificação</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Custo Aquisição</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.custo_aquisicao}
                    onChange={(e) => setFormData(prev => ({ ...prev, custo_aquisicao: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <Label>Preço Venda</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.preco_venda}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco_venda: parseFloat(e.target.value) || 0 }))}
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

              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-xs text-green-900">
                  💡 Este é o preço base. Tabelas de preço podem aplicar descontos/acréscimos por cliente/canal
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 8: E-COMMERCE */}
        <TabsContent value="ecommerce" className="space-y-4">
          <Card>
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                E-commerce e Marketplace
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-semibold text-sm">Exibir no Site</p>
                  <p className="text-xs text-slate-500">Catálogo público do e-commerce</p>
                </div>
                <Switch
                  checked={formData.exibir_no_site || false}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, exibir_no_site: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-semibold text-sm">Sincronizar Marketplace</p>
                  <p className="text-xs text-slate-500">ML, Shopee, Amazon</p>
                </div>
                <Switch
                  checked={formData.exibir_no_marketplace || false}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, exibir_no_marketplace: v }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 9: HISTÓRICO */}
        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-5 h-5 text-slate-600" />
                Histórico e Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {produto?.id ? (
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Criado em: {new Date(produto.created_date).toLocaleString('pt-BR')}</p>
                  <p>Última atualização: {new Date(produto.updated_date).toLocaleString('pt-BR')}</p>
                  <p>Criado por: {produto.created_by}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Histórico disponível após salvar o produto
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FOOTER FIXO */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button 
          variant="outline" 
          onClick={() => fecharJanela(`produto-${produto?.id || 'novo'}`)}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSalvar} 
          disabled={salvando}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {salvando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {produto ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>
    </div>
  );
}