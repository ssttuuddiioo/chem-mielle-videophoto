import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useSettings } from '../context/SettingsContext';
import { savePhotoStrip } from '../utils/fileUtils';
import './PhotoStrip.css';

const PHOTO_COUNT = 3; // Taking 3 photos now

const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
  return (
    <div className="progress-indicator">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className={`progress-circle ${index < currentStep ? 'filled' : ''}`}>
          {index + 1}
        </div>
      ))}
    </div>
  );
};

const PhotoStrip = () => {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const { settings } = useSettings();
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [status, setStatus] = useState("Get Ready..."); // Will only be "SMILE!" or countdown
  const [flashWhite, setFlashWhite] = useState(false);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      setFlashWhite(true);
      setTimeout(() => setFlashWhite(false), 200);

      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setPhotos((prevPhotos) => [...prevPhotos, imageSrc]);
      }
    }
  }, [webcamRef]);

  // This effect handles the countdown itself.
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      setStatus(`Get Ready... ${countdown}`);
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (countdown === 0) {
      setStatus("SMILE!");
      setCountdown(null);
      setTimeout(() => {
        capturePhoto();
      }, 500);
    }
  }, [countdown, capturePhoto]);

  // This effect reacts to new photos being added.
  useEffect(() => {
    if (photos.length > 0 && photos.length < PHOTO_COUNT) {
      const timer = setTimeout(() => {
        setCountdown(settings.countdownDuration);
      }, settings.pauseBetweenPhotos);
      return () => clearTimeout(timer);
    } 
    
    if (photos.length === PHOTO_COUNT) {
      setStatus("All done! Here's your strip.");
      setTimeout(() => {
        setShowPreview(true);
      }, 1000);
    }
  }, [photos, settings]);

  // Start the sequence automatically on mount
  useEffect(() => {
    setCountdown(settings.countdownDuration);
  }, [settings.countdownDuration]);

  const handleRetake = () => {
    setPhotos([]);
    setShowPreview(false);
    setShowThankYou(false);
    setCountdown(settings.countdownDuration);
    setStatus("Get Ready...");
  };

  const handlePrint = async () => {
    try {
      await savePhotoStrip(photos, settings);
      setShowPreview(false);
      setShowThankYou(true);
    } catch (error) {
      console.error('Error printing strip:', error);
    }
  };

  if (showThankYou) {
    return (
      <div className="photo-body">
        <div className="thank-you-container">
          <h1 className="thank-you-title">Enjoy your photos!</h1>
          <button onClick={() => navigate('/')} className="photo-button">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="photo-body">
        <div className="strip-preview-container">
          <h1 className="strip-preview-title">Your Photo Strip</h1>
          <canvas 
            ref={canvas => {
              if (canvas) {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                
                const scale = 0.4; // Render preview at 40% of full size
                canvas.width = 600 * scale;
                canvas.height = 1800 * scale;

                ctx.fillStyle = '#f8bbd0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const padding = 30 * scale;
                const photoSectionHeight = ((1800 - 450) / 3) * scale;

                photos.forEach((photoSrc, i) => {
                  const img = new Image();
                  img.onload = () => {
                    const photoY = i * photoSectionHeight + padding;
                    const photoWidth = canvas.width - padding * 2;
                    const photoHeight = photoSectionHeight - padding * 2;
                    
                    ctx.fillStyle = 'white';
                    ctx.fillRect(padding, photoY, photoWidth, photoHeight);

                    ctx.drawImage(img, padding, photoY, photoWidth, photoHeight);
                  };
                  img.src = photoSrc;
                });
              }
            }} 
            className="photo-strip-canvas-preview"
          ></canvas>
          <div className="button-group">
            <button onClick={handleRetake} className="secondary-button">Retake</button>
            <button onClick={handlePrint} className="photo-button">Print Strip</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-body">
      <div className="photo-container">
        <ProgressIndicator currentStep={photos.length} totalSteps={PHOTO_COUNT} />
        <div className="camera-screen">
          <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" className="webcam" />
          {countdown !== null && countdown > 0 && (
            <div className="countdown-overlay">
              <span>{countdown}</span>
            </div>
          )}
          {countdown === 0 && (
             <div className="countdown-overlay">
              <span>{status}</span>
            </div>
          )}
          {flashWhite && <div className="flash-overlay"></div>}
        </div>
      </div>
    </div>
  );
};

export default PhotoStrip; 