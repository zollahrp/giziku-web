"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// --- DATA MENU (Diupdate dengan Tab Cara Memasak) ---
const menuData = [
  {
    id: 1,
    titleTop: "AYAM",
    titleBottom: "PANGGANG",
    cal: "450",
    prep: "15 Min",
    protein: "38g",
    category: "High Protein",
    rating: "4.8",
    desc: "Tinggi protein dan rendah lemak. Sangat cocok untuk makan siang, memenuhi 40% kebutuhan protein harianmu. Cocok untuk defisit kalori.",
    ingredients: ["150g Dada Ayam Fillet", "1 sdm Minyak Zaitun", "1 sdt Bawang Putih Bubuk", "Garam Laut & Lada Hitam", "Rosemary Segar"],
    steps: [
      "Panaskan oven pada suhu 200°C.",
      "Lumuri dada ayam dengan minyak zaitun, bawang putih, garam, dan lada hingga rata.",
      "Panggang selama 20-25 menit hingga ayam matang sempurna.",
      "Sajikan hangat dengan taburan rosemary segar di atasnya."
    ],
    img: "https://images.unsplash.com/photo-1544025162-8366fd4d3ceb?q=80&w=800&auto=format&fit=crop",
    thumb: "Ayam Panggang",
  },
  {
    id: 2,
    titleTop: "SALAD",
    titleBottom: "SAYURAN",
    cal: "220",
    prep: "10 Min",
    protein: "12g",
    category: "Low Calorie",
    rating: "4.9",
    desc: "Kaya serat dan vitamin dengan siraman olive oil murni. Menjaga pencernaan tetap sehat dan memberi kesegaran maksimal di siang hari.",
    ingredients: ["Daun Selada Segar", "Tomat Ceri", "Mentimun", "Dressing Minyak Zaitun", "Potongan Telur Rebus"],
    steps: [
      "Cuci bersih semua sayuran dengan air mengalir.",
      "Potong selada, mentimun, dan tomat ceri sesuai selera.",
      "Rebus telur hingga matang, kupas lalu potong menjadi 4 bagian.",
      "Campur semua bahan di mangkuk, siram dengan olive oil."
    ],
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    thumb: "Salad Segar",
  },
  {
    id: 3,
    titleTop: "SALMON",
    titleBottom: "TERIYAKI",
    cal: "510",
    prep: "20 Min",
    protein: "42g",
    category: "Omega-3 Rich",
    rating: "5.0",
    desc: "Sajian premium kaya Omega-3 untuk kesehatan jantung dan otak. Disajikan dengan asparagus panggang dan sedikit taburan wijen organik.",
    ingredients: ["200g Fillet Salmon", "Saus Teriyaki Diet", "Asparagus", "Biji Wijen Panggang", "Perasan Lemon"],
    steps: [
      "Keringkan permukaan salmon menggunakan tisu dapur.",
      "Panggang salmon di teflon anti lengket hingga kecoklatan.",
      "Tuang saus teriyaki, masak perlahan hingga saus mengental.",
      "Panggang asparagus, sajikan bersama salmon dan taburan wijen."
    ],
    img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800&auto=format&fit=crop",
    thumb: "Salmon Teriyaki",
  },
  {
    id: 4,
    titleTop: "BEEF",
    titleBottom: "BOWL",
    cal: "650",
    prep: "25 Min",
    protein: "35g",
    category: "Energy Booster",
    rating: "4.7",
    desc: "Irisan daging sapi rendah lemak yang juicy. Sumber energi dan zat besi terbaik untuk kamu yang aktif berolahraga atau bekerja seharian.",
    ingredients: ["150g Daging Sapi Iris", "Bawang Bombay", "Kecap Asin Diet", "Nasi Shirataki", "Daun Bawang"],
    steps: [
      "Tumis irisan bawang bombay hingga harum dan layu.",
      "Masukkan daging sapi iris, masak hingga berubah warna.",
      "Tambahkan kecap asin diet dan sedikit air, biarkan meresap.",
      "Tuang ke atas nasi shirataki hangat, taburi daun bawang."
    ],
    img: "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?q=80&w=800&auto=format&fit=crop",
    thumb: "Beef Bowl",
  },
  {
    id: 5,
    titleTop: "BERRY",
    titleBottom: "SMOOTHIE",
    cal: "180",
    prep: "5 Min",
    protein: "8g",
    category: "Antioxidant",
    rating: "4.9",
    desc: "Campuran buah berry antioksidan tinggi. Manis alami tanpa gula tambahan, penutup sempurna atau sarapan ringan yang super sehat.",
    ingredients: ["Stroberi Segar", "Blueberry", "Susu Almond murni", "1 sdm Chia Seeds", "Es Batu"],
    steps: [
      "Siapkan blender yang sudah bersih.",
      "Masukkan stroberi, blueberry, susu almond, dan es batu.",
      "Blender dengan kecepatan tinggi hingga teksturnya halus merata.",
      "Tuang ke gelas, taburi chia seeds di atasnya sebelum disajikan."
    ],
    img: "https://images.unsplash.com/photo-1553530666-ba11a7664483?q=80&w=800&auto=format&fit=crop",
    thumb: "Berry Smoothie",
  },
];

