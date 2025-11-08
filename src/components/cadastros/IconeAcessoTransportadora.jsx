import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Truck, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PainelDinamicoTransportadora from "./PainelDinamicoTransportadora";

export default function IconeAcessoTransportadora({ transportadora, variant = "default" }) {
  const [painelAberto, setPainelAberto] = useState(false);

  if (!transportadora) return null;

  if (variant === "inline") {
    return (
      <>
        <button
          onClick={() => setPainelAberto(true)}
          className="text-orange-600 hover:text-orange-700 hover:underline font-medium text-sm"
        >
          {transportadora.razao_social || transportadora.nome_fantasia}
        </button>
        <PainelDinamicoTransportadora
          transportadora={transportadora}
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
          className="cursor-pointer hover:bg-orange-50 transition-colors"
          onClick={() => setPainelAberto(true)}
        >
          <Truck className="w-3 h-3 mr-1" />
          {transportadora.razao_social || transportadora.nome_fantasia}
        </Badge>
        <PainelDinamicoTransportadora
          transportadora={transportadora}
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
        title="Ver detalhes da transportadora"
      >
        <Eye className="w-4 h-4" />
      </Button>
      <PainelDinamicoTransportadora
        transportadora={transportadora}
        isOpen={painelAberto}
        onClose={() => setPainelAberto(false)}
      />
    </>
  );
}