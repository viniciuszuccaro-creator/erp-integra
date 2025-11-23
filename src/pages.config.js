import Dashboard from './pages/Dashboard';
import Comercial from './pages/Comercial';
import Expedicao from './pages/Expedicao';
import Financeiro from './pages/Financeiro';
import Compras from './pages/Compras';
import RH from './pages/RH';
import Estoque from './pages/Estoque';
import Acessos from './pages/Acessos';
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
import ValidadorFase1 from './pages/ValidadorFase1';
import LimparDados from './pages/LimparDados';
import DemoMultitarefas from './pages/DemoMultitarefas';
import Cadastros from './pages/Cadastros';
import DemoFase1Completa from './pages/DemoFase1Completa';
import ValidadorFase2 from './pages/ValidadorFase2';
import ValidadorFase3 from './pages/ValidadorFase3';
import ValidadorEtapa4 from './pages/ValidadorEtapa4';
import ValidadorFinalEtapas234 from './pages/ValidadorFinalEtapas234';
import CertificacaoFinal from './pages/CertificacaoFinal';
import ValidadorEtapas24Final from './pages/ValidadorEtapas24Final';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Comercial": Comercial,
    "Expedicao": Expedicao,
    "Financeiro": Financeiro,
    "Compras": Compras,
    "RH": RH,
    "Estoque": Estoque,
    "Acessos": Acessos,
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
    "ValidadorFase1": ValidadorFase1,
    "LimparDados": LimparDados,
    "DemoMultitarefas": DemoMultitarefas,
    "Cadastros": Cadastros,
    "DemoFase1Completa": DemoFase1Completa,
    "ValidadorFase2": ValidadorFase2,
    "ValidadorFase3": ValidadorFase3,
    "ValidadorEtapa4": ValidadorEtapa4,
    "ValidadorFinalEtapas234": ValidadorFinalEtapas234,
    "CertificacaoFinal": CertificacaoFinal,
    "ValidadorEtapas24Final": ValidadorEtapas24Final,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};