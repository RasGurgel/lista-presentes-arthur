"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Gift } from "@/types";
import { Pencil } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  shopee_url: z.string().url("Por favor, insira uma URL válida da Shopee."),
  image_url: z.string().url("URL da imagem inválida.").optional().or(z.literal('')),
  price: z.coerce.number().positive("O preço deve ser um número positivo.").optional(),
});

interface EditGiftDialogProps {
  gift: Gift;
}

export const EditGiftDialog = ({ gift }: EditGiftDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: gift.name || "",
      shopee_url: gift.shopee_url || "",
      image_url: gift.image_url || "",
      price: gift.price || undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await supabase
      .from("gifts")
      .update({
        name: values.name,
        shopee_url: values.shopee_url,
        image_url: values.image_url || null,
        price: values.price || null,
      })
      .eq("id", gift.id);

    if (error) {
      toast({
        title: "Erro ao atualizar presente",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Presente atualizado!",
        description: "As informações do presente foram salvas.",
      });
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Presente</DialogTitle>
          <DialogDescription>
            Altere as informações do presente abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Presente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Lego Star Wars" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shopee_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link da Shopee</FormLabel>
                  <FormControl>
                    <Input placeholder="https://shopee.com.br/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 99.90" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};