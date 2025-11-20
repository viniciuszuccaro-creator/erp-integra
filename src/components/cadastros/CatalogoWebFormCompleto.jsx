import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CatalogoWebFormCompleto({ catalogo, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(catalogo || {
    produto_id: '',
    exibir_no_ecommerce: false,
    exibir_no_marketplace: false,
    exibir_no_site: false,
    exibir_no_catalogo_pdf: false,
    exibir_no_app: false,
    categoria_navegacao: '',
    slug_url: '',
    titulo_seo: '',
    meta_description: '',
    destaque: false,
    ordem_exibicao: 0,
    ativo: true,
    observacoes: ''
  });
  const [salvando, setSalvando] = useState(false);

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-lookup'],
    queryFn: () => base44.entities.Produto.list()
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await onSubmit(formData);
    setSalvando(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Produto *</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={formData.produto_id}
          onChange={(e) => setFormData({...formData, produto_id: e.target.value})}
          required
        >
          <option value="">Selecione o produto</option>
          {produtos.map(p => (
            <option key={p.id} value={p.id}>{p.descricao}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Canais de Publicação</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <Label>E-commerce</Label>
            <Switch
              checked={formData.exibir_no_ecommerce}
              onCheckedChange={(val) => setFormData({...formData, exibir_no_ecommerce: val})}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <Label>Marketplace</Label>
            <Switch
              checked={formData.exibir_no_marketplace}
              onCheckedChange={(val) => setFormData({...formData, exibir_no_marketplace: val})}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <Label>Site</Label>
            <Switch
              checked={formData.exibir_no_site}
              onCheckedChange={(val) => setFormData({...formData, exibir_no_site: val})}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <Label>App Mobile</Label>
            <Switch
              checked={formData.exibir_no_app}
              onCheckedChange={(val) => setFormData({...formData, exibir_no_app: val})}
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Categoria de Navegação</Label>
        <Input
          value={formData.categoria_navegacao}
          onChange={(e) => setFormData({...formData, categoria_navegacao: e.target.value})}
          placeholder="Ex: Ferramentas, Bitolas"
        />
      </div>

      <div>
        <Label>Slug URL (amigável para SEO)</Label>
        <Input
          value={formData.slug_url}
          onChange={(e) => setFormData({...formData, slug_url: e.target.value})}
          placeholder="Ex: produto-exemplo"
        />
      </div>

      <div>
        <Label>Título SEO</Label>
        <Input
          value={formData.titulo_seo}
          onChange={(e) => setFormData({...formData, titulo_seo: e.target.value})}
          placeholder="Título para mecanismos de busca"
        />
      </div>

      <div>
        <Label>Meta Description</Label>
        <Textarea
          value={formData.meta_description}
          onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
          rows={2}
          placeholder="Descrição para Google/SEO"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <Label>Produto em Destaque</Label>
          <Switch
            checked={formData.destaque}
            onCheckedChange={(val) => setFormData({...formData, destaque: val})}
          />
        </div>
        <div>
          <Label>Ordem de Exibição</Label>
          <Input
            type="number"
            value={formData.ordem_exibicao}
            onChange={(e) => setFormData({...formData, ordem_exibicao: parseInt(e.target.value) || 0})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({...formData, ativo: val})}
        />
      </div>

      <Button type="submit" className="w-full" disabled={salvando}>
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2" />}
        {catalogo ? 'Atualizar Catálogo Web' : 'Criar Catálogo Web'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="flex-1 overflow-auto p-6">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
}