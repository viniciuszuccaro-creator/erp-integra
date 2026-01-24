import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Play, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

/**
 * VALIDADOR SISTEMA ETAPA 1 - TESTES AUTOMATIZADOS
 * Executa testes de validação da implementação completa
 */

export default function ValidadorSistemaETAPA1() {
  const [testando, setTestando] = useState(false);
  const [resultados, setResultados] = useState(null);
  const { toast } = useToast();

  const executarTestes = async () => {
    setTestando(true);
    toast({ title: '🧪 Executando testes...' });

    const testes = {};

    try {
      // Teste 1: RBAC Backend existe
      try {
        await base44.functions.invoke('rbacValidator', {
          module: 'Teste',
          action: 'visualizar'
        });
        testes.rbacBackend = true;
      } catch {
        testes.rbacBackend = false;
      }

      // Teste 2: Multiempresa Backend existe
      try {
        await base44.functions.invoke('multiempresaValidator', {
          operation: 'create',
          entityName: 'Teste',
          data: {}
        });
        testes.multiempresaBackend = true;
      } catch {
        testes.multiempresaBackend = false;
      }

      // Teste 3: Entity Operation Guard existe
      try {
        await base44.functions.invoke('entityOperationGuard', {
          operation: 'create',
          entityName: 'Teste',
          data: {}
        });
        testes.entityGuard = true;
      } catch {
        testes.entityGuard = false;
      }

      // Teste 4: Audit Helper existe
      try {
        await base44.functions.invoke('auditHelper', {
          acao: 'Teste',
          modulo: 'Validador',
          entidade: 'Sistema',
          descricao: 'Teste automatizado'
        });
        testes.auditHelper = true;
      } catch {
        testes.auditHelper = false;
      }

      // Teste 5: Perfis de acesso existem
      const perfis = await base44.entities.PerfilAcesso.list();
      testes.perfisExistem = perfis.length > 0;

      // Teste 6: Empresas cadastradas
      const empresas = await base44.entities.Empresa.list();
      testes.empresasExistem = empresas.length > 0;

      // Teste 7: Auditoria funcionando
      const logs = await base44.entities.AuditLog.list('-created_date', 10);
      testes.auditFuncionando = logs.length > 0;

      // Teste 8: Wrappers de auditoria existem
      try {
        await base44.functions.invoke('automationAuditWrapper', {
          automationName: 'Teste',
          automationType: 'test'
        });
        testes.automationAudit = true;
      } catch {
        testes.automationAudit = false;
      }

      // Teste 9: IA Audit existe
      try {
        await base44.functions.invoke('iaAuditWrapper', {
          prompt: 'Teste',
          model: 'test'
        });
        testes.iaAudit = true;
      } catch {
        testes.iaAudit = false;
      }

      // Teste 10: Chatbot Audit existe
      try {
        await base44.functions.invoke('chatbotAuditWrapper', {
          conversaId: 'test'
        });
        testes.chatbotAudit = true;
      } catch {
        testes.chatbotAudit = false;
      }

      // Teste 11: SoD Validator existe
      try {
        await base44.functions.invoke('sodValidator', {
          perfilId: 'test',
          test: true
        });
        testes.sodValidator = true;
      } catch {
        testes.sodValidator = false;
      }

      // Teste 12: Security Alerts existe
      try {
        await base44.functions.invoke('securityAlerts', {});
        testes.securityAlerts = true;
      } catch {
        testes.securityAlerts = false;
      }

      setResultados(testes);

      const total = Object.keys(testes).length;
      const aprovados = Object.values(testes).filter(Boolean).length;
      
      toast({
        title: aprovados === total ? '✅ Todos os testes passaram!' : '⚠️ Alguns testes falharam',
        description: `${aprovados}/${total} testes aprovados`
      });

    } catch (error) {
      toast({
        title: '❌ Erro ao executar testes',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setTestando(false);
    }
  };

  const testesConfig = [
    { key: 'rbacBackend', label: 'RBAC Backend Validator', categoria: 'Backend' },
    { key: 'multiempresaBackend', label: 'Multiempresa Validator', categoria: 'Backend' },
    { key: 'entityGuard', label: 'Entity Operation Guard', categoria: 'Backend' },
    { key: 'auditHelper', label: 'Audit Helper', categoria: 'Backend' },
    { key: 'automationAudit', label: 'Automation Audit Wrapper', categoria: 'Backend' },
    { key: 'iaAudit', label: 'IA Audit Wrapper', categoria: 'Backend' },
    { key: 'chatbotAudit', label: 'Chatbot Audit Wrapper', categoria: 'Backend' },
    { key: 'sodValidator', label: 'SoD Validator', categoria: 'Backend' },
    { key: 'securityAlerts', label: 'Security Alerts', categoria: 'Backend' },
    { key: 'perfisExistem', label: 'Perfis de Acesso Cadastrados', categoria: 'Dados' },
    { key: 'empresasExistem', label: 'Empresas Cadastradas', categoria: 'Dados' },
    { key: 'auditFuncionando', label: 'Sistema de Auditoria Ativo', categoria: 'Dados' }
  ];

  const totalPassed = resultados ? Object.values(resultados).filter(Boolean).length : 0;
  const totalTests = testesConfig.length;
  const percentual = resultados ? Math.round((totalPassed / totalTests) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Validador Automatizado</h2>
          <p className="text-sm text-slate-600">Testes de Conformidade ETAPA 1</p>
        </div>
        <Button onClick={executarTestes} disabled={testando}>
          <Play className="w-4 h-4 mr-2" />
          {testando ? 'Testando...' : 'Executar Testes'}
        </Button>
      </div>

      {resultados && (
        <>
          <Card className={`border-2 ${
            percentual === 100 ? 'border-green-400 bg-green-50' :
            percentual >= 80 ? 'border-yellow-400 bg-yellow-50' :
            'border-red-400 bg-red-50'
          }`}>
            <CardContent className="p-6 text-center">
              <h3 className="text-4xl font-bold mb-2">{percentual}%</h3>
              <p className="text-lg text-slate-700 mb-2">{totalPassed}/{totalTests} Testes Aprovados</p>
              <Badge className={
                percentual === 100 ? 'bg-green-600' :
                percentual >= 80 ? 'bg-yellow-600' :
                'bg-red-600'
              }>
                {percentual === 100 ? 'CERTIFICADO' : percentual >= 80 ? 'QUASE LÁ' : 'PENDENTE'}
              </Badge>
            </CardContent>
          </Card>

          {['Backend', 'Dados'].map((categoria) => (
            <Card key={categoria}>
              <CardHeader>
                <CardTitle>{categoria}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testesConfig
                    .filter(t => t.categoria === categoria)
                    .map((teste) => (
                      <div 
                        key={teste.key}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          resultados[teste.key]
                            ? 'bg-green-50 border-green-300'
                            : 'bg-red-50 border-red-300'
                        }`}
                      >
                        {resultados[teste.key] ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="text-sm font-medium text-slate-900">
                          {teste.label}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}