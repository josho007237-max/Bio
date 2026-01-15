import { useAppConfig } from "@/lib/store";
import { ProfileHeader } from "@/components/promo/ProfileHeader";
import { InstructionBlock } from "@/components/promo/InstructionBlock";
import { DownloadCard } from "@/components/promo/DownloadCard";
import { DiscountCard } from "@/components/promo/DiscountCard";
import { SocialCard } from "@/components/promo/SocialCard";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Link } from "wouter";

export default function PublicView() {
  const { config } = useAppConfig();

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative selection:bg-primary/30">
      
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
          title={config.profile.title}
          subtitle={config.profile.subtitle}
          avatarUrl={config.profile.avatarUrl}
          heroUrl={config.profile.heroUrl}
        />

        {/* Campaign Header (Optional) */}
        {config.campaign?.name && (
           <div className="px-6 text-center mb-6">
              <h2 className="text-xl font-bold text-primary tracking-tight">{config.campaign.name}</h2>
              {config.campaign.shareInstruction && (
                  <p className="text-sm text-muted-foreground mt-1">{config.campaign.shareInstruction}</p>
              )}
           </div>
        )}

        {/* Instructions */}
        <InstructionBlock instructions={config.instructions} />

        {/* Main Content Stack */}
        <main className="px-4 space-y-8 flex-1">
          
          {/* Discounts (Hero Card) */}
          {config.discounts.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold pl-1 text-primary">Exclusive Offers</h2>
              <div className="space-y-4">
                {config.discounts.map((item) => (
                  <DiscountCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Downloads */}
          {config.downloads.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold pl-1 text-primary">Digital Downloads</h2>
              <div className="space-y-3">
                {config.downloads.map((item, index) => (
                  <DownloadCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* Activity Posts */}
          {config.posts.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold pl-1 text-primary">Activities & Sharing</h2>
              <div className="space-y-3">
                {config.posts.map((item, index) => (
                  <SocialCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </section>
          )}

        </main>
        
        {/* Footer */}
        <footer className="mt-12 py-6 text-center text-xs text-muted-foreground">
          <p>© 2025 {config.profile.title}. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
