import React, { useRef, useEffect } from 'react';
import { Save, Type, Check, X } from 'lucide-react';
import { useTranscription } from '../contexts/TranscriptionContext';

interface TranscriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  fontSize?: number;
  verified?: boolean;
}

export function TranscriptionEditor({
  value,
  onChange,
  fontSize = 16,
  verified,
}: TranscriptionEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { saveCurrentTranscription } = useTranscription();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentTranscription();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveCurrentTranscription]);

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-6 shadow-xl border border-gray-700/50 backdrop-blur-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
            <Type size={20} className="text-gray-400" />
            <button
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.style.fontSize = `${fontSize + 2}px`;
                }
              }}
              className="text-gray-400 hover:text-white px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              A+
            </button>
            <button
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.style.fontSize = `${fontSize - 2}px`;
                }
              }}
              className="text-gray-400 hover:text-white px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              A-
            </button>
          </div>
          {verified !== undefined && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                verified
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-red-600/20 text-red-400'
              }`}
            >
              {verified ? (
                <>
                  <Check size={20} />
                  <span>Verified</span>
                </>
              ) : (
                <>
                  <X size={20} />
                  <span>Needs Review</span>
                </>
              )}
            </div>
          )}
        </div>
        <button
          onClick={saveCurrentTranscription}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
        >
          <Save size={20} />
          <span>Save Current (Ctrl+S)</span>
        </button>
      </div>
      <textarea
        ref={editorRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontSize: `${fontSize}px` }}
        className="w-full h-[400px] bg-gray-800 text-gray-100 p-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
        placeholder="Upload a transcription file to begin editing..."
      />
    </div>
  );
}