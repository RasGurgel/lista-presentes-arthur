"use client";

import { Gift } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Undo2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { EditGiftDialog } from "./EditGiftDialog";

interface AdminGiftListProps {
  gifts: Gift[];
}

export const AdminGiftList = ({ gifts }: AdminGiftListProps) => {
  const { toast } = useToast();

  const handleUnreserve = async (giftId: string) => {
    const { error } = await supabase
      .from("gifts")
      .update({
        claimer_name: null,
        claimer_note: null,
        claimed_at: null,
        is_purchased: false, // Also reset purchased status
      })
      .eq("id", giftId);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Reserva desfeita." });
    }
  };

  const handleUndoPurchase = async (giftId: string) => {
    const { error } = await supabase
      .from("gifts")
      .update({ is_purchased: false })
      .eq("id", giftId);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Status de compra revertido." });
    }
  };

  const handleDelete = async (giftId: string) => {
    const { error } = await supabase.from("gifts").delete().eq("id", giftId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Presente excluído." });
    }
  };

  if (gifts.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum presente cadastrado ainda.</p>;
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Presente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gifts.map((gift) => (
            <TableRow key={gift.id}>
              <TableCell className="font-medium">{gift.name}</TableCell>
              <TableCell>
                {gift.claimer_name ? (
                  gift.is_purchased ? (
                    <span className="text-green-600">Comprado por {gift.claimer_name}</span>
                  ) : (
                    <span className="text-orange-600">Reservado por {gift.claimer_name}</span>
                  )
                ) : (
                  <span className="text-blue-600">Disponível</span>
                )}
              </TableCell>
              <TableCell className="flex justify-end gap-2 flex-wrap">
                {gift.claimer_name && !gift.is_purchased && (
                  <Button variant="outline" size="sm" onClick={() => handleUnreserve(gift.id)}>
                    <Undo2 className="mr-2 h-4 w-4" /> Desfazer Reserva
                  </Button>
                )}
                {gift.is_purchased && (
                  <Button variant="outline" size="sm" onClick={() => handleUndoPurchase(gift.id)}>
                    <Undo2 className="mr-2 h-4 w-4" /> Desfazer Compra
                  </Button>
                )}
                <EditGiftDialog gift={gift} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação não pode ser desfeita. O presente "{gift.name}" será excluído permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(gift.id)}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};