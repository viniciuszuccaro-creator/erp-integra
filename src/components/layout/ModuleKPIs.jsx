import React from "react";

export default function ModuleKPIs({ children, className = "" }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}