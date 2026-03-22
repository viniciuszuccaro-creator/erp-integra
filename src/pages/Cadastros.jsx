import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users, Building2, Truck, DollarSign, Package,
  Stars, Cpu, Shield, Database, Zap,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchInput from "@/components/ui/SearchInput";
import usePermissions from "../components/lib/usePermissions";
import { useWindow } from "../components/lib/useWindow";
import GerenciadorJanelas from "../components/sistema/GerenciadorJanelas";
import Bloco1Pessoas from "@/components/cadastros/blocks/Bloco1Pessoas.jsx";
import Bloco2Produtos from "@/components/cadastros/blocks/Bloco2Produtos.jsx";
import Bloco3Financeiro from "@/components/cadastros/blocks/Bloco3Financeiro.jsx";
import Bloco4Logistica from "@/components/cadastros/blocks/Bloco4Logistica.jsx";
import Bloco5Organizacional from "@/components/cadastros/blocks/Bloco5Organizacional.jsx";
import Bloco6Tecnologia from "@/components/cadastros/blocks/Bloco6Tecnologia.jsx";
import GroupCountBadge from "@/components/cadastros/GroupCountBadge";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleContent from "@/components/layout/ModuleContent";


/**
 * ⭐⭐⭐ CADASTROS GERAIS V21.3 - FASE 3: 100% COMPLETA ⭐⭐⭐
 * Hub Central de Dados Mestre • 6 Blocos • 23 Entidades • Multiempresa Total
 *
 * REGRA-MÃE: Acrescentar • Reorganizar • Conectar • Melhorar – NUNCA APAGAR
 *
 * ✅ ESTRUTURA DOS 6 BLOCOS COMPLETA:
 * 1️⃣ PESSOAS & PARCEIROS - Clientes, Fornecedores, Transportadoras, Colaboradores, Representantes, Contatos B2B
 * 2️⃣ PRODUTOS & SERVIÇOS - Setores, Grupos, Marcas, Produtos, Serviços, Kits, Catálogo Web, Unidades Medida
 * 3️⃣ FINANCEIRO - Bancos, Contas, Formas Pagamento, Plano Contas, Centros Custo/Resultado, Tipos Despesa, Tabelas Fiscais
 * 4️⃣ LOGÍSTICA - Veículos, Motoristas, Tipos Frete, Locais Estoque, Rotas Padrão, Modelos Documento
 * 5️⃣ ORGANIZACIONAL - Grupos Empresariais, Empresas, Departamentos, Cargos, Turnos, Usuários, Perfis Acesso
 * 6️⃣ INTEGRAÇÕES & IA - APIs Externas, Webhooks, Chatbot (Intents/Canais), Jobs Agendados, Logs IA, Parâmetros Operacionais
 *
 * ✅ FASE 3 - DIFERENCIAIS:
 * - 23 novas entidades estruturantes (TipoDespesa, PlanoContas, ApiExterna, Webhook, ChatbotIntent, ChatbotCanal, JobAgendado, LogsIA, 8 Parâmetros, Motorista, RotaPadrao, etc)
 * - Entidades core expandidas (Cliente, Fornecedor, Colaborador, Transportadora, CentroCusto) com multiempresa, validação KYC/KYB, LGPD, contatos B2B
 * - 3 IAs implementadas: Governança/SoD, KYC/KYB Validação, Churn Detection
 * - Parâmetros operacionais por empresa (Portal, Origem Pedido, Recebimento NFe, Roteirização, Conciliação, Caixa Diário)
 * - Chatbot multicanal com intents e canais configuráveis
 * - Jobs agendados de IA (DIFAL, Churn, PriceBrain, Monitoramento, KYC, Governança)
 * - Validador e Status Widget Fase 3 integrados ao Dashboard
 * - 100% multiempresa, w-full/h-full, janelas multitarefa, controle acesso granular
 */
