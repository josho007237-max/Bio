// client/src/components/promo/ShareButton.tsx

import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppConfig } from "@/lib/store";

type ShareButtonProps = {
  buttonStyle?: CSSProperties;
};

export function ShareButton({ buttonStyle }: ShareButtonProps) {
  const { config } = useAppConfig();
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    const title = config.campaign.title || document.title;
    const text =
      config.campaign.shareMessage ||
      "ลองดูโปรนี้หน่อยไหม?";

    try {
      // ถ้า browser รองรับ Web Share API
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }

      // ถ้าไม่รองรับ ให้คัดลอกลิงก์แทน
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        toast({
          title: "คัดลอกลิงก์แล้ว",
          description: "นำไปวางในแชทหรือโพสต์ได้เลย 🎁",
        });
      } else {
        // fallback สุดท้าย
        toast({
          title: "คัดลอกลิงก์ไม่สำเร็จ",
          description: "ลองคัดลอกเองจากแถบที่อยู่ของเบราว์เซอร์นะ",
          variant: "destructive",
        });
      }
    } catch (error) {
      // ส่วนใหญ่ user แค่กด cancel share → ไม่ต้องโชว์ error แรงๆ
      console.error("Share failed or cancelled", error);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleShare}
      style={buttonStyle}
      className="w-full font-semibold"
    >
      แชร์ / คัดลอกลิงก์ 🎁
    </Button>
  );
}
