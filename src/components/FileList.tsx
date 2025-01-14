import React from 'react';
import { FileAudio, CheckCircle, XCircle, Clock } from 'lucide-react';

interface FileListProps {
  files: Array<{
    audioPath: string;
    text: string;
    verified?: boolean;
    remarks?: string;
  }>;
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function FileList({ files, currentIndex, onSelect }: FileListProps) {
  return (
    <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-gray-100">Audio Files</h2>
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-400 text-sm">{files.length} files loaded</p>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle size={16} />
              {files.filter(f => f.verified === true).length}
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <XCircle size={16} />
              {files.filter(f => f.verified === false).length}
            </span>
            <span className="flex items-center gap-1 text-yellow-500">
              <Clock size={16} />
              {files.filter(f => f.verified === undefined).length}
            </span>
          </div>
        </div>
      </div>
      <div className="h-[600px] overflow-y-auto">
        {files.map((item, index) => (
          <div
            key={index}
            onClick={() => onSelect(index)}
            className={`flex items-center space-x-3 p-4 cursor-pointer transition-all ${
              currentIndex === index
                ? 'bg-blue-500 bg-opacity-20 border-l-4 border-blue-500'
                : 'hover:bg-gray-800 border-l-4 border-transparent'
            }`}
          >
            <div className="flex-shrink-0">
              {item.verified === undefined ? (
                <Clock size={20} className="text-yellow-500" />
              ) : item.verified ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <XCircle size={20} className="text-red-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-gray-300 truncate">
                {item.audioPath}
              </p>
              <p className="text-xs text-gray-500 truncate mt-1">
                {item.text.substring(0, 50)}...
              </p>
              {item.remarks && (
                <p className="text-xs text-yellow-500 truncate mt-1">
                  Note: {item.remarks}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}