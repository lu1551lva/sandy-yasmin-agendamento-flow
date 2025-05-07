
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BannerUploaderProps {
  currentBanner: string;
  onBannerChange: (url: string) => void;
}

const BannerUploader = ({ currentBanner, onBannerChange }: BannerUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.includes('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter menos de 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    // Convert to base64 for storage
    // In a production app, you'd upload this to a storage service
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onBannerChange(base64String);
      setIsUploading(false);
      toast({
        title: "Banner carregado",
        description: "A imagem foi adicionada com sucesso."
      });
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Erro ao carregar imagem",
        description: "Ocorreu um erro ao processar a imagem.",
        variant: "destructive"
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleRemoveBanner = () => {
    onBannerChange("");
    toast({
      title: "Banner removido",
      description: "O banner foi removido."
    });
  };
  
  return (
    <div className="space-y-3">
      <div className="border rounded-md h-32 flex items-center justify-center overflow-hidden bg-muted">
        {currentBanner ? (
          <img 
            src={currentBanner} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm text-muted-foreground">
            Sem banner
          </span>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById("banner-upload")?.click()}
        >
          <Upload className="h-4 w-4 mr-1" />
          {isUploading ? "Carregando..." : "Upload"}
        </Button>
        
        {currentBanner && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleRemoveBanner}
          >
            <Trash className="h-4 w-4 mr-1" />
            Remover
          </Button>
        )}
      </div>
      
      <input
        id="banner-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
};

export default BannerUploader;
