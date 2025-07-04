"use client";
import React, { useRef, useState, useEffect } from "react";
import { transcribeFile } from "@/utils/api";
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import UploadSection from '@/components/UploadSection';
import ProcessingSection from '@/components/ProcessingSection';
import ResultsSection from '@/components/ResultsSection';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ToastContainer';

// Toast type
interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function Home() {
  // Theme
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Upload/processing state
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(0); // 0: upload, 1: uploading, 2: processing, 3: transcribing, 4: translating, 5: done
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [processingTime, setProcessingTime] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // Theme logic
  useEffect(() => {
    setMounted(true);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
  }, [theme]);
  const handleThemeToggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // Toast helpers
  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // File upload logic
  const handleFileSelect = (file: File) => {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      showToast('File size exceeds 100MB limit', 'error');
      return;
    }
    const validFormats = ['mp3', 'wav', 'mp4', 'avi', 'mov', 'mkv', 'webm'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !validFormats.includes(ext)) {
      showToast('Unsupported file format.', 'error');
      return;
    }
    setFile(file);
    setStep(1); // uploading
    setIsLoading(true);
    setProgress(0);
    showToast(`File "${file.name}" selected successfully`, 'info');
    uploadAndTranscribe(file);
  };

  const uploadAndTranscribe = async (file: File) => {
    try {
      setProgress(10);
      setStep(2); // processing
      const result = await transcribeFile(file);
      setTranscription(result.transcription);
      setTranslation(result.translation);
      setProcessingTime(result.processing_time);
      setStep(5); // done
      setIsLoading(false);
      setProgress(100);
      showToast('Processing completed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Processing failed', 'error');
      setIsLoading(false);
      setStep(0);
    }
  };

  // Copy/download handlers
  const handleCopy = (text: string) => {
    if (!text.trim()) {
      showToast('No text to copy', 'error');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast('Text copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy text', 'error');
    });
  };
  const handleDownload = (type: 'tamil' | 'english') => {
    const text = type === 'tamil' ? transcription : translation;
    const fileName = type === 'tamil' ? 'tamil-transcription.txt' : 'english-translation.txt';
    if (!text.trim()) {
      showToast('No text to download', 'error');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`${type === 'tamil' ? 'Tamil' : 'English'} text downloaded successfully!`, 'success');
  };

  // New transcription
  const handleNew = () => {
    setStep(0);
    setFile(null);
    setTranscription('');
    setTranslation('');
    setProcessingTime(0);
    setIsLoading(false);
    setProgress(0);
    showToast('Ready for new transcription', 'info');
  };

  // Section visibility
  const showUpload = step === 0 || step === 1;
  const showProcessing = step === 2 || step === 3 || step === 4;
  const showResults = step === 5;

  return (
    <>
      <Header />
      <main className="main">
        <HeroSection />
        {showUpload && (
          <div className="animate-fade-in">
            <UploadSection
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
              progress={progress}
            />
          </div>
        )}
        {showProcessing && (
          <div className="animate-slide-up">
            <ProcessingSection step={step - 1} />
          </div>
        )}
        {showResults && (
          <div className="animate-fade-in">
            <ResultsSection
              transcription={transcription}
              translation={translation}
              processingTime={processingTime}
              onCopy={handleCopy}
              onDownload={handleDownload}
              onNew={handleNew}
            />
          </div>
        )}
        <FeaturesSection />
      </main>
      <Footer />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
} 