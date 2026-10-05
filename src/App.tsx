import React, { useEffect, useState, Suspense, lazy } from 'react';
import Lenis from 'lenis';
import { SceneCanvas } from './three/SceneCanvas';
import { VideoLoader } from './components/VideoLoader';
import { CodeRainEasterEgg } from './components/CodeRainEasterEgg';
import { Navbar, sfx } from './components/Navbar';
import { HeroSection } from './sections/HeroSection';
import { MarqueeSection } from './sections/MarqueeSection';
import { AboutSection } from './sections/AboutSection';
import { EventsSection } from './sections/EventsSection';
import { TheDescentSection } from './sections/TheDescentSection';
import { TracksSection } from './sections/TracksSection';
import { PrizesSection } from './sections/PrizesSection';
import { ScheduleSection } from './sections/ScheduleSection';
import { FaqSection } from './sections/FaqSection';
import { PartnersSection } from './sections/PartnersSection';
import { FinalCtaSection } from './sections/FinalCtaSection';
import { ContactSection } from './sections/ContactSection';
import { Footer } from './components/Footer';
import { EVENT_CONFIG } from './data/content';
import { ArrowUpRight } from 'lucide-react';

// Lazy-load the Spline Robot Companion
const RobotCompanion = lazy(() => import('./components/RobotCompanion'));

export const App: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [entrancePhase, setEntrancePhase] = useState<'loading' | 'entering' | 'ready'>('loading');

  const isEntering = entrancePhase !== 'loading';

  useEffect(() => {
    // Initialize Lenis smooth inertial scrolling
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', (e: { progress: number }) => {
      setScrollProgress(e.progress);
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030304] text-white overflow-x-hidden selection:bg-[#D4FF00] selection:text-black">
      
      {/* 1. Official AI Video Loading Screen with seamless cross-fade blend */}
      {entrancePhase !== 'ready' && (
        <VideoLoader
          onStartEntering={() => setEntrancePhase('entering')}
          onComplete={() => setEntrancePhase('ready')}
        />
      )}

      {/* 2. Easter Egg: Typing 'code' triggers lime matrix rain */}
      <CodeRainEasterEgg />

      {/* 3. Decoupled 3D Canvas Container: Fixed, inset-0, z-index 1, pointer-events: none */}
      <div className="fixed inset-0 w-screen h-screen z-[1] pointer-events-none overflow-hidden">
        <SceneCanvas scrollProgress={scrollProgress} isEntering={isEntering} />
        <Suspense fallback={null}>
          <RobotCompanion scrollProgress={scrollProgress} isEntering={isEntering} />
        </Suspense>
      </div>

      {/* 4. HTML Content Layer: z-index 10, pointer-events: auto (100% Clickable & Interactive) */}
      <div className="relative z-10 w-full pointer-events-auto">
        <Navbar scrollProgress={scrollProgress} />
        <HeroSection isEntering={isEntering} />
        <MarqueeSection />
        <AboutSection />
        <EventsSection />
        <TheDescentSection />
        <TracksSection />
        <PrizesSection />
        <ScheduleSection />
        <FaqSection />
        <PartnersSection />
        <FinalCtaSection />
        <ContactSection />
        <Footer />
      </div>

      {/* 5. Mobile Sticky Bottom Registration Bar (Shown after Hero, hides at Final CTA) */}
      {scrollProgress > 0.08 && scrollProgress < 0.86 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-[#D4FF00]/30 px-4 py-3 flex items-center justify-between lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.85)] animate-fadeIn">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#D4FF00] font-bold tracking-wider">// CODE MEET 2026</span>
            <span className="text-xs font-bold font-techno text-white">24H HACKATHON • ₹50K</span>
          </div>
          <a
            href={EVENT_CONFIG.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sfx.playClick()}
            data-robot-target="register"
            className="px-5 py-2.5 rounded-lg bg-[#D4FF00] text-black font-techno text-xs font-black tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_#D4FF00] active:scale-95 transition-all"
          >
            <span>REGISTER</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>
        </div>
      )}

    </div>
  );
};

export default App;
