
/**
 * Utilitário de Impressão
 */

// Template de Pedido
export function ImprimirPedido(pedido) {
  window.print();
}

// Template de Romaneio
export function ImprimirRomaneio(romaneio) {
  window.print();
}

// Template de NF-e (DANFE simplificado) - This function remains unchanged as per the instructions.
export const ImprimirDANFESimplificado = ({ nfe, empresa }) => {
  // Similar ao pedido, mas com layout de DANFE
  const conteudo = `
    <html>
      <head>
        <title>NF-e ${nfe.numero}/${nfe.serie}</title>
        <style>
          @media print { @page { margin: 1cm; } }
          body { font-family: Arial, sans-serif; font-size: 11px; }
          .danfe-header { 
            border: 2px solid #000;
            padding: 10px;
            margin-bottom: 10px;
          }
          .nfe-numero {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
          }
          .chave-acesso {
            font-family: monospace;
            font-size: 10px;
            text-align: center;
            margin: 10px 0;
          }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #e5e7eb; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="danfe-header">
          <div class="nfe-numero">NF-e Nº ${nfe.numero} - Série ${nfe.serie}</div>
          <div class="chave-acesso">${nfe.chave_acesso || 'Chave de Acesso: Aguardando autorização'}</div>
        </div>
        
        <div style="border: 1px solid #000; padding: 10px; margin: 10px 0;">
          <strong>EMITENTE:</strong> ${empresa?.razao_social || ''}<br>
          CNPJ: ${empresa?.cnpj || ''}<br>
          ${empresa?.endereco?.logradouro || ''}, ${empresa?.endereco?.numero || ''} - ${empresa?.endereco?.cidade || ''}/${empresa?.endereco?.estado || ''}
        </div>

        <div style="border: 1px solid #000; padding: 10px; margin: 10px 0;">
          <strong>DESTINATÁRIO:</strong> ${nfe.cliente_fornecedor || ''}<br>
          ${nfe.cliente_cpf_cnpj ? `CPF/CNPJ: ${nfe.cliente_cpf_cnpj}` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Cód</th>
              <th>Descrição</th>
              <th>NCM</th>
              <th>Qtd</th>
              <th>Un</th>
              <th>Vl Unit</th>
              <th>Vl Total</th>
            </tr>
          </thead>
          <tbody>
            ${(nfe.itens || []).map(item => `
              <tr>
                <td>${item.codigo_produto || ''}</td>
                <td>${item.descricao}</td>
                <td>${item.ncm || ''}</td>
                <td style="text-align: right;">${item.quantidade}</td>
                <td>${item.unidade}</td>
                <td style="text-align: right;">R$ ${item.valor_unitario?.toFixed(2)}</td>
                <td style="text-align: right;">R$ ${item.valor_total?.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px; font-size: 14px;">
          <div>Valor Total: <strong style="font-size: 18px;">R$ ${nfe.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 10px;">
          ${nfe.status === 'Autorizada' ? 
            `✅ NF-e AUTORIZADA - Protocolo: ${nfe.protocolo_autorizacao || ''}` :
            `⚠️ NF-e em ${nfe.status}`
          }
        </div>
      </body>
    </html>
  `;

  const janela = window.open('', '_blank');
  janela.document.write(conteudo);
  janela.document.close();
  janela.print();
};

export function ImprimirRelatorio(dados) {
  window.print();
}
