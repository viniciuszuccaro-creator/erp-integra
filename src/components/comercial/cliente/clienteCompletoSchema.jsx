import { z } from 'zod';

export const clienteCompletoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['Pessoa Física', 'Pessoa Jurídica']),
  status: z.enum(['Ativo', 'Inativo', 'Prospect', 'Bloqueado']),
  endereco_principal: z.object({
    cep: z.string().min(8, 'CEP inválido').max(9).optional().or(z.literal('')),
  }).partial().optional(),
});