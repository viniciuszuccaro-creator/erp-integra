import { z } from 'zod';

export const contaReceberSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  valor: z.number().positive('Valor deve ser maior que zero'),
  empresa_id: z.string().min(1, 'Empresa é obrigatória'),
  centro_custo_id: z.string().min(1, 'Centro de custo é obrigatório'),
  plano_contas_id: z.string().min(1, 'Plano de contas é obrigatório'),
  data_emissao: z.string().min(1, 'Data de emissão é obrigatória'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
});