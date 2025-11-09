import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertTriangle, CheckCircle, Upload, Camera } from "lucide-react";

/**
 * V21.2 - Checklist de Qualidade para Devolução
 * OBRIGATÓRIO para aceitar logística reversa
 */
export default function ChecklistQualidadeDevolucao({ 
  isOpen, 
  onClose, 
  entrega, 
  motivoDevolucao 
}) {
  const [checklist, setChecklist] = useState({
    material_danificado: '',
    embalagem_original: '',
    foto_material_url: '',
    observacoes_qualidade: '',
    responsavel_conferencia: '',
    aprovado: false
  });
  const [enviando, setEnviando] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const queryClient = useQueryClient();

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setChecklist(prev => ({ ...prev, foto_material_url: file_url }));
    } catch (error) {
      alert(`Erro no upload: ${error.message}`);
    } finally {
      setUploadingFoto(false);
    }
  };

  const processarDevolucaoMutation = useMutation({
    mutationFn: async () => {
      setEnviando(true);

      // Validações CRÍTICAS
      if (!checklist.material_danificado || !checklist.embalagem_original) {
        throw new Error('Responda todas as perguntas obrigatórias');
      }

      if (!checklist.foto_material_url) {
        throw new Error('Foto do material é OBRIGATÓRIA');
      }

      // Determinar status da qualidade
      const materialOK = checklist.material_danificado === 'nao';
      const embalagemOK = checklist.embalagem_original === 'sim';
      const statusQualidade = materialOK && embalagemOK ? 'Aprovado' : 'Reprovado';

      // Atualizar entrega com dados da devolução
      await base44.entities.Entrega.update(entrega.id, {
        status: statusQualidade === 'Aprovado' ? 'Devolvido' : 'Entrega Frustrada',
        logistica_reversa: {
          ativada: true,
          motivo: motivoDevolucao,
          data_ocorrencia: new Date().toISOString(),
          responsavel: checklist.responsavel_conferencia,
          checklist_qualidade: {
            ...checklist,
            status_qualidade: statusQualidade,
            data_conferencia: new Date().toISOString()
          }
        }
      });

      // V21.2: Regra CRÍTICA - Só gera entrada se APROVADO
      if (statusQualidade === 'Aprovado') {
        // Criar MovimentacaoEstoque (ENTRADA)
        const itens = entrega.itens || [];
        for (const item of itens) {
          await base44.entities.MovimentacaoEstoque.create({
            empresa_id: entrega.empresa_id,
            origem_movimento: 'devolucao',
            origem_documento_id: entrega.id,
            tipo_movimento: 'entrada',
            produto_id: item.produto_id,
            produto_descricao: item.descricao,
            quantidade: item.quantidade,
            unidade_medida: item.unidade || 'KG',
            data_movimentacao: new Date().toISOString(),
            documento: `DEV-${entrega.id.substring(0, 8)}`,
            motivo: `Devolução - ${motivoDevolucao}`,
            responsavel: checklist.responsavel_conferencia
          });
        }

        // Permitir estorno financeiro
        await base44.entities.Notificacao.create({
          titulo: '✅ Devolução Aprovada - Liberar Estorno',
          mensagem: `Devolução da Entrega ${entrega.id.substring(0, 8)} foi APROVADA pela Qualidade.\n\nO Financeiro pode processar o estorno da Conta a Receber.`,
          tipo: 'sucesso',
          categoria: 'Financeiro',
          prioridade: 'Alta',
          link_acao: `/financeiro?filtro=contas-receber`,
          entidade_relacionada: 'Entrega',
          registro_id: entrega.id
        });
      } else {
        // Material REPROVADO - vai para Estoque de Perdas
        await base44.entities.Notificacao.create({
          titulo: '❌ Devolução REPROVADA - Material Danificado',
          mensagem: `Material da Entrega ${entrega.id.substring(0, 8)} foi REPROVADO.\n\nMotivo: ${
            checklist.material_danificado === 'sim' ? 'Material danificado' : 'Embalagem violada'
          }\n\nO Financeiro deve cobrar o valor da devolução do cliente.`,
          tipo: 'erro',
          categoria: 'Financeiro',
          prioridade: 'Urgente',
          link_acao: `/financeiro`,
          entidade_relacionada: 'Entrega',
          registro_id: entrega.id
        });
      }

      return { statusQualidade };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      alert(
        data.statusQualidade === 'Aprovado' 
          ? '✅ Devolução APROVADA! Material retornou ao estoque.'
          : '❌ Devolução REPROVADA! Material vai para perdas e Financeiro será notificado.'
      );
      onClose();
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
    onSettled: () => {
      setEnviando(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    processarDevolucaoMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Checklist de Qualidade - Devolução
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="border-red-300 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-sm text-red-800">
              <strong>ATENÇÃO:</strong> Este checklist é OBRIGATÓRIO para aceitar devolução no estoque.
              Responda com honestidade para garantir compliance.
            </AlertDescription>
          </Alert>

          {/* Pergunta 1: Material Danificado */}
          <Card className="border-2 border-orange-300">
            <CardContent className="p-4">
              <Label className="text-sm font-bold mb-3 block">
                1. O material está danificado? *
              </Label>
              <RadioGroup 
                value={checklist.material_danificado} 
                onValueChange={(v) => setChecklist(prev => ({ ...prev, material_danificado: v }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="nao-danificado" />
                  <Label htmlFor="nao-danificado" className="cursor-pointer">
                    ✅ Não - Material em perfeito estado
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id="sim-danificado" />
                  <Label htmlFor="sim-danificado" className="cursor-pointer">
                    ❌ Sim - Material apresenta danos
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Pergunta 2: Embalagem Original */}
          <Card className="border-2 border-orange-300">
            <CardContent className="p-4">
              <Label className="text-sm font-bold mb-3 block">
                2. A embalagem está intacta/original? *
              </Label>
              <RadioGroup 
                value={checklist.embalagem_original} 
                onValueChange={(v) => setChecklist(prev => ({ ...prev, embalagem_original: v }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id="embalagem-sim" />
                  <Label htmlFor="embalagem-sim" className="cursor-pointer">
                    ✅ Sim - Embalagem original intacta
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="embalagem-nao" />
                  <Label htmlFor="embalagem-nao" className="cursor-pointer">
                    ❌ Não - Embalagem violada/danificada
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Foto OBRIGATÓRIA */}
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-4">
              <Label className="text-sm font-bold mb-3 block text-red-900">
                3. Foto do Material Devolvido (OBRIGATÓRIO) *
              </Label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleUploadFoto}
                  className="hidden"
                  id="foto-upload"
                />
                <label htmlFor="foto-upload">
                  <div className="p-6 border-2 border-dashed border-red-300 rounded-lg cursor-pointer hover:bg-white transition-colors text-center">
                    {uploadingFoto ? (
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
                    ) : checklist.foto_material_url ? (
                      <div>
                        <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                        <p className="text-sm text-green-800 font-semibold">Foto Enviada!</p>
                        <img src={checklist.foto_material_url} alt="Material" className="mt-3 max-h-40 mx-auto rounded" />
                      </div>
                    ) : (
                      <div>
                        <Camera className="w-8 h-8 mx-auto text-red-600 mb-2" />
                        <p className="text-sm text-red-800 font-semibold">Clique para tirar/enviar foto</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Responsável */}
          <div>
            <Label htmlFor="responsavel">Responsável pela Conferência *</Label>
            <input
              id="responsavel"
              type="text"
              value={checklist.responsavel_conferencia}
              onChange={(e) => setChecklist(prev => ({ ...prev, responsavel_conferencia: e.target.value }))}
              placeholder="Nome do inspetor/conferente"
              className="w-full p-2 border rounded-lg mt-2"
              required
            />
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="obs">Observações Adicionais</Label>
            <Textarea
              id="obs"
              value={checklist.observacoes_qualidade}
              onChange={(e) => setChecklist(prev => ({ ...prev, observacoes_qualidade: e.target.value }))}
              rows={3}
              placeholder="Descreva detalhes da conferência..."
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={enviando || !checklist.material_danificado || !checklist.embalagem_original || !checklist.foto_material_url}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar Devolução
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}