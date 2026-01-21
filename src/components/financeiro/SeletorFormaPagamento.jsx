import React from 'react';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, Building2, Smartphone } from 'lucide-react';

/**
 * V22.0 ETAPA 4 - Seletor de Forma de Pagamento Reutilizável
 * Componente modular para seleção de forma de pagamento com ícones
 */
export default function SeletorFormaPagamento({ value, onChange, label = "Forma de Pagamento", required = false }) {
  const formas = [
    { value: 'PIX', label: 'PIX', icon: Smartphone, cor: 'text-cyan-600' },
    { value: 'Dinheiro', label: 'Dinheiro', icon: Wallet, cor: 'text-green-600' },
    { value: 'Cartão Crédito', label: 'Cartão Crédito', icon: CreditCard, cor: 'text-blue-600' },
    { value: 'Cartão Débito', label: 'Cartão Débito', icon: CreditCard, cor: 'text-purple-600' },
    { value: 'Boleto', label: 'Boleto', icon: Building2, cor: 'text-orange-600' },
    { value: 'Transferência', label: 'Transferência', icon: Building2, cor: 'text-indigo-600' },
    { value: 'Cheque', label: 'Cheque', icon: Building2, cor: 'text-slate-600' },
  ];

  return (
    <div className="w-full">
      <Label>{label} {required && <span className="text-red-600">*</span>}</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        {formas.map((forma) => {
          const Icone = forma.icon;
          const selecionado = value === forma.value;
          return (
            <button
              key={forma.value}
              type="button"
              onClick={() => onChange(forma.value)}
              className={`p-3 border-2 rounded-lg transition-all ${
                selecionado
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icone className={`w-5 h-5 mx-auto mb-1 ${selecionado ? 'text-blue-600' : forma.cor}`} />
              <p className={`text-xs font-semibold ${selecionado ? 'text-blue-900' : 'text-slate-700'}`}>
                {forma.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}