import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V21.5 - EXPORTAÇÃO DE CONVERSAS
 * Exportar histórico completo para análise
 */
export default function ExportarConversas() {
  const { empresaAtual, filtrarPorContexto } = useContextoVisual();

  const { data: conversas = [] } = useQuery({
    queryKey: ['conversas-export', empresaAtual?.id],
    queryFn: async () => {
      return await base44.entities.ConversaOmnicanal.list();
    },
    select: (data) => filtrarPorContexto(data, 'empresa_id')
  });

  const exportarCSV = () => {
    const headers = ['ID', 'Cliente', 'Canal', 'Status', 'Intent', 'Sentimento', 'Data Início', 'Data Fim', 'Mensagens', 'CSAT'];
    const rows = conversas.map(c => [
      c.id,
      c.cliente_nome || '-',
      c.canal,
      c.status,
      c.intent_principal || '-',
      c.sentimento_geral || '-',
      new Date(c.data_inicio).toLocaleString('pt-BR'),
      c.data_finalizacao ? new Date(c.data_finalizacao).toLocaleString('pt-BR') : '-',
      c.total_mensagens || 0,
      c.score_satisfacao || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('Arquivo CSV exportado!');
  };

  const exportarJSON = () => {
    const blob = new Blob([JSON.stringify(conversas, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversas-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    toast.success('Arquivo JSON exportado!');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          Exportar Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600">
          {conversas.length} conversa(s) disponível(is) para exportação
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={exportarCSV} variant="outline" className="w-full">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button onClick={exportarJSON} variant="outline" className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}