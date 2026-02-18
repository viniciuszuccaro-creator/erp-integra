# Fase 5 — Planejamento de Refatoração Estruturada (sem quebra)

Diretrizes: melhorar o que já existe; quebrar arquivos grandes em componentes menores; manter fluxo de usuário; w-full/h-full e responsividade.

## 1) Itens imediatos (pequenos PRs)
- VisualizadorUniversalEntidade: extrair subcomponentes (Toolbar, Views, EmptyState) — sem alterar API
- ClientesTab/FornecedoresTab/ProdutosTab: convergir para ERPDataTable (apenas consumir hooks existentes)

## 2) Itens de médio prazo
- Formulários longos (Produto/Cliente): dividir em seções/componentes <150 linhas; mover validações para hooks
- Unificar cabeçalhos via ModuleHeader existente (sem criar novo)

## 3) Itens de auditoria contínua
- Garantir data-permission em botões/abas críticos
- Confirmar sanitizeOnWrite em todas mutações admin/financeiro/comercial

Observação: nenhuma funcionalidade removida; somente reorganização e padronização visual/arquitetural.