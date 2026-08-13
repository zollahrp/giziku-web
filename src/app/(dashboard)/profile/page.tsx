"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDetailNutrisi, setShowDetailNutrisi] = useState(false);
  
  // STATE DATA USER (DINAMIS DARI FIREBASE)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    gender: "",
    birthDate: "",
    role: "BASIC",
    photoURL: "", 
    location: "Mencari lokasi...",
    height: "-",
    weight: "-",
    activity: "Belum diatur",
    exercise: "Belum diatur",
    bodyGoal: "Belum diatur",
    dietType: "Belum diatur",
    favoriteFoods: "Belum diatur",
    dislikedFoods: "Tidak Ada",
    medicalHistory: "Tidak Ada",
    bmi: "0",
    bmiStatus: "-",
    idealWeight: "0",
    calories: "0",
  });

  useEffect(() => {
    // 1. DENGARKAN STATUS LOGIN FIREBASE
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData({
              name: data.name || user.displayName || "User Gizify",
              email: data.email || user.email || "",
              gender: data.gender || "Belum diatur",
              birthDate: data.birthDate || "Belum diatur",
              role: data.role || "BASIC",
              photoURL: data.photoURL || user.photoURL || "",
              location: data.location || "Lokasi belum diatur",
              height: data.height || "-",
              weight: data.weight || "-",
              activity: data.activity || "Belum diatur",
              exercise: data.exercise || "Belum diatur",
              bodyGoal: data.bodyGoal || "Belum diatur",
              dietType: data.dietType || "Belum diatur",
              favoriteFoods: data.favoriteFoods || "Belum diatur",
              dislikedFoods: data.dislikedFoods || "Tidak Ada",
              medicalHistory: data.medicalHistory || "Tidak Ada",
              bmi: data.bmi || "0",
              bmiStatus: data.bmiStatus || "-",
              idealWeight: data.idealWeight || "0",
              calories: data.calories || "0",
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setIsLoaded(true);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Data Dummy Keluarga Terintegrasi (Biarkan dulu untuk layout)
  const familyMembers = [
    { name: "Dina Mariana", role: "Ibu / Istri", cal: "1.500 Kkal", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" },
    { name: "Reza Perdana", role: "Anak", cal: "1.200 Kkal", img: "https://images.unsplash.com/photo-1519456264917-42d0aa2e0610?q=80&w=150&auto=format&fit=crop" },
  ];

  const getInitials = (name: string) => {
    if (!name) return "G";
    return name.charAt(0).toUpperCase();
  };

  // Fungsi untuk render text yang dipisah koma menjadi badge
  const renderTags = (text: string, isDanger = false) => {
    if (!text || text.trim() === "" || text.trim().toLowerCase() === "tidak ada" || text === "Belum diatur") {
      return (
        <span className={`px-3 py-1.5 text-[11px] font-bold rounded-lg inline-block shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] ${isDanger ? 'bg-slate-50 border border-slate-100/80 text-slate-400' : 'bg-emerald-50 border border-emerald-100/80 text-[#1EAB57]'}`}>
          {text === "Belum diatur" ? "Tidak Ada" : text}
        </span>
      );
    }
    const tags = text.split(",").map(t => t.trim()).filter(t => t);
    return tags.map((tag, i) => (
      <span key={i} className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] border ${isDanger ? 'bg-rose-50 border-rose-100/80 text-rose-600' : 'bg-slate-50 border-slate-100/80 text-slate-700'}`}>
        {isDanger && <IconDrop className="w-3 h-3"/>} {tag}
      </span>
    ));
  };

  // Fungsi Kunci Fitur Family
  const handleFamilyAction = () => {
    if (userData.role !== "FAMILY") {
      Swal.fire({
        title: "Fitur Terkunci!",
        text: "Upgrade ke Paket Family untuk mengelola dan memantau gizi seluruh anggota keluarga dalam satu akun.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1EAB57",
        cancelButtonColor: "#f43f5e",
        confirmButtonText: "Lihat Harga",
        cancelButtonText: "Nanti Saja",
        customClass: { popup: "rounded-3xl" }
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/pricing");
        }
      });
    } else {
      Swal.fire({
        title: "Segera Hadir",
        text: "Fitur penambahan anggota keluarga sedang dalam tahap pengembangan.",
        icon: "info",
        confirmButtonColor: "#1EAB57",
        customClass: { popup: "rounded-3xl" }
      });
    }
  };

  // =======================================
  // UI SKELETON LOADER
  // =======================================
  if (!isLoaded) {
    return (
      <div className="w-full pb-12 flex flex-col gap-6 md:gap-8 relative overflow-x-hidden min-w-0 animate-in fade-in duration-500 mt-2 lg:mt-4 px-2 sm:px-4 md:px-8">
        {/* Header Skeleton */}
        <div className="w-full h-[160px] md:h-[180px] bg-slate-200 animate-pulse rounded-[2rem] md:rounded-[2.5rem]"></div>
        <div className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm border border-slate-100 -mt-16 md:-mt-24 mx-2 md:mx-0 relative z-10">
           <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-slate-200 animate-pulse border-[6px] md:border-[8px] border-white shrink-0 -mt-12 md:-mt-8"></div>
           <div className="flex-1 space-y-4 w-full md:mt-10">
              <div className="h-8 bg-slate-200 animate-pulse rounded-xl w-1/2 md:w-1/3 mx-auto md:mx-0"></div>
              <div className="h-4 bg-slate-200 animate-pulse rounded-lg w-1/3 md:w-1/4 mx-auto md:mx-0"></div>
              <div className="flex gap-3 justify-center md:justify-start pt-2">
                 <div className="h-8 bg-slate-200 animate-pulse rounded-xl w-24"></div>
                 <div className="h-8 bg-slate-200 animate-pulse rounded-xl w-32"></div>
              </div>
           </div>
           <div className="w-full md:w-32 h-12 bg-slate-200 animate-pulse rounded-2xl md:mt-10"></div>
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm h-28 animate-pulse flex flex-col justify-between">
               <div className="w-20 h-3 bg-slate-200 rounded-md"></div>
               <div className="w-32 h-8 bg-slate-200 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 mt-2">
           <div className="xl:col-span-7 space-y-6 md:space-y-8">
              <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 h-[300px] animate-pulse"></div>
              <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 h-[250px] animate-pulse"></div>
           </div>
           <div className="xl:col-span-5 space-y-6 md:space-y-8">
              <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 h-[300px] animate-pulse"></div>
           </div>
        </div>
      </div>
    );
  }

  // =======================================
  // UI UTAMA (DATA SUDAH LOADED)
  // =======================================
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 flex flex-col gap-6 md:gap-8 relative overflow-x-hidden min-w-0">
      
      {/* INJEKSI CSS ANIMASI KUSTOM */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(30px); animation: fadeUpAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; } .delay-300 { animation-delay: 0.3s; } .delay-400 { animation-delay: 0.4s; }
          .hover-float:hover { transform: translateY(-4px); box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.08); }
        `
      }} />

      {/* ======================================= */}
      {/* MODAL DETAIL NUTRISI (POP-UP) */}
      {/* ======================================= */}
      {showDetailNutrisi && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <IconActivity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Detail Nutrisi Harian</h2>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Pantauan Mikro & Makro Gizi Hari Ini</p>
                </div>
              </div>
              <button onClick={() => setShowDetailNutrisi(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer">
                <IconClose className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto custom-scroll space-y-8">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Gizi Mikro (Vitamin & Mineral)</h3>
                <div className="space-y-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  
                  <div className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-slate-700">Vitamin C</span>
                      <span className="text-[11px] font-black text-slate-900">45mg <span className="text-slate-400">/ 90mg</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full group-hover:bg-orange-500 transition-colors" style={{ width: '50%' }}></div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-slate-700">Serat Pangan</span>
                      <span className="text-[11px] font-black text-[#1EAB57]">28g <span className="text-slate-400">/ 30g</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1EAB57] rounded-full group-hover:bg-[#168E46] transition-colors" style={{ width: '93%' }}></div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-slate-700">Kalsium</span>
                      <span className="text-[11px] font-black text-slate-900">400mg <span className="text-slate-400">/ 1000mg</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full group-hover:bg-blue-500 transition-colors" style={{ width: '40%' }}></div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-slate-700">Zat Besi</span>
                      <span className="text-[11px] font-black text-slate-900">12mg <span className="text-slate-400">/ 18mg</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full group-hover:bg-rose-500 transition-colors" style={{ width: '66%' }}></div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4 transform transition-transform hover:scale-[1.02]">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
                  <IconSparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-900 mb-1">Saran Nutrisi AI</h4>
                  <p className="text-[11px] font-medium text-indigo-700 leading-relaxed">Asupan kalsiummu masih cukup rendah (40%). Disarankan untuk mengonsumsi susu, keju, atau sayuran berdaun hijau gelap di jadwal makan malam.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ======================================= */}
      {/* VIP HEADER BANNER (PREMIUM OVERLAP SAAS) */}
      {/* ======================================= */}
      <div className={`relative w-full mt-2 lg:mt-4 transition-all duration-500 animate-fade-up`}>
        
        {/* Lapis 1: Background Hijau (Emerald Gradient) */}
        <div className="absolute top-0 left-0 right-0 h-[160px] md:h-[180px] bg-gradient-to-r from-[#1EAB57] via-[#24C667] to-[#127236] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_15px_30px_-10px_rgba(30,171,87,0.3)]">
          <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none animate-pulse"></div>
          <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-emerald-900/20 rounded-full blur-[50px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        </div>

        {/* Lapis 2: White Info Card & Avatar Float */}
        <div className="relative pt-[90px] md:pt-[110px] px-2 sm:px-4 md:px-8 pb-2">
          
          <div className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative">
            
            {/* Avatar Melayang (Overlap Atas) */}
            <div className="md:absolute md:left-8 md:-top-[4.5rem] flex justify-center -mt-20 md:mt-0 z-20">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[6px] md:border-[8px] border-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] overflow-hidden bg-slate-100 flex items-center justify-center relative">
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt={userData.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-[#1A453A] flex items-center justify-center text-white text-5xl font-black">
                    {getInitials(userData.name)}
                  </div>
                )}
              </div>
            </div>

            {/* Spacer buat desktop agar tulisan gak ketutupan foto */}
            <div className="hidden md:block w-36 shrink-0"></div>

            {/* Detail Profil & Badges Dinamis */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-center">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl md:text-[2rem] font-black text-slate-900 tracking-tight leading-none">{userData.name.split(" ")[0] || "Member"}</h1>
                {userData.role !== "BASIC" && <IconVerify className="w-6 h-6 text-[#1EAB57]" />}
              </div>
              
              <p className="text-sm font-bold text-slate-500 mb-5">{userData.email || "email@gizify.ai"}</p>

              {/* Badges Container */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-default">
                  <IconMapPin className="w-4 h-4 text-rose-500" />
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{userData.location}</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white shadow-sm cursor-default">
                  <span className="text-[11px] font-black uppercase tracking-widest">Kepala Keluarga</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-[#1EAB57] border border-emerald-100 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] cursor-default">
                  <IconSparkles className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">{userData.role} Member</span>
                </div>
              </div>
            </div>

            {/* Action Button Edit */}
            <div className="w-full md:w-auto shrink-0 flex items-center md:items-end justify-center md:h-full md:pt-3">
               <Link href="/profile/edit" className="w-full md:w-auto flex items-center justify-center gap-2.5 bg-[#1EAB57] hover:bg-[#168E46] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_8px_20px_rgba(30,171,87,0.3)] cursor-pointer group">
                  <IconEdit className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Edit Profil
               </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ======================================= */}
      {/* 4 METRIK KESEHATAN (SaaS Style) */}
      {/* ======================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 sm:px-4 md:px-8 mt-2 animate-fade-up delay-200">
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-pointer relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1EAB57] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Kalori</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{userData.calories}<span className="text-xs font-semibold text-slate-400 ml-1">Kkal</span></h3>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <IconActivity className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-pointer relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status BMI</p>
              <h3 className="text-2xl md:text-3xl font-black text-rose-500 group-hover:text-rose-600 transition-colors">{userData.bmiStatus}</h3>
            </div>
            <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <IconHeart className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-pointer relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Berat Aktual</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-amber-500 transition-colors">{userData.weight}<span className="text-xs font-semibold text-slate-400 ml-1">Kg</span></h3>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <IconScale className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-pointer relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Berat Ideal</p>
              <h3 className="text-2xl md:text-3xl font-black text-blue-500 group-hover:text-blue-600 transition-colors">{userData.idealWeight}<span className="text-xs font-semibold text-slate-400 ml-1">Kg</span></h3>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <IconTarget className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================= */}
      {/* MAIN CONTENT SPLIT */}
      {/* ======================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start px-2 sm:px-4 md:px-8 mt-2">
        
        {/* KOLOM KIRI (7 Col) - INFORMASI DASAR & KESEHATAN */}
        <div className="xl:col-span-7 space-y-6 md:space-y-8 min-w-0 animate-fade-up delay-300">
          
          {/* INFORMASI DASAR (iOS Settings Style) */}
          <div className="bg-white rounded-[2rem] p-2 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between p-4 px-6 mb-2 border-b border-slate-50">
              <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Informasi Dasar</h3>
              <Link href="/profile/edit" className="text-[10px] font-bold text-[#1EAB57] uppercase tracking-widest hover:underline cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors hover:bg-emerald-100">
                Edit Info
              </Link>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-4 py-3.5 px-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-[#1EAB57] shrink-0 border border-emerald-100/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] group-hover:scale-105 transition-transform">
                  <IconUser className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-400 mb-0.5">Nama Lengkap</p>
                  <p className="text-sm font-black text-slate-800">{userData.name}</p>
                </div>
                <IconChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mx-6 h-px bg-slate-100"></div>

              <div className="flex items-center gap-4 py-3.5 px-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-[#1EAB57] shrink-0 border border-emerald-100/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] group-hover:scale-105 transition-transform">
                  <IconMail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-400 mb-0.5">Email</p>
                  <p className="text-sm font-black text-slate-800 truncate">{userData.email}</p>
                </div>
                <IconChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mx-6 h-px bg-slate-100"></div>

              <div className="flex items-center gap-4 py-3.5 px-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-[#1EAB57] shrink-0 border border-emerald-100/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] group-hover:scale-105 transition-transform">
                  <IconGender className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-400 mb-0.5">Jenis Kelamin</p>
                  <p className="text-sm font-black text-slate-800 capitalize">{userData.gender}</p>
                </div>
                <IconChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mx-6 h-px bg-slate-100"></div>

              <div className="flex items-center gap-4 py-3.5 px-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-[#1EAB57] shrink-0 border border-emerald-100/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] group-hover:scale-105 transition-transform">
                  <IconCake className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-400 mb-0.5">Tanggal Lahir</p>
                  <p className="text-sm font-black text-slate-800">{userData.birthDate}</p>
                </div>
                <IconChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Kondisi Kesehatan */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-500 flex items-center justify-center shadow-[inset_0_2px_5px_rgba(255,255,255,0.8),0_2px_5px_rgba(0,0,0,0.05)] border border-blue-100/50">
                <IconStethoscope className="w-5 h-5 drop-shadow-sm" />
              </div>
              <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Kesehatan & Aktivitas</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)] hover:bg-white transition-colors cursor-default">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Alergi & Pantangan</p>
                <div className="flex gap-2 flex-wrap">
                  {renderTags(userData.dislikedFoods, true)}
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)] hover:bg-white transition-colors cursor-default">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Riwayat Penyakit</p>
                {renderTags(userData.medicalHistory, false)}
              </div>
              
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)] hover:bg-white transition-colors cursor-default">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tingkat Aktivitas</p>
                <p className="text-sm font-black text-slate-800">{userData.activity}</p>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)] hover:bg-white transition-colors cursor-default">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Jadwal Olahraga</p>
                <p className="text-sm font-black text-slate-800">{userData.exercise}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (5 Col) - PREFERENSI MAKANAN & KELUARGA */}
        <div className="xl:col-span-5 space-y-6 md:space-y-8 min-w-0 animate-fade-up delay-400">
          
          {/* Preferensi Makanan */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 text-orange-500 flex items-center justify-center shadow-[inset_0_2px_5px_rgba(255,255,255,0.8),0_2px_5px_rgba(0,0,0,0.05)] border border-orange-100/50">
                  <IconCutlery className="w-5 h-5 drop-shadow-sm" />
                </div>
                <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Diet & Menu</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tipe Diet</p>
                <div className="flex gap-2 flex-wrap">
                   <span className="px-3 py-1.5 bg-slate-50 border border-slate-100/80 text-slate-700 text-[11px] font-bold rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                     {userData.dietType}
                   </span>
                </div>
              </div>
              
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)] hover:bg-white transition-colors cursor-default">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Menu Favorit</p>
                <p className="text-[13px] font-black text-slate-800 leading-relaxed">{userData.favoriteFoods}</p>
              </div>
            </div>
          </div>

          {/* Family Management (KUNCI JIKA BUKAN FAMILY) */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-indigo-500 flex items-center justify-center shadow-[inset_0_2px_5px_rgba(255,255,255,0.8),0_2px_5px_rgba(0,0,0,0.05)] border border-indigo-100/50">
                  <IconUsers className="w-5 h-5 drop-shadow-sm" />
                </div>
                <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Keluarga</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded border border-slate-100">{familyMembers.length + 1} Anggota</span>
            </div>

            <p className="text-[11px] font-bold text-slate-500 mb-6 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100/50">
              Pantau asupan kalori dan alergi istri, anak, atau orang tua dalam satu akun GIZIFY.
            </p>

            <div className="space-y-3.5 flex-1 relative">
              
              {/* Card Diri Sendiri */}
              <div className="flex items-center justify-between p-3 md:p-4 rounded-[1.25rem] bg-gradient-to-r from-[#F0FDF4] to-[#E8F8EE] border border-emerald-200/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.8)] relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-white/40 rounded-full blur-[20px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-[#1A453A] text-white font-black text-lg">
                    {userData.photoURL ? (
                      <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(userData.name)
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{userData.name.split(" ")[0]} (Kamu)</h4>
                    <p className="text-[10px] font-bold text-[#1EAB57] mt-0.5 uppercase tracking-wide">Ketua • {userData.calories} Kkal</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm relative z-10">
                  <IconCheck className="w-4 h-4 text-[#1EAB57]" />
                </div>
              </div>

              {/* Looping Anggota Keluarga Lain */}
              {familyMembers.map((member, index) => (
                <div key={index} onClick={handleFamilyAction} className="flex items-center justify-between p-3 md:p-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group hover:-translate-y-0.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-[#1EAB57] transition-colors">{member.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide">{member.role} • {member.cal}</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-slate-500 bg-white px-3.5 py-2 rounded-lg border border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-colors shadow-sm active:scale-95">
                    {userData.role === "FAMILY" ? "Beralih" : <IconLock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}

              {/* Tambah Anggota Button */}
              <button onClick={handleFamilyAction} className="w-full flex items-center justify-center gap-2 p-4 md:p-5 rounded-[1.25rem] border-2 border-dashed border-slate-200 text-slate-500 hover:text-[#1EAB57] hover:border-[#1EAB57]/50 hover:bg-[#F0FDF4] transition-all cursor-pointer group mt-4 active:scale-95 hover:shadow-sm">
                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#1EAB57] group-hover:text-white flex items-center justify-center transition-colors shadow-inner group-hover:shadow-md">
                  {userData.role === "FAMILY" ? <IconPlus className="w-3.5 h-3.5" /> : <IconLock className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Tambah Anggota</span>
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// KUMPULAN SVG ICONS KUSTOM
// ==========================================
const IconEdit = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconCheck = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconCutlery = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
const IconActivity = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const IconDrop = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>;
const IconCamera = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>;
const IconVerify = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconHeart = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const IconScale = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"></path><path d="M12 2v20"></path><rect x="4" y="8" width="16" height="8" rx="2"></rect></svg>;
const IconTarget = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const IconStethoscope = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"></path><path d="M8 2v4"></path><path d="M16 2v4"></path><circle cx="16" cy="16" r="3"></circle><path d="M18.1 18.1L22 22"></path></svg>;
const IconUsers = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconPlus = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconUser = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconMail = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const IconGender = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M14 23v-8h-4v8"></path><path d="M8 9h4c1.1 0 2 .9 2 2v4"></path><path d="M21 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M21 16v7"></path><path d="M18 10h6v6h-6z"></path></svg>;
const IconCake = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"></path><path d="M2 21h20"></path><path d="M7 8v2"></path><path d="M12 8v2"></path><path d="M17 8v2"></path><path d="M7 4h.01"></path><path d="M12 4h.01"></path><path d="M17 4h.01"></path></svg>;
const IconMapPin = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconChevronRight = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconSparkles = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconClose = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconLock = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;