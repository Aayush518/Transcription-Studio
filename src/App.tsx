import React, { useState, useRef } from 'react';
import { Upload, Folder, Save } from 'lucide-react';
import { AudioPlayer } from './components/AudioPlayer';
import { TranscriptionEditor } from './components/TranscriptionEditor';
import { FileList } from './components/FileList';
import { VerificationPanel } from './components/VerificationPanel';

interface Transcription {
  audioPath: string;
  text: string;
  verified?: boolean;
  remarks?: string;
  lastModified?: string;
  audioFile?: File;
}

function App() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [editedText, setEditedText] = useState<string>('');
  const [fontSize, setFontSize] = useState(16);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleTranscriptionUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let content = e.target?.result;
        if (typeof content !== 'string') {
          console.error('Invalid file content');
          alert('Invalid file content. Please ensure the file contains text.');
          return;
        }

        // Remove BOM if present
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1);
        }

        console.log('File content loaded, length:', content.length);

        // Split content into lines, handling both CRLF and LF
        const lines = content
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line.length > 0);

        console.log('Number of lines found:', lines.length);

        const parsed = lines.map((line, index) => {
          try {
            // Find the first pipe character
            const pipeIndex = line.indexOf('|');
            if (pipeIndex === -1) {
              console.warn(`Line ${index + 1} has no pipe separator:`, line);
              return null;
            }

            const audioPath = line.substring(0, pipeIndex).trim();
            const transcriptionText = line.substring(pipeIndex + 1).trim();

            if (!audioPath || !transcriptionText) {
              console.warn(`Line ${index + 1} has missing data:`, { audioPath, transcriptionText });
              return null;
            }

            console.log(`Line ${index + 1} parsed:`, { audioPath, transcriptionText });

            return {
              audioPath,
              text: transcriptionText,
              verified: undefined,
              remarks: '',
              lastModified: new Date().toISOString(),
            };
          } catch (lineError) {
            console.error(`Error parsing line ${index + 1}:`, lineError);
            return null;
          }
        }).filter((item): item is Transcription => item !== null);

        console.log('Successfully parsed transcriptions:', parsed.length);

        if (parsed.length === 0) {
          alert('No valid transcriptions found in the file.\nExpected format: audioPath|transcription');
          return;
        }

        setTranscriptions(parsed);
        setCurrentIndex(0);
        setEditedText(parsed[0].text);
        
        console.log('First transcription:', parsed[0]);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert(`Error parsing transcription file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      alert('Error reading the file. Please try again.');
    };

    // Try to read the file as UTF-8 text
    reader.readAsText(file, 'UTF-8');
  };

  const handleAudioFilesSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const audioFiles = Array.from(files).filter(
      (file) => file.type.startsWith('audio/') || file.name.endsWith('.wav')
    );

    const newTranscriptions = audioFiles.map((file) => ({
      audioPath: file.name,
      text: '',
      audioFile: file,
      lastModified: new Date().toISOString(),
    }));

    setTranscriptions((prev) => {
      const updated = [...prev, ...newTranscriptions];
      if (updated.length > 0 && prev.length === 0) {
        setCurrentIndex(0);
        setEditedText(updated[0].text);
      }
      return updated;
    });
  };

  const handleSave = async () => {
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

    const content = updatedTranscriptions
      .map((t) => `${t.audioPath}|${t.text}`)
      .join('\n');

    // Save main transcription file
    const transcriptionBlob = new Blob([content], { 
      type: 'text/plain;charset=utf-8' 
    });
    const transcriptionUrl = URL.createObjectURL(transcriptionBlob);
    const a = document.createElement('a');
    a.href = transcriptionUrl;
    a.download = 'transcriptions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(transcriptionUrl);

    // Save CSV with verification data
    const csvContent =
      'Audio File,Text,Verified,Remarks,Last Modified\n' +
      updatedTranscriptions
        .map(
          (t) =>
            `"${t.audioPath}","${t.text}","${t.verified}","${t.remarks}","${t.lastModified}"`
        )
        .join('\n');

    const csvBlob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8' 
    });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = 'transcription_verification.csv';
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvUrl);
  };

  const handleVerification = (verified: boolean, remarks: string) => {
    const updatedTranscriptions = [...transcriptions];
    updatedTranscriptions[currentIndex] = {
      ...updatedTranscriptions[currentIndex],
      verified,
      remarks,
      lastModified: new Date().toISOString(),
    };
    setTranscriptions(updatedTranscriptions);
  };

  const handleAudioTimeUpdate = (time: number) => {
    console.log('Audio time:', time);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-gray-800 p-6 rounded-lg shadow-xl">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Audio Transcription Studio
            </h1>
            <p className="text-gray-400 mt-2">
              Professional Audio Transcription & Verification Tool
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => audioInputRef.current?.click()}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
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
              onChange={handleAudioFilesSelect}
            />
            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg cursor-pointer transition-all transform hover:scale-105 shadow-lg">
              <Upload size={20} />
              Upload Transcriptions
              <input
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleTranscriptionUpload}
              />
            </label>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <Save size={20} />
              Save All Files
            </button>
          </div>
        </div>

        {transcriptions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">
              No transcriptions loaded. Please upload a transcription file or
              select audio files to begin.
            </p>
            <p className="text-gray-500 mt-2">
              Expected format: audioPath|transcription
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* File List */}
            <div className="col-span-3">
              <FileList
                files={transcriptions}
                currentIndex={currentIndex}
                onSelect={(index) => {
                  setCurrentIndex(index);
                  setEditedText(transcriptions[index].text);
                }}
              />
            </div>

            {/* Main Content */}
            <div className="col-span-9 space-y-6">
              {transcriptions[currentIndex] && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <AudioPlayer
                      file={transcriptions[currentIndex].audioFile}
                      onTimeUpdate={handleAudioTimeUpdate}
                    />
                    <VerificationPanel
                      verified={transcriptions[currentIndex].verified}
                      remarks={transcriptions[currentIndex].remarks}
                      onVerify={handleVerification}
                    />
                  </div>
                  <TranscriptionEditor
                    value={editedText}
                    onChange={setEditedText}
                    onSave={handleSave}
                    fontSize={fontSize}
                    verified={transcriptions[currentIndex].verified}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;