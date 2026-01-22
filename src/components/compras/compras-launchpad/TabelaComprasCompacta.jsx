import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function TabelaComprasCompacta({ 
  items, 
  title, 
  columns, 
  renderRow,
  emptyMessage = "Nenhum item encontrado"
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-slate-50 border-b py-2 px-3">
        <CardTitle className="text-sm">{title} ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {columns.map((col, idx) => (
                  <TableHead key={idx} className={col.className}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => renderRow(item, idx))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}