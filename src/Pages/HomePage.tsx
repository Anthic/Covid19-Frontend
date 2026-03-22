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
      <div className="relative z-20 w-full md:w-[50%] lg:w-[45%] min-h-screen flex flex-col justify-center items-start px-6 sm:px-12 md:px-16 py-20 gap-10 md:gap-14">
        {/* Banner Text */}
        <div className="flex flex-col gap-5 md:gap-7 mt-12 md:mt-0">
          <h1 className="text-4xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-7xl font-black tracking-tighter uppercase leading-[1.1] text-white drop-shadow-2xl">
            Predicting <br />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">
              the Unseen
            </span>
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-slate-300 font-medium tracking-[0.15em] sm:tracking-[0.25em] uppercase max-w-xs sm:max-w-md lg:max-w-xl leading-relaxed">
            Understand patterns{" "}
            <span className="mx-1 sm:mx-2 text-slate-500">•</span> Analyze side
            effects <span className="mx-1 sm:mx-2 text-slate-500">•</span>{" "}
            Secure the future
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-sm lg:max-w-md">
          <button
            onClick={() => navigate("/prediction")}
            className="flex-1 px-6 py-3 sm:py-3.5 rounded-full bg-white text-slate-900 font-bold text-sm sm:text-base hover:bg-slate-100 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            Prediction
          </button>
          <button
            onClick={() => navigate("/history")}
            className="flex-1 px-6 py-3 sm:py-3.5 rounded-full bg-slate-900/40 border border-white/30 text-white font-semibold text-sm sm:text-base backdrop-blur-md hover:bg-white/10 hover:border-white/60 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            History
          </button>
        </div>
      </div>

      {/* ══════════════════════════════
          RIGHT HALF — Video Background
      ══════════════════════════════ */}
      {/* Video — takes 55% width, bleeds left with -ml so it overlaps behind text a little */}
      <div className="absolute md:relative inset-0 md:inset-auto w-full min-h-screen overflow-hidden z-0 md:-ml-[0%]">
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

        {/* Soft black overlay to improve text readability */}
        <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

        {/* Strong left gradient covering text side — blends video seamlessly */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[60%] lg:w-[50%] bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
      </div>
    </div>
  );
}
