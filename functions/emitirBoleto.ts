import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conta_receber_id } = await req.json();
    if (!conta_receber_id) {
      return Response.json({ error: 'conta_receber_id é obrigatório' }, { status: 400 });
    }

    // Buscar CR
    const crList = await base44.entities.ContaReceber.filter({ id: conta_receber_id });
    const cr = crList?.[0];
    if (!cr) {
      return Response.json({ error: 'ContaReceber não encontrada' }, { status: 404 });
    }

    // Gerar PDF simples do boleto (simulado)
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Boleto (Simulado) - ERP Zuccaro', 20, 20);

    doc.setFontSize(11);
    const y0 = 35;
    const linhas = [
      `Cliente ID: ${cr.cliente_id || '-'}`,
      `Descrição: ${cr.descricao || 'Boleto gerado via Chatbot'}`,
      `Valor: R$ ${(cr.valor || 0).toLocaleString('pt-BR')}`,
      `Vencimento: ${cr.data_vencimento || '-'}`,
      `Forma: ${cr.forma_cobranca || 'Boleto'}`,
      `Empresa: ${cr.empresa_id || '-'}`,
      `Linha Digitável: 00000.00000 00000.000000 00000.000000 0 00000000000000 (simulado)`
    ];
    linhas.forEach((t, i) => doc.text(t, 20, y0 + i * 8));

    doc.setFontSize(9);
    doc.text('Documento gerado automaticamente pelo Chatbot • Válido para testes e homologação', 20, y0 + linhas.length * 8 + 10);

    const pdfBytes = doc.output('arraybuffer');
    const file = new File([pdfBytes], `boleto_${conta_receber_id}.pdf`, { type: 'application/pdf' });

    // Upload privado e URL assinada
    const up = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
    const fileUri = up?.file_uri;
    let signedUrl = null;
    if (fileUri) {
      const su = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 * 24 });
      signedUrl = su?.signed_url || null;
    }

    // Atualizar CR
    await base44.asServiceRole.entities.ContaReceber.update(conta_receber_id, {
      url_boleto_pdf: signedUrl,
      status_cobranca: 'gerada',
      data_envio_cobranca: new Date().toISOString()
    });

    // Auditoria
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email || 'Usuário',
        usuario_id: user.id,
        acao: 'Criação',
        modulo: 'Financeiro',
        entidade: 'ContaReceber',
        registro_id: conta_receber_id,
        descricao: 'Boleto PDF emitido e URL assinada gerada (chatbot)',
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json({ url: signedUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});