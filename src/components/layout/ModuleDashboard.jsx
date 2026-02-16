import React from "react";

export default function ModuleDashboard({ children, className = "" }) {
  return (
    <div className={`w-full h-full flex flex-col gap-2 ${className}`}>
      {children}
    </div>
  );
}