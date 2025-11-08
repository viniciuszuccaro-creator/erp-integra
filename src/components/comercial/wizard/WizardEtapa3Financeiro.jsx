import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DollarSign, CreditCard, Calendar } from 'lucide-react';
import PriceBrain from '../PriceBrain';

export default function WizardEtapa3Financeiro({ dados, onChange }) {
  const calcularTotal = () => {
    const totalRevenda = (dados.itens_revenda || []).reduce((sum, i) => sum + (i.valor_item || 0), 0);
    const totalProducao = (dados.itens_producao || []).reduce((sum, i) => sum + (i.preco_venda_total || 0), 0);
    return totalRevenda + totalProducao + (dados.valor_frete || 0);
  };

  const total = calcularTotal();

  React.useEffect(() => {
    onChange({ valor_total: total });
  }, [total]);

  return (
    <div className="space-y-6">
      {/* PriceBrain - IA de Precificação */}
      <PriceBrain
        pedido={dados}
        onSugestaoAplicada={(novoPedido) => onChange(novoPedido)}
      />

      <Card className="border-green-200 bg-green-50">
        <CardHeader className="bg-white/80 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            Forma de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label>Forma de Pagamento *</Label>
            <Select
              value={dados.forma_pagamento || ''}
              onValueChange={(value) => onChange({ forma_pagamento: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="À Vista">À Vista</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                <SelectItem value="Parcelado">Parcelado</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Condição de Pagamento *</Label>
            <Select
              value={dados.condicao_pagamento || ''}
              onValueChange={(value) => onChange({ condicao_pagamento: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="À Vista">À Vista</SelectItem>
                <SelectItem value="7 dias">7 dias</SelectItem>
                <SelectItem value="15 dias">15 dias</SelectItem>
                <SelectItem value="30 dias">30 dias</SelectItem>
                <SelectItem value="45 dias">45 dias</SelectItem>
                <SelectItem value="60 dias">60 dias</SelectItem>
                <SelectItem value="Parcelado">Parcelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Valor do Frete</Label>
            <Input
              type="number"
              step="0.01"
              value={dados.valor_frete || 0}
              onChange={(e) => onChange({ valor_frete: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Valor Total do Pedido</p>
              <p className="text-xs text-slate-500 mt-1">
                {(dados.itens_revenda?.length || 0) + (dados.itens_producao?.length || 0)} itens
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-600">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}