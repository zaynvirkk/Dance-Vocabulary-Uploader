import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { buttonStyle } from '@/app/styles/uiStyles';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface TrimModalProps {
  video: File;
  onClose: () => void;
  onSave: (trimmedVideo: File) => void;
}

function TrimModal({ video, onClose, onSave }: TrimModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    const url = URL.createObjectURL(video);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
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
    if (!videoUrl) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.load();

      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      const inputFileName = 'input.mp4';
      const outputFileName = 'output.mp4';

      await ffmpeg.writeFile(inputFileName, await fetchFile(video));

      await ffmpeg.exec([
        '-ss', startTime.toFixed(2),
        '-i', inputFileName,
        '-t', (endTime - startTime).toFixed(2),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-y',
        outputFileName
      ]);

      const data = await ffmpeg.readFile(outputFileName);
      const trimmedBlob = new Blob([data], { type: 'video/mp4' });
      const trimmedFile = new File([trimmedBlob], 'trimmed_video.mp4', { type: 'video/mp4' });

      onSave(trimmedFile);
      onClose();
    } catch (error) {
      console.error('Error trimming video:', error);
    } finally {
      setIsProcessing(false);
    }
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
        {isProcessing && (
          <div className="mb-4">
            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-white mt-2 text-center">Processing: {progress}%</p>
          </div>
        )}
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
