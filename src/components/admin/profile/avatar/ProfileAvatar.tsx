
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarDisplay } from './AvatarDisplay';
import { ImageUploadButton } from './ImageUploadButton';
import { useImageUpload } from './useImageUpload';

interface ProfileAvatarProps {
  initialImage?: string | null;
  onAvatarUpdate?: (url: string | null) => Promise<boolean>;
}

export const ProfileAvatar = ({ initialImage, onAvatarUpdate }: ProfileAvatarProps) => {
  const { 
    image, 
    setImage,
    isUploading, 
    handleFileChange, 
    removeImage 
  } = useImageUpload({ onAvatarUpdate });

  // Set initial image when component mounts or when initialImage prop changes
  if (initialImage !== image) {
    setImage(initialImage || null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto de Perfil</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <AvatarDisplay 
          image={image} 
          isUploading={isUploading} 
          onRemove={removeImage}
        />
        
        <div className="flex gap-2">
          <ImageUploadButton 
            onFileSelect={handleFileChange}
            isUploading={isUploading}
          />
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB.
        </p>
      </CardContent>
    </Card>
  );
};
