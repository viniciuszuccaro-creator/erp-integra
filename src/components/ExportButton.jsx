import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/**
 * Botão de Exportação Universal - V12.0
 * Com Excel REAL e PDF
 */
export default function ExportButton({ data = [], filename = "export", columns = null }) {
  const exportToExcel = async () => {
    try {
      // Importação dinâmica do xlsx
      const XLSX = await import('xlsx');
      
      if (!data || data.length === 0) {
        toast.error('Nenhum dado para exportar');
        return;
      }

      // Preparar dados
      const dadosExport = columns 
        ? data.map(row => {
            const obj = {};
            columns.forEach(col => {
              obj[col.header || col.key] = row[col.key];
            });
            return obj;
          })
        : data;

      // Criar planilha
      const ws = XLSX.utils.json_to_sheet(dadosExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');

      // Auto-ajustar largura das colunas
      const colWidths = Object.keys(dadosExport[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Gerar e baixar arquivo
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success(`✅ ${data.length} registros exportados para Excel!`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar para Excel');
    }
  };

  const exportToPDF = () => {
    toast.info('Exportação PDF em desenvolvimento');
    // Implementar com jsPDF ou similar
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const dadosExport = columns 
      ? data.map(row => {
          const obj = {};
          columns.forEach(col => {
            obj[col.header || col.key] = row[col.key];
          });
          return obj;
        })
      : data;

    // Cabeçalhos
    const headers = Object.keys(dadosExport[0]);
    const csvContent = [
      headers.join(';'),
      ...dadosExport.map(row => 
        headers.map(h => `"${row[h] || ''}"`).join(';')
      )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success(`✅ ${data.length} registros exportados para CSV!`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="w-4 h-4 mr-2 text-blue-600" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} disabled>
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          PDF (em breve)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}