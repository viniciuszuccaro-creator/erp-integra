import React from "react";
import GerenciamentoAcessos from "@/components/sistema/GerenciamentoAcessos";

export default function Acessos() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-[calc(100vh-4rem)] max-w-full" style={{ width: '100%', maxWidth: '100%' }}> {/* ETAPA 1: w-full + inline */}
      <GerenciamentoAcessos />
    </div>
  );
}