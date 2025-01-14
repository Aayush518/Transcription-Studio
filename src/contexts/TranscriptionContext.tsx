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
  const [validationFileHandle, setValidationFileHandle] = useState<FileSystemFileHandle | null>(null); // For File System Access API for validation file

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

    // Save transcription file
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

        }
      } catch (error) {
        console.error('Error saving transcription file:', error);
        alert('Failed to save the transcription file. Please try again.');
          return;
      }

        // Save validation file
    const validationContent = updatedTranscriptions.map(t =>
        `${t.audioPath}|${t.verified !== undefined ? t.verified : ''}|${t.remarks || ''}`
    ).join('\n');

      try {
      if ('showSaveFilePicker' in window) {
        let validationHandle = validationFileHandle;
        if (!validationHandle) {
              const originalFileName = originalFile.name.split('.').slice(0, -1).join('.');
              validationHandle = await window.showSaveFilePicker({
                  suggestedName: `${originalFileName}.validation.txt`,
                  types: [
                      {
                          description: 'Text Files',
                          accept: { 'text/plain': ['.txt'] },
                      },
                  ],
              });
              setValidationFileHandle(validationHandle);
          }


          const writable = await validationHandle.createWritable();
          await writable.write(validationContent);
          await writable.close();
          alert('Transcription and validation data saved successfully!');

      } else {

          const blob = new Blob([validationContent], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const originalFileName = originalFile.name.split('.').slice(0, -1).join('.');
          a.download = `${originalFileName}.validation.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          alert('Transcription and validation data downloaded successfully.');
      }
    } catch (error) {
      console.error('Error saving validation file:', error);
      alert('Failed to save the validation file. Please try again.');
      }


  };

  const setOriginalFileWithHandle = async (file: File | null) => {
    if (!file) {
      setOriginalFile(null);
      setFileHandle(null);
      setValidationFileHandle(null);
      setTranscriptions([])
      return;
    }

    setOriginalFile(file);

    let fileHandle: FileSystemFileHandle | null = null;
    let validationFileHandle: FileSystemFileHandle | null = null;

    if ('showOpenFilePicker' in window) {
      try {
        // Allow the user to select the file for persistent access
         [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'Text Files',
              accept: { 'text/plain': ['.txt'] },
            },
          ],
        });
        setFileHandle(fileHandle);

        const originalFileName = file.name.split('.').slice(0, -1).join('.');
         try {
            // Attempt to load the validation file with the same name
           [validationFileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: 'Text Files',
                        accept: { 'text/plain': ['.txt'] },
                    },
                ],
                startIn: await fileHandle.getParent(),
            });
            setValidationFileHandle(validationFileHandle);

            if (validationFileHandle) {
                const validationFile = await validationFileHandle.getFile();
                const validationText = await validationFile.text();
                const validationLines = validationText.trim().split('\n');
                 const updatedTranscriptions = validationLines.map(line => {
                  const [audioPath, verified, remarks] = line.split('|');
                  const transcription = transcriptions.find(t => t.audioPath === audioPath);
                  return transcription ? {...transcription, verified: verified === 'true', remarks: remarks || undefined } : {audioPath, text: '', verified: verified === 'true', remarks: remarks || undefined };
               });
               setTranscriptions(updatedTranscriptions);
            }



        } catch (error) {
             console.log('Validation file not found or could not be loaded', error);
        }



      } catch (error) {
        console.error('Error selecting file handle:', error);
      }
    } else {
         try {
            const reader = new FileReader();
            reader.onload = async (e) => {
               if(e.target?.result){
                  const text = e.target.result as string;
                    const lines = text.trim().split('\n');
                    const updatedTranscriptions = lines.map(line => {
                      const [audioPath, text] = line.split('|');
                      return {audioPath, text}
                    });
                    setTranscriptions(updatedTranscriptions);


                    // Attempt to load the validation file
                     const originalFileName = file.name.split('.').slice(0, -1).join('.');
                     try {
                      const response = await fetch(`${originalFileName}.validation.txt`);
                        if (response.ok) {
                            const validationText = await response.text();
                            const validationLines = validationText.trim().split('\n');

                            const updatedTranscriptionsWithValidation = validationLines.map(line => {
                              const [audioPath, verified, remarks] = line.split('|');
                              const transcription = updatedTranscriptions.find(t => t.audioPath === audioPath);
                              return transcription ? { ...transcription, verified: verified === 'true', remarks: remarks || undefined } : {audioPath, text: '', verified: verified === 'true', remarks: remarks || undefined };
                            });
                            setTranscriptions(updatedTranscriptionsWithValidation);
                        }

                     } catch(error){
                        console.log("Validation file not found or failed to load", error)
                     }
               }
            };
             reader.readAsText(file);
        }
        catch (error) {
          console.error('Error reading file:', error);
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