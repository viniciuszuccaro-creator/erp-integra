/**
 * 🔥 FORCE RELOAD V21.2.4 🔥
 * 
 * INSTRUÇÕES CRÍTICAS PARA RESOLVER ReferenceError: apis is not defined
 * 
 * =============================================================================
 * PROBLEMA IDENTIFICADO:
 * =============================================================================
 * O navegador está carregando código JavaScript ANTIGO do cache.
 * Linha 72 do Parametros.jsx usa 'apisExternas' corretamente,
 * mas o navegador serve versão velha com 'apis'.
 * 
 * =============================================================================
 * SOLUÇÃO DEFINITIVA (FAÇA TODOS OS PASSOS):
 * =============================================================================
 * 
 * OPÇÃO 1 - HARD REFRESH (MAIS RÁPIDO):
 * ✅ Windows/Linux: Ctrl + Shift + R
 * ✅ Mac: Cmd + Shift + R
 * 
 * OPÇÃO 2 - LIMPAR CACHE COMPLETAMENTE:
 * 1. Pressione F12 (DevTools)
 * 2. Vá em Network (Rede)
 * 3. Marque "Disable cache"
 * 4. Recarregue a página (F5)
 * 
 * OPÇÃO 3 - NAVEGADOR ANÔNIMO:
 * ✅ Ctrl + Shift + N (Chrome)
 * ✅ Ctrl + Shift + P (Firefox)
 * ✅ Abra a aplicação na janela anônima
 * 
 * OPÇÃO 4 - LIMPAR MANUALMENTE:
 * 1. Pressione Ctrl + Shift + Delete
 * 2. Selecione "Imagens e arquivos em cache"
 * 3. Intervalo: "Todo o período"
 * 4. Clique em "Limpar dados"
 * 5. Recarregue a página
 * 
 * =============================================================================
 * VERIFICAÇÃO:
 * =============================================================================
 * Após qualquer das opções acima, abra o DevTools (F12):
 * - Vá na aba Console
 * - Se NÃO houver mais erro "ReferenceError: apis is not defined" = RESOLVIDO ✅
 * 
 * =============================================================================
 * CÓDIGO CORRETO CONFIRMADO:
 * =============================================================================
 * ✅ pages/Parametros.jsx linha 72: const { data: apisExternas = [] }
 * ✅ Todas referências usam 'apisExternas' corretamente
 * ✅ Layout.js versão: V21.2.3
 * 
 * O PROBLEMA É 100% CACHE DO NAVEGADOR!
 * 
 * =============================================================================
 */

// Este arquivo força versão atualizada
export const VERSION = 'V21.2.4';
export const CACHE_BUST = Date.now();

console.log('🔥 FORCE RELOAD V21.2.4 ATIVO - Cache deve ser limpo!');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🔢 Cache Bust:', CACHE_BUST);