import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

/**
 * Componente de busca reutilizável com ícone de lupa
 * 
 * @param {string} value - Valor atual da busca
 * @param {function} onChange - Callback quando o valor muda
 * @param {string} placeholder - Texto placeholder
 * @param {string} className - Classes CSS adicionais
 */
export default function SearchInput({ 
  value = "", 
  onChange, 
  placeholder = "Buscar...", 
  className = "" 
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}