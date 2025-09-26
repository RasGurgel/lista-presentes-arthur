"use client";

import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AddGiftForm } from "./AddGiftForm";
import { Gift } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AdminGiftList } from "./AdminGiftList";

interface AdminPanelProps {
  gifts: Gift[];
}

export const AdminPanel = ({ gifts }: AdminPanelProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Link de acesso enviado!",
        description: "Verifique seu e-mail para o link mágico de login.",
      });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Área do Organizador</CardTitle>
          <CardDescription>
            Faça login para gerenciar os presentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link mágico"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Painel do Organizador</CardTitle>
            <CardDescription>
              Você está logado como {session.user.email}.
            </CardDescription>
          </div>
          <Button onClick={handleLogout} variant="outline">Sair</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue="manage-gifts">
          <AccordionItem value="add-gift">
            <AccordionTrigger>Adicionar Novo Presente</AccordionTrigger>
            <AccordionContent>
              <AddGiftForm />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="manage-gifts">
            <AccordionTrigger>Gerenciar Presentes ({gifts.length})</AccordionTrigger>
            <AccordionContent>
              <AdminGiftList gifts={gifts} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};