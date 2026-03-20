/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Prediction", path: "/prediction" },
  { name: "Contact Us", path: "/contact" },
  { name: "Login", path: "/login" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const magneticButtonRef = useRef<HTMLButtonElement>(null);
  const tl = useRef<gsap.core.Timeline>(null);

  // Close menu on route change — directly reverse the timeline, no setState cascade
  useEffect(() => {
    if (!isOpen) return;
    tl.current?.reverse().then(() => setIsOpen(false));
  }, [pathname]);

  // Magnetic button effect
  useGSAP(() => {
    if (!magneticButtonRef.current) return;

    const magneticObj = magneticButtonRef.current;
    const xTo = gsap.quickTo(magneticObj, "x", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
    const yTo = gsap.quickTo(magneticObj, "y", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = magneticObj.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distanceX = clientX - centerX;
      const distanceY = clientY - centerY;

      if (Math.abs(distanceX) < 80 && Math.abs(distanceY) < 80) {
        xTo(distanceX * 0.4);
        yTo(distanceY * 0.4);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    magneticObj.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      magneticObj.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Setup menu timeline
  useGSAP(
    () => {
      gsap.set(menuOverlayRef.current, { yPercent: -100 });

      tl.current = gsap
        .timeline({ paused: true })
        .to(menuOverlayRef.current, {
          yPercent: 0,
          duration: 0.8,
          ease: "power4.inOut",
        })
        .fromTo(
          menuLinksRef.current,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)",
          },
          "-=0.3",
        );
    },
    { scope: menuOverlayRef },
  );

  const toggleMenu = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
      tl.current?.play();
    } else {
      tl.current?.reverse().then(() => setIsOpen(false));
    }
  }, [isOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 px-6 py-6 md:px-12 flex justify-between items-center mix-blend-difference">
        <Link
          to="/"
          className="text-2xl md:text-3xl font-bold tracking-tighter text-white z-50"
        >
          &lt;Covid-19/&gt;
        </Link>
        <button
          ref={magneticButtonRef}
          onClick={toggleMenu}
          className="relative z-50 p-4 border border-white/20 rounded-full bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div
        ref={menuOverlayRef}
        className="fixed inset-0 z-30 bg-slate-900/80 backdrop-blur-2xl flex-col justify-center items-center h-screen w-full"
        style={{ display: isOpen ? "flex" : "none" }}
      >
        <nav className="flex flex-col gap-6 md:gap-8 items-center text-center">
          {NAV_LINKS.map((link, i) => (
            <div key={link.name} className="overflow-hidden">
              <Link
                to={link.path}
                ref={(el: HTMLAnchorElement | null) => {
                  menuLinksRef.current[i] = el;
                }}
                className="block text-4xl md:text-7xl font-bold uppercase tracking-widest text-outline transition-all duration-300 hover:-translate-y-2 hover:scale-105 inline-block"
              >
                {link.name}
              </Link>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-10 text-white/30 text-sm tracking-widest uppercase">
          Stay Safe. Stay Informed.
        </div>
      </div>
    </>
  );
}
