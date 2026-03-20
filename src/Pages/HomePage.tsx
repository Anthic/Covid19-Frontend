
import { useNavigate } from "react-router-dom";
import video from "../assets/video/Cinematic_Medical_Horror_Motion_Graphics.webm";

export default function HomePage() {
  const navigate = useNavigate();
  // const CLOUDINARY_EMBED_URL =
  //   "https://player.cloudinary.com/embed/?cloud_name=dgczshemc&public_id=Cinematic_Medical_Horror_Motion_Graphics_uhjpji&autoplay=true&loop=true&muted=true&controls=false&background=true&quality=auto";

  return (
    <div className="relative w-full min-h-screen flex overflow-hidden bg-black">

      {/* ══════════════════════════════
          LEFT HALF — Text & Buttons
      ══════════════════════════════ */}
      <div className="relative z-20 w-full md:w-[45%] min-h-screen flex flex-col justify-between items-start px-8 md:px-16 pt-36 pb-14">

        {/* Banner Text */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-wide uppercase leading-tight text-white drop-shadow-2xl">
            Predicting <br /> the Unseen
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-light tracking-[0.25em] uppercase max-w-sm">
            Understand patterns · Analyze side effects · Secure the future
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button 
            onClick={() => navigate("/prediction")}
            className="flex-1 px-6 py-4 rounded-full bg-white text-slate-900 font-bold text-base hover:bg-slate-100 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl"
          >
            Prediction
          </button>
          <button 
            onClick={() => navigate("/history")}
            className="flex-1 px-6 py-4 rounded-full bg-transparent border border-white/60 text-white font-semibold text-base backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            History
          </button>
        </div>
      </div>

      {/* ══════════════════════════════
          RIGHT HALF — Video Background
      ══════════════════════════════ */}
      {/* Video — takes 55% width, bleeds left with -ml so it overlaps behind text a little */}
      <div className="absolute md:relative inset-0 md:inset-auto w-full md:w-[55%] min-h-screen overflow-hidden z-0 md:-ml-[0%]">

        {/* Video Player */}
        <div className="absolute inset-0 pointer-events-none">
          <video
            src={video}
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover w-auto h-auto"
          />
        </div>

        {/* Strong black overlay to improve text readability */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Strong left gradient — blends video seamlessly into text side */}
        <div className="absolute inset-y-0 left-0 w-48 bg-linear-to-r from-black via-black/80 to-transparent z-20" />
      </div>

    </div>
  );
}
