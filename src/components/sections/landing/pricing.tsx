"use client";

import { useEffect, useState, useRef } from 'react';

// Data Paket Pricing (Gaya Copywriting lebih santai dan B2C)
const pricingPlans = [
  {
    name: "GIZIKU BASIC",
    desc: "Langkah awal buat kamu yang mau mulai sadar kalori harian.",
    price: { bulanan: 0, tahunan: 0 },
    features: [
      { text: "5x Scan Kalori AI / Hari", included: true },
      { text: "Akses Resep Standar", included: true },
      { text: "Tracking BB & BMI Dasar", included: true },
      { text: "Laporan Nutrisi Mingguan", included: false },
      { text: "Custom Meal Plan AI", included: false },
    ],
    cta: "Mulai Gratis",
    primary: false,
    delay: "delay-100",
  },
  {
    name: "GIZIKU PRO",
    desc: "Unlock semua kekuatan AI untuk capai body goals lebih cepat.",
    badge: "PALING PAS BUAT KAMU",
    price: { bulanan: 25000, tahunan: 240000 }, 
    features: [
      { text: "Unlimited AI Food Scan", included: true },
      { text: "Akses 1000+ Resep Premium", included: true },
      { text: "Tracking Makro & Mikro", included: true },
      { text: "Custom Meal Plan AI", included: true },
      { text: "GiziBot Assistant 24/7", included: true },
    ],
    cta: "Upgrade ke Pro",
    primary: true, 
    delay: "delay-0",
  },
  {
    name: "GIZIKU FAMILY",
    desc: "Satu langganan untuk kesehatan seluruh anggota keluarga di rumah.",
    price: { bulanan: 80000, tahunan: 780000 }, 
    features: [
      { text: "Semua Fitur Pro Member", included: true },
      { text: "Sampai 5 Profil Anggota", included: true },
      { text: "Dashboard Nutrisi Keluarga", included: true },
      { text: "Laporan Gizi Anak & Dewasa", included: true },
      { text: "Priority CS Support", included: true },
    ],
    cta: "Pilih Paket Family",
    primary: false,
    delay: "delay-200", 
  },
];

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 } 
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    // Background ngikutin Hero (#FAFAFA)
    <section ref={sectionRef} className="w-full min-h-screen py-20 bg-[#FAFAFA] relative flex items-center justify-center overflow-hidden" id="pricing">
      
      {/* Ornamen Background (Nyamain vibe bulatan dashed di Hero) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
        <div className="h-[900px] w-[900px] rounded-full border-[2px] border-dashed border-gray-800 absolute"></div>
        <div className="absolute top-[10%] left-[10%] text-gray-800"><IconPlus size="32" /></div>
        <div className="absolute bottom-[10%] right-[10%] text-gray-800"><IconPlus size="32" /></div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes textSlideUp {
            0% { transform: translateY(40px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes cardFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .animate-text-enter { animation: textSlideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          .animate-float-card { animation: cardFloat 6s ease-in-out infinite; }
          .delay-0 { animation-delay: 0s; }
          .delay-100 { animation-delay: 0.15s; }
          .delay-200 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.6s; }
          
          /* Animasi Harga Pas Ganti Bulanan/Tahunan */
          .price-fade {
            animation: priceFadeAnim 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @keyframes priceFadeAnim {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
        `
      }} />

      <div className="max-w-[1400px] w-full mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* --- Header --- */}
        <div className={`text-center flex flex-col items-center mb-14 md:mb-16 ${isVisible ? 'animate-text-enter delay-0' : 'opacity-0'}`}>
          
          {/* UPDATED TAG PILL STANDAR (Sama dengan Misi Kami & Pengalaman Pengguna) */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100/80 mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md">
             <span className="w-2 h-2 rounded-full bg-[#1A453A] animate-pulse"></span>
             <span className="text-[9px] md:text-[10px] font-black text-[#1A453A] uppercase tracking-[0.25em]">Pricing Plan</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-black tracking-tighter text-gray-950 leading-[1.05] mb-8">
            Mulai Dari <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A453A] via-emerald-600 to-green-500 drop-shadow-sm">Nol</span>.<br />
            Upgrade Kapan Aja.
          </h2>

          {/* Toggle Tab Ala Segmented Control Hero */}
          <div className="relative flex w-[280px] rounded-full bg-white p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-gray-100">
            <div 
              className="absolute top-1.5 bottom-1.5 rounded-full bg-gray-100/80 shadow-sm transition-all duration-400 ease-out"
              style={{ 
                width: 'calc(50% - 6px)', 
                left: isAnnual ? 'calc(50% + 3px)' : '3px' 
              }}
            ></div>
            <button onClick={() => setIsAnnual(false)} className={`relative z-10 flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors duration-300 ${!isAnnual ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
              Bulanan
            </button>
            <button onClick={() => setIsAnnual(true)} className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider transition-colors duration-300 ${isAnnual ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
              Tahunan
              {!isAnnual && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-[8px] text-orange-600 animate-pulse"><IconSparkle size="10"/></span>}
            </button>
          </div>
        </div>

        {/* --- Pricing Cards Grid (Glassmorphism Ala Hero) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-stretch lg:px-12">
          {pricingPlans.map((plan, index) => {
            const currentPrice = isAnnual ? plan.price.tahunan : plan.price.bulanan;
            
            return (
              <div 
                key={index} 
                className={`relative w-full ${isVisible ? `animate-text-enter ${plan.delay}` : 'opacity-0'} ${plan.primary && isVisible ? 'animate-float-card' : ''}`}
              >
                <div className={`flex flex-col h-full rounded-[2.5rem] bg-white/80 p-8 lg:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-300 group
                  hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1
                  ${plan.primary ? 'border-2 border-[#1A453A]/20 scale-100 lg:scale-105 z-20' : 'border border-gray-100/80 z-10'}`}
                >
                  
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1A453A] text-white px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase whitespace-nowrap shadow-lg flex items-center gap-2 z-30">
                      <span className="text-yellow-400"><IconSparkle size="12" /></span>
                      {plan.badge}
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{plan.name}</p>
                    <h3 className="text-lg font-bold text-gray-800 leading-snug">{plan.desc}</h3>
                  </div>
                  
                  {/* Harga */}
                  <div className="mb-8 flex flex-col justify-end min-h-[90px]">
                    <div className="h-4">
                      {isAnnual && plan.price.bulanan > 0 && (
                        <span className="price-fade text-xs font-bold text-gray-400 line-through decoration-gray-300">
                          Rp {(plan.price.bulanan / 1000).toFixed(0)}k
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-end gap-1.5 price-fade">
                      <span className="text-2xl font-black text-gray-900 mb-1">Rp</span>
                      <span key={isAnnual ? 'year' : 'month'} className="text-[56px] lg:text-[64px] font-black tracking-tighter text-gray-900 leading-[0.85]">
                        {(currentPrice / 1000).toFixed(0)}<span className='text-3xl font-extrabold text-gray-400'>k</span>
                      </span>
                    </div>
                    
                    <div className="h-5 mt-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {plan.price.bulanan === 0 ? "GRATIS SELAMANYA" : isAnnual ? "PER TAHUN" : "PER BULAN"}
                      </span>
                    </div>
                  </div>

                  {/* Divider garis ala Hero */}
                  <div className="h-[1.5px] w-full bg-gray-100 mb-8"></div>

                  {/* Fitur (Mirip list Bahan Baku di Hero) */}
                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3 text-sm font-semibold text-gray-600">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]
                          ${feature.included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                          {feature.included ? <IconCheck /> : <IconX />}
                        </span>
                        <span className={`leading-snug pt-0.5 ${feature.included ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button (Style tombol "SCAN MAKANAN") */}
                  <button 
                    className={`w-full group flex cursor-pointer items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-bold transition-all duration-300 hover:-translate-y-1
                      ${plan.primary 
                        ? 'bg-[#1A453A] text-white shadow-xl hover:bg-[#123129] hover:shadow-[#1A453A]/30' 
                        : 'border-2 border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 bg-white'}`}
                  >
                    {plan.cta}
                    {plan.primary && <span className="group-hover:translate-x-1 transition-transform"><IconArrowRight /></span>}
                  </button>

                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer info (Gaya tulisan vertikal di Hero) */}
        <div className={`mt-16 flex items-center justify-center gap-6 opacity-40 select-none ${isVisible ? 'animate-text-enter delay-400' : 'opacity-0'}`}>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-600">CANCEL ANYTIME</p>
          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-600">14-DAY MONEY BACK</p>
        </div>

      </div>
    </section>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconX = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconSparkle = ({size = "20"}: {size?: string}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>;
const IconArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconPlus = ({size = "24"}: {size?: string}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;