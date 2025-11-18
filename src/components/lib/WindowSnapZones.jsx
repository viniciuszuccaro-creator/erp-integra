import { useState, useEffect } from 'react';

/**
 * 📐 SNAP TO EDGES - Sistema de Encaixe de Janelas
 * 
 * Detecta quando janela está sendo arrastada próxima às bordas
 * e mostra preview de onde ela vai encaixar
 */

export function WindowSnapZones({ windowId, isDragging, position, onSnap }) {
  const [snapZone, setSnapZone] = useState(null);
  const SNAP_THRESHOLD = 30; // pixels da borda para ativar snap

  useEffect(() => {
    if (!isDragging) {
      setSnapZone(null);
      return;
    }

    const detectSnapZone = () => {
      const { x, y } = position;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Topo
      if (y < SNAP_THRESHOLD) {
        setSnapZone('top');
        return;
      }

      // Esquerda
      if (x < SNAP_THRESHOLD) {
        setSnapZone('left');
        return;
      }

      // Direita
      if (x > screenWidth - SNAP_THRESHOLD) {
        setSnapZone('right');
        return;
      }

      // Baixo
      if (y > screenHeight - SNAP_THRESHOLD) {
        setSnapZone('bottom');
        return;
      }

      // Cantos
      if (x < SNAP_THRESHOLD && y < SNAP_THRESHOLD) {
        setSnapZone('top-left');
        return;
      }

      if (x > screenWidth - SNAP_THRESHOLD && y < SNAP_THRESHOLD) {
        setSnapZone('top-right');
        return;
      }

      if (x < SNAP_THRESHOLD && y > screenHeight - SNAP_THRESHOLD) {
        setSnapZone('bottom-left');
        return;
      }

      if (x > screenWidth - SNAP_THRESHOLD && y > screenHeight - SNAP_THRESHOLD) {
        setSnapZone('bottom-right');
        return;
      }

      setSnapZone(null);
    };

    detectSnapZone();
  }, [isDragging, position]);

  const getSnapDimensions = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const halfWidth = screenWidth / 2;
    const halfHeight = screenHeight / 2;

    switch (snapZone) {
      case 'top':
        return { x: 0, y: 0, width: screenWidth, height: screenHeight };
      case 'left':
        return { x: 0, y: 0, width: halfWidth, height: screenHeight };
      case 'right':
        return { x: halfWidth, y: 0, width: halfWidth, height: screenHeight };
      case 'bottom':
        return { x: 0, y: 0, width: screenWidth, height: screenHeight };
      case 'top-left':
        return { x: 0, y: 0, width: halfWidth, height: halfHeight };
      case 'top-right':
        return { x: halfWidth, y: 0, width: halfWidth, height: halfHeight };
      case 'bottom-left':
        return { x: 0, y: halfHeight, width: halfWidth, height: halfHeight };
      case 'bottom-right':
        return { x: halfWidth, y: halfHeight, width: halfWidth, height: halfHeight };
      default:
        return null;
    }
  };

  const handleMouseUp = () => {
    if (snapZone && onSnap) {
      onSnap(getSnapDimensions());
    }
    setSnapZone(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging, snapZone]);

  if (!snapZone) return null;

  const dimensions = getSnapDimensions();

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: dimensions.x,
        top: dimensions.y,
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        border: '2px solid rgba(59, 130, 246, 0.5)',
        transition: 'all 0.2s ease'
      }}
    />
  );
}

export default WindowSnapZones;