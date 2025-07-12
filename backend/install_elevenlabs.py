#!/usr/bin/env python3
"""
Simple script to install ElevenLabs SDK
"""
import subprocess
import sys

def install_elevenlabs():
    try:
        print("📦 Installing ElevenLabs SDK...")
        result = subprocess.run([sys.executable, "-m", "pip", "install", "elevenlabs"], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ ElevenLabs SDK installed successfully!")
            print(result.stdout)
        else:
            print("❌ Failed to install ElevenLabs SDK:")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ Error installing ElevenLabs SDK: {e}")

if __name__ == "__main__":
    install_elevenlabs() 