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
 * Botão de Exportação Universal - V19.1
 * CSV nativo (sem dependências externas)
 */
export default function ExportButton({ data = [], filename = "export", columns = null }) {
  
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

    const headers = Object.keys(dadosExport[0]);
    const csvContent = [
      headers.join(';'),
      ...dadosExport.map(row => 
        headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(';')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast.success(`✅ ${data.length} registros exportados!`);
  };

  const exportToJSON = () => {
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

    const jsonContent = JSON.stringify(dadosExport, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast.success(`✅ ${data.length} registros exportados para JSON!`);
  };

  const exportToPDF = () => {
    toast.info('💡 Exportação PDF disponível em breve');
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
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="w-4 h-4 mr-2 text-blue-600" />
          JSON (.json)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} disabled>
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          PDF (em breve)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}