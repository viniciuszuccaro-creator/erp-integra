/**
 * ETAPA 3: Validações de Entrega
 * Regras de negócio centralizadas
 */

export const podeIniciarEntrega = (entrega) => {
  if (entrega.status !== 'Pronto para Expedir') {
    return { pode: false, motivo: 'Status deve ser "Pronto para Expedir"' };
  }

  if (!entrega.motorista_id) {
    return { pode: false, motivo: 'Motorista não definido' };
  }

  if (!entrega.endereco_entrega_completo) {
    return { pode: false, motivo: 'Endereço de entrega incompleto' };
  }

  return { pode: true, motivo: null };
};

export const podeConfirmarEntrega = (entrega) => {
  if (!['Saiu para Entrega', 'Em Trânsito'].includes(entrega.status)) {
    return { pode: false, motivo: 'Entrega não está em trânsito' };
  }

  return { pode: true, motivo: null };
};

export const podeRegistrarReversa = (entrega) => {
  if (!['Saiu para Entrega', 'Em Trânsito', 'Entregue'].includes(entrega.status)) {
    return { pode: false, motivo: 'Status inválido para logística reversa' };
  }

  if (entrega.logistica_reversa?.ativada) {
    return { pode: false, motivo: 'Logística reversa já foi registrada' };
  }

  return { pode: true, motivo: null };
};

export const calcularPrazoPendente = (entrega) => {
  if (!entrega.data_previsao) return null;

  const hoje = new Date();
  const previsao = new Date(entrega.data_previsao);
  const diff = previsao - hoje;
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return {
    dias,
    atrasada: dias < 0,
    urgente: dias >= 0 && dias <= 1,
    texto: dias < 0 ? `${Math.abs(dias)}d atrasado` :
           dias === 0 ? 'Hoje' :
           dias === 1 ? 'Amanhã' :
           `Em ${dias} dias`
  };
};

export const validarEnderecoCoordenadas = (endereco) => {
  if (!endereco) return { valido: false, motivo: 'Endereço ausente' };
  
  const camposObrigatorios = ['logradouro', 'numero', 'cidade', 'estado', 'cep'];
  const faltando = camposObrigatorios.filter(campo => !endereco[campo]);
  
  if (faltando.length > 0) {
    return { valido: false, motivo: `Faltam: ${faltando.join(', ')}` };
  }

  if (!endereco.latitude || !endereco.longitude) {
    return { valido: true, avisoGPS: true, motivo: 'Sem coordenadas GPS (navegação manual)' };
  }

  return { valido: true, avisoGPS: false, motivo: null };
};