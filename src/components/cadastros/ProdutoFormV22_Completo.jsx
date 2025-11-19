import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Sparkles, Package, Upload, Calculator, 
  CheckCircle2, AlertTriangle, FileText, Globe, 
  TrendingUp, ArrowRightLeft, ShoppingCart, Image
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";
import HistoricoProduto from "./HistoricoProduto";

/**
 * V21.1.2-R2 - CADASTRO COMPLETO DE PRODUTOS COM ABAS
 * ✅ Aba 1: Dados Gerais (identificação, bitola, precificação)
 * ✅ Aba 2: Conversões (unidades, fatores)
 * ✅ Aba 3: Dimensões & Peso (frete/e-commerce)
 * ✅ Aba 4: E-Commerce & IA
 * ✅ Aba 5: Histórico (se edição)
 * ✅ Modo Manual vs IA
 */
export default function ProdutoFormV22_Completo({ produto, onSubmit, isSubmitting, windowMode = false }) {
  const [abaAtiva, setAbaAtiva] = useState('dados-gerais');
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load current user:", error);
        // Optionally handle error, e.g., redirect to login or show a message
      }
    };
    loadUser();
  }, []);

  const [formData, setFormData] = useState(() => {
    if (produto) {
      return {
        ...produto,
        unidades_secundarias: produto.unidades_secundarias || ['KG'],
        fatores_conversao: produto.fatores_conversao || {
          kg_por_peca: 0,
          kg_por_metro: 0,
          metros_por_peca: 0,
          peca_por_ton: 0,
          kg_por_ton: 1000
        },
        peso_liquido_kg: produto.peso_liquido_kg || 0,
        peso_bruto_kg: produto.peso_bruto_kg || 0,
        altura_cm: produto.altura_cm || 0,
        largura_cm: produto.largura_cm || 0,
        comprimento_cm: produto.comprimento_cm || 0
      };
    }
    
    return {
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
      foto_produto_url: '',
      custo_aquisicao: 0,
      preco_venda: 0,
      estoque_minimo: 0,
      ncm: '',
      cest: '',
      unidade_medida: '',
      status: 'Ativo',
      peso_liquido_kg: 0,
      peso_bruto_kg: 0,
      altura_cm: 0,
      largura_cm: 0,
      comprimento_cm: 0,
      exibir_no_site: false,
      exibir_no_marketplace: false
    };
  });

  const [iaSugestao, setIaSugestao] = useState(null);
  const [processandoIA, setProcessandoIA] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [calculoConversao, setCalculoConversao] = useState(null);
  const [sugestoesIA, setSugestoesIA] = useState({});
  const [modoManual, setModoManual] = useState(false);
  const [gerandoDescricaoSEO, setGerandoDescricaoSEO] = useState(false);
  const [gerandoImagem, setGerandoImagem] = useState(false);

  useEffect(() => {
    if (formData.eh_bitola) {
      recalcularFatoresConversao();
    }
  }, [formData.peso_teorico_kg_m, formData.comprimento_barra_padrao_m, formData.eh_bitola]);

  useEffect(() => {
    if (formData.altura_cm > 0 && formData.largura_cm > 0 && formData.comprimento_cm > 0) {
      const volume_m3 = (formData.altura_cm * formData.largura_cm * formData.comprimento_cm) / 1000000;
      setFormData(prev => ({ ...prev, volume_m3 }));
    }
  }, [formData.altura_cm, formData.largura_cm, formData.comprimento_cm]);

  const recalcularFatoresConversao = () => {
    const pesoKgM = formData.peso_teorico_kg_m || 0;
    const comprimentoM = formData.comprimento_barra_padrao_m || 12;
    
    const kgPorPeca = pesoKgM * comprimentoM;
    const pecaPorTon = kgPorPeca > 0 ? (1000 / kgPorPeca) : 0;
    
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
- unidades_secundarias: ["PÇ", "KG", "MT"]
- confianca: número de 0-100 indicando confiança

Caso contrário, sugira:
- grupo_produto adequado
- ncm provável
- unidade_principal e unidades_secundarias apropriadas
- confianca: número de 0-100`,
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
            confianca: { type: "number" },
            explicacao: { type: "string" }
          }
        }
      });

      setIaSugestao(resultado);
      setSugestoesIA(prev => ({
        ...prev,
        classificacao_confianca: resultado.confianca
      }));
      toast.success('✨ IA analisou o produto!');
    } catch (error) {
      toast.error('Erro ao processar IA');
    } finally {
      setProcessandoIA(false);
    }
  };

  const aplicarSugestaoIA = () => {
    if (!iaSugestao || modoManual) return;
    
    setFormData(prev => ({
      ...prev,
      eh_bitola: iaSugestao.eh_bitola || false,
      peso_teorico_kg_m: iaSugestao.peso_teorico_kg_m || 0,
      bitola_diametro_mm: iaSugestao.bitola_diametro_mm || 0,
      tipo_aco: iaSugestao.tipo_aco || 'CA-50',
      ncm: iaSugestao.ncm || '',
      grupo: iaSugestao.grupo_produto || prev.grupo,
      comprimento_barra_padrao_m: iaSugestao.comprimento_barra_m || 12,
      unidade_principal: iaSugestao.unidade_principal || 'KG',
      unidades_secundarias: iaSugestao.unidades_secundarias || ['KG']
    }));
    
    toast.success('✅ Sugestões aplicadas!');
    setIaSugestao(null);
  };

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

  const toggleUnidadeSecundaria = (unidade) => {
    const unidades = formData.unidades_secundarias || [];
    if (unidades.includes(unidade)) {
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
  };

  const handleDadosNCM = (dados) => {
    setFormData((prev) => ({
      ...prev,
      unidade_medida: dados.unidade || prev.unidade_medida,
      cest: dados.cest || prev.cest
    }));

    setSugestoesIA((prev) => ({
      ...prev,
      ncm_info: `${dados.descricao}${dados.obs ? ' - ' + dados.obs : ''}`,
      aliquotas: dados
    }));

    toast.success("NCM encontrado!", { description: dados.descricao });
  };

  const gerarDescricaoSEO = async () => {
    if (!formData.descricao) {
      toast.error("Preencha a descrição básica primeiro");
      return;
    }

    setGerandoDescricaoSEO(true);

    try {
      const descricaoSEO = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista em SEO para e-commerce. 
        
        Crie uma descrição detalhada e otimizada para SEO para este produto: "${formData.descricao}"
        
        NCM: ${formData.ncm || 'Não informado'}
        Grupo: ${formData.grupo || 'Não informado'}
        É bitola: ${formData.eh_bitola ? 'Sim' : 'Não'}
        
        A descrição deve:
        - Ter 150-250 palavras
        - Incluir palavras-chave relevantes
        - Destacar benefícios e aplicações
        - Ser atrativa para vendas online
        - Incluir especificações técnicas se houver
        
        Retorne apenas o texto da descrição.`
      });

      setFormData(prev => ({
        ...prev,
        descricao_seo: descricaoSEO
      }));

      toast.success("✅ Descrição SEO gerada!");
    } catch (error) {
      toast.error("Erro ao gerar descrição");
    } finally {
      setGerandoDescricaoSEO(false);
    }
  };

  const gerarImagemIA = async () => {
    if (!formData.descricao) {
      toast.error("Preencha a descrição do produto primeiro");
      return;
    }

    setGerandoImagem(true);

    try {
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: `Product photography of ${formData.descricao}, professional lighting, white background, high quality, detailed, 4k`
      });

      setFormData(prev => ({
        ...prev,
        foto_produto_url: url
      }));

      toast.success("✅ Imagem gerada pela IA!");
    } catch (error) {
      toast.error("Erro ao gerar imagem");
    } finally {
      setGerandoImagem(false);
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

    const dadosSubmit = {
      ...formData,
      unidade_medida: formData.unidade_principal || 'KG',
      empresa_id: user?.empresa_selecionada_id || user?.empresa_id || '1'
    };

    onSubmit(dadosSubmit);
  };

  const content = (
    <form onSubmit={handleSubmit} className={`space-y-6 ${windowMode ? 'h-full overflow-auto p-6' : 'max-h-[75vh] overflow-auto p-6'}`}>
      {/* TOGGLE MODO MANUAL */}
      <Alert className="border-blue-300 bg-blue-50">
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-blue-900">🤖 Assistência de IA</p>
              <p className="text-xs text-blue-700">A IA pode sugerir NCM, grupo, bitola e unidades automaticamente</p>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm">Preencher manualmente</Label>
              <Switch
                checked={modoManual}
                onCheckedChange={setModoManual}
              />
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* ABAS DO FORMULÁRIO */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-5 w-full bg-slate-100">
          <TabsTrigger value="dados-gerais">
            <Package className="w-4 h-4 mr-2" />
            Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="conversoes">
            <Calculator className="w-4 h-4 mr-2" />
            Conversões
          </TabsTrigger>
          <TabsTrigger value="dimensoes">
            <Package className="w-4 h-4 mr-2" />
            Peso/Dim
          </TabsTrigger>
          <TabsTrigger value="ecommerce">
            <Globe className="w-4 h-4 mr-2" />
            E-Commerce
          </TabsTrigger>
          {produto && (
            <TabsTrigger value="historico">
              <TrendingUp className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          )}
        </TabsList>

        {/* ABA 1: DADOS GERAIS */}
        <TabsContent value="dados-gerais" className="space-y-6">
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
                    onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))}
                    placeholder="Ex: Vergalhão 8mm 12m CA-50"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => analisarDescricaoIA(formData.descricao)}
                    disabled={processandoIA || modoManual}
                  >
                    {processandoIA ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">✨ IA preenche automaticamente NCM, peso e unidades</p>
              </div>

              {iaSugestao && !modoManual && (
                <Alert className="border-purple-300 bg-purple-100">
                  <AlertDescription>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm text-purple-900 mb-1">🤖 IA Classificou:</p>
                        <p className="text-xs text-purple-800">{iaSugestao.explicacao}</p>
                        {iaSugestao.confianca && (
                          <Badge className="mt-2 bg-purple-600 text-white">
                            Confiança: {iaSugestao.confianca}%
                          </Badge>
                        )}
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
                    onChange={(e) => setFormData(prev => ({...prev, codigo: e.target.value}))}
                    placeholder="SKU-001"
                  />
                </div>

                <div>
                  <Label>Tipo de Item</Label>
                  <Select value={formData.tipo_item} onValueChange={(v) => setFormData(prev => ({...prev, tipo_item: v}))}>
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

              <div>
                <Label>Foto do Produto</Label>
                <div className="flex items-center gap-4">
                  {formData.foto_produto_url && (
                    <img src={formData.foto_produto_url} alt="Produto" className="w-20 h-20 object-cover rounded border" />
                  )}
                  <div className="flex-1 flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFoto}
                      className="hidden"
                      id="foto-upload"
                    />
                    <label htmlFor="foto-upload" className="flex-1">
                      <Button type="button" variant="outline" size="sm" disabled={uploadingFoto} className="w-full" asChild>
                        <span>
                          {uploadingFoto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                          {formData.foto_produto_url ? 'Alterar' : 'Upload'}
                        </span>
                      </Button>
                    </label>
                    {!modoManual && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={gerarImagemIA}
                        disabled={gerandoImagem}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {gerandoImagem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* É BITOLA? */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-dashed">
            <div>
              <Label className="text-base font-semibold">É uma Bitola de Aço?</Label>
              <p className="text-xs text-slate-500">Habilita campos específicos e conversão PÇ ↔ KG ↔ MT</p>
            </div>
            <Switch
              checked={formData.eh_bitola}
              onCheckedChange={(v) => {
                setFormData(prev => ({...prev, eh_bitola: v}));
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

          {/* CAMPOS DE BITOLA */}
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
                      onChange={(e) => setFormData(prev => ({...prev, bitola_diametro_mm: parseFloat(e.target.value) || 0}))}
                      placeholder="8.0"
                    />
                  </div>

                  <div>
                    <Label>Peso Teórico (kg/m) *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.peso_teorico_kg_m}
                      onChange={(e) => setFormData(prev => ({...prev, peso_teorico_kg_m: parseFloat(e.target.value) || 0}))}
                      placeholder="0.395"
                    />
                  </div>

                  <div>
                    <Label>Tipo de Aço</Label>
                    <Select value={formData.tipo_aco} onValueChange={(v) => setFormData(prev => ({...prev, tipo_aco: v}))}>
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
                      onChange={(e) => setFormData(prev => ({...prev, comprimento_barra_padrao_m: parseFloat(e.target.value) || 12}))}
                      placeholder="12"
                    />
                  </div>
                </div>

                {calculoConversao && (
                  <Alert className="border-green-300 bg-green-50">
                    <Calculator className="w-4 h-4 text-green-700" />
                    <AlertDescription>
                      <p className="font-semibold text-sm text-green-900 mb-2">✅ Conversões Calculadas:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                        <p>• 1 PÇ = <strong>{calculoConversao.kg_por_peca.toFixed(2)} KG</strong></p>
                        <p>• 1 MT = <strong>{calculoConversao.kg_por_metro.toFixed(3)} KG</strong></p>
                        <p>• 1 TON = <strong>{calculoConversao.peca_por_ton.toFixed(1)} PÇ</strong></p>
                        <p>• 1 PÇ = <strong>{calculoConversao.metros_por_peca} MT</strong></p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* PRECIFICAÇÃO */}
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
                    onChange={(e) => setFormData(prev => ({...prev, custo_aquisicao: parseFloat(e.target.value) || 0}))}
                  />
                </div>

                <div>
                  <Label>Preço Venda</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.preco_venda}
                    onChange={(e) => setFormData(prev => ({...prev, preco_venda: parseFloat(e.target.value) || 0}))}
                  />
                </div>

                <div>
                  <Label>Margem (%)</Label>
                  <Input
                    type="number"
                    value={formData.custo_aquisicao > 0 ? (((formData.preco_venda - formData.custo_aquisicao) / formData.custo_aquisicao) * 100).toFixed(2) : 0}
                    disabled
                    className="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FISCAL */}
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Configuração Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <Label>NCM (Código Fiscal)</Label>
                  <Input
                    value={formData.ncm || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, ncm: e.target.value }))}
                    placeholder="00000000"
                    maxLength={8}
                  />
                  {sugestoesIA.ncm_info && (
                    <p className="text-xs text-blue-600 mt-1">ℹ️ {sugestoesIA.ncm_info}</p>
                  )}
                </div>

                <div>
                  <BotaoBuscaAutomatica
                    tipo="ncm"
                    valor={formData.ncm}
                    onDadosEncontrados={handleDadosNCM}
                    disabled={!formData.ncm || formData.ncm.length !== 8}
                  >
                    Buscar NCM
                  </BotaoBuscaAutomatica>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CEST</Label>
                  <Input
                    value={formData.cest || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, cest: e.target.value }))}
                    placeholder="00.000.00"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({...prev, status: v}))}>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: CONVERSÕES */}
        <TabsContent value="conversoes" className="space-y-6">
          <Card className="border-indigo-300 bg-indigo-50">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-indigo-900">V22.0: Unidades e Conversões</h3>

              <Alert className="border-indigo-400 bg-indigo-100">
                <AlertDescription className="text-sm text-indigo-900">
                  🎯 <strong>REGRA MESTRE:</strong> As unidades selecionadas aqui estarão disponíveis em Vendas, Compras e Movimentações
                </AlertDescription>
              </Alert>

              <div>
                <Label>Unidade Principal (Relatórios)</Label>
                <Select value={formData.unidade_principal} onValueChange={(v) => setFormData(prev => ({...prev, unidade_principal: v}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UN">Unidade (UN)</SelectItem>
                    <SelectItem value="PÇ">Peça (PÇ)</SelectItem>
                    <SelectItem value="KG">Quilograma (KG)</SelectItem>
                    <SelectItem value="MT">Metro (MT)</SelectItem>
                    <SelectItem value="TON">Tonelada (TON)</SelectItem>
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
              </div>

              {calculoConversao && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm text-green-900 mb-3">✅ Fatores de Conversão</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <p>1 PÇ = {calculoConversao.kg_por_peca.toFixed(2)} KG</p>
                      <p>1 MT = {calculoConversao.kg_por_metro.toFixed(3)} KG</p>
                      <p>1 TON = {calculoConversao.peca_por_ton.toFixed(1)} PÇ</p>
                      <p>1 PÇ = {calculoConversao.metros_por_peca} MT</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: DIMENSÕES E PESO */}
        <TabsContent value="dimensoes" className="space-y-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-orange-900">📦 Peso e Dimensões (Logística)</h3>

              <Alert className="border-orange-300 bg-orange-100">
                <AlertDescription className="text-xs text-orange-900">
                  <strong>Usado em:</strong> Cálculo de frete, cubagem, marketplace, Portal
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Peso Líquido (kg)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.peso_liquido_kg}
                    onChange={(e) => setFormData(prev => ({...prev, peso_liquido_kg: parseFloat(e.target.value) || 0}))}
                  />
                </div>

                <div>
                  <Label>Peso Bruto (kg)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.peso_bruto_kg}
                    onChange={(e) => setFormData(prev => ({...prev, peso_bruto_kg: parseFloat(e.target.value) || 0}))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Altura (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.altura_cm}
                    onChange={(e) => setFormData(prev => ({...prev, altura_cm: parseFloat(e.target.value) || 0}))}
                  />
                </div>

                <div>
                  <Label>Largura (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.largura_cm}
                    onChange={(e) => setFormData(prev => ({...prev, largura_cm: parseFloat(e.target.value) || 0}))}
                  />
                </div>

                <div>
                  <Label>Comprimento (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.comprimento_cm}
                    onChange={(e) => setFormData(prev => ({...prev, comprimento_cm: parseFloat(e.target.value) || 0}))}
                  />
                </div>

                <div>
                  <Label>Volume (m³)</Label>
                  <Input
                    type="number"
                    value={formData.volume_m3?.toFixed(6) || 0}
                    disabled
                    className="bg-white"
                  />
                </div>
              </div>

              {formData.volume_m3 > 0 && (
                <Alert className="border-green-300 bg-green-50">
                  <AlertDescription className="text-xs text-green-900">
                    ✅ Cubagem: {formData.volume_m3.toFixed(6)} m³
                    {formData.peso_bruto_kg > 0 && ` • Peso taxado: ${Math.max(formData.peso_bruto_kg, formData.volume_m3 * 300).toFixed(2)} kg`}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: E-COMMERCE */}
        <TabsContent value="ecommerce" className="space-y-6">
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-purple-900">🛒 Canais de Venda</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <Label className="text-base font-semibold">Exibir no Site</Label>
                    <p className="text-xs text-slate-500">Produto aparecerá no catálogo web</p>
                  </div>
                  <Switch
                    checked={formData.exibir_no_site || false}
                    onCheckedChange={(v) => setFormData(prev => ({...prev, exibir_no_site: v}))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <Label className="text-base font-semibold">Sincronizar Marketplace</Label>
                    <p className="text-xs text-slate-500">Mercado Livre, Shopee</p>
                  </div>
                  <Switch
                    checked={formData.exibir_no_marketplace || false}
                    onCheckedChange={(v) => setFormData(prev => ({...prev, exibir_no_marketplace: v}))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {(formData.exibir_no_site || formData.exibir_no_marketplace) && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-green-900">📝 Descrição SEO</h3>
                  <Button
                    type="button"
                    size="sm"
                    onClick={gerarDescricaoSEO}
                    disabled={gerandoDescricaoSEO || modoManual}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {gerandoDescricaoSEO ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Gerar com IA
                  </Button>
                </div>

                <Textarea
                  value={formData.descricao_seo || ''}
                  onChange={(e) => setFormData(prev => ({...prev, descricao_seo: e.target.value}))}
                  placeholder="Descrição detalhada para SEO..."
                  className="min-h-[100px]"
                />

                <div>
                  <Label>URL Amigável (Slug)</Label>
                  <Input
                    value={formData.slug_site || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      slug_site: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                    }))}
                    placeholder="vergalhao-8mm-ca50"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ABA 5: HISTÓRICO */}
        {produto && (
          <TabsContent value="historico">
            <HistoricoProduto produtoId={produto.id} produto={produto} />
          </TabsContent>
        )}
      </Tabs>

      {/* BOTÃO SUBMIT */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 px-8">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {produto ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}