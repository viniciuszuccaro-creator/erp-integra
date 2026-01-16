import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles } from "lucide-react";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";

export default function FiscalContabilSection({ formData, setFormData, sugestoesIA, handleDadosNCM, planoContas }) {
  return (
    <>
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="bg-purple-100 border-b border-purple-200 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Configuração Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Origem da Mercadoria</Label>
              <Select value={formData.origem_mercadoria} onValueChange={(v) => setFormData(prev => ({...prev, origem_mercadoria: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0 - Nacional">0 - Nacional</SelectItem>
                  <SelectItem value="1 - Estrangeira Importação Direta">1 - Estrangeira Importação Direta</SelectItem>
                  <SelectItem value="2 - Estrangeira Mercado Interno">2 - Estrangeira Mercado Interno</SelectItem>
                  <SelectItem value= "3 - Nacional com Conteúdo Importado >40%">3 - Nacional com Conteúdo Importado {'>'}40%</SelectItem>
                  <SelectItem value="4 - Nacional por Proc. Prod. Básico">4 - Nacional por Proc. Prod. Básico</SelectItem>
                  <SelectItem value= "5 - Nacional com Conteúdo Importado <=40%">5 - Nacional com Conteúdo Importado {'<'}=40%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Regime Tributário do Produto</Label>
              <Select value={formData.regime_tributario_produto} onValueChange={(v) => setFormData(prev => ({...prev, regime_tributario_produto: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                  <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <Label>NCM (Código Fiscal)</Label>
              <Input
                value={formData.ncm || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, ncm: e.target.value }))}
                placeholder="00000000"
                maxLength={8}
              />
              {sugestoesIA?.ncm_info && (
                <p className="text-xs text-blue-600 mt-1">ℹ️ {sugestoesIA.ncm_info}</p>
              )}
            </div>
            <div>
              <BotaoBuscaAutomatica
                tipo="ncm"
                valor={formData.ncm}
                onDadosEncontrados={handleDadosNCM}
                disabled={!formData.ncm || formData.ncm.length !== 8}
              >
                Buscar NCM
              </BotaoBuscaAutomatica>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CEST</Label>
              <Input
                value={formData.cest || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, cest: e.target.value }))}
                placeholder="00.000.00"
              />
            </div>
            <div>
              <Label>CFOP Padrão Venda</Label>
              <Input
                value={formData.cfop_padrao_venda || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, cfop_padrao_venda: e.target.value }))}
                placeholder="5102"
              />
            </div>
            <div>
              <Label>CFOP Padrão Compra</Label>
              <Input
                value={formData.cfop_padrao_compra || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, cfop_padrao_compra: e.target.value }))}
                placeholder="1102"
              />
            </div>
          </div>

          <Alert className="border-purple-300 bg-purple-100 mt-4">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <AlertDescription className="text-sm text-purple-900">
              Defina corretamente NCM/CFOP e alíquotas para evitar rejeições na NF-e.
            </AlertDescription>
          </Alert>

          <h4 className="font-bold text-slate-800 mt-6 mb-3 pt-4 border-t">Detalhes da Tributação</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>ICMS CST</Label>
              <Input 
                value={formData.tributacao?.icms_cst || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, icms_cst: e.target.value } }))} 
                placeholder="00"
              />
            </div>
            <div>
              <Label>ICMS Alíquota (%)</Label>
              <Input 
                type="number" step="0.01" 
                value={formData.tributacao?.icms_aliquota || 0} 
                onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, icms_aliquota: parseFloat(e.target.value) || 0 } }))} 
              />
            </div>
            <div>
              <Label>PIS CST</Label>
              <Input 
                value={formData.tributacao?.pis_cst || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, pis_cst: e.target.value } }))} 
                placeholder="01"
              />
            </div>
            <div>
              <Label>PIS Alíquota (%)</Label>
              <Input type="number" step="0.01" value={formData.tributacao?.pis_aliquota || 0} onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, pis_aliquota: parseFloat(e.target.value) || 0 } }))} />
            </div>
            <div>
              <Label>COFINS CST</Label>
              <Input value={formData.tributacao?.cofins_cst || ''} onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, cofins_cst: e.target.value } }))} placeholder="01" />
            </div>
            <div>
              <Label>COFINS Alíquota (%)</Label>
              <Input type="number" step="0.01" value={formData.tributacao?.cofins_aliquota || 0} onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, cofins_aliquota: parseFloat(e.target.value) || 0 } }))} />
            </div>
            <div>
              <Label>IPI CST</Label>
              <Input value={formData.tributacao?.ipi_cst || ''} onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, ipi_cst: e.target.value } }))} placeholder="50" />
            </div>
            <div>
              <Label>IPI Alíquota (%)</Label>
              <Input type="number" step="0.01" value={formData.tributacao?.ipi_aliquota || 0} onChange={(e) => setFormData(prev => ({ ...prev, tributacao: { ...prev.tributacao, ipi_aliquota: parseFloat(e.target.value) || 0 } }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            Contabilização
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div>
            <Label>Conta Contábil</Label>
            <Select value={formData.conta_contabil_id || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, conta_contabil_id: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta contábil..." />
              </SelectTrigger>
              <SelectContent>
                {planoContas.filter(c => c.tipo === 'Receita' || c.tipo === 'Despesa').map(conta => (
                  <SelectItem key={conta.id} value={conta.id}>
                    {conta.codigo} - {conta.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </>
  );
}