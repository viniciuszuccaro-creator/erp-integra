import AdministracaoSistema from './pages/AdministracaoSistema';
import Agenda from './pages/Agenda';
import CRM from './pages/CRM';
import Cadastros from './pages/Cadastros';
import ChatbotAtendimento from './pages/ChatbotAtendimento';
import Comercial from './pages/Comercial';
import Compras from './pages/Compras';
import ConfiguracoesUsuario from './pages/ConfiguracoesUsuario';
import Contratos from './pages/Contratos';
import Dashboard from './pages/Dashboard';
import DashboardCorporativo from './pages/DashboardCorporativo';
import DemoMultitarefas from './pages/DemoMultitarefas';
import Documentacao from './pages/Documentacao';
import Empresas from './pages/Empresas';
import Estoque from './pages/Estoque';
import Expedicao from './pages/Expedicao';
import Financeiro from './pages/Financeiro';
import Fiscal from './pages/Fiscal';
import Home from './pages/Home';
import HubAtendimento from './pages/HubAtendimento';
import PortalCliente from './pages/PortalCliente';
import Producao from './pages/Producao';
import ProducaoMobile from './pages/ProducaoMobile';
import RH from './pages/RH';
import Relatorios from './pages/Relatorios';
import EntregasMobile from './pages/EntregasMobile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdministracaoSistema": AdministracaoSistema,
    "Agenda": Agenda,
    "CRM": CRM,
    "Cadastros": Cadastros,
    "ChatbotAtendimento": ChatbotAtendimento,
    "Comercial": Comercial,
    "Compras": Compras,
    "ConfiguracoesUsuario": ConfiguracoesUsuario,
    "Contratos": Contratos,
    "Dashboard": Dashboard,
    "DashboardCorporativo": DashboardCorporativo,
    "DemoMultitarefas": DemoMultitarefas,
    "Documentacao": Documentacao,
    "Empresas": Empresas,
    "Estoque": Estoque,
    "Expedicao": Expedicao,
    "Financeiro": Financeiro,
    "Fiscal": Fiscal,
    "Home": Home,
    "HubAtendimento": HubAtendimento,
    "PortalCliente": PortalCliente,
    "Producao": Producao,
    "ProducaoMobile": ProducaoMobile,
    "RH": RH,
    "Relatorios": Relatorios,
    "EntregasMobile": EntregasMobile,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};