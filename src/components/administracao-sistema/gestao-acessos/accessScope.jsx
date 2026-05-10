export const normalizeEmpresaIds = (values = []) => (Array.isArray(values) ? values : [])
  .map((item) => (typeof item === "string" ? item : item?.empresa_id || item?.id))
  .filter(Boolean);

export function getAccessScope({ contexto, empresaAtual, grupoAtual, empresasDoGrupo = [] } = {}) {
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || (() => {
    try { return localStorage.getItem("group_atual_id"); } catch { return null; }
  })();
  const empresaId = contexto === "grupo" ? null : empresaAtual?.id || null;
  const empresasIds = empresasDoGrupo.map((empresa) => empresa.id).filter(Boolean);
  const scopeKey = contexto === "grupo" ? (groupId || "sem-grupo") : (empresaId || groupId || "sem-contexto");

  return {
    groupId,
    empresaId,
    empresasIds,
    scopeKey,
    contextoValido: contexto === "grupo" ? !!groupId : !!empresaId,
  };
}

export function isUserInAccessScope(user, scope, contexto, empresaAtual) {
  const empresasVinculadas = normalizeEmpresaIds(user?.empresas_vinculadas);
  const temMarcadorEscopo = Boolean(
    user?.group_id || user?.grupo_id || user?.grupo_atual_id || user?.empresa_id || user?.empresa_atual_id || empresasVinculadas.length
  );

  if (!temMarcadorEscopo) return true;

  if (contexto === "grupo") {
    return user?.group_id === scope.groupId
      || user?.grupo_id === scope.groupId
      || user?.grupo_atual_id === scope.groupId
      || empresasVinculadas.some((id) => scope.empresasIds.includes(id));
  }

  return user?.empresa_id === empresaAtual?.id
    || user?.empresa_atual_id === empresaAtual?.id
    || empresasVinculadas.includes(empresaAtual?.id);
}

export function buildAccessAudit({ operador, scope, empresaAtual, acao, entidade, registroId, descricao, dadosAnteriores, dadosNovos }) {
  return {
    usuario: operador?.full_name || operador?.email || "Usuário",
    usuario_id: operador?.id || null,
    empresa_id: scope?.empresaId || null,
    group_id: scope?.groupId || null,
    empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
    acao,
    modulo: "Controle de Acesso",
    tipo_auditoria: "seguranca",
    entidade,
    registro_id: registroId || null,
    descricao,
    dados_anteriores: dadosAnteriores || null,
    dados_novos: dadosNovos || null,
    sucesso: true,
    data_hora: new Date().toISOString(),
  };
}