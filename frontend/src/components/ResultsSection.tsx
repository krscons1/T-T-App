import React, { useState } from 'react';

type Props = {
  transcription: string;
  translation: string;
  processingTime: number;
  onCopy: (text: string) => void;
  onDownload: (type: 'tamil' | 'english') => void;
  onNew: () => void;
};

const ResultsSection: React.FC<Props> = ({ transcription, translation, processingTime, onCopy, onDownload, onNew }) => {
  const [bounceTamil, setBounceTamil] = useState(false);
  const [bounceEnglish, setBounceEnglish] = useState(false);

  const handleCopyTamil = () => {
    setBounceTamil(true);
    onCopy(transcription);
    setTimeout(() => setBounceTamil(false), 600);
  };
  const handleCopyEnglish = () => {
    setBounceEnglish(true);
    onCopy(translation);
    setTimeout(() => setBounceEnglish(false), 600);
  };

  return (
    <section className="w-full py-12 bg-surface" id="resultsSection">
      <div className="max-w-container-lg mx-auto px-4">
        <div className="flex flex-col items-center">
          <h3 className="text-2xl font-bold text-text mb-6">Transcription & Translation Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-6">
            {/* Tamil Transcription */}
            <div className="bg-background border border-card-border rounded-lg shadow-glass p-6 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-tamil-orange font-tamil">Tamil Transcription</h4>
                <button className={`px-3 py-1 text-sm rounded border border-tamil-orange text-tamil-orange bg-transparent hover:bg-tamil-orange hover:text-white transition-colors ${bounceTamil ? 'animate-bounce-custom' : ''}`} onClick={handleCopyTamil}>
                  Copy
                </button>
              </div>
              <div className="flex-1">
                <textarea className="w-full min-h-[120px] bg-surface border border-card-border rounded p-2 text-text font-tamil resize-none" value={transcription} readOnly />
              </div>
            </div>
            {/* English Translation */}
            <div className="bg-background border border-card-border rounded-lg shadow-glass p-6 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-tamil-orange">English Translation</h4>
                <button className={`px-3 py-1 text-sm rounded border border-tamil-orange text-tamil-orange bg-transparent hover:bg-tamil-orange hover:text-white transition-colors ${bounceEnglish ? 'animate-bounce-custom' : ''}`} onClick={handleCopyEnglish}>
                  Copy
                </button>
              </div>
              <div className="flex-1">
                <textarea className="w-full min-h-[120px] bg-surface border border-card-border rounded p-2 text-text resize-none" value={translation} readOnly />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mb-4">
            <button className="px-4 py-2 rounded bg-tamil-orange text-white font-semibold shadow hover:bg-tamil-yellow transition-colors" onClick={() => onDownload('tamil')}>Download Tamil Text</button>
            <button className="px-4 py-2 rounded border border-tamil-orange text-tamil-orange bg-transparent font-semibold hover:bg-tamil-orange hover:text-white transition-colors" onClick={() => onDownload('english')}>Download English Text</button>
            <button className="px-4 py-2 rounded border border-card-border text-text bg-transparent font-semibold hover:bg-tamil-yellow/20 transition-colors" onClick={onNew}>New Transcription</button>
          </div>
          <div className="text-center mt-4 text-success text-base font-medium">
            {processingTime ? `Processing completed in ${processingTime} seconds!` : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection; 