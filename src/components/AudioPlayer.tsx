import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface AudioPlayerProps {
  file?: File;
  onTimeUpdate?: (time: number) => void;
}

export function AudioPlayer({ file, onTimeUpdate }: AudioPlayerProps) {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    handleTimeUpdate,
    handleLoadedMetadata,
    skipBackward,
    skipForward,
    setTime,
    setVolume,
  } = useAudioPlayer(file);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-xl shadow-xl border border-gray-700/50 backdrop-blur-xl">
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          handleTimeUpdate();
          onTimeUpdate?.(currentTime);
        }}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-300 truncate">
            {file?.name || 'No audio file selected'}
          </h2>
        </div>

        <div className="flex justify-center items-center space-x-6">
          <button
            onClick={skipBackward}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Skip backward 5 seconds"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={togglePlayPause}
            className="p-4 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors transform hover:scale-105 shadow-lg"
            disabled={!file}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </button>

          <button
            onClick={skipForward}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Skip forward 5 seconds"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="relative group">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => setTime(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%)`,
              }}
            />
            <div className="absolute left-0 right-0 -bottom-6 hidden group-hover:block">
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${volume * 100}%, #374151 ${volume * 100}%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}