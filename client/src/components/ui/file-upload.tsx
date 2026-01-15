import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Check, File as FileIcon, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  value: string;
  onChange: (url: string, isUploaded?: boolean) => void;
  accept?: string;
  type?: "image" | "file";
  label?: string;
}

export function FileUploader({ value, onChange, accept = "image/*", type = "image", label = "Upload File" }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size limit check (mockup constraint for localStorage)
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "File too large",
        description: "For this mockup version, please keep files under 2MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result, true); // true = isUploaded
        toast({
          title: "File Uploaded",
          description: "File successfully attached.",
        });
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: "Could not read file.",
        variant: "destructive"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onChange("", false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isDataUrl = value?.startsWith("data:");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value, false)} 
          placeholder={type === "image" ? "https://example.com/image.jpg" : "https://example.com/file.pdf"}
          className="flex-1 font-mono text-xs"
          readOnly={isDataUrl} // If it's a data URL, don't let them edit the string directly
        />
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept={accept} 
          onChange={handleFileChange} 
        />
        
        {value && isDataUrl ? (
           <Button type="button" variant="destructive" size="icon" onClick={handleClear} title="Remove File">
             <X className="w-4 h-4" />
           </Button>
        ) : (
           <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            title={label}
          >
             <Upload className="w-4 h-4" />
          </Button>
        )}
      </div>

      {value && type === "image" && (
        <div className="relative w-full h-32 bg-secondary/30 rounded-md overflow-hidden border border-white/10 mt-1 group">
           <img src={value} alt="Preview" className="w-full h-full object-cover" />
           {isDataUrl && (
             <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
               <Check className="w-3 h-3" /> Uploaded
             </div>
           )}
        </div>
      )}

      {value && type === "file" && isDataUrl && (
        <div className="flex items-center gap-2 text-xs text-green-400 mt-1">
          <Check className="w-3 h-3" /> Ready for download (Data URI)
        </div>
      )}
    </div>
  );
}
