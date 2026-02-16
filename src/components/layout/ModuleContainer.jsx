import React from "react";

export default function ModuleContainer({ header, children, className = "" }) {
  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${className}`}>
      {header && (
        <div className="shrink-0 border-b border-slate-200 bg-white/70 backdrop-blur-sm px-3 sm:px-4 py-2.5">
          {header}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto px-3 sm:px-4 py-2">
        {children}
      </div>
    </div>
  );
}