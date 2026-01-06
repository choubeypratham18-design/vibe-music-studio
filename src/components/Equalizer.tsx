import { useEffect, useRef } from "react";
import { AudioLines } from "lucide-react";

interface EqualizerProps {
  isPlaying: boolean;
  analyser?: AnalyserNode | null;
  piano: number;
  drums: number;
  bass: number;
  synth: number;
  harmony: number;
  rhythm: number;
}

export const Equalizer = ({
  isPlaying,
  analyser,
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
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize frequency data array if we have an analyser
    if (analyser && !frequencyDataRef.current) {
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    }

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

      // Get real frequency data if available
      let frequencyValues: number[] = [];
      
      if (analyser && frequencyDataRef.current && isPlaying) {
        analyser.getByteFrequencyData(frequencyDataRef.current);
        
        // Sample frequency bins to match our bar count
        const binSize = Math.floor(frequencyDataRef.current.length / barCount);
        for (let i = 0; i < barCount; i++) {
          let sum = 0;
          for (let j = 0; j < binSize; j++) {
            sum += frequencyDataRef.current[i * binSize + j];
          }
          frequencyValues.push((sum / binSize) / 255);
        }
      } else {
        // Fallback to simulated values based on instrument params
        const baseValues = [
          bass / 100, bass / 100, bass / 100, bass / 100,
          drums / 100, drums / 100, drums / 100, drums / 100,
          piano / 100, piano / 100, piano / 100, piano / 100,
          piano / 100, piano / 100, synth / 100, synth / 100,
          synth / 100, synth / 100, synth / 100, synth / 100,
          harmony / 100, harmony / 100, harmony / 100, harmony / 100,
          rhythm / 180, rhythm / 180, rhythm / 180, rhythm / 180,
          synth / 100, synth / 100, piano / 100, piano / 100,
        ];
        
        for (let i = 0; i < barCount; i++) {
          const variation = isPlaying ? (0.5 + Math.sin(time * (3 + i * 0.2)) * 0.5) : 0.05;
          frequencyValues.push(baseValues[i] * variation);
        }
      }

      // Draw bars with smooth animation
      frequencyValues.forEach((value, i) => {
        const targetHeight = isPlaying ? value * height * 0.85 : 3;
        
        // Smooth interpolation
        barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.2;
        const barHeight = Math.max(2, barsRef.current[i]);

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Create gradient based on frequency range
        const gradient = ctx.createLinearGradient(x, height, x, y);
        
        if (i < 8) {
          // Bass frequencies - Purple
          gradient.addColorStop(0, "rgba(147, 51, 234, 1)");
          gradient.addColorStop(0.5, "rgba(192, 38, 211, 0.8)");
          gradient.addColorStop(1, "rgba(147, 51, 234, 0.3)");
        } else if (i < 16) {
          // Low-mid frequencies - Pink
          gradient.addColorStop(0, "rgba(236, 72, 153, 1)");
          gradient.addColorStop(0.5, "rgba(219, 39, 119, 0.8)");
          gradient.addColorStop(1, "rgba(236, 72, 153, 0.3)");
        } else if (i < 24) {
          // High-mid frequencies - Blue
          gradient.addColorStop(0, "rgba(59, 130, 246, 1)");
          gradient.addColorStop(0.5, "rgba(37, 99, 235, 0.8)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.3)");
        } else {
          // High frequencies - Cyan
          gradient.addColorStop(0, "rgba(14, 165, 233, 1)");
          gradient.addColorStop(0.5, "rgba(6, 182, 212, 0.8)");
          gradient.addColorStop(1, "rgba(14, 165, 233, 0.3)");
        }

        // Draw bar with glow
        ctx.shadowColor = i < 8 ? "#9333ea" : i < 16 ? "#ec4899" : i < 24 ? "#3b82f6" : "#0ea5e9";
        ctx.shadowBlur = isPlaying ? 12 : 3;
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();

        // Peak indicator
        if (isPlaying && barHeight > height * 0.6) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#ffffff";
          ctx.fillRect(x, y, barWidth, 2);
        }
      });

      ctx.shadowBlur = 0;

      // Draw frequency labels
      if (isPlaying) {
        ctx.fillStyle = "hsl(280, 60%, 50%)";
        ctx.font = "9px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        
        const labels = ["20Hz", "100Hz", "1kHz", "10kHz"];
        const positions = [barWidth * 2, barWidth * 10, barWidth * 20, barWidth * 30];
        
        labels.forEach((label, i) => {
          ctx.fillText(label, positions[i], height - 2);
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analyser, piano, drums, bass, synth, harmony, rhythm]);

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2">
        <AudioLines className="w-4 h-4 text-ai-purple" />
        <h3 className="font-display text-xs font-semibold tracking-wider text-ai-purple">
          SPECTRUM ANALYZER
        </h3>
        {isPlaying && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-ai-pink/20 text-ai-pink text-[10px] font-display animate-pulse">
            ACTIVE
          </span>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-20 sm:h-24 rounded-lg bg-background/30"
        style={{ display: "block" }}
      />
      <div className="flex justify-between text-[9px] sm:text-[10px] text-muted-foreground font-display">
        <span className="text-ai-purple">BASS</span>
        <span className="text-ai-pink">MIDS</span>
        <span className="text-ai-blue">HIGH</span>
        <span className="text-ai-cyan">AIR</span>
      </div>
    </div>
  );
};
