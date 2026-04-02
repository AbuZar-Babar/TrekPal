import { useRef, useState } from 'react';

interface ImageGalleryInputProps {
  images: string[];
  onChange: (images: string[]) => void;
  uploadImage: (file: File) => Promise<string>;
  title?: string;
}

const ImageGalleryInput = ({
  images,
  onChange,
  uploadImage,
  title = 'Images',
}: ImageGalleryInputProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addImage = (url: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || images.includes(trimmedUrl)) {
      return;
    }

    onChange([...images, trimmedUrl]);
  };

  const handleAddUrl = () => {
    setError(null);
    addImage(imageUrl);
    setImageUrl('');
  };

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedUrl = await uploadImage(file);
      addImage(uploadedUrl);
    } catch (uploadError: any) {
      setError(uploadError.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <div className="app-card px-6 py-6">
      <div className="app-section-label">{title}</div>
      <div className="mt-5 space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1fr,auto]">
          <input
            type="url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className="app-field"
            placeholder="Paste an image URL"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAddUrl();
              }
            }}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleAddUrl} className="app-btn-secondary h-11 px-5 text-sm">
              Add URL
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="app-btn-primary h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : 'Upload file'}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleUploadFile}
        />

        <p className="text-xs text-[var(--text-soft)]">Use a direct URL or upload `JPG`, `PNG`, or `WebP`.</p>

        {error && (
          <div className="rounded-[18px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
            {error}
          </div>
        )}

        {images.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--panel-subtle)]"
              >
                <img src={image} alt="" className="h-36 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 text-white"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGalleryInput;
