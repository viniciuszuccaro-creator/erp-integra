import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, FileText, User, Calendar, Building } from 'lucide-react';

/**
 * V22.0 ETAPA 4 - Critérios de Conciliação
 * Explica os diferentes critérios disponíveis
 */
export default function CriteriosConciliacao() {
  const criterios = [
    {
      nome: 'Por Pedido',
      icone: FileText,
      descricao: 'Concilia todos os títulos vinculados a um pedido específico',
      exemplo: 'Digite o ID do pedido para buscar',
      cor: 'bg-blue-100 text-blue-700'
    },
    {
      nome: 'Por NF-e',
      icone: FileText,
      descricao: 'Concilia títulos de uma nota fiscal específica',
      exemplo: 'Digite o ID da NF-e',
      cor: 'bg-purple-100 text-purple-700'
    },
    {
      nome: 'Por Cliente',
      icone: User,
      descricao: 'Concilia todos os recebimentos de um cliente',
      exemplo: 'Digite o nome do cliente',
      cor: 'bg-green-100 text-green-700'
    },
    {
      nome: 'Por Período',
      icone: Calendar,
      descricao: 'Concilia recebimentos em um intervalo de tempo',
      exemplo: 'Selecione: 7, 15, 30 ou 60 dias',
      cor: 'bg-orange-100 text-orange-700'
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-slate-900">Critérios de Conciliação Disponíveis</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {criterios.map((crit, idx) => {
            const Icone = crit.icone;
            return (
              <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${crit.cor}`}>
                    <Icone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{crit.nome}</h4>
                    <p className="text-sm text-slate-600 mb-2">{crit.descricao}</p>
                    <Badge variant="outline" className="text-xs">
                      {crit.exemplo}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}