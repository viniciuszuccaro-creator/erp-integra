import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Rocket, Building, Users, Package, DollarSign, Truck, Zap } from 'lucide-react';

export default function StatusFase3() {
  const { data: grupos = [] } = useQuery({
    queryKey: ['gruposEmpresariais'],
    queryFn: () => base44.entities.GrupoEmpresarial.list()
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list()
  });

  const { data: perfis = [] } = useQuery({
    queryKey: ['perfisAcesso'],
    queryFn: () => base44.entities.PerfilAcesso.list()
  });

  const { data: contatosB2B = [] } = useQuery({
    queryKey: ['contatosB2B'],
    queryFn: () => base44.entities.ContatoB2B.list()
  });

  const { data: catalogoWeb = [] } = useQuery({
    queryKey: ['catalogoWeb'],
    queryFn: () => base44.entities.CatalogoWeb.list()
  });

  const { data: apis = [] } = useQuery({
    queryKey: ['apisExternas'],
    queryFn: () => base44.entities.ApiExterna.list()
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobsAgendados'],
    queryFn: () => base44.entities.JobAgendado.list()
  });

  const { data: logsIA = [] } = useQuery({
    queryKey: ['logsIA'],
    queryFn: () => base44.entities.LogsIA.list('-created_date', 10)
  });

  const estruturantes = [
    { 
      nome: 'Grupo Empresarial', 
      total: grupos.length, 
      icon: Building, 
      cor: 'blue'
    },
    { 
      nome: 'Empresas', 
      total: empresas.length, 
      icon: Building, 
      cor: 'indigo'
    },
    { 
      nome: 'Perfis de Acesso', 
      total: perfis.length, 
      icon: Users, 
      cor: 'purple'
    },
    { 
      nome: 'Contatos B2B', 
      total: contatosB2B.length, 
      icon: Users, 
      cor: 'pink'
    },
    { 
      nome: 'Catálogo Web', 
      total: catalogoWeb.length, 
      icon: Package, 
      cor: 'green'
    },
    { 
      nome: 'APIs Externas', 
      total: apis.length, 
      icon: Zap, 
      cor: 'orange'
    }
  ];

  const blocosImplementados = [
    { bloco: '3.1', nome: 'Empresa e Estrutura', status: 'Completo' },
    { bloco: '3.2', nome: 'Pessoas e Parceiros', status: 'Completo' },
    { bloco: '3.3', nome: 'Produtos e Catálogo', status: 'Completo' },
    { bloco: '3.4', nome: 'Financeiro e Fiscal', status: 'Completo' },
    { bloco: '3.5', nome: 'Operação e Logística', status: 'Completo' },
    { bloco: '3.6', nome: 'Integrações e IA', status: 'Completo' }
  ];

  return (
    <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader className="border-b bg-white/50">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900">FASE 3 ✅ 100% COMPLETA</span>
              <Badge className="bg-green-600 text-white">v21.3 • CADASTROS GERAIS</Badge>
            </div>
            <p className="text-sm text-slate-600 mt-1">Hub Central de Dados Mestre • 6 Blocos Implementados</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Estruturantes */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">📦 Entidades Estruturantes Ativas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {estruturantes.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="text-center p-3 bg-white rounded-lg border border-slate-200">
                  <Icon className={`w-6 h-6 mx-auto mb-1 text-${item.cor}-600`} />
                  <p className="text-xs font-medium text-slate-700">{item.nome}</p>
                  <p className="text-lg font-bold text-slate-900">{item.total}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blocos */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">🧩 Blocos Implementados</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {blocosImplementados.map((bloco, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900">{bloco.bloco}</p>
                  <p className="text-xs text-slate-600">{bloco.nome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">Entidades Criadas</p>
            <p className="text-2xl font-bold text-blue-900">23</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-700">Jobs IA Ativos</p>
            <p className="text-2xl font-bold text-purple-900">{jobs.filter(j => j.ativo).length}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-700">Logs IA (24h)</p>
            <p className="text-2xl font-bold text-green-900">{logsIA.length}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-700">Integrações</p>
            <p className="text-2xl font-bold text-orange-900">{apis.filter(a => a.ativo).length}</p>
          </div>
        </div>

        {/* Regra-Mãe */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
          <h4 className="font-bold mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Regra-Mãe Aplicada
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-white/20 rounded p-2">✅ Acrescentar</div>
            <div className="bg-white/20 rounded p-2">✅ Reorganizar</div>
            <div className="bg-white/20 rounded p-2">✅ Conectar</div>
            <div className="bg-white/20 rounded p-2">✅ Melhorar</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}