
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Info,
  CheckCircle,
  Tag
} from "lucide-react";

// TABELA DE PESOS ESPECÍFICOS (Kg/m)
const PESOS_FERRO = {
  "6.3mm": 0.245,
  "8.0mm": 0.395,
  "10.0mm": 0.617,
  "12.5mm": 0.963,
  "16.0mm": 1.578,
  "20.0mm": 2.466,
  "25.0mm": 3.853,
  "4.2mm": 0.109,
  "5.0mm": 0.154,
};

const PRECO_FERRO_KG = 6.50;
const MARGEM_MINIMA = 15;
const COBRIMENTO_PADRAO = 2.5; // cm

export default function ItemProducaoForm({ item, onChange, index }) {
  const [formData, setFormData] = useState(item || {
    identificador: "",
    tipo_peca: "Coluna",
    quantidade: 1,
    // Dimensões
    altura: 0,
    largura: 0,
    comprimento: 0,
    diametro: 0,
    // Ferro Principal
    ferro_principal_bitola: "12.5mm",
    ferro_principal_quantidade: 4,
    ferro_principal_peso_kg: 0,
    dobra_le: false,
    dobra_ld: false,
    tamanho_dobra_le: 0,
    tamanho_dobra_ld: 0,
    // Reforço
    tem_reforco: false,
    reforco_quantidade: 0,
    reforco_bitola: "10.0mm",
    reforco_peso_kg: 0,
    // Estribos
    estribo_bitola: "6.3mm",
    estribo_largura: 0,
    estribo_altura: 0,
    estribo_diametro: 0,
    estribo_distancia: 15,
    estribo_quantidade: 0,
    estribo_peso_kg: 0,
    lado_sem_estribo_le: false,
    lado_sem_estribo_ld: false,
    comprimento_sem_estribo: 0,
    // Bloco específico
    espacamento_malha: 15,
    quantidade_costela: 0,
    bitola_malha: "8.0mm",
    quantidade_ferro_malha: 0,
    // Custos
    peso_unitario_kg: 0,
    peso_total_kg: 0,
    custo_material: 0,
    custo_mao_obra: 0,
    custo_lacamento: 0,
    custo_overhead: 0,
    custo_total: 0,
    preco_venda_unitario: 0,
    preco_venda_total: 0,
    tempo_producao_horas: 0,
    prazo_entrega_dias: 7,
    observacoes_tecnicas: "",
    tags_tecnicas: [],
    gerar_op_automaticamente: true
  });

  useEffect(() => {
    calcularTudo();
  }, [
    formData.tipo_peca,
    formData.comprimento,
    formData.largura,
    formData.altura,
    formData.diametro,
    formData.ferro_principal_bitola,
    formData.ferro_principal_quantidade,
    formData.dobra_le,
    formData.dobra_ld,
    formData.tamanho_dobra_le,
    formData.tamanho_dobra_ld,
    formData.tem_reforco,
    formData.reforco_quantidade,
    formData.reforco_bitola,
    formData.estribo_bitola,
    formData.estribo_largura,
    formData.estribo_altura,
    formData.estribo_diametro,
    formData.estribo_distancia,
    formData.quantidade,
    formData.espacamento_malha,
    formData.quantidade_costela,
    formData.bitola_malha,
    formData.custo_mao_obra,
    formData.custo_lacamento,
    formData.custo_overhead,
    formData.preco_venda_unitario, // Added to trigger recalculation when manually set
    formData.lado_sem_estribo_le, // Added for completeness in dependencies
    formData.lado_sem_estribo_ld, // Added for completeness in dependencies
    formData.comprimento_sem_estribo // Added for completeness in dependencies
  ]);

  const calcularTudo = () => {
    let pesoFerroPrincipal = 0;
    let pesoReforco = 0;
    let pesoEstribos = 0;
    let pesoMalha = 0;
    let quantidadeEstribos = 0;

    // CÁLCULO BASEADO NO TIPO DE PEÇA
    if (formData.tipo_peca === "Coluna" || formData.tipo_peca === "Viga") {
      // 1. FERRO PRINCIPAL
      const comprimentoMetros = (formData.comprimento || 0) / 100;
      const dobrasTotal = ((formData.dobra_le ? formData.tamanho_dobra_le : 0) + 
                          (formData.dobra_ld ? formData.tamanho_dobra_ld : 0)) / 100;
      const comprimentoTotalPrincipal = comprimentoMetros + dobrasTotal;
      const pesoEspecificoPrincipal = PESOS_FERRO[formData.ferro_principal_bitola] || 0;
      pesoFerroPrincipal = comprimentoTotalPrincipal * (formData.ferro_principal_quantidade || 0) * pesoEspecificoPrincipal;

      // 2. REFORÇO (se tiver)
      if (formData.tem_reforco && (formData.reforco_quantidade || 0) > 0) {
        const pesoEspecificoReforco = PESOS_FERRO[formData.reforco_bitola] || 0;
        pesoReforco = comprimentoTotalPrincipal * (formData.reforco_quantidade || 0) * pesoEspecificoReforco;
      }

      // 3. ESTRIBOS (retangular)
      const larguraEstribo = (formData.largura - (2 * COBRIMENTO_PADRAO)) / 100;
      const alturaEstribo = (formData.altura - (2 * COBRIMENTO_PADRAO)) / 100;
      
      // Calcular comprimento sem estribo
      let comprimentoComEstribo = formData.comprimento;
      if (formData.lado_sem_estribo_le || formData.lado_sem_estribo_ld) {
        comprimentoComEstribo = (formData.comprimento || 0) - (formData.comprimento_sem_estribo || 0);
      }
      
      // Ensure dimensions are positive before calculating estribo
      const validLarguraEstribo = Math.max(0, larguraEstribo);
      const validAlturaEstribo = Math.max(0, alturaEstribo);

      if (formData.estribo_distancia > 0 && comprimentoComEstribo > 0 && validLarguraEstribo > 0 && validAlturaEstribo > 0) {
        quantidadeEstribos = Math.ceil((comprimentoComEstribo / (formData.estribo_distancia || 1))) + 2; // +2 for ends
        const perimetroEstribo = 2 * (validLarguraEstribo + validAlturaEstribo) + 0.10; // 10cm de gancho
        const pesoEspecificoEstribo = PESOS_FERRO[formData.estribo_bitola] || 0;
        pesoEstribos = quantidadeEstribos * perimetroEstribo * pesoEspecificoEstribo;
      }

    } else if (formData.tipo_peca === "Estaca" || formData.tipo_peca === "Broca") {
      // 1. FERRO PRINCIPAL (circular)
      const comprimentoMetros = (formData.comprimento || 0) / 100;
      const pesoEspecificoPrincipal = PESOS_FERRO[formData.ferro_principal_bitola] || 0;
      pesoFerroPrincipal = comprimentoMetros * (formData.ferro_principal_quantidade || 0) * pesoEspecificoPrincipal;

      // 2. ESTRIBO ESPIRAL (circular)
      const diametroEstribo = (formData.diametro - (2 * COBRIMENTO_PADRAO)) / 100;
      const validDiametroEstribo = Math.max(0, diametroEstribo); // Ensure positive diameter
      if (formData.estribo_distancia > 0 && validDiametroEstribo > 0) {
        const numeroVoltas = (formData.comprimento || 0) / (formData.estribo_distancia || 1);
        const comprimentoEspiral = numeroVoltas * Math.PI * validDiametroEstribo;
        const pesoEspecificoEstribo = PESOS_FERRO[formData.estribo_bitola] || 0;
        pesoEstribos = comprimentoEspiral * pesoEspecificoEstribo;
        quantidadeEstribos = Math.ceil(numeroVoltas);
      }

    } else if (formData.tipo_peca === "Bloco") {
      // BLOCO DE FUNDAÇÃO - MALHA
      const comprimentoM = (formData.comprimento || 0) / 100;
      const larguraM = (formData.largura || 0) / 100;
      
      // Quantidade de ferros na malha (2 lados)
      const qtdFerroCmpr = Math.ceil(((formData.comprimento || 0) / (formData.espacamento_malha || 15))) + 1;
      const qtdFerroLarg = Math.ceil(((formData.largura || 0) / (formData.espacamento_malha || 15))) + 1;
      
      // Malha superior e inferior (2 lados)
      const comprimentoMalhaTotal = (qtdFerroCmpr * larguraM + qtdFerroLarg * comprimentoM) * 2;
      const pesoEspecificoMalha = PESOS_FERRO[formData.bitola_malha] || 0;
      pesoMalha = comprimentoMalhaTotal * pesoEspecificoMalha;

      // Costelas (reforço vertical)
      if ((formData.quantidade_costela || 0) > 0) {
        const alturaM = (formData.altura || 0) / 100;
        const pesoEspecificoCostela = PESOS_FERRO[formData.bitola_malha] || 0;
        const pesoCostelas = alturaM * (formData.quantidade_costela || 0) * pesoEspecificoCostela;
        pesoMalha += pesoCostelas;
      }
    }

    // PESO TOTAL
    const pesoUnitario = pesoFerroPrincipal + pesoReforco + pesoEstribos + pesoMalha;
    const pesoTotal = pesoUnitario * (formData.quantidade || 1);

    // CUSTO MATERIAL AUTOMÁTICO
    const custoMaterial = pesoTotal * PRECO_FERRO_KG;

    // CUSTO TOTAL
    const custoTotal = 
      custoMaterial + 
      (formData.custo_mao_obra || 0) +
      (formData.custo_lacamento || 0) +
      (formData.custo_overhead || 0);

    // PREÇO SUGERIDO
    const precoSugeridoUnitario = (custoTotal / (formData.quantidade || 1)) * 1.20;
    const precoVendaUnitario = (formData.preco_venda_unitario || 0) <= 0 ? parseFloat(precoSugeridoUnitario.toFixed(2)) : formData.preco_venda_unitario;
    const precoVendaTotal = precoVendaUnitario * (formData.quantidade || 1);

    // TEMPO DE PRODUÇÃO
    const tempoProducao = calcularTempoProd(formData.tipo_peca, pesoTotal, quantidadeEstribos);

    const dadosAtualizados = {
      ...formData,
      ferro_principal_peso_kg: parseFloat(pesoFerroPrincipal.toFixed(2)),
      reforco_peso_kg: parseFloat(pesoReforco.toFixed(2)),
      estribo_quantidade: quantidadeEstribos,
      estribo_peso_kg: parseFloat(pesoEstribos.toFixed(2)),
      estribo_largura: formData.largura ? Math.max(0, formData.largura - (2 * COBRIMENTO_PADRAO)) : 0,
      estribo_altura: formData.altura ? Math.max(0, formData.altura - (2 * COBRIMENTO_PADRAO)) : 0,
      estribo_diametro: formData.diametro ? Math.max(0, formData.diametro - (2 * COBRIMENTO_PADRAO)) : 0,
      quantidade_ferro_malha: formData.tipo_peca === "Bloco" ? 
        (Math.ceil(((formData.comprimento || 0) / (formData.espacamento_malha || 15))) + 1 + 
         Math.ceil(((formData.largura || 0) / (formData.espacamento_malha || 15))) + 1) : 0,
      peso_unitario_kg: parseFloat(pesoUnitario.toFixed(2)),
      peso_total_kg: parseFloat(pesoTotal.toFixed(2)),
      custo_material: parseFloat(custoMaterial.toFixed(2)),
      custo_total: parseFloat(custoTotal.toFixed(2)),
      preco_venda_unitario: parseFloat(precoVendaUnitario.toFixed(2)),
      preco_venda_total: parseFloat(precoVendaTotal.toFixed(2)),
      tempo_producao_horas: parseFloat(tempoProducao.toFixed(1))
    };

    setFormData(dadosAtualizados);
    if (onChange) {
      onChange(dadosAtualizados);
    }
  };

  const calcularTempoProd = (tipo, pesoKg, qtdEstribos) => {
    const tempoBase = tipo === "Coluna" || tipo === "Viga" ? 0.5 : 
                     tipo === "Bloco" ? 0.8 : 0.4;
    const tempoPeso = (pesoKg || 0) * 0.02;
    const tempoEstribos = (qtdEstribos || 0) * 0.01;
    return tempoBase + tempoPeso + tempoEstribos;
  };

  const calcularMargem = () => {
    if ((formData.preco_venda_total || 0) === 0 || (formData.custo_total || 0) === 0) return 0;
    // Ensure preco_venda_total is not zero in the denominator to avoid division by zero
    return (((formData.preco_venda_total || 0) - (formData.custo_total || 0)) / (formData.preco_venda_total || 1)) * 100;
  };

  const margem = calcularMargem();
  const margemBaixa = margem < MARGEM_MINIMA;
  const margemNegativa = margem < 0;

  const updateField = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
  };

  const adicionarTag = (tag) => {
    const tags = formData.tags_tecnicas || [];
    if (!tags.includes(tag)) {
      updateField('tags_tecnicas', [...tags, tag]);
    }
  };

  const removerTag = (tag) => {
    const tags = formData.tags_tecnicas || [];
    updateField('tags_tecnicas', tags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-6">
      {/* IDENTIFICAÇÃO */}
      <Card>
        <CardHeader className="bg-slate-50 pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge className="bg-amber-600">Peça #{index + 1}</Badge>
            Identificação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>ID da Peça *</Label>
              <Input
                value={formData.identificador}
                onChange={(e) => updateField('identificador', e.target.value)}
                placeholder="P1, P2..."
                className="font-mono font-bold"
              />
            </div>
            <div>
              <Label>Tipo de Peça *</Label>
              <Select
                value={formData.tipo_peca}
                onValueChange={(value) => updateField('tipo_peca', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Coluna">Coluna</SelectItem>
                  <SelectItem value="Viga">Viga</SelectItem>
                  <SelectItem value="Estaca">Estaca</SelectItem>
                  <SelectItem value="Broca">Broca</SelectItem>
                  <SelectItem value="Bloco">Bloco</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade *</Label>
              <Input
                type="number"
                value={formData.quantidade}
                onChange={(e) => updateField('quantidade', parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DIMENSÕES - CONDICIONAL */}
      <Card>
        <CardHeader className="bg-blue-50 pb-3">
          <CardTitle className="text-sm">Dimensões (cm)</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {(formData.tipo_peca === "Coluna" || formData.tipo_peca === "Viga" || formData.tipo_peca === "Bloco") && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Comprimento *</Label>
                <Input
                  type="number"
                  value={formData.comprimento}
                  onChange={(e) => updateField('comprimento', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Largura *</Label>
                <Input
                  type="number"
                  value={formData.largura}
                  onChange={(e) => updateField('largura', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Altura *</Label>
                <Input
                  type="number"
                  value={formData.altura}
                  onChange={(e) => updateField('altura', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {(formData.tipo_peca === "Estaca" || formData.tipo_peca === "Broca") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Comprimento *</Label>
                <Input
                  type="number"
                  value={formData.comprimento}
                  onChange={(e) => updateField('comprimento', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Diâmetro *</Label>
                <Input
                  type="number"
                  value={formData.diametro}
                  onChange={(e) => updateField('diametro', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FERRO PRINCIPAL */}
      {(formData.tipo_peca === "Coluna" || formData.tipo_peca === "Viga" || 
        formData.tipo_peca === "Estaca" || formData.tipo_peca === "Broca") && (
        <Card>
          <CardHeader className="bg-green-50 pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Ferro Principal (Armadura Longitudinal)</span>
              <Badge className="bg-green-600 text-white">
                <Calculator className="w-3 h-3 mr-1" />
                {formData.ferro_principal_peso_kg} kg
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Bitola *</Label>
                <Select
                  value={formData.ferro_principal_bitola}
                  onValueChange={(value) => updateField('ferro_principal_bitola', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10.0mm">10.0mm ({PESOS_FERRO["10.0mm"]} kg/m)</SelectItem>
                    <SelectItem value="12.5mm">12.5mm ({PESOS_FERRO["12.5mm"]} kg/m)</SelectItem>
                    <SelectItem value="16.0mm">16.0mm ({PESOS_FERRO["16.0mm"]} kg/m)</SelectItem>
                    <SelectItem value="20.0mm">20.0mm ({PESOS_FERRO["20.0mm"]} kg/m)</SelectItem>
                    <SelectItem value="25.0mm">25.0mm ({PESOS_FERRO["25.0mm"]} kg/m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantidade Barras *</Label>
                <Input
                  type="number"
                  value={formData.ferro_principal_quantidade}
                  onChange={(e) => updateField('ferro_principal_quantidade', parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>

              {(formData.tipo_peca === "Coluna" || formData.tipo_peca === "Viga") && (
                <>
                  <div className="flex items-center gap-2 mt-6">
                    <Switch
                      checked={formData.dobra_le}
                      onCheckedChange={(checked) => updateField('dobra_le', checked)}
                    />
                    <Label>Dobra LE</Label>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Switch
                      checked={formData.dobra_ld}
                      onCheckedChange={(checked) => updateField('dobra_ld', checked)}
                    />
                    <Label>Dobra LD</Label>
                  </div>
                </>
              )}
            </div>

            {(formData.tipo_peca === "Coluna" || formData.tipo_peca === "Viga") && 
             (formData.dobra_le || formData.dobra_ld) && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {formData.dobra_le && (
                  <div>
                    <Label>Tamanho Dobra LE (cm)</Label>
                    <Input
                      type="number"
                      value={formData.tamanho_dobra_le}
                      onChange={(e) => updateField('tamanho_dobra_le', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
                {formData.dobra_ld && (
                  <div>
                    <Label>Tamanho Dobra LD (cm)</Label>
                    <Input
                      type="number"
                      value={formData.tamanho_dobra_ld}
                      onChange={(e) => updateField('tamanho_dobra_ld', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* REFORÇO */}
            {(formData.tipo_peca === "Coluna" || formData.tipo_peca === "Viga") && (
              <>
                <div className="flex items-center gap-2 mt-4">
                  <Switch
                    checked={formData.tem_reforco}
                    onCheckedChange={(checked) => updateField('tem_reforco', checked)}
                  />
                  <Label>Adicionar Reforço?</Label>
                </div>

                {formData.tem_reforco && (
                  <div className="grid grid-cols-3 gap-4 mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <div>
                      <Label>Qtd Reforço</Label>
                      <Input
                        type="number"
                        value={formData.reforco_quantidade}
                        onChange={(e) => updateField('reforco_quantidade', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Bitola Reforço</Label>
                      <Select
                        value={formData.reforco_bitola}
                        onValueChange={(value) => updateField('reforco_bitola', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10.0mm">10.0mm</SelectItem>
                          <SelectItem value="12.5mm">12.5mm</SelectItem>
                          <SelectItem value="16.0mm">16.0mm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Badge className="bg-green-600 text-white h-10 px-3 flex items-center">
                        {formData.reforco_peso_kg} kg
                      </Badge>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ESTRIBOS */}
      {(formData.tipo_peca === "Coluna" || formData.tipo_peca === "Viga") && (
        <Card>
          <CardHeader className="bg-purple-50 pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Estribos (Armadura Transversal)</span>
              <div className="flex gap-2">
                <Badge className="bg-purple-600 text-white">
                  {formData.estribo_quantidade} unidades
                </Badge>
                <Badge className="bg-purple-600 text-white">
                  <Calculator className="w-3 h-3 mr-1" />
                  {formData.estribo_peso_kg} kg
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Bitola Estribo *</Label>
                <Select
                  value={formData.estribo_bitola}
                  onValueChange={(value) => updateField('estribo_bitola', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4.2mm">4.2mm ({PESOS_FERRO["4.2mm"]} kg/m)</SelectItem>
                    <SelectItem value="5.0mm">5.0mm ({PESOS_FERRO["5.0mm"]} kg/m)</SelectItem>
                    <SelectItem value="6.3mm">6.3mm ({PESOS_FERRO["6.3mm"]} kg/m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Largura (Auto)</Label>
                <Input
                  type="number"
                  value={formData.estribo_largura}
                  disabled
                  className="bg-slate-100"
                />
                <p className="text-xs text-slate-500 mt-1">Largura - 2×{COBRIMENTO_PADRAO}cm</p>
              </div>
              <div>
                <Label>Altura (Auto)</Label>
                <Input
                  type="number"
                  value={formData.estribo_altura}
                  disabled
                  className="bg-slate-100"
                />
                <p className="text-xs text-slate-500 mt-1">Altura - 2×{COBRIMENTO_PADRAO}cm</p>
              </div>
              <div>
                <Label>Espaçamento (cm) *</Label>
                <Input
                  type="number"
                  value={formData.estribo_distancia}
                  onChange={(e) => updateField('estribo_distancia', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Lados sem estribo */}
            <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
              <Label className="mb-2 block">Lados sem Estribo (Opcional)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.lado_sem_estribo_le}
                    onCheckedChange={(checked) => updateField('lado_sem_estribo_le', checked)}
                  />
                  <Label>Lado Esquerdo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.lado_sem_estribo_ld}
                    onCheckedChange={(checked) => updateField('lado_sem_estribo_ld', checked)}
                  />
                  <Label>Lado Direito</Label>
                </div>
                {(formData.lado_sem_estribo_le || formData.lado_sem_estribo_ld) && (
                  <div>
                    <Label>Comprimento sem Estribo (cm)</Label>
                    <Input
                      type="number"
                      value={formData.comprimento_sem_estribo}
                      onChange={(e) => updateField('comprimento_sem_estribo', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ESTRIBOS ESPIRAL (Estaca/Broca) */}
      {(formData.tipo_peca === "Estaca" || formData.tipo_peca === "Broca") && (
        <Card>
          <CardHeader className="bg-purple-50 pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Estribo Espiral (Formato Redondo)</span>
              <div className="flex gap-2">
                <Badge className="bg-purple-600 text-white">
                  {formData.estribo_quantidade} voltas
                </Badge>
                <Badge className="bg-purple-600 text-white">
                  <Calculator className="w-3 h-3 mr-1" />
                  {formData.estribo_peso_kg} kg
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Bitola Estribo *</Label>
                <Select
                  value={formData.estribo_bitola}
                  onValueChange={(value) => updateField('estribo_bitola', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4.2mm">4.2mm ({PESOS_FERRO["4.2mm"]} kg/m)</SelectItem>
                    <SelectItem value="5.0mm">5.0mm ({PESOS_FERRO["5.0mm"]} kg/m)</SelectItem>
                    <SelectItem value="6.3mm">6.3mm ({PESOS_FERRO["6.3mm"]} kg/m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Diâmetro Estribo (Auto)</Label>
                <Input
                  type="number"
                  value={formData.estribo_diametro}
                  disabled
                  className="bg-slate-100"
                />
                <p className="text-xs text-slate-500 mt-1">Diâmetro - 2×{COBRIMENTO_PADRAO}cm</p>
              </div>
              <div>
                <Label>Espaçamento Espiral (cm) *</Label>
                <Input
                  type="number"
                  value={formData.estribo_distancia}
                  onChange={(e) => updateField('estribo_distancia', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MALHA (Bloco) */}
      {formData.tipo_peca === "Bloco" && (
        <Card>
          <CardHeader className="bg-amber-50 pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Armadura da Malha (2 Lados)</span>
              <Badge className="bg-amber-600 text-white">
                <Calculator className="w-3 h-3 mr-1" />
                {formData.peso_unitario_kg} kg
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Bitola Malha *</Label>
                <Select
                  value={formData.bitola_malha}
                  onValueChange={(value) => updateField('bitola_malha', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6.3mm">6.3mm</SelectItem>
                    <SelectItem value="8.0mm">8.0mm</SelectItem>
                    <SelectItem value="10.0mm">10.0mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Espaçamento (cm) *</Label>
                <Input
                  type="number"
                  value={formData.espacamento_malha}
                  onChange={(e) => updateField('espacamento_malha', parseFloat(e.target.value) || 15)}
                />
              </div>
              <div>
                <Label>Qtd Ferro (Auto)</Label>
                <Input
                  type="number"
                  value={formData.quantidade_ferro_malha}
                  disabled
                  className="bg-slate-100 font-bold"
                />
                <p className="text-xs text-slate-500 mt-1">Calculado automaticamente</p>
              </div>
              <div>
                <Label>Qtd Costela (Reforço)</Label>
                <Input
                  type="number"
                  value={formData.quantidade_costela}
                  onChange={(e) => updateField('quantidade_costela', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CUSTOS E PREÇOS */}
      <Card>
        <CardHeader className={`pb-3 ${margemNegativa ? 'bg-red-50' : margemBaixa ? 'bg-amber-50' : 'bg-green-50'}`}>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Custos e Preços</span>
            <div className="flex gap-2">
              <Badge className="bg-slate-600 text-white">
                Peso Total: {(formData.peso_total_kg || 0).toFixed(2)} kg
              </Badge>
              <Badge className={`${
                margemNegativa ? 'bg-red-600' :
                margemBaixa ? 'bg-amber-600' :
                'bg-green-600'
              } text-white`}>
                {margemNegativa ? (
                  <TrendingDown className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingUp className="w-3 h-3 mr-1" />
                )}
                Margem: {margem.toFixed(1)}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Custo Material (Auto) *</Label>
              <Input
                type="number"
                value={formData.custo_material || 0}
                disabled
                className="bg-slate-100 font-bold"
              />
              <p className="text-xs text-slate-500 mt-1">
                {(formData.peso_total_kg || 0).toFixed(2)} kg × R$ {PRECO_FERRO_KG}/kg
              </p>
            </div>
            <div>
              <Label>Custo Mão de Obra</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.custo_mao_obra || 0}
                onChange={(e) => updateField('custo_mao_obra', parseFloat(e.target.value) || 0)}
              />
            </div>
            {formData.tipo_peca === "Bloco" && (
              <div>
                <Label>Custo Laçamento</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custo_lacamento || 0}
                  onChange={(e) => updateField('custo_lacamento', parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
            <div>
              <Label>Custo Overhead</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.custo_overhead || 0}
                onChange={(e) => updateField('custo_overhead', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Custo Total</Label>
              <Input
                type="number"
                value={formData.custo_total || 0}
                disabled
                className="bg-slate-100 font-bold text-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Preço Venda Unit. *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.preco_venda_unitario || 0}
                onChange={(e) => updateField('preco_venda_unitario', parseFloat(e.target.value) || 0)}
                className="font-bold text-green-600"
              />
              <p className="text-xs text-blue-600 mt-1">
                Sugerido: R$ {(((formData.custo_total || 0) / (formData.quantidade || 1)) * 1.20).toFixed(2)} (+20%)
              </p>
            </div>
            <div>
              <Label>Preço Total</Label>
              <Input
                type="number"
                value={formData.preco_venda_total || 0}
                disabled
                className="bg-green-100 font-bold text-lg text-green-600"
              />
            </div>
            <div>
              <Label>Tempo Produção</Label>
              <Input
                type="number"
                value={formData.tempo_producao_horas || 0}
                disabled
                className="bg-slate-100"
              />
              <p className="text-xs text-slate-500 mt-1">
                horas (calculado)
              </p>
            </div>
          </div>

          {/* ALERTAS DE MARGEM */}
          {margemNegativa && (
            <Alert className="mt-4 bg-red-100 border-red-300">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-sm text-red-800 font-semibold">
                ⛔ PREJUÍZO! O preço de venda está R$ {(((formData.custo_total || 0) - (formData.preco_venda_total || 0))).toFixed(2)} abaixo do custo.
                <strong> Requer aprovação gerencial!</strong>
              </AlertDescription>
            </Alert>
          )}
          
          {!margemNegativa && margemBaixa && (
            <Alert className="mt-4 bg-amber-100 border-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                ⚠️ Margem abaixo do mínimo recomendado ({MARGEM_MINIMA}%). Considere aumentar o preço.
              </AlertDescription>
            </Alert>
          )}

          {!margemNegativa && !margemBaixa && (
            <Alert className="mt-4 bg-green-100 border-green-300">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-sm text-green-800">
                ✅ Margem saudável! Lucro projetado: R$ {(((formData.preco_venda_total || 0) - (formData.custo_total || 0))).toFixed(2)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* OBSERVAÇÕES TÉCNICAS E TAGS */}
      <Card>
        <CardHeader className="bg-slate-50 pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Observações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <Label>Tags Técnicas</Label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {['#ObraRapida', '#AltoRisco', '#Especial', '#ConcreteArmado', '#PreMoldado'].map(tag => (
                  <Button
                    key={tag}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => adicionarTag(tag)}
                    className="text-xs"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {(formData.tags_tecnicas || []).map(tag => (
                  <Badge key={tag} className="bg-blue-600">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removerTag(tag)}
                      className="ml-2 hover:text-red-200"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Observações Detalhadas</Label>
              <Textarea
                value={formData.observacoes_tecnicas}
                onChange={(e) => updateField('observacoes_tecnicas', e.target.value)}
                rows={3}
                placeholder="Especificações técnicas, requisitos especiais, detalhes de montagem..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prazo Entrega (dias)</Label>
                <Input
                  type="number"
                  value={formData.prazo_entrega_dias}
                  onChange={(e) => updateField('prazo_entrega_dias', parseInt(e.target.value) || 7)}
                  min="1"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Switch
                  checked={formData.gerar_op_automaticamente}
                  onCheckedChange={(checked) => updateField('gerar_op_automaticamente', checked)}
                />
                <Label>Gerar OP Automaticamente</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
