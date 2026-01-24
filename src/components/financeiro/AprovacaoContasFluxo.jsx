import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import usePermissions from '@/components/lib/usePermissions';
import useContextoVisual from '@/components/lib/useContextoVisual';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

/**
 * APROVAÇÃO CONTAS FLUXO - Interface de fluxo de aprovação financeiro
 * ETAPA 2: Status progression com validações
 */

export default function AprovacaoContasFluxo({ entityName = 'ContaPagar' }) {
  const [contas, setContas] = useState([]);
  const [filtro, setFiltro] = useState('pendente');
  const { canApprove } = usePermissions();
  const { filterInContext } = useContextoVisual();

  useEffect(() => {
    const carregarContas = async () => {
      try {
        const criterios = filtro === 'todas' ? {} : { status_pagamento: filtro };
        const dados = await filterInContext(entityName, criterios, '-data_vencimento', 20);
        setContas(dados);
      } catch (err) {
        console.error('Erro ao carregar contas:', err);
      }
    };

    carregarContas();
  }, [filtro, entityName]);

  const handleAprovar = async (conta) => {
    try {
      await base44.entities[entityName].update(conta.id, {
        status_pagamento: 'Aprovado',
        aprovado_por: (await base44.auth.me()).full_name,
        data_aprovacao: new Date().toISOString()
      });

      setContas(contas.map(c => c.id === conta.id ? { ...c, status_pagamento: 'Aprovado' } : c));
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const handleRejeitar = async (conta) => {
    const motivo = prompt('Motivo da rejeição:');
    if (!motivo) return;

    try {
      await base44.entities[entityName].update(conta.id, {
        status_pagamento: 'Rejeitado',
        motivo_rejeicao: motivo
      });

      setContas(contas.map(c => c.id === conta.id ? { ...c, status_pagamento: 'Rejeitado' } : c));
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Aprovado':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'Rejeitado':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl h-full overflow-auto">
      <h2 className="text-2xl font-bold text-slate-900">Fluxo de Aprovação</h2>

      {/* Filtros */}
      <div className="flex gap-2">
        {['pendente', 'Aprovado', 'Rejeitado', 'todas'].map(status => (
          <Button
            key={status}
            onClick={() => setFiltro(status)}
            variant={filtro === status ? 'default' : 'outline'}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Lista de Contas */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {contas.map(conta => (
          <Card key={conta.id} className="border-l-4 border-l-blue-600">
            <CardContent className="pt-4 grid grid-cols-4 gap-4 items-center">
              <div>
                <span className="text-sm text-slate-600">Descrição</span>
                <p className="font-semibold">{conta.descricao}</p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Valor</span>
                <p className="font-bold">R$ {conta.valor?.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Vencimento</span>
                <p>{conta.data_vencimento}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(conta.status_pagamento)}
                <Badge className={
                  conta.status_pagamento === 'Aprovado' ? 'bg-green-600' :
                  conta.status_pagamento === 'Rejeitado' ? 'bg-red-600' :
                  'bg-yellow-600'
                }>
                  {conta.status_pagamento}
                </Badge>
              </div>
            </CardContent>
            {canApprove('Financeiro', 'ContasReceber') && conta.status_pagamento === 'Aguardando Aprovação' && (
              <div className="flex gap-2 p-4 border-t">
                <Button
                  onClick={() => handleAprovar(conta)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  ✅ Aprovar
                </Button>
                <Button
                  onClick={() => handleRejeitar(conta)}
                  variant="outline"
                  className="flex-1"
                >
                  ❌ Rejeitar
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}