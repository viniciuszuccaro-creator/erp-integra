import React from 'react';
import DashboardFinanceiroRealtimeCompacto from './DashboardFinanceiroRealtimeCompacto';

/**
 * DASHBOARD FINANCEIRO TEMPO REAL V22.0 ETAPA 2
 * Redirecionamento para versão compacta modularizada
 */
function DashboardFinanceiroRealtime({ empresaId, windowMode = false }) {
  return <DashboardFinanceiroRealtimeCompacto empresaId={empresaId} windowMode={windowMode} />;
}
export default React.memo(DashboardFinanceiroRealtime);