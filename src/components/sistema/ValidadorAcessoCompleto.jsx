import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Users,
  Building2,
  Eye,
  Settings,
  RefreshCw,
  Award,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function ValidadorAcessoCompleto() {
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-validacao'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-validacao'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-validacao'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const executarValidacao = async () => {
    setValidando(true);
    
    const validacoes = {
      perfis: {
        total: perfis.length,
        ativos: perfis.filter(p => p.ativo !== false).length,
        comConflitos: perfis.filter(p => p.conflitos_sod_detectados?.length > 0).length,
        semUsuarios: perfis.filter(p => !usuarios.some(u => u.perfil_acesso_id === p.id)).length
      },
      usuarios: {
        total: usuarios.length,
        comPerfil: usuarios.filter(u => u.perfil_acesso_id).length,
        semPerfil: usuarios.filter(u => !u.perfil_acesso_id).length,
        admins: usuarios.filter(u => u.role === 'admin').length,
        bloqueados: usuarios.filter(u => u.bloqueado).length,
        com2FA: usuarios.filter(u => u.autenticacao_dois_fatores).length
      },
      seguranca: {
        scoreGeral: 0,
        nivel: '',
        problemas: []
      }
    };

    // Calcular score de segurança
    let score = 100;
    const problemas = [];

    // -20 pontos se houver usuários sem perfil
    if (validacoes.usuarios.semPerfil > 0) {
      score -= 20;
      problemas.push({
        severidade: 'alta',
        descricao: `${validacoes.usuarios.semPerfil} usuários sem perfil atribuído`
      });
    }

    // -30 pontos se houver conflitos SoD
    if (validacoes.perfis.comConflitos > 0) {
      score -= 30;
      problemas.push({
        severidade: 'critica',
        descricao: `${validacoes.perfis.comConflitos} perfis com conflitos de Segregação de Funções`
      });
    }

    // -10 pontos por perfil sem usuários
    if (validacoes.perfis.semUsuarios > 0) {
      score -= 10;
      problemas.push({
        severidade: 'baixa',
        descricao: `${validacoes.perfis.semUsuarios} perfis sem usuários vinculados (podem ser removidos)`
      });
    }

    // -15 pontos se menos de 30% dos usuários tem 2FA
    const percentual2FA = (validacoes.usuarios.com2FA / validacoes.usuarios.total) * 100;
    if (percentual2FA < 30) {
      score -= 15;
      problemas.push({
        severidade: 'media',
        descricao: `Apenas ${Math.round(percentual2FA)}% dos usuários com 2FA habilitado`
      });
    }

    // +10 pontos se todos os usuários têm perfil
    if (validacoes.usuarios.semPerfil === 0) {
      score += 10;
    }

    // +10 pontos se nenhum conflito SoD
    if (validacoes.perfis.comConflitos === 0) {
      score += 10;
    }

    // Determinar nível
    let nivel = '';
    if (score >= 90) nivel = 'Excelente';
    else if (score >= 75) nivel = 'Bom';
    else if (score >= 50) nivel = 'Regular';
    else nivel = 'Crítico';

    validacoes.seguranca = {
      scoreGeral: Math.max(0, Math.min(100, score)),
      nivel,
      problemas
    };

    setResultado(validacoes);
    setValidando(false);
    toast.success("Validação completa!");
  };

  const getCorScore = (score) => {
    if (score >= 90) return 'text-green-700';
    if (score >= 75) return 'text-blue-700';
    if (score >= 50) return 'text-yellow-700';
    return 'text-red-700';
  };

  const getCorNivel = (nivel) => {
    if (nivel === 'Excelente') return 'bg-green-600';
    if (nivel === 'Bom') return 'bg-blue-600';
    if (nivel === 'Regular') return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="space-y-6 w-full h-full">
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Validador Completo de Controle de Acesso
            <Badge className="bg-purple-600 text-white ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              V21.7 FINAL
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Button
            onClick={executarValidacao}
            disabled={validando}
            className="w-full bg-purple-600 hover:bg-purple-700 h-12"
          >
            {validando ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Validando Sistema...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Executar Validação Completa
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <>
          {/* Score de Segurança */}
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="text-lg">Score de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 ${
                    resultado.seguranca.scoreGeral >= 90 ? 'border-green-500 bg-green-50' :
                    resultado.seguranca.scoreGeral >= 75 ? 'border-blue-500 bg-blue-50' :
                    resultado.seguranca.scoreGeral >= 50 ? 'border-yellow-500 bg-yellow-50' :
                    'border-red-500 bg-red-50'
                  }`}>
                    <span className={`text-4xl font-bold ${getCorScore(resultado.seguranca.scoreGeral)}`}>
                      {resultado.seguranca.scoreGeral}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <Badge className={`${getCorNivel(resultado.seguranca.nivel)} text-white text-lg px-4 py-2`}>
                  {resultado.seguranca.nivel}
                </Badge>
              </div>

              <Progress value={resultado.seguranca.scoreGeral} className="h-3 mb-2" />
              <p className="text-center text-sm text-slate-600">
                {resultado.seguranca.scoreGeral >= 90 ? '🏆 Sistema altamente seguro!' :
                 resultado.seguranca.scoreGeral >= 75 ? '✅ Boa configuração de segurança' :
                 resultado.seguranca.scoreGeral >= 50 ? '⚠️ Melhorias recomendadas' :
                 '🚨 Atenção urgente necessária'}
              </p>
            </CardContent>
          </Card>

          {/* Problemas Detectados */}
          {resultado.seguranca.problemas.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Problemas Detectados ({resultado.seguranca.problemas.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {resultado.seguranca.problemas.map((prob, idx) => (
                  <Alert key={idx} className={
                    prob.severidade === 'critica' ? 'border-red-300 bg-red-50' :
                    prob.severidade === 'alta' ? 'border-orange-300 bg-orange-50' :
                    prob.severidade === 'media' ? 'border-yellow-300 bg-yellow-50' :
                    'border-blue-300 bg-blue-50'
                  }>
                    <AlertDescription className="flex items-center gap-2">
                      {prob.severidade === 'critica' && <XCircle className="w-4 h-4 text-red-600" />}
                      {prob.severidade === 'alta' && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                      {prob.severidade === 'media' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                      {prob.severidade === 'baixa' && <Eye className="w-4 h-4 text-blue-600" />}
                      <span className="text-sm">{prob.descricao}</span>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Estatísticas Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Perfis de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total de Perfis</span>
                  <Badge>{resultado.perfis.total}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Perfis Ativos</span>
                  <Badge className="bg-green-600">{resultado.perfis.ativos}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Com Conflitos SoD</span>
                  <Badge className={resultado.perfis.comConflitos > 0 ? 'bg-red-600' : 'bg-green-600'}>
                    {resultado.perfis.comConflitos}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sem Usuários</span>
                  <Badge variant="outline">{resultado.perfis.semUsuarios}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  Usuários
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total de Usuários</span>
                  <Badge>{resultado.usuarios.total}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Com Perfil</span>
                  <Badge className="bg-green-600">{resultado.usuarios.comPerfil}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sem Perfil</span>
                  <Badge className={resultado.usuarios.semPerfil > 0 ? 'bg-orange-600' : 'bg-green-600'}>
                    {resultado.usuarios.semPerfil}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Administradores</span>
                  <Badge className="bg-purple-600">{resultado.usuarios.admins}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Com 2FA</span>
                  <Badge className="bg-blue-600">{resultado.usuarios.com2FA}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bloqueados</span>
                  <Badge className={resultado.usuarios.bloqueados > 0 ? 'bg-red-600' : 'bg-green-600'}>
                    {resultado.usuarios.bloqueados}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certificação Final */}
          {resultado.seguranca.scoreGeral >= 90 && resultado.seguranca.problemas.length === 0 && (
            <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-6 text-center">
                <Award className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  🏆 Sistema Certificado!
                </h3>
                <p className="text-green-700 mb-4">
                  Controle de Acesso V21.7 operando com excelência
                </p>
                <Badge className="bg-green-600 text-white px-6 py-2 text-base">
                  ✅ 100% Completo e Validado
                </Badge>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}