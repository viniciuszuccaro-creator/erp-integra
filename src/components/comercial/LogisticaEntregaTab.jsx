
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Clock, Plus, Package, Calculator } from 'lucide-react'; // Added Calculator icon
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import SeletorEnderecoEntregaPedido from './SeletorEnderecoEntregaPedido';
import BuscaCEP from './BuscaCEP';
import usePermissions from '@/components/lib/usePermissions';

/**
 * Aba 5: Logística e Entrega
 * V12.0 - Com campo Link Google Maps para roteirização
 */
export default function LogisticaEntregaTab({ formData, setFormData, clientes, onNext }) {
  const { isAdmin, canApprove } = usePermissions();
  const [modalEtapa, setModalEtapa] = useState(false);
  const [novaEtapa, setNovaEtapa] = useState({
    nome: '',
    itens_selecionados: []
  });

  const clienteSelecionado = clientes?.find(c => c.id === formData?.cliente_id) || null;

  // Regra 30kg: Frete grátis
  const freteGratis = (formData?.peso_total_kg || 0) >= 30;

  // Combine all items with a unique ID for each.
  // This uniqueId is stable and used to track items across stages.
  const allRawItems = [
    ...(formData?.itens_revenda || []).map(item => ({ ...item, original_type: 'revenda', display_name: `${item.descricao} (Revenda)` })),
    ...(formData?.itens_armado_padrao || []).map(item => ({ ...item, original_type: 'armado', display_name: item.descricao_automatica || `${item.tipo_peca} ${item.largura}x${item.altura} (Armado)` })),
    ...(formData?.itens_corte_dobra || []).map(item => ({ ...item, original_type: 'corte_dobra', display_name: `${item.codigo} - ${item.bitola} ${item.formato} (Corte/Dobra)` }))
  ];

  const todosItens = allRawItems.map((item, globalIdx) => ({
    ...item,
    uniqueId: `${item.original_type}_${globalIdx}`, // This is what will be stored in `itens_ids`
    descricao_completa: item.display_name,
    tipo: item.original_type,
  }));

  // Itens já incluídos em etapas
  const itensJaEntregues = (formData?.etapas_entrega || []).flatMap(etapa =>
    etapa.itens_ids || []
  );

  // Itens que ainda não foram atribuídos a nenhuma etapa
  const itensDisponiveis = todosItens.filter(item => {
    return !itensJaEntregues.includes(item.uniqueId);
  });

  const toggleItemEtapa = (itemId) => {
    setNovaEtapa(prev => ({
      ...prev,
      itens_selecionados: prev.itens_selecionados.includes(itemId)
        ? prev.itens_selecionados.filter(id => id !== itemId)
        : [...prev.itens_selecionados, itemId]
    }));
  };

  const salvarEtapa = () => {
    if (!novaEtapa.nome) {
      toast.error('Informe o nome da etapa');
      return;
    }

    if (novaEtapa.itens_selecionados.length === 0) {
      toast.error('Selecione pelo menos um item');
      return;
    }

    const etapa = {
      id: `etapa_${Date.now()}`,
      nome: novaEtapa.nome,
      itens_ids: novaEtapa.itens_selecionados,
      quantidade_itens: novaEtapa.itens_selecionados.length,
      status: 'Pendente',
      data_criacao: new Date().toISOString(),
      faturada: false
    };

    setFormData(prev => ({
      ...prev,
      etapas_entrega: [...(prev?.etapas_entrega || []), etapa]
    }));

    setModalEtapa(false);
    setNovaEtapa({ nome: '', itens_selecionados: [] });
    toast.success(`✅ Etapa "${etapa.nome}" criada`);
  };

  const podeGerenciarEtapas = isAdmin() || canApprove('comercial');

  // NOVO: Calcular frete automaticamente
  const calcularFreteAutomatico = async () => {
    if (!formData?.endereco_entrega_principal?.cep) {
      toast.error('Configure o endereço de entrega primeiro');
      return;
    }

    const peso = formData.peso_total_kg || 0;

    if (peso === 0) {
      toast.error('Adicione itens ao pedido primeiro');
      return;
    }

    // Regra de frete grátis
    if (peso >= 30) {
      setFormData(prev => ({ ...prev, valor_frete: 0, tipo_frete: 'CIF' }));
      toast.success('✅ Frete GRÁTIS! Peso acima de 30kg');
      return;
    }

    // Calcular frete baseado em peso e distância
    // Simulação: R$ 2,50 por KG
    const valorFrete = peso * 2.5;
    
    setFormData(prev => ({ ...prev, valor_frete: parseFloat(valorFrete.toFixed(2)) })); // Ensure float with 2 decimal places
    toast.success(`✅ Frete calculado: R$ ${valorFrete.toFixed(2)}`);
  };

  // NOVO: Sugerir data de entrega baseada em produção
  const sugerirDataEntrega = () => {
    const diasProducao = (formData?.itens_armado_padrao?.length || 0) > 0 || 
                         (formData?.itens_corte_dobra?.length || 0) > 0 ? 7 : 2;
    const diasFrete = 3;
    const diasTotal = diasProducao + diasFrete;

    const dataEntrega = new Date();
    dataEntrega.setDate(dataEntrega.getDate() + diasTotal);

    const dataFormatada = dataEntrega.toISOString().split('T')[0];
    
    setFormData(prev => ({ 
      ...prev, 
      data_prevista_entrega: dataFormatada 
    }));

    toast.success(`📅 Data sugerida: +${diasProducao} dias produção + ${diasFrete} dias frete`);
  };

  return (
    <div className="space-y-6">
      {/* Alerta Frete Grátis */}
      {freteGratis && (
        <Alert className="border-green-300 bg-green-50">
          <Truck className="w-5 h-5 text-green-600" />
          <AlertDescription>
            <p className="font-semibold text-green-900">🎉 Frete Grátis!</p>
            <p className="text-sm text-green-700">
              Peso total: {formData?.peso_total_kg?.toFixed(2) || '0.00'} kg (acima de 30 kg)
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Endereço de Entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Endereço de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clienteSelecionado ? (
            <SeletorEnderecoEntregaPedido
              cliente={clienteSelecionado}
              enderecoSelecionado={formData?.endereco_entrega_principal || {}}
              onSelect={(endereco) => setFormData(prev => ({
                ...prev,
                endereco_entrega_principal: endereco
              }))}
            />
          ) : (
            <Alert className="border-orange-300 bg-orange-50">
              <AlertDescription className="text-sm text-orange-700">
                Selecione um cliente na aba "Identificação" primeiro
              </AlertDescription>
            </Alert>
          )}

          <BuscaCEP
            onEnderecoEncontrado={(endereco) => setFormData(prev => ({
              ...prev,
              endereco_entrega_principal: endereco
            }))}
          />

          {/* NOVO: Campo Link Google Maps */}
          <div className="border-t pt-4">
            <Label>🗺️ Link do Google Maps (Opcional - Para Roteirização Precisa)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={formData?.endereco_entrega_principal?.mapa_url || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  endereco_entrega_principal: {
                    ...(prev?.endereco_entrega_principal || {}),
                    mapa_url: e.target.value
                  }
                }))}
                placeholder="Cole o link do Google Maps aqui..."
                className="flex-1"
              />
              {formData?.endereco_entrega_principal?.mapa_url && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(formData.endereco_entrega_principal.mapa_url, '_blank')}
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              💡 Cole o link do Google Maps para garantir roteirização precisa. Ex: https://maps.app.goo.gl/ABC123
            </p>
          </div>
        </CardContent>
      </Card>

      {/* NOVO: Etapas de Entrega/Faturamento Parcial */}
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardHeader className="bg-purple-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Etapas de Entrega / Faturamento Parcial
            </CardTitle>
            {podeGerenciarEtapas && itensDisponiveis.length > 0 && (
              <Button
                size="sm"
                onClick={() => setModalEtapa(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Criar Nova Etapa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {formData?.etapas_entrega && formData.etapas_entrega.length > 0 ? (
            <div className="space-y-2">
              {formData.etapas_entrega.map((etapa, idx) => (
                <div
                  key={etapa.id}
                  className="p-3 bg-white rounded-lg border flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-sm">{etapa.nome}</p>
                    <p className="text-xs text-slate-600">
                      {etapa.quantidade_itens} item(ns) •
                      <Badge className={
                        etapa.faturada ? 'bg-green-100 text-green-700 ml-2' :
                        'bg-orange-100 text-orange-700 ml-2'
                      }>
                        {etapa.faturada ? 'Faturada' : 'Pendente'}
                      </Badge>
                    </p>
                  </div>
                  <Badge variant="outline">
                    Etapa {idx + 1}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma etapa de entrega criada</p>
              {!podeGerenciarEtapas && (
                <p className="text-xs text-orange-600 mt-2">
                  Apenas Gerentes e Admins podem criar etapas
                </p>
              )}
              {podeGerenciarEtapas && itensDisponiveis.length === 0 && todosItens.length > 0 && (
                 <p className="text-xs text-blue-600 mt-2">
                 Todos os itens já foram atribuídos a alguma etapa.
               </p>
              )}
              {podeGerenciarEtapas && todosItens.length === 0 && (
                 <p className="text-xs text-orange-600 mt-2">
                 Adicione itens ao pedido na aba "Itens do Pedido" para criar etapas.
               </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frete - COM CÁLCULO AUTOMÁTICO */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-600" />
              Informações de Frete
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={calcularFreteAutomatico}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Frete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Frete</Label>
              <select
                value={formData?.tipo_frete || 'CIF'}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo_frete: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="CIF">CIF (Por nossa conta)</option>
                <option value="FOB">FOB (Por conta do cliente)</option>
                <option value="Retirada">Retirada no local</option>
              </select>
            </div>

            <div>
              <Label>Valor do Frete</Label>
              <Input
                type="number"
                step="0.01"
                value={freteGratis ? 0 : (formData?.valor_frete || 0)}
                onChange={(e) => !freteGratis && setFormData(prev => ({
                  ...prev,
                  valor_frete: parseFloat(e.target.value) || 0
                }))}
                disabled={freteGratis}
                className={freteGratis ? 'bg-green-50 font-bold text-green-600' : ''}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Previsão Entrega</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={sugerirDataEntrega}
                  className="h-6 text-xs"
                >
                  Sugerir
                </Button>
              </div>
              <Input
                type="date"
                value={formData?.data_prevista_entrega || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  data_prevista_entrega: e.target.value 
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Janela de Entrega - Início</Label>
              <Input
                type="time"
                value={formData?.endereco_entrega_principal?.horario_inicio || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  endereco_entrega_principal: {
                    ...(prev?.endereco_entrega_principal || {}),
                    horario_inicio: e.target.value
                  }
                }))}
              />
            </div>
            <div>
              <Label>Janela de Entrega - Fim</Label>
              <Input
                type="time"
                value={formData?.endereco_entrega_principal?.horario_fim || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  endereco_entrega_principal: {
                    ...(prev?.endereco_entrega_principal || {}),
                    horario_fim: e.target.value
                  }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações de Entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instruções de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData?.endereco_entrega_principal?.instrucoes_entrega || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              endereco_entrega_principal: {
                ...(prev?.endereco_entrega_principal || {}),
                instrucoes_entrega: e.target.value
              }
            }))}
            className="w-full p-3 border rounded-lg"
            rows="4"
            placeholder="Ex: Portaria 2, avisar com 30min de antecedência..."
          />
        </CardContent>
      </Card>

      {/* Modal: Criar Etapa */}
      <Dialog open={modalEtapa} onOpenChange={setModalEtapa}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Nova Etapa de Entrega</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome da Etapa *</Label>
              <Input
                value={novaEtapa.nome}
                onChange={(e) => setNovaEtapa(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Etapa 1: Fundações Bloco A"
              />
            </div>

            <div>
              <Label>Selecionar Itens para esta Etapa</Label>
              <div className="mt-2 max-h-96 overflow-y-auto border rounded-lg">
                {itensDisponiveis.length > 0 ? (
                  <div className="divide-y">
                    {itensDisponiveis.map((item) => { // Removed idx as uniqueId is stable
                      const selecionado = novaEtapa.itens_selecionados.includes(item.uniqueId);

                      return (
                        <div
                          key={item.uniqueId}
                          onClick={() => toggleItemEtapa(item.uniqueId)}
                          className={`p-3 cursor-pointer hover:bg-slate-50 flex items-center gap-3 ${
                            selecionado ? 'bg-blue-50' : 'bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selecionado}
                            onChange={() => toggleItemEtapa(item.uniqueId)}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.descricao_completa}</p>
                            <p className="text-xs text-slate-600">
                              Qtd: {item.quantidade || 1} •
                              Tipo: {item.tipo}
                            </p>
                          </div>
                          <Badge variant="outline">{item.tipo}</Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>Todos os itens já estão em etapas ou não há itens no pedido.</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {novaEtapa.itens_selecionados.length} item(ns) selecionado(s)
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setModalEtapa(false);
                  setNovaEtapa({ nome: '', itens_selecionados: [] });
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={salvarEtapa}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Etapa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
