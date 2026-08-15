// Path: src/app/(dashboard)/meal-plan/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function MealPlanGeneratorPage() {
  const router = useRouter();

  // ==========================================
  // STATE WIZARD & FORM 
  // ==========================================
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState("100.000"); 
  const [days, setDays] = useState("2"); 
  const [people, setPeople] = useState("1"); 
  
  // ==========================================
  // STATE DATA USER (Narik Profil untuk AI)
  // ==========================================
  const [userData, setUserData] = useState<any>(null);

  // ==========================================
  // STATE LOADING (Skeleton & AI)
  // ==========================================
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // EFEK 1: Ambil Data Firebase & Fix Full Height
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
    
    // Ambil Data Profil User
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          }
        } catch (error) {
          console.error("Gagal memuat profil untuk AI:", error);
        }
      }
    });

    const timerLoaded = setTimeout(() => setIsLoaded(true), 100);
    const timerSkeleton = setTimeout(() => setIsPageLoading(false), 1500);
    
    return () => {
      window.removeEventListener("resize", fixHeight);
      clearTimeout(timerLoaded);
      clearTimeout(timerSkeleton);
      unsubscribe();
    };
  }, []);

  // FUNGSI WIZARD
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const rawValue = typeof e === 'string' ? e : e.target.value.replace(/[^0-9]/g, "");
    if (rawValue) {
      const formatted = parseInt(rawValue, 10).toLocaleString("id-ID");
      setBudget(formatted);
    } else {
      setBudget("");
    }
  };

  // FALLBACK JIKA API ERROR
  const fallbackMeals = [
    {
      day: 1,
      meals: [
        { id: "fall_1", type: "Sarapan", time: "07:00", title: "Oatmeal Buah Naga", kal: 320, pro: 12, car: 45, fat: 8, price: "15.000", description: "Oatmeal sehat...", prepTime: "5 MIN", cookTime: "10 MIN", servings: "1 ORANG", ingredients: [{ section: "Utama", items: ["Oatmeal", "Buah Naga"] }], instructions: ["Seduh oatmeal..."], nutrition: { calories: 320, protein: "12g", fat: "8g", carbs: "45g", fiber: "5g", sugar: "2g", sodium: "100mg" } },
        { id: "fall_2", type: "Makan Siang", time: "12:30", title: "Dada Ayam Bakar Rosemary", kal: 550, pro: 45, car: 50, fat: 15, price: "25.000", description: "Dada ayam bakar...", prepTime: "10 MIN", cookTime: "20 MIN", servings: "1 ORANG", ingredients: [{ section: "Utama", items: ["Dada Ayam"] }], instructions: ["Bakar ayam..."], nutrition: { calories: 550, protein: "45g", fat: "15g", carbs: "50g", fiber: "5g", sugar: "2g", sodium: "100mg" } },
        { id: "fall_3", type: "Makan Malam", time: "19:00", title: "Salad Salmon Premium", kal: 400, pro: 35, car: 10, fat: 22, price: "35.000", description: "Salad salmon...", prepTime: "5 MIN", cookTime: "15 MIN", servings: "1 ORANG", ingredients: [{ section: "Utama", items: ["Salmon", "Salad"] }], instructions: ["Siapkan salad..."], nutrition: { calories: 400, protein: "35g", fat: "22g", carbs: "10g", fiber: "5g", sugar: "2g", sodium: "100mg" } }
      ]
    },
    {
      day: 2,
      meals: [
        { id: "fall_4", type: "Sarapan", time: "07:00", title: "Roti Gandum Telur Dada", kal: 300, pro: 15, car: 30, fat: 10, price: "12.000", description: "Roti gandum...", prepTime: "5 MIN", cookTime: "5 MIN", servings: "1 ORANG", ingredients: [{ section: "Utama", items: ["Roti Gandum", "Telur"] }], instructions: ["Panggang roti..."], nutrition: { calories: 300, protein: "15g", fat: "10g", carbs: "30g", fiber: "5g", sugar: "2g", sodium: "100mg" } },
        { id: "fall_5", type: "Makan Siang", time: "12:30", title: "Nasi Merah Ikan Dori", kal: 500, pro: 40, car: 45, fat: 12, price: "30.000", description: "Ikan dori...", prepTime: "10 MIN", cookTime: "15 MIN", servings: "1 ORANG", ingredients: [{ section: "Utama", items: ["Ikan Dori", "Nasi Merah"] }], instructions: ["Panggang ikan..."], nutrition: { calories: 500, protein: "40g", fat: "12g", carbs: "45g", fiber: "5g", sugar: "2g", sodium: "100mg" } }
      ]
    }
  ];

  // ==========================================
  // EFEK LOADING & PEMANGGILAN AI (Step 4)
  // ==========================================
  useEffect(() => {
    if (step === 4) {
      setLoadingStep(1); // Analisis Budget

      const generateAIPlan = async () => {
        try {
          setTimeout(() => setLoadingStep(2), 1500); // Hitung Nutrisi

          // Panggil API Meal Plan Khusus
          const res = await fetch("/api/meal-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ days, people, budget, userData })
          });

          setTimeout(() => setLoadingStep(3), 3500); // Sesuaikan Porsi

          const data = await res.json();
          let resultText = data.result || "";

          // Ekstrak Array JSON dari respons AI
          const jsonMatch = resultText.match(/\[\s*\{[\s\S]*\}\s*\]/);
          let parsedMeals = fallbackMeals;

          if (jsonMatch) {
            try {
              parsedMeals = JSON.parse(jsonMatch[0]);
            } catch (e) {
              console.error("Gagal parsing JSON dari AI", e);
            }
          }

          setTimeout(() => {
            setLoadingStep(4); // Cetak Rencana
            
            // SIMPAN KE SESSION STORAGE LALU REDIRECT KE URL BARU
            sessionStorage.setItem("gizify_mealplan_result", JSON.stringify({
              plan: parsedMeals,
              budget,
              days,
              people
            }));
            
            setTimeout(() => router.push("/meal-plan/result"), 1200); 
          }, 1500);

        } catch (error) {
          console.error("Error panggil AI:", error);
          sessionStorage.setItem("gizify_mealplan_result", JSON.stringify({
            plan: fallbackMeals, budget, days, people
          }));
          setLoadingStep(4);
          setTimeout(() => router.push("/meal-plan/result"), 1200);
        }
      };

      generateAIPlan();
    }
  }, [step, days, people, budget, userData, router]);


  // ==========================================
  // KOMPONEN: PROGRESS BAR PREMIUM
  // ==========================================
  const renderProgressBar = (currentStep: number) => (
    <div className="flex flex-col w-full mb-8 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-3">
        <button onClick={prevStep} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-slate-500 hover:text-[#1EAB57] active:scale-95 cursor-pointer shrink-0">
          <IconChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex gap-3">
          <div className={`h-2 flex-1 rounded-full transition-all duration-700 ${currentStep >= 1 ? 'bg-[#1EAB57] shadow-[0_0_12px_rgba(30,171,87,0.4)]' : 'bg-slate-200'}`}></div>
          <div className={`h-2 flex-1 rounded-full transition-all duration-700 ${currentStep >= 2 ? 'bg-[#1EAB57] shadow-[0_0_12px_rgba(30,171,87,0.4)]' : 'bg-slate-200'}`}></div>
          <div className={`h-2 flex-1 rounded-full transition-all duration-700 ${currentStep >= 3 ? 'bg-[#1EAB57] shadow-[0_0_12px_rgba(30,171,87,0.4)]' : 'bg-slate-200'}`}></div>
        </div>
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-16">Tahap {currentStep} Dari 3</p>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full flex flex-col min-h-0 overflow-hidden relative bg-[#F8FAFC]">
      
      {/* DECORATIVE BACKGROUND BLURS */}
      <div className={`absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-[#1EAB57]/5 rounded-full blur-[100px] pointer-events-none z-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-400/5 rounded-full blur-[120px] pointer-events-none z-0 transition-opacity duration-1000 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* CSS Animasi Kustom SULTAN */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-skeleton { 
            background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); 
            background-size: 200% 100%; 
            animation: skeletonLoading 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; 
          }
          @keyframes skeletonLoading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

          .animate-fade-in-up { opacity: 0; transform: translateY(30px); animation: fadeUpBouncy 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          .animate-fade-in-right { opacity: 0; transform: translateX(-30px); animation: fadeInRightBouncy 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          .animate-fade-in { opacity: 0; animation: fadeIn 0.8s ease-out forwards; }
          
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
          @keyframes fadeIn { to { opacity: 1; } }

          .animate-pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }
          @keyframes pulseSlow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .9; transform: scale(0.95); } }
          
          /* Apple-style floating animation */
          .animate-float { animation: float 3s ease-in-out infinite; }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          
          .delay-100 { animation-delay: 0.1s; } 
          .delay-150 { animation-delay: 0.15s; } 
          .delay-200 { animation-delay: 0.2s; } 
          .delay-250 { animation-delay: 0.25s; } 
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        `
      }} />

      <div className={`flex flex-row gap-0 lg:gap-6 w-full h-full min-h-0 relative z-10 overflow-hidden px-4 md:px-6 lg:px-8 lg:pr-10 pb-32 md:pb-16 pt-6 lg:pt-8 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
        
        {/* ======================================= */}
        {/* MAIN WORKSPACE AREA */}
        {/* ======================================= */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-15px_rgb(0,0,0,0.05)] overflow-hidden relative">
          
          {/* HEADER WORKSPACE */}
          <div className="h-[76px] md:h-[86px] shrink-0 bg-white border-b border-slate-100 px-6 md:px-10 flex items-center justify-between z-20 shadow-sm relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1rem] bg-slate-50 flex items-center justify-center shadow-inner overflow-hidden border border-slate-200/60 p-2 shrink-0">
                <img src="/image/icon-plan-resep.png" alt="Meal Plan" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-black text-[#0F172A] tracking-tight leading-none mb-1">Rencana Menu Budget</h2>
                <p className="text-[9px] md:text-[11px] font-bold text-[#1EAB57] uppercase tracking-widest flex items-center gap-1.5">
                  <IconSparkles className="w-3.5 h-3.5" /> Atur Makan Sehat Tanpa Kantong Jebol
                </p>
              </div>
            </div>
            
            {step < 4 && !isPageLoading && (
              <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm animate-fade-in">
                 <IconCheckCircle className="w-4 h-4 text-[#1EAB57]" />
                 <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Setup Plan</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 relative min-h-0 flex flex-col">
            
            {/* LOADING SKELETON */}
            {isPageLoading ? (
              <div className="flex flex-col h-full p-8 md:p-12 w-full">
                <div className="flex flex-col w-full mb-8 animate-fade-in-up">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full animate-skeleton shrink-0"></div>
                    <div className="flex-1 flex gap-3">
                      <div className="h-2 flex-1 rounded-full animate-skeleton"></div>
                      <div className="h-2 flex-1 rounded-full animate-skeleton"></div>
                      <div className="h-2 flex-1 rounded-full animate-skeleton"></div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 mt-6">
                  <div className="flex-1 flex flex-col items-center lg:items-start w-full gap-4">
                    <div className="w-20 h-20 rounded-[1.5rem] animate-skeleton mb-2 animate-fade-in-right delay-100"></div>
                    <div className="w-3/4 h-12 animate-skeleton rounded-2xl animate-fade-in-right delay-150"></div>
                    <div className="w-1/2 h-12 animate-skeleton rounded-2xl mb-4 animate-fade-in-right delay-200"></div>
                  </div>
                  <div className="flex-1 w-full flex flex-col justify-center gap-6 animate-fade-in-up delay-200">
                    <div className="w-full h-32 animate-skeleton rounded-[2rem] border border-slate-100/50 shadow-sm"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col relative w-full h-full">
                
                {/* WIZARD STEPS (1-3) */}
                {step < 4 && (
                  <div className="flex flex-col h-full p-8 md:p-12 w-full">
                    {renderProgressBar(step)}
                    <div className="flex-1 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 mt-6">
                      
                      {step === 1 && (
                        <div className="flex-1 flex flex-col text-center lg:text-left items-center lg:items-start w-full">
                          <div className="w-20 h-20 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-[#1EAB57] mb-6 shadow-sm border border-emerald-100 animate-fade-in-right delay-100">
                            <IconWallet className="w-10 h-10" />
                          </div>
                          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight mb-4 leading-[1.1] animate-fade-in-right delay-150">Berapa budget<br className="hidden lg:block"/> makananmu?</h1>
                          <p className="text-base font-medium text-slate-500 leading-relaxed max-w-md animate-fade-in-right delay-200">Kami akan membantu membuat rencana gizi harian terbaik yang ramah di kantong sesuai dengan budget yang kamu miliki.</p>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="flex-1 flex flex-col text-center lg:text-left items-center lg:items-start w-full">
                          <div className="w-20 h-20 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-[#1EAB57] mb-6 shadow-sm border border-emerald-100 animate-fade-in-right delay-100">
                            <IconCalendar className="w-10 h-10" />
                          </div>
                          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight mb-4 leading-[1.1] animate-fade-in-right delay-150">Untuk berapa hari?</h1>
                          <p className="text-base font-medium text-slate-500 leading-relaxed max-w-md animate-fade-in-right delay-200">Tentukan durasi program dietmu agar AI kami dapat menghitung pembagian kalori dan budget harian secara presisi.</p>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="flex-1 flex flex-col text-center lg:text-left items-center lg:items-start w-full">
                          <div className="w-20 h-20 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-[#1EAB57] mb-6 shadow-sm border border-emerald-100 animate-fade-in-right delay-100">
                            <IconUsers className="w-10 h-10" />
                          </div>
                          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight mb-4 leading-[1.1] animate-fade-in-right delay-150">Untuk berapa orang?</h1>
                          <p className="text-base font-medium text-slate-500 leading-relaxed max-w-md animate-fade-in-right delay-200">Kami akan menyesuaikan porsi resep masakan agar gizi seluruh anggota keluarga atau temanmu tercukupi dengan pas.</p>
                        </div>
                      )}

                      <div className="flex-1 w-full flex flex-col justify-center gap-6 animate-fade-in-up delay-250">
                        {step === 1 && (
                          <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-[2rem] p-6 md:p-8 focus-within:border-[#1EAB57] focus-within:ring-[6px] focus-within:ring-[#1EAB57]/10 transition-all shadow-sm">
                            <span className="text-[#1EAB57] font-black text-3xl md:text-4xl mr-4 bg-emerald-50 px-4 py-2 rounded-2xl">Rp</span>
                            <input 
                              type="text" value={budget} onChange={handleBudgetChange}
                              className="flex-1 bg-transparent text-4xl md:text-5xl font-black text-[#0F172A] focus:outline-none placeholder:text-slate-300 w-full"
                              placeholder="0" autoFocus
                            />
                          </div>
                        )}
                        {step === 2 && (
                          <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-[2rem] p-6 md:p-8 focus-within:border-[#1EAB57] focus-within:ring-[6px] focus-within:ring-[#1EAB57]/10 transition-all shadow-sm">
                            <div className="bg-emerald-50 p-3 rounded-2xl mr-5"><IconClock className="w-8 h-8 text-[#1EAB57]" /></div>
                            <input 
                              type="number" value={days} onChange={(e) => setDays(e.target.value)}
                              className="flex-1 bg-transparent text-4xl md:text-5xl font-black text-[#0F172A] focus:outline-none placeholder:text-slate-300 w-full"
                              placeholder="0" autoFocus
                            />
                            <span className="text-slate-400 font-black text-2xl uppercase tracking-widest ml-4">Hari</span>
                          </div>
                        )}
                        {step === 3 && (
                          <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-[2rem] p-6 md:p-8 focus-within:border-[#1EAB57] focus-within:ring-[6px] focus-within:ring-[#1EAB57]/10 transition-all shadow-sm">
                            <div className="bg-emerald-50 p-3 rounded-2xl mr-5"><IconUsers className="w-8 h-8 text-[#1EAB57]" /></div>
                            <input 
                              type="number" value={people} onChange={(e) => setPeople(e.target.value)}
                              className="flex-1 bg-transparent text-4xl md:text-5xl font-black text-[#0F172A] focus:outline-none placeholder:text-slate-300 w-full"
                              placeholder="0" autoFocus
                            />
                            <span className="text-slate-400 font-black text-2xl uppercase tracking-widest ml-4">Orang</span>
                          </div>
                        )}
                        <button onClick={nextStep} disabled={step === 1 ? !budget : step === 2 ? !days : !people} className="w-full bg-[#1EAB57] hover:bg-[#168E46] disabled:bg-slate-200 disabled:text-slate-400 text-white py-6 rounded-[2rem] text-sm md:text-base font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_15px_30px_-5px_rgba(30,171,87,0.4)] cursor-pointer group hover:-translate-y-1">
                          {step === 3 ? "Mulai Generate AI" : "Lanjut"} 
                          {step === 3 ? <IconSparkles className="w-5 h-5 text-emerald-200" /> : <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* ======================================= */}
                {/* STEP 4: AI LOADING SULTAN (APPLE STYLE) */}
                {/* ======================================= */}
                {step === 4 && (
                  <div className="flex flex-col items-center justify-center h-full p-6 md:p-12 relative overflow-hidden animate-fade-in bg-slate-50/50">
                    
                    <div className="relative z-10 flex flex-col items-center max-w-xl w-full bg-white/80 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-10 md:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
                      
                      {/* Apple-style Minimalist Icon Pulse */}
                      <div className="relative mb-10 w-28 h-28 flex items-center justify-center">
                        {/* Soft Glow */}
                        <div className="absolute inset-0 bg-[#1EAB57]/20 rounded-[2rem] blur-xl animate-pulse-slow"></div>
                        {/* Smooth Ripple (Subtle) */}
                        <div className="absolute inset-[-15%] rounded-[2.5rem] border border-[#1EAB57]/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        
                        {/* Icon Container */}
                        <div className="w-24 h-24 bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border border-slate-50 relative z-10 animate-float p-4">
                          <img src="/image/icon-plan-resep.png" alt="Meal Plan" className="w-full h-full object-contain drop-shadow-sm" />
                        </div>
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-3 text-center">Menyiapkan Rencana...</h2>
                      <p className="text-sm font-medium text-slate-400 mb-10 text-center max-w-sm">Menganalisis nutrisi dan mencocokkan resep terbaik sesuai budget Anda.</p>
                      
                      {/* Clean Vertical Progress Steps */}
                      <div className="w-full max-w-sm flex flex-col gap-2.5">
                        {[
                          { step: 1, label: "Menganalisis Budget" },
                          { step: 2, label: "Menghitung Nutrisi Profil" },
                          { step: 3, label: "Menyesuaikan Porsi" },
                          { step: 4, label: "Menyelesaikan Rencana" }
                        ].map((item) => {
                          const isActive = loadingStep === item.step;
                          const isDone = loadingStep > item.step;
                          
                          return (
                            <div key={item.step} className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-700 ${isActive ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#1EAB57]/30 scale-[1.02] transform' : isDone ? 'bg-slate-50/50 border border-slate-100/50' : 'bg-transparent border border-transparent'}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-500 shrink-0 ${isDone ? 'bg-[#1EAB57] text-white' : isActive ? 'bg-emerald-100 text-[#1EAB57]' : 'border-2 border-slate-200'}`}>
                                {isDone ? <IconCheckCircle className="w-4 h-4" /> : isActive ? <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1EAB57] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#1EAB57]"></span></span> : null}
                              </div>
                              <span className={`text-[11px] font-black uppercase tracking-widest flex-1 transition-colors duration-500 ${isActive ? 'text-[#1EAB57]' : isDone ? 'text-slate-500' : 'text-slate-300'}`}>{item.label}</span>
                            </div>
                          )
                        })}
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconClock = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCheckCircle = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconChevronLeft = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconArrowRight = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconSparkles = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconWallet = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const IconCalendar = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconUsers = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;