import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Shield, Eye, Plus, Pencil, Trash2, CheckSquare, Download } from "lucide-react";

/**
 * 👁️ VISUALIZADOR DE PERMISSÕES DE PERFIL V21.7
 * 
 * Mostra de forma clara e organizada todas as permissões de um perfil
 * Usado em cards de perfil para visualização rápida
 */

const ACOES_ICONES = {
  visualizar: { icone: Eye, cor: "slate" },
  criar: { icone: Plus, cor: "blue" },
  editar: { icone: Pencil, cor: "green" },
  excluir: { icone: Trash2, cor: "red" },
  aprovar: { icone: CheckSquare, cor: "purple" },
  exportar: { icone: Download, cor: "cyan" }
};

export default function VisualizadorPermissoesPerfil({ perfil, estruturaSistema, compact = false }) {
  if (!perfil) return null;

  const permissoes = perfil.permissoes || {};
  const totalPermissoes = Object.values(permissoes).reduce((sum, mod) => {
    return sum + Object.values(mod || {}).reduce((s, sec) => s + (sec?.length || 0), 0);
  }, 0);

  if (totalPermissoes === 0) {
    return (
      <div className="text-center py-4 text-slate-400">
        <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Nenhuma permissão configurada</p>
      </div>
    );
  }

  if (compact) {
    // Visão compacta - apenas módulos com badges
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(permissoes).map(([moduloId, secoes]) => {
          const qtd = Object.values(secoes || {}).reduce((s, sec) => s + (sec?.length || 0), 0);
          if (qtd === 0) return null;
          
          return (
            <Badge key={moduloId} className="bg-blue-100 text-blue-700">
              {moduloId}: {qtd}
            </Badge>
          );
        })}
      </div>
    );
  }

  // Visão expandida - mostra tudo
  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50 pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Permissões Ativas ({totalPermissoes})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Accordion type="multiple" className="space-y-2">
          {Object.entries(permissoes).map(([moduloId, secoes]) => {
            const qtdModulo = Object.values(secoes || {}).reduce((s, sec) => s + (sec?.length || 0), 0);
            if (qtdModulo === 0) return null;

            return (
              <AccordionItem key={moduloId} value={moduloId} className="border rounded-lg">
                <AccordionTrigger className="px-3 py-2 hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm capitalize">{moduloId}</span>
                    <Badge className="bg-green-100 text-green-700">
                      {qtdModulo}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-2">
                  <div className="space-y-2">
                    {Object.entries(secoes || {}).map(([secaoId, acoes]) => {
                      if (!Array.isArray(acoes) || acoes.length === 0) return null;
                      
                      return (
                        <div key={secaoId} className="bg-slate-50 p-2 rounded border">
                          <p className="text-xs font-semibold text-slate-700 mb-2 capitalize">
                            {secaoId}:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {acoes.map(acaoId => {
                              const acaoConfig = ACOES_ICONES[acaoId] || { icone: CheckCircle, cor: "blue" };
                              const IconeAcao = acaoConfig.icone;
                              
                              return (
                                <Badge
                                  key={acaoId}
                                  className={`bg-${acaoConfig.cor}-100 text-${acaoConfig.cor}-700 flex items-center gap-1`}
                                >
                                  <IconeAcao className="w-3 h-3" />
                                  {acaoId}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}