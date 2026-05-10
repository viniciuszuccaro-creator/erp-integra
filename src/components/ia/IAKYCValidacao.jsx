import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Loader2, Search, Building } from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function IAKYCValidacao({ tipo, cpfCnpj, onDadosValidados }) {
  const { contexto, empresaAtual, grupoAtual } = useContextoVisual();
  const grupoAtivoId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || (() => {
    try { return localStorage.getItem('group_atual_id'); } catch { return null; }
  })();
  const empresaAtivaId = contexto === 'grupo' ? null : empresaAtual?.id;
  const contextoValido = !!(empresaAtivaId || grupoAtivoId);

  const validarMutation = useMutation({
    mutationFn: async () => {
      if (!contextoValido) {
        throw new Error('Selecione um grupo ou empresa antes de validar dados com IA.');
      }

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
        dados_saida: resultado,
        empresa_id: empresaAtivaId || null,
        group_id: grupoAtivoId || null,
      });

      return resultado;
    },
    onSuccess: (dados) => {
      toast.success('Validação concluída com sucesso!');
      if (onDadosValidados) {
        onDadosValidados(dados);
      }
    },
    onError: (error) => {
      toast.error(String(error?.message || 'Erro ao validar dados. Verifique o CPF/CNPJ informado.'));
    }
  });

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => validarMutation.mutate()}
      disabled={!cpfCnpj || validarMutation.isPending || !contextoValido}
      className="w-full"
      data-action="IA.KYC.validar"
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
