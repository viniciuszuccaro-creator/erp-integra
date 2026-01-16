import { useUser } from "./UserContext";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function usePermissions() {
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

  const hasPermission = (module, section, action = "visualizar") => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (!module) return false;

    if (!perfilAcesso?.permissoes || typeof perfilAcesso.permissoes !== 'object') return false;

    // ESTRUTURA GRANULAR: módulo → seção → [ações]
    const moduloPermissoes = perfilAcesso.permissoes?.[module];
    if (!moduloPermissoes || typeof moduloPermissoes !== 'object') return false;

    // Se não especificar seção, verifica se tem a ação em QUALQUER seção
    if (!section) {
      return Object.values(moduloPermissoes || {}).some((secao) =>
        Array.isArray(secao) && secao.includes(action)
      );
    }

    // Verifica permissão na seção específica
    const secaoPermissoes = moduloPermissoes?.[section];
    if (!Array.isArray(secaoPermissoes)) return false;

    return secaoPermissoes.includes(action);
  };

  const hasGranularPermission = (module, section, action) => {
    return hasPermission(module, section, action);
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const canApprove = (module, section = null) => {
    return hasPermission(module, section, 'aprovar');
  };

  const canDelete = (module, section = null) => {
    return hasPermission(module, section, 'excluir');
  };

  const canCreate = (module, section = null) => {
    return hasPermission(module, section, 'criar');
  };

  const canEdit = (module, section = null) => {
    return hasPermission(module, section, 'editar');
  };

  const canExport = (module, section = null) => {
    return hasPermission(module, section, 'exportar');
  };

  return {
    hasPermission,
    hasGranularPermission,
    isAdmin,
    canApprove,
    canDelete,
    canCreate,
    canEdit,
    canExport,
    isLoading: loadingUser || loadingPerfil,
    user,
    perfilAcesso
  };
}