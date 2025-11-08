import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Globe, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function CatalogoWebForm({ catalogoItem, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(catalogoItem || {
    produto_id: '',
    slug_site: '',
    titulo_seo: '',
    descricao_curta: '',
    descricao_longa_html: '',
    categoria_site: 'Ferragens',
    exibir_no_site: false,
    exibir_no_marketplace: false,
    sincronizacao_automatica_ativa: false,
    destaque: false
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const gerarDescricaoIA = async () => {
    const produtoSelecionado = produtos.find(p => p.id === formData.produto_id);
    if (!produtoSelecionado) return;

    const descricao = await base44.integrations.Core.InvokeLLM({
      prompt: `Crie uma descrição de produto otimizada para e-commerce e SEO para: "${produtoSelecionado.descricao}".
      
Retorne:
- titulo_seo: título otimizado para buscas (60 caracteres)
- descricao_curta: descrição para cards (150 caracteres)
- descricao_longa_html: HTML completo com benefícios e especificações técnicas`,
      response_json_schema: {
        type: "object",
        properties: {
          titulo_seo: { type: "string" },
          descricao_curta: { type: "string" },
          descricao_longa_html: { type: "string" }
        }
      }
    });

    setFormData({
      ...formData,
      titulo_seo: descricao.titulo_seo,
      descricao_curta: descricao.descricao_curta,
      descricao_longa_html: descricao.descricao_longa_html,
      descricao_gerada_ia: true
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.produto_id || !formData.slug_site) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Produto *</Label>
        <Select value={formData.produto_id} onValueChange={(v) => setFormData({...formData, produto_id: v})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o produto" />
          </SelectTrigger>
          <SelectContent>
            {produtos.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Slug do Site (URL) *</Label>
        <Input
          value={formData.slug_site}
          onChange={(e) => setFormData({...formData, slug_site: e.target.value.toLowerCase().replace(/\s/g, '-')})}
          placeholder="vergalhao-8mm-ca50"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Descrição para SEO</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={gerarDescricaoIA}
            disabled={!formData.produto_id}
          >
            <Sparkles className="w-3 h-3 mr-2" />
            Gerar com IA
          </Button>
        </div>
        <Textarea
          value={formData.descricao_longa_html}
          onChange={(e) => setFormData({...formData, descricao_longa_html: e.target.value})}
          rows={4}
          placeholder="Descrição completa do produto..."
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Exibir no Site</Label>
          <p className="text-xs text-slate-500">Visível no e-commerce</p>
        </div>
        <Switch
          checked={formData.exibir_no_site}
          onCheckedChange={(v) => setFormData({...formData, exibir_no_site: v})}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Sincronizar com Marketplace</Label>
          <p className="text-xs text-slate-500">Mercado Livre, Shopee, etc</p>
        </div>
        <Switch
          checked={formData.exibir_no_marketplace}
          onCheckedChange={(v) => setFormData({...formData, exibir_no_marketplace: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {catalogoItem ? 'Atualizar' : 'Criar Item'}
        </Button>
      </div>
    </form>
  );
}