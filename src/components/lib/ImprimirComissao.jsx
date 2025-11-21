/**
 * Impressão de Relatório de Comissão
 * V21.4 - Template profissional para comprovante de comissão
 */
export const ImprimirComissao = ({ comissao, empresa, pedidos = [] }) => {
  const conteudo = `
    <html>
      <head>
        <title>Comissão - ${comissao.vendedor}</title>
        <style>
          @media print { @page { margin: 2cm; } }
          body { font-family: Arial, sans-serif; font-size: 12px; }
          .header { 
            display: flex; 
            justify-content: space-between; 
            border-bottom: 3px solid #7c3aed;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .empresa { font-size: 18px; font-weight: bold; color: #6d28d9; }
          .comissao-titulo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #7c3aed; 
            text-align: right;
          }
          .vendedor-box { 
            background: #f5f3ff; 
            padding: 15px; 
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid #7c3aed;
          }
          .valor-destaque {
            background: #10b981;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
          }
          th { 
            background: #1e293b; 
            color: white; 
            padding: 10px; 
            text-align: left;
          }
          td { 
            border-bottom: 1px solid #e2e8f0; 
            padding: 10px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #64748b;
          }
          .assinatura {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .linha-assinatura {
            width: 45%;
            border-top: 2px solid #000;
            padding-top: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="empresa">${empresa?.nome_fantasia || 'Empresa'}</div>
            <div>CNPJ: ${empresa?.cnpj || ''}</div>
            <div>${empresa?.endereco_fiscal_principal?.cidade || ''}, ${empresa?.endereco_fiscal_principal?.estado || ''}</div>
          </div>
          <div>
            <div class="comissao-titulo">💰 COMISSÃO</div>
            <div style="text-align: right;">Data: ${new Date(comissao.data_venda).toLocaleDateString('pt-BR')}</div>
            <div style="text-align: right;">Status: <strong>${comissao.status}</strong></div>
          </div>
        </div>

        <div class="vendedor-box">
          <strong style="font-size: 16px;">VENDEDOR:</strong><br>
          <div style="font-size: 18px; margin-top: 8px;">${comissao.vendedor}</div>
          ${comissao.vendedor_id ? `<div style="font-size: 11px; color: #64748b;">ID: ${comissao.vendedor_id}</div>` : ''}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0;">
          <div style="background: #eff6ff; padding: 15px; border-radius: 6px; text-align: center;">
            <div style="color: #3b82f6; font-size: 11px;">VALOR VENDAS</div>
            <div style="font-size: 20px; font-weight: bold; color: #1e40af;">
              R$ ${comissao.valor_venda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; text-align: center;">
            <div style="color: #f59e0b; font-size: 11px;">PERCENTUAL</div>
            <div style="font-size: 20px; font-weight: bold; color: #d97706;">
              ${comissao.percentual_comissao}%
            </div>
          </div>
          <div style="background: #dcfce7; padding: 15px; border-radius: 6px; text-align: center;">
            <div style="color: #10b981; font-size: 11px;">COMISSÃO</div>
            <div style="font-size: 24px; font-weight: bold; color: #059669;">
              R$ ${comissao.valor_comissao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div style="margin: 25px 0; padding: 15px; background: #f8fafc; border-radius: 6px;">
          <strong>Período/Pedido:</strong> ${comissao.numero_pedido}<br>
          <strong>Cliente(s):</strong> ${comissao.cliente}
        </div>

        ${comissao.observacoes ? `
          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b;">
            <strong>Observações:</strong><br>
            ${comissao.observacoes}
          </div>
        ` : ''}

        ${comissao.status === 'Aprovada' && comissao.aprovador ? `
          <div style="margin-top: 20px; padding: 15px; background: #dcfce7; border-left: 4px solid #10b981;">
            <strong>✅ APROVAÇÃO:</strong><br>
            Aprovado por: ${comissao.aprovador}<br>
            Data: ${comissao.data_aprovacao ? new Date(comissao.data_aprovacao).toLocaleDateString('pt-BR') : '-'}
          </div>
        ` : ''}

        ${comissao.status === 'Paga' && comissao.data_pagamento ? `
          <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-left: 4px solid #3b82f6;">
            <strong>💵 PAGAMENTO:</strong><br>
            Pago em: ${new Date(comissao.data_pagamento).toLocaleDateString('pt-BR')}
          </div>
        ` : ''}

        <div class="assinatura">
          <div class="linha-assinatura">
            <strong>Vendedor</strong><br>
            ${comissao.vendedor}
          </div>
          <div class="linha-assinatura">
            <strong>Aprovador/Gestor</strong><br>
            ${comissao.aprovador || '_______________________'}
          </div>
        </div>

        <div class="footer">
          Comprovante de Comissão - Documento de Controle Interno<br>
          Emitido em ${new Date().toLocaleString('pt-BR')}<br>
          ERP Zuccaro V21.4 GOLD
        </div>
      </body>
    </html>
  `;

  const janela = window.open('', '_blank');
  janela.document.write(conteudo);
  janela.document.close();
  janela.print();
};

export default ImprimirComissao;