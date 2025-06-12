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
  const [countdown, setCountdown] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [showThankYou, setShowThankYou] = useState(false);
  const [status, setStatus] = useState("Get Ready...");

  const startRecording = useCallback(() => {
    setStatus("Recording...");
    if (webcamRef.current && webcamRef.current.stream) {
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/mp4',
        videoBitsPerSecond: 2500000
      });
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      });
      mediaRecorderRef.current.addEventListener('stop', async () => {
        setIsRecording(false);
        try {
          const videoBlob = new Blob(recordedChunks, { type: 'video/mp4' });
          await saveVideo(videoBlob);
          setStatus("Saved!");
          setShowThankYou(true);
        } catch (error) {
          console.error('Error saving video:', error);
          setStatus("Error!");
        }
      });
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
    }
  }, [recordedChunks]);
  
  // Start countdown on component mount
  useEffect(() => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [startRecording]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const handleStartPhotos = () => {
    navigate('/photo-strip');
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= settings.maxRecordingDuration) {
            handleStopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording, handleStopRecording, settings.maxRecordingDuration]);

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
          {countdown > 0 && (
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
          onClick={handleStopRecording}
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