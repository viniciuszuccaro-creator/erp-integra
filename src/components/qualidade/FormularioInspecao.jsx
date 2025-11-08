import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Camera } from "lucide-react";

/**
 * Formulário de Inspeção de Qualidade
 */
export default function FormularioInspecao({ op, item, onConcluido }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [resultado, setResultado] = useState("Aprovado");
  const [motivoReprovacao, setMotivoReprovacao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [tempoMin, setTempoMin] = useState(0);

  const [checklistCorte, setChecklistCorte] = useState({
    bitola_conforme: false,
    bitola_medida_mm: 0,
    comprimento_conforme: false,
    comprimento_medido_mm: 0,
    dobra_conforme: false,
    perda_conforme: false,
    estribos_conformes: false,
    acabamento_ok: false
  });

  const [checklistArmado, setChecklistArmado] = useState({
    bitola_principal_ok: false,
    bitola_estribo_ok: false,
    espacamento_conforme: false,
    espacamento_estribo_mm: 0,
    dimensoes_conformes: false,
    dimensoes_largura_mm: 0,
    dimensoes_altura_mm: 0,
    peso_conforme: false,
    peso_medido_kg: 0,
    integridade_visual_ok: false,
    amarracao_arame_ok: false,
    reforcos_ok: false
  });

  const [checklistBloco, setChecklistBloco] = useState({
    dimensao_total_ok: false,
    dimensao_medida_comprimento: 0,
    dimensao_medida_largura: 0,
    dimensao_medida_altura: 0,
    ferros_lado1_ok: false,
    ferros_lado2_ok: false,
    costelas_ok: false,
    estribos_automaticos_ok: false,
    esquadro_ok: false
  });

  const criarInspecaoMutation = useMutation({
    mutationFn: async () => {
      const dadosInspecao = {
        group_id: op.group_id,
        empresa_id: op.empresa_id,
        op_id: op.id,
        numero_op: op.numero_op,
        item_elemento: item?.elemento,
        pedido_id: op.pedido_id,
        numero_pedido: op.numero_pedido,
        cliente_id: op.cliente_id,
        cliente_nome: op.cliente_nome,
        numero_inspecao: `INS-${Date.now()}`,
        data_inspecao: new Date().toISOString(),
        responsavel_nome: "Inspetor", // TODO: pegar do user logado
        setor: op.setor_responsavel || "Final",
        tipo_producao: op.tipo_producao || "corte_dobra",
        resultado,
        motivo_reprovacao: resultado === "Reprovado" ? motivoReprovacao : "",
        observacao_geral: observacoes,
        tempo_inspecao_min: tempoMin,
        status: "Concluído",
        checklist_corte_dobra: op.tipo_producao === "corte_dobra" ? checklistCorte : null,
        checklist_armado: op.tipo_producao === "armado" ? checklistArmado : null,
        checklist_bloco: op.tipo_producao === "bloco" ? checklistBloco : null,
        liberar_para_expedicao: resultado === "Aprovado",
        expedicao_liberada: resultado === "Aprovado",
        data_liberacao_expedicao: resultado === "Aprovado" ? new Date().toISOString() : null
      };

      const inspecao = await base44.entities.InspecaoQualidade.create(dadosInspecao);

      // Atualizar OP
      if (resultado === "Aprovado") {
        await base44.entities.OrdemProducao.update(op.id, {
          status: "Pronta para Expedição",
          checklist_qualidade: {
            ...op.checklist_qualidade,
            ...checklistCorte,
            ...checklistArmado,
            ...checklistBloco,
            aprovado: true,
            responsavel_qualidade_nome: "Inspetor",
            data_conferencia: new Date().toISOString()
          }
        });
      } else if (resultado === "Reprovado") {
        await base44.entities.OrdemProducao.update(op.id, {
          status: "Pausada",
          motivo_pausa: `Reprovado na qualidade: ${motivoReprovacao}`,
          data_pausa: new Date().toISOString()
        });

        // Criar notificação
        await base44.entities.Notificacao.create({
          titulo: `OP ${op.numero_op} Reprovada na Qualidade`,
          mensagem: `Item ${item?.elemento} reprovado. Motivo: ${motivoReprovacao}`,
          tipo: "erro",
          categoria: "Producao",
          prioridade: "Alta",
          entidade_relacionada: "OrdemProducao",
          registro_id: op.id,
          destinatario_email: "producao@empresa.com" // TODO: configurar destinatários
        });
      }

      return inspecao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordens-producao'] });
      queryClient.invalidateQueries({ queryKey: ['inspecoes'] });
      toast({
        title: resultado === "Aprovado" ? "✅ Inspeção aprovada!" : "⚠️ Inspeção reprovada",
        description: resultado === "Aprovado" 
          ? "OP liberada para expedição"
          : "Notificação enviada ao setor de produção"
      });
      if (onConcluido) onConcluido();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (resultado === "Reprovado" && !motivoReprovacao) {
      toast({
        title: "⚠️ Informe o motivo da reprovação",
        variant: "destructive"
      });
      return;
    }

    criarInspecaoMutation.mutate();
  };

  const tipoProducao = op?.tipo_producao || "corte_dobra";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resultado */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Resultado da Inspeção</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-3">
            <Button
              type="button"
              variant={resultado === "Aprovado" ? "default" : "outline"}
              className={resultado === "Aprovado" ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => setResultado("Aprovado")}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Aprovado
            </Button>
            <Button
              type="button"
              variant={resultado === "Revisar" ? "default" : "outline"}
              className={resultado === "Revisar" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
              onClick={() => setResultado("Revisar")}
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Revisar
            </Button>
            <Button
              type="button"
              variant={resultado === "Reprovado" ? "default" : "outline"}
              className={resultado === "Reprovado" ? "bg-red-600 hover:bg-red-700" : ""}
              onClick={() => setResultado("Reprovado")}
            >
              <XCircle className="w-5 h-5 mr-2" />
              Reprovado
            </Button>
          </div>

          {resultado === "Reprovado" && (
            <div className="mt-4">
              <Label>Motivo da Reprovação *</Label>
              <Textarea
                value={motivoReprovacao}
                onChange={(e) => setMotivoReprovacao(e.target.value)}
                rows={3}
                required
                className="mt-2"
                placeholder="Descreva o motivo da reprovação..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist Corte e Dobra */}
      {tipoProducao === "corte_dobra" && (
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-base">Checklist - Corte e Dobra</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistCorte.bitola_conforme}
                onCheckedChange={(v) => setChecklistCorte({ ...checklistCorte, bitola_conforme: v })}
              />
              <Label className="text-base">Bitola conforme especificação</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistCorte.comprimento_conforme}
                onCheckedChange={(v) => setChecklistCorte({ ...checklistCorte, comprimento_conforme: v })}
              />
              <Label className="text-base">Comprimento conforme (±5mm)</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistCorte.dobra_conforme}
                onCheckedChange={(v) => setChecklistCorte({ ...checklistCorte, dobra_conforme: v })}
              />
              <Label className="text-base">Dobra conforme (±2°)</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistCorte.perda_conforme}
                onCheckedChange={(v) => setChecklistCorte({ ...checklistCorte, perda_conforme: v })}
              />
              <Label className="text-base">Perda dentro do esperado</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistCorte.estribos_conformes}
                onCheckedChange={(v) => setChecklistCorte({ ...checklistCorte, estribos_conformes: v })}
              />
              <Label className="text-base">Estribos conformes</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistCorte.acabamento_ok}
                onCheckedChange={(v) => setChecklistCorte({ ...checklistCorte, acabamento_ok: v })}
              />
              <Label className="text-base">Acabamento satisfatório</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist Armado */}
      {tipoProducao === "armado" && (
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-purple-50 border-b">
            <CardTitle className="text-base">Checklist - Armação</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistArmado.bitola_principal_ok}
                onCheckedChange={(v) => setChecklistArmado({ ...checklistArmado, bitola_principal_ok: v })}
              />
              <Label className="text-base">Bitola principal conforme</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistArmado.bitola_estribo_ok}
                onCheckedChange={(v) => setChecklistArmado({ ...checklistArmado, bitola_estribo_ok: v })}
              />
              <Label className="text-base">Bitola estribo conforme</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistArmado.espacamento_conforme}
                onCheckedChange={(v) => setChecklistArmado({ ...checklistArmado, espacamento_conforme: v })}
              />
              <Label className="text-base">Espaçamento entre estribos (±2mm)</Label>
            </div>
            <div>
              <Label>Espaçamento Medido (mm)</Label>
              <Input
                type="number"
                value={checklistArmado.espacamento_estribo_mm}
                onChange={(e) => setChecklistArmado({ ...checklistArmado, espacamento_estribo_mm: parseFloat(e.target.value) })}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistArmado.dimensoes_conformes}
                onCheckedChange={(v) => setChecklistArmado({ ...checklistArmado, dimensoes_conformes: v })}
              />
              <Label className="text-base">Dimensões gerais conformes (±5%)</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Largura Medida (mm)</Label>
                <Input
                  type="number"
                  value={checklistArmado.dimensoes_largura_mm}
                  onChange={(e) => setChecklistArmado({ ...checklistArmado, dimensoes_largura_mm: parseFloat(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Altura Medida (mm)</Label>
                <Input
                  type="number"
                  value={checklistArmado.dimensoes_altura_mm}
                  onChange={(e) => setChecklistArmado({ ...checklistArmado, dimensoes_altura_mm: parseFloat(e.target.value) })}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistArmado.peso_conforme}
                onCheckedChange={(v) => setChecklistArmado({ ...checklistArmado, peso_conforme: v })}
              />
              <Label className="text-base">Peso conforme (±3%)</Label>
            </div>
            <div>
              <Label>Peso Medido (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={checklistArmado.peso_medido_kg}
                onChange={(e) => setChecklistArmado({ ...checklistArmado, peso_medido_kg: parseFloat(e.target.value) })}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistArmado.integridade_visual_ok}
                onCheckedChange={(v) => setChecklistArmado({ ...checklistArmado, integridade_visual_ok: v })}
              />
              <Label className="text-base">Integridade visual (sem falhas)</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistArmado.amarracao_arame_ok}
                onCheckedChange={(v) => setChecklistArmado({ ...checklistArmado, amarracao_arame_ok: v })}
              />
              <Label className="text-base">Amarração com arame adequada</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist Bloco */}
      {tipoProducao === "bloco" && (
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-orange-50 border-b">
            <CardTitle className="text-base">Checklist - Blocos</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistBloco.dimensao_total_ok}
                onCheckedChange={(v) => setChecklistBloco({ ...checklistBloco, dimensao_total_ok: v })}
              />
              <Label className="text-base">Dimensões totais conformes (±2%)</Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Comprimento (mm)</Label>
                <Input
                  type="number"
                  value={checklistBloco.dimensao_medida_comprimento}
                  onChange={(e) => setChecklistBloco({ ...checklistBloco, dimensao_medida_comprimento: parseFloat(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Largura (mm)</Label>
                <Input
                  type="number"
                  value={checklistBloco.dimensao_medida_largura}
                  onChange={(e) => setChecklistBloco({ ...checklistBloco, dimensao_medida_largura: parseFloat(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Altura (mm)</Label>
                <Input
                  type="number"
                  value={checklistBloco.dimensao_medida_altura}
                  onChange={(e) => setChecklistBloco({ ...checklistBloco, dimensao_medida_altura: parseFloat(e.target.value) })}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistBloco.ferros_lado1_ok}
                onCheckedChange={(v) => setChecklistBloco({ ...checklistBloco, ferros_lado1_ok: v })}
              />
              <Label className="text-base">Ferros lado 1 conformes</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistBloco.ferros_lado2_ok}
                onCheckedChange={(v) => setChecklistBloco({ ...checklistBloco, ferros_lado2_ok: v })}
              />
              <Label className="text-base">Ferros lado 2 conformes</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistBloco.costelas_ok}
                onCheckedChange={(v) => setChecklistBloco({ ...checklistBloco, costelas_ok: v })}
              />
              <Label className="text-base">Costelas/reforços corretos</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistBloco.estribos_automaticos_ok}
                onCheckedChange={(v) => setChecklistBloco({ ...checklistBloco, estribos_automaticos_ok: v })}
              />
              <Label className="text-base">Estribos automáticos OK</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checklistBloco.esquadro_ok}
                onCheckedChange={(v) => setChecklistBloco({ ...checklistBloco, esquadro_ok: v })}
              />
              <Label className="text-base">Esquadro correto</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Observações e Tempo</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Tempo de Inspeção (minutos)</Label>
            <Input
              type="number"
              value={tempoMin}
              onChange={(e) => setTempoMin(parseInt(e.target.value))}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Observações Gerais</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              className="mt-2"
              placeholder="Observações sobre a inspeção..."
            />
          </div>

          {/* Foto (preparado) */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Button type="button" variant="outline" className="w-full" disabled>
              <Camera className="w-5 h-5 mr-2" />
              Anexar Foto da Inspeção (preparado)
            </Button>
            <p className="text-xs text-blue-700 text-center mt-2">
              Função de foto em desenvolvimento
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botões Finais */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onConcluido}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={criarInspecaoMutation.isPending}
          className={`flex-1 ${
            resultado === "Aprovado" ? 'bg-green-600 hover:bg-green-700' :
            resultado === "Reprovado" ? 'bg-red-600 hover:bg-red-700' :
            'bg-yellow-600 hover:bg-yellow-700'
          }`}
        >
          {criarInspecaoMutation.isPending ? 'Salvando...' : 'Concluir Inspeção'}
        </Button>
      </div>
    </form>
  );
}