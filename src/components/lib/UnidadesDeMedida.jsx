// Unidades de Medida - dados exportados como módulo JS
export const UNIDADES = [
  { codigo: "UN", nome: "Unidade", abreviacao: "UN", tipo: "Quantidade", conversivel: false },
  { codigo: "PÇ", nome: "Peça", abreviacao: "PÇ", tipo: "Quantidade", conversivel: true, requer_fator: true },
  { codigo: "KG", nome: "Quilograma", abreviacao: "kg", tipo: "Peso", conversivel: true, base_estoque: true },
  { codigo: "MT", nome: "Metro", abreviacao: "m", tipo: "Comprimento", conversivel: true, requer_fator: true },
  { codigo: "TON", nome: "Tonelada", abreviacao: "ton", tipo: "Peso", conversivel: true, fator_fixo_kg: 1000 },
  { codigo: "BARRA", nome: "Barra", abreviacao: "barra", tipo: "Quantidade", conversivel: true, equivalente: "PÇ" },
  { codigo: "CX", nome: "Caixa", abreviacao: "cx", tipo: "Embalagem", conversivel: false },
  { codigo: "LT", nome: "Litro", abreviacao: "l", tipo: "Volume", conversivel: false },
  { codigo: "M2", nome: "Metro Quadrado", abreviacao: "m²", tipo: "Área", conversivel: false },
  { codigo: "M3", nome: "Metro Cúbico", abreviacao: "m³", tipo: "Volume", conversivel: false },
];

export default UNIDADES;