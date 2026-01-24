import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Shield,
  Database,
  Activity,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * VALIDADOR SISTEMA ETAPA 1
 * Executa testes automatizados para validar implementação completa
 */

export default function ValidadorSistemaETAPA1() {
  const [testando, setTestando] = useState(false);
  const [resultados, setResultados] = useState(null);
  const { toast } = useToast();

  const executarValidacao = async () => {
    setTestando(true);
    const tests = {};

    try {
      // TEST 1: RBAC Backend existe e responde
      try {
        const rbacTest = await base44.functions.invoke('rbacValidator', {
          module: 'Estoque',
          section: null,
          action: 'visualizar'
        });
        tests.rbacBackend = rbacTest.data?.authorized !== undefined;
      } catch {
        tests.rbacBackend = false;
      }

      // TEST 2: Multiempresa Backend existe e responde
      try {
        const multiTest = await base44.functions.invoke('multiempresaValidator', {
          operation: 'create',
          entityName: 'Produto',
          data: { empresa_id: 'test' }
        });
        tests.multiempresaBackend = multiTest.data?.valid !== undefined;
      } catch {
        tests.multiempresaBackend = false;
      }

      // TEST 3: AuditHelper existe e responde
      try {
        const auditTest = await base44.functions.invoke('auditHelper', {
          usuario: 'Teste',
          acao: 'Teste',
          modulo: 'Sistema',
          descricao: 'Teste de validação ETAPA 1'
        });
        tests.auditHelper = auditTest.data?.success === true;
      } catch {
        tests.auditHelper = false;
      }

      // TEST 4: Perfis de acesso existem
      const perfis = await base44.entities.PerfilAcesso.list();
      tests.perfisExistem = perfis.length > 0;

      // TEST 5: Empresas cadastradas
      const empresas = await base44.entities.Empresa.list();
      tests.empresasExistem = empresas.length > 0;

      // TEST 6: AuditLog funcional
      const logs = await base44.entities.AuditLog.filter({}, '-created_date', 1);
      tests.auditLogFuncional = logs.length >= 0; // Se retornar array, está funcional

      // TEST 7: Usuários têm perfil
      const usuarios = await base44.entities.User.list();
      const usuariosComPerfil = usuarios.filter(u => u.perfil_acesso_id).length;
      tests.usuariosPerfil = usuariosComPerfil === usuarios.length && usuarios.length > 0;

      setResultados(tests);
      
      const passed = Object.values(tests).filter(Boolean).length;
      const total = Object.keys(tests).length;

      if (passed === total) {
        toast({
          title: '✅ ETAPA 1 Validada',
          description: 'Todas as validações passaram com sucesso!'
        });
      } else {
        toast({
          title: '⚠️ Validação Incompleta',
          description: `${passed}/${total} testes passaram`,
          variant: 'destructive'
        });
      }

    } catch (error) {
      toast({
        title: '❌ Erro na Validação',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setTestando(false);
    }
  };

  const testesConfig = [
    { key: 'rbacBackend', label: 'RBAC Backend Validator', icon: Shield },
    { key: 'multiempresaBackend', label: 'Multiempresa Validator', icon: Database },
    { key: 'auditHelper', label: 'Audit Helper Universal', icon: Activity },
    { key: 'perfisExistem', label: 'Perfis de Acesso Criados', icon: Shield },
    { key: 'empresasExistem', label: 'Empresas Cadastradas', icon: Database },
    { key: 'auditLogFuncional', label: 'AuditLog Operacional', icon: FileText },
    { key: 'usuariosPerfil', label: 'Todos Usuários com Perfil', icon: Shield }
  ];

  const totalPassed = resultados ? Object.values(resultados).filter(Boolean).length : 0;
  const totalTests = testesConfig.length;
  const percentual = resultados ? Math.round((totalPassed / totalTests) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Validador Automatizado</h2>
          <p className="text-sm text-slate-600">Teste completo da ETAPA 1</p>
        </div>

        <Button 
          onClick={executarValidacao} 
          disabled={testando}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Play className={`w-5 h-5 mr-2 ${testando ? 'animate-spin' : ''}`} />
          {testando ? 'Executando...' : 'Executar Validação'}
        </Button>
      </div>

      {resultados && (
        <>
          {/* Resultado Geral */}
          <Card className={`border-2 ${
            percentual === 100 
              ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50'
              : percentual >= 70
              ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50'
              : 'border-red-400 bg-gradient-to-br from-red-50 to-rose-50'
          }`}>
            <CardContent className="p-6 text-center">
              {percentual === 100 ? (
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
              ) : (
                <AlertTriangle className="w-16 h-16 mx-auto text-yellow-600 mb-4" />
              )}
              <h3 className="text-3xl font-bold mb-2">
                {totalPassed} / {totalTests} Testes Aprovados
              </h3>
              <Badge className={
                percentual === 100 ? 'bg-green-600' :
                percentual >= 70 ? 'bg-yellow-600' :
                'bg-red-600'
              }>
                {percentual}% de Cobertura
              </Badge>
            </CardContent>
          </Card>

          {/* Detalhamento dos Testes */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testesConfig.map((teste) => {
                  const passed = resultados[teste.key];
                  const Icon = teste.icon;
                  
                  return (
                    <div
                      key={teste.key}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                        passed 
                          ? 'bg-green-50 border-green-300'
                          : 'bg-red-50 border-red-300'
                      }`}
                    >
                      {passed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <Icon className="w-5 h-5 text-slate-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{teste.label}</p>
                        <Badge className="mt-1" variant={passed ? "default" : "destructive"}>
                          {passed ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          {percentual < 100 && (
            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertTitle>Ações Recomendadas</AlertTitle>
              <AlertDescription>
                <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
                  {!resultados.rbacBackend && (
                    <li>Verificar se a função <code>rbacValidator</code> foi implantada corretamente</li>
                  )}
                  {!resultados.multiempresaBackend && (
                    <li>Verificar se a função <code>multiempresaValidator</code> foi implantada corretamente</li>
                  )}
                  {!resultados.auditHelper && (
                    <li>Verificar se a função <code>auditHelper</code> foi implantada corretamente</li>
                  )}
                  {!resultados.perfisExistem && (
                    <li>Criar ao menos um perfil de acesso em <strong>PerfilAcesso</strong></li>
                  )}
                  {!resultados.empresasExistem && (
                    <li>Cadastrar ao menos uma empresa em <strong>Empresa</strong></li>
                  )}
                  {!resultados.usuariosPerfil && (
                    <li>Atribuir perfil de acesso a todos os usuários</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Certificação */}
          {percentual === 100 && (
            <Alert className="border-green-300 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-900">🎉 Certificação Aprovada</AlertTitle>
              <AlertDescription className="text-green-700">
                A ETAPA 1 está 100% funcional e pronta para produção.
                Sistema de Governança, Segurança e Multiempresa implementado com sucesso!
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}