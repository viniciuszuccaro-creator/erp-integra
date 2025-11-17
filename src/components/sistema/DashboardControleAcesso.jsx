import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * DASHBOARD DE CONTROLE DE ACESSO V21.0
 * Visão consolidada de usuários, perfis e permissões
 * Regra-Mãe: Segurança + Transparência + Governança
 */
export default function DashboardControleAcesso() {
  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: perfisAcesso = [] } = useQuery({
    queryKey: ['perfis-acesso'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  const usuariosAtivos = usuarios.filter(u => u.role === 'admin' || u.role === 'user');
  const admins = usuarios.filter(u => u.role === 'admin');
  const perfisAtivos = perfisAcesso.filter(p => p.ativo);

  return (
    <div className="space-y-4">
      <Alert className="border-blue-300 bg-blue-50">
        <Shield className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900">
          <strong>Controle de Acesso Granular:</strong> {perfisAtivos.length} perfis ativos • 
          {admins.length} administradores • {usuariosAtivos.length} usuários totais
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50 border-b pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-blue-600">{usuariosAtivos.length}</p>
            <p className="text-xs text-slate-600 mt-1">
              {admins.length} admins • {usuariosAtivos.length - admins.length} regulares
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="bg-green-50 border-b pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              Perfis de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-green-600">{perfisAtivos.length}</p>
            <p className="text-xs text-slate-600 mt-1">
              Controle granular por módulo
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="bg-purple-50 border-b pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-green-700">Ativa</p>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Auditoria em tempo real
            </p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE PERFIS */}
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b pb-3">
          <CardTitle className="text-sm">Perfis Configurados</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {perfisAcesso.map(perfil => (
              <div key={perfil.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-sm">{perfil.nome_perfil}</p>
                  {perfil.descricao && <p className="text-xs text-slate-500">{perfil.descricao}</p>}
                </div>
                <Badge className={perfil.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {perfil.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            ))}
            {perfisAcesso.length === 0 && (
              <p className="text-center text-slate-500 py-8 text-sm">Nenhum perfil de acesso cadastrado</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}