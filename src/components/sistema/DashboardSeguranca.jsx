import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Lock,
  Unlock,
  Eye,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

export default function DashboardSeguranca({ 
  estatisticas, 
  perfis = [], 
  usuarios = [],
  auditoriaAcessos = [] 
}) {
  // Últimas atividades
  const ultimasAtividades = auditoriaAcessos.slice(0, 10);
  
  // Tentativas de acesso negado
  const acessosNegados = auditoriaAcessos.filter(a => 
    a.acao === 'acesso_negado' || a.detalhes?.includes('negado')
  ).length;

  // Usuários mais ativos
  const usuariosAtivos = usuarios
    .map(u => ({
      ...u,
      acessos: auditoriaAcessos.filter(a => a.created_by === u.email).length
    }))
    .sort((a, b) => b.acessos - a.acessos)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full h-full">
      {/* Resumo de Segurança */}
      <Card className="lg:col-span-3">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Resumo de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                estatisticas.cobertura >= 90 ? 'bg-green-100' :
                estatisticas.cobertura >= 70 ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                <span className={`text-2xl font-bold ${
                  estatisticas.cobertura >= 90 ? 'text-green-700' :
                  estatisticas.cobertura >= 70 ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  {estatisticas.cobertura}%
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2">Cobertura</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-700">{estatisticas.totalUsuarios}</span>
              </div>
              <p className="text-sm text-slate-600 mt-2">Total Usuários</p>
            </div>

            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                estatisticas.conflitosTotal === 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={`text-2xl font-bold ${
                  estatisticas.conflitosTotal === 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {estatisticas.conflitosTotal}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2">Conflitos SoD</p>
            </div>

            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                acessosNegados === 0 ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                <span className={`text-2xl font-bold ${
                  acessosNegados === 0 ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {acessosNegados}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2">Acessos Negados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Últimas Atividades */}
      <Card className="lg:col-span-2">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            {ultimasAtividades.map(atividade => (
              <div key={atividade.id} className="p-3 border-b hover:bg-slate-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{atividade.usuario_nome || atividade.created_by}</span>
                  <Badge className={
                    atividade.acao === 'criar' ? 'bg-green-100 text-green-700' :
                    atividade.acao === 'editar' ? 'bg-blue-100 text-blue-700' :
                    atividade.acao === 'excluir' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }>
                    {atividade.acao}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">{atividade.detalhes}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    {new Date(atividade.created_date).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Usuários Mais Ativos */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Usuários Mais Ativos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            {usuariosAtivos.map((u, index) => (
              <div key={u.id} className="p-3 border-b hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-slate-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{u.full_name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {u.acessos} ações
                  </Badge>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}