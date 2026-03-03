import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
const ChatbotPortal = React.lazy(() => import("@/components/portal/ChatbotPortal"));

export default function ChatFloating({ chatOpen, chatMinimized, onClose, onToggleMinimize, onRestore }) {
  return (
    <>
      {chatOpen && (
        <Suspense fallback={<div className="fixed bottom-4 right-4 w-12 h-12 bg-white/80 rounded-full shadow animate-pulse" />}> 
          <ChatbotPortal onClose={onClose} isMinimized={chatMinimized} onToggleMinimize={onToggleMinimize} />
        </Suspense>
      )}
      {chatMinimized && (
        <Button
          onClick={onRestore}
          className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}
    </>
  );
}