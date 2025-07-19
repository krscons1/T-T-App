"use client"

import { useEffect, useRef, useState } from "react"
import { MorphingLogo } from "@/components/morphing-logo"

interface AdvancedLoadingScreenProps {
  onLoadComplete?: () => void
}

export function AdvancedLoadingScreen({ onLoadComplete }: AdvancedLoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("Initializing")
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const loadingStages = [
    "Initializing AI Engine",
    "Loading Data",
    "Optimizing Performance",
    "Finalizing Setup"
  ];

  useEffect(() => {
    if (progressBarRef.current) {
      import('animejs').then((mod) => {
        (mod.default || mod)({
          targets: progressBarRef.current,
          width: `${progress}%`,
          easing: "easeInOutQuad",
          duration: 500,
        });
      });
    }
  }, [progress]);

  useEffect(() => {
    let stage = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 25;
        }
        return prev;
      });
      setLoadingText(loadingStages[stage]);
      stage++;
      if (stage >= loadingStages.length) {
        clearInterval(interval);
        setTimeout(() => {
          onLoadComplete && onLoadComplete();
        }, 500);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  return (
    <div ref={containerRef} className="loading-screen">
      <MorphingLogo />
      <div className="progress-bar-container">
        <div ref={progressBarRef} className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div ref={textRef} className="loading-text">
        {loadingText}
      </div>
    </div>
  );
}