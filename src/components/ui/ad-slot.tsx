import React from "react";
import { Card } from "@/components/ui/card";

type AdSlotProps = {
  id?: string;
  size?: "banner" | "rectangle" | "small";
  className?: string;
  children?: React.ReactNode;
};

const AdSlot = ({ id, size = "banner", className = "", children }: AdSlotProps) => {
  const sizes: any = {
    banner: "h-20 md:h-32",
    rectangle: "h-40",
    small: "h-12",
  };

  return (
    <Card className={`flex items-center justify-center bg-muted/5 border-muted/10 ${sizes[size]} ${className}`}>
      <div
        id={id}
        role="region"
        aria-label={id ? `ad-slot-${id}` : "ad-slot"}
        className="w-full h-full flex items-center justify-center text-muted-foreground"
      >
        {children ?? (
          <div className="flex flex-col items-center gap-1 px-2">
            <span className="text-xs md:text-sm font-semibold">Espaço para Anúncio</span>
            <span className="text-[11px] md:text-xs text-muted-foreground">Anúncios ajudam a manter o serviço gratuito</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdSlot;

/*
  Nota: Este componente mostra um placeholder para anúncios. Para integrar uma rede de anúncios
  (ex.: Google AdSense), substitua o conteúdo do `children` por um elemento `ins` ou script
  fornecido pela rede de anúncios e carregue o script por `useEffect` no cliente.

  Exemplo básico (não ativado por padrão):

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  Observações:
  - Não recomendo carregar scripts de anúncios no SSR; carregue apenas no cliente.
  - Respeite as políticas de privacidade e leis de consentimento (GDPR/CCPA) ao exibir anúncios.
*/
