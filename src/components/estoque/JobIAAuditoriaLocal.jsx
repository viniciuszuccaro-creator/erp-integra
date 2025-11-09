import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Job IA: Auditoria de Localização
 * Valida GPS do usuário vs LocalEstoque durante inventário
 */
export async function executarIAAuditoriaLocal(usuarioId, localEstoqueId, latUsuario, lngUsuario) {
  console.log('🧠 IA Auditoria de Local iniciada...');

  const localEstoque = await base44.entities.LocalEstoque.get(localEstoqueId);

  const latLocal = localEstoque.endereco_completo?.latitude;
  const lngLocal = localEstoque.endereco_completo?.longitude;

  if (!latLocal || !lngLocal) {
    console.log('⚠️ Local sem coordenadas GPS cadastradas.');
    return { validado: false, motivo: 'local_sem_gps' };
  }

  // Calcular distância (fórmula de Haversine simplificada)
  const R = 6371; // Raio da Terra em km
  const dLat = (latUsuario - latLocal) * Math.PI / 180;
  const dLng = (lngUsuario - lngLocal) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(latLocal * Math.PI / 180) * Math.cos(latUsuario * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanciaKm = R * c;
  const distanciaMetros = distanciaKm * 1000;

  // V21.4: Validação por proximidade
  const raioTolerancia = 100; // 100 metros
  const dentroDoLocal = distanciaMetros <= raioTolerancia;

  if (!dentroDoLocal) {
    // Criar alerta de auditoria
    await base44.entities.Notificacao.create({
      titulo: '🚨 Auditoria de Local - Divergência GPS',
      mensagem: `Usuário tentou realizar inventário fora do local!\n\n` +
        `Local Esperado: ${localEstoque.nome_local}\n` +
        `Coordenadas Local: ${latLocal}, ${lngLocal}\n` +
        `Coordenadas Usuário: ${latUsuario}, ${lngUsuario}\n` +
        `Distância: ${distanciaMetros.toFixed(0)} metros\n\n` +
        `Ação bloqueada por segurança.`,
      tipo: 'erro',
      categoria: 'Estoque',
      prioridade: 'Alta',
      destinatario_id: usuarioId
    });
  }

  console.log(dentroDoLocal 
    ? `✅ Usuário validado no local (${distanciaMetros.toFixed(0)}m)` 
    : `❌ Usuário fora do raio (${distanciaMetros.toFixed(0)}m)`
  );

  return {
    validado: dentroDoLocal,
    distancia_metros: distanciaMetros,
    raio_tolerancia: raioTolerancia,
    local_nome: localEstoque.nome_local
  };
}

export default executarIAAuditoriaLocal;