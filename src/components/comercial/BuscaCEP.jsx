import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Busca CEP com auto-completar endereço
 * V12.0 - Com integração ViaCEP
 */
export default function BuscaCEP({ onEnderecoEncontrado, label = "Buscar por CEP" }) {
  const [cep, setCep] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [encontrado, setEncontrado] = useState(false);

  const buscarCEP = async () => {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      toast.error('CEP deve ter 8 dígitos');
      return;
    }

    setBuscando(true);
    setEncontrado(false);

    try {
      // Buscar na API ViaCEP (gratuita)
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        setBuscando(false);
        return;
      }

      const endereco = {
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
        complemento: data.complemento || '',
        numero: ''
      };

      onEnderecoEncontrado(endereco);
      setEncontrado(true);
      toast.success('✅ Endereço encontrado e preenchido!');

      setTimeout(() => setEncontrado(false), 3000);
    } catch (error) {
      toast.error('Erro ao buscar CEP. Verifique sua conexão.');
    } finally {
      setBuscando(false);
    }
  };

  const formatarCEP = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 5) return numeros;
    return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 mt-2">
        <Input
          value={cep}
          onChange={(e) => setCep(formatarCEP(e.target.value))}
          placeholder="00000-000"
          maxLength={9}
          onKeyPress={(e) => e.key === 'Enter' && buscarCEP()}
          className={encontrado ? 'border-green-500' : ''}
        />
        <Button
          type="button"
          onClick={buscarCEP}
          disabled={buscando || cep.replace(/\D/g, '').length !== 8}
          variant="outline"
          className={encontrado ? 'bg-green-50 border-green-500' : ''}
        >
          {buscando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : encontrado ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-slate-500 mt-1">
        💡 Digite o CEP e clique para preencher automaticamente o endereço
      </p>
    </div>
  );
}