import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GeralTab({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Tipo *</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => setFormData({ ...formData, tipo: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NF-e (Saída)">NF-e (Saída)</SelectItem>
              <SelectItem value="NF-e (Entrada)">NF-e (Entrada)</SelectItem>
              <SelectItem value="NFC-e">NFC-e</SelectItem>
              <SelectItem value="NFS-e">NFS-e</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Número *</Label>
          <Input
            value={formData.numero}
            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            placeholder="Ex: 12345"
            required
          />
        </div>

        <div>
          <Label>Série *</Label>
          <Input
            value={formData.serie}
            onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
            placeholder="Ex: 1"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Data de Emissão *</Label>
          <Input
            type="date"
            value={formData.data_emissao}
            onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Data de Saída</Label>
          <Input
            type="date"
            value={formData.data_saida}
            onChange={(e) => setFormData({ ...formData, data_saida: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CFOP *</Label>
          <Input
            value={formData.cfop}
            onChange={(e) => setFormData({ ...formData, cfop: e.target.value })}
            placeholder="Ex: 5102"
            required
          />
        </div>

        <div>
          <Label>Natureza da Operação *</Label>
          <Input
            value={formData.natureza_operacao}
            onChange={(e) => setFormData({ ...formData, natureza_operacao: e.target.value })}
            placeholder="Ex: Venda de mercadoria"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Finalidade</Label>
          <Select
            value={formData.finalidade}
            onValueChange={(value) => setFormData({ ...formData, finalidade: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Complementar">Complementar</SelectItem>
              <SelectItem value="Ajuste">Ajuste</SelectItem>
              <SelectItem value="Devolução">Devolução</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Ambiente</Label>
          <Select
            value={formData.ambiente}
            onValueChange={(value) => setFormData({ ...formData, ambiente: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Homologação">Homologação</SelectItem>
              <SelectItem value="Produção">Produção</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          placeholder="Observações internas"
          rows={3}
        />
      </div>

      <div>
        <Label>Informações Complementares (inf. adicional NF-e)</Label>
        <Textarea
          value={formData.informacoes_complementares}
          onChange={(e) => setFormData({ ...formData, informacoes_complementares: e.target.value })}
          placeholder="Informações adicionais que aparecerão na NF-e"
          rows={3}
        />
      </div>
    </div>
  );
}