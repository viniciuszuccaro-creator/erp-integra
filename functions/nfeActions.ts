import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, audit, ensureContextFields } from './_lib/guard.js';
import { getFiscalConfig } from './_lib/fiscalConfig.js';
import { emitirENotas, statusENotas } from './_lib/nfeEnotas.js';



Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user, perfil } = await getUserAndPerfil(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action = 'emitir', nfe, empresaId, nfeId, justificativa, correcao } = body || {};

    const denied = await assertPermission(base44, { user, perfil }, 'Fiscal', 'NF-e', action);
    if (denied) return denied;

    const ctxErr = assertContextPresence({ empresa_id: empresaId }, true);
    if (ctxErr) return ctxErr;
    const ctxData = await ensureContextFields(base44, { empresa_id: empresaId }, true);

    // Carrega config fiscal com service role (refatorado)
    const { config, integracao } = await getFiscalConfig(base44, empresaId);

    if (!integracao || integracao.ativa === false) {
      if (action === 'emitir') {
        // Simulado
        const fake = {
          sucesso: true,
          modo: 'simulado',
          numero: String(Math.floor(Math.random() * 999999)).padStart(6, '0'),
          serie: '1',
          chave: '00000000000000000000000000000000000000000000',
          protocolo: `SIM${Date.now()}`,
          dataAutorizacao: new Date().toISOString(),
          status: 'Autorizada',
        };
        return Response.json(fake);
      }
      return Response.json({ sucesso: false, modo: 'simulado', mensagem: 'Integração NF-e não configurada' });
    }

    // Implementa provedor eNotas (mínimo viável)
    if (integracao.provedor === 'eNotas') {
      if (action === 'emitir') {
        const res = await emitirENotas(nfe, integracao, config);
        await audit(base44, user, { acao: 'Criação', modulo: 'Fiscal', entidade: 'NotaFiscal', registro_id: nfe?.id || null, descricao: `NF-e ${action}`, dados_novos: { res }, empresa_id: empresaId });
        return Response.json({ ...res, modo: 'real' });
      }
      if (action === 'status') {
        const res = await statusENotas(nfeId, integracao);
        await audit(base44, user, { acao: 'Visualização', modulo: 'Fiscal', entidade: 'NotaFiscal', registro_id: nfeId, descricao: 'Consulta status NF-e', empresa_id: empresaId });
        return Response.json(res);
      }
      if (action === 'cancelar') {
        const r = await fetch(`https://api.enotas.com.br/v2/empresas/${integracao.empresa_id_provedor}/nfes/${nfeId}/cancelamento`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(integracao.api_key + ':')}` }, body: JSON.stringify({ motivo: justificativa || 'Cancelado pelo sistema' }) });
        if (!r.ok) throw new Error(await r.text());
        const j = await r.json();
        await audit(base44, user, { acao: 'Cancelamento', modulo: 'Fiscal', entidade: 'NotaFiscal', registro_id: nfeId, descricao: 'Cancelamento NF-e', dados_novos: { justificativa }, empresa_id: empresaId });
        return Response.json({ sucesso: true, protocolo: j.protocolo });
      }
      if (action === 'carta') {
        const r = await fetch(`https://api.enotas.com.br/v2/empresas/${integracao.empresa_id_provedor}/nfes/${nfeId}/cartaCorrecao`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(integracao.api_key + ':')}` }, body: JSON.stringify({ correcao: correcao || '' }) });
        if (!r.ok) throw new Error(await r.text());
        const j = await r.json();
        await audit(base44, user, { acao: 'Edição', modulo: 'Fiscal', entidade: 'NotaFiscal', registro_id: nfeId, descricao: 'Carta de Correção (eNotas)', dados_novos: { correcao }, empresa_id: empresaId });
        return Response.json({ sucesso: true, protocolo: j.protocolo });
      }
    }

    // Provedor NFe.io
    if (integracao.provedor === 'NFe.io' || integracao.provedor === 'NFEIO') {
      const base = integracao.api_url || 'https://api.nfe.io/v1';
      const headers = { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(integracao.api_key + ':')}` };

      if (action === 'emitir') {
        const r = await fetch(`${base}/nfe/issue`, { method: 'POST', headers, body: JSON.stringify({ ...nfe, companyId: integracao.empresa_id_provedor }) });
        if (!r.ok) throw new Error(await r.text());
        const j = await r.json();
        await audit(base44, user, { acao: 'Criação', modulo: 'Fiscal', entidade: 'NotaFiscal', registro_id: nfe?.id || null, descricao: `NF-e ${action} (NFe.io)`, dados_novos: { j }, empresa_id: empresaId });
        return Response.json({ ...j, modo: 'real' });
      }

      if (action === 'status') {
        const r = await fetch(`${base}/nfe/${nfeId}`, { headers });
        if (!r.ok) throw new Error(await r.text());
        const j = await r.json();
        await audit(base44, user, { acao: 'Visualização', modulo: 'Fiscal', entidade: 'NotaFiscal', registro_id: nfeId, descricao: 'Consulta status NF-e (NFe.io)', empresa_id: empresaId });
        return Response.json(j);
      }

      if (action === 'cancelar') {
        const r = await fetch(`${base}/nfe/${nfeId}/cancel`, { method: 'POST', headers, body: JSON.stringify({ reason: justificativa || 'Cancelado pelo sistema' }) });
        if (!r.ok) throw new Error(await r.text());
        const j = await r.json();
        await audit(base44, user, { acao: 'Cancelamento', modulo: 'Fiscal', entidade: 'NotaFiscal', registro_id: nfeId, descricao: 'Cancelamento NF-e (NFe.io)', dados_novos: { justificativa }, empresa_id: empresaId });
        return Response.json({ sucesso: true, protocolo: j?.protocol || j?.protocolo || null });
      }

      if (action === 'carta') {
        const r = await fetch(`${base}/nfe/${nfeId}/correction`, { method: 'POST', headers, body: JSON.stringify({ correction: correcao || '' }) });
        if (!r.ok) throw new Error(await r.text());
        const j = await r.json();
        await audit(base44, user, { acao: 'Edição', modulo: 'Fiscal', entidade: 'NotaFiscal', registro_id: nfeId, descricao: 'Carta de Correção (NFe.io)', dados_novos: { correcao }, empresa_id: empresaId });
        return Response.json({ sucesso: true, protocolo: j?.protocol || j?.protocolo || null });
      }
    }

    // Outros provedores: não implementado
    return Response.json({ error: 'Provedor não implementado' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});