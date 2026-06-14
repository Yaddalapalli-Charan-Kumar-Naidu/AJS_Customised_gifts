"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { ArrowRight, Gift, Sparkles as SparklesIcon, Star, Heart } from "lucide-react";
import { gsap } from "gsap";

// 3D Gift Box component with enhanced materials
function GiftBox({ position, color, scale = 1, rotationSpeed = 0.5 }: { position: [number, number, number]; color: string; scale?: number; rotationSpeed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.7}>
      <group position={position} scale={scale}>
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={color} 
            metalness={0.4} 
            roughness={0.3} 
            envMapIntensity={1}
          />
        </mesh>
        {/* Luxury Ribbon */}
        <mesh position={[0, 0, 0]} scale={1.02}>
          <boxGeometry args={[1.05, 0.2, 1.05]} />
          <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0]} scale={1.02} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.05, 0.2, 1.05]} />
          <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </Float>
  );
}

// Glowing orbs for background ambiance
function GlowingOrb({ position, color, size = 1 }: { position: [number, number, number]; color: string; size?: number }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={2} 
        transparent 
        opacity={0.15} 
      />
    </mesh>
  );
}

function HeroScene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
      <pointLight position={[-10, -10, -10]} color="#9B72CF" intensity={1} />
      
      {/* Dynamic 3D Elements */}
      <GiftBox position={[-2.5, 1.5, -2]} color="#E8748A" scale={0.9} rotationSpeed={0.4} />
      <GiftBox position={[3, 2, -1]} color="#9B72CF" scale={0.7} rotationSpeed={0.6} />
      <GiftBox position={[1.5, -2, 0]} color="#C9956A" scale={0.8} rotationSpeed={0.3} />
      <GiftBox position={[-4, -1.5, -1]} color="#F4A7B9" scale={0.6} rotationSpeed={0.5} />
      
      {/* Background Glows */}
      <GlowingOrb position={[-5, 2, -5]} color="#E8748A" size={3} />
      <GlowingOrb position={[5, -2, -5]} color="#9B72CF" size={4} />
      
      <Sparkles count={100} scale={10} size={1.2} speed={0.5} color="#FFD6E7" opacity={0.4} />
      <Environment preset="sunset" />
    </>
  );
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      
      tl.from(".hero-badge", { y: 20, opacity: 0, duration: 0.6, ease: "back.out(1.7)" })
        .from(".hero-title span", { 
          y: 80, 
          opacity: 0, 
          duration: 1, 
          stagger: 0.15, 
          ease: "expo.out" 
        }, "-=0.3")
        .from(".hero-description", { opacity: 0, x: -20, duration: 0.8 }, "-=0.6")
        .from(".hero-stats div", { opacity: 0, y: 20, stagger: 0.1, duration: 0.6 }, "-=0.4")
        .from(".hero-ctas > *", { scale: 0.8, opacity: 0, stagger: 0.15, duration: 0.6, ease: "back.out(2)" }, "-=0.2");
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A050F]">
      {/* Modern Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full" />
      </div>

      {/* 3D Visual Experience */}
      <div className="absolute inset-0 z-10 opacity-60 lg:opacity-100">
        <Canvas shadows gl={{ antialias: true, stencil: false, depth: true }}>
          <HeroScene />
        </Canvas>
      </div>

      {/* Main Glass Content Overlay */}
      <motion.div 
        style={{ y: y1, opacity }}
        className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            {/* Premium Badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-10 shadow-2xl">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0A050F] bg-gradient-to-br from-pink-400 to-purple-500" />
                ))}
              </div>
              <span className="text-xs font-bold tracking-widest text-pink-200 uppercase pl-2">
                Join 2k+ Happy Givers
              </span>
              <SparklesIcon className="w-3 h-3 text-yellow-400 animate-spin-slow" />
            </div>

            {/* Cinematic Heading */}
            <h1 ref={headingRef} className="hero-title">
              <span className="block font-display text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                Crafting
              </span>
              <span className="block font-display text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mt-4"
                style={{ background: "linear-gradient(to right, #F4A7B9, #E8748A, #9B72CF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Emotions
              </span>
              <div className="flex items-center gap-4 mt-6">
                <span className="font-script text-4xl sm:text-5xl lg:text-6xl text-pink-300 -rotate-3">
                  into Gifts
                </span>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-pink-500/50 to-transparent hidden sm:block" />
              </div>
            </h1>

            {/* Description */}
            <p className="hero-description mt-8 text-lg sm:text-xl text-white/60 leading-relaxed max-w-lg font-medium">
              We don't just deliver boxes; we deliver smiles. Personalized hampers handcrafted with love and delivered with care across India.
            </p>

            {/* Social Proof Stats */}
            <div className="hero-stats flex gap-10 mt-10 mb-12">
              {[
                { value: "10k+", label: "Deliveries", icon: <Gift className="w-4 h-4" /> },
                { value: "4.9", label: "Rating", icon: <Star className="w-4 h-4" /> },
                { value: "100%", label: "Joy", icon: <Heart className="w-4 h-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="group cursor-default">
                  <div className="flex items-center gap-2 text-white font-black text-2xl group-hover:text-pink-400 transition-colors">
                    {stat.value}
                    <span className="text-pink-500/50">{stat.icon}</span>
                  </div>
                  <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* High-Conversion CTAs */}
            <div className="hero-ctas flex flex-wrap gap-5">
              <Link href="/hampers">
                <button className="group relative px-10 py-5 rounded-2xl bg-white text-black font-black text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-purple-200 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                  <span className="relative flex items-center gap-3">
                    Start Customizing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
              
              <Link href="/category/all">
                <button className="px-10 py-5 rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-md text-white font-bold text-lg hover:bg-white/10 transition-all hover:border-white/20">
                  View Collections
                </button>
              </Link>
            </div>
          </div>

          {/* Right side visual placeholder / interaction area */}
          <div className="hidden lg:flex justify-end pointer-events-none select-none">
             <div className="relative w-full max-w-sm aspect-[4/5] rounded-[40px] border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl p-8 flex flex-col justify-end overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                   <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center blur-xl" />
                </div>
                <div className="space-y-4">
                   <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center shadow-luxury">
                      <SparklesIcon className="w-6 h-6 text-white" />
                   </div>
                   <h3 className="text-2xl font-black text-white">Luxury Finish</h3>
                   <p className="text-white/40 text-sm">Every hamper is hand-wrapped in premium silk ribbons and luxury paper.</p>
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Elegant Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
      >
        <div className="flex flex-col items-center gap-2">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Explore</span>
           <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
