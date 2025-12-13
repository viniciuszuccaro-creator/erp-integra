import Dashboard from './pages/Dashboard';
import Comercial from './pages/Comercial';
import Expedicao from './pages/Expedicao';
import Financeiro from './pages/Financeiro';
import Compras from './pages/Compras';
import RH from './pages/RH';
import Estoque from './pages/Estoque';
import Fiscal from './pages/Fiscal';
import CRM from './pages/CRM';
import Agenda from './pages/Agenda';
import Relatorios from './pages/Relatorios';
import ConfiguracoesUsuario from './pages/ConfiguracoesUsuario';
import ConfiguracoesSistema from './pages/ConfiguracoesSistema';
import Contratos from './pages/Contratos';
import Producao from './pages/Producao';
import Empresas from './pages/Empresas';
import DashboardCorporativo from './pages/DashboardCorporativo';
import ProducaoMobile from './pages/ProducaoMobile';
import PortalCliente from './pages/PortalCliente';
import Documentacao from './pages/Documentacao';
import Seguranca from './pages/Seguranca';
import ChatbotAtendimento from './pages/ChatbotAtendimento';
import DemoMultitarefas from './pages/DemoMultitarefas';
import Cadastros from './pages/Cadastros';
import ValidadorEtapas24Final from './pages/ValidadorEtapas24Final';
import HubAtendimento from './pages/HubAtendimento';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Comercial": Comercial,
    "Expedicao": Expedicao,
    "Financeiro": Financeiro,
    "Compras": Compras,
    "RH": RH,
    "Estoque": Estoque,
    "Fiscal": Fiscal,
    "CRM": CRM,
    "Agenda": Agenda,
    "Relatorios": Relatorios,
    "ConfiguracoesUsuario": ConfiguracoesUsuario,
    "ConfiguracoesSistema": ConfiguracoesSistema,
    "Contratos": Contratos,
    "Producao": Producao,
    "Empresas": Empresas,
    "DashboardCorporativo": DashboardCorporativo,
    "ProducaoMobile": ProducaoMobile,
    "PortalCliente": PortalCliente,
    "Documentacao": Documentacao,
    "Seguranca": Seguranca,
    "ChatbotAtendimento": ChatbotAtendimento,
    "DemoMultitarefas": DemoMultitarefas,
    "Cadastros": Cadastros,
    "ValidadorEtapas24Final": ValidadorEtapas24Final,
    "HubAtendimento": HubAtendimento,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};