import React from "react";
import { Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AuditoriaUI() {
  return <Navigate to={createPageUrl("AdministracaoSistema") + "?tab=auditoria"} replace />;
}