
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * IA de Validação Fiscal Preventiva
 * Sugere correções antes de rejeição da SEFAZ
 */
export default function IAValidacaoFiscal({ pedido, cliente }) {
  const [alertas, setAlertas] = React.useState([]);

  React.useEffect(() => {
    if (!pedido || !cliente) return;

    const alertasGerados = [];

    // VALIDAÇÃO 1: Cliente sem regime fiscal
    if (!cliente.configuracao_fiscal?.regime_tributario) {
      alertasGerados.push({
        tipo: 'erro',
        severidade: 'alta',
        titulo: 'Cliente sem Regime Tributário',
        descricao: 'Configure o regime tributário do cliente antes de emitir NF-e',
        sugestao: 'Edite o cliente e defina: Simples Nacional, Lucro Presumido ou Lucro Real',
        codigo_rejeicao: '539'
      });
    }

    // VALIDAÇÃO 2: Cliente sem IE (se PJ contribuinte)
    if (cliente.tipo === 'Pessoa Jurídica' && 
        cliente.configuracao_fiscal?.contribuinte_icms &&
        !cliente.inscricao_estadual) {
      alertasGerados.push({
        tipo: 'erro',
        severidade: 'alta',
        titulo: 'Inscrição Estadual Obrigatória',
        descricao: 'Cliente PJ contribuinte precisa ter IE cadastrada',
        sugestao: 'Cadastre a IE do cliente ou marque como "Não Contribuinte"',
        codigo_rejeicao: '227'
      });
    }

    // VALIDAÇÃO 3: CFOP vs UF
    const ufCliente = cliente.endereco_principal?.estado;
    const ufEmpresa = 'SP'; // TODO: pegar da empresa

    if (ufCliente !== ufEmpresa && pedido.cfop_pedido?.startsWith('5')) {
      alertasGerados.push({
        tipo: 'aviso',
        severidade: 'media',
        titulo: 'CFOP Incorreto para Operação Interestadual',
        descricao: 'Cliente fora do estado requer CFOP 6xxx',
        sugestao: `Altere CFOP de ${pedido.cfop_pedido} para 6102`,
        codigo_rejeicao: '539'
      });
    }

    // VALIDAÇÃO 4: Itens sem NCM
    const itensSemNCM = pedido.itens_revenda?.filter(i => !i.ncm) || [];
    if (itensSemNCM.length > 0) {
      alertasGerados.push({
        tipo: 'aviso',
        severidade: 'media',
        titulo: `${itensSemNCM.length} item(ns) sem NCM`,
        descricao: 'NCM é obrigatório para emissão de NF-e',
        sugestao: 'Cadastre NCM nos produtos antes de emitir',
        codigo_rejeicao: '775'
      });
    }

    setAlertas(alertasGerados);
  }, [pedido, cliente]);

  if (alertas.length === 0) {
    return (
      <Card className="border-green-300 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Validação Fiscal OK</p>
              <p className="text-sm text-green-700">Sem alertas detectados pela IA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader className="border-b bg-white/80">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          IA de Validação Fiscal
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {alertas.map((alerta, idx) => {
          const config = {
            erro: { icone: AlertTriangle, cor: 'red', bgClass: 'bg-red-50', borderClass: 'border-red-300' },
            aviso: { icone: Info, cor: 'orange', bgClass: 'bg-orange-50', borderClass: 'border-orange-300' }
          }[alerta.tipo];

          const Icon = config.icone;

          return (
            <Alert key={idx} className={`${config.bgClass} ${config.borderClass}`}>
              <Icon className={`w-4 h-4 text-${config.cor}-600`} />
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{alerta.titulo}</p>
                    <p className="text-sm mt-1">{alerta.descricao}</p>
                    <p className="text-xs mt-2 italic text-slate-600">
                      💡 Sugestão: {alerta.sugestao}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Rej. {alerta.codigo_rejeicao}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
}
