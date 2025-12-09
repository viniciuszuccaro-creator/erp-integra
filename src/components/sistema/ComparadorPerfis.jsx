import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitCompare, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function ComparadorPerfis({ perfis = [], estruturaSistema }) {
  const [perfil1, setPerfil1] = useState(null);
  const [perfil2, setPerfil2] = useState(null);

  const compararPermissoes = () => {
    if (!perfil1 || !perfil2) return [];

    const diferencas = [];

    Object.entries(estruturaSistema).forEach(([moduloId, modulo]) => {
      Object.keys(modulo.secoes).forEach(secao => {
        const perms1 = perfil1.permissoes?.[moduloId]?.[secao] || [];
        const perms2 = perfil2.permissoes?.[moduloId]?.[secao] || [];

        if (perms1.length !== perms2.length || !perms1.every(p => perms2.includes(p))) {
          diferencas.push({
            modulo: modulo.nome,
            secao,
            perfil1_tem: perms1,
            perfil2_tem: perms2,
            apenas_perfil1: perms1.filter(p => !perms2.includes(p)),
            apenas_perfil2: perms2.filter(p => !perms1.includes(p))
          });
        }
      });
    });

    return diferencas;
  };

  const diferencas = compararPermissoes();
  const perfisAtivos = perfis.filter(p => p.ativo !== false);

  return (
    <Card className="w-full h-full">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-blue-600" />
          Comparador de Perfis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Perfil 1</label>
            <Select value={perfil1?.id || ""} onValueChange={(v) => setPerfil1(perfis.find(p => p.id === v))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {perfisAtivos.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome_perfil}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Perfil 2</label>
            <Select value={perfil2?.id || ""} onValueChange={(v) => setPerfil2(perfis.find(p => p.id === v))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {perfisAtivos.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome_perfil}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {perfil1 && perfil2 && (
          <>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total de diferenças encontradas:</span>
                <Badge className={diferencas.length === 0 ? 'bg-green-600' : 'bg-orange-600'}>
                  {diferencas.length}
                </Badge>
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              {diferencas.length === 0 ? (
                <div className="text-center py-12 text-green-600">
                  <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                  <p className="font-medium">Perfis Idênticos</p>
                  <p className="text-sm">As permissões são iguais</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {diferencas.map((diff, idx) => (
                    <Card key={idx} className="border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="font-medium text-sm">
                            {diff.modulo} → {diff.secao}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="font-medium text-blue-700 mb-1">{perfil1.nome_perfil}:</p>
                            {diff.perfil1_tem.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {diff.perfil1_tem.map(p => (
                                  <Badge key={p} variant="outline" className="text-xs">
                                    {p}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-500">Sem permissões</p>
                            )}
                            {diff.apenas_perfil1.length > 0 && (
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <p className="text-blue-700 font-medium">Exclusivas:</p>
                                {diff.apenas_perfil1.map(p => (
                                  <Badge key={p} className="bg-blue-600 text-white text-xs mr-1 mt-1">
                                    {p}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-medium text-green-700 mb-1">{perfil2.nome_perfil}:</p>
                            {diff.perfil2_tem.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {diff.perfil2_tem.map(p => (
                                  <Badge key={p} variant="outline" className="text-xs">
                                    {p}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-500">Sem permissões</p>
                            )}
                            {diff.apenas_perfil2.length > 0 && (
                              <div className="mt-2 p-2 bg-green-50 rounded">
                                <p className="text-green-700 font-medium">Exclusivas:</p>
                                {diff.apenas_perfil2.map(p => (
                                  <Badge key={p} className="bg-green-600 text-white text-xs mr-1 mt-1">
                                    {p}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}