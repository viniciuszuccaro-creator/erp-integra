import { useUser } from "./UserContext";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function usePermissions() {
  const { user, isLoading: loadingUser } = useUser();

  // Buscar perfil de acesso completo
  const { data: perfilAcesso, isLoading: loadingPerfil } = useQuery({
    queryKey: ['perfil-acesso', user?.perfil_acesso_id],
    queryFn: async () => {
      if (!user?.perfil_acesso_id) return null;
      return await base44.entities.PerfilAcesso.get(user.perfil_acesso_id);
    },
    enabled: !!user?.perfil_acesso_id
  });

  const hasPermission = (module, action = "visualizar") => {
    if (!user) return false;
    if (user.role === "admin") return true;

    if (!perfilAcesso?.permissoes) return false;

    const moduloPermissoes = perfilAcesso.permissoes[module];
    if (!moduloPermissoes) return false;

    // Verifica permissão específica
    if (action in moduloPermissoes) {
      return moduloPermissoes[action] === true;
    }

    // Fallback para permissão genérica
    return moduloPermissoes.visualizar === true;
  };

  const hasGranularPermission = (module, granularAction) => {
    if (!user) return false;
    if (user.role === "admin") return true;

    if (!perfilAcesso?.permissoes) return false;

    const moduloPermissoes = perfilAcesso.permissoes[module];
    if (!moduloPermissoes) return false;

    // Verifica permissão granular específica
    return moduloPermissoes[granularAction] === true;
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const canApprove = (module) => {
    return hasPermission(module, 'aprovar');
  };

  const canDelete = (module) => {
    return hasPermission(module, 'excluir');
  };

  return {
    hasPermission,
    hasGranularPermission,
    isAdmin,
    canApprove,
    canDelete,
    isLoading: loadingUser || loadingPerfil,
    user,
    perfilAcesso
  };
}

export default usePermissions;