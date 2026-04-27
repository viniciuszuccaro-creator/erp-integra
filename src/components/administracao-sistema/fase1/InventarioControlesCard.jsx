import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import inventarioMarkdown from "@/components/docs/ADMINISTRACAO_SISTEMA_INVENTARIO_TOGGLES";

const linhas = inventarioMarkdown.split("\n");

const secoes = [
  { titulo: "Abas principais", match: "## Abas principais" },
  { titulo: "Inventário operacional da área", match: "## Inventário operacional da área" },
  { titulo: "Mapa chave → função real", match: "## Mapa chave → função real" },
  { titulo: "Ações e botões críticos", match: "## Ações e botões críticos já encontrados" },
  { titulo: "Regras obrigatórias por ação", match: "## Botões, ações e estados obrigatórios" },
  { titulo: "Cobertura já conectada", match: "## Cobertura já conectada" },
  { titulo: "Fluxo recomendado de fechamento", match: "## Fluxo recomendado de fechamento" },
];

function extrairSecao(match) {
  const start = linhas.findIndex((l) => l.trim() === match);
  if (start === -1) return [];
  const end = linhas.slice(start + 1).findIndex((l) => l.startsWith("## "));
  const chunk = linhas.slice(start + 1, end === -1 ? undefined : start + 1 + end);
  return chunk.filter((l) => l.trim().startsWith("- "));
}

export default function InventarioControlesCard() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Inventário de controles</CardTitle>
          <Badge variant="outline">Fase 1</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {secoes.map((sec) => {
          const itens = extrairSecao(sec.match);
          return (
            <div key={sec.titulo} className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">{sec.titulo}</h3>
              <div className="space-y-2">
                {itens.map((item, idx) => (
                  <div key={idx} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {item.replace(/^-\s*/, "")}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}