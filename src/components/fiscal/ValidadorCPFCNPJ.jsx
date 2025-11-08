import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { validarCPF, validarCNPJ, formatarCPFCNPJ } from '../lib/validacoes';

/**
 * Componente de Input com Validação de CPF/CNPJ
 * Valida dígitos verificadores em tempo real
 */
export default function ValidadorCPFCNPJ({ 
  value, 
  onChange, 
  tipo = 'auto', // 'cpf', 'cnpj', 'auto'
  label,
  required = false,
  consultarReceita = false, // Preparado para consulta na Receita
  disabled = false
}) {
  const [valorFormatado, setValorFormatado] = useState(value ? formatarCPFCNPJ(value) : '');
  const [validando, setValidando] = useState(false);
  const [statusValidacao, setStatusValidacao] = useState(null); // null, 'valido', 'invalido'
  const [dadosReceita, setDadosReceita] = useState(null);

  const handleChange = async (e) => {
    const valor = e.target.value;
    const numeros = valor.replace(/\D/g, '');
    
    // Formata automaticamente
    const formatado = formatarCPFCNPJ(numeros);
    setValorFormatado(formatado);
    
    // Valida
    let valido = false;
    if (numeros.length === 11 && (tipo === 'cpf' || tipo === 'auto')) {
      valido = validarCPF(numeros);
      setStatusValidacao(valido ? 'valido' : 'invalido');
    } else if (numeros.length === 14 && (tipo === 'cnpj' || tipo === 'auto')) {
      valido = validarCNPJ(numeros);
      setStatusValidacao(valido ? 'valido' : 'invalido');
      
      // Consulta Receita (se habilitado e CNPJ válido)
      if (valido && consultarReceita) {
        await consultarCNPJReceita(numeros);
      }
    } else {
      setStatusValidacao(null);
    }
    
    // Callback
    if (onChange) {
      onChange(numeros, valido, dadosReceita);
    }
  };

  const consultarCNPJReceita = async (cnpj) => {
    setValidando(true);
    setDadosReceita(null);
    
    try {
      // PREPARADO: Integração com API da Receita Federal
      // Em produção, usar API pública: https://receitaws.com.br/v1/cnpj/
      
      const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
      
      if (response.ok) {
        const dados = await response.json();
        
        if (dados.status === 'OK') {
          setDadosReceita({
            razao_social: dados.nome,
            nome_fantasia: dados.fantasia,
            situacao: dados.situacao,
            atividade_principal: dados.atividade_principal?.[0]?.text,
            logradouro: dados.logradouro,
            numero: dados.numero,
            complemento: dados.complemento,
            bairro: dados.bairro,
            municipio: dados.municipio,
            uf: dados.uf,
            cep: dados.cep,
            telefone: dados.telefone,
            email: dados.email
          });
        }
      }
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      // Silenciosamente falha - não bloqueia o fluxo
    } finally {
      setValidando(false);
    }
  };

  const labelTexto = label || (tipo === 'cpf' ? 'CPF' : tipo === 'cnpj' ? 'CNPJ' : 'CPF/CNPJ');

  return (
    <div className="space-y-2">
      <div className="relative">
        <Label>
          {labelTexto} {required && '*'}
        </Label>
        <div className="relative">
          <Input
            value={valorFormatado}
            onChange={handleChange}
            placeholder={tipo === 'cpf' ? '000.000.000-00' : tipo === 'cnpj' ? '00.000.000/0000-00' : 'CPF ou CNPJ'}
            maxLength={tipo === 'cpf' ? 14 : tipo === 'cnpj' ? 18 : 18}
            disabled={disabled || validando}
            className={`pr-10 ${
              statusValidacao === 'valido' ? 'border-green-500 focus:border-green-500' :
              statusValidacao === 'invalido' ? 'border-red-500 focus:border-red-500' :
              ''
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validando ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : statusValidacao === 'valido' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : statusValidacao === 'invalido' ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : null}
          </div>
        </div>
      </div>

      {statusValidacao === 'invalido' && (
        <Alert className="border-red-300 bg-red-50">
          <XCircle className="w-4 h-4 text-red-600" />
          <AlertDescription>
            <p className="text-sm text-red-800 font-semibold">
              {tipo === 'cpf' || valorFormatado.replace(/\D/g, '').length === 11 
                ? 'CPF inválido - verifique os dígitos' 
                : 'CNPJ inválido - verifique os dígitos'}
            </p>
          </AlertDescription>
        </Alert>
      )}

      {dadosReceita && (
        <Alert className="border-green-300 bg-green-50">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription>
            <div className="text-sm space-y-1">
              <p className="font-semibold text-green-900">
                ✅ CNPJ Ativo na Receita Federal
              </p>
              <p className="text-green-800">
                <strong>Razão Social:</strong> {dadosReceita.razao_social}
              </p>
              {dadosReceita.nome_fantasia && (
                <p className="text-green-800">
                  <strong>Nome Fantasia:</strong> {dadosReceita.nome_fantasia}
                </p>
              )}
              <p className="text-green-800">
                <strong>Situação:</strong> {dadosReceita.situacao}
              </p>
              <p className="text-xs text-green-700 mt-2">
                📍 {dadosReceita.logradouro}, {dadosReceita.numero} - {dadosReceita.bairro}, {dadosReceita.municipio}/{dadosReceita.uf}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {consultarReceita && statusValidacao === 'valido' && !dadosReceita && !validando && (
        <p className="text-xs text-slate-500">
          💡 Consulta automática na Receita Federal disponível
        </p>
      )}
    </div>
  );
}