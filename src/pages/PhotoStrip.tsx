import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useSettings } from '../context/SettingsContext';
import { savePhotoStrip } from '../utils/fileUtils';
import './PhotoStrip.css';

const PhotoStrip = () => {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const { settings } = useSettings(); // Use settings from context
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null); // Use null for inactive
  const [showPreview, setShowPreview] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [status, setStatus] = useState("Get Ready to Pose!");
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

  const startPhotoSequence = useCallback(() => {
    if (isTakingPhoto) return;
    
    setPhotos([]);
    setShowPreview(false);
    setIsTakingPhoto(true);
    setStatus("Get Ready...");
    setCountdown(settings.countdownDuration); // Use setting
  }, [isTakingPhoto, settings.countdownDuration]);

  // This effect handles the countdown itself. It does NOT depend on photos.length.
  useEffect(() => {
    if (countdown === null || !isTakingPhoto) {
      return;
    }

    if (countdown > 0) {
      setStatus(`Get Ready... ${countdown}`);
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (countdown === 0) {
      setStatus("SMILE!");
      // Deactivate countdown to prevent re-triggering before capturing
      setCountdown(null);
      setTimeout(() => {
        capturePhoto();
      }, 500);
    }
  }, [countdown, isTakingPhoto, capturePhoto]);

  // This effect reacts ONLY to new photos being added.
  useEffect(() => {
    if (photos.length === 0 || !isTakingPhoto) {
      return;
    }

    if (photos.length < settings.photoCount) { // Use setting
      setStatus(`Great! Photo ${photos.length} of ${settings.photoCount} done.`);
      const timer = setTimeout(() => {
        setCountdown(settings.countdownDuration); // Use setting
      }, settings.pauseBetweenPhotos); // Use setting
      return () => clearTimeout(timer);
    } 
    
    if (photos.length === settings.photoCount) { // Use setting
      setStatus("All done! Here's your strip.");
      setIsTakingPhoto(false);
      setTimeout(() => {
        setShowPreview(true);
      }, 1000);
    }
  }, [photos, isTakingPhoto, settings]); // Depend on settings object

  const handleRetake = () => {
    setPhotos([]);
    setShowPreview(false);
    setShowThankYou(false);
    setIsTakingPhoto(false);
    setCountdown(null);
    setStatus("Get Ready to Pose!");
  };

  const handlePrint = async () => {
    try {
      // Create and save the single photo strip file with current settings
      await savePhotoStrip(photos, settings);
      
      // For now, just show the thank you screen
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
          <button
            onClick={() => navigate('/')}
            className="photo-button"
          >
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
          <div className="photo-strip">
            <div className="photo-strip-images">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="strip-photo"
                />
              ))}
            </div>
          </div>
          <div className="button-group">
            <button
              onClick={handleRetake}
              className="secondary-button"
            >
              Retake
            </button>
            <button
              onClick={handlePrint}
              className="photo-button"
            >
              Print Strip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-body">
      <div className="photo-container">
        <h1 className="status-text">{status}</h1>
        <div className="camera-screen">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="webcam"
          />
          {countdown !== null && (
            <div className="countdown-overlay">
              <span>{countdown}</span>
            </div>
          )}
          {flashWhite && (
            <div className="flash-overlay"></div>
          )}
        </div>
        
        <button
          onClick={startPhotoSequence}
          disabled={isTakingPhoto || photos.length === settings.photoCount} // Use setting
          className="photo-button"
        >
          {photos.length === 0 && !isTakingPhoto ? 'Start' : 
           isTakingPhoto ? 'Taking Photos...' : 
           photos.length === settings.photoCount ? 'Complete!' : // Use setting
           'Continue'}
        </button>
      </div>
    </div>
  );
};

export default PhotoStrip; 