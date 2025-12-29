// Simple client-side image compression using canvas
// This is a lightweight helper, not a perfect optimizer but good for portfolio/demo.
export async function compressImage(file: File, quality = 0.7, maxWidth = 1280): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxWidth / imageBitmap.width);
  const width = imageBitmap.width * ratio;
  const height = imageBitmap.height * ratio;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  return await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob || file);
      },
      'image/jpeg',
      quality
    );
  });
}
