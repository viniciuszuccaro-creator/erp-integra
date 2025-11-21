/**
 * Impressão de Ordem de Compra
 * V21.4 - Template profissional
 */
export const ImprimirOrdemCompra = ({ oc, empresa, fornecedor }) => {
  const conteudo = `
    <html>
      <head>
        <title>Ordem de Compra ${oc.numero_oc}</title>
        <style>
          @media print { @page { margin: 2cm; } }
          body { font-family: Arial, sans-serif; font-size: 12px; }
          .header { 
            display: flex; 
            justify-content: space-between; 
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .empresa { font-size: 18px; font-weight: bold; color: #1e40af; }
          .oc-numero { 
            font-size: 28px; 
            font-weight: bold; 
            color: #2563eb; 
            text-align: right;
          }
          .info-box { 
            background: #f1f5f9; 
            padding: 15px; 
            margin: 15px 0;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
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
          .totais { 
            text-align: right; 
            margin-top: 20px;
            font-size: 14px;
          }
          .totais strong { font-size: 18px; color: #2563eb; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #64748b;
          }
          .assinatura {
            margin-top: 60px;
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
            <div class="empresa">${empresa?.nome_fantasia || empresa?.razao_social || 'Empresa'}</div>
            <div>CNPJ: ${empresa?.cnpj || ''}</div>
            <div>${empresa?.endereco_fiscal_principal?.cidade || ''}, ${empresa?.endereco_fiscal_principal?.estado || ''}</div>
            <div>Tel: ${empresa?.telefone || ''}</div>
          </div>
          <div>
            <div style="font-size: 14px; font-weight: bold; color: #64748b;">ORDEM DE COMPRA</div>
            <div class="oc-numero">#${oc.numero_oc}</div>
            <div style="text-align: right;">Data: ${new Date(oc.data_solicitacao).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        <div class="info-box">
          <strong style="color: #1e40af;">FORNECEDOR:</strong><br>
          ${fornecedor?.razao_social || oc.fornecedor_nome}<br>
          ${fornecedor?.cnpj ? `CNPJ: ${fornecedor.cnpj}<br>` : ''}
          ${fornecedor?.endereco_principal?.logradouro ? `
            ${fornecedor.endereco_principal.logradouro}, ${fornecedor.endereco_principal.numero}<br>
            ${fornecedor.endereco_principal.cidade}/${fornecedor.endereco_principal.estado}
          ` : ''}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
          <div class="info-box">
            <strong>Condições:</strong><br>
            Pagamento: ${oc.forma_pagamento || '-'}<br>
            Condição: ${oc.condicao_pagamento || '-'}<br>
            Prazo Entrega: ${oc.prazo_entrega_acordado || '-'} dias
          </div>
          <div class="info-box">
            <strong>Previsões:</strong><br>
            Entrega Prevista: ${oc.data_entrega_prevista ? new Date(oc.data_entrega_prevista).toLocaleDateString('pt-BR') : 'Não definida'}<br>
            Aprovada em: ${oc.data_aprovacao ? new Date(oc.data_aprovacao).toLocaleDateString('pt-BR') : 'Pendente'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 8%;">Item</th>
              <th>Código</th>
              <th>Descrição</th>
              <th style="text-align: center; width: 10%;">Qtd</th>
              <th style="width: 8%;">Un</th>
              <th style="text-align: right; width: 15%;">Valor Unit.</th>
              <th style="text-align: right; width: 15%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(oc.itens || []).map((item, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td>${item.codigo_sku || item.produto_id || '-'}</td>
                <td>${item.descricao}</td>
                <td style="text-align: center;">${item.quantidade_solicitada} ${item.unidade || 'UN'}</td>
                <td>${item.unidade || 'UN'}</td>
                <td style="text-align: right;">R$ ${item.valor_unitario?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align: right;">R$ ${item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totais">
          <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #2563eb;">
            <strong>VALOR TOTAL: R$ ${oc.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        ${oc.observacoes ? `
          <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b;">
            <strong>Observações:</strong><br>
            ${oc.observacoes}
          </div>
        ` : ''}

        <div class="assinatura">
          <div class="linha-assinatura">
            <strong>Solicitante</strong><br>
            ${oc.solicitante || ''}
          </div>
          <div class="linha-assinatura">
            <strong>Aprovador</strong><br>
            ${oc.aprovador || ''}
          </div>
        </div>

        <div class="footer">
          ⚠️ ORDEM DE COMPRA - Documento válido para faturamento<br>
          Emitido em ${new Date().toLocaleString('pt-BR')}<br>
          ERP Zuccaro V21.4 GOLD - Sistema de Gestão Empresarial
        </div>
      </body>
    </html>
  `;

  const janela = window.open('', '_blank');
  janela.document.write(conteudo);
  janela.document.close();
  janela.print();
};

export default ImprimirOrdemCompra;