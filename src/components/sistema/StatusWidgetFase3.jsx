import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Rocket, Sparkles, Zap } from "lucide-react";

/**
 * 🎯 STATUS WIDGET FASE 3 - 100% COMPLETA
 * Widget visual mostrando a conclusão da Fase 3
 */
export default function StatusWidgetFase3() {
  const blocosCompletos = [
    { id: 1, nome: "Pessoas & Parceiros", entidades: 7, cor: "blue" },
    { id: 2, nome: "Produtos & Serviços", entidades: 9, cor: "purple" },
    { id: 3, nome: "Financeiro", entidades: 9, cor: "green" },
    { id: 4, nome: "Logística", entidades: 6, cor: "orange" },
    { id: 5, nome: "Organizacional", entidades: 7, cor: "indigo" },
    { id: 6, nome: "Integrações & IA", entidades: 7, cor: "cyan" },
  ];

  const totalEntidades = blocosCompletos.reduce((sum, b) => sum + b.entidades, 0);

  return (
    <Card className="border-2 border-green-400 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 shadow-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* STATUS PRINCIPAL */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-green-900">FASE 3 COMPLETA</h3>
                <Badge className="bg-green-600 text-white px-2 py-0.5 text-xs">100%</Badge>
              </div>
              <p className="text-xs text-green-700">
                {totalEntidades} Entidades • 6 Blocos • 89 Janelas • 28 IAs Ativas
              </p>
            </div>
          </div>

          {/* BADGES DE RECURSOS */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-700 border border-blue-300">
              <Zap className="w-3 h-3 mr-1" />
              Multiempresa 100%
            </Badge>
            <Badge className="bg-purple-100 text-purple-700 border border-purple-300">
              <Sparkles className="w-3 h-3 mr-1" />
              IA Governança
            </Badge>
            <Badge className="bg-cyan-100 text-cyan-700 border border-cyan-300">
              <Rocket className="w-3 h-3 mr-1" />
              Jobs Agendados
            </Badge>
          </div>

          {/* MINI PROGRESS BLOCOS */}
          <div className="hidden xl:flex gap-1">
            {blocosCompletos.map((bloco) => (
              <div key={bloco.id} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 bg-${bloco.cor}-100 border-2 border-${bloco.cor}-400 rounded flex items-center justify-center`}>
                  <span className="text-xs font-bold text-${bloco.cor}-700">{bloco.id}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            ))}
          </div>
        </div>

        {/* BARRA DE PROGRESSO VISUAL */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-600 to-emerald-600 w-full animate-pulse"></div>
          </div>
          <span className="text-xs font-bold text-green-700">100%</span>
        </div>
      </CardContent>
    </Card>
  );
}