/**
 * PERMISSION MATRIX - MATRIZ DE PERMISSÕES PADRÃO
 * Define estruturas de permissão recomendadas
 */

export const ACOES_PADRAO = [
  'visualizar',
  'ver', // alias
  'criar',
  'editar',
  'excluir',
  'aprovar',
  'exportar',
  'cancelar'
];

export const PERFIS_PADRAO = {
  administrador: {
    nivel: 'Administrador',
    todasPermissoes: true
  },
  
  gerente: {
    nivel: 'Gerencial',
    permissoes: {
      Comercial: {
        Pedidos: ['visualizar', 'criar', 'editar', 'aprovar', 'cancelar', 'exportar'],
        Clientes: ['visualizar', 'criar', 'editar', 'exportar']
      },
      Financeiro: {
        ContasReceber: ['visualizar', 'aprovar', 'exportar'],
        ContasPagar: ['visualizar', 'aprovar', 'exportar']
      },
      Estoque: {
        Produtos: ['visualizar', 'exportar']
      }
    }
  },

  vendedor: {
    nivel: 'Operacional',
    permissoes: {
      Comercial: {
        Pedidos: ['visualizar', 'criar', 'editar'],
        Clientes: ['visualizar', 'criar', 'editar']
      },
      CRM: {
        Oportunidades: ['visualizar', 'criar', 'editar']
      }
    }
  },

  operacional: {
    nivel: 'Operacional',
    permissoes: {
      Estoque: {
        Movimentacoes: ['visualizar', 'criar'],
        Produtos: ['visualizar']
      },
      Compras: {
        Solicitacoes: ['visualizar', 'criar']
      }
    }
  },

  consulta: {
    nivel: 'Consulta',
    permissoes: {
      Comercial: { Pedidos: ['visualizar'] },
      Financeiro: { ContasReceber: ['visualizar'] },
      Estoque: { Produtos: ['visualizar'] }
    }
  }
};

export default { ACOES_PADRAO, PERFIS_PADRAO };