import React, { useEffect, useState } from 'react';

/**
 * Indicador Visual de Largura - V21.1.2-FINAL
 * Threshold ajustado: 65% (considera sidebar de 15-20%)
 */
export default function DebugWidthIndicator() {
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const updateWidths = () => {
      setViewportWidth(window.innerWidth);
      
      const main = document.querySelector('main');
      const contentDiv = main?.querySelector('.overflow-auto, .flex-1');
      
      if (contentDiv) {
        setContentWidth(contentDiv.offsetWidth);
      } else if (main) {
        setContentWidth(main.offsetWidth);
      }
    };

    updateWidths();
    const interval = setInterval(updateWidths, 500);
    window.addEventListener('resize', updateWidths);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateWidths);
    };
  }, []);

  const layoutLimitado = (contentWidth / viewportWidth) < 0.65; // Ajustado: 70% → 65%
  const percentualUso = ((contentWidth / viewportWidth) * 100).toFixed(1);

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] p-4 rounded-lg shadow-xl border-2 ${
      layoutLimitado 
        ? 'bg-red-50 border-red-400' 
        : 'bg-green-50 border-green-400'
    }`}>
      <div className="space-y-1">
        <div className={`font-bold text-sm ${layoutLimitado ? 'text-red-900' : 'text-green-900'}`}>
          {layoutLimitado ? '⚠️ LAYOUT LIMITADO' : '✅ LAYOUT OK'}
        </div>
        <div className="text-xs text-slate-700">
          <div>Viewport: <span className="font-bold">{viewportWidth}px</span></div>
          <div>Área útil: <span className="font-bold">{contentWidth}px</span></div>
          <div className="mt-2 pt-2 border-t border-slate-300">
            <div className={`font-bold ${layoutLimitado ? 'text-red-700' : 'text-green-700'}`}>
              Uso: {percentualUso}%
            </div>
          </div>
        </div>
        {layoutLimitado && (
          <div className="mt-2 pt-2 border-t border-red-300 text-xs text-red-700">
            <div className="font-bold">PROBLEMA!</div>
            <div>Esperado: ≥ 65%</div>
            <div>Pressione F12 para inspecionar</div>
          </div>
        )}
      </div>
    </div>
  );
}