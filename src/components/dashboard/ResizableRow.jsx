import React from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export default function ResizableRow({ left, right, initial = [50, 50], className = '' }) {
  const [leftSize, rightSize] = initial;
  return (
    <div className={`w-full ${className}`}>
      <ResizablePanelGroup direction="horizontal" className="w-full min-h-[320px]">
        <ResizablePanel defaultSize={leftSize} minSize={30}>
          <div className="h-full w-full">{left}</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={rightSize} minSize={30}>
          <div className="h-full w-full">{right}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}