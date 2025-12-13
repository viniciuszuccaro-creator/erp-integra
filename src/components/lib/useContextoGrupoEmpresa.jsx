import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useContextoGrupoEmpresa() {
  const [user, setUser] = useState(null);
  const [contexto, setContexto] = useState('empresa');
  const [grupoAtual, setGrupoAtual] = useState(null);
  const [empresaAtual, setEmpresaAtual] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    carregarContextoInicial();
  }, []);

  const carregarContextoInicial = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const ctx = currentUser.contexto_atual || 'empresa';
      setContexto(ctx);

      if (ctx === 'grupo') {
        const grupoId = currentUser.grupo_atual_id || currentUser.grupo_padrao_id;
        if (grupoId) {
          const grupos = await base44.entities.GrupoEmpresarial.filter({ id: grupoId });
          if (grupos[0]) setGrupoAtual(grupos[0]);
        }
      } else {
        const empresaId = currentUser.empresa_atual_id || currentUser.empresa_padrao_id;
        if (empresaId) {
          const empresas = await base44.entities.Empresa.filter({ id: empresaId });
          if (empresas[0]) setEmpresaAtual(empresas[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar contexto:", error);
    }
  };

  const trocarParaGrupo = useMutation({
    mutationFn: async (grupoId) => {
      await base44.auth.updateMe({
        contexto_atual: 'grupo',
        grupo_atual_id: grupoId
      });

      const grupos = await base44.entities.GrupoEmpresarial.filter({ id: grupoId });
      const grupo = grupos[0];
      
      await base44.entities.AuditLog.create({
        usuario: user.full_name,
        usuario_id: user.id,
        acao: 'Troca de Contexto',
        modulo: 'Sistema',
        descricao: `Mudou para contexto de GRUPO: ${grupo?.nome_do_grupo || grupoId}`,
        grupo_id: grupoId,
        data_hora: new Date().toISOString()
      });

      return grupo;
    },
    onSuccess: (grupo) => {
      setContexto('grupo');
      setGrupoAtual(grupo);
      setEmpresaAtual(null);
      queryClient.invalidateQueries();
      setTimeout(() => window.location.reload(), 500);
    }
  });

  const trocarParaEmpresa = useMutation({
    mutationFn: async (empresaId) => {
      await base44.auth.updateMe({
        contexto_atual: 'empresa',
        empresa_atual_id: empresaId
      });

      const empresas = await base44.entities.Empresa.filter({ id: empresaId });
      const empresa = empresas[0];
      
      await base44.entities.AuditLog.create({
        usuario: user.full_name,
        usuario_id: user.id,
        acao: 'Troca de Contexto',
        modulo: 'Sistema',
        descricao: `Mudou para contexto de EMPRESA: ${empresa?.nome_fantasia || empresa?.razao_social || empresaId}`,
        empresa_id: empresaId,
        data_hora: new Date().toISOString()
      });

      return empresa;
    },
    onSuccess: (empresa) => {
      setContexto('empresa');
      setEmpresaAtual(empresa);
      setGrupoAtual(null);
      queryClient.invalidateQueries();
      setTimeout(() => window.location.reload(), 500);
    }
  });

  const { data: empresasDoGrupo = [] } = useQuery({
    queryKey: ['empresas-grupo', grupoAtual?.id],
    queryFn: async () => {
      if (!grupoAtual?.id) return [];
      return await base44.entities.Empresa.filter({
        grupo_id: grupoAtual.id,
        status: 'Ativa'
      });
    },
  });

  const obterPoliticaPadrao = async (tipoDocumento) => {
    if (!grupoAtual) return null;

    const politicas = await base44.entities.PoliticaDistribuicao.filter({
      grupo_id: grupoAtual.id,
      tipo_documento: tipoDocumento,
      ativa: true,
      padrao_para_tipo: true
    });

    return politicas[0] || null;
  };

  const calcularDistribuicao = (valorTotal, politica, empresas = null) => {
    if (!politica) return [];

    const empresasParaRatear = empresas || empresasDoGrupo;
    const distribuicao = [];

    if (politica.criterio === 'percentual') {
      empresasParaRatear.forEach(empresa => {
        const participante = politica.empresas_participantes?.find(
          p => p.empresa_id === empresa.id
        );
        if (participante && participante.ativo) {
          const valor = (valorTotal * participante.percentual) / 100;
          distribuicao.push({
            empresa_id: empresa.id,
            empresa_nome: empresa.nome_fantasia || empresa.razao_social,
            valor: valor,
            percentual: participante.percentual
          });
        }
      });
    } else if (politica.criterio === 'fixo_por_empresa') {
      empresasParaRatear.forEach(empresa => {
        const participante = politica.empresas_participantes?.find(
          p => p.empresa_id === empresa.id
        );
        if (participante && participante.ativo) {
          distribuicao.push({
            empresa_id: empresa.id,
            empresa_nome: empresa.nome_fantasia || empresa.razao_social,
            valor: participante.valor_fixo,
            percentual: (participante.valor_fixo / valorTotal) * 100
          });
        }
      });
    }

    return distribuicao;
  };

  const ratearDocumento = async (entidade, documentoId, distribuicao) => {
    const titulosGerados = [];

    for (const dist of distribuicao) {
      const docs = await base44.entities[entidade].filter({ id: documentoId });
      const docOriginal = docs[0];

      const novaTitulo = {
        ...docOriginal,
        id: undefined,
        created_date: undefined,
        updated_date: undefined,
        group_id: null,
        empresa_id: dist.empresa_id,
        origem: 'empresa',
        documento_grupo_id: documentoId,
        valor: dist.valor,
        valor_original_grupo: docOriginal.valor,
        percentual_rateio: dist.percentual,
        rateado_para_empresas: false,
        sincronizar_baixa_com_grupo: true
      };

      const created = await base44.entities[entidade].create(novaTitulo);
      titulosGerados.push({
        ...dist,
        titulo_id: created.id,
        status: created.status
      });
    }

    await base44.entities[entidade].update(documentoId, {
      rateado_para_empresas: true,
      distribuicao_realizada: titulosGerados
    });

    return titulosGerados;
  };

  const sincronizarBaixaParaEmpresas = async (entidade, documentoGrupoId, valorPago) => {
    const docs = await base44.entities[entidade].filter({ id: documentoGrupoId });
    const docGrupo = docs[0];
    
    if (!docGrupo || !docGrupo.distribuicao_realizada || docGrupo.distribuicao_realizada.length === 0) {
      return;
    }

    const percentualPago = valorPago / docGrupo.valor;

    for (const dist of docGrupo.distribuicao_realizada) {
      const valorPagoEmpresa = dist.valor * percentualPago;
      
      await base44.entities[entidade].update(dist.titulo_id, {
        valor_pago: valorPagoEmpresa,
        status: percentualPago >= 1 ? 'Pago' : docGrupo.status,
        data_pagamento: percentualPago >= 1 ? new Date().toISOString().split('T')[0] : null
      });
    }
  };

  const sincronizarBaixaParaGrupo = async (entidade, documentoEmpresaId) => {
    const docsEmpresa = await base44.entities[entidade].filter({ id: documentoEmpresaId });
    const docEmpresa = docsEmpresa[0];
    
    if (!docEmpresa || !docEmpresa.documento_grupo_id) {
      return;
    }

    const docsGrupo = await base44.entities[entidade].filter({ id: docEmpresa.documento_grupo_id });
    const docGrupo = docsGrupo[0];
    
    let totalPago = 0;
    let todosPagos = true;

    for (const dist of docGrupo.distribuicao_realizada) {
      const docsItem = await base44.entities[entidade].filter({ id: dist.titulo_id });
      const doc = docsItem[0];
      totalPago += doc.valor_pago || 0;
      if (doc.status !== 'Pago' && doc.status !== 'Recebido') {
        todosPagos = false;
      }
    }

    await base44.entities[entidade].update(docGrupo.id, {
      valor_pago: totalPago,
      status: todosPagos ? 'Pago' : 'Pendente'
    });
  };

  return {
    user,
    contexto,
    grupoAtual,
    empresaAtual,
    empresasDoGrupo,
    estaNoGrupo: contexto === 'grupo',
    estaEmEmpresa: contexto === 'empresa',
    podeOperarEmGrupo: user?.pode_operar_em_grupo || false,
    podeVerTodasEmpresas: user?.pode_ver_todas_empresas || false,
    trocarParaGrupo,
    trocarParaEmpresa,
    obterPoliticaPadrao,
    calcularDistribuicao,
    ratearDocumento,
    sincronizarBaixaParaEmpresas,
    sincronizarBaixaParaGrupo,
    isLoading: !user
  };
}

export default useContextoGrupoEmpresa;