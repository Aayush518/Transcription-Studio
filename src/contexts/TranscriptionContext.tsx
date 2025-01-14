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
  editedText: string;
  setTranscriptions: (transcriptions: Transcription[]) => void;
  setCurrentIndex: (index: number) => void;
  setOriginalFile: (file: File | null) => void;
  setEditedText: (text: string) => void;
  updateTranscription: (index: number, updates: Partial<Transcription>) => void;
  saveTranscriptions: () => void;
  saveCurrentTranscription: () => void;
}

const TranscriptionContext = createContext<TranscriptionContextType | undefined>(undefined);

export function TranscriptionProvider({ children }: { children: React.ReactNode }) {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [editedText, setEditedText] = useState('');

  const updateTranscription = (index: number, updates: Partial<Transcription>) => {
    setTranscriptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const saveCurrentTranscription = () => {
    if (transcriptions.length === 0) {
      alert('No transcriptions to save.');
      return;
    }

    const updatedTranscriptions = [...transcriptions];
    updatedTranscriptions[currentIndex] = {
      ...updatedTranscriptions[currentIndex],
      text: editedText,
      lastModified: new Date().toISOString(),
    };
    setTranscriptions(updatedTranscriptions);

    if (!originalFile) {
      alert('No original file found. Please upload a transcription file first.');
      return;
    }

    // Save to the original file
    const content = updatedTranscriptions
      .map((t) => `${t.audioPath}|${t.text}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveTranscriptions = () => {
    if (transcriptions.length === 0) {
      alert('No transcriptions to save.');
      return;
    }

    if (!originalFile) {
      alert('No original file found. Please upload a transcription file first.');
      return;
    }

    // Save main transcription file
    const content = transcriptions
      .map((t) => `${t.audioPath}|${t.text}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Save verification data
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const csvContent =
      'Audio File,Text,Verified,Remarks,Last Modified\n' +
      transcriptions
        .map(
          (t) =>
            `"${t.audioPath}","${t.text}","${t.verified}","${t.remarks}","${t.lastModified}"`
        )
        .join('\n');

    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = `verification_log_${timestamp}.csv`;
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvUrl);
  };

  return (
    <TranscriptionContext.Provider
      value={{
        transcriptions,
        currentIndex,
        originalFile,
        editedText,
        setTranscriptions,
        setCurrentIndex,
        setOriginalFile,
        setEditedText,
        updateTranscription,
        saveTranscriptions,
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