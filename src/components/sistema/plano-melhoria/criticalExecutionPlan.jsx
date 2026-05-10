export const criticalBacklogItems = [
  {
    fase: 'Prioridade Crítica',
    modulo: 'Sistema',
    titulo: 'Blindagem crítica de governança e acessos',
    descricao: 'Executar validações de RBAC, SoD, auditoria, segurança, backup e escopo multiempresa em Sistema/Administração.',
    prioridade: 'Crítica',
    status: 'Validando',
    percentual: 96,
    tipo: 'Governança',
    impacto: 'Reduz risco operacional, acessos indevidos e falhas sem rastreabilidade.'
  },
  {
    fase: 'Prioridade Crítica',
    modulo: 'Comercial',
    titulo: 'Fechamento crítico pedido → estoque → financeiro',
    descricao: 'Validar fluxo de pedido com aprovação, reserva/movimentação de estoque, financeiro, fiscal e logística conectados.',
    prioridade: 'Crítica',
    status: 'Validando',
    percentual: 92,
    tipo: 'Integração',
    impacto: 'Evita venda sem saldo, pedido sem rastreio e fechamento sem cobrança.'
  },
  {
    fase: 'Prioridade Crítica',
    modulo: 'Estoque',
    titulo: 'Saldo confiável e inventário auditável',
    descricao: 'Consolidar movimentações, inventário, reservas, contagem otimizada e alertas de ruptura por empresa e grupo.',
    prioridade: 'Crítica',
    status: 'Validando',
    percentual: 95,
    tipo: 'Estabilidade',
    impacto: 'Aumenta confiabilidade do estoque e reduz divergências operacionais.'
  },
  {
    fase: 'Prioridade Crítica',
    modulo: 'Financeiro',
    titulo: 'Caixa, cobrança e conciliação crítica',
    descricao: 'Reforçar liquidação, cobranças, boletos/PIX, conciliação, rateios e anomalias financeiras com auditoria.',
    prioridade: 'Crítica',
    status: 'Validando',
    percentual: 90,
    tipo: 'Governança',
    impacto: 'Melhora segurança financeira, previsibilidade de caixa e rastreabilidade de recebimentos/pagamentos.'
  }
];

export const criticalValidationActions = [
  {
    id: 'sod',
    label: 'Validar SoD',
    functionName: 'sodValidator',
    description: 'Conflitos de segregação de função em perfis críticos.'
  },
  {
    id: 'security',
    label: 'Alertas segurança',
    functionName: 'securityAlerts',
    description: 'Riscos e eventos sensíveis de segurança.'
  },
  {
    id: 'permissions',
    label: 'Otimizar permissões',
    functionName: 'permissionOptimizer',
    description: 'Sugestões de ajuste para perfis e acessos.'
  }
];