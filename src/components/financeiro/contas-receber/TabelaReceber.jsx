import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Printer, Eye, Edit, CreditCard, QrCode, FileText, MessageSquare, CheckCircle2, Wallet, Zap, DollarSign } from 'lucide-react';
import { ProtectedAction } from '@/components/ProtectedAction';
import ERPDataTable from '@/components/ui/erp/DataTable';
import EstagiosRecebimentoWidget from '../EstagiosRecebimentoWidget';

export default function TabelaReceber({
  contas,
  empresas,
  statusColors,
  contasSelecionadas,
  toggleSelecao,
  onPrint,
  onEdit,
  onGerarCobranca,
  onGerarLink,
  onVerBoleto,
  onCopiarPix,
  onEnviarWhatsApp,
  onSimularPagamento,
  onBaixar,
  configsCobranca
}) {
  const obterConfigEmpresa = (empresaId) => configsCobranca.find(c => c.empresa_id === empresaId);

  return (
    <Card className="border-0 shadow-md flex-1 overflow-hidden flex flex-col">
      <CardHeader className="bg-slate-50 border-b py-2 px-3 min-h-[50px] max-h-[50px]">
        <CardTitle className="text-sm">Títulos a Receber</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-50 z-10">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={contasSelecionadas.length === contas.filter(c => c.status === "Pendente" || c.status === "Atrasado").length}
                  onCheckedChange={(checked) => {
                    const pendentes = contas.filter(c => c.status === "Pendente" || c.status === "Atrasado");
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
              <TableHead>Cliente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Marketplace</TableHead>
              <TableHead>Cobrança</TableHead>
              <TableHead>Estágios</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contas.map((conta) => {
              const empresa = empresas.find(e => e.id === conta.empresa_id);
              const config = obterConfigEmpresa(conta.empresa_id);
              const temConfig = config && config.ativo;
              const vencida = (conta.status === "Pendente" || conta.status === "Atrasado") && new Date(conta.data_vencimento) < new Date();
              const diasAtraso = vencida ? Math.floor((new Date() - new Date(conta.data_vencimento)) / (1000 * 60 * 60 * 24)) : 0;

              return (
                <TableRow key={conta.id} className={vencida ? 'bg-red-50' : ''}>
                  <TableCell>
                    {(conta.status === "Pendente" || conta.status === "Atrasado") && (
                      <Checkbox
                        checked={contasSelecionadas.includes(conta.id)}
                        onCheckedChange={() => toggleSelecao(conta.id)}
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{conta.cliente}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{conta.descricao}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-purple-600" />
                      <span className="text-xs">{empresa?.nome_fantasia || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</p>
                      {vencida && (
                        <Badge variant="destructive" className="text-xs">{diasAtraso}d atraso</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">R$ {conta.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[conta.status] || 'bg-gray-100 text-gray-800'}>
                      {conta.status}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{conta.canal_origem || 'Manual'}</Badge></TableCell>
                  <TableCell>
                    {conta.marketplace_origem && conta.marketplace_origem !== 'Nenhum' ? (
                      <Badge className="bg-purple-100 text-purple-700 text-xs">{conta.marketplace_origem}</Badge>
                    ) : <span className="text-xs text-slate-400">-</span>}
                  </TableCell>
                  <TableCell>
                    {conta.status_cobranca === "gerada_simulada" || conta.status_cobranca === "gerada" ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">{conta.forma_cobranca}</Badge>
                    ) : <Badge variant="outline" className="text-xs">Não Gerada</Badge>}
                  </TableCell>
                  <TableCell>
                    {conta.status === "Recebido" && conta.detalhes_pagamento ? (
                      <EstagiosRecebimentoWidget conta={conta} />
                    ) : <span className="text-xs text-slate-400">-</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Button variant="ghost" size="sm" onClick={() => onPrint(conta, empresa)} className="justify-start h-6 px-2 text-xs">
                        <Printer className="w-3 h-3 mr-1" /> Imprimir
                      </Button>
                      <ProtectedAction permission="financeiro_receber_visualizar">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(conta)} className="justify-start h-6 px-2 text-xs">
                          <Eye className="w-3 h-3 mr-1" /> Detalhes
                        </Button>
                      </ProtectedAction>

                      {conta.status === "Pendente" && (
                        <>
                          {!conta.status_cobranca && temConfig && (
                            <>
                              <ProtectedAction permission="financeiro_receber_gerar_cobranca">
                                <Button variant="ghost" size="sm" onClick={() => onGerarCobranca(conta)} className="justify-start h-6 px-2 text-xs">
                                  <CreditCard className="w-3 h-3 mr-1" /> Cobrança
                                </Button>
                              </ProtectedAction>
                              <ProtectedAction permission="financeiro_receber_gerar_cobranca">
                                <Button variant="ghost" size="sm" onClick={() => onGerarLink(conta)} className="justify-start h-6 px-2 text-xs text-purple-600">
                                  <Wallet className="w-3 h-3 mr-1" /> Link
                                </Button>
                              </ProtectedAction>
                            </>
                          )}

                          {conta.boleto_url && (
                            <Button variant="ghost" size="sm" onClick={() => onVerBoleto(conta)} className="justify-start h-6 px-2 text-xs">
                              <FileText className="w-3 h-3 mr-1" /> Boleto
                            </Button>
                          )}
                          {conta.pix_copia_cola && (
                            <Button variant="ghost" size="sm" onClick={() => onCopiarPix(conta)} className="justify-start h-6 px-2 text-xs">
                              <QrCode className="w-3 h-3 mr-1" /> PIX
                            </Button>
                          )}

                          {(conta.boleto_url || conta.pix_copia_cola) && (
                            <ProtectedAction permission="financeiro_receber_enviar_cobranca_whatsapp">
                              <Button variant="ghost" size="sm" onClick={() => onEnviarWhatsApp(conta)} className="justify-start h-6 px-2 text-xs">
                                <MessageSquare className="w-3 h-3 mr-1" /> WhatsApp
                              </Button>
                            </ProtectedAction>
                          )}

                          {conta.status_cobranca === "gerada_simulada" && (
                            <ProtectedAction permission="financeiro_receber_simular_pagamento">
                              <Button variant="ghost" size="sm" onClick={() => onSimularPagamento(conta)} className="justify-start h-6 px-2 text-xs text-green-600">
                                <Zap className="w-3 h-3 mr-1" /> Simular
                              </Button>
                            </ProtectedAction>
                          )}

                          <ProtectedAction permission="financeiro_receber_baixar">
                            <Button variant="ghost" size="sm" onClick={() => onBaixar(conta)} className="justify-start h-6 px-2 text-xs text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Baixar
                            </Button>
                          </ProtectedAction>
                        </>
                      )}

                      <ProtectedAction permission="financeiro_receber_editar">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(conta, true)} className="justify-start h-6 px-2 text-xs">
                          <Edit className="w-3 h-3 mr-1" /> Editar
                        </Button>
                      </ProtectedAction>
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
            <p>Nenhuma conta a receber encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}