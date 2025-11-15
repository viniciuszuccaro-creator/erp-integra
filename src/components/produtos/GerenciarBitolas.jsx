import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wrench, Package } from 'lucide-react';

export default function GerenciarBitolas({ bitolas }) {
  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <Wrench className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900">
          🔩 <strong>{bitolas.length} bitolas cadastradas</strong> • IA valida peso teórico contra NBR 7480
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="bg-purple-50 border-b">
          <CardTitle className="text-base">Bitolas de Aço CA-50/60</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Diâmetro (mm)</TableHead>
                <TableHead>Peso (kg/m)</TableHead>
                <TableHead>Tipo Aço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Preço/KG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bitolas.map((bitola) => (
                <TableRow key={bitola.id}>
                  <TableCell className="font-medium">{bitola.descricao}</TableCell>
                  <TableCell>{bitola.bitola_diametro_mm}</TableCell>
                  <TableCell className="font-semibold">{bitola.peso_teorico_kg_m}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{bitola.tipo_aco}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold">{bitola.estoque_atual || 0}</span>
                    <span className="text-xs text-slate-500 ml-1">KG</span>
                  </TableCell>
                  <TableCell className="text-green-700 font-semibold">
                    R$ {(bitola.preco_venda || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {bitolas.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Nenhuma bitola cadastrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}