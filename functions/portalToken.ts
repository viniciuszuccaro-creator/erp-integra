import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Utilidades de criptografia (HMAC SHA-256)
async function importKey(secret) {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function b64urlEncode(bytes) {
  const bin = Array.from(new Uint8Array(bytes))
    .map((b) => String.fromCharCode(b))
    .join('');
  return btoa(bin).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlEncodeString(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function b64urlDecodeString(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 2 ? '==' : b64.length % 4 === 3 ? '=' : '';
  return decodeURIComponent(escape(atob(b64 + pad)));
}

async function sign(secret, payload) {
  const key = await importKey(secret);
  const enc = new TextEncoder();
  const data = enc.encode(payload);
  const mac = await crypto.subtle.sign('HMAC', key, data);
  return b64urlEncode(mac);
}

function nowEpoch() {
  return Math.floor(Date.now() / 1000);
}

// Sanitiza entidade (exposição mínima)
function sanitizeEntity(entityName, row) {
  if (!row) return null;
  const base = {
    id: row.id,
    empresa_id: row.empresa_id || null,
    group_id: row.group_id || null,
    created_date: row.created_date,
    updated_date: row.updated_date,
  };
  if (entityName === 'Pedido') {
    return {
      ...base,
      numero_pedido: row.numero_pedido,
      data_pedido: row.data_pedido,
      cliente_nome: row.cliente_nome,
      valor_total: row.valor_total,
      status: row.status,
    };
  }
  if (entityName === 'ContaReceber') {
    return {
      ...base,
      descricao: row.descricao,
      numero_documento: row.numero_documento,
      data_vencimento: row.data_vencimento,
      valor: row.valor,
      status: row.status,
      url_boleto_pdf: row.url_boleto_pdf || null,
      pix_copia_cola: row.pix_copia_cola || null,
      pix_qrcode: row.pix_qrcode || null,
    };
  }
  if (entityName === 'NotaFiscal') {
    return {
      ...base,
      numero: row.numero,
      serie: row.serie,
      data_emissao: row.data_emissao,
      valor_total: row.valor_total,
      status: row.status,
      pdf_danfe: row.pdf_danfe || row.danfe_url || null,
      xml_nfe: row.xml_nfe || row.xml_url || null,
    };
  }
  if (entityName === 'Entrega') {
    return {
      ...base,
      numero_pedido: row.numero_pedido,
      status: row.status,
      data_previsao: row.data_previsao || null,
      link_publico_rastreamento: row.link_publico_rastreamento || null,
      codigo_rastreamento: row.codigo_rastreamento || null,
    };
  }
  if (entityName === 'Cliente') {
    return {
      ...base,
      nome: row.nome || row.razao_social,
      nome_fantasia: row.nome_fantasia || null,
    };
  }
  // fallback: não expor campos extras
  return base;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, subject, entity_id, ttl_minutes, extra_scope } = await req.json().catch(() => ({}));
    const secret = Deno.env.get('PORTAL_TOKEN_SECRET');

    if (!secret) {
      return Response.json({ error: 'Missing secret' }, { status: 500 });
    }

    // CREATE: requer usuário autenticado
    if (action === 'create') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      // validações mínimas
      const allowed = new Set(['Pedido', 'ContaReceber', 'NotaFiscal', 'Entrega', 'Cliente']);
      if (!allowed.has(subject)) {
        return Response.json({ error: 'Subject not allowed' }, { status: 400 });
      }
      if (!entity_id) {
        return Response.json({ error: 'entity_id required' }, { status: 400 });
      }

      const exp = nowEpoch() + Math.max(60, Math.min(60 * 60 * 24, (ttl_minutes || 60) * 60)); // min 1h, máx 24h
      const header = b64urlEncodeString(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payloadObj = { sub: subject, id: String(entity_id), exp, v: 1, s: extra_scope || null };
      const payload = b64urlEncodeString(JSON.stringify(payloadObj));
      const signature = await sign(secret, `${header}.${payload}`);
      const token = `${header}.${payload}.${signature}`;

      // auditoria
      try {
        await base44.entities.AuditLog.create({
          acao: 'Criação', modulo: 'Portal', tipo_auditoria: 'sistema', entidade: 'PortalToken',
          descricao: `Gerado token externo para ${subject}:${entity_id} (${Math.round((exp - nowEpoch())/60)}min)`,
          data_hora: new Date().toISOString(),
          usuario: user.full_name || user.email || 'Usuário',
          usuario_id: user.id,
        });
      } catch (_) {}

      return Response.json({ token, exp });
    }

    // VALIDATE: não requer usuário; retorna dados mínimos
    if (action === 'validate') {
      if (!req.body) return Response.json({ error: 'No payload' }, { status: 400 });
      const { token } = await req.json().catch(() => ({}));
      if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        return Response.json({ error: 'Invalid token' }, { status: 400 });
      }
      const [h, p, sig] = token.split('.');
      const expected = await sign(secret, `${h}.${p}`);
      if (expected !== sig) {
        return Response.json({ error: 'Signature mismatch' }, { status: 401 });
      }
      let payload;
      try {
        payload = JSON.parse(b64urlDecodeString(p));
      } catch (_e) {
        return Response.json({ error: 'Bad payload' }, { status: 400 });
      }
      if (!payload?.sub || !payload?.id || !payload?.exp) {
        return Response.json({ error: 'Malformed token' }, { status: 400 });
      }
      if (nowEpoch() >= payload.exp) {
        return Response.json({ error: 'Expired' }, { status: 401 });
      }

      // Busca segura via service role
      const name = String(payload.sub);
      const id = String(payload.id);
      const api = base44.asServiceRole.entities?.[name];
      if (!api || !api.filter) {
        return Response.json({ error: 'Unsupported entity' }, { status: 400 });
      }
      const rows = await api.filter({ id }, undefined, 1);
      const row = rows?.[0] || null;
      if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

      // Sanitiza e retorna
      const data = sanitizeEntity(name, row);

      // auditoria leve (sem usuário)
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          acao: 'Visualização', modulo: 'Portal', tipo_auditoria: 'sistema', entidade: 'PortalToken',
          descricao: `Token validado para ${name}:${id}`,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}

      return Response.json({ ok: true, subject: name, data, exp: payload.exp, scope: payload.s || null });
    }

    return Response.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
});