"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ==========================================
// MOCK API DATA: Detail Resep (Dummy Data)
// ==========================================
const recipeDetail = {
  id: "1",
  title: "Ayam Bakar Taliwang Diet Rendah Kalori",
  author: "Chef GiziBot",
  date: "Kemarin",
  rating: 4.8,
  reviews: 124,
  matchScore: 95, // AI Match Score
  description: "Satu hal yang saya pelajari dari diet adalah kita tetap bisa makan enak. Resep Ayam Taliwang ini dimodifikasi dengan dada ayam tanpa kulit dan penggunaan minyak yang sangat minim. Rasanya tetap otentik pedas gurih, namun ramah kalori!",
  image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200&auto=format&fit=crop",
  prepTime: "15 MIN",
  cookTime: "30 MIN",
  servings: "2 ORANG",
  ingredients: [
    { section: "Bahan Utama", items: ["500g Dada ayam fillet (tanpa kulit)", "1 buah jeruk nipis (ambil airnya)", "1 sdt garam diet (low sodium)"] },
    { section: "Bumbu Halus", items: ["7 butir bawang merah", "4 siung bawang putih", "5 buah cabai merah keriting (sesuai selera)", "3 buah cabai rawit merah", "1 ruas kencur", "1 sdt terasi bakar", "1 sdt gula aren (bisa ganti stevia)"] }
  ],
  instructions: [
    "Cuci bersih dada ayam, lumuri dengan air jeruk nipis dan garam. Diamkan selama 15 menit agar bau amis hilang dan daging lebih empuk.",
    "Haluskan semua bahan bumbu halus menggunakan blender atau ulekan. Jika menggunakan blender, tambahkan sedikit air, bukan minyak.",
    "Siapkan wajan anti lengket (teflon). Tumis bumbu halus tanpa minyak (atau gunakan 1 spray olive oil) hingga harum dan matang sempurna. Tambahkan sedikit air jika terlalu kering.",
    "Masukkan dada ayam ke dalam tumisan bumbu. Tambahkan air secukupnya hingga ayam setengah tenggelam. Masak dengan api kecil-sedang hingga air menyusut dan bumbu meresap ke dalam ayam.",
    "Panaskan alat pemanggang atau teflon bersih. Panggang ayam yang sudah diungkep sambil sesekali diolesi sisa bumbu. Panggang hingga muncul aroma bakaran yang khas. Sajikan hangat."
  ],
  nutrition: {
    calories: 320,
    protein: "35g",
    fat: "12g",
    carbs: "8g",
    fiber: "3g",
    sugar: "2g",
    sodium: "450mg"
  }
};

export default function DetailResepPage() {
  const params = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);

  useEffect(() => {
    setIsLoaded(true);
    // Di aplikasi beneran, lu bakal fetch data resep berdasarkan params.id di sini
  }, [params.id]);

  const toggleIngredient = (index: number) => {
    if (checkedIngredients.includes(index)) {
      setCheckedIngredients(checkedIngredients.filter(i => i !== index));
    } else {
      setCheckedIngredients([...checkedIngredients, index]);
    }
  };

  let ingredientGlobalIndex = 0; // Untuk tracking index checkbox global

  return (
    <div className="w-full pb-24 md:pb-12 relative min-w-0 overflow-x-hidden bg-white">
      
      {/* INJEKSI CSS ANIMASI */}
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
        
        {/* ======================================= */}
        {/* TOP NAVIGATION */}
        {/* ======================================= */}
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

        {/* ======================================= */}
        {/* RECIPE HEADER INFO */}
        {/* ======================================= */}
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

        {/* Deskripsi */}
        <p className={`text-slate-600 font-medium leading-relaxed mb-8 md:mb-12 max-w-3xl ${isLoaded ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
          {recipeDetail.description}
        </p>

        {/* ======================================= */}
        {/* HERO IMAGE & VIDEO PLAY */}
        {/* ======================================= */}
        <div className={`relative w-full h-[250px] md:h-[400px] lg:h-[500px] rounded-[2rem] overflow-hidden mb-10 md:mb-12 group cursor-pointer shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] ${isLoaded ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
          <img src={recipeDetail.image} alt={recipeDetail.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 group-hover:scale-110 transition-transform shadow-lg">
              <IconPlay className="w-8 h-8 ml-1" />
            </div>
          </div>
        </div>

        {/* ======================================= */}
        {/* META STATS ROW */}
        {/* ======================================= */}
        <div className={`flex flex-wrap items-center gap-8 md:gap-16 border-y border-slate-100 py-6 mb-12 ${isLoaded ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Persiapan</p>
            <p className="text-lg font-black text-slate-900">{recipeDetail.prepTime}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Masak</p>
            <p className="text-lg font-black text-slate-900">{recipeDetail.cookTime}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Porsi</p>
            <p className="text-lg font-black text-slate-900">{recipeDetail.servings}</p>
          </div>
        </div>

        {/* ======================================= */}
        {/* MAIN CONTENT: INGREDIENTS & INSTRUCTIONS */}
        {/* ======================================= */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 ${isLoaded ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
          
          {/* KIRI: INGREDIENTS & NUTRITION */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Ingredients */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-8 font-serif">Bahan-bahan</h2>
              
              {recipeDetail.ingredients.map((section, idx) => (
                <div key={idx} className="mb-8 last:mb-0">
                  <h4 className="text-sm font-black text-slate-900 mb-4 bg-slate-50 inline-block px-3 py-1 rounded-md">{section.section}</h4>
                  <div className="space-y-4">
                    {section.items.map((item, itemIdx) => {
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
                            {item}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Nutrition Facts Table */}
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
              <h3 className="text-lg font-black text-slate-900 mb-6 font-serif">Nutrition Facts</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-sm font-black text-slate-800">Calories</span>
                  <span className="text-sm font-black text-[#1EAB57]">{recipeDetail.nutrition.calories}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                  <span className="text-sm font-medium text-slate-600">Total Protein</span>
                  <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.protein}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                  <span className="text-sm font-medium text-slate-600">Total Fat</span>
                  <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.fat}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                  <span className="text-sm font-medium text-slate-600">Total Carbohydrate</span>
                  <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.carbs}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                  <span className="text-sm font-medium text-slate-600 pl-4">Dietary Fiber</span>
                  <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.fiber}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                  <span className="text-sm font-medium text-slate-600 pl-4">Sugars</span>
                  <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.sugar}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-medium text-slate-600">Sodium</span>
                  <span className="text-sm font-bold text-slate-900">{recipeDetail.nutrition.sodium}</span>
                </div>
              </div>
            </div>

          </div>

          {/* KANAN: INSTRUCTIONS */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-black text-slate-900 mb-8 font-serif">Cara Memasak</h2>
            
            <div className="space-y-8 md:space-y-10">
              {recipeDetail.instructions.map((step, index) => (
                <div key={index} className="flex gap-4 md:gap-6 group">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-50 text-[#1EAB57] flex items-center justify-center font-black text-sm md:text-base shrink-0 group-hover:bg-[#1EAB57] group-hover:text-white transition-colors shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] border border-emerald-100">
                    {index + 1}
                  </div>
                  <p className="text-base md:text-lg font-medium text-slate-700 leading-relaxed pt-1 md:pt-1.5">
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