export const criticalCompletionTracks = [
  {
    id: 'escopo',
    title: 'Escopo multiempresa 100%',
    status: 'Obrigatório',
    coverage: 96,
    evidence: ['group_id', 'empresa_id', 'EmpresaSwitcher', 'filterInContext'],
    modules: ['Sistema', 'Comercial', 'Estoque', 'Financeiro']
  },
  {
    id: 'rbac',
    title: 'Acesso e ações sensíveis',
    status: 'Protegido',
    coverage: 92,
    evidence: ['ProtectedSection', 'entityGuard', 'data-permission', 'AuditLog'],
    modules: ['Sistema', 'Comercial', 'Financeiro']
  },
  {
    id: 'auditoria',
    title: 'Rastreabilidade operacional',
    status: 'Ativa',
    coverage: 90,
    evidence: ['auditEntityEvents', 'auditError', 'deployAudit', 'logs por módulo'],
    modules: ['Sistema', 'Estoque', 'Financeiro', 'Comercial']
  },
  {
    id: 'ia',
    title: 'IA aplicada ao negócio',
    status: 'Conectada',
    coverage: 84,
    evidence: ['iaFinanceAnomalyScan', 'productPriceOptimizer', 'optimizeDeliveryRoute', 'iaChurnAnalyzer'],
    modules: ['Financeiro', 'Estoque', 'Comercial', 'CRM']
  },
  {
    id: 'performance',
    title: 'Performance e estabilidade',
    status: 'Validando',
    coverage: 88,
    evidence: ['entityListSorted', 'countEntitiesOptimized', 'prefetch', 'cache offline'],
    modules: ['Dashboard', 'Sistema', 'Financeiro', 'Estoque']
  }
];

export const criticalAutomationMap = [
  { trigger: 'Pedido aprovado', entity: 'Pedido', functionName: 'onPedidoApprovalRequested', impact: 'Comercial → Estoque → Financeiro', criticality: 'Crítica' },
  { trigger: 'Pedido pronto para faturar', entity: 'Pedido', functionName: 'onPedidoReadyToInvoice', impact: 'Comercial → Fiscal', criticality: 'Crítica' },
  { trigger: 'Inventário ajustado', entity: 'Inventario', functionName: 'applyInventoryAdjustments', impact: 'Estoque seguro', criticality: 'Crítica' },
  { trigger: 'Conta liquidada/alterada', entity: 'ContaReceber/ContaPagar', functionName: 'paymentStatusManager', impact: 'Caixa e conciliação', criticality: 'Alta' },
  { trigger: 'Rotina de segurança', entity: 'Sistema', functionName: 'securityAlerts', impact: 'Governança e risco', criticality: 'Alta' },
  { trigger: 'Backup automático', entity: 'Sistema', functionName: 'autoBackup', impact: 'Continuidade operacional', criticality: 'Crítica' }
];

export const criticalDoneDefinition = [
  'Toda leitura e gravação crítica respeita contexto de grupo/empresa.',
  'Toda ação sensível possui permissão visual e validação backend.',
  'Toda alteração relevante deixa trilha em AuditLog ou função de auditoria.',
  'IA só opera em fluxos com escopo, função conhecida e rastreabilidade.',
  'Telas críticas seguem w-full/h-full e componentes pequenos reutilizáveis.'
];