import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, Plus, Trash2, AlertCircle, CheckCircle2, 
  Building2, Package, DollarSign, Truck, Calculator, Clock
} from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import FormWrapper from "@/components/common/FormWrapper";

/**
 * FORMULÁRIO COMPLETO DE NOTA FISCAL V21.2
 * FASE 1 COMPLETO + FASE 2 MULTIEMPRESA
 * 
 * Modo Window: w-full h-full responsivo
 * Suporta multiempresa, IA fiscal, validações
 */
export default function NotaFiscalFormCompleto({ 
  notaFiscal, 
  pedido,
  windowMode = false,
  onSubmit,
  onCancel 
}) {
  const [formData, setFormData] = useState({
    tipo: "NF-e (Saída)",
    numero: "",
    serie: "1",
    modelo: "55",
    natureza_operacao: "Venda de mercadoria",
    cliente_fornecedor: "",
    cliente_fornecedor_id: "",
    cliente_cpf_cnpj: "",
    pedido_id: "",
    numero_pedido: "",
    empresa_faturamento_id: "",
    group_id: "",
    data_emissao: new Date().toISOString().split('T')[0],
    data_saida: new Date().toISOString().split('T')[0],
    hora_emissao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    hora_saida: "",
    cfop: "5102",
    finalidade: "Normal",
    ambiente: "Homologação",
    valor_produtos: 0,
    valor_servicos: 0,
    valor_desconto: 0,
    valor_frete: 0,
    valor_seguro: 0,
    outras_despesas: 0,
    valor_total: 0,
    observacoes: "",
    informacoes_complementares: "",
    itens: [],
    transportadora: {},
    duplicatas: [],
    status: "Rascunho",
    ...notaFiscal
  });

  const [abaAtiva, setAbaAtiva] = useState("geral");
  const [validacaoIA, setValidacaoIA] = useState(null);
  const [loading, setLoading] = useState(false);

  // Se vier de um pedido, popular dados automaticamente
  useEffect(() => {
    if (pedido && !notaFiscal) {
      setFormData(prev => ({
        ...prev,
        pedido_id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        cliente_fornecedor: pedido.cliente_nome,
        cliente_fornecedor_id: pedido.cliente_id,
        cliente_cpf_cnpj: pedido.cliente_cpf_cnpj,
        valor_produtos: pedido.valor_produtos || pedido.valor_total,
        valor_frete: pedido.valor_frete || 0,
        valor_total: pedido.valor_total,
        empresa_faturamento_id: pedido.empresa_id,
        group_id: pedido.group_id,
      }));
    }
  }, [pedido, notaFiscal]);

  // Calcular valor total
  useEffect(() => {
    const total = 
      (formData.valor_produtos || 0) + 
      (formData.valor_servicos || 0) + 
      (formData.valor_frete || 0) + 
      (formData.valor_seguro || 0) + 
      (formData.outras_despesas || 0) - 
      (formData.valor_desconto || 0);
    
    setFormData(prev => ({ ...prev, valor_total: total }));
  }, [
    formData.valor_produtos, 
    formData.valor_servicos, 
    formData.valor_frete, 
    formData.valor_seguro, 
    formData.outras_despesas, 
    formData.valor_desconto
  ]);

  const handleValidarIA = async () => {
    setLoading(true);
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta NF-e e identifique possíveis erros ou inconsistências fiscais:
        
        Tipo: ${formData.tipo}
        CFOP: ${formData.cfop}
        Natureza: ${formData.natureza_operacao}
        Ambiente: ${formData.ambiente}
        Valor Produtos: R$ ${formData.valor_produtos}
        Valor Total: R$ ${formData.valor_total}
        
        Retorne uma análise com possíveis alertas.`,
        response_json_schema: {
          type: "object",
          properties: {
            valido: { type: "boolean" },
            alertas: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  tipo: { type: "string" },
                  descricao: { type: "string" },
                  severidade: { type: "string" }
                }
              }
            },
            recomendacao: { type: "string" }
          }
        }
      });

      setValidacaoIA(resultado);
      
      if (!resultado.valido) {
        toast.warning("⚠️ IA detectou possíveis inconsistências");
      } else {
        toast.success("✅ Validação IA: Sem problemas detectados");
      }
    } catch (error) {
      toast.error("Erro na validação IA: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!formData.numero || !formData.cliente_fornecedor) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  const containerClass = windowMode 
    ? "w-full h-full flex flex-col overflow-hidden" 
    : "p-6";

  const contentClass = windowMode 
    ? "flex-1 overflow-y-auto p-6" 
    : "";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        <FormWrapper onSubmit={() => onSubmit && onSubmit(formData)} externalData={formData} className="space-y-6">
          {/* VALIDAÇÃO IA */}
          {validacaoIA && (
            <Alert className={validacaoIA.valido ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50"}>
              {validacaoIA.valido ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-orange-600" />
              )}
              <AlertDescription className="text-sm">
                <strong>Validação IA:</strong> {validacaoIA.recomendacao}
                {validacaoIA.alertas?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {validacaoIA.alertas.map((alerta, idx) => (
                      <li key={idx} className="text-xs">
                        • <strong>{alerta.tipo}:</strong> {alerta.descricao}
                      </li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="geral">📄 Geral</TabsTrigger>
              <TabsTrigger value="destinatario">👤 Destinatário</TabsTrigger>
              <TabsTrigger value="itens">📦 Itens</TabsTrigger>
              <TabsTrigger value="tributos">💰 Tributos</TabsTrigger>
              <TabsTrigger value="transporte">🚚 Transporte</TabsTrigger>
            </TabsList>

            {/* ABA GERAL */}
            <TabsContent value="geral" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NF-e (Saída)">NF-e (Saída)</SelectItem>
                      <SelectItem value="NF-e (Entrada)">NF-e (Entrada)</SelectItem>
                      <SelectItem value="NFC-e">NFC-e</SelectItem>
                      <SelectItem value="NFS-e">NFS-e</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Número *</Label>
                  <Input
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="Ex: 12345"
                    required
                  />
                </div>

                <div>
                  <Label>Série *</Label>
                  <Input
                    value={formData.serie}
                    onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                    placeholder="Ex: 1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data de Emissão *</Label>
                  <Input
                    type="date"
                    value={formData.data_emissao}
                    onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Data de Saída</Label>
                  <Input
                    type="date"
                    value={formData.data_saida}
                    onChange={(e) => setFormData({ ...formData, data_saida: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CFOP *</Label>
                  <Input
                    value={formData.cfop}
                    onChange={(e) => setFormData({ ...formData, cfop: e.target.value })}
                    placeholder="Ex: 5102"
                    required
                  />
                </div>

                <div>
                  <Label>Natureza da Operação *</Label>
                  <Input
                    value={formData.natureza_operacao}
                    onChange={(e) => setFormData({ ...formData, natureza_operacao: e.target.value })}
                    placeholder="Ex: Venda de mercadoria"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Finalidade</Label>
                  <Select
                    value={formData.finalidade}
                    onValueChange={(value) => setFormData({ ...formData, finalidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Complementar">Complementar</SelectItem>
                      <SelectItem value="Ajuste">Ajuste</SelectItem>
                      <SelectItem value="Devolução">Devolução</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ambiente</Label>
                  <Select
                    value={formData.ambiente}
                    onValueChange={(value) => setFormData({ ...formData, ambiente: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Homologação">Homologação</SelectItem>
                      <SelectItem value="Produção">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações internas"
                  rows={3}
                />
              </div>

              <div>
                <Label>Informações Complementares (inf. adicional NF-e)</Label>
                <Textarea
                  value={formData.informacoes_complementares}
                  onChange={(e) => setFormData({ ...formData, informacoes_complementares: e.target.value })}
                  placeholder="Informações adicionais que aparecerão na NF-e"
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* ABA DESTINATÁRIO */}
            <TabsContent value="destinatario" className="space-y-4">
              <div>
                <Label>Cliente/Fornecedor *</Label>
                <Input
                  value={formData.cliente_fornecedor}
                  onChange={(e) => setFormData({ ...formData, cliente_fornecedor: e.target.value })}
                  placeholder="Nome do cliente ou fornecedor"
                  required
                />
              </div>

              <div>
                <Label>CPF/CNPJ *</Label>
                <Input
                  value={formData.cliente_cpf_cnpj}
                  onChange={(e) => setFormData({ ...formData, cliente_cpf_cnpj: e.target.value })}
                  placeholder="Digite apenas números"
                  required
                />
              </div>

              <Card className="bg-slate-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Endereço do Destinatário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label className="text-xs">Logradouro</Label>
                      <Input
                        value={formData.cliente_endereco?.logradouro || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          cliente_endereco: { ...formData.cliente_endereco, logradouro: e.target.value }
                        })}
                        placeholder="Rua, Avenida..."
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Número</Label>
                      <Input
                        value={formData.cliente_endereco?.numero || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          cliente_endereco: { ...formData.cliente_endereco, numero: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Bairro</Label>
                      <Input
                        value={formData.cliente_endereco?.bairro || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          cliente_endereco: { ...formData.cliente_endereco, bairro: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Cidade</Label>
                      <Input
                        value={formData.cliente_endereco?.cidade || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          cliente_endereco: { ...formData.cliente_endereco, cidade: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Estado (UF)</Label>
                      <Input
                        value={formData.cliente_endereco?.estado || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          cliente_endereco: { ...formData.cliente_endereco, estado: e.target.value }
                        })}
                        maxLength={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA ITENS */}
            <TabsContent value="itens" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600">
                  {formData.itens?.length || 0} item(ns) na nota
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const novoItem = {
                      numero_item: (formData.itens?.length || 0) + 1,
                      descricao: "",
                      quantidade: 1,
                      valor_unitario: 0,
                      valor_total: 0,
                      cfop: formData.cfop,
                      unidade: "UN"
                    };
                    setFormData({
                      ...formData,
                      itens: [...(formData.itens || []), novoItem]
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              {formData.itens?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.itens.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.numero_item}</TableCell>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>R$ {item.valor_unitario?.toFixed(2)}</TableCell>
                        <TableCell>R$ {item.valor_total?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const novosItens = formData.itens.filter((_, i) => i !== idx);
                              setFormData({ ...formData, itens: novosItens });
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum item adicionado</p>
                  <p className="text-xs">Clique em "Adicionar Item" para começar</p>
                </div>
              )}
            </TabsContent>

            {/* ABA TRIBUTOS */}
            <TabsContent value="tributos" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Produtos</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_produtos}
                    onChange={(e) => setFormData({ ...formData, valor_produtos: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Valor Serviços</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_servicos}
                    onChange={(e) => setFormData({ ...formData, valor_servicos: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Desconto</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_desconto}
                    onChange={(e) => setFormData({ ...formData, valor_desconto: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Frete</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_frete}
                    onChange={(e) => setFormData({ ...formData, valor_frete: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Seguro</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_seguro}
                    onChange={(e) => setFormData({ ...formData, valor_seguro: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Outras Despesas</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.outras_despesas}
                    onChange={(e) => setFormData({ ...formData, outras_despesas: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">VALOR TOTAL DA NF-e</span>
                    <span className="text-2xl font-bold text-blue-600">
                      R$ {formData.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA TRANSPORTE */}
            <TabsContent value="transporte" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Modalidade de Frete</Label>
                  <Select
                    value={formData.transportadora?.modalidade_frete || "CIF"}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      transportadora: { ...formData.transportadora, modalidade_frete: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CIF">CIF - Por conta do emitente</SelectItem>
                      <SelectItem value="FOB">FOB - Por conta do destinatário</SelectItem>
                      <SelectItem value="Sem Frete">Sem Frete</SelectItem>
                      <SelectItem value="Próprio">Próprio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Transportadora</Label>
                  <Input
                    value={formData.transportadora?.nome || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      transportadora: { ...formData.transportadora, nome: e.target.value }
                    })}
                    placeholder="Nome da transportadora"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Volumes</Label>
                  <Input
                    type="number"
                    value={formData.transportadora?.volumes || 0}
                    onChange={(e) => setFormData({
                      ...formData,
                      transportadora: { ...formData.transportadora, volumes: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>

                <div>
                  <Label>Peso Bruto (kg)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.transportadora?.peso_bruto || 0}
                    onChange={(e) => setFormData({
                      ...formData,
                      transportadora: { ...formData.transportadora, peso_bruto: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>

                <div>
                  <Label>Peso Líquido (kg)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.transportadora?.peso_liquido || 0}
                    onChange={(e) => setFormData({
                      ...formData,
                      transportadora: { ...formData.transportadora, peso_liquido: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* FOOTER COM AÇÕES */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleValidarIA}
                disabled={loading}
              >
                <Calculator className="w-4 h-4 mr-2" />
                {loading ? "Validando..." : "Validar com IA"}
              </Button>

              {formData.status === "Rascunho" && (
                <Badge className="bg-yellow-100 text-yellow-700">
                  <Clock className="w-3 h-3 mr-1" />
                  Rascunho
                </Badge>
              )}
            </div>

            <div className="flex gap-3">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <FileText className="w-4 h-4 mr-2" />
                {notaFiscal ? 'Atualizar' : 'Salvar'} NF-e
              </Button>
            </div>
          </div>
        </FormWrapper>
      </div>
    </div>
  );
}