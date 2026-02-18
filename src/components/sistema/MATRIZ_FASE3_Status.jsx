# Fase 3 — Matriz de Adequação (Parcial – Cadastros & Administração)

| Módulo/Seção               | Layout Padronizado | DataTable ERP (backend sort/pag) | RBAC Visual (disable+audit) | Multiempresa | Status |
|----------------------------|--------------------|-----------------------------------|-----------------------------|--------------|--------|
| Cadastros — Visualizador   | Parcial            | Parcial                            | Parcial                     | Parcial      | Em progresso |
| Produtos (listas)          | Parcial            | Parcial                            | Parcial                     | Parcial      | Em progresso |
| Clientes (listas)          | Parcial            | Parcial                            | Parcial                     | Parcial      | Em progresso |
| Fornecedores (listas)      | Parcial            | Parcial                            | Parcial                     | Parcial      | Em progresso |
| Transportadoras (listas)   | Parcial            | Parcial                            | Parcial                     | Parcial      | Em progresso |
| Admin — Gestão de Acessos  | Parcial            | Parcial                            | Parcial                     | N/A          | Em progresso |
| Admin — Auditorias         | Parcial            | Parcial                            | Parcial                     | N/A          | Em progresso |

Legendas: 
- Layout Padronizado = uso consistente de ModuleLayout/ModuleHeader/ModuleKPIs/ContentPadrao (ou equivalentes já existentes)
- DataTable ERP = ERPDataTable com sortField/sortDirection persistentes, paginação backend via entityListSorted
- RBAC Visual = data-permission + ProtectedAction (mode="disable") em ações sensíveis
- Multiempresa = filterInContext/getFiltroContexto nas listagens; create/updateInContext nas mutações

Próximos passos: concluir padronização nos itens marcados como Parcial, priorizando VisualizadorUniversalEntidade e Gestão de Acessos.