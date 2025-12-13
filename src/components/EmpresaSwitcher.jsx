import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Users, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useContextoGrupoEmpresa from "@/components/lib/useContextoGrupoEmpresa";

/**
 * Componente seletor de contexto: GRUPO ou EMPRESA
 * Aparece no header/topo do sistema
 * Permite trocar entre visão consolidada (grupo) e visão individual (empresa)
 */
export default function EmpresaSwitcher() {
  const {
    user,
    contexto,
    grupoAtual,
    empresaAtual,
    empresasDoGrupo,
    podeOperarEmGrupo,
    trocarParaGrupo,
    trocarParaEmpresa,
    isLoading
  } = useContextoGrupoEmpresa();

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(true);

  // Buscar grupos disponíveis para o usuário
  const { data: gruposDisponiveis = [] } = useQuery({
    queryKey: ['grupos-usuario', user?.id],
    queryFn: async () => {
      if (!user?.grupos_vinculados || user.grupos_vinculados.length === 0) {
        return [];
      }
      
      const grupos = [];
      for (const vinculo of user.grupos_vinculados) {
        if (vinculo.ativo) {
          const grupo = await base44.entities.GrupoEmpresarial.get(vinculo.grupo_id);
          if (grupo && grupo.status === 'Ativo') {
            grupos.push(grupo);
          }
        }
      }
      return grupos;
    },
    enabled: !!user,
  });

  // Buscar empresas disponíveis para o usuário
  const { data: empresasDisponiveis = [] } = useQuery({
    queryKey: ['empresas-usuario', user?.id],
    queryFn: async () => {
      if (!user?.empresas_vinculadas || user.empresas_vinculadas.length === 0) {
        return [];
      }
      
      const empresas = [];
      for (const vinculo of user.empresas_vinculadas) {
        if (vinculo.ativo) {
          const empresa = await base44.entities.Empresa.get(vinculo.empresa_id);
          if (empresa && empresa.status === 'Ativa') {
            empresas.push({
              ...empresa,
              nivel_acesso: vinculo.nivel_acesso
            });
          }
        }
      }
      return empresas;
    },
    enabled: !!user,
  });

  // 🔥 ANALYTICS: Histórico de trocas de contexto
  const { data: historicoTrocas = [] } = useQuery({
    queryKey: ['historico-trocas-contexto', user?.id],
    queryFn: async () => {
      try {
        const logs = await base44.entities.AuditLog.filter({
          usuario_id: user?.id,
          acao: 'Troca de Empresa',
          modulo: 'Sistema'
        }, '-created_date', 10);
        return logs || [];
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });

  // 🤖 IA: Sugestões inteligentes baseadas em padrões de uso
  const { data: sugestoesIA = [] } = useQuery({
    queryKey: ['sugestoes-empresa-ia', user?.id],
    queryFn: async () => {
      try {
        const agora = new Date();
        const hora = agora.getHours();
        const diaSemana = agora.getDay();
        
        // Análise de padrão temporal
        const empresaMaisUsadaManha = historicoTrocas
          .filter(log => {
            const hora = new Date(log.created_date).getHours();
            return hora >= 6 && hora < 12;
          })
          .reduce((acc, log) => {
            const empresaId = log.dados_novos?.empresa_id;
            acc[empresaId] = (acc[empresaId] || 0) + 1;
            return acc;
          }, {});

        const empresaMaisUsadaTarde = historicoTrocas
          .filter(log => {
            const hora = new Date(log.created_date).getHours();
            return hora >= 12 && hora < 18;
          })
          .reduce((acc, log) => {
            const empresaId = log.dados_novos?.empresa_id;
            acc[empresaId] = (acc[empresaId] || 0) + 1;
            return acc;
          }, {});

        const sugestoes = [];
        
        // Sugestão baseada no horário
        if (hora >= 6 && hora < 12 && Object.keys(empresaMaisUsadaManha).length > 0) {
          const empresaId = Object.keys(empresaMaisUsadaManha).sort((a, b) => 
            empresaMaisUsadaManha[b] - empresaMaisUsadaManha[a]
          )[0];
          sugestoes.push({
            empresa_id: empresaId,
            motivo: 'Você costuma trabalhar nesta empresa pela manhã',
            confianca: 85
          });
        }

        return sugestoes;
      } catch {
        return [];
      }
    },
    enabled: !!user && historicoTrocas.length > 0,
  });

  // 📊 ANALYTICS: Estatísticas de uso por empresa
  const { data: estatisticasUso = {} } = useQuery({
    queryKey: ['estatisticas-uso-empresas', user?.id],
    queryFn: async () => {
      try {
        const stats = {};
        for (const empresa of empresasDisponiveis) {
          const trocas = historicoTrocas.filter(log => 
            log.dados_novos?.empresa_id === empresa.id
          ).length;
          stats[empresa.id] = {
            total_acessos: trocas,
            ultima_vez: historicoTrocas.find(log => 
              log.dados_novos?.empresa_id === empresa.id
            )?.created_date,
            favorita: trocas > (historicoTrocas.length / empresasDisponiveis.length)
          };
        }
        return stats;
      } catch {
        return {};
      }
    },
    enabled: !!user && empresasDisponiveis.length > 0,
  });

  // 🎯 Marcar empresa como favorita
  const marcarFavorita = useMutation({
    mutationFn: async (empresaId) => {
      const userData = await base44.auth.me();
      const empresasFavoritas = userData.empresas_favoritas || [];
      
      if (empresasFavoritas.includes(empresaId)) {
        await base44.auth.updateMe({
          empresas_favoritas: empresasFavoritas.filter(id => id !== empresaId)
        });
        return { acao: 'removida', empresaId };
      } else {
        await base44.auth.updateMe({
          empresas_favoritas: [...empresasFavoritas, empresaId]
        });
        return { acao: 'adicionada', empresaId };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user']);
      toast({
        title: data.acao === 'adicionada' ? '⭐ Favorito adicionado' : 'Favorito removido',
        description: `Empresa ${data.acao} dos favoritos com sucesso.`,
      });
    }
  });

  if (isLoading || !user) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg animate-pulse">
        <div className="w-32 h-8 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const handleSelecaoContexto = async (value) => {
    const [tipo, id] = value.split(':');
    
    // 📝 Registrar log de auditoria
    try {
      await base44.entities.AuditLog.create({
        usuario: user?.full_name,
        usuario_id: user?.id,
        acao: 'Troca de Empresa',
        modulo: 'Sistema',
        descricao: tipo === 'grupo' 
          ? `Mudou para visão de grupo: ${gruposDisponiveis.find(g => g.id === id)?.nome_do_grupo}`
          : `Mudou para empresa: ${empresasDisponiveis.find(e => e.id === id)?.nome_fantasia}`,
        dados_anteriores: {
          contexto: contexto,
          grupo_id: grupoAtual?.id,
          empresa_id: empresaAtual?.id
        },
        dados_novos: {
          contexto: tipo,
          grupo_id: tipo === 'grupo' ? id : null,
          empresa_id: tipo === 'empresa' ? id : null
        },
        sucesso: true
      });
    } catch (e) {
      console.warn('Erro ao registrar log de troca:', e);
    }
    
    if (tipo === 'grupo') {
      trocarParaGrupo.mutate(id, {
        onSuccess: () => {
          toast({
            title: '🏢 Visão de Grupo',
            description: 'Agora você está vendo dados consolidados do grupo.',
          });
        }
      });
    } else if (tipo === 'empresa') {
      trocarParaEmpresa.mutate(id, {
        onSuccess: () => {
          const empresa = empresasDisponiveis.find(e => e.id === id);
          toast({
            title: '🏭 Empresa Selecionada',
            description: `Agora trabalhando em: ${empresa?.nome_fantasia}`,
          });
        }
      });
    }
    
    setOpen(false);
    queryClient.invalidateQueries(['historico-trocas-contexto']);
  };

  // ⚡ Atalho de teclado: Ctrl/Cmd + Shift + E
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const valorAtual = contexto === 'grupo' 
    ? `grupo:${grupoAtual?.id}` 
    : `empresa:${empresaAtual?.id}`;

  const nomeAtual = contexto === 'grupo'
    ? grupoAtual?.nome_do_grupo
    : (empresaAtual?.nome_fantasia || empresaAtual?.razao_social);

  return (
    <TooltipProvider>
      <div className="relative">
        <Select value={valorAtual} onValueChange={handleSelecaoContexto} open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectTrigger className="w-[280px] bg-white border-slate-300 hover:bg-slate-50 transition-all hover:shadow-md group">
                <div className="flex items-center gap-2 w-full">
                  {contexto === 'grupo' ? (
                    <div className="relative">
                      <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                      {empresasDoGrupo?.length > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-[8px] bg-blue-600 flex items-center justify-center">
                          {empresasDoGrupo.length}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                      {estatisticasUso[empresaAtual?.id]?.favorita && (
                        <Star className="absolute -top-1 -right-1 w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  )}
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500 uppercase font-semibold">
                        {contexto === 'grupo' ? 'Grupo Corporativo' : 'Empresa'}
                      </span>
                      {estatisticasUso[empresaAtual?.id]?.total_acessos > 5 && (
                        <Activity className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-900 truncate w-full">
                      {nomeAtual}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </SelectTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Trocar contexto (Ctrl+Shift+E)</p>
              {estatisticasUso[empresaAtual?.id]?.total_acessos > 0 && (
                <p className="text-[10px] text-slate-400 mt-1">
                  {estatisticasUso[empresaAtual?.id]?.total_acessos} acessos
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        
        <SelectContent className="w-[320px]" style={{ zIndex: 9999999999 }}>
          {/* 🤖 SUGESTÕES INTELIGENTES DA IA */}
          {mostrarSugestoes && sugestoesIA.length > 0 && (
            <div className="mb-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-700">Sugestão Inteligente</span>
              </div>
              {sugestoesIA.map((sugestao, idx) => {
                const empresa = empresasDisponiveis.find(e => e.id === sugestao.empresa_id);
                return empresa ? (
                  <button
                    key={idx}
                    onClick={() => handleSelecaoContexto(`empresa:${empresa.id}`)}
                    className="w-full flex items-center justify-between p-2 hover:bg-white rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-medium">{empresa.nome_fantasia}</span>
                        <span className="text-[10px] text-slate-500">{sugestao.motivo}</span>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                      {sugestao.confianca}% confiança
                    </Badge>
                  </button>
                ) : null;
              })}
            </div>
          )}

          {/* 📊 HISTÓRICO RÁPIDO */}
          {mostrarHistorico && historicoTrocas.length > 0 && (
            <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-700">Recentes</span>
              </div>
              {historicoTrocas.slice(0, 3).map((log, idx) => {
                const empresaId = log.dados_novos?.empresa_id;
                const empresa = empresasDisponiveis.find(e => e.id === empresaId);
                return empresa ? (
                  <button
                    key={idx}
                    onClick={() => handleSelecaoContexto(`empresa:${empresa.id}`)}
                    className="w-full flex items-center justify-between p-1.5 hover:bg-white rounded transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{empresa.nome_fantasia}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.created_date).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </button>
                ) : null;
              })}
            </div>
          )}

          {/* GRUPOS DISPONÍVEIS */}
          {podeOperarEmGrupo && gruposDisponiveis.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase">
                <Users className="w-4 h-4" />
                Grupos Corporativos
              </SelectLabel>
              {gruposDisponiveis.map((grupo) => (
                <SelectItem 
                  key={`grupo:${grupo.id}`} 
                  value={`grupo:${grupo.id}`}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{grupo.nome_do_grupo}</span>
                    </div>
                    {contexto === 'grupo' && grupoAtual?.id === grupo.id && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">Atual</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {/* EMPRESAS DISPONÍVEIS */}
          {empresasDisponiveis.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase mt-2">
                <Building2 className="w-4 h-4" />
                Empresas / Filiais
              </SelectLabel>
              {empresasDisponiveis
                .sort((a, b) => {
                  // Favoritas primeiro
                  const aFav = user?.empresas_favoritas?.includes(a.id) ? 1 : 0;
                  const bFav = user?.empresas_favoritas?.includes(b.id) ? 1 : 0;
                  if (aFav !== bFav) return bFav - aFav;
                  
                  // Depois por total de acessos
                  const aAcessos = estatisticasUso[a.id]?.total_acessos || 0;
                  const bAcessos = estatisticasUso[b.id]?.total_acessos || 0;
                  if (aAcessos !== bAcessos) return bAcessos - aAcessos;
                  
                  // Por último, alfabética
                  return (a.nome_fantasia || a.razao_social).localeCompare(
                    b.nome_fantasia || b.razao_social
                  );
                })
                .map((empresa) => {
                  const isFavorita = user?.empresas_favoritas?.includes(empresa.id);
                  const stats = estatisticasUso[empresa.id] || {};
                  
                  return (
                    <SelectItem 
                      key={`empresa:${empresa.id}`} 
                      value={`empresa:${empresa.id}`}
                      className="cursor-pointer hover:bg-slate-50 group/item"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">
                              {empresa.nome_fantasia || empresa.razao_social}
                            </span>
                            {isFavorita && (
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            )}
                            {stats.total_acessos > 10 && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p className="text-xs">Empresa frequente</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-6 flex-wrap">
                            <span className="text-xs text-slate-500">{empresa.cnpj}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {empresa.tipo}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {empresa.nivel_acesso}
                            </Badge>
                            {stats.total_acessos > 0 && (
                              <Badge className="bg-slate-100 text-slate-600 text-[10px]">
                                {stats.total_acessos} acessos
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              marcarFavorita.mutate(empresa.id);
                            }}
                          >
                            <Star className={`w-3.5 h-3.5 ${isFavorita ? 'text-yellow-500 fill-yellow-500' : 'text-slate-400'}`} />
                          </Button>
                          {contexto === 'empresa' && empresaAtual?.id === empresa.id && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">Atual</Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
            </SelectGroup>
          )}

          {/* MENSAGEM SE NÃO TIVER ACESSO */}
          {!podeOperarEmGrupo && gruposDisponiveis.length === 0 && empresasDisponiveis.length === 0 && (
            <div className="p-4 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-medium">Sem acesso a empresas</p>
              <p className="text-xs text-slate-500 mt-1">Entre em contato com o administrador do sistema.</p>
            </div>
          )}

          {/* 🎛️ CONTROLES DE VISUALIZAÇÃO */}
          <div className="border-t border-slate-200 p-2 mt-2 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setMostrarSugestoes(!mostrarSugestoes)}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {mostrarSugestoes ? 'Ocultar' : 'Mostrar'} IA
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setMostrarHistorico(!mostrarHistorico)}
                >
                  <History className="w-3 h-3 mr-1" />
                  Histórico
                </Button>
              </div>
              <Badge className="text-[10px] bg-slate-200 text-slate-600">
                {empresasDisponiveis.length} empresas
              </Badge>
            </div>
          </div>
        </SelectContent>
      </Select>

      {/* INDICADOR DE CONTEXTO ATUAL COM ANALYTICS */}
      <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              className={`text-[10px] flex items-center gap-1 ${
                contexto === 'grupo' 
                  ? 'bg-blue-100 text-blue-700 border-blue-300' 
                  : 'bg-purple-100 text-purple-700 border-purple-300'
              }`}
            >
              {contexto === 'grupo' ? (
                <>
                  <Users className="w-3 h-3" />
                  Visão Consolidada
                  {empresasDoGrupo?.length > 0 && (
                    <span className="ml-1">({empresasDoGrupo.length} empresas)</span>
                  )}
                </>
              ) : (
                <>
                  <Building2 className="w-3 h-3" />
                  Visão Individual
                  {estatisticasUso[empresaAtual?.id]?.favorita && (
                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500 ml-1" />
                  )}
                </>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs space-y-1">
              <p className="font-semibold">
                {contexto === 'grupo' ? 'Modo Grupo' : 'Modo Empresa'}
              </p>
              {contexto === 'grupo' ? (
                <p className="text-slate-400">
                  Visualizando dados consolidados de {empresasDoGrupo?.length || 0} empresas
                </p>
              ) : (
                <>
                  <p className="text-slate-400">
                    Visualizando apenas: {nomeAtual}
                  </p>
                  {estatisticasUso[empresaAtual?.id]?.total_acessos > 0 && (
                    <p className="text-slate-400">
                      {estatisticasUso[empresaAtual?.id]?.total_acessos} acessos registrados
                    </p>
                  )}
                </>
              )}
              <p className="text-[10px] text-slate-400 border-t border-slate-200 pt-1 mt-1">
                Pressione Ctrl+Shift+E para trocar
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
    </TooltipProvider>
  );
}