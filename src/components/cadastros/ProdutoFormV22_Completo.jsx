import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Sparkles, Package, Upload, Calculator, 
  CheckCircle2, FileText, Globe, TrendingUp
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";
import HistoricoProduto from "./HistoricoProduto";

/**
 * V21.1.2-R2 - CADASTRO COMPLETO DE PRODUTOS COM ABAS
 */
export default function ProdutoFormV22_Completo({ produto, onSubmit, isSubmitting }) {
  const [abaAtiva, setAbaAtiva] = useState('dados-gerais');
  const [formData, setFormData] = useState(() => {
    if (produto) {
      return {
        ...produto,
        unidades_secundarias: produto.unidades_secundarias || ['KG'],
        fatores_conversao: produto.fatores_conversao || {},
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
      unidade_principal: 'UN',
      unidades_secundarias: ['UN'],
      unidade_medida: 'UN',
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
    if (formData.eh_bitola && formData.peso_teorico_kg_m > 0) {
      recalcularFatoresConversao();
    }
  }, [formData.peso_teorico_kg_m, formData.comprimento_barra_padrao_m]);

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
        prompt: `Analise: "${descricao}". Se for bitola de aço, retorne eh_bitola=true, peso_teorico_kg_m (tabela ABNT: 8mm=0.395, 10mm=0.617, 12.5mm=0.963, 16mm=1.578), bitola_diametro_mm, tipo_aco (CA-50), ncm="7214.20.00", grupo_produto="Bitola", unidade_principal="KG", unidades_secundarias=["PÇ","KG","MT"]. Senão, sugira grupo_produto, ncm, unidade_principal e unidades_secundarias apropriadas.`,
        response_json_schema: {
          type: "object",
          properties: {
            eh_bitola: { type: "boolean" },
            peso_teorico_kg_m: { type: "number" },
            bitola_diametro_mm: { type: "number" },
            tipo_aco: { type: "string" },
            ncm: { type: "string" },
            grupo_produto: { type: "string" },
            unidade_principal: { type: "string" },
            unidades_secundarias: { type: "array", items: { type: "string" } },
            confianca: { type: "number" },
            explicacao: { type: "string" }
          }
        }
      });

      setIaSugestao(resultado);
      toast.success('✨ IA analisou o produto!');
    } catch (error) {
      toast.error('Erro na IA');
    } finally {
      setProcessandoIA(false);
    }
  };

  const aplicarSugestaoIA = () => {
    if (!iaSugestao) return;
    
    setFormData(prev => ({
      ...prev,
      eh_bitola: iaSugestao.eh_bitola || false,
      peso_teorico_kg_m: iaSugestao.peso_teorico_kg_m || 0,
      bitola_diametro_mm: iaSugestao.bitola_diametro_mm || 0,
      tipo_aco: iaSugestao.tipo_aco || 'CA-50',
      ncm: iaSugestao.ncm || '',
      grupo: iaSugestao.grupo_produto || prev.grupo,
      comprimento_barra_padrao_m: 12,
      unidade_principal: iaSugestao.unidade_principal || 'UN',
      unidades_secundarias: iaSugestao.unidades_secundarias || ['UN'],
      unidade_medida: iaSugestao.unidade_principal || 'UN'
    }));
    
    toast.success('✅ Aplicado!');
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
      ncm_info: `${dados.descricao}${dados.obs ? ' - ' + dados.obs : ''}`
    }));

    toast.success("NCM encontrado!");
  };

  const gerarDescricaoSEO = async () => {
    if (!formData.descricao) {
      toast.error("Preencha a descrição");
      return;
    }

    setGerandoDescricaoSEO(true);

    try {
      const descricaoSEO = await base44.integrations.Core.InvokeLLM({
        prompt: `Crie descrição SEO otimizada (150-250 palavras) para: "${formData.descricao}". Inclua palavras-chave, benefícios e especificações técnicas.`
      });

      setFormData(prev => ({ ...prev, descricao_seo: descricaoSEO }));
      toast.success("✅ Descrição SEO gerada!");
    } catch (error) {
      toast.error("Erro ao gerar descrição");
    } finally {
      setGerandoDescricaoSEO(false);
    }
  };

  const gerarImagemIA = async () => {
    if (!formData.descricao) {
      toast.error("Preencha a descrição");
      return;
    }

    setGerandoImagem(true);

    try {
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: `Product photography of ${formData.descricao}, professional, white background, 4k`
      });

      setFormData(prev => ({ ...prev, foto_produto_url: url }));
      toast.success("✅ Imagem gerada!");
    } catch (error) {
      toast.error("Erro ao gerar imagem");
    } finally {
      setGerandoImagem(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.descricao) {
      toast.error('Preencha a descrição');
      return;
    }

    if (!formData.unidades_secundarias || formData.unidades_secundarias.length === 0) {
      toast.error('Selecione pelo menos 1 unidade');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-auto p-6">
      <Alert className="border-blue-300 bg-blue-50">
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-blue-900">🤖 Assistência de IA</p>
              <p className="text-xs text-blue-700">IA sugere NCM, grupo e unidades automaticamente</p>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm">Modo Manual</Label>
              <Switch checked={modoManual} onCheckedChange={setModoManual} />
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="dados-gerais">
            <Package className="w-4 h-4 mr-2" />
            Dados
          </TabsTrigger>
          <TabsTrigger value="conversoes">
            <Calculator className="w-4 h-4 mr-2" />
            Conversões
          </TabsTrigger>
          <TabsTrigger value="dimensoes">
            <Package className="w-4 h-4 mr-2" />
            Dimensões
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

        <TabsContent value="dados-gerais" className="space-y-4">
          <div>
            <Label>Descrição *</Label>
            <div className="flex gap-2">
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))}
                placeholder="Ex: Vergalhão 8mm CA-50"
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
          </div>

          {iaSugestao && !modoManual && (
            <Alert className="border-purple-300 bg-purple-100">
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">🤖 {iaSugestao.explicacao}</p>
                    {iaSugestao.confianca && <Badge className="mt-2">Confiança: {iaSugestao.confianca}%</Badge>}
                  </div>
                  <Button size="sm" onClick={aplicarSugestaoIA}>Aplicar</Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código/SKU</Label>
              <Input value={formData.codigo} onChange={(e) => setFormData(prev => ({...prev, codigo: e.target.value}))} />
            </div>
            <div>
              <Label>Grupo</Label>
              <Select value={formData.grupo} onValueChange={(v) => setFormData(prev => ({...prev, grupo: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bitola">Bitola</SelectItem>
                  <SelectItem value="Matéria Prima">Matéria Prima</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded border">
            <Label>É Bitola de Aço?</Label>
            <Switch
              checked={formData.eh_bitola}
              onCheckedChange={(v) => {
                setFormData(prev => ({
                  ...prev, 
                  eh_bitola: v,
                  unidade_principal: v ? 'KG' : 'UN',
                  unidades_secundarias: v ? ['PÇ', 'KG', 'MT'] : ['UN'],
                  unidade_medida: v ? 'KG' : 'UN'
                }));
              }}
            />
          </div>

          {formData.eh_bitola && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-bold">📏 Especificações Bitola</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Diâmetro (mm)</Label>
                    <Input type="number" step="0.1" value={formData.bitola_diametro_mm} onChange={(e) => setFormData(prev => ({...prev, bitola_diametro_mm: parseFloat(e.target.value) || 0}))} />
                  </div>
                  <div>
                    <Label>Peso (kg/m)</Label>
                    <Input type="number" step="0.001" value={formData.peso_teorico_kg_m} onChange={(e) => setFormData(prev => ({...prev, peso_teorico_kg_m: parseFloat(e.target.value) || 0}))} />
                  </div>
                  <div>
                    <Label>Tipo Aço</Label>
                    <Select value={formData.tipo_aco} onValueChange={(v) => setFormData(prev => ({...prev, tipo_aco: v}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA-25">CA-25</SelectItem>
                        <SelectItem value="CA-50">CA-50</SelectItem>
                        <SelectItem value="CA-60">CA-60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {calculoConversao && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-xs">
                      ✅ 1 PÇ = {calculoConversao.kg_por_peca.toFixed(2)} KG • 1 MT = {calculoConversao.kg_por_metro.toFixed(3)} KG
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Custo</Label>
              <Input type="number" step="0.01" value={formData.custo_aquisicao} onChange={(e) => setFormData(prev => ({...prev, custo_aquisicao: parseFloat(e.target.value) || 0}))} />
            </div>
            <div>
              <Label>Preço</Label>
              <Input type="number" step="0.01" value={formData.preco_venda} onChange={(e) => setFormData(prev => ({...prev, preco_venda: parseFloat(e.target.value) || 0}))} />
            </div>
            <div>
              <Label>NCM</Label>
              <Input value={formData.ncm} onChange={(e) => setFormData(prev => ({...prev, ncm: e.target.value}))} maxLength={8} />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({...prev, status: v}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="conversoes" className="space-y-4">
          <div>
            <Label>Unidade Principal</Label>
            <Select value={formData.unidade_principal} onValueChange={(v) => setFormData(prev => ({...prev, unidade_principal: v}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UN">UN</SelectItem>
                <SelectItem value="PÇ">PÇ</SelectItem>
                <SelectItem value="KG">KG</SelectItem>
                <SelectItem value="MT">MT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Unidades Habilitadas *</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded bg-white">
              {['UN', 'PÇ', 'KG', 'MT', 'TON'].map(u => (
                <Badge
                  key={u}
                  className={`cursor-pointer ${(formData.unidades_secundarias || []).includes(u) ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}
                  onClick={() => toggleUnidadeSecundaria(u)}
                >
                  {(formData.unidades_secundarias || []).includes(u) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {u}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dimensoes" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Peso Líquido (kg)</Label>
              <Input type="number" step="0.001" value={formData.peso_liquido_kg} onChange={(e) => setFormData(prev => ({...prev, peso_liquido_kg: parseFloat(e.target.value) || 0}))} />
            </div>
            <div>
              <Label>Peso Bruto (kg)</Label>
              <Input type="number" step="0.001" value={formData.peso_bruto_kg} onChange={(e) => setFormData(prev => ({...prev, peso_bruto_kg: parseFloat(e.target.value) || 0}))} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Altura (cm)</Label>
              <Input type="number" value={formData.altura_cm} onChange={(e) => setFormData(prev => ({...prev, altura_cm: parseFloat(e.target.value) || 0}))} />
            </div>
            <div>
              <Label>Largura (cm)</Label>
              <Input type="number" value={formData.largura_cm} onChange={(e) => setFormData(prev => ({...prev, largura_cm: parseFloat(e.target.value) || 0}))} />
            </div>
            <div>
              <Label>Comprimento (cm)</Label>
              <Input type="number" value={formData.comprimento_cm} onChange={(e) => setFormData(prev => ({...prev, comprimento_cm: parseFloat(e.target.value) || 0}))} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ecommerce" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white rounded border">
              <Label>Exibir no Site</Label>
              <Switch checked={formData.exibir_no_site || false} onCheckedChange={(v) => setFormData(prev => ({...prev, exibir_no_site: v}))} />
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded border">
              <Label>Marketplace</Label>
              <Switch checked={formData.exibir_no_marketplace || false} onCheckedChange={(v) => setFormData(prev => ({...prev, exibir_no_marketplace: v}))} />
            </div>
          </div>

          {(formData.exibir_no_site || formData.exibir_no_marketplace) && (
            <div>
              <div className="flex justify-between mb-2">
                <Label>Descrição SEO</Label>
                <Button type="button" size="sm" onClick={gerarDescricaoSEO} disabled={gerandoDescricaoSEO}>
                  {gerandoDescricaoSEO ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </Button>
              </div>
              <Textarea value={formData.descricao_seo || ''} onChange={(e) => setFormData(prev => ({...prev, descricao_seo: e.target.value}))} className="min-h-[100px]" />
            </div>
          )}
        </TabsContent>

        {produto && (
          <TabsContent value="historico">
            <HistoricoProduto produtoId={produto.id} produto={produto} />
          </TabsContent>
        )}
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {produto ? 'Atualizar' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );
}