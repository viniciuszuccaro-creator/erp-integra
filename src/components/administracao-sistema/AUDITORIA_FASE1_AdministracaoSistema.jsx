# Fase 1 — Auditoria Técnica (Módulo: Administração do Sistema)

Escopo: páginas e componentes de Administração/Configurações/Security & Governance, Gestão de Acessos (RBAC), Auditorias, Integrações, Monitoramento e Backups.

---

## 1) Arquivos críticos mapeados
- Páginas centrais
  - pages/AdministracaoSistema.jsx
  - components/administracao-sistema/IntegracoesIndex.jsx
  - components/administracao-sistema/configuracoes-gerais/ConfiguracoesGeraisIndex.jsx
  - components/administracao-sistema/seguranca-governanca/SegurancaGovernancaIndex.jsx
  - components/administracao-sistema/auditoria-logs/AuditoriaLogsIndex.jsx
  - components/administracao-sistema/MonitoramentoManutencaoIndex.jsx
- Gestão de acessos / RBAC
  - components/administracao-sistema/gestao-acessos/GestaoAcessosIndex.jsx
  - components/administracao-sistema/gestao-acessos/SoDChecker.jsx, SoDResults.jsx
  - components/sistema/CentralPerfisAcesso.jsx, ComparadorPerfis.jsx, ClonarPerfilModal.jsx
  - components/security/ProtectedSection.jsx, components/ProtectedAction.jsx, components/security/ProtectedField.jsx
  - components/lib/usePermissions.js (resolução + aliases + granularidade)
- Segurança e auditoria
  - functions/auditEntityEvents.js, functions/securityAlerts.js
  - components/auditoria/LogsAuditoria.jsx, AuditTrailPanel.jsx, AuditDetailsDialog.jsx, GlobalAuditLog.jsx
  - components/lib/uiAudit.js, components/lib/uiAuditScanner.js
- Integrações & infraestrutura
  - components/administracao-sistema/IntegracoesIndex.jsx, ExternalAppsHub.jsx
  - functions/permissionOptimizer.js, functions/sanitizeOnWrite.js
  - functions/optimizerOrchestrator.js, functions/groupConsolidation.js
  - components/sistema/ConfigCenter.jsx, ConfiguracaoBackup.jsx, MonitoramentoSistema, Backup docs

## 2) Riscos arquiteturais reais
- RBAC/Permissões
  - R1.1: Ações administrativas sem data-permission explícita em pontos isolados (risco de UX inconsistente)
  - R1.2: Falta de ProtectedAction (mode="disable") envolvendo botões sensíveis em telas de manutenção
- Multiempresa
  - R2.1: Telas administrativas que listam entidades globais sem aplicar getFiltroContexto/filterInContext (ex.: empresas do grupo vs. escopo local)
- Auditoria & Segurança
  - R3.1: Operações de configuração/integradores sem registro de AuditLog (antes/depois)
  - R3.2: Sanitização inconsistente nas mutações de configurações (precisa garantir sanitizeOnWrite)
- Manutenção/Padronização
  - R4.1: Algumas tabelas ad hoc sem ERPDataTable (perda de padronização: sort/paginação/auditoria visual)
  - R4.2: Dispersão de botões e seções sem padrão comum de Layout/KPIs/HeaderAdmin

## 3) Módulos que precisam adequação (prioridade)
1. Gestão de Acessos (Perfis/SoD/Gestão)
   - Garantir data-permission em todos os botões
   - Ações de clonar/perfil/aplicar permissões com ProtectedAction (disable+tooltip) e AuditLog
2. Configurações Gerais / Segurança & Governança
   - Adotar ERPDataTable onde há listagens (logs, regras, políticas)
   - Usar filterInContext e persistência de sort (usePersistedSort) quando listar entidades
3. Auditoria & Logs
   - Exportações de logs protegidas por permissão "Sistema.Auditoria.exportar" + registro AuditLog
   - Conferir integração com auditEntityEvents.js em todas as telas admin críticas
4. Integrações
   - Botões de conectar/testar/desconectar com ProtectedAction e auditoria (resultado da ação)
5. Monitoramento & Backups
   - Garantir RBAC granular (Sistema.Monitoramento.visualizar, .executar, .exportar)
   - Registrar ações manuais (forçar backup, restaurar, testar webhook) em AuditLog

## 4) Violações Regra‑Mãe (detectadas/risco)
- V1: Botões administrativos sem data-permission/ProtectedAction em alguns componentes
- V2: Listagens não padronizadas (sem ERPDataTable) em pontos de auditoria/integrações
- V3: Mutações de configuração sem sanitizeOnWrite e sem auditoria de antes/depois
- V4: Falta de filterInContext em consultas que deveriam respeitar empresa/grupo

## 5) Recomendações Fases 2–5 (objetivas)
- Padronização visual admin
  - Header/CabeçalhoAdmin + KPIsAdmin + ContentPadrao (reutilizar padrões existentes do layout)
- DataTable ERP em todas as listas admin
  - sortField/sortDirection via usePersistedSort
  - Backend ordering via functions/entityListSorted + useEntityListSorted
  - Paginação backend via useBackendPagination
- RBAC + Auditoria
  - Ações sensíveis: <ProtectedAction mode="disable"/> com data-permission
  - Export/Import/Testes de integração: AuditLog obrigatório (antes/depois quando aplicável)
- Multiempresa
  - filterInContext/getFiltroContexto obrigatórios em todas as telas que consultam entidades
- Segurança
  - Aplicar sanitizeOnWrite nas mutações de configurações/admin

## 6) Checklist de Conformidade (execução)
- [ ] Todas as páginas admin com cabeçalho/KPIs/ContentPadrao consistentes
- [ ] Todas as listagens → ERPDataTable + backend sort/paginação
- [ ] Todas as consultas → filterInContext/getFiltroContexto
- [ ] Botões → data-permission + ProtectedAction (disable+tooltip)
- [ ] Export/Import/Testes → protegidos e auditados
- [ ] Sanitização → sanitizeOnWrite em mutações
- [ ] Auditoria consolidada nas ações críticas