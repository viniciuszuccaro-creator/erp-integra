export const ADMIN_CONTROL_CONNECTION_MAP = [
  {
    id: 'seg_login_duplo_fator',
    tipo: 'toggle',
    label: 'Exigir MFA no login',
    tela: 'SegurancaGovernancaIndex',
    modulo: 'Sistema',
    section: 'Segurança',
    chave: 'seg_login_duplo_fator',
    aliases: ['cc_exigir_mfa'],
    gateBefore: 'verifyTotp',
    funcao: 'verifyTotp',
    efeito: 'bloqueia acesso sem segundo fator no fluxo de autenticação',
    escopo: 'grupo/empresa/global',
    status: 'conectado'
  },
  {
    id: 'seg_auditoria_detalhada',
    tipo: 'toggle',
    label: 'Auditoria detalhada',
    tela: 'SegurancaGovernancaIndex',
    modulo: 'Sistema',
    section: 'Segurança',
    chave: 'seg_auditoria_detalhada',
    aliases: ['cc_auditoria_automatica'],
    gateBefore: 'auditEntityEvents',
    funcao: 'auditEntityEvents',
    efeito: 'libera registro detalhado de eventos e execuções administrativas',
    escopo: 'grupo/empresa/global',
    status: 'conectado'
  },
  {
    id: 'cc_ia_seguranca_ativa',
    tipo: 'toggle',
    label: 'IA de segurança ativa',
    tela: 'IAOtimizacaoIndex',
    modulo: 'Sistema',
    section: 'IA',
    chave: 'cc_ia_seguranca_ativa',
    aliases: ['seg_ia_seguranca'],
    gateBefore: 'securityAlerts',
    funcao: 'securityAlerts',
    efeito: 'libera análise e alertas inteligentes de risco e segurança',
    escopo: 'grupo/empresa/global',
    status: 'conectado'
  },
  {
    id: 'integracoes_empresa_base',
    tipo: 'acao',
    label: 'Criar estrutura base de integrações',
    tela: 'IntegracoesIndex',
    modulo: 'Sistema',
    section: 'Integrações',
    chave: 'integracoes_{empresa_id}',
    gateBefore: 'upsertConfig',
    funcao: 'upsertConfig',
    efeito: 'inicializa configuração central da empresa para NF-e e Boletos/PIX',
    escopo: 'empresa',
    status: 'conectado'
  },
  {
    id: 'integracoes_webhook_asaas',
    tipo: 'acao',
    label: 'Testar webhook Asaas',
    tela: 'IntegracoesIndex',
    modulo: 'Sistema',
    section: 'Integrações',
    chave: 'seg_auditoria_detalhada',
    gateBefore: 'legacyIntegrationsMirror',
    funcao: 'legacyIntegrationsMirror',
    efeito: 'simula retorno de pagamento e espelhamento de integrações',
    escopo: 'empresa',
    status: 'conectado'
  },
  {
    id: 'integracoes_webhook_nfe',
    tipo: 'acao',
    label: 'Simular NF-e autorizada',
    tela: 'IntegracoesIndex',
    modulo: 'Sistema',
    section: 'Integrações',
    chave: 'seg_auditoria_detalhada',
    gateBefore: 'legacyIntegrationsMirror',
    funcao: 'legacyIntegrationsMirror',
    efeito: 'simula retorno de NF-e autorizada para espelhamento',
    escopo: 'empresa',
    status: 'conectado'
  },
  {
    id: 'ia_leitura_projetos',
    tipo: 'toggle',
    label: 'IA Leitura de Projetos',
    tela: 'IAOtimizacaoIndex',
    modulo: 'Sistema',
    section: 'IA',
    chave: 'ia_leitura_projetos',
    aliases: ['cc_ia_leitura_projetos'],
    gateBefore: 'catalogProducts',
    funcao: 'catalogProducts',
    efeito: 'autoriza leitura inteligente de projetos e apoio à classificação',
    escopo: 'grupo/empresa',
    status: 'parcial'
  },
  {
    id: 'ia_preditiva_vendas',
    tipo: 'toggle',
    label: 'IA Preditiva de Vendas',
    tela: 'IAOtimizacaoIndex',
    modulo: 'Sistema',
    section: 'IA',
    chave: 'ia_preditiva_vendas',
    aliases: ['cc_ia_preditiva_vendas'],
    gateBefore: 'iaChurnAnalyzer',
    funcao: 'iaChurnAnalyzer',
    efeito: 'habilita previsão de churn e inteligência comercial',
    escopo: 'grupo/empresa',
    status: 'parcial'
  },
  {
    id: 'ia_conciliacao',
    tipo: 'toggle',
    label: 'IA Conciliação Bancária',
    tela: 'IAOtimizacaoIndex',
    modulo: 'Sistema',
    section: 'IA',
    chave: 'ia_conciliacao',
    aliases: ['cc_ia_conciliacao'],
    gateBefore: 'iaFinanceAnomalyScan',
    funcao: 'iaFinanceAnomalyScan',
    efeito: 'habilita detecção de anomalias e apoio à conciliação',
    escopo: 'grupo/empresa',
    status: 'parcial'
  },
  {
    id: 'ia_producao',
    tipo: 'toggle',
    label: 'IA Produção',
    tela: 'IAOtimizacaoIndex',
    modulo: 'Sistema',
    section: 'IA',
    chave: 'ia_producao',
    aliases: ['cc_ia_producao'],
    gateBefore: 'optimizerOrchestrator',
    funcao: 'optimizerOrchestrator',
    efeito: 'habilita automações de otimização operacional e produtiva',
    escopo: 'grupo/empresa',
    status: 'parcial'
  }
];

export function getConnectionStatusSummary() {
  return ADMIN_CONTROL_CONNECTION_MAP.reduce((acc, item) => {
    acc.total += 1;
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { total: 0, conectado: 0, parcial: 0, pendente: 0 });
}