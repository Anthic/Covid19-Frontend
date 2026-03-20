import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useLottie } from 'lottie-react';
import virusAnimation from '../../assets/lottie/Virus animation, Covid 19.json';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const { View } = useLottie({
    animationData: virusAnimation,
    loop: true,
    autoplay: true,
  });

  useEffect(() => {
    // QuickTo for better performance
    const xToCursor = gsap.quickTo(cursorRef.current, 'x', { duration: 0.6, ease: 'power3.out' });
    const yToCursor = gsap.quickTo(cursorRef.current, 'y', { duration: 0.6, ease: 'power3.out' });

    const handleMouseMove = (e: MouseEvent) => {
      // Offset by half of cursor width/height to center the Lottie on the mouse pointer
      xToCursor(e.clientX);
      yToCursor(e.clientY);
    };

    const handleHoverStart = () => setIsHovering(true);
    const handleHoverEnd = () => setIsHovering(false);

    const interactiveElements = document.querySelectorAll('a, button');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`pointer-events-none fixed left-0 top-0 z-[100] h-12 w-12 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out hidden md:block ${
        isHovering ? 'scale-150 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'scale-100'
      }`}
    >
      {View}
    </div>
  );
}
