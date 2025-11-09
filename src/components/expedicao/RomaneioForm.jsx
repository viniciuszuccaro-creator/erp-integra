
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Truck, CheckCircle, MapPin, Loader2 } from "lucide-react";

import baixarEstoqueExpedicao from "@/components/expedicao/ConexaoEstoqueExpedicao";

/**
 * Formulário para Geração de Romaneio ou Visualização/Aprovação de Romaneio Existente
 */
export default function RomaneioForm({ isOpen, onClose, empresaId, romaneio }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    motorista: romaneio?.motorista || "",
    motorista_telefone: romaneio?.motorista_telefone || "",
    veiculo: romaneio?.veiculo || "",
    placa: romaneio?.placa || "",
    tipo_veiculo: romaneio?.tipo_veiculo || "Caminhão",
    instrucoes_motorista: romaneio?.instrucoes_motorista || "",
    entregas_selecionadas: romaneio?.entregas_ids || []
  });

  const [checklist, setChecklist] = useState(romaneio?.checklist_saida || {
    documentos_ok: false,
    veiculo_ok: false,
    carga_conferida: false,
    combustivel_ok: false,
    observacoes: ""
  });

  // Fetch available deliveries for new romaneio or deliveries associated with an existing romaneio
  const { data: entregas = [], isLoading: isLoadingEntregas } = useQuery({
    queryKey: ['entregas-para-romaneio', empresaId, romaneio?.id],
    queryFn: async () => {
      if (romaneio?.id) {
        // If viewing an existing romaneio, fetch its associated deliveries
        const allEntregas = await base44.entities.Entrega.list('-created_date');
        return allEntregas.filter(e => romaneio.entregas_ids.includes(e.id));
      } else if (empresaId) {
        // If creating a new romaneio, fetch eligible deliveries
        const todas = await base44.entities.Entrega.list('-created_date');
        return todas.filter(e =>
          e.empresa_id === empresaId &&
          e.status === "Pronto para Expedir" &&
          !e.romaneio_id
        );
      }
      return [];
    },
    enabled: isOpen && (!!empresaId || !!romaneio?.id),
  });

  const toggleEntrega = (entregaId) => {
    if (formData.entregas_selecionadas.includes(entregaId)) {
      setFormData({
        ...formData,
        entregas_selecionadas: formData.entregas_selecionadas.filter(id => id !== entregaId)
      });
    } else {
      setFormData({
        ...formData,
        entregas_selecionadas: [...formData.entregas_selecionadas, entregaId]
      });
    }
  };

  const gerarRomaneioMutation = useMutation({
    mutationFn: async () => {
      const entregasSelecionadas = entregas.filter(e =>
        formData.entregas_selecionadas.includes(e.id)
      );

      if (entregasSelecionadas.length === 0) {
        throw new Error("Selecione pelo menos uma entrega");
      }

      if (!formData.motorista) {
        throw new Error("O campo Motorista é obrigatório.");
      }

      const pesoTotal = entregasSelecionadas.reduce((sum, e) => sum + (e.peso_total_kg || 0), 0);
      const volumesTotal = entregasSelecionadas.reduce((sum, e) => sum + (e.volumes || 0), 0);
      const valorTotal = entregasSelecionadas.reduce((sum, e) => sum + (e.valor_mercadoria || 0), 0);

      const numeroRomaneio = `ROM-${Date.now()}`;

      const romaneioCriado = await base44.entities.Romaneio.create({
        group_id: entregasSelecionadas[0].group_id,
        empresa_id: empresaId,
        numero_romaneio: numeroRomaneio,
        data_romaneio: new Date().toISOString().split('T')[0],
        data_saida: new Date().toISOString(),
        motorista: formData.motorista,
        motorista_telefone: formData.motorista_telefone,
        veiculo: formData.veiculo,
        placa: formData.placa,
        tipo_veiculo: formData.tipo_veiculo,
        entregas_ids: formData.entregas_selecionadas,
        quantidade_entregas: entregasSelecionadas.length,
        quantidade_volumes: volumesTotal,
        peso_total_kg: pesoTotal,
        valor_total_mercadoria: valorTotal,
        status: "Aberto", // Romaneio starts as "Aberto" and can then be "Aprovado"
        instrucoes_motorista: formData.instrucoes_motorista,
        checklist_saida: checklist,
        entregas_realizadas: 0,
        entregas_frustradas: 0
      });

      // Atualizar entregas
      for (const entrega of entregasSelecionadas) {
        await base44.entities.Entrega.update(entrega.id, {
          romaneio_id: romaneioCriado.id,
          // Status remains "Pronto para Expedir" until romaneio is approved
          historico_status: [
            ...(entrega.historico_status || []),
            {
              status: "Atribuída a Romaneio", // New status indicating it's part of a romaneio
              data_hora: new Date().toISOString(),
              usuario: "Sistema",
              observacao: `Incluído no romaneio ${numeroRomaneio}`
            }
          ]
        });
      }

      return romaneioCriado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas-para-romaneio'] });
      queryClient.invalidateQueries({ queryKey: ['romaneios'] });
      toast({ title: "✅ Romaneio gerado com sucesso!" });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar romaneio",
        description: error.message || "Não foi possível gerar o romaneio.",
        variant: "destructive",
      });
    },
  });

  const aprovarRomaneioMutation = useMutation({
    mutationFn: async (romaneioId) => {
      if (!romaneioId) {
        throw new Error("ID do romaneio não fornecido para aprovação.");
      }

      // V21.4: GATILHO - Saída de Estoque
      await baixarEstoqueExpedicao(romaneioId);

      const updatedRomaneio = await base44.entities.Romaneio.update(romaneioId, {
        status: 'Aprovado',
        aprovado_por: 'Usuário Atual', // This should ideally come from an auth context
        data_aprovacao: new Date().toISOString()
      });

      // Update status of associated deliveries to "Saiu para Entrega"
      const entregasDoRomaneio = await base44.entities.Entrega.list('id', {
        filters: { romaneio_id: romaneioId }
      });

      for (const entrega of entregasDoRomaneio) {
        await base44.entities.Entrega.update(entrega.id, {
          status: "Saiu para Entrega",
          data_saida: new Date().toISOString(),
          historico_status: [
            ...(entrega.historico_status || []),
            {
              status: "Saiu para Entrega",
              data_hora: new Date().toISOString(),
              usuario: "Sistema",
              observacao: `Romaneio ${updatedRomaneio.numero_romaneio} aprovado.`
            }
          ]
        });
      }

      return updatedRomaneio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['romaneios'] });
      queryClient.invalidateQueries({ queryKey: ['entregas-para-romaneio'] }); // Invalidate deliveries as well
      queryClient.invalidateQueries({ queryKey: ['entregas'] }); // Invalidate all deliveries
      toast({ title: "✅ Romaneio aprovado com sucesso!" });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao aprovar romaneio",
        description: error.message || "Não foi possível aprovar o romaneio.",
        variant: "destructive",
      });
    },
  });

  const entregasSelecionadas = entregas.filter(e => formData.entregas_selecionadas.includes(e.id));

  // Determine if the form is in view/edit mode for an existing romaneio
  const isExistingRomaneio = !!romaneio;
  const isRomaneioApproved = romaneio?.status === 'Aprovado';
  const isFormDisabled = isExistingRomaneio && (isRomaneioApproved || romaneio?.status === 'Em Rota' || romaneio?.status === 'Concluído' || romaneio?.status === 'Cancelado');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            {isExistingRomaneio ? `Detalhes do Romaneio ${romaneio.numero_romaneio}` : "Gerar Romaneio de Entrega"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6"> {/* Wrapper div for form and actions */}
          <form onSubmit={(e) => { e.preventDefault(); gerarRomaneioMutation.mutate(); }}>
            {/* Dados do Motorista */}
            <Card>
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-base">Dados do Motorista e Veículo</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Motorista *</Label>
                    <Input
                      value={formData.motorista}
                      onChange={(e) => setFormData({ ...formData, motorista: e.target.value })}
                      required
                      className="mt-2"
                      disabled={isFormDisabled}
                    />
                  </div>
                  <div>
                    <Label>Telefone Motorista</Label>
                    <Input
                      value={formData.motorista_telefone}
                      onChange={(e) => setFormData({ ...formData, motorista_telefone: e.target.value })}
                      className="mt-2"
                      disabled={isFormDisabled}
                    />
                  </div>
                  <div>
                    <Label>Veículo</Label>
                    <Input
                      value={formData.veiculo}
                      onChange={(e) => setFormData({ ...formData, veiculo: e.target.value })}
                      placeholder="Ex: Caminhão Iveco"
                      className="mt-2"
                      disabled={isFormDisabled}
                    />
                  </div>
                  <div>
                    <Label>Placa</Label>
                    <Input
                      value={formData.placa}
                      onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                      placeholder="ABC-1234"
                      className="mt-2"
                      disabled={isFormDisabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seleção de Entregas */}
            <Card>
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="text-base">
                  Entregas ({formData.entregas_selecionadas.length} selecionadas)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingEntregas ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="w-12">
                          {!isExistingRomaneio && ( // Only show checkbox for new romaneio creation
                            <Checkbox
                              checked={formData.entregas_selecionadas.length === entregas.length && entregas.length > 0}
                              onCheckedChange={(checked) => {
                                setFormData({
                                  ...formData,
                                  entregas_selecionadas: checked ? entregas.map(e => e.id) : []
                                });
                              }}
                              disabled={isFormDisabled}
                            />
                          )}
                        </TableHead>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Volumes</TableHead>
                        <TableHead>Peso</TableHead>
                        <TableHead>Prioridade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entregas.map(entrega => (
                        <TableRow key={entrega.id}>
                          <TableCell>
                            {!isExistingRomaneio && ( // Only show checkbox for new romaneio creation
                              <Checkbox
                                checked={formData.entregas_selecionadas.includes(entrega.id)}
                                onCheckedChange={() => toggleEntrega(entrega.id)}
                                disabled={isFormDisabled}
                              />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{entrega.numero_pedido || '-'}</TableCell>
                          <TableCell>{entrega.cliente_nome}</TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-blue-600" />
                              {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
                            </div>
                          </TableCell>
                          <TableCell>{entrega.volumes || 0}</TableCell>
                          <TableCell>{entrega.peso_total_kg?.toFixed(1) || 0} kg</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              entrega.prioridade === 'Urgente' ? 'border-red-500 text-red-700' :
                              entrega.prioridade === 'Alta' ? 'border-orange-500 text-orange-700' :
                              'border-slate-400'
                            }>
                              {entrega.prioridade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}


                {entregas.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Truck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma entrega pronta para romaneio</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo */}
            {entregasSelecionadas.length > 0 && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-5">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-purple-700">Entregas</p>
                      <p className="text-2xl font-bold text-purple-900">{entregasSelecionadas.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700">Volumes</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {entregasSelecionadas.reduce((sum, e) => sum + (e.volumes || 0), 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700">Peso Total</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {entregasSelecionadas.reduce((sum, e) => sum + (e.peso_total_kg || 0), 0).toFixed(1)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700">Valor</p>
                      <p className="text-xl font-bold text-purple-900">
                        R$ {entregasSelecionadas.reduce((sum, e) => sum + (e.valor_mercadoria || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Checklist */}
            <Card>
              <CardHeader className="bg-orange-50 border-b">
                <CardTitle className="text-base">Checklist de Saída</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={checklist.documentos_ok}
                    onCheckedChange={(v) => setChecklist({ ...checklist, documentos_ok: v })}
                    disabled={isFormDisabled}
                  />
                  <Label>Documentos conferidos (NF-e, romaneio, etc.)</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={checklist.veiculo_ok}
                    onCheckedChange={(v) => setChecklist({ ...checklist, veiculo_ok: v })}
                    disabled={isFormDisabled}
                  />
                  <Label>Veículo em boas condições</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={checklist.carga_conferida}
                    onCheckedChange={(v) => setChecklist({ ...checklist, carga_conferida: v })}
                    disabled={isFormDisabled}
                  />
                  <Label>Carga conferida e amarrada</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={checklist.combustivel_ok}
                    onCheckedChange={(v) => setChecklist({ ...checklist, combustivel_ok: v })}
                    disabled={isFormDisabled}
                  />
                  <Label>Combustível suficiente</Label>
                </div>
                <div className="mt-3">
                  <Label>Observações do Checklist</Label>
                  <Textarea
                    value={checklist.observacoes}
                    onChange={(e) => setChecklist({ ...checklist, observacoes: e.target.value })}
                    rows={2}
                    className="mt-2"
                    disabled={isFormDisabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Instruções */}
            <div>
              <Label>Instruções para o Motorista</Label>
              <Textarea
                value={formData.instrucoes_motorista}
                onChange={(e) => setFormData({ ...formData, instrucoes_motorista: e.target.value })}
                rows={3}
                placeholder="Observações e instruções especiais..."
                className="mt-2"
                disabled={isFormDisabled}
              />
            </div>

            {/* Botões para Gerar Romaneio (apenas para criação) */}
            {!isExistingRomaneio && (
              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !formData.motorista ||
                    formData.entregas_selecionadas.length === 0 ||
                    gerarRomaneioMutation.isPending
                  }
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {gerarRomaneioMutation.isPending ? 'Gerando...' : 'Gerar Romaneio'}
                </Button>
              </div>
            )}
          </form>

          {/* Botão de Aprovação (apenas para romaneios existentes e abertos) */}
          {romaneio && romaneio.status === 'Aberto' && (
            <Button
              onClick={() => aprovarRomaneioMutation.mutate(romaneio.id)}
              disabled={aprovarRomaneioMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {aprovarRomaneioMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aprovando + Baixando Estoque...
                </>
              ) : (
                'Aprovar Romaneio'
              )}
            </Button>
          )}

          {/* Botão para fechar em modo de visualização */}
          {isExistingRomaneio && (isRomaneioApproved || romaneio.status !== 'Aberto') && (
             <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
