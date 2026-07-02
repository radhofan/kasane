import { processImage } from '../src/processors/image.processor';
import * as sharp from 'sharp';

describe('Image Processor', () => {
  // Helper to generate a test image buffer in-memory using sharp
  const createTestImageBuffer = async (width: number, height: number): Promise<Buffer> => {
    return sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 10, g: 20, b: 30, alpha: 255 },
      },
    })
      .png()
      .toBuffer();
  };

  it('should resize an image to fit inside 1280x1280, maintaining aspect ratio (portrait)', async () => {
    // 1000x2000 (portrait: longest side is height, 2000px)
    // Target height should scale down to exactly 1280px
    // Target width should scale proportionally to: 1000 * (1280 / 2000) = 640px
    const inputBuffer = await createTestImageBuffer(1000, 2000);
    const result = await processImage(inputBuffer);

    expect(result).toBeDefined();
    expect(result.format).toBe('webp');
    expect(result.height).toBe(1280);
    expect(result.width).toBe(640);
  });

  it('should resize an image to fit inside 1280x1280, maintaining aspect ratio (landscape)', async () => {
    // 2000x1000 (landscape: longest side is width, 2000px)
    // Target width should scale down to exactly 1280px
    // Target height should scale proportionally to: 1000 * (1280 / 2000) = 640px
    const inputBuffer = await createTestImageBuffer(2000, 1000);
    const result = await processImage(inputBuffer);

    expect(result).toBeDefined();
    expect(result.format).toBe('webp');
    expect(result.width).toBe(1280);
    expect(result.height).toBe(640);
  });

  it('should process a square image to exactly 1280x1280', async () => {
    // 500x500 (square: both sides are equal)
    // Target dimensions should become exactly 1280x1280 since withoutEnlargement is false
    const inputBuffer = await createTestImageBuffer(500, 500);
    const result = await processImage(inputBuffer);

    expect(result).toBeDefined();
    expect(result.format).toBe('webp');
    expect(result.width).toBe(1280);
    expect(result.height).toBe(1280);
  });

  it('should throw an error for malformed image buffers', async () => {
    const badBuffer = Buffer.from('invalid-file-data');
    await expect(processImage(badBuffer)).rejects.toThrow();
  });
});
