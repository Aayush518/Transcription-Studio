import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface VerificationPanelProps {
  verified?: boolean;
  remarks?: string;
  onVerify: (verified: boolean, remarks: string) => void;
}

export function VerificationPanel({ verified, remarks = '', onVerify }: VerificationPanelProps) {
  const [localRemarks, setLocalRemarks] = useState(remarks);

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-800">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <AlertCircle size={24} className="text-yellow-500" />
        Verification Status
      </h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => onVerify(true, localRemarks)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
              verified === true
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <CheckCircle size={20} />
            Correct
          </button>
          
          <button
            onClick={() => onVerify(false, localRemarks)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
              verified === false
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <XCircle size={20} />
            Incorrect
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Remarks
          </label>
          <textarea
            value={localRemarks}
            onChange={(e) => {
              setLocalRemarks(e.target.value);
              onVerify(verified ?? false, e.target.value);
            }}
            placeholder="Add any notes or remarks about the transcription..."
            className="w-full h-32 bg-gray-800 text-gray-100 p-3 rounded border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="mt-4 p-4 rounded-lg bg-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Current Status</h3>
          <div className="flex items-center gap-2">
            {verified === undefined ? (
              <span className="text-yellow-500">Not Verified</span>
            ) : verified ? (
              <span className="text-green-500">Verified Correct</span>
            ) : (
              <span className="text-red-500">Marked Incorrect</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}