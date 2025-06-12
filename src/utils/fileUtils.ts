export const saveVideo = async (blob: Blob, directoryHandle: FileSystemDirectoryHandle | null): Promise<string> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `video-${timestamp}.webm`;
  
  try {
    // Try to save silently with the File System Access API
    if (directoryHandle && typeof directoryHandle.getFileHandle === 'function') {
      const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return fileName;
    }
  } catch (error) {
    console.warn('Could not save silently, falling back to download.', error);
  }
  
  // Fallback to the standard download method
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return fileName;
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
    directoryHandle: FileSystemDirectoryHandle | null;
  }
): Promise<string> => {
  // New layout constants
  const PHOTO_COUNT = 3;
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 1800;
  const PADDING = 30;
  const FOOTER_HEIGHT = 450;
  const PHOTO_SECTION_HEIGHT = (CANVAS_HEIGHT - FOOTER_HEIGHT) / PHOTO_COUNT;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Fill canvas with the light pink background from the reference
    ctx.fillStyle = '#f8bbd0';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let i = 0; i < photoUrls.length; i++) {
      // Draw the white background for each photo
      const photoY = i * PHOTO_SECTION_HEIGHT + PADDING;
      const photoWidth = CANVAS_WIDTH - PADDING * 2;
      const photoHeight = PHOTO_SECTION_HEIGHT - PADDING * 2;
      ctx.fillStyle = 'white';
      ctx.fillRect(PADDING, photoY, photoWidth, photoHeight);
      
      // Draw the actual photo with filters
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = photoUrls[i];
      });
      
      ctx.filter = `contrast(${settings.contrast}%) brightness(${settings.brightness}%)`;
      ctx.drawImage(img, PADDING, photoY, photoWidth, photoHeight);
      
      // Apply grain overlay
      ctx.filter = 'none';
      const grainCanvas = createGrainCanvas(photoWidth, photoHeight);
      const grainPattern = ctx.createPattern(grainCanvas, 'repeat');
      if (grainPattern) {
        const grainData = grainCanvas.getContext('2d')?.getImageData(0,0,photoWidth, photoHeight).data;
        if(grainData){
            for (let j = 0; j < grainData.length; j += 4) {
                grainData[j+3] = settings.grain;
            }
            grainCanvas.getContext('2d')?.putImageData(grainCanvas.getContext('2d')!.getImageData(0,0,photoWidth, photoHeight),0,0);
        }
        ctx.fillStyle = grainPattern;
        ctx.fillRect(PADDING, photoY, photoWidth, photoHeight);
      }
    }
    
    // Draw the main overlay on top of everything
    if (settings.stripOverlay) {
      const overlayImg = new Image();
      await new Promise<void>((resolve, reject) => {
        overlayImg.onload = () => resolve();
        overlayImg.onerror = reject;
        overlayImg.src = settings.stripOverlay!;
      });
      ctx.drawImage(overlayImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `photo-strip-${timestamp}.png`;
    
    try {
      // Try to save silently with the File System Access API
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Canvas to Blob conversion failed');

      if (settings.directoryHandle && typeof settings.directoryHandle.getFileHandle === 'function') {
        const fileHandle = await settings.directoryHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return fileName;
      }
    } catch (error) {
      console.warn('Could not save silently, falling back to download.', error);
    }
    
    // Fallback to the standard download method
    const dataUrl = canvas.toDataURL('image/png');
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