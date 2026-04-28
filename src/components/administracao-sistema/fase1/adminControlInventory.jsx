export const ADMIN_CONTROL_INVENTORY = {
  administracaoSistema: {
    titulo: 'Administração do Sistema',
    itens: [
      { tipo: 'aba', id: 'gerais', label: 'Parâmetros Gerais', tela: 'AdminTabs', modulo: 'Sistema', section: 'Configurações', escopo: 'grupo/empresa/global' },
      { tipo: 'aba', id: 'integracoes', label: 'Integrações', tela: 'AdminTabs', modulo: 'Sistema', section: 'Integrações', escopo: 'grupo/empresa' },
      { tipo: 'aba', id: 'acessos', label: 'Gestão de Acessos', tela: 'AdminTabs', modulo: 'Sistema', section: 'Controle de Acesso', escopo: 'grupo/empresa' },
      { tipo: 'aba', id: 'seguranca', label: 'Segurança & Gov.', tela: 'AdminTabs', modulo: 'Sistema', section: 'Segurança', escopo: 'grupo/empresa/global' },
      { tipo: 'aba', id: 'ia', label: 'IA & Otimização', tela: 'AdminTabs', modulo: 'Sistema', section: 'IA', escopo: 'grupo/empresa' },
      { tipo: 'aba', id: 'auditoria', label: 'Auditoria e Logs', tela: 'AdminTabs', modulo: 'Sistema', section: 'Auditoria', escopo: 'grupo/empresa' },
      { tipo: 'acao', id: 'seedData', label: 'Executar Seed Leve', tela: 'AdminFerramentas', modulo: 'Sistema', section: 'Ferramentas', escopo: 'grupo/empresa', funcao: 'seedData' },
      { tipo: 'acao', id: 'backfillDry', label: 'Dry-run (visualizar)', tela: 'AdminFerramentas', modulo: 'Sistema', section: 'Ferramentas', escopo: 'global', funcao: 'backfillGroupEmpresa' },
      { tipo: 'acao', id: 'backfillApply', label: 'Aplicar Correções', tela: 'AdminFerramentas', modulo: 'Sistema', section: 'Ferramentas', escopo: 'global', funcao: 'backfillGroupEmpresa' }
    ]
  },
  configuracoesGerais: {
    titulo: 'Configurações Gerais',
    itens: [
      { tipo: 'aba', id: 'fiscal', label: 'Fiscal', tela: 'ConfigGlobal', modulo: 'Sistema', section: 'Configurações', escopo: 'grupo/empresa/global' },
      { tipo: 'aba', id: 'notificacoes', label: 'Notificações', tela: 'ConfigGlobal', modulo: 'Sistema', section: 'Configurações', escopo: 'grupo/empresa/global' },
      { tipo: 'aba', id: 'seguranca', label: 'Segurança', tela: 'ConfigGlobal', modulo: 'Sistema', section: 'Configurações', escopo: 'grupo/empresa/global' }
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
      { tipo: 'aba', id: 'iaModelos', label: 'IA e Modelos', tela: 'IAOtimizacaoIndex', modulo: 'Sistema', section: 'IA', escopo: 'grupo/empresa' },
      { tipo: 'aba', id: 'otimizacao', label: 'Otimização', tela: 'IAOtimizacaoIndex', modulo: 'Sistema', section: 'IA', escopo: 'grupo/empresa' }
    ]
  },
  acessos: {
    titulo: 'Gestão de Acessos',
    itens: [
      { tipo: 'aba', id: 'perfis', label: 'Perfis RBAC', tela: 'GestaoAcessosIndex', modulo: 'Sistema', section: 'Controle de Acesso', escopo: 'grupo/empresa' },
      { tipo: 'aba', id: 'usuarios', label: 'Usuários', tela: 'GestaoAcessosIndex', modulo: 'Sistema', section: 'Controle de Acesso', escopo: 'grupo/empresa' },
      { tipo: 'aba', id: 'sod', label: 'SoD', tela: 'GestaoAcessosIndex', modulo: 'Sistema', section: 'Controle de Acesso', escopo: 'grupo/empresa' },
      { tipo: 'aba', id: 'relatorios', label: 'Relatórios', tela: 'GestaoAcessosIndex', modulo: 'Sistema', section: 'Controle de Acesso', escopo: 'grupo/empresa' }
    ]
  },
  seguranca: {
    titulo: 'Segurança & Governança',
    itens: [
      { tipo: 'aba', id: 'politicas', label: 'Políticas', tela: 'SegurancaGovernancaIndex', modulo: 'Sistema', section: 'Segurança', escopo: 'grupo/empresa/global' },
      { tipo: 'aba', id: 'manutencao', label: 'Monitoramento & Manutenção', tela: 'SegurancaGovernancaIndex', modulo: 'Sistema', section: 'Segurança', escopo: 'grupo/empresa/global' },
      { tipo: 'aba', id: 'compliance', label: 'Compliance IA', tela: 'SegurancaGovernancaIndex', modulo: 'Sistema', section: 'Segurança', escopo: 'grupo/empresa/global' }
    ]
  }
};

export const ADMIN_CONTROL_GROUPS = Object.values(ADMIN_CONTROL_INVENTORY);
export const ADMIN_CONTROL_ITEMS = ADMIN_CONTROL_GROUPS.flatMap((grupo) => grupo.itens);