import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Link as LinkIcon, Search, Filter } from "lucide-react";

export default function PainelConciliacao({ empresaId, windowMode = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: extratos = [] } = useQuery({
    queryKey: ['extratos', empresaId],
    queryFn: () => base44.entities.ExtratoBancario.filter({ empresa_id: empresaId }, '-data_movimento'),
    enabled: !!empresaId
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber', empresaId],
    queryFn: () => base44.entities.ContaReceber.filter({ empresa_id: empresaId }, '-data_vencimento'),
    enabled: !!empresaId
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar', empresaId],
    queryFn: () => base44.entities.ContaPagar.filter({ empresa_id: empresaId }, '-data_vencimento'),
    enabled: !!empresaId
  });

  const conciliarMutation = useMutation({
    mutationFn: async ({ extratoId, tituloId, tipo }) => {
      const extrato = extratos.find(e => e.id === extratoId);
      const titulo = tipo === 'receber' 
        ? contasReceber.find(t => t.id === tituloId)
        : contasPagar.find(t => t.id === tituloId);

      // Atualizar extrato
      await base44.entities.ExtratoBancario.update(extratoId, {
        conciliado: true,
        conciliado_com_tipo: tipo === 'receber' ? 'ContaReceber' : 'ContaPagar',
        conciliado_com_id: tituloId,
        conciliado_por: "Sistema",
        data_conciliacao: new Date().toISOString()
      });

      // Atualizar título
      const Entity = tipo === 'receber' ? base44.entities.ContaReceber : base44.entities.ContaPagar;
      await Entity.update(tituloId, {
        status: tipo === 'receber' ? 'Recebido' : 'Pago',
        [tipo === 'receber' ? 'data_recebimento' : 'data_pagamento']: extrato.data_movimento,
        [tipo === 'receber' ? 'valor_recebido' : 'valor_pago']: extrato.valor
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extratos'] });
      queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
      toast({ title: "✅ Conciliação realizada!" });
    },
  });

  const conciliarAutomaticoMutation = useMutation({
    mutationFn: async () => {
      let conciliados = 0;
      
      for (const extrato of extratos.filter(e => !e.conciliado)) {
        // Buscar título correspondente por valor e proximidade de data
        const toleranciaDias = 3;
        const dataExtrato = new Date(extrato.data_movimento);

        let tituloMatch = null;
        let tipoMatch = null;

        if (extrato.tipo === 'credito') {
          // Buscar em contas a receber
          tituloMatch = contasReceber.find(t => {
            const dataTitulo = new Date(t.data_vencimento);
            const diffDias = Math.abs((dataExtrato - dataTitulo) / (1000 * 60 * 60 * 24));
            return t.status === 'Pendente' && 
                   Math.abs(t.valor - extrato.valor) < 0.01 && 
                   diffDias <= toleranciaDias;
          });
          tipoMatch = 'receber';
        } else {
          // Buscar em contas a pagar
          tituloMatch = contasPagar.find(t => {
            const dataTitulo = new Date(t.data_vencimento);
            const diffDias = Math.abs((dataExtrato - dataTitulo) / (1000 * 60 * 60 * 24));
            return t.status === 'Pendente' && 
                   Math.abs(t.valor - extrato.valor) < 0.01 && 
                   diffDias <= toleranciaDias;
          });
          tipoMatch = 'pagar';
        }

        if (tituloMatch) {
          await conciliarMutation.mutateAsync({
            extratoId: extrato.id,
            tituloId: tituloMatch.id,
            tipo: tipoMatch
          });
          conciliados++;
        }
      }

      return conciliados;
    },
    onSuccess: (conciliados) => {
      toast({ 
        title: "✅ Conciliação Automática Concluída!", 
        description: `${conciliados} movimento(s) conciliado(s) automaticamente.`
      });
    },
  });

  const extratosFiltrados = extratos.filter(e => 
    e.historico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.documento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const extratosPendentes = extratosFiltrados.filter(e => !e.conciliado);
  const extratosConciliados = extratosFiltrados.filter(e => e.conciliado);

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6"}>
      <div className={windowMode ? "p-6 space-y-6 flex-1" : "space-y-6"}>
      {/* Header com Ações */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Conciliação Bancária</h2>
          <p className="text-sm text-slate-600">
            {extratosPendentes.length} movimentos pendentes • {extratosConciliados.length} conciliados
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => conciliarAutomaticoMutation.mutate()}
            disabled={conciliarAutomaticoMutation.isPending || extratosPendentes.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {conciliarAutomaticoMutation.isPending ? 'Conciliando...' : '🤖 Conciliar Automaticamente'}
          </Button>
        </div>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Buscar por histórico ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Movimentos Pendentes */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-yellow-50 border-b">
          <CardTitle className="text-base">Movimentos Pendentes de Conciliação</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Data</TableHead>
                <TableHead>Histórico</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Sugestões</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extratosPendentes.map(extrato => {
                // Buscar sugestões de conciliação
                const sugestoes = extrato.tipo === 'credito'
                  ? contasReceber.filter(t => 
                      t.status === 'Pendente' && 
                      Math.abs(t.valor - extrato.valor) < 0.01
                    ).slice(0, 3)
                  : contasPagar.filter(t => 
                      t.status === 'Pendente' && 
                      Math.abs(t.valor - extrato.valor) < 0.01
                    ).slice(0, 3);

                return (
                  <TableRow key={extrato.id} className="hover:bg-slate-50">
                    <TableCell className="text-sm">
                      {new Date(extrato.data_movimento).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-sm">{extrato.historico}</TableCell>
                    <TableCell className="text-sm">{extrato.documento || '-'}</TableCell>
                    <TableCell>
                      <Badge className={extrato.tipo === 'credito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {extrato.tipo === 'credito' ? 'Crédito' : 'Débito'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {extrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {sugestoes.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {sugestoes.map(sug => (
                            <Button
                              key={sug.id}
                              size="sm"
                              variant="outline"
                              className="text-xs justify-start"
                              onClick={() => conciliarMutation.mutate({
                                extratoId: extrato.id,
                                tituloId: sug.id,
                                tipo: extrato.tipo === 'credito' ? 'receber' : 'pagar'
                              })}
                              disabled={conciliarMutation.isPending}
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              {sug.descricao} - R$ {sug.valor.toFixed(2)}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Nenhuma sugestão</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sugestoes.length === 0 && (
                        <Button size="sm" variant="ghost" disabled>
                          Manual
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {extratosPendentes.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-30 text-green-500" />
              <p className="font-semibold">Tudo conciliado!</p>
              <p className="text-sm mt-2">Não há movimentos pendentes de conciliação</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movimentos Conciliados */}
      {extratosConciliados.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="text-base">Movimentos Conciliados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Data</TableHead>
                  <TableHead>Histórico</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Conciliado com</TableHead>
                  <TableHead>Data Conciliação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extratosConciliados.slice(0, 10).map(extrato => (
                  <TableRow key={extrato.id}>
                    <TableCell className="text-sm">
                      {new Date(extrato.data_movimento).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-sm">{extrato.historico}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Conciliado
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {extrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {extrato.conciliado_com_tipo || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {extrato.data_conciliacao ? new Date(extrato.data_conciliacao).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div></div>
  );
}