import React from 'react';

type Props = {
  step: number; // 1, 2, or 3
};

const ProcessingSection: React.FC<Props> = ({ step }) => (
  <section className="w-full py-12 bg-surface" id="processingSection">
    <div className="max-w-container-md mx-auto px-4">
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((s, idx) => (
          <div
            key={s}
            className={`flex items-center gap-4 p-6 rounded-lg border shadow-glass transition-all duration-200
              ${step === s ? 'border-tamil-orange bg-tamil-orange/10' : step > s ? 'border-success bg-success/10' : 'border-card-border bg-background'}
            `}
            id={`step${s}`}
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-white border ${step === s ? 'border-tamil-orange text-tamil-orange animate-pulse-custom' : step > s ? 'border-success text-success' : 'border-card-border text-text'}`}>
              {s === 1 && (
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              )}
              {s === 2 && (
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1={4} y1={22} x2={4} y2={15} />
                </svg>
              )}
              {s === 3 && (
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx={12} cy={12} r={3} />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-text">
                {s === 1 && 'Processing Audio'}
                {s === 2 && 'Tamil Transcription'}
                {s === 3 && 'English Translation'}
              </h4>
              <p className="text-sm text-text-secondary">
                {s === 1 && 'Extracting audio features'}
                {s === 2 && 'Converting speech to Tamil text'}
                {s === 3 && 'Translating to English'}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10">
              {step > s ? (
                <span className="text-success text-2xl font-bold">✓</span>
              ) : step === s ? (
                <span className="inline-block w-6 h-6 border-4 border-tamil-orange border-t-transparent rounded-full animate-spin" />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessingSection; 