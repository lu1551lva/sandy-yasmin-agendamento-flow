
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

interface ImageUploadButtonProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export const ImageUploadButton = ({ onFileSelect, isUploading }: ImageUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
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
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png"
        onChange={onFileSelect}
      />
    </>
  );
};
