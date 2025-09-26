"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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

const formSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  shopee_url: z.string().url("Por favor, insira uma URL válida da Shopee."),
  image_url: z.string().url("URL da imagem inválida.").optional().or(z.literal('')),
  price: z.coerce.number().positive("O preço deve ser um número positivo.").optional(),
});

export const AddGiftForm = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      shopee_url: "",
      image_url: "",
      price: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await supabase.from("gifts").insert([
      {
        name: values.name,
        shopee_url: values.shopee_url,
        image_url: values.image_url || null,
        price: values.price || null,
      },
    ]);

    if (error) {
      toast({
        title: "Erro ao adicionar presente",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Presente adicionado!",
        description: "O novo presente já está na lista.",
      });
      form.reset();
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Adicionar Novo Presente</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit">Adicionar Presente</Button>
        </form>
      </Form>
    </div>
  );
};