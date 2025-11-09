import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Zap,
  Link2
} from "lucide-react";

/**
 * V21.4 - Monitor de Saúde do Golden Thread
 * Verifica se TODOS os pontos de integração estão funcionando
 * 
 * Golden Thread Completo:
 * Pedido → Produção → Estoque → Expedição → Fiscal → Financeiro
 */
export default function MonitorSaudeGoldenThread({ empresaId }) {
  const [saudeSistema, setSaudeSistema] = useState(null);

  const { data: pedidosRecentes = [] } = useQuery({
    queryKey: ['pedidos-recent-check', empresaId],
    queryFn: () => base44.entities.Pedido.filter({
      empresa_id: empresaId,
      status: { $in: ['Aprovado', 'Em Produção', 'Faturado', 'Entregue'] }
    }, '-data_pedido', 20),
    enabled: !!empresaId
  });

  const { data: opsRecentes = [] } = useQuery({
    queryKey: ['ops-recent-check', empresaId],
    queryFn: () => base44.entities.OrdemProducao.filter({
      empresa_id: empresaId
    }, '-data_emissao', 20),
    enabled: !!empresaId
  });

  const { data: entregasRecentes = [] } = useQuery({
    queryKey: ['entregas-recent-check', empresaId],
    queryFn: () => base44.entities.Entrega.filter({
      empresa_id: empresaId
    }, '-data_saida', 20),
    enabled: !!empresaId
  });

  const { data: nfesRecentes = [] } = useQuery({
    queryKey: ['nfes-recent-check', empresaId],
    queryFn: () => base44.entities.NotaFiscal.filter({
      empresa_faturamento_id: empresaId
    }, '-data_emissao', 20),
    enabled: !!empresaId
  });

  useEffect(() => {
    if (!empresaId) return;

    const verificarSaude = async () => {
      const checkpoints = {
        comercial: { ok: true, detalhes: '' },
        producao: { ok: true, detalhes: '' },
        estoque: { ok: true, detalhes: '' },
        expedicao: { ok: true, detalhes: '' },
        fiscal: { ok: true, detalhes: '' },
        financeiro: { ok: true, detalhes: '' }
      };

      // 1. COMERCIAL → PRODUÇÃO
      const pedidosComOP = pedidosRecentes.filter(p => {
        const ops = opsRecentes.filter(op => op.pedido_id === p.id);
        return ops.length > 0;
      });

      checkpoints.comercial.ok = pedidosRecentes.length > 0;
      checkpoints.comercial.detalhes = `${pedidosRecentes.length} pedidos aprovados`;

      checkpoints.producao.ok = opsRecentes.length > 0 && pedidosComOP.length > 0;
      checkpoints.producao.detalhes = `${opsRecentes.length} OPs criadas (${pedidosComOP.length} de pedidos)`;

      // 2. PRODUÇÃO → ESTOQUE
      const opsComBaixa = opsRecentes.filter(op => op.estoque_baixado);
      checkpoints.estoque.ok = opsComBaixa.length > 0;
      checkpoints.estoque.detalhes = `${opsComBaixa.length} OPs consumiram estoque`;

      // 3. PRODUÇÃO → EXPEDIÇÃO
      const opsComEntrega = opsRecentes.filter(op => {
        return entregasRecentes.some(e => e.op_id === op.id);
      });

      checkpoints.expedicao.ok = entregasRecentes.length > 0;
      checkpoints.expedicao.detalhes = `${entregasRecentes.length} entregas geradas (${opsComEntrega.length} de OPs)`;

      // 4. EXPEDIÇÃO → FISCAL
      const entregasComNFe = entregasRecentes.filter(e => e.nfe_id);
      checkpoints.fiscal.ok = nfesRecentes.length > 0 && entregasComNFe.length > 0;
      checkpoints.fiscal.detalhes = `${nfesRecentes.length} NF-es emitidas (${entregasComNFe.length} de entregas)`;

      // 5. FISCAL → FINANCEIRO
      const nfesComFinanceiro = await base44.entities.ContaReceber.filter({
        empresa_id: empresaId,
        nota_fiscal_id: { $ne: null }
      }, '-created_date', 20);

      checkpoints.financeiro.ok = nfesComFinanceiro.length > 0;
      checkpoints.financeiro.detalhes = `${nfesComFinanceiro.length} contas geradas de NF-es`;

      // Calcular saúde geral
      const checkpointsOK = Object.values(checkpoints).filter(c => c.ok).length;
      const saudeGeral = (checkpointsOK / 6) * 100;

      setSaudeSistema({
        checkpoints,
        saude_percentual: saudeGeral,
        status: saudeGeral === 100 ? 'Saudável' :
                saudeGeral >= 80 ? 'Bom' :
                saudeGeral >= 60 ? 'Atenção' : 'Crítico'
      });
    };

    verificarSaude();
    const interval = setInterval(verificarSaude, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [pedidosRecentes, opsRecentes, entregasRecentes, nfesRecentes, empresaId]);

  if (!saudeSistema) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <p className="text-slate-400">Analisando Golden Thread...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const corStatus = {
    'Saudável': 'green',
    'Bom': 'blue',
    'Atenção': 'orange',
    'Crítico': 'red'
  };

  const cor = corStatus[saudeSistema.status];

  return (
    <Card className={`border-2 border-${cor}-300 bg-${cor}-50`}>
      <CardHeader className={`bg-${cor}-100`}>
        <CardTitle className="flex items-center gap-2">
          <Activity className={`w-5 h-5 text-${cor}-600`} />
          Monitor Golden Thread
          <Badge className={`bg-${cor}-600 ml-auto`}>
            {saudeSistema.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Saúde Geral</p>
            <p className="text-2xl font-bold text-slate-900">
              {saudeSistema.saude_percentual.toFixed(0)}%
            </p>
          </div>
          <Progress value={saudeSistema.saude_percentual} />
        </div>

        <div className="space-y-2">
          {Object.entries(saudeSistema.checkpoints).map(([modulo, check]) => {
            const IconeStatus = check.ok ? CheckCircle : XCircle;
            const corStatus = check.ok ? 'green' : 'red';

            return (
              <div key={modulo} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <IconeStatus className={`w-5 h-5 text-${corStatus}-600`} />
                <div className="flex-1">
                  <p className="font-semibold text-sm capitalize">{modulo}</p>
                  <p className="text-xs text-slate-600">{check.detalhes}</p>
                </div>
                <Link2 className={`w-4 h-4 text-${corStatus}-600`} />
              </div>
            );
          })}
        </div>

        {saudeSistema.saude_percentual < 100 && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm font-semibold text-yellow-900">⚠️ Atenção</p>
            <p className="text-xs text-yellow-800 mt-1">
              Alguns pontos do Golden Thread não estão conectados. 
              Verifique as integrações e processos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}