
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
    } else if (empresas.length > 0 && !storedEmpresaId) {
      // ✅ V20.3: AUTO-SELECIONAR primeira empresa se não houver nenhuma selecionada
      const primeiraEmpresa = empresas[0];
      console.log('🏢 Auto-selecionando primeira empresa:', primeiraEmpresa);
      setEmpresaAtualId(primeiraEmpresa.id);
      try {
        localStorage.setItem('empresa_atual_id', primeiraEmpresa.id);
      } catch (e) {
        console.warn('Erro ao salvar empresa:', e);
      }
    }
  }, [empresas]);

  // ✅ V20.3: FALLBACK GARANTIDO - sempre retorna uma empresa válida
  const empresaAtual = empresas.find(empresa => empresa.id === empresaAtualId) || 
                       empresaContexto || 
                       empresas[0] || 
                       null;
  const empresasDoGrupo = empresas.filter(empresa => empresa.group_id === grupoAtual?.id);
  const estaNoGrupo = contexto === 'grupo';

  useEffect(() => {
    try {
      localStorage.setItem('contexto_atual', contexto);
    } catch (e) {
      console.warn('Erro ao salvar contexto:', e);
    }
  }, [contexto]);

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

  // ✅ V20.3: LOG DEBUG para troubleshooting
  useEffect(() => {
    if (empresaAtual) {
      console.log('✅ useContextoVisual - empresaAtual disponível:', {
        id: empresaAtual.id,
        nome: empresaAtual.nome_fantasia || empresaAtual.razao_social
      });
    } else {
      console.warn('⚠️ useContextoVisual - empresaAtual é NULL!', {
        empresas_total: empresas.length,
        empresaAtualId,
        empresaContexto
      });
    }
  }, [empresaAtual, empresas, empresaAtualId, empresaContexto]);

  return {
    contexto,
    empresaAtual,
    empresasDoGrupo,
    estaNoGrupo: contexto === 'grupo',
    isLoading: loadingUser || loadingEmpresas,
    filtrarPorContexto,
    adicionarColunasContexto,
    alternarContexto,
    selecionarEmpresa,
    adaptarMenuPorContexto,
    obterSugestoesNavegacao
  };
}

export default useContextoVisual;
