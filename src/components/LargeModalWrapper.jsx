import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

/**
 * 🪟 LARGE MODAL WRAPPER - V21.1
 * 
 * Modal grande padrão para formulários e detalhes
 * DEPRECATED: Use useUniversalWindow() ao invés
 */
export default function LargeModalWrapper({ 
  open, 
  onOpenChange, 
  title, 
  description,
  children,
  size = 'large' // 'small' | 'medium' | 'large' | 'fullscreen'
}) {
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-6xl',
    fullscreen: 'max-w-[95vw]'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${sizeClasses[size]} w-full h-[90vh]`}
        style={{width: '100%', maxWidth: size === 'fullscreen' ? '95vw' : undefined}}
      >
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 overflow-auto w-full" style={{width: '100%', maxWidth: '100%'}}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}