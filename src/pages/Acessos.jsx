import React from "react";
import { Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Acessos() {
  return <Navigate to={createPageUrl("AdministracaoSistema") + "?tab=acessos"} replace />;
}