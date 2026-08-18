"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  
  // Sembunyikan footer jika berada di halaman dashboard/portal
  if (pathname?.startsWith('/portal-kdh') || pathname?.startsWith('/dashboard')) {
    return null; 
  }

  return (
    <footer className="w-full bg-white relative overflow-hidden">
      
      {/* Garis gradien super tipis pemisah section (Warna Gizify) */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#1A453A]/20 to-transparent" />
      
      {/* Ambient Glow Tipis di background footer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#1A453A]/[0.03] blur-[100px] pointer-events-none" />

      <div className="w-full pt-20 pb-12 px-6 md:px-8 border-b border-gray-100 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
            
            {/* LEFT - Logo & Deskripsi */}
            <div className="md:col-span-4 space-y-6">
              <Link href="/" className="flex items-center gap-2 group w-fit">
                <div className="w-10 h-10 rounded-full bg-[#1A453A] text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform duration-500">
                  G
                </div>
                <span className="text-2xl font-black tracking-tight text-gray-900 transition-all duration-300">
                  GIZIFY<span className="text-green-600">.AI</span>
                </span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed font-medium max-w-sm">
                Pendamping nutrisi personal berbasis AI terkini. Wujudkan pola hidup sehat yang terukur, realistis, dan berkelanjutan dari genggamanmu.
              </p>
            </div>

            {/* MIDDLE - Navigation Links */}
            <div className="md:col-span-4 grid grid-cols-2 gap-6 lg:pl-12">
              <div className="space-y-6">
                <h3 className="font-black tracking-wide text-gray-900 uppercase text-xs">Produk</h3>
                <ul className="space-y-4">
                  <li><a href="#about" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Scan AI Kalori</a></li>
                  <li><a href="#about" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Katalog Resep</a></li>
                  <li><a href="#about" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">GiziBot Assistant</a></li>
                  <li>
                    <a href="#pricing" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-flex items-center gap-1.5">
                      Paket VIP <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-100 text-green-700">PRO</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <h3 className="font-black tracking-wide text-gray-900 uppercase text-xs">Perusahaan</h3>
                <ul className="space-y-4">
                  <li><a href="#about" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Tentang Kami</a></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Blog Nutrisi</a></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Karir</a></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Kontak</a></li>
                </ul>
              </div>
            </div>

            {/* RIGHT - Newsletter (Disesuaikan ke tema Clean) */}
            <div className="md:col-span-4 space-y-6 lg:pl-12">
              <h3 className="font-black tracking-wide text-gray-900 uppercase text-xs">Tips Sehat Mingguan</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Dapatkan resep sehat & artikel gizi gratis setiap minggu langsung di inbox-mu.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                <input
                  type="email"
                  placeholder="Masukkan email kamu..."
                  className="w-full px-5 py-3.5 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A453A] focus:bg-white transition-all duration-300"
                />
                <button className="relative overflow-hidden w-full py-3.5 bg-[#1A453A] text-white font-bold text-sm uppercase tracking-wide rounded-full shadow-[0_5px_20px_rgba(26,69,58,0.2)] hover:shadow-[0_8px_25px_rgba(26,69,58,0.3)] active:scale-95 transition-all duration-500 group/btn">
                  {/* Shine Animation */}
                  <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                  <span className="relative z-10">Berlangganan</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM SECTION - Copyright & Social Media */}
      <div className="w-full py-6 px-6 md:px-8 bg-gray-50/50 relative z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-col md:flex-row gap-6">
          
          <p className="text-gray-400 font-medium text-sm flex items-center flex-wrap gap-2 md:gap-4 justify-center">
            <span>© {new Date().getFullYear()} <span className="font-bold text-[#1A453A]">GIZIFY AI</span>. All Rights Reserved.</span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span className="flex gap-4">
              <a href="#" className="hover:text-[#1A453A] transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-[#1A453A] transition-colors">Syarat & Ketentuan</a>
            </span>
          </p>
          
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Instagram" className="w-10 h-10 bg-white border border-gray-200 text-gray-400 rounded-full flex items-center justify-center hover:bg-[#1A453A] hover:text-white hover:border-[#1A453A] hover:shadow-[0_8px_20px_rgba(26,69,58,0.2)] hover:-translate-y-1 transition-all duration-300 group">
              <IconInstagram />
            </a>
            <a href="#" aria-label="Twitter" className="w-10 h-10 bg-white border border-gray-200 text-gray-400 rounded-full flex items-center justify-center hover:bg-[#1A453A] hover:text-white hover:border-[#1A453A] hover:shadow-[0_8px_20px_rgba(26,69,58,0.2)] hover:-translate-y-1 transition-all duration-300 group">
              <IconTwitter />
            </a>
            <a href="#" aria-label="Youtube" className="w-10 h-10 bg-white border border-gray-200 text-gray-400 rounded-full flex items-center justify-center hover:bg-[#1A453A] hover:text-white hover:border-[#1A453A] hover:shadow-[0_8px_20px_rgba(26,69,58,0.2)] hover:-translate-y-1 transition-all duration-300 group">
              <IconYoutube />
            </a>
          </div>
          
        </div>
      </div>
    </footer>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconInstagram = () => <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const IconTwitter = () => <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const IconYoutube = () => <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>;