import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Gift } from "@/types";
import { GiftCard } from "@/components/GiftCard";
import { AdminPanel } from "@/components/AdminPanel";
import { QrCode } from "@/components/QrCode";
import { Skeleton } from "@/components/ui/skeleton";
import { Session } from "@supabase/supabase-js";
import { GiftListNav } from "@/components/GiftListNav";

const Index = () => {
  const [availableGifts, setAvailableGifts] = useState<Gift[]>([]);
  const [allGifts, setAllGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const fetchGifts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gifts")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) {
      setAllGifts(data);
      setAvailableGifts(data.filter(g => !g.claimer_name));
    }
    if (error) {
      console.error("Error fetching gifts:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
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
      .channel("gifts_realtime_index")
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
        <div className="mb-12">
          <AdminPanel gifts={allGifts} />
        </div>

        <h2 className="text-3xl font-semibold mb-6 text-center">Presentes Disponíveis</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : availableGifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableGifts.map((gift) => (
              <GiftCard key={gift.id} gift={gift} isAdmin={!!session} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Todos os presentes já foram reservados! 🎉</p>
        )}
        <div className="mt-12 flex justify-center">
          <QrCode />
        </div>
      </main>
    </div>
  );
};

export default Index;