const FeaturesSection = () => (
  <section className="w-full py-16 bg-surface" id="features">
    <div className="max-w-container-lg mx-auto px-4">
      <h3 className="text-2xl font-bold text-text mb-8 text-center">Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-background border border-card-border rounded-lg shadow-glass p-8 flex flex-col items-center text-center hover:shadow-lg transition-all">
          <div className="mb-4 text-tamil-orange">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold mb-2 text-text">Advanced Audio Processing</h4>
          <p className="text-sm text-text-secondary">Powered by Shuka-1 model for accurate Tamil speech recognition from audio and video files.</p>
        </div>
        <div className="bg-background border border-card-border rounded-lg shadow-glass p-8 flex flex-col items-center text-center hover:shadow-lg transition-all">
          <div className="mb-4 text-tamil-orange">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 16V9h5l4-5v16l-4-5z" />
              <path d="M15 8a5 5 0 0 1 0 8" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold mb-2 text-text">High-Quality Translation</h4>
          <p className="text-sm text-text-secondary">NLLB-200 powered Tamil to English translation with cultural context preservation.</p>
        </div>
        <div className="bg-background border border-card-border rounded-lg shadow-glass p-8 flex flex-col items-center text-center hover:shadow-lg transition-all">
          <div className="mb-4 text-tamil-orange">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx={12} cy={12} r={3} />
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold mb-2 text-text">Multiple Format Support</h4>
          <p className="text-sm text-text-secondary">Support for various audio and video formats including MP3, WAV, MP4, and more.</p>
        </div>
      </div>
    </div>
  </section>
);

export default FeaturesSection; 