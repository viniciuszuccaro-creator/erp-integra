import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import useContextoVisual from '@/components/lib/useContextoVisual';
import { CheckCircle2 } from 'lucide-react';

/**
 * CRIAR ORÇAMENTO - Etapa 1 do fluxo BPMN (Oportunidade → OrcamentoCliente)
 * ETAPA 2: Componente modular e responsivo
 */

export default function CriarOrcamento({ oportunidade, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { carimbarContexto } = useContextoVisual();

  const handleCriar = async () => {
    setLoading(true);
    try {
      const orcamento = await base44.entities.OrcamentoCliente.create(
        carimbarContexto({
          oportunidade_id: oportunidade.id,
          cliente_id: oportunidade.cliente_id,
          cliente_nome: oportunidade.cliente_nome,
          titulo: `Orçamento - ${oportunidade.titulo}`,
          descricao: oportunidade.descricao,
          valor_total: oportunidade.valor_estimado,
          status: 'rascunho'
        })
      );

      await base44.entities.Oportunidade.update(oportunidade.id, { etapa: 'Proposta' });
      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me()).full_name,
        usuario_id: (await base44.auth.me()).id,
        empresa_id: oportunidade.empresa_id,
        acao: 'Transição BPMN',
        modulo: 'Comercial',
        entidade: 'OrcamentoCliente',
        registro_id: orcamento.id,
        descricao: `Orçamento criado de oportunidade ${oportunidade.id}`,
        data_hora: new Date().toISOString(),
        sucesso: true
      });

      onSuccess?.(orcamento);
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-300 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          Criar Orçamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Oportunidade</span>
            <p className="font-semibold">{oportunidade.titulo}</p>
          </div>
          <div>
            <span className="text-slate-600">Cliente</span>
            <p className="font-semibold">{oportunidade.cliente_nome}</p>
          </div>
          <div>
            <span className="text-slate-600">Valor Estimado</span>
            <p className="font-bold">R$ {oportunidade.valor_estimado?.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-slate-600">Etapa Atual</span>
            <p className="font-semibold">{oportunidade.etapa}</p>
          </div>
        </div>
        <Button
          onClick={handleCriar}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Criando...' : '➜ Criar Orçamento'}
        </Button>
      </CardContent>
    </Card>
  );
}