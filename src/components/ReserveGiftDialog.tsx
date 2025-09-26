"use client";

import { Gift } from "@/types";
import { Button } from "@/components/ui/button";
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
import { useToast } from "./ui/use-toast";

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
  const { toast } = useToast();

  const handleReserve = async () => {
    if (!name.trim()) {
      toast({ title: "Opa!", description: "Por favor, preencha seu nome.", variant: "destructive" });
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
      toast({ title: "Erro no servidor", description: "Não foi possível reservar o presente. Tente novamente.", variant: "destructive" });
      return; // Mantém o pop-up aberto em caso de erro para o usuário tentar novamente.
    }

    // Se não houve erro, a operação terminou. O pop-up deve fechar.
    // Apenas a mensagem para o usuário mudará dependendo do resultado.

    if (count === 0) {
      // O presente foi reservado por outra pessoa enquanto o pop-up estava aberto.
      toast({ title: "Opa! Tarde demais!", description: "Este presente já foi reservado por outra pessoa.", variant: "destructive" });
    } else {
      // Sucesso!
      toast({ title: "Presente reservado!", description: `Obrigado, ${name}! Agora você pode comprar o presente.` });
      setName("");
      setNote("");
    }

    // Fecha o pop-up em ambos os casos (sucesso ou "tarde demais").
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