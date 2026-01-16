import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { UserPlus } from "lucide-react";

export default function InviteUserButton({ isAdmin }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return null;

  const invite = async () => {
    setLoading(true);
    await base44.users.inviteUser(email, "user");
    setLoading(false);
    setOpen(false);
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <UserPlus className="w-4 h-4" /> Convidar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar novo usuário</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="email@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button disabled={!email || loading} onClick={invite} className="w-full">
            {loading ? "Enviando convite..." : "Enviar Convite"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}