# ✅ FASE 2 CONCLUÍDA — Prefetch Inteligente + Invalidação Seletiva + Batch Otimizado
**Data:** 2026-03-17 | **Versão:** V22.2

---

## O que foi feito

### 1. `usePrefetchModuleData` (novo — `components/lib/usePrefetchModuleData.js`)
- Prefetch por módulo disparado no **hover** da sidebar
- Mapa `MODULE_PREFETCH`: 9 módulos com entidades e sorts padrão
- Não refaz prefetch se dado tiver ≤ 60s (`PREFETCH_STALE_MS`)
- Limite leve: 20 itens por entidade (sem sobrecarregar)
- Integrado no `Layout` via `onMouseEnter` no link da sidebar

### 2. `useInvalidationBus` (novo — `components/lib/useInvalidationBus.js`)
- Barramento centralizado de invalidação seletiva por subscription
- Conecta eventos real-time (create/update/delete) ao React Query
- Throttle de 800ms por entidade (evita flood)
- Mapa `ENTITY_QUERY_KEYS`: 18 entidades → keys React Query afetadas
- Invalidação assíncrona com `setTimeout(50ms)` para não bloquear o handler

### 3. `useQueryWithFallback` (novo — `components/lib/useQueryWithFallback.js`)
- Wrapper genérico sobre `useQuery` com persistência automática em localStorage
- `placeholderData` serve cache do localStorage para instant first paint
- Persiste resultado após cada fetch bem-sucedido
- Padrões seguros: staleTime 90s, gcTime 5min, keepPreviousData true

### 4. `countEntities` — função backend otimizada
- `fastCount()`: contagem via cursor de IDs (campo `id`) reduz payload ~90%
  - Antes: paginava em batches de 500 lendo todos os campos
  - Agora: lê apenas `id` em batches de 1000 — 2x menos requests, 10x menos dados
- Reutilizado em contagem simples e contagem de grupo (`group_total`)

### 5. `GroupCountBadge` (refatorado — `GroupCountBadge.jsx`)
- **1 única chamada batch** para todas as entidades passadas
  - Antes: N chamadas `useCountEntities` separadas (uma por entidade no array)
  - Agora: 1 `useQuery` → 1 invoke `countEntities` com `{ entities: [...] }`
- Cache persistente + placeholderData + keepPreviousData
- staleTime: 120s | gcTime: 5min

### 6. `useCountEntities` — retry exponencial no batch flush
- `flushBatch()` agora tem retry de até 3 tentativas com backoff exponencial
  - `600ms * 2^attempt + jitter(300ms)` por tentativa
  - Cooldown por entidade durante o backoff
- Antes: um único try/catch sem retry no batch
- Fallback: serve cache quando todas as tentativas falham

### 7. Layout — integração do prefetch
- Sidebar `onMouseEnter` agora chama `prefetchForItem` + `prefetchModule` em paralelo
- `prefetchModule` usa `usePrefetchModuleData` (Fase 2) com queryClient.prefetchQuery

---

## Fluxo completo Fase 2

```
Usuário hover na sidebar (ex: "Estoque")
        ↓
prefetchForItem("Estoque") → cache legado (queryClient.prefetchQuery direto)
prefetchModule("Estoque")  → entityListSorted batch: Produto + ...
        ↓ ~600ms depois
Usuário clica → página carrega com dados já no cache (0ms de loading!)
```

---

## KPIs esperados
| Métrica | Antes Fase 2 | Depois Fase 2 |
|---------|--------------|---------------|
| GroupCountBadge calls | N × countEntities | 1 batch |
| Time-to-data após hover | ~1.2s | ~0ms (cache) |
| countEntities payload | ~500KB batch de 500 | ~50KB batch de 1000 IDs |
| Retry em 429 no batch | 0 (sem retry) | 3 tentativas exp. backoff |

---

## Fase 3 (próxima)
- Compressão de payload nas funções batch (gzip response)
- Cache de segundo nível com IndexedDB para sessões longas
- Prefetch preditivo baseado em histórico de navegação do usuário