import { ShieldCheck, Building2, LockKeyhole, Gauge, Sparkles, Bot, Network, ClipboardCheck, Rocket, Workflow } from 'lucide-react';

export const planoExecutionPillars = [
  {
    id: 'multiempresa',
    title: 'Multiempresa em tudo',
    icon: Building2,
    progress: 72,
    status: 'Em execução',
    description: 'Carimbo, filtro contextual e leitura por grupo/empresa em módulos operacionais.',
    checkpoints: ['group_id/empresa_id', 'EmpresaSwitcher', 'filterInContext', 'auditoria por escopo']
  },
  {
    id: 'acesso',
    title: 'Controle de acesso granular',
    icon: LockKeyhole,
    progress: 68,
    status: 'Em execução',
    description: 'Proteção visual, guard backend, ações sensíveis auditadas e permissões por módulo.',
    checkpoints: ['ProtectedSection', 'entityGuard', 'RBAC local', 'bloqueios auditados']
  },
  {
    id: 'performance',
    title: 'Performance e cache',
    icon: Gauge,
    progress: 61,
    status: 'Validando',
    description: 'Contagens otimizadas, cache seletivo, prefetch e redução de chamadas repetidas.',
    checkpoints: ['entityListSorted', 'countEntitiesOptimized', 'prefetch', 'cache offline']
  },
  {
    id: 'ux',
    title: 'UX responsiva e multitarefa',
    icon: Sparkles,
    progress: 58,
    status: 'Em execução',
    description: 'Layouts w-full/h-full, cards fluidos e integração com janelas multitarefa.',
    checkpoints: ['w-full/h-full', 'mobile-first', 'WindowManager', 'cards adaptáveis']
  },
  {
    id: 'ia',
    title: 'IA operacional conectada',
    icon: Bot,
    progress: 55,
    status: 'Em execução',
    description: 'Uso das funções de IA já existentes para financeiro, preço, rotas, churn e segurança.',
    checkpoints: ['iaFinanceAnomalyScan', 'productPriceOptimizer', 'optimizeDeliveryRoute', 'iaChurnAnalyzer']
  },
  {
    id: 'governanca',
    title: 'Governança e auditoria',
    icon: ClipboardCheck,
    progress: 64,
    status: 'Em execução',
    description: 'AuditLog central, rastreabilidade de função, LGPD e validações de risco.',
    checkpoints: ['AuditLog', 'deployAudit', 'piiEncryptor', 'sodValidator']
  }
];

export const planoModuleSprints = [
  { module: 'Dashboard', focus: 'KPIs por empresa/grupo + prefetch', owner: 'Sistema', priority: 'Alta', status: 'Em execução' },
  { module: 'CRM', focus: 'Clientes, oportunidades e churn com escopo multiempresa', owner: 'Comercial', priority: 'Alta', status: 'Em execução' },
  { module: 'Comercial', focus: 'Pedido completo, reserva de estoque, aprovação e fechamento', owner: 'Vendas', priority: 'Crítica', status: 'Em execução' },
  { module: 'Estoque', focus: 'Inventário em KG, movimentações auditadas e IA de reposição', owner: 'Operação', priority: 'Crítica', status: 'Em execução' },
  { module: 'Compras', focus: 'Fornecedores compartilhados, OC e avaliação integrada', owner: 'Suprimentos', priority: 'Alta', status: 'Planejado' },
  { module: 'Financeiro', focus: 'Liquidação, boletos, conciliação, anomalias e caixa central', owner: 'Financeiro', priority: 'Crítica', status: 'Em execução' },
  { module: 'Expedição', focus: 'Roteirização, romaneio, entrega digital e rastreio', owner: 'Logística', priority: 'Alta', status: 'Em execução' },
  { module: 'Fiscal', focus: 'NF-e, validação fiscal e logs SEFAZ', owner: 'Fiscal', priority: 'Alta', status: 'Validando' },
  { module: 'RH', focus: 'Colaboradores, ponto, férias e monitoramento inteligente', owner: 'RH', priority: 'Média', status: 'Planejado' },
  { module: 'Sistema', focus: 'Acessos, auditoria, segurança, backup e governança', owner: 'Admin', priority: 'Crítica', status: 'Em execução' }
];

export const planoRiskControls = [
  { title: 'Escopo multiempresa obrigatório', level: 'Crítico', mitigation: 'Bloquear leitura/escrita sem grupo ou empresa definidos.' },
  { title: 'Ações sensíveis com RBAC', level: 'Alto', mitigation: 'Validar permissões no frontend e no backend antes da execução.' },
  { title: 'Documentos não podem quebrar lint', level: 'Alto', mitigation: 'Manter espelhos técnicos fora da análise de código.' },
  { title: 'IA sempre auditável', level: 'Médio', mitigation: 'Registrar chamadas, módulo, escopo e duração quando aplicável.' },
  { title: 'Performance por paginação', level: 'Médio', mitigation: 'Usar consultas ordenadas, limites e contagens otimizadas.' }
];

export const planoValidationTracks = [
  { label: 'Estabilidade', icon: ShieldCheck, value: 'Lint/build protegido' },
  { label: 'Modularização', icon: Workflow, value: 'Componentes pequenos' },
  { label: 'Integrações', icon: Network, value: 'Funções existentes reutilizadas' },
  { label: 'Evolução contínua', icon: Rocket, value: 'Backlog vivo por módulo' }
];