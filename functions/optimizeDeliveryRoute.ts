import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence } from './_lib/guard.js';

// Otimização de rotas de entrega (multiempresa) usando Google Directions API
// Payload esperado:
// {
//   empresa_id: string,                // obrigatório
//   group_id?: string,                 // opcional
//   entrega_ids?: string[],            // se não informado, busca entregas pendentes
//   origem?: { lat: number, lng: number } | string, // se não informado, tenta Empresa.endereco
//   modo?: 'driving'|'bicycling'|'walking'|'transit' // default 'driving'
// }
// Retorno: { ok, total_distance_m, total_duration_s, ordered, api_mode }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user, perfil } = await getUserAndPerfil(base44);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const empresa_id = body?.empresa_id || null;
    const group_id = body?.group_id || null;

    // Contexto obrigatório
    const ctxErr = assertContextPresence({ empresa_id, group_id }, true);
    if (ctxErr) return ctxErr;

    // RBAC: módulo Expedição → Roteirização (executar)
    const denied = await assertPermission(base44, { user, perfil }, 'Expedição', 'Roteirizacao', 'executar');
    if (denied) return denied;

    // Carregar entregas alvo
    let entregas = [];
    const ids = Array.isArray(body?.entrega_ids) ? body.entrega_ids.filter(Boolean) : [];
    if (ids.length > 0) {
      // Busca por IDs
      const lotSize = 50;
      for (let i = 0; i < ids.length; i += lotSize) {
        const slice = ids.slice(i, i + lotSize);
        const part = await base44.asServiceRole.entities.Entrega.filter({ empresa_id, id: { $in: slice } }, undefined, slice.length);
        entregas.push(...(part || []));
      }
    } else {
      // Critério padrão: entregas pendentes para a empresa (ajuste conforme seu fluxo)
      entregas = await base44.asServiceRole.entities.Entrega.filter(
        { empresa_id, status: { $in: ['Pronto para Expedir', 'Saiu para Entrega', 'Em Trânsito'] } },
        undefined,
        50
      );
    }

    if (!entregas || entregas.length === 0) {
      return Response.json({ ok: true, ordered: [], total_distance_m: 0, total_duration_s: 0, api_mode: 'none' });
    }

    // Resolver origem: payload.origem → Empresa.endereco → 1º ponto
    const origemIn = body?.origem || null;
    let originStr = '';
    const asLatLng = (x) => typeof x?.lat === 'number' && typeof x?.lng === 'number' ? `${x.lat},${x.lng}` : null;

    if (typeof origemIn === 'string') {
      originStr = origemIn;
    } else if (origemIn && asLatLng(origemIn)) {
      originStr = asLatLng(origemIn);
    }

    if (!originStr) {
      // Tenta Empresa
      const emp = await base44.asServiceRole.entities.Empresa.filter({ id: empresa_id }, undefined, 1).then(r => r?.[0]).catch(() => null);
      const endereco = emp?.endereco_principal || emp?.endereco || null;
      if (endereco) {
        const lat = endereco.latitude ?? endereco.lat;
        const lng = endereco.longitude ?? endereco.lng;
        if (typeof lat === 'number' && typeof lng === 'number') {
          originStr = `${lat},${lng}`;
        } else {
          const parts = [endereco.logradouro, endereco.numero, endereco.bairro, endereco.cidade, endereco.estado, endereco.cep].filter(Boolean);
          if (parts.length) originStr = parts.join(', ');
        }
      }
    }

    // Fallback: usa o primeiro destino como origem
    const toAddr = (e) => {
      const end = e?.endereco_entrega_completo || e?.endereco || {};
      const lat = end.latitude ?? end.lat;
      const lng = end.longitude ?? end.lng;
      if (typeof lat === 'number' && typeof lng === 'number') return `${lat},${lng}`;
      const p = [end.logradouro, end.numero, end.complemento, end.bairro, end.cidade, end.estado, end.cep].filter(Boolean);
      return p.length ? p.join(', ') : (end?.link_google_maps || '');
    };

    const rawStops = entregas.map((e) => ({ id: e.id, label: e.cliente_nome || e.numero_pedido || e.id, addr: toAddr(e) }));
    if (!originStr) originStr = rawStops[0].addr;

    // Waypoints (até limite Directions: ~25 pontos incluindo origem/destino)
    const modo = (body?.modo || 'driving');
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) return Response.json({ error: 'Missing GOOGLE_MAPS_API_KEY' }, { status: 500 });

    const maxPoints = 25; // Directions API typical limit (may vary by plan)
    const usableStops = rawStops.slice(0, Math.min(rawStops.length, maxPoints - 1));

    // Monta request Directions com optimize:true
    const destination = usableStops[usableStops.length - 1].addr;
    const via = usableStops.slice(0, usableStops.length - 1).map(s => encodeURIComponent(s.addr));
    const waypointsParam = via.length ? `optimize:true|${via.join('|')}` : 'optimize:true';

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destination)}&waypoints=${waypointsParam}&mode=${encodeURIComponent(modo)}&language=pt-BR&key=${apiKey}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      const txt = await resp.text();
      return Response.json({ error: 'Maps request failed', details: txt }, { status: 502 });
    }
    const data = await resp.json();
    const route = data?.routes?.[0];
    if (!route) return Response.json({ error: 'No route' }, { status: 502 });

    const order = route.waypoint_order || [];
    const legs = route.legs || [];

    let total_distance_m = 0;
    let total_duration_s = 0;
    for (const l of legs) {
      total_distance_m += l?.distance?.value || 0;
      total_duration_s += l?.duration?.value || 0;
    }

    // Reordena paradas conforme waypoint_order (aplica sobre via; destino final já é o último)
    const reordered = order.map((idx) => usableStops[idx]).concat([usableStops[usableStops.length - 1]]);

    // Monta resposta ordenada com IDs originais
    const idByAddr = new Map(usableStops.map(s => [s.addr, s.id]));
    const ordered = reordered.map((s) => ({ entrega_id: s.id, label: s.label, address: s.addr }));

    // Auditoria
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email || 'Usuário',
        usuario_id: user.id,
        empresa_id,
        group_id: group_id || null,
        acao: 'Execução',
        modulo: 'Expedição',
        tipo_auditoria: 'integracao',
        entidade: 'Roteirizacao',
        descricao: `Rota otimizada para ${ordered.length} paradas`,
        dados_novos: { origem: originStr, modo, stops: usableStops.length, total_distance_m, total_duration_s },
        data_hora: new Date().toISOString(),
        sucesso: true
      });
    } catch {}

    return Response.json({ ok: true, total_distance_m, total_duration_s, ordered, api_mode: modo });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});