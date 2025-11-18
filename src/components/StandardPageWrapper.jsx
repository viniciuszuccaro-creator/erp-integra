import React from 'react';

/**
 * 📦 STANDARD PAGE WRAPPER - V21.1
 * 
 * Wrapper padrão para TODAS as páginas do sistema
 * Garante w-full responsivo e consistência visual
 */
export default function StandardPageWrapper({ children, title, subtitle, actions }) {
  return (
    <div className="w-full h-full flex flex-col" style={{width: '100%', maxWidth: '100%'}}>
      {/* HEADER */}
      {(title || actions) && (
        <div className="w-full flex items-center justify-between p-6 border-b bg-white" style={{width: '100%'}}>
          <div className="flex-1">
            {title && <h1 className="text-2xl font-bold text-slate-900">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      
      {/* CONTENT - W-FULL FORÇADO */}
      <div className="flex-1 overflow-auto w-full" style={{width: '100%', maxWidth: '100%'}}>
        <div className="w-full h-full" style={{width: '100%', maxWidth: '100%'}}>
          {children}
        </div>
      </div>
    </div>
  );
}