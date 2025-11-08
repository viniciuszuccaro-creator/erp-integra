import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileText, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function CadastroFiscalForm({ cadastroFiscal, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(cadastroFiscal || {
    ncm: '',
    descricao_ncm: '',
    cest: '',
    cfop_padrao: '',
    ipi_aliquota: 0,
    pis_aliquota: 1.65,
    cofins_aliquota: 7.6,
    origem_mercadoria: '0 - Nacional'
  });

  const [buscandoIA, setBuscandoIA] = useState(false);

  const buscarNCMIA = async () => {
    if (!formData.descricao_ncm) {
      toast.error('Digite uma descrição primeiro');
      return;
    }

    setBuscandoIA(true);

    const resultado = await base44.integrations.Core.InvokeLLM({
      prompt: `Baseado na descrição: "${formData.descricao_ncm}", sugira:
      - NCM correto (8 dígitos)
      - CEST (se aplicável)
      - Alíquota de IPI
      - Origem da mercadoria`,
      response_json_schema: {
        type: "object",
        properties: {
          ncm: { type: "string" },
          cest: { type: "string" },
          ipi_aliquota: { type: "number" },
          origem_sugerida: { type: "string" }
        }
      }
    });

    setFormData({
      ...formData,
      ncm: resultado.ncm,
      cest: resultado.cest,
      ipi_aliquota: resultado.ipi_aliquota
    });

    setBuscandoIA(false);
    toast.success('✨ NCM sugerido pela IA!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.ncm) {
      alert('Preencha o NCM');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Descrição do Produto</Label>
        <div className="flex gap-2">
          <Input
            value={formData.descricao_ncm}
            onChange={(e) => setFormData({...formData, descricao_ncm: e.target.value})}
            placeholder="Ex: Vergalhão de aço CA-50"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={buscarNCMIA}
            disabled={buscandoIA}
          >
            {buscandoIA ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>NCM *</Label>
          <Input
            value={formData.ncm}
            onChange={(e) => setFormData({...formData, ncm: e.target.value})}
            placeholder="0000.00.00"
            maxLength={10}
          />
        </div>

        <div>
          <Label>CEST</Label>
          <Input
            value={formData.cest}
            onChange={(e) => setFormData({...formData, cest: e.target.value})}
            placeholder="00.000.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>IPI (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.ipi_aliquota}
            onChange={(e) => setFormData({...formData, ipi_aliquota: parseFloat(e.target.value)})}
          />
        </div>

        <div>
          <Label>PIS (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.pis_aliquota}
            onChange={(e) => setFormData({...formData, pis_aliquota: parseFloat(e.target.value)})}
          />
        </div>

        <div>
          <Label>COFINS (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.cofins_aliquota}
            onChange={(e) => setFormData({...formData, cofins_aliquota: parseFloat(e.target.value)})}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar
        </Button>
      </div>
    </form>
  );
}