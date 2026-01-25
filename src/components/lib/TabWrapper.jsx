import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useContextoVisual } from './useContextoVisual';
import { Button } from '@/components/ui/button';

/**
 * Wrapper que garante que as abas sempre renderizem corretamente
 * Previne tela branca quando contexto está carregando
 */
export default function TabWrapper({ children, requireEmpresa = true }) {
  const { empresaAtual, contextoReady, grupoAtual } = useContextoVisual();

  // Enquanto carrega contexto
  if (!contextoReady) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-3" />
        <p className="text-slate-600 font-medium">Carregando...</p>
      </div>
    );
  }

  // Se requer empresa mas não tem (mesmo após carregar)
  if (requireEmpresa && !empresaAtual && !grupoAtual) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-orange-500 mb-3" />
        <p className="text-slate-900 font-semibold mb-2">Sem empresa selecionada</p>
        <p className="text-slate-600 text-sm">Retorne ao menu e selecione uma empresa</p>
      </div>
    );
  }

  // Renderiza children normalmente
  return <>{children}</>;
}