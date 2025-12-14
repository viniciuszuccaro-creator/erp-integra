import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Copy, CheckCircle, Code } from "lucide-react";
import { toast } from "sonner";

/**
 * 🔍 WIDGET DE DEBUG DE PERMISSÕES V21.7
 * 
 * Mostra em tempo real a estrutura de permissões sendo criada
 * Útil para debug e validação
 */
export default function DebugPermissoesWidget({ permissoes }) {
  const [expandido, setExpandido] = useState(false);

  const contarTotal = () => {
    let total = 0;
    Object.values(permissoes || {}).forEach(mod => {
      Object.values(mod || {}).forEach(sec => {
        total += sec?.length || 0;
      });
    });
    return total;
  };

  const copiarJSON = () => {
    const json = JSON.stringify(permissoes, null, 2);
    navigator.clipboard.writeText(json);
    toast.success("📋 JSON copiado para área de transferência!");
  };

  if (!expandido) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setExpandido(true)}
        className="border-purple-300 text-purple-700 hover:bg-purple-50"
      >
        <Eye className="w-4 h-4 mr-2" />
        Debug Estado ({contarTotal()})
      </Button>
    );
  }

  return (
    <Card className="border-2 border-purple-300 bg-purple-50">
      <CardHeader className="pb-3 bg-purple-100 border-b border-purple-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-600" />
            Debug: Estado Atual das Permissões
          </CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={copiarJSON}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copiar JSON
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setExpandido(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-purple-600 text-white">
              {contarTotal()} permissões no estado
            </Badge>
            <Badge className="bg-blue-100 text-blue-700">
              {Object.keys(permissoes || {}).length} módulos
            </Badge>
          </div>

          {Object.keys(permissoes || {}).length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Eye className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma permissão marcada ainda</p>
            </div>
          ) : (
            <ScrollArea className="h-64 border rounded bg-white">
              <div className="p-3 space-y-2">
                {Object.entries(permissoes || {}).map(([modId, mod]) => (
                  <div key={modId} className="border-b pb-2">
                    <p className="font-semibold text-sm text-purple-700 mb-1">
                      📦 {modId}
                    </p>
                    {Object.entries(mod || {}).map(([secId, acoes]) => (
                      <div key={secId} className="ml-4 text-xs text-slate-600 mb-1">
                        <span className="font-medium">• {secId}:</span>{' '}
                        {acoes?.length > 0 ? (
                          <span className="text-green-600">
                            [{acoes.join(', ')}] ({acoes.length})
                          </span>
                        ) : (
                          <span className="text-slate-400">[]</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <Alert className="border-green-300 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-xs text-green-800">
              Este é o estado que será enviado ao banco quando clicar "Salvar Perfil". 
              Verifique se as permissões marcadas aparecem aqui antes de salvar.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}