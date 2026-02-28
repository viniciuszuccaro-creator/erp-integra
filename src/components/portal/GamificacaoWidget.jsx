import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star } from "lucide-react";

function getLevel(points) {
  if (points >= 700) return { name: 'Diamante', color: 'bg-cyan-600' };
  if (points >= 300) return { name: 'Ouro', color: 'bg-amber-500' };
  if (points >= 100) return { name: 'Prata', color: 'bg-slate-400' };
  return { name: 'Bronze', color: 'bg-orange-500' };
}

export default function GamificacaoWidget({ cliente, hasAprovado, hasFeedback }) {
  const pontos = Number(cliente?.pontos_fidelidade || 0);
  const acessos = Number(cliente?.uso_portal?.total_acessos || 0);
  const level = getLevel(pontos);

  const badges = [];
  if (acessos > 0) badges.push({ key: 'primeiro_acesso', label: 'Primeiro Acesso', icon: Star, color: 'bg-indigo-100 text-indigo-700' });
  if (acessos >= 10) badges.push({ key: 'engajado_10', label: 'Engajado 10+', icon: Star, color: 'bg-green-100 text-green-700' });
  if (hasAprovado) badges.push({ key: 'aprovador', label: 'Aprovador', icon: Award, color: 'bg-amber-100 text-amber-700' });
  if (hasFeedback) badges.push({ key: 'avaliador', label: 'Feedback', icon: Star, color: 'bg-blue-100 text-blue-700' });

  return (
    <Card className="px-3 py-2 flex items-center gap-3 bg-white/80 border shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${level.color}`}>
          <Trophy className="w-4 h-4" />
        </div>
        <div className="leading-tight">
          <div className="text-xs text-slate-500">Pontos</div>
          <div className="text-sm font-semibold text-slate-900">{pontos}</div>
        </div>
      </div>
      <Badge className="ml-1 bg-slate-900 text-white">{level.name}</Badge>
      <div className="hidden md:flex items-center gap-1 flex-wrap ml-2">
        {badges.map(b => (
          <Badge key={b.key} className={`${b.color} flex items-center gap-1`}>
            <b.icon className="w-3 h-3" /> {b.label}
          </Badge>
        ))}
      </div>
    </Card>
  );
}