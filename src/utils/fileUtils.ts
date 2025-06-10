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

export const savePhotoStrip = async (photoUrls: string[]): Promise<string> => {
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
      ctx.drawImage(img, 0, yPos, STRIP_WIDTH, PHOTO_HEIGHT);
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