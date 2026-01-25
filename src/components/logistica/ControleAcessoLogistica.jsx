import React from 'react';
import { useUser } from '@/components/lib/UserContext';
import usePermissions from '@/components/lib/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

/**
 * ETAPA 3: Controle de Acesso Logística
 * Wrapper de segurança para componentes logísticos
 */

export default function ControleAcessoLogistica({ 
  children, 
  requiredModule = 'Expedição',
  requiredAction = 'ver',
  motoristasOnly = false,
  fallback = null
}) {
  const { user } = useUser();
  const { hasPermission, isAdmin } = usePermissions();

  // Verificar se é motorista (via colaborador)
  const [isMotorista, setIsMotorista] = React.useState(false);

  React.useEffect(() => {
    if (!user?.id || !motoristasOnly) return;

    base44.entities.Colaborador.filter({
      vincular_a_usuario_id: user.id,
      pode_dirigir: true,
      status: 'Ativo'
    }).then(result => {
      setIsMotorista(result?.length > 0);
    }).catch(() => setIsMotorista(false));
  }, [user?.id, motoristasOnly]);

  // Admin sempre passa
  if (isAdmin()) return <>{children}</>;

  // Verificar permissão do módulo
  if (!hasPermission(requiredModule, null, requiredAction)) {
    return fallback || (
      <Alert className="border-red-300 bg-red-50">
        <Shield className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Você não tem permissão para acessar esta funcionalidade.
        </AlertDescription>
      </Alert>
    );
  }

  // Verificar se é motorista (quando necessário)
  if (motoristasOnly && !isMotorista) {
    return fallback || (
      <Alert className="border-yellow-300 bg-yellow-50">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Esta funcionalidade é exclusiva para motoristas cadastrados.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}