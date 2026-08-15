// Path: src/app/(dashboard)/scanner/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";

// TIPE DATA
type Micronutrients = {
  vitC: string;
  fiber: string;
  calcium: string;
  iron: string;
};

type FoodItem = {
  name: string;
  box: [number, number, number, number];
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  micronutrients: Micronutrients;
};

type ScanResult = {
  items: FoodItem[];
  total: {
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    score: number;
    micronutrients: Micronutrients;
    ai_insight: string;
  };
};

export default function ScannerPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userGoal, setUserGoal] = useState<string>("Menjaga Berat Badan");

  // ==========================================
  // STATE MODE SCANNER (BARU)
  // ==========================================
  type ScanMode = "piring" | "kemasan" | "manual";
  const [activeMode, setActiveMode] = useState<ScanMode>("piring");

  const [scanState, setScanState] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [scanText, setScanText] = useState("Arahkan kamera ke makanan...");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  
  // TOGGLES
  const [showPointers, setShowPointers] = useState(true);
  const [showMicro, setShowMicro] = useState(false); 
  const [showShareModal, setShowShareModal] = useState(false); 

  // STRAVA SHARE STATE
  const [shareMode, setShareMode] = useState<"portrait" | "story" | "landscape" | "minimalist">("story");
  const [shareColor, setShareColor] = useState<string>("text-white");

  const [recentScans, setRecentScans] = useState<any[]>([]);
  const isFoodItem = scanResult ? scanResult.total.calories > 0 : false;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // STATE UNTUK FORM MANUAL
  const [manualForm, setManualForm] = useState({
    name: "",
    calories: "",
    pro: "",
    car: "",
    fat: ""
  });

  const fetchRecentScans = async (uid: string) => {
    try {
      const q = query(collection(db, "users", uid, "foodLogs"), orderBy("scannedAt", "desc"), limit(6));
      const querySnapshot = await getDocs(q);
      const logs: any[] = [];
      querySnapshot.forEach((d) => logs.push({ id: d.id, ...d.data() }));
      setRecentScans(logs);
    } catch (error) {
      console.error("Gagal menarik riwayat:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        fetchRecentScans(user.uid);
        try {
           const userDoc = await getDoc(doc(db, "users", user.uid));
           if(userDoc.exists() && userDoc.data().bodyGoal) {
              setUserGoal(userDoc.data().bodyGoal);
           }
        } catch(e) {}
      } else router.push("/login");
    });
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => { clearTimeout(timer); unsubscribe(); };
  }, [router]);

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  // EFEK KAMERA (DIMATIKAN JIKA MASUK MODE MANUAL)
  useEffect(() => {
    let isActive = true;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!isActive || document.hidden || activeMode === "manual") { mediaStream.getTracks().forEach(t => t.stop()); return; }
        stopCamera(); 
        streamRef.current = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) { console.error("Camera error:", err); }
    };

    const handleVisibilityChange = () => {
      if (document.hidden || activeMode === "manual") stopCamera();
      else if (scanState === "idle" && !uploadedImage) startCamera();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    if (activeMode === "manual") {
      stopCamera();
    } else if (scanState === "idle" && !uploadedImage && !document.hidden) {
      startCamera();
      setScanText(activeMode === "piring" ? "Arahkan kamera ke makanan..." : "Arahkan kamera ke Tabel Gizi / Barcode...");
    }

    return () => {
      isActive = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopCamera();
    };
  }, [scanState, uploadedImage, activeMode]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        setUploadedImage(imageUrl);
        stopCamera();
        processImageToGemini(imageUrl);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setUploadedImage(imageUrl);
        stopCamera();
        processImageToGemini(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageToGemini = async (base64Image: string) => {
    setScanState("scanning");
    setSelectedItemIndex(null); 
    setShowPointers(true);
    setShowMicro(false); 
    
    if (activeMode === "piring") {
      setScanText("Mata Gizify lagi melototin makananmu...");
      setTimeout(() => scanState === "scanning" && setScanText("Tunggu ya, lagi misahin gizi lauk dan nasinya..."), 1500);
      setTimeout(() => scanState === "scanning" && setScanText("Ngitung kalori biar targetmu aman terkendali..."), 3000);
    } else {
      setScanText("Memindai tabel gizi pada kemasan...");
      setTimeout(() => scanState === "scanning" && setScanText("Mengekstrak data makronutrisi..."), 1500);
      setTimeout(() => scanState === "scanning" && setScanText("Menganalisa komposisi..."), 3000);
    }

    try {
      // API Call (Bisa dimodifikasi nanti di backend biar ngebedain prompt piring vs kemasan)
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, bodyGoal: userGoal, scanType: activeMode })
      });
      const data = await response.json();

      if (response.ok) {
        setScanResult(data);
        setScanState("success");
      } else throw new Error(data.error);
    } catch (error) {
      setScanState("error");
      Swal.fire("Gagal", "Kamera nge-blank nih! Coba foto lagi yang lebih jelas ya.", "error");
      handleRetake();
    }
  };

  const handleSaveLog = async () => {
    if (!userId || !scanResult || !isFoodItem) return;
    const dataToSave = selectedItemIndex !== null ? scanResult.items[selectedItemIndex] : scanResult.total;
    const saveType = activeMode === "piring" 
        ? (selectedItemIndex !== null ? "Gizify Vision - Item Satuan" : "Gizify Vision - Piring Lengkap")
        : "Gizify Vision - Kemasan";

    try {
      Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await addDoc(collection(db, "users", userId, "foodLogs"), {
        name: dataToSave.name,
        calories: dataToSave.calories,
        protein: dataToSave.protein,
        carbs: dataToSave.carbs,
        fat: dataToSave.fat,
        score: (dataToSave as any).score || 8,
        scannedAt: serverTimestamp(),
        type: saveType
      });
      Swal.fire({ title: "Masuk Jurnal!", text: "Asupanmu sudah dicatat dengan aman.", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-3xl" }})
      .then(() => {
        fetchRecentScans(userId);
        handleRetake();
        document.getElementById('riwayat-scan')?.scrollIntoView({ behavior: 'smooth' });
      });
    } catch (error) {
      Swal.fire("Error!", "Gagal menyimpan.", "error");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    if (!manualForm.name || !manualForm.calories) {
      Swal.fire("Data Belum Lengkap", "Nama makanan dan kalori wajib diisi!", "warning");
      return;
    }

    try {
      Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await addDoc(collection(db, "users", userId, "foodLogs"), {
        name: manualForm.name,
        calories: parseInt(manualForm.calories),
        protein: parseInt(manualForm.pro) || 0,
        carbs: parseInt(manualForm.car) || 0,
        fat: parseInt(manualForm.fat) || 0,
        score: 8, // Default
        scannedAt: serverTimestamp(),
        type: "Input Manual"
      });
      Swal.fire({ title: "Tersimpan!", text: "Input manual berhasil ditambahkan.", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-3xl" }})
      .then(() => {
        fetchRecentScans(userId);
        setManualForm({ name: "", calories: "", pro: "", car: "", fat: "" });
        document.getElementById('riwayat-scan')?.scrollIntoView({ behavior: 'smooth' });
      });
    } catch (error) {
      Swal.fire("Error!", "Gagal menyimpan data manual.", "error");
    }
  };

  const handleRetake = () => {
    setScanState("idle");
    setScanText(activeMode === "piring" ? "Arahkan kamera ke makanan..." : "Arahkan kamera ke Tabel Gizi / Barcode...");
    setUploadedImage(null);
    setScanResult(null);
    setSelectedItemIndex(null);
    setShowMicro(false);
    setShowShareModal(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Baru saja";
    return timestamp.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const currentDisplayData = selectedItemIndex !== null && scanResult ? scanResult.items[selectedItemIndex] : scanResult?.total;

  const colorOptions = [
    { name: "Putih", class: "text-white", bg: "bg-white" },
    { name: "Hitam", class: "text-slate-900", bg: "bg-slate-900" },
    { name: "Hijau", class: "text-[#1EAB57]", bg: "bg-[#1EAB57]" },
    { name: "Kuning", class: "text-amber-400", bg: "bg-amber-400" },
    { name: "Merah", class: "text-rose-500", bg: "bg-rose-500" },
  ];

  const shareModes = [
    { id: "story", label: "Story (9:16)", aspect: "aspect-[9/16]" },
    { id: "portrait", label: "Portrait (4:5)", aspect: "aspect-[4/5]" },
    { id: "landscape", label: "Landscape", aspect: "aspect-[16/9] md:aspect-[21/9]" },
    { id: "minimalist", label: "Minimalis", aspect: "aspect-square" }
  ];

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 lg:pr-10 pb-32 md:pb-16 relative min-w-0 overflow-x-hidden bg-[#F8FAFC]">
      <canvas ref={canvasRef} className="hidden"></canvas>
      <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleImageUpload} className="hidden" />

      {/* SHARE MODAL */}
      {showShareModal && scanResult && uploadedImage && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in overflow-y-auto custom-scroll">
          <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all z-[210] cursor-pointer">
             <IconClose className="w-5 h-5" />
          </button>

          <div className="bg-white/10 border border-white/20 backdrop-blur-xl p-4 rounded-[1.5rem] mb-6 flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-8 z-10 w-full max-w-4xl mt-12 md:mt-0">
            <div className="flex flex-wrap justify-center gap-2 bg-black/40 p-1.5 rounded-xl w-full lg:w-auto">
               {shareModes.map(mode => (
                 <button key={mode.id} onClick={() => setShareMode(mode.id as any)} className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${shareMode === mode.id ? "bg-white text-slate-900" : "text-white hover:bg-white/20"}`}>
                   {mode.label}
                 </button>
               ))}
            </div>
            <div className="flex items-center justify-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
               <span className="text-xs font-black text-white/60 uppercase tracking-widest">Teks:</span>
               <div className="flex gap-2">
                 {colorOptions.map((color) => (
                    <button key={color.name} onClick={() => setShareColor(color.class)} className={`w-7 h-7 rounded-full border-[3px] transition-transform cursor-pointer shadow-sm ${shareColor === color.class ? 'border-white scale-125' : 'border-transparent hover:scale-110'} ${color.bg}`} title={color.name}></button>
                 ))}
               </div>
            </div>
          </div>
          
          <div id="gizify-share-card" className={`relative bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/20 flex transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${shareModes.find(m => m.id === shareMode)?.aspect} ${shareMode === "story" || shareMode === "portrait" ? "w-full max-w-[380px]" : "w-full max-w-4xl"}`}>
             <div className="absolute inset-0 z-0">
                <img src={uploadedImage} className={`w-full h-full object-cover transition-all duration-700 ${shareMode === "minimalist" ? "opacity-30 blur-xl scale-125" : "opacity-80"}`} />
                <div className={`absolute inset-0 transition-opacity duration-500 ${shareMode === "minimalist" ? "bg-slate-950/40" : shareMode === "landscape" ? "bg-gradient-to-r from-slate-950/90 via-slate-900/50 to-transparent" : "bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"}`}></div>
             </div>
             <div className={`relative z-10 flex flex-col justify-between w-full h-full ${shareMode === "minimalist" ? "p-8 items-center justify-center text-center" : "p-8 md:p-10"}`}>
                <div className={`flex justify-between items-start w-full ${shareMode === "minimalist" ? "absolute top-8 left-0 px-8" : ""}`}>
                  <img src="/images/logo.png" alt="GIZIFY" className="h-6 md:h-7 object-contain drop-shadow-lg" />
                  {shareMode !== "minimalist" && (
                    <div className="text-right">
                      <p className={`font-black text-[10px] uppercase tracking-widest drop-shadow-md ${shareColor === 'text-slate-900' ? 'text-slate-800' : 'text-white/80'}`}>
                        {new Date().toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
                <div className={`flex flex-col gap-4 ${shareMode === "landscape" ? "max-w-md my-auto" : "mt-auto"}`}>
                  <div>
                    <h2 className={`font-black leading-tight drop-shadow-xl transition-colors duration-300 ${shareColor} ${shareMode === "minimalist" ? "text-3xl" : "text-4xl md:text-5xl"}`}>
                      {scanResult.total.name}
                    </h2>
                    <div className={`flex items-baseline gap-2 mt-1 ${shareMode === "minimalist" ? "justify-center" : ""}`}>
                      <span className={`font-black tracking-tighter drop-shadow-2xl transition-colors duration-300 ${shareColor} ${shareMode === "minimalist" ? "text-7xl" : "text-7xl md:text-8xl"}`}>
                        {scanResult.total.calories}
                      </span>
                      <span className={`font-bold drop-shadow-md text-xl md:text-2xl ${shareColor === 'text-slate-900' ? 'text-slate-700' : 'text-white/70'}`}>Kkal</span>
                    </div>
                  </div>
                  <div className={`flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl mt-2 ${shareMode === "minimalist" ? "mx-auto w-max gap-8" : ""}`}>
                     <div className="text-center flex-1">
                       <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${shareColor === 'text-slate-900' ? 'text-slate-600' : 'text-white/70'}`}>Protein</p>
                       <p className={`text-xl font-black drop-shadow-md ${shareColor}`}>{scanResult.total.protein}g</p>
                     </div>
                     <div className="w-px h-8 bg-white/20"></div>
                     <div className="text-center flex-1">
                       <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${shareColor === 'text-slate-900' ? 'text-slate-600' : 'text-white/70'}`}>Karbo</p>
                       <p className={`text-xl font-black drop-shadow-md ${shareColor}`}>{scanResult.total.carbs}g</p>
                     </div>
                     <div className="w-px h-8 bg-white/20"></div>
                     <div className="text-center flex-1">
                       <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${shareColor === 'text-slate-900' ? 'text-slate-600' : 'text-white/70'}`}>Lemak</p>
                       <p className={`text-xl font-black drop-shadow-md ${shareColor}`}>{scanResult.total.fat}g</p>
                     </div>
                  </div>
                </div>
             </div>
          </div>
          <p className="text-white/50 text-xs mt-6 font-bold animate-pulse">Screenshot kartu estetik ini untuk dibagikan! 📸</p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(30px); animation: fadeUpAnim 0.8s forwards; }
          .animate-scale-in { opacity: 0; transform: scale(0.85); animation: scaleInAnim 0.6s forwards; }
          .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
          .animate-text-change { animation: textChange 0.5s ease-in-out; }
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleInAnim { to { opacity: 1; transform: scale(1); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes textChange { 0% { opacity: 0; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
          @keyframes scannerLaser { 0% { top: 5%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 95%; opacity: 0; } }
          .laser-line { position: absolute; left: 5%; right: 5%; height: 2px; background: #1EAB57; box-shadow: 0 0 15px 5px rgba(30,171,87,0.5); animation: scannerLaser 2s infinite alternate; z-index: 20; }
        `
      }} />

      <div className="w-full mt-6 lg:mt-8 relative z-10">
        
        {/* HEADER & DYNAMIC MODE SWITCHER */}
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white mb-8 md:mb-10 ${isLoaded ? 'animate-fade-up' : 'opacity-0'}`}>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-lg p-2.5 shrink-0">
              <img src="/images/logo.png" alt="G" className="w-full h-full object-contain" />
            </div>
            <div>
              <img src="/images/logo.png" alt="Gizify Vision" className="h-6 md:h-7 object-contain mb-1" />
              <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Catat gizimu dengan cerdas</p>
            </div>
          </div>

          {/* DYNAMIC MODE TABS (PIRING, KEMASAN, MANUAL) */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center w-full lg:w-max relative overflow-hidden">
             {/* Slider Background */}
             <div className={`absolute top-1.5 bottom-1.5 w-[calc(33.333%-4px)] bg-white rounded-[14px] shadow-sm border border-slate-200 transition-all duration-300 ease-out z-0
               ${activeMode === 'piring' ? 'left-1.5' : activeMode === 'kemasan' ? 'left-[calc(33.333%+1.5px)]' : 'left-[calc(66.666%-1.5px)]'}
             `}></div>
             
             <button onClick={() => { setActiveMode("piring"); handleRetake(); }} className={`flex-1 lg:w-36 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest relative z-10 transition-colors duration-300 outline-none flex items-center justify-center gap-1.5 ${activeMode === "piring" ? "text-[#1EAB57]" : "text-slate-500 hover:text-slate-800"}`}>
                <IconCutlery className="w-3.5 h-3.5" /> Piring
             </button>
             <button onClick={() => { setActiveMode("kemasan"); handleRetake(); }} className={`flex-1 lg:w-36 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest relative z-10 transition-colors duration-300 outline-none flex items-center justify-center gap-1.5 ${activeMode === "kemasan" ? "text-[#1EAB57]" : "text-slate-500 hover:text-slate-800"}`}>
                <IconBarcode className="w-3.5 h-3.5" /> Kemasan
             </button>
             <button onClick={() => { setActiveMode("manual"); handleRetake(); }} className={`flex-1 lg:w-36 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest relative z-10 transition-colors duration-300 outline-none flex items-center justify-center gap-1.5 ${activeMode === "manual" ? "text-[#1EAB57]" : "text-slate-500 hover:text-slate-800"}`}>
                <IconEdit3 className="w-3.5 h-3.5" /> Manual
             </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 mb-12">
          
          {/* ==================================================== */}
          {/* AREA KIRI: CAMERA (Piring & Kemasan) / FORM (Manual) */}
          {/* ==================================================== */}
          <div className={`flex-1 flex flex-col gap-4 animate-fade-up`} style={{ animationDelay: '0.1s' }}>
            
            {activeMode === "manual" ? (
              /* FORM INPUT MANUAL (Aesthetic & Premium) */
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg relative overflow-hidden h-full flex flex-col justify-center">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                 
                 <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 bg-emerald-50 text-[#1EAB57] rounded-2xl flex items-center justify-center border border-emerald-100">
                     <IconEdit3 className="w-6 h-6" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black text-[#0F172A]">Input Jurnal Manual</h2>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Catat kalori jajananmu</p>
                   </div>
                 </div>

                 <form onSubmit={handleManualSubmit} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Nama Makanan/Minuman <span className="text-rose-500">*</span></label>
                       <input 
                         type="text" required 
                         value={manualForm.name} onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:border-[#1EAB57] focus:ring-2 focus:ring-[#1EAB57]/20 transition-all placeholder:text-slate-300" 
                         placeholder="Contoh: Kopi Kenangan Mantan, Indomie Goreng..." 
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Total Kalori <span className="text-rose-500">*</span></label>
                         <div className="relative flex items-center">
                            <input 
                              type="number" required min="1"
                              value={manualForm.calories} onChange={(e) => setManualForm({...manualForm, calories: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl pl-5 pr-14 py-4 text-xl font-black text-[#0F172A] focus:outline-none focus:border-[#1EAB57] focus:ring-2 focus:ring-[#1EAB57]/20 transition-all placeholder:text-slate-200 shadow-inner" 
                              placeholder="0" 
                            />
                            <span className="absolute right-5 font-black text-slate-400">Kkal</span>
                         </div>
                       </div>
                       
                       <div className="space-y-2">
                         <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Protein (Opsional)</label>
                         <div className="relative flex items-center">
                            <input 
                              type="number" min="0"
                              value={manualForm.pro} onChange={(e) => setManualForm({...manualForm, pro: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-10 py-4 font-bold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all placeholder:text-slate-300" 
                              placeholder="0" 
                            />
                            <span className="absolute right-5 font-bold text-slate-400">g</span>
                         </div>
                       </div>

                       <div className="space-y-2">
                         <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Karbohidrat (Opsional)</label>
                         <div className="relative flex items-center">
                            <input 
                              type="number" min="0"
                              value={manualForm.car} onChange={(e) => setManualForm({...manualForm, car: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-10 py-4 font-bold text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all placeholder:text-slate-300" 
                              placeholder="0" 
                            />
                            <span className="absolute right-5 font-bold text-slate-400">g</span>
                         </div>
                       </div>

                       <div className="space-y-2">
                         <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Lemak (Opsional)</label>
                         <div className="relative flex items-center">
                            <input 
                              type="number" min="0"
                              value={manualForm.fat} onChange={(e) => setManualForm({...manualForm, fat: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-10 py-4 font-bold text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all placeholder:text-slate-300" 
                              placeholder="0" 
                            />
                            <span className="absolute right-5 font-bold text-slate-400">g</span>
                         </div>
                       </div>
                    </div>

                    <button type="submit" className="w-full mt-4 bg-[#1EAB57] hover:bg-[#168E46] text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_15px_30px_-5px_rgba(30,171,87,0.4)] active:scale-95 transition-all outline-none">
                       <IconSave className="w-5 h-5" /> Simpan ke Jurnal
                    </button>
                 </form>
              </div>
            ) : (
              /* CAMERA VIEW (Untuk Piring & Kemasan) */
              <div className="relative w-full h-[80vh] min-h-[500px] lg:h-[550px] rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-lg">
                {!uploadedImage && scanState === "idle" ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100 md:scale-x-100" />
                    {/* Panduan Visual di Layar Kamera */}
                    {activeMode === "kemasan" && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                         <div className="w-full max-w-sm h-64 border-4 border-dashed border-white/50 rounded-3xl relative">
                            <div className="absolute -top-10 left-0 right-0 text-center text-white font-black drop-shadow-md uppercase tracking-widest text-xs">Posisikan Tabel / Barcode Di Sini</div>
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#1EAB57] rounded-tl-2xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#1EAB57] rounded-tr-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#1EAB57] rounded-bl-2xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#1EAB57] rounded-br-2xl"></div>
                         </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full relative">
                    <img src={uploadedImage || ""} alt="Captured" className={`w-full h-full object-contain bg-black transition-all duration-1000 ${scanState === 'scanning' ? 'blur-[2px] brightness-75' : ''}`} />
                    
                    {/* OVERLAY INTERAKTIF (POINTER DARI AI) - Hanya kalau mode piring yang detail */}
                    {scanState === "success" && scanResult && isFoodItem && activeMode === "piring" && scanResult.items.map((item, idx) => {
                      const yCenter = (item.box[0] + item.box[2]) / 2;
                      const xCenter = (item.box[1] + item.box[3]) / 2;
                      const top = (yCenter / 1000) * 100;
                      const left = (xCenter / 1000) * 100;
                      const isActive = selectedItemIndex === idx;

                      return (
                        <div key={idx} className={`absolute z-30 transition-opacity duration-300 ${showPointers ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ top: `${top}%`, left: `${left}%` }}>
                          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center pointer-events-none transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-70 translate-y-1 scale-95'}`}>
                             <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-xl border border-white/20 transition-colors ${isActive ? 'bg-[#1EAB57] text-white shadow-[#1EAB57]/30' : 'bg-black/70 text-white backdrop-blur-md'}`}>
                               {item.name}
                             </div>
                             <div className={`w-0.5 h-3 ${isActive ? 'bg-[#1EAB57]' : 'bg-white/70'}`}></div>
                          </div>

                          <div onClick={() => setSelectedItemIndex(idx)} className={`w-7 h-7 -ml-3.5 -mt-3.5 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 border-2 ${isActive ? 'bg-[#1EAB57]/20 border-[#1EAB57] scale-125' : 'bg-white/30 border-white hover:bg-white/50 hover:scale-110 backdrop-blur-sm'}`}>
                             <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#1EAB57] animate-ping' : 'bg-white shadow-sm'}`}></div>
                             {isActive && <div className="absolute w-2.5 h-2.5 rounded-full bg-[#1EAB57]"></div>}
                          </div>
                        </div>
                      );
                    })}

                    {scanState === "success" && isFoodItem && activeMode === "piring" && (
                      <button onClick={() => setShowPointers(!showPointers)} className="absolute top-6 right-6 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg hover:bg-black/80 hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer" title={showPointers ? "Sembunyikan Titik Fokus" : "Tampilkan Titik Fokus"}>
                        {showPointers ? <IconEye className="w-5 h-5" /> : <IconEyeOff className="w-5 h-5 text-slate-400" />}
                      </button>
                    )}
                  </div>
                )}

                {scanState === "scanning" && (
                  <>
                    <div className="laser-line"></div>
                    <div className="absolute inset-0 bg-[#1EAB57]/10 animate-pulse mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-3 z-30 shadow-2xl">
                      <IconLoader className="w-4 h-4 text-[#1EAB57] animate-spin" />
                      <span key={scanText} className="text-[11px] font-bold text-white tracking-wider animate-text-change whitespace-nowrap">{scanText}</span>
                    </div>
                  </>
                )}

                {scanState === "success" && !isFoodItem && (
                   <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-fade-in">
                      <IconClose className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
                      <h3 className="text-white text-2xl font-black">Tidak Dikenali</h3>
                      <p className="text-sm text-slate-400 mb-8 max-w-[250px] text-center mt-2">Pastikan Anda mengambil gambar makanan atau tabel nilai gizi yang jelas.</p>
                      <button onClick={handleRetake} className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer">Coba Lagi</button>
                   </div>
                )}

                {scanState !== "success" && scanState !== "scanning" && (
                  <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-30">
                    <button onClick={() => galleryInputRef.current?.click()} className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                      <IconImage className="w-5 h-5" />
                    </button>
                    <button onClick={captureImage} className="w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center p-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer">
                      <div className="w-full h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
                    </button>
                    <button className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                      <IconLightning className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Scroll Indikator untuk Mobile */}
            {scanState === "success" && activeMode !== "manual" && (
              <div className="lg:hidden flex flex-col items-center justify-center mt-2 animate-bounce text-slate-400">
                 <p className="text-[10px] font-black uppercase tracking-widest mb-1">Scroll Hasil</p>
                 <IconChevronDown className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* HASIL ANALISA AI (KOLOM KANAN) */}
          <div className={`w-full xl:w-[450px] shrink-0 flex flex-col gap-6 animate-fade-up`} style={{ animationDelay: '0.2s' }}>
            
            {activeMode === "manual" ? (
              // CARD TIPS MANUAL
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 shadow-xl h-full flex flex-col relative overflow-hidden">
                <div className="absolute right-[-20%] bottom-[-20%] w-64 h-64 bg-[#1EAB57] rounded-full blur-[80px] opacity-30 pointer-events-none"></div>
                <IconSparkles className="w-10 h-10 text-emerald-400 mb-6 relative z-10" />
                <h3 className="text-2xl font-black text-white tracking-tight mb-4 relative z-10">Kenapa Input Manual?</h3>
                <p className="text-sm font-medium text-slate-300 leading-relaxed relative z-10 mb-6">Cocok digunakan saat Anda mengonsumsi jajanan yang sudah diketahui nilai kalori spesifiknya (seperti minuman kaleng atau menu restoran terstandarisasi).</p>
                <div className="mt-auto bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Pro Tip Gizify</p>
                   <p className="text-xs text-white/80 leading-relaxed font-bold">Pastikan untuk selalu melengkapi makronutrisi (Protein, Karbo, Lemak) jika datanya tersedia, agar laporan gizi harian Anda semakin akurat!</p>
                </div>
              </div>
            ) : scanState === "idle" ? (
              // IDLE CAMERA
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 relative">
                  <div className="absolute inset-0 rounded-full border border-[#1EAB57] opacity-20 animate-ping"></div>
                  {activeMode === "kemasan" ? <IconBarcode className="w-10 h-10 text-[#1EAB57]" /> : <IconScan className="w-10 h-10 text-[#1EAB57]" />}
                </div>
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-3">Siap Menganalisa</h3>
                <p className="text-sm font-medium text-slate-500 max-w-[250px] mb-6">Arahkan kamera ke {activeMode === "kemasan" ? "tabel nilai gizi atau kemasan" : "makanan Anda"} lalu tekan tombol jepret.</p>
              </div>
            ) : scanState === "scanning" ? (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl h-full flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#1EAB57] to-transparent animate-[shimmer_2s_infinite]"></div>
                <div className="relative mb-8">
                  <div className="w-28 h-28 border-4 border-slate-800 border-t-[#1EAB57] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconBot className="w-10 h-10 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight mb-4">Gizify Bekerja...</h3>
              </div>
            ) : scanState === "success" && scanResult && isFoodItem ? (
              // SUCCESS CARD DARI KAMERA
              <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm h-full flex flex-col relative animate-scale-in">
                 <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4 shrink-0">
                      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <IconCheckCircle className="w-4 h-4 text-[#1EAB57]" />
                        <span className="text-[10px] font-black text-[#1EAB57] uppercase tracking-widest">Sukses Di-scan</span>
                      </div>
                      {selectedItemIndex !== null && (
                        <button onClick={() => setSelectedItemIndex(null)} className="text-[10px] bg-white text-slate-600 px-3 py-1.5 rounded-lg font-black hover:bg-slate-50 transition-colors border border-slate-200 hover:border-slate-300 active:scale-95 flex items-center gap-1 group cursor-pointer shadow-sm">
                          <IconChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Total Menu
                        </button>
                      )}
                    </div>
                    
                    <div className="overflow-y-auto custom-scroll pr-2 flex-1 pb-4">
                      <h2 className="text-3xl font-black text-[#0F172A] leading-tight mb-2">
                        {currentDisplayData?.name || "Memuat..."}
                      </h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 bg-slate-50 w-max px-3 py-1.5 rounded-lg border border-slate-100">
                        {activeMode === "kemasan" ? "Kemasan" : "Porsi"}: <span className="text-[#1EAB57] font-black">{(currentDisplayData as any)?.portion || "1 Sajian"}</span>
                      </p>
                      
                      {/* KARTU KALORI */}
                      <div className="flex items-center gap-4 mb-6 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 shadow-inner">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                          <IconFlame className="w-7 h-7 text-rose-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedItemIndex === null ? "Total Kalori" : "Kalori Komponen Ini"}</p>
                          <span className="text-4xl font-black text-[#0F172A] tracking-tighter">{currentDisplayData?.calories}<span className="text-lg text-slate-400 font-bold ml-1">Kkal</span></span>
                        </div>
                      </div>
                      
                      {/* GIZI MAKRO */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
                          <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2 font-black text-[10px]">P</div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Protein</span>
                          <span className="text-lg font-black text-slate-800">{currentDisplayData?.protein}g</span>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
                          <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-2 font-black text-[10px]">C</div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Karbo</span>
                          <span className="text-lg font-black text-slate-800">{currentDisplayData?.carbs}g</span>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
                          <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2 font-black text-[10px]">F</div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lemak</span>
                          <span className="text-lg font-black text-slate-800">{currentDisplayData?.fat}g</span>
                        </div>
                      </div>

                      {/* TOMBOL EXPAND GIZI MIKRO */}
                      <div className="mb-6">
                        <button onClick={() => setShowMicro(!showMicro)} className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer group">
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-[#1EAB57] transition-colors">Lihat Detail Gizi Mikro</span>
                          <IconChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showMicro ? 'rotate-180 text-[#1EAB57]' : ''}`} />
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showMicro ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                                <span className="text-xs font-bold text-slate-600">Vitamin C</span>
                                <span className="text-[11px] font-black text-slate-900">{currentDisplayData?.micronutrients?.vitC || "0mg"}</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                                <span className="text-xs font-bold text-slate-600">Serat</span>
                                <span className="text-[11px] font-black text-[#1EAB57]">{currentDisplayData?.micronutrients?.fiber || "0g"}</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                                <span className="text-xs font-bold text-slate-600">Kalsium</span>
                                <span className="text-[11px] font-black text-slate-900">{currentDisplayData?.micronutrients?.calcium || "0mg"}</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                                <span className="text-xs font-bold text-slate-600">Zat Besi</span>
                                <span className="text-[11px] font-black text-slate-900">{currentDisplayData?.micronutrients?.iron || "0mg"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI INSIGHT CARD */}
                      {selectedItemIndex === null && scanResult.total.ai_insight && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 relative overflow-hidden">
                          <IconSparkles className="absolute -right-4 -bottom-4 w-20 h-20 text-indigo-500/10 pointer-events-none" />
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                              <IconBot className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Kata Gizify AI:</span>
                          </div>
                          <p className="text-xs font-bold text-indigo-800 italic leading-relaxed relative z-10">"{scanResult.total.ai_insight}"</p>
                        </div>
                      )}
                    </div>
                    
                    {/* ACTION BUTTONS */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 shrink-0">
                      <button onClick={handleSaveLog} className="col-span-2 bg-[#1EAB57] hover:bg-[#168E46] text-white py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <IconPlus className="w-4 h-4" /> Simpan Jurnal
                      </button>
                      
                      <button onClick={() => setShowShareModal(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <IconShare className="w-4 h-4" /> Bagikan
                      </button>
                      
                      <button onClick={handleRetake} className="bg-slate-50 text-slate-600 border border-slate-200 py-3.5 rounded-xl text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer">
                        <IconRefresh className="w-4 h-4" /> Scan Ulang
                      </button>
                    </div>
                 </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* RIWAYAT SCAN TERAKHIR */}
        <div id="riwayat-scan" className={`mt-8 md:mt-12 ${isLoaded ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Riwayat Scan Terakhir</h2>
          </div>
          
          {recentScans.length === 0 ? (
            <div className="w-full bg-white rounded-[2rem] p-12 text-center border border-slate-100 border-dashed">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <IconHistory className="w-8 h-8" />
               </div>
               <h4 className="text-lg font-black text-slate-800 mb-2">Belum Ada Riwayat</h4>
               <p className="text-sm font-medium text-slate-500 max-w-[300px] mx-auto">Makanan yang kamu scan dan simpan akan otomatis muncul di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {recentScans.map((scan) => (
                <div key={scan.id} className="bg-white rounded-[1.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-[#1EAB57]/30 transition-all duration-300 group flex items-center gap-4 cursor-default">
                  <div className={`w-20 h-20 shrink-0 rounded-2xl flex flex-col items-center justify-center border shadow-inner group-hover:scale-105 transition-transform duration-500 ${scan.type === "Input Manual" ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-100/50' : scan.type.includes("Kemasan") ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-100/50' : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100/50'}`}>
                    {scan.type === "Input Manual" ? <IconEdit3 className="w-8 h-8 text-blue-400 opacity-80" /> : scan.type.includes("Kemasan") ? <IconBarcode className="w-8 h-8 text-indigo-400 opacity-80" /> : <IconCutlery className="w-8 h-8 text-[#1EAB57] opacity-80" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <IconClock className="w-3 h-3" /> {formatTime(scan.scannedAt)}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 truncate mb-2 group-hover:text-[#1EAB57] transition-colors leading-snug" title={scan.name}>
                      {scan.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded-md font-black text-[10px]">
                        <IconFlame className="w-3 h-3"/> {scan.calories} Kkal
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ICONS
const IconScan = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 7 3 3 7 3"></polyline><polyline points="17 3 21 3 21 7"></polyline><polyline points="21 17 21 21 17 21"></polyline><polyline points="7 21 3 21 3 17"></polyline></svg>;
const IconSparkles = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconHistory = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline><path d="M12 7v5l4 2"></path></svg>;
const IconCheckCircle = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconLoader = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;
const IconImage = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const IconLightning = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconFlame = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>;
const IconPlus = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconRefresh = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const IconClose = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconChevronLeft = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconCutlery = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
const IconClock = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconEye = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconEyeOff = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const IconBot = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconChevronDown = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconShare = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
const IconBarcode = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"></path><path d="M8 5v14"></path><path d="M12 5v14"></path><path d="M17 5v14"></path><path d="M21 5v14"></path></svg>;
const IconEdit3 = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
const IconSave = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;