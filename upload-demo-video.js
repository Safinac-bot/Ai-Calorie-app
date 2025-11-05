import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

const supabase = createClient(
  'https://myoaokgsjxrqfhpbnoir.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15b2Fva2dzanhycWZocGJub2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1MTMzOTEsImV4cCI6MjA0NjA4OTM5MX0.zXO7Pn8Lkow6kx0o-7cXq3z3M_t-wGwqXSb7xmpUfV0'
);

const videoPath = process.argv[2];

if (!videoPath) {
  console.error('Usage: node upload-demo-video.js <path-to-video-file>');
  process.exit(1);
}

async function uploadVideo() {
  try {
    console.log('Reading video file...');
    const videoBuffer = readFileSync(videoPath);

    console.log('Uploading to Supabase...');
    const { data, error } = await supabase.storage
      .from('demo-videos')
      .upload('demo-video.mp4', videoBuffer, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('demo-videos')
      .getPublicUrl('demo-video.mp4');

    console.log('\n✅ Video uploaded successfully!');
    console.log('\nPublic URL:', publicUrl);
    console.log('\nNow updating Landing.tsx...');

    const landingPath = './src/pages/Landing.tsx';
    let landing = readFileSync(landingPath, 'utf8');

    const regex = /src="[^"]*demo-video[^"]*\.mp4"/;
    landing = landing.replace(regex, `src="${publicUrl}"`);

    writeFileSync(landingPath, landing);
    console.log('✅ Landing.tsx updated!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

uploadVideo();
