"use client";

import { Gift } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift as GiftIcon, ShoppingCart, CheckCircle2 } from "lucide-react";
import { ReserveGiftDialog } from "./ReserveGiftDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";

interface GiftCardProps {
  gift: Gift;
  isAdmin: boolean;
}

export const GiftCard = ({ gift, isAdmin }: GiftCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isClaimed = !!gift.claimer_name;

  const handleBuyNow = () => {
    window.open(gift.shopee_url, '_blank', 'noopener,noreferrer');
  };

  const handleMarkAsPurchased = async () => {
    const { error } = await supabase
      .from("gifts")
      .update({ is_purchased: true })
      .eq("id", gift.id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível marcar como comprado. Tente novamente.", variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Obrigado por confirmar a compra do presente!" });
      navigate("/purchased");
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        {gift.image_url && (
          <img
            src={gift.image_url}
            alt={gift.name}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        )}
        <div className="flex justify-between items-start">
          <CardTitle>{gift.name}</CardTitle>
          {gift.price && (
            <Badge variant="secondary" className="text-lg">
              R$ {gift.price.toFixed(2).replace(".", ",")}
            </Badge>
          )}
        </div>
        <CardDescription>
          {isClaimed ? (
            gift.is_purchased ? (
              <div className="text-green-600 font-semibold">
                Comprado por: {gift.claimer_name}
              </div>
            ) : (
              <div className="text-orange-600 font-semibold">
                Reservado por: {gift.claimer_name}
              </div>
            )
          ) : (
            <div className="text-blue-600 font-semibold">Disponível</div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {isClaimed && gift.claimer_note && (
          <p className="text-sm text-muted-foreground italic">
            "{gift.claimer_note}"
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
        {isAdmin ? (
          <p className="text-xs text-muted-foreground">Ações de admin disponíveis no painel.</p>
        ) : isClaimed ? (
          gift.is_purchased ? (
            <Badge variant="default" className="text-md bg-green-600 hover:bg-green-700 w-full justify-center py-2">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Presente Comprado!
            </Badge>
          ) : (
            <div className="w-full flex flex-col gap-2">
              <Button onClick={handleBuyNow} className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Comprar Presente
              </Button>
              <Button onClick={handleMarkAsPurchased} variant="outline" className="w-full">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Presente Comprado
              </Button>
            </div>
          )
        ) : (
          <ReserveGiftDialog gift={gift} disabled={isClaimed}>
            <Button disabled={isClaimed} className="w-full">
              <GiftIcon className="mr-2 h-4 w-4" />
              Quero dar esse presente
            </Button>
          </ReserveGiftDialog>
        )}
      </CardFooter>
    </Card>
  );
};