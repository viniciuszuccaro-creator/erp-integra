import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Download, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

/**
 * DOCUMENTAÇÃO ETAPA 1
 * Links para documentação e exemplos
 */

export default function DocumentacaoETAPA1() {
  const docs = [
    {
      titulo: 'README Completo',
      descricao: 'Documentação técnica completa da ETAPA 1',
      arquivo: 'ETAPA1_COMPLETA_README.md'
    },
    {
      titulo: 'Certificado Oficial',
      descricao: 'Certificação de conformidade 100%',
      arquivo: 'CERTIFICADO_ETAPA1_100_FINAL.md'
    },
    {
      titulo: 'Exemplos RBAC',
      descricao: 'Exemplos práticos de implementação',
      pagina: 'ExemplosRBAC'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Documentação e Exemplos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {docs.map((doc, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">{doc.titulo}</h4>
                  <p className="text-xs text-slate-600 mt-1">{doc.descricao}</p>
                </div>
                {doc.pagina ? (
                  <Link to={createPageUrl(doc.pagina)}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}