import React, { useEffect, useState } from 'react';

/**
 * Notificações Push no Navegador
 * V12.0 - Engajamento em tempo real
 */

export const solicitarPermissaoNotificacoes = async () => {
  if (!("Notification" in window)) {
    console.log("Este navegador não suporta notificações");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const enviarNotificacaoPush = (titulo, opcoes = {}) => {
  if (Notification.permission !== "granted") {
    console.log("Permissão de notificação não concedida");
    return;
  }

  const opcoesDefault = {
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    ...opcoes
  };

  const notification = new Notification(titulo, opcoesDefault);

  notification.onclick = () => {
    window.focus();
    if (opcoes.url) {
      window.location.href = opcoes.url;
    }
    notification.close();
  };

  return notification;
};

export const notificarPedidoAprovado = (pedido) => {
  enviarNotificacaoPush(
    `✅ Pedido ${pedido.numero_pedido} aprovado!`,
    {
      body: `Cliente: ${pedido.cliente_nome}\nValor: R$ ${pedido.valor_total.toLocaleString('pt-BR')}`,
      tag: 'pedido-aprovado',
      url: '/comercial?tab=pedidos'
    }
  );
};

export const notificarBoletoRecebido = (conta) => {
  enviarNotificacaoPush(
    `💰 Pagamento Recebido!`,
    {
      body: `R$ ${conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n${conta.cliente}`,
      tag: 'pagamento-recebido',
      url: '/financeiro?tab=receber'
    }
  );
};

export const notificarEntregaRealizada = (entrega) => {
  enviarNotificacaoPush(
    `🚚 Entrega Realizada!`,
    {
      body: `Pedido ${entrega.numero_pedido}\nCliente: ${entrega.cliente_nome}`,
      tag: 'entrega-realizada',
      url: '/expedicao?tab=entregas'
    }
  );
};

export const notificarEstoqueBaixo = (produto) => {
  enviarNotificacaoPush(
    `⚠️ Estoque Baixo!`,
    {
      body: `${produto.descricao}\nEstoque: ${produto.estoque_atual} ${produto.unidade_medida}`,
      tag: 'estoque-baixo',
      requireInteraction: true,
      url: '/estoque?tab=produtos'
    }
  );
};

export function useNotificacoesPush() {
  const [permissaoAtiva, setPermissaoAtiva] = useState(
    typeof Notification !== 'undefined' && Notification.permission === "granted"
  );

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermissaoAtiva(Notification.permission === "granted");
    }
  }, []);

  const solicitar = async () => {
    const concedida = await solicitarPermissaoNotificacoes();
    setPermissaoAtiva(concedida);
    return concedida;
  };

  const notificar = (titulo, opcoes) => {
    if (!permissaoAtiva) {
      console.log('Notificações desativadas');
      return;
    }
    return enviarNotificacaoPush(titulo, opcoes);
  };

  return { 
    permissaoAtiva, 
    solicitar, 
    notificar,
    notificarPedidoAprovado,
    notificarBoletoRecebido,
    notificarEntregaRealizada,
    notificarEstoqueBaixo
  };
}