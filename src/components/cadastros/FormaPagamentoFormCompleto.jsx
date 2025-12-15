import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, CreditCard, Settings, Zap, CheckCircle2, Percent, Calendar, Landmark, Building2, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { toast } from 'sonner';

export default function FormaPagamentoFormCompleto({ formaPagamento, onSubmit, windowMode = false }) {
  const [abaAtiva, setAbaAtiva] = useState('geral');
  const { empresaAtual, contextoAtual } = useContextoVisual();
  
  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => base44.entities.Banco.list(),
  });

  const [formData, setFormData] = useState(() => formaPagamento || {
    group_id: contextoAtual === 'grupo' ? empresaAtual?.group_id : undefined,
    empresa_id: contextoAtual === 'empresa' ? empresaAtual?.id : undefined,
    codigo: '',
    descricao: '',
    tipo: 'Dinheiro',
    ativa: true,
    aceita_desconto: true,
    percentual_desconto_padrao: 0,
    aplicar_acrescimo: false,
    percentual_acrescimo_padrao: 0,
    prazo_compensacao_dias: 0,
    gerar_cobranca_online: false,
    integracao_obrigatoria: false,
    permite_parcelamento: false,
    maximo_parcelas: 1,
    intervalo_parcelas_dias: 30,
    taxa_por_parcela: 0,
    icone: '💵',
    cor: '#10b981',
    ordem_exibicao: 0,
    disponivel_ecommerce: false,
    disponivel_pdv: true,
    observacoes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.descricao) {
      toast.error('Preencha código e descrição');
      return;
    }

    onSubmit(formData);
  };

  const tiposPagamento = [
    'Dinheiro', 'PIX', 'Boleto', 'Cartão Crédito', 'Cartão Débito', 
    'Transferência', 'Cheque', 'Crédito em Conta', 'Fidelidade/Cashback', 'Outro'
  ];

  const iconesDisponiveis = [
    { icon: '💵', label: 'Dinheiro' },
    { icon: '⚡', label: 'PIX' },
    { icon: '📄', label: 'Boleto' },
    { icon: '💳', label: 'Cartão' },
    { icon: '🏦', label: 'Banco' },
    { icon: '📝', label: 'Cheque' },
    { icon: '🎁', label: 'Crédito' },
    { icon: '🏆', label: 'Fidelidade' }
  ];

  const content = (
    <form onSubmit={handleSubmit} className={`${windowMode ? 'h-full overflow-auto p-6' : 'p-6'}`}>
      <Alert className="mb-6 border-blue-300 bg-blue-50">
        <AlertDescription className="text-sm text-blue-900">
          <strong>🏦 Forma de Pagamento:</strong> Configure métodos aceitos em PDV, Pedidos, E-commerce e Portal
        </AlertDescription>
      </Alert>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-4 w-full bg-slate-100">
          <TabsTrigger value="geral">
            <CreditCard className="w-4 h-4 mr-1" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <DollarSign className="w-4 h-4 mr-1" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="parcelamento">
            <Calendar className="w-4 h-4 mr-1" />
            Parcelamento
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="w-4 h-4 mr-1" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: GERAL */}
        <TabsContent value="geral" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código *</Label>
              <Input
                value={formData.codigo}
                onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                placeholder="Ex: FP001"
                required
              />
            </div>

            <div>
              <Label>Descrição *</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Ex: PIX"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo Base *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(v) => setFormData({...formData, tipo: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tiposPagamento.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ícone</Label>
              <Select
                value={formData.icone}
                onValueChange={(v) => setFormData({...formData, icone: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {iconesDisponiveis.map(({ icon, label }) => (
                    <SelectItem key={icon} value={icon}>
                      {icon} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Cor (Hex)</Label>
              <Input
                value={formData.cor}
                onChange={(e) => setFormData({...formData, cor: e.target.value})}
                placeholder="#10b981"
              />
            </div>

            <div>
              <Label>Ordem Exibição</Label>
              <Input
                type="number"
                value={formData.ordem_exibicao}
                onChange={(e) => setFormData({...formData, ordem_exibicao: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={formData.ativa}
                onCheckedChange={(v) => setFormData({...formData, ativa: v})}
              />
              <Label>Ativa</Label>
            </div>
          </div>
        </TabsContent>

        {/* ABA 2: FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-semibold">Permite Desconto</Label>
                  <Switch
                    checked={formData.aceita_desconto}
                    onCheckedChange={(v) => setFormData({...formData, aceita_desconto: v})}
                  />
                </div>
                {formData.aceita_desconto && (
                  <div>
                    <Label className="text-xs">% Desconto Padrão</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.percentual_desconto_padrao}
                        onChange={(e) => setFormData({...formData, percentual_desconto_padrao: parseFloat(e.target.value) || 0})}
                      />
                      <Percent className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-semibold">Aplicar Acréscimo</Label>
                  <Switch
                    checked={formData.aplicar_acrescimo}
                    onCheckedChange={(v) => setFormData({...formData, aplicar_acrescimo: v})}
                  />
                </div>
                {formData.aplicar_acrescimo && (
                  <div>
                    <Label className="text-xs">% Acréscimo Padrão (Taxa)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.percentual_acrescimo_padrao}
                        onChange={(e) => setFormData({...formData, percentual_acrescimo_padrao: parseFloat(e.target.value) || 0})}
                      />
                      <Percent className="w-4 h-4 text-orange-600" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Label>Prazo de Compensação (dias)</Label>
            <Input
              type="number"
              min="0"
              value={formData.prazo_compensacao_dias}
              onChange={(e) => setFormData({...formData, prazo_compensacao_dias: parseInt(e.target.value) || 0})}
            />
            <p className="text-xs text-slate-500 mt-1">Dias até o dinheiro entrar na conta</p>
          </div>
        </TabsContent>

        {/* ABA 3: PARCELAMENTO */}
        <TabsContent value="parcelamento" className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div>
              <Label className="font-semibold">Permite Parcelamento</Label>
              <p className="text-xs text-slate-500">Habilitar pagamento em múltiplas parcelas</p>
            </div>
            <Switch
              checked={formData.permite_parcelamento}
              onCheckedChange={(v) => setFormData({...formData, permite_parcelamento: v})}
            />
          </div>

          {formData.permite_parcelamento && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Máximo de Parcelas</Label>
                  <Input
                    type="number"
                    min="2"
                    max="36"
                    value={formData.maximo_parcelas}
                    onChange={(e) => setFormData({...formData, maximo_parcelas: parseInt(e.target.value) || 1})}
                  />
                </div>

                <div>
                  <Label>Intervalo (dias)</Label>
                  <Input
                    type="number"
                    min="7"
                    max="90"
                    value={formData.intervalo_parcelas_dias}
                    onChange={(e) => setFormData({...formData, intervalo_parcelas_dias: parseInt(e.target.value) || 30})}
                  />
                </div>

                <div>
                  <Label>Taxa por Parcela (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.taxa_por_parcela}
                    onChange={(e) => setFormData({...formData, taxa_por_parcela: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <Alert className="border-purple-300 bg-purple-50">
                <AlertDescription className="text-xs text-purple-900">
                  <strong>Exemplo:</strong> Valor de R$ 1.200,00 em {formData.maximo_parcelas}x = 
                  {formData.maximo_parcelas > 0 ? ` ${formData.maximo_parcelas}x de R$ ${(1200 / formData.maximo_parcelas).toFixed(2)}` : ' -'}
                  {formData.taxa_por_parcela > 0 && ` + ${formData.taxa_por_parcela}% taxa/parcela`}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </TabsContent>

        {/* ABA 4: CONFIGURAÇÕES */}
        <TabsContent value="config" className="space-y-4 mt-4">
          {/* ESCOPO MULTIEMPRESA */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <Label className="font-semibold">Escopo Multiempresa</Label>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Contexto: {contextoAtual === 'grupo' ? '🏢 Grupo Empresarial' : '🏪 Empresa Individual'}
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <Label className="font-semibold">Gerar Cobrança Online</Label>
              <p className="text-xs text-slate-500">Requer integração com gateway (Boleto/PIX)</p>
            </div>
            <Switch
              checked={formData.gerar_cobranca_online}
              onCheckedChange={(v) => setFormData({...formData, gerar_cobranca_online: v})}
            />
          </div>

          {formData.gerar_cobranca_online && bancos.length > 0 && (
            <div>
              <Label>Banco Vinculado (Boleto/PIX)</Label>
              <Select
                value={formData.banco_vinculado_id || ''}
                onValueChange={(v) => setFormData({...formData, banco_vinculado_id: v})}
              >
                <SelectTrigger><SelectValue placeholder="Selecione o banco..." /></SelectTrigger>
                <SelectContent>
                  {bancos.map(banco => (
                    <SelectItem key={banco.id} value={banco.id}>
                      <Landmark className="w-4 h-4 inline mr-2" />
                      {banco.nome_banco} - Ag: {banco.agencia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div>
              <Label className="font-semibold">Integração Obrigatória</Label>
              <p className="text-xs text-slate-500">Bloquear uso sem integração ativa</p>
            </div>
            <Switch
              checked={formData.integracao_obrigatoria}
              onCheckedChange={(v) => setFormData({...formData, integracao_obrigatoria: v})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
              <div>
                <Label className="font-semibold">Disponível no PDV</Label>
                <p className="text-xs text-slate-500">Aparece no Caixa PDV</p>
              </div>
              <Switch
                checked={formData.disponivel_pdv}
                onCheckedChange={(v) => setFormData({...formData, disponivel_pdv: v})}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
              <div>
                <Label className="font-semibold">Disponível no E-commerce</Label>
                <p className="text-xs text-slate-500">Aparece no Site/Portal</p>
              </div>
              <Switch
                checked={formData.disponivel_ecommerce}
                onCheckedChange={(v) => setFormData({...formData, disponivel_ecommerce: v})}
              />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Observações sobre uso desta forma de pagamento..."
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* PREVIEW */}
      <Card className="mt-6 border-2" style={{ borderColor: formData.cor }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: formData.cor + '20' }}
              >
                {formData.icone}
              </div>
              <div>
                <p className="font-bold text-lg">{formData.descricao || 'Nome da Forma'}</p>
                <div className="flex gap-2 mt-1">
                  <Badge className="text-xs">{formData.tipo}</Badge>
                  {formData.aceita_desconto && formData.percentual_desconto_padrao > 0 && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      -{formData.percentual_desconto_padrao}%
                    </Badge>
                  )}
                  {formData.aplicar_acrescimo && formData.percentual_acrescimo_padrao > 0 && (
                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                      +{formData.percentual_acrescimo_padrao}%
                    </Badge>
                  )}
                  {formData.permite_parcelamento && (
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      Até {formData.maximo_parcelas}x
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge className={formData.ativa ? 'bg-green-600' : 'bg-red-600'}>
              {formData.ativa ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* BOTÃO SUBMIT */}
      <div className="flex justify-end gap-3 pt-6 border-t mt-6">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {formaPagamento ? 'Atualizar Forma' : 'Criar Forma'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}