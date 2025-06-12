export const saveVideo = async (blob: Blob): Promise<string> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `video-${timestamp}.mp4`;
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return fileName;
  } catch (error) {
    console.error('Error saving video:', error);
    throw error;
  }
};

export const savePhoto = async (dataUrl: string, index: number): Promise<string> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `photo-${timestamp}-${index + 1}.jpg`;
    
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return fileName;
  } catch (error) {
    console.error('Error saving photo:', error);
    throw error;
  }
};

/**
 * Creates a canvas with a monochrome noise pattern.
 * @param width - The width of the grain canvas.
 * @param height - The height of the grain canvas.
 * @returns An HTMLCanvasElement with the noise pattern.
 */
const createGrainCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 60; // Alpha for grain intensity
    }
    ctx.putImageData(imageData, 0, 0);
  }
  
  return canvas;
};

export const savePhotoStrip = async (
  photoUrls: string[],
  settings: {
    contrast: number;
    brightness: number;
    grain: number;
    stripOverlay: string | null;
  }
): Promise<string> => {
  const STRIP_WIDTH = 400;
  const PHOTO_HEIGHT = 300; // Assuming 4:3 aspect ratio for a 400px width
  const STRIP_HEIGHT = PHOTO_HEIGHT * 4;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = STRIP_WIDTH;
    canvas.height = STRIP_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Create a grain pattern to be used later
    const grainCanvas = createGrainCanvas(100, 100);
    const grainPattern = ctx.createPattern(grainCanvas, 'repeat');

    // Fill canvas with a white background first
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);

    for (let i = 0; i < photoUrls.length; i++) {
      const img = new Image();
      // Wait for each image to load before drawing
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = photoUrls[i];
      });
      
      const yPos = i * PHOTO_HEIGHT;
      
      // Apply 90s filters from settings
      ctx.filter = `contrast(${settings.contrast}%) brightness(${settings.brightness}%)`;
      ctx.drawImage(img, 0, yPos, STRIP_WIDTH, PHOTO_HEIGHT);
      
      // Reset filters before applying grain
      ctx.filter = 'none';

      // Apply grain overlay
      if (grainPattern) {
        // Create a separate canvas for the grain pattern with the correct alpha
        const grainCanvasWithAlpha = createGrainCanvas(100, 100);
        const grainCtx = grainCanvasWithAlpha.getContext('2d');
        if (grainCtx) {
            const imageData = grainCtx.getImageData(0, 0, 100, 100);
            const data = imageData.data;
            for (let j = 0; j < data.length; j += 4) {
                data[j+3] = settings.grain; // Apply grain intensity from settings
            }
            grainCtx.putImageData(imageData, 0, 0);
            const finalGrainPattern = ctx.createPattern(grainCanvasWithAlpha, 'repeat');
            if (finalGrainPattern) {
              ctx.fillStyle = finalGrainPattern;
              ctx.fillRect(0, yPos, STRIP_WIDTH, PHOTO_HEIGHT);
            }
        }
      }
    }
    
    // Draw the overlay on top of everything
    if (settings.stripOverlay) {
      const overlayImg = new Image();
      await new Promise((resolve, reject) => {
        overlayImg.onload = resolve;
        overlayImg.onerror = reject;
        overlayImg.src = settings.stripOverlay!;
      });
      ctx.drawImage(overlayImg, 0, 0, STRIP_WIDTH, STRIP_HEIGHT);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `photo-strip-${timestamp}.png`;
    const dataUrl = canvas.toDataURL('image/png');

    // Convert data URL to blob and trigger download
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return fileName;

  } catch (error) {
    console.error('Error creating or saving photo strip:', error);
    throw error;
  }
}; 