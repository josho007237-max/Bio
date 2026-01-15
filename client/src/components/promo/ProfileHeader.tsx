import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import defaultHero from "@assets/generated_images/abstract_premium_dark_gold_wave_background.png";

interface ProfileHeaderProps {
  title: string;
  subtitle: string;
  avatarUrl: string;
  heroUrl?: string;
}

export function ProfileHeader({ title, subtitle, avatarUrl, heroUrl }: ProfileHeaderProps) {
  const activeHero = heroUrl || defaultHero;

  return (
    <div className="relative w-full flex flex-col items-center pt-12 pb-6 px-4">
      {/* Background Hero */}
      <div className="absolute inset-0 z-0 overflow-hidden h-64 mask-gradient-b">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
         <img 
            src={activeHero} 
            alt="Background" 
            className="w-full h-full object-cover opacity-60"
         />
      </div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 flex flex-col items-center text-center space-y-4"
      >
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-yellow-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <Avatar className="w-24 h-24 border-4 border-background relative">
            <AvatarImage src={avatarUrl} alt={title} className="object-cover" />
            <AvatarFallback>{title.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground drop-shadow-lg">{title}</h1>
          <p className="text-muted-foreground font-medium">{subtitle}</p>
        </div>
      </motion.div>
    </div>
  );
}
