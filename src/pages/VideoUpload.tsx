import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

export const VideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError('');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a video file to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `demo-video.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('demo-videos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('demo-videos')
        .getPublicUrl(fileName);

      setVideoUrl(publicUrl);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Demo Video</h1>
          <p className="text-gray-600">Upload your demo video to use on the landing page</p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-600 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <label htmlFor="video-upload" className="cursor-pointer">
            <Button disabled={uploading} asChild>
              <span>
                {uploading ? 'Uploading...' : 'Select Video File'}
              </span>
            </Button>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">MP4, MOV, or WebM</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {videoUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 mb-2">Video Uploaded Successfully!</p>
                <div className="bg-white rounded border border-green-200 p-3">
                  <p className="text-xs font-mono text-gray-600 mb-1">Copy this URL:</p>
                  <p className="text-sm font-mono text-gray-900 break-all">{videoUrl}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-green-200 pt-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Next Steps:</p>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Copy the URL above</li>
                <li>Open <code className="bg-gray-100 px-1 rounded">src/pages/Landing.tsx</code></li>
                <li>Find line 511 with <code className="bg-gray-100 px-1 rounded">YOUR_VIDEO_URL_HERE.mp4</code></li>
                <li>Replace it with the URL you copied</li>
              </ol>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={videoUrl}
                controls
                playsInline
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
