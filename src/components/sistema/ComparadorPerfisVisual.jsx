import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Shield, GitCompare } from "lucide-react";

/**
 * 🔍 COMPARADOR VISUAL DE PERFIS V21.7
 * 
 * Compara dois perfis lado a lado mostrando diferenças
 */

export default function ComparadorPerfisVisual({ perfil1, perfil2 }) {
  const comparacao = useMemo(() => {
    if (!perfil1 || !perfil2) return null;

    const modulos = new Set([
      ...Object.keys(perfil1.permissoes || {}),
      ...Object.keys(perfil2.permissoes || {})
    ]);

    const diferencas = [];

    modulos.forEach(modulo => {
      const perms1 = perfil1.permissoes?.[modulo] || {};
      const perms2 = perfil2.permissoes?.[modulo] || {};

      const secoes = new Set([
        ...Object.keys(perms1),
        ...Object.keys(perms2)
      ]);

      secoes.forEach(secao => {
        const acoes1 = perms1[secao] || [];
        const acoes2 = perms2[secao] || [];

        const todasAcoes = new Set([...acoes1, ...acoes2]);

        todasAcoes.forEach(acao => {
          const temEm1 = acoes1.includes(acao);
          const temEm2 = acoes2.includes(acao);

          if (temEm1 !== temEm2) {
            diferencas.push({
              modulo,
              secao,
              acao,
              perfil1: temEm1,
              perfil2: temEm2
            });
          }
        });
      });
    });

    const qtdPermissoes1 = Object.values(perfil1.permissoes || {}).reduce((sum, mod) => {
      return sum + Object.values(mod || {}).reduce((s, sec) => s + (sec?.length || 0), 0);
    }, 0);

    const qtdPermissoes2 = Object.values(perfil2.permissoes || {}).reduce((sum, mod) => {
      return sum + Object.values(mod || {}).reduce((s, sec) => s + (sec?.length || 0), 0);
    }, 0);

    return {
      diferencas,
      qtdPermissoes1,
      qtdPermissoes2,
      percentualSimilaridade: diferencas.length === 0 ? 100 : Math.round(
        (1 - (diferencas.length / Math.max(qtdPermissoes1, qtdPermissoes2))) * 100
      )
    };
  }, [perfil1, perfil2]);

  if (!comparacao) return null;

  return (
    <div className="space-y-4">
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-600" />
            Comparação de Perfis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-bold text-lg">{perfil1.nome_perfil}</p>
              <Badge className="bg-blue-100 text-blue-700 mt-1">
                {comparacao.qtdPermissoes1} permissões
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {comparacao.percentualSimilaridade}%
                </span>
              </div>
              <p className="text-sm text-slate-600">Similaridade</p>
            </div>

            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-bold text-lg">{perfil2.nome_perfil}</p>
              <Badge className="bg-green-100 text-green-700 mt-1">
                {comparacao.qtdPermissoes2} permissões
              </Badge>
            </div>
          </div>

          {comparacao.diferencas.length > 0 ? (
            <>
              <h3 className="font-bold mb-3 text-sm">
                {comparacao.diferencas.length} Diferença(s) Detectada(s):
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Módulo</TableHead>
                      <TableHead>Seção</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead className="text-center">{perfil1.nome_perfil}</TableHead>
                      <TableHead className="text-center">{perfil2.nome_perfil}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparacao.diferencas.map((diff, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-xs">{diff.modulo}</TableCell>
                        <TableCell className="text-xs">{diff.secao}</TableCell>
                        <TableCell className="text-xs">{diff.acao}</TableCell>
                        <TableCell className="text-center">
                          {diff.perfil1 ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {diff.perfil2 ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-green-600">
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="font-bold">Perfis Idênticos</p>
              <p className="text-sm text-slate-600">Ambos os perfis têm exatamente as mesmas permissões</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}