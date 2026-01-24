import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useUser } from "./UserContext";
import useContextoGrupoEmpresa from "./useContextoGrupoEmpresa";

export function useContextoVisual() {
  const { user, isLoading: loadingUser } = useUser();
  const [contexto, setContexto] = useState(() => {
    try {
      return localStorage.getItem('contexto_atual') || 'empresa';
    } catch {
      return 'empresa';
    }
  });

  const {
    grupoAtual,
    empresaAtual: empresaContexto,
    empresasDoGrupo: empresasDoGrupoContexto,
    estaNoGrupo: estaNoGrupoContexto,
    estaEmEmpresa
  } = useContextoGrupoEmpresa();

  // Sincroniza o contexto local com o contexto real (grupo/empresa)
  useEffect(() => {
    setContexto(estaNoGrupoContexto ? 'grupo' : 'empresa');
  }, [estaNoGrupoContexto]);

  const { data: empresas = [], isLoading: loadingEmpresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
    staleTime: 300000,
  });

  const [empresaAtualId, setEmpresaAtualId] = useState(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState('todas');

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresa_atual_id');
    if (storedEmpresaId) {
      setEmpresaAtualId(storedEmpresaId);
    } else if (empresaContexto) {
      setEmpresaAtualId(empresaContexto.id);
    }
  }, [empresaContexto]);

  const empresaAtual = (contexto === 'grupo') ? null : (empresas.find(empresa => empresa.id === empresaAtualId) || empresaContexto || null);
  const empresasDoGrupo = empresas.filter(empresa => empresa.group_id === grupoAtual?.id);
  const estaNoGrupo = contexto === 'grupo';

  useEffect(() => {
            try {
              localStorage.setItem('contexto_atual', contexto);
            } catch (e) {
              console.warn('Erro ao salvar contexto:', e);
            }
          }, [contexto]);

          // Persistir o grupo atual para headers multi-tenant
          useEffect(() => {
            try {
              if (grupoAtual?.id) {
                localStorage.setItem('group_atual_id', grupoAtual.id);
              }
            } catch (e) {
              console.warn('Erro ao salvar grupo:', e);
            }
          }, [grupoAtual?.id]);

  const adaptarMenuPorContexto = (menuItems) => {
    if (!user) return menuItems;

    if (contexto === 'grupo') {
      return menuItems.map(item => ({
        ...item,
        destacado: ['Dashboard Corporativo', 'Gestão de Empresas', 'Relatórios e Análises'].includes(item.title)
      }));
    }

    return menuItems.map(item => ({
      ...item,
      destacado: ['Comercial e Vendas', 'Produção e Manufatura', 'Expedição e Logística'].includes(item.title)
    }));
  };

  const obterSugestoesNavegacao = () => {
    return [];
  };

  const filtrarPorContexto = (dados, campo = 'empresa_id') => {
    if (!dados || dados.length === 0) return [];

    if (estaNoGrupo) {
      if (filtroEmpresa !== 'todas') {
        return dados.filter(item => item[campo] === filtroEmpresa || item.group_id === grupoAtual?.id);
      }
      return dados.filter(item => 
        item.group_id === grupoAtual?.id || 
        empresasDoGrupo.some(emp => emp.id === item[campo])
      );
    }

    if (estaEmEmpresa && empresaAtual) {
      return dados.filter(item => 
        item[campo] === empresaAtual.id || 
        (item.group_id && item.documento_grupo_id && item[campo] === empresaAtual.id)
      );
    }

    return dados;
  };

  const obterLabelOrigem = (item) => {
    if (!item) return '-';
    if (item.origem === 'grupo') return 'Grupo';
    if (item.empresa_id) {
      const empresa = empresasDoGrupo.find(e => e.id === item.empresa_id);
      return empresa?.nome_fantasia || empresa?.razao_social || item.empresa_id;
    }
    return '-';
  };

  const obterLabelEmpresa = (item) => {
    if (!item) return '-';
    if (item.origem === 'grupo' && item.rateado_para_empresas) return 'Grupo (distribuído)';
    if (item.origem === 'grupo' && !item.rateado_para_empresas) return 'Grupo (apenas grupo)';
    if (item.empresa_id) {
      const empresa = empresasDoGrupo.find(e => e.id === item.empresa_id);
      return empresa?.nome_fantasia || empresa?.razao_social || '-';
    }
    return '-';
  };

  const obterCorOrigem = (item) => {
    if (!item) return 'bg-slate-100 text-slate-700';
    if (item.origem === 'grupo') return 'bg-blue-100 text-blue-700';
    return 'bg-purple-100 text-purple-700';
  };

  const temDistribuicao = (item) => {
    return item?.rateado_para_empresas === true && 
           item?.distribuicao_realizada && 
           item.distribuicao_realizada.length > 0;
  };

  const obterStatusDistribuicao = (item) => {
    if (!temDistribuicao(item)) return null;
    const distribuicao = item.distribuicao_realizada;
    const todosPagos = distribuicao.every(d => d.status === 'Pago' || d.status === 'Recebido');
    const algunsPagos = distribuicao.some(d => d.status === 'Pago' || d.status === 'Recebido');
    if (todosPagos) return 'Total';
    if (algunsPagos) return 'Parcial';
    return 'Pendente';
  };

  const obterPercentualPago = (item) => {
    if (!temDistribuicao(item)) return 0;
    const distribuicao = item.distribuicao_realizada;
    const totalPago = distribuicao.reduce((sum, d) => {
      if (d.status === 'Pago' || d.status === 'Recebido') return sum + d.valor;
      return sum;
    }, 0);
    const total = distribuicao.reduce((sum, d) => sum + d.valor, 0);
    return total > 0 ? (totalPago / total) * 100 : 0;
  };

  const adicionarColunasContexto = (dados) => {
    if (!dados) return [];
    return dados.map(item => ({
      ...item,
      _origem_label: obterLabelOrigem(item),
      _empresa_label: obterLabelEmpresa(item),
      _origem_cor: obterCorOrigem(item),
      _tem_distribuicao: temDistribuicao(item),
      _status_distribuicao: obterStatusDistribuicao(item),
      _percentual_pago: obterPercentualPago(item)
    }));
  };

  const alternarContexto = () => {
    setContexto(prevContexto => prevContexto === 'empresa' ? 'grupo' : 'empresa');
  };

  const selecionarEmpresa = (empresaId) => {
    setEmpresaAtualId(empresaId);
    try {
      localStorage.setItem('empresa_atual_id', empresaId);
    } catch (e) {
      console.warn('Erro ao salvar empresa:', e);
    }
  };

  // Helpers: multiempresa stamping and server-side filter
  const getFiltroContexto = (campo = 'empresa_id', incluirGrupo = true) => {
    const filtro = {};
    if (incluirGrupo && grupoAtual?.id) filtro.group_id = grupoAtual.id;
    if (contexto === 'grupo') {
      if (filtroEmpresa !== 'todas') filtro[campo] = filtroEmpresa;
    } else if (empresaAtual?.id) {
      filtro[campo] = empresaAtual.id;
    }
    return filtro;
  };

  const carimbarContexto = (dados, campo = 'empresa_id') => {
    return {
      ...dados,
      ...(grupoAtual?.id && !dados?.group_id ? { group_id: grupoAtual.id } : {}),
      ...((contexto !== 'grupo') && empresaAtual?.id && !dados?.[campo] ? { [campo]: empresaAtual.id } : {}),
    };
  };

  // Create helpers that always stamp context
  const createInContext = async (entityName, dados, campo = 'empresa_id') => {
    const stamped = carimbarContexto(dados, campo);
    if (!stamped.group_id && !stamped[campo]) {
      throw new Error('Contexto multiempresa obrigatório: defina grupo ou empresa');
    }

    // ETAPA 1: Validação completa (RBAC + Multiempresa) no backend
    try {
      const validation = await base44.functions.invoke('entityOperationGuard', {
        operation: 'create',
        entityName,
        data: stamped,
        module: entityName,
        action: 'criar'
      });

      if (!validation.data?.valid) {
        throw new Error(validation.data?.reason || 'Validação falhou');
      }
    } catch (err) {
      console.error('Validação backend falhou:', err);
      throw err;
    }

    return base44.entities[entityName].create(stamped);
  };

  const bulkCreateInContext = async (entityName, lista, campo = 'empresa_id') => {
    const stampedList = lista.map(item => {
      const s = carimbarContexto(item, campo);
      if (!s.group_id && !s[campo]) {
        throw new Error('Contexto multiempresa obrigatório em item da lista');
      }
      return s;
    });

    // ETAPA 1: Validar primeiro item com guard completo
    if (stampedList.length > 0) {
      try {
        const validation = await base44.functions.invoke('entityOperationGuard', {
          operation: 'create',
          entityName,
          data: stampedList[0],
          module: entityName,
          action: 'criar'
        });

        if (!validation.data?.valid) {
          throw new Error(validation.data?.reason || 'Validação falhou');
        }
      } catch (err) {
        console.error('Validação backend falhou:', err);
        throw err;
      }
    }

    return base44.entities[entityName].bulkCreate(stampedList);
  };

  const filterInContext = (entityName, criterios = {}, order = undefined, limit = undefined, campo = 'empresa_id') => {
    const filtro = { ...criterios, ...getFiltroContexto(campo) };
    if (!filtro.group_id && !filtro[campo]) {
      throw new Error('Filtro sem contexto multiempresa');
    }
    return base44.entities[entityName].filter(filtro, order, limit);
  };

  return {
    contexto,
    empresaAtual,
    empresasDoGrupo,
    estaNoGrupo: contexto === 'grupo',
    grupoAtual,
    isLoading: loadingUser || loadingEmpresas,
    filtrarPorContexto,
    getFiltroContexto,
    carimbarContexto,
    createInContext,
    bulkCreateInContext,
    filterInContext,
    adicionarColunasContexto,
    alternarContexto,
    selecionarEmpresa,
    adaptarMenuPorContexto,
    obterSugestoesNavegacao,
    filtroEmpresa,
    setFiltroEmpresa
  };
}

export default useContextoVisual;