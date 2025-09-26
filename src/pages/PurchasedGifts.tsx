"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Gift } from "@/types";
import { GiftCard } from "@/components/GiftCard";
import { Skeleton } from "@/components/ui/skeleton";
import { GiftListNav } from "@/components/GiftListNav";
import { Session } from "@supabase/supabase-js";

const PurchasedGifts = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const fetchGifts = async () => {
    const { data, error } = await supabase
      .from("gifts")
      .select("*")
      .eq('is_purchased', true)
      .order("claimed_at", { ascending: false });

    if (data) {
      setGifts(data);
    }
    if (error) {
      console.error("Error fetching purchased gifts:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    fetchGifts();

    const channel = supabase
      .channel("purchased_gifts_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gifts" },
        () => fetchGifts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Sugestões de Presentes do Arthur
        </h1>
        <p className="text-muted-foreground mt-2">
          Obrigado por fazer parte do aniversário de 8 anos!
        </p>
      </header>

      <GiftListNav />

      <main>
        <h2 className="text-3xl font-semibold mb-6 text-center">Presentes Comprados</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : gifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map((gift) => (
              <GiftCard key={gift.id} gift={gift} isAdmin={!!session} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Nenhum presente foi marcado como comprado ainda.</p>
        )}
      </main>
    </div>
  );
};

export default PurchasedGifts;