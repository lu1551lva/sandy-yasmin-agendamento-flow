
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AvatarDisplayProps {
  image: string | null;
  isUploading: boolean;
  onRemove: () => void;
}

export const AvatarDisplay = ({ image, isUploading, onRemove }: AvatarDisplayProps) => {
  return (
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
            onClick={onRemove}
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
  );
};
