"use client";

import { useEffect, useState, useRef } from 'react';

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0); 
  // State untuk handle animasi exit sebelum ganti konten
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); 
        }
      },
      { threshold: 0.1 } 
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Smarter Auto-rotate dengan animasi bridging
  useEffect(() => {
    if(!isVisible) return;
    const interval = setInterval(() => {
      handleFeatureChange((activeFeature + 1) % 3);
    }, 6000); 
    return () => clearInterval(interval);
  }, [isVisible, activeFeature]);

  const handleFeatureChange = (index: number) => {
    if (index === activeFeature || isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setActiveFeature(index);
      setTimeout(() => {
         setIsAnimating(false);
      }, 50);
    }, 400); 
  };


  const titleWords1 = ["Kesehatan", "Cerdas", "Dalam"];
  const titleWords2 = ["Satu", "Genggaman"];

  // Data 3 Fitur Besar (Diupdate menggunakan JPG Image)
  const featuresData = [
    {
      icon: <IconScanner />,
      title: "Food Scanner",
      desc: "Foto makananmu, biarkan Computer Vision Gizify menghitung kalori & makro nutrisi secara instan dengan akurasi tinggi.",
      color: "#1A453A",
      vibe: "✨ Instant ",
      img: "image/feature-scanner.jpg"
    },
    {
      icon: <IconActivity />, 
      title: "Smart Calorie Tracking",
      desc: "Lacak asupan harianmu. Dapatkan notifikasi cerdas jika kamu kelebihan kalori atau kekurangan protein untuk bangun massa otot.",
      color: "#F43F5E", 
      vibe: "📈 Tracker",
      img: "/feature-tracking.jpg"
    },
    {
      icon: <IconWallet />,
      title: "Budget Meal Plan",
      desc: "Dapatkan rekomendasi menu harian lezat yang disesuaikan dengan target gizi dan isi dompet keluargamu.",
      color: "#F59E0B",
      vibe: "💰 Savvy",
      img: "/feature-mealplan.jpg"
    }
  ];

  return (
    <section ref={sectionRef} className="w-full min-h-screen py-16 px-6 md:px-8 bg-[#FAFAFA] relative overflow-hidden flex items-center" id="about">
      
      {/* --- INJEKSI CSS ANIMASI BARU --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes floatSlow { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
          .animate-float { animation: floatSlow 6s ease-in-out infinite; }
          
          /* Animasi Masuk Super Smooth */
          .feature-enter { animation: slideInFeature 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          @keyframes slideInFeature { 
            0% { transform: translateY(30px) scale(0.95); opacity: 0; filter: blur(8px); } 
            100% { transform: translateY(0px) scale(1); opacity: 1; filter: blur(0px); } 
          }
          
          /* Animasi Keluar Super Smooth */
          .feature-exit { animation: slideOutFeature 0.4s cubic-bezier(0.32, 0, 0.67, 0) forwards; }
          @keyframes slideOutFeature { 
            0% { transform: translateY(0px) scale(1); opacity: 1; filter: blur(0px); } 
            100% { transform: translateY(-30px) scale(0.95); opacity: 0; filter: blur(8px); } 
          }
        `
      }} />

      {/* --- DECORATIVE AMBIENT BACKGROUNDS --- */}
      <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-[700px] h-[700px] rounded-full bg-[#1A453A]/5 blur-[130px] pointer-events-none transition-opacity duration-[1500ms] ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-gray-300/20 blur-[130px] pointer-events-none transition-opacity duration-[1500ms] delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />

      {/* --- GIANT WATERMARK --- */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none transition-all duration-[2000ms] ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div aria-hidden="true" className="text-[150px] md:text-[220px] lg:text-[320px] font-black text-[#1A453A]/[0.03] tracking-tighter leading-[0.8] whitespace-nowrap uppercase">
          SEHAT
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* --- LEFT CONTENT (Intro Teks) --- */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center space-y-8 lg:pl-10">
            <div className="space-y-5">
              
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100/80 mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                <span className="w-2 h-2 rounded-full bg-[#1A453A] animate-pulse"></span>
                <span className="text-[9px] md:text-[10px] font-black text-[#1A453A] uppercase tracking-[0.25em]">Misi Kami</span>
              </div>
              
              <h2 className="text-4xl md:text-[3rem] lg:text-[3.25rem] font-black leading-[1.05] tracking-tight flex flex-wrap gap-x-[0.25em]">
                <span className="flex flex-wrap gap-x-[0.25em] w-full text-gray-900">
                  {titleWords1.map((word, index) => (
                    <span key={`w1-${index}`} className="inline-block overflow-hidden align-bottom">
                      <span className={`inline-block transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        {word}
                      </span>
                    </span>
                  ))}
                </span>
                <span className="flex flex-wrap gap-x-[0.25em] w-full text-[#1A453A]">
                  {titleWords2.map((word, index) => (
                    <span key={`w2-${index}`} className="inline-block overflow-hidden align-bottom">
                      <span className={`inline-block transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ transitionDelay: `${(titleWords1.length + index) * 100}ms` }}
                      >
                        {word}
                      </span>
                    </span>
                  ))}
                </span>
              </h2>
              
              <p className={`text-base lg:text-lg text-gray-500 leading-relaxed font-medium transition-all duration-[1000ms] delay-[500ms]
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                Gizify bukan sekadar pencatat kalori. Kami hadir sebagai ekosistem kesehatan digital berbasis AI yang memahami kebutuhan unik tubuhmu, isi dompetmu, dan target kebugaranmu.
              </p>
            </div>

            {/* List Fitur Interaktif */}
            <div className="space-y-3 pt-2">
              {featuresData.map((feature, index) => (
                <div 
                  key={index} 
                  onClick={() => handleFeatureChange(index)}
                  className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-500 hover:translate-x-2
                  ${index === activeFeature && !isAnimating ? 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100 scale-[1.02]' : 'hover:bg-white/50 opacity-60 hover:opacity-100'}
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} `}
                  style={{ transitionDelay: `${600 + (index * 150)}ms` }}
                >
                  <div className={`mt-1 p-2.5 rounded-xl border transition-colors shadow-inner
                    ${index === activeFeature && !isAnimating ? 'bg-[#1A453A] border-[#1A453A] text-white' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                    style={index === activeFeature && !isAnimating ? { backgroundColor: feature.color, borderColor: feature.color } : {}}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className={`text-base font-extrabold transition-colors ${index === activeFeature && !isAnimating ? 'text-gray-900' : 'text-gray-700'}`}>
                      {feature.title}
                    </h4>
                    <p className={`text-xs leading-relaxed font-medium transition-colors ${index === activeFeature && !isAnimating ? 'text-gray-600' : 'text-gray-500'} mt-1`}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`flex pt-2 transition-all duration-[1000ms] delay-[1000ms]
              ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
              <a href="/scanner" className="relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A453A] text-white font-bold text-sm uppercase tracking-wider rounded-full transition-all duration-500 shadow-[0_10px_30px_rgba(26,69,58,0.25)] hover:shadow-[0_20px_40px_rgba(26,69,58,0.4)] hover:-translate-y-1 group/btn w-full sm:w-auto">
                <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                <span className="relative z-10 flex items-center gap-2">
                  Coba Gizify Sekarang
                </span>
                <span className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1">
                  <IconArrowRight />
                </span>
              </a>
            </div>
          </div>

          {/* --- RIGHT CONTENT: INTERACTIVE GIZIFY APP SHOWCASE --- */}
          <div className={`w-full lg:w-[55%] relative mt-10 lg:mt-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] delay-[300ms]
            ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'}`}>
            
            {/* Frame HP (Dibuat menyatu dengan tema Hero) */}
            <div className="relative z-10 aspect-[4/3] max-w-[550px] mx-auto rounded-[2.5rem] bg-gray-900 p-3 shadow-[0_40px_100px_rgba(0,0,0,0.15)] ring-[12px] ring-white">
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white">
                
                {/* Wraper Animasi Konten HP */}
                <div className={`h-full w-full p-6 flex flex-col justify-between ${isAnimating ? 'feature-exit' : 'feature-enter'}`}>
                  
                  {/* Header Mockup */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div style={{ backgroundColor: featuresData[activeFeature].color }} className="p-2.5 rounded-xl text-white shadow-inner transition-colors duration-500">
                        {featuresData[activeFeature].icon}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{featuresData[activeFeature].vibe}</p>
                        <h3 className="text-lg font-black text-gray-900 leading-tight">{featuresData[activeFeature].title}</h3>
                      </div>
                    </div>
                    <IconMenuDots />
                  </div>

                  {/* Body Mockup (Sekarang Menggunakan JPG) */}
                  <div className="flex-1 flex items-center justify-center py-4">
                    <div className="w-full h-full max-h-[220px] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      <img 
                        src={featuresData[activeFeature].img} 
                        alt={featuresData[activeFeature].title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Footer Mockup */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                    <div className="mt-0.5"><IconSparkleSmall color={featuresData[activeFeature].color} /></div>
                    <p className="text-xs leading-relaxed text-gray-600 font-medium">
                      {featuresData[activeFeature].desc}
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Dashed Border Background Ornaments (Style from Hero) */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border-[1.5px] border-dashed border-gray-300 rounded-[2.5rem] z-0 transform transition-transform duration-500 animate-float opacity-50" />
            
          </div>

        </div>
      </div>
    </section>
  )
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================

const IconSparkleSmall = ({color="#1A453A"}) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>
);
const IconArrowRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconScanner = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="7" y1="12" x2="17" y2="12"/></svg>;
const IconWallet = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="16" y1="11" x2="16" y2="13"/><path d="M2 10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2"/></svg>;
const IconActivity = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconMenuDots = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;