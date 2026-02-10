export async function sendEmail(base44, to, subject, body) {
  return base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body });
}

export async function notify(base44, titulo, mensagem, tipo = 'info', categoria = 'Sistema', prioridade = 'Baixa') {
  return base44.asServiceRole.entities.Notificacao.create({ titulo, mensagem, tipo, categoria, prioridade });
}