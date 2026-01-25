import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * ETAPA 3: Selo de Aprovação Animado
 * Certificação visual com efeitos
 */

export default function SeloAprovacaoETAPA3({ autoConfetti = false }) {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    if (autoConfetti) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }
  }, [autoConfetti]);

  const disparar = () => {
    setAtivo(true);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b']
    });
    setTimeout(() => setAtivo(false), 2000);
  };

  return (
    <div 
      onClick={disparar}
      className="relative inline-block cursor-pointer group"
    >
      <div className={`
        w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 
        rounded-full flex items-center justify-center shadow-2xl
        ${ativo ? 'animate-ping' : 'animate-pulse'}
        group-hover:scale-110 transition-transform duration-300
      `}>
        <div className="absolute inset-2 bg-white rounded-full opacity-30"></div>
        <Award className="w-16 h-16 text-white relative z-10" />
      </div>

      {/* Badge 100% */}
      <div className="absolute -top-2 -right-2 bg-green-600 rounded-full px-3 py-1 shadow-lg">
        <p className="text-white font-bold text-sm">100%</p>
      </div>

      {/* Check Verde */}
      <div className="absolute -bottom-2 -left-2 bg-green-600 rounded-full p-2 shadow-lg">
        <CheckCircle2 className="w-6 h-6 text-white" />
      </div>

      {/* Raio de Energia */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Zap className="w-8 h-8 text-yellow-300 animate-pulse" />
      </div>

      {/* Texto Rotativo */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <p className="text-xs font-bold text-yellow-700 animate-bounce">
          ETAPA 3 CERTIFICADA
        </p>
      </div>

      {/* Dica Hover */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        <p className="text-xs text-slate-500 bg-white px-2 py-1 rounded shadow">
          Clique para celebrar! 🎉
        </p>
      </div>
    </div>
  );
}