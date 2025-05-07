
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LogoUploaderProps {
  currentLogo: string;
  onLogoChange: (url: string) => void;
}

const LogoUploader = ({ currentLogo, onLogoChange }: LogoUploaderProps) => {
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
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter menos de 2MB.",
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
      onLogoChange(base64String);
      setIsUploading(false);
      toast({
        title: "Logo carregado",
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
  
  const handleRemoveLogo = () => {
    onLogoChange("");
    toast({
      title: "Logo removido",
      description: "O logo foi removido."
    });
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="border rounded-md h-20 w-20 flex items-center justify-center overflow-hidden bg-muted">
          {currentLogo ? (
            <img 
              src={currentLogo} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-xs text-muted-foreground">
              Sem logo
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              disabled={isUploading}
              onClick={() => document.getElementById("logo-upload")?.click()}
            >
              <Upload className="h-4 w-4 mr-1" />
              {isUploading ? "Carregando..." : "Upload"}
            </Button>
            
            {currentLogo && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleRemoveLogo}
              >
                <Trash className="h-4 w-4 mr-1" />
                Remover
              </Button>
            )}
          </div>
        </div>
      </div>
      <input
        id="logo-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
};

export default LogoUploader;
