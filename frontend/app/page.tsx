"use client"

import { useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { HeroSection } from "@/components/hero-section"
import { UploadSection } from "@/components/upload-section"
import { ProgressFlow } from "@/components/progress-flow"
import { ResultSection } from "@/components/result-section"
import { Footer } from "@/components/footer"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState("")
  const [translation, setTranslation] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setCurrentStep(1)
    setIsProcessing(true)

    // Simulate transcription process
    setTimeout(() => {
      setTranscription("வணக்கம், இது ஒரு சோதனை செய்தி. நான் தமிழில் பேசுகிறேன்.")
      setCurrentStep(2)

      // Simulate translation process
      setTimeout(() => {
        setTranslation("Hello, this is a test message. I am speaking in Tamil.")
        setCurrentStep(3)
        setIsProcessing(false)
      }, 2000)
    }, 3000)
  }

  const resetApp = () => {
    setCurrentStep(0)
    setUploadedFile(null)
    setTranscription("")
    setTranslation("")
    setIsProcessing(false)
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-all duration-500">
        {/* Subtle SVG dot-pattern background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10">
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>

          <HeroSection />

          <div className="container mx-auto px-4 py-8 space-y-12">
            <ProgressFlow currentStep={currentStep} isProcessing={isProcessing} />

            {currentStep === 0 && <UploadSection onFileUpload={handleFileUpload} />}

            {currentStep > 0 && (
              <ResultSection
                file={uploadedFile}
                transcription={transcription}
                translation={translation}
                currentStep={currentStep}
                isProcessing={isProcessing}
                onReset={resetApp}
              />
            )}
          </div>

          <Footer />
        </div>
      </div>
    </ThemeProvider>
  )
}
