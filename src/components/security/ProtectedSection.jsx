import React from 'react';
import usePermissions from '@/components/lib/usePermissions';
import { AlertCircle } from 'lucide-react';

/**
 * PROTECTED SECTION - Oculta seções inteiras baseado em permissões
 * ETAPA 1: Granularidade por módulo/seção/aba
 */

export default function ProtectedSection({
  module,
  section = null,
  action = 'visualizar',
  children,
  fallback = null,
  show = true
}) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return <div className="p-4 text-slate-500">Carregando permissões...</div>;
  }

  const allowed = show && hasPermission(module, section, action);

  if (!allowed) {
    return fallback || (
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <span className="text-sm text-yellow-700">
          Você não tem permissão para acessar esta seção.
        </span>
      </div>
    );
  }

  return children;
}