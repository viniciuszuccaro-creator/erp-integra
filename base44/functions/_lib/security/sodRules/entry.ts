// Regras e detecção de Segregação de Funções (SoD)

const regras = [
  { modulo: 'Financeiro', conflito: ['aprovar', 'criar'], severidade: 'Alta', descricao: 'Quem aprova no Financeiro não deve criar.' },
  { modulo: 'Financeiro', conflito: ['aprovar', 'editar'], severidade: 'Alta', descricao: 'Quem aprova no Financeiro não deve editar.' },
  { modulo: 'Financeiro', conflito: ['aprovar', 'excluir'], severidade: 'Crítica', descricao: 'Quem aprova no Financeiro não deve excluir.' },
  { modulo: 'Compras', conflito: ['aprovar', 'criar'], severidade: 'Alta', descricao: 'Quem aprova compras não deve criar solicitações/OCs.' },
  { modulo: 'Compras', conflito: ['aprovar', 'editar'], severidade: 'Alta', descricao: 'Quem aprova compras não deve editar solicitações/OCs.' },
  { modulo: 'Fiscal', conflito: ['emitir', 'aprovar'], severidade: 'Média', descricao: 'Separar emissão e aprovação fiscal.' },
  { modulo: 'Comercial', conflito: ['aprovar', 'descontos_especiais'], severidade: 'Média', descricao: 'Aprovação e concessão de descontos especiais.' },
  { modulo: 'Sistema', conflito: ['gerenciar_usuarios', 'aprovar'], severidade: 'Alta', descricao: 'Gerenciar usuários e aprovar processos.' },
];

export function detectSodConflicts(permissoes) {
  const conflitos = [];
  let severidadeMax = null;

  for (const regra of regras) {
    const mod = permissoes?.[regra.modulo];
    if (!mod) continue;
    const secoes = Object.values(mod || {});
    const acoesPresentes = new Set();
    for (const lista of secoes) {
      if (Array.isArray(lista)) for (const ac of lista) acoesPresentes.add(String(ac));
    }
    if (regra.conflito.every((ac) => acoesPresentes.has(ac))) {
      conflitos.push({
        tipo_conflito: `${regra.modulo}:${regra.conflito.join('+')}`,
        descricao: regra.descricao,
        severidade: regra.severidade,
        data_deteccao: new Date().toISOString(),
      });
      if (!severidadeMax || prioridade(regra.severidade) > prioridade(severidadeMax)) {
        severidadeMax = regra.severidade;
      }
    }
  }
  return { conflitos, severidadeMax };
}

function prioridade(level) {
  return { 'Média': 1, 'Alta': 2, 'Crítica': 3 }[level] || 0;
}