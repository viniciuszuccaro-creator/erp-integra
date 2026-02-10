import { z } from 'zod';

export const pedidoCompletoSchema = z
  .object({
    numero_pedido: z.string().min(1, 'Número do pedido obrigatório'),
    cliente_id: z.string().min(1, 'Cliente obrigatório'),
    cliente_nome: z.string().min(1, 'Cliente obrigatório'),
    data_pedido: z.string().min(8, 'Data inválida'),
    status: z.string(),
    forma_pagamento: z.string(),
    valor_produtos: z.number().nonnegative().default(0),
    desconto_geral_pedido_percentual: z.number().min(0).max(100).default(0),
    desconto_geral_pedido_valor: z.number().min(0).default(0),
    valor_frete: z.number().min(0).default(0),
    itens_revenda: z.array(z.any()).default([]),
    itens_armado_padrao: z.array(z.any()).default([]),
    itens_corte_dobra: z.array(z.any()).default([]),
    empresa_id: z.string().optional().nullable(),
    group_id: z.string().optional().nullable(),
    justificativa_desconto: z.string().optional().nullable(),
  })
  .refine(
    (d) =>
      (d.itens_revenda?.length || 0) +
        (d.itens_armado_padrao?.length || 0) +
        (d.itens_corte_dobra?.length || 0) > 0,
    { path: ['itens_revenda'], message: 'Adicione pelo menos um item' }
  )
  .refine((d) => !!(d.empresa_id || d.group_id), {
    path: ['empresa_id'],
    message: 'Defina empresa ou grupo (multiempresa) antes de salvar',
  })
  .superRefine((d, ctx) => {
    if ((d.desconto_geral_pedido_percentual || 0) > 0) {
      if (!d.justificativa_desconto || d.justificativa_desconto.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Justificativa é obrigatória quando houver desconto',
          path: ['justificativa_desconto'],
        });
      }
    }
    const custoTotal = (d.valor_produtos || 0) * 0.7; // suposição conservadora
    if (custoTotal > 0) {
      const valorComDesc = (d.valor_produtos || 0) * (1 - (d.desconto_geral_pedido_percentual || 0) / 100);
      const margem = ((valorComDesc - custoTotal) / custoTotal) * 100;
      if (margem < 10 && d.status === 'Aprovado') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Margem abaixo do mínimo requer aprovação (não pode Aprovar diretamente)',
          path: ['desconto_geral_pedido_percentual'],
        });
      }
    }
  });