# Upload Demo Video Instructions

## Steps to Add Your Demo Video

### 1. Download Your Video from Google Drive
- Go to: https://drive.google.com/file/d/1xK24OSR7eqylOYXZTiYXzL2cWkzFbm5T/view
- Download the video file to your computer

### 2. Upload to Supabase Storage
1. Log into your Supabase dashboard
2. Go to **Storage** in the left sidebar
3. Click on the **demo-videos** bucket
4. Click **Upload file**
5. Select your downloaded video file
6. Name it something simple like `firehouse-demo.mp4`

### 3. Get the Public URL
After uploading, click on the video file and copy the public URL.
It will look something like:
```
https://[project-id].supabase.co/storage/v1/object/public/demo-videos/firehouse-demo.mp4
```

### 4. Update the Landing Page
Open `/src/pages/Landing.tsx` and find line 511 where it says:
```jsx
<source src="YOUR_VIDEO_URL_HERE.mp4" type="video/mp4" />
```

Replace `YOUR_VIDEO_URL_HERE.mp4` with your full Supabase Storage URL.

### 5. Done!
Now when users click "Watch Demo" on any device (web, iPhone, Android), the video will play inline in a modal without leaving your app.

## Why This Works for Mobile Apps
- The video plays natively using the HTML5 `<video>` tag
- The `playsInline` attribute ensures it stays in your app (doesn't go fullscreen)
- Works on iOS Safari, Android Chrome, and all modern browsers
- No redirects, no external links, perfect user experience
