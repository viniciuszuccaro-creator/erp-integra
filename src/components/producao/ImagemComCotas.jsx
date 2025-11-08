import React from "react";
import { Card } from "@/components/ui/card";

/**
 * Componente que desenha uma peça de corte/dobra com cotas
 * Mostra visualmente as medidas da peça
 */
export default function ImagemComCotas({ 
  tipoPeca, 
  comprimento, 
  largura, 
  altura,
  dobraLado1 = 0,
  dobraLado2 = 0,
  bitola 
}) {
  const escala = 2; // Escala de pixels por cm
  const margin = 60;

  const larguraSVG = Math.max(comprimento, largura, 200) * escala + margin * 2;
  const alturaSVG = Math.max(altura, 100) * escala + margin * 2;

  const desenharEstribo = () => {
    const w = comprimento * escala;
    const h = altura * escala;
    const x = margin;
    const y = margin;

    return (
      <g>
        {/* Retângulo principal */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
        />

        {/* Cotas */}
        {/* Comprimento */}
        <g>
          <line x1={x} y1={y - 30} x2={x + w} y2={y - 30} stroke="#64748b" strokeWidth="1" />
          <line x1={x} y1={y - 35} x2={x} y2={y - 25} stroke="#64748b" strokeWidth="1" />
          <line x1={x + w} y1={y - 35} x2={x + w} y2={y - 25} stroke="#64748b" strokeWidth="1" />
          <text x={x + w / 2} y={y - 35} textAnchor="middle" fontSize="14" fill="#1e293b" fontWeight="bold">
            {comprimento} cm
          </text>
        </g>

        {/* Altura */}
        <g>
          <line x1={x + w + 30} y1={y} x2={x + w + 30} y2={y + h} stroke="#64748b" strokeWidth="1" />
          <line x1={x + w + 25} y1={y} x2={x + w + 35} y2={y} stroke="#64748b" strokeWidth="1" />
          <line x1={x + w + 25} y1={y + h} x2={x + w + 35} y2={y + h} stroke="#64748b" strokeWidth="1" />
          <text 
            x={x + w + 40} 
            y={y + h / 2} 
            textAnchor="start" 
            fontSize="14" 
            fill="#1e293b" 
            fontWeight="bold"
            transform={`rotate(90, ${x + w + 40}, ${y + h / 2})`}
          >
            {altura} cm
          </text>
        </g>

        {/* Dobras */}
        {dobraLado1 > 0 && (
          <g>
            <line 
              x1={x} 
              y1={y} 
              x2={x - dobraLado1 * escala} 
              y2={y} 
              stroke="#dc2626" 
              strokeWidth="3" 
              strokeDasharray="5,5"
            />
            <text x={x - dobraLado1 * escala / 2} y={y - 10} textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight="bold">
              ↓ {dobraLado1} cm
            </text>
          </g>
        )}

        {dobraLado2 > 0 && (
          <g>
            <line 
              x1={x + w} 
              y1={y} 
              x2={x + w + dobraLado2 * escala} 
              y2={y} 
              stroke="#dc2626" 
              strokeWidth="3" 
              strokeDasharray="5,5"
            />
            <text x={x + w + dobraLado2 * escala / 2} y={y - 10} textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight="bold">
              ↓ {dobraLado2} cm
            </text>
          </g>
        )}

        {/* Bitola */}
        <text x={x + w / 2} y={y + h / 2} textAnchor="middle" fontSize="16" fill="#2563eb" fontWeight="bold">
          ⌀ {bitola}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <svg width={larguraSVG} height={alturaSVG} className="mx-auto">
        {desenharEstribo()}
      </svg>
      <div className="text-center mt-3">
        <p className="text-xs text-slate-600">
          {tipoPeca} • Bitola {bitola}
          {dobraLado1 > 0 && ` • Dobra Lado 1: ${dobraLado1}cm`}
          {dobraLado2 > 0 && ` • Dobra Lado 2: ${dobraLado2}cm`}
        </p>
      </div>
    </div>
  );
}