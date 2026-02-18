# Fase 3 — Matriz de Adequação (Completa — visão consolidada)

| Módulo/Seção                         | Layout Padronizado | DataTable ERP (entityListSorted+count) | RBAC Visual (disable+audit) | Multiempresa | Status       |
|--------------------------------------|--------------------|----------------------------------------|-----------------------------|--------------|--------------|
| Comercial — Produtos (listas)        | Parcial            | Parcial                                 | Parcial                     | Parcial      | Em progresso |
| Comercial — Pedidos                  | Parcial            | Parcial                                 | Parcial                     | Parcial      | Em progresso |
| Comercial — Notas Fiscais            | Parcial            | Parcial                                 | Parcial                     | Parcial      | Em progresso |
| Financeiro — Contas a Pagar          | Parcial            | Parcial                                 | Parcial                     | Parcial      | Em progresso |
| Financeiro — Contas a Receber        | Parcial            | Parcial                                 | Parcial                     | Parcial      | Em progresso |
| Financeiro — Caixa/Caixa Central     | Parcial            | Parcial                                 | Parcial                     | Parcial      | Em progresso |
| Estoque — Produtos                   | Parcial            | Parcial                                 | Parcial                     | Parcial      | Em progresso |
| Compras — Fornecedores/OC            | Parcial            | Parcial                                 | Parcial                     | Parcial      | Em progresso |
| CRM — Clientes/Oportunidades         | Parcial            | Parcial                                 | Parcial                     | Parcial      | Em progresso |
| Administração — Gestão de Acessos    | Parcial            | Parcial                                 | Parcial                     | N/A          | Em progresso |
| Administração — Auditorias/Logs      | Parcial            | Parcial                                 | Parcial                     | N/A          | Em progresso |
| Cadastros — Visualizador Universal   | Parcial            | Parcial                                 | Parcial                     | Parcial      | Em progresso |
| Configuração do Sistema              | Parcial            | Parcial                                 | Parcial                     | N/A          | Em progresso |

Legendas:
- Layout Padronizado = ModuleLayout/ModuleHeader/ModuleKPIs/ContentPadrao (ou equivalentes já existentes)
- DataTable ERP = ERPDataTable com sort persistente + paginação backend via entityListSorted + countEntities
- RBAC Visual = data-permission + ProtectedAction (mode="disable") com tooltip e auditoria
- Multiempresa = filterInContext/getFiltroContexto; create/update/delete InContext

Próximos passos: finalizar padronização por módulo com checklists locais e PRs atômicos.