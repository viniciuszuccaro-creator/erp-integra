import { ShoppingCart, Users, Package, DollarSign, FileText, Truck, Calendar, Zap } from "lucide-react";

// Centraliza metadados dos módulos e ações rápidas
// Mantém nomes compatíveis com os módulos existentes para controle de acesso e navegação
const ModuleMap = {
  modules: {
    Dashboard: { page: "Dashboard" },
    "CRM - Relacionamento": { page: "CRM" },
    "Comercial e Vendas": { page: "Comercial" },
    "Estoque e Almoxarifado": { page: "Estoque" },
    "Compras e Suprimentos": { page: "Compras" },
    "Financeiro e Contábil": { page: "Financeiro" },
    "Expedição e Logística": { page: "Expedicao" },
    "Fiscal e Tributário": { page: "Fiscal" },
    "Recursos Humanos": { page: "RH" },
    "Configurações do Sistema": { page: "ConfiguracoesSistema" },
    "Agenda e Calendário": { page: "Agenda" },
  },
  // Ações globais (padronizadas) com módulo e permissão requerida
  quickActions: [
    { key: "novoPedido", label: "Novo Pedido", icon: ShoppingCart, module: "Comercial", perm: "criar" },
    { key: "novoCliente", label: "Novo Cliente", icon: Users, module: "CRM", perm: "criar" },
    { key: "novoProduto", label: "Novo Produto", icon: Package, module: "Estoque", perm: "criar" },
    { key: "novoFornecedor", label: "Novo Fornecedor", icon: Truck, module: "Compras", perm: "criar" },
    { key: "novaTabelaPreco", label: "Nova Tabela de Preço", icon: DollarSign, module: "Comercial", perm: "criar" },
    { key: "novaContaReceber", label: "Novo Título a Receber", icon: DollarSign, module: "Financeiro", perm: "criar" },
    { key: "novaContaPagar", label: "Novo Título a Pagar", icon: DollarSign, module: "Financeiro", perm: "criar" },
    { key: "novaOportunidade", label: "Nova Oportunidade CRM", icon: Users, module: "CRM", perm: "criar" },
    { key: "novoEvento", label: "Novo Evento/Compromisso", icon: Calendar, module: "Agenda", perm: "criar" },
    { key: "novaNFe", label: "Nova NF-e", icon: FileText, module: "Fiscal", perm: "criar" },
  ],
};

export default ModuleMap;