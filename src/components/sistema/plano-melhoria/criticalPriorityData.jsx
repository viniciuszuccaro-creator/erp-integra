export const criticalPriorityModules = [
  {
    module: 'Sistema',
    priority: 'Crítica',
    progress: 91,
    status: 'Em execução contínua',
    objective: 'Blindar governança, acessos, auditoria, segurança, backups e integrações sem quebrar módulos existentes.',
    safeguards: ['RBAC frontend/backend', 'AuditLog central', 'SoD e riscos', 'Backup e LGPD'],
    functions: ['entityGuard', 'securityAlerts', 'sodValidator', 'permissionOptimizer', 'autoBackup'],
    nextActions: ['Revisar perfis críticos', 'Validar acessos multiempresa', 'Auditar funções sensíveis']
  },
  {
    module: 'Comercial',
    priority: 'Crítica',
    progress: 90,
    status: 'Em validação operacional',
    objective: 'Consolidar pedido completo com aprovação, margem, estoque, produção, entrega, financeiro e fiscal conectados.',
    safeguards: ['Aprovação de desconto', 'Reserva de estoque', 'Rastreio do pedido', 'Auditoria de fechamento'],
    functions: ['applyOrderStockMovements', 'orderFlowAuditor', 'onPedidoApprovalRequested', 'onPedidoReadyToInvoice'],
    nextActions: ['Validar fluxo pedido→estoque', 'Conferir aprovação por perfil', 'Reforçar indicadores de fechamento']
  },
  {
    module: 'Estoque',
    priority: 'Crítica',
    progress: 94,
    status: 'Em consolidação',
    objective: 'Garantir saldo confiável, movimentações auditadas, inventário seguro e reposição inteligente por empresa/grupo.',
    safeguards: ['Movimentação auditada', 'Inventário com aprovação', 'Saldo por empresa', 'IA de reposição'],
    functions: ['applyInventoryAdjustments', 'countEntitiesOptimized', 'productPriceOptimizer', 'iaFinanceAnomalyScan'],
    nextActions: ['Revalidar saldo disponível', 'Conferir movimentações críticas', 'Ativar alertas de estoque baixo']
  },
  {
    module: 'Financeiro',
    priority: 'Crítica',
    progress: 86,
    status: 'Em melhoria completa',
    objective: 'Unificar caixa, cobrança, conciliação, liquidação, rateios, boletos e anomalias com rastreabilidade total.',
    safeguards: ['Liquidação segura', 'Conciliação auditável', 'Boletos/PIX controlados', 'Anomalias por IA'],
    functions: ['emitirBoleto', 'paymentStatusManager', 'iaFinanceAnomalyScan', 'reconcileLogisticaCosts'],
    nextActions: ['Validar liquidação ponta a ponta', 'Reforçar conciliação', 'Auditar cobranças geradas']
  }
];

export const criticalValidationRings = [
  { label: 'Multiempresa', value: 'Obrigatório em toda leitura e gravação', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Acesso', value: 'Ações críticas protegidas por perfil', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
  { label: 'Auditoria', value: 'Eventos sensíveis registrados em AuditLog', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'IA', value: 'IA conectada apenas a fluxos auditáveis', tone: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'Performance', value: 'Consultas com limites, cache e contagem otimizada', tone: 'bg-amber-50 text-amber-700 border-amber-200' }
];