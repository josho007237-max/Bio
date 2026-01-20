import { useAppConfig } from "@/lib/store";
import type { PromoConfig } from "@shared/schema";
import { ProfileHeader } from "@/components/promo/ProfileHeader";
import { InstructionBlock } from "@/components/promo/InstructionBlock";
import { DownloadCard } from "@/components/promo/DownloadCard";
import { DiscountCard } from "@/components/promo/DiscountCard";
import { SocialCard } from "@/components/promo/SocialCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const FALLBACK_DESIGN: PromoConfig["design"] = {
  background: {
    style: "solid",
    color1: "#020617",
    color2: "#020617",
    imageUrl: "",
  },
  typography: {
    titleColor: "#ffffff",
    bodyColor: "#e5e7eb",
    titleFont: "Sans",
  },
  buttons: {
    style: "solid",
    textColor: "#0f172a",
    backgroundColor: "#f97316",
    borderRadius: 999,
  },
  headerLayout: "stacked",
} as any;

export default function PublicView() {
  const { config } = useAppConfig();

  // กันกรณี config.design ว่าง หรือไม่มี field บางตัว
  const design: PromoConfig["design"] = (config.design || FALLBACK_DESIGN) as PromoConfig["design"];

  const { toast } = useToast();
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriberName, setSubscriberName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundStyle = getBackgroundStyle(design);
  const buttonStyle = getButtonStyle(design);
  const titleStyle = {
    color: design.typography?.titleColor ?? "#ffffff",
    fontFamily: resolveFontFamily(design.typography?.titleFont ?? "Sans"),
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "คัดลอกลิงก์แล้ว",
        description: "ลิงก์ถูกคัดลอกไปยังคลิปบอร์ดของคุณแล้ว",
      });
    } catch (error) {
      toast({
        title: "คัดลอกลิงก์ไม่สำเร็จ",
        description: error instanceof Error ? error.message : "โปรดลองอีกครั้ง",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareText =
      config.campaign.shareMessage?.trim() ||
      "มารับของฟรีและส่วนลดพิเศษจากแคมเปญนี้ด้วยกัน 🎁";
    const shareData = {
      title: config.campaign.title || "Share",
      text: shareText,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "แชร์สำเร็จ",
          description: "ขอบคุณที่ช่วยแชร์แคมเปญนี้",
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        toast({
          title: "แชร์ไม่สำเร็จ",
          description: error instanceof Error ? error.message : "โปรดลองอีกครั้ง",
          variant: "destructive",
        });
      }
      return;
    }

    await handleCopyLink();
  };

  const submitAudience = async () => {
    if (!subscriberEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const source = params.get("utm_source") ?? params.get("source") ?? undefined;
      const requestUrl = source
        ? `/api/audience?source=${encodeURIComponent(source)}`
        : "/api/audience";

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: subscriberEmail,
          name: subscriberName || undefined,
        }),
      });
      if (!response.ok) {
        throw new Error(`Submit failed: ${response.status}`);
      }
      setSubscriberEmail("");
      setSubscriberName("");
      toast({
        title: "Thanks for signing up!",
        description: "We have saved your details.",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen text-foreground pb-20 relative selection:bg-primary/30"
      style={{
        ...backgroundStyle,
        color: design.typography?.bodyColor ?? "#e5e7eb",
      }}
    >
      {/* Admin Link (Hidden/Subtle) */}
      <div className="absolute top-4 right-4 z-50">
        <Link href="/admin">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/20 backdrop-blur text-white/50 hover:text-white hover:bg-black/40"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="max-w-md mx-auto relative min-h-screen flex flex-col">
        {/* Profile Section */}
        <ProfileHeader
          title={config.campaign.title}
          subtitle={config.campaign.subtitle ?? ""}
          avatarUrl={config.campaign.avatarUrl ?? ""}
          heroUrl={config.campaign.heroUrl}
          layout={design.headerLayout as any}
          titleColor={design.typography?.titleColor ?? "#ffffff"}
          bodyColor={design.typography?.bodyColor ?? "#e5e7eb"}
          titleFont={resolveFontFamily(design.typography?.titleFont ?? "Sans")}
        />

        {config.audience?.enabled && (
          <section className="px-4 mt-4 space-y-3">
            <h2 className="text-lg font-semibold" style={titleStyle}>
              {config.audience.title}
            </h2>
            {config.audience.description && (
              <p
                className="text-sm"
                style={{ color: design.typography?.bodyColor ?? "#e5e7eb" }}
              >
                {config.audience.description}
              </p>
            )}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
              <Input
                placeholder="Your name (optional)"
                value={subscriberName}
                onChange={(event) => setSubscriberName(event.target.value)}
              />
              <Input
                placeholder="Email address"
                type="email"
                value={subscriberEmail}
                onChange={(event) => setSubscriberEmail(event.target.value)}
              />
              <Button
                className="w-full font-semibold"
                style={buttonStyle}
                onClick={submitAudience}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Subscribe"}
              </Button>
            </div>
          </section>
        )}

        <section className="px-4 mt-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <h2 className="text-lg font-semibold" style={titleStyle}>
              แชร์หน้านี้
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                className="w-full font-semibold"
                style={buttonStyle}
                onClick={handleCopyLink}
              >
                คัดลอกลิงก์
              </Button>
              <Button
                className="w-full font-semibold"
                style={buttonStyle}
                onClick={handleShare}
              >
                แชร์หน้านี้
              </Button>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <InstructionBlock instructions={config.campaign.steps} />

        {/* Main Content Stack */}
        <main className="px-4 space-y-8 flex-1">
          {/* Discounts (Hero Card) */}
          {config.discounts.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold pl-1" style={titleStyle}>
                Exclusive Offers
              </h2>
              <div className="space-y-4">
                {config.discounts.map((item) => (
                  <DiscountCard key={item.id} item={item} buttonStyle={buttonStyle} />
                ))}
              </div>
            </section>
          )}

          {/* Downloads */}
          {config.downloads.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold pl-1" style={titleStyle}>
                Digital Downloads
              </h2>
              <div className="space-y-3">
                {config.downloads.map((item, index) => (
                  <DownloadCard
                    key={item.id}
                    item={item}
                    index={index}
                    buttonStyle={buttonStyle}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Activity Posts */}
          {config.activities.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold pl-1" style={titleStyle}>
                Activities &amp; Sharing
              </h2>
              <div className="space-y-3">
                {config.activities.map((item, index) => (
                  <SocialCard
                    key={item.id}
                    item={item}
                    index={index}
                    buttonStyle={buttonStyle}
                  />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 py-6 text-center text-xs text-muted-foreground">
          <p>© 2025 {config.campaign.title}. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

function getBackgroundStyle(design?: PromoConfig["design"]): React.CSSProperties {
  if (!design || !design.background) {
    return {};
  }

  const bg = design.background;

  if (bg.style === "image" && bg.imageUrl) {
    return {
      backgroundImage: `url(${bg.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  if (bg.style === "gradient") {
    return {
      backgroundImage: `linear-gradient(135deg, ${bg.color1}, ${
        bg.color2 ?? bg.color1
      })`,
    };
  }

  // solid เป็น default
  return { backgroundColor: bg.color1 };
}

function getButtonStyle(design?: PromoConfig["design"]): React.CSSProperties {
  if (!design || !design.buttons) {
    return {};
  }

  const buttons = design.buttons;

  if (buttons.style === "outline") {
    return {
      color: buttons.textColor,
      border: `1px solid ${buttons.textColor}`,
      borderRadius: `${buttons.borderRadius}px`,
      backgroundColor: "transparent",
    };
  }

  return {
    color: buttons.textColor,
    backgroundColor: buttons.backgroundColor,
    borderRadius: `${buttons.borderRadius}px`,
  };
}

function resolveFontFamily(font: string) {
  switch (font) {
    case "Anton":
      return "Anton, sans-serif";
    case "Inter":
      return "Inter, sans-serif";
    case "Sans":
      return "ui-sans-serif, system-ui, sans-serif";
    default:
      return font;
  }
}
