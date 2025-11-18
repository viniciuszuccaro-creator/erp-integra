import React, { useEffect, useState } from 'react';

export default function DebugWidthIndicator() {
  const [width, setWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
      const main = document.querySelector('main');
      if (main) {
        setContainerWidth(main.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] font-mono text-xs">
      <div>Janela: {width}px</div>
      <div>Main: {containerWidth}px</div>
      <div className={containerWidth < width - 300 ? 'text-yellow-300 font-bold' : ''}>
        {containerWidth < width - 300 ? '⚠️ LIMITADO!' : '✅ OK'}
      </div>
    </div>
  );
}