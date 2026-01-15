import React from "react";
import ProtectedAction from "@/components/ProtectedAction";

// UMProtectedAction: alias do ProtectedAction para padronização solicitada na Fase 2
// Mantém mesma API e comportamento (disable/hide + auditoria)
export default function UMProtectedAction(props) {
  return <ProtectedAction {...props} />;
}