import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Loader2, Search, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function IAKYCValidacao({ tipo, cpfCnpj, onDadosValidados }) {
  const validarMutation = useMutation({
    mutationFn: async () => {
      const prompt = tipo === 'CNPJ' 
        ? `Consulte informações da Receita Federal para o CNPJ ${cpfCnpj}. Retorne: razão social, nome fantasia, situação cadastral, CNAE principal, ramo de atividade, porte, endereço completo (CEP, logradouro, número, bairro, cidade, estado).`
        : `Valide o CPF ${cpfCnpj} e retorne se é válido e situação cadastral.`;

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: tipo === 'CNPJ' ? {
          type: 'object',
          properties: {
            razao_social: { type: 'string' },
            nome_fantasia: { type: 'string' },
            situacao_cadastral: { type: 'string' },
            cnae_principal: { type: 'string' },
            ramo_atividade: { type: 'string' },
            porte: { type: 'string' },
            endereco: {
              type: 'object',
              properties: {
                cep: { type: 'string' },
                logradouro: { type: 'string' },
                numero: { type: 'string' },
                bairro: { type: 'string' },
                cidade: { type: 'string' },
                estado: { type: 'string' }
              }
            }
          }
        } : {
          type: 'object',
          properties: {
            valido: { type: 'boolean' },
            situacao: { type: 'string' }
          }
        }
      });

      // Registrar log da validação
      await base44.entities.LogsIA.create({
        tipo_ia: 'IA_KYC',
        contexto_execucao: 'Cadastro',
        entidade_relacionada: tipo === 'CNPJ' ? 'Cliente/Fornecedor' : 'Cliente',
        acao_sugerida: `Validação ${tipo} concluída`,
        resultado: 'Automático',
        confianca_ia: 90,
        dados_entrada: { cpf_cnpj: cpfCnpj },
        dados_saida: resultado
      });

      return resultado;
    },
    onSuccess: (dados) => {
      toast.success('Validação concluída com sucesso!');
      if (onDadosValidados) {
        onDadosValidados(dados);
      }
    },
    onError: () => {
      toast.error('Erro ao validar dados. Verifique o CPF/CNPJ informado.');
    }
  });

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => validarMutation.mutate()}
      disabled={!cpfCnpj || validarMutation.isPending}
      className="w-full"
    >
      {validarMutation.isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Validando com IA...
        </>
      ) : (
        <>
          <Search className="w-4 h-4 mr-2" />
          Validar e Preencher com IA
        </>
      )}
    </Button>
  );
}