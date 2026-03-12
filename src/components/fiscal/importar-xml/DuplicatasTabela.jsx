import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function DuplicatasTabela({ duplicatas = [] }) {
  if (!Array.isArray(duplicatas) || duplicatas.length === 0) return null;
  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Duplicatas / Contas a Pagar ({duplicatas.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Parcela</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {duplicatas.map((dup, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-semibold">{dup.numero}</TableCell>
                <TableCell>{new Date(dup.vencimento).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="font-semibold text-green-600">
                  R$ {Number(dup.valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}