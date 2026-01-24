import React from 'react';
import { Button } from '@/components/ui/button';
import usePermissions from '@/components/lib/usePermissions';
import { Lock } from 'lucide-react';

/**
 * SECURE ACTION BUTTON - Botão que valida permissão antes de executar
 * ETAPA 1: Proteção contra ações não autorizadas
 */

export default function SecureActionButton({
  module,
  section = null,
  action = 'editar',
  entity = null,
  onClick,
  children,
  variant = 'default',
  size = 'default',
  className = '',
  title = null,
  ...props
}) {
  const { hasPermission, isLoading } = usePermissions();

  const allowed = hasPermission(module, section, action);
  const displayTitle = title || `Sem permissão para ${action} em ${module}${section ? `.${section}` : ''}`;

  const handleClick = async (e) => {
    if (!allowed) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      try {
        await onClick(e);
      } catch (err) {
        console.error('Erro ao executar ação:', err);
      }
    }
  };

  return (
    <Button
      disabled={isLoading || !allowed}
      onClick={handleClick}
      variant={!allowed ? 'outline' : variant}
      size={size}
      className={`${className} ${!allowed ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={displayTitle}
      {...props}
    >
      {!allowed && <Lock className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
}