// Path: src/app/(dashboard)/resep/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { dummyRecipes } from "@/data/dummyRecipes";

export default function DetailResepPage() {
  const params = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [recipeDetail, setRecipeDetail] = useState<any>(null);

  const fallbackImg = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop";
  const getImageUrl = (title: string) => `https://image.pollinations.ai/prompt/delicious%20food%20plating%20${encodeURIComponent(title)}?width=800&height=600&nologo=true`;

  useEffect(() => {
    const searchInStorage = () => {
      // 1. Cari di meal plan result (sessionStorage - kalau klik langsung dari hasil generate)
      const mealPlanSession = sessionStorage.getItem("gizify_mealplan_result");
      if (mealPlanSession) {
        try {
          const parsedData = JSON.parse(mealPlanSession);
          if (parsedData.plan && Array.isArray(parsedData.plan)) {
            for (const dayObj of parsedData.plan) {
              if (dayObj.meals && Array.isArray(dayObj.meals)) {
                const match = dayObj.meals.find((m: any) => String(m.id) === String(params.id));
                if (match) return match;
              }
            }
          }
        } catch (e) {
          console.error("Gagal parse meal plan dari session", e);
        }
      }

      // 2. Cari di saved plan (localStorage - kalau diakses dari jurnal)
      const mealPlanLocal = localStorage.getItem("gizify_saved_plan");
      if (mealPlanLocal) {
        try {
          const parsedData = JSON.parse(mealPlanLocal);
          if (parsedData.plan && Array.isArray(parsedData.plan)) {
            for (const dayObj of parsedData.plan) {
              if (dayObj.meals && Array.isArray(dayObj.meals)) {
                const match = dayObj.meals.find((m: any) => String(m.id) === String(params.id));
                if (match) return match;
              }
            }
          }
        } catch (e) {
          console.error("Gagal parse meal plan dari local storage", e);
        }
      }

      return null;
    };

    const fetchRecipe = async () => {
      const foundMeal = searchInStorage();
      
      if (foundMeal) {
        setRecipeDetail({
          ...foundMeal,
          author: "Gizify", 
          date: "Hari Ini",
          rating: 5.0,
          reviews: 1,
          matchScore: 98,
          image: foundMeal.image || getImageUrl(foundMeal.title)
        });
        setIsLoaded(true);
        return;
      }

      const dummyMatch = dummyRecipes.find(r => String(r.id) === String(params.id));
      if (dummyMatch) {
        setRecipeDetail({
          ...dummyMatch,
          author: "Gizify",
          image: dummyMatch.image || getImageUrl(dummyMatch.title),
        });
      }
      setIsLoaded(true);
    };

    fetchRecipe();
  }, [params.id]);

  if (!recipeDetail && isLoaded) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-2xl font-black text-slate-800 mb-2">Resep Tidak Ditemukan</h1>
        <p className="text-slate-500 mb-6">Mungkin sesi AI sudah berakhir atau ID tidak valid.</p>
        <Link href="/resep" className="bg-[#1EAB57] text-white px-6 py-3 rounded-xl font-bold">
          Kembali ke Resep
        </Link>
      </div>
    );
  }

  if (!recipeDetail) {
    return <div className="w-full h-screen bg-white"></div>;
  }

  const toggleIngredient = (index: number) => {
    if (checkedIngredients.includes(index)) {
      setCheckedIngredients(checkedIngredients.filter(i => i !== index));
    } else {
      setCheckedIngredients([...checkedIngredients, index]);
    }
  };

  // ALGORITMA PEMBERSIH TEKS (SMART EXTRACTOR)
  const extractCoreIngredient = (text: string) => {
    // 1. Buang teks di dalam kurung
    let cleaned = text.replace(/\(.*\)/g, '').trim();
    
    // 2. Buang angka dan satuan pengukur
    const units = ['sdm', 'sdt', 'gram', 'gr', 'g', 'ml', 'liter', 'kg', 'buah', 'lembar', 'siung', 'genggam', 'ruas', 'ekor', 'kaleng', 'batang', 'potong', 'papan', 'bungkus', 'butir'];
    const regex = new RegExp(`^([0-9.,\\/\\-]+)\\s*(${units.join('|')})?\\s*`, 'i');
    cleaned = cleaned.replace(regex, '').trim();
    
    // 3. Ambil maksimal 2 kata pertama aja biar search map-nya gampang
    const words = cleaned.split(' ');
    if (words.length > 2) {
       return words.slice(0, 2).join(' '); 
    }
    return cleaned;
  };

  let ingredientGlobalIndex = 0; 

  // Menggabungkan 3 bahan utama untuk dilempar ke tombol raksasa di bawah
  const mainIngredientsList = recipeDetail.ingredients && recipeDetail.ingredients[0] && recipeDetail.ingredients[0].items 
    ? recipeDetail.ingredients[0].items.slice(0, 3).map((item: string) => extractCoreIngredient(item)).join(", ") 
    : "Bahan segar";

  return (
    <div className="w-full pb-24 md:pb-12 relative min-w-0 overflow-x-hidden bg-white">
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up {
            opacity: 0;
            transform: translateY(30px);
            animation: fadeUpAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes fadeUpAnim {
            to { opacity: 1; transform: translateY(0); }
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
        `
      }} />

      <div className="max-w-[1000px] mx-auto px-4 md:px-8 mt-4 lg:mt-8">
        
        {/* TOP NAVIGATION */}
        <div className={`flex items-center justify-between mb-8 ${isLoaded ? 'animate-fade-up' : 'opacity-0'}`}>
          <Link href="/resep" className="flex items-center gap-2 text-slate-500 hover:text-[#1EAB57] transition-colors group">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
              <IconChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest hidden sm:block">Kembali</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:text-[#1EAB57] hover:bg-emerald-50 transition-colors border border-slate-100">
              <IconShare className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-colors border border-slate-100">
              <IconBookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RECIPE HEADER INFO */}
        <div className={`mb-8 ${isLoaded ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 text-[#1EAB57] mb-4">
            <IconSparkles className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">{recipeDetail.matchScore}% Sesuai Dengan Targetmu</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            {recipeDetail.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
            <div className="flex items-center gap-2.5 pr-4 md:pr-6 border-r border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 overflow-hidden">
                <IconBot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-900">{recipeDetail.author}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{recipeDetail.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <IconStar key={i} className="w-4 h-4" filled={i < Math.floor(recipeDetail.rating)} />
                ))}
              </div>
              <span className="font-black text-slate-800 ml-1">{recipeDetail.rating}</span>
              <span className="font-bold text-slate-400 text-xs">({recipeDetail.reviews})</span>
            </div>
          </div>
        </div>

        <p className={`text-slate-600 font-medium leading-relaxed mb-8 md:mb-12 max-w-3xl ${isLoaded ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
          {recipeDetail.description}
        </p>

        {/* HERO IMAGE */}
        <div className={`relative w-full h-[250px] md:h-[400px] lg:h-[500px] rounded-[2rem] overflow-hidden mb-10 md:mb-12 group cursor-pointer shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] ${isLoaded ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
          <img src={recipeDetail.image} onError={(e) => { e.currentTarget.src = fallbackImg; }} alt={recipeDetail.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 bg-slate-200" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 group-hover:scale-110 transition-transform shadow-lg">
              <IconPlay className="w-8 h-8 ml-1" />
            </div>
          </div>
        </div>

        {/* META STATS ROW */}
        <div className={`flex flex-wrap items-center gap-6 md:gap-12 border-y border-slate-100 py-6 mb-12 ${isLoaded ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Persiapan</p>
            <p className="text-lg font-black text-slate-900">{recipeDetail.prepTime || "10 Menit"}</p>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200"></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Masak</p>
            <p className="text-lg font-black text-slate-900">{recipeDetail.cookTime || "15 Menit"}</p>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200"></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Porsi Sajian</p>
            <p className="text-lg font-black text-slate-900">{recipeDetail.servings || "1 Porsi"}</p>
          </div>
          
          {recipeDetail.totalBudget && (
            <>
              <div className="hidden md:block w-px h-8 bg-slate-200"></div>
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1"><IconWallet className="w-3 h-3" /> Total Budget</p>
                <p className="text-lg font-black text-emerald-600">{recipeDetail.totalBudget}</p>
              </div>
            </>
          )}

          {recipeDetail.location && (
            <>
              <div className="hidden md:block w-px h-8 bg-slate-200"></div>
              <div>
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1"><IconMapPin className="w-3 h-3" /> Lokasi Harga</p>
                <p className="text-sm font-bold text-slate-700 pt-1">{recipeDetail.location}</p>
              </div>
            </>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 ${isLoaded ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
          
          {/* KIRI: INGREDIENTS */}
          <div className="lg:col-span-4 space-y-10">
            
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6 font-serif">Bahan-bahan</h2>
              
              {recipeDetail.ingredients && recipeDetail.ingredients.map((section: any, idx: number) => (
                <div key={idx} className="mb-6 last:mb-0">
                  <h4 className="text-sm font-black text-slate-900 mb-4 bg-slate-50 inline-block px-3 py-1 rounded-md">{section.section}</h4>
                  <div className="space-y-2">
                    {section.items && section.items.map((item: string, itemIdx: number) => {
                      const currentIndex = ingredientGlobalIndex++;
                      const isChecked = checkedIngredients.includes(currentIndex);
                      const cleanName = extractCoreIngredient(item);
                      
                      return (
                        <div 
                          key={currentIndex} 
                          onClick={() => toggleIngredient(currentIndex)}
                          className="flex items-center justify-between gap-3 cursor-pointer group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start gap-3 pr-2">
                            <div className={`w-5 h-5 rounded-full mt-0.5 shrink-0 flex items-center justify-center transition-colors border-2 ${isChecked ? 'bg-[#1EAB57] border-[#1EAB57]' : 'border-slate-300 group-hover:border-[#1EAB57]'}`}>
                              {isChecked && <IconCheck className="w-3 h-3 text-white" />}
                            </div>
                            <p className={`text-sm md:text-base transition-all ${isChecked ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700 font-medium'}`}>
                              {item}
                            </p>
                          </div>
                          
                          <Link 
                            href={`/maps?q=${encodeURIComponent(cleanName)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full bg-emerald-50 text-[#1EAB57] flex items-center justify-center shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-[#1EAB57] hover:text-white transition-all shadow-sm"
                            title={`Cari di Peta: ${cleanName}`}
                          >
                            <IconMapPin className="w-4 h-4" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-8">
                <Link href={`/maps?q=${encodeURIComponent(mainIngredientsList)}`} className="flex items-center justify-center gap-2.5 w-full bg-[#1A453A] hover:bg-[#1EAB57] text-white px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(26,69,58,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(30,171,87,0.4)] active:scale-95 group">
                  <IconMapPin className="w-5 h-5 group-hover:animate-bounce" />
                  Cari Semua Bahan di Peta
                </Link>
              </div>

            </div>

            {/* PERSIAPAN ALAT */}
            {recipeDetail.equipments && (
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-6 font-serif border-t border-slate-100 pt-8">Persiapan Alat</h2>
                <div className="space-y-4">
                  {recipeDetail.equipments.map((eq: string, idx: number) => {
                    const currentIndex = ingredientGlobalIndex++;
                    const isChecked = checkedIngredients.includes(currentIndex);
                    
                    return (
                      <div 
                        key={currentIndex} 
                        onClick={() => toggleIngredient(currentIndex)}
                        className="flex items-start gap-3 cursor-pointer group"
                      >
                        <div className={`w-5 h-5 rounded-full mt-0.5 shrink-0 flex items-center justify-center transition-colors border-2 ${isChecked ? 'bg-[#1EAB57] border-[#1EAB57]' : 'border-slate-300 group-hover:border-[#1EAB57]'}`}>
                          {isChecked && <IconCheck className="w-3 h-3 text-white" />}
                        </div>
                        <p className={`text-sm md:text-base transition-all ${isChecked ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700 font-medium'}`}>
                          {eq}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Informasi Gizi Table */}
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] mt-8">
              <h3 className="text-lg font-black text-slate-900 mb-6 font-serif">Informasi Gizi</h3>
              
              {recipeDetail.nutrition && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-sm font-black text-slate-800">Kalori</span>
                    <span className="text-sm font-black text-[#1EAB57]">{recipeDetail.nutrition.kalori || recipeDetail.nutrition.calories} Kkal</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                    <span className="text-sm font-medium text-slate-600">Total Protein</span>
                    <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.protein}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                    <span className="text-sm font-medium text-slate-600">Total Lemak</span>
                    <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.lemak || recipeDetail.nutrition.fat}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                    <span className="text-sm font-medium text-slate-600">Total Karbohidrat</span>
                    <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.karbohidrat || recipeDetail.nutrition.carbs}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                    <span className="text-sm font-medium text-slate-600 pl-4">Serat Pangan</span>
                    <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.serat || recipeDetail.nutrition.fiber}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                    <span className="text-sm font-medium text-slate-600 pl-4">Gula</span>
                    <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.gula || recipeDetail.nutrition.sugar}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-medium text-slate-600">Natrium (Garam)</span>
                    <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.natrium || recipeDetail.nutrition.sodium}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* KANAN: INSTRUCTIONS */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-black text-slate-900 mb-8 font-serif">Instruksi Memasak</h2>
            
            <div className="space-y-8 md:space-y-10">
              {recipeDetail.instructions && recipeDetail.instructions.map((step: string, index: number) => (
                <div key={index} className="flex gap-4 md:gap-6 group">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-50 text-[#1EAB57] flex items-center justify-center font-black text-sm md:text-base shrink-0 group-hover:bg-[#1EAB57] group-hover:text-white transition-colors shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] border border-emerald-100">
                    {index + 1}
                  </div>
                  <p className="text-base md:text-lg font-medium text-slate-700 leading-relaxed pt-1 md:pt-1.5 text-justify">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Sudah Masak? Call to Action */}
            <div className="mt-16 pt-10 border-t-2 border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-4 font-serif">Sudah masak resep ini?</h3>
              <button className="bg-white border border-slate-200 hover:border-[#1EAB57] text-slate-700 hover:text-[#1EAB57] px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95">
                Beri Rating & Review
              </button>
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
const IconChevronLeft = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconShare = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
const IconBookmark = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>;
const IconSparkles = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconStar = ({ className, filled }: { className: string, filled?: boolean }) => <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IconBot = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconPlay = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"></path></svg>;
const IconCheck = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconWallet = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const IconMapPin = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;  