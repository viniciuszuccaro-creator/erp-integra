/**
 * ETAPA 3: Helpers para Cálculo de Métricas de Entrega
 * Funções utilitárias reutilizáveis
 */

export const calcularTempoMedioEntrega = (entregas) => {
  const entregues = entregas.filter(e => e.status === 'Entregue' && e.data_saida && e.data_entrega);
  
  if (entregues.length === 0) return 0;

  const tempoTotal = entregues.reduce((sum, e) => {
    const saida = new Date(e.data_saida);
    const entrega = new Date(e.data_entrega);
    const diff = (entrega - saida) / (1000 * 60); // minutos
    return sum + diff;
  }, 0);

  return tempoTotal / entregues.length;
};

export const calcularTaxaSucessoEntrega = (entregas) => {
  const total = entregas.filter(e => ['Entregue', 'Entrega Frustrada'].includes(e.status)).length;
  const sucesso = entregas.filter(e => e.status === 'Entregue').length;
  
  return total > 0 ? (sucesso / total) * 100 : 100;
};

export const calcularDistanciaTotal = (rotas) => {
  return rotas.reduce((sum, r) => sum + (r.distancia_total_km || 0), 0);
};

export const obterProximaEntrega = (entregas, motorista_id) => {
  const entregasMotorista = entregas.filter(e => 
    e.motorista_id === motorista_id &&
    ['Pronto para Expedir', 'Saiu para Entrega'].includes(e.status)
  );

  // Ordenar por prioridade e data
  return entregasMotorista.sort((a, b) => {
    const prioridades = { 'Urgente': 1, 'Alta': 2, 'Normal': 3, 'Baixa': 4 };
    const prioA = prioridades[a.prioridade] || 99;
    const prioB = prioridades[b.prioridade] || 99;
    
    if (prioA !== prioB) return prioA - prioB;
    
    return new Date(a.data_previsao) - new Date(b.data_previsao);
  })[0] || null;
};

export const formatarEnderecoCompleto = (endereco) => {
  if (!endereco) return 'Endereço não disponível';
  
  return `${endereco.logradouro}, ${endereco.numero}${endereco.complemento ? ` - ${endereco.complemento}` : ''}, ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}, CEP ${endereco.cep}`;
};

export const calcularETA = (distancia_km, velocidade_media_kmh = 40) => {
  const tempo_horas = distancia_km / velocidade_media_kmh;
  const tempo_minutos = tempo_horas * 60;
  
  return {
    horas: Math.floor(tempo_horas),
    minutos: Math.round(tempo_minutos % 60),
    total_minutos: Math.round(tempo_minutos)
  };
};

export const validarPODCompleto = (comprovante) => {
  if (!comprovante) return { valido: false, motivo: 'Sem comprovante' };
  
  const erros = [];
  
  if (!comprovante.foto_comprovante) erros.push('Foto');
  if (!comprovante.assinatura_digital) erros.push('Assinatura');
  if (!comprovante.nome_recebedor) erros.push('Nome do recebedor');
  if (!comprovante.latitude_entrega || !comprovante.longitude_entrega) erros.push('Geolocalização');
  
  return {
    valido: erros.length === 0,
    motivo: erros.length > 0 ? `Faltam: ${erros.join(', ')}` : 'Completo'
  };
};