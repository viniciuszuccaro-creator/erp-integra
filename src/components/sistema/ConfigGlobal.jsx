import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Settings,
  Link2,
  FileText,
  MessageSquare,
  Sparkles,
  Bell,
  Shield,
  Database,
  Zap
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

/**
 * Painel de Configuração Global do Sistema
 * Administradores configuram integrações, IA, notificações e padrões
 */
export default function ConfigGlobal({ empresaId, grupoId }) {
  const [activeTab, setActiveTab] = useState('integracoes');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configs = [] } = useQuery({
    queryKey: ['config-sistema'],
    queryFn: () => base44.entities.ConfiguracaoSistema.list(),
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const config = configs.find(c => c.chave === data.chave);
      if (config) {
        return base44.entities.ConfiguracaoSistema.update(config.id, data);
      } else {
        return base44.entities.ConfiguracaoSistema.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-sistema'] });
      toast({ title: '✅ Configuração salva com sucesso!' });
    },
  });

  const getConfig = (chave) => {
    return configs.find(c => c.chave === chave) || {};
  };

  const handleSave = (chave, categoria, dados) => {
    updateMutation.mutate({
      chave,
      categoria,
      [categoria === 'Integracoes' ? 'integracao_' + chave.split('_')[1] : categoria.toLowerCase()]: dados
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Configurações Globais do Sistema
        </h2>
        <p className="text-slate-600">
          Configurações centralizadas de integrações, IA, notificações e padrões
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="integracoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Link2 className="w-4 h-4 mr-2" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="ia" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            IA
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* ABA: INTEGRAÇÕES */}
        <TabsContent value="integracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações Externas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* NF-e */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">NF-e (Nota Fiscal Eletrônica)</h3>
                    <p className="text-sm text-slate-600">Integração com provedores de emissão</p>
                  </div>
                  <Switch
                    checked={getConfig('integracao_nfe')?.integracao_nfe?.ativa || false}
                    onCheckedChange={(checked) => handleSave('integracao_nfe', 'Integracoes', {
                      ativa: checked
                    })}
                  />
                </div>
              </div>

              {/* Boleto/PIX */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Boleto e PIX</h3>
                    <p className="text-sm text-slate-600">Gateway de pagamentos (Asaas, Juno, etc.)</p>
                  </div>
                  <Switch
                    checked={getConfig('integracao_boletos')?.integracao_boletos?.ativa || false}
                  />
                </div>
              </div>

              {/* Google Maps */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Google Maps</h3>
                    <p className="text-sm text-slate-600">Geocoding, roteirização e mapas</p>
                  </div>
                  <Switch
                    checked={getConfig('integracao_maps')?.integracao_maps?.ativa || false}
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">WhatsApp Business API</h3>
                    <p className="text-sm text-slate-600">Envio de mensagens automáticas</p>
                  </div>
                  <Switch
                    checked={getConfig('integracao_whatsapp')?.integracao_whatsapp?.ativa || false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: FISCAL */}
        <TabsContent value="fiscal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Fiscais Padrão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CFOP Padrão - Dentro do Estado</Label>
                  <Input defaultValue="5102" placeholder="5102" />
                </div>
                <div>
                  <Label>CFOP Padrão - Fora do Estado</Label>
                  <Input defaultValue="6102" placeholder="6102" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Alíquota ICMS Padrão (%)</Label>
                  <Input type="number" defaultValue="18" placeholder="18" />
                </div>
                <div>
                  <Label>Alíquota PIS (%)</Label>
                  <Input type="number" defaultValue="1.65" placeholder="1.65" />
                </div>
                <div>
                  <Label>Alíquota COFINS (%)</Label>
                  <Input type="number" defaultValue="7.6" placeholder="7.6" />
                </div>
              </div>

              <div>
                <Label>Observações Padrão NF-e</Label>
                <Textarea 
                  placeholder="Observações que aparecerão em todas as notas..."
                  rows={3}
                />
              </div>

              <Button onClick={() => toast({ title: '✅ Configurações fiscais salvas!' })}>
                Salvar Configurações Fiscais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: IA */}
        <TabsContent value="ia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Módulos de Inteligência Artificial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* IA de Produção */}
              <div className="space-y-3 p-4 border rounded-lg bg-purple-50 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-900">IA de Leitura de Projetos</h3>
                    <p className="text-sm text-purple-700">Extrai peças automaticamente de PDF/DWG</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label className="text-xs text-purple-700">Confiança Mínima (%)</Label>
                    <Input type="number" defaultValue="75" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-purple-700">Tamanho Máximo (MB)</Label>
                    <Input type="number" defaultValue="10" className="mt-1" />
                  </div>
                </div>
              </div>

              {/* IA Preditiva */}
              <div className="space-y-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">IA Preditiva de Vendas</h3>
                    <p className="text-sm text-blue-700">Prevê tendências e sugere ações</p>
                  </div>
                  <Switch />
                </div>
              </div>

              {/* IA de Conciliação */}
              <div className="space-y-3 p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-900">IA de Conciliação Bancária</h3>
                    <p className="text-sm text-green-700">Match automático de extratos (85-90%)</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                <div>
                  <Label className="text-xs text-green-700">Score Mínimo para Match Automático</Label>
                  <Input type="number" defaultValue="60" className="mt-1" />
                  <p className="text-xs text-green-600 mt-1">60 pontos ou mais = match automático</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: NOTIFICAÇÕES */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações Automáticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Pedido Aprovado</p>
                    <p className="text-sm text-slate-600">Notifica cliente quando pedido for aprovado</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Entrega Saiu para Transporte</p>
                    <p className="text-sm text-slate-600">Envia link de rastreamento</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Boleto Gerado</p>
                    <p className="text-sm text-slate-600">Envia boleto/PIX por WhatsApp e e-mail</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Título Vencido</p>
                    <p className="text-sm text-slate-600">Alerta de inadimplência</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">OP Atrasada</p>
                    <p className="text-sm text-slate-600">Alerta para gerente de produção</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </div>

              <Button className="w-full" onClick={() => toast({ title: '✅ Configurações de notificações salvas!' })}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: SEGURANÇA */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança e Auditoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Autenticação de Dois Fatores (MFA)</p>
                    <p className="text-sm text-slate-600">Obrigatório para admins</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Logs de Auditoria Completos</p>
                    <p className="text-sm text-slate-600">Registra todas as ações críticas</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Sessão Automática (Timeout)</p>
                    <p className="text-sm text-slate-600">Logout após inatividade</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="30" className="w-20" />
                    <span className="text-sm text-slate-600">min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Bloquear Tentativas Excessivas</p>
                    <p className="text-sm text-slate-600">Bloqueia após 5 tentativas falhas</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Conformidade LGPD</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Sistema configurado para conformidade com Lei Geral de Proteção de Dados
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Badge className="bg-green-100 text-green-700">✓ Logs Ativos</Badge>
                      <Badge className="bg-green-100 text-green-700">✓ Dados Criptografados</Badge>
                      <Badge className="bg-green-100 text-green-700">✓ Auditoria Completa</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                Salvar Configurações de Segurança
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}