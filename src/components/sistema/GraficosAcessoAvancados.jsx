import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, Shield, Activity } from "lucide-react";

const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6'
};

export default function GraficosAcessoAvancados({ perfis = [], usuarios = [], auditoriaAcessos = [] }) {
  // Usuários por perfil
  const usuariosPorPerfil = useMemo(() => {
    return perfis.map(p => ({
      nome: p.nome_perfil,
      quantidade: usuarios.filter(u => u.perfil_acesso_id === p.id).length
    })).filter(p => p.quantidade > 0);
  }, [perfis, usuarios]);

  // Atividades por módulo (últimos 7 dias)
  const atividadesPorModulo = useMemo(() => {
    const modulos = {};
    auditoriaAcessos.forEach(a => {
      const mod = a.modulo || 'outros';
      modulos[mod] = (modulos[mod] || 0) + 1;
    });
    return Object.entries(modulos)
      .map(([modulo, quantidade]) => ({ modulo, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 8);
  }, [auditoriaAcessos]);

  // Tendência de acessos (últimos 7 dias)
  const tendenciaAcessos = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => {
      const data = new Date();
      data.setDate(data.getDate() - (6 - i));
      return data;
    });

    return dias.map(dia => {
      const count = auditoriaAcessos.filter(a => {
        const dataAcesso = new Date(a.created_date);
        return dataAcesso.toDateString() === dia.toDateString();
      }).length;

      return {
        dia: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        acessos: count
      };
    });
  }, [auditoriaAcessos]);

  // Distribuição de roles
  const distribuicaoRoles = useMemo(() => {
    const roles = usuarios.reduce((acc, u) => {
      const role = u.role || 'user';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(roles).map(([role, quantidade]) => ({
      role: role === 'admin' ? 'Administrador' : 'Usuário',
      quantidade
    }));
  }, [usuarios]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Usuários por Perfil */}
      <Card>
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Distribuição por Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usuariosPorPerfil}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill={COLORS.blue} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Atividades por Módulo */}
      <Card>
        <CardHeader className="bg-purple-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            Acessos por Módulo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={atividadesPorModulo} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="modulo" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="quantidade" fill={COLORS.purple} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tendência de Acessos */}
      <Card>
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Tendência (7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tendenciaAcessos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="acessos" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição de Roles */}
      <Card>
        <CardHeader className="bg-indigo-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Administradores vs Usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribuicaoRoles}
                dataKey="quantidade"
                nameKey="role"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.role}: ${entry.quantidade}`}
              >
                {distribuicaoRoles.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.role === 'Administrador' ? COLORS.purple : COLORS.blue} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}