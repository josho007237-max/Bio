import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadItem } from "@/lib/store";

interface DownloadCardProps {
  item: DownloadItem;
  index: number;
}

export function DownloadCard({ item, index }: DownloadCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index + 0.3 }}
    >
      <Card className="overflow-hidden glass-card border-l-4 border-l-primary/50 hover:border-l-primary transition-all duration-300 group">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-secondary p-3 rounded-lg group-hover:bg-primary/10 transition-colors">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
          </div>
          
          <Button size="icon" variant="ghost" className="shrink-0 text-primary hover:text-primary hover:bg-primary/20" asChild>
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" download>
              <Download className="w-5 h-5" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
