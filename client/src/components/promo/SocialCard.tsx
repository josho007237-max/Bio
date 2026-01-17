import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Twitter, Facebook, Youtube, Link2, Share2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityItem } from "@/lib/store";

interface SocialCardProps {
  item: ActivityItem;
  index: number;
  buttonStyle?: CSSProperties;
}

const getIcon = (platform: string) => {
  switch (platform) {
    case "x": return <Twitter className="w-5 h-5 text-sky-500" />;
    case "facebook": return <Facebook className="w-5 h-5 text-blue-600" />;
    case "youtube": return <Youtube className="w-5 h-5 text-red-600" />;
    case "tiktok": return <Video className="w-5 h-5 text-pink-500" />;
    case "web": return <Link2 className="w-5 h-5 text-foreground" />;
    default: return <Share2 className="w-5 h-5 text-foreground" />;
  }
};

const getLabel = (platform: string) => {
    switch (platform) {
      case "x": return "View on X";
      case "facebook": return "View on Facebook";
      case "youtube": return "Watch on YouTube";
      case "tiktok": return "View on TikTok";
      default: return "Open Link";
    }
  };

export function SocialCard({ item, index, buttonStyle }: SocialCardProps) {
  // Simple check for YouTube video ID to embed
  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const youtubeEmbed = item.platform === "youtube" ? getYoutubeEmbedUrl(item.url) : null;

  if (youtubeEmbed) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + (index * 0.1) }}
        >
            <Card className="glass-card overflow-hidden">
                <div className="aspect-video w-full bg-black">
                     <iframe 
                        width="100%" 
                        height="100%" 
                        src={youtubeEmbed} 
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="border-0"
                    ></iframe>
                </div>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                     <div className="min-w-0">
                         <div className="font-medium text-foreground truncate">{item.label || "Watch Video"}</div>
                         {item.instruction && <div className="text-xs text-muted-foreground">{item.instruction}</div>}
                     </div>
                     <Button size="sm" variant="outline" style={buttonStyle} asChild>
                         <a href={item.url} target="_blank" rel="noopener noreferrer">Open App</a>
                     </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
  }

  // Standard Link Card for others
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
        className="block group"
      >
        <Card className="glass-card group-hover:bg-white/5 transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-secondary rounded-full p-2 shrink-0">
                {getIcon(item.platform)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground truncate">
                    {item.label || getLabel(item.platform)}
                </div>
                {item.instruction && (
                    <div className="text-xs text-muted-foreground truncate">{item.instruction}</div>
                )}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-50 shrink-0" />
          </CardContent>
        </Card>
      </a>
    </motion.div>
  );
}
