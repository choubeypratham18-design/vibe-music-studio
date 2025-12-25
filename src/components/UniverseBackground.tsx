import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

interface UniverseBackgroundProps {
  isPlaying: boolean;
  intensity: number; // 0-100, based on music parameters
}

export const UniverseBackground = ({ isPlaying, intensity }: UniverseBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const nebulasRef = useRef<Nebula[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize stars
    const starColors = [
      "#ffffff", "#00d4ff", "#ffd700", "#ff6b9d", "#00ff88", 
      "#a855f7", "#3b82f6", "#f97316"
    ];
    
    starsRef.current = Array.from({ length: 500 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      brightness: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // Initialize nebulas
    nebulasRef.current = [
      { x: canvas.width * 0.2, y: canvas.height * 0.3, radius: 300, color: "#00d4ff", rotation: 0, rotationSpeed: 0.0002 },
      { x: canvas.width * 0.8, y: canvas.height * 0.7, radius: 250, color: "#a855f7", rotation: Math.PI, rotationSpeed: -0.0003 },
      { x: canvas.width * 0.5, y: canvas.height * 0.5, radius: 400, color: "#ffd700", rotation: Math.PI / 2, rotationSpeed: 0.0001 },
    ];

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const time = Date.now() * 0.001;
      const intensityFactor = isPlaying ? (intensity / 100) : 0.3;

      // Clear with deep space gradient
      const bgGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height)
      );
      bgGradient.addColorStop(0, `hsl(240, 50%, ${3 + intensityFactor * 5}%)`);
      bgGradient.addColorStop(0.5, `hsl(260, 40%, ${2 + intensityFactor * 3}%)`);
      bgGradient.addColorStop(1, "hsl(220, 50%, 2%)");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw nebulas
      nebulasRef.current.forEach((nebula) => {
        nebula.rotation += nebula.rotationSpeed * (isPlaying ? 2 : 1);
        
        ctx.save();
        ctx.translate(nebula.x, nebula.y);
        ctx.rotate(nebula.rotation);

        const alpha = 0.03 + intensityFactor * 0.07;
        
        // Parse hex color (ensure it has # prefix)
        const hex = nebula.color.startsWith('#') ? nebula.color : `#${nebula.color}`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        const nebulaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.radius);
        nebulaGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 2})`);
        nebulaGrad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        nebulaGrad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
        nebulaGrad.addColorStop(1, "transparent");

        ctx.fillStyle = nebulaGrad;
        ctx.beginPath();
        ctx.arc(0, 0, nebula.radius * (1 + Math.sin(time * 0.5) * 0.1 * intensityFactor), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Draw shooting stars when playing
      if (isPlaying && Math.random() < 0.02 * intensityFactor) {
        const shootingX = Math.random() * width;
        const shootingY = Math.random() * height * 0.5;
        const length = 50 + Math.random() * 100;
        
        const shootGradient = ctx.createLinearGradient(
          shootingX, shootingY,
          shootingX + length, shootingY + length * 0.3
        );
        shootGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        shootGradient.addColorStop(1, "transparent");
        
        ctx.strokeStyle = shootGradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shootingX, shootingY);
        ctx.lineTo(shootingX + length, shootingY + length * 0.3);
        ctx.stroke();
      }

      // Draw stars
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed * (isPlaying ? 3 : 1) + star.twinkleOffset);
        const currentBrightness = star.brightness * (0.5 + twinkle * 0.5);
        const size = star.size * (1 + intensityFactor * 0.5);

        // Parse star color (ensure it has # prefix)
        const hex = star.color.startsWith('#') ? star.color : `#${star.color}`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        // Glow effect
        const glowRadius = size * (2 + intensityFactor * 3);
        const glowGradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, glowRadius
        );
        glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentBrightness})`);
        glowGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${currentBrightness * 0.3})`);
        glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, currentBrightness + 0.3)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw galaxy spiral in center when playing intensely
      if (isPlaying && intensityFactor > 0.5) {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(time * 0.1);

        for (let arm = 0; arm < 3; arm++) {
          const armAngle = (arm / 3) * Math.PI * 2;
          
          for (let i = 0; i < 50; i++) {
            const distance = i * 5;
            const angle = armAngle + (i * 0.15);
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const starSize = (1 - i / 50) * 2 + 0.5;
            const alpha = (1 - i / 50) * 0.5 * (intensityFactor - 0.5) * 2;

            ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, starSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
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
  }, [isPlaying, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
