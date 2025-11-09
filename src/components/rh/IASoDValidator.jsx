import { base44 } from "@/api/base44Client";

/**
 * V21.5 - IA SoD (Segregação de Funções)
 * Previne conflitos de interesse em permissões
 */

const CONFLITOS_CRITICOS = [
  {
    nome: 'Criador de Fornecedor + Aprovador de Pagamento',
    permissao1: { modulo: 'Cadastros Gerais', nivel: 'Criar' },
    permissao2: { modulo: 'Financeiro e Contábil', nivel: 'Aprovar' },
    risco: 'Pode criar fornecedor falso e aprovar pagamento (FRAUDE)',
    bloqueio: true
  },
  {
    nome: 'Criador de Cliente + Aprovador de Crédito',
    permissao1: { modulo: 'Cadastros Gerais', nivel: 'Criar' },
    permissao2: { modulo: 'Comercial e Vendas', nivel: 'Aprovar' },
    risco: 'Pode criar cliente e aprovar limite sem validação',
    bloqueio: true
  },
  {
    nome: 'Criador de Pedido + Emissor de NF-e',
    permissao1: { modulo: 'Comercial e Vendas', nivel: 'Criar' },
    permissao2: { modulo: 'Fiscal e Tributário', nivel: 'Editar' },
    risco: 'Pode criar pedido fictício e emitir NF-e sem aprovação',
    bloqueio: false // Alerta mas não bloqueia (comum em pequenas empresas)
  },
  {
    nome: 'Movimentador de Estoque + Aprovador de OC',
    permissao1: { modulo: 'Estoque e Almoxarifado', nivel: 'Editar' },
    permissao2: { modulo: 'Compras e Suprimentos', nivel: 'Aprovar' },
    risco: 'Pode dar entrada fictícia e aprovar compra',
    bloqueio: true
  }
];

/**
 * Validar permissões de um usuário contra regras SoD
 */
export async function validarSoD(usuarioId, empresaId, novaPermissao = null) {
  console.log('🔒 Validando Segregação de Funções...');

  // Buscar permissões atuais
  const permissoesAtuais = await base44.entities.PermissaoEmpresaModulo.filter({
    usuario_id: usuarioId,
    empresa_id: empresaId
  });

  // Se há nova permissão sendo adicionada, incluir no array
  const permissoesCompletas = novaPermissao 
    ? [...permissoesAtuais, novaPermissao]
    : permissoesAtuais;

  const violacoes = [];

  // Verificar cada regra de conflito
  for (const regra of CONFLITOS_CRITICOS) {
    const temPermissao1 = permissoesCompletas.some(p => 
      p.modulo === regra.permissao1.modulo && 
      p.nivel_acesso === regra.permissao1.nivel
    );

    const temPermissao2 = permissoesCompletas.some(p => 
      p.modulo === regra.permissao2.modulo && 
      p.nivel_acesso === regra.permissao2.nivel
    );

    if (temPermissao1 && temPermissao2) {
      violacoes.push({
        regra: regra.nome,
        risco: regra.risco,
        bloqueio: regra.bloqueio,
        severidade: regra.bloqueio ? 'Crítico' : 'Alto'
      });
    }
  }

  return {
    valido: violacoes.filter(v => v.bloqueio).length === 0,
    violacoes,
    total_conflitos: violacoes.length,
    conflitos_bloqueantes: violacoes.filter(v => v.bloqueio).length
  };
}

/**
 * V21.5: Hook para usar no formulário de permissões
 */
export function useSoDValidation(usuarioId, empresaId) {
  const [validacao, setValidacao] = React.useState(null);

  const validar = async (novaPermissao) => {
    const resultado = await validarSoD(usuarioId, empresaId, novaPermissao);
    setValidacao(resultado);
    return resultado;
  };

  return { validacao, validar };
}

export default { validarSoD, useSoDValidation };