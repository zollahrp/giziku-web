// Path: src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase"; 
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // State form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // State Remember Me (Default: dicentang)
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ==========================================
  // FUNGSI BANTUAN: SET COOKIE & PERSISTENCE
  // ==========================================
  const handleSessionAndCookie = async () => {
    // 1. Atur Ketahanan Sesi Firebase
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceType);

    // 2. Atur Umur Cookie Satpam (PASTIKAN GIZIFY_SESSION)
    let cookieString = `gizify_session=true; path=/; Secure; SameSite=Strict`;
    if (rememberMe) {
      const sixMonths = 60 * 60 * 24 * 180;
      cookieString += `; max-age=${sixMonths}`;
    }
    document.cookie = cookieString;
  };

  // ==========================================
  // 1. FUNGSI LOGIN DENGAN EMAIL & PASSWORD
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);

    try {
      // Panggil fungsi pengatur sesi sebelum login
      await handleSessionAndCookie();

      // Autentikasi ke Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Ambil data profil (termasuk Role/Paket) dari Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userRole = "BASIC";
      let userName = "User";

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        userRole = userData.role || "BASIC";
        userName = userData.name || "User";
        
        // Update waktu terakhir login
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
      }

      // Tampilkan Notifikasi Dinamis berdasarkan Paket
      let welcomeText = "Selamat datang kembali!";
      if (userRole === "PRO") welcomeText = "Halo Member PRO! Siap penuhi gizi hari ini?";
      else if (userRole === "FAMILY") welcomeText = "Halo Member FAMILY! Pantau gizi keluargamu sekarang.";
      else welcomeText = "Masuk sebagai akun Gratis. Yuk catat kalorimu!";

      Swal.fire({
        title: `Welcome back, ${userName.split(' ')[0]}!`,
        text: welcomeText,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: "#ffffff",
        customClass: { popup: "rounded-3xl" }
      }).then(() => {
        router.push("/home");
      });

    } catch (error: any) {
      console.error("Error Login:", error);
      let errorMessage = "Email atau password salah.";
      
      if (error.code === 'auth/user-not-found') errorMessage = "Akun tidak ditemukan. Silakan daftar dulu.";
      if (error.code === 'auth/wrong-password') errorMessage = "Password yang kamu masukkan salah.";
      if (error.code === 'auth/too-many-requests') errorMessage = "Terlalu banyak percobaan. Coba lagi nanti.";

      Swal.fire({
        title: "Gagal Masuk",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: { popup: "rounded-3xl" }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 2. FUNGSI LOGIN DENGAN GOOGLE
  // ==========================================
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    try {
      // Panggil fungsi pengatur sesi sebelum login
      await handleSessionAndCookie();

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Cek apakah data user sudah ada di Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userRole = "BASIC";
      let userName = user.displayName || "User";

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        userRole = userData.role || "BASIC";
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
      } else {
        await setDoc(userDocRef, {
          uid: user.uid,
          name: userName,
          email: user.email,
          role: "BASIC", 
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      }

      let welcomeText = "Autentikasi Google berhasil.";
      if (userRole === "PRO") welcomeText = "Halo Member PRO! Siap penuhi gizi hari ini?";
      else if (userRole === "FAMILY") welcomeText = "Halo Member FAMILY! Pantau gizi keluargamu sekarang.";

      Swal.fire({
        title: `Welcome, ${userName.split(' ')[0]}!`,
        text: welcomeText,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "rounded-3xl" }
      }).then(() => {
        router.push("/home");
      });

    } catch (error) {
      console.error("Error Google Login:", error);
      Swal.fire({
        title: "Gagal Autentikasi",
        text: "Proses login dengan Google dibatalkan atau bermasalah.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: { popup: "rounded-3xl" }
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#FAFAFA] flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      
      {/* INJEKSI CSS ANIMASI */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(40px); animation: fadeUpAnim 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          .delay-100 { animation-delay: 0.15s; }
          .delay-200 { animation-delay: 0.3s; }
          .delay-300 { animation-delay: 0.45s; }
          
          @keyframes float-slow { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(30px, -50px); } 66% { transform: translate(-20px, 20px); } }
          @keyframes float-slower { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-40px, -30px); } }
          .animate-ambient-1 { animation: float-slow 18s ease-in-out infinite; }
          .animate-ambient-2 { animation: float-slower 24s ease-in-out infinite; }
        `
      }} />

      {/* AMBIENT BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 z-0"></div>
      <div className={`animate-ambient-1 absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-green-300/30 rounded-full blur-[120px] transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} />
      <div className={`animate-ambient-2 absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-[#1A453A]/15 rounded-full blur-[120px] transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} />

      {/* MAIN CARD LOGIN */}
      <div className={`relative z-10 w-full max-w-[440px] bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_80px_-20px_rgba(26,69,58,0.15)] border border-white p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_30px_100px_-20px_rgba(26,69,58,0.2)] ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>

        {/* Logo */}
        <div className="flex justify-center mb-8 mt-2">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1A453A] to-emerald-700 text-white flex items-center justify-center font-black text-3xl shadow-[0_10px_20px_rgba(26,69,58,0.3)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg]">
              G
            </div>
          </Link>
        </div>

        {/* Header Text */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-950 to-gray-600 drop-shadow-sm">
            Mulai Sehatmu
          </h1>
          <p className="text-sm font-semibold text-gray-500">
            Masuk untuk melihat asupan kalori hari ini.
          </p>
        </div>

        <form onSubmit={handleLogin} className={`space-y-5 ${isVisible ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
          
          {/* Input Email */}
          <div className="space-y-2 group">
            <label className="text-[11px] font-extrabold text-gray-800 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1A453A] transition-colors duration-300">
                <IconMail />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com" 
                required
                className="w-full pl-12 pr-5 py-4 bg-white/50 border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#1A453A]/10 focus:border-[#1A453A] focus:bg-white shadow-sm transition-all duration-300"
              />
            </div>
          </div>
          
          {/* Input Password */}
          <div className="space-y-2 group">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-extrabold text-gray-800 uppercase tracking-widest">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1A453A] transition-colors duration-300">
                <IconLock />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="w-full pl-12 pr-12 py-4 bg-white/50 border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#1A453A]/10 focus:border-[#1A453A] focus:bg-white shadow-sm transition-all duration-300"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-gray-400 hover:text-[#1A453A] hover:bg-gray-100 rounded-full focus:outline-none transition-all cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* OPSI INGAT SAYA & LUPA SANDI */}
            <div className="flex items-center justify-between px-1 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group/check">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    className="peer sr-only" 
                  />
                  <div className="w-4 h-4 rounded border-2 border-gray-300 peer-checked:border-[#1A453A] peer-checked:bg-[#1A453A] transition-all flex items-center justify-center">
                     <IconCheckSmall className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-gray-500 group-hover/check:text-gray-900 transition-colors">Ingat Saya</span>
              </label>
              <a href="#" className="text-[11px] font-bold text-green-600 hover:text-[#1A453A] transition-colors cursor-pointer">Lupa sandi?</a>
            </div>
          </div>

          {/* Tombol Submit Shine */}
          <button 
            type="submit"
            disabled={isLoading || isGoogleLoading || password.length === 0}
            className={`relative overflow-hidden w-full mt-6 py-4.5 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 active:scale-[0.98] group/btn flex justify-center items-center gap-2 cursor-pointer
              ${(isLoading || isGoogleLoading || password.length === 0) 
                ? 'bg-gray-300 text-gray-100 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-[#1A453A] to-emerald-700 hover:to-emerald-600 shadow-[0_10px_25px_rgba(26,69,58,0.3)] hover:shadow-[0_15px_35px_rgba(26,69,58,0.4)] hover:-translate-y-1'}`}
          >
            {!(isLoading || isGoogleLoading || password.length === 0) && (
              <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            )}
            
            {isLoading ? (
              <>
                <IconSpinner className="w-5 h-5 text-white animate-spin" />
                <span>Menyiapkan Nutrisimu...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>

        {/* SEPARATOR ATAU */}
        <div className={`flex items-center gap-4 my-7 ${isVisible ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-gray-200"></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Atau</span>
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-gray-200"></div>
        </div>

        {/* TOMBOL LOGIN GOOGLE */}
        <button 
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          className={`w-full flex items-center justify-center gap-3 py-4 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl text-xs font-black text-gray-700 tracking-wide uppercase shadow-sm hover:bg-white hover:border-gray-300 hover:shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer ${isVisible ? 'animate-fade-up delay-200' : 'opacity-0'} ${isGoogleLoading ? 'cursor-wait bg-gray-50' : ''}`}
        >
          {isGoogleLoading ? (
            <IconSpinner className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <>
              <IconGoogle />
              Masuk dengan Google
            </>
          )}
        </button>

        <p className={`mt-8 text-center text-sm font-semibold text-gray-500 ${isVisible ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
          Belum punya akun?{' '}
          <Link href="/register" className="font-black text-[#1A453A] hover:text-emerald-600 transition-colors underline decoration-2 underline-offset-4 decoration-[#1A453A]/20 hover:decoration-emerald-600 cursor-pointer">
            Daftar Gratis
          </Link>
        </p>
      </div>
    </main>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconCheckSmall = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
const IconGoogle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);
const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);
const IconEye = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);
const IconEyeOff = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);
const IconSpinner = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);