const Header = () => (
  <header className="w-full bg-surface border-b border-border py-4 sticky top-0 z-50">
    <div className="max-w-container-lg mx-auto px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold font-sans flex items-baseline gap-2">
            <span className="text-tamil-orange font-tamil font-bold text-3xl">தமிழ்</span>
            <span className="text-text text-xl font-medium">Transcriptor</span>
          </h1>
        </div>
        <nav className="flex items-center gap-6">
          <a href="#features" className="text-text-secondary hover:text-tamil-orange transition-colors font-medium">Features</a>
          <a href="#how-it-works" className="text-text-secondary hover:text-tamil-orange transition-colors font-medium">How it Works</a>
          <a href="#history" className="text-text-secondary hover:text-tamil-orange transition-colors font-medium">History</a>
          <button className="ml-4 p-2 rounded-full bg-secondary hover:bg-tamil-yellow transition-colors" id="themeToggle">
            <span className="text-xl">🌙</span>
          </button>
        </nav>
      </div>
    </div>
  </header>
);

export default Header; 