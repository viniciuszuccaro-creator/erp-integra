import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exportar para Excel - REAL
 * V12.0 - Funcional em todas as tabelas
 */

// Função principal de exportação
export const exportarParaExcel = (dados, nomeArquivo = 'dados', colunas = null) => {
  if (!dados || dados.length === 0) {
    throw new Error('Nenhum dado para exportar');
  }

  // Se colunas não forem especificadas, usar todas as chaves do primeiro objeto
  const colunasExportar = colunas || Object.keys(dados[0]);

  // Preparar dados para exportação
  const dadosFormatados = dados.map(item => {
    const linha = {};
    colunasExportar.forEach(col => {
      let valor = item[col];
      
      // Formatar valores especiais
      if (valor === null || valor === undefined) {
        linha[col] = '';
      } else if (typeof valor === 'object' && valor.toISOString) {
        // Data
        linha[col] = new Date(valor).toLocaleDateString('pt-BR');
      } else if (typeof valor === 'number') {
        // Número
        linha[col] = valor;
      } else if (typeof valor === 'boolean') {
        linha[col] = valor ? 'Sim' : 'Não';
      } else if (typeof valor === 'object') {
        // Objeto - tentar stringificar
        linha[col] = JSON.stringify(valor);
      } else {
        linha[col] = valor;
      }
    });
    return linha;
  });

  // Criar workbook
  const ws = XLSX.utils.json_to_sheet(dadosFormatados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');

  // Ajustar largura das colunas
  const colWidths = colunasExportar.map(col => ({
    wch: Math.max(col.length, 15)
  }));
  ws['!cols'] = colWidths;

  // Gerar arquivo
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });

  // Download
  const nomeComData = `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, nomeComData);
};

// Exportar com template customizado
export const exportarComTemplate = (dados, template, nomeArquivo) => {
  const ws = XLSX.utils.aoa_to_sheet(template.headers);
  
  // Adicionar dados
  XLSX.utils.sheet_add_json(ws, dados, { 
    origin: template.startRow || 'A2',
    skipHeader: true 
  });

  // Aplicar estilos (se suportado)
  if (template.styles) {
    Object.entries(template.styles).forEach(([cell, style]) => {
      if (!ws[cell]) ws[cell] = {};
      ws[cell].s = style;
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, template.sheetName || 'Dados');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });

  saveAs(blob, `${nomeArquivo}.xlsx`);
};

// Exportar múltiplas abas
export const exportarMultiplasAbas = (abas, nomeArquivo) => {
  const wb = XLSX.utils.book_new();

  abas.forEach(aba => {
    const ws = XLSX.utils.json_to_sheet(aba.dados);
    XLSX.utils.book_append_sheet(wb, ws, aba.nome);
  });

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });

  saveAs(blob, `${nomeArquivo}.xlsx`);
};