import { motion } from "framer-motion";
import { ExternalLink, Twitter, Facebook, Youtube, Instagram, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SocialItem } from "@/lib/store";

interface SocialCardProps {
  item: SocialItem;
  index: number;
}

const getIcon = (platform: string) => {
  switch (platform) {
    case 'twitter': return <Twitter className="w-5 h-5 text-sky-500" />;
    case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
    case 'youtube': return <Youtube className="w-5 h-5 text-red-600" />;
    case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
    default: return <Link2 className="w-5 h-5 text-foreground" />;
  }
};

const getLabel = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'View on X';
      case 'facebook': return 'View on Facebook';
      case 'youtube': return 'Watch on YouTube';
      case 'instagram': return 'View on Instagram';
      default: return 'Open Link';
    }
  };

export function SocialCard({ item, index }: SocialCardProps) {
  // Simulating embedded preview with simple card for now as requested fallback
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + (index * 0.1) }}
    >
      <a 
        href={item.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <Card className="glass-card hover:bg-white/5 transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-secondary rounded-full p-2">
                {getIcon(item.platform)}
              </div>
              <span className="font-medium text-foreground">
                {item.label || getLabel(item.platform)}
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-50" />
          </CardContent>
        </Card>
      </a>
    </motion.div>
  );
}
