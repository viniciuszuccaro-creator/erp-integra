import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, AlertTriangle, Zap, CreditCard, Landmark, Package, DollarSign } from 'lucide-react';

export default function ValidadorFormasPagamento({ windowMode = false }) {
  const [expandido, setExpandido] = useState(false);

  // Buscar dados
  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => base44.entities.Banco.list(),
  });

  // VALIDAÇÕES
  const validacoes = {
    entidade: formasPagamento.length > 0,
    formasPadrao: formasPagamento.length >= 5,
    bancosConfigurados: bancos.length > 0,
    pixDisponivel: formasPagamento.some(f => f.tipo === 'PIX' && f.ativa),
    boletoDisponivel: formasPagamento.some(f => f.tipo === 'Boleto' && f.ativa),
    cartaoDisponivel: formasPagamento.some(f => f.tipo.includes('Cartão') && f.ativa),
    formasPDV: formasPagamento.filter(f => f.disponivel_pdv && f.ativa).length >= 4,
    formasEcommerce: formasPagamento.filter(f => f.disponivel_ecommerce && f.ativa).length >= 3,
    integracaoBanco: bancos.some(b => b.suporta_cobranca_boleto || b.suporta_cobranca_pix),
  };

  const percentualCompleto = (Object.values(validacoes).filter(Boolean).length / Object.keys(validacoes).length) * 100;
  const statusGeral = percentualCompleto === 100 ? 'completo' : percentualCompleto >= 80 ? 'quase' : 'incompleto';

  // Estatísticas
  const stats = {
    total: formasPagamento.length,
    ativas: formasPagamento.filter(f => f.ativa).length,
    pdv: formasPagamento.filter(f => f.disponivel_pdv && f.ativa).length,
    ecommerce: formasPagamento.filter(f => f.disponivel_ecommerce && f.ativa).length,
    parcelamento: formasPagamento.filter(f => f.permite_parcelamento && f.ativa).length,
    desconto: formasPagamento.filter(f => f.aceita_desconto && f.percentual_desconto_padrao > 0).length,
    acrescimo: formasPagamento.filter(f => f.aplicar_acrescimo && f.percentual_acrescimo_padrao > 0).length,
  };

  return (
    <Card className={`border-2 ${
      statusGeral === 'completo' ? 'border-green-400 bg-green-50' :
      statusGeral === 'quase' ? 'border-yellow-400 bg-yellow-50' :
      'border-red-400 bg-red-50'
    } ${windowMode ? 'w-full h-full' : ''}`}>
      <CardHeader 
        className={`cursor-pointer ${
          statusGeral === 'completo' ? 'bg-green-100' :
          statusGeral === 'quase' ? 'bg-yellow-100' :
          'bg-red-100'
        }`}
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className={`w-6 h-6 ${
              statusGeral === 'completo' ? 'text-green-600' :
              statusGeral === 'quase' ? 'text-yellow-600' :
              'text-red-600'
            }`} />
            <div>
              <CardTitle className="text-lg">
                🏦 Validador Formas de Pagamento V21.8
              </CardTitle>
              <p className="text-xs text-slate-600 mt-1">
                Sistema centralizado e integrado
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={
              statusGeral === 'completo' ? 'bg-green-600' :
              statusGeral === 'quase' ? 'bg-yellow-600' :
              'bg-red-600'
            }>
              {percentualCompleto.toFixed(0)}% Completo
            </Badge>
            {statusGeral === 'completo' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
          </div>
        </div>
      </CardHeader>

      {expandido && (
        <CardContent className="p-6 space-y-6">
          {/* ESTATÍSTICAS */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-white rounded-lg border-2 border-blue-200">
              <Package className="w-6 h-6 text-blue-600 mb-1" />
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              <p className="text-xs text-blue-700">Total Cadastradas</p>
            </div>
            <div className="p-3 bg-white rounded-lg border-2 border-green-200">
              <CheckCircle2 className="w-6 h-6 text-green-600 mb-1" />
              <p className="text-2xl font-bold text-green-900">{stats.ativas}</p>
              <p className="text-xs text-green-700">Ativas</p>
            </div>
            <div className="p-3 bg-white rounded-lg border-2 border-purple-200">
              <DollarSign className="w-6 h-6 text-purple-600 mb-1" />
              <p className="text-2xl font-bold text-purple-900">{stats.pdv}</p>
              <p className="text-xs text-purple-700">Disponíveis PDV</p>
            </div>
            <div className="p-3 bg-white rounded-lg border-2 border-cyan-200">
              <Zap className="w-6 h-6 text-cyan-600 mb-1" />
              <p className="text-2xl font-bold text-cyan-900">{stats.ecommerce}</p>
              <p className="text-xs text-cyan-700">Disponíveis Web</p>
            </div>
          </div>

          {/* VALIDAÇÕES */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 mb-3">✅ Checklist de Validação</h3>
            
            {Object.entries({
              'Entidade FormaPagamento criada': validacoes.entidade,
              'Mínimo 5 formas cadastradas': validacoes.formasPadrao,
              'Bancos configurados': validacoes.bancosConfigurados,
              'PIX disponível': validacoes.pixDisponivel,
              'Boleto disponível': validacoes.boletoDisponivel,
              'Cartão disponível': validacoes.cartaoDisponivel,
              'PDV com 4+ formas ativas': validacoes.formasPDV,
              'E-commerce com 3+ formas': validacoes.formasEcommerce,
              'Integração bancária configurada': validacoes.integracaoBanco,
            }).map(([label, status]) => (
              <div key={label} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="text-sm text-slate-700">{label}</span>
                {status ? (
                  <Badge className="bg-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    OK
                  </Badge>
                ) : (
                  <Badge className="bg-red-600">
                    <XCircle className="w-3 h-3 mr-1" />
                    Falta
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* RECURSOS AVANÇADOS */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">🚀 Recursos Avançados</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="text-sm">Descontos Automáticos</span>
                <Badge className="bg-green-100 text-green-700">{stats.desconto} formas</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="text-sm">Acréscimos Automáticos</span>
                <Badge className="bg-orange-100 text-orange-700">{stats.acrescimo} formas</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="text-sm">Parcelamento</span>
                <Badge className="bg-purple-100 text-purple-700">{stats.parcelamento} formas</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="text-sm">Bancos Integrados</span>
                <Badge className="bg-blue-100 text-blue-700">{bancos.length} bancos</Badge>
              </div>
            </div>
          </div>

          {/* STATUS FINAL */}
          {statusGeral === 'completo' ? (
            <Alert className="border-green-400 bg-green-100">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <AlertDescription className="text-green-900 font-semibold ml-6">
                🎉 SISTEMA 100% COMPLETO E OPERACIONAL! Formas de pagamento totalmente centralizadas e integradas.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-orange-400 bg-orange-100">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <AlertDescription className="text-orange-900 ml-6">
                <strong>⚠️ {100 - percentualCompleto.toFixed(0)}% restante.</strong> Configure as formas faltantes no Cadastros Gerais.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
    </Card>
  );
}