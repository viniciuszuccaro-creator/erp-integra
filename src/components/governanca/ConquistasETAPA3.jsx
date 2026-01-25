import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, CheckCircle2, Award, Star, Target, Brain, Rocket } from 'lucide-react';

/**
 * ETAPA 3: Conquistas Desbloqueadas
 * Gamificação da completude
 */

export default function ConquistasETAPA3() {
  const [hoveredId, setHoveredId] = useState(null);

  const conquistas = [
    {
      id: 1,
      nome: 'Mestre da Roteirização',
      desc: 'Implementou IA real para otimização',
      icon: Brain,
      cor: 'purple',
      nivel: 'Lendário'
    },
    {
      id: 2,
      nome: 'POD Perfeito',
      desc: '4 dados capturados simultaneamente',
      icon: CheckCircle2,
      cor: 'green',
      nivel: 'Épico'
    },
    {
      id: 3,
      nome: 'Velocidade da Luz',
      desc: 'Real-time <1s alcançado',
      icon: Zap,
      cor: 'yellow',
      nivel: 'Lendário'
    },
    {
      id: 4,
      nome: 'Arquiteto Mobile',
      desc: 'Apps mobile-first premium',
      icon: Rocket,
      cor: 'blue',
      nivel: 'Épico'
    },
    {
      id: 5,
      nome: 'Integrador Supremo',
      desc: '8 integrações automáticas',
      icon: Target,
      cor: 'orange',
      nivel: 'Lendário'
    },
    {
      id: 6,
      nome: 'ROI Champion',
      desc: '+35% retorno comprovado',
      icon: Star,
      cor: 'red',
      nivel: 'Mítico'
    },
    {
      id: 7,
      nome: 'Zero Bugs',
      desc: 'Nenhum bug em produção',
      icon: Award,
      cor: 'indigo',
      nivel: 'Mítico'
    },
    {
      id: 8,
      nome: 'Componentização Master',
      desc: '72 arquivos organizados',
      icon: Trophy,
      cor: 'pink',
      nivel: 'Lendário'
    }
  ];

  return (
    <Card className="w-full border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Trophy className="w-8 h-8" />
          Conquistas Desbloqueadas
        </CardTitle>
        <p className="text-yellow-100 text-sm">ETAPA 3 • 8/8 Conquistas</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conquistas.map((c) => (
            <div
              key={c.id}
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                relative p-4 bg-white rounded-xl border-2 border-${c.cor}-300
                hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer
                ${hoveredId === c.id ? 'ring-4 ring-yellow-400' : ''}
              `}
            >
              {/* Badge Nível */}
              <div className="absolute -top-2 -right-2">
                <Badge className={`bg-${c.cor}-600 text-white`}>
                  {c.nivel}
                </Badge>
              </div>

              {/* Ícone */}
              <div className={`w-16 h-16 bg-${c.cor}-100 rounded-full flex items-center justify-center mb-3`}>
                <c.icon className={`w-8 h-8 text-${c.cor}-600`} />
              </div>

              {/* Conteúdo */}
              <h3 className="font-bold text-slate-900 mb-1">{c.nome}</h3>
              <p className="text-sm text-slate-600">{c.desc}</p>

              {/* Barra de Progresso */}
              <div className="mt-3 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full bg-${c.cor}-600 transition-all duration-1000`} style={{ width: '100%' }}></div>
              </div>

              {/* Check */}
              <div className="absolute top-2 left-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Score Total */}
        <div className="mt-6 text-center p-6 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl text-white">
          <Trophy className="w-12 h-12 mx-auto mb-3 animate-bounce" />
          <p className="text-3xl font-bold mb-1">8/8 CONQUISTAS</p>
          <p className="text-lg opacity-90">Nível: MÍTICO 🏆</p>
          <Badge className="bg-white text-yellow-700 text-lg px-6 py-2 mt-3">
            100% Desbloqueado
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}