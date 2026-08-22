// Path: src/app/(dashboard)/meal-plan/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

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
        if (window.innerWidth < 768) {
          // On mobile, use dvh to handle address bar gracefully, minus approx top nav height
          containerRef.current.style.height = `calc(100dvh - 70px)`;
        } else {
          const rect = containerRef.current.getBoundingClientRect();
          const paddingBottom = rect.top > 0 ? rect.top : 24; 
          const exactHeight = window.innerHeight - rect.top - paddingBottom;
          containerRef.current.style.height = `${exactHeight}px`;
        }
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

  // ==========================================
  // REAL-TIME INPUT VALIDATOR (ANTI-JEBOL)
  // ==========================================
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const rawValue = typeof e === 'string' ? e : e.target.value.replace(/[^0-9]/g, "");
    if (rawValue) {
      const formatted = parseInt(rawValue, 10).toLocaleString("id-ID");
      setBudget(formatted);
    } else {
      setBudget("");
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    if (valStr === "") {
      setDays("");
      return;
    }
    const val = parseInt(valStr);
    if (val > 7) {
      Swal.fire({
        title: "Maksimal 7 Hari",
        text: "Untuk menjaga variasi menu, maksimal plan adalah 7 hari.",
        icon: "info",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false
      });
      setDays("7");
    } else if (val < 1) {
      setDays("1");
    } else {
      setDays(valStr);
    }
  };

  const handlePeopleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    if (valStr === "") {
      setPeople("");
      return;
    }
    const val = parseInt(valStr);
    if (val > 10) {
      Swal.fire({
        title: "Maksimal 10 Orang",
        text: "Batas maksimal porsi rumahan adalah 10 orang.",
        icon: "info",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false
      });
      setPeople("10");
    } else if (val < 1) {
      setPeople("1");
    } else {
      setPeople(valStr);
    }
  };

  // FUNGSI WIZARD (Pintu Gerbang Lanjutan)
  const nextStep = () => {
    // Pengaman ekstra kalau user kosongin inputan ("") terus maksa klik lanjut
    if (step === 2 && (!days || parseInt(days) < 1)) setDays("1");
    if (step === 3 && (!people || parseInt(people) < 1)) setPeople("1");
    
    setStep((prev) => Math.min(prev + 1, 4));
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // FALLBACK JIKA API ERROR (SUDAH 100% SINKRON DENGAN DUMMY RECIPES)
  const fallbackMeals = [
    {
      day: 1,
      meals: [
        { 
          id: "fall_1", 
          type: "Sarapan", time: "07:00", kal: 320, pro: 12, car: 45, fat: 8,
          title: "Oatmeal Buah Naga", 
          category: "Sarapan", 
          calories: 320, 
          rating: 4.9, 
          reviews: 124, 
          author: "Gizify AI", 
          date: "Hari Ini", 
          matchScore: 98, 
          description: "Oatmeal sehat yang kaya akan serat dan antioksidan dari buah naga. Sangat cocok untuk memulai pagi dengan energi penuh tanpa rasa begah.", 
          prepTime: "5 Menit", 
          cookTime: "10 Menit", 
          servings: "1 Porsi", 
          totalBudget: "Rp 15.000",
          location: "Jakarta, Indonesia",
          equipments: ["Stove", "Saucepan", "Bowl", "Spoon"],
          nutrition: { kalori: 320, protein: "12g", lemak: "8g", karbohidrat: "45g", serat: "5g", gula: "2g", natrium: "100mg" }, 
          ingredients: [
            { section: "Bahan Utama", items: ["40g Oatmeal instan", "1/2 Buah naga merah (potong dadu)", "150ml Susu almond tanpa gula"] }
          ], 
          instructions: [
            "Panaskan susu almond dalam panci kecil (Saucepan) menggunakan kompor (Stove) dengan api sedang.",
            "Masukkan oatmeal, aduk perlahan secara konstan hingga teksturnya mengental, sekitar 5 menit.",
            "Pindahkan ke dalam mangkuk saji (Bowl). Tata rapi potongan buah naga di atasnya. Sajikan selagi hangat."
          ], 
          image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=800&auto=format&fit=crop"
        },
        { 
          id: "fall_2", 
          type: "Makan Siang", time: "12:30", kal: 550, pro: 45, car: 50, fat: 15,
          title: "Dada Ayam Bakar Rosemary", 
          category: "Makan Siang", 
          calories: 550, 
          rating: 4.8, 
          reviews: 89, 
          author: "Gizify AI", 
          date: "Hari Ini", 
          matchScore: 95, 
          description: "Menu makan siang tinggi protein dengan aroma rosemary yang membangkitkan selera. Menggunakan dada ayam fillet bebas lemak yang dipanggang sempurna.", 
          prepTime: "10 Menit", 
          cookTime: "20 Menit", 
          servings: "1 Porsi", 
          totalBudget: "Rp 25.000",
          location: "Jakarta, Indonesia",
          equipments: ["Stove", "Non-stick Pan", "Tongs", "Knife", "Cutting Board"],
          nutrition: { kalori: 550, protein: "45g", lemak: "15g", karbohidrat: "50g", serat: "5g", gula: "2g", natrium: "250mg" }, 
          ingredients: [
            { section: "Bahan Utama", items: ["200g Dada ayam fillet", "1 sdt Minyak zaitun", "1 sdt Rosemary kering", "Garam dan lada hitam secukupnya"] }
          ], 
          instructions: [
            "Keringkan dada ayam menggunakan tisu dapur. Baluri dengan minyak zaitun, rosemary, garam, dan lada hitam secara merata.",
            "Panaskan wajan anti lengket (Non-stick Pan) di atas kompor dengan api sedang-tinggi.",
            "Panggang dada ayam selama 6-8 menit di setiap sisinya hingga matang sempurna dan berwarna kecoklatan. Gunakan capitan (Tongs) untuk membalik.",
            "Angkat dan diamkan (rest) selama 3 menit sebelum dipotong agar sari dagingnya tidak keluar."
          ], 
          image: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=800&auto=format&fit=crop"
        },
        { 
          id: "fall_3", 
          type: "Makan Malam", time: "19:00", kal: 400, pro: 35, car: 10, fat: 22,
          title: "Salad Tuna Alpukat Zesty", 
          category: "Makan Malam", 
          calories: 400, 
          rating: 4.9, 
          reviews: 210, 
          author: "Gizify AI", 
          date: "Hari Ini", 
          matchScore: 99, 
          description: "Makan malam rendah karbohidrat yang sangat praktis. Tuna kaya omega-3 dipadukan dengan alpukat yang creamy tanpa perlu proses memasak yang rumit.", 
          prepTime: "10 Menit", 
          cookTime: "0 Menit", 
          servings: "1 Porsi", 
          totalBudget: "Rp 35.000",
          location: "Jakarta, Indonesia",
          equipments: ["Large Bowl", "Fork", "Knife", "Cutting Board"],
          nutrition: { kalori: 400, protein: "35g", lemak: "22g", karbohidrat: "10g", serat: "5g", gula: "2g", natrium: "300mg" }, 
          ingredients: [
            { section: "Bahan Utama", items: ["1 kaleng Tuna in water (tiriskan)", "1/2 buah Alpukat (potong dadu)", "1 genggam Selada romaine", "1 sdm Perasan lemon", "Lada hitam secukupnya"] }
          ], 
          instructions: [
            "Tiriskan air dari kaleng tuna secara maksimal. Pindahkan daging tuna ke mangkuk besar (Large Bowl).",
            "Hancurkan perlahan daging tuna menggunakan garpu (Fork) agar tidak terlalu menggumpal.",
            "Masukkan selada romaine dan potongan dadu alpukat ke dalam mangkuk.",
            "Siram dengan perasan air lemon segar dan taburi lada hitam. Aduk perlahan agar tekstur alpukat tidak hancur. Sajikan segera."
          ], 
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop"
        }
      ]
    },
    {
      day: 2,
      meals: [
        { 
          id: "fall_4", 
          type: "Sarapan", time: "07:00", kal: 300, pro: 15, car: 30, fat: 10,
          title: "Roti Gandum Telur Dadar", 
          category: "Sarapan", 
          calories: 300, 
          rating: 4.7, 
          reviews: 65, 
          author: "Gizify AI", 
          date: "Hari Ini", 
          matchScore: 92, 
          description: "Menu sarapan klasik yang tak pernah salah. Karbohidrat kompleks dari gandum utuh dan protein berkualitas dari telur ayam.", 
          prepTime: "5 Menit", 
          cookTime: "5 Menit", 
          servings: "1 Porsi", 
          totalBudget: "Rp 12.000",
          location: "Jakarta, Indonesia",
          equipments: ["Stove", "Non-stick Pan", "Spatula"],
          nutrition: { kalori: 300, protein: "15g", lemak: "10g", karbohidrat: "30g", serat: "5g", gula: "2g", natrium: "200mg" }, 
          ingredients: [
            { section: "Bahan Utama", items: ["2 lembar Roti gandum utuh", "2 butir Telur ayam", "1 sdt Mentega", "Sejumput garam"] }
          ], 
          instructions: [
            "Kocok lepas dua butir telur dengan sejumput garam.",
            "Panaskan wajan anti lengket dan lelehkan mentega dengan api sedang.",
            "Panggang roti gandum sebentar hingga sedikit kecoklatan, lalu sisihkan.",
            "Tuang kocokan telur ke wajan, masak hingga matang sesuai selera (bisa dadar atau orak-arik). Sajikan bersama roti."
          ], 
          image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?q=80&w=800&auto=format&fit=crop"
        },
        { 
          id: "fall_5", 
          type: "Makan Siang", time: "12:30", kal: 500, pro: 40, car: 45, fat: 12,
          title: "Nasi Merah Ikan Dori", 
          category: "Makan Siang", 
          calories: 500, 
          rating: 4.8, 
          reviews: 110, 
          author: "Gizify AI", 
          date: "Hari Ini", 
          matchScore: 96, 
          description: "Makan siang mengenyangkan dengan ikan dori yang lembut dan kaya protein. Disajikan bersama nasi merah yang memiliki indeks glikemik rendah.", 
          prepTime: "10 Menit", 
          cookTime: "15 Menit", 
          servings: "1 Porsi", 
          totalBudget: "Rp 30.000",
          location: "Jakarta, Indonesia",
          equipments: ["Stove", "Non-stick Pan", "Spatula", "Rice Cooker"],
          nutrition: { kalori: 500, protein: "40g", lemak: "12g", karbohidrat: "45g", serat: "5g", gula: "2g", natrium: "300mg" }, 
          ingredients: [
            { section: "Bahan Utama", items: ["150g Ikan Dori fillet", "100g Nasi merah matang", "Bawang putih bubuk secukupnya", "1 sdt Minyak zaitun"] }
          ], 
          instructions: [
            "Keringkan fillet ikan dori, lalu taburi dengan bawang putih bubuk dan sedikit garam.",
            "Panaskan wajan dengan minyak zaitun. Panggang ikan dori selama 4-5 menit per sisi hingga matang dan berwarna putih solid.",
            "Sajikan ikan dori hangat berdampingan dengan nasi merah yang sudah dimasak menggunakan Rice Cooker."
          ], 
          image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=800&auto=format&fit=crop"
        }
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
          let parsedMeals = fallbackMeals;

          if (resultText) {
            try {
              let cleanedText = resultText.replace(/```json/gi, "").replace(/```/g, "").trim();
              
              try {
                // Coba parse secara utuh
                parsedMeals = JSON.parse(cleanedText);
              } catch (err1) {
                // Jika gagal, gunakan parser untuk mengekstrak array pertama yang valid (menghindari teks ekstra/error multiple array)
                const extractValidArray = (text: string) => {
                  const start = text.indexOf('[');
                  if (start === -1) return null;
                  let count = 0;
                  let inStr = false;
                  let esc = false;
                  for (let i = start; i < text.length; i++) {
                    const char = text[i];
                    if (!esc && char === '"') inStr = !inStr;
                    if (!inStr) {
                      if (char === '[') count++;
                      else if (char === ']') count--;
                    }
                    esc = (inStr && char === '\\' && !esc);
                    if (count === 0 && char === ']') return text.substring(start, i + 1);
                  }
                  return null;
                };

                const firstValidArray = extractValidArray(cleanedText);
                if (firstValidArray) {
                  parsedMeals = JSON.parse(firstValidArray);
                } else {
                  // Fallback: coba ekstrak object {...} pertama
                  const extractValidObject = (text: string) => {
                    const start = text.indexOf('{');
                    if (start === -1) return null;
                    let count = 0;
                    let inStr = false;
                    let esc = false;
                    for (let i = start; i < text.length; i++) {
                      const char = text[i];
                      if (!esc && char === '"') inStr = !inStr;
                      if (!inStr) {
                        if (char === '{') count++;
                        else if (char === '}') count--;
                      }
                      esc = (inStr && char === '\\' && !esc);
                      if (count === 0 && char === '}') return text.substring(start, i + 1);
                    }
                    return null;
                  };

                  const firstValidObj = extractValidObject(cleanedText);
                  if (firstValidObj) {
                    parsedMeals = JSON.parse(firstValidObj);
                  } else {
                    throw err1;
                  }
                }
              }

              // Normalisasi hasil menjadi Array
              if (!Array.isArray(parsedMeals)) {
                const possibleArray = Object.values(parsedMeals).find(val => Array.isArray(val));
                if (possibleArray) {
                  parsedMeals = possibleArray as any[];
                } else {
                  parsedMeals = [parsedMeals];
                }
              }

            } catch (e) {
              console.error("Gagal parsing JSON dari AI", e);
              console.log("Raw Response dari AI (sebagian):", resultText.substring(0, 500));
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
    <div className="flex flex-col w-full mb-6 md:mb-8 animate-fade-in-up">
      <div className="flex items-center gap-3 md:gap-4 mb-3">
        <button onClick={prevStep} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-slate-500 hover:text-[#1EAB57] active:scale-95 cursor-pointer shrink-0">
          <IconChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div className="flex-1 flex gap-2 md:gap-3">
          <div className={`h-1.5 md:h-2 flex-1 rounded-full transition-all duration-700 ${currentStep >= 1 ? 'bg-[#1EAB57] shadow-[0_0_12px_rgba(30,171,87,0.4)]' : 'bg-slate-200'}`}></div>
          <div className={`h-1.5 md:h-2 flex-1 rounded-full transition-all duration-700 ${currentStep >= 2 ? 'bg-[#1EAB57] shadow-[0_0_12px_rgba(30,171,87,0.4)]' : 'bg-slate-200'}`}></div>
          <div className={`h-1.5 md:h-2 flex-1 rounded-full transition-all duration-700 ${currentStep >= 3 ? 'bg-[#1EAB57] shadow-[0_0_12px_rgba(30,171,87,0.4)]' : 'bg-slate-200'}`}></div>
        </div>
      </div>
      <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest pl-14 md:pl-16">Tahap {currentStep} Dari 3</p>
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
                <img src="/image/icon-plan-resep.jpg" alt="Meal Plan" className="w-full h-full object-contain" />
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
              <div className="flex flex-col h-full p-5 md:p-12 w-full">
                <div className="flex flex-col w-full mb-6 md:mb-8 animate-fade-in-up">
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
                  <div className="flex flex-col h-full p-5 md:p-12 w-full">
                    {renderProgressBar(step)}
                    <div className="flex-1 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 mt-4 md:mt-6">
                      
                      {step === 1 && (
                        <div className="flex-1 flex flex-col text-center lg:text-left items-center lg:items-start w-full">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] md:rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-[#1EAB57] mb-4 md:mb-6 shadow-sm border border-emerald-100 animate-fade-in-right delay-100">
                            <IconWallet className="w-8 h-8 md:w-10 md:h-10" />
                          </div>
                          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight mb-3 md:mb-4 leading-[1.1] animate-fade-in-right delay-150">Berapa budget<br className="hidden lg:block"/> makananmu?</h1>
                          <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-md animate-fade-in-right delay-200">Kami akan membantu membuat rencana gizi harian terbaik yang ramah di kantong sesuai dengan budget yang kamu miliki.</p>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="flex-1 flex flex-col text-center lg:text-left items-center lg:items-start w-full">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] md:rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-[#1EAB57] mb-4 md:mb-6 shadow-sm border border-emerald-100 animate-fade-in-right delay-100">
                            <IconCalendar className="w-8 h-8 md:w-10 md:h-10" />
                          </div>
                          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight mb-3 md:mb-4 leading-[1.1] animate-fade-in-right delay-150">Untuk berapa hari?</h1>
                          <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-md animate-fade-in-right delay-200">Tentukan durasi program dietmu agar AI kami dapat menghitung pembagian kalori dan budget harian secara presisi.</p>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="flex-1 flex flex-col text-center lg:text-left items-center lg:items-start w-full">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] md:rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-[#1EAB57] mb-4 md:mb-6 shadow-sm border border-emerald-100 animate-fade-in-right delay-100">
                            <IconUsers className="w-8 h-8 md:w-10 md:h-10" />
                          </div>
                          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight mb-3 md:mb-4 leading-[1.1] animate-fade-in-right delay-150">Untuk berapa orang?</h1>
                          <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-md animate-fade-in-right delay-200">Kami akan menyesuaikan porsi resep masakan agar gizi seluruh anggota keluarga atau temanmu tercukupi dengan pas.</p>
                        </div>
                      )}

                      <div className="flex-1 w-full flex flex-col justify-center gap-4 md:gap-6 animate-fade-in-up delay-250">
                        {step === 1 && (
                          <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 focus-within:border-[#1EAB57] focus-within:ring-[6px] focus-within:ring-[#1EAB57]/10 transition-all shadow-sm">
                            <span className="text-[#1EAB57] font-black text-2xl md:text-4xl mr-3 md:mr-4 bg-emerald-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl shrink-0">Rp</span>
                            <input 
                              type="text" value={budget} onChange={handleBudgetChange}
                              className="flex-1 bg-transparent text-3xl md:text-5xl font-black text-[#0F172A] focus:outline-none placeholder:text-slate-300 w-full min-w-0"
                              placeholder="0" autoFocus
                            />
                          </div>
                        )}
                        {step === 2 && (
                          <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 focus-within:border-[#1EAB57] focus-within:ring-[6px] focus-within:ring-[#1EAB57]/10 transition-all shadow-sm">
                            <div className="bg-emerald-50 p-2 md:p-3 rounded-xl md:rounded-2xl mr-3 md:mr-5 shrink-0"><IconClock className="w-6 h-6 md:w-8 md:h-8 text-[#1EAB57]" /></div>
                            {/* UPDATE PENTING DI SINI: MENGGUNAKAN FUNGSI PENAHAN */}
                            <input 
                              type="number" 
                              value={days} onChange={handleDaysChange}
                              className="flex-1 bg-transparent text-3xl md:text-5xl font-black text-[#0F172A] focus:outline-none placeholder:text-slate-300 w-full min-w-0"
                              placeholder="1 - 7" autoFocus
                            />
                            <span className="text-slate-400 font-black text-lg md:text-2xl uppercase tracking-widest ml-2 md:ml-4 shrink-0">Hari</span>
                          </div>
                        )}
                        {step === 3 && (
                          <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 focus-within:border-[#1EAB57] focus-within:ring-[6px] focus-within:ring-[#1EAB57]/10 transition-all shadow-sm">
                            <div className="bg-emerald-50 p-2 md:p-3 rounded-xl md:rounded-2xl mr-3 md:mr-5 shrink-0"><IconUsers className="w-6 h-6 md:w-8 md:h-8 text-[#1EAB57]" /></div>
                            {/* UPDATE PENTING DI SINI: MENGGUNAKAN FUNGSI PENAHAN */}
                            <input 
                              type="number" 
                              value={people} onChange={handlePeopleChange}
                              className="flex-1 bg-transparent text-3xl md:text-5xl font-black text-[#0F172A] focus:outline-none placeholder:text-slate-300 w-full min-w-0"
                              placeholder="1 - 10" autoFocus
                            />
                            <span className="text-slate-400 font-black text-lg md:text-2xl uppercase tracking-widest ml-2 md:ml-4 shrink-0">Orang</span>
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
                          <img src="/image/icon-plan-resep.jpg" alt="Meal Plan" className="w-full h-full object-contain drop-shadow-sm" />
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