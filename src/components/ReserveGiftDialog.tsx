"use client";

import { Gift } from "@/types";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface ReserveGiftDialogProps {
  gift: Gift;
  children: React.ReactNode;
  disabled?: boolean;
}

export const ReserveGiftDialog = ({ gift, children, disabled }: ReserveGiftDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReserve = async () => {
    if (!name.trim()) {
      showError("Por favor, preencha seu nome.");
      return;
    }
    setLoading(true);

    const { error, count } = await supabase
      .from("gifts")
      .update({
        claimer_name: name,
        claimer_note: note,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", gift.id)
      .is("claimer_name", null); // Garante que só atualize se não estiver reservado

    setLoading(false);

    if (error) {
      showError("Não foi possível reservar o presente. Tente novamente.");
      return;
    }

    if (count === 0) {
      showError("Opa! Este presente já foi reservado por outra pessoa.");
    } else {
      showSuccess(`Presente reservado! Obrigado, ${name}!`);
      setName("");
      setNote("");
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reservar "{gift.name}"</DialogTitle>
          <DialogDescription>
            Seu nome ficará visível para todos. A mensagem é opcional.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Seu Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">
              Mensagem
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Deixe um recado para o Arthur! (opcional)"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleReserve} disabled={loading}>
            {loading ? "Reservando..." : "Reservar Presente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};