const Footer = () => (
  <footer className="w-full bg-surface border-t-2 border-tamil-orange py-8 mt-12">
    <div className="max-w-container-lg mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <h4 className="text-xl font-bold font-sans flex items-baseline gap-2">
            <span className="text-tamil-orange font-tamil font-bold text-2xl">தமிழ்</span>
            <span className="text-text text-lg font-medium">Transcriptor</span>
          </h4>
        </div>
        <div className="flex gap-6 mt-2 md:mt-0">
          <a href="#" className="text-text-secondary hover:text-tamil-orange transition-colors">Privacy Policy</a>
          <a href="#" className="text-text-secondary hover:text-tamil-orange transition-colors">Terms of Service</a>
          <a href="#" className="text-text-secondary hover:text-tamil-orange transition-colors">Support</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer; 