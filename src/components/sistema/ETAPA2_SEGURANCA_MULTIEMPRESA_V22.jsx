# ETAPA 2 — Segurança, Multiempresa Absoluta & RBAC
**Versão:** V22.1 | **Data:** 2026-04-08 | **Status:** ✅ 100% CONCLUÍDA

---

## 1. MULTIEMPRESA ABSOLUTA

### Propagação automática (propagateGroupConfigs)
Toda entidade de catálogo criada no **Grupo** é propagada automaticamente para todas as **Empresas** do grupo, e vice-versa.

**Entidades propagadas por padrão (ampliadas na ETAPA2):**
```
Financeiro & Fiscal:
  PlanoDeContas, CentroCusto, CentroResultado, TipoDespesa, MoedaIndice,
  FormaPagamento, CondicaoComercial, TabelaFiscal, Banco

Produtos & Serviços:
  GrupoProduto, Marca, SetorAtividade, UnidadeMedida

Logística:
  TipoFrete, LocalEstoque, RotaPadrao

Estrutura Organizacional:
  Cargo, Departamento, Turno
```

**Estratégias disponíveis:**
- `merge` (padrão): preenche apenas campos nulos nas empresas-filha
- `override`: sobrescreve todos os campos
- `skip`: ignora registros já existentes

**Direções:**
- `grupo_to_empresas`: copia do grupo para todas as empresas
- `empresa_to_grupo`: sobe dados da empresa para o grupo

### Injeção de contexto (Layout.jsx)
Toda chamada a `base44.entities.*` é interceptada e estampada automaticamente com `empresa_id` e `group_id` do contexto ativo. O filtro de lista é escopo-aware: contexto "grupo" usa `group_id`, contexto "empresa" usa `empresa_id`.

---

## 2. CONTROLE DE ACESSO (RBAC)

### Arquitetura RBAC granular
- **Entidade:** `PerfilAcesso` — define permissões por módulo → seção → ação
- **Hook:** `usePermissions` — `hasPermission(module, section, action)`
- **Componentes protegidos:** `Button[data-permission]`, `Input[data-permission]`
- **ProtectedSection:** bloqueia seções inteiras por módulo

### Ações suportadas
`visualizar | criar | editar | excluir | aprovar | cancelar | exportar`

### Verificação granular (exemplo)
```js
hasPermission('Financeiro', 'Pedido.Financeiro.margens', 'visualizar')
hasPermission('Comercial', 'Pedidos', 'aprovar')
hasPermission('Sistema', null, 'excluir')
```

### Guard backend (entityGuard)
Toda função sensível chama `entityGuard` para validar RBAC no servidor antes de executar.

---

## 3. SEGURANÇA GERAL

### Sanitização
- `sanitizeOnWrite` aplicado em todos os creates/updates antes de persistir
- Remove tags `<script>`, `javascript:` e inputs maliciosos
- Aplicado no interceptor global do Layout e no `propagateGroupConfigs`

### Auditoria obrigatória
Toda ação de criação, edição, exclusão, navegação e chamada de função sensível gera um registro em `AuditLog` com:
- `usuario`, `usuario_id`, `empresa_id`, `acao`, `modulo`, `tipo_auditoria`
- `dados_anteriores`, `dados_novos`, `ip_address`, `duracao_ms`

### Validações de segurança implementadas
- HTTPS forçado em produção (redirecionamento client-side)
- CSP meta tag injetada dinamicamente
- PWA manifest e service worker com estratégia de atualização
- TOTP/2FA disponível via `verifyTotp`
- PII encryption via `piiEncryptor` para Cliente e Colaborador
- SoD (Segregação de Funções) automático via IA no `PerfilAcessoForm`

---

## 4. DUPLICIDADES ELIMINADAS (ETAPA2)

| Funcionalidade | Antes | Depois |
|---|---|---|
| GatewayPagamento | Bloco3 (GestorGatewaysPagamento) + Bloco6 (VisualizadorUniversal) | Apenas Bloco6 (Tecnologia) |
| Configuração NF-e | AdministracaoSistema + Bloco6 | Bloco6 como fonte principal |
| APIs Externas | AdministracaoSistema.Integrações + Bloco6 | Bloco6 como fonte principal |
| WhatsApp Automações | 2 automações duplicadas por entidade (Pedido + ContaReceber) | 1 automação por entidade (arquivadas as duplicatas onEntityWhatsappNotify) |

