import React from 'react';
import { Award, CheckCircle2, Zap, Trophy } from 'lucide-react';
import BadgeETAPA3Certificada from '@/components/governanca/BadgeETAPA3Certificada';

/**
 * ETAPA 3: Banner de Completude
 * Para exibir em páginas relacionadas
 */

export default function BannerETAPA3Completa({ variant = 'full' }) {
  if (variant === 'mini') {
    return (
      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-300 rounded-lg">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <span className="text-xs font-medium text-green-800">ETAPA 3 ✓</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-400 rounded-lg">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-green-700" />
          <div>
            <p className="font-bold text-sm text-green-900">ETAPA 3 Certificada</p>
            <p className="text-xs text-green-700">68 componentes ativos</p>
          </div>
        </div>
        <BadgeETAPA3Certificada variant="compact" />
      </div>
    );
  }

  // variant === 'full'
  return (
    <div className="w-full p-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-2xl text-white text-center">
      <Award className="w-16 h-16 mx-auto mb-3 animate-bounce" />
      <h2 className="text-3xl font-bold mb-2">ETAPA 3 — 100% COMPLETA</h2>
      <p className="text-lg opacity-90 mb-4">Logística Inteligente • Apps • IA Real</p>
      
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold">68 Arquivos</span>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
          <Zap className="w-5 h-5" />
          <span className="font-bold">8 Integrações</span>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
          <Trophy className="w-5 h-5" />
          <span className="font-bold">100% Validado</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/30">
        <p className="text-sm opacity-75">Certificado Oficial Emitido • V22.0 • 25/01/2026</p>
      </div>
    </div>
  );
}