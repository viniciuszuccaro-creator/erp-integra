import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Settings, CheckCircle2, AlertTriangle, Sliders } from 'lucide-react';
import { toast } from 'sonner';

/**
 * V21.7 - CONFIGURAÇÃO DE AUTOMAÇÃO DO CICLO
 * Painel de controle para o sistema de automação
 */
export default function ConfiguracaoAutomacao() {
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ['config-automacao'],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoSistema.filter({ 
        chave: 'automacao_ciclo_pedidos' 
      });
      return configs[0];
    }
  });

  const [settings, setSettings] = useState({
    habilitado: config?.habilitado ?? true,
    modo: config?.modo ?? 'completo',
    auto_aprovacao: config?.auto_aprovacao ?? false,
    auto_faturamento: config?.auto_faturamento ?? true,
    auto_expedicao: config?.auto_expedicao ?? true,
    auto_notificacao: config?.auto_notificacao ?? true,
    intervalo_watcher_segundos: config?.intervalo_watcher_segundos ?? 8,
    max_pedidos_lote: config?.max_pedidos_lote ?? 5
  });

  const salvarMutation = useMutation({
    mutationFn: async (novasConfigs) => {
      if (config?.id) {
        return await base44.entities.ConfiguracaoSistema.update(config.id, {
          chave: 'automacao_ciclo_pedidos',
          valor: JSON.stringify(novasConfigs),
          ...novasConfigs
        });
      } else {
        return await base44.entities.ConfiguracaoSistema.create({
          chave: 'automacao_ciclo_pedidos',
          valor: JSON.stringify(novasConfigs),
          categoria: 'Automação',
          descricao: 'Configurações do sistema de automação de ciclo de pedidos',
          ...novasConfigs
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-automacao'] });
      toast.success('✅ Configurações salvas!');
    }
  });

  const handleSalvar = () => {
    salvarMutation.mutate(settings);
  };

  return (
    <div className="w-full h-full overflow-auto p-6 space-y-6">
      <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Sliders className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">⚙️ Configuração de Automação</CardTitle>
              <p className="text-sm text-slate-600">Sistema inteligente de ciclo automático V21.7</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status Atual */}
      <Alert className={settings.habilitado ? "bg-green-50 border-green-300" : "bg-slate-50 border-slate-300"}>
        <AlertDescription className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${settings.habilitado ? 'bg-green-600 animate-pulse' : 'bg-slate-400'}`} />
          <span className="font-semibold">
            {settings.habilitado ? '✅ Sistema de Automação ATIVO' : '⏸️ Sistema de Automação PAUSADO'}
          </span>
        </AlertDescription>
      </Alert>

      {/* Configurações Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🎯 Configurações Principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <Label className="text-base font-semibold">Sistema de Automação</Label>
              <p className="text-sm text-slate-600">Habilitar/desabilitar todas as automações</p>
            </div>
            <Switch
              checked={settings.habilitado}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, habilitado: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <Label className="text-base font-semibold">Modo de Automação</Label>
              <p className="text-sm text-slate-600">Escolha o nível de automação</p>
            </div>
            <select
              value={settings.modo}
              onChange={(e) => setSettings(prev => ({ ...prev, modo: e.target.value }))}
              className="p-2 border rounded-lg"
            >
              <option value="basico">🟡 Básico (apenas estoque)</option>
              <option value="intermediario">🟠 Intermediário (estoque + financeiro)</option>
              <option value="completo">🟢 Completo (TUDO automático)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Automações Específicas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🔧 Automações Específicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label>Auto-Aprovação (sem desconto)</Label>
              <p className="text-xs text-slate-600">Aprovar automaticamente pedidos sem desconto</p>
            </div>
            <Switch
              checked={settings.auto_aprovacao}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_aprovacao: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label>Auto-Faturamento</Label>
              <p className="text-xs text-slate-600">Gerar NF-e automaticamente (homologação)</p>
            </div>
            <Switch
              checked={settings.auto_faturamento}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_faturamento: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label>Auto-Expedição</Label>
              <p className="text-xs text-slate-600">Criar entregas e avançar automaticamente</p>
            </div>
            <Switch
              checked={settings.auto_expedicao}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_expedicao: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label>Auto-Notificação</Label>
              <p className="text-xs text-slate-600">Notificar clientes automaticamente</p>
            </div>
            <Switch
              checked={settings.auto_notificacao}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_notificacao: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">⚡ Configurações Avançadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Intervalo do Watcher (segundos)</Label>
            <p className="text-xs text-slate-600 mb-2">Frequência de verificação automática</p>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.intervalo_watcher_segundos}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                intervalo_watcher_segundos: parseInt(e.target.value) 
              }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <Label>Máx. Pedidos por Lote</Label>
            <p className="text-xs text-slate-600 mb-2">Quantos pedidos processar por vez</p>
            <input
              type="number"
              min="1"
              max="20"
              value={settings.max_pedidos_lote}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                max_pedidos_lote: parseInt(e.target.value) 
              }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Avisos */}
      {settings.modo === 'completo' && (
        <Alert className="bg-orange-50 border-orange-300">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-900">
            <strong>Modo Completo Ativo:</strong> O sistema irá executar TODAS as etapas automaticamente,
            incluindo geração de NF-e em homologação e criação de entregas.
          </AlertDescription>
        </Alert>
      )}

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSalvar}
          disabled={salvarMutation.isPending}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {salvarMutation.isPending ? 'Salvando...' : '💾 Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}