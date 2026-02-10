import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function PedidoValidationAlerts({ errors, validacoes }) {
  const hasErrors = !!(errors && Object.keys(errors).length > 0);
  const needsBasic = !validacoes?.identificacao || !validacoes?.itens;

  return (
    <>
      {hasErrors && (
        <Alert className="mt-4 border-red-300 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-sm">
            {Object.values(errors).map((e, idx) => (
              <p key={idx}>• {e?.message || 'Verifique os campos do formulário'}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {needsBasic && (
        <Alert className="mt-4 border-orange-300 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-sm">
            {!validacoes?.identificacao && <p>• Complete os dados de identificação e cliente</p>}
            {!validacoes?.itens && <p>• Adicione pelo menos um item ao pedido</p>}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}