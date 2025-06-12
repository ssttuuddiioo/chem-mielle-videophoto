import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useSettings } from '../context/SettingsContext';
import './SettingsPage.css';

const SettingsPage = () => {
  const { settings, setSettings } = useSettings();
  
  // Local state for temporary changes
  const [localSettings, setLocalSettings] = useState(settings);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    setSettings(localSettings);
    // Optional: Add a confirmation message
    alert('Settings saved!');
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  const handleOverlayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({
          ...prev,
          stripOverlay: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderFilteredPreview = useCallback(() => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === 4) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply contrast/brightness and draw the video frame
      ctx.filter = `contrast(${localSettings.contrast}%) brightness(${localSettings.brightness}%)`;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Reset filter before applying grain
      ctx.filter = 'none';

      // Apply grain overlay
      const grainCanvas = document.createElement('canvas');
      const grainCtx = grainCanvas.getContext('2d');
      grainCanvas.width = 100;
      grainCanvas.height = 100;

      if (grainCtx) {
        const imageData = grainCtx.createImageData(100, 100);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const val = Math.random() * 255;
          data[i] = val; data[i+1] = val; data[i+2] = val;
          data[i+3] = localSettings.grain;
        }
        grainCtx.putImageData(imageData, 0, 0);
        
        const grainPattern = ctx.createPattern(grainCanvas, 'repeat');
        if (grainPattern) {
          ctx.fillStyle = grainPattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
    
    // Continue the loop
    animationFrameId.current = requestAnimationFrame(renderFilteredPreview);
  }, [localSettings]);

  useEffect(() => {
    // Start the animation loop when the component mounts
    animationFrameId.current = requestAnimationFrame(renderFilteredPreview);
    
    // Clean up the loop when the component unmounts
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [renderFilteredPreview]);

  return (
    <div className="settings-page">
      {/* Hidden webcam for video source */}
      <Webcam
        ref={webcamRef}
        audio={false}
        style={{ display: 'none' }}
        videoConstraints={{ width: 400, height: 300 }}
      />
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <div className="settings-actions">
            <button className="reset-button" onClick={handleReset}>Reset</button>
            <button className="save-button" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
        <div className="settings-grid">
          {/* Settings Controls */}
          <div className="settings-controls">
            <h2>Photo Filters</h2>
            <div className="setting-item">
              <label>Contrast: {localSettings.contrast}%</label>
              <input type="range" name="contrast" min="100" max="200" value={localSettings.contrast} onChange={handleSettingChange} />
            </div>
            <div className="setting-item">
              <label>Brightness: {localSettings.brightness}%</label>
              <input type="range" name="brightness" min="100" max="150" value={localSettings.brightness} onChange={handleSettingChange} />
            </div>
            <div className="setting-item">
              <label>Grain: {localSettings.grain}</label>
              <input type="range" name="grain" min="0" max="100" value={localSettings.grain} onChange={handleSettingChange} />
            </div>
            
            <h2 className="mt-4">Video</h2>
             <div className="setting-item">
              <label>Recording Duration (sec): {localSettings.maxRecordingDuration}</label>
              <input type="range" name="maxRecordingDuration" min="5" max="60" value={localSettings.maxRecordingDuration} onChange={handleSettingChange} />
            </div>

            <h2 className="mt-4">Photo Sequence</h2>
             <div className="setting-item">
              <label>Number of Photos: {localSettings.photoCount}</label>
              <input type="range" name="photoCount" min="1" max="8" value={localSettings.photoCount} onChange={handleSettingChange} />
            </div>
             <div className="setting-item">
              <label>Countdown (sec): {localSettings.countdownDuration}</label>
              <input type="range" name="countdownDuration" min="1" max="10" value={localSettings.countdownDuration} onChange={handleSettingChange} />
            </div>
            <div className="setting-item">
              <label>Pause Between (ms): {localSettings.pauseBetweenPhotos}</label>
              <input type="range" name="pauseBetweenPhotos" min="500" max="5000" step="100" value={localSettings.pauseBetweenPhotos} onChange={handleSettingChange} />
            </div>

            <h2 className="mt-4">Photo Strip Overlay</h2>
            <div className="setting-item">
              <label>Upload PNG Overlay</label>
              <input type="file" accept="image/png" onChange={handleOverlayUpload} />
              {localSettings.stripOverlay && (
                <div className="overlay-preview">
                  <p>Current Overlay:</p>
                  <img src={localSettings.stripOverlay} alt="Strip Overlay Preview" />
                </div>
              )}
            </div>
          </div>
          
          {/* Live Preview */}
          <div className="preview-container">
            <h2>Live Preview</h2>
            <canvas ref={canvasRef} width="400" height="300"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 