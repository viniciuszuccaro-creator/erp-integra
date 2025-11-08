import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * Mini Mapa de Navegação (Breadcrumb Contextual)
 * Mostra onde o usuário está no sistema
 */
export default function MiniMapaNavegacao({ contextoAdicional = [] }) {
  const location = useLocation();
  
  // Mapeia URLs para nomes amigáveis
  const rotasMap = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/comercial': 'Comercial',
    '/financeiro': 'Financeiro',
    '/expedicao': 'Expedição',
    '/producao': 'Produção',
    '/estoque': 'Estoque',
    '/compras': 'Compras',
    '/rh': 'RH',
    '/fiscal': 'Fiscal',
    '/cadastros': 'Cadastros',
    '/crm': 'CRM',
    '/empresas': 'Empresas',
    '/integracoes': 'Integrações',
    '/relatorios': 'Relatórios',
  };

  const paginaAtual = Object.keys(rotasMap).find(key => 
    location.pathname.includes(key)
  ) || '/';

  const breadcrumbs = [
    { nome: 'Início', url: createPageUrl('Dashboard'), icone: Home }
  ];

  if (paginaAtual !== '/') {
    breadcrumbs.push({
      nome: rotasMap[paginaAtual],
      url: location.pathname,
      icone: null
    });
  }

  // Adiciona contexto adicional (ex: "Pedido #1245")
  contextoAdicional.forEach(item => {
    breadcrumbs.push(item);
  });

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      {breadcrumbs.map((crumb, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
          {idx === breadcrumbs.length - 1 ? (
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              {crumb.icone && <crumb.icone className="w-4 h-4" />}
              {crumb.nome}
            </span>
          ) : (
            <Link 
              to={crumb.url} 
              className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              {crumb.icone && <crumb.icone className="w-4 h-4" />}
              {crumb.nome}
            </Link>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}