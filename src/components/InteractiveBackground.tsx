import { useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

export default function InteractiveBackground() {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  
  // Smooth the mouse values for organic physics
  const smoothMouseX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    const handleMouseLeave = () => {
      // Return to a neutral position off-screen
      mouseX.set(-1000);
      mouseY.set(-1000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  // Generate 18 individual wavy lines to create the ribbon
  const lines = Array.from({ length: 18 }).map((_, i) => {
    const t = (i / 17) - 0.5; // ranges from -0.5 to 0.5
    
    return (
      <WaveLine 
        key={i} 
        t={t} 
        smoothMouseX={smoothMouseX} 
        smoothMouseY={smoothMouseY} 
        opacity={0.15 + ((i + 1) / 18) * 0.4} 
        strokeWidth={0.8 + ((i + 1) / 18) * 0.8}
      />
    );
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-80 mix-blend-multiply">
      <svg viewBox="0 0 1440 800" className="w-full h-full text-lime-500" preserveAspectRatio="none">
        {lines}
      </svg>
    </div>
  );
}

function WaveLine({ t, smoothMouseX, smoothMouseY, opacity, strokeWidth }: any) {
  const path = useTransform(() => {
    const mx = smoothMouseX.get();
    const my = smoothMouseY.get();
    
    let d = "";
    
    // We compute the path by taking small horizontal steps
    // 1440 width viewBox, step by 20 pixels for high smoothness
    for (let x = 0; x <= 1440; x += 20) {
      
      const freq = 0.0035; // frequency of the sine wave
      const baseY = 400; // middle of the 800h viewBox
      
      // base amplitude + some spread that depends on t
      // t * 0.5 creates a phase shift to make them twist like a 3D ribbon
      // t * 30 adds a slight vertical spread
      const baseWave = (150 + t * 100) * Math.sin(x * freq + t * 0.5) + t * 30;
      
      // Calculate pull towards mouse
      // We map screen mouse coordinates to viewBox coordinates roughly
      // We assume full screen width is roughly 1440 for the interaction radius
      const dist = Math.abs(x - mx);
      const pull = Math.max(0, 1 - dist / 400); // 400px interaction radius
      const easePull = pull * pull * (3 - 2 * pull); // smoothstep
      
      // mouse effect adds a displacement
      // the front strings (t > 0) get pulled slightly more for a 3D effect
      const mouseEffect = (my - baseY) * easePull * (0.5 + t * 0.3);
      
      const y = baseY + baseWave + mouseEffect;
      
      if (x === 0) {
        d += `M ${x},${y} `;
      } else {
        d += `L ${x},${y} `;
      }
    }
    
    return d;
  });

  return (
    <motion.path
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      opacity={opacity}
      d={path}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
