import React, { lazy, Suspense } from 'react';
import { useWindowManager } from './WindowManager';
import { 
  Package, ShoppingCart, Users, DollarSign, FileText, Truck, Loader2, 
  Building2, UserCircle, MapPin, User, CreditCard, Landmark, Settings,
  Shield, Briefcase, Clock, Award, TrendingUp, Boxes, Globe
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Lazy loading de TODOS os formulários
const ProdutoFormV22_Completo = lazy(() => import('@/components/cadastros/ProdutoFormV22_Completo'));
const PedidoFormCompleto = lazy(() => import('@/components/comercial/PedidoFormCompleto'));
const CadastroClienteCompleto = lazy(() => import('@/components/cadastros/CadastroClienteCompleto'));
const CadastroFornecedorCompleto = lazy(() => import('@/components/cadastros/CadastroFornecedorCompleto'));
const TabelaPrecoFormCompleto = lazy(() => import('@/components/cadastros/TabelaPrecoFormCompleto'));
const ColaboradorForm = lazy(() => import('@/components/rh/ColaboradorForm'));
const TransportadoraForm = lazy(() => import('@/components/cadastros/TransportadoraForm'));
const CentroCustoForm = lazy(() => import('@/components/cadastros/CentroCustoForm'));
const BancoForm = lazy(() => import('@/components/cadastros/BancoForm'));
const FormaPagamentoForm = lazy(() => import('@/components/cadastros/FormaPagamentoForm'));
const VeiculoForm = lazy(() => import('@/components/cadastros/VeiculoForm'));
const EmpresaForm = lazy(() => import('@/components/cadastros/EmpresaForm'));
const GrupoEmpresarialForm = lazy(() => import('@/components/cadastros/GrupoEmpresarialForm'));
const UsuarioForm = lazy(() => import('@/components/cadastros/UsuarioForm'));
const PerfilAcessoForm = lazy(() => import('@/components/cadastros/PerfilAcessoForm'));
const ServicoForm = lazy(() => import('@/components/cadastros/ServicoForm'));

const LoadingFallback = ({ message = "Carregando..." }) => (
  <div className="flex items-center justify-center h-96">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    <span className="ml-3 text-slate-600">{message}</span>
  </div>
);

/**
 * V21.0 - HOOK UNIVERSAL DE JANELAS MULTITAREFA
 * ✅ 100% dos formulários integrados
 * ✅ Lazy loading otimizado
 * ✅ Callbacks de salvamento
 * ✅ Multi-instância real
 */
export function useWindow() {
  const { openWindow } = useWindowManager();

  // ==================== PRODUTOS ====================
  const openProductWindow = (produto = null) => {
    return openWindow({
      title: produto ? `Produto: ${produto.descricao}` : 'Novo Produto',
      subtitle: 'V21.0 - IA + Conversões + E-commerce',
      icon: Package,
      badge: produto ? 'Edição' : 'Novo',
      module: 'produtos',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando formulário de produto..." />}>
          <ProdutoFormV22_Completo
            produto={produto}
            onSubmit={async (data) => {
              try {
                if (produto?.id) {
                  await base44.entities.Produto.update(produto.id, data);
                  toast.success('✅ Produto atualizado!');
                } else {
                  await base44.entities.Produto.create(data);
                  toast.success('✅ Produto criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== PEDIDOS ====================
  const openPedidoWindow = (pedido = null, clientes = []) => {
    return openWindow({
      title: pedido ? `Pedido ${pedido.numero_pedido}` : 'Novo Pedido',
      subtitle: 'V21.0 - 9 Abas Multi-Instância',
      icon: ShoppingCart,
      badge: pedido?.numero_pedido || 'Novo',
      module: 'pedidos',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando pedido..." />}>
          <PedidoFormCompleto
            pedido={pedido}
            clientes={clientes}
            onSubmit={async (data) => {
              try {
                if (pedido?.id) {
                  await base44.entities.Pedido.update(pedido.id, data);
                  toast.success('✅ Pedido atualizado!');
                } else {
                  await base44.entities.Pedido.create(data);
                  toast.success('✅ Pedido criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            onCancel={() => {}}
          />
        </Suspense>
      )
    });
  };

  // ==================== CLIENTES ====================
  const openClienteWindow = (cliente = null) => {
    return openWindow({
      title: cliente ? `Cliente: ${cliente.nome}` : 'Novo Cliente',
      subtitle: 'V21.0 - Cadastro Completo',
      icon: Users,
      badge: cliente?.status || 'Novo',
      module: 'clientes',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando cliente..." />}>
          <CadastroClienteCompleto
            cliente={cliente}
            onSubmit={async (data) => {
              try {
                if (cliente?.id) {
                  await base44.entities.Cliente.update(cliente.id, data);
                  toast.success('✅ Cliente atualizado!');
                } else {
                  await base44.entities.Cliente.create(data);
                  toast.success('✅ Cliente criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== FORNECEDORES ====================
  const openFornecedorWindow = (fornecedor = null) => {
    return openWindow({
      title: fornecedor ? `Fornecedor: ${fornecedor.nome}` : 'Novo Fornecedor',
      subtitle: 'V21.0 - Cadastro de Fornecedores',
      icon: Truck,
      badge: fornecedor?.status || 'Novo',
      module: 'fornecedores',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando fornecedor..." />}>
          <CadastroFornecedorCompleto
            fornecedor={fornecedor}
            onSubmit={async (data) => {
              try {
                if (fornecedor?.id) {
                  await base44.entities.Fornecedor.update(fornecedor.id, data);
                  toast.success('✅ Fornecedor atualizado!');
                } else {
                  await base44.entities.Fornecedor.create(data);
                  toast.success('✅ Fornecedor criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== TABELAS DE PREÇO ====================
  const openTabelaPrecoWindow = (tabela = null) => {
    return openWindow({
      title: tabela ? `Tabela: ${tabela.nome}` : 'Nova Tabela de Preço',
      subtitle: 'V21.0 - Motor de Cálculo + IA',
      icon: DollarSign,
      badge: tabela?.tipo || 'Novo',
      module: 'tabelas-preco',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando tabela..." />}>
          <TabelaPrecoFormCompleto
            tabela={tabela}
            onSubmit={async (data) => {
              if (data._salvamentoCompleto) {
                toast.success('✅ Tabela salva!');
                window.location.reload();
              }
            }}
          />
        </Suspense>
      )
    });
  };

  // ==================== COLABORADORES ====================
  const openColaboradorWindow = (colaborador = null) => {
    return openWindow({
      title: colaborador ? `Colaborador: ${colaborador.nome_completo}` : 'Novo Colaborador',
      subtitle: 'V21.0 - Recursos Humanos',
      icon: UserCircle,
      badge: colaborador?.status || 'Novo',
      module: 'colaboradores',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando colaborador..." />}>
          <ColaboradorForm
            colaborador={colaborador}
            onSubmit={async (data) => {
              try {
                if (colaborador?.id) {
                  await base44.entities.Colaborador.update(colaborador.id, data);
                  toast.success('✅ Colaborador atualizado!');
                } else {
                  await base44.entities.Colaborador.create(data);
                  toast.success('✅ Colaborador criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== TRANSPORTADORAS ====================
  const openTransportadoraWindow = (transportadora = null) => {
    return openWindow({
      title: transportadora ? `Transportadora: ${transportadora.razao_social}` : 'Nova Transportadora',
      subtitle: 'V21.0 - Logística',
      icon: Truck,
      badge: transportadora?.status || 'Novo',
      module: 'transportadoras',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando transportadora..." />}>
          <TransportadoraForm
            transportadora={transportadora}
            onSubmit={async (data) => {
              try {
                if (transportadora?.id) {
                  await base44.entities.Transportadora.update(transportadora.id, data);
                  toast.success('✅ Transportadora atualizada!');
                } else {
                  await base44.entities.Transportadora.create(data);
                  toast.success('✅ Transportadora criada!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== CENTROS DE CUSTO ====================
  const openCentroCustoWindow = (centroCusto = null) => {
    return openWindow({
      title: centroCusto ? `Centro de Custo: ${centroCusto.descricao}` : 'Novo Centro de Custo',
      subtitle: 'V21.0 - Contabilidade',
      icon: Briefcase,
      badge: 'Financeiro',
      module: 'centros-custo',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando centro de custo..." />}>
          <CentroCustoForm
            centroCusto={centroCusto}
            onSubmit={async (data) => {
              try {
                if (centroCusto?.id) {
                  await base44.entities.CentroCusto.update(centroCusto.id, data);
                  toast.success('✅ Centro de custo atualizado!');
                } else {
                  await base44.entities.CentroCusto.create(data);
                  toast.success('✅ Centro de custo criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== BANCOS ====================
  const openBancoWindow = (banco = null) => {
    return openWindow({
      title: banco ? `Banco: ${banco.nome}` : 'Novo Banco',
      subtitle: 'V21.0 - Financeiro',
      icon: Landmark,
      badge: 'Banco',
      module: 'bancos',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando banco..." />}>
          <BancoForm
            banco={banco}
            onSubmit={async (data) => {
              try {
                if (banco?.id) {
                  await base44.entities.Banco.update(banco.id, data);
                  toast.success('✅ Banco atualizado!');
                } else {
                  await base44.entities.Banco.create(data);
                  toast.success('✅ Banco criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== FORMAS DE PAGAMENTO ====================
  const openFormaPagamentoWindow = (forma = null) => {
    return openWindow({
      title: forma ? `Forma: ${forma.nome}` : 'Nova Forma de Pagamento',
      subtitle: 'V21.0 - Financeiro',
      icon: CreditCard,
      badge: 'Pagamento',
      module: 'formas-pagamento',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando forma de pagamento..." />}>
          <FormaPagamentoForm
            forma={forma}
            onSubmit={async (data) => {
              try {
                if (forma?.id) {
                  await base44.entities.FormaPagamento.update(forma.id, data);
                  toast.success('✅ Forma de pagamento atualizada!');
                } else {
                  await base44.entities.FormaPagamento.create(data);
                  toast.success('✅ Forma de pagamento criada!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== VEÍCULOS ====================
  const openVeiculoWindow = (veiculo = null) => {
    return openWindow({
      title: veiculo ? `Veículo: ${veiculo.placa}` : 'Novo Veículo',
      subtitle: 'V21.0 - Frota',
      icon: Truck,
      badge: 'Frota',
      module: 'veiculos',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando veículo..." />}>
          <VeiculoForm
            veiculo={veiculo}
            onSubmit={async (data) => {
              try {
                if (veiculo?.id) {
                  await base44.entities.Veiculo.update(veiculo.id, data);
                  toast.success('✅ Veículo atualizado!');
                } else {
                  await base44.entities.Veiculo.create(data);
                  toast.success('✅ Veículo criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== EMPRESAS ====================
  const openEmpresaWindow = (empresa = null) => {
    return openWindow({
      title: empresa ? `Empresa: ${empresa.nome_fantasia}` : 'Nova Empresa',
      subtitle: 'V21.0 - Multi-Empresa',
      icon: Building2,
      badge: 'Empresa',
      module: 'empresas',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando empresa..." />}>
          <EmpresaForm
            empresa={empresa}
            onSubmit={async (data) => {
              try {
                if (empresa?.id) {
                  await base44.entities.Empresa.update(empresa.id, data);
                  toast.success('✅ Empresa atualizada!');
                } else {
                  await base44.entities.Empresa.create(data);
                  toast.success('✅ Empresa criada!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== GRUPOS EMPRESARIAIS ====================
  const openGrupoWindow = (grupo = null) => {
    return openWindow({
      title: grupo ? `Grupo: ${grupo.nome}` : 'Novo Grupo Empresarial',
      subtitle: 'V21.0 - Holding',
      icon: Boxes,
      badge: 'Grupo',
      module: 'grupos',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando grupo..." />}>
          <GrupoEmpresarialForm
            grupo={grupo}
            onSubmit={async (data) => {
              try {
                if (grupo?.id) {
                  await base44.entities.GrupoEmpresarial.update(grupo.id, data);
                  toast.success('✅ Grupo atualizado!');
                } else {
                  await base44.entities.GrupoEmpresarial.create(data);
                  toast.success('✅ Grupo criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== USUÁRIOS ====================
  const openUsuarioWindow = (usuario = null) => {
    return openWindow({
      title: usuario ? `Usuário: ${usuario.full_name}` : 'Novo Usuário',
      subtitle: 'V21.0 - Controle de Acesso',
      icon: User,
      badge: 'Sistema',
      module: 'usuarios',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando usuário..." />}>
          <UsuarioForm
            usuario={usuario}
            onSubmit={async (data) => {
              try {
                if (usuario?.id) {
                  await base44.entities.User.update(usuario.id, data);
                  toast.success('✅ Usuário atualizado!');
                } else {
                  await base44.entities.User.create(data);
                  toast.success('✅ Usuário criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== PERFIS DE ACESSO ====================
  const openPerfilAcessoWindow = (perfil = null) => {
    return openWindow({
      title: perfil ? `Perfil: ${perfil.nome}` : 'Novo Perfil de Acesso',
      subtitle: 'V21.0 - Permissões',
      icon: Shield,
      badge: 'Segurança',
      module: 'perfis-acesso',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando perfil..." />}>
          <PerfilAcessoForm
            perfil={perfil}
            onSubmit={async (data) => {
              try {
                if (perfil?.id) {
                  await base44.entities.PerfilAcesso.update(perfil.id, data);
                  toast.success('✅ Perfil atualizado!');
                } else {
                  await base44.entities.PerfilAcesso.create(data);
                  toast.success('✅ Perfil criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== SERVIÇOS ====================
  const openServicoWindow = (servico = null) => {
    return openWindow({
      title: servico ? `Serviço: ${servico.nome}` : 'Novo Serviço',
      subtitle: 'V21.0 - Cadastro',
      icon: Settings,
      badge: 'Serviço',
      module: 'servicos',
      content: (
        <Suspense fallback={<LoadingFallback message="Carregando serviço..." />}>
          <ServicoForm
            servico={servico}
            onSubmit={async (data) => {
              try {
                if (servico?.id) {
                  await base44.entities.Servico.update(servico.id, data);
                  toast.success('✅ Serviço atualizado!');
                } else {
                  await base44.entities.Servico.create(data);
                  toast.success('✅ Serviço criado!');
                }
                window.location.reload();
              } catch (error) {
                toast.error('Erro: ' + error.message);
              }
            }}
            isSubmitting={false}
          />
        </Suspense>
      )
    });
  };

  // ==================== NF-e (Placeholder) ====================
  const openNFeWindow = (pedido = null) => {
    return openWindow({
      title: 'Emitir NF-e',
      subtitle: pedido ? `Pedido ${pedido.numero_pedido}` : 'Nova Nota Fiscal',
      icon: FileText,
      badge: 'Fiscal',
      module: 'nfe',
      content: (
        <div className="h-full overflow-auto p-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Gerador de NF-e
            </h3>
            <p className="text-slate-600">
              {pedido ? `Gerando NF-e para pedido ${pedido.numero_pedido}` : 'Módulo NF-e em desenvolvimento'}
            </p>
          </div>
        </div>
      )
    });
  };

  return {
    openProductWindow,
    openPedidoWindow,
    openClienteWindow,
    openFornecedorWindow,
    openTabelaPrecoWindow,
    openColaboradorWindow,
    openTransportadoraWindow,
    openCentroCustoWindow,
    openBancoWindow,
    openFormaPagamentoWindow,
    openVeiculoWindow,
    openEmpresaWindow,
    openGrupoWindow,
    openUsuarioWindow,
    openPerfilAcessoWindow,
    openServicoWindow,
    openNFeWindow,
    openWindow
  };
}