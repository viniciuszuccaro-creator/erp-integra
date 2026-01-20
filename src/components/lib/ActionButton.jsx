import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useActionState } from './useActionState';

/**
 * V22.0 ETAPA 1 - Botão com Estados Padronizados
 * 
 * GARANTE 3 ESTADOS OBRIGATÓRIOS:
 * 1. Iniciada (isLoading) - Spinner + texto loading
 * 2. Sucesso - Ícone de sucesso + feedback visual
 * 3. Erro - Ícone de erro + mensagem
 * 
 * Uso:
 * <ActionButton
 *   onAction={async () => { await api.save(data); }}
 *   successMessage="Salvo!"
 *   errorMessage="Erro ao salvar"
 *   actionName="Salvar Produto"
 * >
 *   Salvar
 * </ActionButton>
 */
export default function ActionButton({
  children,
  onAction,
  successMessage = 'Ação concluída',
  errorMessage = 'Erro na ação',
  actionName = 'Ação',
  loadingText,
  showSuccessIcon = false,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  ...props
}) {
  const { execute, isLoading, error, lastResult } = useActionState({
    successMessage,
    errorMessage,
    actionName
  });

  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleClick = async (e) => {
    if (!onAction || isLoading) return;

    try {
      await execute(onAction);
      
      if (showSuccessIcon) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (err) {
      // Erro já tratado pelo useActionState
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      variant={error ? 'destructive' : variant}
      size={size}
      className={className}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || 'Processando...'}
        </>
      ) : showSuccess ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
          Concluído!
        </>
      ) : error ? (
        <>
          <XCircle className="w-4 h-4 mr-2" />
          Erro
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/**
 * Botão de Ação com Confirmação
 */
export function ActionButtonWithConfirm({
  children,
  onAction,
  confirmMessage = 'Tem certeza?',
  confirmTitle = 'Confirmar ação',
  ...props
}) {
  const [confirming, setConfirming] = React.useState(false);

  const handleConfirmedAction = async () => {
    if (!window.confirm(`${confirmTitle}\n\n${confirmMessage}`)) {
      return;
    }
    await onAction();
  };

  return (
    <ActionButton
      {...props}
      onAction={handleConfirmedAction}
    >
      {children}
    </ActionButton>
  );
}