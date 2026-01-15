import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface InstructionBlockProps {
  instructions: string[];
}

export function InstructionBlock({ instructions }: InstructionBlockProps) {
  if (!instructions.length) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-md mx-auto mb-8 px-4"
    >
      <div className="bg-secondary/30 backdrop-blur-sm rounded-xl p-4 border border-white/5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
          How it works
        </h3>
        <div className="flex flex-col space-y-3">
          {instructions.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
              <p className="text-sm text-foreground/90">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
