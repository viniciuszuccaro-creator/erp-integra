import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ETAPA 3: Captura de Prova de Entrega (POD) Mobile
 * Foto + Assinatura + Dados do Recebedor + Geolocalização
 */

export default function CapturaPODMobile({ entrega, onConcluir }) {
  const [foto, setFoto] = useState(null);
  const [assinatura, setAssinatura] = useState(null);
  const [nomeRecebedor, setNomeRecebedor] = useState('');
  const [documentoRecebedor, setDocumentoRecebedor] = useState('');
  const [cargoRecebedor, setCargoRecebedor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const fotoInputRef = useRef(null);
  const assinaturaInputRef = useRef(null);

  // Capturar geolocalização
  const capturarLocalizacao = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success('Localização capturada!');
        },
        (err) => {
          toast.error('Erro ao capturar localização');
        }
      );
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      toast.success('Foto selecionada!');
    }
  };

  const handleAssinaturaChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAssinatura(file);
      toast.success('Assinatura selecionada!');
    }
  };

  const salvarPOD = async () => {
    if (!nomeRecebedor) {
      toast.error('Nome do recebedor é obrigatório');
      return;
    }

    setSalvando(true);

    try {
      // 1. Upload de foto
      let fotoUrl = null;
      if (foto) {
        const fotoRes = await base44.integrations.Core.UploadFile({ file: foto });
        fotoUrl = fotoRes.file_url;
      }

      // 2. Upload de assinatura
      let assinaturaUrl = null;
      if (assinatura) {
        const assinaturaRes = await base44.integrations.Core.UploadFile({ file: assinatura });
        assinaturaUrl = assinaturaRes.file_url;
      }

      // 3. Capturar localização se ainda não foi
      if (!latitude || !longitude) {
        await new Promise((resolve) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                resolve();
              },
              () => resolve()
            );
          } else {
            resolve();
          }
        });
      }

      // 4. Atualizar entrega com comprovante
      await base44.entities.Entrega.update(entrega.id, {
        status: 'Entregue',
        data_entrega: new Date().toISOString(),
        comprovante_entrega: {
          foto_comprovante: fotoUrl,
          assinatura_digital: assinaturaUrl,
          nome_recebedor: nomeRecebedor,
          documento_recebedor: documentoRecebedor,
          cargo_recebedor: cargoRecebedor,
          data_hora_recebimento: new Date().toISOString(),
          latitude_entrega: latitude,
          longitude_entrega: longitude,
          observacoes_recebimento: observacoes
        }
      });

      // 5. Notificar status
      await base44.functions.invoke('notificarStatusEntrega', {
        entrega_id: entrega.id,
        novo_status: 'Entregue',
        latitude,
        longitude
      });

      // 6. Automação completa (estoque + financeiro)
      await base44.functions.invoke('automacaoEntregaCompleta', {
        entrega_id: entrega.id
      });

      toast.success('Entrega confirmada com sucesso!');
      onConcluir?.();

    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="w-full h-full p-4 space-y-4 overflow-auto bg-gradient-to-br from-green-50 to-blue-50">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📸 Prova de Entrega Digital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cliente */}
          <div className="bg-blue-50 p-3 rounded">
            <p className="font-bold">{entrega.cliente_nome}</p>
            <p className="text-sm text-slate-600">
              {entrega.endereco_entrega_completo?.logradouro}, {entrega.endereco_entrega_completo?.numero}
            </p>
          </div>

          {/* Foto do Comprovante */}
          <div>
            <label className="text-sm font-medium block mb-2">Foto do Comprovante</label>
            <input
              ref={fotoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFotoChange}
              className="hidden"
            />
            <Button
              onClick={() => fotoInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              {foto ? '✅ Foto Capturada' : 'Tirar Foto'}
            </Button>
          </div>

          {/* Assinatura */}
          <div>
            <label className="text-sm font-medium block mb-2">Assinatura Digital</label>
            <input
              ref={assinaturaInputRef}
              type="file"
              accept="image/*"
              onChange={handleAssinaturaChange}
              className="hidden"
            />
            <Button
              onClick={() => assinaturaInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {assinatura ? '✅ Assinatura Capturada' : 'Capturar Assinatura'}
            </Button>
          </div>

          {/* Dados do Recebedor */}
          <div className="space-y-3">
            <Input
              placeholder="Nome do Recebedor *"
              value={nomeRecebedor}
              onChange={(e) => setNomeRecebedor(e.target.value)}
            />
            <Input
              placeholder="CPF/RG do Recebedor"
              value={documentoRecebedor}
              onChange={(e) => setDocumentoRecebedor(e.target.value)}
            />
            <Input
              placeholder="Cargo do Recebedor"
              value={cargoRecebedor}
              onChange={(e) => setCargoRecebedor(e.target.value)}
            />
            <Textarea
              placeholder="Observações do recebimento"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Geolocalização */}
          <Button
            onClick={capturarLocalizacao}
            variant="outline"
            className="w-full"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {latitude && longitude ? `✅ Localização: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : 'Capturar Localização'}
          </Button>

          {/* Confirmar Entrega */}
          <Button
            onClick={salvarPOD}
            disabled={salvando || !nomeRecebedor}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar Entrega
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}