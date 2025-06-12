import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useSettings } from '../context/SettingsContext';
import { saveVideo } from '../utils/fileUtils';
import './VideoBooth.css';

const MIN_RECORDING_DURATION = 5;

const VideoBooth = () => {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const { settings } = useSettings();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [status, setStatus] = useState("Get Ready...");

  const startRecording = useCallback(() => {
    if (webcamRef.current?.stream) {
      setIsRecording(true);
      setRecordingTime(0);
      
      const stream = webcamRef.current.stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      const recordedChunks: Blob[] = [];
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      });

      mediaRecorder.addEventListener('stop', async () => {
        const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        try {
          await saveVideo(videoBlob, settings.directoryHandle);
          setStatus("Saved!");
          setShowThankYou(true);
        } catch (error) {
          console.error('Error saving video:', error);
          setStatus("Error!");
        }
      });

      mediaRecorder.start();
    }
  }, [settings.directoryHandle]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Countdown logic
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      startRecording();
      setCountdown(null);
    }
  }, [countdown, startRecording]);

  // Recording timer logic
  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= settings.maxRecordingDuration -1) {
            stopRecording();
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRecording, settings.maxRecordingDuration, stopRecording]);

  // Initial countdown trigger
  useEffect(() => {
    setCountdown(3);
  }, []);

  const handleStartPhotos = () => {
    navigate('/photo-strip');
  };

  if (showThankYou) {
    return (
      <div className="video-body">
        <div className="thank-you-container">
          <h1 className="thank-you-title">Thank You!</h1>
          <button className="video-button" onClick={handleStartPhotos}>
            Take Your Photos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-body">
      <div className="video-container">
        <h1 className="status-text">{status}</h1>
        
        <div className="video-screen">
          <Webcam
            ref={webcamRef}
            audio={true}
            className="webcam"
          />
          {countdown !== null && (
            <div className="countdown-overlay">
              {countdown}
            </div>
          )}
          {isRecording && (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(recordingTime / settings.maxRecordingDuration) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={stopRecording}
          disabled={!isRecording || recordingTime < MIN_RECORDING_DURATION}
          className="video-button"
        >
          Stop Recording
        </button>
      </div>
    </div>
  );
};

export default VideoBooth; 