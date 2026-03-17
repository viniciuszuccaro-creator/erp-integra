# ✅ FASE 1 CONCLUÍDA — Performance & Rate-Limit Resilience
**Data:** 2026-03-17 | **Versão:** V22.1

---

## O que foi feito

### Backend — `functions/countEntities`
- **Modo lote** (`{ entities: [...] }`): agrupa até N entidades em 1 request com concorrência máxima 4
- **Modo single** (retrocompatível): mantém resposta `{ count, isEstimate, entityName, filter }`
- `expandByGroupIfNeeded` extraído como função reutilizável interna
- `normalizeSharedFilter` trata `empresas_compartilhadas_ids` em top-level e em `$or`

### Backend — `functions/entityListSorted`
- **Modo queries batelado** (`{ queries: [...] }`): processa múltiplas entidades ordenadas em 1 request (concorrência 4)
- **Modo single** (retrocompatível): retorna array de items igual ao anterior
- `listOne()` extraído como função interna reutilizável
- Sanitização, normalização de filtros e expansão de grupo compartilhados entre modos

### Hook — `components/lib/useCountEntities`
- **Micro-batching de 12ms**: múltiplos `useCountEntities` no mesmo render agrupam em 1 único request ao backend
- Singleton `window.__countBatch*` para coordenação entre instâncias
- Cache em memória + `localStorage` para SWR instantâneo
- Cooldown anti-429 por entidade (3s)
- `placeholderData` serve cache imediato enquanto revalida

### Hook — `components/lib/useEntityListSorted`
- `placeholderData` com SWR — nunca deixa UI vazia durante revalidação
- `gcTime: 300_000` — mantém cache 5min após desmonte
- Backoff exponencial em 429: `800ms * 2^attempt + jitter` (máx 6s)
- Circuit breaker após 5 tentativas: serve cache + cooldown 5s
- Strike counter resetado após sucesso
- `throttle minGap: 600ms` (era 700ms)
- `staleTime: 90_000` (era 60s)

---

## Resultados dos testes

| Teste | Status | Resultado |
|-------|--------|-----------|
| countEntities modo single | ✅ | 1.176 clientes, 200ms |
| countEntities modo lote (3 entidades) | ✅ | Cliente+Fornecedor+Produto em ~2,2s |
| entityListSorted modo single | ✅ | 10 clientes ordenados, 1,2s |
| entityListSorted modo lote (2 entidades) | ✅ | Cliente+Fornecedor em 1,06s |

---

## KPIs esperados (produção)
- Queda ≥ 90% dos erros 429 no módulo Cadastros
- Primeiro paint de listas ≤ 1,2s (com SWR)
- Contagens carregam ≤ 500ms (micro-batch)
- UI nunca fica em branco sob rate-limit (sempre serve cache)

---

## Fase 2 (próxima)
- Prefetch inteligente por módulo (hover na sidebar)
- Invalidação seletiva por subscription (já parcialmente implementado em Layout)
- Compressão de payload nas respostas das funções bateladas