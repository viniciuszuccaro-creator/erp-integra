import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Sanitização genérica de entradas para entidades críticas (previne XSS e payloads suspeitos)
// Acionado por automações de entidade em events: create/update
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let payload = {};
    try { payload = await req.json(); } catch { payload = {}; }

    const event = payload?.event;
    const data = payload?.data;
    const oldData = payload?.old_data;

    if (!event || !event.entity_name || !event.entity_id || !data) {
      return Response.json({ ok: true, skipped: true, reason: 'Payload incompleto' });
    }

    // Função de sanitização simples: remove tags <script>, eventos inline e URLs javascript:
    const sanitizeString = (s) => {
      let out = String(s);
      out = out.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
      out = out.replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '');
      out = out.replace(/on[a-z]+\s*=\s*'[^']*'/gi, '');
      out = out.replace(/javascript:\s*/gi, '');
      return out;
    };

    const sanitizeValue = (v) => {
      if (typeof v === 'string') return sanitizeString(v);
      if (Array.isArray(v)) return v.map((x) => sanitizeValue(x));
      if (v && typeof v === 'object') {
        const o = {};
        for (const [k, val] of Object.entries(v)) o[k] = sanitizeValue(val);
        return o;
      }
      return v;
    };

    const sanitized = sanitizeValue(data);

    // Enriquecimento de contexto: se faltar group_id mas houver empresa_id, obtém do cadastro da empresa
    let enriched = sanitized;
    try {
      if (!enriched?.group_id && data?.empresa_id) {
        const empresas = await base44.asServiceRole.entities.Empresa.filter({ id: data.empresa_id });
        const emp = Array.isArray(empresas) ? empresas[0] : null;
        if (emp?.group_id) {
          enriched = { ...enriched, group_id: emp.group_id };
        }
      }
    } catch {}

    // Criptografia de campos sensíveis (AES-GCM com BACKUP_ENCRYPTION_KEY)
    async function getCryptoKey() {
      const secret = Deno.env.get('BACKUP_ENCRYPTION_KEY');
      if (!secret) return null;
      const enc = new TextEncoder();
      const raw = await crypto.subtle.digest('SHA-256', enc.encode(secret));
      return await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt']);
    }
    const b64 = (buf) => {
      const bytes = new Uint8Array(buf);
      let bin = '';
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    };
    async function encryptValue(plain, key) {
      const enc = new TextEncoder();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(String(plain)));
      return { enc: 'gcm/v1', iv: b64(iv), data: b64(cipher) };
    }
    async function encryptSensitive(obj, entity) {
      const key = await getCryptoKey();
      if (!key) return obj;
      const SENSITIVE_KEYS = new Set(['numero_autorizacao', 'pix_chave', 'conta', 'agencia', 'cartao']);
      const walk = async (val, parentKey = '') => {
        if (Array.isArray(val)) {
          const out = [];
          for (const item of val) out.push(await walk(item, parentKey));
          return out;
        }
        if (val && typeof val === 'object') {
          const out = {};
          for (const [k, v] of Object.entries(val)) {
            const pathKey = k.toLowerCase();
            if (SENSITIVE_KEYS.has(pathKey) && (typeof v === 'string' || typeof v === 'number')) {
              out[k] = await encryptValue(v, key);
            } else {
              out[k] = await walk(v, k);
            }
          }
          return out;
        }
        return val;
      };
      // Limitar a escopos conhecidos (detalhes_pagamento)
      if (obj?.detalhes_pagamento) {
        const clone = { ...obj, detalhes_pagamento: await walk(obj.detalhes_pagamento) };
        return clone;
      }
      return obj;
    }

    const secured = await encryptSensitive(enriched, event.entity_name);

    // Construir patch somente com campos alterados (ignorar built-ins)
    const BUILT_INS = new Set(['id', 'created_date', 'updated_date', 'created_by']);

    const diffPatch = (orig, clean) => {
      const patch = {};
      for (const [k, v] of Object.entries(clean)) {
        if (BUILT_INS.has(k)) continue;
        const ov = orig?.[k];
        const same = JSON.stringify(ov) === JSON.stringify(v);
        if (!same) patch[k] = v;
      }
      return patch;
    };

    const patch = diffPatch(data, secured);

    if (Object.keys(patch).length > 0) {
      await base44.asServiceRole.entities[event.entity_name].update(event.entity_id, patch);

      // Auditoria
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: 'Sistema',
          acao: 'Edição',
          modulo: 'Sistema',
          entidade: event.entity_name,
          registro_id: event.entity_id,
          descricao: 'Sanitização automática aplicada (prevenção XSS/injeções).',
          empresa_id: enriched?.empresa_id || data?.empresa_id || null,
          dados_anteriores: oldData || null,
          dados_novos: { ...patch, group_id: enriched?.group_id || data?.group_id || null },
          data_hora: new Date().toISOString(),
        });
      } catch {}
    }

    return Response.json({ ok: true, changed: Object.keys(patch).length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});