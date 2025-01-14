import React, { useRef } from 'react';
import { Upload, Folder, Save } from 'lucide-react';
import { AudioPlayer } from './components/AudioPlayer';
import { TranscriptionEditor } from './components/TranscriptionEditor';
import { FileList } from './components/FileList';
import { VerificationPanel } from './components/VerificationPanel';
import { TranscriptionProvider, useTranscription } from './contexts/TranscriptionContext';

interface Transcription {
  audioPath: string;
  text: string;
  verified?: boolean;
  remarks?: string;
  lastModified?: string;
  audioFile?: File;
}

function AppContent() {
  const {
    transcriptions,
    currentIndex,
    editedText,
    setTranscriptions,
    setCurrentIndex,
    setOriginalFile,
    setEditedText,
    saveTranscriptions,
  } = useTranscription();

  const [fontSize] = React.useState(16);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [audioFiles, setAudioFiles] = React.useState<{ [key: string]: File }>({});

  const handleTranscriptionUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOriginalFile(file);

    try {
      let content = await file.text();
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }

      const lines = content
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const parsed = lines.map((line) => {
        const pipeIndex = line.indexOf('|');
        if (pipeIndex === -1) return null;

        const audioPath = line.substring(0, pipeIndex).trim();
        const transcriptionText = line.substring(pipeIndex + 1).trim();

        // Try to find matching audio file by exact name or basename
        const audioFile = findMatchingAudioFile(audioPath, audioFiles);

        return {
          audioPath,
          text: transcriptionText,
          verified: undefined,
          remarks: '',
          lastModified: new Date().toISOString(),
          audioFile,
        };
      }).filter((item): item is Transcription => item !== null);

      if (parsed.length === 0) {
        alert('No valid transcriptions found in the file.');
        return;
      }

      setTranscriptions(parsed);
      setCurrentIndex(0);
      setEditedText(parsed[0].text);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing the transcription file.');
    }
  };

  const findMatchingAudioFile = (audioPath: string, audioFiles: { [key: string]: File }): File | undefined => {
    // Try exact match first
    if (audioFiles[audioPath]) {
      return audioFiles[audioPath];
    }

    // Try matching just the filename without path
    const fileName = audioPath.split(/[/\\]/).pop();
    if (!fileName) return undefined;

    // Find first matching file
    return Object.values(audioFiles).find(file => file.name === fileName);
  };

  const handleAudioFilesSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const newAudioFiles: { [key: string]: File } = {};
    Array.from(files).forEach(file => {
      if (file.type.startsWith('audio/') || file.name.endsWith('.wav')) {
        newAudioFiles[file.name] = file;
      }
    });

    const updatedAudioFiles = { ...audioFiles, ...newAudioFiles };
    setAudioFiles(updatedAudioFiles);

    // Update existing transcriptions with new audio files
    if (transcriptions.length > 0) {
      const updatedTranscriptions = transcriptions.map(t => ({
        ...t,
        audioFile: findMatchingAudioFile(t.audioPath, updatedAudioFiles),
      }));
      setTranscriptions(updatedTranscriptions);
    } else {
      // Create new transcriptions if none exist
      const newTranscriptions = Object.entries(newAudioFiles).map(([name, file]) => ({
        audioPath: name,
        text: '',
        audioFile: file,
        lastModified: new Date().toISOString(),
      }));
      setTranscriptions(newTranscriptions);
      setCurrentIndex(0);
      setEditedText('');
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Audio Transcription Studio
              </h1>
              <p className="text-gray-400 mt-3 text-lg">
                Professional Audio Transcription & Verification Tool
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => audioInputRef.current?.click()}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg border border-gray-600/50"
              >
                <Folder className="w-5 h-5" />
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
              <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl cursor-pointer transition-all transform hover:scale-105 shadow-lg">
                <Upload className="w-5 h-5" />
                Upload Transcriptions
                <input
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={handleTranscriptionUpload}
                />
              </label>
              <button
                onClick={saveTranscriptions}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {transcriptions.length === 0 ? (
          <div className="text-center py-32">
            <div className="bg-gray-800/50 backdrop-blur-xl p-12 rounded-3xl max-w-2xl mx-auto border border-gray-700/50">
              <p className="text-gray-300 text-2xl mb-4">
                No transcriptions loaded
              </p>
              <p className="text-gray-500">
                Please upload a transcription file or select audio files to begin.
                <br />
                Expected format: audioPath|transcription
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
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

            <div className="col-span-9 space-y-6">
              {transcriptions[currentIndex] && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <AudioPlayer
                      file={transcriptions[currentIndex].audioFile}
                      onTimeUpdate={(time) => console.log('Audio time:', time)}
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

function App() {
  return (
    <TranscriptionProvider>
      <AppContent />
    </TranscriptionProvider>
  );
}

export default App;