# ✅ FASE 3 CONCLUÍDA — Compressão + IndexedDB + Prefetch Preditivo
**Data:** 2026-03-17 | **Versão:** V22.3

---

## O que foi feito

### 1. `useIndexedDBCache` (novo — `components/lib/useIndexedDBCache.js`)
- Cache de segundo nível com IndexedDB (além do localStorage ~5MB limitado)
- API: `idbGet(key)`, `idbSet(key, value, ttlMs)`, `idbDelete(key)`, `idbClearExpired()`
- TTL por registro (default 10 min), com índice em `expires_at` para limpeza eficiente
- `idbClearExpired()` chamado no idle via `requestIdleCallback` no Layout

### 2. `useQueryWithIDB` (novo — `components/lib/useQueryWithIDB.js`)
- Wrapper sobre `useQuery` com persistência automática no IDB
- Bridge via localStorage para instant first paint (IDB é async)
- Persiste resultados frescos com TTL configurável
- gcTime estendido para 10 min (IDB cobre sessões longas)

### 3. `useNavHistory` (novo — `components/lib/useNavHistory.js`)
- Rastreia histórico de navegação por rota (apenas rotas de módulos)
- Persiste até 50 entradas no localStorage com timestamp
- `getPredictedModules(currentPath, topN)`: calcula módulos mais prováveis
  - Peso decrescente por idade: entradas < 24h têm peso 1.5–2x maior
  - Exclui rota atual para não prefetchar o que já está carregado
- Integrado no Layout via `useNavHistory()` hook

### 4. `usePredictivePrefetch` (novo — `components/lib/usePredictivePrefetch.js`)
- Usa `getPredictedModules` para identificar top-3 módulos mais visitados
- Executa prefetch via `usePrefetchModuleData` durante inatividade
- Throttle de 5 min entre execuções (evita loops)
- Delay de 3s após mudança de rota + `requestIdleCallback`
- 800ms entre cada módulo para não sobrecarregar o backend

### 5. `entityListSorted` — Compressão gzip de payload (Fase 3)
- `compressedJson(data, req)`: comprime resposta com gzip quando `Accept-Encoding: gzip`
- Usa `CompressionStream('gzip')` nativo do Deno (zero dependências extras)
- Fallback sem compressão se cliente não suporta ou erro interno
- Header `Vary: Accept-Encoding` para cache correto em proxies
- Aplicado em modo batch E modo single — ~60-80% de redução de payload

### 6. Layout — Integração Fase 3
- `useNavHistory()` — registra cada navegação automaticamente
- `usePredictivePrefetch()` — prefetch preditivo sem intervenção do usuário
- `idbClearExpired()` — limpeza de cache IDB expirado no idle (1x por sessão)

---

## Fluxo completo Fase 3

```
Usuário navega entre módulos:
        ↓
useNavHistory() registra { path, ts } no localStorage
        ↓
usePredictivePrefetch() aguarda 3s de inatividade
        ↓
requestIdleCallback → getPredictedModules() → top-3 módulos
        ↓
prefetch(module1) → 800ms → prefetch(module2) → 800ms → prefetch(module3)
        ↓
Dados salvos no React Query cache + IDB (TTL 10min)

Recarregamento de página (F5):
        ↓
useQueryWithIDB → localStorage bridge (sync) → placeholder imediato
        ↓ async
idbGet() → restaura dados completos do IDB
        ↓
UI mostra dados enquanto faz refetch em background
```

---

## KPIs esperados
| Métrica | Antes Fase 3 | Depois Fase 3 |
|---------|--------------|---------------|
| Payload batch (gzip) | ~200KB | ~40-60KB (-70%) |
| Cache após F5 | localStorage ~5MB max | IDB sem limite prático |
| Prefetch por ação | Só no hover | Hover + Preditivo (idle) |
| Módulos pré-carregados | 1 (hover atual) | 1+3 (hover + top-3 histórico) |
| Limpeza de cache | Manual | Auto no idle 1x/sessão |

---

## Fase 4 (futura)
- Service Worker com estratégia Stale-While-Revalidate para assets estáticos
- Métricas de prefetch hit-rate (quantos prefetches foram usados)
- Warm-up preditivo baseado em horário (ex: Financeiro às 9h, Comercial às 14h)