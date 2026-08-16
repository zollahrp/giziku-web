// Path: src/app/(dashboard)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // STATE DATA USER (DINAMIS DARI FIRESTORE)
  const [userName, setUserName] = useState("Memuat...");
  const [userRole, setUserRole] = useState("BASIC");
  const [photoURL, setPhotoURL] = useState("");

  // STATE UNTUK ANIMASI PAGE TRANSITION
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  useEffect(() => {
    // Animasi transisi halaman setiap kali pathname berubah
    setIsPageTransitioning(true);
    const timer = setTimeout(() => {
      setIsPageTransitioning(false);
    }, 300); // Durasi animasi

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    // Listener untuk notifikasi koneksi internet (Offline/Online)
    const handleOffline = () => {
      Swal.fire({
        title: "Koneksi Terputus!",
        text: "GiziBot tidak dapat terhubung ke server. Periksa koneksi internet kamu.",
        icon: "warning",
        confirmButtonColor: "#1EAB57",
        toast: true,
        position: 'top-end',
        timer: 5000,
        showConfirmButton: false
      });
    };

    const handleOnline = () => {
      Swal.fire({
        title: "Kembali Online!",
        text: "Koneksi internet sudah kembali stabil.",
        icon: "success",
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Patch console.error untuk mendeteksi error Firestore
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const msg = args.join(' ');
      if (typeof msg === 'string' && msg.includes("Could not reach Cloud Firestore backend")) {
        Swal.fire({
          title: "Koneksi Database Terputus",
          text: "GiziBot berjalan dalam mode offline. Pastikan internet Anda stabil.",
          icon: "warning",
          toast: true,
          position: 'top-end',
          timer: 5000,
          showConfirmButton: false
        });
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      console.error = originalConsoleError;
    };
  }, []);

  useEffect(() => {
    // Dengarkan perubahan status login dari Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // TARIK DATA DARI FIRESTORE (Biar yang daftar pake Email namanya tetep muncul)
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserName(data.name || user.displayName || "User Gizify");
            setUserRole(data.role || "BASIC");
            setPhotoURL(data.photoURL || user.photoURL || "");
          } else {
            setUserName(user.displayName || "User Gizify");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // JIKA FIREBASE KOSONG TAPI USER BISA MASUK SINI (COOKIE NYANGKUT)
        // Hancurkan Cookie dan paksa ke halaman Login!
        document.cookie = "gizify_session=; path=/; max-age=0; Secure; SameSite=Strict";
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // --- STRUKTUR MENU GIZIFY ---
  const menuGroups = [
    {
      title: "DASHBOARD",
      items: [
        { name: "Ringkasan Harian", icon: IconHome, path: "/home" },
        { name: "Katalog Resep", icon: IconBook, path: "/resep" },
        { name: "Peta Belanja Bahan", icon: IconMap, path: "/maps" }, 
      ]
    },
    {
      title: "KECERDASAN BUATAN",
      items: [
        { name: "Scan Makanan", icon: IconScan, path: "/scanner" },
        { name: "Tanya GiziBot", icon: IconBot, path: "/chatbot" },
        { name: "Rencana Menu Budget", icon: IconWallet, path: "/meal-plan" },
      ]
    },
    {
      title: "PENGATURAN",
      items: [
        { name: "Profil Saya", icon: IconUser, path: "/profile" },
      ]
    }
  ];

  // FUNGSI LOGOUT YANG SAKTI
  const handleLogout = async () => {
    try {
      // 1. Putuskan dari Firebase
      await signOut(auth);
      
      // 2. Hancurkan KEDUA Cookie (Biar sisa bug yang lama juga ikut hilang!)
      document.cookie = "gizify_session=; path=/; max-age=0; Secure; SameSite=Strict";
      document.cookie = "giziku_session=; path=/; max-age=0; Secure; SameSite=Strict";
      
      // 3. Lempar ke Login
      router.push("/login");
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  const getInitials = (name: string) => {
    if (!name || name === "Memuat...") return "G";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* ======================================= */}
      {/* SIDEBAR DESKTOP (FLOATING PREMIUM) */}
      {/* ======================================= */}
      <aside className="hidden lg:flex w-[280px] bg-white/70 backdrop-blur-3xl border border-white flex-col fixed left-5 top-5 bottom-5 z-40 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(26,69,58,0.12)] overflow-hidden transition-all duration-500 ease-out group/sidebar hover:shadow-[0_20px_60px_-10px_rgba(26,69,58,0.2)] hover:bg-white/80">
        
        {/* Ornamen Grafis Background Sidebar */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none z-0 transition-opacity duration-700 opacity-50 group-hover/sidebar:opacity-100" />
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-emerald-400/20 blur-[50px] rounded-full pointer-events-none z-0 transition-transform duration-1000 group-hover/sidebar:scale-150" />
        <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-teal-400/10 blur-[50px] rounded-full pointer-events-none z-0 transition-transform duration-1000 group-hover/sidebar:scale-125" />

        {/* Header - LOGO GIZIFY */}
        <div className="pt-8 pb-4 px-8 flex flex-col gap-2 relative z-10">
          <Link href="/home" className="flex items-center gap-2 group w-fit cursor-pointer hover:scale-105 transition-transform duration-500 origin-left">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1A453A] to-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-[0_8px_15px_rgba(26,69,58,0.3)] transition-all duration-500 group-hover:rotate-12 group-hover:shadow-[0_12px_20px_rgba(26,69,58,0.4)] group-hover:rounded-xl">
              G
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800 transition-colors duration-300">
              GIZIFY<span className="text-emerald-500">.AI</span>
            </span>
          </Link>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] pl-1.5 mt-1 transition-colors duration-300 group-hover/sidebar:text-emerald-600/80">
            Nutrition Assistant
          </p>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 px-4 py-2 space-y-7 overflow-y-auto relative z-10 custom-scroll-sidebar mt-4">
          
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2 relative">
              <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                {group.title}
                <div className="h-px flex-1 bg-slate-200/50"></div>
              </h3>
              
              {group.items.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);

                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`group relative overflow-hidden flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ease-out cursor-pointer ${
                      isActive 
                        ? "bg-gradient-to-r from-[#1A453A] to-emerald-900 text-white shadow-[0_10px_20px_-5px_rgba(26,69,58,0.4)] translate-x-1" 
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 hover:translate-x-1 active:scale-95"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite]" />
                    )}

                    <div className={`p-1.5 rounded-xl transition-colors duration-300 ${isActive ? 'bg-white/10' : 'bg-transparent group-hover:bg-white'}`}>
                      <item.icon 
                        className={`w-5 h-5 transition-transform duration-500 relative z-10 ${
                          isActive ? 'text-emerald-300 scale-110' : 'text-slate-400 group-hover:text-emerald-600 group-hover:scale-110'
                        }`} 
                      />
                    </div>
                    <span className={`text-[13.5px] relative z-10 tracking-wide transition-all duration-300 ${isActive ? 'font-black' : 'font-semibold'}`}>
                      {item.name}
                    </span>
                    
                    {/* HILANGKAN TITIK HIJAU SAAT MENU SCAN MAKANAN AKTIF */}
                    {item.name === "Scan Makanan" && !isActive && (
                      <span className="absolute right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

        </nav>

        {/* Footer Area - Profil & Logout */}
        <div className="p-4 relative z-10 mt-auto bg-gradient-to-t from-white/90 via-white/80 to-transparent backdrop-blur-sm">
          <div className="bg-white border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.04)] rounded-[1.5rem] p-2 flex flex-col gap-1 transition-transform duration-300 hover:shadow-[0_12px_25px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
            
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white text-lg shadow-md border-2 border-white overflow-hidden transition-transform duration-300 hover:scale-105">
                {photoURL ? (
                  <img src={photoURL} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  getInitials(userName)
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-extrabold text-slate-800 truncate leading-tight">{userName.split(' ')[0]}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">{userRole} Member</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300 ease-out font-bold text-sm active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <IconLogout className="w-4 h-4 transition-transform group-hover:-translate-x-1 relative z-10" />
              <span className="relative z-10">Keluar Akun</span>
            </button>
            
          </div>
        </div>
      </aside>

      {/* ======================================= */}
      {/* AREA KONTEN UTAMA (Desktop & Mobile) */}
      {/* ======================================= */}
      <main className="flex-1 flex flex-col h-screen w-full overflow-hidden relative lg:pl-[320px] transition-all duration-300">
        
        {/* Header Mobile (Hanya muncul di layar kecil) */}
        <header className="lg:hidden flex items-center justify-between bg-white/80 backdrop-blur-xl px-5 py-4 border-b border-slate-100 z-30 sticky top-0 shadow-sm">
          <Link href="/home" className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1A453A] to-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-md">
              G
            </div>
            <span className="text-lg font-black tracking-tight text-slate-800">
              GIZIFY<span className="text-emerald-500">.AI</span>
            </span>
          </Link>
          <div 
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer overflow-hidden border-2 border-white active:scale-95 transition-transform" 
            onClick={handleLogout}
            title="Klik untuk Keluar"
          >
            {photoURL ? (
              <img src={photoURL} alt={userName} className="w-full h-full object-cover" />
            ) : (
              getInitials(userName)
            )}
          </div>
        </header>

        {/* Konten Scrollable dengan Transisi */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 lg:pr-10 pb-28 lg:pb-10 custom-scroll relative z-0 transition-opacity duration-300 ease-in-out ${isPageTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </div>

        {/* NAVIGASI BAWAH (Hanya Mobile) - FIX 7 MENU */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-100 px-1.5 sm:px-4 py-2 pb-safe shadow-[0_-15px_40px_rgba(0,0,0,0.06)]">
          <div className="flex justify-between items-center relative max-w-md mx-auto">
            {/* Kiri (3 Menu) */}
            <Link href="/home" className={`flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] transition-all duration-300 ${pathname === "/home" ? "text-emerald-600 bg-emerald-50 scale-110 shadow-sm" : "text-slate-400 hover:text-emerald-500 hover:bg-slate-50"}`}>
              <IconHome className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            </Link>
            <Link href="/resep" className={`flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] transition-all duration-300 ${pathname === "/resep" ? "text-emerald-600 bg-emerald-50 scale-110 shadow-sm" : "text-slate-400 hover:text-emerald-500 hover:bg-slate-50"}`}>
              <IconBook className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            </Link>
            <Link href="/maps" className={`flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] transition-all duration-300 ${pathname === "/maps" ? "text-emerald-600 bg-emerald-50 scale-110 shadow-sm" : "text-slate-400 hover:text-emerald-500 hover:bg-slate-50"}`}>
              <IconMap className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            </Link>
            
            {/* Tombol Scanner Melayang Tengah (Sedikit dikecilin dikit biar 7 menu muat) */}
            <div className="relative -top-6 px-1 shrink-0">
              <Link href="/scanner" className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#1EAB57] to-[#0d5929] text-white shadow-[0_12px_30px_rgba(30,171,87,0.45)] hover:shadow-[0_15px_35px_rgba(30,171,87,0.6)] hover:scale-105 transition-all duration-300 cursor-pointer border-[4px] border-white active:scale-95">
                <IconScan className="w-6 h-6 sm:w-7 sm:h-7 animate-[pulse_2s_infinite]" />
              </Link>
            </div>
            
            {/* Kanan (3 Menu) */}
            <Link href="/chatbot" className={`flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] transition-all duration-300 ${pathname === "/chatbot" ? "text-emerald-600 bg-emerald-50 scale-110 shadow-sm" : "text-slate-400 hover:text-emerald-500 hover:bg-slate-50"}`}>
              <IconBot className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            </Link>
            <Link href="/meal-plan" className={`flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] transition-all duration-300 ${pathname === "/meal-plan" ? "text-emerald-600 bg-emerald-50 scale-110 shadow-sm" : "text-slate-400 hover:text-emerald-500 hover:bg-slate-50"}`}>
              <IconWallet className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            </Link>
            <Link href="/profile" className={`flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] transition-all duration-300 ${pathname === "/profile" ? "text-emerald-600 bg-emerald-50 scale-110 shadow-sm" : "text-slate-400 hover:text-emerald-500 hover:bg-slate-50"}`}>
              <IconUser className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            </Link>
          </div>
        </nav>
        
      </main>

      {/* Global Style untuk Custom Scrollbar & Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            100% { transform: translateX(150%); }
          }
          .custom-scroll::-webkit-scrollbar { width: 6px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          .pb-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 8px); }
          .custom-scroll-sidebar::-webkit-scrollbar { width: 4px; }
          .custom-scroll-sidebar::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll-sidebar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
          .custom-scroll-sidebar:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }
        `
      }} />
    </div>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconHome = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconBot = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconScan = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 7 3 3 7 3"></polyline><polyline points="17 3 21 3 21 7"></polyline><polyline points="21 17 21 21 17 21"></polyline><polyline points="7 21 3 21 3 17"></polyline></svg>;
const IconBook = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const IconWallet = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const IconUser = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconLogout = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IconMap = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>;