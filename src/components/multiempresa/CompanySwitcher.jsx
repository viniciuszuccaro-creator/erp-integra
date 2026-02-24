import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CompanySwitcher({ empresas, value, onChange }) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-60">
        <SelectValue placeholder="Selecionar empresa" />
      </SelectTrigger>
      <SelectContent>
        {(empresas || []).map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {e.nome_fantasia || e.razao_social || e.nome || e.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}