export default function Hero() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [active, setActive] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  // State Tab diupdate jadi 3 pilihan
  const [activeTab, setActiveTab] = useState<"nutrisi" | "bahan" | "langkah">("nutrisi");
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleMenuChange = useCallback((index: number) => {
    if (index === active || isAnimatingOut) return;
    setIsAnimatingOut(true);
    setTimeout(() => {
      setActive(index);
      setIsAnimatingOut(false);
    }, 600); 
  }, [active, isAnimatingOut]);

  const handleNext = useCallback(() => {
    handleMenuChange(active === menuData.length - 1 ? 0 : active + 1);
  }, [active, handleMenuChange]);

  const handlePrev = useCallback(() => {
    handleMenuChange(active === 0 ? menuData.length - 1 : active - 1);
  }, [active, handleMenuChange]);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      if (!isAnimatingOut) {
        handleNext();
      }
    }, 7000);
    return () => clearInterval(slideInterval);
  }, [handleNext, isAnimatingOut]);

  const toggleSaveRecipe = () => {
    if (savedRecipes.includes(active)) {
      setSavedRecipes(savedRecipes.filter(id => id !== active));
    } else {
      setSavedRecipes([...savedRecipes, active]);
    }
  };

  const currentMenu = menuData[active];
  const isCurrentlySaved = savedRecipes.includes(active);

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#FAFAFA] pt-16">
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes plateEnter {
            0% { transform: translate(-10vw, -10vh) rotate(-45deg) scale(0.85); opacity: 0; filter: blur(8px); }
            100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; filter: blur(0px); }
          }
          @keyframes plateExit {
            0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; filter: blur(0px); }
            100% { transform: translate(10vw, 10vh) rotate(45deg) scale(0.85); opacity: 0; filter: blur(8px); }
          }
          @keyframes textSlideUp {
            0% { transform: translateY(30px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes textFadeOut {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-20px); opacity: 0; }
          }
          @keyframes floatSlow {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }

          .animate-plate-enter { animation: plateEnter 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          .animate-plate-exit { animation: plateExit 0.6s cubic-bezier(0.32, 0, 0.67, 0) forwards; }
          .animate-text-enter { animation: textSlideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          .animate-text-exit { animation: textFadeOut 0.5s cubic-bezier(0.32, 0, 0.67, 0) forwards; }
          
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .animate-spin-super-slow { animation: spin 50s linear infinite; }
          .animate-float { animation: floatSlow 6s ease-in-out infinite; }

          /* Custom Scrollbar untuk Tab Content */
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        `
      }} />

      <div className={`absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden transition-all duration-700 ${isAnimatingOut ? 'opacity-0 scale-95' : 'opacity-[0.35] scale-100'}`}>
        <h1 className="text-[20vw] font-black tracking-tighter text-[#e2e8db] leading-[0.8] text-center uppercase whitespace-nowrap">
          {currentMenu.titleTop}<br/>{currentMenu.titleBottom}
        </h1>
      </div>
      
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.15]">
        <div className="h-[500px] w-[500px] rounded-full border-[1.5px] border-dashed border-gray-500 absolute"></div>
        <div className="h-[800px] w-[800px] rounded-full border border-gray-300 absolute"></div>
        <div className="absolute top-[20%] left-[15%] text-gray-400"><IconPlus /></div>
        <div className="absolute bottom-[25%] right-[20%] text-gray-400"><IconPlus /></div>
      </div>

      <div className={`absolute right-[5%] top-[18%] z-20 hidden lg:flex items-center gap-3 rounded-2xl bg-white/70 p-3 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-white transition-all duration-1000 ease-out animate-float ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner">
          <IconSparkle />
        </span>
        <div className="pr-2">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">AI Precision</p>
          <p className="text-sm font-black text-gray-800">99.8% Match</p>
        </div>
      </div>

      <div className={`absolute left-10 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-10 lg:flex transition-all duration-1000 delay-300 ease-out ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
        <div className={`text-center ${isAnimatingOut ? 'animate-text-exit' : 'animate-text-enter'}`}>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Protein</p>
          <p className="text-2xl font-black text-gray-800">{currentMenu.protein}</p>
        </div>
        <div className="h-32 w-[1.5px] bg-gray-300"></div>
        <p className="rotate-180 transform text-[10px] font-bold tracking-[0.4em] text-gray-400" style={{ writingMode: 'vertical-rl' }}>
          POWERED BY GIZIBOT AI
        </p>
      </div>

      <div className={`mx-auto w-full max-w-[1400px] px-6 relative z-10 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          <div className="relative flex justify-center lg:col-span-6 lg:justify-start lg:pl-20">
            <div className={`relative ${isAnimatingOut ? 'animate-plate-exit' : 'animate-plate-enter'}`}>
              
              <div className="absolute -left-6 top-16 z-20 flex cursor-pointer items-center gap-3 rounded-full bg-white/95 px-5 py-3 shadow-[0_15px_40px_rgba(0,0,0,0.1)] backdrop-blur-md border border-white hover:scale-110 transition-transform duration-300">
                <span className="text-gray-400"><IconClock /></span>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-gray-400 leading-none">Prep Time</span>
                  <p className="text-sm font-black text-gray-900 pr-1 leading-tight">{currentMenu.prep}</p>
                </div>
              </div>

              <div className="animate-spin-super-slow">
                <img 
                  src={currentMenu.img} 
                  alt={currentMenu.thumb}
                  className="aspect-square w-[380px] rounded-full object-cover shadow-[0_40px_100px_rgba(0,0,0,0.15)] ring-[16px] ring-white lg:w-[580px]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center text-center lg:col-span-6 lg:text-left lg:pr-10">
            
            <div className={`relative ${isAnimatingOut ? 'animate-text-exit' : 'animate-text-enter'}`}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-green-600 flex items-center gap-4 justify-center lg:justify-start">
                <span className="h-px w-8 bg-green-600"></span>
                {currentMenu.category}
              </p>
              
              <h1 className="text-6xl font-black tracking-tighter text-gray-900 sm:text-7xl lg:text-[5.5rem] lg:leading-[0.9]">
                {currentMenu.titleTop}
              </h1>
              <h1 className="text-6xl font-black tracking-tighter text-gray-900 sm:text-7xl lg:text-[5.5rem] lg:leading-[0.9] mt-1">
                {currentMenu.titleBottom}
              </h1>
              
              <p className="mt-6 text-base leading-relaxed text-gray-500 max-w-lg mx-auto lg:mx-0 font-medium">
                {currentMenu.desc}
              </p>
            </div>
            
            <div className={`mt-8 flex items-center justify-center gap-5 lg:justify-start opacity-0 ${isAnimatingOut ? 'animate-text-exit' : 'animate-text-enter delay-100'}`}>
              <button 
                onClick={() => router.push('/scanner')} 
                className="group flex cursor-pointer items-center gap-3 rounded-full bg-[#1A453A] px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-[#123129] hover:shadow-[#1A453A]/30 transition-all duration-300 hover:-translate-y-1"
              >
                SCAN MAKANAN 
                <span className="group-hover:translate-x-1 transition-transform"><IconArrowRight /></span>
              </button>

              <button 
                onClick={toggleSaveRecipe}
                className={`group flex cursor-pointer items-center gap-3 rounded-full border-2 px-6 py-3.5 text-sm font-bold transition-all duration-300 ${isCurrentlySaved ? 'border-green-600 text-green-600 bg-green-50' : 'border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900'}`}
              >
                <span className={`transition-all duration-300 ${isCurrentlySaved ? 'scale-110' : 'scale-100 group-hover:scale-110'}`}>
                  {isCurrentlySaved ? <IconBookmarkSolid /> : <IconBookmark />}
                </span>
                {isCurrentlySaved ? 'Tersimpan' : 'Simpan Resep'}
              </button>
            </div>

            {/* --- INNER CARD NUTRISI (Desain Baru Diperbagus) --- */}
            <div className={`mt-10 opacity-0 ${isAnimatingOut ? 'animate-text-exit' : 'animate-text-enter delay-200'}`}>
              
              <div className="max-w-xl rounded-3xl bg-white/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl border border-gray-100/50">
                
                {/* Segmented Control UI (Modern Tabs) */}
                <div className="relative mb-6 flex w-full rounded-2xl bg-gray-100/60 p-1.5 border border-gray-200/50">
                  {/* Sliding Background */}
                  <div 
                    className="absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-sm transition-all duration-400 ease-out"
                    style={{ 
                      width: 'calc(33.33% - 4px)', 
                      left: activeTab === 'nutrisi' ? '6px' : activeTab === 'bahan' ? 'calc(33.33% + 2px)' : 'calc(66.66% - 2px)' 
                    }}
                  ></div>
                  
                  <button onClick={() => setActiveTab("nutrisi")} className={`relative z-10 flex-1 py-2.5 text-xs sm:text-sm font-bold transition-colors duration-300 ${activeTab === "nutrisi" ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
                    Nutrisi Total
                  </button>
                  <button onClick={() => setActiveTab("bahan")} className={`relative z-10 flex-1 py-2.5 text-xs sm:text-sm font-bold transition-colors duration-300 ${activeTab === "bahan" ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
                    Bahan Baku
                  </button>
                  <button onClick={() => setActiveTab("langkah")} className={`relative z-10 flex-1 py-2.5 text-xs sm:text-sm font-bold transition-colors duration-300 ${activeTab === "langkah" ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
                    Cara Masak
                  </button>
                </div>
                
                {/* KONTEN TAB (Scrollable & Rapi) */}
                <div className="h-[100px] overflow-y-auto custom-scroll pr-2">
                  
                  {activeTab === "nutrisi" && (
                    <div className="flex gap-4 h-full">
                      <div className="flex flex-1 flex-col justify-center rounded-2xl bg-gray-50 p-4 border border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Kalori Total</p>
                        <p className="text-3xl font-black text-gray-900 leading-none">{currentMenu.cal} <span className="text-sm font-bold text-gray-400">Kkal</span></p>
                      </div>
                      <div className="flex flex-1 flex-col justify-center rounded-2xl bg-orange-50/50 p-4 border border-orange-100/50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">User Rating</p>
                        <p className="text-3xl font-black text-gray-900 flex items-center gap-2 leading-none">{currentMenu.rating} <span className="text-orange-400 pb-1 text-xl"><IconStar /></span></p>
                      </div>
                    </div>
                  )}

                  {activeTab === "bahan" && (
                    <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                      {currentMenu.ingredients.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-gray-600">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100 text-[9px] text-green-600"><IconCheck /></span> 
                          <span className="leading-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {activeTab === "langkah" && (
                    <ul className="flex flex-col gap-3">
                      {currentMenu.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-xs font-semibold text-gray-600">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">{idx + 1}</span> 
                          <span className="leading-relaxed pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- BAGIAN BAWAH: Smart Navigation & Thumbnail --- */}
        <div className="mt-8 flex flex-col items-center justify-between gap-8 pb-12 lg:flex-row lg:pl-20 relative z-20">
          
          <div className="flex gap-1.5 rounded-full bg-white/80 backdrop-blur-md px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
            <button onClick={() => router.push('/resep')} title="Katalog Resep" className="flex cursor-pointer h-12 w-12 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"><IconCutlery /></button>
            <button onClick={() => router.push('/resep')} title="Minuman" className="flex cursor-pointer h-12 w-12 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"><IconDrink /></button>
            <button onClick={() => router.push('/chatbot')} title="Tanya GiziBot" className="flex cursor-pointer h-12 w-12 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"><IconChat /></button>
            <button onClick={() => router.push('/profile')} title="Profil" className="flex cursor-pointer h-12 w-12 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"><IconUser /></button>
            <button onClick={() => router.push('/scanner')} title="AI Scanner" className="flex cursor-pointer h-12 w-12 items-center justify-center rounded-full bg-[#1A453A] text-white shadow-md hover:bg-[#123129] hover:scale-105 transition-all"><IconMic /></button>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={handlePrev} className="text-gray-400 hover:text-gray-900 transition-colors">
              <IconChevronLeft />
            </button>
            
            <div className="flex items-center gap-2">
              {menuData.map((menu, index) => {
                const isActive = index === active;
                return (
                  <div 
                    key={menu.id}
                    onClick={() => handleMenuChange(index)}
                    className={`group relative flex cursor-pointer flex-col items-center justify-center transition-all duration-500 ${
                      isActive 
                      ? "bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-white min-w-[90px] -translate-y-2" 
                      : "p-2 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img 
                      src={menu.img} 
                      alt={menu.thumb}
                      className={`rounded-full object-cover transition-all duration-500 ${isActive ? "h-14 w-14 mb-3 shadow-md" : "h-12 w-12 mb-2"}`}
                    />
                    <span className={`text-center leading-tight transition-all duration-300 ${isActive ? "text-[10px] font-extrabold text-gray-900" : "text-[9px] font-semibold text-gray-500"}`}>
                      {menu.thumb.split(' ').map((word, i) => <span key={i}>{word}<br/></span>)}
                    </span>
                  </div>
                );
              })}
            </div>

            <button onClick={handleNext} className="text-gray-400 hover:text-gray-900 transition-colors">
              <IconChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconClock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconStar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconBookmark = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
const IconBookmarkSolid = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconChevronLeft = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronRight = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconCutlery = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>;
const IconDrink = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8"/><path d="M12 15v7"/><path d="M12 15l-8-8c-2-2 1-5 2-5h12c1 0 4 3 2 5Z"/></svg>;
const IconChat = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconUser = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconMic = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>;
const IconArrowRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconPlus = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconSparkle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>;