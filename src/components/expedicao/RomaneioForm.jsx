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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Truck, MapPin, Loader2, AlertTriangle, Shield } from "lucide-react";

import baixarEstoqueExpedicao from "@/components/expedicao/ConexaoEstoqueExpedicao";

/**
 * V21.5 - Formulário Romaneio com Validação CNH
 * Bloqueia motoristas com CNH vencida
 */
export default function RomaneioForm({ isOpen, onClose, empresaId, romaneio }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    motorista_id: romaneio?.motorista_id || "",
    motorista: romaneio?.motorista || "",
    motorista_telefone: romaneio?.motorista_telefone || "",
    veiculo_id: romaneio?.veiculo_id || "",
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

  // V21.5: Buscar motoristas (colaboradores que podem dirigir)
  const { data: motoristas = [] } = useQuery({
    queryKey: ['motoristas-disponiveis', empresaId],
    queryFn: async () => {
      const colaboradores = await base44.entities.Colaborador.filter({
        empresa_alocada_id: empresaId,
        pode_dirigir: true,
        status: 'Ativo'
      });

      // Validar CNH
      const hoje = new Date();
      return colaboradores.map(colab => {
        const cnhVencida = colab.cnh_validade
          ? new Date(colab.cnh_validade) < hoje
          : false;

        const diasRestantes = colab.cnh_validade
          ? Math.floor((new Date(colab.cnh_validade) - hoje) / (1000 * 60 * 60 * 24))
          : 999;

        return {
          ...colab,
          cnh_vencida: cnhVencida,
          cnh_dias_restantes: diasRestantes,
          bloqueado: cnhVencida
        };
      });
    },
    enabled: isOpen
  });

  // V21.5: Buscar veículos
  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos-disponiveis', empresaId],
    queryFn: () => base44.entities.Veiculo.filter({
      empresa_id: empresaId,
      status: 'Disponível'
    }),
    enabled: isOpen
  });

  const { data: entregas = [], isLoading: isLoadingEntregas } = useQuery({
    queryKey: ['entregas-para-romaneio', empresaId, romaneio?.id],
    queryFn: async () => {
      if (romaneio?.id) {
        const allEntregas = await base44.entities.Entrega.list('-created_date');
        return allEntregas.filter(e => romaneio.entregas_ids.includes(e.id));
      } else if (empresaId) {
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

  // V21.5: Validar motorista selecionado
  const motoristaSelecionado = motoristas.find(m => m.id === formData.motorista_id);

  const gerarRomaneioMutation = useMutation({
    mutationFn: async () => {
      const entregasSelecionadas = entregas.filter(e =>
        formData.entregas_selecionadas.includes(e.id)
      );

      if (entregasSelecionadas.length === 0) {
        throw new Error("Selecione pelo menos uma entrega");
      }

      if (!formData.motorista_id && !formData.motorista) {
        throw new Error("Selecione um motorista");
      }

      // V21.5: VALIDAÇÃO CNH
      if (motoristaSelecionado?.bloqueado) {
        throw new Error(
          `❌ MOTORISTA BLOQUEADO!\n\n` +
          `${motoristaSelecionado.nome_completo} está com CNH VENCIDA!\n` +
          `Vencimento: ${new Date(motoristaSelecionado.cnh_validade).toLocaleDateString('pt-BR')}\n\n` +
          `Selecione outro motorista ou renove a CNH.`
        );
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
        motorista_id: formData.motorista_id || undefined,
        motorista: motoristaSelecionado?.nome_completo || formData.motorista,
        motorista_telefone: motoristaSelecionado?.telefone || formData.motorista_telefone,
        veiculo_id: formData.veiculo_id || undefined,
        veiculo: formData.veiculo,
        placa: formData.placa,
        tipo_veiculo: formData.tipo_veiculo,
        entregas_ids: formData.entregas_selecionadas,
        quantidade_entregas: entregasSelecionadas.length,
        quantidade_volumes: volumesTotal,
        peso_total_kg: pesoTotal,
        valor_total_mercadoria: valorTotal,
        status: "Aberto",
        instrucoes_motorista: formData.instrucoes_motorista,
        checklist_saida: checklist,
        entregas_realizadas: 0,
        entregas_frustradas: 0
      });

      for (const entrega of entregasSelecionadas) {
        await base44.entities.Entrega.update(entrega.id, {
          romaneio_id: romaneioCriado.id,
          motorista: motoristaSelecionado?.nome_completo || formData.motorista,
          motorista_id: formData.motorista_id || undefined,
          motorista_telefone: motoristaSelecionado?.telefone || formData.motorista_telefone,
          historico_status: [
            ...(entrega.historico_status || []),
            {
              status: "Atribuída a Romaneio",
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
        title: "❌ Erro ao gerar romaneio",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const aprovarRomaneioMutation = useMutation({
    mutationFn: async (romaneioId) => {
      if (!romaneioId) {
        throw new Error("ID do romaneio não fornecido para aprovação.");
      }

      await baixarEstoqueExpedicao(romaneioId);

      const updatedRomaneio = await base44.entities.Romaneio.update(romaneioId, {
        status: 'Aprovado',
        aprovado_por: 'Usuário Atual',
        data_aprovacao: new Date().toISOString()
      });

      const entregasDoRomaneio = await base44.entities.Entrega.list();
      const entregasRomaneio = entregasDoRomaneio.filter(e => e.romaneio_id === romaneioId);

      for (const entrega of entregasRomaneio) {
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
      queryClient.invalidateQueries({ queryKey: ['entregas-para-romaneio'] });
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      toast({ title: "✅ Romaneio aprovado com sucesso!" });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao aprovar romaneio",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const entregasSelecionadas = entregas.filter(e => formData.entregas_selecionadas.includes(e.id));

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

        <div className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); gerarRomaneioMutation.mutate(); }}>
            {/* V21.5: Seletor de Motorista com Validação CNH */}
            <Card>
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Dados do Motorista e Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Seletor de Motorista */}
                <div>
                  <Label>Motorista *</Label>
                  <Select
                    value={formData.motorista_id}
                    onValueChange={(value) => {
                      const motorista = motoristas.find(m => m.id === value);
                      setFormData({
                        ...formData,
                        motorista_id: value,
                        motorista: motorista?.nome_completo || "",
                        motorista_telefone: motorista?.telefone || ""
                      });
                    }}
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione o motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {motoristas.map(motorista => (
                        <SelectItem
                          key={motorista.id}
                          value={motorista.id}
                          disabled={motorista.bloqueado}
                        >
                          <div className="flex items-center justify-between w-full gap-3">
                            <span>{motorista.nome_completo}</span>
                            {motorista.bloqueado ? (
                              <Badge className="bg-red-600 text-xs">CNH Vencida</Badge>
                            ) : motorista.cnh_dias_restantes <= 30 ? (
                              <Badge className="bg-orange-600 text-xs">CNH vence em {motorista.cnh_dias_restantes}d</Badge>
                            ) : (
                              <Badge className="bg-green-600 text-xs">CNH OK</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* V21.5: Alerta CNH Vencida */}
                  {motoristaSelecionado?.bloqueado && (
                    <Alert className="border-red-300 bg-red-50 mt-3">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-sm text-red-800">
                        <strong>❌ MOTORISTA BLOQUEADO!</strong><br />
                        CNH vencida em {new Date(motoristaSelecionado.cnh_validade).toLocaleDateString('pt-BR')}.<br />
                        Não é possível criar romaneio com este motorista.
                      </AlertDescription>
                    </Alert>
                  )}

                  {motoristaSelecionado && !motoristaSelecionado.bloqueado && motoristaSelecionado.cnh_dias_restantes <= 30 && (
                    <Alert className="border-orange-300 bg-orange-50 mt-3">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <AlertDescription className="text-xs text-orange-800">
                        ⚠️ CNH vence em {motoristaSelecionado.cnh_dias_restantes} dia(s) - Providenciar renovação
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Telefone (auto-preenchido) */}
                <div>
                  <Label>Telefone Motorista</Label>
                  <Input
                    value={formData.motorista_telefone}
                    onChange={(e) => setFormData({ ...formData, motorista_telefone: e.target.value })}
                    className="mt-2"
                    disabled={isFormDisabled}
                  />
                </div>

                {/* Seletor de Veículo */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Veículo</Label>
                    <Select
                      value={formData.veiculo_id}
                      onValueChange={(value) => {
                        const veiculo = veiculos.find(v => v.id === value);
                        setFormData({
                          ...formData,
                          veiculo_id: value,
                          veiculo: veiculo?.modelo || "",
                          placa: veiculo?.placa || "",
                          tipo_veiculo: veiculo?.tipo_veiculo || "Caminhão"
                        });
                      }}
                      disabled={isFormDisabled}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {veiculos.map(veiculo => (
                          <SelectItem key={veiculo.id} value={veiculo.id}>
                            {veiculo.modelo} - {veiculo.placa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          {!isExistingRomaneio && (
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
                            {!isExistingRomaneio && (
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

            {/* Botões */}
            {!isExistingRomaneio && (
              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !formData.motorista_id ||
                    motoristaSelecionado?.bloqueado ||
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