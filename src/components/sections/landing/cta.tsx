"use client";

import { useEffect, useState, useRef } from "react";

// Kumpulan gambar makanan/resep untuk background grid
const gridImages = [
  "https://images.unsplash.com/photo-1544025162-8366fd4d3ceb?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498837167922-41c5433f07be?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1553530666-ba11a7664483?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=400&auto=format&fit=crop",
];

export default function CTA() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Duplikasi gambar biar efek marquee-nya muter terus tanpa putus
  const marqueeItems = [...gridImages, ...gridImages, ...gridImages];

  return (
    <section ref={sectionRef} className="relative w-full h-screen min-h-[750px] bg-white overflow-hidden flex flex-col items-center justify-between pt-16 pb-12" id="cta">
      
      {/* INJEKSI CSS ANIMASI */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up {
            opacity: 0;
            transform: translateY(40px);
            animation: fadeUpAnim 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          @keyframes fadeUpAnim {
            to { opacity: 1; transform: translateY(0); }
          }
          
          /* Animasi Marquee Grid */
          .marquee-track-left {
            display: flex;
            width: max-content;
            animation: scrollLeft 40s linear infinite;
          }
          .marquee-track-right {
            display: flex;
            width: max-content;
            animation: scrollRight 40s linear infinite;
          }
          @keyframes scrollLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          @keyframes scrollRight {
            0% { transform: translateX(-33.33%); }
            100% { transform: translateX(0); }
          }

          /* Masking biar ujungnya memudar rapi menyatu sama background putih */
          .fade-mask {
            mask-image: radial-gradient(ellipse at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 75%);
            -webkit-mask-image: radial-gradient(ellipse at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 75%);
          }
          
          /* Efek Floating Cards yang beda-beda durasinya */
          .float-1 { animation: float-1 6s ease-in-out infinite; }
          .float-2 { animation: float-2 8s ease-in-out infinite 1s; }
          .float-3 { animation: float-3 7s ease-in-out infinite 2s; }
          
          @keyframes float-1 {
            0%, 100% { transform: translateY(0px) rotate(-3deg); }
            50% { transform: translateY(-15px) rotate(1deg); }
          }
          @keyframes float-2 {
            0%, 100% { transform: translateY(0px) rotate(2deg); }
            50% { transform: translateY(-20px) rotate(-1deg); }
          }
          @keyframes float-3 {
            0%, 100% { transform: translateY(0px) rotate(4deg); }
            50% { transform: translateY(-12px) rotate(0deg); }
          }
        `
      }} />

      {/* ========================================== */}
      {/* 1. TOP: HEADER TEXT (ENHANCED) */}
      {/* ========================================== */}
      <div className={`text-center z-20 shrink-0 px-4 flex flex-col items-center ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
        
        {/* TAG PILL STANDAR (Sama dengan section lain) */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100/80 mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md">
           <span className="w-2 h-2 rounded-full bg-[#1A453A] animate-pulse"></span>
           <span className="text-[9px] md:text-[10px] font-black text-[#1A453A] uppercase tracking-[0.25em]">Aplikasi Nutrisi AI #1 di Indonesia</span>
        </div>

        {/* Enhanced Typography Gradient */}
        <h2 className="text-3xl md:text-5xl lg:text-[4rem] font-black uppercase tracking-tighter leading-none text-gray-950">
          TRANSFORMASI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A453A] via-emerald-600 to-green-500 drop-shadow-sm">GIZIMU HARI INI</span>
        </h2>
      </div>

      {/* ========================================== */}
      {/* 2. MIDDLE: FLOATING UI CARDS (TETAP SAMA) */}
      {/* ========================================== */}
      <div className={`relative w-full flex-1 flex justify-center items-center mt-4 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
        
        {/* Background Marquee Grid */}
        <div className="absolute inset-0 z-0 flex flex-col justify-center gap-3 md:gap-4 fade-mask pointer-events-none opacity-40 md:opacity-30 overflow-hidden">
          <div className="marquee-track-left gap-3 md:gap-4 ml-[-50px]">
            {marqueeItems.map((img, idx) => (
              <div key={`row1-${idx}`} className="w-[120px] md:w-[160px] h-[120px] md:h-[160px] rounded-2xl overflow-hidden shrink-0">
                <img src={img} alt="food grid" className="w-full h-full object-cover grayscale opacity-80" />
              </div>
            ))}
          </div>
          <div className="marquee-track-right gap-3 md:gap-4 ml-[-150px]">
            {marqueeItems.map((img, idx) => (
              <div key={`row2-${idx}`} className="w-[120px] md:w-[160px] h-[120px] md:h-[160px] rounded-2xl overflow-hidden shrink-0">
                <img src={img} alt="food grid" className="w-full h-full object-cover grayscale opacity-80" />
              </div>
            ))}
          </div>
        </div>

        {/* Foreground: Floating Glassmorphism Cards */}
        <div className="relative z-10 w-full max-w-4xl h-[400px] flex items-center justify-center">
          
          {/* Card Kiri: Ringkasan Makro */}
          <div className="absolute left-[5%] md:left-[15%] top-[15%] float-1 w-44 md:w-56 bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">🔥</div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Target Makro</p>
                <p className="text-sm font-black text-gray-800">Sempurna</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1"><span className="text-gray-500">Protein</span><span className="text-gray-800">120g</span></div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full"><div className="w-[85%] h-full bg-orange-400 rounded-full"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1"><span className="text-gray-500">Lemak</span><span className="text-gray-800">45g</span></div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full"><div className="w-[60%] h-full bg-yellow-400 rounded-full"></div></div>
              </div>
            </div>
          </div>

          {/* Card Tengah (Hero Card): Kalori Harian */}
          <div className="absolute z-20 float-2 w-64 md:w-80 bg-[#1A453A]/90 backdrop-blur-2xl text-white border border-[#2c6e5d] rounded-[2rem] p-6 shadow-2xl shadow-[#1A453A]/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><IconUser /></div>
                <div>
                  <p className="text-xs text-green-100/80">Hai, Sehat!</p>
                  <p className="text-sm font-bold">Pro Member</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500/50 flex items-center justify-center"><IconCheck /></div>
            </div>
            
            <p className="text-[10px] uppercase font-bold tracking-widest text-green-200 mb-1">Kalori Hari Ini</p>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-4xl font-black">1,450</span>
              <span className="text-sm font-normal text-green-100 mb-1">/ 2000 kcal</span>
            </div>
            
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden mb-2">
              <div className="w-[70%] h-full bg-green-400 rounded-full relative">
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent to-white/30 animate-pulse"></div>
              </div>
            </div>
            <p className="text-[10px] text-green-100/80 text-right">Sisa 550 kcal</p>
          </div>

          {/* Card Kanan: AI Food Scan */}
          <div className="absolute right-[5%] md:right-[15%] bottom-[15%] float-3 w-40 md:w-48 bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-3 shadow-xl">
            <div className="w-full h-24 rounded-2xl overflow-hidden relative mb-3">
              <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop" alt="Salad Scan" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-green-500/10 border-2 border-green-400/50 rounded-2xl flex items-center justify-center">
                <div className="w-full h-[1px] bg-green-400 shadow-[0_0_8px_rgba(74,222,128,1)] animate-scan"></div>
              </div>
            </div>
            <p className="text-[10px] font-bold text-green-600 mb-0.5">✓ Terdeteksi oleh AI</p>
            <p className="text-xs font-black text-gray-800">Salad Sayur Super</p>
            <p className="text-[10px] font-medium text-gray-500">240 kcal</p>
          </div>

        </div>

        {/* EFEK FADE TO WHITE DI BAWAH */}
        <div className="absolute bottom-0 left-0 right-0 h-[20vh] bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none"></div>

      </div>

      {/* ========================================== */}
      {/* 3. BOTTOM: CTA YANG BENERAN "CALL TO ACTION" */}
      {/* ========================================== */}
      <div className={`text-center z-30 shrink-0 flex flex-col items-center px-4 w-full max-w-3xl ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '500ms' }}>
        
        {/* Social Proof (Avatar Cluster) */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex -space-x-3">
            <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=64&auto=format&fit=crop" alt="User 1" />
            <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=64&auto=format&fit=crop" alt="User 2" />
            <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=64&auto=format&fit=crop" alt="User 3" />
            <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=64&auto=format&fit=crop" alt="User 4" />
            <div className="w-8 h-8 rounded-full border-2 border-white bg-green-100 text-green-800 text-[10px] font-bold flex items-center justify-center">+10k</div>
          </div>
          <p className="text-xs md:text-sm font-medium text-gray-500">
            Dipercaya oleh <span className="font-bold text-gray-900">10,000+</span> pejuang sehat
          </p>
        </div>

        {/* Copywriting Penutup */}
        <p className="text-base md:text-lg text-gray-600 font-medium mb-8 leading-relaxed">
          Ubah cara pandangmu terhadap makanan. Mulai kebiasaan sehat hari ini dengan bantuan <span className="font-bold text-[#1A453A]">AI GIZIKU</span>.
        </p>
        
        {/* Tombol CTA "Super Shine" */}
        <a href="/auth/register" className="relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A453A] text-white font-bold text-sm md:text-base uppercase tracking-wider rounded-full transition-all duration-500 shadow-[0_10px_30px_rgba(26,69,58,0.3)] hover:shadow-[0_20px_50px_rgba(26,69,58,0.5)] hover:-translate-y-1 group/btn ring-4 ring-transparent hover:ring-[#1A453A]/20">
          <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
          <span className="relative z-10">Mulai Gratis Sekarang</span>
          <span className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1">
            <IconArrowRight />
          </span>
        </a>

        {/* Microcopy Anti-Friction (Membunuh keraguan user) */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
          <IconShield />
          <p>Tanpa kartu kredit • Batal kapan saja</p>
        </div>

      </div>
    </section>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconArrowRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconShield = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;