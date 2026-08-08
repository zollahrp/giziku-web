"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-[#0B2219] text-white pt-24 pb-8 px-6 border-t border-white/5 overflow-hidden z-10">
      
      {/* BACKGROUND WATERMARK (Gaya Hero) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none opacity-[0.03] w-full overflow-hidden flex justify-center">
        <h1 className="text-[25vw] font-black tracking-tighter leading-none whitespace-nowrap">
          GIZIKU
        </h1>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/10">
          
          {/* BRAND COLUMN (Lebih Lebar) */}
          <div className="lg:col-span-4 space-y-6 lg:pr-10">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-10 h-10 rounded-full bg-white text-[#1A453A] flex items-center justify-center font-black text-xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                G
              </div>
              <span className="text-2xl font-black tracking-tight text-white transition-all duration-300">
                GIZIKU<span className="text-green-500">.AI</span>
              </span>
            </Link>
            
            <p className="text-sm text-green-50/60 leading-relaxed font-medium">
              Pendamping nutrisi personal berbasis AI terkini. Wujudkan pola hidup sehat yang terukur, realistis, dan berkelanjutan dari genggamanmu.
            </p>
            
            <div className="flex items-center gap-3 pt-4">
              <a href="#" className="group w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-green-500 hover:border-green-500 hover:text-[#0B2219] hover:-translate-y-1 transition-all duration-300 shadow-sm">
                <IconInstagram />
              </a>
              <a href="#" className="group w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-green-500 hover:border-green-500 hover:text-[#0B2219] hover:-translate-y-1 transition-all duration-300 shadow-sm">
                <IconTwitter />
              </a>
              <a href="#" className="group w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-green-500 hover:border-green-500 hover:text-[#0B2219] hover:-translate-y-1 transition-all duration-300 shadow-sm">
                <IconYoutube />
              </a>
            </div>
          </div>

          {/* NAV COLUMN 1 */}
          <div className="lg:col-span-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-green-500 mb-6">Produk</p>
            <ul className="space-y-4 text-sm text-green-50/70 font-semibold">
              <li>
                <a href="#about" className="inline-flex items-center gap-2 hover:text-white hover:translate-x-1.5 transition-all duration-300 group">
                  <span className="w-1 h-1 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Scan AI Kalori
                </a>
              </li>
              <li>
                <a href="#about" className="inline-flex items-center gap-2 hover:text-white hover:translate-x-1.5 transition-all duration-300 group">
                  <span className="w-1 h-1 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Katalog Resep
                </a>
              </li>
              <li>
                <a href="#about" className="inline-flex items-center gap-2 hover:text-white hover:translate-x-1.5 transition-all duration-300 group">
                  <span className="w-1 h-1 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  GiziBot Assistant
                </a>
              </li>
              <li>
                <a href="#pricing" className="inline-flex items-center gap-2 hover:text-white hover:translate-x-1.5 transition-all duration-300 group">
                  <span className="w-1 h-1 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Paket VIP <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] bg-green-500/20 text-green-400">PRO</span>
                </a>
              </li>
            </ul>
          </div>

          {/* NAV COLUMN 2 */}
          <div className="lg:col-span-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-green-500 mb-6">Perusahaan</p>
            <ul className="space-y-4 text-sm text-green-50/70 font-semibold">
              <li>
                <a href="#about" className="inline-flex items-center gap-2 hover:text-white hover:translate-x-1.5 transition-all duration-300 group">
                  <span className="w-1 h-1 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="inline-flex items-center gap-2 hover:text-white hover:translate-x-1.5 transition-all duration-300 group">
                  <span className="w-1 h-1 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Blog Nutrisi
                </a>
              </li>
              <li>
                <a href="#" className="inline-flex items-center gap-2 hover:text-white hover:translate-x-1.5 transition-all duration-300 group">
                  <span className="w-1 h-1 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Karir
                </a>
              </li>
              <li>
                <a href="#" className="inline-flex items-center gap-2 hover:text-white hover:translate-x-1.5 transition-all duration-300 group">
                  <span className="w-1 h-1 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* NEWSLETTER COLUMN */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-green-500 mb-2">Tips Sehat Mingguan</p>
            <p className="text-sm text-green-50/70 mb-5 font-medium">Dapatkan resep sehat & artikel gizi gratis setiap minggu langsung di inbox-mu.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Masukkan email kamu..." 
                className="w-full px-5 py-3.5 rounded-full bg-black/20 border border-white/10 text-sm text-white placeholder-green-100/40 focus:outline-none focus:border-green-500 focus:bg-black/40 transition-all duration-300"
              />
              <button className="relative overflow-hidden w-full py-3.5 bg-green-500 text-[#0B2219] font-black text-sm uppercase tracking-wide rounded-full shadow-[0_5px_20px_rgba(34,197,94,0.2)] hover:shadow-[0_8px_25px_rgba(34,197,94,0.4)] active:scale-95 transition-all duration-500 group/btn">
                {/* Shine Animation */}
                <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Berlangganan Sekarang
                </span>
              </button>
            </form>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-green-50/40">
          <p>© {new Date().getFullYear()} GIZIKU AI. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-green-400 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-green-400 transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconInstagram = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const IconTwitter = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const IconYoutube = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>;