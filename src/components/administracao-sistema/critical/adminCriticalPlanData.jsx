export const adminCriticalRings = [
  {
    label: 'Multiempresa',
    status: 'Obrigatório',
    description: 'Toda leitura e ação crítica deve respeitar grupo/empresa atual.',
    tone: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    label: 'RBAC',
    status: 'Ativo',
    description: 'Ações sensíveis passam por perfil, ProtectedSection e entityGuard.',
    tone: 'bg-slate-50 text-slate-700 border-slate-200'
  },
  {
    label: 'Auditoria',
    status: 'Centralizada',
    description: 'Eventos críticos registrados no AuditLog com contexto operacional.',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    label: 'SoD',
    status: 'Validação',
    description: 'Conflitos de segregação de funções revisados antes de liberar perfis.',
    tone: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    label: 'IA segura',
    status: 'Assistida',
    description: 'IA sugere melhorias, mas mantém aprovação e rastreabilidade.',
    tone: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

export const adminCriticalActions = [
  {
    id: 'securityAlerts',
    title: 'Varredura de segurança',
    description: 'Analisa bloqueios, exclusões, alterações de perfil e lentidão recente.',
    functionName: 'securityAlerts',
    permission: 'Sistema.Seguranca.executar',
    sensitive: true,
    buildPayload: ({ empresaId, groupId }) => ({ filtros: { empresa_id: empresaId || null, group_id: groupId || null } })
  },
  {
    id: 'sodValidator',
    title: 'Validação SoD completa',
    description: 'Revalida conflitos de segregação de funções em todos os perfis.',
    functionName: 'sodValidator',
    permission: 'Sistema.ControledeAcesso.executar',
    sensitive: true,
    buildPayload: () => ({ mode: 'full-scan' })
  },
  {
    id: 'permissionOptimizer',
    title: 'Otimização IA de perfis',
    description: 'Gera sugestões auditadas para perfis com base nos bloqueios e riscos.',
    functionName: 'permissionOptimizer',
    permission: 'Sistema.ControledeAcesso.editar',
    sensitive: true,
    buildPayload: () => ({})
  },
  {
    id: 'backfillGroupEmpresaDryRun',
    title: 'Dry-run multiempresa',
    description: 'Valida registros sem contexto antes de aplicar correções reais.',
    functionName: 'backfillGroupEmpresa',
    permission: 'Sistema.Configuracoes.executar',
    sensitive: true,
    buildPayload: ({ empresaId, groupId }) => ({
      dryRun: true,
      apply: false,
      limitPerEntity: 1000,
      empresa_id: empresaId || null,
      group_id: groupId || null
    })
  }
];