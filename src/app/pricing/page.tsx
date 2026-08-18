// Path: src/app/pricing/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// IMPORT FIREBASE UNTUK NYATET PAKET USER
import { auth, db } from "@/lib/firebase"; 
import { doc, updateDoc } from "firebase/firestore";

const pricingPlans = [
  {
    name: "GIZIFY BASIC",
    desc: "Mulai sadar kalori harian.",
    price: { bulanan: 0, tahunan: 0 },
    features: [
      { text: "5x Scan Kalori AI / Hari", included: true },
      { text: "Tracking BB & BMI Dasar", included: true },
      { text: "Custom Meal Plan AI", included: false },
    ],
    cta: "Mulai Pakai Gratis",
    note: "Selamanya gratis, tanpa kartu kredit.",
    primary: false,
    delay: "delay-100",
  },
  {
    name: "GIZIFY PRO",
    desc: "Unlock semua kekuatan AI.",
    badge: "PALING PAS BUAT KAMU",
    price: { bulanan: 25000, tahunan: 240000 }, 
    features: [
      { text: "Unlimited AI Food Scan", included: true },
      { text: "Custom Meal Plan AI", included: true },
      { text: "GiziBot Assistant 24/7", included: true },
    ],
    cta: "Coba Gratis 7 Hari", 
    note: "Lalu mulai dari Rp25k. Batal kapan saja.", 
    primary: true, 
    delay: "delay-0",
  },
  {
    name: "GIZIFY FAMILY",
    desc: "Untuk kesehatan keluarga.",
    price: { bulanan: 80000, tahunan: 780000 }, 
    features: [
      { text: "Semua Fitur Pro Member", included: true },
      { text: "Sampai 5 Profil Anggota", included: true },
      { text: "Dashboard Gizi Keluarga", included: true },
    ],
    cta: "Pilih Paket Family",
    note: "Hemat 40% untuk 5 orang anggota.",
    primary: false,
    delay: "delay-200", 
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Injeksi script Midtrans
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-xxxx"; 
    
    if (!document.querySelector(`script[src="${snapScript}"]`)) {
      const script = document.createElement("script");
      script.src = snapScript;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePurchase = async (plan: any) => {
    const price = isAnnual ? plan.price.tahunan : plan.price.bulanan;
    const user = auth.currentUser; // Ambil data user yang lagi login sekarang

    // Keamanan: Kalau tiba-tiba sesi user hilang
    if (!user) {
      Swal.fire("Sesi Berakhir", "Silakan login kembali untuk memilih paket.", "error");
      router.push("/login");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);

    // ==========================================
    // JIKA MEMILIH GRATIS (BASIC)
    // ==========================================
    if (price === 0) {
      setIsProcessing(true);
      try {
        // Catat ke Firestore: Paket Basic, Masa aktif Seumur Hidup
        await updateDoc(userDocRef, {
          role: "BASIC",
          subscriptionType: "lifetime",
          validUntil: "forever"
        });
        
        router.push("/home");
      } catch (error) {
        console.error("Gagal update paket:", error);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // ==========================================
    // JIKA MEMILIH PRO/FAMILY (MIDTRANS)
    // ==========================================
    setIsProcessing(true);
    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: plan.name,
          price: price,
          orderId: `GIZIFY-${Date.now()}`
        })
      });
      const data = await response.json();

      if (data.token) {
        (window as any).snap.pay(data.token, {
          onSuccess: async function () {
            // JIKA PEMBAYARAN MIDTRANS BERHASIL, KITA UPDATE DATABASE-NYA!
            try {
              // 1. Tentukan Rolenya (PRO atau FAMILY)
              const newRole = plan.name === "GIZIFY PRO" ? "PRO" : "FAMILY";
              
              // 2. Hitung Tanggal Kedaluwarsa (Masa Aktif)
              const expiryDate = new Date();
              
              if (isAnnual) {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Tambah 1 Tahun
              } else {
                expiryDate.setMonth(expiryDate.getMonth() + 1); // Tambah 1 Bulan
              }
              
              // Tambahan bonus 7 Hari Trial Khusus Paket PRO
              if (newRole === "PRO") {
                expiryDate.setDate(expiryDate.getDate() + 7);
              }

              // 3. Simpan ke Firestore
              await updateDoc(userDocRef, {
                role: newRole,
                subscriptionType: isAnnual ? "annual" : "monthly",
                validUntil: expiryDate // Tanggal kapan paketnya habis
              });

              Swal.fire({
                title: "Berhasil!",
                text: `Selamat menikmati fitur ${newRole}.`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false
              }).then(() => {
                router.push("/home");
              });
              
            } catch (err) {
              console.error("Gagal update status di database:", err);
              alert("Pembayaran sukses tapi gagal memuat data ke sistem. Hubungi admin.");
            }
          },
          onClose: function () {
            setIsProcessing(false);
          }
        });
      } else {
        alert("Gagal memuat pembayaran. Silakan coba lagi.");
        setIsProcessing(false);
      }
    } catch (error) {
      setIsProcessing(false);
    }
  };

  return (
    <main className="w-full min-h-screen lg:h-screen lg:overflow-hidden bg-[#FAFAFA] relative flex items-center justify-center p-4 lg:p-0">
      
      {/* Ornamen Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <div className="h-[900px] w-[900px] rounded-full border-[2px] border-dashed border-gray-800 absolute animate-spin-slow"></div>
        <div className="h-[700px] w-[700px] rounded-full border-[1px] border-solid border-gray-800 absolute animate-reverse-spin"></div>
      </div>

      <div className="max-w-[1280px] w-full mx-auto relative z-10 flex flex-col items-center py-12 lg:py-0">
        
        {/* Header Pricing */}
        <div className={`text-center flex flex-col items-center mb-8 ${isVisible ? 'animate-fade-up delay-0' : 'opacity-0'}`}>
          <h2 className="text-3xl lg:text-5xl font-black tracking-tighter text-gray-950 leading-[1.05] mb-5">
            Satu langkah lagi untuk capai <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A453A] to-emerald-500 relative">
              Target Gizi-mu.
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-300 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="transparent" strokeLinecap="round" /></svg>
            </span>
          </h2>
          
          {/* Toggles */}
          <div className="relative flex w-[260px] rounded-full bg-white p-1.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 z-20">
            <div 
              className="absolute top-1.5 bottom-1.5 rounded-full bg-gray-100/80 transition-all duration-300"
              style={{ width: 'calc(50% - 6px)', left: isAnnual ? 'calc(50% + 3px)' : '3px' }}
            ></div>
            <button 
              onClick={() => setIsAnnual(false)} 
              className={`relative z-10 flex-1 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors ${!isAnnual ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
            >
              Bulanan
            </button>
            <button 
              onClick={() => setIsAnnual(true)} 
              className={`relative z-10 flex-1 py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${isAnnual ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
            >
              Tahunan
              {!isAnnual && <span className="flex h-3 w-3 items-center justify-center rounded-full bg-orange-100 text-orange-600 animate-pulse text-[6px]">★</span>}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-3 md:gap-5 mt-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><IconCheck /> Batalkan Kapan Saja</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="flex items-center gap-1.5"><IconShield /> 100% Aman</span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full px-4 md:px-12 items-stretch max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const currentPrice = isAnnual ? plan.price.tahunan : plan.price.bulanan;
            
            return (
              <div key={index} className={`relative w-full ${isVisible ? `animate-fade-up ${plan.delay}` : 'opacity-0'}`}>
                
                {/* Efek Glowing Khusus Kartu PRO (Tengah) */}
                {plan.primary && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1A453A] to-emerald-400 blur-2xl opacity-20 rounded-[2rem] -z-10 animate-pulse-slow"></div>
                )}

                <div className={`flex flex-col h-full rounded-[2rem] bg-white/80 p-6 lg:p-8 shadow-sm backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${plan.primary ? 'border-2 border-[#1A453A] scale-100 lg:scale-105 z-20' : 'border border-gray-100/80 z-10 hover:border-gray-300'}`}>
                  
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#1A453A] to-emerald-600 text-white px-5 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase shadow-md whitespace-nowrap overflow-hidden group">
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                      ★ {plan.badge}
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{plan.name}</p>
                    <h3 className="text-sm font-bold text-gray-800 leading-snug">{plan.desc}</h3>
                  </div>
                  
                  <div className="mb-6 flex flex-col justify-end min-h-[70px]">
                    <div className="h-4">
                      {isAnnual && plan.price.bulanan > 0 && (
                        <span className="text-xs font-bold text-gray-400 line-through">Rp {(plan.price.bulanan / 1000).toFixed(0)}k</span>
                      )}
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-black text-gray-900 mb-1">Rp</span>
                      <span className="text-[44px] lg:text-[52px] font-black tracking-tighter text-gray-900 leading-[0.85]">
                        {(currentPrice / 1000).toFixed(0)}<span className='text-2xl font-extrabold text-gray-400'>k</span>
                      </span>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-gray-100 mb-5"></div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3 text-[13px] font-semibold text-gray-600 group">
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] transition-colors ${feature.included ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200' : 'bg-gray-100 text-gray-300'}`}>✓</span>
                        <span className={feature.included ? 'text-gray-800' : 'text-gray-400 line-through'}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <button 
                      onClick={() => handlePurchase(plan)}
                      disabled={isProcessing}
                      className={`relative overflow-hidden w-full py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer disabled:cursor-wait group/btn ${isProcessing ? 'opacity-50' : ''} ${plan.primary ? 'bg-[#1A453A] text-white shadow-[0_8px_20px_rgba(26,69,58,0.25)] hover:shadow-[0_12px_25px_rgba(26,69,58,0.35)] hover:-translate-y-0.5' : 'border-2 border-gray-200 text-gray-700 hover:border-gray-900 hover:bg-gray-50 bg-white'}`}
                    >
                      {/* Efek Shine (Cahaya Lewat) di tombol PRO */}
                      {plan.primary && !isProcessing && (
                        <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
                      )}
                      <span className="relative z-10">{isProcessing ? "Memproses..." : plan.cta}</span>
                    </button>
                    <p className={`text-[10px] text-center font-medium mt-3 ${plan.primary ? 'text-[#1A453A]/80' : 'text-gray-400'}`}>
                      {plan.note}
                    </p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Bawah (Lewati / Trial) dengan Cursor Pointer */}
        <div className={`mt-10 lg:mt-12 text-center ${isVisible ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
          <button 
            onClick={() => handlePurchase(pricingPlans[0])} // Ngasih efek yang sama kayak klik tombol Basic
            className="group flex items-center justify-center gap-2 mx-auto text-sm font-semibold text-gray-500 hover:text-[#1A453A] transition-colors cursor-pointer bg-transparent border-none"
          >
            Belum yakin mau langganan? 
            <span className="text-[#1A453A] underline decoration-[#1A453A]/30 group-hover:decoration-[#1A453A] transition-colors">
              Mulai dengan akun gratis dulu
            </span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(30px); animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
          
          .animate-spin-slow { animation: spin 60s linear infinite; }
          .animate-reverse-spin { animation: spin 45s linear infinite reverse; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          
          .animate-pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }
          @keyframes pulseSlow { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.3; } }
          
          .delay-0 { animation-delay: 0.1s; } 
          .delay-100 { animation-delay: 0.2s; } 
          .delay-200 { animation-delay: 0.3s; }
          .delay-300 { animation-delay: 0.5s; }
        `
      }} />
    </main>
  );
}

// ICONS
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);