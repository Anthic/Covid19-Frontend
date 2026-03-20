export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-slate-950 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600 tracking-widest uppercase">
        <span>
          &copy; {new Date().getFullYear()} <span className="text-slate-400 font-semibold">Anthic</span> &mdash; All rights reserved.
        </span>
        <span>
          Unauthorized copying or redistribution of this site&apos;s content is strictly prohibited.
        </span>
      </div>
    </footer>
  );
}
