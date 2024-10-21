import React, { useState, useRef, useEffect } from 'react';
import { buttonStyle } from '@/app/styles/uiStyles';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface TrimModalProps {
  video: File | string;
  onClose: () => void;
  onSave: (trimmedVideo: File) => void;
}

function TrimModal({ video, onClose, onSave }: TrimModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video instanceof File) {
      const url = URL.createObjectURL(video);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof video === 'string') {
      setVideoUrl(video);
    }
  }, [video]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        const videoDuration = videoRef.current!.duration;
        setDuration(videoDuration);
        setEndTime(videoDuration);
      };
    }
  }, [videoUrl]);

  const handleTrim = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);

    const stream = (videoRef.current as any).captureStream();
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const trimmedFile = new File([blob], 'trimmed_video.webm', { type: 'video/webm' });
      onSave(trimmedFile);
      onClose();
    };

    videoRef.current.currentTime = startTime;
    mediaRecorder.start();

    videoRef.current.play();

    setTimeout(() => {
      mediaRecorder.stop();
      videoRef.current!.pause();
      setIsProcessing(false);
    }, (endTime - startTime) * 1000);
  };

  const handleSliderChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setStartTime(value[0]);
      setEndTime(value[1]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-3xl w-full">
        <h2 className="text-xl font-bold mb-4 text-white">Trim Video</h2>
        {videoUrl && (
          <video ref={videoRef} src={videoUrl} controls className="w-full mb-4" />
        )}
        <div className="mb-4">
          <Slider
            range
            min={0}
            max={duration}
            step={0.1}
            value={[startTime, endTime]}
            onChange={handleSliderChange}
          />
          <div className="flex justify-between mt-2 text-white">
            <span>{formatTime(startTime)}</span>
            <span>{formatTime(endTime)}</span>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className={`${buttonStyle} bg-blue-500 hover:bg-blue-600`}
            onClick={handleTrim}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Trim Video'}
          </button>
          <button
            className={`${buttonStyle} bg-red-500 hover:bg-red-600`}
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrimModal;
