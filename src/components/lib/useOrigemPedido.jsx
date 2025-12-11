import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook para detectar e gerenciar origem automática de pedidos
 * 
 * Detecta de onde o pedido está sendo criado:
 * - ERP (interface web admin)
 * - Site (página pública)
 * - Chatbot (integração chatbot)
 * - Portal Cliente (portal self-service)
 * - API (chamada externa)
 * - Marketplace (integração marketplace)
 * 
 * @param {Object} options - Opções de configuração
 * @param {string} options.contexto - Contexto atual: 'erp', 'site', 'chatbot', 'portal', 'api', 'marketplace'
 * @param {boolean} options.criacaoManual - Se está sendo criado manualmente pelo usuário
 * @param {string} options.origemExterna - ID da origem externa (ex: pedido do marketplace)
 * @returns {Object} { origemPedido, bloquearEdicao, parametro, isLoading }
 */
export function useOrigemPedido({ 
  contexto = 'erp', 
  criacaoManual = true, 
  origemExterna = null 
} = {}) {
  const [origemPedido, setOrigemPedido] = useState(null);
  const [bloquearEdicao, setBloquearEdicao] = useState(false);

  // Buscar parâmetros configurados
  const { data: parametros, isLoading } = useQuery({
    queryKey: ['parametros-origem-pedido'],
    queryFn: () => base44.entities.ParametroOrigemPedido.list(),
    initialData: [],
  });

  // Detectar contexto automaticamente se não fornecido
  const detectarContexto = () => {
    // Se tem origem externa, é automático
    if (origemExterna) {
      return { contexto: 'api', manual: false };
    }

    // Detectar pelo URL ou outros sinais
    const url = window.location.href;
    
    if (url.includes('/portal')) {
      return { contexto: 'portal', manual: criacaoManual };
    }
    if (url.includes('/site') || url.includes('public')) {
      return { contexto: 'site', manual: criacaoManual };
    }
    if (url.includes('/chatbot')) {
      return { contexto: 'chatbot', manual: false };
    }
    
    // Por padrão, é ERP
    return { contexto: 'erp', manual: criacaoManual };
  };

  useEffect(() => {
    if (!parametros || parametros.length === 0) return;

    const { contexto: ctx, manual } = detectarContexto();

    // Mapear contexto para canal
    const mapeamentoCanal = {
      'erp': 'ERP',
      'site': 'Site',
      'chatbot': 'Chatbot',
      'portal': 'Portal Cliente',
      'api': 'API',
      'marketplace': 'Marketplace',
      'whatsapp': 'WhatsApp',
      'ecommerce': 'E-commerce',
      'app': 'App Mobile'
    };

    const canal = mapeamentoCanal[ctx] || 'ERP';

    // Buscar parâmetro configurado para este canal
    const parametro = parametros.find(p => p.canal === canal && p.ativo);

    if (parametro) {
      // Definir origem baseada se é manual ou automático
      const origem = manual 
        ? parametro.origem_pedido_manual 
        : parametro.origem_pedido_automatico;

      setOrigemPedido(origem || 'Manual');
      
      // Bloquear edição se for automático e configurado para bloquear
      setBloquearEdicao(!manual && parametro.bloquear_edicao_automatico);
    } else {
      // Fallback se não houver parâmetro configurado
      const origemPadrao = {
        'ERP': 'Manual',
        'Site': 'Site',
        'Chatbot': 'Chatbot',
        'Portal Cliente': 'Portal',
        'API': 'API',
        'Marketplace': 'Marketplace',
        'WhatsApp': 'WhatsApp',
        'E-commerce': 'E-commerce',
        'App Mobile': 'App'
      };

      setOrigemPedido(origemPadrao[canal] || 'Manual');
      setBloquearEdicao(!manual);
    }
  }, [parametros, contexto, criacaoManual, origemExterna]);

  return {
    origemPedido,
    bloquearEdicao,
    parametro: parametros?.find(p => p.canal === contexto),
    parametros,
    isLoading
  };
}

/**
 * Hook para buscar configurações de origem por canal específico
 * @param {string} canal - Nome do canal: 'ERP', 'Site', 'Chatbot', etc.
 */
export function useParametroOrigem(canal) {
  const { data: parametros, isLoading } = useQuery({
    queryKey: ['parametros-origem-pedido', canal],
    queryFn: () => base44.entities.ParametroOrigemPedido.filter({ canal, ativo: true }),
    initialData: [],
  });

  return {
    parametro: parametros?.[0] || null,
    isLoading
  };
}