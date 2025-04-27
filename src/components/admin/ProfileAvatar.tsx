
import { useState, useRef } from 'react';
import { User, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ProfileAvatarProps {
  initialImage?: string | null;
}

export const ProfileAvatar = ({ initialImage }: ProfileAvatarProps) => {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive",
      });
      return false;
    }

    // Check file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem JPG ou PNG.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    
    // Create a local preview
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setIsUploading(false);
      
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso! 🎉",
      });
    };
    
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Foto removida",
      description: "Sua foto de perfil foi removida com sucesso.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto de Perfil</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative">
          {image ? (
            <div className="relative">
              <img 
                src={image} 
                alt="Foto de perfil" 
                className="w-32 h-32 rounded-full object-cover border-2 border-primary"
              />
              <Button 
                size="icon" 
                variant="destructive" 
                className="absolute -top-2 -right-2 rounded-full h-8 w-8"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
              <User className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Alterar foto
              </>
            )}
          </Button>
        </div>
        
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
        />
        
        <p className="text-xs text-muted-foreground text-center">
          Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB.
        </p>
      </CardContent>
    </Card>
  );
};
