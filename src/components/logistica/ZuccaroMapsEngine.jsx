import React from 'react';

/**
 * ETAPA 3: Zuccaro Maps Engine
 * Wrapper para integrações de mapas
 * Centraliza lógica de navegação/rastreamento
 */

export const ZuccaroMaps = {
  /**
   * Abre navegação para um endereço
   */
  navegarPara: (endereco) => {
    if (!endereco) return;
    
    const destino = typeof endereco === 'string' 
      ? endereco 
      : `${endereco.logradouro}, ${endereco.numero}, ${endereco.cidade} - ${endereco.estado}`;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}&travelmode=driving`;
    window.open(url, '_blank');
  },

  /**
   * Abre visualização de local específico
   */
  visualizarLocal: (lat, lng, zoom = 17) => {
    if (!lat || !lng) return;
    const url = `https://www.google.com/maps/@${lat},${lng},${zoom}z`;
    window.open(url, '_blank');
  },

  /**
   * Abre rota com múltiplas paradas
   */
  navegarRotaMultipla: (enderecos) => {
    if (!enderecos || enderecos.length === 0) return;
    
    const waypoints = enderecos
      .map(end => {
        if (!end) return null;
        if (typeof end === 'string') return end;
        return `${end.logradouro}, ${end.numero}, ${end.cidade} - ${end.estado}`;
      })
      .filter(Boolean)
      .map(addr => encodeURIComponent(addr))
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&waypoints=${waypoints}&travelmode=driving`;
    window.open(url, '_blank');
  },

  /**
   * Calcular distância entre dois pontos (haversine)
   */
  calcularDistancia: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distância em km
  },

  /**
   * Obter URL de imagem estática do mapa
   */
  getStaticMapUrl: (lat, lng, zoom = 15, width = 400, height = 300) => {
    // Usando serviço open source
    return `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=${width}&height=${height}&center=lonlat:${lng},${lat}&zoom=${zoom}&marker=lonlat:${lng},${lat};color:%23ff0000;size:medium`;
  }
};

/**
 * Componente de Mapa Estático
 */
export function MapaEstatico({ latitude, longitude, width = 400, height = 300, zoom = 15 }) {
  if (!latitude || !longitude) return null;

  return (
    <img
      src={ZuccaroMaps.getStaticMapUrl(latitude, longitude, zoom, width, height)}
      alt="Mapa"
      className="w-full rounded-lg border shadow-sm"
    />
  );
}

export default ZuccaroMaps;