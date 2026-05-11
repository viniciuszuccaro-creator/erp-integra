import { melhoriaPlanPhases } from './melhoriaPlanData';
import { planoModuleSprints } from './planoExecucaoData';

const statusByProgress = (progress) => {
  if (progress >= 100) return 'Concluído';
  if (progress >= 70) return 'Validando';
  if (progress >= 35) return 'Em Execução';
  return 'Planejado';
};

const typeByPhase = {
  estabilidade: 'Estabilidade',
  multiempresa: 'Multiempresa',
  acesso: 'Acesso',
  modularizacao: 'Governança',
  performance: 'Performance',
  ux: 'UX',
  ia: 'IA',
  integracoes: 'Integração',
  governanca: 'Governança',
  continua: 'Governança'
};

export const fullPlanBacklogItems = [
  ...melhoriaPlanPhases.map((phase) => ({
    fase: 'Plano de Melhoria • Fases',
    modulo: 'Sistema',
    titulo: phase.title,
    descricao: `${phase.goal} Itens: ${phase.items.join(', ')}.`,
    prioridade: phase.status === 'prioritario' ? 'Crítica' : phase.status === 'em_execucao' ? 'Alta' : 'Média',
    status: statusByProgress(phase.progress),
    percentual: phase.progress,
    tipo: typeByPhase[phase.id] || 'Governança',
    impacto: `Executa a Regra-Mãe na dimensão: ${phase.title}.`
  })),
  ...planoModuleSprints.map((sprint) => ({
    fase: 'Plano de Melhoria • Módulos',
    modulo: sprint.module,
    titulo: `Melhoria contínua • ${sprint.module}`,
    descricao: sprint.focus,
    prioridade: sprint.priority,
    status: sprint.status === 'Planejado' ? 'Planejado' : sprint.status === 'Validando' ? 'Validando' : 'Em Execução',
    percentual: sprint.priority === 'Crítica' ? 85 : sprint.priority === 'Alta' ? 72 : 55,
    tipo: sprint.module === 'Sistema' ? 'Governança' : sprint.module === 'Financeiro' ? 'Governança' : sprint.module === 'Estoque' ? 'Estabilidade' : 'Integração',
    impacto: `Melhoria aplicada ao módulo ${sprint.module}, preservando funcionalidades existentes.`
  }))
];

export const fullPlanValidationStack = [
  { id: 'security', label: 'Segurança', functionName: 'securityAlerts', area: 'Sistema' },
  { id: 'sod', label: 'Segregação de funções', functionName: 'sodValidator', area: 'Acessos' },
  { id: 'permissions', label: 'Permissões', functionName: 'permissionOptimizer', area: 'Administração' },
  { id: 'audit', label: 'Auditoria de pedidos', functionName: 'orderFlowAuditor', area: 'Comercial' },
  { id: 'finance', label: 'Anomalias financeiras', functionName: 'iaFinanceAnomalyScan', area: 'Financeiro' },
  { id: 'backup', label: 'Continuidade', functionName: 'autoBackup', area: 'Sistema' }
];