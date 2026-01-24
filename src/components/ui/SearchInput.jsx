import React from "react";
import { Search } from "lucide-react";

/**
 * SearchInput - Campo de busca TOTALMENTE CORRIGIDO
 * V22.0.2 - Sem debounce, sem useEffect, onChange direto
 */
export default function SearchInput({ 
  value = "", 
  onChange, 
  placeholder = "Buscar...", 
  className = "" 
}) {
  const inputRef = React.useRef(null);

  return (
    <div className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={value}
        onChange={(e) => {
          e.stopPropagation();
          if (onChange && typeof onChange === 'function') {
            onChange(e.target.value);
          }
        }}
        onFocus={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        autoComplete="off"
        spellCheck="false"
        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
      />
    </div>
  );
}