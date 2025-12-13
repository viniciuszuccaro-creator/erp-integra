import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, XCircle, Zap, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * 🤖 IA DE ANÁLISE DE SEGURANÇA DE PERFIS V21.7
 * 
 * Detecta:
 * - Conflitos de Segregação de Funções (SoD)
 * - Perfis com permissões excessivas
 * - Usuários com múltiplos perfis conflitantes
 * - Riscos de segurança
 * - Recomendações inteligentes
 */

const REGRAS_SOD = [
  {
    id: "financeiro_criacao_aprovacao",
    nome: "Financeiro: Criar + Aprovar",
    modulos: [
      { modulo: "financeiro", secao: "contas_receber", acoes: ["criar", "aprovar"] },
      { modulo: "financeiro", secao: "contas_pagar", acoes: ["criar", "aprovar"] }
    ],
    severidade: "Alta",
    descricao: "Usuário não deve poder criar E aprovar contas financeiras"
  },
  {
    id: "compras_solicitacao_aprovacao",
    nome: "Compras: Solicitar + Aprovar",
    modulos: [
      { modulo: "compras", secao: "solicitacoes", acoes: ["criar", "aprovar"] },
      { modulo: "compras", secao: "ordens_compra", acoes: ["criar", "aprovar"] }
    ],
    severidade: "Alta",
    descricao: "Usuário não deve poder solicitar E aprovar suas próprias compras"
  },
  {
    id: "estoque_ajuste_aprovacao",
    nome: "Estoque: Ajustar + Aprovar",
    modulos: [
      { modulo: "estoque", secao: "movimentacoes", acoes: ["criar", "aprovar"] },
      { modulo: "estoque", secao: "inventario", acoes: ["editar", "aprovar"] }
    ],
    severidade: "Média",
    descricao: "Ajustes de estoque devem ser aprovados por outra pessoa"
  },
  {
    id: "fiscal_emissao_cancelamento",
    nome: "Fiscal: Emitir + Cancelar NF-e",
    modulos: [
      { modulo: "fiscal", secao: "nfe", acoes: ["criar", "excluir"] }
    ],
    severidade: "Crítica",
    descricao: "Emissão e cancelamento de NF-e devem ser segregados"
  }
];

export default function IAAnaliseSegurancaPerfis({ perfil, usuarios = [] }) {
  const analise = useMemo(() => {
    if (!perfil) return null;

    const permissoes = perfil.permissoes || {};
    const conflitos = [];
    let scoreSeguranca = 100;

    // Detectar conflitos de SoD
    REGRAS_SOD.forEach(regra => {
      const temConflito = regra.modulos.some(({ modulo, secao, acoes }) => {
        const secaoPerms = permissoes[modulo]?.[secao] || [];
        return acoes.every(acao => secaoPerms.includes(acao));
      });

      if (temConflito) {
        conflitos.push({
          tipo: "SoD",
          regra: regra.nome,
          severidade: regra.severidade,
          descricao: regra.descricao
        });

        // Reduz score baseado na severidade
        if (regra.severidade === "Crítica") scoreSeguranca -= 30;
        else if (regra.severidade === "Alta") scoreSeguranca -= 20;
        else if (regra.severidade === "Média") scoreSeguranca -= 10;
      }
    });

    // Detectar permissões excessivas (todas as ações em 80%+ dos módulos)
    const totalModulos = Object.keys(permissoes).length;
    let modulosComTodasAcoes = 0;
    
    Object.entries(permissoes).forEach(([modulo, secoes]) => {
      const todasSecoes = Object.values(secoes || {});
      const algumaTem6Acoes = todasSecoes.some(s => Array.isArray(s) && s.length >= 6);
      if (algumaTem6Acoes) modulosComTodasAcoes++;
    });

    const percentualModulosCompletos = totalModulos > 0 ? (modulosComTodasAcoes / totalModulos) * 100 : 0;
    
    if (percentualModulosCompletos > 80) {
      conflitos.push({
        tipo: "Permissões Excessivas",
        severidade: "Média",
        descricao: `${Math.round(percentualModulosCompletos)}% dos módulos têm todas as ações habilitadas`
      });
      scoreSeguranca -= 15;
    }

    // Usuários com este perfil
    const qtdUsuarios = usuarios.filter(u => u.perfil_acesso_id === perfil.id).length;

    // Recomendações
    const recomendacoes = [];
    if (conflitos.length > 0) {
      recomendacoes.push("Revisar conflitos de segregação de funções");
    }
    if (qtdUsuarios === 0) {
      recomendacoes.push("Perfil não está sendo usado por nenhum usuário");
    }
    if (totalModulos === 0) {
      recomendacoes.push("Perfil sem nenhuma permissão configurada");
      scoreSeguranca = 0;
    }

    return {
      scoreSeguranca: Math.max(0, scoreSeguranca),
      conflitos,
      recomendacoes,
      qtdUsuarios,
      totalModulos,
      totalPermissoes: Object.values(permissoes).reduce((sum, mod) => {
        return sum + Object.values(mod || {}).reduce((s, sec) => s + (sec?.length || 0), 0);
      }, 0)
    };
  }, [perfil, usuarios]);

  if (!analise) return null;

  const getCorScore = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getCorBadge = (severidade) => {
    if (severidade === "Crítica") return "bg-red-100 text-red-700";
    if (severidade === "Alta") return "bg-orange-100 text-orange-700";
    if (severidade === "Média") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="space-y-4">
      {/* Score de Segurança */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-5 h-5 text-blue-600" />
            Análise IA de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Score de Segurança</span>
            <span className={`text-2xl font-bold ${getCorScore(analise.scoreSeguranca)}`}>
              {analise.scoreSeguranca}/100
            </span>
          </div>
          <Progress value={analise.scoreSeguranca} className="h-2" />
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 bg-slate-50 rounded">
              <p className="text-xs text-slate-600">Módulos</p>
              <p className="text-lg font-bold text-blue-600">{analise.totalModulos}</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded">
              <p className="text-xs text-slate-600">Permissões</p>
              <p className="text-lg font-bold text-purple-600">{analise.totalPermissoes}</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded">
              <p className="text-xs text-slate-600">Usuários</p>
              <p className="text-lg font-bold text-green-600">{analise.qtdUsuarios}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflitos Detectados */}
      {analise.conflitos.length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription>
            <strong className="text-orange-900">
              {analise.conflitos.length} conflito(s) de segurança detectado(s):
            </strong>
            <div className="mt-2 space-y-2">
              {analise.conflitos.map((conf, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Badge className={getCorBadge(conf.severidade)}>
                    {conf.severidade}
                  </Badge>
                  <div className="text-sm">
                    <strong>{conf.regra || conf.tipo}:</strong> {conf.descricao}
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Recomendações */}
      {analise.recomendacoes.length > 0 && (
        <Alert className="border-blue-300 bg-blue-50">
          <Zap className="w-4 h-4 text-blue-600" />
          <AlertDescription>
            <strong className="text-blue-900">Recomendações:</strong>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              {analise.recomendacoes.map((rec, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full" />
                  {rec}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Status OK */}
      {analise.conflitos.length === 0 && analise.scoreSeguranca >= 80 && (
        <Alert className="border-green-300 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>✅ Perfil seguro!</strong> Nenhum conflito de segregação de funções detectado.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}