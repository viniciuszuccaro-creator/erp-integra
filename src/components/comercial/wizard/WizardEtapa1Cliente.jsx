import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Plus, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * V21.1: ABA 1 - IDENTIFICAÇÃO E CLIENTE
 * NOVO: Campo "Obra Destino" (obra_destino_id) - Lookup em múltiplos endereços
 * Widget Limite de Crédito integrado
 */
export default function WizardEtapa1Cliente({ formData, onChange, onNext }) {
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list('-created_date'),
  });

  const clientesFiltrados = clientes.filter(c => 
    c.nome?.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    c.cpf?.includes(buscaCliente) ||
    c.cnpj?.includes(buscaCliente)
  );

  const handleSelecionarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    onChange({
      ...formData,
      cliente_id: cliente.id,
      cliente_nome: cliente.nome,
      cliente_cpf_cnpj: cliente.cpf || cliente.cnpj,
      contatos_cliente: cliente.contatos || [],
      endereco_entrega_principal: cliente.endereco_principal
    });
  };

  const handleSelecionarObra = (obraId) => {
    const obra = clienteSelecionado?.locais_entrega?.find(l => l.id === obraId);
    if (obra) {
      onChange({
        ...formData,
        obra_destino_id: obraId,
        obra_destino_nome: obra.apelido,
        endereco_entrega_principal: {
          ...obra,
          latitude: obra.latitude,
          longitude: obra.longitude
        }
      });
    }
  };

  const limiteCredito = clienteSelecionado?.condicao_comercial?.limite_credito || 0;
  const limiteUtilizado = clienteSelecionado?.condicao_comercial?.limite_credito_utilizado || 0;
  const limiteDisponivel = limiteCredito - limiteUtilizado;
  const percentualUtilizado = limiteCredito > 0 ? (limiteUtilizado / limiteCredito) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-blue-900 mb-3">1️⃣ Selecionar Cliente</h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar cliente por nome, CPF ou CNPJ..."
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
              className="pl-10"
            />
          </div>

          {buscaCliente && clientesFiltrados.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg bg-white p-2">
              {clientesFiltrados.slice(0, 10).map(c => (
                <div
                  key={c.id}
                  onClick={() => handleSelecionarCliente(c)}
                  className={`p-3 rounded cursor-pointer hover:bg-slate-100 transition-colors ${
                    clienteSelecionado?.id === c.id ? 'bg-blue-100 border border-blue-300' : 'border'
                  }`}
                >
                  <p className="font-semibold text-sm">{c.nome}</p>
                  <p className="text-xs text-slate-600">{c.cpf || c.cnpj || '-'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={c.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                      {c.status}
                    </Badge>
                    {c.classificacao_abc && (
                      <Badge variant="outline" className="text-xs">
                        {c.classificacao_abc}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* V21.1: WIDGET LIMITE DE CRÉDITO DINÂMICO */}
      {clienteSelecionado && (
        <>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Limite de Crédito - {clienteSelecionado.nome}
              </h4>
              
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-xs text-slate-600">Limite Total</p>
                  <p className="text-lg font-bold text-purple-900">
                    R$ {limiteCredito.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600">Utilizado</p>
                  <p className="text-lg font-bold text-orange-600">
                    R$ {limiteUtilizado.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600">Disponível</p>
                  <p className="text-lg font-bold text-green-600">
                    R$ {limiteDisponivel.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 transition-all ${
                    percentualUtilizado >= 90 ? 'bg-red-600' : 
                    percentualUtilizado >= 70 ? 'bg-orange-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentualUtilizado, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-1 text-center">
                {percentualUtilizado.toFixed(1)}% utilizado
              </p>

              {percentualUtilizado >= 90 && (
                <Alert className="border-red-300 bg-red-50 mt-3">
                  <AlertDescription className="text-xs text-red-900">
                    ⚠️ Limite quase esgotado! Contate o Financeiro antes de aprovar.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* V21.1: NOVO - PONTO DE ENTREGA / OBRA */}
          <Card className="border-cyan-200 bg-cyan-50">
            <CardContent className="p-4">
              <h4 className="font-bold text-cyan-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Obra/Local de Entrega
              </h4>

              {clienteSelecionado.locais_entrega && clienteSelecionado.locais_entrega.length > 0 ? (
                <div>
                  <Label>Selecionar Obra *</Label>
                  <Select value={formData.obra_destino_id} onValueChange={handleSelecionarObra}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local de entrega" />
                    </SelectTrigger>
                    <SelectContent>
                      {clienteSelecionado.locais_entrega.map(obra => (
                        <SelectItem key={obra.id || obra.apelido} value={obra.id || obra.apelido}>
                          {obra.apelido} - {obra.cidade}/{obra.estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formData.obra_destino_id && (
                    <div className="mt-3 p-3 bg-white rounded border text-xs">
                      <p className="font-semibold text-cyan-900">Endereço Selecionado:</p>
                      <p className="text-slate-700">
                        {formData.endereco_entrega_principal?.logradouro}, 
                        {formData.endereco_entrega_principal?.numero} - 
                        {formData.endereco_entrega_principal?.cidade}/{formData.endereco_entrega_principal?.estado}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertDescription className="text-xs text-orange-900">
                    ⚠️ Cliente sem obras cadastradas. Será usado o endereço principal.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => {
                  // Lógica para adicionar novo local de entrega
                  alert('Modal de Adicionar Obra (futuro)');
                }}
              >
                <Plus className="w-3 h-3 mr-2" />
                Cadastrar Nova Obra
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!formData.cliente_id}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Próximo: Itens do Pedido →
        </Button>
      </div>
    </div>
  );
}