import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Database,
  Shield,
  Building2
} from 'lucide-react';

/**
 * CONFIGURAÇÃO ISOLAMENTO EMPRESA
 * Painel para verificar e configurar isolamento de dados por empresa
 */

export default function ConfiguracaoIsolamentoEmpresa() {
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-isolamento'],
    queryFn: () => base44.entities.Empresa.list()
  });

  const { data: configs = [], refetch: refetchConfigs } = useQuery({
    queryKey: ['configs-empresa', empresaSelecionada],
    queryFn: async () => {
      if (!empresaSelecionada) return [];

      const results = await Promise.all([
        base44.entities.ConfigFiscalEmpresa.filter({ empresa_id: empresaSelecionada }).catch(() => []),
        base44.entities.ConfiguracaoGatewayPagamento.filter({ empresa_id: empresaSelecionada }).catch(() => []),
        base44.entities.ConfiguracaoProducao.filter({ empresa_id: empresaSelecionada }).catch(() => []),
        base44.entities.ParametroPortalCliente.filter({ empresa_id: empresaSelecionada }).catch(() => []),
        base44.entities.ConfiguracaoNFe.filter({ empresa_id: empresaSelecionada }).catch(() => []),
        base44.entities.ConfiguracaoBoletos.filter({ empresa_id: empresaSelecionada }).catch(() => []),
        base44.entities.ContaBancariaEmpresa.filter({ empresa_id: empresaSelecionada }).catch(() => [])
      ]);

      return [
        { nome: 'ConfigFiscalEmpresa', count: results[0].length },
        { nome: 'ConfiguracaoGatewayPagamento', count: results[1].length },
        { nome: 'ConfiguracaoProducao', count: results[2].length },
        { nome: 'ParametroPortalCliente', count: results[3].length },
        { nome: 'ConfiguracaoNFe', count: results[4].length },
        { nome: 'ConfiguracaoBoletos', count: results[5].length },
        { nome: 'ContaBancariaEmpresa', count: results[6].length }
      ];
    },
    enabled: !!empresaSelecionada
  });

  const configsCompletas = configs.filter(c => c.count > 0).length;
  const configsTotal = configs.length;
  const percentualConfig = configsTotal > 0 ? Math.round((configsCompletas / configsTotal) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Isolamento de Configurações</h2>
          <p className="text-sm text-slate-600">Validação por Empresa</p>
        </div>
      </div>

      {/* Seletor de Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione uma Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={empresaSelecionada} onValueChange={setEmpresaSelecionada}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha uma empresa para validar..." />
            </SelectTrigger>
            <SelectContent>
              {empresas.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {emp.nome_fantasia || emp.razao_social}
                    <Badge variant="outline" className="ml-2">
                      {emp.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Resultado da Validação */}
      {empresaSelecionada && (
        <>
          <Card className={`border-2 ${
            percentualConfig === 100 
              ? 'border-green-400 bg-green-50'
              : percentualConfig >= 50
              ? 'border-yellow-400 bg-yellow-50'
              : 'border-red-400 bg-red-50'
          }`}>
            <CardContent className="p-6 text-center">
              {percentualConfig === 100 ? (
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-3" />
              ) : (
                <AlertTriangle className="w-12 h-12 mx-auto text-yellow-600 mb-3" />
              )}
              <h3 className="text-2xl font-bold mb-2">
                {configsCompletas} / {configsTotal} Configurações
              </h3>
              <Badge className={
                percentualConfig === 100 ? 'bg-green-600' :
                percentualConfig >= 50 ? 'bg-yellow-600' :
                'bg-red-600'
              }>
                {percentualConfig}% Configurado
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {configs.map((config) => (
                  <div
                    key={config.nome}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      config.count > 0 
                        ? 'bg-green-50 border-green-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {config.count > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Database className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="font-medium text-slate-900">{config.nome}</span>
                    </div>
                    <Badge variant={config.count > 0 ? "default" : "outline"}>
                      {config.count} {config.count === 1 ? 'registro' : 'registros'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {percentualConfig < 100 && (
            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertDescription>
                <strong>Recomendação:</strong> Configure todas as entidades de parâmetros e configurações
                para garantir operação completa desta empresa.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}