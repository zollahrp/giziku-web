"use client";

import { useEffect, useState, useRef } from 'react';

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0); 
  // Add a state to handle the exit animation before switching content
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

  // Smarter Auto-rotate with animation bridging
  useEffect(() => {
    if(!isVisible) return;
    const interval = setInterval(() => {
      handleFeatureChange((activeFeature + 1) % 3);
    }, 6000); // Increased slightly to account for the new animation duration
    return () => clearInterval(interval);
  }, [isVisible, activeFeature]);

  // Function to handle the smooth transition between features
  const handleFeatureChange = (index: number) => {
    if (index === activeFeature || isAnimating) return;
    
    setIsAnimating(true);
    // Wait for exit animation to finish before swapping content
    setTimeout(() => {
      setActiveFeature(index);
      // Wait a tiny bit before starting the enter animation
      setTimeout(() => {
         setIsAnimating(false);
      }, 50);
    }, 400); 
  };


  const titleWords1 = ["Kesehatan", "Cerdas", "Dalam"];
  const titleWords2 = ["Satu", "Genggaman"];

  // Data 3 Fitur Besar 
  const featuresData = [
    {
      icon: <IconScanner />,
      title: "AI Food Scanner",
      desc: "Foto makananmu, biarkan AI Giziku menghitung kalori & makro nutrisi secara instan dengan akurasi tinggi.",
      color: "#1A453A",
      vibe: "✨ Instant "
    },
    {
      icon: <IconActivity />, 
      title: "Smart Calorie Tracking",
      desc: "Lacak asupan harianmu. Dapatkan notifikasi cerdas jika kamu kelebihan kalori atau kekurangan protein untuk bangun massa otot.",
      color: "#F43F5E", 
      vibe: "📈 Tracker"
    },
    {
      icon: <IconWallet />,
      title: "Budget Meal Plan",
      desc: "Dapatkan rekomendasi menu harian lezat yang disesuaikan dengan target gizi dan isi dompet keluargamu.",
      color: "#F59E0B",
      vibe: "💰 Savvy"
    }
  ];

  return (
    <section ref={sectionRef} className="w-full min-h-screen py-16 px-6 md:px-8 bg-[#fafafa] relative overflow-hidden flex items-center" id="about">
      
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
      <div className={`absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-[#E8DCCB]/20 blur-[130px] pointer-events-none transition-opacity duration-[1500ms] delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />

      {/* --- GIANT WATERMARK --- */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none transition-all duration-[2000ms] ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div aria-hidden="true" className="text-[130px] md:text-[200px] lg:text-[280px] font-black text-[#1A453A]/[0.025] tracking-tighter leading-none whitespace-nowrap uppercase">
          GIZIKU
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* --- LEFT CONTENT (Intro Teks) --- */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center space-y-8 lg:pl-10">
            <div className="space-y-5">
              
              <div className={`group/badge inline-flex w-max items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#1A453A]/10 shadow-sm cursor-default hover:shadow-md transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                <div className="text-[#1A453A]">
                  <IconSparkleSmall />
                </div>
                <span className="text-[11px] font-black text-[#1A453A] uppercase tracking-[0.25em]">
                  Misi Kami
                </span>
              </div>
              
              {/* Heading (Bergantian Warna: Hitam -> Hijau) */}
              <h2 className="text-4xl md:text-[3rem] lg:text-[3.25rem] font-black leading-[1.05] tracking-tight flex flex-wrap gap-x-[0.25em]">
                {/* Baris Pertama: Warna Abu-abu Gelap (Hitam) */}
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
                {/* Baris Kedua: Warna Hijau (#1A453A) */}
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
              
              <p className={`text-base lg:text-lg text-gray-600 leading-relaxed font-medium transition-all duration-[1000ms] delay-[500ms]
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                Giziku bukan sekadar pencatat kalori. Kami hadir sebagai ekosistem kesehatan digital berbasis AI yang memahami kebutuhan unik tubuhmu, isi dompetmu, dan target kebugaranmu.
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
                    ${index === activeFeature && !isAnimating ? 'bg-gray-900 border-gray-900 text-white' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                    style={index === activeFeature && !isAnimating ? { backgroundColor: feature.color, borderColor: feature.color } : {}}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className={`text-base font-extrabold transition-colors ${index === activeFeature && !isAnimating ? 'text-gray-950' : 'text-gray-700'}`}>
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
              <a href="/scanner" className="relative overflow-hidden inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#1A453A] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-500 group/btn hover:-translate-y-0.5 w-full sm:w-auto">
                <span className="relative z-10 flex items-center gap-2">
                  Coba Giziku Sekarang
                  <span className="transform group-hover/btn:translate-x-1 transition-transform">
                    <IconArrowRight />
                  </span>
                </span>
              </a>
            </div>
          </div>

          {/* --- RIGHT CONTENT: INTERACTIVE GIZIKU APP SHOWCASE --- */}
          <div className={`w-full lg:w-[55%] relative mt-10 lg:mt-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] delay-[300ms]
            ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'}`}>
            
            {/* Frame HP */}
            <div className="relative z-10 aspect-[4/3] max-w-[550px] mx-auto rounded-[2.5rem] bg-gray-900 p-3 shadow-2xl ring-[12px] ring-white">
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
                        <h3 className="text-lg font-black text-gray-950 leading-tight">{featuresData[activeFeature].title}</h3>
                      </div>
                    </div>
                    <IconMenuDots />
                  </div>

                  {/* Body Mockup */}
                  <div className="flex-1 flex items-center justify-center py-4">
                    {activeFeature === 0 && <VisualScanner />}
                    {activeFeature === 1 && <VisualTracking TrackerColor={featuresData[1].color} />}
                    {activeFeature === 2 && <VisualMealPlan />}
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

            {/* Dashed Border Background Ornaments */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-dashed border-gray-300 rounded-[2.5rem] z-0 transform transition-transform duration-500 animate-float opacity-70" />
            
          </div>

        </div>
      </div>
    </section>
  )
}

// ==========================================
// KUMPULAN SVG ICONS & VISUAL COMPONENTS
// ==========================================

const IconSparkleSmall = ({color="#1A453A"}) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>
);
const IconArrowRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconScanner = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="7" y1="12" x2="17" y2="12"/></svg>;
const IconWallet = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="16" y1="11" x2="16" y2="13"/><path d="M2 10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2"/></svg>;
const IconActivity = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconMenuDots = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const IconAlertTriangle = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconInfo = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;

