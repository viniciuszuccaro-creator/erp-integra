import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { 
  Users, 
  Building2, 
  Package, 
  Truck, 
  FileText,
  Shield,
  Power,
  CheckCircle2,
  TrendingUp,
  Activity
} from "lucide-react";

/**
 * V21.7 - GERENCIADOR DE STATUS DOS CADASTROS
 * Widget inteligente que exibe resumo de status (Ativo/Inativo) de todas entidades
 * Integrado com sistema de Inativação/Exclusão universal
 */
export default function GerenciadorStatusCadastros() {
  const { contexto, empresaAtual, grupoAtual, filterInContext } = useContextoVisual();
  const scopeId = empresaAtual?.id || grupoAtual?.id || 'sem-contexto';
  const contextoValido = scopeId !== 'sem-contexto';

  const { data: clientes = [] } = useQuery({
    queryKey: ['status-cadastros', 'clientes', scopeId, contexto],
    queryFn: () => filterInContext('Cliente', {}, '-created_date', 500),
    enabled: contextoValido,
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['status-cadastros', 'fornecedores', scopeId, contexto],
    queryFn: () => filterInContext('Fornecedor', {}, '-created_date', 500),
    enabled: contextoValido,
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['status-cadastros', 'produtos', scopeId, contexto],
    queryFn: () => filterInContext('Produto', {}, '-created_date', 500),
    enabled: contextoValido,
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['status-cadastros', 'colaboradores', scopeId, contexto],
    queryFn: () => filterInContext('Colaborador', {}, '-created_date', 500, 'empresa_alocada_id'),
    enabled: contextoValido,
  });

  const { data: transportadoras = [] } = useQuery({
    queryKey: ['status-cadastros', 'transportadoras', scopeId, contexto],
    queryFn: () => filterInContext('Transportadora', {}, '-created_date', 500),
    enabled: contextoValido,
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['status-cadastros', 'empresas', scopeId, contexto],
    queryFn: () => filterInContext('Empresa', {}, 'nome_fantasia', 500),
    enabled: contextoValido,
  });

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['status-cadastros', 'tabelas-preco', scopeId, contexto],
    queryFn: () => filterInContext('TabelaPreco', {}, '-updated_date', 500),
    enabled: contextoValido,
  });

  const { data: perfisAcesso = [] } = useQuery({
    queryKey: ['status-cadastros', 'perfis-acesso', scopeId, contexto],
    queryFn: () => filterInContext('PerfilAcesso', {}, '-updated_date', 500),
    enabled: contextoValido,
  });

  const estatisticas = [
    {
      nome: 'Clientes',
      icon: Users,
      cor: 'blue',
      total: clientes.length,
      ativos: clientes.filter(c => c.status === 'Ativo').length,
      inativos: clientes.filter(c => c.status === 'Inativo' || c.status === 'Bloqueado').length,
      campo_status: 'status'
    },
    {
      nome: 'Fornecedores',
      icon: Building2,
      cor: 'cyan',
      total: fornecedores.length,
      ativos: fornecedores.filter(f => f.status === 'Ativo').length,
      inativos: fornecedores.filter(f => f.status === 'Inativo').length,
      campo_status: 'status'
    },
    {
      nome: 'Produtos',
      icon: Package,
      cor: 'purple',
      total: produtos.length,
      ativos: produtos.filter(p => p.status === 'Ativo').length,
      inativos: produtos.filter(p => p.status === 'Inativo' || p.status === 'Descontinuado').length,
      campo_status: 'status'
    },
    {
      nome: 'Colaboradores',
      icon: Users,
      cor: 'pink',
      total: colaboradores.length,
      ativos: colaboradores.filter(c => c.status === 'Ativo').length,
      inativos: colaboradores.filter(c => c.status === 'Desligado' || c.status === 'Afastado').length,
      campo_status: 'status'
    },
    {
      nome: 'Transportadoras',
      icon: Truck,
      cor: 'orange',
      total: transportadoras.length,
      ativos: transportadoras.filter(t => t.status === 'Ativo').length,
      inativos: transportadoras.filter(t => t.status === 'Inativo').length,
      campo_status: 'status'
    },
    {
      nome: 'Empresas',
      icon: Building2,
      cor: 'indigo',
      total: empresas.length,
      ativos: empresas.filter(e => e.status === 'Ativa').length,
      inativos: empresas.filter(e => e.status === 'Inativa').length,
      campo_status: 'status'
    },
    {
      nome: 'Tabelas de Preço',
      icon: FileText,
      cor: 'green',
      total: tabelasPreco.length,
      ativos: tabelasPreco.filter(t => t.ativo === true).length,
      inativos: tabelasPreco.filter(t => t.ativo === false).length,
      campo_status: 'ativo'
    },
    {
      nome: 'Perfis de Acesso',
      icon: Shield,
      cor: 'red',
      total: perfisAcesso.length,
      ativos: perfisAcesso.filter(p => p.ativo !== false).length,
      inativos: perfisAcesso.filter(p => p.ativo === false).length,
      campo_status: 'ativo'
    }
  ];

  const totalAtivos = estatisticas.reduce((sum, e) => sum + e.ativos, 0);
  const totalInativos = estatisticas.reduce((sum, e) => sum + e.inativos, 0);
  const totalRegistros = estatisticas.reduce((sum, e) => sum + e.total, 0);
  const taxaAtivacao = totalRegistros > 0 ? ((totalAtivos / totalRegistros) * 100).toFixed(1) : 0;

  const cores = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', badge: 'bg-blue-600' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-900', badge: 'bg-cyan-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', badge: 'bg-purple-600' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-900', badge: 'bg-pink-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900', badge: 'bg-orange-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-900', badge: 'bg-indigo-600' },
    green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900', badge: 'bg-green-600' },
    red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900', badge: 'bg-red-600' }
  };

  return (
    <Card className="border-2 border-indigo-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Status de Cadastros - V21.7
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Alert className="border-green-300 bg-green-50">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-900">Sistema de Inativação Universal Ativo</p>
                <p className="text-xs text-green-700 mt-1">
                  Todos os cadastros possuem controles de Ativar/Inativar/Excluir com auditoria
                </p>
              </div>
              <Badge className="bg-green-600 text-white text-base px-3 py-1">
                {taxaAtivacao}% Ativos
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        {/* Resumo Geral */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{totalRegistros}</p>
              <p className="text-xs text-slate-600">Total de Registros</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <Power className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{totalAtivos}</p>
              <p className="text-xs text-green-600">Ativos</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 text-center">
              <Power className="w-8 h-8 text-orange-600 mx-auto mb-2 opacity-50" />
              <p className="text-2xl font-bold text-orange-900">{totalInativos}</p>
              <p className="text-xs text-orange-600">Inativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Grid de Estatísticas por Entidade */}
        <div className="grid grid-cols-2 gap-3">
          {estatisticas.map((stat, idx) => {
            const IconComponent = stat.icon;
            const cor = cores[stat.cor];
            const percentualAtivo = stat.total > 0 ? ((stat.ativos / stat.total) * 100).toFixed(0) : 0;

            return (
              <Card key={idx} className={`${cor.border} ${cor.bg} border`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${cor.text}`} />
                      <p className="font-semibold text-sm">{stat.nome}</p>
                    </div>
                    <Badge className={`${cor.badge} text-white text-xs`}>
                      {percentualAtivo}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">✓ {stat.ativos} ativos</span>
                    <span className="text-orange-700">⊗ {stat.inativos} inativos</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cor.badge} transition-all`}
                      style={{ width: `${percentualAtivo}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Alertas de Baixa Taxa de Ativação */}
        {estatisticas.some(e => e.total > 0 && (e.ativos / e.total) < 0.5) && (
          <Alert className="border-orange-300 bg-orange-50">
            <AlertDescription className="text-sm text-orange-900">
              ⚠️ <strong>Atenção:</strong> Algumas entidades têm mais de 50% de registros inativos. 
              Considere arquivar ou excluir permanentemente dados obsoletos.
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-4 border-t text-center">
          <p className="text-xs text-slate-500">
            🔒 Integrado ao Controle de Acesso V21.7 • Auditoria automática de todas alterações
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
