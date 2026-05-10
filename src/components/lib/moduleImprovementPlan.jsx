export const MODULE_IMPROVEMENT_PILLARS = [
  "Multiempresa",
  "Controle de acesso",
  "Auditoria",
  "IA operacional",
  "Performance",
  "UX responsiva",
];

export const MODULE_IMPROVEMENT_STATUS = {
  Dashboard: { progress: 92, focus: "Consolidação executiva e indicadores em tempo real" },
  CRM: { progress: 88, focus: "Relacionamento, churn e oportunidades com contexto multiempresa" },
  Comercial: { progress: 90, focus: "Pedidos, margens, aprovação e rastreabilidade ponta a ponta" },
  Estoque: { progress: 94, focus: "Saldo seguro, movimentações auditadas e reposição inteligente" },
  Compras: { progress: 84, focus: "Suprimentos, fornecedores e ordens com governança" },
  Financeiro: { progress: 86, focus: "Fluxo de caixa, cobrança, conciliação e liquidação segura" },
  Fiscal: { progress: 82, focus: "Validação fiscal, NF-e e compliance tributário" },
  RH: { progress: 80, focus: "Colaboradores, ponto, férias e permissões por empresa" },
  Expedição: { progress: 87, focus: "Entregas, roteirização e comprovantes digitais" },
  Produção: { progress: 83, focus: "Ordens, apontamentos, insumos e produtividade" },
  Relatórios: { progress: 78, focus: "Análises consolidadas com filtros por grupo e empresa" },
  Cadastros: { progress: 89, focus: "Base mestre padronizada, integrada e segura" },
  Sistema: { progress: 91, focus: "Governança, segurança, integrações e automações" },
};

export function getModuleImprovementStatus(moduleName = "Sistema") {
  return MODULE_IMPROVEMENT_STATUS[moduleName] || MODULE_IMPROVEMENT_STATUS.Sistema;
}