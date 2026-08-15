// Path: src/app/(dashboard)/meal-plan/result/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MealPlanResultPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [planData, setPlanData] = useState<any>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Default fallback image
  const fallbackImg = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&auto=format&fit=crop";
  const getImageUrl = (title: string) => `https://image.pollinations.ai/prompt/delicious%20food%20plating%20${encodeURIComponent(title)}?width=400&height=300&nologo=true`;

  useEffect(() => {
    const fixHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const paddingBottom = rect.top > 0 ? rect.top : 24; 
        const exactHeight = window.innerHeight - rect.top - paddingBottom;
        containerRef.current.style.height = `${exactHeight}px`;
      }
    };
    fixHeight();
    window.addEventListener("resize", fixHeight);
    
    // Ambil Data dari Session Storage
    const storedData = sessionStorage.getItem("gizify_mealplan_result");
    if (storedData) {
      setPlanData(JSON.parse(storedData));
      setIsLoaded(true);
    } else {
      // Kalau gak ada data (akses URL manual), tendang balik ke wizard
      router.push("/meal-plan");
    }

    return () => window.removeEventListener("resize", fixHeight);
  }, [router]);

  const handleSimpanJurnal = () => {
    if (planData) {
      // Save to local storage for the 'resep' page to use
      localStorage.setItem("gizify_saved_plan", JSON.stringify(planData));
      router.push("/resep");
    }
  };

  if (!isLoaded || !planData || !planData.plan) {
    return <div className="w-full h-screen bg-[#F8FAFC]"></div>; // Blank putih sebelum redirect/load
  }

  return (
    <div ref={containerRef} className="w-full flex flex-col min-h-0 overflow-hidden relative bg-[#F8FAFC]">
      
      {/* DECORATIVE BACKGROUND BLURS */}
      <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-[#1EAB57]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-400/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-in-up { opacity: 0; transform: translateY(30px); animation: fadeUpBouncy 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          .animate-fade-in-right { opacity: 0; transform: translateX(-30px); animation: fadeInRightBouncy 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          
          @keyframes fadeUpBouncy { 
            0% { opacity: 0; transform: translateY(40px); } 
            70% { opacity: 1; transform: translateY(-5px); }
            100% { opacity: 1; transform: translateY(0); } 
          }
          @keyframes fadeInRightBouncy { 
            0% { opacity: 0; transform: translateX(-40px); } 
            70% { opacity: 1; transform: translateX(5px); }
            100% { opacity: 1; transform: translateX(0); } 
          }
          
          .delay-100 { animation-delay: 0.1s; } 
          .delay-200 { animation-delay: 0.2s; } 
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        `
      }} />

      <div className="flex flex-row gap-0 lg:gap-6 w-full h-full min-h-0 relative z-10 overflow-hidden px-4 md:px-6 lg:px-8 lg:pr-10 pb-32 md:pb-16 pt-6 lg:pt-8 animate-fade-in-up">
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-15px_rgb(0,0,0,0.05)] overflow-hidden relative">
          
          {/* HEADER WORKSPACE */}
          <div className="h-[76px] md:h-[86px] shrink-0 bg-white border-b border-slate-100 px-6 md:px-10 flex items-center justify-between z-20 shadow-sm relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1rem] bg-slate-50 flex items-center justify-center shadow-inner overflow-hidden border border-slate-200/60 p-2 shrink-0">
                <img src="/image/icon-plan-resep.png" alt="Meal Plan" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-black text-[#0F172A] tracking-tight leading-none mb-1">Hasil Rencana Menu</h2>
                <p className="text-[9px] md:text-[11px] font-bold text-[#1EAB57] uppercase tracking-widest flex items-center gap-1.5">
                  <IconSparkles className="w-3.5 h-3.5" /> Personalisasi Berhasil
                </p>
              </div>
            </div>
            <Link href="/meal-plan" className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 px-4 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer">
                <IconChevronLeft className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Buat Baru</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 relative min-h-0 flex flex-col">
            <div className="p-6 md:p-10 bg-transparent flex flex-col lg:flex-row gap-8 lg:gap-10 h-full">
              
              {/* KOLOM KIRI: SUMMARY & HEALTH SCORE */}
              <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6">
                
                {/* Header Hasil Kiri */}
                <div className="mb-4">
                  <Link href="/meal-plan" className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-slate-50 transition-colors text-slate-500 border border-slate-200 shadow-sm cursor-pointer mb-6 hover:-translate-x-1">
                    <IconChevronLeft className="w-5 h-5" />
                  </Link>
                  <div className="bg-emerald-50 text-[#1EAB57] px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max border border-emerald-100 mb-3 shadow-sm animate-fade-in-right delay-100">
                    <IconSparkles className="w-3 h-3" /> Berhasil Dirancang AI
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight mb-2 animate-fade-in-right delay-200">Rencana Siap!</h2>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed animate-fade-in-right delay-300">Kombinasi harian hemat & bergizi sesuai dengan profil medismu.</p>
                </div>

                {/* Card Summary Ciamik */}
                <div className="bg-[#0F172A] rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden animate-fade-in-up delay-200">
                  <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-[#1EAB57] rounded-full blur-[50px] pointer-events-none"></div>
                  
                  <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-8 text-slate-300 relative z-10"><IconWallet className="w-4 h-4 text-[#1EAB57]" /> Target Rencana</h3>
                  
                  <div className="flex flex-col gap-5 relative z-10">
                    <div className="flex justify-between items-end border-b border-slate-700 pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Budget</span>
                      <span className="text-xl font-black tracking-tight text-white">Rp {planData.budget}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-700 pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Durasi</span>
                      <span className="text-base font-black text-white">{planData.days} Hari</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-700 pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Porsi</span>
                      <span className="text-base font-black text-white">{planData.people} Orang</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#1EAB57] p-5 rounded-2xl mt-2 shadow-inner border border-emerald-400/30">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-50">Per Hari</span>
                      <span className="text-2xl font-black tracking-tighter text-white drop-shadow-md">
                        Rp {Math.round(parseInt(planData.budget.replace(/\./g, '')) / parseInt(planData.days)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Health Score Card */}
                <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm flex flex-col items-center relative animate-fade-in-up delay-300">
                  <div className="absolute top-5 right-5 bg-emerald-50 text-[#1EAB57] px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                    Sangat Baik
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 w-full mb-6 flex items-center gap-2"><IconCheckCircle className="w-4 h-4 text-[#1EAB57]" /> AI Health Score</h3>
                  
                  <div className="w-32 h-32 relative flex items-center justify-center mb-1">
                    <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="transparent" stroke="#F1F5F9" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="transparent" stroke="#1EAB57" strokeWidth="8" strokeDasharray="263.89" strokeDashoffset={263.89 - (263.89 * 0.95)} strokeLinecap="round" className="drop-shadow-sm transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="flex flex-col items-center justify-center bg-white w-20 h-20 rounded-full z-10 shadow-sm border border-slate-50">
                      <span className="text-3xl font-black text-[#0F172A] tracking-tighter">9.5</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* KOLOM KANAN: LIST MENU DARI AI */}
              <div className="flex-1 flex flex-col bg-white rounded-[2rem] border border-slate-200/60 p-6 md:p-8 shadow-sm animate-fade-in-up delay-200">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sticky top-0 bg-white z-10 py-2 border-b border-slate-100 gap-4">
                  <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                    <IconCalendar className="w-5 h-5 text-[#1EAB57]" /> Jadwal Menu AI
                  </h3>
                  
                  {planData.plan.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {planData.plan.map((dayPlan: any, index: number) => (
                        <button 
                          key={index}
                          onClick={() => setActiveDayIndex(index)}
                          className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                            activeDayIndex === index 
                            ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Hari {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                  {planData.plan.length <= 1 && (
                     <div className="bg-[#0F172A] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Hari 1</div>
                  )}
                </div>

                {/* List Grid Menu Generate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                  {planData.plan[activeDayIndex]?.meals.map((meal: any, idx: number) => (
                    <Link href={`/resep/${meal.id}`} key={idx} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:bg-white hover:border-[#1EAB57]/30 transition-all cursor-pointer group flex flex-col animate-fade-in-up" style={{ animationDelay: `${0.3 + (idx * 0.1)}s` }}>
                      
                      <div className="w-full h-32 md:h-40 rounded-xl overflow-hidden relative mb-4 shadow-sm border border-slate-100 bg-slate-200">
                        <img 
                          src={getImageUrl(meal.title)} 
                          onError={(e) => { e.currentTarget.src = fallbackImg; }}
                          alt={meal.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-800 shadow-sm">
                          {meal.time} • {meal.type}
                        </div>
                      </div>
                      
                      <h4 className="text-base md:text-lg font-black text-slate-900 leading-tight group-hover:text-[#1EAB57] transition-colors mb-3 line-clamp-1">{meal.title}</h4>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded text-[9px] font-bold">Pro: {meal.pro}g</span>
                        <span className="bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded text-[9px] font-bold">Car: {meal.car}g</span>
                        <span className="bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded text-[9px] font-bold">Fat: {meal.fat}g</span>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-200/60">
                        <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                          <IconFlame className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-[10px] font-black text-rose-700">{meal.kal} Kkal</span>
                        </div>
                        
                        {/* UPDATE PENTING: DARI meal.price JADI meal.totalBudget */}
                        <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                          <IconWallet className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px] font-black text-emerald-800">{meal.totalBudget || "Rp -"}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Tombol Simpan Jurnal */}
                <div className="mt-8 pt-6 border-t border-slate-100 animate-fade-in-up delay-500">
                  <button onClick={handleSimpanJurnal} className="w-full bg-[#1EAB57] hover:bg-[#168E46] text-white py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_10px_20px_rgba(30,171,87,0.2)] cursor-pointer">
                    Simpan Rencana ke Jurnal <IconCheckCircle className="w-4 h-4 text-white" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconChevronLeft = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconSparkles = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconCheckCircle = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconWallet = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const IconCalendar = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconFlame = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>;