// Path: src/app/(dashboard)/resep/page.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";
import { dummyRecipes } from "@/data/dummyRecipes";

// ==========================================
// KATEGORI RECIPES
// ==========================================
const categories = [
  { name: "Semua", icon: "🍽️" }, { name: "Sarapan", icon: "🍳" }, { name: "Makan Siang", icon: "🍱" },
  { name: "Makan Malam", icon: "🥗" }, { name: "Cemilan", icon: "🥪" }, { name: "Minuman", icon: "🍹" },
  { name: "Vegan", icon: "🥬" }, { name: "Keto", icon: "🥩" }, { name: "Low Carbs", icon: "🥑" }
];

function ResepPageContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // STATE TAB DENGAN LOCAL STORAGE MEMORY (Anti Reset)
  const [activeMainTab, setActiveMainTabState] = useState<string>("Eksplor");

  // Fungsi sinkronisasi Tab & URL
  const setActiveMainTab = (tab: string) => {
    setActiveMainTabState(tab);
    localStorage.setItem("gizify_last_resep_tab", tab); // Simpan ingatan
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab === 'Eksplor' ? 'eksplor' : 'resep-kamu');
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  // STATE: Tabs & Filters
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeDayIndex, setActiveDayIndex] = useState(0); 
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("Paling Populer");
  const filterRef = useRef<HTMLDivElement>(null);
  
  // REF & STATE: Drag to Scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (!scrollContainerRef.current) return;
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };
  const handleMouseLeave = () => { setIsDragging(false); };
  const handleMouseUp = () => { setIsDragging(false); };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [savedPlanData, setSavedPlanData] = useState<any>(null);

  useEffect(() => {
    // PEMULIHAN INGATAN TAB
    const urlTab = searchParams.get('tab');
    const storedTab = localStorage.getItem("gizify_last_resep_tab");
    
    if (urlTab === 'eksplor') {
      setActiveMainTabState('Eksplor');
    } else if (urlTab === 'resep-kamu') {
      setActiveMainTabState('Resep Kamu');
    } else if (storedTab) {
      // Jika dari sidebar (URL kosong), panggil memori terakhir
      setActiveMainTabState(storedTab);
    } else {
      setActiveMainTabState('Eksplor'); // Default kalau belum pernah buka
    }

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    const saved = localStorage.getItem("gizify_saved_plan");
    if (saved) {
      setSavedPlanData(JSON.parse(saved));
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchParams]);

  const fallbackImg = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400&auto=format&fit=crop";
  const getImageUrl = (title: string) => `https://image.pollinations.ai/prompt/delicious%20food%20plating%20${encodeURIComponent(title)}?width=400&height=300&nologo=true`;

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (savedRecipes.includes(id)) {
      setSavedRecipes(savedRecipes.filter(recipeId => recipeId !== id));
    } else {
      setSavedRecipes([...savedRecipes, id]);
    }
  };

  let filteredPopular = dummyRecipes.filter(recipe => {
    const matchCategory = activeCategory === "Semua" || recipe.category === activeCategory;
    const matchSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (recipe.author && recipe.author.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  if (activeSort === "Rating Tertinggi") {
    filteredPopular.sort((a, b) => b.rating - a.rating);
  } else if (activeSort === "Kalori Terendah") {
    filteredPopular.sort((a, b) => a.calories - b.calories);
  } else if (activeSort === "Waktu Masak Tercepat") {
    filteredPopular.sort((a, b) => {
      const getMins = (str: string) => parseInt(str.replace(/[^0-9]/g, "")) || 999; 
      return getMins(a.prepTime) - getMins(b.prepTime);
    });
  } else {
    filteredPopular.sort((a, b) => b.reviews - a.reviews);
  }

  const isNoResults = filteredPopular.length === 0;
  const frequentlyViewed = [...dummyRecipes].sort((a, b) => b.reviews - a.reviews).slice(0, 4);

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 lg:pr-10 pb-32 md:pb-16 relative min-w-0 overflow-x-hidden bg-[#F8FAFC]">
      
      {/* DECORATIVE BACKGROUND BLURS */}
      <div className={`fixed top-0 left-1/4 w-[30rem] h-[30rem] bg-[#1EAB57]/5 rounded-full blur-[100px] pointer-events-none z-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`fixed bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-400/5 rounded-full blur-[120px] pointer-events-none z-0 transition-opacity duration-1000 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`fixed top-1/2 left-0 w-[20rem] h-[20rem] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none z-0 transition-opacity duration-1000 delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(30px); animation: fadeUpAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-in { opacity: 0; animation: fadeInAnim 0.8s ease-out forwards; }
          .animate-fade-in-down { opacity: 0; transform: translateY(-10px); animation: fadeInDownAnim 0.3s ease-out forwards; }
          .animate-scale-in { opacity: 0; transform: scale(0.95); animation: scaleInAnim 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-slide-right { opacity: 0; transform: translateX(-30px); animation: slideRightAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-slide-left { opacity: 0; transform: translateX(30px); animation: slideLeftAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInAnim { to { opacity: 1; } }
          @keyframes fadeInDownAnim { to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleInAnim { to { opacity: 1; transform: scale(1); } }
          @keyframes slideRightAnim { to { opacity: 1; transform: translateX(0); } }
          @keyframes slideLeftAnim { to { opacity: 1; transform: translateX(0); } }
          
          .delay-100 { animation-delay: 0.1s; } 
          .delay-200 { animation-delay: 0.2s; } 
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-500 { animation-delay: 0.5s; }
          .delay-600 { animation-delay: 0.6s; }
          
          .no-scrollbar::-webkit-scrollbar { display: none; } 
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          .animate-shimmer { animation: shimmer 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
          
          .glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.4); }
          .card-hover { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          .card-hover:hover { transform: translateY(-8px); box-shadow: 0 30px 60px -15px rgba(0,0,0,0.08); }
          
          .custom-grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        `
      }} />

      <div className="w-full mt-4 lg:mt-6 relative z-10">
       
        {/* PREMIUM HEADER & TABS SWITCHER */}
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-panel p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgb(0,0,0,0.03)] mb-10 ${isLoaded ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center shadow-inner overflow-hidden border border-slate-200/60 shrink-0 group-hover:scale-105 transition-transform duration-500">
                <img src="/image/icon-plan-resep.jpg" alt="Meal Plan" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                <IconSparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight leading-none mb-2">Pusat Resep & Meal Plan</h1>
              <p className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                Kelola asupan kalori & menu diet harian
              </p>
            </div>
          </div>

          <div className="bg-slate-100/80 p-1.5 rounded-2xl inline-flex items-center w-full lg:w-auto shadow-[inset_0_2px_5px_rgb(0,0,0,0.03)] border border-slate-200/60 shrink-0 relative overflow-hidden">
            <div className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-[14px] shadow-[0_4px_12px_rgb(0,0,0,0.05)] border border-white transition-all duration-500 ease-out z-0 ${activeMainTab === "Resep Kamu" ? 'translate-x-full' : 'translate-x-0'}`}></div>
            
            <button 
              onClick={() => setActiveMainTab("Eksplor")}
              className={`flex-1 lg:flex-none px-6 md:px-10 py-3.5 rounded-[14px] text-[11px] md:text-xs font-black uppercase tracking-widest transition-all duration-400 cursor-pointer relative z-10 outline-none ${
                activeMainTab === "Eksplor" ? 'text-[#1EAB57]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Eksplor Global
            </button>
            <button 
              onClick={() => setActiveMainTab("Resep Kamu")}
              className={`flex-1 lg:flex-none px-6 md:px-10 py-3.5 rounded-[14px] text-[11px] md:text-xs font-black uppercase tracking-widest transition-all duration-400 cursor-pointer relative z-10 outline-none ${
                activeMainTab === "Resep Kamu" ? 'text-[#1EAB57]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Resep Kamu
            </button>
          </div>
        </div>

        {/* KONTEN 1: EKSPLOR GLOBAL */}
        {activeMainTab === "Eksplor" && (
          <div className="flex flex-col gap-6 md:gap-8">
            
            <div className={`relative flex items-center w-full bg-white/80 backdrop-blur-xl hover:bg-white transition-colors border border-slate-200/60 rounded-[2rem] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-[60] ${isLoaded ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
              <div className="pl-4 pr-2 text-slate-400 shrink-0">
                <IconSearch className="w-5 h-5" />
              </div>
              
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent py-3 md:py-4 text-sm font-black text-[#0F172A] placeholder:text-slate-400 outline-none w-full"
                placeholder="Cari Nasi Goreng Diet, Salad Ayam..."
              />
              
              <div className="relative shrink-0" ref={filterRef}>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)} 
                  className={`flex items-center gap-2 px-5 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest outline-none transition-all duration-300 cursor-pointer ${isFilterOpen ? 'bg-slate-900 text-white shadow-[0_8px_15px_rgba(0,0,0,0.2)]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  <IconFilter className="w-4 h-4" />
                  <span className="hidden sm:block">Filter</span>
                </button>
                
                {isFilterOpen && (
                  <div className="absolute top-[120%] right-0 w-[240px] bg-white/95 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[1.5rem] p-2 z-[100] animate-fade-in-down origin-top-right ring-1 ring-slate-900/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3 border-b border-slate-100/50 mb-2">Urutkan Berdasarkan</p>
                    {["Paling Populer", "Rating Tertinggi", "Waktu Masak Tercepat", "Kalori Terendah"].map((opt) => (
                      <div 
                        key={opt}
                        onClick={() => { setActiveSort(opt); setIsFilterOpen(false); }}
                        className={`px-4 py-3 rounded-xl text-xs font-black cursor-pointer transition-colors flex items-center justify-between group ${activeSort === opt ? 'bg-emerald-50 text-[#1EAB57]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        {opt}
                        {activeSort === opt && <IconCheck className="w-4 h-4 text-[#1EAB57]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div 
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-1 py-4 ${isLoaded ? 'animate-slide-left delay-300' : 'opacity-0'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} scroll-smooth`}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="flex items-center gap-2.5 w-max">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer outline-none border ${
                      activeCategory === cat.name 
                      ? 'bg-[#1EAB57] text-white border-[#1EAB57] shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 shadow-sm'
                    }`}
                  >
                    <span className="text-sm">{cat.icon}</span>{cat.name}
                  </button>
                ))}
              </div>
            </div>

            {isNoResults ? (
              <div className="py-24 flex flex-col items-center justify-center text-center w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-sm animate-scale-in">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-100/50 animate-pulse"></div>
                  <IconSearch className="w-10 h-10 text-slate-300 relative z-10" />
                </div>
                <h3 className="text-xl font-black text-[#0F172A] mb-2 tracking-tight">Resep Tidak Ditemukan</h3>
                <p className="text-sm font-medium text-slate-500 max-w-sm mb-8 leading-relaxed">GiziBot belum menemukan resep yang cocok.</p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button 
                    onClick={() => {setSearchQuery(""); setActiveCategory("Semua"); setActiveSort("Paling Populer");}} 
                    className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md outline-none active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <IconRefresh className="w-4 h-4" /> Reset Pencarian
                  </button>
                </div>
              </div>
            ) : (
              <>
                {filteredPopular.length > 0 && (
                  <div className={`mb-8 ${isLoaded ? 'animate-fade-up delay-400' : 'opacity-0'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 px-1 gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center flex-wrap gap-2">
                          {searchQuery ? "Hasil Pencarian" : "Rekomendasi Menu"}
                          {activeSort !== "Paling Populer" && <span className="text-xs font-bold text-[#1EAB57] bg-emerald-50 px-2.5 py-1 rounded-md align-middle">{activeSort}</span>}
                        </h2>
                        <p className="text-[10px] md:text-[11px] font-medium text-slate-500 mt-1.5 flex items-center gap-1.5">
                          <IconInfo className="w-3.5 h-3.5 text-slate-400" />
                          *Estimasi harga pada resep berdasarkan total harga rata-rata bahan di lokasi terkait.
                        </p>
                      </div>
                    </div>
                    
                    <div className="custom-grid-auto">
                      {filteredPopular.map((recipe, index) => {
                        const isSaved = savedRecipes.includes(recipe.id);
                        return (
                          <Link href={`/resep/${recipe.id}`} key={recipe.id} style={{animationDelay: `${400 + (index * 100)}ms`}} className={`bg-white rounded-[2rem] p-2.5 border border-slate-100/60 shadow-[0_4px_15px_rgba(0,0,0,0.03)] card-hover group flex flex-col h-full relative overflow-hidden ${isLoaded ? 'animate-fade-up opacity-0' : 'opacity-0'}`}>
                            <button 
                              onClick={(e) => toggleBookmark(e, recipe.id)} 
                              className={`absolute top-5 right-5 w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center outline-none shadow-sm z-10 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 ${isSaved ? 'bg-[#1EAB57] text-white' : 'bg-white/90 text-slate-400 hover:text-[#1EAB57]'}`}
                            >
                              <IconBookmark filled={isSaved} className="w-4 h-4" />
                            </button>
                            
                            <div className="w-full h-44 rounded-[1.5rem] overflow-hidden bg-slate-100 mb-3 relative shrink-0">
                              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                              
                              <div className="absolute top-3 left-3 flex gap-2">
                                <span className="bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm flex items-center gap-1.5">
                                  <IconClock className="w-3 h-3 text-[#1EAB57]" /> {recipe.category}
                                </span>
                              </div>
                              
                              <div className="absolute bottom-3 left-3 flex gap-2">
                                <span className="bg-[#1EAB57]/95 backdrop-blur-md text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm flex items-center gap-1">
                                  <IconFlame className="w-3 h-3" /> {recipe.calories} Kkal
                                </span>
                              </div>
                            </div>
                            
                            <div className="px-3 pb-2 pt-1 flex flex-col flex-1">
                              <h3 className="text-[16px] font-black text-[#0F172A] line-clamp-2 leading-snug mb-3 group-hover:text-[#1EAB57] transition-colors pr-1">{recipe.title}</h3>
                              
                              <div className="mt-auto">
                                {(recipe.totalBudget || recipe.location) && (
                                  <div className="flex flex-wrap items-center gap-2 mb-3">
                                    {recipe.totalBudget && (
                                      <span className="bg-emerald-50/80 text-emerald-700 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100/50 flex items-center gap-1.5">
                                        <IconWallet className="w-3 h-3 text-emerald-500" /> {recipe.totalBudget}
                                      </span>
                                    )}
                                    {recipe.location && (
                                      <span className="bg-slate-50 text-slate-500 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-100 flex items-center gap-1.5">
                                        <IconMapPin className="w-3 h-3 text-slate-400" /> {recipe.location.split(",")[0]}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 overflow-hidden shrink-0">
                                      {recipe.author === "Gizify" ? <IconBot className="w-3.5 h-3.5" /> : <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex flex-col">
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Dibuat oleh</p>
                                      <p className="text-[10px] font-black text-slate-700 truncate max-w-[100px] leading-none">{recipe.author}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100/50 shrink-0">
                                    <IconStar className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] font-black text-slate-800">{recipe.rating}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {frequentlyViewed.length > 0 && !searchQuery && activeCategory === "Semua" && activeSort === "Paling Populer" && (
                  <div className={`mb-8 ${isLoaded ? 'animate-fade-up delay-400' : 'opacity-0'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 px-1 gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Resep Sering Dilihat</h2>
                      </div>
                    </div>
                    
                    <div className="custom-grid-auto">
                      {frequentlyViewed.map((recipe, index) => {
                        const isSaved = savedRecipes.includes(recipe.id);
                        return (
                          <Link href={`/resep/${recipe.id}`} key={`viewed-${recipe.id}`} style={{animationDelay: `${400 + (index * 100)}ms`}} className={`bg-white rounded-[2rem] p-2.5 border border-slate-100/60 shadow-[0_4px_15px_rgba(0,0,0,0.03)] card-hover group flex flex-col h-full relative overflow-hidden ${isLoaded ? 'animate-fade-up opacity-0' : 'opacity-0'}`}>
                            <button 
                              onClick={(e) => toggleBookmark(e, recipe.id)} 
                              className={`absolute top-5 right-5 w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm z-10 transition-all duration-300 outline-none cursor-pointer hover:scale-110 active:scale-95 ${isSaved ? 'bg-[#1EAB57] text-white' : 'bg-white/90 text-slate-400 hover:text-[#1EAB57]'}`}
                            >
                              <IconBookmark filled={isSaved} className="w-4 h-4" />
                            </button>
                            
                            <div className="w-full h-44 rounded-[1.5rem] overflow-hidden bg-slate-100 mb-3 relative shrink-0">
                              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                              
                              <div className="absolute top-3 left-3 flex gap-2">
                                <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm flex items-center gap-1.5">
                                  <IconClock className="w-3 h-3 text-[#1EAB57]" /> {recipe.category}
                                </span>
                              </div>
                              <div className="absolute bottom-3 left-3 flex gap-2">
                                <span className="bg-[#1EAB57]/95 backdrop-blur-md text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm flex items-center gap-1">
                                  <IconFlame className="w-3 h-3" /> {recipe.calories} Kkal
                                </span>
                              </div>
                            </div>
                            
                            <div className="px-3 pb-2 pt-1 flex flex-col flex-1">
                              <h3 className="text-[16px] font-black text-[#0F172A] line-clamp-2 leading-snug mb-3 group-hover:text-[#1EAB57] transition-colors pr-1">{recipe.title}</h3>
                              
                              <div className="mt-auto">
                                {(recipe.totalBudget || recipe.location) && (
                                  <div className="flex flex-wrap items-center gap-2 mb-3">
                                    {recipe.totalBudget && (
                                      <span className="bg-emerald-50/80 text-emerald-700 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100/50 flex items-center gap-1.5">
                                        <IconWallet className="w-3 h-3 text-emerald-500" /> {recipe.totalBudget}
                                      </span>
                                    )}
                                    {recipe.location && (
                                      <span className="bg-slate-50 text-slate-500 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-100 flex items-center gap-1.5">
                                        <IconMapPin className="w-3 h-3 text-slate-400" /> {recipe.location.split(",")[0]}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 overflow-hidden shrink-0">
                                      {recipe.author === "Gizify" ? <IconBot className="w-3.5 h-3.5" /> : <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex flex-col">
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Dibuat oleh</p>
                                      <p className="text-[10px] font-black text-slate-700 truncate max-w-[100px] leading-none">{recipe.author}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100/50 shrink-0">
                                    <IconStar className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] font-black text-slate-800">{recipe.rating}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* KONTEN 2: RESEP KAMU (MEAL PLAN & BUDGET) */}
        {activeMainTab === "Resep Kamu" && (
          <div className="flex flex-col gap-8 md:gap-10">
            
            <div className={`bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_20px_50px_-15px_rgb(0,0,0,0.05)] relative overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between gap-10 ${isLoaded ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
              
              <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#1EAB57]/10 to-transparent rounded-full blur-[80px] pointer-events-none transition-colors duration-700 -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-slate-50 rounded-full blur-[40px] pointer-events-none"></div>

              <div className="relative z-10 flex-1 w-full lg:max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100/50 mb-5 shadow-sm cursor-default">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1EAB57] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1EAB57]"></span>
                  </span>
                  <span className="text-[10px] font-black text-[#1EAB57] uppercase tracking-widest">Plan Sedang Aktif</span>
                </div>
                
                <h2 className="text-4xl md:text-[3rem] font-black text-[#0F172A] tracking-tight leading-[1.1] mb-4">Meal Plan Keluarga</h2>
                <p className="text-sm md:text-base font-medium text-slate-500 mb-10 max-w-xl leading-relaxed">Fokus diet defisit kalori tinggi protein. Rencana menu di-generate cerdas oleh algoritma AI GiziBot sesuai budget Anda.</p>
                
                <div className="space-y-3 mb-10 w-full max-w-md cursor-default">
                  <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Progres Diet ({savedPlanData ? savedPlanData.days : 7} Hari)</span>
                    <span className="text-[#1EAB57] text-sm">Target Defisit</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#24C667] to-[#1EAB57] rounded-full w-[30%] relative shadow-[0_0_15px_rgba(30,171,87,0.4)] transition-all duration-1000">
                       <div className="absolute inset-0 bg-white/20 w-full animate-shimmer"></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link href="/meal-plan" className="bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_10px_25px_rgb(15,23,42,0.2)] hover:-translate-y-0.5 outline-none active:scale-95 transition-all flex items-center gap-2 cursor-pointer group">
                    <IconPlay className="w-4 h-4 text-[#1EAB57] group-hover:scale-110 transition-transform" />
                    Buat Plan Baru
                  </Link>
                </div>
              </div>

              <div className="relative z-10 bg-slate-50/80 rounded-[2rem] p-8 border border-slate-100 shadow-[inset_0_2px_4px_rgb(0,0,0,0.02)] w-full xl:min-w-[340px] xl:w-auto shrink-0 hover:bg-emerald-50/30 hover:border-emerald-100/50 transition-colors duration-500 cursor-default">
                <div className="flex items-center justify-between mb-10">
                  <div className="w-14 h-14 rounded-[1.25rem] bg-white flex items-center justify-center text-[#1EAB57] shadow-sm border border-slate-100">
                     <IconWallet className="w-6 h-6" />
                  </div>
                  <span className="bg-white text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black shadow-sm uppercase tracking-widest border border-slate-100 flex items-center gap-1.5">
                    <IconCalendar className="w-3.5 h-3.5" /> {savedPlanData ? `${savedPlanData.days} Hari` : "Belum Ada"}
                  </span>
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Budget Target (Per Hari)</p>
                <div className="flex items-end gap-1.5 mb-10">
                  <span className="text-[3rem] md:text-5xl font-black text-[#0F172A] leading-none tracking-tighter">Rp {savedPlanData ? savedPlanData.budget.split('.')[0] : "0"}<span className="text-2xl text-slate-400 font-bold tracking-normal">.{savedPlanData ? savedPlanData.budget.split('.')[1] || '000' : '000'}</span></span>
                </div>
                <div className="pt-6 border-t border-slate-200 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Plan</p>
                    <p className="text-sm font-black text-[#1EAB57]">
                      {savedPlanData ? (savedPlanData.startDate ? `Aktif (${new Date(savedPlanData.startDate).toLocaleDateString('id-ID')})` : "Aktif") : "Kosong"}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target</p>
                    <p className="text-sm font-black text-slate-800">{savedPlanData ? `${savedPlanData.people} Porsi` : "-"}</p>
                  </div>
                </div>
              </div>

            </div>

            <div className={`bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_15px_40px_-10px_rgb(0,0,0,0.04)] ${isLoaded ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-1">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight mb-1.5">Rencana Mingguan</h3>
                  <p className="text-xs font-bold text-slate-500">Pilih hari untuk melihat jadwal masak detail.</p>
                </div>
              </div>
              
              <div className="overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                <div className="flex items-center pb-4 transition-all duration-500 px-1 w-max justify-start gap-2 md:gap-3">
                  {savedPlanData && savedPlanData.plan && savedPlanData.plan.map((dayObj: any, index: number) => {
                    const isActive = activeDayIndex === index;
                    
                    return (
                      <button 
                        key={index} 
                        onClick={() => setActiveDayIndex(index)}
                        className={`group flex flex-col items-center justify-center w-[4.5rem] md:w-[5.5rem] py-4 rounded-[1.5rem] outline-none transition-all cursor-pointer relative overflow-hidden animate-in zoom-in duration-300 shrink-0 ${
                          isActive 
                          ? 'bg-[#1EAB57] text-white shadow-[0_15px_30px_-5px_rgba(30,171,87,0.4)] border border-transparent scale-110' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-[#1EAB57]/50 hover:bg-emerald-50/30 shadow-sm hover:-translate-y-1'
                        }`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-widest mb-1.5 transition-colors ${isActive ? 'text-emerald-100' : 'text-slate-400 group-hover:text-emerald-600'}`}>
                          Hari
                        </span>
                        <span className={`text-2xl font-black transition-colors ${isActive ? 'text-white' : 'text-[#0F172A]'}`}>
                          {index + 1}
                        </span>
                        
                        <div className={`mt-2 flex gap-1.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#1EAB57]'}`}></div>
                           <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#1EAB57]'}`}></div>
                           <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#1EAB57]'}`}></div>
                        </div>
                      </button>
                    )
                  })}
                  {!savedPlanData && (
                     <div className="text-sm font-bold text-slate-400 py-4 cursor-default">Belum ada plan yang di-generate. Silahkan buat dari Meal Plan Wizard.</div>
                  )}
                </div>
              </div>
            </div>

            {savedPlanData && savedPlanData.plan && savedPlanData.plan[activeDayIndex] && (
            <div className={`bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_15px_40px_-10px_rgb(0,0,0,0.03)] ${isLoaded ? 'animate-fade-up delay-400' : 'opacity-0'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">Jadwal Masak Hari {activeDayIndex + 1}</h3>
                  <div className="flex items-center gap-3 mt-2 cursor-default">
                    <span className="text-[11px] font-black text-[#1EAB57] uppercase tracking-widest flex items-center gap-1.5">
                       <IconFlame className="w-3.5 h-3.5"/> Total: {savedPlanData.plan[activeDayIndex].meals.reduce((sum: number, meal: any) => sum + parseInt(meal.kal), 0)} Kkal
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative pl-2 md:pl-0">
                <div className="hidden md:block absolute left-[95px] top-8 bottom-8 w-[2px] bg-slate-100 rounded-full"></div>

                {savedPlanData.plan[activeDayIndex].meals.map((meal: any, idx: number) => (
                <div key={idx} className={`flex flex-col md:flex-row gap-5 md:gap-10 mb-10 relative group ${isLoaded ? 'animate-slide-left' : 'opacity-0'}`} style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }}>
                  <div className="md:w-[80px] shrink-0 pt-3 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start relative z-10 cursor-default">
                    <div className="flex flex-col md:items-end">
                      <span className={`text-xl font-black tracking-tight ${idx === 1 ? 'text-[#1EAB57]' : 'text-slate-900'}`}>{meal.time}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${idx === 1 ? 'text-[#1EAB57]' : 'text-slate-400'}`}>{meal.type}</span>
                    </div>
                    <div className={`hidden md:flex absolute -right-[23px] top-4 w-4 h-4 rounded-full ${idx === 1 ? 'bg-[#1EAB57] ring-2 ring-emerald-200 animate-pulse' : 'bg-[#1EAB57]'} border-[3px] border-white shadow-sm ring-1 ring-slate-100`}></div>
                  </div>

                  <Link href={`/resep/${meal.id}`} className={`flex-1 block ${idx === 1 ? 'bg-emerald-50/50 border-2 border-[#1EAB57]/30 shadow-md hover:shadow-xl hover:-translate-y-1' : 'bg-white border border-slate-100 hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1'} rounded-[2rem] p-4 transition-all duration-300 flex flex-col sm:flex-row gap-5 cursor-pointer relative outline-none`}>
                    {idx === 1 && (
                      <span className="absolute -top-3 right-6 bg-[#1EAB57] text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md animate-bounce flex items-center gap-1.5 z-20">
                        <IconActivity className="w-3 h-3" /> Waktunya Masak!
                      </span>
                    )}
                    <div className="w-full sm:w-40 h-36 rounded-[1.5rem] overflow-hidden relative shrink-0 bg-slate-200">
                      <img 
                        src={getImageUrl(meal.title)} 
                        onError={(e) => { e.currentTarget.src = fallbackImg; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className={`absolute top-2.5 left-2.5 ${idx === 1 ? 'bg-[#1EAB57] text-white' : 'bg-white/95 text-slate-800'} backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm`}>
                        <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <IconClock className={`w-3 h-3 ${idx === 1 ? 'text-emerald-200' : 'text-amber-500'}`} /> {meal.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center pb-1 pt-2 sm:pt-0">
                      <h4 className="text-lg font-black text-[#0F172A] mb-3 group-hover:text-[#1EAB57] transition-colors line-clamp-2 leading-snug">{meal.title}</h4>
                      
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className={`bg-white border border-slate-100 text-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${idx === 1 ? 'shadow-sm' : ''}`}><IconFlame className="w-3.5 h-3.5"/> {meal.kal} Kkal</span>
                        <span className={`bg-white border border-slate-100 text-blue-500 px-3 py-1.5 rounded-lg text-[10px] font-bold ${idx === 1 ? 'shadow-sm' : ''}`}>Pro: {meal.pro}g</span>
                        <span className={`bg-white border border-slate-100 text-amber-500 px-3 py-1.5 rounded-lg text-[10px] font-bold ${idx === 1 ? 'shadow-sm' : ''}`}>Car: {meal.car}g</span>
                      </div>
                      
                      <div className={`inline-flex items-center justify-between px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors w-full md:w-auto mt-auto ${idx === 1 ? 'bg-[#1EAB57] group-hover:bg-[#168E46] text-white shadow-sm' : 'bg-slate-50 group-hover:bg-[#1EAB57] text-slate-600 group-hover:text-white border border-slate-100'}`}>
                        <span className="flex items-center gap-2">{idx === 1 ? <IconPlay className="w-3.5 h-3.5" /> : null} {idx === 1 ? "Mulai Panduan Masak" : "Lihat Detail Resep"}</span>
                        <IconChevronRight className="w-4 h-4"/>
                      </div>
                    </div>
                  </Link>
                </div>
                ))}
              </div>
            </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function ResepPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Memuat...</div>}>
      <ResepPageContent />
    </Suspense>
  );
}

// ==========================================
// KUMPULAN SVG ICONS KUSTOM
// ==========================================
const IconSearch = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconFilter = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>;
const IconStar = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>;
const IconBookmark = ({ className, filled }: { className: string, filled?: boolean }) => <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>;
const IconBot = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconSparkles = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconWallet = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const IconActivity = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const IconFlame = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>;
const IconClock = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconCutlery = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
const IconChevronLeft = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRight = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconPlay = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"></path></svg>;
const IconCheck = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconMapPin = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconRefresh = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const IconCalendar = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconInfo = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;