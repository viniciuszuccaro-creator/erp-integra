import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Package, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PainelDinamicoFornecedor from "./PainelDinamicoFornecedor";

export default function IconeAcessoFornecedor({ fornecedor, variant = "default" }) {
  const [painelAberto, setPainelAberto] = useState(false);

  if (!fornecedor) return null;

  if (variant === "inline") {
    return (
      <>
        <button
          onClick={() => setPainelAberto(true)}
          className="text-cyan-600 hover:text-cyan-700 hover:underline font-medium text-sm"
        >
          {fornecedor.nome}
        </button>
        <PainelDinamicoFornecedor
          fornecedor={fornecedor}
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
          className="cursor-pointer hover:bg-cyan-50 transition-colors"
          onClick={() => setPainelAberto(true)}
        >
          <Package className="w-3 h-3 mr-1" />
          {fornecedor.nome}
        </Badge>
        <PainelDinamicoFornecedor
          fornecedor={fornecedor}
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
        title="Ver detalhes do fornecedor"
      >
        <Eye className="w-4 h-4" />
      </Button>
      <PainelDinamicoFornecedor
        fornecedor={fornecedor}
        isOpen={painelAberto}
        onClose={() => setPainelAberto(false)}
      />
    </>
  );
}