import React from 'react';

interface TranscriptionResultProps {
  result: {
    filename: string;
    transcription: string;
    translation: string;
    processing_time: number;
    file_type: string;
  } | null;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Processing Results
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="text-sm text-gray-600">
            <span className="font-medium">File:</span> {result.filename}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Type:</span> {result.file_type}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Processing time:</span> {result.processing_time.toFixed(2)}s
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamil Transcription:
            </label>
            <div className="bg-gray-50 rounded-md p-4 min-h-[100px]">
              <p className="text-gray-800 leading-relaxed">
                {result.transcription || 'No transcription available'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              English Translation:
            </label>
            <div className="bg-blue-50 rounded-md p-4 min-h-[100px]">
              <p className="text-gray-800 leading-relaxed">
                {result.translation || 'No translation available'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => navigator.clipboard.writeText(result.transcription)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Copy Tamil Text
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(result.translation)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Copy English Translation
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionResult; 