"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ==========================================
// MOCK DATA: RECENT SCANS
// ==========================================
const mockRecentScans = [
  { id: 1, title: "Salad Ayam Caesar", calories: 320, time: "12:30", accuracy: "98%", image: "https://images.unsplash.com/photo-1512852939750-1305098529bf?q=80&w=400&auto=format&fit=crop" },
  { id: 2, title: "Roti Panggang Alpukat", calories: 245, time: "08:15", accuracy: "95%", image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=400&auto=format&fit=crop" },
  { id: 3, title: "Oatmeal Buah Berry", calories: 180, time: "Kemarin", accuracy: "92%", image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=400&auto=format&fit=crop" },
  { id: 4, title: "Nasi Goreng Spesial", calories: 450, time: "Kemarin", accuracy: "88%", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=400&auto=format&fit=crop" },
  { id: 5, title: "Smoothie Bowl Hijau", calories: 210, time: "2 Hari Lalu", accuracy: "96%", image: "https://images.unsplash.com/photo-1628543118940-52e690a2c0bc?q=80&w=400&auto=format&fit=crop" },
  { id: 6, title: "Steak Daging Sapi", calories: 520, time: "2 Hari Lalu", accuracy: "99%", image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=400&auto=format&fit=crop" },
];

export default function ScannerPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "success">("idle");
  const [scanText, setScanText] = useState("Arahkan kamera ke makanan...");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // REFS
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  // Ref untuk nyimpan jejak stream murni
  const streamRef = useRef<MediaStream | null>(null);

  // Efek Animasi Masuk
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // FUNGSI GLOBAL MEMATIKAN KAMERA
  const stopCamera = () => {
    // 1. Matikan dari ref stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // 2. Matikan dari elemen video HTML
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // EFEK UTAMA: CYCLE KAMERA YANG TAHAN BANTING
  useEffect(() => {
    // FLAG KUNCI: Menandakan efek ini masih relevan atau user udah kabur
    let isActive = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        // JIKA USER KEBURU PINDAH TAB / HALAMAN SAAT LOADING KAMERA
        // Langsung bunuh stream yang baru datang ini!
        if (!isActive || document.hidden) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        // Kalau aman, jalankan normal
        stopCamera(); // Bersihkan sisa kalau ada
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access denied or not available.", err);
      }
    };

    // Handler Tab Visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      } else if (scanState === "idle" && !uploadedImage) {
        startCamera();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial load
    if (scanState === "idle" && !uploadedImage && !document.hidden) {
      startCamera();
    }

    // CLEANUP SAAT PINDAH HALAMAN / COMPONENT UNMOUNT
    return () => {
      isActive = false; // Memastikan request loading yang telat datang langsung di-kill
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopCamera(); // Hancurkan semua stream
    };
  }, [scanState, uploadedImage]);

  // Handler: Jepret
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg');
        setUploadedImage(imageUrl);
        stopCamera(); // Kamera dimatikan setelah difoto
        handleStartScan();
      }
    }
  };

  // Handler: Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      stopCamera();
      handleStartScan();
    }
  };

  const handleStartScan = () => {
    setScanState("scanning");
    setScanText("Mendeteksi objek makanan...");
    
    setTimeout(() => setScanText("Mengidentifikasi bahan & porsi..."), 1200);
    setTimeout(() => setScanText("Mencocokkan database kalori..."), 2400);
    setTimeout(() => setScanText("Menganalisa makronutrien..."), 3600);
    
    setTimeout(() => {
      setScanState("success");
      setScanText("Analisis Selesai!");
    }, 4500);
  };

  const handleRetake = () => {
    setScanState("idle");
    setScanText("Arahkan kamera ke makanan...");
    setUploadedImage(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 lg:pr-10 pb-32 md:pb-16 relative min-w-0 overflow-x-hidden bg-[#F8FAFC]">
      <canvas ref={canvasRef} className="hidden"></canvas>
      <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleImageUpload} className="hidden" />

      <div className={`fixed top-0 left-1/4 w-[30rem] h-[30rem] bg-[#1EAB57]/5 rounded-full blur-[100px] pointer-events-none z-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`fixed bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-400/5 rounded-full blur-[120px] pointer-events-none z-0 transition-opacity duration-1000 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(30px); animation: fadeUpAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-in { opacity: 0; animation: fadeInAnim 0.8s ease-out forwards; }
          .animate-scale-in { opacity: 0; transform: scale(0.95); animation: scaleInAnim 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-slide-right { opacity: 0; transform: translateX(-30px); animation: slideRightAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInAnim { to { opacity: 1; } }
          @keyframes scaleInAnim { to { opacity: 1; transform: scale(1); } }
          @keyframes slideRightAnim { to { opacity: 1; transform: translateX(0); } }
          
          .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; } .delay-300 { animation-delay: 0.3s; } .delay-400 { animation-delay: 0.4s; }
          .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          .animate-shimmer { animation: shimmer 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

          @keyframes scannerLaser {
            0% { top: 5%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 95%; opacity: 0; }
          }
          .laser-line {
            position: absolute; left: 5%; right: 5%; height: 2px; background: #1EAB57;
            box-shadow: 0 0 15px 5px rgba(30,171,87,0.5);
            animation: scannerLaser 2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate; z-index: 20;
          }
          
          .viewfinder::before, .viewfinder::after, .viewfinder-inner::before, .viewfinder-inner::after {
            content: ''; position: absolute; width: 40px; height: 40px; border-color: white; border-style: solid; z-index: 10; transition: all 0.3s ease;
          }
          .viewfinder::before { top: 20px; left: 20px; border-width: 4px 0 0 4px; border-radius: 12px 0 0 0; }
          .viewfinder::after { top: 20px; right: 20px; border-width: 4px 4px 0 0; border-radius: 0 12px 0 0; }
          .viewfinder-inner::before { bottom: 20px; left: 20px; border-width: 0 0 4px 4px; border-radius: 0 0 0 12px; }
          .viewfinder-inner::after { bottom: 20px; right: 20px; border-width: 0 4px 4px 0; border-radius: 0 0 12px 0; }
          
          .viewfinder.scanning::before, .viewfinder.scanning::after, .viewfinder.scanning .viewfinder-inner::before, .viewfinder.scanning .viewfinder-inner::after {
            border-color: #1EAB57; width: 60px; height: 60px;
          }
        `
      }} />

      <div className="w-full mt-6 lg:mt-8 relative z-10">
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgb(0,0,0,0.03)] border border-white mb-10 ${isLoaded ? 'animate-fade-up' : 'opacity-0'}`}>
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-[0_10px_20px_rgba(15,23,42,0.2)] border border-slate-700 shrink-0 transform -rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500">
                <IconScan className="w-7 h-7 md:w-8 md:h-8 text-[#1EAB57]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                <IconSparkles className="w-3 h-3 text-[#1EAB57] animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight leading-none mb-2">AI Food Scanner</h1>
              <p className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">Hitung kalori otomatis dari foto makananmu</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 shadow-sm cursor-pointer active:scale-95 flex items-center gap-2">
              <IconHistory className="w-4 h-4" /> Log Makanan
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 mb-12">
          <div className={`flex-1 flex flex-col gap-4 ${isLoaded ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
            <div className={`relative w-full h-[450px] md:h-[550px] rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-[0_20px_50px_-15px_rgb(0,0,0,0.2)] viewfinder ${scanState === 'scanning' ? 'scanning' : ''}`}>
              <div className="viewfinder-inner w-full h-full relative group">
                {!uploadedImage && scanState === "idle" ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100 md:scale-x-100" />
                ) : (
                  <img src={uploadedImage || "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop"} alt="Captured" className={`w-full h-full object-cover transition-all duration-1000 ${scanState === 'scanning' ? 'scale-110 blur-[2px] brightness-75' : scanState === 'success' ? 'brightness-50' : 'scale-100 brightness-90 group-hover:scale-105'}`} />
                )}

                {scanState === "scanning" && (
                  <>
                    <div className="laser-line"></div>
                    <div className="absolute inset-0 bg-[#1EAB57]/10 animate-pulse mix-blend-overlay"></div>
                  </>
                )}
                {scanState === "success" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in z-20">
                    <div className="w-20 h-20 bg-[#1EAB57] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(30,171,87,0.5)] animate-scale-in">
                      <IconCheckCircle className="w-10 h-10 text-white" />
                    </div>
                  </div>
                )}

                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 flex items-center gap-2.5 z-30 shadow-lg">
                  {scanState === "scanning" ? <IconLoader className="w-4 h-4 text-[#1EAB57] animate-spin" /> : scanState === "success" ? <IconSparkles className="w-4 h-4 text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>}
                  <span className="text-xs font-bold text-white tracking-wider">{scanText}</span>
                </div>

                {scanState !== "success" && (
                  <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-30">
                    <button onClick={() => galleryInputRef.current?.click()} className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black/70 transition-all hover:scale-105 active:scale-95 cursor-pointer" title="Upload dari Galeri">
                      <IconImage className="w-5 h-5" />
                    </button>
                    <button onClick={captureImage} disabled={scanState === "scanning"} className={`w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center p-1.5 transition-transform ${scanState === 'scanning' ? 'scale-95 opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'}`}>
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
                    </button>
                    <button className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black/70 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                      <IconLightning className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
              <IconInfo className="w-3.5 h-3.5" /> Pastikan pencahayaan cukup dan makanan terlihat jelas
            </p>
          </div>

          <div className={`w-full xl:w-[450px] shrink-0 flex flex-col gap-6 ${isLoaded ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
            {scanState === "idle" && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_15px_40px_-10px_rgb(0,0,0,0.03)] h-full flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 relative">
                  <div className="absolute inset-0 rounded-full border border-[#1EAB57] opacity-20 animate-ping"></div>
                  <IconScan className="w-10 h-10 text-[#1EAB57]" />
                </div>
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-3">Siap Menganalisa</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[250px] mb-10">Arahkan kamera ke makanan Anda lalu tekan tombol jepret untuk mengetahui kalori dan makronutrien.</p>
                <div className="flex gap-4 w-full px-4">
                  <div className="flex-1 flex flex-col items-center gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 transition-colors cursor-default">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1EAB57] shadow-sm"><IconCamera className="w-6 h-6"/></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1EAB57]">Kamera Aktif</span>
                  </div>
                  <button onClick={() => galleryInputRef.current?.click()} className="flex-1 flex flex-col items-center gap-3 bg-slate-50 hover:bg-slate-100 p-4 rounded-2xl border border-slate-100 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-500 group-hover:text-[#1EAB57] shadow-sm group-hover:scale-110 transition-transform"><IconImage className="w-6 h-6"/></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-[#1EAB57]">Pilih Galeri</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Sisa UI untuk Scanning & Success */}
            {scanState === "scanning" && (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-[0_20px_50px_-15px_rgb(0,0,0,0.3)] h-full flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#1EAB57] to-transparent animate-shimmer"></div>
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#1EAB57] to-transparent animate-shimmer" style={{ animationDirection: "reverse" }}></div>
                <div className="relative mb-8">
                  <div className="w-28 h-28 border-4 border-slate-800 border-t-[#1EAB57] rounded-full animate-spin shadow-[0_0_15px_rgba(30,171,87,0.3)]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconBot className="w-10 h-10 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight mb-4">AI Bekerja...</h3>
                <div className="bg-emerald-900/30 px-5 py-2.5 rounded-xl border border-emerald-800/50">
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-widest animate-pulse">{scanText}</p>
                </div>
              </div>
            )}

            {scanState === "success" && (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_20px_50px_-10px_rgb(0,0,0,0.05)] h-full flex flex-col relative overflow-hidden animate-scale-in">
                <div className="absolute right-0 top-0 w-48 h-48 bg-[#1EAB57]/10 rounded-full blur-[40px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-100 mb-6 w-max relative z-10 shadow-sm">
                  <IconCheckCircle className="w-4 h-4 text-[#1EAB57]" />
                  <span className="text-[10px] font-black text-[#1EAB57] uppercase tracking-widest">Identifikasi Sukses (98%)</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight leading-[1.1] mb-2 relative z-10">Nasi Goreng Spesial</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 relative z-10">Estimasi Porsi: 1 Porsi (± 300g)</p>
                <div className="flex items-center gap-4 mb-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative z-10 shadow-inner">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                    <IconFlame className="w-8 h-8 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Kalori</p>
                    <span className="text-5xl font-black text-[#0F172A] leading-none tracking-tighter">450<span className="text-xl text-slate-400 font-bold tracking-normal ml-1">Kkal</span></span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-10 relative z-10">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-default">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2"><span className="font-black text-sm">P</span></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Protein</span>
                    <span className="text-xl font-black text-slate-800">15<span className="text-xs font-bold text-slate-400 ml-0.5">g</span></span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-default">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-2"><span className="font-black text-sm">C</span></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Karbo</span>
                    <span className="text-xl font-black text-slate-800">55<span className="text-xs font-bold text-slate-400 ml-0.5">g</span></span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-rose-200 transition-all cursor-default">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2"><span className="font-black text-sm">F</span></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lemak</span>
                    <span className="text-xl font-black text-slate-800">12<span className="text-xs font-bold text-slate-400 ml-0.5">g</span></span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-auto relative z-10">
                  <button className="flex-1 bg-[#1EAB57] hover:bg-[#168E46] text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-[0_8px_20px_rgba(30,171,87,0.25)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <IconPlus className="w-4 h-4" /> Simpan Jurnal
                  </button>
                  <button onClick={handleRetake} className="sm:w-auto w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <IconRefresh className="w-4 h-4" /> Ulangi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`mt-8 md:mt-12 ${isLoaded ? 'animate-fade-up delay-400' : 'opacity-0'}`}>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Riwayat Scan Terakhir</h2>
            <button className="text-[11px] font-black text-[#1EAB57] uppercase tracking-widest cursor-pointer hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-1 group">
              Lihat Semua <IconArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {mockRecentScans.map((scan, index) => (
              <div key={scan.id} style={{animationDelay: `${500 + (index * 100)}ms`}} className={`bg-white rounded-[1.5rem] p-3 border border-slate-100 shadow-[0_10px_20px_-10px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_30px_-10px_rgb(0,0,0,0.08)] hover:border-[#1EAB57]/30 transition-all duration-300 group flex items-center gap-4 cursor-pointer overflow-hidden relative ${isLoaded ? 'animate-fade-up opacity-0' : 'opacity-0'}`}>
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
                  <img src={scan.image} alt={scan.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="flex-1 py-1 pr-2 min-w-0 flex flex-col justify-center h-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><IconClock className="w-3 h-3" /> {scan.time}</span>
                    <span className="bg-emerald-50 border border-emerald-100/50 text-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-0.5 shadow-sm"><IconTarget className="w-2.5 h-2.5"/> {scan.accuracy}</span>
                  </div>
                  <h3 className="text-[14px] font-black text-slate-900 truncate mb-2 group-hover:text-[#1EAB57] transition-colors leading-snug">{scan.title}</h3>
                  <div className="flex items-center gap-1.5 mt-auto">
                    <span className="flex items-center gap-1 text-rose-500 font-black text-[11px]"><IconFlame className="w-3.5 h-3.5"/> {scan.calories} Kkal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ICONS
const IconSearch = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconFilter = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>;
const IconStar = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>;
const IconBookmark = ({ className, filled }: { className: string, filled?: boolean }) => <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>;
const IconBot = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconSparkles = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconFlame = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>;
const IconClock = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconCutlery = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
const IconBell = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconPlay = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"></path></svg>;
const IconEdit = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconPlus = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconCheckCircle = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconMic = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>;
const IconCrown = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M2 4h20v2H2z"></path><path d="m2 8 3.5 12h13L22 8l-6 4-4-6-4 6z"></path></svg>;
const IconArrowRight = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconRefresh = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const IconLoader = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;
const IconScan = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 7 3 3 7 3"></polyline><polyline points="17 3 21 3 21 7"></polyline><polyline points="21 17 21 21 17 21"></polyline><polyline points="7 21 3 21 3 17"></polyline></svg>;
const IconImage = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const IconCamera = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const IconLightning = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconInfo = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const IconTarget = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const IconHistory = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline><path d="M12 7v5l4 2"></path></svg>;