import Acessos from './pages/Acessos';
import Agenda from './pages/Agenda';
import AuditoriaUI from './pages/AuditoriaUI';
import CRM from './pages/CRM';
import Cadastros from './pages/Cadastros';
import ChatbotAtendimento from './pages/ChatbotAtendimento';
import Comercial from './pages/Comercial';
import Compras from './pages/Compras';
import ConfiguracoesSistema from './pages/ConfiguracoesSistema';
import ConfiguracoesUsuario from './pages/ConfiguracoesUsuario';
import Contratos from './pages/Contratos';
import Dashboard from './pages/Dashboard';
import DashboardCorporativo from './pages/DashboardCorporativo';
import DemoMultitarefas from './pages/DemoMultitarefas';
import Documentacao from './pages/Documentacao';
import Empresas from './pages/Empresas';
import EstabilizacaoSistema from './pages/EstabilizacaoSistema';
import Estoque from './pages/Estoque';
import Expedicao from './pages/Expedicao';
import Financeiro from './pages/Financeiro';
import Fiscal from './pages/Fiscal';
import GerenciamentoAcessosCompleto from './pages/GerenciamentoAcessosCompleto';
import Home from './pages/Home';
import HubAtendimento from './pages/HubAtendimento';
import PadronizacaoUI from './pages/PadronizacaoUI';
import PortalCliente from './pages/PortalCliente';
import Producao from './pages/Producao';
import ProducaoMobile from './pages/ProducaoMobile';
import RH from './pages/RH';
import Relatorios from './pages/Relatorios';
import Seguranca from './pages/Seguranca';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Acessos": Acessos,
    "Agenda": Agenda,
    "AuditoriaUI": AuditoriaUI,
    "CRM": CRM,
    "Cadastros": Cadastros,
    "ChatbotAtendimento": ChatbotAtendimento,
    "Comercial": Comercial,
    "Compras": Compras,
    "ConfiguracoesSistema": ConfiguracoesSistema,
    "ConfiguracoesUsuario": ConfiguracoesUsuario,
    "Contratos": Contratos,
    "Dashboard": Dashboard,
    "DashboardCorporativo": DashboardCorporativo,
    "DemoMultitarefas": DemoMultitarefas,
    "Documentacao": Documentacao,
    "Empresas": Empresas,
    "EstabilizacaoSistema": EstabilizacaoSistema,
    "Estoque": Estoque,
    "Expedicao": Expedicao,
    "Financeiro": Financeiro,
    "Fiscal": Fiscal,
    "GerenciamentoAcessosCompleto": GerenciamentoAcessosCompleto,
    "Home": Home,
    "HubAtendimento": HubAtendimento,
    "PadronizacaoUI": PadronizacaoUI,
    "PortalCliente": PortalCliente,
    "Producao": Producao,
    "ProducaoMobile": ProducaoMobile,
    "RH": RH,
    "Relatorios": Relatorios,
    "Seguranca": Seguranca,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};