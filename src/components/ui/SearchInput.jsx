import React from "react";
import { Search } from "lucide-react";

/**
 * SearchInput - Campo de busca nativo CORRIGIDO
 * V22.0.1 - Input não controlado para evitar perda de foco
 */
export default function SearchInput({ 
  value = "", 
  onChange, 
  placeholder = "Buscar...", 
  className = "" 
}) {
  const inputRef = React.useRef(null);
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (onChange && typeof onChange === 'function') {
      onChange(newValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        autoComplete="off"
        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
      />
    </div>
  );
}