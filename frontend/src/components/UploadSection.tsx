import React, { useRef, useState } from 'react';

type Props = {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  progress: number;
};

const UploadSection: React.FC<Props> = ({ onFileSelect, isLoading, progress }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-10">
      <div
        className={`w-full max-w-xl border-2 border-dashed rounded-lg bg-background p-8 flex flex-col items-center cursor-pointer transition-all duration-200 ${dragActive ? 'border-tamil-orange bg-tamil-orange/10 scale-105' : 'border-tamil-orange'} ${isLoading ? 'hidden' : ''}`}
        id="uploadArea"
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onDragOver={e => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-tamil-orange mb-2">
            <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1={12} y1={15} x2={12} y2={3} />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text">Drop your file here</h3>
          <p className="text-sm text-text-secondary">or click to browse</p>
          <div className="text-xs text-text-secondary mt-2 bg-tamil-yellow/20 px-3 py-1 rounded-full">
            Supports: MP3, WAV, MP4, AVI, MOV, MKV, WEBM (max 100MB)
          </div>
        </div>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept=".mp3,.wav,.mp4,.avi,.mov,.mkv,.webm"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>
      {isLoading && (
        <div className="w-full max-w-xl flex flex-col items-center justify-center py-8">
          <div className="relative flex flex-col items-center justify-center mb-4">
            <svg className="w-16 h-16" width={60} height={60}>
              <circle className="text-tamil-yellow" cx={30} cy={30} r={26} fill="none" stroke="currentColor" strokeWidth={4} />
              <circle
                className="text-tamil-orange"
                cx={30}
                cy={30}
                r={26}
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - progress / 100)}
                style={{ transition: 'stroke-dashoffset 0.3s ease' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-tamil-orange">{progress}%</span>
          </div>
          <div className="text-center">
            <h4 className="text-base font-semibold text-text">Uploading...</h4>
            <p className="text-sm text-text-secondary">Please wait while we process your file</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection; 