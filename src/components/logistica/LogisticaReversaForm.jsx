import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ETAPA 3: Formulário de Logística Reversa
 * Registra devolução/recusa e dispara automações
 */

export default function LogisticaReversaForm({ entrega, onConcluir }) {
  const [motivo, setMotivo] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [quantidadeDevolvida, setQuantidadeDevolvida] = useState(0);
  const [processando, setProcessando] = useState(false);

  const processar = async () => {
    if (!motivo) {
      toast.error('Motivo é obrigatório');
      return;
    }

    setProcessando(true);

    try {
      await base44.functions.invoke('processarLogisticaReversa', {
        entrega_id: entrega.id,
        motivo,
        quantidade_devolvida: quantidadeDevolvida,
        observacoes: detalhes
      });

      toast.success('Logística reversa processada!');
      onConcluir?.();
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="w-full h-full p-4 overflow-auto">
      <Card className="border-2 border-orange-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <RotateCcw className="w-5 h-5" />
            Logística Reversa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cliente */}
          <div className="bg-orange-50 p-3 rounded">
            <p className="font-bold">{entrega.cliente_nome}</p>
            <p className="text-sm text-slate-600">
              {entrega.endereco_entrega_completo?.logradouro}, {entrega.endereco_entrega_completo?.numero}
            </p>
          </div>

          {/* Motivo */}
          <div>
            <label className="text-sm font-medium block mb-2">Motivo da Devolução *</label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Recusa Total">Recusa Total</SelectItem>
                <SelectItem value="Recusa Parcial">Recusa Parcial</SelectItem>
                <SelectItem value="Avaria">Avaria no Produto</SelectItem>
                <SelectItem value="Troca">Troca de Produto</SelectItem>
                <SelectItem value="Outro">Outro Motivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantidade */}
          {motivo === 'Recusa Parcial' && (
            <div>
              <label className="text-sm font-medium block mb-2">Quantidade Devolvida</label>
              <Input
                type="number"
                placeholder="Quantidade"
                value={quantidadeDevolvida}
                onChange={(e) => setQuantidadeDevolvida(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {/* Detalhes */}
          <div>
            <label className="text-sm font-medium block mb-2">Detalhes/Observações</label>
            <Textarea
              placeholder="Descreva o que aconteceu..."
              value={detalhes}
              onChange={(e) => setDetalhes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Alerta */}
          <div className="bg-yellow-50 border border-yellow-300 p-3 rounded text-sm">
            <p className="font-medium text-yellow-800">⚠️ Esta ação irá:</p>
            <ul className="text-yellow-700 mt-1 space-y-1 ml-4 list-disc">
              <li>Retornar produto ao estoque</li>
              <li>Notificar financeiro para bloqueio de cobrança</li>
              <li>Registrar ocorrência na entrega</li>
              <li>Enviar alerta ao gestor</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={() => onConcluir?.()}
              variant="outline"
              className="flex-1"
              disabled={processando}
            >
              Cancelar
            </Button>
            <Button
              onClick={processar}
              disabled={processando || !motivo}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {processando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Processar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}