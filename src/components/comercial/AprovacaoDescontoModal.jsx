import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import usePermissions from '@/components/lib/usePermissions';
import { base44 } from '@/api/base44Client';

/**
 * APROVAÇÃO DESCONTO - Modal para gerenciar aprovação de descontos em pedidos
 * ETAPA 2: Fluxo de aprovação com controle granular
 */

export default function AprovacaoDescontoModal({ pedido, onClose, onApprove }) {
  const [acao, setAcao] = useState(''); // 'aprovar' ou 'rejeitar'
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const { canApprove } = usePermissions();

  const podeAprovar = canApprove('Comercial', 'Pedidos');

  const margemAtual = pedido.margem_aplicada_vendedor || 0;
  const margemMinima = pedido.margem_minima_produto || 10;
  const margemInsuficiente = margemAtual < margemMinima;

  const handleSubmit = async () => {
    if (!acao) return;

    setLoading(true);
    try {
      await base44.entities.Pedido.update(pedido.id, {
        status_aprovacao: acao === 'aprovar' ? 'aprovado' : 'negado',
        desconto_aprovado_percentual: acao === 'aprovar' ? pedido.desconto_solicitado_percentual : 0,
        usuario_aprovador_id: (await base44.auth.me()).id,
        data_aprovacao: new Date().toISOString(),
        comentarios_aprovacao: comentario
      });

      // Auditar
      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me()).full_name,
        usuario_id: (await base44.auth.me()).id,
        empresa_id: pedido.empresa_id,
        acao: `Desconto ${acao === 'aprovar' ? 'Aprovado' : 'Rejeitado'}`,
        modulo: 'Comercial',
        entidade: 'Pedido',
        registro_id: pedido.id,
        descricao: `Desconto de ${pedido.desconto_solicitado_percentual}% ${acao === 'aprovar' ? 'aprovado' : 'rejeitado'}`,
        dados_novos: { comentario },
        data_hora: new Date().toISOString(),
        sucesso: true
      });

      onApprove?.();
      onClose?.();
    } catch (err) {
      console.error('Erro ao aprovar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-xl shadow-lg">
      <CardTitle className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        Aprovação de Desconto
      </CardTitle>

      {/* Dados do Pedido */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-600">Pedido:</span>
          <p className="font-semibold">{pedido.numero_pedido}</p>
        </div>
        <div>
          <span className="text-slate-600">Cliente:</span>
          <p className="font-semibold">{pedido.cliente_nome}</p>
        </div>
        <div>
          <span className="text-slate-600">Desconto Solicitado:</span>
          <p className="font-bold text-yellow-600">{pedido.desconto_solicitado_percentual}%</p>
        </div>
        <div>
          <span className="text-slate-600">Valor Original:</span>
          <p className="font-semibold">R$ {pedido.valor_total?.toFixed(2)}</p>
        </div>
      </div>

      {/* Análise de Margem */}
      <Card className={`border-2 ${margemInsuficiente ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            {margemInsuficiente ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            <span className="font-semibold">
              Análise de Margem
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-600">Margem Mínima:</span>
              <p className="font-semibold">{margemMinima}%</p>
            </div>
            <div>
              <span className="text-slate-600">Margem Após Desconto:</span>
              <p className={`font-semibold ${margemInsuficiente ? 'text-red-600' : 'text-green-600'}`}>
                {margemAtual}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comentário */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Comentário da Aprovação
        </label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Justifique sua decisão..."
          className="w-full p-2 border border-slate-300 rounded-lg text-sm"
          rows={3}
          disabled={!podeAprovar}
        />
      </div>

      {/* Ações */}
      {podeAprovar ? (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setAcao('aprovar');
              handleSubmit();
            }}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? '...' : '✅ Aprovar'}
          </Button>
          <Button
            onClick={() => {
              setAcao('rejeitar');
              handleSubmit();
            }}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            {loading ? '...' : '❌ Rejeitar'}
          </Button>
          <Button onClick={onClose} variant="ghost">
            Cancelar
          </Button>
        </div>
      ) : (
        <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-700">
          Você não tem permissão para aprovar descontos.
        </div>
      )}
    </div>
  );
}