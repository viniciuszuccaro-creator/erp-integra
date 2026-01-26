import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * 🔒 CONTROLE DE ACESSO LOGÍSTICA V21.5
 * Hook para verificar permissões de logística
 */
export function usePermissoesLogistica() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: perfil } = useQuery({
    queryKey: ['perfilAcesso', user?.perfil_acesso_id],
    queryFn: async () => {
      if (!user?.perfil_acesso_id) return null;
      const perfis = await base44.entities.PerfilAcesso.filter({ id: user.perfil_acesso_id });
      return perfis[0] || null;
    },
    enabled: !!user?.perfil_acesso_id,
  });

  const permissoes = perfil?.permissoes?.logistica || {};

  return {
    podeCriarRomaneio: permissoes.criarRomaneio || user?.role === 'admin',
    podeConfirmarEntrega: permissoes.confirmarEntrega || user?.role === 'admin',
    podeRegistrarOcorrencia: permissoes.registrarOcorrencia || user?.role === 'admin',
    podeRoteirizar: permissoes.roteirizar?.includes('editar') || user?.role === 'admin',
    podeVisualizarRotas: permissoes.roteirizar?.includes('visualizar') || true,
    isAdmin: user?.role === 'admin',
    user,
    perfil
  };
}

/**
 * Componente para proteger ações de logística
 */
export function ProtegerAcaoLogistica({ acao, children, fallback = null }) {
  const permissoes = usePermissoesLogistica();

  const mapeamentoAcoes = {
    'criarRomaneio': permissoes.podeCriarRomaneio,
    'confirmarEntrega': permissoes.podeConfirmarEntrega,
    'registrarOcorrencia': permissoes.podeRegistrarOcorrencia,
    'roteirizar': permissoes.podeRoteirizar,
    'visualizarRotas': permissoes.podeVisualizarRotas
  };

  const temPermissao = mapeamentoAcoes[acao] !== false;

  if (!temPermissao) {
    return fallback;
  }

  return <>{children}</>;
}

export default usePermissoesLogistica;