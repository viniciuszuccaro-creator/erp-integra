import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye } from 'lucide-react';
import { useUser } from '@/components/lib/UserContext';

/**
 * ETAPA 3: Notas Fiscais do Cliente
 * Acesso direto a NF-e XML e DANFE
 */

export default function NotasFiscaisCliente() {
  const { user } = useUser();

  const { data: cliente } = useQuery({
    queryKey: ['cliente', user?.email],
    queryFn: async () => {
      const clientes = await base44.entities.Cliente.filter({
        portal_usuario_id: user?.id
      });
      return clientes?.[0] || null;
    },
    enabled: !!user?.id
  });

  const { data: notasFiscais = [], isLoading } = useQuery({
    queryKey: ['notas-fiscais', 'cliente', cliente?.id],
    queryFn: () => base44.entities.NotaFiscal.filter({
      cliente_fornecedor_id: cliente?.id,
      tipo: 'NF-e (Saída)'
    }, '-data_emissao', 100),
    enabled: !!cliente?.id
  });

  const statusCores = {
    'Autorizada': 'bg-green-600',
    'Processando': 'bg-yellow-600',
    'Cancelada': 'bg-red-600',
    'Rejeitada': 'bg-red-600'
  };

  return (
    <div className="w-full h-full space-y-4 p-4 overflow-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Minhas Notas Fiscais</h2>
        <p className="text-slate-600">XML, DANFE e documentos fiscais</p>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-center text-slate-500">Carregando...</p>}

        {notasFiscais.map(nf => (
          <Card key={nf.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">NF-e {nf.numero} / {nf.serie}</CardTitle>
                  <p className="text-sm text-slate-600">
                    {new Date(nf.data_emissao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge className={statusCores[nf.status] || 'bg-slate-600'}>
                  {nf.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">Valor Total:</span>
                  <p className="font-bold text-green-700">
                    R$ {nf.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">CFOP:</span>
                  <p className="font-medium">{nf.cfop || 'N/A'}</p>
                </div>
              </div>

              {nf.chave_acesso && (
                <div className="bg-slate-50 p-2 rounded">
                  <p className="text-xs text-slate-600 mb-1">Chave de Acesso:</p>
                  <p className="font-mono text-xs break-all">{nf.chave_acesso}</p>
                </div>
              )}

              <div className="flex gap-2">
                {nf.xml_nfe && (
                  <Button
                    onClick={() => window.open(nf.xml_nfe, '_blank')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    XML
                  </Button>
                )}
                {nf.pdf_danfe && (
                  <Button
                    onClick={() => window.open(nf.pdf_danfe, '_blank')}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    DANFE
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {notasFiscais.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma nota fiscal encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}