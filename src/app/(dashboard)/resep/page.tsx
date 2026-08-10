"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ==========================================
// MOCK DATA: GLOBAL RECIPES & MEAL PLAN
// ==========================================
const mockPopularRecipes = [
  { id: 1, title: "Ayam Bakar Taliwang Diet Rendah Kalori", category: "Makan Siang", calories: 320, rating: 4.8, reviews: 124, author: "Chef GiziBot", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop" },
  { id: 2, title: "Smoothie Bowl Naga Merah & Chia Seed", category: "Sarapan", calories: 210, rating: 4.9, reviews: 89, author: "Zolla Perdana", image: "https://images.unsplash.com/photo-1628543118940-52e690a2c0bc?q=80&w=600&auto=format&fit=crop" },
  { id: 3, title: "Pepes Ikan Nila Kemangi Pedas", category: "Makan Malam", calories: 250, rating: 4.7, reviews: 56, author: "Chef GiziBot", image: "https://images.unsplash.com/photo-1544025162-8366fd4d3ceb?q=80&w=600&auto=format&fit=crop" },
  { id: 4, title: "Gado-Gado Siram Kacang Mede", category: "Makan Siang", calories: 410, rating: 4.9, author: "Dina Mariana", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop" },
  { id: 7, title: "Salad Ayam Panggang Caesar Diet", category: "Makan Siang", calories: 280, rating: 4.7, reviews: 102, author: "Ayu Lestari", image: "https://images.unsplash.com/photo-1512852939750-1305098529bf?q=80&w=600&auto=format&fit=crop" },
  { id: 8, title: "Ikan Salmon Panggang Lemon", category: "Makan Malam", calories: 350, rating: 4.9, reviews: 201, author: "Chef GiziBot", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=600&auto=format&fit=crop" },
  { id: 9, title: "Omelet Sayur Brokoli Keju Low Fat", category: "Sarapan", calories: 190, rating: 4.6, reviews: 45, author: "Rika Rahmawati", image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?q=80&w=600&auto=format&fit=crop" },
  { id: 10, title: "Tumis Tempe Buncis Saus Tiram", category: "Makan Malam", calories: 220, rating: 4.5, reviews: 76, author: "Dapur Sehat Ibu", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" },
];

const mockRecentRecipes = [
  { id: 5, title: "Oatmeal Pisang Kayu Manis", category: "Sarapan", calories: 340, rating: 4.6, author: "Chef GiziBot", image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=600&auto=format&fit=crop" },
  { id: 6, title: "Jus Alpukat Tanpa Gula", category: "Minuman", calories: 150, rating: 4.5, author: "Zolla Perdana", image: "https://images.unsplash.com/photo-1628543118940-52e690a2c0bc?q=80&w=600&auto=format&fit=crop" },
  { id: 11, title: "Steak Tahu Tempe Saus Lada Hitam", category: "Makan Malam", calories: 280, rating: 4.8, author: "Vegan Indo", image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=600&auto=format&fit=crop" },
  { id: 12, title: "Puding Chia Berry Segar", category: "Cemilan", calories: 120, rating: 4.7, author: "Dessert Diet", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop" }
];

const categories = [
  { name: "Semua", icon: "🍽️" }, { name: "Sarapan", icon: "🍳" }, { name: "Makan Siang", icon: "🍱" },
  { name: "Makan Malam", icon: "🥗" }, { name: "Cemilan", icon: "🥪" }, { name: "Minuman", icon: "🍹" },
  { name: "Vegan", icon: "🥬" }, { name: "Keto", icon: "🥩" }, { name: "Low Carbs", icon: "🥑" }
];

export default function ResepPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // STATE: Tabs & Filters
  const [activeMainTab, setActiveMainTab] = useState("Resep Kamu");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeDay, setActiveDay] = useState(19);
  
  // STATE: Kalender Expand
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState("Agustus 2026");

  // STATE: User Interactions
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Animasi masuk global
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handler Bookmark (Simpan Resep)
  const toggleBookmark = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (savedRecipes.includes(id)) {
      setSavedRecipes(savedRecipes.filter(recipeId => recipeId !== id));
    } else {
      setSavedRecipes([...savedRecipes, id]);
    }
  };

  // Filter Logic untuk Tab Eksplor
  const filteredPopular = mockPopularRecipes.filter(recipe => {
    const matchCategory = activeCategory === "Semua" || recipe.category === activeCategory;
    const matchSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        recipe.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const filteredRecent = mockRecentRecipes.filter(recipe => {
    const matchCategory = activeCategory === "Semua" || recipe.category === activeCategory;
    const matchSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        recipe.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const isNoResults = filteredPopular.length === 0 && filteredRecent.length === 0;

  // Data Kalender
  const daysOfWeek = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const baseDays = [17, 18, 19, 20, 21, 22, 23];
  const expandedDays = [
    10, 11, 12, 13, 14, 15, 16, 
    17, 18, 19, 20, 21, 22, 23, 
    24, 25, 26, 27, 28, 29, 30, 
    31, 1, 2, 3, 4, 5, 6
  ];
  const currentCalendarDays = isCalendarExpanded ? expandedDays : baseDays;

  // Fungsi Simulasi Generate Plan
  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert("Meal plan baru berhasil dibuat berdasarkan data kalori terbaru!");
    }, 2000);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 lg:pr-10 pb-32 md:pb-16 relative min-w-0 overflow-x-hidden bg-[#F8FAFC]">
      
      {/* DECORATIVE BACKGROUND BLURS */}
      <div className={`fixed top-0 left-1/4 w-[30rem] h-[30rem] bg-[#1EAB57]/5 rounded-full blur-[100px] pointer-events-none z-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`fixed bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-400/5 rounded-full blur-[120px] pointer-events-none z-0 transition-opacity duration-1000 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`fixed top-1/2 left-0 w-[20rem] h-[20rem] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none z-0 transition-opacity duration-1000 delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* CSS ANIMASI KUSTOM */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(30px); animation: fadeUpAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-in { opacity: 0; animation: fadeInAnim 0.8s ease-out forwards; }
          .animate-scale-in { opacity: 0; transform: scale(0.95); animation: scaleInAnim 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-slide-right { opacity: 0; transform: translateX(-30px); animation: slideRightAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-slide-left { opacity: 0; transform: translateX(30px); animation: slideLeftAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInAnim { to { opacity: 1; } }
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
          .card-hover:hover { transform: translateY(-6px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); }
          
          .custom-grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        `
      }} />

      <div className="w-full mt-4 lg:mt-6 relative z-10">
       
        {/* ======================================= */}
        {/* PREMIUM HEADER & TABS SWITCHER */}
        {/* ======================================= */}
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-panel p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgb(0,0,0,0.03)] mb-10 ${isLoaded ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-gradient-to-br from-[#E8F8EE] to-emerald-100/50 text-[#1EAB57] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,1)] border border-emerald-200/50 shrink-0 transform -rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500">
                <IconCutlery className="w-7 h-7 md:w-8 md:h-8" />
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
              className={`flex-1 lg:flex-none px-6 md:px-10 py-3.5 rounded-[14px] text-[11px] md:text-xs font-black uppercase tracking-widest transition-all duration-400 cursor-pointer relative z-10 ${
                activeMainTab === "Eksplor" ? 'text-[#1EAB57]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Eksplor Global
            </button>
            <button 
              onClick={() => setActiveMainTab("Resep Kamu")}
              className={`flex-1 lg:flex-none px-6 md:px-10 py-3.5 rounded-[14px] text-[11px] md:text-xs font-black uppercase tracking-widest transition-all duration-400 cursor-pointer relative z-10 ${
                activeMainTab === "Resep Kamu" ? 'text-[#1EAB57]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Resep Kamu
            </button>
          </div>
        </div>

        {/* ======================================= */}
        {/* KONTEN 1: EKSPLOR GLOBAL */}
        {/* ======================================= */}
        {activeMainTab === "Eksplor" && (
          <div className="flex flex-col gap-6 md:gap-8">
            
            {/* Search Section */}
            <div className={`flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 ${isLoaded ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
              <div className="flex-1 w-full relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <IconSearch className="w-5 h-5 text-slate-400 group-focus-within:text-[#1EAB57] transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 md:py-4.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm font-black text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#1EAB57]/10 border border-transparent focus:border-[#1EAB57]/30 transition-all cursor-text"
                  placeholder="Cari Nasi Goreng Diet, Salad Ayam..."
                />
              </div>
              <button className="w-full sm:w-[4rem] h-[4rem] shrink-0 bg-[#0F172A] text-white rounded-2xl flex items-center justify-center shadow-md hover:shadow-xl hover:bg-slate-800 active:scale-95 transition-all duration-300 cursor-pointer group">
                <IconFilter className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>

            {/* Categories Scrollable */}
            <div className={`overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-4 ${isLoaded ? 'animate-slide-left delay-300' : 'opacity-0'}`}>
              <div className="flex items-center gap-3 w-max">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer border hover:-translate-y-1 ${
                      activeCategory === cat.name 
                      ? 'bg-[#1EAB57] text-white border-[#1EAB57] shadow-[0_10px_20px_rgba(30,171,87,0.3)] scale-[1.02]' 
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 shadow-sm'
                    }`}
                  >
                    <span className="text-sm">{cat.icon}</span>{cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Results */}
            {isNoResults ? (
              <div className="py-24 flex flex-col items-center justify-center text-center w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-sm animate-scale-in">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-100/50 animate-pulse"></div>
                  <IconSearch className="w-10 h-10 text-slate-300 relative z-10" />
                </div>
                <h3 className="text-xl font-black text-[#0F172A] mb-2 tracking-tight">Resep Tidak Ditemukan</h3>
                <p className="text-sm font-medium text-slate-500 max-w-sm mb-8 leading-relaxed">GiziBot belum menemukan resep yang cocok. Coba kurangi filter atau ganti kata kunci pencarian.</p>
                <button 
                  onClick={() => {setSearchQuery(""); setActiveCategory("Semua");}} 
                  className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <IconRefresh className="w-4 h-4" /> Reset Pencarian
                </button>
              </div>
            ) : (
              <>
                {/* Section: Rekomendasi Menu */}
                {filteredPopular.length > 0 && (
                  <div className={`mb-8 ${isLoaded ? 'animate-fade-up delay-400' : 'opacity-0'}`}>
                    <div className="flex items-center justify-between mb-6 px-1">
                      <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Rekomendasi Menu</h2>
                      <button className="text-[11px] font-black text-[#1EAB57] uppercase tracking-widest cursor-pointer hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-1 group">
                        Lihat Semua <IconArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                    
                    <div className="custom-grid-auto">
                      {filteredPopular.map((recipe, index) => {
                        const isSaved = savedRecipes.includes(recipe.id);
                        return (
                          <Link href={`/resep/${recipe.id}`} key={recipe.id} style={{animationDelay: `${400 + (index * 100)}ms`}} className={`bg-white rounded-[2rem] p-3 border border-slate-100 shadow-sm card-hover group block relative overflow-hidden ${isLoaded ? 'animate-fade-up opacity-0' : 'opacity-0'}`}>
                            {/* Bookmark Button Floating */}
                            <button 
                              onClick={(e) => toggleBookmark(e, recipe.id)} 
                              className={`absolute top-6 right-6 w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center shadow-md z-10 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 ${isSaved ? 'bg-[#1EAB57] text-white' : 'bg-white/90 text-slate-400 hover:text-[#1EAB57]'}`}
                            >
                              <IconBookmark filled={isSaved} className="w-4.5 h-4.5" />
                            </button>
                            
                            {/* Image Header */}
                            <div className="w-full h-48 rounded-[1.5rem] overflow-hidden bg-slate-100 mb-4 relative">
                              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                              
                              <div className="absolute bottom-3 left-3 flex gap-2">
                                <span className="bg-[#1EAB57] text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm backdrop-blur-sm">
                                  {recipe.category}
                                </span>
                                <span className="bg-slate-900/80 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm backdrop-blur-sm flex items-center gap-1">
                                  <IconFlame className="w-3 h-3" /> {recipe.calories} Cal
                                </span>
                              </div>
                            </div>
                            
                            {/* Details Body */}
                            <div className="px-3 pb-2 flex flex-col h-full">
                              <h3 className="text-[16px] font-black text-slate-900 line-clamp-2 mb-4 group-hover:text-[#1EAB57] transition-colors leading-snug tracking-tight pr-2">{recipe.title}</h3>
                              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/80">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 overflow-hidden shrink-0">
                                    {recipe.author === "Chef GiziBot" ? <IconBot className="w-4 h-4" /> : <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" />}
                                  </div>
                                  <div className="flex flex-col">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Dibuat oleh</p>
                                    <p className="text-[11px] font-black text-slate-700 truncate max-w-[100px] leading-none">{recipe.author}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100/50 shrink-0">
                                  <IconStar className="w-4 h-4 text-amber-500" />
                                  <span className="text-[11px] font-black text-slate-800">{recipe.rating}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section: Riwayat Dilihat */}
                {filteredRecent.length > 0 && (
                  <div className={`mb-4 ${isLoaded ? 'animate-fade-up delay-500' : 'opacity-0'}`}>
                    <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-6 px-1">Riwayat Dilihat</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredRecent.map((recipe, index) => (
                        <Link href={`/resep/${recipe.id}`} key={recipe.id} style={{animationDelay: `${500 + (index * 100)}ms`}} className={`bg-white rounded-[1.5rem] p-3 border border-slate-100 shadow-[0_10px_20px_-10px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_30px_-10px_rgb(0,0,0,0.08)] hover:border-[#1EAB57]/30 transition-all duration-300 group flex items-center gap-5 cursor-pointer overflow-hidden relative ${isLoaded ? 'animate-fade-up opacity-0' : 'opacity-0'}`}>
                          {/* Image Box */}
                          <div className="w-28 h-28 shrink-0 rounded-[1.25rem] overflow-hidden bg-slate-100 relative">
                            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
                          </div>
                          
                          {/* Info Text */}
                          <div className="flex-1 py-1 pr-2 min-w-0 flex flex-col h-full justify-center">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{recipe.category}</span>
                            </div>
                            <h3 className="text-[14px] font-black text-slate-900 line-clamp-2 mb-3 group-hover:text-[#1EAB57] transition-colors leading-snug pr-2">
                              {recipe.title}
                            </h3>
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-rose-500 font-bold text-[10px]"><IconFlame className="w-3.5 h-3.5"/> {recipe.calories} kcal</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-1 rounded-lg">
                                <IconStar className="w-3 h-3 text-amber-500" />
                                <span className="text-[10px] font-black text-slate-800">{recipe.rating}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* KONTEN 2: RESEP KAMU (MEAL PLAN & BUDGET) */}
        {/* ======================================= */}
        {activeMainTab === "Resep Kamu" && (
          <div className="flex flex-col gap-8 md:gap-10">
            
            {/* CARD BUDGET VIP (Clean White Ultra Premium) */}
            <div className={`bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_20px_50px_-15px_rgb(0,0,0,0.05)] relative overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between gap-10 ${isLoaded ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
              
              <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#1EAB57]/10 to-transparent rounded-full blur-[80px] pointer-events-none transition-colors duration-700 -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-slate-50 rounded-full blur-[40px] pointer-events-none"></div>

              <div className="relative z-10 flex-1 w-full lg:max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100/50 mb-5 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1EAB57] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1EAB57]"></span>
                  </span>
                  <span className="text-[10px] font-black text-[#1EAB57] uppercase tracking-widest">Plan Sedang Aktif</span>
                </div>
                
                <h2 className="text-4xl md:text-[3rem] font-black text-[#0F172A] tracking-tight leading-[1.1] mb-4">Meal Plan Keluarga</h2>
                <p className="text-sm md:text-base font-medium text-slate-500 mb-10 max-w-xl leading-relaxed">Fokus diet defisit kalori tinggi protein. Rencana menu di-generate cerdas oleh algoritma AI GiziBot sesuai budget Anda.</p>
                
                <div className="space-y-3 mb-10 w-full max-w-md">
                  <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Progres Minggu Ini (Hari 4 dari 7)</span>
                    <span className="text-[#1EAB57] text-sm">57%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#24C667] to-[#1EAB57] rounded-full w-[57%] relative shadow-[0_0_15px_rgba(30,171,87,0.4)] transition-all duration-1000">
                       <div className="absolute inset-0 bg-white/20 w-full animate-shimmer"></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button onClick={handleGeneratePlan} disabled={isGenerating} className="bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_10px_25px_rgb(15,23,42,0.2)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 cursor-pointer group disabled:opacity-70 disabled:cursor-not-allowed">
                    {isGenerating ? <IconLoader className="w-4 h-4 animate-spin text-[#1EAB57]" /> : <IconPlay className="w-4 h-4 text-[#1EAB57] group-hover:scale-110 transition-transform" />} 
                    {isGenerating ? "Menyiapkan AI..." : "Mulai Rencana"}
                  </button>
                  <button className="bg-white hover:bg-slate-50 text-slate-600 border-2 border-slate-100 px-8 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 cursor-pointer hover:border-slate-200">
                    <IconEdit className="w-4 h-4" /> Kelola Menu
                  </button>
                </div>
              </div>

              {/* Box Budget & Detail Kanan */}
              <div className="relative z-10 bg-slate-50/80 rounded-[2rem] p-8 border border-slate-100 shadow-[inset_0_2px_4px_rgb(0,0,0,0.02)] w-full xl:min-w-[340px] xl:w-auto shrink-0 hover:bg-emerald-50/30 hover:border-emerald-100/50 transition-colors duration-500">
                <div className="flex items-center justify-between mb-10">
                  <div className="w-14 h-14 rounded-[1.25rem] bg-white flex items-center justify-center text-[#1EAB57] shadow-sm border border-slate-100">
                     <IconWallet className="w-6 h-6" />
                  </div>
                  <span className="bg-white text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black shadow-sm uppercase tracking-widest border border-slate-100 flex items-center gap-1.5">
                    <IconCalendar className="w-3.5 h-3.5" /> Estimasi 7 Hari
                  </span>
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Sisa Budget Belanja</p>
                <div className="flex items-end gap-1.5 mb-10">
                  <span className="text-[3rem] md:text-5xl font-black text-[#0F172A] leading-none tracking-tighter">Rp 215<span className="text-2xl text-slate-400 font-bold tracking-normal">.000</span></span>
                </div>
                <div className="pt-6 border-t border-slate-200 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Budget</p>
                    <p className="text-sm font-black text-slate-800">Rp 500.000</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target</p>
                    <p className="text-sm font-black text-slate-800">4 Porsi</p>
                  </div>
                </div>
              </div>

            </div>

            {/* HORIZONTAL CALENDAR (Clean White Expandable - No Gap Issue) */}
            <div className={`bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_15px_40px_-10px_rgb(0,0,0,0.04)] ${isLoaded ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-1">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight mb-1.5">Agustus 2026</h3>
                  <p className="text-xs font-bold text-slate-500">Pilih hari untuk melihat jadwal masak detail.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 shadow-sm cursor-pointer active:scale-95"
                  >
                    <IconExpand className={`w-4 h-4 text-[#1EAB57] transition-transform duration-500 ${isCalendarExpanded ? 'rotate-180' : ''}`} /> 
                    {isCalendarExpanded ? "Tutup Kalender" : "Lihat 14 Hari"}
                  </button>

                  <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1.5 border border-slate-100 shadow-sm hidden md:flex">
                    <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white text-slate-400 hover:text-slate-900 transition-colors cursor-pointer shadow-sm"><IconChevronLeft className="w-5 h-5" /></button>
                    <div className="w-px h-5 bg-slate-200"></div>
                    <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white text-slate-400 hover:text-slate-900 transition-colors cursor-pointer shadow-sm"><IconChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
              
              {/* List Hari (Dynamic 7 vs 14+ days) - GAPS AND ALIGNMENT FIXED */}
              <div className="overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                <div className={`flex items-center pb-4 transition-all duration-500 px-1 ${
                    isCalendarExpanded 
                    ? "w-max justify-start gap-2 md:gap-3" 
                    : "w-full min-w-max sm:min-w-0 justify-start sm:justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-10"
                  }`}
                >
                  {currentCalendarDays.map((date, index) => {
                    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
                    const dayName = days[index % 7].substring(0,3);
                    const isActive = activeDay === date;
                    const isPassed = date < 19;
                    const hasFullPlan = [17, 18, 19, 20].includes(date);
                    
                    return (
                      <button 
                        key={date} 
                        onClick={() => setActiveDay(date)}
                        className={`group flex flex-col items-center justify-center w-[4.5rem] md:w-[5.5rem] py-4 rounded-[1.5rem] transition-all cursor-pointer relative overflow-hidden animate-in zoom-in duration-300 shrink-0 ${
                          isActive 
                          ? 'bg-[#1EAB57] text-white shadow-[0_15px_30px_-5px_rgba(30,171,87,0.4)] border border-transparent scale-110' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-[#1EAB57]/50 hover:bg-emerald-50/30 shadow-sm hover:-translate-y-1'
                        }`}
                      >
                        {/* Indikator Atas (Lewat vs Mendatang) */}
                        {!isActive && isPassed && <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-slate-300"></div>}
                        {!isActive && !isPassed && <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#1EAB57]"></div>}
                        
                        <span className={`text-[10px] font-black uppercase tracking-widest mb-1.5 transition-colors ${isActive ? 'text-emerald-100' : 'text-slate-400 group-hover:text-emerald-600'}`}>
                          {dayName}
                        </span>
                        <span className={`text-2xl font-black transition-colors ${isActive ? 'text-white' : 'text-[#0F172A]'}`}>
                          {date}
                        </span>
                        
                        {/* Indikator Titik Bawah (Sarapan, Siang, Malam) */}
                        <div className={`mt-2 flex gap-1.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                          {hasFullPlan ? (
                            <>
                              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#1EAB57]'}`}></div>
                              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#1EAB57]'}`}></div>
                              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#1EAB57]'}`}></div>
                            </>
                          ) : (
                            <>
                              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#1EAB57]'}`}></div>
                              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#1EAB57]'}`}></div>
                              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-slate-300/50' : 'bg-slate-200'}`}></div>
                            </>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* TIMELINE JADWAL MASAK HARI INI */}
            <div className={`bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-[0_15px_40px_-10px_rgb(0,0,0,0.03)] ${isLoaded ? 'animate-fade-up delay-400' : 'opacity-0'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">Jadwal Masak</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] font-black text-[#1EAB57] uppercase tracking-widest flex items-center gap-1.5"><IconFlame className="w-3.5 h-3.5"/> Total: 910 Kkal</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{activeDay} Agustus 2026</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 shadow-sm cursor-pointer active:scale-95 hidden sm:block">
                    Edit Jadwal
                  </button>
                  <button className="bg-[#0F172A] hover:bg-slate-800 text-white w-12 h-12 md:w-14 md:h-14 rounded-[1.25rem] flex items-center justify-center transition-all cursor-pointer shadow-[0_10px_20px_rgba(15,23,42,0.2)] hover:-translate-y-1 shrink-0">
                     <IconPlus className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* TIMELINE WRAPPER WITH VERTICAL LINE */}
              <div className="relative pl-2 md:pl-0">
                {/* Garis Vertikal Timeline (Hanya tampil di desktop untuk efek yang pas) */}
                <div className="hidden md:block absolute left-[95px] top-8 bottom-8 w-[2px] bg-slate-100 rounded-full"></div>

                {/* --- ITEM 1: SARAPAN --- */}
                <div className={`flex flex-col md:flex-row gap-5 md:gap-10 mb-10 relative group ${isLoaded ? 'animate-slide-left delay-400' : 'opacity-0'}`}>
                  <div className="md:w-[80px] shrink-0 pt-3 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start relative z-10">
                    <div className="flex flex-col md:items-end">
                      <span className="text-xl font-black text-slate-900 tracking-tight">08:00</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pagi</span>
                    </div>
                    {/* Dot Indikator */}
                    <div className="hidden md:flex absolute -right-[23px] top-4 w-4 h-4 rounded-full bg-[#1EAB57] border-[3px] border-white shadow-sm ring-1 ring-slate-100"></div>
                  </div>

                  <div className="flex-1 bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col sm:flex-row gap-5 cursor-pointer hover:-translate-y-1">
                    <div className="w-full sm:w-40 h-36 rounded-[1.5rem] overflow-hidden relative shrink-0">
                      <img src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5"><IconClock className="w-3 h-3 text-amber-500" /> Sarapan</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center pb-1 pt-2 sm:pt-0">
                      <h4 className="text-lg font-black text-[#0F172A] mb-3 group-hover:text-[#1EAB57] transition-colors line-clamp-2 leading-snug">Oatmeal Pisang Kayu Manis</h4>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="bg-rose-50 text-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1"><IconFlame className="w-3.5 h-3.5"/> 340 Kkal</span>
                        <span className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold">Protein: 12g</span>
                        <span className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold">Karbo: 45g</span>
                      </div>
                      <Link href="/resep/1" className="inline-flex items-center justify-between bg-slate-50 hover:bg-[#1EAB57] text-slate-600 hover:text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-slate-100 w-full md:w-auto mt-auto cursor-pointer">
                        <span>Lihat Detail Resep</span>
                        <IconChevronRight className="w-4 h-4"/>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* --- ITEM 2: MAKAN SIANG (SEKARANG) --- */}
                <div className={`flex flex-col md:flex-row gap-5 md:gap-10 mb-10 relative group ${isLoaded ? 'animate-slide-left delay-500' : 'opacity-0'}`}>
                  <div className="md:w-[80px] shrink-0 pt-3 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start relative z-10">
                    <div className="flex flex-col md:items-end">
                      <span className="text-xl font-black text-[#1EAB57] tracking-tight">12:30</span>
                      <span className="text-[10px] font-bold text-[#1EAB57] uppercase tracking-widest mt-0.5">Siang</span>
                    </div>
                    {/* Dot Indikator Active Pulsing */}
                    <div className="hidden md:flex absolute -right-[23px] top-4 w-4 h-4 rounded-full bg-[#1EAB57] border-[3px] border-white shadow-sm ring-2 ring-emerald-200 animate-pulse"></div>
                  </div>

                  <div className="flex-1 bg-emerald-50/50 border-2 border-[#1EAB57]/30 rounded-[2rem] p-4 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row gap-5 cursor-pointer relative transform hover:-translate-y-1">
                    <span className="absolute -top-3 right-6 bg-[#1EAB57] text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md animate-bounce flex items-center gap-1.5">
                      <IconActivity className="w-3 h-3" /> Waktunya Masak!
                    </span>
                    <div className="w-full sm:w-40 h-36 rounded-[1.5rem] overflow-hidden relative shrink-0">
                      <img src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-2.5 left-2.5 bg-[#1EAB57] backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-white">
                        <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><IconClock className="w-3 h-3 text-emerald-200" /> Makan Siang</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center pb-1 pt-2 sm:pt-0">
                      <h4 className="text-lg font-black text-[#0F172A] mb-3 group-hover:text-[#1EAB57] transition-colors line-clamp-2 leading-snug">Ayam Bakar Taliwang Diet Rendah Kalori</h4>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="bg-white border border-slate-100 text-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm"><IconFlame className="w-3.5 h-3.5"/> 320 Kkal</span>
                        <span className="bg-white border border-slate-100 text-blue-500 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm">Protein: 35g</span>
                        <span className="bg-white border border-slate-100 text-amber-500 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm">Carbs: 8g</span>
                      </div>
                      <Link href="/resep/1" className="inline-flex items-center justify-between bg-[#1EAB57] hover:bg-[#168E46] text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors w-full md:w-auto mt-auto cursor-pointer shadow-sm">
                        <span className="flex items-center gap-2"><IconPlay className="w-3.5 h-3.5" /> Mulai Panduan Masak</span>
                        <IconChevronRight className="w-4 h-4"/>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* --- ITEM 3: MAKAN MALAM --- */}
                <div className={`flex flex-col md:flex-row gap-5 md:gap-10 relative group opacity-60 hover:opacity-100 transition-opacity duration-300 ${isLoaded ? 'animate-slide-left delay-600' : 'opacity-0'}`}>
                  <div className="md:w-[80px] shrink-0 pt-3 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start relative z-10">
                    <div className="flex flex-col md:items-end">
                      <span className="text-xl font-black text-slate-400 tracking-tight">19:00</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Malam</span>
                    </div>
                    {/* Dot Indikator Belum Terlewat */}
                    <div className="hidden md:flex absolute -right-[23px] top-4 w-4 h-4 rounded-full bg-slate-200 border-[3px] border-white shadow-sm ring-1 ring-slate-100"></div>
                  </div>

                  <div className="flex-1 bg-white border border-slate-200 border-dashed rounded-[2rem] p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-5 cursor-pointer">
                    <div className="w-full sm:w-40 h-36 rounded-[1.5rem] overflow-hidden relative shrink-0 grayscale-[40%] group-hover:grayscale-0 transition-all duration-500">
                      <img src="https://images.unsplash.com/photo-1544025162-8366fd4d3ceb?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-2.5 left-2.5 bg-slate-800/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm text-white">
                        <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><IconClock className="w-3 h-3 text-slate-400" /> Makan Malam</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center pb-1 pt-2 sm:pt-0">
                      <h4 className="text-lg font-black text-slate-600 mb-3 group-hover:text-[#1EAB57] transition-colors line-clamp-2 leading-snug">Pepes Ikan Nila Kemangi Pedas</h4>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1"><IconFlame className="w-3.5 h-3.5 text-rose-400"/> 250 Kkal</span>
                        <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-bold">Protein: 28g</span>
                      </div>
                      <Link href="/resep/1" className="inline-flex items-center justify-between bg-white border border-slate-200 hover:border-[#1EAB57] hover:bg-emerald-50 text-slate-500 hover:text-[#1EAB57] px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors w-full md:w-auto mt-auto cursor-pointer">
                        <span>Lihat Detail Resep</span>
                        <IconChevronRight className="w-4 h-4"/>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
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
const IconUsers = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconActivity = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const IconFlame = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>;
const IconClock = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconCutlery = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
const IconBell = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconChevronLeft = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRight = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconPlay = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"></path></svg>;
const IconEdit = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconPlus = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconCheckCircle = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconExpand = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>;
const IconMic = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>;
const IconCrown = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M2 4h20v2H2z"></path><path d="m2 8 3.5 12h13L22 8l-6 4-4-6-4 6z"></path></svg>;
const IconArrowRight = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconRefresh = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const IconLoader = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;
const IconCalendar = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;