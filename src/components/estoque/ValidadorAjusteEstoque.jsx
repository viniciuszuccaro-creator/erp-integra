import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import usePermissions from '@/components/lib/usePermissions';
import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * VALIDADOR AJUSTE ESTOQUE - Aprovação com visão em tempo real
 * ETAPA 2: Controle de qualidade de ajustes
 */

export default function ValidadorAjusteEstoque({ ajusteId }) {
  const [ajuste, setAjuste] = React.useState(null);
  const [validacoes, setValidacoes] = React.useState([]);
  const [loading, setLoading] = useState(false);
  const { canApprove } = usePermissions();

  React.useEffect(() => {
    const carregarAjuste = async () => {
      const a = await base44.entities.AjusteEstoque.get(ajusteId);
      setAjuste(a);

      // Realizar validações
      const erros = [];
      if (!a.responsavel_contagem) erros.push('Responsável de contagem não definido');
      if (!a.motivo) erros.push('Motivo do ajuste não informado');
      if (!a.itens_ajuste || a.itens_ajuste.length === 0) erros.push('Nenhum item no ajuste');
      
      a.itens_ajuste?.forEach((item, idx) => {
        if (!item.produto_id) erros.push(`Item ${idx + 1}: Produto não definido`);
        if (!item.quantidade_ajuste) erros.push(`Item ${idx + 1}: Quantidade não informada`);
      });

      setValidacoes(erros);
    };
    carregarAjuste();
  }, [ajusteId]);

  const handleAprovar = async () => {
    if (validacoes.length > 0) {
      alert('Corrija os erros antes de aprovar');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.AjusteEstoque.update(ajusteId, {
        status: 'processado',
        aprovador_id: (await base44.auth.me()).id,
        data_aprovacao: new Date().toISOString()
      });

      // Criar MovimentacaoEstoque para cada item
      for (const item of ajuste.itens_ajuste) {
        await base44.entities.MovimentacaoEstoque.create({
          empresa_id: ajuste.empresa_id,
          group_id: ajuste.group_id,
          origem_movimento: 'ajuste',
          origem_documento_id: ajusteId,
          tipo_movimento: 'ajuste',
          produto_id: item.produto_id,
          quantidade: Math.abs(item.quantidade_ajuste),
          data_movimentacao: new Date().toISOString(),
          motivo: ajuste.motivo
        });
      }

      alert('Ajuste aprovado e processado!');
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!ajuste) return <div className="p-4">Carregando...</div>;

  const temErros = validacoes.length > 0;

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-orange-50 rounded-xl">
      <h2 className="text-xl font-bold text-slate-900">Validação de Ajuste</h2>

      {/* Status */}
      <Card className={`border-2 ${temErros ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
        <CardContent className="pt-6 flex items-center justify-between">
          {temErros ? (
            <>
              <AlertCircle className="w-6 h-6 text-red-600" />
              <span className="font-semibold text-red-700">{validacoes.length} erros encontrados</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-green-700">Tudo pronto para aprovação</span>
            </>
          )}
        </CardContent>
      </Card>

      {/* Erros */}
      {temErros && (
        <Card className="border-2 border-red-300">
          <CardHeader>
            <CardTitle className="text-sm text-red-700">Erros Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-red-600">
              {validacoes.map((erro, idx) => (
                <li key={idx}>❌ {erro}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Dados do Ajuste */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Detalhes do Ajuste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-600">Tipo</span>
              <p className="font-semibold capitalize">{ajuste.tipo_ajuste}</p>
            </div>
            <div>
              <span className="text-slate-600">Status</span>
              <Badge className="capitalize">{ajuste.status}</Badge>
            </div>
            <div>
              <span className="text-slate-600">Responsável</span>
              <p className="font-semibold">{ajuste.responsavel_contagem}</p>
            </div>
            <div>
              <span className="text-slate-600">Itens</span>
              <p className="font-bold">{ajuste.itens_ajuste?.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ação */}
      {canApprove('Estoque', 'Ajustes') && (
        <Button
          onClick={handleAprovar}
          disabled={temErros || loading || ajuste.status !== 'pendente'}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Processando...' : '✅ Aprovar Ajuste'}
        </Button>
      )}
    </div>
  );
}