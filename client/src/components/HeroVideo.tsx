import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { ArrowRight, Sprout } from "lucide-react";

const VIDEO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663539164565/SCcHJ9kMbHptCUSEK4niWe/hero-video_dc986c3a.mp4";

/**
 * Scroll-driven video hero.
 *
 * Architecture:
 * - The outer wrapper is `position: sticky; top: 0` so the video panel stays
 *   pinned while the tall scroll-track div scrolls behind it.
 * - A requestAnimationFrame loop reads `scrollY` and maps it to
 *   `video.currentTime` — no scroll event listeners, no jank.
 * - The scroll track height is `SCROLL_MULTIPLIER * 100vh`, giving us
 *   fine-grained control over how many pixels of scroll equal one second of video.
 * - On metadata load we know the video duration and can size the track correctly.
 * - The video is muted + playsInline so browsers allow it; we never call .play()
 *   — time is set directly, which is the most performant scrubbing technique.
 */

const SCROLL_MULTIPLIER = 1.5;

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(-1);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const trackHeight = duration > 0 ? `${duration * SCROLL_MULTIPLIER * 100}vh` : "500vh";

  const scrubVideo = useCallback(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section || duration === 0) return;

    const rect = section.getBoundingClientRect();
    const scrolled = -rect.top;
    const totalScrollable = rect.height - window.innerHeight;

    if (totalScrollable <= 0) return;

    const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
    const targetTime = progress * duration;

    setScrollProgress(progress);

    if (Math.abs(targetTime - lastTimeRef.current) > 0.01) {
      video.currentTime = targetTime;
      lastTimeRef.current = targetTime;
    }

    rafRef.current = requestAnimationFrame(scrubVideo);
  }, [duration]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(scrubVideo);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scrubVideo]);

  const handleMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    video.currentTime = 0;
    setLoaded(true);
  };

  return (
    <div
      ref={sectionRef}
      className="relative"
      style={{ height: trackHeight }}
    >
      {/* Sticky viewport-filling panel */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Video */}
        <video
          ref={videoRef}
          src={VIDEO_URL}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleMetadata}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ willChange: "transform" }}
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />

        {/* Hero content — fades out as user scrolls */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6"
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 3),
            transform: `translateY(${scrollProgress * -40}px)`,
            transition: "none",
          }}
        >
          <p className="text-[14px] font-medium tracking-[0.2em] uppercase text-white/70 mb-4 animate-fade-in-up animate-delay-100">
            Seja bem-vindo ao
          </p>
          <h1
            className="text-[clamp(2.2rem,5vw,3.5rem)] font-bold tracking-tight text-white animate-fade-in-up animate-delay-200 leading-tight"
            style={{ textShadow: "0 2px 40px rgba(0,0,0,0.3)" }}
          >
            Programa Organick
          </h1>

          {/* Two CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 animate-fade-in-up animate-delay-300">
            <Link href="/onboarding">
              <span className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-white text-black text-[15px] font-semibold hover:bg-white/90 active:scale-[0.97] transition-all shadow-lg shadow-black/20 cursor-pointer">
                <Sprout size={18} />
                Meu Primeiro Login
              </span>
            </Link>
            <Link href="/login">
              <span className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[15px] font-semibold hover:bg-white/25 active:scale-[0.97] transition-all cursor-pointer">
                Já tenho minha conta
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </div>

        {/* Scroll progress indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-white/20 relative overflow-hidden rounded-full">
            <div
              className="absolute top-0 left-0 w-full bg-white/70 rounded-full transition-none"
              style={{ height: `${scrollProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Loading skeleton */}
        {!loaded && (
          <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
