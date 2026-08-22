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

  const steps = [
    {
      num: "01",
      title: "Jepret Sebelum Makan",
      desc: "Buka aplikasi dan foto piringmu. Tidak perlu mengetik manual, biarkan AI pintar kami yang bekerja mengenali bahan dan porsinya.",
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
      desc: "Ikuti panduan resep sehat yang otomatis disiapkan untuk esok hari, menyesuaikan dengan evaluasi diet dan isi dompetmu.",
      icon: <IconPlan />,
    }
  ];

  const getStepClass = (index: number) => {
    const baseClass = "col-start-1 row-start-1 w-full flex flex-col items-start text-left transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
    
    if (index === phase) {
      return `${baseClass} translate-y-0 opacity-100 z-20`;
    } else if (index < phase) {
      return `${baseClass} -translate-y-8 opacity-0 z-0 pointer-events-none blur-[4px]`;
    } else {
      return `${baseClass} translate-y-8 opacity-0 z-0 pointer-events-none`;
    }
  };

  const getVisualClass = (index: number) => {
    const baseClass = "absolute inset-0 w-full h-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)]";
    if (index === phase) return `${baseClass} opacity-100 scale-100 z-10`;
    if (index < phase) return `${baseClass} opacity-0 scale-105 z-0`;
    return `${baseClass} opacity-0 scale-95 z-0`;
  };

  return (
    <section ref={sectionRef} className="w-full min-h-[400vh] relative bg-[#FAFAFA]" id="cara-kerja">
      
      {/* Sticky Container */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex flex-col justify-center">
        
        {/* Ambient Background & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-50 z-0"></div>
        <div className={`absolute -bottom-10 -left-10 w-[400px] h-[400px] bg-green-100/50 rounded-full blur-[120px] transition-opacity duration-1000 z-0 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>

        {/* --- GIANT WATERMARK --- */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none transition-all duration-[2000ms] ease-out`}>
          <div aria-hidden="true" className="text-[130px] md:text-[220px] lg:text-[350px] font-black text-[#1A453A]/[0.02] tracking-tighter leading-[0.8] whitespace-nowrap uppercase">
            MUDAH
          </div>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="w-full max-w-[1300px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 relative z-10 pt-16 md:pt-10 lg:pt-0">
          
          {/* KOLOM KIRI: TEKS & NAVIGASI */}
          <div className="flex flex-col justify-center">
            
            {/* Header / Title */}
            <div className="mb-8 md:mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100/80 mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#1A453A] animate-pulse"></span>
                <span className="text-[9px] md:text-[10px] font-black text-[#1A453A] uppercase tracking-[0.25em]">Pengalaman Pengguna</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-[3.75rem] font-black text-gray-950 tracking-tighter leading-[1.05] mb-6">
                Semudah Memotret <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A453A] via-emerald-600 to-green-500 drop-shadow-sm">
                  Makan Siangmu
                </span>
              </h2>

              {/* INDIKATOR PROGRES (Glowing Active State) */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      phase === i 
                      ? 'w-12 bg-[#1A453A] shadow-[0_0_10px_rgba(26,69,58,0.4)]' 
                      : 'w-3 bg-gray-200'
                    }`} 
                  />
                ))}
              </div>
            </div>

            {/* Area Langkah (Fixed Height Container) */}
            <div className="relative w-full h-[180px] md:h-[220px]">
              <div className="grid w-full h-full relative">
                {steps.map((step, index) => (
                  <div key={index} className={getStepClass(index)}>
                    
                    {/* Background Number Elegan (HOLLOW OUTLINE TEXT) */}
                    <div className="absolute -left-2 md:-left-6 -top-6 md:-top-10 text-[100px] md:text-[140px] font-black text-transparent [-webkit-text-stroke:2px_rgba(26,69,58,0.06)] select-none pointer-events-none tracking-tighter leading-none z-0">
                      {step.num}
                    </div>
                    
                    <div className="relative z-10 flex gap-5 lg:gap-6 items-start">
                      {/* Ikon Langkah (Lebih Besar, Bayangan Menyebar) */}
                      <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] md:rounded-[1.5rem] bg-white border border-white shadow-[0_20px_40px_rgba(26,69,58,0.06)] flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-white/20"></div>
                        <div className="relative z-10 text-[#1A453A] [&>svg]:w-7 [&>svg]:h-7 md:[&>svg]:w-8 md:[&>svg]:h-8 transform transition-transform duration-500 group-hover:scale-110">
                          {step.icon}
                        </div>
                      </div>
                      
                      {/* Teks Judul & Deskripsi */}
                      <div className="flex flex-col pt-1 md:pt-2">
                        <h3 className="text-xl md:text-2xl lg:text-[1.75rem] font-black text-gray-900 tracking-tight mb-2 md:mb-3">
                          {step.title}
                        </h3>
                        <p className="text-sm md:text-base leading-relaxed font-medium text-gray-500 max-w-[95%]">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: VISUAL IMAGE FRAME */}
          <div className="flex flex-col items-center justify-center relative h-[38vh] md:h-[45vh] lg:h-auto mt-4 lg:mt-0">
             
             {/* GLOWING AURA DI BELAKANG FRAME */}
             <div className="absolute inset-0 bg-gradient-to-tr from-green-400/20 via-[#1A453A]/20 to-transparent blur-[50px] rounded-full scale-90 -z-10 animate-pulse" />

             {/* Frame Estetik Premium */}
             <div className="relative z-10 w-full max-w-lg aspect-square lg:aspect-[4/3] rounded-[2rem] md:rounded-[2.5rem] bg-gray-900 p-2.5 md:p-3 shadow-[0_30px_80px_rgba(26,69,58,0.2)] ring-[6px] md:ring-[10px] ring-white/90 group">
               
               {/* Detail Kaca/Pantulan Cahaya di atas Frame */}
               <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-tr from-white/15 to-transparent pointer-events-none z-20 mix-blend-overlay"></div>

               <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-gray-900">
                 
                 {/* Visual 1 */}
                 <div className={getVisualClass(0)}>
                   <img src="/image/feature-scanner.jpg" alt="Step 1: Jepret Makanan" className="w-full h-full object-cover opacity-90" />
                   {/* Overlay Gelap Tipis biar teks AI kebaca */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                   <div className="absolute inset-4 border-[1.5px] border-dashed border-white/60 rounded-2xl flex items-end justify-start p-3 md:p-4">
                     <span className="bg-[#1A453A]/95 text-white font-bold text-[10px] md:text-xs px-4 py-2.5 rounded-full backdrop-blur-md shadow-xl flex items-center gap-2 border border-white/10">
                       <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                       AI Scanning...
                     </span>
                   </div>
                 </div>
                 
                 {/* Visual 2 */}
                 <div className={getVisualClass(1)}>
                   <img src="/image/track-nutrition.png" alt="Step 2: Cek Rapor" className="w-full h-full object-cover" />
                 </div>
                 
                 {/* Visual 3 */}
                 <div className={getVisualClass(2)}>
                   <img src="/image/meal-plan.png" alt="Step 3: Eksekusi Menu" className="w-full h-full object-cover" />
                 </div>

               </div>
             </div>

             {/* Dashed Border Ornament di belakang gambar */}
             <div className="absolute -bottom-4 -right-2 md:-bottom-6 md:-right-6 w-full max-w-lg aspect-square lg:aspect-[4/3] border-[2px] border-dashed border-gray-300 rounded-[2rem] md:rounded-[2.5rem] z-0 opacity-60 transition-transform duration-1000 animate-float" />
          </div>

        </div>
        
        {/* INDIKATOR SCROLL DI BAWAH */}
        <div className="absolute bottom-[2%] md:bottom-[4%] left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 animate-bounce z-20">
          <span className="text-[9px] font-bold text-[#1A453A] uppercase tracking-widest mb-1.5">Scroll</span>
          <div className="w-px h-8 md:h-12 bg-gradient-to-b from-[#1A453A] to-transparent"></div>
        </div>

      </div>
    </section>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconCamera = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const IconAnalytics = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconPlan = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/><line x1="8" y1="18" x2="8.01" y2="18"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="16" y1="18" x2="16.01" y2="18"/></svg>;