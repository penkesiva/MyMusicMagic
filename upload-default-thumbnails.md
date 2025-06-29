# Upload Default Track Thumbnails

## Instructions

1. **Prepare your images**: Make sure you have 10 music-themed images ready
   - Recommended size: 400x400px or larger (square aspect ratio)
   - Format: JPG or PNG
   - File size: Keep under 2MB each for fast loading

2. **Upload to public folder**: Copy your 10 images to the `public` folder with these exact names:
   ```
   public/default-track-thumbnail-1.jpg
   public/default-track-thumbnail-2.jpg
   public/default-track-thumbnail-3.jpg
   public/default-track-thumbnail-4.jpg
   public/default-track-thumbnail-5.jpg
   public/default-track-thumbnail-6.jpg
   public/default-track-thumbnail-7.jpg
   public/default-track-thumbnail-8.jpg
   public/default-track-thumbnail-9.jpg
   public/default-track-thumbnail-10.jpg
   ```

## File Structure After Upload

```
public/
├── default-track-thumbnail-1.jpg   ← Your first music image
├── default-track-thumbnail-2.jpg   ← Your second music image
├── default-track-thumbnail-3.jpg   ← Your third music image
├── default-track-thumbnail-4.jpg   ← Your fourth music image
├── default-track-thumbnail-5.jpg   ← Your fifth music image
├── default-track-thumbnail-6.jpg   ← Your sixth music image
├── default-track-thumbnail-7.jpg   ← Your seventh music image
├── default-track-thumbnail-8.jpg   ← Your eighth music image
├── default-track-thumbnail-9.jpg   ← Your ninth music image
├── default-track-thumbnail-10.jpg  ← Your tenth music image
├── hero-bg.jpg
└── artist-photo.png
```

## How It Works

- **New tracks**: When users add tracks without uploading a thumbnail, one of the 10 images is randomly selected
- **Existing tracks**: Run the migration script to assign random thumbnails to existing tracks
- **No fallback needed**: All 10 images are required and will be used randomly

## Run Migration (Optional)

If you have existing tracks with empty thumbnails, run:

```bash
node update-existing-tracks-thumbnails.js
```

This will assign random thumbnails to all existing tracks that don't have one. 