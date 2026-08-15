// Path: src/app/(dashboard)/profile/page.tsx
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
  
  // STATE DATA USER (LENGKAP)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    gender: "",
    birthDate: "",
    role: "BASIC",
    photoURL: "", 
    location: "Belum diatur",
    height: "0",
    weight: "0",
    activity: "Belum diatur",
    exercise: "Belum diatur",
    bodyGoal: "Belum diatur",
    dietTypes: [] as string[],
    macroFocus: "Belum diatur",
    mealsPerDay: "Belum diatur",
    waterIntake: "Belum diatur",
    favoriteFoods: "Belum diatur",
    dislikedFoods: "Tidak Ada",
    medicalHistory: "Tidak Ada",
    allergies: [] as string[],
    cookingSkill: "Pemula",
    kitchenEquipments: [] as string[],
    bmi: "0",
    bmiStatus: "-",
    idealWeight: "0",
    calories: "0",
    macros: { pro: 0, car: 0, fat: 0 }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            
            // Handle array fallback
            let parsedDietTypes = [];
            if (Array.isArray(data.dietTypes)) parsedDietTypes = data.dietTypes;
            else if (typeof data.dietType === 'string' && data.dietType !== "Normal / Bebas" && data.dietType !== "Belum diatur") parsedDietTypes = [data.dietType];

            setUserData({
              name: data.name || user.displayName || "User Gizify",
              email: data.email || user.email || "",
              gender: data.gender || "Belum diatur",
              birthDate: data.birthDate || "Belum diatur",
              role: data.role || "BASIC",
              photoURL: data.photoURL || user.photoURL || "",
              location: data.location || "Lokasi belum diatur",
              height: data.height || "0",
              weight: data.weight || "0",
              activity: data.activity || "Belum diatur",
              exercise: data.exercise || "Belum diatur",
              bodyGoal: data.bodyGoal || "Belum diatur",
              dietTypes: parsedDietTypes,
              macroFocus: data.macroFocus || "Seimbang",
              mealsPerDay: data.mealsPerDay || "Belum diatur",
              waterIntake: data.waterIntake || "Belum diatur",
              favoriteFoods: data.favoriteFoods || "Belum diatur",
              dislikedFoods: data.dislikedFoods || "Tidak Ada",
              medicalHistory: data.medicalHistory || "Tidak Ada",
              allergies: data.allergies || [],
              cookingSkill: data.cookingSkill || "Belum diatur",
              kitchenEquipments: data.kitchenEquipments || [],
              bmi: data.bmi || "0",
              bmiStatus: data.bmiStatus || "-",
              idealWeight: data.idealWeight || "0",
              calories: data.calories || "0",
              macros: data.macros || { pro: 0, car: 0, fat: 0 }
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

  // Data Dummy Keluarga
  const familyMembers = [
    { name: "Dina Mariana", role: "Ibu / Istri", cal: "1.500 Kkal", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" },
    { name: "Reza Perdana", role: "Anak", cal: "1.200 Kkal", img: "https://images.unsplash.com/photo-1519456264917-42d0aa2e0610?q=80&w=150&auto=format&fit=crop" },
  ];

  const getInitials = (name: string) => {
    if (!name) return "G";
    return name.charAt(0).toUpperCase();
  };

  const renderTags = (data: string | string[], isDanger = false) => {
    let tags: string[] = [];
    if (Array.isArray(data)) {
      tags = data;
    } else if (typeof data === 'string') {
      if (!data || data.trim() === "" || data.trim().toLowerCase() === "tidak ada" || data === "Belum diatur") {
        return <span className="text-[11px] font-bold text-slate-400">Tidak Ada</span>;
      }
      tags = data.split(",").map(t => t.trim()).filter(t => t);
    }
    if (tags.length === 0) return <span className="text-[11px] font-bold text-slate-400">Tidak Ada</span>;

    return tags.map((tag, i) => (
      <span key={i} className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 shadow-sm border ${isDanger ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-white border-slate-200 text-slate-700'}`}>
        {isDanger ? <IconClose className="w-3 h-3"/> : <IconCheck className="w-3 h-3 text-[#1EAB57]" />} {tag}
      </span>
    ));
  };

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
        customClass: { popup: "rounded-[2rem]" }
      }).then((result) => { if (result.isConfirmed) router.push("/pricing"); });
    } else {
      Swal.fire("Segera Hadir", "Fitur penambahan anggota keluarga sedang dalam tahap pengembangan.", "info");
    }
  };

  // =======================================
  // LOGIC FALLBACK MAKRO (Jika Firebase 0g)
  // =======================================
  let displayPro = userData.macros.pro;
  let displayCar = userData.macros.car;
  let displayFat = userData.macros.fat;

  if ((displayPro === 0 || !displayPro) && parseInt(userData.calories) > 0) {
    const cals = parseInt(userData.calories);
    let proPct = 0.3, carPct = 0.4, fatPct = 0.3; // Seimbang
    if (userData.dietTypes.includes("Keto") || userData.macroFocus === "Sangat Rendah Karbo (Keto)") {
      proPct = 0.25; carPct = 0.05; fatPct = 0.70;
    } else if (userData.macroFocus === "Tinggi Protein (Muscle)") {
      proPct = 0.40; carPct = 0.30; fatPct = 0.30;
    } else if (userData.macroFocus === "Rendah Karbohidrat") {
      proPct = 0.35; carPct = 0.20; fatPct = 0.45;
    } else if (userData.macroFocus === "Rendah Lemak") {
      proPct = 0.30; carPct = 0.50; fatPct = 0.20;
    }
    displayPro = Math.round((cals * proPct) / 4);
    displayCar = Math.round((cals * carPct) / 4);
    displayFat = Math.round((cals * fatPct) / 9);
  }

  // =======================================
  // UI SKELETON LOADER
  // =======================================
  if (!isLoaded) {
    return (
      <div className="w-full pb-12 flex flex-col gap-6 md:gap-8 relative overflow-x-hidden min-w-0 animate-fade-in px-2 sm:px-4 md:px-8 pt-4">
        <div className="w-full h-[160px] md:h-[180px] bg-slate-200 animate-pulse rounded-[2rem]"></div>
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 -mt-16 relative z-10 h-32 animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-[1.5rem] h-28 animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  // =======================================
  // UI UTAMA
  // =======================================
  return (
    <div className="w-full animate-fade-in-up pb-24 md:pb-12 flex flex-col gap-6 md:gap-8 relative overflow-x-hidden min-w-0 px-2 sm:px-4 md:px-8 mt-2 lg:mt-4">
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-in-up { opacity: 0; transform: translateY(30px); animation: fadeUpAnim 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-in { opacity: 0; animation: fadeIn 0.8s ease-out forwards; }
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { to { opacity: 1; } }
          .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; } .delay-300 { animation-delay: 0.3s; }
          .hover-float:hover { transform: translateY(-4px); box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.08); }
        `
      }} />

      {/* ======================================= */}
      {/* VIP HEADER BANNER (PROFILE SUMMARY) */}
      {/* ======================================= */}
      <div className={`relative w-full transition-all duration-500`}>
        <div className="absolute top-0 left-0 right-0 h-[160px] md:h-[180px] bg-gradient-to-r from-[#1EAB57] via-[#24C667] to-[#127236] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_15px_30px_-10px_rgba(30,171,87,0.3)]">
          <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none animate-pulse"></div>
          <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-emerald-900/20 rounded-full blur-[50px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        </div>

        <div className="relative pt-[90px] md:pt-[110px] pb-2">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative">
            <div className="md:absolute md:left-8 md:-top-[4.5rem] flex justify-center -mt-20 md:mt-0 z-20">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[6px] md:border-[8px] border-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] overflow-hidden bg-slate-100 flex items-center justify-center relative">
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt={userData.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#24C667] to-[#1A453A] flex items-center justify-center text-white text-5xl font-black">
                    {getInitials(userData.name)}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden md:block w-36 shrink-0"></div>

            <div className="flex-1 text-center md:text-left flex flex-col justify-center">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl md:text-[2rem] font-black text-slate-900 tracking-tight leading-none">{userData.name.split(" ")[0] || "Member"}</h1>
                {userData.role !== "BASIC" && <IconVerify className="w-6 h-6 text-[#1EAB57]" />}
              </div>
              <p className="text-sm font-bold text-slate-500 mb-5">{userData.email || "email@gizify.ai"}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 transition-colors cursor-default shadow-sm">
                  <IconMapPin className="w-4 h-4 text-rose-500" />
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{userData.location.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white shadow-sm cursor-default">
                  <span className="text-[11px] font-black uppercase tracking-widest">{userData.bodyGoal.split("(")[0]}</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-[#1EAB57] border border-emerald-100 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] cursor-default">
                  <IconSparkles className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">{userData.role} Member</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex items-center md:items-end justify-center md:h-full md:pt-3">
               <Link href="/profile/edit" className="w-full md:w-auto flex items-center justify-center gap-2.5 bg-[#1EAB57] hover:bg-[#168E46] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_8px_20px_rgba(30,171,87,0.3)] cursor-pointer group">
                  <IconEdit className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Edit Profil
               </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================= */}
      {/* 4 METRIK KESEHATAN LIVE (SaaS Style) */}
      {/* ======================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-up delay-100">
        
        {/* Card 1: Target Kalori */}
        <div className="bg-white rounded-[1.5rem] p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1EAB57] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Kalori</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{userData.calories}<span className="text-xs font-semibold text-slate-400 ml-1">Kkal</span></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-emerald-100">
              <IconActivity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-2 leading-snug">
            Formula <strong className="text-slate-700">Mifflin-St Jeor</strong> & aktivitas fisik WHO.
          </p>
        </div>

        {/* Card 2: Status BMI */}
        <div className="bg-white rounded-[1.5rem] p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status BMI</p>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">{userData.bmiStatus}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-rose-100">
              <IconHeart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-2 leading-snug">
            Skor: <strong className="text-slate-700">{userData.bmi}</strong> (Standar klasifikasi WHO).
          </p>
        </div>

        {/* Card 3: Berat Aktual */}
        <div className="bg-white rounded-[1.5rem] p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Berat Aktual</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-amber-500 transition-colors">{userData.weight}<span className="text-xs font-semibold text-slate-400 ml-1">Kg</span></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-amber-100">
              <IconScale className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-2 leading-snug">
            Sesuai input data profil fisik terbarumu.
          </p>
        </div>

        {/* Card 4: Berat Ideal */}
        <div className="bg-white rounded-[1.5rem] p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Berat Ideal</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{userData.idealWeight}<span className="text-xs font-semibold text-slate-400 ml-1">Kg</span></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-blue-100">
              <IconTarget className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-2 leading-snug">
            Modifikasi medis dari <strong className="text-slate-700">Formula Broca (1871)</strong>.
          </p>
        </div>
        
      </div>

      {/* ======================================= */}
      {/* MAIN CONTENT SPLIT */}
      {/* ======================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start mt-2">
        
        {/* ================= KOLOM KIRI (7 Col) ================= */}
        <div className="xl:col-span-7 space-y-6 md:space-y-8 min-w-0 animate-fade-up delay-200">
          
          {/* INFORMASI DASAR */}
          <div className="bg-white rounded-[2rem] p-2 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between p-4 px-6 mb-2 border-b border-slate-50">
              <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Informasi Dasar</h3>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-4 py-3.5 px-6 hover:bg-slate-50 transition-colors cursor-default group">
                <div className="w-10 h-10 rounded-[12px] bg-emerald-50 flex items-center justify-center text-[#1EAB57] shrink-0 border border-emerald-100/50">
                  <IconUser className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-400 mb-0.5">Nama & Email</p>
                  <p className="text-sm font-black text-slate-800">{userData.name} <span className="text-slate-400 font-medium ml-1">({userData.email})</span></p>
                </div>
              </div>
              <div className="mx-6 h-px bg-slate-100"></div>
              <div className="flex items-center gap-4 py-3.5 px-6 hover:bg-slate-50 transition-colors cursor-default group">
                <div className="w-10 h-10 rounded-[12px] bg-emerald-50 flex items-center justify-center text-[#1EAB57] shrink-0 border border-emerald-100/50">
                  <IconGender className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-400 mb-0.5">Jenis Kelamin & Tinggi</p>
                  <p className="text-sm font-black text-slate-800 capitalize">{userData.gender} • {userData.height} cm</p>
                </div>
              </div>
              <div className="mx-6 h-px bg-slate-100"></div>
              <div className="flex items-center gap-4 py-3.5 px-6 hover:bg-slate-50 transition-colors cursor-default group">
                <div className="w-10 h-10 rounded-[12px] bg-emerald-50 flex items-center justify-center text-[#1EAB57] shrink-0 border border-emerald-100/50">
                  <IconCake className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-400 mb-0.5">Tanggal Lahir</p>
                  <p className="text-sm font-black text-slate-800">{userData.birthDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* KESEHATAN, ALERGI & MEDIS */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100/50">
                <IconStethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Kesehatan & Medis</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100/80 hover:bg-white transition-colors cursor-default">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><IconClose className="w-3.5 h-3.5"/> Alergi & Pantangan</p>
                <div className="flex gap-2 flex-wrap">
                  {userData.allergies.length > 0 ? renderTags(userData.allergies, true) : null}
                  {userData.dislikedFoods && userData.dislikedFoods !== "Tidak Ada" ? renderTags(userData.dislikedFoods, true) : null}
                  {userData.allergies.length === 0 && (!userData.dislikedFoods || userData.dislikedFoods === "Tidak Ada") && <span className="text-[11px] font-bold text-slate-500">Tidak Ada Pantangan</span>}
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/80 hover:bg-white transition-colors cursor-default">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><IconInfo className="w-3.5 h-3.5"/> Riwayat Penyakit</p>
                <div className="flex gap-2 flex-wrap">
                  {renderTags(userData.medicalHistory, false)}
                </div>
              </div>
            </div>
          </div>

          {/* AKTIVITAS & OLAHRAGA */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100/50">
                <IconActivity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Gaya Hidup & Olahraga</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0"><IconActivity className="w-5 h-5"/></div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Aktivitas Harian</p>
                  <p className="text-sm font-black text-slate-800">{userData.activity}</p>
                </div>
              </div>
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0"><IconDumbbell className="w-5 h-5"/></div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Olahraga</p>
                  <p className="text-sm font-black text-slate-800">{userData.exercise}</p>
                </div>
              </div>
            </div>
          </div>

          {/* PROFIL DAPUR */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100/50">
                <IconChefHat className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Fasilitas Dapur</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 relative z-20">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill Memasak</p>
                  <div className="group/tt relative cursor-help flex items-center">
                    <IconInfo className="w-3.5 h-3.5 text-slate-400 hover:text-orange-500 transition-colors" />
                    <div className="absolute left-0 top-[130%] hidden group-hover/tt:block w-[220px] bg-[#0F172A] text-white text-[10px] p-3.5 rounded-xl shadow-xl z-[100] border border-slate-700 font-medium leading-relaxed">
                      <b className="text-orange-400">Pemula</b>: Bisa masak telur & mie.<br/>
                      <b className="text-orange-400">Menengah</b>: Bisa ikuti resep standar.<br/>
                      <b className="text-orange-400">Mahir</b>: Bisa racik bumbu & teknik kompleks.
                    </div>
                  </div>
                </div>
                <p className="text-sm font-black text-slate-800 flex items-center gap-2"><IconChefHat className="w-4 h-4 text-orange-400"/> {userData.cookingSkill}</p>
              </div>
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Peralatan Tersedia</p>
                <div className="flex gap-2 flex-wrap">
                  {renderTags(userData.kitchenEquipments)}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= KOLOM KANAN (5 Col) ================= */}
        <div className="xl:col-span-5 relative min-w-0 z-0 animate-fade-up delay-300">
          <div className="sticky top-8 space-y-6 md:space-y-8">
            
            {/* ======================================= */}
            {/* DISTRIBUSI MAKRO GIZI CARD */}
            {/* ======================================= */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-visible z-[50]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1EAB57] flex items-center justify-center border border-emerald-100/50">
                    <IconPieChart className="w-5 h-5 drop-shadow-sm" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Distribusi Makro</h3>
                </div>
                
                {/* Tooltip Info Makro */}
                <div className="group relative cursor-help flex items-center justify-center p-2">
                  <IconInfo className="w-5 h-5 text-slate-400 hover:text-[#1EAB57] transition-colors" />
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-[240px] bg-slate-900 text-white text-[10px] p-4 rounded-xl shadow-2xl z-50 border border-slate-700 font-medium leading-relaxed">
                    Makronutrisi adalah penyumbang kalori utama: 
                    <br/><br/>
                    <b className="text-blue-400">Protein</b>: Membangun & menjaga otot.<br/>
                    <b className="text-[#34D399]">Karbohidrat</b>: Sumber energi tubuh.<br/>
                    <b className="text-rose-400">Lemak</b>: Menjaga kesehatan hormon.
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Visual Bar Makro Tanpa Jarak */}
                <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden shadow-inner border border-slate-200/50">
                   <div className="h-full bg-blue-500 transition-all duration-1000" style={{width: `${(displayPro / (displayPro+displayCar+displayFat))*100}%`}}></div>
                   <div className="h-full bg-[#1EAB57] transition-all duration-1000" style={{width: `${(displayCar / (displayPro+displayCar+displayFat))*100}%`}}></div>
                   <div className="h-full bg-rose-500 transition-all duration-1000" style={{width: `${(displayFat / (displayPro+displayCar+displayFat))*100}%`}}></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 text-center flex flex-col justify-center transition-colors hover:bg-white hover:shadow-[0_5px_15px_rgba(0,0,0,0.03)] cursor-default">
                    <div className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1.5 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span> PROTEIN
                    </div>
                    <div className="text-2xl font-black text-slate-800 flex items-baseline justify-center gap-0.5">{displayPro}<span className="text-[10px] text-slate-400 font-bold ml-0.5">g</span></div>
                  </div>
                  
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 text-center flex flex-col justify-center transition-colors hover:bg-white hover:shadow-[0_5px_15px_rgba(0,0,0,0.03)] cursor-default">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#1EAB57] mb-1.5 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1EAB57] shadow-[0_0_5px_rgba(30,171,87,0.5)]"></span> KARBO
                    </div>
                    <div className="text-2xl font-black text-slate-800 flex items-baseline justify-center gap-0.5">{displayCar}<span className="text-[10px] text-slate-400 font-bold ml-0.5">g</span></div>
                  </div>
                  
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 text-center flex flex-col justify-center transition-colors hover:bg-white hover:shadow-[0_5px_15px_rgba(0,0,0,0.03)] cursor-default">
                    <div className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1.5 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span> LEMAK
                    </div>
                    <div className="text-2xl font-black text-slate-800 flex items-baseline justify-center gap-0.5">{displayFat}<span className="text-[10px] text-slate-400 font-bold ml-0.5">g</span></div>
                  </div>
                </div>

                {/* Notifikasi Ilmiah AI (Science-Backed) */}
                <div className="flex items-start gap-3.5 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center text-[#1EAB57] shrink-0 border border-emerald-200/50 mt-0.5">
                     <IconCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Akurasi Klinis</p>
                     <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                       Kalkulasi ini menggunakan formula <strong>Mifflin-St Jeor</strong> yang direkomendasikan oleh WHO untuk akurasi metabolisme terbaik.
                     </p>
                  </div>
                </div>

              </div>
            </div>

            {/* PREFERENSI DIET & MENU */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1EAB57] flex items-center justify-center border border-emerald-100/50">
                  <IconCutlery className="w-5 h-5 drop-shadow-sm" />
                </div>
                <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Diet & Pola Makan</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Tipe Diet Terpilih</p>
                  <div className="flex gap-2 flex-wrap">
                     {userData.dietTypes.length > 0 
                       ? renderTags(userData.dietTypes) 
                       : <span className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-50 border border-emerald-100 text-[#1EAB57]">Normal / Bebas</span>
                     }
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 flex flex-col justify-center items-center text-center">
                    <IconClock className="w-5 h-5 text-[#1EAB57] mb-2"/>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Frekuensi</p>
                    <p className="text-xs font-black text-slate-800">{userData.mealsPerDay.split("(")[0]}</p>
                  </div>
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 flex flex-col justify-center items-center text-center">
                    <IconDroplet className="w-5 h-5 text-blue-400 mb-2"/>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Air</p>
                    <p className="text-xs font-black text-slate-800">{userData.waterIntake}</p>
                  </div>
                </div>
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><IconHeart className="w-3.5 h-3.5 text-rose-400"/> Menu Favorit</p>
                  <p className="text-xs font-black text-slate-800 leading-relaxed">{userData.favoriteFoods}</p>
                </div>
              </div>
            </div>

            {/* FAMILY SECTION */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100/50">
                    <IconUsers className="w-5 h-5 drop-shadow-sm" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Keluarga</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded border border-slate-100">{familyMembers.length + 1} Orang</span>
              </div>

              <p className="text-[11px] font-bold text-slate-500 mb-6 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100/50">
                Pantau asupan kalori dan alergi istri, anak, atau orang tua dalam satu akun GIZIFY.
              </p>

              <div className="space-y-3.5 flex-1 relative">
                <div className="flex items-center justify-between p-3 md:p-4 rounded-[1.25rem] bg-gradient-to-r from-[#F0FDF4] to-[#E8F8EE] border border-emerald-200/50 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-white/40 rounded-full blur-[20px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                  <div className="flex items-center gap-3.5 relative z-10">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-[#1A453A] text-white font-black text-lg">
                      {userData.photoURL ? <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" /> : getInitials(userData.name)}
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

                {familyMembers.map((member, index) => (
                  <div key={index} onClick={handleFamilyAction} className="flex items-center justify-between p-3 md:p-4 rounded-[1.25rem] bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group hover:-translate-y-0.5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-[#1EAB57] transition-colors">{member.name}</h4>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide">{member.role} • {member.cal}</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold text-slate-500 bg-white px-3.5 py-2 rounded-lg border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors shadow-sm">
                      {userData.role === "FAMILY" ? "Beralih" : <IconLock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}

                <button onClick={handleFamilyAction} className="w-full flex items-center justify-center gap-2 p-4 rounded-[1.25rem] border-2 border-dashed border-slate-200 text-slate-500 hover:text-[#1EAB57] hover:border-[#1EAB57]/50 hover:bg-[#F0FDF4] transition-all cursor-pointer group mt-4 active:scale-95">
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#1EAB57] group-hover:text-white flex items-center justify-center transition-colors shadow-inner">
                    {userData.role === "FAMILY" ? <IconPlus className="w-3.5 h-3.5" /> : <IconLock className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">Tambah Anggota</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// KUMPULAN SVG ICONS LENGKAP
// ==========================================
const IconChevronDown = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconChevronLeft = ({ className, onClick }: any) => <svg onClick={onClick} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRight = ({ className, onClick }: any) => <svg onClick={onClick} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconUser = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconMail = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const IconGender = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M14 23v-8h-4v8"></path><path d="M8 9h4c1.1 0 2 .9 2 2v4"></path><path d="M21 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M21 16v7"></path><path d="M18 10h6v6h-6z"></path></svg>;
const IconCake = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"></path><path d="M2 21h20"></path><path d="M7 8v2"></path><path d="M12 8v2"></path><path d="M17 8v2"></path><path d="M7 4h.01"></path><path d="M12 4h.01"></path><path d="M17 4h.01"></path></svg>;
const IconMapPin = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconActivity = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const IconSparkles = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconTarget = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const IconCheck = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconInfo = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const IconSave = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IconDumbbell = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4l-4.8-4.8"></path><path d="M18.6 18.6l-3-3"></path><path d="M5.4 5.4l-3-3"></path><path d="M6.8 3.2l-3.6 3.6"></path><path d="M20.8 17.2l-3.6 3.6"></path><path d="M2 16v6h6"></path><path d="M22 8V2h-6"></path></svg>;
const IconCutlery = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
const IconStethoscope = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"></path><path d="M8 2v4"></path><path d="M16 2v4"></path><circle cx="16" cy="16" r="3"></circle><path d="M18.1 18.1L22 22"></path></svg>;
const IconHeart = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const IconClose = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconCamera = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>;
const IconVerify = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconEdit = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconScale = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"></path><path d="M12 2v20"></path><rect x="4" y="8" width="16" height="8" rx="2"></rect></svg>;
const IconPieChart = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const IconDroplet = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>;
const IconChefHat = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path><line x1="6" y1="17" x2="18" y2="17"></line></svg>;
const IconMicrowave = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><line x1="18" y1="10" x2="18" y2="10"></line><line x1="18" y1="14" x2="18" y2="14"></line><line x1="6" y1="12" x2="14" y2="12"></line></svg>;
const IconBot = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconClock = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconUsers = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconLock = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconPlus = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;