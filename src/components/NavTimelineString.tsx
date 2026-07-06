import { useRef, useEffect, useState } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface NavTimelineStringProps {
  scrollYProgress: MotionValue<number>;
}

export default function NavTimelineString({ scrollYProgress }: NavTimelineStringProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scrubber X in pixels
  const scrubX = useTransform(scrollYProgress, [0, 1], [0, width]);

  // Generate the SVG path
  const d = useTransform(scrubX, (x) => {
    const yDip = 16; // Very little dip (16 pixels)
    const dipWidth = 90; // Sharp curvature (90 pixels wide)

    // Clamp values to prevent backward bezier loops at the edges (x=0 and x=width)
    const startX = Math.max(0, x - dipWidth);
    const endX = Math.min(width, x + dipWidth);
    const cp1x = Math.max(0, x - dipWidth/2);
    const cp2x = Math.min(width, x + dipWidth/2);

    // Straight line at Y=0, then smooth curve down to the scrubber, then smooth curve back up
    return `M 0,0 
            L ${startX},0 
            C ${cp1x},0 ${cp1x},${yDip} ${x},${yDip} 
            C ${cp2x},${yDip} ${cp2x},0 ${endX},0 
            L ${width},0`;
  });

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-[60px] pointer-events-none">
      
      {/* Background String (Slate 200) */}
      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fadeLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0" />
            <stop offset="5%" stopColor="#cbd5e1" stopOpacity="1" />
            <stop offset="95%" stopColor="#cbd5e1" stopOpacity="1" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path 
          fill="none" 
          stroke="url(#fadeLine)" 
          strokeWidth="1.5" 
          d={d} 
          strokeLinecap="round"
        />
      </svg>

      {/* Foreground String (Lime 500) */}
      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
        <clipPath id="progressClip">
          <motion.rect x="0" y="-10" height="100" width={scrubX} />
        </clipPath>
        <motion.path 
          fill="none" 
          stroke="#84cc16" // lime-500
          strokeWidth="2" 
          d={d} 
          strokeLinecap="round"
          clipPath="url(#progressClip)"
        />
      </svg>
      
    </div>
  );
}
