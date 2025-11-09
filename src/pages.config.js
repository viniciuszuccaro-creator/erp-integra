import Dashboard from './pages/Dashboard';
import Comercial from './pages/Comercial';
import Expedicao from './pages/Expedicao';
import Financeiro from './pages/Financeiro';
import Compras from './pages/Compras';
import RH from './pages/RH';
import Estoque from './pages/Estoque';
import Cadastros from './pages/Cadastros';
import Acessos from './pages/Acessos';
import Integracoes from './pages/Integracoes';
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
import TesteGoldenThread from './pages/TesteGoldenThread';
import ChatbotAtendimento from './pages/ChatbotAtendimento';
import AppMotorista from './pages/AppMotorista';
import AppEstoqueMobile from './pages/AppEstoqueMobile';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Comercial": Comercial,
    "Expedicao": Expedicao,
    "Financeiro": Financeiro,
    "Compras": Compras,
    "RH": RH,
    "Estoque": Estoque,
    "Cadastros": Cadastros,
    "Acessos": Acessos,
    "Integracoes": Integracoes,
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
    "TesteGoldenThread": TesteGoldenThread,
    "ChatbotAtendimento": ChatbotAtendimento,
    "AppMotorista": AppMotorista,
    "AppEstoqueMobile": AppEstoqueMobile,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};