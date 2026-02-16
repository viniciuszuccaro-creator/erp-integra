import React from "react";

export default function ModuleKPIs({ children, className = "", minItemWidth = "16rem" }) {
  return (
    <div
      className={`w-full grid gap-4 md:gap-5 mb-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))` }}
    >
      {children}
    </div>
  );
}