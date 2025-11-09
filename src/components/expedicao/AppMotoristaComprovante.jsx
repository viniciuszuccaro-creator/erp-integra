import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Camera, FileText, CheckCircle, User } from "lucide-react";

/**
 * V21.2 - Comprovante Digital Melhorado
 * COM: Foto RG/CPF do Recebedor + Foto Material Descarregado
 */
export default function AppMotoristaComprovante({ entrega, onConcluir }) {
  const [comprovante, setComprovante] = useState({
    nome_recebedor: '',
    documento_recebedor: '',
    cargo_recebedor: '',
    foto_documento_url: '',
    foto_material_descarregado_url: '',
    assinatura_digital: '',
    observacoes_recebimento: ''
  });
  const [enviando, setEnviando] = useState(false);
  const queryClient = useQueryClient();

  const handleUpload = async (e, campo) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setComprovante(prev => ({ ...prev, [campo]: file_url }));
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  };

  const concluirEntregaMutation = useMutation({
    mutationFn: async () => {
      setEnviando(true);

      // Validação V21.2
      if (!comprovante.nome_recebedor || !comprovante.documento_recebedor) {
        throw new Error('Nome e documento do recebedor são obrigatórios');
      }

      if (!comprovante.foto_documento_url || !comprovante.foto_material_descarregado_url) {
        throw new Error('Fotos do documento e do material são OBRIGATÓRIAS');
      }

      // Atualizar entrega
      await base44.entities.Entrega.update(entrega.id, {
        status: 'Entregue',
        data_entrega: new Date().toISOString(),
        comprovante_entrega: {
          ...comprovante,
          data_hora_recebimento: new Date().toISOString(),
          latitude_entrega: entrega.latitude_atual,
          longitude_entrega: entrega.longitude_atual
        },
        historico_status: [
          ...(entrega.historico_status || []),
          {
            status: 'Entregue',
            data_hora: new Date().toISOString(),
            usuario: 'App Motorista',
            observacao: `Entregue para ${comprovante.nome_recebedor} (${comprovante.cargo_recebedor})`
          }
        ]
      });

      // Criar histórico no cliente
      await base44.entities.HistoricoCliente.create({
        empresa_id: entrega.empresa_id,
        cliente_id: entrega.cliente_id,
        cliente_nome: entrega.cliente_nome,
        modulo_origem: 'Expedicao',
        referencia_id: entrega.id,
        referencia_tipo: 'Entrega',
        tipo_evento: 'Entrega',
        titulo_evento: 'Entrega Concluída',
        descricao_detalhada: `Material entregue e recebido por ${comprovante.nome_recebedor} (${comprovante.documento_recebedor}). Fotos anexadas.`,
        data_evento: new Date().toISOString(),
        anexo_url: comprovante.foto_material_descarregado_url,
        anexo_tipo: 'Imagem'
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      alert('✅ Entrega concluída com sucesso!');
      onConcluir?.();
    },
    onError: (error) => {
      alert(`❌ Erro: ${error.message}`);
    },
    onSettled: () => {
      setEnviando(false);
    }
  });

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-green-50">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Comprovante de Entrega (V21.2)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert className="border-blue-300 bg-blue-50">
          <User className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            <strong>V21.2:</strong> Para garantir compliance, é obrigatório registrar documento (RG/CPF) do recebedor e foto do material no local.
          </AlertDescription>
        </Alert>

        {/* Dados do Recebedor */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="nome-rec">Nome Completo do Recebedor *</Label>
            <Input
              id="nome-rec"
              value={comprovante.nome_recebedor}
              onChange={(e) => setComprovante(prev => ({ ...prev, nome_recebedor: e.target.value }))}
              placeholder="José da Silva"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="doc-rec">RG ou CPF *</Label>
              <Input
                id="doc-rec"
                value={comprovante.documento_recebedor}
                onChange={(e) => setComprovante(prev => ({ ...prev, documento_recebedor: e.target.value }))}
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <Label htmlFor="cargo-rec">Cargo/Função</Label>
              <Input
                id="cargo-rec"
                value={comprovante.cargo_recebedor}
                onChange={(e) => setComprovante(prev => ({ ...prev, cargo_recebedor: e.target.value }))}
                placeholder="Mestre de Obras"
              />
            </div>
          </div>
        </div>

        {/* V21.2: NOVA - Foto do Documento */}
        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardContent className="p-4">
            <Label className="text-sm font-bold mb-2 block">
              📸 Foto do Documento (RG/CPF) do Recebedor *
            </Label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleUpload(e, 'foto_documento_url')}
              className="hidden"
              id="foto-doc"
            />
            <label htmlFor="foto-doc">
              <div className="p-6 border-2 border-dashed border-purple-400 rounded-lg cursor-pointer hover:bg-white transition-colors">
                {comprovante.foto_documento_url ? (
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-sm text-green-800 font-semibold">Documento Fotografado</p>
                    <img src={comprovante.foto_documento_url} alt="Documento" className="mt-2 max-h-32 mx-auto rounded" />
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                    <p className="text-sm font-semibold">Tirar Foto do RG/CPF</p>
                  </div>
                )}
              </div>
            </label>
          </CardContent>
        </Card>

        {/* V21.2: NOVA - Foto Material Descarregado */}
        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <Label className="text-sm font-bold mb-2 block">
              📦 Foto do Material Descarregado no Local *
            </Label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleUpload(e, 'foto_material_descarregado_url')}
              className="hidden"
              id="foto-material"
            />
            <label htmlFor="foto-material">
              <div className="p-6 border-2 border-dashed border-green-400 rounded-lg cursor-pointer hover:bg-white transition-colors">
                {comprovante.foto_material_descarregado_url ? (
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-sm text-green-800 font-semibold">Material Fotografado</p>
                    <img src={comprovante.foto_material_descarregado_url} alt="Material" className="mt-2 max-h-32 mx-auto rounded" />
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-sm font-semibold">Tirar Foto do Material na Obra</p>
                  </div>
                )}
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Observações */}
        <div>
          <Label htmlFor="obs-rec">Observações do Recebimento</Label>
          <textarea
            id="obs-rec"
            value={comprovante.observacoes_recebimento}
            onChange={(e) => setComprovante(prev => ({ ...prev, observacoes_recebimento: e.target.value }))}
            rows={2}
            className="w-full p-2 border rounded-lg mt-2"
            placeholder="Ex: Material descarregado no 2º andar..."
          />
        </div>

        {/* Botão */}
        <Button
          type="button"
          onClick={() => concluirEntregaMutation.mutate()}
          disabled={
            enviando || 
            !comprovante.nome_recebedor || 
            !comprovante.documento_recebedor || 
            !comprovante.foto_documento_url || 
            !comprovante.foto_material_descarregado_url
          }
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {enviando ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Finalizando Entrega...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Entrega
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}