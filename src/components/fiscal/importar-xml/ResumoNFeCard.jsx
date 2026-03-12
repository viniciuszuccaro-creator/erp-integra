import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, CheckCircle2 } from "lucide-react";

export default function ResumoNFeCard({ dadosNFe }) {
  if (!dadosNFe) return null;
  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Dados da NF-e
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-slate-600 mb-1">Número</p>
            <p className="font-bold text-lg text-blue-600">{dadosNFe.numeroNFe}</p>
            <p className="text-xs text-slate-500">Série: {dadosNFe.serieNFe}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Data Emissão</p>
            <p className="font-semibold flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              {new Date(dadosNFe.dataEmissao).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Valor Total</p>
            <p className="font-bold text-lg text-green-600">
              R$ {Number(dadosNFe.valores?.total ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Itens</p>
            <p className="font-bold text-lg text-indigo-600">{dadosNFe.quantidadeItens}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded">
          <p className="text-xs text-slate-600 mb-1">Chave de Acesso</p>
          <p className="font-mono text-xs text-slate-800">{dadosNFe.chaveAcesso}</p>
        </div>

        {dadosNFe.fornecedorExistente && (
          <Alert className="mt-4 border-green-300 bg-green-50">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <AlertDescription>
              <p className="font-semibold text-green-900">
                Fornecedor "{dadosNFe.fornecedorExistente.nome}" já cadastrado
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}