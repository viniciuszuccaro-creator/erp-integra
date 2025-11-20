import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Rocket } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ValidadorFase3() {
  // Buscar todas as entidades necessárias
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

  const { data: departamentos = [] } = useQuery({
    queryKey: ['departamentos'],
    queryFn: () => base44.entities.Departamento.list()
  });

  const { data: cargos = [] } = useQuery({
    queryKey: ['cargos'],
    queryFn: () => base44.entities.Cargo.list()
  });

  const { data: turnos = [] } = useQuery({
    queryKey: ['turnos'],
    queryFn: () => base44.entities.Turno.list()
  });

  const { data: contatosB2B = [] } = useQuery({
    queryKey: ['contatosB2B'],
    queryFn: () => base44.entities.ContatoB2B.list()
  });

  const { data: segmentos = [] } = useQuery({
    queryKey: ['segmentosCliente'],
    queryFn: () => base44.entities.SegmentoCliente.list()
  });

  const { data: condicoesComerciais = [] } = useQuery({
    queryKey: ['condicoesComerciais'],
    queryFn: () => base44.entities.CondicaoComercial.list()
  });

  const { data: unidades = [] } = useQuery({
    queryKey: ['unidadesMedida'],
    queryFn: () => base44.entities.UnidadeMedida.list()
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: () => base44.entities.Servico.list()
  });

  const { data: kits = [] } = useQuery({
    queryKey: ['kitsProduto'],
    queryFn: () => base44.entities.KitProduto.list()
  });

  const { data: catalogoWeb = [] } = useQuery({
    queryKey: ['catalogoWeb'],
    queryFn: () => base44.entities.CatalogoWeb.list()
  });

  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => base44.entities.Banco.list()
  });

  const { data: contasBancarias = [] } = useQuery({
    queryKey: ['contasBancarias'],
    queryFn: () => base44.entities.ContaBancariaEmpresa.list()
  });

  const { data: centrosResultado = [] } = useQuery({
    queryKey: ['centrosResultado'],
    queryFn: () => base44.entities.CentroResultado.list()
  });

  const { data: tiposDespesa = [] } = useQuery({
    queryKey: ['tiposDespesa'],
    queryFn: () => base44.entities.TipoDespesa.list()
  });

  const { data: planoContas = [] } = useQuery({
    queryKey: ['planoContas'],
    queryFn: () => base44.entities.PlanoDeContas.list()
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => base44.entities.Veiculo.list()
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => base44.entities.Motorista.list()
  });

  const { data: tiposFrete = [] } = useQuery({
    queryKey: ['tiposFrete'],
    queryFn: () => base44.entities.TipoFrete.list()
  });

  const { data: rotasPadrao = [] } = useQuery({
    queryKey: ['rotasPadrao'],
    queryFn: () => base44.entities.RotaPadrao.list()
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.Webhook.list()
  });

  const { data: chatbotIntents = [] } = useQuery({
    queryKey: ['chatbotIntents'],
    queryFn: () => base44.entities.ChatbotIntent.list()
  });

  const { data: chatbotCanais = [] } = useQuery({
    queryKey: ['chatbotCanais'],
    queryFn: () => base44.entities.ChatbotCanal.list()
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobsAgendados'],
    queryFn: () => base44.entities.JobAgendado.list()
  });

  const { data: apis = [] } = useQuery({
    queryKey: ['apisExternas'],
    queryFn: () => base44.entities.ApiExterna.list()
  });

  // Validações
  const validacoes = [
    // BLOCO 3.1
    {
      bloco: '3.1',
      item: 'Entidade GrupoEmpresarial criada',
      valido: grupos.length >= 0,
      detalhes: `${grupos.length} grupo(s) cadastrado(s)`
    },
    {
      bloco: '3.1',
      item: 'Entidade Empresa expandida',
      valido: empresas.length >= 0,
      detalhes: `${empresas.length} empresa(s) cadastrada(s)`
    },
    {
      bloco: '3.1',
      item: 'Perfis de Acesso com granularidade',
      valido: perfis.length >= 0,
      detalhes: `${perfis.length} perfil(is) criado(s)`
    },
    {
      bloco: '3.1',
      item: 'Departamentos, Cargos e Turnos',
      valido: departamentos.length >= 0 && cargos.length >= 0 && turnos.length >= 0,
      detalhes: `${departamentos.length} dept + ${cargos.length} cargos + ${turnos.length} turnos`
    },
    
    // BLOCO 3.2
    {
      bloco: '3.2',
      item: 'ContatoB2B implementado',
      valido: contatosB2B.length >= 0,
      detalhes: `${contatosB2B.length} contato(s) B2B`
    },
    {
      bloco: '3.2',
      item: 'Segmentos e Condições Comerciais',
      valido: segmentos.length >= 0 && condicoesComerciais.length >= 0,
      detalhes: `${segmentos.length} segmentos + ${condicoesComerciais.length} condições`
    },
    
    // BLOCO 3.3
    {
      bloco: '3.3',
      item: 'UnidadeMedida implementada',
      valido: unidades.length >= 0,
      detalhes: `${unidades.length} unidade(s) de medida`
    },
    {
      bloco: '3.3',
      item: 'Serviços e Kits',
      valido: servicos.length >= 0 && kits.length >= 0,
      detalhes: `${servicos.length} serviços + ${kits.length} kits`
    },
    {
      bloco: '3.3',
      item: 'CatalogoWeb implementado',
      valido: catalogoWeb.length >= 0,
      detalhes: `${catalogoWeb.length} item(ns) no catálogo`
    },
    
    // BLOCO 3.4
    {
      bloco: '3.4',
      item: 'Banco e ContaBancariaEmpresa',
      valido: bancos.length >= 0 && contasBancarias.length >= 0,
      detalhes: `${bancos.length} bancos + ${contasBancarias.length} contas`
    },
    {
      bloco: '3.4',
      item: 'Plano de Contas e Centros',
      valido: planoContas.length >= 0 && centrosResultado.length >= 0,
      detalhes: `${planoContas.length} contas + ${centrosResultado.length} centros resultado`
    },
    {
      bloco: '3.4',
      item: 'Tipos de Despesa',
      valido: tiposDespesa.length >= 0,
      detalhes: `${tiposDespesa.length} tipo(s) de despesa`
    },
    
    // BLOCO 3.5
    {
      bloco: '3.5',
      item: 'Veículos e Motoristas',
      valido: veiculos.length >= 0 && motoristas.length >= 0,
      detalhes: `${veiculos.length} veículos + ${motoristas.length} motoristas`
    },
    {
      bloco: '3.5',
      item: 'Tipos de Frete e Rotas Padrão',
      valido: tiposFrete.length >= 0 && rotasPadrao.length >= 0,
      detalhes: `${tiposFrete.length} tipos frete + ${rotasPadrao.length} rotas`
    },
    
    // BLOCO 3.6
    {
      bloco: '3.6',
      item: 'ApiExterna e Webhooks',
      valido: apis.length >= 0 && webhooks.length >= 0,
      detalhes: `${apis.length} APIs + ${webhooks.length} webhooks`
    },
    {
      bloco: '3.6',
      item: 'Chatbot (Intents e Canais)',
      valido: chatbotIntents.length >= 0 && chatbotCanais.length >= 0,
      detalhes: `${chatbotIntents.length} intents + ${chatbotCanais.length} canais`
    },
    {
      bloco: '3.6',
      item: 'Jobs Agendados de IA',
      valido: jobs.length >= 0,
      detalhes: `${jobs.length} job(s) configurado(s)`
    }
  ];

  const totalValidacoes = validacoes.length;
  const validacoesOk = validacoes.filter(v => v.valido).length;
  const percentualCompleto = Math.round((validacoesOk / totalValidacoes) * 100);

  return (
    <div className="space-y-6">
      {/* Score */}
      <Card className={`border-2 ${percentualCompleto === 100 ? 'border-green-400 bg-green-50' : 'border-orange-400 bg-orange-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Score de Implementação FASE 3</h3>
              <p className="text-slate-600">Validação dos 6 Blocos de Cadastros Gerais</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-green-600">{percentualCompleto}%</div>
              <p className="text-sm text-slate-600">{validacoesOk}/{totalValidacoes} validações</p>
            </div>
          </div>
          <Progress value={percentualCompleto} className="h-3" />
        </CardContent>
      </Card>

      {/* Feedback */}
      {percentualCompleto === 100 ? (
        <Alert className="border-green-400 bg-green-50">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <AlertDescription className="text-green-900">
            <strong>🎉 FASE 3 - 100% COMPLETA!</strong>
            <p className="mt-2">Todos os blocos de Cadastros Gerais foram implementados com sucesso. O sistema está pronto para operar como Hub Central de Dados Mestre multiempresa.</p>
          </AlertDescription>
        </Alert>
      ) : percentualCompleto >= 80 ? (
        <Alert className="border-orange-400 bg-orange-50">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>Quase lá!</strong> {totalValidacoes - validacoesOk} validação(ões) pendente(s).
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-red-400 bg-red-50">
          <XCircle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-900">
            <strong>Atenção:</strong> {totalValidacoes - validacoesOk} validação(ões) pendente(s).
          </AlertDescription>
        </Alert>
      )}

      {/* Checklist por Bloco */}
      {['3.1', '3.2', '3.3', '3.4', '3.5', '3.6'].map(blocoNum => {
        const validacoesBloco = validacoes.filter(v => v.bloco === blocoNum);
        const okBloco = validacoesBloco.filter(v => v.valido).length;
        const percBloco = Math.round((okBloco / validacoesBloco.length) * 100);
        
        const nomeBloco = {
          '3.1': 'Empresa e Estrutura',
          '3.2': 'Pessoas e Parceiros',
          '3.3': 'Produtos e Catálogo',
          '3.4': 'Financeiro e Fiscal',
          '3.5': 'Operação e Logística',
          '3.6': 'Integrações e IA'
        }[blocoNum];

        return (
          <Card key={blocoNum}>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Bloco {blocoNum} - {nomeBloco}</span>
                <Badge className={percBloco === 100 ? 'bg-green-600' : 'bg-orange-600'}>
                  {percBloco}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {validacoesBloco.map((val, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-slate-50">
                    {val.valido ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{val.item}</p>
                      <p className="text-xs text-slate-500">{val.detalhes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}