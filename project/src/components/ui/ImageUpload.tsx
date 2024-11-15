import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  defaultImage?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelect,
  defaultImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer overflow-hidden"
    >
      {preview || defaultImage ? (
        <img 
          src={preview || defaultImage}
          alt="Recipe preview" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera size={48} className="text-gray-400" />
        </div>
      )}
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
        <Camera size={24} className="text-white opacity-0 hover:opacity-100 transition-opacity" />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};