import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PainelDinamicoCliente from "./PainelDinamicoCliente";

export default function IconeAcessoCliente({ cliente, variant = "default" }) {
  const [painelAberto, setPainelAberto] = useState(false);

  if (!cliente) return null;

  if (variant === "inline") {
    return (
      <>
        <button
          onClick={() => setPainelAberto(true)}
          className="text-blue-600 hover:text-blue-700 hover:underline font-medium text-sm"
        >
          {cliente.nome || cliente.razao_social}
        </button>
        <PainelDinamicoCliente
          cliente={cliente}
          isOpen={painelAberto}
          onClose={() => setPainelAberto(false)}
        />
      </>
    );
  }

  if (variant === "badge") {
    return (
      <>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-blue-50 transition-colors"
          onClick={() => setPainelAberto(true)}
        >
          <Users className="w-3 h-3 mr-1" />
          {cliente.nome || cliente.razao_social}
        </Badge>
        <PainelDinamicoCliente
          cliente={cliente}
          isOpen={painelAberto}
          onClose={() => setPainelAberto(false)}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setPainelAberto(true)}
        title="Ver detalhes do cliente"
      >
        <Eye className="w-4 h-4" />
      </Button>
      <PainelDinamicoCliente
        cliente={cliente}
        isOpen={painelAberto}
        onClose={() => setPainelAberto(false)}
      />
    </>
  );
}