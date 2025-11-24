import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

/**
 * V21.5 - TRANSCRIÇÃO DE ÁUDIO COM IA
 * 
 * Recursos futurísticos:
 * ✅ Gravação de áudio pelo navegador
 * ✅ Upload de arquivos de áudio
 * ✅ Transcrição automática com IA
 * ✅ Análise de tom de voz
 * ✅ Detecção de urgência por voz
 */
export default function TranscricaoAudio({ onTranscricao }) {
  const [gravando, setGravando] = useState(false);
  const [duracao, setDuracao] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervaloRef = useRef(null);

  const transcricaoMutation = useMutation({
    mutationFn: async (audioBlob) => {
      // Upload do áudio
      const file = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
      const uploadResult = await base44.integrations.Core.UploadFile({ file });

      // Transcrever com IA
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `
Transcreva este áudio e analise:

1. Texto completo da transcrição
2. Tom de voz (Calmo, Ansioso, Irritado, Neutro)
3. Nível de urgência (Baixo, Médio, Alto)
4. Palavras-chave principais

Retorne em JSON.
        `,
        file_urls: [uploadResult.file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            transcricao: { type: 'string' },
            tom_voz: { type: 'string' },
            urgencia: { type: 'string' },
            palavras_chave: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      return {
        ...resultado,
        audio_url: uploadResult.file_url
      };
    },
    onSuccess: (data) => {
      toast.success('Áudio transcrito com sucesso!');
      onTranscricao(data);
    },
    onError: () => {
      toast.error('Erro ao transcrever áudio');
    }
  });

  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        transcricaoMutation.mutate(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setGravando(true);
      setDuracao(0);
      
      intervaloRef.current = setInterval(() => {
        setDuracao(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast.error('Erro ao acessar microfone');
    }
  };

  const pararGravacao = () => {
    if (mediaRecorderRef.current && gravando) {
      mediaRecorderRef.current.stop();
      setGravando(false);
      clearInterval(intervaloRef.current);
    }
  };

  const formatarTempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          {!gravando ? (
            <Button
              onClick={iniciarGravacao}
              disabled={transcricaoMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 w-full"
            >
              <Mic className="w-4 h-4 mr-2" />
              Gravar Áudio
            </Button>
          ) : (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-4 h-4 bg-red-600 rounded-full"
                />
                <span className="text-2xl font-mono font-bold text-red-600">
                  {formatarTempo(duracao)}
                </span>
              </div>
              
              <Button
                onClick={pararGravacao}
                className="bg-slate-900 hover:bg-slate-800 w-full"
              >
                <Square className="w-4 h-4 mr-2" />
                Parar e Transcrever
              </Button>
            </motion.div>
          )}

          {transcricaoMutation.isPending && (
            <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              Transcrevendo com IA...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}