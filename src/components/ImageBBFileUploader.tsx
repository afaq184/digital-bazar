import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, Loader2 } from 'lucide-react';

interface ImageBBFileUploaderProps {
  imageUrl: string;
  onImageUploaded: (url: string) => void;
}

export const ImageBBFileUploader: React.FC<ImageBBFileUploaderProps> = ({
  imageUrl,
  onImageUploaded
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [customKey, setCustomKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadStatus('Uploading image to ImgBB...');

    try {
      const apiKey = customKey.trim() || '6d25705a263860522c00f7654523e215'; // Public key or standard fallback
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data && data.data && data.data.url) {
        onImageUploaded(data.data.url);
        setUploadStatus('Successfully uploaded to ImgBB!');
      } else {
        // Fallback to Data URL if ImgBB API key fails
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          onImageUploaded(result);
          setUploadStatus('Loaded as Local Image Data');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      // FileReader fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onImageUploaded(result);
        setUploadStatus('Loaded local image preview');
      };
      reader.readAsDataURL(file);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-neutral-300">
          Product Image (ImgBB Uploader) *
        </label>
        <button
          type="button"
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="text-[10px] text-[#C5A059] hover:underline"
        >
          {showKeyInput ? 'Hide ImgBB Key' : 'Custom ImgBB Key?'}
        </button>
      </div>

      {showKeyInput && (
        <div className="p-2 rounded bg-[#0A0A0A] border border-white/10 space-y-1">
          <span className="text-[10px] text-neutral-400">Optional ImgBB API Key:</span>
          <input
            type="text"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder="e.g. 6d25705a263860522c00f7654523e21..."
            className="w-full p-1.5 rounded bg-[#151515] border border-white/10 text-xs text-white"
          />
        </div>
      )}

      {/* Upload Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-white/10 hover:border-[#C5A059]/50 rounded-lg bg-[#0A0A0A] cursor-pointer transition-colors group">
          {loading ? (
            <div className="flex items-center gap-2 text-[#C5A059] py-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading to ImgBB...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-center py-1">
              <Upload className="w-5 h-5 text-[#C5A059] group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-white">Click to Upload Image</span>
              <span className="text-[10px] text-neutral-400">Auto-uploads to ImgBB Cloud</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
        </label>

        {/* URL Input */}
        <div>
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => onImageUploaded(e.target.value)}
              placeholder="https://i.ibb.co/..."
              className="w-full pl-8 pr-2 py-2 rounded bg-[#0A0A0A] border border-white/10 text-white text-xs focus:outline-none focus:border-[#C5A059]"
            />
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">Direct ImgBB or Image Link</p>
        </div>
      </div>

      {uploadStatus && (
        <p className="text-[11px] text-[#C5A059] font-medium flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> {uploadStatus}
        </p>
      )}

      {/* Image Preview */}
      {imageUrl && (
        <div className="flex items-center gap-3 p-2 rounded bg-[#0A0A0A] border border-white/10">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-12 h-12 object-cover rounded border border-white/10"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop';
            }}
          />
          <div className="flex-1 overflow-hidden text-[11px]">
            <p className="text-white font-semibold truncate">{imageUrl}</p>
            <p className="text-[#C5A059]">Active Product Image URL</p>
          </div>
        </div>
      )}
    </div>
  );
};
