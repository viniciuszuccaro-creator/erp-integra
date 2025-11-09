import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield } from "lucide-react";

/**
 * V21.6 - Fallback Manager
 * Componente que exibe alertas quando APIs estão em modo fallback
 * Usado em: Expedição (Maps), Fiscal (NF-e), Financeiro (Boleto)
 */
export default function FallbackManager({ modulo, apiName, fallbackMode }) {
  if (!fallbackMode) return null;

  const mensagens = {
    'Expedição': {
      titulo: '⚠️ Roteirização Manual Ativa',
      descricao: `A integração com ${apiName} está temporariamente indisponível. Use a roteirização manual até a reconexão automática.`
    },
    'Fiscal': {
      titulo: '⚠️ Modo MOCK NF-e Ativo',
      descricao: `A integração com ${apiName} falhou. As NF-e serão geradas em modo simulado até a API ser restaurada.`
    },
    'Financeiro': {
      titulo: '⚠️ Cobranças em Modo Simulado',
      descricao: `A integração com ${apiName} está offline. Use geração manual de boletos até a reconexão.`
    }
  };

  const msg = mensagens[modulo] || {
    titulo: '⚠️ Modo Fallback Ativo',
    descricao: `A integração com ${apiName} está temporariamente indisponível.`
  };

  return (
    <Alert className="border-orange-300 bg-orange-50 mb-4">
      <AlertTriangle className="w-4 h-4 text-orange-600" />
      <AlertDescription className="text-sm text-orange-800">
        <strong>{msg.titulo}</strong><br />
        {msg.descricao}
        <div className="mt-2 flex items-center gap-2 text-xs">
          <Shield className="w-3 h-3" />
          <span>IA Monitor verificará a conexão automaticamente a cada hora</span>
        </div>
      </AlertDescription>
    </Alert>
  );
}