---

## 5. PADRÃO DE CAMPOS — VISUALIZADOR UNIVERSAL

### Regra fundamental
Todo form **deve injetar o campo `nome`** no payload do submit, mapeando a partir do campo identificador real da entidade:

| Entidade | Campo real | Mapeamento |
|---|---|---|
| Banco | `nome_banco` | `nome = nome_banco` |
| CatalogoWeb | `nome_catalogo` | `nome = nome_catalogo` |
| KitProduto | `nome_kit` | `nome = nome_kit` |
| ApiExterna | `nome_integracao` | `nome = nome_integracao` |
| ChatbotCanal | `nome_canal` | `nome = nome_canal` |
| ChatbotIntent | `nome_intent` | `nome = nome_intent` |
| JobAgendado | `nome_job` | `nome = nome_job` |
| Webhook | `nome_webhook` | `nome = nome_webhook` |
| PlanoDeContas | `nome_conta` | `nome = nome_conta` |
| TabelaFiscal | `nome_regra` | `nome = nome_regra` |
| CentroCusto | `descricao` | `nome = descricao` |
| CondicaoComercial | `nome_condicao` | `nome = nome_condicao` |
| ConfiguracaoDespesaRecorrente | `descricao` | `nome = descricao` |
| Motorista | `nome_completo` | `nome = nome_completo` |

### getDisplayValue (VisualizadorUniversalEntidadeV24)
O visualizador tenta `LABEL_FALLBACKS` em ordem: `nome → nome_completo → razao_social → descricao → titulo → sigla → codigo → ...` — garantindo que qualquer registro tenha um label visível mesmo sem o campo `nome`.

---

## 6. CONTAGENS

### Arquitetura (useEntityCounts V5)
- `countEntities` function (backend) conta com filtros de escopo multiempresa
- `SIMPLE_CATALOG`: entidades globais sem filtro de empresa
- Cache 30s + invalidação via subscribe em tempo real
- Batch de contagens em janelas de 8 por vez (anti rate-limit)

### Estabilidade da lista
- `placeholderData`: lista anterior mantida durante re-fetches (nunca desaparece ao ordenar)
- `lastGoodData.current`: cache local que preserva dados durante transições
- `staleTime: 0`: novos registros aparecem imediatamente após salvar
- Exclusão em massa com deselect cross-page

---

## 7. BUGS CRÍTICOS CORRIGIDOS (V22.1)

| Bug | Causa Raiz | Correção |
|---|---|---|
| auditEntityEvents — 308 falhas consecutivas | SDK desatualizado (0.8.20) | Atualizado para 0.8.23 |
| sanitizeOnWrite — bloqueava catálogos | Verificação multiempresa sem distinção de catálogos globais | Adicionado `SIMPLE_CATALOG` check antes do enforce |
| sanitizeOnWrite — SDK 0.8.6 | Versão muito antiga | Atualizado para 0.8.23 |
| propagateGroupConfigs — 3 falhas | SDK desatualizado (0.8.20) | Atualizado para 0.8.23 |
| contagem Bloco3 incluía GatewayPagamento | BLOCOS_ENTITIES.bloco3 tinha entidade do Bloco6 | Movido GatewayPagamento para bloco6 |
| Automações WhatsApp duplicadas | 2 automações por entidade faziam disparo duplicado | Arquivadas onEntityWhatsappNotify (Pedido + ContaReceber) |

---

## 8. STATUS FINAL

| Item | Status |
|---|---|
| Campo `nome` em todos os forms | ✅ 100% |
| Propagação multiempresa (18+ entidades) | ✅ 100% |
| RBAC em telas, botões, campos | ✅ 100% |
| Auditoria em todas as ações | ✅ 100% |
| Sanitização universal (catálogos liberados) | ✅ 100% |
| Estabilidade da lista (sort/delete) | ✅ 100% |
| Contagens corretas por bloco | ✅ 100% |
| Duplicidades eliminadas (UI + automações) | ✅ 100% |
| SDK unificado em 0.8.23 | ✅ 100% |
| Documentação atualizada | ✅ 100% |