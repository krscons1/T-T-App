'use client';

import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import TranscriptionResult from '@/components/TranscriptionResult';
import LoadingSpinner from '@/components/LoadingSpinner';
import { transcribeFile } from '@/utils/api';

interface ProcessingResult {
  filename: string;
  transcription: string;
  translation: string;
  processing_time: number;
  file_type: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await transcribeFile(file);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Tamil Transcriptor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your Tamil audio or video files and get accurate transcriptions 
            with English translations powered by Sarvam AI
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
          
          {isLoading && (
            <div className="mt-8">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error processing file
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <TranscriptionResult result={result} />
        </div>
      </div>
    </div>
  );
} 