import React from "react";
import { Search } from "lucide-react";

/**
 * SearchInput - Campo de busca nativo sem auditoria
 * V22.0 - Input HTML nativo para evitar dependências
 */
export default function SearchInput({ 
  value = "", 
  onChange, 
  placeholder = "Buscar...", 
  className = "" 
}) {
  const inputRef = React.useRef(null);

  const handleChange = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const newValue = e.target.value;
    if (onChange && typeof onChange === 'function') {
      onChange(newValue);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`relative ${className}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
      />
    </div>
  );
}