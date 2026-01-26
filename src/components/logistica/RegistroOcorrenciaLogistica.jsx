import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Upload, Camera, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

/**
 * ⚠️ REGISTRO DE OCORRÊNCIAS LOGÍSTICAS V21.5
 * Atrasos, avarias, extravios e problemas
 */
export default function RegistroOcorrenciaLogistica({ pedido, entrega, onClose, windowMode = false }) {
  const [tipoOcorrencia, setTipoOcorrencia] = useState("Atraso");
  const [descricao, setDescricao] = useState("");
  const [resolucao, setResolucao] = useState("");
  const [fotoUrl, setFotoUrl] = useState(null);
  const [uploadando, setUploadando] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadando(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFotoUrl(file_url);
      toast.success("✅ Foto da ocorrência enviada!");
    } catch (error) {
      toast.error("Erro ao enviar foto: " + error.message);
    } finally {
      setUploadando(false);
    }
  };

  const registrarOcorrenciaMutation = useMutation({
    mutationFn: async () => {
      const novaOcorrencia = {
        tipo: tipoOcorrencia,
        descricao: descricao,
        data_hora: new Date().toISOString(),
        responsavel: user?.full_name || "Sistema",
        resolucao: resolucao || "Em análise",
        foto_url: fotoUrl
      };

      if (entrega) {
        const ocorrenciasAtuais = entrega.ocorrencias || [];
        await base44.entities.Entrega.update(entrega.id, {
          ocorrencias: [...ocorrenciasAtuais, novaOcorrencia]
        });
      } else {
        // Criar entrega se não existir
        await base44.entities.Entrega.create({
          pedido_id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          cliente_nome: pedido.cliente_nome,
          empresa_id: pedido.empresa_id,
          endereco_entrega_completo: pedido.endereco_entrega_principal,
          status: 'Em Trânsito',
          ocorrencias: [novaOcorrencia]
        });
      }

      // Se for entrega frustrada, marcar no pedido
      if (tipoOcorrencia === "Entrega Frustrada") {
        await base44.entities.Pedido.update(pedido.id, {
          status: 'Em Trânsito' // Mantém para nova tentativa
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast.success("✅ Ocorrência registrada!");
      if (onClose) onClose();
    }
  });

  const containerClass = windowMode ? "w-full h-full flex flex-col" : "";

  return (
    <Card className={`border-0 shadow-xl ${containerClass}`}>
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          ⚠️ Registrar Ocorrência
        </CardTitle>
        <p className="text-sm opacity-90">Pedido #{pedido.numero_pedido}</p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Tipo de Ocorrência */}
        <div>
          <Label>Tipo de Ocorrência *</Label>
          <Select value={tipoOcorrencia} onValueChange={setTipoOcorrencia}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Atraso">🕐 Atraso na Entrega</SelectItem>
              <SelectItem value="Avaria">📦 Avaria/Dano ao Produto</SelectItem>
              <SelectItem value="Extravio">🔍 Extravio/Perda</SelectItem>
              <SelectItem value="Devolução Parcial">↩️ Devolução Parcial</SelectItem>
              <SelectItem value="Problema Veículo">🚚 Problema no Veículo</SelectItem>
              <SelectItem value="Entrega Frustrada">❌ Entrega Frustrada</SelectItem>
              <SelectItem value="Outros">❓ Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Descrição */}
        <div>
          <Label>Descrição Detalhada *</Label>
          <Textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o que aconteceu em detalhes..."
            rows={4}
          />
        </div>

        {/* Resolução */}
        <div>
          <Label>Ação Tomada / Resolução</Label>
          <Textarea
            value={resolucao}
            onChange={(e) => setResolucao(e.target.value)}
            placeholder="O que foi feito para resolver? Quando será reagendado?"
            rows={3}
          />
        </div>

        {/* Upload de Foto */}
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <Label className="mb-2 block">📸 Foto da Ocorrência (Opcional)</Label>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => document.getElementById('foto-ocorrencia-input').click()}
                disabled={uploadando}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploadando ? 'Enviando...' : fotoUrl ? '✅ Foto Enviada' : 'Enviar Foto'}
              </Button>
              {fotoUrl && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => window.open(fotoUrl, '_blank')}
                  >
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFotoUrl(null)}
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            <input
              id="foto-ocorrencia-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFotoUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Alertas por Tipo */}
        {tipoOcorrencia === "Avaria" && (
          <Card className="bg-red-50 border-red-300">
            <CardContent className="p-3 text-sm text-red-800">
              <p className="font-semibold">⚠️ Atenção - Avaria:</p>
              <p>Notifique o setor de qualidade e tire fotos detalhadas dos danos.</p>
            </CardContent>
          </Card>
        )}

        {tipoOcorrencia === "Entrega Frustrada" && (
          <Card className="bg-orange-50 border-orange-300">
            <CardContent className="p-3 text-sm text-orange-800">
              <p className="font-semibold">⚠️ Entrega Frustrada:</p>
              <p>Reagende a entrega e confirme novo contato com o cliente.</p>
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => registrarOcorrenciaMutation.mutate()}
            disabled={!descricao.trim() || registrarOcorrenciaMutation.isPending}
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {registrarOcorrenciaMutation.isPending ? 'Registrando...' : 'Registrar Ocorrência'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}