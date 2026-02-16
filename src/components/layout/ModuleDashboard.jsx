import React from "react";

export default function ModuleDashboard({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 mb-2">
      {children}
    </div>
  );
}