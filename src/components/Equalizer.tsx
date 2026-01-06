import { useEffect, useRef } from "react";
import { AudioLines } from "lucide-react";

interface EqualizerProps {
  isPlaying: boolean;
  piano: number;
  drums: number;
  bass: number;
  synth: number;
  harmony: number;
  rhythm: number;
}

export const Equalizer = ({
  isPlaying,
  piano,
  drums,
  bass,
  synth,
  harmony,
  rhythm,
}: EqualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>(Array(32).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const barCount = 32;
      const barWidth = (width - (barCount - 1) * 2) / barCount;
      const time = Date.now() * 0.001;

      ctx.clearRect(0, 0, width, height);

      const baseValues = [
        bass / 100, bass / 100, bass / 100, bass / 100,
        drums / 100, drums / 100, drums / 100, drums / 100,
        piano / 100, piano / 100, piano / 100, piano / 100,
        piano / 100, piano / 100, synth / 100, synth / 100,
        synth / 100, synth / 100, synth / 100, synth / 100,
        harmony / 100, harmony / 100, harmony / 100, harmony / 100,
        rhythm / 100, rhythm / 100, rhythm / 100, rhythm / 100,
        synth / 100, synth / 100, piano / 100, piano / 100,
      ];

      barsRef.current.forEach((bar, i) => {
        const targetHeight = isPlaying
          ? baseValues[i] * height * 0.8 * (0.5 + Math.sin(time * (3 + i * 0.2)) * 0.5)
          : 3;

        barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.15;
        const barHeight = Math.max(2, barsRef.current[i]);

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        const gradient = ctx.createLinearGradient(x, height, x, y);
        
        if (i < 8) {
          gradient.addColorStop(0, "rgba(147, 51, 234, 0.9)");
          gradient.addColorStop(0.5, "rgba(236, 72, 153, 0.7)");
          gradient.addColorStop(1, "rgba(147, 51, 234, 0.4)");
        } else if (i < 16) {
          gradient.addColorStop(0, "rgba(236, 72, 153, 0.9)");
          gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.7)");
          gradient.addColorStop(1, "rgba(236, 72, 153, 0.4)");
        } else if (i < 24) {
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.9)");
          gradient.addColorStop(0.5, "rgba(14, 165, 233, 0.7)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.4)");
        } else {
          gradient.addColorStop(0, "rgba(14, 165, 233, 0.9)");
          gradient.addColorStop(0.5, "rgba(251, 191, 36, 0.7)");
          gradient.addColorStop(1, "rgba(14, 165, 233, 0.4)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();

        ctx.shadowColor = i < 8 ? "#9333ea" : i < 16 ? "#ec4899" : i < 24 ? "#3b82f6" : "#0ea5e9";
        ctx.shadowBlur = isPlaying ? 8 : 2;
      });

      ctx.shadowBlur = 0;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, piano, drums, bass, synth, harmony, rhythm]);

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2">
        <AudioLines className="w-4 h-4 text-ai-purple" />
        <h3 className="font-display text-xs font-semibold tracking-wider text-ai-purple">
          EQUALIZER
        </h3>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-16 sm:h-20 rounded-lg bg-background/30"
        style={{ display: "block" }}
      />
      <div className="flex justify-between text-[9px] sm:text-[10px] text-muted-foreground">
        <span>BASS</span>
        <span>MID</span>
        <span>HIGH</span>
      </div>
    </div>
  );
};
