/**
 * TEMPLATES DE PERFIS DE ACESSO - Predefinições para onboarding rápido
 * ETAPA 1: Acelera configuração inicial de RBAC
 */

export const PERFIL_ADMIN = {
  nome_perfil: 'Administrador',
  nivel_perfil: 'Administrador',
  descricao: 'Acesso total ao sistema',
  permissoes: {
    Comercial: { Pedidos: ['criar', 'editar', 'excluir', 'aprovar', 'cancelar', 'visualizar'] },
    Estoque: { Produtos: ['criar', 'editar', 'excluir', 'visualizar'], Movimentacoes: ['criar', 'visualizar'] },
    Financeiro: { ContasReceber: ['criar', 'editar', 'excluir', 'aprovar', 'visualizar'], ContasPagar: ['criar', 'editar', 'excluir', 'aprovar', 'visualizar'] },
    Compras: { OrdemCompra: ['criar', 'editar', 'excluir', 'visualizar'] },
    RH: { Colaboradores: ['criar', 'editar', 'excluir', 'visualizar'] },
    Fiscal: { NotaFiscal: ['criar', 'editar', 'excluir', 'visualizar'] }
  },
  ativo: true
};

export const PERFIL_GERENTE_VENDAS = {
  nome_perfil: 'Gerente de Vendas',
  nivel_perfil: 'Gerencial',
  descricao: 'Gerenciamento de pedidos e clientes',
  permissoes: {
    Comercial: { 
      Pedidos: ['criar', 'editar', 'aprovar', 'visualizar'],
      Clientes: ['criar', 'editar', 'visualizar']
    },
    Estoque: { Produtos: ['visualizar'] },
    Financeiro: { ContasReceber: ['visualizar'] }
  },
  ativo: true
};

export const PERFIL_VENDEDOR = {
  nome_perfil: 'Vendedor',
  nivel_perfil: 'Operacional',
  descricao: 'Criação de pedidos',
  permissoes: {
    Comercial: { 
      Pedidos: ['criar', 'visualizar'],
      Clientes: ['visualizar']
    },
    Estoque: { Produtos: ['visualizar'] }
  },
  ativo: true
};

export const PERFIL_GERENTE_FINANCEIRO = {
  nome_perfil: 'Gerente Financeiro',
  nivel_perfil: 'Gerencial',
  descricao: 'Aprovação e gestão financeira',
  permissoes: {
    Financeiro: {
      ContasReceber: ['editar', 'aprovar', 'visualizar'],
      ContasPagar: ['editar', 'aprovar', 'visualizar']
    },
    Comercial: { Pedidos: ['visualizar'] }
  },
  ativo: true
};

export const PERFIL_OPERACIONAL_ESTOQUE = {
  nome_perfil: 'Operacional de Estoque',
  nivel_perfil: 'Operacional',
  descricao: 'Movimentações de estoque',
  permissoes: {
    Estoque: {
      Movimentacoes: ['criar', 'visualizar'],
      Produtos: ['visualizar']
    }
  },
  ativo: true
};

export const PERFIS_PADRAO = [
  PERFIL_ADMIN,
  PERFIL_GERENTE_VENDAS,
  PERFIL_VENDEDOR,
  PERFIL_GERENTE_FINANCEIRO,
  PERFIL_OPERACIONAL_ESTOQUE
];

export function createPerfil(nome, permissoes) {
  return {
    nome_perfil: nome,
    nivel_perfil: 'Personalizado',
    descricao: `Perfil personalizado: ${nome}`,
    permissoes,
    ativo: true
  };
}

export default PERFIS_PADRAO;