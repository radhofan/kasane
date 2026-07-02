import * as sharp from 'sharp';

export interface ImageProcessingResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}

export async function processImage(inputBuffer: Buffer): Promise<ImageProcessingResult> {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image dimensions');
  }

  // Determine aspect ratio and target sizes
  // sharp's fit: 'inside' ensures that the image is resized to fit within 1280x1280,
  // making the longest edge exactly 1280px while maintaining the original aspect ratio.
  const processed = image
    .resize(1280, 1280, {
      fit: 'inside',
      withoutEnlargement: false, // Ensures longest edge becomes exactly 1280px even if smaller
    })
    .webp({
      quality: 80,
    });

  const buffer = await processed.toBuffer();
  const processedMetadata = await sharp(buffer).metadata();

  return {
    buffer,
    width: processedMetadata.width || 0,
    height: processedMetadata.height || 0,
    format: 'webp',
  };
}
