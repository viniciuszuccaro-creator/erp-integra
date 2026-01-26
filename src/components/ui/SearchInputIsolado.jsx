import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

/**
 * SearchInput ISOLADO - mantém foco durante digitação
 * Usa debounce interno para não disparar onChange a cada tecla
 */
export default function SearchInputIsolado({ value, onChange, placeholder = "Buscar...", className = "", debounceMs = 500 }) {
  const [valorInterno, setValorInterno] = useState(value || "");
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const wasFocusedRef = useRef(false);

  // Sincroniza valor externo apenas se diferente (evita loop)
  useEffect(() => {
    if (value !== undefined && value !== valorInterno) {
      setValorInterno(value || "");
    }
  }, [value]);

  const handleChange = (e) => {
    const novoValor = e.target.value;
    setValorInterno(novoValor);

    // Debounce para chamar onChange
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (onChange) {
        onChange(novoValor);
      }
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // preserva foco durante rerender
  useEffect(() => {
    if (wasFocusedRef.current && inputRef.current) {
      inputRef.current.focus();
    }
  });

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={valorInterno}
        onChange={handleChange}
        onFocus={() => (wasFocusedRef.current = true)}
        onBlur={() => (wasFocusedRef.current = false)}
        autoComplete="off"
        spellCheck={false}
        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
      />
    </div>
  );
}