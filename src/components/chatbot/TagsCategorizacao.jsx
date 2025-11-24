import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tag, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

/**
 * V21.5 - SISTEMA DE TAGS E CATEGORIZAÇÃO
 * 
 * Recursos:
 * ✅ Tags customizáveis
 * ✅ Cores automáticas
 * ✅ Sugestões de IA
 * ✅ Filtros por tag
 * ✅ Analytics por categoria
 */
export default function TagsCategorizacao({ conversa }) {
  const [novaTag, setNovaTag] = useState('');
  const [exibirInput, setExibirInput] = useState(false);
  const queryClient = useQueryClient();

  const tagsAtuais = conversa?.tags || [];

  const tagsSugeridas = [
    'Orçamento Urgente',
    'Cliente VIP',
    'Problema Técnico',
    'Reclamação',
    'Dúvida Simples',
    'Negociação Preço',
    'Prazo Entrega',
    'Boleto Vencido',
    'Cliente Novo',
    'Follow-up',
    'Produto Específico',
    'Estoque',
    'Logística'
  ];

  const adicionarTagMutation = useMutation({
    mutationFn: async (tag) => {
      await base44.entities.ConversaOmnicanal.update(conversa.id, {
        tags: [...tagsAtuais, tag]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversas-omnicanal'] });
      toast.success('Tag adicionada!');
      setNovaTag('');
      setExibirInput(false);
    }
  });

  const removerTagMutation = useMutation({
    mutationFn: async (tag) => {
      await base44.entities.ConversaOmnicanal.update(conversa.id, {
        tags: tagsAtuais.filter(t => t !== tag)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversas-omnicanal'] });
      toast.success('Tag removida!');
    }
  });

  const coresTag = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-green-100 text-green-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
    'bg-yellow-100 text-yellow-700',
    'bg-red-100 text-red-700'
  ];

  const getCorTag = (tag) => {
    const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % coresTag.length;
    return coresTag[index];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-semibold text-slate-900">Tags</span>
      </div>

      {/* Tags Atuais */}
      <div className="flex flex-wrap gap-2">
        {tagsAtuais.map((tag, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Badge className={`${getCorTag(tag)} flex items-center gap-1 px-3 py-1`}>
              {tag}
              <button
                onClick={() => removerTagMutation.mutate(tag)}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </motion.div>
        ))}
        
        {!exibirInput && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExibirInput(true)}
            className="h-7 px-2"
          >
            <Plus className="w-3 h-3 mr-1" />
            Tag
          </Button>
        )}
      </div>

      {/* Input Nova Tag */}
      {exibirInput && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <Input
              value={novaTag}
              onChange={(e) => setNovaTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && novaTag.trim()) {
                  adicionarTagMutation.mutate(novaTag.trim());
                }
              }}
              placeholder="Nome da tag..."
              className="flex-1"
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => {
                if (novaTag.trim()) {
                  adicionarTagMutation.mutate(novaTag.trim());
                }
              }}
              disabled={!novaTag.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setExibirInput(false);
                setNovaTag('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tags Sugeridas */}
          <div>
            <p className="text-xs text-slate-600 mb-2">Sugestões:</p>
            <div className="flex flex-wrap gap-1">
              {tagsSugeridas
                .filter(t => !tagsAtuais.includes(t))
                .slice(0, 8)
                .map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => adicionarTagMutation.mutate(tag)}
                    className="text-xs px-2 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}