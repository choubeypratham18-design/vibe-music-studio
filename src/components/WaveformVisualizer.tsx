import { useEffect, useRef } from "react";
import { Activity } from "lucide-react";

interface WaveformVisualizerProps {
  isPlaying: boolean;
  analyser: AnalyserNode | null;
  piano: number;
  drums: number;
  bass: number;
  synth: number;
}

export const WaveformVisualizer = ({
  isPlaying,
  analyser,
  piano,
  drums,
  bass,
  synth,
}: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

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

    const draw = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Clear canvas
      ctx.fillStyle = "rgba(10, 15, 25, 0.3)";
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        // Draw waveform based on instrument values
        const intensity = (piano + drums + bass + synth) / 400;
        const time = Date.now() / 1000;

        // Main waveform
        ctx.beginPath();
        ctx.strokeStyle = `hsl(280, 100%, 70%)`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(280, 100%, 60%)`;

        for (let x = 0; x < width; x++) {
          const frequency1 = 0.02 + (bass / 5000);
          const frequency2 = 0.05 + (synth / 3000);
          const amplitude1 = (height / 4) * (drums / 100) * intensity;
          const amplitude2 = (height / 6) * (piano / 100) * intensity;

          const y =
            height / 2 +
            Math.sin(x * frequency1 + time * 3) * amplitude1 +
            Math.sin(x * frequency2 + time * 5) * amplitude2 +
            Math.sin(x * 0.01 + time * 2) * (height / 8) * intensity;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Secondary waveform
        ctx.beginPath();
        ctx.strokeStyle = `hsl(200, 100%, 60%)`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = `hsl(200, 100%, 50%)`;

        for (let x = 0; x < width; x++) {
          const frequency = 0.03 + (synth / 4000);
          const amplitude = (height / 5) * (piano / 100) * intensity;

          const y =
            height / 2 +
            Math.cos(x * frequency + time * 4) * amplitude +
            Math.sin(x * 0.015 - time * 3) * (height / 10) * intensity;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Tertiary accent waveform
        ctx.beginPath();
        ctx.strokeStyle = `hsl(320, 100%, 65%)`;
        ctx.lineWidth = 1;
        ctx.shadowColor = `hsl(320, 100%, 55%)`;

        for (let x = 0; x < width; x++) {
          const frequency = 0.04 + (drums / 6000);
          const amplitude = (height / 7) * (bass / 100) * intensity;

          const y =
            height / 2 +
            Math.sin(x * frequency - time * 2.5) * amplitude;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Center line
        ctx.beginPath();
        ctx.strokeStyle = "hsl(280, 60%, 30%)";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.setLineDash([5, 10]);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Idle state - subtle animation
        const time = Date.now() / 2000;
        ctx.beginPath();
        ctx.strokeStyle = "hsl(280, 40%, 30%)";
        ctx.lineWidth = 1;

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.02 + time) * 5;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Idle text
        ctx.fillStyle = "hsl(280, 40%, 40%)";
        ctx.font = "12px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("AUDIO OUTPUT", width / 2, height / 2 + 30);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analyser, piano, drums, bass, synth]);

  return (
    <div className="glass-panel p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-ai-purple" />
        <h3 className="font-display text-xs font-semibold tracking-wider text-ai-purple">
          WAVEFORM OUTPUT
        </h3>
        {isPlaying && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-ai-purple/20 text-ai-purple text-[10px] font-display animate-pulse">
            LIVE
          </span>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-20 sm:h-24 rounded-lg bg-background/50"
        style={{ display: "block" }}
      />
    </div>
  );
};
