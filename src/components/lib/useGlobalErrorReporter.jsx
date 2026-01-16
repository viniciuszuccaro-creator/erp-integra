import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function useGlobalErrorReporter() {
  useEffect(() => {
    const handleError = (event) => {
      try {
        const message = event?.message || event?.reason?.message || String(event?.reason || "Unknown error");
        const stack = event?.error?.stack || event?.reason?.stack || null;
        base44.entities.AuditLog.create({
          usuario: "Sistema",
          acao: "Erro",
          modulo: "Sistema",
          entidade: "Global",
          descricao: message,
          dados_novos: { stack, type: event?.type || "error" },
        });
      } catch (_) {}
    };

    const handleRejection = (event) => handleError(event);

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);
}