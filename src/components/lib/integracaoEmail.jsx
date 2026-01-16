/**
 * Biblioteca de Integração Email Real
 * Suporta: SendGrid, AWS SES, SMTP Custom
 */

import { base44 } from '@/api/base44Client';

/**
 * Verifica configuração de email
 */
async function verificarConfiguracao(empresaId) {
  const configs = await base44.entities.ConfiguracaoSistema.filter({
    categoria: 'Email',
    chave: `email_${empresaId}`
  });
  
  if (!configs || configs.length === 0) {
    return { configurado: false, erro: 'Configuração de email não encontrada' };
  }
  
  const config = configs[0];
  const email = config.configuracoes_email || {};
  
  if (!email.ativo) {
    return { configurado: false, erro: 'Email não está ativo', config };
  }
  
  if (!email.api_key && !email.smtp_password) {
    return { configurado: false, erro: 'Credenciais não configuradas', config };
  }
  
  return { configurado: true, config, email };
}

/**
 * Enviar Email via SendGrid
 */
async function enviarEmailSendGrid(dados, config) {
  const { data } = await base44.functions.invoke('sendEmailProvider', dados);
  return data;
}

/**
 * Enviar Email via AWS SES
 */
async function enviarEmailAWSSES(dados, config) {
  const { data } = await base44.functions.invoke('sendEmailProvider', dados);
  return data;
}

/**
 * Função principal: Enviar Email
 */
export async function enviarEmail(dados) {
  const { data } = await base44.functions.invoke('sendEmailProvider', dados);
  return data;
}

/**
 * Processar Template
 */
function processarTemplate(template, variaveis) {
  let resultado = template;
  
  // Substituir variáveis {{variavel}}
  Object.keys(variaveis).forEach(chave => {
    const regex = new RegExp(`{{${chave}}}`, 'g');
    resultado = resultado.replace(regex, variaveis[chave]);
  });
  
  return resultado;
}

/**
 * Templates Prontos
 */
export const TEMPLATES_EMAIL = {
  PEDIDO_APROVADO: {
    nome: 'Pedido Aprovado',
    assunto: 'Pedido {{numero_pedido}} Aprovado! 🎉',
    corpo: `
      <h2>Olá, {{cliente_nome}}!</h2>
      <p>Seu pedido <strong>{{numero_pedido}}</strong> foi aprovado e já está em produção!</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📦 Valor Total:</strong> R$ {{valor_total}}</p>
        <p><strong>📅 Previsão de Entrega:</strong> {{data_prevista}}</p>
        <p><strong>🏭 Status:</strong> {{status}}</p>
      </div>
      
      <p>Qualquer dúvida, estamos à disposição!</p>
      <p>Equipe Zuccaro</p>
    `
  },
  
  PEDIDO_PRONTO: {
    nome: 'Pedido Pronto para Retirada',
    assunto: 'Pedido {{numero_pedido}} Pronto! 📦',
    corpo: `
      <h2>Olá, {{cliente_nome}}!</h2>
      <p>Seu pedido <strong>{{numero_pedido}}</strong> está pronto e aguardando expedição!</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>✅ Situação:</strong> Pronto para Faturar</p>
        <p><strong>📍 Local de Retirada:</strong> {{local_retirada}}</p>
        <p><strong>⏰ Horário:</strong> {{horario_retirada}}</p>
      </div>
      
      <p>Aguardamos você!</p>
    `
  },
  
  ENTREGA_SAIU: {
    nome: 'Entrega a Caminho',
    assunto: 'Seu pedido {{numero_pedido}} saiu para entrega! 🚚',
    corpo: `
      <h2>Olá, {{cliente_nome}}!</h2>
      <p>Seu pedido <strong>{{numero_pedido}}</strong> saiu para entrega!</p>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>🚚 Motorista:</strong> {{motorista}}</p>
        <p><strong>🚗 Veículo:</strong> {{veiculo}} - Placa: {{placa}}</p>
        <p><strong>📞 Contato:</strong> {{motorista_telefone}}</p>
        <p><strong>📅 Previsão:</strong> {{data_prevista}}</p>
      </div>
      
      {{#rastreamento_url}}
      <p><a href="{{rastreamento_url}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        📍 Rastrear Entrega
      </a></p>
      {{/rastreamento_url}}
      
      <p>Estamos a caminho! 😊</p>
    `
  },
  
  BOLETO_GERADO: {
    nome: 'Boleto Disponível',
    assunto: 'Boleto Disponível - Vencimento {{data_vencimento}} 💳',
    corpo: `
      <h2>Olá, {{cliente_nome}}!</h2>
      <p>Seu boleto já está disponível para pagamento.</p>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>💰 Valor:</strong> R$ {{valor}}</p>
        <p><strong>📅 Vencimento:</strong> {{data_vencimento}}</p>
        <p><strong>📄 Descrição:</strong> {{descricao}}</p>
      </div>
      
      <p><a href="{{url_boleto}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        📥 Baixar Boleto
      </a></p>
      
      {{#pix_copia_cola}}
      <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p><strong>💳 PIX Copia e Cola:</strong></p>
        <code style="background: white; padding: 10px; display: block; word-break: break-all; border: 1px solid #cbd5e1; border-radius: 4px;">
          {{pix_copia_cola}}
        </code>
      </div>
      {{/pix_copia_cola}}
      
      <p>Obrigado pela preferência!</p>
    `
  },
  
  NF_EMITIDA: {
    nome: 'NF-e Emitida',
    assunto: 'NF-e {{numero}} Emitida - Download Disponível 📄',
    corpo: `
      <h2>Olá, {{cliente_nome}}!</h2>
      <p>A Nota Fiscal Eletrônica foi emitida com sucesso!</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📄 Número:</strong> {{numero}}/{{serie}}</p>
        <p><strong>🔑 Chave de Acesso:</strong></p>
        <code style="font-size: 11px; word-break: break-all;">{{chave_acesso}}</code>
        <p style="margin-top: 10px;"><strong>💰 Valor:</strong> R$ {{valor_total}}</p>
      </div>
      
      <p>
        <a href="{{pdf_danfe}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
          📥 DANFE PDF
        </a>
        <a href="{{xml_nfe}}" style="background: #64748b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          📄 XML
        </a>
      </p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
        Consulte a autenticidade em: <a href="http://www.nfe.fazenda.gov.br/portal">www.nfe.fazenda.gov.br/portal</a>
      </p>
    `
  }
};

