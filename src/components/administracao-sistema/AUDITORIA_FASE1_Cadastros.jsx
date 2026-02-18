# Fase 1 — Auditoria Técnica (Módulo: Cadastros Gerais)

Escopo: Produtos, Clientes, Fornecedores, Transportadoras, Colaboradores, Unidades, Marcas, Grupos de Produto, Setor de Atividade, Segmento Cliente, Região de Atendimento e afins.

---

## 1) Arquivos críticos mapeados
- Visualização/edição universal
  - components/cadastros/VisualizadorUniversalEntidade.jsx
  - components/cadastros/VisualizadorProdutos.jsx, DetalhesCadastro.jsx, DetalhesCliente.jsx, DetalhesFornecedor.jsx, DetalhesColaborador.jsx
- Formulários principais
  - components/cadastros/ProdutoForm*.jsx (Completo/V22/…)
  - components/cadastros/ClienteForm*.jsx, FornecedorForm*.jsx, TransportadoraForm*.jsx, ColaboradorForm*.jsx
  - seções: produto/(Preços, Fiscal/Contábil, Estoque Avançado, Peso/Dimensões)
- Listagens e importadores
  - components/estoque/ProdutosTab.jsx, components/compras/FornecedoresTab*.jsx, components/comercial/ClientesTab*.jsx
  - Importadores: ImportarProdutosLote.jsx, ImportacaoProdutoNFe.jsx, ImportadorProdutosPlanilha.jsx
- Utilidades comuns
  - components/lib/useContextoVisual.js, usePermissions.js, usePersistedSort.js, useBackendPagination.js, useEntityListSorted.js
  - functions/entityListSorted.js, functions/countEntities.js, functions/sanitizeOnWrite.js

## 2) Riscos arquiteturais reais
- R1: Filtro multiempresa ausente em algumas consultas herdadas (uso direto de list/filter sem getFiltroContexto)
- R2: Exportações sem auditoria explícita
- R3: DataTables heterogêneas (filtros e paginação diferentes)
- R4: Formulários longos sem subdivisão (manutenibilidade)
- R5: Campos sensíveis sem ProtectedAction/permission granular

## 3) Módulos que precisam adequação (prioridade)
1. VisualizadorUniversalEntidade (padronização total — já iniciado)
2. Listas de Produtos/Clientes/Fornecedores (convergir para ERPDataTable + entityListSorted)
3. Importadores (sanitização + auditoria de lote)
4. Formulários extensos (quebrar em subcomponentes coesos)

## 4) Violações Regra‑Mãe (detectadas/risco)
- V1: múltiplas listas sem ERPDataTable
- V2: exportar sem auditoria
- V3: mutações sem sanitizeOnWrite em pontos específicos
- V4: ausência de filterInContext em buscas universais antigas

## 5) Recomendações
- Padronizar todas as listagens em ERPDataTable, sempre consumindo entityListSorted + countEntities
- RBAC visual padrão: desabilitar + tooltip + auditoria
- Criar/adaptar subcomponentes para reduzir arquivos >600 linhas
- Garantir create/update/delete via helpers InContext

## 6) Checklist de Conformidade
- [ ] ERPDataTable em todas as listas
- [ ] entityListSorted + countEntities
- [ ] filterInContext/getFiltroContexto em consultas
- [ ] RBAC granular + audit
- [ ] sanitizeOnWrite nas mutações