/**
 * Impressão de Boleto/Recibo
 * V21.4 - Template para impressão de boletos e comprovantes
 */
export const ImprimirBoleto = ({ conta, empresa, tipo = 'receber' }) => {
  const conteudo = `
    <html>
      <head>
        <title>${tipo === 'receber' ? 'Boleto' : 'Comprovante'} - ${conta.numero_documento || conta.descricao}</title>
        <style>
          @media print { @page { margin: 1.5cm; } }
          body { font-family: Arial, sans-serif; font-size: 11px; }
          .header { 
            border: 2px solid #000;
            padding: 15px;
            margin-bottom: 15px;
          }
          .empresa { font-size: 16px; font-weight: bold; }
          .titulo-doc { 
            font-size: 22px; 
            font-weight: bold; 
            text-align: center;
            margin: 15px 0;
            padding: 10px;
            background: ${tipo === 'receber' ? '#dcfce7' : '#fee2e2'};
            color: ${tipo === 'receber' ? '#059669' : '#dc2626'};
          }
          .info-box { 
            border: 1px solid #000; 
            padding: 12px; 
            margin: 10px 0;
          }
          .linha-digitavel {
            font-family: monospace;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            padding: 15px;
            background: #f8fafc;
            border: 2px dashed #000;
            margin: 20px 0;
          }
          .valor-destaque {
            background: ${tipo === 'receber' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
          }
          .instrucoes {
            font-size: 10px;
            border: 1px solid #000;
            padding: 10px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="empresa">${empresa?.nome_fantasia || empresa?.razao_social || 'Empresa'}</div>
          <div>CNPJ: ${empresa?.cnpj || ''}</div>
          <div>${empresa?.endereco_fiscal_principal?.logradouro || ''}, ${empresa?.endereco_fiscal_principal?.numero || ''}</div>
          <div>${empresa?.endereco_fiscal_principal?.cidade || ''}/${empresa?.endereco_fiscal_principal?.estado || ''} - CEP ${empresa?.endereco_fiscal_principal?.cep || ''}</div>
        </div>

        <div class="titulo-doc">
          ${tipo === 'receber' ? '📄 BOLETO BANCÁRIO / COBRANÇA' : '💸 COMPROVANTE DE PAGAMENTO'}
        </div>

        <div class="info-box">
          <strong>${tipo === 'receber' ? 'PAGADOR' : 'BENEFICIÁRIO'}:</strong><br>
          <div style="font-size: 14px; margin-top: 5px;">${tipo === 'receber' ? conta.cliente : conta.fornecedor}</div>
          ${conta.cliente_cpf_cnpj || conta.favorecido_cpf_cnpj ? `
            <div>CPF/CNPJ: ${conta.cliente_cpf_cnpj || conta.favorecido_cpf_cnpj}</div>
          ` : ''}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
          <div class="info-box">
            <strong>Nº Documento:</strong> ${conta.numero_documento || 'Não informado'}<br>
            <strong>Data Emissão:</strong> ${new Date(conta.data_emissao).toLocaleDateString('pt-BR')}<br>
            <strong>Vencimento:</strong> ${new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
          </div>
          <div class="info-box">
            <strong>Descrição:</strong><br>
            ${conta.descricao}
          </div>
        </div>

        ${conta.linha_digitavel || conta.boleto_linha_digitavel ? `
          <div class="linha-digitavel">
            ${conta.linha_digitavel || conta.boleto_linha_digitavel}
          </div>
        ` : ''}

        ${conta.pix_copia_cola ? `
          <div style="border: 2px solid #10b981; padding: 15px; margin: 15px 0; text-align: center;">
            <strong style="color: #059669;">PIX COPIA E COLA</strong><br>
            <code style="font-size: 10px; word-break: break-all;">${conta.pix_copia_cola}</code>
          </div>
        ` : ''}

        <div class="valor-destaque">
          ${tipo === 'receber' ? 'VALOR A RECEBER' : 'VALOR PAGO'}: R$ ${(tipo === 'receber' ? conta.valor : (conta.valor_pago || conta.valor))?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>

        ${conta.juros > 0 || conta.multa > 0 || conta.desconto > 0 ? `
          <div class="info-box">
            <strong>Detalhamento:</strong><br>
            Valor Original: R$ ${conta.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
            ${conta.juros > 0 ? `Juros: R$ ${conta.juros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>` : ''}
            ${conta.multa > 0 ? `Multa: R$ ${conta.multa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>` : ''}
            ${conta.desconto > 0 ? `Desconto: R$ ${conta.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>` : ''}
          </div>
        ` : ''}

        ${tipo === 'receber' ? `
          <div class="instrucoes">
            <strong>INSTRUÇÕES:</strong><br>
            • Pagamento via ${conta.forma_cobranca || 'A definir'}<br>
            • Após o vencimento, multa de 2% + juros de 0,033% ao dia<br>
            • Em caso de dúvidas, entre em contato pelo telefone da empresa
          </div>
        ` : `
          <div class="instrucoes">
            <strong>COMPROVANTE DE PAGAMENTO:</strong><br>
            • Forma de Pagamento: ${conta.forma_pagamento || 'Não informada'}<br>
            • Data de Pagamento: ${conta.data_pagamento ? new Date(conta.data_pagamento).toLocaleDateString('pt-BR') : 'Pendente'}<br>
            • Categoria: ${conta.categoria || 'Não especificada'}
          </div>
        `}

        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #64748b;">
          Documento emitido em ${new Date().toLocaleString('pt-BR')}<br>
          ERP Zuccaro V21.4 GOLD - Sistema de Gestão Integrada
        </div>
      </body>
    </html>
  `;

  const janela = window.open('', '_blank');
  janela.document.write(conteudo);
  janela.document.close();
  janela.print();
};

export default ImprimirBoleto;