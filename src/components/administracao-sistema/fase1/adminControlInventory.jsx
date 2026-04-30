import { ADMIN_CONTROL_CONNECTION_MAP } from './adminControlConnectionMap';

export const ADMIN_CONTROL_INVENTORY = {
  administracaoSistema: {
    titulo: 'Administração do Sistema',
    itens: [
      { tipo: 'aba', id: 'gerais', label: 'Parâmetros Gerais', tela: 'AdminTabs', modulo: 'Sistema', section: 'Configurações', escopo: 'grupo/empresa/global', status: 'conectado' },
      { tipo: 'aba', id: 'integracoes', label: 'Integrações', tela: 'AdminTabs', modulo: 'Sistema', section: 'Integrações', escopo: 'grupo/empresa', status: 'conectado' },
      { tipo: 'aba', id: 'acessos', label: 'Gestão de Acessos', tela: 'AdminTabs', modulo: 'Sistema', section: 'Controle de Acesso', escopo: 'grupo/empresa', status: 'conectado' },
      { tipo: 'aba', id: 'seguranca', label: 'Segurança & Gov.', tela: 'AdminTabs', modulo: 'Sistema', section: 'Segurança', escopo: 'grupo/empresa/global', status: 'conectado' },
      { tipo: 'aba', id: 'ia', label: 'IA & Otimização', tela: 'AdminTabs', modulo: 'Sistema', section: 'IA', escopo: 'grupo/empresa', status: 'conectado' },
      { tipo: 'aba', id: 'auditoria', label: 'Auditoria e Logs', tela: 'AdminTabs', modulo: 'Sistema', section: 'Auditoria', escopo: 'grupo/empresa', status: 'conectado' },
      { tipo: 'acao', id: 'seedData', label: 'Executar Seed Leve', tela: 'AdminFerramentas', modulo: 'Sistema', section: 'Ferramentas', escopo: 'grupo/empresa', funcao: 'seedData', status: 'conectado' },
      { tipo: 'acao', id: 'backfillDry', label: 'Dry-run (visualizar)', tela: 'AdminFerramentas', modulo: 'Sistema', section: 'Ferramentas', escopo: 'global', funcao: 'backfillGroupEmpresa', status: 'conectado' },
      { tipo: 'acao', id: 'backfillApply', label: 'Aplicar Correções', tela: 'AdminFerramentas', modulo: 'Sistema', section: 'Ferramentas', escopo: 'global', funcao: 'backfillGroupEmpresa', status: 'conectado' }
    ]
  },
  configuracoesGerais: {
    titulo: 'Configurações Gerais',
    itens: [
      { tipo: 'aba', id: 'fiscal', label: 'Fiscal', tela: 'ConfigGlobal', modulo: 'Sistema', section: 'Configurações', chave: 'fiscal_cfop_interno', escopo: 'grupo/empresa/global', status: 'conectado' },
      { tipo: 'aba', id: 'notificacoes', label: 'Notificações', tela: 'ConfigGlobal', modulo: 'Sistema', section: 'Configurações', chave: 'notif_pedido_aprovado', escopo: 'grupo/empresa/global', status: 'conectado' },
      { tipo: 'aba', id: 'seguranca', label: 'Segurança', tela: 'ConfigGlobal', modulo: 'Sistema', section: 'Configurações', chave: 'seg_auditoria_detalhada', escopo: 'grupo/empresa/global', status: 'conectado' }
    ]
  },
  integracoes: {
    titulo: 'Integrações',
    itens: [
      { tipo: 'acao', id: 'criarBaseIntegracoes', label: 'Criar estrutura base', tela: 'IntegracoesIndex', modulo: 'Sistema', section: 'Integrações', escopo: 'empresa', funcao: 'upsertConfig' },
      { tipo: 'acao', id: 'testarWebhookAsaas', label: 'Testar webhook Asaas (pago)', tela: 'IntegracoesIndex', modulo: 'Sistema', section: 'Integrações', escopo: 'empresa', funcao: 'legacyIntegrationsMirror' },
      { tipo: 'acao', id: 'simularNfeAutorizada', label: 'Simular NF-e autorizada', tela: 'IntegracoesIndex', modulo: 'Sistema', section: 'Integrações', escopo: 'empresa', funcao: 'legacyIntegrationsMirror' }
    ]
  },
  ia: {
    titulo: 'IA & Otimização',
    itens: [
      { tipo: 'aba', id: 'iaModelos', label: 'IA e Modelos', tela: 'IAOtimizacaoIndex', modulo: 'Sistema', section: 'IA', chave: 'cc_ia_seguranca_ativa', escopo: 'grupo/empresa', status: 'conectado' },
      { tipo: 'aba', id: 'otimizacao', label: 'Otimização', tela: 'IAOtimizacaoIndex', modulo: 'Sistema', section: 'IA', chave: 'ia_producao', escopo: 'grupo/empresa', status: 'conectado' }
    ]
  },
  acessos: {
    titulo: 'Gestão de Acessos',
    itens: [
      { tipo: 'aba', id: 'perfis', label: 'Perfis RBAC', tela: 'GestaoAcessosIndex', modulo: 'Sistema', section: 'Controle de Acesso', chave: 'seg_auditoria_detalhada', escopo: 'grupo/empresa', status: 'conectado' },
      { tipo: 'aba', id: 'usuarios', label: 'Usuários', tela: 'GestaoAcessosIndex', modulo: 'Sistema', section: 'Controle de Acesso', chave: 'seg_auditoria_detalhada', escopo: 'grupo/empresa', status: 'conectado' },
      { tipo: 'aba', id: 'sod', label: 'SoD', tela: 'GestaoAcessosIndex', modulo: 'Sistema', section: 'Controle de Acesso', chave: 'cc_ia_seguranca_ativa', escopo: 'grupo/empresa', status: 'conectado' },
      { tipo: 'aba', id: 'relatorios', label: 'Relatórios', tela: 'GestaoAcessosIndex', modulo: 'Sistema', section: 'Controle de Acesso', chave: 'seg_auditoria_detalhada', escopo: 'grupo/empresa', status: 'conectado' }
    ]
  },
  seguranca: {
    titulo: 'Segurança & Governança',
    itens: [
      { tipo: 'aba', id: 'politicas', label: 'Políticas', tela: 'SegurancaGovernancaIndex', modulo: 'Sistema', section: 'Segurança', chave: 'seg_login_duplo_fator', escopo: 'grupo/empresa/global', status: 'conectado' },
      { tipo: 'aba', id: 'manutencao', label: 'Monitoramento & Manutenção', tela: 'SegurancaGovernancaIndex', modulo: 'Sistema', section: 'Segurança', chave: 'seg_auditoria_detalhada', escopo: 'grupo/empresa/global', status: 'conectado' },
      { tipo: 'aba', id: 'compliance', label: 'Compliance IA', tela: 'SegurancaGovernancaIndex', modulo: 'Sistema', section: 'Segurança', chave: 'cc_ia_seguranca_ativa', escopo: 'grupo/empresa/global', status: 'conectado' }
    ]
  },
  modulosPrincipais: {
    titulo: 'Módulos Principais',
    itens: [
      { tipo: 'fluxo', id: 'cadastros-governado', label: 'Cadastros', tela: 'Cadastros', modulo: 'Cadastros', section: 'Fluxo Principal', escopo: 'grupo/empresa', funcao: 'entityGuard', status: 'conectado' },
      { tipo: 'fluxo', id: 'financeiro-governado', label: 'Financeiro', tela: 'Financeiro', modulo: 'Financeiro', section: 'Fluxo Principal', escopo: 'grupo/empresa', funcao: 'paymentStatusManager', status: 'conectado' },
      { tipo: 'fluxo', id: 'comercial-governado', label: 'Comercial', tela: 'Comercial', modulo: 'Comercial', section: 'Fluxo Principal', escopo: 'grupo/empresa', funcao: 'onPedidoApprovalRequested', status: 'conectado' },
      { tipo: 'fluxo', id: 'estoque-governado', label: 'Estoque', tela: 'Estoque', modulo: 'Estoque', section: 'Fluxo Principal', escopo: 'grupo/empresa', funcao: 'applyInventoryAdjustments', status: 'conectado' },
      { tipo: 'fluxo', id: 'producao-governado', label: 'Produção', tela: 'Producao', modulo: 'Produção', section: 'Fluxo Principal', escopo: 'grupo/empresa', funcao: 'optimizerOrchestrator', status: 'conectado' },
      { tipo: 'fluxo', id: 'expedicao-governado', label: 'Expedição', tela: 'Expedicao', modulo: 'Expedição', section: 'Fluxo Principal', escopo: 'grupo/empresa', funcao: 'onEntregaUpdated', status: 'conectado' }
    ]
  }
};

