import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Camera, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/lib/UserContext';

/**
 * ETAPA 3: Registro de Ocorrência Logística
 * Para atrasos, avarias, problemas
 */

export default function RegistroOcorrenciaLogistica({ entrega, pedido, onClose }) {
  const { user } = useUser();
  const onConcluir = onClose;
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    if (!tipo || !descricao) {
      toast.error('Preencha tipo e descrição');
      return;
    }

    setSalvando(true);
    try {
      let foto_url = null;
      
      if (foto) {
        const upload = await base44.integrations.Core.UploadFile({ file: foto });
        foto_url = upload.file_url;
      }

      const ocorrencias = entrega.ocorrencias || [];
      ocorrencias.push({
        tipo,
        descricao,
        data_hora: new Date().toISOString(),
        responsavel: user?.full_name || user?.email,
        foto_url,
        resolucao: null
      });

      await base44.entities.Entrega.update(entrega.id, { ocorrencias });

      // Auditoria
      await base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email,
        usuario_id: user?.id,
        acao: 'Criação',
        modulo: 'Expedição',
        entidade: 'Entrega',
        registro_id: entrega.id,
        descricao: `Ocorrência registrada: ${tipo}`,
        dados_novos: { tipo, descricao }
      });

      toast.success('Ocorrência registrada!');
      onConcluir?.();
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Registrar Ocorrência
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de ocorrência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Atraso">⏰ Atraso</SelectItem>
            <SelectItem value="Avaria">📦 Avaria</SelectItem>
            <SelectItem value="Extravio">🔍 Extravio</SelectItem>
            <SelectItem value="Devolução Parcial">↩️ Devolução Parcial</SelectItem>
            <SelectItem value="Problema Veículo">🚛 Problema Veículo</SelectItem>
            <SelectItem value="Outros">❓ Outros</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Descreva o que aconteceu..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Foto (opcional)</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFoto(e.target.files?.[0])}
            className="w-full text-sm"
          />
        </div>

        <Button
          onClick={salvar}
          disabled={salvando}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {salvando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Registrar Ocorrência
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}