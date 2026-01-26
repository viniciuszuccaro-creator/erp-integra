import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, audit } from './_lib/guard.js';

async function emitirENotas(nfe, integracao, config) {
  const apiKey = integracao.api_key;
  const empresaProv = integracao.empresa_id_provedor;
  const payload = { tipo: 'NF-e', idExterno: nfe.id, ambienteEmissao: (config.ambiente === 'Produção' ? 'Producao' : 'Homologacao'), cliente: { tipoPessoa: (nfe.cliente_cpf_cnpj?.length === 14 ? 'J' : 'F'), nome: nfe.cliente_fornecedor, email: nfe.cliente_endereco?.email || '', cpfCnpj: nfe.cliente_cpf_cnpj?.replace(/\D/g, ''), telefone: nfe.cliente_endereco?.telefone?.replace(/\D/g, '') || '', endereco: { pais: 'Brasil', uf: nfe.cliente_endereco?.estado || '', cidade: nfe.cliente_endereco?.cidade || '', logradouro: nfe.cliente_endereco?.logradouro || '', numero: nfe.cliente_endereco?.numero || 'S/N', complemento: nfe.cliente_endereco?.complemento || '', bairro: nfe.cliente_endereco?.bairro || '', cep: nfe.cliente_endereco?.cep?.replace(/\D/g, '') || '' } }, produtos: (nfe.itens || []).map((it, i) => ({ numeroItem: i + 1, codigo: it.codigo_produto || '', descricao: it.descricao, ncm: it.ncm?.replace(/\D/g, '') || '', cfop: it.cfop || config.cfop_padrao_dentro_estado, unidadeMedida: it.unidade || 'UN', quantidade: it.quantidade, valorUnitario: it.valor_unitario, valorBruto: it.valor_total })), pedidoNumero: nfe.numero_pedido || nfe.numero, observacoes: nfe.informacoes_complementares || '' };
  const r = await fetch(`https://api.enotas.com.br/v2/empresas/${empresaProv}/nfes`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(apiKey + ':')}` }, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return { sucesso: true, nfeId: j.id, numero: j.numero, serie: j.serie, chave: j.chaveAcesso, protocolo: j.protocolo, dataAutorizacao: j.dataAutorizacao, xml: j.linkDownloadXml, pdf: j.linkDownloadPdf, status: j.status };
}

async function statusENotas(nfeId, integracao) {
  const r = await fetch(`https://api.enotas.com.br/v2/empresas/${integracao.empresa_id_provedor}/nfes/${nfeId}`, { headers: { Authorization: `Basic ${btoa(integracao.api_key + ':')}` } });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return { sucesso: true, status: j.status, protocolo: j.protocolo, dataAutorizacao: j.dataAutorizacao, xml: j.linkDownloadXml, pdf: j.linkDownloadPdf };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action = 'emitir', nfe, empresaId, nfeId, justificativa, correcao } = body || {};

    // Carrega config fiscal com service role
    const cfgs = await base44.asServiceRole.entities.ConfigFiscalEmpresa.filter({ empresa_id: empresaId });
    const config = cfgs?.[0] || null;
    const integracao = config?.integracao_nfe || null;

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
        return Response.json({ ...res, modo: 'real' });
      }
      if (action === 'status') {
        const res = await statusENotas(nfeId, integracao);
        return Response.json(res);
      }
      if (action === 'cancelar') {
        const r = await fetch(`https://api.enotas.com.br/v2/empresas/${integracao.empresa_id_provedor}/nfes/${nfeId}/cancelamento`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(integracao.api_key + ':')}` }, body: JSON.stringify({ motivo: justificativa || 'Cancelado pelo sistema' }) });
        if (!r.ok) throw new Error(await r.text());
        const j = await r.json();
        return Response.json({ sucesso: true, protocolo: j.protocolo });
      }
      if (action === 'carta') {
        const r = await fetch(`https://api.enotas.com.br/v2/empresas/${integracao.empresa_id_provedor}/nfes/${nfeId}/cartaCorrecao`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(integracao.api_key + ':')}` }, body: JSON.stringify({ correcao: correcao || '' }) });
        if (!r.ok) throw new Error(await r.text());
        const j = await r.json();
        return Response.json({ sucesso: true, protocolo: j.protocolo });
      }
    }

    // Outros provedores: não implementado
    return Response.json({ error: 'Provedor não implementado' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});