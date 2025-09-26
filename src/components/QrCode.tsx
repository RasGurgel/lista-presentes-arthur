"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export const QrCode = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      setQrCodeUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${url}`
      );
    }
  }, []);

  if (!qrCodeUrl) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Compartilhe as Sugestões</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <img src={qrCodeUrl} alt="QR Code para a lista de presentes" />
        <p className="text-sm text-muted-foreground mt-2">
          Aponte a câmera do celular para o QR Code
        </p>
      </CardContent>
    </Card>
  );
};