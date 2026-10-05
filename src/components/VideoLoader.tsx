import React, { useEffect, useRef, useState } from 'react';

interface VideoLoaderProps {
  onStartEntering?: () => void;
  onComplete: () => void;
}

export const VideoLoader: React.FC<VideoLoaderProps> = ({ onStartEntering, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDissolving, setIsDissolving] = useState(false);
  const hasStartedEnteringRef = useRef(false);
  const hasFinishedRef = useRef(false);

  const enteringThreshold = 3.0; // Trigger page zoom-in slightly before video ends for continuous blend
  const cutoffThreshold = 3.85; // Start dissolving video

  const triggerEntering = () => {
    if (hasStartedEnteringRef.current) return;
    hasStartedEnteringRef.current = true;
    if (onStartEntering) {
      onStartEntering();
    }
  };

  const handleFinish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    triggerEntering();
    setIsDissolving(true);

    setTimeout(() => {
      onComplete();
    }, 850);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Track playback time for continuous cross-blending
    const onTimeUpdate = () => {
      if (video.currentTime >= enteringThreshold) {
        triggerEntering();
      }
      if (video.currentTime >= cutoffThreshold) {
        handleFinish();
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', handleFinish);
    video.addEventListener('error', handleFinish);

    // Safety timeout in case of network/loading stall
    const safetyTimer = setTimeout(() => {
      triggerEntering();
      handleFinish();
    }, 5500);

    // Audio and Autoplay Attempt
    video.muted = false;
    video.volume = 1.0;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Browser autoplay policy: play muted, unlock audio on first touch
        video.muted = true;
        video.play().catch(() => handleFinish());

        const unlockAudio = () => {
          video.muted = false;
          window.removeEventListener('pointerdown', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
          window.removeEventListener('click', unlockAudio);
        };
        window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
        window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
        window.addEventListener('click', unlockAudio, { once: true, passive: true });
      });
    }

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', handleFinish);
      video.removeEventListener('error', handleFinish);
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-black flex items-center justify-center overflow-hidden transition-all duration-900 ease-out select-none ${
        isDissolving ? 'opacity-0 filter blur-2xl scale-110 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-cover pointer-events-none select-none"
          playsInline
          webkit-playsinline="true"
          preload="auto"
        >
          <source src="/assets/helmet_loading.mp4" type="video/mp4" />
          <source src="/assets/Helmet_animation_.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Subtle bottom telemetry stamp matching official poster */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest text-[#D4FF00]/60 pointer-events-none">
        CODE MEET 2026 // INITIALIZING MISSION TELEMETRY
      </div>
    </div>
  );
};

export default VideoLoader;
