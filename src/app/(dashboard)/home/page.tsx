// Path: src/app/(dashboard)/home/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Harian");
  const [showDetailNutrisi, setShowDetailNutrisi] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // STATE DATA USER DARI FIREBASE
  const [userData, setUserData] = useState({
    name: "",
    role: "BASIC",
    photoURL: "",
    calories: "0",
    bmiStatus: "-",
    idealWeight: "0",
    bodyGoal: "-",
    dislikedFoods: "Tidak Ada",
  });

  // STATE DATA MAKANAN & JADWAL (Bisa dikembangkan jadi dinamis nanti)
  const [scanHistory, setScanHistory] = useState<any[]>([]); // Default kosong buat ngetes Empty State
  const [mealSchedule, setMealSchedule] = useState<any[]>([]); // Default kosong
  const [todayTotals, setTodayTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  // STATE KALENDER
  const [calendarInfo, setCalendarInfo] = useState({
    monthName: "",
    year: 2026,
    emptyDays: [] as number[],
    daysArray: [] as number[],
    currentDay: 1
  });

  useEffect(() => {
    // 1. SETUP KALENDER REAL-TIME
    const today = new Date();
    const calYear = today.getFullYear();
    const calMonth = today.getMonth();
    const currentDay = today.getDate();

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    // JS Date: 0 = Minggu, 1 = Senin. Kita ubah jadi 0 = Senin biar sesuai UI
    let firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
    let startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    setCalendarInfo({
      monthName: monthNames[calMonth],
      year: calYear,
      emptyDays: Array.from({ length: startDay }, (_, i) => i),
      daysArray: Array.from({ length: daysInMonth }, (_, i) => i + 1),
      currentDay: currentDay
    });

    // 2. TARIK DATA FIREBASE
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserData({
              name: data.name || user.displayName || "User Gizify",
              role: data.role || "BASIC",
              photoURL: data.photoURL || user.photoURL || "",
              calories: data.calories || "2000",
              bmiStatus: data.bmiStatus || "Normal",
              idealWeight: data.idealWeight || "-",
              bodyGoal: data.bodyGoal || "Menjaga Berat Badan",
              dislikedFoods: data.dislikedFoods || "Tidak Ada",
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }

        try {
          // AMBIL DATA FOOD LOGS MINGGU INI
          const curr = new Date();
          const currentDayOfWeek = curr.getDay(); // 0 (Sun) to 6 (Sat)
          const diff = curr.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1);
          const firstDayOfWeek = new Date(curr);
          firstDayOfWeek.setDate(diff);
          firstDayOfWeek.setHours(0, 0, 0, 0);

          const qWeek = query(
            collection(db, "users", user.uid, "foodLogs"),
            where("scannedAt", ">=", firstDayOfWeek)
          );
          const snaps = await getDocs(qWeek);

          let weekTotals = [0, 0, 0, 0, 0, 0, 0]; // 0: Sen, 6: Min
          let calsToday = 0, pro = 0, car = 0, fat = 0;
          const todayNow = new Date();
          todayNow.setHours(0, 0, 0, 0);

          snaps.forEach(d => {
            const data = d.data();
            const dateStr = data.scannedAt?.toDate?.() || new Date();

            let dayIdx = dateStr.getDay() === 0 ? 6 : dateStr.getDay() - 1;
            weekTotals[dayIdx] += (data.calories || 0);

            if (dateStr >= todayNow) {
              calsToday += data.calories || 0;
              pro += data.protein || 0;
              car += data.carbs || 0;
              fat += data.fat || 0;
            }
          });
          setWeeklyData(weekTotals);
          setTodayTotals({ calories: calsToday, protein: pro, carbs: car, fat: fat });

          // AMBIL RIWAYAT TERAKHIR
          const qHistory = query(
            collection(db, "users", user.uid, "foodLogs"),
            orderBy("scannedAt", "desc"),
            limit(5)
          );
          const histSnaps = await getDocs(qHistory);
          const logs: any[] = [];
          histSnaps.forEach(d => logs.push({ id: d.id, ...d.data() }));
          setScanHistory(logs);
        } catch (error) {
          console.error("Error fetching food logs:", error);
        } finally {
          setIsLoaded(true);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const getInitials = (name: string) => {
    if (!name) return "G";
    return name.charAt(0).toUpperCase();
  };

  // KALKULATOR TARGET MAKRO OTOMATIS BERDASARKAN KALORI
  const targetCals = parseInt(userData.calories) || 2000;
  const targetProtein = Math.round((targetCals * 0.3) / 4); // 30% dari kalori
  const targetCarbs = Math.round((targetCals * 0.4) / 4); // 40% dari kalori
  const targetFat = Math.round((targetCals * 0.3) / 9); // 30% dari kalori

  // =======================================
  // UI SKELETON LOADER
  // =======================================
  if (!isLoaded) {
    return (
      <div className="w-full pb-12 flex flex-col gap-6 relative overflow-x-hidden animate-in fade-in duration-500 min-w-0">
        <div className="w-full h-16 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse"></div>
        <div className="w-full h-48 bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-pulse"></div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse"></div>)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8 space-y-6">
            <div className="h-32 bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-pulse"></div>
            <div className="h-64 bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-pulse"></div>
          </div>
          <div className="xl:col-span-4 space-y-6">
            <div className="h-48 bg-emerald-100/50 rounded-[2rem] shadow-sm animate-pulse"></div>
            <div className="h-64 bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full pb-12 flex flex-col xl:flex-row gap-6 relative overflow-x-hidden">

      {/* INJEKSI CSS ANIMASI KUSTOM */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(30px); animation: fadeUpAnim 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; } .delay-300 { animation-delay: 0.3s; }
          @keyframes spin-slow { 100% { transform: rotate(360deg); } }
          .animate-spin-slow { animation: spin-slow 8s linear infinite; }
          .hover-float:hover { transform: translateY(-4px); box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.08); }
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
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
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Pantauan Mikro & Makro Gizi (Hari Ini)</p>
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
                      <span className="text-[11px] font-black text-slate-900">0mg <span className="text-slate-400">/ 90mg</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full group-hover:bg-orange-500 transition-colors" style={{ width: '0%' }}></div>
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-slate-700">Serat Pangan</span>
                      <span className="text-[11px] font-black text-[#1EAB57]">0g <span className="text-slate-400">/ 30g</span></span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1EAB57] rounded-full group-hover:bg-[#168E46] transition-colors" style={{ width: '0%' }}></div>
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
                  <p className="text-[11px] font-medium text-indigo-700 leading-relaxed">
                    {todayTotals.calories === 0
                      ? "Belum ada makanan yang dicatat hari ini. Mulai dengan sarapan bergizi untuk mengisi kebutuhan energimu!"
                      : "Gizi makro dan mikro sedang dihitung. Pertahankan asupan makanan sehat!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* BAGIAN KIRI & TENGAH (MAIN ANALYTICS) */}
      {/* ======================================= */}
      <div className="flex-1 space-y-6 min-w-0">

        {/* TOP NAVBAR */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative z-10 animate-fade-up`}>
          <div className="relative w-full md:max-w-xs xl:max-w-md group">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input type="text" placeholder="Cari menu, resep..." className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all" />
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
            <button className="relative w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors hover:text-emerald-500 active:scale-95 cursor-pointer">
              <IconBell className="w-5 h-5" />
            </button>
            <Link href="/profile" className="flex items-center gap-3 pl-4 border-l border-slate-100 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none group-hover:text-emerald-600 transition-colors">{userData.name.split(" ")[0] || "User"}</p>
                <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">{userData.role} Member</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 group-hover:border-emerald-500 transition-colors shadow-sm shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-[#1A453A] text-white font-black text-lg">
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  getInitials(userData.name)
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* HERO BANNER & AI CHART */}
        <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500 animate-fade-up delay-100`}>
          <div className="p-6 md:p-8 bg-gradient-to-r from-[#F0FDF4] to-[#E8F8EE] border-b border-emerald-100/50 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4 animate-pulse"></div>

            <div className="flex gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1EAB57] to-[#127236] text-white flex items-center justify-center shadow-[0_5px_15px_rgba(30,171,87,0.3)] shrink-0 transform transition-transform hover:rotate-12">
                <IconSparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">
                  Halo {userData.name.split(" ")[0]}, ini ringkasan hari ini!
                </h2>
                <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-2xl">
                  Target <strong className="text-slate-900">{userData.bodyGoal}</strong> mu membutuhkan <strong className="text-slate-900">{userData.calories} Kkal</strong> harian. {todayTotals.calories === 0 ? "Kamu belum mencatat makanan hari ini. Ayo scan makananmu sekarang!" : `Kamu sudah mengonsumsi ${todayTotals.calories} Kkal hari ini.`}
                </p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-1 rounded-xl flex items-center border border-white/80 shadow-sm relative z-10 shrink-0">
              {['Harian', 'Mingguan', 'Bulanan'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${activeTab === tab
                      ? 'bg-white text-[#1EAB57] shadow-sm transform scale-105'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 relative">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Tren Konsumsi Kalori</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">{activeTab} vs Target Harian</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><span className="w-3 h-1 bg-[#1EAB57] rounded-full"></span><span className="text-[10px] font-bold text-slate-500 uppercase hidden sm:block">Aktual</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-1 bg-red-400 rounded-full border border-dashed border-white"></span><span className="text-[10px] font-bold text-slate-500 uppercase hidden sm:block">Batas</span></div>
              </div>
            </div>

            <div className="w-full h-[220px] relative group">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-bold text-slate-400 pb-6 transition-opacity">
                <span>3000</span>
                <span className="text-red-500 font-black">{userData.calories}</span>
                <span>1000</span>
                <span>0</span>
              </div>

              <div className="ml-8 md:ml-10 h-full relative">
                <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <line x1="0" y1="20" x2="800" y2="20" stroke="#F1F5F9" strokeWidth="1" className="transition-all duration-500 group-hover:stroke-slate-200" />
                  <line x1="0" y1="95" x2="800" y2="95" stroke="#F1F5F9" strokeWidth="1" className="transition-all duration-500 group-hover:stroke-slate-200" />
                  <line x1="0" y1="170" x2="800" y2="170" stroke="#F1F5F9" strokeWidth="1" className="transition-all duration-500 group-hover:stroke-slate-200" />

                  {/* Batas Target Kalori Dinamis */}
                  {(() => {
                    const targetY = 170 - ((parseInt(userData.calories) || 2000) / 3000) * 150;
                    const safeY = Math.max(20, Math.min(170, targetY));
                    return <line x1="0" y1={safeY} x2="800" y2={safeY} stroke="#EF4444" strokeWidth="2" strokeDasharray="6 6" className="opacity-60" />;
                  })()}

                  {/* Garis Aktual (Hijau) */}
                  {(() => {
                    // Cek jika array tidak semuanya 0 (artinya ada data yang bisa di plot)
                    const hasData = weeklyData.some(val => val > 0);
                    if (!hasData) return null;

                    const points = weeklyData.map((val, idx) => {
                      const x = (idx / 6) * 800; // 0 to 800
                      const y = 170 - (val / 3000) * 150;
                      const safeY = Math.max(20, Math.min(170, y));
                      return `${x},${safeY}`;
                    }).join(" ");

                    return (
                      <>
                        <polyline points={points} fill="none" stroke="#1EAB57" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md" />
                        {weeklyData.map((val, idx) => {
                          const x = (idx / 6) * 800;
                          const y = 170 - (val / 3000) * 150;
                          const safeY = Math.max(20, Math.min(170, y));

                          // Lingkaran akan terisi hijau jika ada isinya, atau putih jika itu hari ini tapi belum ada isinya
                          const currentDayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                          const isToday = idx === currentDayIdx;

                          if (val > 0 || isToday) {
                            return (
                              <circle key={idx} cx={x} cy={safeY} r="6" fill={val > 0 ? "#1EAB57" : "#fff"} stroke={val > 0 ? "white" : "#1EAB57"} strokeWidth="2" />
                            );
                          }
                          return null;
                        })}
                      </>
                    )
                  })()}
                </svg>

                {/* Empty State Teks Tengah Chart */}
                {weeklyData.every(val => val === 0) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <IconActivity className="w-8 h-8 text-slate-200 mb-2" />
                    <p className="text-xs font-bold text-slate-400">Belum ada data kalori minggu ini.</p>
                  </div>
                )}

                <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[10px] font-bold text-slate-400 px-1">
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((hari, idx) => {
                    const currentDayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                    return (
                      <span key={hari} className={currentDayIdx === idx ? "text-[#1EAB57] font-black bg-emerald-50 px-2 py-0.5 rounded" : ""}>
                        {hari}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 PILAR METRIK MAKRO */}
        <div className={`grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 animate-fade-up delay-200`}>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover-float transition-all duration-300 group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sisa Kalori</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{Math.max(0, targetCals - todayTotals.calories)}<span className="text-xs font-semibold text-slate-400">kcal</span></h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <IconActivity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${todayTotals.calories > targetCals ? 'bg-rose-500' : 'bg-emerald-500'} rounded-full`} style={{ width: `${Math.min((todayTotals.calories / targetCals) * 100, 100)}%` }}></div>
              </div>
              <p className="text-[10px] font-bold text-slate-400">{todayTotals.calories} / {targetCals} Kkal Terpakai</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover-float transition-all duration-300 group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Protein Harian</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{todayTotals.protein}<span className="text-xs font-semibold text-slate-400">g</span></h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <IconDumbbell className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((todayTotals.protein / targetProtein) * 100, 100)}%` }}></div>
              </div>
              <p className="text-[10px] font-bold text-slate-400">Target: {targetProtein}g</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover-float transition-all duration-300 group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Karbo Harian</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-amber-500 transition-colors">{todayTotals.carbs}<span className="text-xs font-semibold text-slate-400">g</span></h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <IconBread className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((todayTotals.carbs / targetCarbs) * 100, 100)}%` }}></div>
              </div>
              <p className="text-[10px] font-bold text-slate-400">Target: {targetCarbs}g</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover-float transition-all duration-300 group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lemak Harian</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-rose-500 transition-colors">{todayTotals.fat}<span className="text-xs font-semibold text-slate-400">g</span></h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <IconDrop className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min((todayTotals.fat / targetFat) * 100, 100)}%` }}></div>
              </div>
              <p className="text-[10px] font-bold text-slate-400">Target: {targetFat}g</p>
            </div>
          </div>
        </div>

        {/* KONDISI TUBUH & TOMBOL DETAIL NUTRISI */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden hover:shadow-md transition-shadow duration-300 animate-fade-up delay-300">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-100/50 rounded-full blur-[40px] pointer-events-none animate-pulse"></div>

          <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <div className="bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-3 border border-slate-100/50 cursor-pointer text-center md:text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 line-clamp-1">Target Tubuh</p>
              <p className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">{userData.bodyGoal}</p>
            </div>
            <div className="bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-3 border border-slate-100/50 cursor-pointer text-center md:text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 line-clamp-1">BMI Status</p>
              <p className={`text-xs sm:text-sm font-black line-clamp-1 ${userData.bmiStatus === 'Normal' ? 'text-[#1EAB57]' : 'text-amber-500'}`}>{userData.bmiStatus}</p>
            </div>
            <div className="bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-3 border border-slate-100/50 cursor-pointer text-center md:text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 line-clamp-1">Berat Ideal</p>
              <p className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">{userData.idealWeight} Kg</p>
            </div>
            <div className="bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-3 border border-slate-100/50 cursor-pointer text-center md:text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 line-clamp-1">Alergi</p>
              <p className={`text-[11px] font-black mt-1 line-clamp-1 ${userData.dislikedFoods === 'Tidak Ada' ? 'text-slate-600' : 'text-rose-500'}`}>{userData.dislikedFoods}</p>
            </div>
          </div>

          <button
            onClick={() => setShowDetailNutrisi(true)}
            className="w-full lg:w-auto shrink-0 px-6 py-4 bg-[#1A453A] hover:bg-[#13352C] text-white rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-[0_8px_20px_rgba(26,69,58,0.2)] hover:shadow-[0_12px_25px_rgba(26,69,58,0.3)] active:scale-95 group relative z-10"
          >
            <div className="flex flex-col text-left">
              <span className="text-xs font-black uppercase tracking-widest">Detail Nutrisi</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-white/20 transition-all">
              <IconChevronRight className="w-4 h-4 text-emerald-400" />
            </div>
          </button>
        </div>

        {/* RIWAYAT SCAN MAKANAN TERAKHIR (EMPTY STATE HANDLED) */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm transition-all duration-300 animate-fade-up delay-400">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Riwayat Scan AI Terakhir</h3>
            <span className="text-[10px] font-bold text-[#1EAB57] cursor-pointer hover:underline">Lihat Semua</span>
          </div>

          {scanHistory.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                <IconCutlery className="w-6 h-6" />
              </div>
              <p className="text-xs font-black text-slate-600 mb-1">Belum Ada Data</p>
              <p className="text-[10px] font-medium text-slate-400 max-w-[200px] mb-4">Kamu belum scan atau mencatat makanan apapun hari ini.</p>
              <Link href="/scanner" className="px-5 py-2 bg-emerald-50 text-[#1EAB57] text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors">
                Mulai Scan AI
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {scanHistory.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl border border-slate-100 group cursor-pointer">
                  <div className="flex items-center gap-4 mb-2 sm:mb-0">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-emerald-300 transition-colors shrink-0">
                      <IconCutlery className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">{item.type || 'Input Manual'} • {item.mealType || 'Tidak diketahui'}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right pl-16 sm:pl-0">
                    <p className="text-sm font-black text-slate-900">{item.calories} <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kkal</span></p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                      {item.scannedAt?.toDate?.()?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) || "Baru saja"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ======================================= */}
      {/* BAGIAN KANAN (RIGHT SIDEBAR) */}
      {/* ======================================= */}
      <div className="w-full xl:w-[320px] 2xl:w-[360px] flex flex-col gap-6 shrink-0 min-w-0">

        {/* AI RINGKASAN HARIAN WIDGET */}
        <div className="bg-gradient-to-b from-[#1EAB57] to-[#127236] rounded-[2rem] p-6 shadow-[0_15px_30px_rgba(30,171,87,0.3)] text-white relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(30,171,87,0.4)] hover:-translate-y-1 animate-fade-up delay-200">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-[30px] pointer-events-none animate-spin-slow origin-bottom-left"></div>

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
              <IconSparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <h3 className="text-sm font-black tracking-tight drop-shadow-sm">AI Ringkasan Harian</h3>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex gap-3 items-start bg-black/10 p-3.5 rounded-xl border border-white/10 backdrop-blur-md transform transition-transform hover:scale-[1.03] cursor-default">
              <IconActivity className="w-4 h-4 text-emerald-200 shrink-0 mt-0.5 drop-shadow-md animate-[bounce_2s_infinite]" />
              <div>
                <p className="text-[11px] font-bold text-emerald-100 mb-0.5">
                  {todayTotals.calories === 0 ? "Mulai Harimu!" : todayTotals.calories >= targetCals ? "Hebat!" : "Ayo Semangat!"}
                </p>
                <p className="text-[10px] font-medium leading-relaxed text-white/90">
                  {todayTotals.calories === 0 ? "Belum ada kalori yang masuk. Jangan lupa sarapan agar punya energi beraktivitas." :
                    todayTotals.calories >= targetCals ? `Kamu sudah mencapai atau melebih target kalori harianmu (${targetCals} Kkal). Jaga pola makanmu!` :
                      `Kamu sudah mengonsumsi ${todayTotals.calories} Kkal hari ini. Masih ada sisa ${Math.max(0, targetCals - todayTotals.calories)} Kkal lagi.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CALENDAR WIDGET DINAMIS */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-up delay-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900">Kalender</h3>
            <div className="flex items-center gap-2 text-slate-500">
              <IconChevronLeft className="w-4 h-4 cursor-pointer hover:text-slate-900 transition-colors" />
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">{calendarInfo.monthName} {calendarInfo.year}</span>
              <IconChevronRight className="w-4 h-4 cursor-pointer hover:text-slate-900 transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            <span className="text-[10px] font-bold text-slate-400">S</span>
            <span className="text-[10px] font-bold text-slate-400">S</span>
            <span className="text-[10px] font-bold text-slate-400">R</span>
            <span className="text-[10px] font-bold text-slate-400">K</span>
            <span className="text-[10px] font-bold text-slate-400">J</span>
            <span className="text-[10px] font-bold text-slate-400">S</span>
            <span className="text-[10px] font-bold text-slate-400">M</span>
          </div>

          <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center items-center">
            {calendarInfo.emptyDays.map(i => <div key={`e-${i}`}></div>)}
            {calendarInfo.daysArray.map(d => (
              <div
                key={d}
                className={`py-2 w-8 h-8 mx-auto flex items-center justify-center text-xs rounded-full cursor-pointer transition-colors ${d === calendarInfo.currentDay
                    ? "font-black text-white bg-[#1EAB57] shadow-[0_4px_10px_rgba(30,171,87,0.4)] scale-110"
                    : "font-medium text-slate-600 hover:bg-slate-100"
                  }`}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* TIMELINE / TODAY'S SCHEDULE (DUMMY DATA INJECTED FOR PREVIEW) */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300 animate-fade-up delay-400">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-900">Jadwal Makan</h3>
            <Link href="/meal-plan" className="text-[10px] font-bold text-[#1EAB57] uppercase tracking-widest cursor-pointer hover:underline">Atur</Link>
          </div>

          <div className="flex flex-col relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {/* Timeline Item 1 - Selesai */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-[#1EAB57] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-0 md:ml-0 absolute left-0 md:left-1/2 z-10">
                <IconCheckCircle className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 shadow-sm ml-12 md:ml-0 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-[#1EAB57] uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded">07:00</span>
                  <IconDots className="w-4 h-4 text-emerald-400 cursor-pointer hover:text-[#1EAB57]" />
                </div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Oatmeal Buah Naga</h4>
                <p className="text-[11px] font-medium text-slate-500 mb-2">Sarapan • 320 Kkal</p>
              </div>
            </div>

            {/* Timeline Item 2 - Sekarang */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-0 md:ml-0 absolute left-0 md:left-1/2 z-10">
                <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span></span>
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl bg-white border border-blue-100 shadow-[0_8px_30px_rgba(59,130,246,0.12)] ml-12 md:ml-0 flex flex-col relative overflow-hidden group-hover:-translate-y-1 transition-transform">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">12:30</span>
                  <IconDots className="w-4 h-4 text-blue-300 cursor-pointer hover:text-blue-500" />
                </div>
                <h4 className="text-sm font-black text-slate-900 mb-1 relative z-10">Dada Ayam Bakar</h4>
                <p className="text-[11px] font-medium text-slate-500 mb-2 relative z-10">Makan Siang • 550 Kkal</p>
              </div>
            </div>

            {/* Timeline Item 3 - Belum */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-slate-200 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-0 md:ml-0 absolute left-0 md:left-1/2 z-10">
                <IconCutlery className="w-3.5 h-3.5" />
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl bg-white border border-slate-100 shadow-sm ml-12 md:ml-0 flex flex-col group-hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">19:00</span>
                  <IconDots className="w-4 h-4 text-slate-300 cursor-pointer hover:text-slate-500" />
                </div>
                <h4 className="text-sm font-black text-slate-600 mb-1 group-hover:text-slate-900 transition-colors">Salad Tuna Zesty</h4>
                <p className="text-[11px] font-medium text-slate-400 mb-2">Makan Malam • 400 Kkal</p>
              </div>
            </div>
          </div>
        </div>

        {/* REKOMENDASI INSTAN WIDGET (SaaS AI Magic) */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 shadow-[0_15px_30px_rgba(99,102,241,0.25)] text-white relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(99,102,241,0.35)] hover:-translate-y-1 transition-all duration-500 animate-fade-up delay-500">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-[30px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-indigo-300/30 rounded-full blur-[20px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shrink-0">
                <IconSparkles className="w-4 h-4 text-white animate-spin-slow" />
              </div>
              <h3 className="text-sm font-black tracking-tight drop-shadow-sm leading-tight">Bingung Mau<br />Makan Apa?</h3>
            </div>

            <p className="text-[11px] font-medium text-indigo-100/90 leading-relaxed mb-5 drop-shadow-sm">
              Tingkatkan gizimu! GiziBot siap buatkan rekomendasi instan untuk penuhi target <strong className="text-white">{userData.calories} Kkal</strong> hari ini.
            </p>

            <div className="space-y-3">
              <Link href="/chatbot" className="w-full py-3 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 active:scale-95 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex justify-center items-center gap-2 cursor-pointer">
                <IconSparkles className="w-4 h-4" /> Tanya GiziBot
              </Link>
              <Link href="/meal-plan" className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all flex justify-center items-center gap-2 backdrop-blur-sm cursor-pointer">
                <IconCutlery className="w-3.5 h-3.5" /> Atur Rencana Menu
              </Link>
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
const IconSearch = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconBell = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconSparkles = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconChevronRight = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconChevronLeft = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconActivity = ({ className = "w-5 h-5", style }: { className?: string, style?: React.CSSProperties }) => <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const IconCutlery = ({ className = "w-5 h-5", style }: { className?: string, style?: React.CSSProperties }) => <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
const IconCalendar = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconCheckCircle = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconDots = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>;
const IconDumbbell = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4l-4.8-4.8"></path><path d="M18.6 18.6l-3-3"></path><path d="M5.4 5.4l-3-3"></path><path d="M6.8 3.2l-3.6 3.6"></path><path d="M20.8 17.2l-3.6 3.6"></path><path d="M2 16v6h6"></path><path d="M22 8V2h-6"></path></svg>;
const IconBread = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 0-10 10h20a10 10 0 0 0-10-10z"></path><path d="M2 12h20"></path></svg>;
const IconDrop = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>;
const IconClose = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;