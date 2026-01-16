import React from "react";
import { UserProvider } from "@/components/lib/UserContext";

export default function Layout({ children, currentPageName }) {
  return (
    <UserProvider>
      <div className="w-full h-full min-h-screen">{children}</div>
    </UserProvider>
  );
}