import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { converterParaKG } from "@/components/lib/CalculadoraUnidades";

/**
 * V22.0 - Gerar PDF de Orçamento
 * COM: Conversão de Unidades + Seção de Produção em KG
 */
export default function GerarPDFOrcamento({ pedido, cliente }) {
  
  const gerarPDF = () => {
    // Preparar dados
    const itensRevenda = pedido.itens_revenda || [];
    const itensArmado = pedido.itens_armado_padrao || [];
    const itensCorte = pedido.itens_corte_dobra || [];

    // V22.0: Consolidar materiais em KG
    const materiaisKG = {};
    
    [...itensArmado, ...itensCorte].forEach(item => {
      const bitola = item.bitola_principal || item.ferro_principal_bitola || 'Indefinido';
      const pesoKG = item.peso_total_kg || 0;
      
      if (!materiaisKG[bitola]) {
        materiaisKG[bitola] = 0;
      }
      materiaisKG[bitola] += pesoKG;

      // Arame
      if (item.arame_recozido_kg > 0) {
        if (!materiaisKG['Arame Recozido']) {
          materiaisKG['Arame Recozido'] = 0;
        }
        materiaisKG['Arame Recozido'] += item.arame_recozido_kg;
      }
    });

    // Gerar HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Orçamento ${pedido.numero_pedido}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
    .header p { color: #64748b; margin: 5px 0; }
    .section { margin: 30px 0; }
    .section-title { 
      background: linear-gradient(to right, #3b82f6, #8b5cf6); 
      color: white; 
      padding: 12px 20px; 
      border-radius: 8px; 
      font-size: 16px; 
      font-weight: bold; 
      margin-bottom: 15px;
    }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th { background: #f1f5f9; padding: 12px; text-align: left; border: 1px solid #cbd5e1; font-size: 11px; color: #475569; }
    td { padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; }
    .total-row { background: #f8fafc; font-weight: bold; }
    .destaque { background: #dbeafe; font-weight: bold; }
    .materiais-box { 
      background: #fef3c7; 
      border: 2px solid #f59e0b; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0; 
    }
    .materiais-box h3 { color: #92400e; margin-top: 0; }
    .materiais-box table { background: white; }
    .footer { 
      margin-top: 50px; 
      padding-top: 20px; 
      border-top: 2px solid #e2e8f0; 
      text-align: center; 
      color: #64748b; 
      font-size: 11px; 
    }
    .badge { 
      display: inline-block; 
      padding: 4px 8px; 
      background: #e0e7ff; 
      color: #3730a3; 
      border-radius: 4px; 
      font-size: 10px; 
      font-weight: bold; 
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ORÇAMENTO</h1>
    <p>Nº ${pedido.numero_pedido}</p>
    <p>Data: ${new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</p>
  </div>

  <div class="section">
    <div class="section-title">📋 Dados do Cliente</div>
    <table>
      <tr>
        <td><strong>Nome:</strong></td>
        <td>${cliente?.nome || pedido.cliente_nome}</td>
      </tr>
      <tr>
        <td><strong>CNPJ/CPF:</strong></td>
        <td>${cliente?.cnpj || cliente?.cpf || pedido.cliente_cpf_cnpj || 'N/A'}</td>
      </tr>
      <tr>
        <td><strong>Endereço:</strong></td>
        <td>${cliente?.endereco_principal?.logradouro || 'N/A'}, ${cliente?.endereco_principal?.numero || ''} - ${cliente?.endereco_principal?.cidade || ''}</td>
      </tr>
    </table>
  </div>

  ${itensRevenda.length > 0 ? `
  <div class="section">
    <div class="section-title">🛒 Itens de Revenda</div>
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th style="text-align: center;">Quantidade</th>
          <th style="text-align: center;">Unidade</th>
          <th style="text-align: center;">Equivalente (KG)</th>
          <th style="text-align: right;">Valor Unit.</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itensRevenda.map(item => {
          const pesoKG = item.unidade !== 'KG' 
            ? converterParaKG(item.quantidade, item.unidade, item)
            : item.quantidade;
          
          return `
            <tr>
              <td>${item.descricao}</td>
              <td style="text-align: center;">${item.quantidade}</td>
              <td style="text-align: center;">${item.unidade}</td>
              <td style="text-align: center;" class="destaque">≈ ${pesoKG.toFixed(2)} KG</td>
              <td style="text-align: right;">R$ ${(item.valor_unitario || 0).toFixed(2)}</td>
              <td style="text-align: right;">R$ ${(item.valor_item || 0).toFixed(2)}</td>
            </tr>
          `;
        }).join('')}
        <tr class="total-row">
          <td colspan="5" style="text-align: right;">Subtotal Revenda:</td>
          <td style="text-align: right;">R$ ${itensRevenda.reduce((s, i) => s + (i.valor_item || 0), 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  ` : ''}

  ${(itensArmado.length > 0 || itensCorte.length > 0) ? `
  <div class="section">
    <div class="section-title">🏭 PRODUÇÃO (Armado + Corte/Dobra)</div>
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th style="text-align: center;">Qtd Peças</th>
          <th style="text-align: center;">Bitola</th>
          <th style="text-align: center;">Peso Aço (KG)</th>
          <th style="text-align: center;">Arame (KG)</th>
          <th style="text-align: right;">Valor Total</th>
        </tr>
      </thead>
      <tbody>
        ${itensArmado.map(item => `
          <tr>
            <td>${item.descricao_automatica || item.tipo_peca} <span class="badge">ARMADO</span></td>
            <td style="text-align: center;">${item.quantidade}</td>
            <td style="text-align: center;">${item.bitola_principal}</td>
            <td style="text-align: center;" class="destaque">${(item.peso_total_kg || 0).toFixed(2)}</td>
            <td style="text-align: center;">${(item.arame_recozido_kg || 0).toFixed(2)}</td>
            <td style="text-align: right;">R$ ${(item.preco_venda_total || 0).toFixed(2)}</td>
          </tr>
        `).join('')}
        ${itensCorte.map(item => `
          <tr>
            <td>${item.descricao_automatica || `${item.tipo_peca} ${item.identificador}`} <span class="badge">C/D</span></td>
            <td style="text-align: center;">${item.quantidade}</td>
            <td style="text-align: center;">${item.ferro_principal_bitola || item.bitola_principal}</td>
            <td style="text-align: center;" class="destaque">${(item.peso_total_kg || 0).toFixed(2)}</td>
            <td style="text-align: center;">${(item.arame_recozido_kg || 0).toFixed(2)}</td>
            <td style="text-align: right;">R$ ${(item.preco_venda_total || 0).toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="5" style="text-align: right;">Subtotal Produção:</td>
          <td style="text-align: right;">R$ ${(
            [...itensArmado, ...itensCorte].reduce((s, i) => s + (i.preco_venda_total || 0), 0)
          ).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  ` : ''}

  ${Object.keys(materiaisKG).length > 0 ? `
  <div class="materiais-box">
    <h3>📊 Resumo de Materiais (KG) - Base para Produção</h3>
    <table>
      <thead>
        <tr>
          <th>Material</th>
          <th style="text-align: right;">Peso Total (KG)</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(materiaisKG).map(([material, peso]) => `
          <tr>
            <td>${material}</td>
            <td style="text-align: right;"><strong>${peso.toFixed(2)} kg</strong></td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td>TOTAL GERAL (KG):</td>
          <td style="text-align: right;">
            <strong>${Object.values(materiaisKG).reduce((s, p) => s + p, 0).toFixed(2)} kg</strong>
          </td>
        </tr>
      </tbody>
    </table>
    <p style="font-size: 11px; color: #78716c; margin-top: 10px;">
      ⚠️ Peso convertido automaticamente pela Regra V22.0 - Base para orçamento de matéria-prima
    </p>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">💰 Resumo Financeiro</div>
    <table>
      <tr>
        <td><strong>Valor dos Produtos:</strong></td>
        <td style="text-align: right;">R$ ${(pedido.valor_produtos || 0).toFixed(2)}</td>
      </tr>
      <tr>
        <td><strong>Frete:</strong></td>
        <td style="text-align: right;">R$ ${(pedido.valor_frete || 0).toFixed(2)}</td>
      </tr>
      <tr>
        <td><strong>Desconto:</strong></td>
        <td style="text-align: right; color: #dc2626;">- R$ ${(pedido.desconto_geral_pedido_valor || 0).toFixed(2)}</td>
      </tr>
      <tr class="destaque" style="font-size: 16px;">
        <td><strong>VALOR TOTAL:</strong></td>
        <td style="text-align: right;"><strong>R$ ${(pedido.valor_total || 0).toFixed(2)}</strong></td>
      </tr>
    </table>
  </div>

  <div class="section">
    <p><strong>Forma de Pagamento:</strong> ${pedido.forma_pagamento || 'À Vista'}</p>
    <p><strong>Prazo de Entrega:</strong> ${pedido.data_prevista_entrega ? new Date(pedido.data_prevista_entrega).toLocaleDateString('pt-BR') : 'A combinar'}</p>
    <p><strong>Validade do Orçamento:</strong> ${pedido.data_validade ? new Date(pedido.data_validade).toLocaleDateString('pt-BR') : '7 dias'}</p>
  </div>

  ${pedido.observacoes_publicas ? `
  <div class="section">
    <div class="section-title">📝 Observações</div>
    <p>${pedido.observacoes_publicas}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Documento gerado automaticamente pelo ERP Zuccaro v22.0</p>
    <p>Conversão de Unidades Automática - Regra Mestra V22.0 Ativa</p>
    <p>${new Date().toLocaleString('pt-BR')}</p>
  </div>
</body>
</html>
    `;

    // Criar blob e download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Orcamento_${pedido.numero_pedido}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={gerarPDF}
      variant="outline"
      className="border-green-600 text-green-600 hover:bg-green-50"
    >
      <FileText className="w-4 h-4 mr-2" />
      Gerar PDF Orçamento (V22.0)
    </Button>
  );
}