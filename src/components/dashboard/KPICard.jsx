import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Componente padronizado de KPI Card
 * 
 * Usado em todos os dashboards do sistema para exibir métricas principais
 * com design consistente e interativo.
 * 
 * @param {string} title - Título do KPI
 * @param {string|number} value - Valor principal do KPI
 * @param {string} subtitle - Subtítulo/descrição adicional
 * @param {Component} icon - Ícone do lucide-react
 * @param {string} iconColor - Classe de cor do ícone (ex: "text-blue-600")
 * @param {string} iconBg - Classe de fundo do ícone (ex: "bg-blue-50")
 * @param {string} valueColor - Classe de cor do valor (ex: "text-blue-600")
 * @param {string} gradient - Classes de gradiente (ex: "from-blue-500 to-blue-600")
 * @param {function} onClick - Callback ao clicar no card (drill-down)
 * @param {boolean} alert - Se deve exibir alerta visual (borda vermelha)
 * @param {string} className - Classes CSS adicionais
 * 
 * @example
 * <KPICard
 *   title="Vendas do Mês"
 *   value="R$ 150.000,00"
 *   subtitle="45 pedidos"
 *   icon={DollarSign}
 *   iconColor="text-green-600"
 *   iconBg="bg-green-50"
 *   valueColor="text-green-600"
 *   onClick={() => navigate('/comercial')}
 * />
 */
export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
  valueColor = "text-blue-600",
  gradient,
  onClick,
  alert = false,
  className = ""
}) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden",
        onClick && "cursor-pointer group",
        alert && "ring-2 ring-red-300",
        className
      )}
    >
      {gradient && (
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full -mr-16 -mt-16",
          gradient,
          onClick && "group-hover:scale-110 transition-transform"
        )} />
      )}
      
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("p-3 rounded-xl", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className={cn("text-2xl font-bold mb-1", valueColor)}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}