"use client";

import { useEffect, useState, useRef } from 'react';

export default function CaraKerja() {
  const sectionRef = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(0); 

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const { top, height } = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollableDistance = height - windowHeight;
      
      let scrolled = -top;
      if (scrolled < 0) scrolled = 0;
      if (scrolled > scrollableDistance) scrolled = scrollableDistance;
      
      const progress = scrolled / scrollableDistance;
      
      if (progress < 0.25) {
        setPhase(0);
      } else if (progress >= 0.25 && progress < 0.60) {
        setPhase(1);
      } else {
        setPhase(2);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); 
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // KATA-KATA DIUBAH TOTAL: Fokus ke "Cara Pakai" bukan jualan fitur lagi
  const steps = [
    {
      num: "01",
      title: "Jepret Sebelum Makan",
      desc: "Buka aplikasi dan foto piringmu. Tidak perlu mengetik manual, biarkan AI yang bekerja mengenali bahan dan porsinya.",
      icon: <IconCamera />,
    },
    {
      num: "02",
      title: "Cek Rapor Harianmu",
      desc: "Lihat ringkasan nutrisimu secara instan. Apakah asupanmu sudah pas, kurang protein, atau kelebihan gula hari ini?",
      icon: <IconAnalytics />,
    },
    {
      num: "03",
      title: "Eksekusi Menu Esok",
      desc: "Ikuti panduan resep sehat yang otomatis disiapkan untuk esok hari, menyesuaikan dengan evaluasi diet dan dompetmu.",
      icon: <IconPlan />,
    }
  ];

  const getStepClass = (index: number) => {
    const baseClass = "absolute top-1/2 -translate-y-1/2 w-[280px] md:w-[320px] flex flex-col items-start text-left transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
    
    if (phase === 0) {
      if (index === 0) return `${baseClass} left-[10%] md:left-[15%] opacity-100 scale-100 z-20`;
      return `${baseClass} left-[10%] md:left-[15%] opacity-0 scale-50 z-0 pointer-events-none`;
    }
    
    if (phase === 1) {
      if (index === 0) return `${baseClass} left-[-10%] md:left-[5%] opacity-0 md:opacity-30 scale-75 z-0 blur-sm`;
      if (index === 1) return `${baseClass} left-[10%] md:left-[15%] opacity-100 scale-100 z-20`;
      return `${baseClass} left-[10%] md:left-[15%] opacity-0 scale-50 z-0 pointer-events-none`;
    }
    
    if (phase === 2) {
      if (index === 0) return `${baseClass} left-[-20%] md:left-[-5%] opacity-0 scale-50 z-0 pointer-events-none blur-md`;
      if (index === 1) return `${baseClass} left-[-10%] md:left-[5%] opacity-0 md:opacity-30 scale-75 z-0 blur-sm`;
      if (index === 2) return `${baseClass} left-[10%] md:left-[15%] opacity-100 scale-100 z-20`;
    }
  };

  const getVisualClass = (index: number) => {
    const baseClass = "absolute top-1/2 -translate-y-1/2 w-full h-full object-cover transition-all duration-[1000ms] ease-in-out";
    if (index === phase) return `${baseClass} opacity-100 scale-100`;
    if (index < phase) return `${baseClass} opacity-0 scale-110`;
    return `${baseClass} opacity-0 scale-90`;
  };

  return (
    <section ref={sectionRef} className="w-full min-h-[400vh] relative bg-[#fafafa]" id="cara-kerja">
      
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40"></div>
        <div className={`absolute -bottom-10 -left-10 w-[400px] h-[400px] bg-green-50 rounded-full blur-[100px] transition-opacity duration-1000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>

        <div className="absolute top-[8%] left-[10%] md:left-[15%] z-30 px-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#1A453A] animate-pulse"></span>
            <span className="text-[10px] font-black text-[#1A453A] uppercase tracking-[0.2em]">Pengalaman Pengguna</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-950 tracking-tighter leading-tight">
            Semudah Memotret <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A453A] to-green-500">Makan Siangmu</span>
          </h2>
        </div>

        <div className="mx-auto max-w-[1400px] h-full relative">
          
          {steps.map((step, index) => (
            <div key={index} className={getStepClass(index)}>
              
              <div className="text-[70px] font-black text-[#1A453A] opacity-20 tracking-tighter mb-4 select-none">
                {step.num}
              </div>

              <div className="relative z-10 w-20 h-20 rounded-3xl bg-white border border-gray-100 shadow-lg flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-gray-50 rounded-3xl"></div>
                <div className="z-10 text-[#1A453A]">
                  {step.icon}
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-black mb-4 text-gray-900 tracking-tight">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed font-medium text-gray-600">
                {step.desc}
              </p>

            </div>
          ))}

          <div className={`absolute top-1/2 -translate-y-1/2 right-[5%] md:right-[10%] w-[50%] h-[60%] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${phase === 0 ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-[-50%]'}`}>
            
            <div className="relative w-full h-full rounded-[2.5rem] bg-white/60 p-4 border border-white shadow-[0_30px_70px_rgba(0,0,0,0.1)] backdrop-blur-2xl overflow-hidden ring-[12px] ring-white">
              
              <div className={getVisualClass(0)}>
                <img 
                  src="https://images.unsplash.com/photo-1544025162-8366fd4d3ceb?q=80&w=1000&auto=format&fit=crop" 
                  alt="Ayam Panggang Scanned" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-2xl flex items-center justify-center">
                  <span className="bg-[#1A453A]/80 text-white font-bold text-xs px-3 py-1 rounded-full backdrop-blur-sm animate-pulse">AI Scanning...</span>
                </div>
              </div>

              <div className={getVisualClass(1)}>
                <div className="w-full h-full bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-10">
                  <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 w-full">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target Harian</p>
                    <p className="text-3xl font-black text-gray-950 mb-4">1850 / <span className="text-xl text-gray-400">2100 Kkal</span></p>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-[#1A453A]" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={getVisualClass(2)}>
                <img 
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop" 
                  alt="Rekomendasi Menu Sehat" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white shadow-lg">
                  <p className="text-sm font-bold text-gray-950">Menu Esok: Salad Super</p>
                  <p className="text-xs text-green-700 font-bold">Hemat Rp 12.000!</p>
                </div>
              </div>

            </div>

            <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-dashed border-gray-300 rounded-[2.5rem] z-0 opacity-70" />
          </div>

        </div>
        
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex flex-col items-center opacity-30 animate-bounce z-20">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Scroll</span>
          <div className="w-px h-10 bg-gray-400"></div>
        </div>

      </div>
    </section>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconCamera = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const IconAnalytics = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconPlan = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/><line x1="8" y1="18" x2="8.01" y2="18"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="16" y1="18" x2="16.01" y2="18"/></svg>;