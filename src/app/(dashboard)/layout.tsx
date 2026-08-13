"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// 1. TAMBAHKAN IMPORT FIREBASE DI SINI
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // 2. BIKIN NAMA USER JADI DINAMIS DARI FIREBASE (Bukan statis lagi)
  const [userName, setUserName] = useState("Memuat...");

  useEffect(() => {
    // Dengarkan perubahan status login dari Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "User Giziku");
      } else {
        setUserName("Tamu");
      }
    });
    return () => unsubscribe();
  }, []);

  // --- STRUKTUR MENU GIZIKU YANG DIPERBARUI ---
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

  // 3. FUNGSI LOGOUT YANG SAKTI
  const handleLogout = async () => {
    try {
      // a. Putuskan sesi dari Firebase
      await signOut(auth);
      
      // b. Hancurkan Cookie (Kartu Akses) biar Middleware nggak ngasih masuk lagi
      document.cookie = "giziku_session=; path=/; max-age=0; Secure; SameSite=Strict";
      
      // c. Lempar balik ke halaman login
      router.push("/login");
    } catch (error) {
      console.error("Gagal logout:", error);
      alert("Terjadi kesalahan saat logout.");
    }
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

        {/* Header - LOGO GIZIKU */}
        <div className="pt-8 pb-4 px-8 flex flex-col gap-2 relative z-10">
          <Link href="/home" className="flex items-center gap-2 group w-fit cursor-pointer hover:scale-105 transition-transform duration-500 origin-left">
            <div className="w-10 h-10 rounded-full bg-[#1A453A] text-white flex items-center justify-center font-black text-xl shadow-[0_8px_15px_rgba(26,69,58,0.3)] transition-transform group-hover:rotate-3">
              G
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              GIZIKU<span className="text-emerald-500">.AI</span>
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
                    {/* Animasi Shine untuk menu aktif */}
                    {isActive && (
                      <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                    )}

                    <item.icon 
                      className={`w-5 h-5 transition-transform duration-300 relative z-10 ${
                        isActive ? 'text-emerald-300' : 'text-gray-400 group-hover:text-[#1A453A]'
                      } ${!isActive && 'group-hover:scale-110'}`} 
                    />
                    <span className="text-[13px] relative z-10 tracking-wide">{item.name}</span>
                    
                    {/* Badge khusus untuk Scanner */}
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
              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-[#1A453A] flex items-center justify-center font-bold text-white text-sm shadow-md border-2 border-white">
                {/* Ambil huruf pertama dari nama user Firebase */}
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-extrabold text-gray-900 truncate leading-tight">{userName}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Member Aktif</p>
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
              GIZIKU
            </span>
          </Link>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-[#1A453A] text-white flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer" onClick={handleLogout}>
             {/* Tombol Profile Mobile (Klik untuk Logout Sementara) */}
            {userName.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Konten Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 lg:pr-10 pb-28 lg:pb-10 custom-scroll">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </div>

        {/* NAVIGASI BAWAH (Hanya Mobile) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center relative">
            <Link href="/home" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/home" ? "text-[#1A453A]" : "text-slate-400"}`}>
              <IconHome className="w-6 h-6" />
            </Link>
            <Link href="/chatbot" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/chatbot" ? "text-[#1A453A]" : "text-slate-400"}`}>
              <IconBot className="w-6 h-6" />
            </Link>
            
            {/* Tombol Scanner Melayang Tengah */}
            <Link href="/scanner" className="relative -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#1EAB57] to-[#127236] text-white shadow-[0_8px_20px_rgba(30,171,87,0.3)] hover:scale-105 transition-transform cursor-pointer border-[3px] border-white">
              <IconScan className="w-6 h-6" />
            </Link>
            
            <Link href="/meal-plan" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/meal-plan" ? "text-[#1A453A]" : "text-slate-400"}`}>
              <IconWallet className="w-6 h-6" />
            </Link>
            <Link href="/profile" className={`flex flex-col items-center p-2 transition-colors ${pathname === "/profile" ? "text-[#1A453A]" : "text-slate-400"}`}>
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
const IconScan = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="17" x2="12" y2="17.01"></line></svg>;
const IconBook = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const IconWallet = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const IconUser = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconLogout = ({ className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;