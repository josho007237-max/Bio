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

export default function PublicView() {
  const { config } = useAppConfig();
  const { design } = config;
  const { toast } = useToast();
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriberName, setSubscriberName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundStyle = getBackgroundStyle(design);
  const buttonStyle = getButtonStyle(design);
  const titleStyle = {
    color: design.typography.titleColor,
    fontFamily: resolveFontFamily(design.typography.titleFont),
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
      const requestUrl = source ? `/api/audience?source=${encodeURIComponent(source)}` : "/api/audience";
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
        color: design.typography.bodyColor,
      }}
    >
      
      {/* Admin Link (Hidden/Subtle) */}
      <div className="absolute top-4 right-4 z-50">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur text-white/50 hover:text-white hover:bg-black/40">
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
          layout={design.headerLayout}
          titleColor={design.typography.titleColor}
          bodyColor={design.typography.bodyColor}
          titleFont={resolveFontFamily(design.typography.titleFont)}
        />

        {config.audience.enabled && (
          <section className="px-4 mt-4 space-y-3">
            <h2 className="text-lg font-semibold" style={titleStyle}>
              {config.audience.title}
            </h2>
            {config.audience.description && (
              <p className="text-sm" style={{ color: design.typography.bodyColor }}>
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

        {/* Instructions */}
        <InstructionBlock instructions={config.campaign.steps} />

        {/* Main Content Stack */}
        <main className="px-4 space-y-8 flex-1">
          
          {/* Discounts (Hero Card) */}
          {config.discounts.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold pl-1" style={titleStyle}>Exclusive Offers</h2>
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
              <h2 className="text-lg font-semibold pl-1" style={titleStyle}>Digital Downloads</h2>
              <div className="space-y-3">
                {config.downloads.map((item, index) => (
                  <DownloadCard key={item.id} item={item} index={index} buttonStyle={buttonStyle} />
                ))}
              </div>
            </section>
          )}

          {/* Activity Posts */}
          {config.activities.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold pl-1" style={titleStyle}>Activities & Sharing</h2>
              <div className="space-y-3">
                {config.activities.map((item, index) => (
                  <SocialCard key={item.id} item={item} index={index} buttonStyle={buttonStyle} />
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

function getBackgroundStyle(design: PromoConfig["design"]) {
  if (design.background.style === "image" && design.background.imageUrl) {
    return {
      backgroundImage: `url(${design.background.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (design.background.style === "gradient") {
    return {
      backgroundImage: `linear-gradient(135deg, ${design.background.color1}, ${design.background.color2 ?? design.background.color1})`,
    };
  }
  return { backgroundColor: design.background.color1 };
}

function getButtonStyle(design: PromoConfig["design"]) {
  if (design.buttons.style === "outline") {
    return {
      color: design.buttons.textColor,
      border: `1px solid ${design.buttons.textColor}`,
      borderRadius: `${design.buttons.borderRadius}px`,
      backgroundColor: "transparent",
    };
  }
  return {
    color: design.buttons.textColor,
    backgroundColor: design.buttons.backgroundColor,
    borderRadius: `${design.buttons.borderRadius}px`,
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
