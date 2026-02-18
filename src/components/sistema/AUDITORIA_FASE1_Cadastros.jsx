# Fase 1 — Auditoria Técnica (Módulo: Cadastros)

Escopo: Cadastros Gerais (Clientes, Fornecedores, Produtos, Transportadoras, Usuários/Perfis, Tabelas correlatas) e componentes utilitários diretamente relacionados.

---

## 1) Arquivos críticos mapeados
- Visualização/Lista
  - components/cadastros/VisualizadorUniversalEntidade.jsx
  - components/estoque/ProdutosTab.jsx, components/cadastros/VisualizadorProdutos.jsx
  - components/comercial/ClientesTab.jsx, components/comercial/ClientesTabOptimized.jsx
  - components/compras/FornecedoresTab.jsx, components/compras/FornecedoresTabOptimized.jsx
- Formulários principais
  - components/cadastros/CadastroClienteCompleto.jsx, ClienteForm/…
  - components/cadastros/CadastroFornecedorCompleto.jsx, DetalhesFornecedor.jsx, AvaliacaoFornecedorForm.jsx
  - components/cadastros/ProdutoFormV22_Completo.jsx, ProdutoFormCompleto.jsx, ProdutoForm.jsx
  - components/cadastros/TransportadoraForm.jsx
  - components/cadastros/PerfilAcessoForm.jsx, UsuarioForm.jsx
- Infra comum
  - components/ui/erp/DataTable.jsx (ERPDataTable)
  - components/lib/useContextoVisual.js (multiempresa + helpers)
  - components/lib/useEntityListSorted.js, useBackendPagination.js, usePersistedSort.js
  - components/ui/button.jsx, components/ui/select.jsx, components/ui/input.jsx (RBAC visual + auditoria)
  - components/ProtectedAction.jsx, components/security/ProtectedSection.jsx
  - functions/sanitizeOnWrite.js (sanitização), functions/entityListSorted.js (backend sort)

## 2) Riscos arquiteturais reais
- Multiempresa
  - R1.1: Formulários legados ainda usando base44.entities.X.create/update direto, sem carimbar contexto via createInContext/updateInContext
  - R1.2: Listagens que consumem .list()/filter sem getFiltroContexto/filterInContext (risco de vazar registros entre empresas/grupo)
- RBAC
  - R2.1: Botões/ações sem data-permission/ProtectedAction em partes dos cadastros
  - R2.2: Abas e campos sensíveis sem ProtectedSection/ProtectedField
- DataTable
  - R3.1: Listas heterogêneas (algumas com ERPDataTable, outras com tabelas ad hoc)
  - R3.2: Ordenação/paginação no frontend em páginas com volume alto
- Segurança/Qualidade
  - R4.1: Falta de sanitização consistente (sanitizeOnWrite) em mutações específicas
  - R4.2: Ausência de auditoria (AuditLog) em operações críticas (inativar, importar, exportar)
- Manutenibilidade
  - R5.1: Arquivos de formulário extensos (>600 linhas) sem extração por seções (Preço, Fiscal, SEO, Conversões, etc.)

## 3) Módulos que precisam adequação (prioridade)
1. VisualizadorUniversalEntidade
   - Garantir: ERPDataTable + permission="<Modulo.Secao.visualizar>" + export protegido por ProtectedAction (mode="disable")
   - Filtragem: usar filterInContext + persistência de sort (usePersistedSort)
2. Produtos (ProdutosTab/VisualizadorProdutos/ProdutoForm*)
   - Criar/editar: updateInContext/createInContext + sanitizeOnWrite
   - Listas: ERPDataTable com backend sort/paginação (entityListSorted + useEntityListSorted)
   - RBAC granular: Comercial.Produto.(visualizar|criar|editar|excluir|exportar)
3. Clientes/Fornecedores/Transportadoras
   - Ações sensíveis (inativar/bloquear): ProtectedAction + auditoria de antes/depois
   - Consumo de listas: filterInContext + ordenação obrigatória (DEFAULT_SORTS)
4. Perfis de Acesso/Usuários (Admin)
   - Garantir edição apenas admin; UI desabilitada com tooltip; entityGuard no backend para operações
5. Importações em lote (planilhas/NFe)
   - Sanitização + auditoria de lote + carimbo de contexto por item

## 4) Violações Regra‑Mãe (detectadas/risco)
- V1: Uso direto de base44.entities.*.create/update sem carimbar contexto (risco multiempresa)
- V2: Botões sem data-permission e sem ProtectedAction em ações destrutivas (excluir/inativar)
- V3: Tabelas custom sem ERPDataTable (perda de consistência de UX, sort/paginação inconsistentes)
- V4: Arquivos de formulário grandes sem componentização por seções (afetando manutenibilidade)
- V5: Exportações sem RBAC + auditoria

## 5) Recomendações Fases 2–5 (objetivas e incrementais)
- Padronizar todas as listas para ERPDataTable com:
  - sortField/sortDirection controlados por usePersistedSort
  - backend list via useEntityListSorted (functions/entityListSorted)
  - paginação backend (useBackendPagination)
- Multiempresa
  - CRUD exclusivamente via createInContext/updateInContext; listas por filterInContext
  - Revisar importadores para carimbar contexto item a item
- RBAC Visual + Auditoria
  - Botões/menus: data-permission em todos; ações sensíveis com <ProtectedAction mode="disable"/>
  - Abas/campos críticos: <ProtectedSection/>/<ProtectedField/>
  - Registrar AuditLog para criar/editar/excluir/exportar/importar (antes/depois quando aplicável)
- Segurança
  - Reforçar sanitizeOnWrite nas mutações de cadastros
- Manutenibilidade
  - Extrair seções de formulários extensos (Preço, Fiscal, Conversões, SEO, Estoque, …) em componentes pequenos reutilizáveis

## 6) Checklist de Conformidade (pronto para execução)
- [ ] Todas as listas → ERPDataTable + backend sort/paginação
- [ ] Todas as consultas → filterInContext/getFiltroContexto
- [ ] Todas as mutações → create/updateInContext
- [ ] Botões/ações → data-permission + ProtectedAction (disable+tooltip)
- [ ] Abas/campos críticos → ProtectedSection/Field
- [ ] Export/Import → bloqueio RBAC + AuditLog
- [ ] Sanitização → sanitizeOnWrite aplicado
- [ ] Formulários longos → refatorados em componentes menores