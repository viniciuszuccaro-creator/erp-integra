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
  TrendingUp, ArrowRightLeft, ShoppingCart, Image, Warehouse,
  Trash2, Power, PowerOff, Save
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";
import HistoricoProduto from "./HistoricoProduto";

/**
 * V21.4 ETAPA 2/3 COMPLETA - CADASTRO COMPLETO DE PRODUTOS
 * ✅ Aba 1: Dados Gerais + TRIPLA CLASSIFICAÇÃO (Setor + Grupo + Marca)
 * ✅ Aba 2: Conversões (unidades, fatores)
 * ✅ Aba 3: Dimensões & Peso (frete/e-commerce)
 * ✅ Aba 4: E-Commerce & IA
 * ✅ Aba 5: Fiscal e Contábil (NOVO)
 * ✅ Aba 6: Estoque Avançado (NOVO)
 * ✅ Aba 7: Histórico (se edição)
 */
export default function ProdutoFormV22_Completo({ produto, onSubmit, onSuccess, isSubmitting, windowMode = false, closeSelf }) {
  const [abaAtiva, setAbaAtiva] = useState('dados-gerais');
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load current user:", error);
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
        comprimento_cm: produto.comprimento_cm || 0,
        tributacao: produto.tributacao || {
          icms_cst: '',
          icms_aliquota: 0,
          pis_cst: '',
          pis_aliquota: 0,
          cofins_cst: '',
          cofins_aliquota: 0,
          ipi_cst: '',
          ipi_aliquota: 0
        },
        origem_mercadoria: produto.origem_mercadoria || '0 - Nacional',
        regime_tributario_produto: produto.regime_tributario_produto || 'Simples Nacional',
        cfop_padrao_compra: produto.cfop_padrao_compra || '',
        cfop_padrao_venda: produto.cfop_padrao_venda || '',
        conta_contabil_id: produto.conta_contabil_id || '',
        controla_lote: produto.controla_lote || false,
        controla_validade: produto.controla_validade || false,
        prazo_validade_dias: produto.prazo_validade_dias || 0,
        localizacao: produto.localizacao || '',
        almoxarifado_id: produto.almoxarifado_id || ''
      };
    }
    
    return {
      descricao: '',
      codigo: '',
      codigo_barras: '',
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
      margem_minima_percentual: 10,
      estoque_minimo: 0,
      estoque_maximo: 0,
      ponto_reposicao: 0,
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
      exibir_no_marketplace: false,
      origem_mercadoria: '0 - Nacional',
      regime_tributario_produto: 'Simples Nacional',
      tributacao: {
        icms_cst: '',
        icms_aliquota: 0,
        pis_cst: '',
        pis_aliquota: 0,
        cofins_cst: '',
        cofins_aliquota: 0,
        ipi_cst: '',
        ipi_aliquota: 0
      },
      cfop_padrao_compra: '',
      cfop_padrao_venda: '',
      conta_contabil_id: '',
      controla_lote: false,
      controla_validade: false,
      prazo_validade_dias: 0,
      localizacao: '',
      almoxarifado_id: ''
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

  // V21.2 FASE 2: Queries dos estruturantes
  const { data: setores = [] } = useQuery({
    queryKey: ['setores-atividade'],
    queryFn: () => base44.entities.SetorAtividade.list(),
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos-produto'],
    queryFn: () => base44.entities.GrupoProduto.list(),
  });

  const { data: marcas = [] } = useQuery({
    queryKey: ['marcas'],
    queryFn: () => base44.entities.Marca.list(),
  });

  const { data: locaisEstoque = [] } = useQuery({
    queryKey: ['locais-estoque'],
    queryFn: () => base44.entities.LocalEstoque.list(),
  });

  const { data: planoContas = [] } = useQuery({
    queryKey: ['plano-contas'],
    queryFn: () => base44.entities.PlanoDeContas.list(),
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.descricao) {
      toast.error('Preencha a descrição do produto');
      return;
    }

    // V21.2 FASE 2: Validação tripla classificação
    if (!formData.setor_atividade_id) {
      toast.error('Selecione o Setor de Atividade');
      setAbaAtiva('dados-gerais');
      return;
    }

    if (!formData.grupo_produto_id) {
      toast.error('Selecione o Grupo de Produto');
      setAbaAtiva('dados-gerais');
      return;
    }

    if (!formData.marca_id) {
      toast.error('Selecione a Marca');
      setAbaAtiva('dados-gerais');
      return;
    }

    if (!formData.unidades_secundarias || formData.unidades_secundarias.length === 0) {
      toast.error('Selecione pelo menos 1 unidade de venda/compra');
      setAbaAtiva('conversoes');
      return;
    }

    if (formData.eh_bitola && formData.peso_teorico_kg_m === 0) {
      toast.error('Bitolas precisam ter peso teórico preenchido');
      setAbaAtiva('dados-gerais');
      return;
    }

    const dadosSubmit = {
      ...formData,
      unidade_medida: formData.unidade_principal || 'KG',
      empresa_id: user?.empresa_selecionada_id || user?.empresa_id || '1',
      tributacao: {
        icms_cst: formData.tributacao.icms_cst || '',
        icms_aliquota: formData.tributacao.icms_aliquota || 0,
        pis_cst: formData.tributacao.pis_cst || '',
        pis_aliquota: formData.tributacao.pis_aliquota || 0,
        cofins_cst: formData.tributacao.cofins_cst || '',
        cofins_aliquota: formData.tributacao.cofins_aliquota || 0,
        ipi_cst: formData.tributacao.ipi_cst || '',
        ipi_aliquota: formData.tributacao.ipi_aliquota || 0
      }
    };

    // V21.6: Salvar direto via SDK + callback
    try {
      if (produto?.id) {
        await base44.entities.Produto.update(produto.id, dadosSubmit);
        toast.success('✅ Produto atualizado com sucesso!');
      } else {
        await base44.entities.Produto.create(dadosSubmit);
        toast.success('✅ Produto criado com sucesso!');
      }
      
      if (onSuccess) onSuccess();
      if (onSubmit) onSubmit(dadosSubmit);
      if (typeof closeSelf === 'function') closeSelf();
    } catch (error) {
      toast.error('❌ Erro ao salvar produto: ' + error.message);
    }
  };

  const handleExcluir = () => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${formData.descricao}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    if (onSubmit) {
      onSubmit({ ...formData, _action: 'delete' });
    }
  };

  const handleAlternarStatus = () => {
    const novoStatus = formData.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setFormData({ ...formData, status: novoStatus });
  };

  const totalAbas = 7; // SEMPRE 7 abas - ETAPA 4 COMPLETA

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

      {/* ABAS DO FORMULÁRIO - 7 ABAS ETAPA 4 */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-7 w-full bg-slate-100">
          <TabsTrigger value="dados-gerais">
            <Package className="w-4 h-4 mr-1" />
            Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="conversoes">
            <Calculator className="w-4 h-4 mr-1" />
            Conversões
          </TabsTrigger>
          <TabsTrigger value="dimensoes">
            <Package className="w-4 h-4 mr-1" />
            Peso/Dim
          </TabsTrigger>
          <TabsTrigger value="ecommerce">
            <Globe className="w-4 h-4 mr-1" />
            E-Commerce
          </TabsTrigger>
          <TabsTrigger value="fiscal-contabil">
            <FileText className="w-4 h-4 mr-1" />
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="estoque-avancado">
            <Warehouse className="w-4 h-4 mr-1" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="historico">
            <TrendingUp className="w-4 h-4 mr-1" />
            Histórico
          </TabsTrigger>
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

              {/* V21.2 FASE 2: TRIPLA CLASSIFICAÇÃO OBRIGATÓRIA */}
              <Alert className="border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong className="text-blue-900">FASE 2:</strong> Classificação tripla obrigatória para rastreabilidade total
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-indigo-600">🏭</span>
                    Setor de Atividade *
                  </Label>
                  <Select 
                    value={formData.setor_atividade_id} 
                    onValueChange={(v) => {
                      const setor = setores.find(s => s.id === v);
                      setFormData(prev => ({
                        ...prev, 
                        setor_atividade_id: v,
                        setor_atividade_nome: setor?.nome
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {setores.filter(s => s.ativo !== false).map(setor => (
                        <SelectItem key={setor.id} value={setor.id}>
                          {setor.icone} {setor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-cyan-600">📦</span>
                    Grupo de Produto *
                  </Label>
                  <Select 
                    value={formData.grupo_produto_id} 
                    onValueChange={(v) => {
                      const grupo = grupos.find(g => g.id === v);
                      setFormData(prev => ({
                        ...prev, 
                        grupo_produto_id: v,
                        grupo_produto_nome: grupo?.nome_grupo,
                        ncm: grupo?.ncm_padrao || prev.ncm,
                        margem_minima_percentual: grupo?.margem_sugerida || prev.margem_minima_percentual
                      }));
                      if (grupo?.ncm_padrao) {
                        toast.success(`✅ NCM herdado: ${grupo.ncm_padrao}`);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {grupos.filter(g => g.ativo !== false).map(grupo => (
                        <SelectItem key={grupo.id} value={grupo.id}>
                          {grupo.icone} {grupo.nome_grupo} ({grupo.codigo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-amber-600">🏆</span>
                    Marca *
                  </Label>
                  <Select 
                    value={formData.marca_id} 
                    onValueChange={(v) => {
                      const marca = marcas.find(m => m.id === v);
                      setFormData(prev => ({
                        ...prev, 
                        marca_id: v,
                        marca_nome: marca?.nome_marca
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {marcas.filter(m => m.ativo !== false).map(marca => (
                        <SelectItem key={marca.id} value={marca.id}>
                          {marca.pais_origem !== 'Brasil' && '🌍'} {marca.nome_marca}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.setor_atividade_nome && formData.grupo_produto_nome && formData.marca_nome && (
                <Alert className="border-green-300 bg-green-100">
                  <CheckCircle2 className="w-4 h-4 text-green-700" />
                  <AlertDescription className="text-sm text-green-900">
                    <strong>Classificação Completa:</strong> {formData.setor_atividade_nome} → {formData.grupo_produto_nome} → {formData.marca_nome}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Código/SKU</Label>
                  <Input
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({...prev, codigo: e.target.value}))}
                    placeholder="SKU-001"
                  />
                </div>

                <div>
                  <Label>Código de Barras</Label>
                  <Input
                    value={formData.codigo_barras}
                    onChange={(e) => setFormData(prev => ({...prev, codigo_barras: e.target.value}))}
                    placeholder="7891234567890"
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
                      <SelectItem value="Consumo Interno">Consumo Interno</SelectItem>
                      <SelectItem value="Serviço">Serviço</SelectItem>
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

                <div>
                  <Label>Margem Mínima (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.margem_minima_percentual}
                    onChange={(e) => setFormData(prev => ({...prev, margem_minima_percentual: parseFloat(e.target.value) || 0}))}
                  />
                  <p className="text-xs text-slate-500 mt-1">Usada na aprovação de descontos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STATUS */}
          <Card>
            <CardContent className="p-4">
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

        {/* ABA 5: FISCAL E CONTÁBIL */}
        <TabsContent value="fiscal-contabil" className="space-y-6">
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="bg-purple-100 border-b border-purple-200 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Configuração Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Origem da Mercadoria</Label>
                  <Select value={formData.origem_mercadoria} onValueChange={(v) => setFormData(prev => ({...prev, origem_mercadoria: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0 - Nacional">0 - Nacional</SelectItem>
                      <SelectItem value="1 - Estrangeira Importação Direta">1 - Estrangeira Importação Direta</SelectItem>
                      <SelectItem value="2 - Estrangeira Mercado Interno">2 - Estrangeira Mercado Interno</SelectItem>
                      <SelectItem value="3 - Nacional com Conteúdo Importado >40%">3 - Nacional com Conteúdo Importado {'>'}40%</SelectItem>
                      <SelectItem value="4 - Nacional por Proc. Prod. Básico">4 - Nacional por Proc. Prod. Básico</SelectItem>
                      <SelectItem value="5 - Nacional com Conteúdo Importado <=40%">5 - Nacional com Conteúdo Importado {'<'}=40%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Regime Tributário do Produto</Label>
                  <Select value={formData.regime_tributario_produto} onValueChange={(v) => setFormData(prev => ({...prev, regime_tributario_produto: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                      <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                      <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                  <Label>CFOP Padrão Venda</Label>
                  <Input
                    value={formData.cfop_padrao_venda || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, cfop_padrao_venda: e.target.value }))}
                    placeholder="5102"
                  />
                </div>
                <div>
                  <Label>CFOP Padrão Compra</Label>
                  <Input
                    value={formData.cfop_padrao_compra || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, cfop_padrao_compra: e.target.value }))}
                    placeholder="1102"
                  />
                </div>
              </div>

              <h4 className="font-bold text-slate-800 mt-6 mb-3 pt-4 border-t">Detalhes da Tributação</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>ICMS CST</Label>
                  <Input 
                    value={formData.tributacao?.icms_cst || ''} 
                    onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, icms_cst: e.target.value } }))} 
                    placeholder="00"
                  />
                </div>
                <div>
                  <Label>ICMS Alíquota (%)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.tributacao?.icms_aliquota || 0} 
                    onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, icms_aliquota: parseFloat(e.target.value) || 0 } }))} 
                  />
                </div>
                <div>
                  <Label>PIS CST</Label>
                  <Input 
                    value={formData.tributacao?.pis_cst || ''} 
                    onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, pis_cst: e.target.value } }))} 
                    placeholder="01"
                  />
                </div>
                <div>
                  <Label>PIS Alíquota (%)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.tributacao?.pis_aliquota || 0} 
                    onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, pis_aliquota: parseFloat(e.target.value) || 0 } }))} 
                  />
                </div>
                <div>
                  <Label>COFINS CST</Label>
                  <Input 
                    value={formData.tributacao?.cofins_cst || ''} 
                    onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, cofins_cst: e.target.value } }))} 
                    placeholder="01"
                  />
                </div>
                <div>
                  <Label>COFINS Alíquota (%)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.tributacao?.cofins_aliquota || 0} 
                    onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, cofins_aliquota: parseFloat(e.target.value) || 0 } }))} 
                  />
                </div>
                <div>
                  <Label>IPI CST</Label>
                  <Input 
                    value={formData.tributacao?.ipi_cst || ''} 
                    onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, ipi_cst: e.target.value } }))} 
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label>IPI Alíquota (%)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.tributacao?.ipi_aliquota || 0} 
                    onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, ipi_aliquota: parseFloat(e.target.value) || 0 } }))} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50 border-b pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                Contabilização
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div>
                <Label>Conta Contábil</Label>
                <Select value={formData.conta_contabil_id || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, conta_contabil_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta contábil..." />
                  </SelectTrigger>
                  <SelectContent>
                    {planoContas.filter(c => c.tipo === 'Receita' || c.tipo === 'Despesa').map(conta => (
                      <SelectItem key={conta.id} value={conta.id}>
                        {conta.codigo} - {conta.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 6: ESTOQUE AVANÇADO */}
        <TabsContent value="estoque-avancado" className="space-y-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="bg-orange-100 border-b border-orange-200 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-orange-600" />
                Controle de Estoque Avançado
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <Label className="font-semibold">Controla Lote</Label>
                  <p className="text-xs text-slate-500">Rastreamento por número de lote</p>
                </div>
                <Switch
                  checked={formData.controla_lote}
                  onCheckedChange={(val) => setFormData(prev => ({...prev, controla_lote: val}))}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <Label className="font-semibold">Controla Validade</Label>
                  <p className="text-xs text-slate-500">Rastreamento de data de validade</p>
                </div>
                <Switch
                  checked={formData.controla_validade}
                  onCheckedChange={(val) => setFormData(prev => ({...prev, controla_validade: val}))}
                />
              </div>

              {formData.controla_validade && (
                <div>
                  <Label>Prazo Validade Padrão (dias)</Label>
                  <Input
                    type="number"
                    value={formData.prazo_validade_dias}
                    onChange={(e) => setFormData(prev => ({...prev, prazo_validade_dias: parseInt(e.target.value) || 0}))}
                    placeholder="Ex: 365"
                  />
                </div>
              )}

              <h4 className="font-bold text-slate-800 mt-6 mb-3 pt-4 border-t">Parâmetros de Estoque</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Estoque Mínimo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.estoque_minimo}
                    onChange={(e) => setFormData(prev => ({...prev, estoque_minimo: parseFloat(e.target.value) || 0}))}
                  />
                </div>
                <div>
                  <Label>Estoque Máximo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.estoque_maximo}
                    onChange={(e) => setFormData(prev => ({...prev, estoque_maximo: parseFloat(e.target.value) || 0}))}
                  />
                </div>
                <div>
                  <Label>Ponto de Reposição</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.ponto_reposicao}
                    onChange={(e) => setFormData(prev => ({...prev, ponto_reposicao: parseFloat(e.target.value) || 0}))}
                  />
                </div>
              </div>

              <h4 className="font-bold text-slate-800 mt-6 mb-3 pt-4 border-t">Localização Física</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Almoxarifado/Local</Label>
                  <Select value={formData.almoxarifado_id || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, almoxarifado_id: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local..." />
                    </SelectTrigger>
                    <SelectContent>
                      {locaisEstoque.map(local => (
                        <SelectItem key={local.id} value={local.id}>
                          {local.nome} - {local.tipo_local}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Localização (Corredor/Prateleira)</Label>
                  <Input
                    value={formData.localizacao || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                    placeholder="Ex: A-12-03"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 7: HISTÓRICO */}
        <TabsContent value="historico" className="space-y-6">
          {produto ? (
            <HistoricoProduto produtoId={produto.id} produto={produto} />
          ) : (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-12 text-center">
                <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-slate-600">O histórico estará disponível após criar o produto</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex items-center justify-between pt-4 border-t sticky bottom-0 bg-white">
        <div className="flex gap-2">
          {produto && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleAlternarStatus}
                className={formData.status === 'Ativo' ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
              >
                {formData.status === 'Ativo' ? (
                  <>
                    <PowerOff className="w-4 h-4 mr-2" />
                    Inativar
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Ativar
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleExcluir}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 px-8">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {!isSubmitting && <Save className="w-4 h-4 mr-2" />}
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