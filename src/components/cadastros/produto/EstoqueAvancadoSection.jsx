import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Warehouse } from "lucide-react";

export default function EstoqueAvancadoSection({ formData, setFormData, locaisEstoque }) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="bg-orange-100 border-b border-orange-200 pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-orange-600" />
          Controle de Estoque Avançado
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
          <div>
            <Label className="font-semibold">Controla Lote</Label>
            <p className="text-xs text-slate-500">Rastreamento por número de lote</p>
          </div>
          <Switch checked={formData.controla_lote} onCheckedChange={(val) => setFormData(prev => ({...prev, controla_lote: val}))} />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
          <div>
            <Label className="font-semibold">Controla Validade</Label>
            <p className="text-xs text-slate-500">Rastreamento de data de validade</p>
          </div>
          <Switch checked={formData.controla_validade} onCheckedChange={(val) => setFormData(prev => ({...prev, controla_validade: val}))} />
        </div>

        {formData.controla_validade && (
          <div>
            <Label>Prazo Validade Padrão (dias)</Label>
            <Input type="number" value={formData.prazo_validade_dias} onChange={(e) => setFormData(prev => ({...prev, prazo_validade_dias: parseInt(e.target.value) || 0}))} placeholder="Ex: 365" />
          </div>
        )}

        <h4 className="font-bold text-slate-800 mt-6 mb-3 pt-4 border-t">Parâmetros de Estoque</h4>
        <p className="text-xs text-slate-500 -mt-2">Unidade: {(formData.unidade_principal || formData.unidade_medida || 'KG')}</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Estoque Mínimo</Label>
            <Input type="number" step="0.01" value={formData.estoque_minimo} onChange={(e) => setFormData(prev => ({...prev, estoque_minimo: parseFloat(e.target.value) || 0}))} />
          </div>
          <div>
            <Label>Estoque Máximo</Label>
            <Input type="number" step="0.01" value={formData.estoque_maximo} onChange={(e) => setFormData(prev => ({...prev, estoque_maximo: parseFloat(e.target.value) || 0}))} />
          </div>
          <div>
            <Label>Ponto de Reposição</Label>
            <Input type="number" step="0.01" value={formData.ponto_reposicao} onChange={(e) => setFormData(prev => ({...prev, ponto_reposicao: parseFloat(e.target.value) || 0}))} />
          </div>
        </div>

        <h4 className="font-bold text-slate-800 mt-6 mb-3 pt-4 border-t">Localização Física</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Almoxarifado/Local</Label>
            <Select value={formData.almoxarifado_id || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, almoxarifado_id: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o local..." />
              </SelectTrigger>
              <SelectContent>
                {locaisEstoque.map(local => (
                  <SelectItem key={local.id} value={local.id}>
                    {local.nome} - {local.tipo_local}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Localização (Corredor/Prateleira)</Label>
            <Input value={formData.localizacao || ''} onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))} placeholder="Ex: A-12-03" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}