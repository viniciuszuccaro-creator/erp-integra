import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Loader2, 
  Package, 
  Brain, 
  Calculator,
  Zap,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

/**
 * V22.0 - Formulário de Produto com Multi-Select de Unidades
 * Implementa Regra Mestra de Conversão
 */
export default function ProdutoForm({ produto, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(produto || {
    descricao: '',
    codigo: '',
    codigo_barras: '',
    grupo: 'Mat<barra>éria Prima',
    tipo_item: 'Revenda',
    eh_bitola: false,
    peso_teorico_kg_m: 0,
    bitola_diametro_mm: 0,
    tipo_aco: 'CA-50',
    unidade_principal: 'UN',
    unidades_secundarias: ['UN'], // V22.0: Multi-select
    fatores_conversao: {},
    unidade_medida: 'UN',
    unidade_compra: 'UN',
    unidade_estoque: 'KG',
    unidade_venda: 'UN',
    custo_aquisicao: 0,
    preco_venda: 0,
    estoque_atual: 0,
    estoque_minimo: 0,
    ncm: '',
    status: 'Ativo',
    foto_produto_url: '',
    observacoes: ''
  });

  const [analisandoIA, setAnalisandoIA] = useState(false);
  const [sugestoesIA, setSugestoesIA] = useState(null);

  // V22.0: NOVO - Opções de unidades disponíveis
  const todasUnidades = ['UN', 'PÇ', 'KG', 'MT', 'TON', 'BARRA', 'CX', 'LT', 'M2', 'M3'];
  
  // V22.0: NOVO - Toggle de unidade secundária
  const handleToggleUnidade = (unidade) => {
    const unidades = formData.unidades_secundarias || [];
    const novasUnidades = unidades.includes(unidade)
      ? unidades.filter(u => u !== unidade)
      : [...unidades, unidade];
    
    setFormData(prev => ({ ...prev, unidades_secundarias: novasUnidades }));
  };

  // V22.0: Calcular fatores de conversão automaticamente
  useEffect(() => {
    if (formData.eh_bitola && formData.peso_teorico_kg_m > 0) {
      const pesoKgM = formData.peso_teorico_kg_m;
      const comprimentoBarra = formData.comprimento_barra_padrao_m || 12;

      const fatores = {
        kg_por_peca: pesoKgM * comprimentoBarra, // 1 BARRA = X kg
        kg_por_metro: pesoKgM, // 1 MT = X kg
        metros_por_peca: comprimentoBarra, // 1 BARRA = 12 MT
        peca_por_ton: 1000 / (pesoKgM * comprimentoBarra), // 1 TON = X barras
        kg_por_ton: 1000 // 1 TON = 1000 KG (fixo)
      };

      setFormData(prev => ({ 
        ...prev, 
        fatores_conversao: fatores,
        unidade_estoque: 'KG' // V22.0: SEMPRE KG para bitolas
      }));
    }
  }, [formData.eh_bitola, formData.peso_teorico_kg_m, formData.comprimento_barra_padrao_m]);

  // IA: Analisar descrição
  const analisarComIA = async () => {
    if (!formData.descricao) {
      alert('Digite uma descrição primeiro');
      return;
    }

    setAnalisandoIA(true);

    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise o produto: "${formData.descricao}". 
        
Se for uma bitola de aço/ferro, retorne:
- eh_bitola: true
- peso_teorico_kg_m: (peso teórico em kg/m conforme norma)
- bitola_diametro_mm: (diâmetro em mm)
- tipo_aco: CA-25/CA-50/CA-60
- ncm: código NCM
- grupo_sugerido: (Mat Prima/Produto Acabado/etc)

Caso contrário:
- eh_bitola: false
- ncm: código NCM
- grupo_sugerido: classificação

Retorne JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            eh_bitola: { type: 'boolean' },
            peso_teorico_kg_m: { type: 'number' },
            bitola_diametro_mm: { type: 'number' },
            tipo_aco: { type: 'string' },
            ncm: { type: 'string' },
            grupo_sugerido: { type: 'string' },
            unidades_recomendadas: { 
              type: 'array',
              items: { type: 'string' }
            },
            confianca: { type: 'number' }
          }
        }
      });

      setSugestoesIA(resultado);
    } catch (error) {
      alert(`Erro na IA: ${error.message}`);
    } finally {
      setAnalisandoIA(false);
    }
  };

  const aplicarSugestoesIA = () => {
    if (!sugestoesIA) return;

    setFormData(prev => ({
      ...prev,
      eh_bitola: sugestoesIA.eh_bitola,
      peso_teorico_kg_m: sugestoesIA.peso_teorico_kg_m || prev.peso_teorico_kg_m,
      bitola_diametro_mm: sugestoesIA.bitola_diametro_mm || prev.bitola_diametro_mm,
      tipo_aco: sugestoesIA.tipo_aco || prev.tipo_aco,
      ncm: sugestoesIA.ncm || prev.ncm,
      grupo: sugestoesIA.grupo_sugerido || prev.grupo,
      unidades_secundarias: sugestoesIA.unidades_recomendadas || prev.unidades_secundarias
    }));

    setSugestoesIA(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.unidade_principal) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    // V22.0: Validar que unidade_principal está em unidades_secundarias
    if (!formData.unidades_secundarias.includes(formData.unidade_principal)) {
      setFormData(prev => ({
        ...prev,
        unidades_secundarias: [...prev.unidades_secundarias, prev.unidade_principal]
      }));
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identificação */}
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Identificação do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <div className="flex gap-2">
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Ex: Vergalhão 12.5mm CA-50 - Barra 12m"
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={analisarComIA}
                disabled={analisandoIA || !formData.descricao}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {analisandoIA ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-1" />
                    IA
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sugestões IA */}
          {sugestoesIA && (
            <Alert className="border-purple-300 bg-purple-50">
              <Brain className="w-4 h-4 text-purple-600" />
              <AlertDescription>
                <p className="font-bold text-purple-900 mb-2">
                  🧠 IA Detectou ({sugestoesIA.confianca}% confiança):
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-purple-800 mb-3">
                  <p>• Bitola: {sugestoesIA.eh_bitola ? 'Sim' : 'Não'}</p>
                  {sugestoesIA.peso_teorico_kg_m > 0 && (
                    <p>• Peso: {sugestoesIA.peso_teorico_kg_m.toFixed(3)} kg/m</p>
                  )}
                  <p>• NCM: {sugestoesIA.ncm}</p>
                  <p>• Grupo: {sugestoesIA.grupo_sugerido}</p>
                  {sugestoesIA.unidades_recomendadas && (
                    <p className="col-span-2">• Unidades: {sugestoesIA.unidades_recomendadas.join(', ')}</p>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={aplicarSugestoesIA}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Aplicar Sugestões
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="codigo">Código Interno</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                placeholder="PROD-001"
              />
            </div>

            <div>
              <Label htmlFor="codigo-barras">Código de Barras</Label>
              <Input
                id="codigo-barras"
                value={formData.codigo_barras}
                onChange={(e) => setFormData({...formData, codigo_barras: e.target.value})}
                placeholder="7891234567890"
              />
            </div>

            <div>
              <Label htmlFor="ncm">NCM</Label>
              <Input
                id="ncm"
                value={formData.ncm}
                onChange={(e) => setFormData({...formData, ncm: e.target.value})}
                placeholder="73089090"
                maxLength={8}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grupo">Grupo</Label>
              <Select value={formData.grupo} onValueChange={(v) => setFormData({...formData, grupo: v})}>
                <SelectTrigger id="grupo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Matéria Prima">Matéria Prima</SelectItem>
                  <SelectItem value="Produto Acabado">Produto Acabado</SelectItem>
                  <SelectItem value="Insumo">Insumo</SelectItem>
                  <SelectItem value="Bitola">Bitola</SelectItem>
                  <SelectItem value="Ferramentas">Ferramentas</SelectItem>
                  <SelectItem value="EPIs">EPIs</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipo-item">Tipo de Item</Label>
              <Select value={formData.tipo_item} onValueChange={(v) => setFormData({...formData, tipo_item: v})}>
                <SelectTrigger id="tipo-item">
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
        </CardContent>
      </Card>

      {/* V22.0: NOVO - Seção de Bitola */}
      <Card className="border-2 border-orange-300">
        <CardHeader className="bg-orange-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-600" />
              Configuração de Bitola (Aço/Ferro)
            </CardTitle>
            <Switch
              checked={formData.eh_bitola}
              onCheckedChange={(v) => setFormData({...formData, eh_bitola: v})}
            />
          </div>
        </CardHeader>
        {formData.eh_bitola && (
          <CardContent className="p-6 space-y-4">
            <Alert className="border-blue-300 bg-blue-50">
              <Zap className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                <strong>V22.0 Ativo:</strong> Configure o peso teórico e as conversões serão calculadas automaticamente.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="diametro">Diâmetro (mm)</Label>
                <Select 
                  value={formData.bitola_diametro_mm?.toString() || ''} 
                  onValueChange={(v) => setFormData({...formData, bitola_diametro_mm: parseFloat(v)})}
                >
                  <SelectTrigger id="diametro">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6.3">6.3 mm</SelectItem>
                    <SelectItem value="8">8.0 mm</SelectItem>
                    <SelectItem value="10">10.0 mm</SelectItem>
                    <SelectItem value="12.5">12.5 mm</SelectItem>
                    <SelectItem value="16">16.0 mm</SelectItem>
                    <SelectItem value="20">20.0 mm</SelectItem>
                    <SelectItem value="25">25.0 mm</SelectItem>
                    <SelectItem value="32">32.0 mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo-aco">Tipo de Aço</Label>
                <Select value={formData.tipo_aco} onValueChange={(v) => setFormData({...formData, tipo_aco: v})}>
                  <SelectTrigger id="tipo-aco">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA-25">CA-25</SelectItem>
                    <SelectItem value="CA-50">CA-50</SelectItem>
                    <SelectItem value="CA-60">CA-60</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="peso-teorico">Peso Teórico (kg/m) *</Label>
                <Input
                  id="peso-teorico"
                  type="number"
                  step="0.001"
                  value={formData.peso_teorico_kg_m}
                  onChange={(e) => setFormData({...formData, peso_teorico_kg_m: parseFloat(e.target.value) || 0})}
                  placeholder="0.888"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="comprimento-barra">Comprimento Barra Padrão (m)</Label>
              <Input
                id="comprimento-barra"
                type="number"
                step="0.1"
                value={formData.comprimento_barra_padrao_m || 12}
                onChange={(e) => setFormData({...formData, comprimento_barra_padrao_m: parseFloat(e.target.value) || 12})}
                placeholder="12"
              />
              <p className="text-xs text-slate-500 mt-1">Padrão: 12 metros</p>
            </div>

            {/* V22.0: Preview de Fatores */}
            {formData.peso_teorico_kg_m > 0 && (
              <Card className="border-green-300 bg-green-50">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-green-900 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Fatores de Conversão (Calculados):
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                    <p>• 1 BARRA = {formData.fatores_conversao?.kg_por_peca?.toFixed(2)} KG</p>
                    <p>• 1 MT = {formData.fatores_conversao?.kg_por_metro?.toFixed(3)} KG</p>
                    <p>• 1 BARRA = {formData.fatores_conversao?.metros_por_peca} MT</p>
                    <p>• 1 TON = {formData.fatores_conversao?.peca_por_ton?.toFixed(0)} BARRAS</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        )}
      </Card>

      {/* V22.0: NOVO - Gestão de Unidades de Medida */}
      <Card className="border-2 border-green-300">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />
            Unidades de Medida (V22.0 - Regra Mestra)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Unidade Principal */}
          <div>
            <Label htmlFor="unidade-principal">Unidade Principal *</Label>
            <Select 
              value={formData.unidade_principal} 
              onValueChange={(v) => setFormData({...formData, unidade_principal: v})}
            >
              <SelectTrigger id="unidade-principal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {todasUnidades.map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              Unidade usada em relatórios e referências
            </p>
          </div>

          {/* V22.0: NOVO - Multi-Select de Unidades Secundárias */}
          <div>
            <Label className="mb-3 block">Unidades Habilitadas (Multi-Select) *</Label>
            <Alert className="border-purple-300 bg-purple-50 mb-3">
              <Zap className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-xs text-purple-800">
                <strong>V22.0:</strong> Selecione TODAS as unidades em que este produto pode ser vendido/comprado.
                A conversão será automática usando os fatores calculados.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-4 gap-3">
              {todasUnidades.map(unidade => {
                const selecionada = (formData.unidades_secundarias || []).includes(unidade);
                const ehPrincipal = formData.unidade_principal === unidade;

                return (
                  <div
                    key={unidade}
                    onClick={() => !ehPrincipal && handleToggleUnidade(unidade)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      ehPrincipal 
                        ? 'border-blue-500 bg-blue-100 cursor-not-allowed'
                        : selecionada 
                          ? 'border-green-500 bg-green-50 hover:bg-green-100'
                          : 'border-slate-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selecionada || ehPrincipal}
                        disabled={ehPrincipal}
                        onCheckedChange={() => !ehPrincipal && handleToggleUnidade(unidade)}
                      />
                      <span className="font-semibold text-sm">{unidade}</span>
                    </div>
                    {ehPrincipal && (
                      <p className="text-xs text-blue-700 mt-1">Principal</p>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-600 mt-2">
              💡 Selecionadas: {formData.unidades_secundarias?.join(', ') || 'Nenhuma'}
            </p>
          </div>

          {/* Unidade de Estoque */}
          <div>
            <Label htmlFor="unidade-estoque">Unidade de Estoque (Rastreamento Financeiro)</Label>
            <Select 
              value={formData.unidade_estoque} 
              onValueChange={(v) => setFormData({...formData, unidade_estoque: v})}
              disabled={formData.eh_bitola} // V22.0: Bitolas sempre em KG
            >
              <SelectTrigger id="unidade-estoque">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KG">KG - Quilograma</SelectItem>
                <SelectItem value="UN">UN - Unidade</SelectItem>
                <SelectItem value="MT">MT - Metro</SelectItem>
              </SelectContent>
            </Select>
            {formData.eh_bitola && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Bitolas sempre usam KG no estoque (rastreamento financeiro)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preços */}
      <Card className="border-2 border-purple-300">
        <CardHeader className="bg-purple-50">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            Preços e Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="custo">Custo Aquisição</Label>
              <Input
                id="custo"
                type="number"
                step="0.01"
                value={formData.custo_aquisicao}
                onChange={(e) => setFormData({...formData, custo_aquisicao: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="preco">Preço Venda</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={formData.preco_venda}
                onChange={(e) => setFormData({...formData, preco_venda: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Margem</Label>
              <div className="p-2 bg-slate-100 rounded text-center">
                <span className="font-bold text-lg">
                  {formData.custo_aquisicao > 0 
                    ? (((formData.preco_venda - formData.custo_aquisicao) / formData.custo_aquisicao) * 100).toFixed(1)
                    : 0
                  }%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estoque-min">Estoque Mínimo</Label>
              <Input
                id="estoque-min"
                type="number"
                step="0.01"
                value={formData.estoque_minimo}
                onChange={(e) => setFormData({...formData, estoque_minimo: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="estoque-max">Estoque Máximo</Label>
              <Input
                id="estoque-max"
                type="number"
                step="0.01"
                value={formData.estoque_maximo}
                onChange={(e) => setFormData({...formData, estoque_maximo: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <div>
        <Label htmlFor="obs">Observações</Label>
        <Textarea
          id="obs"
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          rows={3}
        />
      </div>

      {/* Status */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded">
        <Label>Produto Ativo</Label>
        <Switch
          checked={formData.status === 'Ativo'}
          onCheckedChange={(v) => setFormData({...formData, status: v ? 'Ativo' : 'Inativo'})}
        />
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {produto ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );
}