import React, { createContext, useContext, useState } from 'react';

interface Transcription {
  audioPath: string;
  text: string;
  verified?: boolean;
  remarks?: string;
  lastModified?: string;
  audioFile?: File;
}

interface TranscriptionContextType {
  transcriptions: Transcription[];
  currentIndex: number;
  originalFile: File | null;
  setOriginalFile: (file: File | null) => void;
  editedText: string;
  setEditedText: (text: string) => void;
  setTranscriptions: (transcriptions: Transcription[]) => void;
  setCurrentIndex: (index: number) => void;
  updateTranscription: (index: number, updates: Partial<Transcription>) => void;
  saveCurrentTranscription: () => void;
}

const TranscriptionContext = createContext<TranscriptionContextType | undefined>(undefined);

export function TranscriptionProvider({ children }: { children: React.ReactNode }) {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [editedText, setEditedText] = useState('');
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null); // For File System Access API

  const updateTranscription = (index: number, updates: Partial<Transcription>) => {
    setTranscriptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const saveCurrentTranscription = async () => {
    if (transcriptions.length === 0) {
      alert('No transcriptions to save.');
      return;
    }

    if (!originalFile) {
      alert('No original file found. Please upload a transcription file first.');
      return;
    }

    // Update the current transcription
    const updatedTranscriptions = [...transcriptions];
    updatedTranscriptions[currentIndex] = {
      ...updatedTranscriptions[currentIndex],
      text: editedText,
      lastModified: new Date().toISOString(),
    };
    setTranscriptions(updatedTranscriptions);

    const content = updatedTranscriptions
      .map((t) => `${t.audioPath}|${t.text}`)
      .join('\n');

    try {
      if ('showSaveFilePicker' in window) {
        // Use File System Access API if supported
        let handle = fileHandle;

        if (!handle) {
          // If no handle exists, ask the user to pick a file
          handle = await window.showSaveFilePicker({
            suggestedName: originalFile.name,
            types: [
              {
                description: 'Text Files',
                accept: { 'text/plain': ['.txt'] },
              },
            ],
          });
          setFileHandle(handle); // Store the handle for future saves
        }

        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();

        alert('Transcription saved successfully!');
      } else {
        // Fallback for browsers without File System Access API
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Transcription downloaded successfully.');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save the file. Please try again.');
    }
  };

  const setOriginalFileWithHandle = async (file: File | null) => {
    if (!file) {
      setOriginalFile(null);
      setFileHandle(null);
      return;
    }

    setOriginalFile(file);

    if ('showOpenFilePicker' in window) {
      try {
        // Allow the user to select the file for persistent access
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'Text Files',
              accept: { 'text/plain': ['.txt'] },
            },
          ],
        });
        setFileHandle(handle);
      } catch (error) {
        console.error('Error selecting file handle:', error);
      }
    }
  };

  return (
    <TranscriptionContext.Provider
      value={{
        transcriptions,
        currentIndex,
        originalFile,
        setOriginalFile: setOriginalFileWithHandle,
        editedText,
        setEditedText,
        setTranscriptions,
        setCurrentIndex,
        updateTranscription,
        saveCurrentTranscription,
      }}
    >
      {children}
    </TranscriptionContext.Provider>
  );
}

export function useTranscription() {
  const context = useContext(TranscriptionContext);
  if (context === undefined) {
    throw new Error('useTranscription must be used within a TranscriptionProvider');
  }
  return context;
}