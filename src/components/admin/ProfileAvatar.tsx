
import { useState, useRef } from 'react';
import { User, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ProfileAvatarProps {
  initialImage?: string | null;
  onAvatarUpdate?: (url: string | null) => Promise<boolean>;
}

export const ProfileAvatar = ({ initialImage, onAvatarUpdate }: ProfileAvatarProps) => {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive",
      });
      return false;
    }

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    
    try {
      const fileName = `avatar-${Date.now()}.${file.name.split('.').pop()}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (storageError) throw storageError;
      
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const imageUrl = publicUrlData?.publicUrl || null;
      
      setImage(imageUrl);
      
      if (onAvatarUpdate && imageUrl) {
        const success = await onAvatarUpdate(imageUrl);
        
        if (success) {
          toast({
            title: "Foto atualizada",
            description: "Sua foto de perfil foi atualizada com sucesso! 🎉",
          });
        } else {
          toast({
            title: "Erro ao salvar foto",
            description: "Não foi possível salvar a foto de perfil no servidor.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro ao enviar imagem",
        description: error?.message || "Ocorreu um erro ao enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
    setIsUploading(true);
    
    try {
      if (onAvatarUpdate) {
        const success = await onAvatarUpdate(null);
        
        if (success) {
          setImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          toast({
            title: "Foto removida",
            description: "Sua foto de perfil foi removida com sucesso.",
          });
        } else {
          toast({
            title: "Erro ao remover foto",
            description: "Não foi possível remover a foto de perfil do servidor.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Error removing image:", error);
      toast({
        title: "Erro ao remover imagem",
        description: error?.message || "Ocorreu um erro ao remover a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
                disabled={isUploading}
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
            onClick={() => fileInputRef.current?.click()}
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
