import React from "react";
import { InputClean } from "@/components/ui/input-clean";
import { Search } from "lucide-react";

/**
 * SearchInput - Campo de busca LIMPO sem auditoria
 * V22.0 - Usa InputClean para evitar interferências de event listeners
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
      <InputClean
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}