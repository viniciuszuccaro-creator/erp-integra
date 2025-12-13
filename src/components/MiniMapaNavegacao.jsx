import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home, Building2, Target } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * Mini Mapa de Navegação (Breadcrumb Contextual)
 * V21.7: Mostra onde o usuário está + contexto empresa/grupo
 */
export default function MiniMapaNavegacao({ contextoAdicional = [] }) {
  const location = useLocation();
  const { empresaAtual, estaNoGrupo, grupoAtual } = useContextoVisual();
  
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
    <div className="flex items-center gap-2 text-sm text-slate-600 w-full">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
            {idx === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                {crumb.icone && <crumb.icone className="w-4 h-4 flex-shrink-0" />}
                <span className="truncate">{crumb.nome}</span>
              </span>
            ) : (
              <Link 
                to={crumb.url} 
                className="hover:text-blue-600 transition-colors flex items-center gap-1.5 truncate"
              >
                {crumb.icone && <crumb.icone className="w-4 h-4 flex-shrink-0" />}
                <span className="truncate">{crumb.nome}</span>
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Badge de Contexto */}
      {empresaAtual && (
        <Badge 
          variant="outline" 
          className={`ml-2 flex-shrink-0 ${estaNoGrupo ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-purple-50 text-purple-700 border-purple-300'}`}
        >
          {estaNoGrupo ? (
            <>
              <Target className="w-3 h-3 mr-1" />
              {grupoAtual?.nome_do_grupo || 'Grupo'}
            </>
          ) : (
            <>
              <Building2 className="w-3 h-3 mr-1" />
              {empresaAtual.nome_fantasia || empresaAtual.razao_social}
            </>
          )}
        </Badge>
      )}
    </div>
  );
}