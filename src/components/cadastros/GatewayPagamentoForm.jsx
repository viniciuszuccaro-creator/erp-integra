import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Zap, Shield, Settings } from "lucide-react";

export default function GatewayPagamentoForm({ gateway, onSubmit, windowMode = false }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(gateway || {
    nome: "",
    provedor: "Asaas",
    tipos_pagamento_suportados: ["Boleto", "PIX"],
    chave_api_publica: "",
    chave_api_secreta: "",
    ambiente: "Homologação",
    url_api_base: "",
    url_webhook: "",
    webhook_secret: "",
    configuracoes_boleto: {
      dias_vencimento_padrao: 3,
      instrucoes_padrao: "",
      multa_apos_vencimento_percent: 2,
      juros_ao_dia_percent: 0.033
    },
    configuracoes_pix: {
      chave_pix: "",
      tipo_chave: "CNPJ",
      tempo_expiracao_minutos: 1440
    },
    configuracoes_cartao: {
      aceita_credito: true,
      aceita_debito: true,
      parcelas_maximas: 12,
      taxa_credito_percent: 0,
      taxa_debito_percent: 0
    },
    status_integracao: "Em Teste"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (onSubmit) {
      await onSubmit(formData);
    } else {
      if (gateway) {
        await base44.entities.GatewayPagamento.update(gateway.id, formData);
      } else {
        await base44.entities.GatewayPagamento.create(formData);
      }
      queryClient.invalidateQueries({ queryKey: ['gateways-pagamento'] });
      toast({ title: "✅ Gateway configurado!" });
    }
  };

  const toggleTipoPagamento = (tipo) => {
    const tipos = formData.tipos_pagamento_suportados || [];
    setFormData({
      ...formData,
      tipos_pagamento_suportados: tipos.includes(tipo)
        ? tipos.filter(t => t !== tipo)
        : [...tipos, tipo]
    });
  };

  return (
    <div className={windowMode ? "w-full h-full overflow-y-auto p-6" : ""}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Informações do Gateway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Gateway *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Asaas Produção"
                  required
                />
              </div>
              <div>
                <Label>Provedor *</Label>
                <Select value={formData.provedor} onValueChange={(v) => setFormData({ ...formData, provedor: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asaas">Asaas</SelectItem>
                    <SelectItem value="Pagar.me">Pagar.me</SelectItem>
                    <SelectItem value="Stripe">Stripe</SelectItem>
                    <SelectItem value="Juno">Juno</SelectItem>
                    <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                    <SelectItem value="PagSeguro">PagSeguro</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chave API Pública *</Label>
                <Input
                  value={formData.chave_api_publica}
                  onChange={(e) => setFormData({ ...formData, chave_api_publica: e.target.value })}
                  placeholder="pk_..."
                  required
                />
              </div>
              <div>
                <Label>Chave API Secreta *</Label>
                <Input
                  type="password"
                  value={formData.chave_api_secreta}
                  onChange={(e) => setFormData({ ...formData, chave_api_secreta: e.target.value })}
                  placeholder="sk_..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ambiente *</Label>
                <Select value={formData.ambiente} onValueChange={(v) => setFormData({ ...formData, ambiente: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Produção">Produção</SelectItem>
                    <SelectItem value="Homologação">Homologação</SelectItem>
                    <SelectItem value="Sandbox">Sandbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status_integracao} onValueChange={(v) => setFormData({ ...formData, status_integracao: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                    <SelectItem value="Em Teste">Em Teste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Tipos de Pagamento Suportados *</Label>
              <div className="grid grid-cols-3 gap-2">
                {["Boleto", "PIX", "Cartão Crédito", "Cartão Débito", "Link Pagamento"].map(tipo => (
                  <div key={tipo} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.tipos_pagamento_suportados?.includes(tipo)}
                      onCheckedChange={() => toggleTipoPagamento(tipo)}
                    />
                    <Label className="text-xs">{tipo}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="boleto" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="boleto">Boleto</TabsTrigger>
            <TabsTrigger value="pix">PIX</TabsTrigger>
            <TabsTrigger value="cartao">Cartão</TabsTrigger>
          </TabsList>

          <TabsContent value="boleto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações de Boleto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Dias p/ Vencimento</Label>
                    <Input
                      type="number"
                      value={formData.configuracoes_boleto?.dias_vencimento_padrao}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes_boleto: {
                          ...formData.configuracoes_boleto,
                          dias_vencimento_padrao: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Multa (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.configuracoes_boleto?.multa_apos_vencimento_percent}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes_boleto: {
                          ...formData.configuracoes_boleto,
                          multa_apos_vencimento_percent: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Juros ao Dia (%)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.configuracoes_boleto?.juros_ao_dia_percent}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes_boleto: {
                          ...formData.configuracoes_boleto,
                          juros_ao_dia_percent: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Instruções Padrão</Label>
                  <Textarea
                    value={formData.configuracoes_boleto?.instrucoes_padrao}
                    onChange={(e) => setFormData({
                      ...formData,
                      configuracoes_boleto: {
                        ...formData.configuracoes_boleto,
                        instrucoes_padrao: e.target.value
                      }
                    })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pix">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações de PIX</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Chave PIX</Label>
                    <Input
                      value={formData.configuracoes_pix?.chave_pix}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes_pix: {
                          ...formData.configuracoes_pix,
                          chave_pix: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Tipo de Chave</Label>
                    <Select 
                      value={formData.configuracoes_pix?.tipo_chave} 
                      onValueChange={(v) => setFormData({
                        ...formData,
                        configuracoes_pix: {
                          ...formData.configuracoes_pix,
                          tipo_chave: v
                        }
                      })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                        <SelectItem value="Email">E-mail</SelectItem>
                        <SelectItem value="Telefone">Telefone</SelectItem>
                        <SelectItem value="Aleatória">Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cartao">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações de Cartão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.configuracoes_cartao?.aceita_credito}
                      onCheckedChange={(v) => setFormData({
                        ...formData,
                        configuracoes_cartao: {
                          ...formData.configuracoes_cartao,
                          aceita_credito: v
                        }
                      })}
                    />
                    <Label>Aceita Crédito</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.configuracoes_cartao?.aceita_debito}
                      onCheckedChange={(v) => setFormData({
                        ...formData,
                        configuracoes_cartao: {
                          ...formData.configuracoes_cartao,
                          aceita_debito: v
                        }
                      })}
                    />
                    <Label>Aceita Débito</Label>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Parcelas Máximas</Label>
                    <Input
                      type="number"
                      value={formData.configuracoes_cartao?.parcelas_maximas}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes_cartao: {
                          ...formData.configuracoes_cartao,
                          parcelas_maximas: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Taxa Crédito (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.configuracoes_cartao?.taxa_credito_percent}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes_cartao: {
                          ...formData.configuracoes_cartao,
                          taxa_credito_percent: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Taxa Débito (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.configuracoes_cartao?.taxa_debito_percent}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuracoes_cartao: {
                          ...formData.configuracoes_cartao,
                          taxa_debito_percent: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="submit" className="bg-blue-600">
            {gateway ? 'Atualizar Gateway' : 'Criar Gateway'}
          </Button>
        </div>
      </form>
    </div>
  );
}