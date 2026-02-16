import React from "react";

export default function ModuleKPIs({ children, className = "", minItemWidth = "20rem" }) {
  return (
    <div
      className={`w-full px-2 sm:px-0 grid gap-5 md:gap-6 mb-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))` }}
    >
      {children}
    </div>
  );
}