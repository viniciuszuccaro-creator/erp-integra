import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Plus, 
  Package, 
  CheckCircle, 
  Clock,
  FileText,
  Layers
} from "lucide-react";
import BuscaCEP from "./BuscaCEP";
import SeletorEnderecoEntrega from "@/components/expedicao/SeletorEnderecoEntrega";
import CriarEtapaFaturamentoModal from "./CriarEtapaFaturamentoModal";

/**
 * V21.1 - Aba 5: Logística com Gestão de Etapas de Faturamento
 */
export default function LogisticaEntregaTab({ formData, setFormData, clientes, onNext }) {
  const [showCriarEtapa, setShowCriarEtapa] = useState(false);

  const handleEnderecoPrincipal = (endereco) => {
    setFormData(prev => ({
      ...prev,
      endereco_entrega_principal: endereco
    }));
  };

  const etapas = formData.etapas_entrega || [];
  const totalEtapasFaturadas = etapas.filter(e => e.faturada).length;
  const totalValorFaturado = etapas
    .filter(e => e.faturada)
    .reduce((sum, e) => {
      // Buscar PedidoEtapa para pegar valor real
      return sum + (e.valor_total_etapa || 0);
    }, 0);

  const percentualFaturado = formData.valor_total > 0 
    ? (totalValorFaturado / formData.valor_total) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Logística e Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Tipo de Frete */}
          <div>
            <Label>Tipo de Frete</Label>
            <Select 
              value={formData.tipo_frete || 'CIF'} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_frete: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CIF">CIF (Frete por nossa conta)</SelectItem>
                <SelectItem value="FOB">FOB (Cliente retira)</SelectItem>
                <SelectItem value="Retirada">Retirada no local</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* V21.1: NOVO - Ponto de Entrega Principal */}
          <div>
            <Label className="mb-2 block">Endereço de Entrega Principal</Label>
            <SeletorEnderecoEntrega
              clienteId={formData.cliente_id}
              enderecoSelecionado={formData.endereco_entrega_principal}
              onEnderecoSelecionado={handleEnderecoPrincipal}
            />
          </div>

          {/* Data Prevista */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data-entrega">Data Prevista de Entrega</Label>
              <Input
                id="data-entrega"
                type="date"
                value={formData.data_prevista_entrega || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, data_prevista_entrega: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="valor-frete">Valor do Frete</Label>
              <Input
                id="valor-frete"
                type="number"
                step="0.01"
                value={formData.valor_frete || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_frete: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* V21.1: NOVO - Gestão de Etapas de Faturamento */}
      <Card className="border-2 border-purple-300">
        <CardHeader className="bg-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              Etapas de Entrega / Faturamento Parcial
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowCriarEtapa(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Criar Nova Etapa
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Progresso de Faturamento */}
          {etapas.length > 0 && (
            <Alert className="border-blue-300 bg-blue-50">
              <FileText className="w-4 h-4 text-blue-600" />
              <AlertDescription>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong className="text-blue-900">Etapas Criadas:</strong> {etapas.length}
                  </div>
                  <div>
                    <strong className="text-blue-900">Faturadas:</strong> {totalEtapasFaturadas}/{etapas.length}
                  </div>
                  <div>
                    <strong className="text-blue-900">Progresso:</strong> {percentualFaturado.toFixed(1)}%
                  </div>
                </div>
                <div className="mt-3 bg-white rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all"
                    style={{ width: `${percentualFaturado}%` }}
                  />
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Lista de Etapas */}
          {etapas.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Nenhuma etapa criada ainda</p>
              <p className="text-xs">Clique em "Criar Nova Etapa" para dividir o faturamento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {etapas.map((etapa, idx) => (
                <Card key={idx} className={`border ${etapa.faturada ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${etapa.faturada ? 'bg-green-100' : 'bg-purple-100'}`}>
                          {etapa.faturada ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-purple-600" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">Etapa {idx + 1}</Badge>
                            <h4 className="font-bold">{etapa.nome}</h4>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
                            <p>
                              <Package className="w-3 h-3 inline mr-1" />
                              {etapa.quantidade_itens || 0} itens
                            </p>
                            <p className="font-semibold text-green-700">
                              R$ {(etapa.valor_total_etapa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          {etapa.faturada && (
                            <div className="mt-2 p-2 bg-white rounded border border-green-200">
                              <p className="text-xs text-green-800">
                                ✅ <strong>NF-e:</strong> {etapa.numero_nfe || 'Processando...'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Badge className={etapa.faturada ? 'bg-green-600' : 'bg-purple-600'}>
                        {etapa.status || 'Planejada'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Instruções de Entrega */}
          <div>
            <Label htmlFor="instrucoes">Instruções de Entrega</Label>
            <Textarea
              id="instrucoes"
              value={formData.endereco_entrega_principal?.instrucoes_entrega || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                endereco_entrega_principal: {
                  ...(prev.endereco_entrega_principal || {}),
                  instrucoes_entrega: e.target.value
                }
              }))}
              placeholder="Instruções especiais de entrega, horários, contato..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão Avançar */}
      <div className="flex justify-end">
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
          Avançar para Financeiro
        </Button>
      </div>

      {/* Modal de Criação de Etapa */}
      <CriarEtapaFaturamentoModal
        isOpen={showCriarEtapa}
        onClose={() => setShowCriarEtapa(false)}
        pedido={formData}
        onEtapaCriada={(novaEtapa) => {
          // Atualizar formData localmente
          setFormData(prev => ({
            ...prev,
            etapas_entrega: [
              ...(prev.etapas_entrega || []),
              {
                id: novaEtapa.id,
                nome: novaEtapa.nome_etapa,
                itens_ids: novaEtapa.itens_ids,
                quantidade_itens: novaEtapa.quantidade_itens,
                valor_total_etapa: novaEtapa.valor_total_etapa,
                status: 'Planejada',
                faturada: false
              }
            ]
          }));
        }}
      />
    </div>
  );
}