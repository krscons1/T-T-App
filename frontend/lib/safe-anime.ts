let animeCore: any = null

async function loadAnime() {
  if (animeCore) return animeCore

  try {
    const animeModule = await import("animejs")
    animeCore = animeModule.default || animeModule
    return animeCore
  } catch (error) {
    console.warn("Failed to load anime.js:", error)
    // Return a no-op function that won't break the app
    const noopFunc = (config: any) => ({ targets: config?.targets })
    // Add necessary methods to avoid "is not a function" errors
    noopFunc.timeline = () => ({ add: () => ({ add: () => ({}), play: () => ({}) }), play: () => ({}) })
    noopFunc.stagger = (value: any) => value
    noopFunc.random = (min: number, max: number) => Math.random() * (max - min) + min
    return noopFunc
  }
}

// Create a wrapper function that loads anime.js dynamically
async function safeAnime(config: any) {
  try {
    const anime = await loadAnime()
    if (typeof anime === 'function') {
      return anime(config)
    } else {
      console.warn("anime.js not available, using fallback")
      // Return a fallback object with all necessary properties
      return { 
        targets: config?.targets,
        // Add any methods that might be called on the result
        add: () => ({}),
        play: () => ({}),
        pause: () => ({}),
        restart: () => ({}),
        seek: () => ({}),
        update: () => ({})
      }
    }
  } catch (error) {
    console.error("Error in safeAnime:", error)
    // Return an object that won't cause errors when methods are called on it
    return { 
      targets: config?.targets,
      // Add any methods that might be called on the result
      add: () => ({}),
      play: () => ({}),
      pause: () => ({}),
      restart: () => ({}),
      seek: () => ({}),
      update: () => ({})
    }
  }
}

// Add static methods to the wrapper function
safeAnime.timeline = (config?: any) => {
  // Create a robust fallback object with all necessary methods
  const fallbackTimeline = {
    add: function() { 
      // Return this same object to allow chaining
      return this;
    },
    play: function() { return this; },
    pause: function() { return this; },
    restart: function() { return this; },
    seek: function() { return this; },
    update: function() { return this; }
  };
  
  try {
    // Try to get the anime module synchronously if it's already loaded
    if (animeCore && typeof animeCore.timeline === 'function') {
      return animeCore.timeline(config);
    }
    
    // If anime isn't loaded yet, use the fallback
    console.warn("anime.js timeline not available yet, using fallback");
    return fallbackTimeline;
  } catch (error) {
    console.error("Error creating timeline:", error);
    // Return the fallback object with chainable methods
    return fallbackTimeline;
  }
}

safeAnime.stagger = async (value: any, options?: any) => {
  try {
    const anime = await loadAnime()
    return anime.stagger ? anime.stagger(value, options) : value
  } catch (error) {
    console.error("Error in stagger:", error)
    return value
  }
}

// Add random function that doesn't need to be async
safeAnime.random = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

// Add easing functions
safeAnime.easing = {
  easeInOutQuart: 'easeInOutQuart',
  easeOutBack: 'easeOutBack',
  easeInBack: 'easeInBack',
  easeOutQuart: 'easeOutQuart',
  easeInOutSine: 'easeInOutSine',
  easeInOutQuad: 'easeInOutQuad',
  easeInOutExpo: 'easeInOutExpo',
  easeOutExpo: 'easeOutExpo',
  easeOutQuad: 'easeOutQuad',
  easeOutElastic: 'easeOutElastic',
  spring: 'spring',
  linear: 'linear'
}

export default safeAnime
