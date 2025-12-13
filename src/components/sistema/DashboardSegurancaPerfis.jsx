import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, AlertTriangle, Users, CheckCircle, TrendingUp, Lock,
  UserCheck, Eye, ShieldAlert, Activity
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

/**
 * 📊 DASHBOARD DE SEGURANÇA DE PERFIS V21.7
 * 
 * Visão consolidada de segurança do sistema de acesso
 */

export default function DashboardSegurancaPerfis({ perfis = [], usuarios = [] }) {
  const metricas = useMemo(() => {
    const totalPerfis = perfis.length;
    const perfisAtivos = perfis.filter(p => p.ativo !== false).length;
    const totalUsuarios = usuarios.length;
    const usuariosComPerfil = usuarios.filter(u => u.perfil_acesso_id).length;
    const cobertura = totalUsuarios > 0 ? Math.round((usuariosComPerfil / totalUsuarios) * 100) : 0;

    // Análise de permissões por perfil
    const perfisComConflitos = perfis.filter(perfil => {
      const perms = perfil.permissoes || {};
      // Verifica se tem criar + aprovar no mesmo módulo
      return Object.values(perms).some(modulo => {
        return Object.values(modulo || {}).some(secao => {
          return Array.isArray(secao) && secao.includes('criar') && secao.includes('aprovar');
        });
      });
    });

    // Distribuição de níveis
    const porNivel = perfis.reduce((acc, p) => {
      const nivel = p.nivel_perfil || 'Indefinido';
      acc[nivel] = (acc[nivel] || 0) + 1;
      return acc;
    }, {});

    const dadosNivel = Object.entries(porNivel).map(([nivel, qtd]) => ({
      nivel,
      quantidade: qtd
    }));

    // Perfis mais usados
    const perfisComUso = perfis.map(p => ({
      nome: p.nome_perfil,
      usuarios: usuarios.filter(u => u.perfil_acesso_id === p.id).length
    })).sort((a, b) => b.usuarios - a.usuarios).slice(0, 5);

    // Score médio de segurança
    const scoreMedio = perfis.length > 0 
      ? Math.round(perfis.reduce((sum, p) => sum + (100 - (perfisComConflitos.includes(p) ? 20 : 0)), 0) / perfis.length)
      : 0;

    return {
      totalPerfis,
      perfisAtivos,
      totalUsuarios,
      usuariosComPerfil,
      cobertura,
      perfisComConflitos: perfisComConflitos.length,
      dadosNivel,
      perfisComUso,
      scoreMedio
    };
  }, [perfis, usuarios]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Dashboard de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Shield className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{metricas.totalPerfis}</p>
              <p className="text-xs text-slate-600">Total de Perfis</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <UserCheck className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">{metricas.cobertura}%</p>
              <p className="text-xs text-slate-600">Cobertura</p>
              <Progress value={metricas.cobertura} className="h-1 mt-1" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <ShieldAlert className={`w-6 h-6 mb-2 ${metricas.perfisComConflitos > 0 ? 'text-orange-600' : 'text-green-600'}`} />
              <p className={`text-2xl font-bold ${metricas.perfisComConflitos > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {metricas.perfisComConflitos}
              </p>
              <p className="text-xs text-slate-600">Conflitos SoD</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Activity className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-600">{metricas.scoreMedio}</p>
              <p className="text-xs text-slate-600">Score Médio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Nível */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Perfis por Nível</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={metricas.dadosNivel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nivel, quantidade }) => `${nivel}: ${quantidade}`}
                  outerRadius={80}
                  dataKey="quantidade"
                >
                  {metricas.dadosNivel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Perfis Mais Usados */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Top 5 Perfis Mais Usados</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metricas.perfisComUso}>
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usuarios" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {metricas.perfisComConflitos > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <p className="font-bold text-orange-900">
                  {metricas.perfisComConflitos} perfil(is) com conflitos de segregação de funções
                </p>
                <p className="text-sm text-orange-700">
                  Recomenda-se revisar as permissões para aumentar a segurança
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}