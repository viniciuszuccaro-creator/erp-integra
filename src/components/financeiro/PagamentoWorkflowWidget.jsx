import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

export default function PagamentoWorkflowWidget({ titulo, entity = 'ContaPagar' }) {
  const [forma, setForma] = useState('Transferência');
  const [valor, setValor] = useState(titulo?.valor || 0);

  const solicitar = async () => {
    await base44.functions.invoke('pagamentoWorkflow', { entity, id: titulo.id, action: 'solicitar_aprovacao' });
  };
  const aprovar = async () => {
    await base44.functions.invoke('pagamentoWorkflow', { entity, id: titulo.id, action: 'aprovar' });
  };
  const pagar = async () => {
    await base44.functions.invoke('pagamentoWorkflow', { entity, id: titulo.id, action: 'pagar', payload: { forma_pagamento: forma, valor_pago: Number(valor) } });
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Fluxo de Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" onClick={solicitar}>Solicitar Aprovação</Button>
        <Button onClick={aprovar}>Aprovar</Button>
        <Select value={forma} onValueChange={setForma}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Forma" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Transferência">Transferência</SelectItem>
            <SelectItem value="PIX">PIX</SelectItem>
            <SelectItem value="Boleto">Boleto</SelectItem>
            <SelectItem value="Cartão">Cartão</SelectItem>
          </SelectContent>
        </Select>
        <Input className="w-32" type="number" value={valor} onChange={(e) => setValor(e.target.value)} />
        <Button variant="secondary" onClick={pagar}>Registrar Pagamento</Button>
      </CardContent>
    </Card>
  );
}