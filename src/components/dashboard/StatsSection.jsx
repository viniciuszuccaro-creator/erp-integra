import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WidgetCanaisOrigem = React.lazy(() => import("@/components/dashboard/WidgetCanaisOrigem"));

export default function StatsSection({ statsCards, empresaId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <Card
          key={index}
          onClick={stat.drillDown}
          className="hover:shadow-lg transition-all duration-300 border-0 overflow-hidden cursor-pointer group"
        >
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>{stat.value}</div>
            <p className="text-xs text-slate-500">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}

      <div className="md:col-span-2 lg:col-span-2">
        <Suspense fallback={<div className="h-28 rounded-md bg-slate-100 animate-pulse" />}>
          <WidgetCanaisOrigem empresaId={empresaId} />
        </Suspense>
      </div>
    </div>
  );
}