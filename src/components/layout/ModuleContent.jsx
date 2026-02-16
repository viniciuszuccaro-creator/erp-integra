import React from "react";

export default function ModuleContent({ children, className = "" }) {
  return (
    <div className={`flex-1 overflow-hidden ${className}`}>
      <div className="w-full h-full overflow-auto">{children}</div>
    </div>
  );
}