import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

/**
 * Wizard Etapa 1 - Cliente e Vendedor
 * Conexão Hub V16.1: Lê Cliente.json e exibe KYC
 */
export default function WizardEtapa1Cliente({ dadosPedido, onChange }) {
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list(),
  });

  const clienteSelecionado = clientes.find(c => c.id === dadosPedido.cliente_id);

  return (
    <div className="space-y-6">
      <div>
        <Label>Cliente *</Label>
        <Select 
          value={dadosPedido.cliente_id} 
          onValueChange={(val) => {
            const cliente = clientes.find(c => c.id === val);
            onChange({
              ...dadosPedido, 
              cliente_id: val,
              cliente_nome: cliente?.nome || '',
              cliente_cpf_cnpj: cliente?.cnpj || cliente?.cpf || '',
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map(cliente => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome} {cliente.cnpj ? `- ${cliente.cnpj}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {clienteSelecionado && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900">Perfil de Risco (KYC):</span>
                <Badge className={
                  clienteSelecionado.status_fiscal_receita === 'Ativa' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }>
                  {clienteSelecionado.status_fiscal_receita === 'Ativa' ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Ativa</>
                  ) : (
                    <><AlertCircle className="w-3 h-3 mr-1" /> {clienteSelecionado.status_fiscal_receita}</>
                  )}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Limite de Crédito:</span>
                  <p className="font-semibold text-blue-900">
                    R$ {(clienteSelecionado.condicao_comercial?.limite_credito || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Utilizado:</span>
                  <p className="font-semibold text-blue-900">
                    R$ {(clienteSelecionado.condicao_comercial?.limite_credito_utilizado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Classificação ABC:</span>
                  <p className="font-semibold text-blue-900">{clienteSelecionado.classificacao_abc || 'Novo'}</p>
                </div>
                <div>
                  <span className="text-blue-700">Risco de Churn:</span>
                  <Badge variant="outline" className={
                    clienteSelecionado.risco_churn === 'Baixo' ? 'text-green-600' :
                    clienteSelecionado.risco_churn === 'Médio' ? 'text-orange-600' :
                    'text-red-600'
                  }>
                    {clienteSelecionado.risco_churn || 'Baixo'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <Label>Vendedor Responsável *</Label>
        <Select 
          value={dadosPedido.vendedor_id} 
          onValueChange={(val) => {
            const vendedor = usuarios.find(u => u.id === val);
            onChange({
              ...dadosPedido, 
              vendedor_id: val,
              vendedor: vendedor?.full_name || ''
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o vendedor" />
          </SelectTrigger>
          <SelectContent>
            {usuarios.map(usuario => (
              <SelectItem key={usuario.id} value={usuario.id}>
                {usuario.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}