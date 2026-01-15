import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DiscountItem } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface DiscountCardProps {
  item: DiscountItem;
}

export function DiscountCard({ item }: DiscountCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(item.code);
    setCopied(true);
    toast({
      title: "Code copied!",
      description: "Ready to paste at checkout.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="overflow-hidden glass-card border-0 ring-1 ring-white/10">
        {item.imageUrl && (
          <div className="h-32 w-full overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-90 z-10" />
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}
        
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>

          <div className="flex items-stretch gap-2">
            <div 
              className="flex-1 bg-secondary/50 border border-white/5 rounded-lg flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-secondary/70 transition-colors group"
              onClick={handleCopy}
            >
              <code className="font-mono font-bold text-primary text-lg tracking-wider">{item.code}</code>
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </div>
          </div>

          <Button className="w-full font-semibold h-11 text-base bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <a href={item.ctaUrl} target="_blank" rel="noopener noreferrer">
              {item.ctaLabel} <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
