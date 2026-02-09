// Placeholder file, this should be overridden by the generated code

import ProtectedSection from "@/components/security/ProtectedSection";

export default function Home() {

  return (
    <ProtectedSection module="Home" action="visualizar">
      <div className="w-full h-full" />
    </ProtectedSection>
  );
}