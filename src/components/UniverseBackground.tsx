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

interface Planet {
  x: number;
  y: number;
  radius: number;
  color: string;
  ringColor?: string;
  hasRing: boolean;
  orbitSpeed: number;
  orbitAngle: number;
}

interface Comet {
  x: number;
  y: number;
  speed: number;
  angle: number;
  tailLength: number;
  active: boolean;
}

interface Asteroid {
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
}

interface UniverseBackgroundProps {
  isPlaying: boolean;
  intensity: number;
}

export const UniverseBackground = ({ isPlaying, intensity }: UniverseBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const nebulasRef = useRef<Nebula[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const cometsRef = useRef<Comet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
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

    // Initialize planets
    planetsRef.current = [
      { x: canvas.width * 0.15, y: canvas.height * 0.6, radius: 30, color: "#ff6b6b", hasRing: false, orbitSpeed: 0.001, orbitAngle: 0 },
      { x: canvas.width * 0.75, y: canvas.height * 0.25, radius: 45, color: "#4ecdc4", ringColor: "#ffd93d", hasRing: true, orbitSpeed: 0.0008, orbitAngle: Math.PI },
      { x: canvas.width * 0.9, y: canvas.height * 0.8, radius: 25, color: "#a855f7", hasRing: false, orbitSpeed: 0.0012, orbitAngle: Math.PI / 2 },
    ];

    // Initialize comets
    cometsRef.current = Array.from({ length: 5 }, () => ({
      x: -100,
      y: Math.random() * canvas.height,
      speed: 3 + Math.random() * 5,
      angle: Math.PI / 6 + Math.random() * (Math.PI / 6),
      tailLength: 80 + Math.random() * 120,
      active: false,
    }));

    // Initialize asteroid belt
    asteroidsRef.current = Array.from({ length: 100 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.8,
      y: canvas.height / 2 + (Math.random() - 0.5) * 100,
      size: 1 + Math.random() * 3,
      speed: 0.2 + Math.random() * 0.5,
      angle: Math.random() * Math.PI * 2,
    }));

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
        const hex = nebula.color.startsWith('#') ? nebula.color : `#${nebula.color}`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        const nebulaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.radius);
        nebulaGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 2})`);
        nebulaGrad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        nebulaGrad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
        nebulaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = nebulaGrad;
        ctx.beginPath();
        ctx.arc(0, 0, nebula.radius * (1 + Math.sin(time * 0.5) * 0.1 * intensityFactor), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Draw planets (appear more during intense moments)
      if (intensityFactor > 0.3) {
        planetsRef.current.forEach((planet) => {
          planet.orbitAngle += planet.orbitSpeed * (isPlaying ? 2 : 1);
          const planetAlpha = Math.min(1, (intensityFactor - 0.3) * 2);
          
          ctx.save();
          ctx.globalAlpha = planetAlpha;
          
          // Planet glow
          const glowGrad = ctx.createRadialGradient(
            planet.x, planet.y, 0,
            planet.x, planet.y, planet.radius * 2
          );
          const hex = planet.color.startsWith('#') ? planet.color : `#${planet.color}`;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          
          glowGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
          glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(planet.x, planet.y, planet.radius * 2, 0, Math.PI * 2);
          ctx.fill();

          // Planet body
          const planetGrad = ctx.createRadialGradient(
            planet.x - planet.radius * 0.3, planet.y - planet.radius * 0.3, 0,
            planet.x, planet.y, planet.radius
          );
          planetGrad.addColorStop(0, `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, 1)`);
          planetGrad.addColorStop(1, planet.color);
          ctx.fillStyle = planetGrad;
          ctx.beginPath();
          ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
          ctx.fill();

          // Ring (if has ring)
          if (planet.hasRing && planet.ringColor) {
            ctx.strokeStyle = planet.ringColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(planet.x, planet.y, planet.radius * 1.8, planet.radius * 0.4, Math.PI / 6, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.restore();
        });
      }

      // Draw asteroid belt during intense moments
      if (isPlaying && intensityFactor > 0.5) {
        const beltAlpha = (intensityFactor - 0.5) * 2;
        asteroidsRef.current.forEach((asteroid) => {
          asteroid.angle += asteroid.speed * 0.01;
          const centerX = width / 2;
          const centerY = height / 2;
          const orbitRadius = 200 + Math.sin(asteroid.angle * 3) * 50;
          
          asteroid.x = centerX + Math.cos(asteroid.angle) * orbitRadius;
          asteroid.y = centerY + Math.sin(asteroid.angle) * orbitRadius * 0.3;

          ctx.fillStyle = `rgba(180, 180, 180, ${beltAlpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw comets during very intense moments
      if (isPlaying && intensityFactor > 0.6) {
        cometsRef.current.forEach((comet, i) => {
          // Activate comets randomly
          if (!comet.active && Math.random() < 0.005 * intensityFactor) {
            comet.active = true;
            comet.x = -50;
            comet.y = Math.random() * height * 0.5;
          }

          if (comet.active) {
            comet.x += Math.cos(comet.angle) * comet.speed * intensityFactor;
            comet.y += Math.sin(comet.angle) * comet.speed * intensityFactor;

            // Draw comet tail
            const tailGrad = ctx.createLinearGradient(
              comet.x, comet.y,
              comet.x - Math.cos(comet.angle) * comet.tailLength,
              comet.y - Math.sin(comet.angle) * comet.tailLength
            );
            tailGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
            tailGrad.addColorStop(0.3, "rgba(0, 212, 255, 0.5)");
            tailGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.strokeStyle = tailGrad;
            ctx.lineWidth = 2 + i * 0.5;
            ctx.beginPath();
            ctx.moveTo(comet.x, comet.y);
            ctx.lineTo(
              comet.x - Math.cos(comet.angle) * comet.tailLength,
              comet.y - Math.sin(comet.angle) * comet.tailLength
            );
            ctx.stroke();

            // Comet head
            const headGrad = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 8);
            headGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
            headGrad.addColorStop(0.5, "rgba(0, 212, 255, 0.8)");
            headGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = headGrad;
            ctx.beginPath();
            ctx.arc(comet.x, comet.y, 8, 0, Math.PI * 2);
            ctx.fill();

            // Reset if off screen
            if (comet.x > width + 100 || comet.y > height + 100) {
              comet.active = false;
            }
          }
        });
      }

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
        shootGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        
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
