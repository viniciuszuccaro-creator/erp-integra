
import { audit } from '../guard.js';

// Auditoria padronizada para operações de Estoque
export async function stockAudit(base44, user, { acao, entidade, registro_id, descricao, empresa_id = null, empresa_nome = null, dados_novos = null, duracao_ms = null }, meta = null) {
  try {
    await audit(base44, user || { full_name: 'Sistema' }, {
      acao,
      modulo: 'Estoque',
      entidade,
      registro_id,
      descricao,
      empresa_id,
      empresa_nome,
      dados_novos,
      duracao_ms,
    }, meta);
  } catch (_) {
    // auditoria não deve quebrar fluxo principal
  }
}
