# Fase 4 — Auditoria Multiempresa & RBAC (Checklist executável)

Padrões mandatórios (globais já aplicados):
- Listagens: entityListSorted + countEntities
- Multiempresa: filterInContext/getFiltroContexto + helpers create/update/deleteInContext
- RBAC visual: desabilitar + tooltip + auditoria (Button/ProtectedAction)
- RBAC backend: functions/entityGuard obrigatório em ações sensíveis
- Sanitização: functions/sanitizeOnWrite aplicado nas mutações críticas

## Itens de verificação por módulo
- [ ] Verificar campos empresa_id/campo específico (ex.: empresa_alocada_id em Colaborador) em TODAS as mutações
- [ ] Garantir group_id propagado quando em contexto de grupo
- [ ] Substituir chamadas diretas list/filter por filterInContext OU entityListSorted
- [ ] Conferir botões com data-permission (módulo.seção.ação)
- [ ] Rotas protegidas com ProtectedSection/resolveModule
- [ ] Exportações/Importações auditadas (AuditLog)

## Cobertura inicial (baseline)
- Comercial: Parcial
- Financeiro: Parcial
- Estoque: Parcial
- Compras: Parcial
- CRM: Parcial
- Administração: Parcial
- Cadastros: Parcial

Observação: o Layout já aplica wrappers de RBAC/multiempresa no SDK, mas a checagem acima garante ausência de brechas locais.