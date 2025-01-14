import React, { useRef } from 'react';
import { Folder, Upload, Save, Headphones } from 'lucide-react';
import { useTranscription } from '../contexts/TranscriptionContext';

interface HeaderProps {
  onAudioFilesSelect: (files: FileList) => void;
  onTranscriptionUpload: (file: File) => void;
}

export function Header({ onAudioFilesSelect, onTranscriptionUpload }: HeaderProps) {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { saveTranscriptions } = useTranscription();

  return (
    <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
          <Headphones className="w-10 h-10" />
          Audio Transcription Studio
        </h1>
        <p className="text-gray-400 mt-2">
          Professional Audio Transcription & Verification Tool
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => audioInputRef.current?.click()}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg border border-gray-600"
        >
          <Folder size={20} />
          Select Audio Files
        </button>
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*,.wav"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onAudioFilesSelect(e.target.files)}
        />
        <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg cursor-pointer transition-all transform hover:scale-105 shadow-lg">
          <Upload size={20} />
          Upload Transcriptions
          <input
            type="file"
            accept=".txt"
            className="hidden"
            onChange={(e) =>
              e.target.files && onTranscriptionUpload(e.target.files[0])
            }
          />
        </label>
        <button
          onClick={saveTranscriptions}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
        >
          <Save size={20} />
          Save All Files
        </button>
      </div>
    </div>
  );
}