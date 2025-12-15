import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Shield, Sparkles, Eye, CheckCircle2, XCircle, Package } from "lucide-react";

export default function DetectorAnomaliasFiscais() {
  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  // Detectar duplicidades em Contas a Receber
  const detectarDuplicidadesReceber = () => {
    const duplicidades = [];
    
    contasReceber.forEach((conta, idx) => {
      const similares = contasReceber.filter((c, i) => 
        i !== idx &&
        c.cliente_id === conta.cliente_id &&
        Math.abs(c.valor - conta.valor) < 0.1 &&
        Math.abs(new Date(c.data_vencimento) - new Date(conta.data_vencimento)) < 7 * 24 * 60 * 60 * 1000 // 7 dias
      );

      if (similares.length > 0 && !duplicidades.find(d => d.conta.id === conta.id)) {
        duplicidades.push({
          conta,
          similares,
          risco: similares.length > 1 ? 'Alto' : 'Médio'
        });
      }
    });

    return duplicidades;
  };

  // Detectar duplicidades em Contas a Pagar
  const detectarDuplicidadesPagar = () => {
    const duplicidades = [];
    
    contasPagar.forEach((conta, idx) => {
      if (conta.duplicidade_detectada) {
        const similares = contasPagar.filter(c => 
          conta.contas_similares_ids?.includes(c.id)
        );
        
        if (similares.length > 0) {
          duplicidades.push({
            conta,
            similares,
            risco: 'Alto'
          });
        }
      }
    });

    return duplicidades;
  };

  // Detectar anomalias em taxas de marketplace
  const detectarAnomaliasTaxas = () => {
    const anomalias = [];
    
    contasPagar
      .filter(c => c.marketplace_origem && c.marketplace_origem !== 'Nenhum')
      .forEach(conta => {
        if (conta.alerta_taxa_divergente) {
          anomalias.push({
            conta,
            taxa_esperada: conta.taxa_marketplace_esperada,
            taxa_cobrada: conta.taxa_marketplace_cobrada,
            divergencia: Math.abs(conta.taxa_marketplace_cobrada - conta.taxa_marketplace_esperada)
          });
        }
      });

    return anomalias.sort((a, b) => b.divergencia - a.divergencia);
  };

  // Detectar contas sem cliente/fornecedor cadastrado
  const detectarDadosIncompletos = () => {
    const incompletos = {
      receber: contasReceber.filter(c => !c.cliente_id && c.status !== 'Cancelado'),
      pagar: contasPagar.filter(c => !c.fornecedor_id && c.status !== 'Cancelado')
    };

    return incompletos;
  };

  const duplicidadesReceber = detectarDuplicidadesReceber();
  const duplicidadesPagar = detectarDuplicidadesPagar();
  const anomaliasTaxas = detectarAnomaliasTaxas();
  const dadosIncompletos = detectarDadosIncompletos();

  const totalAnomalias = duplicidadesReceber.length + duplicidadesPagar.length + anomaliasTaxas.length + dadosIncompletos.receber.length + dadosIncompletos.pagar.length;

  return (
    <div className="space-y-6 w-full h-full overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-orange-600" />
            Detector de Anomalias Fiscais (IA)
          </h2>
          <p className="text-sm text-slate-600">Identificação inteligente de duplicidades, divergências e inconsistências</p>
        </div>
        <Badge className={totalAnomalias === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
          {totalAnomalias} anomalia(s) detectada(s)
        </Badge>
      </div>

      {/* Resumo de Anomalias */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Duplicidades Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${duplicidadesReceber.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {duplicidadesReceber.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Duplicidades Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${duplicidadesPagar.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {duplicidadesPagar.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Taxas Divergentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${anomaliasTaxas.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {anomaliasTaxas.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Dados Incompletos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${(dadosIncompletos.receber.length + dadosIncompletos.pagar.length) > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {dadosIncompletos.receber.length + dadosIncompletos.pagar.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Duplicidades em Contas a Receber */}
      {duplicidadesReceber.length > 0 && (
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Possíveis Duplicidades - Contas a Receber
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Conta Original</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Contas Similares</TableHead>
                  <TableHead>Risco</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duplicidadesReceber.map((dup, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{dup.conta.descricao}</TableCell>
                    <TableCell>{dup.conta.cliente}</TableCell>
                    <TableCell>R$ {dup.conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{new Date(dup.conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{dup.similares.length} similar(es)</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={dup.risco === 'Alto' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                        {dup.risco}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Duplicidades em Contas a Pagar */}
      {duplicidadesPagar.length > 0 && (
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Possíveis Duplicidades - Contas a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Conta Original</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Contas Similares</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duplicidadesPagar.map((dup, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{dup.conta.descricao}</TableCell>
                    <TableCell>{dup.conta.fornecedor}</TableCell>
                    <TableCell>R$ {dup.conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{new Date(dup.conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{dup.similares.length} similar(es)</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-700">Detectado pela IA</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Anomalias em Taxas de Marketplace */}
      {anomaliasTaxas.length > 0 && (
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Divergências em Taxas de Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Descrição</TableHead>
                  <TableHead>Marketplace</TableHead>
                  <TableHead>Taxa Esperada</TableHead>
                  <TableHead>Taxa Cobrada</TableHead>
                  <TableHead>Divergência</TableHead>
                  <TableHead>Valor Conta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anomaliasTaxas.map((anomalia, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{anomalia.conta.descricao}</TableCell>
                    <TableCell>
                      <Badge className="bg-purple-100 text-purple-700">{anomalia.conta.marketplace_origem}</Badge>
                    </TableCell>
                    <TableCell>{anomalia.taxa_esperada}%</TableCell>
                    <TableCell className="text-red-600 font-semibold">{anomalia.taxa_cobrada}%</TableCell>
                    <TableCell>
                      <Badge variant="destructive">+{anomalia.divergencia.toFixed(2)}%</Badge>
                    </TableCell>
                    <TableCell>R$ {anomalia.conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dados Incompletos */}
      {(dadosIncompletos.receber.length > 0 || dadosIncompletos.pagar.length > 0) && (
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Contas com Dados Incompletos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {dadosIncompletos.receber.length > 0 && (
                <div>
                  <p className="font-semibold text-sm mb-2">Contas a Receber sem Cliente Vinculado ({dadosIncompletos.receber.length})</p>
                  <div className="space-y-2">
                    {dadosIncompletos.receber.slice(0, 5).map(conta => (
                      <div key={conta.id} className="flex items-center justify-between p-2 bg-white border rounded">
                        <div>
                          <p className="text-sm font-medium">{conta.descricao}</p>
                          <p className="text-xs text-slate-600">Cliente: {conta.cliente}</p>
                        </div>
                        <Badge variant="outline" className="text-yellow-700">Sem vínculo</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dadosIncompletos.pagar.length > 0 && (
                <div>
                  <p className="font-semibold text-sm mb-2">Contas a Pagar sem Fornecedor Vinculado ({dadosIncompletos.pagar.length})</p>
                  <div className="space-y-2">
                    {dadosIncompletos.pagar.slice(0, 5).map(conta => (
                      <div key={conta.id} className="flex items-center justify-between p-2 bg-white border rounded">
                        <div>
                          <p className="text-sm font-medium">{conta.descricao}</p>
                          <p className="text-xs text-slate-600">Fornecedor: {conta.fornecedor}</p>
                        </div>
                        <Badge variant="outline" className="text-yellow-700">Sem vínculo</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Saudável */}
      {totalAnomalias === 0 && (
        <Alert className="border-green-300 bg-green-50">
          <AlertDescription className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">✅ Sistema Saudável</p>
              <p className="text-xs text-green-700">Nenhuma anomalia fiscal detectada pela IA. Continue monitorando regularmente.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}