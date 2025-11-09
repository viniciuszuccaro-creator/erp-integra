import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, CheckCircle, Clock, AlertTriangle, Download } from "lucide-react";
import { useUser } from "@/components/lib/UserContext";

/**
 * V21.3 - Fiscal e Tributário
 * COM: Lista de NF-es, Validação IA, Eventos
 */
export default function Fiscal() {
  const { empresaAtual } = useUser();
  const [aba, setAba] = useState('nfes');

  const { data: nfes = [] } = useQuery({
    queryKey: ['notas-fiscais', empresaAtual?.id],
    queryFn: () => base44.entities.NotaFiscal.filter({
      empresa_faturamento_id: empresaAtual?.id
    }, '-data_emissao', 100),
    enabled: !!empresaAtual?.id
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs-fiscal', empresaAtual?.id],
    queryFn: () => base44.entities.LogFiscal.filter({
      empresa_id: empresaAtual?.id
    }, '-data_hora', 50),
    enabled: !!empresaAtual?.id
  });

  const calcularResumo = () => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const autorizadas = nfes.filter(n => n.status === 'Autorizada').length;
    const emitidadsMes = nfes.filter(n => {
      if (!n.data_emissao) return false;
      const data = new Date(n.data_emissao);
      return data >= primeiroDiaMes;
    }).length;

    const valorMes = nfes
      .filter(n => {
        if (!n.data_emissao) return false;
        const data = new Date(n.data_emissao);
        return data >= primeiroDiaMes && n.status === 'Autorizada';
      })
      .reduce((sum, n) => sum + (n.valor_total || 0), 0);

    return { autorizadas, emitidadsMes, valorMes };
  };

  const resumo = calcularResumo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-[95vw] mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Fiscal e Tributário</h1>
                <p className="text-indigo-100">v21.3 - Validação IA + Notificação Automática</p>
              </div>
              <FileText className="w-16 h-16" />
            </div>
          </CardHeader>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-4">
              <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-xs text-green-700 mb-1">NF-es Autorizadas</p>
              <p className="text-3xl font-bold text-green-600">{resumo.autorizadas}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300 bg-blue-50">
            <CardContent className="p-4">
              <Clock className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-xs text-blue-700 mb-1">Emitidas (Mês)</p>
              <p className="text-3xl font-bold text-blue-600">{resumo.emitidadsMes}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardContent className="p-4">
              <DollarSign className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-xs text-purple-700 mb-1">Valor (Mês)</p>
              <p className="text-xl font-bold text-purple-600">
                R$ {resumo.valorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300 bg-orange-50">
            <CardContent className="p-4">
              <AlertTriangle className="w-5 h-5 text-orange-600 mb-2" />
              <p className="text-xs text-orange-700 mb-1">Pendentes</p>
              <p className="text-3xl font-bold text-orange-600">
                {nfes.filter(n => n.status === 'Rascunho').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={aba} onValueChange={setAba}>
          <TabsList>
            <TabsTrigger value="nfes">Notas Fiscais</TabsTrigger>
            <TabsTrigger value="logs">Logs e Eventos</TabsTrigger>
          </TabsList>

          <TabsContent value="nfes">
            <Card>
              <CardContent className="p-6 space-y-2">
                {nfes.map((nfe) => (
                  <Card key={nfe.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold">NF-e {nfe.numero}</p>
                            <Badge className={
                              nfe.status === 'Autorizada' ? 'bg-green-600' :
                              nfe.status === 'Rascunho' ? 'bg-orange-600' :
                              'bg-red-600'
                            }>
                              {nfe.status}
                            </Badge>
                            {nfe.faturamento_parcial && (
                              <Badge className="bg-purple-600">Faturamento Parcial</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{nfe.cliente_fornecedor}</p>
                          <p className="text-xs text-slate-500">
                            Emissão: {nfe.data_emissao ? new Date(nfe.data_emissao).toLocaleDateString('pt-BR') : '-'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-green-700">
                            R$ {(nfe.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          {nfe.status === 'Autorizada' && (
                            <div className="flex gap-1 mt-2">
                              <Button size="sm" variant="outline">
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {nfes.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                    <p>Nenhuma NF-e encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-lg border text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{log.acao}</p>
                        <Badge className={log.status === 'sucesso' ? 'bg-green-600' : 'bg-red-600'}>
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600">NF-e: {log.numero_nfe}</p>
                      <p className="text-slate-500">
                        {new Date(log.data_hora).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}