/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdministracaoSistema from './pages/AdministracaoSistema';
import Agenda from './pages/Agenda';
import ChatbotAtendimento from './pages/ChatbotAtendimento';
import ConfiguracoesUsuario from './pages/ConfiguracoesUsuario';
import Contratos from './pages/Contratos';
import DashboardCorporativo from './pages/DashboardCorporativo';
import DemoMultitarefas from './pages/DemoMultitarefas';
import Documentacao from './pages/Documentacao';
import Empresas from './pages/Empresas';
import EntregasMobile from './pages/EntregasMobile';
import Home from './pages/Home';
import HubAtendimento from './pages/HubAtendimento';
import PortalCliente from './pages/PortalCliente';
import ProducaoMobile from './pages/ProducaoMobile';
import Relatorios from './pages/Relatorios';
import CRM from './pages/CRM';
import Compras from './pages/Compras';
import Expedicao from './pages/Expedicao';
import Financeiro from './pages/Financeiro';
import Fiscal from './pages/Fiscal';
import Producao from './pages/Producao';
import Comercial from './pages/Comercial';
import Estoque from './pages/Estoque';
import RH from './pages/RH';
import Cadastros from './pages/Cadastros';
import Dashboard from './pages/Dashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdministracaoSistema": AdministracaoSistema,
    "Agenda": Agenda,
    "ChatbotAtendimento": ChatbotAtendimento,
    "ConfiguracoesUsuario": ConfiguracoesUsuario,
    "Contratos": Contratos,
    "DashboardCorporativo": DashboardCorporativo,
    "DemoMultitarefas": DemoMultitarefas,
    "Documentacao": Documentacao,
    "Empresas": Empresas,
    "EntregasMobile": EntregasMobile,
    "Home": Home,
    "HubAtendimento": HubAtendimento,
    "PortalCliente": PortalCliente,
    "ProducaoMobile": ProducaoMobile,
    "Relatorios": Relatorios,
    "CRM": CRM,
    "Compras": Compras,
    "Expedicao": Expedicao,
    "Financeiro": Financeiro,
    "Fiscal": Fiscal,
    "Producao": Producao,
    "Comercial": Comercial,
    "Estoque": Estoque,
    "RH": RH,
    "Cadastros": Cadastros,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};