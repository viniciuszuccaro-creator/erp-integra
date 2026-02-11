import { audit } from '../guard.js';

// Auditoria padronizada para operações de Estoque
export async function stockAudit(base44, user, { acao, entidade, registro_id, descricao, empresa_id = null, dados_novos = null, duracao_ms = null }) {
  try {
    await audit(base44, user || { full_name: 'Sistema' }, {
      acao,
      modulo: 'Estoque',
      entidade,
      registro_id,
      descricao,
      empresa_id,
      dados_novos,
      duracao_ms,
    });
  } catch (_) {
    // auditoria não deve quebrar fluxo principal
  }
}