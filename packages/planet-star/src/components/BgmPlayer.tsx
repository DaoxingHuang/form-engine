import React, { useEffect, useRef, useState } from "react";
import { usePlanetStarStore } from "../usePlanetStarStore";

export const BgmPlayer: React.FC = () => {
  const { config } = usePlanetStarStore();
  const { bgmUrl } = config;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audioRef.current = audio;

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
      // Auto-play if it was playing before or if we want auto-play (optional, but browsers block it usually)
      // For now, we just wait for user interaction unless we were already playing
      if (isPlaying) {
        audio.play().catch((e) => {
          console.warn("Auto-play blocked", e);
          setIsPlaying(false);
        });
      }
    };

    const handleError = (e: Event) => {
      console.error("Audio error", e);
      setIsLoading(false);
      setError("Failed to load audio");
      setIsPlaying(false);
    };

    audio.addEventListener("canplaythrough", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("canplaythrough", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audioRef.current = null;
    };
  }, []);

  // Handle URL changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (!bgmUrl) {
      audioRef.current.pause();
      audioRef.current.src = "";
      setIsPlaying(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    audioRef.current.src = bgmUrl;
    audioRef.current.load();

    // If we were playing, try to continue playing the new track
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [bgmUrl]);

  // Toggle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current || !bgmUrl || error || isLoading) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.error("Play failed", e);
          // Often due to interaction policy
        });
    }
  };

  const isGrayed = !!error || !bgmUrl;
  const isDisabled = isGrayed || isLoading;

  return (
    <div className="relative group">
      <button
        onClick={togglePlay}
        disabled={isDisabled}
        className={`
          w-8 h-8 rounded-full flex items-center justify-center 
          transition-all duration-300 border border-white/10 backdrop-blur-md
          ${isGrayed ? "bg-gray-800 cursor-not-allowed opacity-70" : "bg-[#111827] hover:bg-gray-800 cursor-pointer shadow-[0_0_15px_rgba(233,30,99,0.3)] active:scale-95"}
          ${isPlaying ? "animate-[spin_3s_linear_infinite]" : ""}
        `}
        title={error || (!bgmUrl ? "No Music Configured" : isPlaying ? "Pause Music" : "Play Music")}
      >
        {/* Music Icon */}
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 ${isGrayed ? "grayscale opacity-50" : ""}`}
        >
          <path d="M405.333333 704m-192 0a192 192 0 1 0 384 0 192 192 0 1 0-384 0Z" fill="#E91E63"></path>
          <path d="M512 128v576h85.333333V298.666667l234.666667 64v-149.333334z" fill="#E91E63"></path>
        </svg>

        {/* Error Line */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-0.5 bg-red-500 rotate-45 transform scale-75"></div>
          </div>
        )}
      </button>

      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 border-2 border-t-transparent border-[#E91E63] rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
