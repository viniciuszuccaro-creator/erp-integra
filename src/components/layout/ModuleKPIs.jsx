import React from "react";

export default function ModuleKPIs({ children, className = "" }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-3 ${className}`}>
      {children}
    </div>
  );
}