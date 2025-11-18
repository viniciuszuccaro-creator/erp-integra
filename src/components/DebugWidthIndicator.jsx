import React, { useEffect, useState } from 'react';

export default function DebugWidthIndicator() {
  const [width, setWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
      const main = document.querySelector('main');
      const contentDiv = main?.querySelector('.flex-1.overflow-auto');
      if (contentDiv) {
        setContainerWidth(contentDiv.offsetWidth);
      } else if (main) {
        setContainerWidth(main.offsetWidth);
      }
    };

    updateWidth();
    const interval = setInterval(updateWidth, 500); // Atualiza a cada 500ms
    window.addEventListener('resize', updateWidth);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const isLimited = containerWidth < width - 300;
  const percentage = width > 0 ? ((containerWidth / width) * 100).toFixed(1) : 0;

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-2xl z-[9999] font-mono text-xs border-2 ${
      isLimited ? 'bg-red-600 border-red-400' : 'bg-green-600 border-green-400'
    } text-white`}>
      <div className="font-bold mb-1">{isLimited ? '⚠️ PROBLEMA DETECTADO' : '✅ LAYOUT OK'}</div>
      <div>Viewport: {width}px</div>
      <div>Área útil: {containerWidth}px</div>
      <div className="font-bold mt-1">Uso: {percentage}%</div>
      {isLimited && (
        <div className="mt-2 pt-2 border-t border-red-400 text-yellow-300 font-bold">
          LAYOUT LIMITADO!
        </div>
      )}
    </div>
  );
}