// --- VISUAL COMPONENTS UNTUK MOCKUP HP ---

// 1. Visualisasi AI Scanner
const VisualScanner = () => (
  <div className="relative w-full h-[180px] bg-gray-50 rounded-2xl flex items-center justify-center p-4 border border-gray-100">
    <img src="https://images.unsplash.com/photo-1544025162-8366fd4d3ceb?q=80&w=600&auto=format&fit=crop" alt="Ayam Panggang" className="aspect-square h-24 rounded-full object-cover shadow-lg" />
    <div className="absolute inset-3 border-2 border-dashed border-[#1A453A]/40 rounded-xl">
      <div className="absolute top-2 left-2 bg-[#1A453A] text-white text-[9px] px-2 py-0.5 rounded font-bold">Scanning...</div>
    </div>
    <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100 flex items-center gap-1.5">
      <span className="text-sm font-bold text-gray-900">450</span><span className="text-[10px] font-semibold text-gray-400">Kkal</span>
    </div>
  </div>
);

// 2. Visualisasi Smart Tracking
const VisualTracking = ({TrackerColor="#F43F5E"}) => (
  <div className="w-full h-[180px] flex flex-col justify-center gap-3">
    
    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase">Kalori Harian</p>
          <p className="text-sm font-black text-gray-900">2450 / 2200 <span className="text-[10px] text-gray-400 font-semibold">Kkal</span></p>
        </div>
        <span className="text-[10px] font-bold text-red-500">Over limit!</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
      </div>
    </div>

    <div className="bg-orange-50 border border-orange-100 p-2.5 rounded-xl flex items-start gap-2.5 shadow-sm">
      <div className="text-orange-500 mt-0.5"><IconAlertTriangle /></div>
      <div>
        <h5 className="text-[11px] font-bold text-gray-900">Protein Kurang 15g</h5>
        <p className="text-[9px] text-gray-600 mt-0.5">Target massa ototmu butuh ekstra protein. Coba tambahkan 1 butir telur rebus (7g protein).</p>
      </div>
    </div>

  </div>
);

// 3. Visualisasi Meal Plan Budget
const VisualMealPlan = () => (
  <div className="w-full h-[180px] flex flex-col justify-center gap-2">
    {[
      {name: "Salad Sayur Tempe", cal: "220", cost: "Low"},
      {name: "Ayam Panggang Dada", cal: "450", cost: "Mid"},
    ].map((item, idx) => (
      <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${item.cost === 'Low' ? 'bg-green-400' : 'bg-orange-400'}`} />
          <h5 className="text-xs font-bold text-gray-800">{item.name}</h5>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-gray-900">{item.cal} Kkal</span>
          <span className="text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full font-bold">
            {item.cost === 'Low' ? '$' : '$$'}
          </span>
        </div>
      </div>
    ))}
    <div className="bg-blue-50 border border-blue-100 p-2 rounded-xl flex items-start gap-2 shadow-sm mt-1">
      <div className="text-blue-500 mt-0.5"><IconInfo /></div>
      <p className="text-[9px] text-blue-800 font-medium leading-tight">Total belanja hari ini hemat <strong>Rp 15.000</strong> dibanding kemarin!</p>
    </div>
  </div>
);