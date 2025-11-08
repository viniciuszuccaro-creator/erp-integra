import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook de Atalhos de Teclado Globais
 * V12.0 - Produtividade Aumentada
 */
export function useKeyboardShortcuts(shortcuts = {}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Prevenir ação padrão do navegador em alguns atalhos
      const shouldPrevent = [
        ctrl && key === 'n',
        ctrl && key === 's',
        ctrl && key === 'p',
        ctrl && key === 'f',
        ctrl && key === 'k',
      ].some(Boolean);

      if (shouldPrevent) {
        e.preventDefault();
      }

      // Executar atalho correspondente
      Object.entries(shortcuts).forEach(([shortcut, callback]) => {
        const [modifiers, triggerKey] = shortcut.split('+').map(s => s.trim().toLowerCase());
        const parts = modifiers.split(' ');
        
        const hasCtrl = parts.includes('ctrl');
        const hasShift = parts.includes('shift');
        const hasAlt = parts.includes('alt');

        if (
          key === triggerKey.toLowerCase() &&
          (!hasCtrl || ctrl) &&
          (!hasShift || shift) &&
          (!hasAlt || alt)
        ) {
          callback(e);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Atalhos Globais do Sistema
 */
export const ATALHOS_GLOBAIS = {
  'ctrl+n': { descricao: 'Novo Pedido', acao: 'novo_pedido' },
  'ctrl+s': { descricao: 'Salvar', acao: 'salvar' },
  'ctrl+k': { descricao: 'Pesquisa Universal', acao: 'pesquisa' },
  'ctrl+p': { descricao: 'Imprimir', acao: 'imprimir' },
  'ctrl+f': { descricao: 'Buscar na Página', acao: 'buscar' },
  'ctrl+shift+d': { descricao: 'Dashboard', acao: 'ir_dashboard' },
  'ctrl+shift+c': { descricao: 'Comercial', acao: 'ir_comercial' },
  'esc': { descricao: 'Fechar Modal/Cancelar', acao: 'cancelar' },
};

export function MostrarAtalhos() {
  return (
    <div className="p-4 space-y-2">
      <h3 className="font-bold text-lg mb-3">⌨️ Atalhos de Teclado</h3>
      {Object.entries(ATALHOS_GLOBAIS).map(([key, info]) => (
        <div key={key} className="flex justify-between items-center text-sm">
          <span className="text-slate-600">{info.descricao}</span>
          <kbd className="px-2 py-1 bg-slate-100 border rounded font-mono text-xs">
            {key.replace('ctrl', '⌘').replace('shift', '⇧').toUpperCase()}
          </kbd>
        </div>
      ))}
    </div>
  );
}