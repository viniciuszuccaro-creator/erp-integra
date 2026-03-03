import React from "react";

export default function AdminHeader() {
  return (
    <header className="p-4 md:p-6 border-b bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Administração do Sistema</h1>
        <div className="text-sm text-slate-500">Hub central • responsivo • w-full / h-full</div>
      </div>
    </header>
  );
}