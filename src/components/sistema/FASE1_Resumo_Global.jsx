# Fase 1 — Resumo Global de Mapeamento Técnico

Escopo consolidado: Cadastros, Administração do Sistema, Comercial, Financeiro, Estoque, Compras, CRM.

## 1) Arquivos críticos (consolidados)
- Layout/App
  - layout.js, components/layout/(ModuleLayout, ModuleHeader, ModuleKPIs, ModuleContainer, ModuleDashboard)
- Listagens/DataTable
  - components/ui/erp/DataTable.jsx, components/cadastros/VisualizadorUniversalEntidade.jsx
- RBAC/Segurança
  - components/ProtectedAction.jsx, components/security/ProtectedSection.jsx, components/lib/usePermissions.js, functions/entityGuard.js
- Multiempresa
  - components/lib/useContextoVisual.js (helpers InContext + filterInContext) — aplicado globalmente via Layout
- Auditoria
  - components/auditoria/*, functions/auditEntityEvents.js, functions/securityAlerts.js
- Backend utilitário
  - functions/entityListSorted.js, functions/countEntities.js, functions/sanitizeOnWrite.js

## 2) Riscos arquiteturais reais (top 8)
1. Consultas sem filtro multiempresa em pontos legados
2. Exportações sem AuditLog explícito
3. Tabelas não padronizadas (filtros/sort/paginação distintos)
4. Formulários monolíticos (>600 linhas)
5. Ações sensíveis sem data-permission/ProtectedAction
6. Falta de sanitizeOnWrite em mutações específicas
7. Falta de persistência de sort por entidade em algumas listas
8. Inconsistência visual de cabeçalhos/KPIs entre páginas

## 3) Módulos a adequar (ordem de impacto)
1. Comercial (Pedidos/Produtos/NF)  2. Financeiro (Pagar/Receber/Caixa)  3. Cadastros  4. Estoque  5. Compras  6. CRM  7. Administração/Config.

## 4) Violações Regra‑Mãe (amostras)
- Listas sem ERPDataTable; export sem auditoria; ausência de filterInContext; formulários grandes sem split.

## 5) Decisões globais da Fase 2
- RBAC visual padrão: desabilitar + tooltip + auditoria (Button/ProtectedAction)
- DataTable obrigatório: entityListSorted + countEntities; sort persistente
- Multiempresa: helpers InContext em toda mutação + filterInContext em leituras