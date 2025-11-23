import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

/**
 * STATUS WIDGET ETAPAS 5-12
 * Exibe status de conclusão das etapas avançadas
 */

export default function StatusWidgetEtapas512() {
  const etapas = [
    { numero: 5, nome: "Produção Inteligente", icon: "🏭", concluida: true },
    { numero: 6, nome: "Logística 4.0", icon: "🚚", concluida: true },
    { numero: 7, nome: "RH Inteligente", icon: "👥", concluida: true },
    { numero: 8, nome: "Caixa Diário IA", icon: "💰", concluida: true },
    { numero: 9, nome: "Conciliação IA", icon: "🏦", concluida: true },
    { numero: 10, nome: "CRM & Funil IA", icon: "📈", concluida: true },
    { numero: 11, nome: "Integrações & IA", icon: "🔗", concluida: true },
    { numero: 12, nome: "Motor Fiscal IA", icon: "📊", concluida: true }
  ];

  const totalConcluidas = etapas.filter(e => e.concluida).length;
  const percentual = Math.round((totalConcluidas / etapas.length) * 100);

  return (
    <Card className="border-2 border-green-600 shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Status Etapas 5-12
          </span>
          <Badge className="bg-yellow-400 text-yellow-900 text-lg px-4 py-1">
            {percentual}% Completo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {etapas.map((etapa) => (
            <div 
              key={etapa.numero}
              className={`p-3 rounded-lg border-2 ${
                etapa.concluida 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-slate-300 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{etapa.icon}</span>
                {etapa.concluida && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Etapa {etapa.numero}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {etapa.nome}
              </div>
            </div>
          ))}
        </div>

        {percentual === 100 && (
          <div className="p-4 bg-green-100 border-2 border-green-400 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-green-700" />
              <span className="font-bold text-green-900 text-lg">
                TODAS AS ETAPAS CONCLUÍDAS!
              </span>
              <Sparkles className="w-6 h-6 text-green-700" />
            </div>
            <p className="text-sm text-green-800 mb-4">
              Sistema 100% operacional com IA, biometria, dashboards realtime e gamificação
            </p>
            <Link to={createPageUrl("ValidadorEtapas512")}>
              <Button className="bg-green-600 hover:bg-green-700">
                <Trophy className="w-4 h-4 mr-2" />
                Ver Certificado Oficial
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-4 text-center text-xs text-slate-500">
          <p>Regra-Mãe: Acrescentar • Reorganizar • Conectar • Melhorar</p>
          <p className="mt-1">Multiempresa ✓ IA ✓ Controle Acesso ✓ Gamificação ✓ Biometria ✓</p>
        </div>
      </CardContent>
    </Card>
  );
}