/**
 * Enviar notificação de Pedido Aprovado
 */
export async function notificarPedidoAprovado(pedido, empresaId) {
  const cliente = await base44.entities.Cliente.filter({ id: pedido.cliente_id });
  const clienteData = cliente[0];
  
  if (!clienteData) return;
  
  const email = clienteData.contatos?.find(c => c.tipo === 'E-mail')?.valor || clienteData.email;
  
  if (!email) {
    console.warn('Cliente sem email cadastrado');
    return;
  }

  const template = TEMPLATES_EMAIL.PEDIDO_APROVADO;
  
  return await enviarEmail({
    empresaId,
    destinatario: email,
    destinatario_nome: clienteData.nome,
    assunto: processarTemplate(template.assunto, {
      numero_pedido: pedido.numero_pedido
    }),
    mensagem: processarTemplate(template.corpo, {
      cliente_nome: clienteData.nome,
      numero_pedido: pedido.numero_pedido,
      valor_total: pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      data_prevista: pedido.data_prevista_entrega 
        ? new Date(pedido.data_prevista_entrega).toLocaleDateString('pt-BR')
        : 'A definir',
      status: pedido.status
    }),
    tipo_conteudo: 'html'
  });
}

/**
 * Enviar notificação de Boleto Gerado
 */
export async function notificarBoletoGerado(conta, empresaId) {
  const cliente = await base44.entities.Cliente.filter({ id: conta.cliente_id });
  const clienteData = cliente[0];
  
  if (!clienteData) return;
  
  const email = clienteData.contatos?.find(c => c.tipo === 'E-mail')?.valor || clienteData.email;
  
  if (!email) return;

  const template = TEMPLATES_EMAIL.BOLETO_GERADO;
  
  return await enviarEmail({
    empresaId,
    destinatario: email,
    destinatario_nome: clienteData.nome,
    assunto: processarTemplate(template.assunto, {
      data_vencimento: new Date(conta.data_vencimento).toLocaleDateString('pt-BR')
    }),
    mensagem: processarTemplate(template.corpo, {
      cliente_nome: clienteData.nome,
      valor: conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      data_vencimento: new Date(conta.data_vencimento).toLocaleDateString('pt-BR'),
      descricao: conta.descricao,
      url_boleto: conta.url_boleto_pdf || '#',
      pix_copia_cola: conta.pix_copia_cola || ''
    }),
    tipo_conteudo: 'html'
  });
}

/**
 * Enviar notificação de NF-e Emitida
 */
export async function notificarNFeEmitida(nfe, empresaId) {
  const cliente = await base44.entities.Cliente.filter({ id: nfe.cliente_fornecedor_id });
  const clienteData = cliente[0];
  
  if (!clienteData) return;
  
  const email = clienteData.contatos?.find(c => c.tipo === 'E-mail')?.valor || clienteData.email;
  
  if (!email) return;

  const template = TEMPLATES_EMAIL.NF_EMITIDA;
  
  return await enviarEmail({
    empresaId,
    destinatario: email,
    destinatario_nome: clienteData.nome,
    assunto: processarTemplate(template.assunto, {
      numero: nfe.numero
    }),
    mensagem: processarTemplate(template.corpo, {
      cliente_nome: clienteData.nome,
      numero: nfe.numero,
      serie: nfe.serie,
      chave_acesso: nfe.chave_acesso || 'Aguardando autorização',
      valor_total: (nfe.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      pdf_danfe: nfe.pdf_danfe || '#',
      xml_nfe: nfe.xml_nfe || '#'
    }),
    tipo_conteudo: 'html'
  });
}

export default {
  enviarEmail,
  notificarPedidoAprovado,
  notificarBoletoGerado,
  notificarNFeEmitida,
  verificarConfiguracao,
  TEMPLATES_EMAIL
};