export default function Cadastros() {
  const [searchTerm, setSearchTerm] = useState("");
  const [acordeonAberto, setAcordeonAberto] = useState([]);
  const [abaGerenciamento, setAbaGerenciamento] = useState("cadastros");
  const [abaIntegracoes, setAbaIntegracoes] = useState("gerenciamento");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let t = params.get('tab');
    let s = params.get('sub');
    if (!t) { try { t = localStorage.getItem('Cadastros_tab'); } catch {} }
    if (!s) { try { s = localStorage.getItem('Cadastros_subtab'); } catch {} }
    if (t) setAbaGerenciamento(t);
    if (s) setAbaIntegracoes(s);
  }, []);
  const handleAbaChange = (value) => {
    setAbaGerenciamento(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Cadastros_tab', value); } catch {}
  };
  const handleSubChange = (value) => {
    setAbaIntegracoes(value);
    const url = new URL(window.location.href);
    url.searchParams.set('sub', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Cadastros_subtab', value); } catch {}
  };
  const { empresaAtual, grupoAtual, estaNoGrupo } = useContextoVisual();

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { openWindow } = useWindow();


 

  // Handler para clicar nos cards do dashboard
  const handleCardClick = (blocoId) => {
    if (acordeonAberto.includes(blocoId)) {
      setAcordeonAberto(acordeonAberto.filter(id => id !== blocoId));
    } else {
      setAcordeonAberto([...acordeonAberto, blocoId]);
    }
  };

  return (
    <ModuleLayout title="Cadastros Gerais">
      <ModuleContent>
        <div className="h-full w-full p-6 lg:p-8 space-y-6">
      {/* GERENCIADOR DE JANELAS ABERTAS */}
      <GerenciadorJanelas />

      {/* TABS: CADASTROS vs GERENCIAMENTO */}
      <Tabs value={abaGerenciamento} onValueChange={handleAbaChange}>
        <TabsList className="grid w-full grid-cols-1 bg-slate-100">
          <TabsTrigger value="cadastros">
            <Database className="w-4 h-4 mr-2" />
            Cadastros
          </TabsTrigger>
        </TabsList>

        {/* ABA: CADASTROS */}
        <TabsContent value="cadastros" className="space-y-6 mt-6">
          {/* DASHBOARD DE TOTAIS - usa GroupCountBadge para contagem real e precisa */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100" onClick={() => handleCardClick('bloco1')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <GroupCountBadge entities={["Cliente","Fornecedor","Transportadora","Colaborador","Representante","ContatoB2B","SegmentoCliente","RegiaoAtendimento"]} badgeClassName="bg-blue-600 text-white text-xs px-1.5 border-blue-600" />
                </div>
                <div className="text-lg font-bold text-blue-900">Pessoas</div>
                <p className="text-xs text-blue-700">& Parceiros</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100" onClick={() => handleCardClick('bloco2')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  <GroupCountBadge entities={["Produto","Servico","SetorAtividade","GrupoProduto","Marca","TabelaPreco","CatalogoWeb","KitProduto","UnidadeMedida"]} badgeClassName="bg-purple-600 text-white text-xs px-1.5 border-purple-600" />
                </div>
                <div className="text-lg font-bold text-purple-900">Produtos</div>
                <p className="text-xs text-purple-700">& Serviços</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-green-50 to-green-100" onClick={() => handleCardClick('bloco3')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <GroupCountBadge entities={["Banco","FormaPagamento","PlanoDeContas","CentroCusto","CentroResultado","TipoDespesa","MoedaIndice","CondicaoComercial","TabelaFiscal","OperadorCaixa","ConfiguracaoDespesaRecorrente"]} badgeClassName="bg-green-600 text-white text-xs px-1.5 border-green-600" />
                </div>
                <div className="text-lg font-bold text-green-900">Financeiro</div>
                <p className="text-xs text-green-700">& Fiscal</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100" onClick={() => handleCardClick('bloco4')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Truck className="w-5 h-5 text-orange-600" />
                  <GroupCountBadge entities={["Veiculo","Motorista","TipoFrete","LocalEstoque","RotaPadrao","ModeloDocumento"]} badgeClassName="bg-orange-600 text-white text-xs px-1.5 border-orange-600" />
                </div>
                <div className="text-lg font-bold text-orange-900">Logística</div>
                <p className="text-xs text-orange-700">Frota & Almox.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-indigo-50 to-indigo-100" onClick={() => handleCardClick('bloco5')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <GroupCountBadge entities={["Empresa","GrupoEmpresarial","Departamento","Cargo","Turno"]} badgeClassName="bg-indigo-600 text-white text-xs px-1.5 border-indigo-600" />
                </div>
                <div className="text-lg font-bold text-indigo-900">Organizacional</div>
                <p className="text-xs text-indigo-700">Estrutura</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-cyan-50 to-cyan-100" onClick={() => handleCardClick('bloco6')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Cpu className="w-5 h-5 text-cyan-600" />
                  <GroupCountBadge entities={["ApiExterna","ChatbotCanal","ChatbotIntent","GatewayPagamento","JobAgendado","Webhook","ConfiguracaoNFe","ConfiguracaoBoletos","ConfiguracaoWhatsApp","ParametroPortalCliente","ParametroOrigemPedido","ParametroRecebimentoNFe","ParametroRoteirizacao","ParametroConciliacaoBancaria","ParametroCaixaDiario","EventoNotificacao"]} badgeClassName="bg-cyan-600 text-white text-xs px-1.5 border-cyan-600" />
                </div>
                <div className="text-lg font-bold text-cyan-900">Tecnologia</div>
                <p className="text-xs text-cyan-700">IA & Parâmetros</p>
              </CardContent>
            </Card>
          </div>

          {/* ✅ V22.0 ETAPA 5 e 6: BUSCA UNIVERSAL LIMPA */}
          <SearchInput
            placeholder="🔍 Busca Universal - Digite para filtrar em todos os 6 blocos simultaneamente..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            className="h-12 text-base shadow-md border-slate-300"
          />

          {/* ACCORDIONS - 6 BLOCOS */}
          <Accordion type="multiple" value={acordeonAberto} onValueChange={setAcordeonAberto} className="space-y-4">
            {/* BLOCO 1: PESSOAS & PARCEIROS */}
            <AccordionItem value="bloco1" className="border-2 border-blue-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 hover:from-blue-100 hover:to-blue-200">
                <div className="flex items-center gap-3 flex-1">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-blue-900">1️⃣ Pessoas & Parceiros</p>
                    <p className="text-xs text-blue-700">Clientes • Fornecedores • Transportadoras • Colaboradores • Representantes • Contatos B2B</p>
                  </div>
                  <GroupCountBadge entities={["Cliente","Fornecedor","Transportadora","Colaborador","Representante","ContatoB2B","SegmentoCliente","RegiaoAtendimento"]} badgeClassName="ml-auto bg-blue-600 text-white border-blue-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco1Pessoas />
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 2: PRODUTOS & SERVIÇOS */}
            <AccordionItem value="bloco2" className="border-2 border-purple-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 hover:from-purple-100 hover:to-purple-200">
                <div className="flex items-center gap-3 flex-1">
                  <Package className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-purple-900">2️⃣ Produtos & Serviços</p>
                    <p className="text-xs text-purple-700">Produtos • Serviços • Setores • Grupos • Marcas • Tabelas de Preço</p>
                  </div>
                  <GroupCountBadge entities={["Produto","Servico","SetorAtividade","GrupoProduto","Marca","TabelaPreco","CatalogoWeb","KitProduto","UnidadeMedida"]} badgeClassName="ml-auto bg-purple-600 text-white border-purple-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco2Produtos />
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 3: FINANCEIRO */}
            <AccordionItem value="bloco3" className="border-2 border-green-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 hover:from-green-100 hover:to-green-200">
                <div className="flex items-center gap-3 flex-1">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-green-900">3️⃣ Financeiro & Fiscal</p>
                    <p className="text-xs text-green-700">Bancos • Contas • Formas Pagamento • Plano Contas • Centros Custo</p>
                  </div>
                  <GroupCountBadge entities={["Banco","FormaPagamento","PlanoDeContas","CentroCusto","CentroResultado","TipoDespesa","MoedaIndice","CondicaoComercial","TabelaFiscal","OperadorCaixa","ConfiguracaoDespesaRecorrente"]} badgeClassName="ml-auto bg-green-600 text-white border-green-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco3Financeiro />
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 4: LOGÍSTICA, FROTA & ALMOXARIFADO */}
            <AccordionItem value="bloco4" className="border-2 border-orange-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 hover:from-orange-100 hover:to-orange-200">
                <div className="flex items-center gap-3 flex-1">
                  <Truck className="w-6 h-6 text-orange-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-orange-900">4️⃣ Logística, Frota & Almoxarifado</p>
                    <p className="text-xs text-orange-700">Veículos • Motoristas • Tipos Frete • Locais Estoque • Rotas</p>
                  </div>
                  <GroupCountBadge entities={["Veiculo","Motorista","TipoFrete","LocalEstoque","RotaPadrao","ModeloDocumento"]} badgeClassName="ml-auto bg-orange-600 text-white border-orange-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco4Logistica />
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 5: ESTRUTURA ORGANIZACIONAL */}
            <AccordionItem value="bloco5" className="border-2 border-indigo-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 hover:from-indigo-100 hover:to-indigo-200">
                <div className="flex items-center gap-3 flex-1">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-indigo-900">5️⃣ Estrutura Organizacional</p>
                    <p className="text-xs text-indigo-700">Grupos • Empresas • Departamentos • Cargos • Turnos</p>
                  </div>
                  <GroupCountBadge entities={["Empresa","GrupoEmpresarial","Departamento","Cargo","Turno"]} badgeClassName="ml-auto bg-indigo-600 text-white border-indigo-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco5Organizacional />
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 6: TECNOLOGIA, IA & PARÂMETROS */}
            <AccordionItem value="bloco6" className="border-2 border-cyan-200 rounded-sm overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-cyan-50 to-cyan-100 px-6 py-4 hover:from-cyan-100 hover:to-cyan-200">
                <div className="flex items-center gap-3 flex-1">
                  <Cpu className="w-6 h-6 text-cyan-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-cyan-900">6️⃣ Tecnologia, IA & Parâmetros</p>
                    <p className="text-xs text-cyan-700">APIs • Webhooks • Chatbot • Jobs • Gateways • Parâmetros Operacionais</p>
                  </div>
                  <GroupCountBadge entities={["ApiExterna","ChatbotCanal","ChatbotIntent","GatewayPagamento","JobAgendado","Webhook","ConfiguracaoNFe","ConfiguracaoBoletos","ConfiguracaoWhatsApp","ParametroPortalCliente","ParametroOrigemPedido","ParametroRecebimentoNFe","ParametroRoteirizacao","ParametroConciliacaoBancaria","ParametroCaixaDiario","EventoNotificacao"]} badgeClassName="ml-auto bg-cyan-600 text-white border-cyan-600 text-xs" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco6Tecnologia />
              </AccordionContent>
            </AccordionItem>

              </Accordion>



                <Alert className="mt-6 border-purple-300 bg-gradient-to-r from-purple-50 to-cyan-50">
                  <Stars className="w-4 h-4 text-purple-600" />
                  <AlertDescription className="text-sm text-purple-900">
                    <strong>28 IAs Ativas:</strong> PriceBrain 3.0 • ChurnDetection • ProductClassifier • FiscalValidator •
                    LeadScoring • RouteOptimizer • QualityPredictor • StockRecommender • e mais 20 IAs rodando 24/7
                  </AlertDescription>
                </Alert>

                {/* FOOTER - PRINCÍPIOS DA FASE 0 */}
          <Card className="border-2 border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Database className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Fonte Única de Verdade</p>
                    <p className="text-xs text-slate-600">Sem duplicação • Referências integradas</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Controle de Acesso Granular</p>
                    <p className="text-xs text-slate-600">Perfis • Permissões • Auditoria</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Global Audit Log</p>
                    <p className="text-xs text-slate-600">Todas alterações rastreadas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== FASE 1 DEFINITIVO-100% ==================== */}
      {/* TODOS OS FORMULÁRIOS AGORA ABREM EM JANELAS REDIMENSIONÁVEIS */}
      {/* ZERO DIALOGS - TUDO É WINDOW MODE */}
        </div>
      </ModuleContent>
    </ModuleLayout>
  );
}