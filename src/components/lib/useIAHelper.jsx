import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useUser } from './UserContext';

/**
 * Hook de IA de Assistência Contextual
 * Fornece sugestões inteligentes baseadas no contexto do usuário
 */
export function useIAHelper(moduloAtual = null, contexto = {}) {
  const { user } = useUser();
  const [sugestoes, setSugestoes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!user || !moduloAtual) return;

    const buscarSugestoes = async () => {
      setCarregando(true);
      try {
        // Análise contextual básica
        const sugestoesContextuais = [];

        // Sugestão baseada em módulo
        if (moduloAtual === 'Producao' && contexto.opsAtrasadas > 0) {
          sugestoesContextuais.push({
            tipo: 'alerta',
            prioridade: 'alta',
            titulo: `${contexto.opsAtrasadas} OP(s) atrasada(s)`,
            descricao: 'Deseja gerar relatório de atrasos?',
            acao: 'gerar_relatorio_ops_atrasadas',
            icone: 'AlertCircle',
            cor: 'red'
          });
        }

        if (moduloAtual === 'Financeiro' && contexto.titulosVencidos > 0) {
          sugestoesContextuais.push({
            tipo: 'alerta',
            prioridade: 'alta',
            titulo: `${contexto.titulosVencidos} título(s) vencido(s)`,
            descricao: 'Deseja enviar cobranças automáticas?',
            acao: 'enviar_cobrancas_automaticas',
            icone: 'DollarSign',
            cor: 'orange'
          });
        }

        if (moduloAtual === 'Comercial' && contexto.pedidosPendentes > 0) {
          sugestoesContextuais.push({
            tipo: 'info',
            prioridade: 'media',
            titulo: `${contexto.pedidosPendentes} pedido(s) aguardando aprovação`,
            descricao: 'Deseja revisar agora?',
            acao: 'abrir_pedidos_pendentes',
            icone: 'ShoppingCart',
            cor: 'blue'
          });
        }

        setSugestoes(sugestoesContextuais);
      } catch (error) {
        console.error('Erro ao buscar sugestões IA:', error);
      } finally {
        setCarregando(false);
      }
    };

    buscarSugestoes();
  }, [moduloAtual, contexto, user]);

  const executarSugestao = async (acao) => {
    // Mapeia ações para URLs ou funções
    const acoesMap = {
      gerar_relatorio_ops_atrasadas: '/relatorios?tipo=ops_atrasadas',
      enviar_cobrancas_automaticas: '/financeiro?acao=cobrar',
      abrir_pedidos_pendentes: '/comercial?tab=pedidos&status=Aguardando Aprovação'
    };

    return acoesMap[acao];
  };

  return {
    sugestoes,
    carregando,
    executarSugestao
  };
}

export default useIAHelper;