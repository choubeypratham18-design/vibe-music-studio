import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

interface ParticleVisualizationProps {
  isPlaying: boolean;
  bpm: number;
  harmony: number;
  rhythm: number;
  texture: number;
  atmosphere: number;
}

export const ParticleVisualization = ({
  isPlaying,
  bpm,
  harmony,
  rhythm,
  texture,
  atmosphere,
}: ParticleVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles
    const particleCount = 150 + Math.floor(texture * 2);
    const colors = ["#00d4ff", "#ffd700", "#00ff88", "#ff6b6b"];
    
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.5 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      ctx.clearRect(0, 0, width, height);

      // Draw circular guides
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) * 0.4;

      // Outer rotating ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(Date.now() * 0.0001 * (bpm / 77));
      
      for (let i = 0; i < 3; i++) {
        const radius = maxRadius * (0.6 + i * 0.2);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 - i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // Draw central glow
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, maxRadius * 0.5
      );
      gradient.addColorStop(0, `rgba(0, 212, 255, ${0.1 * (atmosphere / 100)})`);
      gradient.addColorStop(0.5, `rgba(0, 212, 255, ${0.05 * (atmosphere / 100)})`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      const speedMultiplier = isPlaying ? (bpm / 77) * (rhythm / 50) : 0.3;
      
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX * speedMultiplier;
        particle.y += particle.speedY * speedMultiplier;

        // Attract to center based on harmony
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const attraction = (harmony / 100) * 0.02;
        particle.speedX += (dx / dist) * attraction;
        particle.speedY += (dy / dist) * attraction;

        // Boundary check
        if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > height) particle.speedY *= -1;

        // Draw particle with glow
        const pulseOpacity = particle.opacity * (0.8 + Math.sin(Date.now() * 0.003) * 0.2);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (1 + texture / 200), 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(")", `, ${pulseOpacity})`).replace("rgb", "rgba").replace("#", "");
        
        // Convert hex to rgba for fill
        const hex = particle.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulseOpacity})`;
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw connections between nearby particles
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 80 + (harmony / 2);

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - dist / maxDist) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, bpm, harmony, rhythm, texture, atmosphere]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      />
      
      {/* Central info panel */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="glass-panel px-6 py-4 text-center glow-box">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-primary text-lg">✦</span>
            <span className="font-display text-sm tracking-[0.3em] text-primary glow-text">
              REALITY ENGINE ACTIVE
            </span>
            <span className="text-primary text-lg">✦</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs">
            Manipulate the 4 elements to shape the musical reality.
            <br />
            Move TEXTURE to travel through time.
          </p>
        </div>
      </div>
    </div>
  );
};
