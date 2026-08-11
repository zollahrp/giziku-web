"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MealPlanGeneratorPage() {
  // STATE WIZARD & FORM
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState("2.000.000");
  const [days, setDays] = useState("30");
  const [people, setPeople] = useState("4");
  
  // STATE LOADING AI
  const [loadingStep, setLoadingStep] = useState(0);

  // Fungsi Pindah Step
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Format Input Budget (Hanya Angka & Titik)
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    if (rawValue) {
      const formatted = parseInt(rawValue, 10).toLocaleString("id-ID");
      setBudget(formatted);
    } else {
      setBudget("");
    }
  };

  // Efek Animasi Loading AI (Step 4)
  useEffect(() => {
    if (step === 4) {
      const timers = [
        setTimeout(() => setLoadingStep(1), 1000), // Menganalisis budget...
        setTimeout(() => setLoadingStep(2), 2500), // Menghitung kebutuhan nutrisi...
        setTimeout(() => setLoadingStep(3), 4000), // Menyesuaikan porsi...
        setTimeout(() => setLoadingStep(4), 5500), // Mencari menu terbaik...
        setTimeout(() => setStep(5), 7000),        // Pindah ke Hasil
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [step]);

  // ==========================================
  // KOMPONEN: PROGRESS BAR (Step 1-3)
  // ==========================================
  const renderProgressBar = (currentStep: number) => (
    <div className="flex flex-col w-full mb-8">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={prevStep} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500">
          <IconChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex gap-2">
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${currentStep >= 1 ? 'bg-[#1EAB57]' : 'bg-slate-200'}`}></div>
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${currentStep >= 2 ? 'bg-[#1EAB57]' : 'bg-slate-200'}`}></div>
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${currentStep >= 3 ? 'bg-[#1EAB57]' : 'bg-slate-200'}`}></div>
        </div>
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-12">Step {currentStep} Dari 3</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex justify-center py-6 px-4 md:py-10">
      
      {/* CSS Animasi */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-pulse-fast { animation: pulseFast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulseFast { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .8; transform: scale(0.95); } }
        `
      }} />

      {/* CONTAINER WIZARD */}
      <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgb(0,0,0,0.05)] border border-slate-100 overflow-hidden relative flex flex-col min-h-[600px]">
        
        {/* ======================================= */}
        {/* STEP 1: BUDGET */}
        {/* ======================================= */}
        {step === 1 && (
          <div className="flex flex-col h-full p-6 md:p-8 animate-fade-in-up">
            {renderProgressBar(1)}
            
            <div className="flex-1 flex flex-col mt-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-[#1EAB57] mb-6">
                <IconWallet className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-4 leading-tight">Berapa budget makananmu?</h1>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10">Kami akan membantu membuat rencana makan terbaik sesuai budgetmu.</p>
              
              <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-2xl p-4 focus-within:border-[#1EAB57] focus-within:ring-4 focus-within:ring-[#1EAB57]/10 transition-all shadow-sm">
                <span className="text-[#1EAB57] font-black text-xl mr-3">Rp</span>
                <input 
                  type="text" 
                  value={budget} 
                  onChange={handleBudgetChange}
                  className="flex-1 bg-transparent text-2xl font-black text-[#0F172A] focus:outline-none placeholder:text-slate-300"
                  placeholder="0"
                />
              </div>
            </div>

            <button onClick={nextStep} disabled={!budget} className="mt-8 w-full bg-[#1EAB57] hover:bg-[#168E46] disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#1EAB57]/30">
              Lanjut <IconArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* STEP 2: DURASI */}
        {/* ======================================= */}
        {step === 2 && (
          <div className="flex flex-col h-full p-6 md:p-8 animate-fade-in-up">
            {renderProgressBar(2)}
            
            <div className="flex-1 flex flex-col mt-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-[#1EAB57] mb-6">
                <IconCalendar className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-4 leading-tight">Untuk berapa hari?</h1>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10">Kami akan menghitung rencana makan terbaik berdasarkan durasi.</p>
              
              <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-2xl p-4 focus-within:border-[#1EAB57] focus-within:ring-4 focus-within:ring-[#1EAB57]/10 transition-all shadow-sm">
                <IconClock className="w-6 h-6 text-[#1EAB57] mr-3" />
                <input 
                  type="number" 
                  value={days} 
                  onChange={(e) => setDays(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-black text-[#0F172A] focus:outline-none placeholder:text-slate-300"
                  placeholder="0"
                />
                <span className="text-slate-400 font-bold ml-2">Hari</span>
              </div>
            </div>

            <button onClick={nextStep} disabled={!days} className="mt-8 w-full bg-[#1EAB57] hover:bg-[#168E46] disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#1EAB57]/30">
              Lanjut <IconArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* STEP 3: JUMLAH ORANG */}
        {/* ======================================= */}
        {step === 3 && (
          <div className="flex flex-col h-full p-6 md:p-8 animate-fade-in-up">
            {renderProgressBar(3)}
            
            <div className="flex-1 flex flex-col mt-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-[#1EAB57] mb-6">
                <IconUsers className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-4 leading-tight">Untuk berapa orang?</h1>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10">Kami akan menyesuaikan porsi makanan untuk semua orang.</p>
              
              <div className="relative flex items-center bg-white border-2 border-slate-100 rounded-2xl p-4 focus-within:border-[#1EAB57] focus-within:ring-4 focus-within:ring-[#1EAB57]/10 transition-all shadow-sm">
                <IconUsers className="w-6 h-6 text-[#1EAB57] mr-3" />
                <input 
                  type="number" 
                  value={people} 
                  onChange={(e) => setPeople(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-black text-[#0F172A] focus:outline-none placeholder:text-slate-300"
                  placeholder="0"
                />
                <span className="text-slate-400 font-bold ml-2">Orang</span>
              </div>
            </div>

            <button onClick={nextStep} disabled={!people} className="mt-8 w-full bg-[#1EAB57] hover:bg-[#168E46] disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#1EAB57]/30">
              Buat Rencana Makan <IconSparkles className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ======================================= */}
        {/* STEP 4: LOADING ANIMATION */}
        {/* ======================================= */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center h-full p-6 md:p-8 animate-fade-in-up flex-1 text-center py-16">
            <div className="w-24 h-24 rounded-full border-4 border-emerald-100 border-t-[#1EAB57] animate-spin mb-8 flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center animate-none">
                <IconSparkles className="w-10 h-10 text-[#1EAB57] animate-pulse-fast" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-4">Giziku Sedang Membuat Rencana Makananmu</h2>
            <p className="text-sm font-medium text-slate-500 mb-10 max-w-[280px]">Tunggu sebentar, kami sedang menyesuaikan menu terbaik untukmu.</p>
            
            <div className="w-full flex flex-col gap-4 text-left">
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${loadingStep >= 1 ? 'bg-emerald-50 text-slate-800' : 'bg-transparent text-slate-400'}`}>
                {loadingStep >= 1 ? <IconCheckCircle className="w-5 h-5 text-[#1EAB57]" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>}
                <span className="text-sm font-bold">Menganalisis budget makanan...</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${loadingStep >= 2 ? 'bg-emerald-50 text-slate-800' : 'bg-transparent text-slate-400'}`}>
                {loadingStep >= 2 ? <IconCheckCircle className="w-5 h-5 text-[#1EAB57]" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>}
                <span className="text-sm font-bold">Menghitung kebutuhan nutrisi...</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${loadingStep >= 3 ? 'bg-emerald-50 text-slate-800' : 'bg-transparent text-slate-400'}`}>
                {loadingStep >= 3 ? <IconCheckCircle className="w-5 h-5 text-[#1EAB57]" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>}
                <span className="text-sm font-bold">Menyesuaikan porsi makanan...</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${loadingStep >= 4 ? 'bg-emerald-50 text-slate-800' : 'bg-transparent text-slate-400'}`}>
                {loadingStep >= 4 ? <IconCheckCircle className="w-5 h-5 text-[#1EAB57]" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>}
                <span className="text-sm font-bold">Mencari menu terbaik...</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* STEP 5: HASIL / SUMMARY */}
        {/* ======================================= */}
        {step === 5 && (
          <div className="flex flex-col h-full bg-slate-50/50 relative overflow-y-auto no-scrollbar">
            
            {/* Header Success */}
            <div className="p-6 md:p-8 bg-white border-b border-slate-100 animate-fade-in-up">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setStep(1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500">
                  <IconChevronLeft className="w-5 h-5" />
                </button>
                <div className="bg-emerald-50 text-[#1EAB57] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <IconSparkles className="w-3.5 h-3.5" /> Hasil Rencana Menu
                </div>
              </div>
              <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-4 leading-tight">Rencana Makananmu Sudah Siap</h1>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">Giziku telah membuat rekomendasi makanan berdasarkan budget dan kebutuhanmu.</p>
              
              {/* Card Green Summary */}
              <div className="bg-[#1EAB57] rounded-3xl p-6 text-white shadow-xl shadow-[#1EAB57]/20 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-6 opacity-90"><IconCutlery className="w-4 h-4" /> Ringkasan Rencana</h3>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest opacity-70 mb-1">Budget</p>
                    <p className="text-lg font-black tracking-tight">Rp {budget}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest opacity-70 mb-1">Durasi</p>
                    <p className="text-lg font-black tracking-tight">{days} Hari</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest opacity-70 mb-1">Orang</p>
                    <p className="text-lg font-black tracking-tight">{people} Orang</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest opacity-70 mb-1">Per Hari</p>
                    <p className="text-lg font-black tracking-tight">Rp {Math.round(parseInt(budget.replace(/\./g, '')) / parseInt(days)).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

              {/* Health Score */}
              <div className="mt-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center relative">
                <div className="absolute top-4 right-4 bg-emerald-50 text-[#1EAB57] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                  Sangat Sehat
                </div>
                <h3 className="text-sm font-bold text-slate-800 w-full mb-4 flex items-center gap-2"><IconCheckCircle className="w-4 h-4 text-[#1EAB57]" /> Skor Kesehatan</h3>
                
                <div className="w-32 h-32 relative flex items-center justify-center mt-2">
                  {/* Fake SVG Circle Progress */}
                  <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1EAB57" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 0.89)} strokeLinecap="round" className="drop-shadow-md" />
                  </svg>
                  <div className="flex flex-col items-center justify-center bg-white w-20 h-20 rounded-full z-10 shadow-sm">
                    <span className="text-2xl font-black text-[#0F172A]">8.9<span className="text-xs text-slate-400">/10</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* List Menu Section */}
            <div className="p-6 md:p-8 animate-fade-in-up flex-1" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mb-6">Rekomendasi Menu</h2>
              
              {/* Hari 1 Label */}
              <h3 className="text-lg font-black text-slate-800 mb-4">Hari 1</h3>

              {/* Card Resep */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1510693206972-df098062cb71?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Sarapan</span>
                    <h4 className="text-base font-black text-slate-900 leading-snug">Orak-arik Telur Sayur</h4>
                  </div>
                </div>
                
                <p className="text-xs font-medium text-slate-500 mb-5 leading-relaxed">Telur orak-arik dengan wortel dan buncis untuk sarapan padat nutrisi.</p>

                <div className="flex gap-2 mb-6">
                  <span className="bg-emerald-50 text-[#1EAB57] px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest">Skor 9/10</span>
                  <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest">Sangat Sehat</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-blue-50/50 rounded-2xl py-3 flex flex-col items-center justify-center text-center border border-blue-100/50">
                    <IconActivity className="w-4 h-4 text-blue-500 mb-1" />
                    <span className="text-sm font-black text-blue-600">20g</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Protein</span>
                  </div>
                  <div className="bg-emerald-50/50 rounded-2xl py-3 flex flex-col items-center justify-center text-center border border-emerald-100/50">
                    <IconCalendar className="w-4 h-4 text-[#1EAB57] mb-1" />
                    <span className="text-sm font-black text-[#1EAB57]">10g</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Karbo</span>
                  </div>
                  <div className="bg-rose-50/50 rounded-2xl py-3 flex flex-col items-center justify-center text-center border border-rose-100/50">
                    <IconFlame className="w-4 h-4 text-rose-500 mb-1" />
                    <span className="text-sm font-black text-rose-600">15g</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lemak</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center"><span className="text-xs font-medium text-slate-500">Gula</span><span className="text-xs font-bold text-slate-900">2 g</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs font-medium text-slate-500">Sodium</span><span className="text-xs font-bold text-slate-900">300 mg</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs font-medium text-slate-500">Serat</span><span className="text-xs font-bold text-slate-900">4 g</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs font-medium text-slate-500">Vitamin A</span><span className="text-xs font-bold text-slate-900">Tinggi</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs font-medium text-slate-500">Takaran Saji</span><span className="text-xs font-bold text-slate-900 text-right w-32">Orak-arik telur per porsi</span></div>
                </div>

                <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-1.5"><IconFlame className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-slate-700">400 kcal</span></div>
                  <div className="flex items-center gap-1.5"><IconWallet className="w-4 h-4 text-emerald-500" /><span className="text-xs font-bold text-slate-700">Rp 12.000</span></div>
                </div>
              </div>

              {/* Tampilkan tombol Simpan/Gunakan di bawah daftar menu */}
              <div className="pt-4 pb-8">
                <button className="w-full bg-[#0F172A] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-900/20">
                  Simpan Rencana Meal Plan
                </button>
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
const IconChevronLeft = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconArrowRight = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconWallet = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const IconCalendar = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconClock = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconUsers = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconSparkles = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconCheckCircle = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconCutlery = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
const IconActivity = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const IconFlame = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>;