import { useEffect, useRef } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import gsap from 'gsap';

export default function PageTransition() {
  const location = useLocation();
  const transitionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transitionRef.current) {
      // Start fully covering the screen, then sweep away upward
      gsap.fromTo(
        transitionRef.current,
        { scaleY: 1, transformOrigin: "top" },
        { scaleY: 0, duration: 0.7, ease: "power4.inOut", transformOrigin: "top" }
      );
    }
  }, [location.pathname]);

  return (
    <>
      {/* Transition sweep overlay — starts scaled down so it's invisible initially */}
      <div
        ref={transitionRef}
        className="fixed inset-0 z-[60] bg-slate-900 pointer-events-none"
        style={{ transform: "scaleY(0)", transformOrigin: "top" }}
      />
      {/* Page content */}
      <div className="min-h-screen">
        <Outlet />
      </div>
    </>
  );
}
