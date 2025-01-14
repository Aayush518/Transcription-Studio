import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
  file?: File;
  onTimeUpdate?: (time: number) => void;
}

export function AudioPlayer({ file, onTimeUpdate }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (file && audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      onTimeUpdate?.(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        duration,
        audioRef.current.currentTime + 5
      );
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-800">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-300 truncate">
            {file?.name || 'No audio file selected'}
          </h2>
        </div>

        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={skipBackward}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <SkipBack size={24} />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button
            onClick={skipForward}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <SkipForward size={24} />
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => {
              const time = parseFloat(e.target.value);
              if (audioRef.current) {
                audioRef.current.currentTime = time;
              }
            }}
            className="w-full"
          />
          
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}