import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ItensTabela({ itens = [], quantidadeItens = 0 }) {
  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          Itens da NF-e ({quantidadeItens})
          {itens.filter(i => !i.produto_encontrado).length > 0 && (
            <Badge className="bg-orange-600">
              {itens.filter(i => !i.produto_encontrado).length} novos
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>#</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>NCM</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Un</TableHead>
                <TableHead>Vlr Unit</TableHead>
                <TableHead>Vlr Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.numero_item}</TableCell>
                  <TableCell className="font-mono text-xs">{item.codigo_produto}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.descricao}</TableCell>
                  <TableCell className="font-mono text-xs">{item.ncm}</TableCell>
                  <TableCell>{item.quantidade}</TableCell>
                  <TableCell>{item.unidade}</TableCell>
                  <TableCell>R$ {Number(item.valor_unitario ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="font-semibold">
                    R$ {Number(item.valor_total ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {item.produto_encontrado ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Mapeado
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Criar
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}