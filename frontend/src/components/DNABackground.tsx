import React, { useEffect, useRef } from 'react';

interface DNABackgroundProps {
  className?: string;
  color1?: string;
  color2?: string;
  speed?: number;
}

const DNABackground: React.FC<DNABackgroundProps> = ({
  className = "",
  color1 = "rgba(59, 130, 246, 0.4)", 
  color2 = "rgba(6, 182, 212, 0.4)",
  speed = 0.002
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    // Helix parameters
    const nodesCount = 45;
    const helixRadius = 140;
    let angle = 0;

    const drawHelix = (offsetX: number, scale: number, rotationSpeed: number, color: string, rotationOffset: number) => {
      for (let i = 0; i < nodesCount; i++) {
        const y = (i / nodesCount) * height;
        const currentAngle = (angle * rotationSpeed) + (i * 0.3) + rotationOffset;
        
        // Mouse influence
        const distToMouse = Math.sqrt(Math.pow(mouseRef.current.x - offsetX, 2) + Math.pow(mouseRef.current.y - y, 2));
        const mouseEffect = Math.max(0, 1 - distToMouse / 500) * 40;
        
        // Strand 1
        const x1 = offsetX + Math.cos(currentAngle) * (helixRadius * scale + mouseEffect);
        const z1 = Math.sin(currentAngle) * helixRadius * scale;
        
        // Strand 2 (180 degrees offset)
        const x2 = offsetX + Math.cos(currentAngle + Math.PI) * (helixRadius * scale + mouseEffect);
        const z2 = Math.sin(currentAngle + Math.PI) * helixRadius * scale;

        // Depth perspective (0.1 to 1.0)
        const s1 = (z1 + helixRadius * scale) / (helixRadius * scale * 2) * 0.7 + 0.3;
        const s2 = (z2 + helixRadius * scale) / (helixRadius * scale * 2) * 0.7 + 0.3;

        // Draw connections
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(x1, y, x2, y);
        gradient.addColorStop(0, color.replace('0.4', (0.1 * s1).toString()));
        gradient.addColorStop(1, color.replace('0.4', (0.1 * s2).toString()));
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 * scale;
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // Draw nodes
        const nodeSize = 4 * scale;
        
        // Node 1
        ctx.fillStyle = color.replace('0.4', (s1 * 0.6).toString());
        ctx.beginPath();
        ctx.arc(x1, y, nodeSize * s1, 0, Math.PI * 2);
        ctx.fill();
        
        // Subtle glow for front nodes
        if (s1 > 0.8) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = color;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Node 2
        ctx.fillStyle = color.replace('0.4', (s2 * 0.6).toString());
        ctx.beginPath();
        ctx.arc(x2, y, nodeSize * s2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      angle += 0.5;

      // Draw background layer
      drawHelix(width * 0.5, 0.4, 0.01, "rgba(147, 197, 253, 0.3)", 0);
      
      // Draw side layers
      drawHelix(width * 0.1, 0.7, 0.02, color1.replace('0.4', '0.6'), Math.PI / 4);
      drawHelix(width * 0.9, 0.9, 0.015, color2.replace('0.4', '0.6'), -Math.PI / 4);
      
      // Draw foreground layers
      drawHelix(width * 0.3, 0.3, 0.01, "rgba(103, 232, 249, 0.25)", Math.PI / 2);
      drawHelix(width * 0.7, 0.5, 0.012, "rgba(165, 180, 252, 0.25)", -Math.PI / 2);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color1, color2, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-[-1] opacity-60 ${className}`}
      style={{ filter: 'blur(0.5px)' }}
    />
  );
};

export default DNABackground;
