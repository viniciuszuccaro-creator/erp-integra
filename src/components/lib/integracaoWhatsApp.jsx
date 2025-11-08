/**
 * Biblioteca de Integração WhatsApp Business Real
 * Suporta: Evolution API, Baileys, WPPCONNECT
 */

import { base44 } from '@/api/base44Client';

/**
 * Verifica configuração do WhatsApp
 */
async function verificarConfiguracao(empresaId) {
  const configs = await base44.entities.ConfiguracaoSistema.filter({
    categoria: 'Integracoes',
    chave: `whatsapp_${empresaId}`
  });
  
  if (!configs || configs.length === 0) {
    return { configurado: false, erro: 'Configuração WhatsApp não encontrada' };
  }
  
  const config = configs[0];
  const whatsapp = config.integracao_whatsapp || {};
  
  if (!whatsapp.ativo) {
    return { configurado: false, erro: 'WhatsApp não está ativo', config };
  }
  
  if (!whatsapp.api_key || !whatsapp.instance_name) {
    return { configurado: false, erro: 'API Key ou Instance não configurados', config };
  }
  
  return { configurado: true, config, whatsapp };
}

/**
 * Enviar Mensagem via Evolution API
 */
async function enviarMensagemEvolution(numero, mensagem, config) {
  const apiKey = config.api_key;
  const apiUrl = config.api_url || 'https://evolution-api.com';
  const instanceName = config.instance_name;

  const payload = {
    number: numero.replace(/\D/g, ''),
    text: mensagem
  };

  const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.message || 'Erro ao enviar mensagem');
  }

  const resultado = await response.json();
  
  return {
    sucesso: true,
    messageId: resultado.key?.id,
    status: 'sent',
    timestamp: new Date().toISOString()
  };
}

/**
 * Enviar Arquivo via WhatsApp
 */
async function enviarArquivoEvolution(numero, arquivoUrl, legenda, config) {
  const apiKey = config.api_key;
  const apiUrl = config.api_url || 'https://evolution-api.com';
  const instanceName = config.instance_name;

  const payload = {
    number: numero.replace(/\D/g, ''),
    mediaUrl: arquivoUrl,
    caption: legenda || ''
  };

  const response = await fetch(`${apiUrl}/message/sendMedia/${instanceName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.message || 'Erro ao enviar arquivo');
  }

  const resultado = await response.json();
  
  return {
    sucesso: true,
    messageId: resultado.key?.id,
    status: 'sent'
  };
}

/**
 * Verificar Status da Conexão
 */
async function verificarConexao(empresaId) {
  const verificacao = await verificarConfiguracao(empresaId);
  
  if (!verificacao.configurado) {
    return {
      conectado: false,
      modo: 'simulado',
      mensagem: verificacao.erro
    };
  }

  const { whatsapp } = verificacao;
  const apiKey = whatsapp.api_key;
  const apiUrl = whatsapp.api_url || 'https://evolution-api.com';
  const instanceName = whatsapp.instance_name;

  try {
    const response = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
      headers: { 'apikey': apiKey }
    });

    if (!response.ok) {
      return {
        conectado: false,
        erro: 'Erro ao verificar conexão'
      };
    }

    const resultado = await response.json();
    
    return {
      conectado: resultado.state === 'open',
      estado: resultado.state,
      qrcode: resultado.qrcode
    };
    
  } catch (error) {
    return {
      conectado: false,
      erro: error.message
    };
  }
}

/**
 * Função principal: Enviar WhatsApp
 */
export async function enviarWhatsApp(dados) {
  const { numero, mensagem, empresaId, tipo = 'texto', arquivoUrl = null, legenda = null } = dados;
  
  // 1. Verificar configuração
  const verificacao = await verificarConfiguracao(empresaId);
  
  // 2. Modo simulado se não configurado
  if (!verificacao.configurado) {
    console.warn('⚠️ WhatsApp não configurado. Modo simulado.');
    
    return {
      sucesso: true,
      modo: 'simulado',
      messageId: `SIM_${Date.now()}`,
      status: 'sent',
      mensagem: 'Mensagem simulada. Configure WhatsApp para envio real.'
    };
  }

  // 3. Verificar conexão
  const statusConexao = await verificarConexao(empresaId);
  
  if (!statusConexao.conectado) {
    throw new Error('WhatsApp desconectado. Escaneie o QR Code novamente.');
  }

  // 4. Enviar conforme tipo
  try {
    let resultado;
    
    if (tipo === 'arquivo' && arquivoUrl) {
      resultado = await enviarArquivoEvolution(numero, arquivoUrl, legenda, verificacao.whatsapp);
    } else {
      resultado = await enviarMensagemEvolution(numero, mensagem, verificacao.whatsapp);
    }

    // 5. Registrar envio
    await base44.entities.Notificacao.create({
      titulo: '📱 WhatsApp Enviado',
      mensagem: `Mensagem enviada para ${numero}`,
      tipo: 'info',
      categoria: 'Sistema',
      prioridade: 'Baixa'
    });

    return {
      ...resultado,
      modo: 'real'
    };
    
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    throw error;
  }
}

/**
 * Enviar Boleto por WhatsApp
 */
export async function enviarBoletoWhatsApp(conta, empresaId) {
  const clientes = await base44.entities.Cliente.filter({ id: conta.cliente_id });
  const cliente = clientes[0];
  
  if (!cliente) {
    throw new Error('Cliente não encontrado');
  }

  const whatsapp = cliente.contatos?.find(c => c.tipo === 'WhatsApp')?.valor;
  
  if (!whatsapp) {
    throw new Error('Cliente não possui WhatsApp cadastrado');
  }

  const mensagem = `
🔔 *Novo Boleto Disponível*

Olá, ${cliente.nome}!

📄 *Descrição:* ${conta.descricao}
💰 *Valor:* R$ ${conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
📅 *Vencimento:* ${new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}

${conta.url_boleto_pdf ? `📎 *Boleto:* ${conta.url_boleto_pdf}` : ''}
${conta.pix_copia_cola ? `\n💳 *PIX Copia e Cola:* ${conta.pix_copia_cola}` : ''}

Qualquer dúvida, estamos à disposição! 😊
  `.trim();

  return await enviarWhatsApp({
    numero: whatsapp,
    mensagem,
    empresaId,
    tipo: 'texto'
  });
}

/**
 * Enviar Atualização de Pedido por WhatsApp
 */
export async function notificarPedidoWhatsApp(pedido, mensagemPersonalizada, empresaId) {
  const whatsapp = pedido.contatos_cliente?.find(c => c.tipo === 'WhatsApp')?.valor;
  
  if (!whatsapp) {
    throw new Error('Cliente não possui WhatsApp no pedido');
  }

  const mensagem = mensagemPersonalizada || `
🛒 *Atualização do Pedido ${pedido.numero_pedido}*

Status: *${pedido.status}*

${pedido.data_prevista_entrega ? `📅 Previsão de entrega: ${new Date(pedido.data_prevista_entrega).toLocaleDateString('pt-BR')}` : ''}

Acompanhe seu pedido em tempo real! 📦
  `.trim();

  return await enviarWhatsApp({
    numero: whatsapp,
    mensagem,
    empresaId,
    tipo: 'texto'
  });
}

export default {
  enviarWhatsApp,
  enviarBoletoWhatsApp,
  notificarPedidoWhatsApp,
  verificarConexao,
  verificarConfiguracao
};