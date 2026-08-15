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

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
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
    <div className="flex h-screen w-full bg-[#FAFAFA] overflow-hidden font-sans">
      
      {/* ======================================= */}
      {/* SIDEBAR DESKTOP (FLOATING PREMIUM) */}
      {/* ======================================= */}
      <aside className="hidden lg:flex w-[280px] bg-white/80 backdrop-blur-2xl border border-white/80 flex-col fixed left-5 top-5 bottom-5 z-50 rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(26,69,58,0.1)] overflow-hidden transition-all">
        
        {/* Ornamen Grafis Background Sidebar */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#1A453A]/5 to-transparent pointer-events-none z-0" />
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none z-0" />

        {/* Header - LOGO GIZIFY */}
        <div className="pt-8 pb-4 px-8 flex flex-col gap-2 relative z-10">
          <Link href="/home" className="flex items-center gap-2 group w-fit cursor-pointer hover:scale-105 transition-transform duration-500 origin-left">
            <div className="w-10 h-10 rounded-full bg-[#1A453A] text-white flex items-center justify-center font-black text-xl shadow-[0_8px_15px_rgba(26,69,58,0.3)] transition-transform group-hover:rotate-3">
              G
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              GIZIFY<span className="text-emerald-500">.AI</span>
            </span>
          </Link>
          <p className="text-[9px] font-extrabold text-[#1A453A]/60 uppercase tracking-[0.25em] pl-1 mt-1">
            Nutrition Assistant
          </p>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto relative z-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
          
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1.5">
              <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              
              {group.items.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);

                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`group relative overflow-hidden flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ease-out active:scale-95 cursor-pointer ${
                      isActive 
                        ? "bg-[#1A453A] text-white shadow-[0_10px_20px_-5px_rgba(26,69,58,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(26,69,58,0.4)] hover:-translate-y-0.5" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                    )}

                    <item.icon 
                      className={`w-5 h-5 transition-transform duration-300 relative z-10 ${
                        isActive ? 'text-emerald-300' : 'text-gray-400 group-hover:text-[#1A453A]'
                      } ${!isActive && 'group-hover:scale-110'}`} 
                    />
                    <span className="text-[13px] relative z-10 tracking-wide">{item.name}</span>
                    
                    {item.name === "Scan Makanan" && !isActive && (
                      <span className="absolute right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

        </nav>

        {/* Footer Area - Profil & Logout */}
        <div className="p-4 relative z-10 mt-auto bg-gradient-to-t from-white via-white to-transparent">
          <div className="bg-white border border-gray-100 shadow-[0_5px_15px_rgba(0,0,0,0.03)] rounded-[1.5rem] p-2 flex flex-col gap-1">
            
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-[#1A453A] flex items-center justify-center font-bold text-white text-lg shadow-md border-2 border-white overflow-hidden">
                {photoURL ? (
                  <img src={photoURL} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  getInitials(userName)
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-extrabold text-gray-900 truncate leading-tight">{userName.split(' ')[0]}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{userRole} Member</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300 ease-out font-bold text-sm active:scale-95 group"
            >
              <IconLogout className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Keluar Akun
            </button>
            
          </div>
        </div>
      </aside>

      {/* ======================================= */}
      {/* AREA KONTEN UTAMA (Desktop & Mobile) */}
      {/* ======================================= */}
      <main className="flex-1 flex flex-col h-screen w-full overflow-hidden relative lg:pl-[320px] transition-all duration-300">
        
        {/* Header Mobile (Hanya muncul di layar kecil) */}
        <header className="lg:hidden flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 z-20 sticky top-0 shadow-sm">
          <Link href="/home" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#1A453A] text-white flex items-center justify-center font-black text-sm shadow-md">
              G
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              GIZIFY
            </span>
          </Link>
          <div 
            className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-[#1A453A] text-white flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer overflow-hidden border border-emerald-100" 
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

        {/* Konten Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 lg:pr-10 pb-28 lg:pb-10 custom-scroll relative z-0">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </div>

        {/* NAVIGASI BAWAH (Hanya Mobile) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center relative">
            <Link href="/home" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/home" ? "text-[#1A453A]" : "text-slate-400 hover:text-emerald-500"}`}>
              <IconHome className="w-6 h-6" />
            </Link>
            <Link href="/chatbot" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/chatbot" ? "text-[#1A453A]" : "text-slate-400 hover:text-emerald-500"}`}>
              <IconBot className="w-6 h-6" />
            </Link>
            
            {/* Tombol Scanner Melayang Tengah */}
            <Link href="/scanner" className="relative -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#1EAB57] to-[#127236] text-white shadow-[0_8px_20px_rgba(30,171,87,0.3)] hover:scale-105 transition-transform cursor-pointer border-[3px] border-white active:scale-95">
              <IconScan className="w-6 h-6" />
            </Link>
            
            <Link href="/meal-plan" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/meal-plan" ? "text-[#1A453A]" : "text-slate-400 hover:text-emerald-500"}`}>
              <IconWallet className="w-6 h-6" />
            </Link>
            <Link href="/profile" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/profile" ? "text-[#1A453A]" : "text-slate-400 hover:text-emerald-500"}`}>
              <IconUser className="w-6 h-6" />
            </Link>
          </div>
        </nav>
        
      </main>

      {/* Global Style untuk Custom Scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scroll::-webkit-scrollbar { width: 6px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
          .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
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