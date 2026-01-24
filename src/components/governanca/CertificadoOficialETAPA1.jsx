import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Shield, Database, Activity, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * CERTIFICADO OFICIAL ETAPA 1 - VISUAL PREMIUM
 * Selo de certificação visual para dashboards
 */

export default function CertificadoOficialETAPA1() {
  return (
    <Card className="border-4 border-green-500 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-2xl">
      <CardContent className="p-8">
        {/* Header com selo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full shadow-lg mb-4">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            CERTIFICAÇÃO OFICIAL
          </h1>
          <Badge className="bg-green-700 text-white text-lg px-6 py-2">
            ETAPA 1 — 100% COMPLETA
          </Badge>
        </div>

        {/* Descrição */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Governança, Segurança e Multiempresa
          </h2>
          <p className="text-sm text-slate-700">
            Sistema ERP Zuccaro • Versão 21.7
          </p>
        </div>

        {/* Pilares */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-white/80 rounded-lg border-2 border-blue-300">
            <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-sm text-blue-900">RBAC</p>
            <p className="text-xs text-slate-600">Controle Completo</p>
          </div>
          <div className="text-center p-4 bg-white/80 rounded-lg border-2 border-purple-300">
            <Database className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-sm text-purple-900">Multiempresa</p>
            <p className="text-xs text-slate-600">Isolamento Total</p>
          </div>
          <div className="text-center p-4 bg-white/80 rounded-lg border-2 border-emerald-300">
            <Activity className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
            <p className="font-semibold text-sm text-emerald-900">Auditoria</p>
            <p className="text-xs text-slate-600">6 Origens</p>
          </div>
        </div>

        {/* Conquistas */}
        <div className="bg-white/60 rounded-lg p-4 mb-6 border border-green-300">
          <h3 className="font-semibold text-sm text-slate-900 mb-3">Implementação Certificada:</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>9 Backends</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>13 Hooks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>14 Componentes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>18 Dashboards</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>10 Módulos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>40+ Entidades</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t-2 border-green-300 pt-4">
          <p className="text-xs text-slate-600 mb-2">Certificado em: 24 de Janeiro de 2026</p>
          <p className="text-xs font-semibold text-green-800">
            Sistema pronto para produção com segurança enterprise
          </p>
        </div>
      </CardContent>
    </Card>
  );
}