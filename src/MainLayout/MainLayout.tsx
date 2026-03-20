import { useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import CustomCursor from "../components/common/CustomCursor";
import SmoothScroll from "../components/common/SmoothScroll";
import PageTransition from "../components/common/PageTransition";

// Pages where Footer should NOT appear
const HIDE_FOOTER_ON = ["/"];

export default function MainLayout() {
  const { pathname } = useLocation();
  const showFooter = !HIDE_FOOTER_ON.includes(pathname);

  return (
    <SmoothScroll>
      <div className="bg-slate-900 min-h-screen text-slate-50 selection:bg-slate-800 selection:text-white">
        <CustomCursor />
        <Navbar />
        <PageTransition />
        {showFooter && <Footer />}
      </div>
    </SmoothScroll>
  );
}
