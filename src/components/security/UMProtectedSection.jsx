import React from "react";
import ProtectedSection from "@/components/ProtectedSection";

// UMProtectedSection: alias do ProtectedSection para padronização e consistência
export default function UMProtectedSection(props) {
  return <ProtectedSection {...props} />;
}