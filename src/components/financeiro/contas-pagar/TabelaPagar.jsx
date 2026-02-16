import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Printer, Shield, CheckCircle, Edit2, DollarSign } from 'lucide-react';
import { ProtectedAction } from '@/components/ProtectedAction';
import StatusBadge from '../../StatusBadge';

export default function TabelaPagar({
  contas,
  empresas,
  contasSelecionadas,
  toggleSelecao,
  onPrint,
  onEdit,
  onAprovar,
  onBaixar,
  aprovarPending = false
}) {
  return (
    <Card className="border-0 shadow-md flex-1 overflow-hidden flex flex-col">
      <CardHeader className="bg-slate-50 border-b py-2 px-3 min-h-[50px] max-h-[50px]">
        <CardTitle className="text-sm">Títulos a Pagar</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-50 z-10">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={contasSelecionadas.length === contas.filter(c => c.status === "Pendente" || c.status === "Aprovado").length}
                  onCheckedChange={(checked) => {
                    const pendentes = contas.filter(c => c.status === "Pendente" || c.status === "Aprovado");
                    if (checked) {
                      pendentes.forEach(c => {
                        if (!contasSelecionadas.includes(c.id)) toggleSelecao(c.id);
                      });
                    } else {
                      pendentes.forEach(c => {
                        if (contasSelecionadas.includes(c.id)) toggleSelecao(c.id);
                      });
                    }
                  }}
                />
              </TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contas.map((conta) => {
              const empresa = empresas.find(e => e.id === conta.empresa_id);
              const vencida = conta.status === "Pendente" && new Date(conta.data_vencimento) < new Date();

              return (
                <TableRow key={conta.id} className={vencida ? 'bg-red-50' : ''}>
                  <TableCell>
                    {(conta.status === "Pendente" || conta.status === "Aprovado") && (
                      <Checkbox
                        checked={contasSelecionadas.includes(conta.id)}
                        onCheckedChange={() => toggleSelecao(conta.id)}
                      />
                    )}
                    {conta.e_replicado && (
                      <Badge variant="outline" className="text-xs ml-1" title="Rateio do grupo">📊</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{conta.fornecedor}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{conta.descricao}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-purple-600" />
                      <span className="text-xs">{empresa?.nome_fantasia || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-semibold">R$ {conta.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell><StatusBadge status={conta.status} size="sm" /></TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-center">
                      <Button data-permission="Financeiro.ContasPagar.exportar" variant="ghost" size="icon" onClick={() => onPrint(conta, empresa)} title="Imprimir" className="h-7 w-7">
                        <Printer className="w-3 h-3" />
                      </Button>

                      <Button data-permission="Financeiro.ContasPagar.editar" variant="ghost" size="icon" onClick={() => onEdit(conta)} title="Editar" className="h-7 w-7">
                        <Edit2 className="w-3 h-3" />
                      </Button>

                      {conta.status === "Pendente" && (
                        <Button data-permission="Financeiro.ContasPagar.aprovar" variant="ghost" size="icon" onClick={() => onAprovar(conta.id)} disabled={aprovarPending} title="Aprovar" className="h-7 w-7">
                          <Shield className="w-3 h-3 text-blue-600" />
                        </Button>
                      )}

                      {conta.status === "Aprovado" && (
                        <Button data-permission="Financeiro.ContasPagar.baixar" variant="ghost" size="icon" onClick={() => onBaixar(conta)} title="Pagar" className="h-7 w-7">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {contas.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nenhuma conta a pagar encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}