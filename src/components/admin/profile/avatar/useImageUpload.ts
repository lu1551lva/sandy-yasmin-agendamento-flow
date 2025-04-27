
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface UseImageUploadProps {
  onAvatarUpdate?: (url: string | null) => Promise<boolean>;
}

export const useImageUpload = ({ onAvatarUpdate }: UseImageUploadProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024;
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
      e.target.value = '';
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

  return {
    image,
    setImage,
    isUploading,
    handleFileChange,
    removeImage
  };
};
