"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Float, Text3D, Environment } from "@react-three/drei"
import { Suspense } from "react"

function AnimatedMicrophone() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={[0, 0, 0]}>
        {/* Microphone body */}
        <cylinderGeometry args={[0.3, 0.3, 1.5, 16]} />
        <meshStandardMaterial color="#6366f1" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        {/* Microphone head */}
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -1, 0]}>
        {/* Base */}
        <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
      </mesh>
    </Float>
  )
}

function FloatingText() {
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.3}
        height={0.05}
        position={[-1.5, 1, -1]}
        rotation={[0, 0.3, 0]}
      >
        தமிழ்
        <meshStandardMaterial color="#f59e0b" />
      </Text3D>
    </Float>
  )
}

function FloatingArrow() {
  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.4}>
      <mesh position={[0, 0.5, -1]} rotation={[0, 0, -Math.PI / 4]}>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
    </Float>
  )
}

function FloatingEnglishText() {
  return (
    <Float speed={1.3} rotationIntensity={0.2} floatIntensity={0.2}>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.25}
        height={0.05}
        position={[1, -0.5, -1]}
        rotation={[0, -0.3, 0]}
      >
        English
        <meshStandardMaterial color="#ef4444" />
      </Text3D>
    </Float>
  )
}

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent"></div>

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left space-y-6 z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            Tamil to English
            <span className="block text-3xl md:text-5xl lg:text-6xl mt-2">Audio Transcription</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl">
            Upload your Tamil or Tanglish audio files and get instant transcription and English translation with
            AI-powered accuracy.
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-sm font-medium text-white">MP3 Support</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-sm font-medium text-white">MP4 Support</span>
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-sm font-medium text-white">AI Powered</span>
            </div>
          </div>
        </div>

        <div className="h-96 lg:h-[500px] hidden md:block">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <Suspense fallback={null}>
              <Environment preset="studio" />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

              <AnimatedMicrophone />
              <FloatingText />
              <FloatingArrow />
              <FloatingEnglishText />

              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </section>
  )
}