
import { useState, useRef } from 'react';
import { User, Upload, X } from 'lucide-react';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione uma imagem válida.',
        variant: 'destructive',
      });
      return;
    }

    // Simulate upload process
    setIsUploading(true);
    
    // Create a local preview
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setIsUploading(false);
      
      toast({
        title: 'Foto atualizada',
        description: 'Sua foto de perfil foi atualizada com sucesso.',
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
      title: 'Foto removida',
      description: 'Sua foto de perfil foi removida.',
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
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Enviando...' : 'Alterar foto'}
          </Button>
        </div>
        
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        <p className="text-xs text-muted-foreground text-center">
          Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB.
        </p>
      </CardContent>
    </Card>
  );
};
