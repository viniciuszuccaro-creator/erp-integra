import React from "react";

export default function ModuleHeader({ title, actions, children }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        {title && (
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">{title}</h1>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}