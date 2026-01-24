import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2,
  Users,
  FileText
} from 'lucide-react';

/**
 * MONITOR CONFLITOS SOD - SEGREGAÇÃO DE FUNÇÕES
 * Detecta e alerta sobre conflitos de Segregação de Funções (SoD)
 * Ex: Mesmo usuário não deve criar e aprovar o mesmo documento
 */

export default function MonitorConflitosSOD() {
  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-sod'],
    queryFn: () => base44.entities.PerfilAcesso.list()
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-sod'],
    queryFn: () => base44.entities.User.list()
  });

  // Detectar perfis com conflitos SoD
  const perfisComConflito = perfis.filter(p => 
    p.conflitos_sod_detectados && p.conflitos_sod_detectados.length > 0
  );

  // Detectar usuários com múltiplos perfis conflitantes
  const usuariosRisco = usuarios.filter(u => {
    const perfil = perfis.find(p => p.id === u.perfil_acesso_id);
    return perfil?.conflitos_sod_detectados?.length > 0;
  });

  const conflitosTotal = perfisComConflito.reduce((sum, p) => 
    sum + (p.conflitos_sod_detectados?.length || 0), 0
  );

  const conflitosCriticos = perfis.reduce((sum, p) => 
    sum + (p.conflitos_sod_detectados?.filter(c => c.severidade === 'Crítica').length || 0), 0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-orange-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Segregação de Funções (SoD)</h2>
          <p className="text-sm text-slate-600">Detecção de Conflitos de Permissão</p>
        </div>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Perfis com Conflito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{perfisComConflito.length}</p>
            <p className="text-xs text-slate-500 mt-1">de {perfis.length} perfis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Conflitos Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{conflitosTotal}</p>
            <p className="text-xs text-slate-500 mt-1">{conflitosCriticos} críticos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Usuários em Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{usuariosRisco.length}</p>
            <p className="text-xs text-slate-500 mt-1">Com perfis conflitantes</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {conflitosCriticos > 0 && (
        <Alert variant="destructive">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>Conflitos Críticos Detectados</AlertTitle>
          <AlertDescription>
            {conflitosCriticos} conflito(s) de Segregação de Funções com severidade CRÍTICA foram detectados.
            Revise os perfis de acesso imediatamente.
          </AlertDescription>
        </Alert>
      )}

      {conflitosTotal === 0 && (
        <Alert className="border-green-300 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900">✅ Sistema Seguro</AlertTitle>
          <AlertDescription className="text-green-700">
            Nenhum conflito de Segregação de Funções detectado. Todos os perfis estão em conformidade.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Conflitos */}
      {perfisComConflito.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conflitos Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {perfisComConflito.map((perfil) => (
                <div key={perfil.id} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">{perfil.nome_perfil}</h4>
                    <Badge className="bg-orange-600">
                      {perfil.conflitos_sod_detectados?.length} conflito(s)
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {perfil.conflitos_sod_detectados?.map((conflito, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded border ${
                          conflito.severidade === 'Crítica' 
                            ? 'bg-red-50 border-red-300'
                            : conflito.severidade === 'Alta'
                            ? 'bg-orange-50 border-orange-300'
                            : 'bg-yellow-50 border-yellow-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={
                            conflito.severidade === 'Crítica' ? 'border-red-500 text-red-700' :
                            conflito.severidade === 'Alta' ? 'border-orange-500 text-orange-700' :
                            'border-yellow-500 text-yellow-700'
                          }>
                            {conflito.severidade}
                          </Badge>
                          <span className="font-medium text-sm">{conflito.tipo_conflito}</span>
                        </div>
                        <p className="text-sm text-slate-700">{conflito.descricao}</p>
                      </div>
                    ))}
                  </div>

                  {/* Usuários Afetados */}
                  <div className="mt-3 pt-3 border-t border-orange-200">
                    <p className="text-xs text-slate-600 mb-2">Usuários com este perfil:</p>
                    <div className="flex flex-wrap gap-2">
                      {usuarios
                        .filter(u => u.perfil_acesso_id === perfil.id)
                        .map(u => (
                          <Badge key={u.id} variant="outline">
                            <Users className="w-3 h-3 mr-1" />
                            {u.full_name || u.email}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}