export const ADMIN_CONTROL_GROUPS = Object.values(ADMIN_CONTROL_INVENTORY);
export const ADMIN_CONTROL_ITEMS = [...ADMIN_CONTROL_GROUPS.flatMap((grupo) => grupo.itens), ...ADMIN_CONTROL_CONNECTION_MAP];

export const ADMIN_CONTROL_REQUIREMENTS = [
  {
    id: 'rbac',
    label: 'Permissão RBAC por ação',
    description: 'Todo botão, aba, toggle e ação crítica deve passar por permissão antes de executar.',
    coveredBy: ['gerais', 'integracoes', 'acessos', 'seguranca', 'ia', 'auditoria', 'seedData', 'backfillDry', 'backfillApply']
  },
  {
    id: 'scope',
    label: 'Escopo grupo/empresa/global',
    description: 'Cada controle precisa declarar claramente onde a configuração se aplica.',
    coveredBy: ADMIN_CONTROL_ITEMS.map((item) => item.id)
  },
  {
    id: 'feedback',
    label: 'Feedback visual na execução',
    description: 'Ação precisa mostrar estado carregando, sucesso ou erro para o usuário.',
    coveredBy: ['seedData', 'backfillDry', 'backfillApply', 'criarBaseIntegracoes', 'testarWebhookAsaas', 'simularNfeAutorizada']
  },
  {
    id: 'audit',
    label: 'Auditoria na execução',
    description: 'Toda ação real precisa ter função/backend ou trilha auditável associada.',
    coveredBy: ADMIN_CONTROL_ITEMS.filter((item) => item.funcao).map((item) => item.id)
  },
  {
    id: 'toggleGate',
    label: 'Leitura de configuração antes da função real',
    description: 'Toggles-mãe precisam ser lidos por um helper único antes de liberar execução.',
    coveredBy: ['fiscal', 'notificacoes', 'seguranca', 'iaModelos', 'otimizacao', 'politicas', 'manutencao', 'compliance', 'seg_login_duplo_fator', 'seg_auditoria_detalhada', 'cc_ia_seguranca_ativa', 'integracoes_empresa_base', 'integracoes_webhook_asaas', 'integracoes_webhook_nfe']
  }
];