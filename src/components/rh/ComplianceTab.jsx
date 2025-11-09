
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CircleCheck, Brain, Clock, FileText } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.5 - Compliance e Governança de RH
 * IA de CNH/ASO + IA SoD (Segregação de Funções)
 */
export default function ComplianceTab({ empresaId }) {
  const [executandoIA, setExecutandoIA] = useState(false);
  const queryClient = useQueryClient();

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores-compliance', empresaId],
    queryFn: () => base44.entities.Colaborador.filter({
      empresa_alocada_id: empresaId
    })
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-sod'],
    queryFn: () => base44.entities.User.list()
  });

  const executarIAComplianceMutation = useMutation({
    mutationFn: async () => {
      console.log('🧠 Executando IA Compliance...');
      setExecutandoIA(true);

      const alertas = [];
      const hoje = new Date();

      // Verificar CNH e ASO
      for (const colab of colaboradores) {
        // CNH
        if (colab.pode_dirigir && colab.cnh_validade) {
          const diasRestantes = Math.floor((new Date(colab.cnh_validade) - hoje) / (1000 * 60 * 60 * 24));
          
          if (diasRestantes <= 30 && diasRestantes >= 0) {
            alertas.push({
              tipo: 'CNH',
              colaborador: colab.nome_completo,
              dias_restantes: diasRestantes,
              severidade: diasRestantes <= 7 ? 'Crítico' : 'Alto'
            });
          } else if (diasRestantes < 0) {
            // Bloquear
            await base44.entities.Colaborador.update(colab.id, {
              pode_dirigir: false
            });

            alertas.push({
              tipo: 'CNH_VENCIDA',
              colaborador: colab.nome_completo,
              acao: 'BLOQUEADO para dirigir',
              severidade: 'Crítico'
            });
          }
        }

        // ASO
        if (colab.aso_validade) {
          const diasRestantes = Math.floor((new Date(colab.aso_validade) - hoje) / (1000 * 60 * 60 * 24));
          
          if (diasRestantes <= 30 && diasRestantes >= 0) {
            alertas.push({
              tipo: 'ASO',
              colaborador: colab.nome_completo,
              dias_restantes: diasRestantes,
              severidade: diasRestantes <= 7 ? 'Crítico' : 'Alto'
            });
          } else if (diasRestantes < 0) {
            // Bloquear produção
            await base44.entities.Colaborador.update(colab.id, {
              pode_apontar_producao: false
            });

            alertas.push({
              tipo: 'ASO_VENCIDO',
              colaborador: colab.nome_completo,
              acao: 'BLOQUEADO para apontamento',
              severidade: 'Crítico'
            });
          }
        }
      }

      // V21.5: IA SoD (Segregação de Funções)
      const conflitos = [];

      for (const usuario of usuarios) {
        const permissoes = await base44.entities.PermissaoEmpresaModulo.filter({
          usuario_id: usuario.id,
          empresa_id: empresaId
        });

        const podeAprovarPagamento = permissoes.some(p => 
          p.modulo === 'Financeiro e Contábil' && p.nivel_acesso === 'Aprovar'
        );

        const podeCriarFornecedor = permissoes.some(p => 
          p.modulo === 'Cadastros Gerais' && p.nivel_acesso === 'Criar'
        );

        if (podeAprovarPagamento && podeCriarFornecedor) {
          conflitos.push({
            usuario: usuario.full_name,
            tipo: 'SoD - Financeiro',
            risco: 'Pode criar fornecedor E aprovar pagamento (risco de fraude)',
            severidade: 'Crítico'
          });
        }
      }

      setExecutandoIA(false);
      return { alertas, conflitos };
    },
    onSuccess: ({ alertas, conflitos }) => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores-compliance'] });

      const totalProblemas = alertas.length + conflitos.length;

      if (totalProblemas === 0) {
        toast.success('✅ Compliance 100% OK!');
      } else {
        toast.error(`⚠️ ${totalProblemas} problema(s) de compliance detectado(s)!`);
      }
    }
  });

  const calcularStatusCompliance = () => {
    const hoje = new Date();

    const cnhVencendo = colaboradores.filter(c => {
      if (!c.pode_dirigir || !c.cnh_validade) return false;
      const dias = Math.floor((new Date(c.cnh_validade) - hoje) / (1000 * 60 * 60 * 24));
      return dias <= 30 && dias >= 0;
    });

    const cnhVencida = colaboradores.filter(c => {
      if (!c.cnh_validade) return false;
      const dias = Math.floor((new Date(c.cnh_validade) - hoje) / (1000 * 60 * 60 * 24));
      return dias < 0;
    });

    const asoVencendo = colaboradores.filter(c => {
      if (!c.aso_validade) return false;
      const dias = Math.floor((new Date(c.aso_validade) - hoje) / (1000 * 60 * 60 * 24));
      return dias <= 30 && dias >= 0;
    });

    const asoVencido = colaboradores.filter(c => {
      if (!c.aso_validade) return false;
      const dias = Math.floor((new Date(c.aso_validade) - hoje) / (1000 * 60 * 60 * 24));
      return dias < 0;
    });

    const totalProblemas = cnhVencendo.length + cnhVencida.length + asoVencendo.length + asoVencido.length;
    const scoreCompliance = colaboradores.length > 0
      ? ((colaboradores.length - totalProblemas) / colaboradores.length * 100)
      : 100;

    return {
      cnhVencendo,
      cnhVencida,
      asoVencendo,
      asoVencido,
      scoreCompliance,
      totalProblemas
    };
  };

  const status = calcularStatusCompliance();

  return (
    <div className="space-y-6">
      {/* Header IA */}
      <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-purple-900">IA Compliance & Governança</h2>
                <p className="text-sm text-purple-700">Monitoramento CNH, ASO e Segregação de Funções</p>
              </div>
            </div>

            <Button
              onClick={() => executarIAComplianceMutation.mutate()}
              disabled={executandoIA}
              className="bg-purple-600"
            >
              {executandoIA ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Auditando...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Executar IA Agora
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Score de Compliance */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Score de Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                {status.scoreCompliance.toFixed(1)}%
              </p>
              <Badge className={
                status.scoreCompliance >= 90 ? 'bg-green-600' :
                status.scoreCompliance >= 70 ? 'bg-yellow-600' :
                'bg-red-600'
              }>
                {status.scoreCompliance >= 90 ? 'Excelente' :
                 status.scoreCompliance >= 70 ? 'Atenção' :
                 'Crítico'}
              </Badge>
            </div>
            <Progress value={status.scoreCompliance} className="h-3" />
            <p className="text-xs text-slate-600">
              {status.totalProblemas} problema(s) detectado(s) de {colaboradores.length} colaborador(es)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alertas CNH */}
      {(status.cnhVencendo.length > 0 || status.cnhVencida.length > 0) && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              CNH - Atenção Requerida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {status.cnhVencida.map(colab => (
              <div key={colab.id} className="p-2 bg-red-100 border border-red-300 rounded">
                <p className="font-bold text-sm text-red-900">{colab.nome_completo}</p>
                <p className="text-xs text-red-700">
                  ❌ CNH VENCIDA em {new Date(colab.cnh_validade).toLocaleDateString('pt-BR')} - BLOQUEADO
                </p>
              </div>
            ))}

            {status.cnhVencendo.map(colab => {
              const dias = Math.floor((new Date(colab.cnh_validade) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={colab.id} className="p-2 bg-orange-100 border border-orange-300 rounded">
                  <p className="font-bold text-sm text-orange-900">{colab.nome_completo}</p>
                  <p className="text-xs text-orange-700">
                    ⚠️ CNH vence em {dias} dia(s) - {new Date(colab.cnh_validade).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Alertas ASO */}
      {(status.asoVencendo.length > 0 || status.asoVencido.length > 0) && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" />
              ASO - Exames Ocupacionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {status.asoVencido.map(colab => (
              <div key={colab.id} className="p-2 bg-red-100 border border-red-300 rounded">
                <p className="font-bold text-sm text-red-900">{colab.nome_completo}</p>
                <p className="text-xs text-red-700">
                  ❌ ASO VENCIDO - BLOQUEADO para apontamento de produção
                </p>
              </div>
            ))}

            {status.asoVencendo.map(colab => {
              const dias = Math.floor((new Date(colab.aso_validade) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={colab.id} className="p-2 bg-orange-100 border border-orange-300 rounded">
                  <p className="font-bold text-sm text-orange-900">{colab.nome_completo}</p>
                  <p className="text-xs text-orange-700">
                    ⚠️ ASO vence em {dias} dia(s) - Agendar exame
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Status OK */}
      {status.totalProblemas === 0 && (
        <Alert className="border-green-300 bg-green-50">
          <CircleCheck className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-sm text-green-800">
            <strong>✅ Compliance 100% OK!</strong> Todos os colaboradores estão com documentação em dia.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
