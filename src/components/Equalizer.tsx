import { useEffect, useRef } from "react";

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

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const barCount = 32;
      const barWidth = (width - (barCount - 1) * 2) / barCount;
      const time = Date.now() * 0.001;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate target heights based on instrument values
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
          : 5;

        // Smooth animation
        barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.15;
        const barHeight = Math.max(3, barsRef.current[i]);

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, height, x, y);
        
        // Color based on frequency range
        if (i < 8) {
          // Bass - purple/magenta
          gradient.addColorStop(0, "rgba(168, 85, 247, 0.9)");
          gradient.addColorStop(0.5, "rgba(236, 72, 153, 0.7)");
          gradient.addColorStop(1, "rgba(168, 85, 247, 0.4)");
        } else if (i < 16) {
          // Mid-low - cyan
          gradient.addColorStop(0, "rgba(0, 212, 255, 0.9)");
          gradient.addColorStop(0.5, "rgba(34, 211, 238, 0.7)");
          gradient.addColorStop(1, "rgba(0, 212, 255, 0.4)");
        } else if (i < 24) {
          // Mid-high - green
          gradient.addColorStop(0, "rgba(0, 255, 136, 0.9)");
          gradient.addColorStop(0.5, "rgba(52, 211, 153, 0.7)");
          gradient.addColorStop(1, "rgba(0, 255, 136, 0.4)");
        } else {
          // High - yellow/gold
          gradient.addColorStop(0, "rgba(255, 215, 0, 0.9)");
          gradient.addColorStop(0.5, "rgba(251, 191, 36, 0.7)");
          gradient.addColorStop(1, "rgba(255, 215, 0, 0.4)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();

        // Glow effect
        ctx.shadowColor = i < 8 ? "#a855f7" : i < 16 ? "#00d4ff" : i < 24 ? "#00ff88" : "#ffd700";
        ctx.shadowBlur = isPlaying ? 10 : 3;
      });

      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, piano, drums, bass, synth, harmony, rhythm]);

  return (
    <div className="glass-panel p-4 space-y-3">
      <h3 className="font-display text-sm font-semibold tracking-wider text-primary glow-text">
        EQUALIZER
      </h3>
      <canvas
        ref={canvasRef}
        width={320}
        height={80}
        className="w-full h-20 rounded-lg bg-background/30"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>BASS</span>
        <span>MID</span>
        <span>HIGH</span>
      </div>
    </div>
  );
};
