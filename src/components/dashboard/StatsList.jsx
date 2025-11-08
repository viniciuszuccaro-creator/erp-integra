import { Card, CardContent } from "@/components/ui/card";

export default function StatsList({ title, items, icon: Icon }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className="p-2 bg-slate-100 rounded-lg">
              <Icon className="w-5 h-5 text-slate-600" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="font-medium text-slate-900">{item.label}</p>
                {item.subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                )}
              </div>
              <div className="text-right">
                <p className={`font-bold ${item.valueColor || 'text-slate-900'}`}>
                  {item.value}
                </p>
                {item.badge && (
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}