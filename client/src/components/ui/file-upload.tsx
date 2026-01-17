import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, File as FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  type?: "image" | "file";
  label?: string;
  adminPassword?: string;
  uploadUrl?: string;
}

export function FileUploader({
  value,
  onChange,
  accept = "image/*",
  type = "image",
  label = "Upload File",
  adminPassword,
  uploadUrl = "/api/upload",
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!adminPassword) {
      toast({
        title: "Missing password",
        description: "Please enter the admin password before uploading.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "x-admin-password": adminPassword,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = (await response.json()) as { url?: string };
      if (!result.url) {
        throw new Error("Upload failed: missing url");
      }
      onChange(result.url);
      toast({
        title: "File Uploaded",
        description: "File successfully attached.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Could not upload file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={type === "image" ? "https://example.com/image.jpg" : "https://example.com/file.pdf"}
          className="flex-1 font-mono text-xs"
        />
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept={accept} 
          onChange={handleFileChange} 
        />
        
        {value ? (
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
        </div>
      )}

      {value && type === "file" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <FileIcon className="w-3 h-3" /> File attached
        </div>
      )}
    </div>
  );
}
