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

  // Verificação de permissão com suporte a múltiplos níveis: módulo.submódulo.aba.campo
  const hasPermission = (module, section, action = "visualizar") => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const perms = perfilAcesso?.permissoes;
    if (!perms) return false;

    // normaliza alias (sinônimos → ação canônica)
    const normalize = (a) => {
      const map = {
        ver: 'visualizar', view: 'visualizar', read: 'visualizar',
        delete: 'excluir', remove: 'excluir', destroy: 'excluir',
        cancel: 'cancelar', cancelar: 'cancelar',
        create: 'criar', add: 'criar',
        update: 'editar', edit: 'editar',
        approve: 'aprovar', approvar: 'aprovar',
        export: 'exportar', exportar: 'exportar'
      };
      return map[a] || a;
    };
    const desired = normalize(action);

    const modNode = perms[module];
    if (!modNode) return false;

    // Se não houver seção especificada, verifica ação em qualquer subnível direto
    if (!section) {
      return Object.values(modNode).some((node) => {
        if (Array.isArray(node)) return node.includes(desired) || (desired === 'visualizar' && node.includes('ver'));
        // Caso node seja objeto, verifica se algum filho é array com a ação
        if (node && typeof node === 'object') {
          return Object.values(node).some((v) => Array.isArray(v) && (v.includes(desired) || (desired === 'visualizar' && v.includes('ver'))));
        }
        return false;
      });
    }

    // Suporta paths hierárquicos: "Pedidos.Financeiro.margens" ou ["Pedidos","Financeiro","margens"]
    const path = Array.isArray(section) ? section : String(section).split('.').filter(Boolean);
    let cursor = modNode;
    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (cursor == null) return false;
      cursor = cursor[key];
    }

    if (!cursor) return false;

    if (Array.isArray(cursor)) {
      return cursor.includes(desired) || (desired === 'visualizar' && cursor.includes('ver'));
    }

    // Se o nó final ainda for um objeto, aceite se QUALQUER folha trouxer a ação
    if (typeof cursor === 'object') {
      const stack = [cursor];
      while (stack.length) {
        const node = stack.pop();
        if (Array.isArray(node)) {
          if (node.includes(desired) || (desired === 'visualizar' && node.includes('ver'))) return true;
        } else if (node && typeof node === 'object') {
          Object.values(node).forEach((v) => stack.push(v));
        }
      }
      return false;
    }

    return false;
  };

  // Helpers específicos para granularidade
  const hasTabPermission = (module, submodule, tab, action = 'visualizar') => {
    const section = [submodule, tab].filter(Boolean);
    return hasPermission(module, section, action);
  };

  const hasFieldPermission = (module, submodule, tab, field, action = 'visualizar') => {
    const section = [submodule, tab, field].filter(Boolean);
    return hasPermission(module, section, action);
  };

  // Convenções sugeridas de chaves para Produtos/Precificação
  // Estoque -> Produto -> Precificacao -> (custo_aquisicao, margem_percentual)
  // Comercial -> Pedido -> Financeiro -> (emitir_nfe, aprovar_desconto)

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

  const canCancel = (module, section = null) => {
    return hasPermission(module, section, 'cancelar');
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
    hasTabPermission,
    hasFieldPermission,
    isAdmin,
    canApprove,
    canDelete,
    canCreate,
    canEdit,
    canExport,
    canCancel,
    isLoading: loadingUser || loadingPerfil,
    user,
    perfilAcesso
  };
}