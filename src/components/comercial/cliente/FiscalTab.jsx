import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ShieldAlert } from "lucide-react";

export default function FiscalTab({ formData, setFormData }) {
  if (!formData) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Regime Tributário</Label>
          <Select
            value={formData.configuracao_fiscal?.regime_tributario || "Simples Nacional"}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                configuracao_fiscal: { ...prev.configuracao_fiscal, regime_tributario: value },
              }))
            }
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
              <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
              <SelectItem value="Lucro Real">Lucro Real</SelectItem>
              <SelectItem value="MEI">MEI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Exceções Tributárias</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.configuracao_fiscal?.isento_ipi || false}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  configuracao_fiscal: { ...prev.configuracao_fiscal, isento_ipi: checked },
                }))
              }
            />
            <Label>Isento de IPI</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.configuracao_fiscal?.isento_icms || false}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  configuracao_fiscal: { ...prev.configuracao_fiscal, isento_icms: checked },
                }))
              }
            />
            <Label>Isento de ICMS</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.configuracao_fiscal?.contribuinte_icms !== false}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  configuracao_fiscal: { ...prev.configuracao_fiscal, contribuinte_icms: checked },
                }))
              }
            />
            <Label>Contribuinte de ICMS</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.configuracao_fiscal?.substituicao_tributaria_especial || false}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  configuracao_fiscal: { ...prev.configuracao_fiscal, substituicao_tributaria_especial: checked },
                }))
              }
            />
            <Label>Substituição Tributária Especial</Label>
          </div>
        </div>
      </div>

      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-2">NF-e Dentro do Estado (Sem DIFAL)</h4>
            <p className="text-sm text-amber-700 mb-3">
              Esta opção força o cálculo de NF-e com regras internas, ignorando DIFAL. Requer confirmação com senha de alçada e será registrado em auditoria.
            </p>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.configuracao_fiscal?.utilizar_nfe_interna || false}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    configuracao_fiscal: { ...prev.configuracao_fiscal, utilizar_nfe_interna: checked },
                  }))
                }
              />
              <Label>Habilitar NF-e Interna (Requer Aprovação)</Label>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <Label>Observações Fiscais</Label>
        <Textarea
          value={formData.configuracao_fiscal?.observacoes_fiscais || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              configuracao_fiscal: { ...prev.configuracao_fiscal, observacoes_fiscais: e.target.value },
            }))
          }
          rows={3}
        />
      </div>
    </>
  );
}