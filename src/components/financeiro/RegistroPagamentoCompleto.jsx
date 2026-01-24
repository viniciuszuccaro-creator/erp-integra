import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { CreditCard, DollarSign } from 'lucide-react';

/**
 * REGISTRO PAGAMENTO COMPLETO - Interface de 3 estágios
 * ETAPA 2: Recebido → Compensado → Conciliado
 */

export default function RegistroPagamentoCompleto({ contaId, entityName = 'ContaReceber' }) {
  const [conta, setConta] = React.useState(null);
  const [etapa, setEtapa] = useState('recebimento');
  const [dados, setDados] = useState({
    forma_pagamento: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    valor_bruto: 0,
    taxa: 0,
    valor_liquido: 0
  });

  React.useEffect(() => {
    const carregarConta = async () => {
      const c = await base44.entities[entityName].get(contaId);
      setConta(c);
      setDados(d => ({ ...d, valor_bruto: c.valor }));
    };
    carregarConta();
  }, [contaId, entityName]);

  const handleReceber = async () => {
    try {
      const valorLiquido = dados.valor_bruto - (dados.valor_bruto * dados.taxa / 100);
      await base44.entities[entityName].update(contaId, {
        status_compensacao: 'Aguardando',
        data_recebido_caixa: dados.data_pagamento,
        valor_bruto: dados.valor_bruto,
        taxa_operadora: dados.taxa,
        valor_liquido: valorLiquido,
        forma_pagamento: dados.forma_pagamento
      });
      setEtapa('compensacao');
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const handleCompensar = async () => {
    try {
      await base44.entities[entityName].update(contaId, {
        status_compensacao: 'Compensado',
        data_compensado_banco: new Date().toISOString().split('T')[0]
      });
      setEtapa('conciliacao');
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const handleConciliar = async () => {
    try {
      await base44.entities[entityName].update(contaId, {
        status: 'Recebido',
        status_compensacao: 'Conciliado',
        data_pagamento: dados.data_pagamento
      });
      alert('Pagamento conciliado com sucesso!');
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-green-50 rounded-xl">
      <h2 className="text-xl font-bold text-slate-900">Registro de Pagamento</h2>

      {conta && (
        <Card className="border-2 border-green-300">
          <CardContent className="pt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Descrição</span>
              <p className="font-semibold">{conta.descricao}</p>
            </div>
            <div>
              <span className="text-slate-600">Valor Total</span>
              <p className="font-bold">R$ {conta.valor?.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ESTÁGIO 1: Recebimento */}
      {(etapa === 'recebimento' || etapa === 'compensacao' || etapa === 'conciliacao') && (
        <Card className={`border-2 ${etapa === 'recebimento' ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4" /> Estágio 1: Recebimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <input
              type="text"
              placeholder="Forma de pagamento"
              value={dados.forma_pagamento}
              onChange={(e) => setDados({...dados, forma_pagamento: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded"
              disabled={etapa !== 'recebimento'}
            />
            <input
              type="date"
              value={dados.data_pagamento}
              onChange={(e) => setDados({...dados, data_pagamento: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded"
              disabled={etapa !== 'recebimento'}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-600">Valor Bruto</span>
                <p className="font-bold">R$ {dados.valor_bruto.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-slate-600">Taxa %</span>
                <input
                  type="number"
                  value={dados.taxa}
                  onChange={(e) => setDados({...dados, taxa: parseFloat(e.target.value)})}
                  className="w-full p-1 border border-slate-300 rounded text-sm"
                  disabled={etapa !== 'recebimento'}
                />
              </div>
            </div>
            <div>
              <span className="text-slate-600">Valor Líquido</span>
              <p className="font-bold">R$ {(dados.valor_bruto - (dados.valor_bruto * dados.taxa / 100)).toFixed(2)}</p>
            </div>
            {etapa === 'recebimento' && (
              <Button onClick={handleReceber} className="w-full bg-blue-600 hover:bg-blue-700">
                ✅ Registrar Recebimento
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ESTÁGIO 2: Compensação */}
      {(etapa === 'compensacao' || etapa === 'conciliacao') && (
        <Card className={`border-2 ${etapa === 'compensacao' ? 'border-yellow-300 bg-yellow-50' : 'border-slate-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4" /> Estágio 2: Compensação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-slate-600">Aguardando compensação no banco...</p>
            {etapa === 'compensacao' && (
              <Button onClick={handleCompensar} className="w-full bg-yellow-600 hover:bg-yellow-700">
                ✅ Marcar como Compensado
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ESTÁGIO 3: Conciliação */}
      {etapa === 'conciliacao' && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm">Estágio 3: Conciliação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-green-700 font-semibold">Pagamento compensado! Finalize a conciliação.</p>
            <Button onClick={handleConciliar} className="w-full bg-green-600 hover:bg-green-700">
              ✅ Finalizar Conciliação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}