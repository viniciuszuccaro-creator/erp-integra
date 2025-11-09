import { base44 } from "@/api/base44Client";

/**
 * V21.5 - IA Aprovação Orçamentária Multi-Nível
 * Fluxo automático de aprovação baseado em valor
 */

/**
 * Verificar se OC precisa de aprovação hierárquica
 */
export async function verificarAprovacaoNecessaria(ordemCompra, usuarioId) {
  console.log('🔒 Verificando necessidade de aprovação...');

  // Buscar perfil do usuário
  const usuario = await base44.entities.User.get(usuarioId);
  
  // Buscar permissões do usuário
  const permissoes = await base44.entities.PermissaoEmpresaModulo.filter({
    usuario_id: usuarioId,
    empresa_id: ordemCompra.empresa_id,
    modulo: 'Compras e Suprimentos'
  });

  if (permissoes.length === 0) {
    return {
      precisa_aprovacao: true,
      motivo: 'Usuário sem permissões de compra',
      nivel_aprovador: 'Gerente'
    };
  }

  const permissao = permissoes[0];
  const limiteValor = permissao.nivel_acesso === 'Aprovar' 
    ? 10000 // Gerente pode aprovar até 10k
    : permissao.nivel_acesso === 'Editar'
    ? 5000 // Comprador pode aprovar até 5k
    : 0;

  const precisaAprovacao = ordemCompra.valor_total > limiteValor;

  if (precisaAprovacao) {
    // Determinar quem deve aprovar
    let nivelAprovador = 'Gerente';
    
    if (ordemCompra.valor_total > 50000) {
      nivelAprovador = 'Diretor';
    } else if (ordemCompra.valor_total > 10000) {
      nivelAprovador = 'Gerente';
    }

    return {
      precisa_aprovacao: true,
      motivo: `Valor R$ ${ordemCompra.valor_total.toFixed(2)} excede limite de R$ ${limiteValor}`,
      nivel_aprovador: nivelAprovador,
      limite_usuario: limiteValor
    };
  }

  return {
    precisa_aprovacao: false,
    motivo: 'Usuário tem alçada para aprovar'
  };
}

/**
 * V21.5: Notificar aprovador automaticamente
 */
export async function notificarAprovadorAutomatico(ordemCompra, nivelAprovador) {
  console.log(`📧 Notificando ${nivelAprovador}...`);

  // Buscar usuários com perfil de aprovador
  const usuarios = await base44.entities.User.list();
  const aprovadores = usuarios.filter(u => 
    u.role === 'admin' || u.cargo?.includes(nivelAprovador)
  );

  if (aprovadores.length === 0) {
    console.log('⚠️ Nenhum aprovador encontrado.');
    return;
  }

  // Criar notificação para cada aprovador
  for (const aprovador of aprovadores) {
    await base44.entities.Notificacao.create({
      titulo: `Aprovação de OC ${ordemCompra.numero_oc}`,
      mensagem: `
Ordem de Compra aguardando sua aprovação:
- Fornecedor: ${ordemCompra.fornecedor_nome}
- Valor: R$ ${ordemCompra.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Prazo: ${ordemCompra.prazo_entrega_acordado} dias
      `.trim(),
      tipo: 'aviso',
      categoria: 'Comercial',
      prioridade: ordemCompra.valor_total > 50000 ? 'Urgente' : 'Alta',
      destinatario_id: aprovador.id,
      destinatario_email: aprovador.email,
      entidade_relacionada: 'OrdemCompra',
      registro_id: ordemCompra.id,
      link_acao: `/compras?oc=${ordemCompra.id}`
    });
  }

  console.log(`✅ ${aprovadores.length} aprovador(es) notificado(s).`);
  return aprovadores;
}

export default { verificarAprovacaoNecessaria, notificarAprovadorAutomatico };