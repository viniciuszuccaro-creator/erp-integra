import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Package, 
  CreditCard, 
  CheckCircle, 
  X
} from "lucide-react";
import WizardEtapa1Cliente from "./wizard/WizardEtapa1Cliente";
import WizardEtapa2Itens from "./wizard/WizardEtapa2Itens";
import WizardEtapa3Financeiro from "./wizard/WizardEtapa3Financeiro";
import WizardEtapa4Revisao from "./wizard/WizardEtapa4Revisao";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * V21.1: PEDIDO FORM COMPLETO - CONTEÚDO DO MODAL
 * (SEM Dialog próprio - será usado dentro do Dialog do PedidosTab)
 * 
 * CRÍTICO: Este componente NÃO renderiza <Dialog>, apenas o CONTEÚDO
 */
export default function PedidoFormCompleto({ pedido, onSubmit, onCancel }) {
  const [etapaWizard, setEtapaWizard] = useState(1);
  const [formData, setFormData] = useState(pedido || {
    tipo: 'Pedido',
    tipo_pedido: 'Revenda',
    origem_pedido: 'Manual',
    status: 'Rascunho',
    data_pedido: new Date().toISOString().split('T')[0],
    
    // Aba 1
    cliente_id: '',
    cliente_nome: '',
    obra_destino_id: '',
    obra_destino_nome: '',
    
    // Aba 2
    itens_revenda: [],
    itens_armado_padrao: [],
    itens_corte_dobra: [],
    
    // Aba 3
    forma_pagamento: '',
    forma_pagamento_id: '',
    tipo_frete: 'CIF',
    valor_frete: 0,
    desconto_geral_pedido_percentual: 0,
    
    // Totais
    valor_total: 0,
    peso_total_kg: 0,
    
    // Aba 5: Etapas de Faturamento (V21.1)
    etapas_entrega: [],
    
    // Wizard
    percentual_conclusao_wizard: 0,
    etapa_atual_wizard: 1
  });

  const queryClient = useQueryClient();

  const handleSalvar = () => {
    const dadosCompletos = {
      ...formData,
      numero_pedido: pedido?.numero_pedido || `PED-${Date.now()}`,
      percentual_conclusao_wizard: 100,
      etapa_atual_wizard: 4
    };

    onSubmit(dadosCompletos);
  };

  const etapas = [
    { numero: 1, nome: "Cliente", icone: User, concluida: etapaWizard > 1 },
    { numero: 2, nome: "Itens", icone: Package, concluida: etapaWizard > 2 },
    { numero: 3, nome: "Financeiro", icone: CreditCard, concluida: etapaWizard > 3 },
    { numero: 4, nome: "Revisão", icone: CheckCircle, concluida: etapaWizard > 4 }
  ];

  const progressoWizard = ((etapaWizard - 1) / 3) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* HEADER DO MODAL */}
      <div className="border-b pb-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {pedido ? `Editar Pedido ${pedido.numero_pedido}` : 'Novo Pedido - V21.1'}
          </h2>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-600 text-white">
              Etapa {etapaWizard}/4
            </Badge>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* BARRA DE PROGRESSO */}
      <div className="px-6 py-4 bg-slate-50 border-b">
        <div className="flex justify-between items-center mb-3">
          {etapas.map((etapa) => {
            const Icon = etapa.icone;
            const isAtual = etapa.numero === etapaWizard;
            const isConcluida = etapa.concluida;
            
            return (
              <div key={etapa.numero} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    isConcluida ? 'bg-green-600' :
                    isAtual ? 'bg-blue-600' : 
                    'bg-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isConcluida || isAtual ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <p className={`text-xs font-medium ${isAtual ? 'text-blue-600' : 'text-slate-600'}`}>
                  {etapa.nome}
                </p>
              </div>
            );
          })}
        </div>
        <Progress value={progressoWizard} className="h-2" />
      </div>

      {/* CONTEÚDO DAS ETAPAS */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {etapaWizard === 1 && (
          <WizardEtapa1Cliente
            formData={formData}
            onChange={setFormData}
            onNext={() => setEtapaWizard(2)}
          />
        )}

        {etapaWizard === 2 && (
          <WizardEtapa2Itens
            formData={formData}
            onChange={setFormData}
            onNext={() => setEtapaWizard(3)}
            onBack={() => setEtapaWizard(1)}
          />
        )}

        {etapaWizard === 3 && (
          <WizardEtapa3Financeiro
            formData={formData}
            onChange={setFormData}
            onNext={() => setEtapaWizard(4)}
            onBack={() => setEtapaWizard(2)}
          />
        )}

        {etapaWizard === 4 && (
          <WizardEtapa4Revisao
            formData={formData}
            onBack={() => setEtapaWizard(3)}
            onSalvar={handleSalvar}
            isSalvando={false}
          />
        )}
      </div>
    </div>
  );
}