import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function DescricaoAutomaticaArmado({ dados }) {
  // Gera descrição automática baseada nos dados
  const gerarDescricao = () => {
    if (!dados) return "";

    const {
      quantidade = 1,
      tipo_peca = "ELEMENTO",
      comprimento = 0,
      estribo_largura = 0,
      estribo_altura = 0,
      ferro_principal_quantidade = 0,
      ferro_principal_bitola = "10.0",
      estribo_distancia = 0
    } = dados;

    // Formata comprimento em metros
    const comprimentoMetros = (comprimento / 100).toFixed(2);

    // Remove "mm" da bitola se vier com
    const bitola = String(ferro_principal_bitola).replace('mm', '');

    const descricao = `${quantidade} ${tipo_peca.toUpperCase()} de ${comprimentoMetros}m – Estribo ${estribo_largura}x${estribo_altura} – ${ferro_principal_quantidade} ferros ${bitola}mm – Estribos a cada ${estribo_distancia}cm`;

    return descricao;
  };

  const descricao = gerarDescricao();

  if (!descricao) return null;

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <div className="flex items-start gap-3">
        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-800 mb-1">📋 Descrição Automática:</p>
          <p className="text-base font-bold text-slate-900 leading-relaxed">
            {descricao}
          </p>
          <Badge className="bg-blue-600 mt-2">Gerado Automaticamente</Badge>
        </div>
      </div>
    </div>
  );
}