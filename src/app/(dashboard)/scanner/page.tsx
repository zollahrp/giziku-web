// Path: src/app/(dashboard)/scanner/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import ShareModal from "@/components/dashboard/ShareModal";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, doc, getDoc, where } from "firebase/firestore";

// TIPE DATA
type Micronutrients = { vitC: string; fiber: string; calcium: string; iron: string; };
type FoodItem = { name: string; box: [number, number, number, number]; portion: string; calories: number; protein: number; carbs: number; fat: number; micronutrients: Micronutrients; };
type ScanResult = { items: FoodItem[]; total: { name: string; portion: string; calories: number; protein: number; carbs: number; fat: number; score: number; micronutrients: Micronutrients; ai_insight: string; }; };

export default function ScannerPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userGoal, setUserGoal] = useState<string>("Menjaga Berat Badan");
  const [userTargets, setUserTargets] = useState({ calories: 2000, protein: 150, carbs: 200, fat: 66 });
  const [todayTotals, setTodayTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  type ScanMode = "piring" | "manual";
  const [activeMode, setActiveMode] = useState<ScanMode>("piring");

  const [scanState, setScanState] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [scanText, setScanText] = useState("Arahkan kamera ke makanan...");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  
  const [showPointers, setShowPointers] = useState(true);
  const [showMicro, setShowMicro] = useState(false); 
  const [showManualMicro, setShowManualMicro] = useState(false); 
  const [showShareModal, setShowShareModal] = useState(false); 
  const [isFlashOn, setIsFlashOn] = useState(false);

  const [mealType, setMealType] = useState<string>("Makan Siang");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditingMacro, setIsEditingMacro] = useState(false);
  const [editForm, setEditForm] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const [recentScans, setRecentScans] = useState<any[]>([]);
  const isFoodItem = scanResult ? scanResult.total.calories > 0 : false;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // STATE MANUAL FORM DENGAN SISTEM PER-100G
  const [manualForm, setManualForm] = useState({ 
    name: "", 
    portion: "100", // Porsi konsumsi (default 100g)
    baseCalories: "", basePro: "", baseCar: "", baseFat: "",
    baseVitC: "", baseFiber: "", baseCalcium: "", baseIron: ""
  });

  // STATE LOADING UNTUK AUTO-GENERATE GIZI
  const [isGeneratingMacro, setIsGeneratingMacro] = useState(false);

  // KALKULASI OTOMATIS BERDASARKAN PORSI KONSUMSI
  const multiplier = (parseFloat(manualForm.portion) || 0) / 100;
  const calcCals = Math.round((parseFloat(manualForm.baseCalories) || 0) * multiplier);
  const calcPro = Math.round((parseFloat(manualForm.basePro) || 0) * multiplier);
  const calcCar = Math.round((parseFloat(manualForm.baseCar) || 0) * multiplier);
  const calcFat = Math.round((parseFloat(manualForm.baseFat) || 0) * multiplier);

  const mealOptions = [
    { id: 'Sarapan', label: 'Sarapan', icon: <IconSunrise className="w-4 h-4" /> },
    { id: 'Makan Siang', label: 'Makan Siang', icon: <IconSun className="w-4 h-4" /> },
    { id: 'Sore / Cemilan', label: 'Sore / Cemilan', icon: <IconCookie className="w-4 h-4" /> },
    { id: 'Makan Malam', label: 'Makan Malam', icon: <IconMoon className="w-4 h-4" /> }
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setMealType("Sarapan");
    else if (hour < 15) setMealType("Makan Siang");
    else if (hour < 18) setMealType("Sore / Cemilan");
    else setMealType("Makan Malam");
  }, []);

  const fetchRecentScans = async (uid: string) => {
    try {
      const q = query(collection(db, "users", uid, "foodLogs"), orderBy("scannedAt", "desc"), limit(6));
      const querySnapshot = await getDocs(q);
      const logs: any[] = [];
      querySnapshot.forEach((d) => logs.push({ id: d.id, ...d.data() }));
      setRecentScans(logs);
    } catch (error) { console.error("Gagal menarik riwayat:", error); }
  };

  const fetchTodayTotals = async (uid: string) => {
    try {
      const today = new Date(); today.setHours(0,0,0,0);
      const q = query(collection(db, "users", uid, "foodLogs"), where("scannedAt", ">=", today));
      const snaps = await getDocs(q);
      let cals = 0, pro = 0, car = 0, fat = 0;
      snaps.forEach(d => {
         const data = d.data();
         cals += data.calories || 0; pro += data.protein || 0; car += data.carbs || 0; fat += data.fat || 0;
      });
      setTodayTotals({ calories: cals, protein: pro, carbs: car, fat: fat });
    } catch(error) { console.error("Gagal menarik total hari ini:", error); }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid); fetchRecentScans(user.uid); fetchTodayTotals(user.uid);
        try {
           const userDoc = await getDoc(doc(db, "users", user.uid));
           if(userDoc.exists()) {
              const d = userDoc.data();
              if (d.bodyGoal) setUserGoal(d.bodyGoal);
              const tCals = parseInt(d.calories) || 2000;
              setUserTargets({ calories: tCals, protein: Math.round((tCals * 0.3)/4), carbs: Math.round((tCals * 0.4)/4), fat: Math.round((tCals * 0.3)/9) });
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
      stream.getTracks().forEach(t => t.stop()); videoRef.current.srcObject = null;
    }
    setIsFlashOn(false);
  };

  const toggleFlash = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities() as any;
      if (!capabilities.torch) {
        Swal.fire("Ups!", "Perangkat atau browsermu tidak mendukung fitur senter.", "info");
        return;
      }
      const newFlashState = !isFlashOn;
      await track.applyConstraints({ advanced: [{ torch: newFlashState }] } as any);
      setIsFlashOn(newFlashState);
    } catch (err) {
      console.error("Flash error:", err);
      Swal.fire("Gagal", "Tidak dapat menyalakan lampu flash.", "error");
    }
  };

  useEffect(() => {
    let isActive = true;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!isActive || document.hidden || activeMode === "manual") { mediaStream.getTracks().forEach(t => t.stop()); return; }
        stopCamera(); streamRef.current = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) { console.error("Camera error:", err); }
    };

    const handleVisibilityChange = () => {
      if (document.hidden || activeMode === "manual") stopCamera();
      else if (scanState === "idle" && !uploadedImage) startCamera();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    if (activeMode === "manual") stopCamera();
    else if (scanState === "idle" && !uploadedImage && !document.hidden) {
      startCamera();
      setScanText("Arahkan kamera ke makanan...");
    }

    return () => { isActive = false; document.removeEventListener("visibilitychange", handleVisibilityChange); stopCamera(); };
  }, [scanState, uploadedImage, activeMode]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current; const canvas = canvasRef.current;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        setUploadedImage(imageUrl); stopCamera(); processImageToGemini(imageUrl);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setUploadedImage(imageUrl); stopCamera(); processImageToGemini(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageToGemini = async (base64Image: string) => {
    setScanState("scanning"); setSelectedItemIndex(null); setShowPointers(true); setShowMicro(false); setIsEditingMacro(false);
    
    setScanText("Mata Gizify lagi melototin makananmu...");
    setTimeout(() => scanState === "scanning" && setScanText("Tunggu ya, lagi misahin gizi lauk dan nasinya..."), 1500);
    setTimeout(() => scanState === "scanning" && setScanText("Ngitung kalori biar targetmu aman terkendali..."), 3000);

    try {
      const response = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: base64Image, bodyGoal: userGoal, scanType: activeMode }) });
      const data = await response.json();
      if (response.ok) { setScanResult(data); setScanState("success"); } 
      else throw new Error(data.error);
    } catch (error) {
      setScanState("error"); Swal.fire("Gagal", "Kamera nge-blank nih! Coba foto lagi yang lebih jelas ya.", "error"); handleRetake();
    }
  };

  // --- FUNGSI AUTO GENERATE GIZI MENGGUNAKAN GEMINI API ---
  const handleAutoGenerate = async () => {
    if (!manualForm.name) {
      Swal.fire("Ups!", "Isi nama makanannya dulu ya biar AI tahu apa yang mau dicari.", "warning");
      return;
    }

    setIsGeneratingMacro(true);
    try {
      const response = await fetch("/api/manual-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodName: manualForm.name })
      });
      const data = await response.json();

      if (response.ok) {
        setManualForm(prev => ({
          ...prev,
          baseCalories: data.baseCalories || "",
          basePro: data.basePro || "",
          baseCar: data.baseCar || "",
          baseFat: data.baseFat || "",
          baseVitC: data.baseVitC || "",
          baseFiber: data.baseFiber || "",
          baseCalcium: data.baseCalcium || "",
          baseIron: data.baseIron || ""
        }));
        setShowManualMicro(true); // Otomatis buka form micro biar user tau ada datanya
        Swal.fire({ title: "Selesai!", text: "Data gizi otomatis terisi. Kamu bisa mengubahnya jika diperlukan.", icon: "success", timer: 2000, showConfirmButton: false, customClass: { popup: "rounded-[2rem]" }});
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire("Gagal Menarik Data", "Gagal menghubungi AI. Silakan isi secara manual.", "error");
    } finally {
      setIsGeneratingMacro(false);
    }
  };

  const currentDisplayData = selectedItemIndex !== null && scanResult ? scanResult.items[selectedItemIndex] : scanResult?.total;

  const startEditMacro = () => {
    if (currentDisplayData) {
      setEditForm({
        calories: currentDisplayData.calories,
        protein: currentDisplayData.protein,
        carbs: currentDisplayData.carbs,
        fat: currentDisplayData.fat
      });
      setIsEditingMacro(true);
    }
  };

  const saveEditMacro = () => {
    setScanResult(prev => {
      if (!prev) return prev;
      const newData = { ...prev };
      if (selectedItemIndex === null) {
        newData.total = { ...newData.total, ...editForm };
      } else {
        newData.items[selectedItemIndex] = { ...newData.items[selectedItemIndex], ...editForm };
      }
      return newData;
    });
    setIsEditingMacro(false);
  };

  const handleSaveLog = async () => {
    if (!userId || !scanResult || !isFoodItem) return;
    const dataToSave = selectedItemIndex !== null ? scanResult.items[selectedItemIndex] : scanResult.total;
    const saveType = selectedItemIndex !== null ? "Gizify Vision - Item Satuan" : "Gizify Vision - Piring Lengkap";

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
        type: saveType,
        mealType: mealType 
      });
      Swal.fire({ title: "Masuk Jurnal!", text: `Asupan ${mealType} sudah dicatat dengan aman.`, icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-3xl" }}).then(() => {
        fetchRecentScans(userId); fetchTodayTotals(userId); handleRetake(); document.getElementById('riwayat-scan')?.scrollIntoView({ behavior: 'smooth' });
      });
    } catch (error) { Swal.fire("Error!", "Gagal menyimpan.", "error"); }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!manualForm.name || !manualForm.baseCalories || !manualForm.portion) { 
      Swal.fire("Data Belum Lengkap", "Nama makanan, porsi, dan kalori dasar wajib diisi!", "warning"); 
      return; 
    }
    
    try {
      Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await addDoc(collection(db, "users", userId, "foodLogs"), {
        name: manualForm.name, 
        calories: calcCals, 
        protein: calcPro, 
        carbs: calcCar, 
        fat: calcFat, 
        micronutrients: {
          vitC: manualForm.baseVitC ? Math.round(parseFloat(manualForm.baseVitC) * multiplier) + "mg" : "0mg",
          fiber: manualForm.baseFiber ? Math.round(parseFloat(manualForm.baseFiber) * multiplier) + "g" : "0g",
          calcium: manualForm.baseCalcium ? Math.round(parseFloat(manualForm.baseCalcium) * multiplier) + "mg" : "0mg",
          iron: manualForm.baseIron ? Math.round(parseFloat(manualForm.baseIron) * multiplier) + "mg" : "0mg",
        },
        score: 8, 
        scannedAt: serverTimestamp(), 
        type: "Input Manual",
        mealType: mealType
      });
      Swal.fire({ title: "Tersimpan!", text: `Input ${mealType} berhasil ditambahkan.`, icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-3xl" }}).then(() => {
        fetchRecentScans(userId); fetchTodayTotals(userId); 
        setManualForm({ name: "", portion: "100", baseCalories: "", basePro: "", baseCar: "", baseFat: "", baseVitC: "", baseFiber: "", baseCalcium: "", baseIron: "" }); 
        setShowManualMicro(false);
        document.getElementById('riwayat-scan')?.scrollIntoView({ behavior: 'smooth' });
      });
    } catch (error) { Swal.fire("Error!", "Gagal menyimpan data manual.", "error"); }
  };

  const handleRetake = () => {
    setScanState("idle"); setScanText("Arahkan kamera ke makanan..."); setUploadedImage(null); setScanResult(null); setSelectedItemIndex(null); setShowMicro(false); setShowShareModal(false); setIsEditingMacro(false); setIsDropdownOpen(false); setShowManualMicro(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Baru saja";
    return timestamp.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMealTypeDropdown = () => (
    <div className="relative">
      <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-full bg-white border cursor-pointer ${isDropdownOpen ? 'border-[#1EAB57] ring-2 ring-[#1EAB57]/10' : 'border-slate-200'} rounded-xl px-4 py-3 md:px-5 md:py-4 flex items-center justify-between shadow-sm outline-none transition-all`}>
         <div className="flex items-center gap-2.5">
            <span className={mealType === 'Sore / Cemilan' ? 'text-amber-600' : mealType === 'Makan Malam' ? 'text-blue-500' : 'text-amber-500'}>
              {mealOptions.find(o => o.id === mealType)?.icon}
            </span>
            <span className="text-xs md:text-sm font-black text-slate-700">{mealOptions.find(o => o.id === mealType)?.label}</span>
         </div>
         <IconChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden py-1 animate-fade-in origin-bottom">
            {mealOptions.map(opt => {
              const isSelected = mealType === opt.id;
              return (
                <button type="button" key={opt.id} onClick={() => { setMealType(opt.id); setIsDropdownOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 outline-none text-left transition-colors cursor-pointer ${isSelected ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <span className={isSelected ? 'text-white' : opt.id === 'Sore / Cemilan' ? 'text-amber-600' : opt.id === 'Makan Malam' ? 'text-blue-500' : 'text-amber-500'}>
                    {opt.icon}
                  </span>
                  <span className={`text-xs md:text-sm ${isSelected ? 'font-black' : 'font-bold'}`}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 lg:pr-10 pb-32 md:pb-16 relative min-w-0 overflow-x-hidden bg-[#F8FAFC]">
      <canvas ref={canvasRef} className="hidden"></canvas>
      <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleImageUpload} className="hidden" />

      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        uploadedImage={uploadedImage} 
        displayData={currentDisplayData} 
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(30px); animation: fadeUpAnim 0.8s forwards; }
          .animate-scale-in { opacity: 0; transform: scale(0.85); animation: scaleInAnim 0.6s forwards; }
          .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
          .animate-text-change { animation: textChange 0.5s ease-in-out; }
          input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number] { -moz-appearance: textfield; }
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleInAnim { to { opacity: 1; transform: scale(1); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes textChange { 0% { opacity: 0; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
          @keyframes scannerLaser { 0% { top: 5%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 95%; opacity: 0; } }
          .laser-line { position: absolute; left: 5%; right: 5%; height: 2px; background: #1EAB57; box-shadow: 0 0 15px 5px rgba(30,171,87,0.5); animation: scannerLaser 2s infinite alternate; z-index: 20; }
        `
      }} />

      <div className="w-full mt-2 lg:mt-8 relative z-10">
        
        {/* HEADER & DYNAMIC MODE SWITCHER */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 transition-all duration-300 ${activeMode === 'piring' ? 'p-2 md:p-8 bg-transparent md:bg-white/80 md:shadow-sm md:border md:border-white mb-4' : 'bg-white/80 backdrop-blur-xl p-4 md:p-8 shadow-sm border border-white mb-6'} md:mb-10 rounded-[2rem] md:rounded-[2.5rem] ${isLoaded ? 'animate-fade-up' : 'opacity-0'}`}>
          
          <div className={`items-center gap-4 md:gap-5 ${activeMode === 'piring' ? 'hidden md:flex' : 'flex'}`}>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[1.25rem] bg-white border border-slate-100 flex items-center justify-center shadow-md shrink-0 overflow-hidden p-1">
              <img src="/image/icon-gizi-vision.jpg" alt="G" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight mb-0.5">Gizify Vision</h1>
              <p className="text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Catat gizimu dengan cerdas</p>
            </div>
          </div>

          <div className={`bg-slate-100 p-1.5 rounded-2xl flex items-center w-full md:w-max relative overflow-hidden shrink-0 ${activeMode === 'piring' ? 'shadow-lg md:shadow-none border border-slate-200/50 md:border-none' : ''}`}>
             <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-4px)] bg-white rounded-[14px] shadow-sm border border-slate-200 transition-all duration-300 ease-out z-0
               ${activeMode === 'piring' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}
             `}></div>
             
             <button onClick={() => { setActiveMode("piring"); handleRetake(); }} className={`flex-1 md:w-40 py-3 md:py-3.5 text-[11px] md:text-xs font-black uppercase tracking-widest relative z-10 transition-colors duration-300 outline-none flex items-center justify-center gap-2 cursor-pointer ${activeMode === "piring" ? "text-[#1EAB57]" : "text-slate-500 hover:text-slate-800"}`}>
                <IconCutlery className="w-4 h-4" /> Scanner
             </button>
             <button onClick={() => { setActiveMode("manual"); handleRetake(); }} className={`flex-1 md:w-40 py-3 md:py-3.5 text-[11px] md:text-xs font-black uppercase tracking-widest relative z-10 transition-colors duration-300 outline-none flex items-center justify-center gap-2 cursor-pointer ${activeMode === "manual" ? "text-[#1EAB57]" : "text-slate-500 hover:text-slate-800"}`}>
                <IconEdit3 className="w-4 h-4" /> Manual
             </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row justify-center gap-6 lg:gap-8 mb-12 max-w-7xl mx-auto w-full">
          
          <div className={`flex-1 max-w-4xl flex flex-col gap-4 animate-fade-up`} style={{ animationDelay: '0.1s' }}>
            
            {activeMode === "manual" ? (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-lg relative overflow-hidden h-full flex flex-col justify-center">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                 
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-14 h-14 bg-emerald-50 text-[#1EAB57] rounded-2xl flex items-center justify-center border border-emerald-100">
                     <IconEdit3 className="w-6 h-6" />
                   </div>
                   <div>
                     <h2 className="text-xl md:text-2xl font-black text-[#0F172A]">Input Jurnal Manual</h2>
                     <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Kalkulator Gizi Instan</p>
                   </div>
                 </div>

                 <form onSubmit={handleManualSubmit} className="space-y-5">
                    
                    {/* BAGIAN 1: INPUT MAKANAN & PORSI KONSUMSI */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-slate-50 p-4 md:p-5 rounded-3xl border border-slate-100 shadow-inner">
                      <div className="space-y-2 md:col-span-1 relative">
                         <label htmlFor="foodName" className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 cursor-pointer">Nama Makanan <span className="text-rose-500">*</span></label>
                         <input 
                           id="foodName" type="text" required 
                           value={manualForm.name} onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 md:px-5 md:py-3.5 font-bold text-slate-800 focus:outline-none focus:border-[#1EAB57] focus:ring-2 focus:ring-[#1EAB57]/20 transition-all placeholder:text-slate-300 shadow-sm" 
                           placeholder="Cth: Dada Ayam Rebus" 
                         />
                      </div>
                      
                      <div className="space-y-2 md:col-span-1">
                         <label htmlFor="foodPortion" className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 cursor-pointer">Berat yg Dimakan <span className="text-rose-500">*</span></label>
                         <div className="relative flex items-center">
                            <input 
                              id="foodPortion" type="number" required min="1"
                              value={manualForm.portion} onChange={(e) => setManualForm({...manualForm, portion: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-16 py-3 md:pl-5 md:py-3.5 text-base md:text-lg font-black text-[#1EAB57] focus:outline-none focus:border-[#1EAB57] focus:ring-2 focus:ring-[#1EAB57]/20 transition-all placeholder:text-slate-300 shadow-sm" 
                              placeholder="100" 
                            />
                            <span className="absolute right-4 font-black text-slate-400 text-[10px] md:text-xs uppercase tracking-widest">Gram</span>
                         </div>
                      </div>

                      {/* TOMBOL AI GENERATOR */}
                      <div className="md:col-span-2 mt-1">
                        <button 
                           type="button" 
                           onClick={handleAutoGenerate} 
                           disabled={isGeneratingMacro} 
                           className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 text-emerald-700 py-3 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-70"
                        >
                          {isGeneratingMacro ? <IconLoader className="w-4 h-4 animate-spin text-emerald-600" /> : <IconSparkles className="w-4 h-4 text-emerald-500" />}
                          {isGeneratingMacro ? "Mencari Data Gizi..." : "✨ Auto Generate Gizi (AI)"}
                        </button>
                      </div>
                    </div>

                    {/* BAGIAN 2: INPUT GIZI DASAR (PER 100G) */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 ml-2">
                        <IconSparkles className="w-4 h-4 text-[#1EAB57]" />
                        <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-500">Kandungan Gizi Dasar (Per 100 Gram)</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                         <div className="space-y-1.5">
                           <label htmlFor="baseCal" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 cursor-pointer">Kalori <span className="text-rose-500">*</span></label>
                           <div className="relative flex items-center">
                              <input id="baseCal" type="number" required min="1" value={manualForm.baseCalories} onChange={(e) => setManualForm({...manualForm, baseCalories: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 md:py-3 font-bold text-slate-800 focus:outline-none focus:border-[#1EAB57] focus:ring-1 focus:ring-[#1EAB57]/20 transition-all placeholder:text-slate-300 shadow-sm" placeholder="0" />
                              <span className="absolute right-3 font-bold text-slate-400 text-[9px] md:text-[10px]">Kkal</span>
                           </div>
                         </div>
                         <div className="space-y-1.5">
                           <label htmlFor="basePro" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 cursor-pointer">Protein</label>
                           <div className="relative flex items-center">
                              <input id="basePro" type="number" min="0" value={manualForm.basePro} onChange={(e) => setManualForm({...manualForm, basePro: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 md:py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all placeholder:text-slate-300 shadow-sm" placeholder="0" />
                              <span className="absolute right-3 font-bold text-slate-400 text-[10px]">g</span>
                           </div>
                         </div>
                         <div className="space-y-1.5">
                           <label htmlFor="baseCar" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 cursor-pointer">Karbo</label>
                           <div className="relative flex items-center">
                              <input id="baseCar" type="number" min="0" value={manualForm.baseCar} onChange={(e) => setManualForm({...manualForm, baseCar: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 md:py-3 font-bold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all placeholder:text-slate-300 shadow-sm" placeholder="0" />
                              <span className="absolute right-3 font-bold text-slate-400 text-[10px]">g</span>
                           </div>
                         </div>
                         <div className="space-y-1.5">
                           <label htmlFor="baseFat" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 cursor-pointer">Lemak</label>
                           <div className="relative flex items-center">
                              <input id="baseFat" type="number" min="0" value={manualForm.baseFat} onChange={(e) => setManualForm({...manualForm, baseFat: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 md:py-3 font-bold text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20 transition-all placeholder:text-slate-300 shadow-sm" placeholder="0" />
                              <span className="absolute right-3 font-bold text-slate-400 text-[10px]">g</span>
                           </div>
                         </div>
                      </div>

                      {/* MIKRONUTRISI MANUAL - ACCORDION */}
                      <div className="mt-2">
                        <button type="button" onClick={() => setShowManualMicro(!showManualMicro)} className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors cursor-pointer group shadow-sm">
                          <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-[#1EAB57] transition-colors">Isi Detail Gizi Mikro (Opsional)</span>
                          <IconChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-slate-400 transition-transform duration-300 ${showManualMicro ? 'rotate-180 text-[#1EAB57]' : ''}`} />
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showManualMicro ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm grid grid-cols-2 gap-3 md:gap-4">
                             <div className="space-y-1.5">
                               <label htmlFor="microVitC" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 cursor-pointer">Vitamin C</label>
                               <div className="relative flex items-center">
                                  <input id="microVitC" type="number" min="0" value={manualForm.baseVitC} onChange={(e) => setManualForm({...manualForm, baseVitC: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-1 transition-all placeholder:text-slate-300" placeholder="0" />
                                  <span className="absolute right-3 font-bold text-slate-400 text-[9px]">mg</span>
                               </div>
                             </div>
                             <div className="space-y-1.5">
                               <label htmlFor="microFiber" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 cursor-pointer">Serat</label>
                               <div className="relative flex items-center">
                                  <input id="microFiber" type="number" min="0" value={manualForm.baseFiber} onChange={(e) => setManualForm({...manualForm, baseFiber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-1 transition-all placeholder:text-slate-300" placeholder="0" />
                                  <span className="absolute right-3 font-bold text-slate-400 text-[9px]">g</span>
                               </div>
                             </div>
                             <div className="space-y-1.5">
                               <label htmlFor="microCalcium" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 cursor-pointer">Kalsium</label>
                               <div className="relative flex items-center">
                                  <input id="microCalcium" type="number" min="0" value={manualForm.baseCalcium} onChange={(e) => setManualForm({...manualForm, baseCalcium: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 transition-all placeholder:text-slate-300" placeholder="0" />
                                  <span className="absolute right-3 font-bold text-slate-400 text-[9px]">mg</span>
                               </div>
                             </div>
                             <div className="space-y-1.5">
                               <label htmlFor="microIron" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 cursor-pointer">Zat Besi</label>
                               <div className="relative flex items-center">
                                  <input id="microIron" type="number" min="0" value={manualForm.baseIron} onChange={(e) => setManualForm({...manualForm, baseIron: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-1 transition-all placeholder:text-slate-300" placeholder="0" />
                                  <span className="absolute right-3 font-bold text-slate-400 text-[9px]">mg</span>
                               </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BAGIAN 3: PREDIKSI HASIL (DIKALIKAN PORSI OTOMATIS) */}
                    {calcCals > 0 && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 md:p-6 mb-4 shadow-inner animate-fade-up">
                        <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                          <IconFlame className="w-5 h-5 text-emerald-500" />
                          <h4 className="text-[11px] md:text-xs font-black uppercase tracking-widest text-emerald-600">Total Gizi Dikonsumsi</h4>
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div className="text-center md:text-left">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Kalori</p>
                              <span className="text-5xl font-black text-[#0F172A] tracking-tighter">{calcCals}<span className="text-base text-slate-400 font-bold ml-1.5">Kkal</span></span>
                           </div>
                           
                           <div className="flex justify-center gap-3">
                              <div className="bg-white p-3 rounded-2xl border border-emerald-100 text-center shadow-sm w-20">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Protein</p>
                                <p className="text-sm font-black text-slate-800">{calcPro}g</p>
                              </div>
                              <div className="bg-white p-3 rounded-2xl border border-emerald-100 text-center shadow-sm w-20">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Karbo</p>
                                <p className="text-sm font-black text-slate-800">{calcCar}g</p>
                              </div>
                              <div className="bg-white p-3 rounded-2xl border border-emerald-100 text-center shadow-sm w-20">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Lemak</p>
                                <p className="text-sm font-black text-slate-800">{calcFat}g</p>
                              </div>
                           </div>
                        </div>

                        {/* Prediksi Track Harian */}
                        <div className="mt-6 pt-5 border-t border-emerald-200/50">
                           <div className="flex justify-between text-[10px] font-bold mb-2">
                             <span className="text-slate-500 uppercase tracking-wider">Jatah Kalori Harianmu</span>
                             <span className="text-slate-800">{todayTotals.calories + calcCals} / {userTargets.calories} Kkal</span>
                           </div>
                           <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden flex">
                             <div className="h-full bg-slate-400" style={{ width: `${Math.min((todayTotals.calories / userTargets.calories) * 100, 100)}%`}}></div>
                             <div className={`h-full ${(todayTotals.calories + calcCals) > userTargets.calories ? 'bg-rose-500' : 'bg-[#1EAB57]'}`} style={{ width: `${Math.min((calcCals / userTargets.calories) * 100, 100 - Math.min((todayTotals.calories / userTargets.calories) * 100, 100))}%`}}></div>
                           </div>
                           {(todayTotals.calories + calcCals) > userTargets.calories && (
                              <p className="text-[9px] font-black text-rose-500 mt-2 text-right uppercase tracking-widest">⚠️ Melebihi Batas Harian</p>
                           )}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block cursor-pointer">Kategori Waktu Makan</label>
                      {renderMealTypeDropdown()}
                    </div>

                    <button type="submit" className="w-full bg-[#1EAB57] hover:bg-[#168E46] text-white py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_15px_30px_-5px_rgba(30,171,87,0.4)] active:scale-95 transition-all outline-none text-xs md:text-sm cursor-pointer">
                       <IconPlus className="w-4 h-4 md:w-5 md:h-5" /> Makan Makanan Ini
                    </button>
                 </form>
              </div>
            ) : (
              <div className={`relative w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-lg transition-all duration-500 ${activeMode === 'piring' && !uploadedImage && scanState === 'idle' ? 'h-[75vh] min-h-[450px]' : 'h-[65vh] min-h-[500px]'} lg:h-[550px]`}>
                {!uploadedImage && scanState === "idle" ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </>
                ) : (
                  <div className="w-full h-full relative">
                    <img src={uploadedImage || ""} alt="Captured" className={`w-full h-full object-contain bg-black transition-all duration-1000 ${scanState === 'scanning' ? 'blur-[2px] brightness-75' : ''}`} />
                    
                    {scanState === "success" && scanResult && isFoodItem && scanResult.items.map((item, idx) => {
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

                    {scanState === "success" && isFoodItem && (
                      <button onClick={() => setShowPointers(!showPointers)} className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg hover:bg-black/80 hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer" title={showPointers ? "Sembunyikan Titik Fokus" : "Tampilkan Titik Fokus"}>
                        {showPointers ? <IconEye className="w-5 h-5" /> : <IconEyeOff className="w-5 h-5 text-slate-400" />}
                      </button>
                    )}
                  </div>
                )}

                {scanState === "scanning" && (
                  <>
                    <div className="laser-line"></div>
                    <div className="absolute inset-0 bg-[#1EAB57]/10 animate-pulse mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white backdrop-blur-md px-6 py-3 rounded-full border border-slate-100 flex items-center gap-3 z-30 shadow-md">
                      <IconLoader className="w-4 h-4 text-[#1EAB57] animate-spin" />
                      <span key={scanText} className="text-[11px] font-bold text-[#0F172A] tracking-wider animate-text-change whitespace-nowrap">{scanText}</span>
                    </div>
                  </>
                )}

                {scanState === "success" && !isFoodItem && (
                   <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-fade-in p-6">
                      <IconClose className="w-14 h-14 md:w-16 md:h-16 text-rose-500 mb-4 animate-bounce" />
                      <h3 className="text-white text-xl md:text-2xl font-black text-center">Tidak Dikenali</h3>
                      <p className="text-xs md:text-sm text-slate-300 mb-6 md:mb-8 max-w-[250px] text-center mt-2">Pastikan Anda mengambil gambar makanan dengan pencahayaan yang jelas.</p>
                      <button onClick={handleRetake} className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer">Coba Lagi</button>
                   </div>
                )}

                {scanState !== "success" && scanState !== "scanning" && (
                  <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex items-center justify-center gap-4 md:gap-6 z-30">
                    <button onClick={() => galleryInputRef.current?.click()} className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                      <IconImage className="w-5 h-5" />
                    </button>
                    <button onClick={captureImage} className="w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center p-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer">
                      <div className="w-full h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
                    </button>
                    <button onClick={toggleFlash} className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border hover:scale-105 active:scale-95 transition-all cursor-pointer ${isFlashOn ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400' : 'bg-black/50 border-white/20 text-white'}`}>
                      <IconLightning className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {scanState === "success" && (
              <div className="lg:hidden flex flex-col items-center justify-center mt-2 animate-bounce text-slate-400">
                 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1">Scroll Hasil</p>
                 <IconChevronDown className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className={`w-full xl:w-[450px] shrink-0 flex flex-col gap-6 animate-fade-up`} style={{ animationDelay: '0.2s' }}>
            
            {activeMode === "manual" ? (
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden h-full flex flex-col">
                <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-emerald-50 rounded-full blur-[30px] pointer-events-none"></div>
                <IconSparkles className="w-10 h-10 text-[#1EAB57] mb-6 relative z-10" />
                <h3 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight mb-4 relative z-10">Kalkulasi Otomatis</h3>
                <p className="text-xs md:text-sm font-medium text-slate-500 leading-relaxed relative z-10 mb-6">
                  Tidak perlu repot menghitung manual! Cukup masukkan <span className="font-bold text-slate-700">kandungan gizi per 100 gram</span>, lalu isi berat porsi yang kamu konsumsi.
                </p>
                <div className="mt-auto bg-emerald-50 border border-emerald-100 rounded-xl md:rounded-2xl p-4 md:p-5 relative z-10">
                   <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#1EAB57] mb-2">Pro Tip Gizify</p>
                   <p className="text-[10px] md:text-xs text-slate-600 leading-relaxed font-bold">Informasi gizi (per 100g) ini biasanya bisa langsung kamu temukan di Google atau pada tabel kemasan bagian belakang produk.</p>
                </div>
              </div>
            ) : scanState === "idle" ? (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 relative">
                  <div className="absolute inset-0 rounded-full border border-[#1EAB57] opacity-20 animate-ping"></div>
                  <IconScan className="w-10 h-10 text-[#1EAB57]" />
                </div>
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-3">Siap Menganalisa</h3>
                <p className="text-sm font-medium text-slate-500 max-w-[250px] mb-6">Arahkan kamera ke makanan Anda lalu tekan tombol jepret.</p>
              </div>
            ) : scanState === "scanning" ? (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px] lg:min-h-[400px]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#1EAB57] to-transparent animate-[shimmer_2s_infinite]"></div>
                <div className="relative mb-8">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 border-4 border-slate-100 border-t-[#1EAB57] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconBot className="w-8 h-8 lg:w-10 lg:h-10 text-[#1EAB57] animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-[#0F172A] tracking-tight mb-4">Gizify Bekerja...</h3>
              </div>
            ) : scanState === "success" && scanResult && isFoodItem ? (
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 border border-slate-100 shadow-sm h-full flex flex-col relative animate-scale-in">
                 <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4 shrink-0">
                      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <IconCheckCircle className="w-4 h-4 text-[#1EAB57]" />
                        <span className="text-[9px] md:text-[10px] font-black text-[#1EAB57] uppercase tracking-widest">Sukses Di-scan</span>
                      </div>
                      {selectedItemIndex !== null && (
                        <button onClick={() => setSelectedItemIndex(null)} className="text-[9px] md:text-[10px] bg-white text-slate-600 px-3 py-1.5 rounded-lg font-black hover:bg-slate-50 transition-colors border border-slate-200 hover:border-slate-300 active:scale-95 flex items-center gap-1 group cursor-pointer shadow-sm">
                          <IconChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Total Menu
                        </button>
                      )}
                    </div>
                    
                    <div className="overflow-y-auto custom-scroll pr-1 md:pr-2 flex-1 pb-4">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] leading-tight">
                          {currentDisplayData?.name || "Memuat..."}
                        </h2>
                      </div>
                      
                      <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 md:mb-6 bg-slate-50 w-max px-3 py-1.5 rounded-lg border border-slate-100">
                        Porsi: <span className="text-[#1EAB57] font-black">{(currentDisplayData as any)?.portion || "1 Sajian"}</span>
                      </p>
                      
                      <div className="flex items-center justify-between mb-5 md:mb-6 bg-slate-50 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-inner group">
                        <div className="flex items-center gap-3 md:gap-4 flex-1">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-[1rem] md:rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                            <IconFlame className="w-6 h-6 md:w-7 md:h-7 text-rose-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {selectedItemIndex === null ? "Total Kalori" : "Kalori Komponen Ini"}
                              </p>
                            </div>
                            {isEditingMacro ? (
                               <input type="number" value={editForm.calories} onChange={e => setEditForm({...editForm, calories: +e.target.value})} className="w-20 md:w-24 text-3xl md:text-4xl font-black text-[#1EAB57] tracking-tighter bg-emerald-50 border-b-2 border-[#1EAB57] outline-none text-center rounded-t-md px-1 py-0.5 transition-all" />
                            ) : (
                               <span className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tighter">{currentDisplayData?.calories}<span className="text-sm md:text-lg text-slate-400 font-bold ml-1">Kkal</span></span>
                            )}
                          </div>
                        </div>
                        {/* TOMBOL EDIT MAKRO */}
                        <div className="shrink-0 pl-2">
                           {isEditingMacro ? (
                             <button onClick={saveEditMacro} className="flex items-center gap-1.5 px-3 py-2 bg-[#1EAB57] rounded-xl text-[10px] font-black text-white hover:bg-[#168E46] uppercase tracking-widest shadow-md transition-all active:scale-95 cursor-pointer">
                               <IconCheckCircle className="w-3.5 h-3.5"/> Simpan
                             </button>
                           ) : (
                             <button onClick={startEditMacro} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 hover:text-[#1EAB57] hover:border-[#1EAB57] hover:bg-emerald-50 uppercase tracking-widest shadow-sm transition-all active:scale-95 cursor-pointer" title="Edit jika nilai gizi kurang tepat">
                               <IconEdit3 className="w-3.5 h-3.5"/> Edit Gizi
                             </button>
                           )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-5 md:mb-6">
                        <div className="bg-white border border-slate-100 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col items-center text-center shadow-sm">
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-1.5 md:mb-2 font-black text-[9px] md:text-[10px]">P</div>
                          <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Protein</span>
                          {isEditingMacro ? (
                            <div className="flex items-end justify-center">
                              <input type="number" value={editForm.protein} onChange={e => setEditForm({...editForm, protein: +e.target.value})} className="w-10 md:w-14 text-center text-base md:text-lg font-black text-[#1EAB57] bg-emerald-50/50 border-b-2 border-[#1EAB57] rounded-t-md outline-none px-1 py-0.5 transition-all focus:bg-emerald-50" />
                              <span className="text-[10px] md:text-xs font-bold text-slate-400 mb-0.5 ml-0.5">g</span>
                            </div>
                          ) : (
                            <span className="text-base md:text-lg font-black text-slate-800">{currentDisplayData?.protein}g</span>
                          )}
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col items-center text-center shadow-sm">
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-1.5 md:mb-2 font-black text-[9px] md:text-[10px]">C</div>
                          <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Karbo</span>
                          {isEditingMacro ? (
                            <div className="flex items-end justify-center">
                              <input type="number" value={editForm.carbs} onChange={e => setEditForm({...editForm, carbs: +e.target.value})} className="w-10 md:w-14 text-center text-base md:text-lg font-black text-[#1EAB57] bg-emerald-50/50 border-b-2 border-[#1EAB57] rounded-t-md outline-none px-1 py-0.5 transition-all focus:bg-emerald-50" />
                              <span className="text-[10px] md:text-xs font-bold text-slate-400 mb-0.5 ml-0.5">g</span>
                            </div>
                          ) : (
                            <span className="text-base md:text-lg font-black text-slate-800">{currentDisplayData?.carbs}g</span>
                          )}
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col items-center text-center shadow-sm">
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-1.5 md:mb-2 font-black text-[9px] md:text-[10px]">F</div>
                          <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Lemak</span>
                          {isEditingMacro ? (
                            <div className="flex items-end justify-center">
                              <input type="number" value={editForm.fat} onChange={e => setEditForm({...editForm, fat: +e.target.value})} className="w-10 md:w-14 text-center text-base md:text-lg font-black text-[#1EAB57] bg-emerald-50/50 border-b-2 border-[#1EAB57] rounded-t-md outline-none px-1 py-0.5 transition-all focus:bg-emerald-50" />
                              <span className="text-[10px] md:text-xs font-bold text-slate-400 mb-0.5 ml-0.5">g</span>
                            </div>
                          ) : (
                            <span className="text-base md:text-lg font-black text-slate-800">{currentDisplayData?.fat}g</span>
                          )}
                        </div>
                      </div>

                      <div className="mb-5 md:mb-6">
                        <button onClick={() => setShowMicro(!showMicro)} className="w-full flex items-center justify-between px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer group">
                          <span className="text-[10px] md:text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-[#1EAB57] transition-colors">Lihat Detail Gizi Mikro</span>
                          <IconChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-slate-400 transition-transform duration-300 ${showMicro ? 'rotate-180 text-[#1EAB57]' : ''}`} />
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showMicro ? 'max-h-48 opacity-100 mt-2 md:mt-3' : 'max-h-0 opacity-0'}`}>
                          <div className="bg-white border border-slate-100 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm">
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                              <div className="flex justify-between items-end border-b border-slate-50 pb-1.5 md:pb-2">
                                <span className="text-[10px] md:text-xs font-bold text-slate-600">Vitamin C</span>
                                <span className="text-[10px] md:text-[11px] font-black text-slate-900">{currentDisplayData?.micronutrients?.vitC || "0mg"}</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-slate-50 pb-1.5 md:pb-2">
                                <span className="text-[10px] md:text-xs font-bold text-slate-600">Serat</span>
                                <span className="text-[10px] md:text-[11px] font-black text-[#1EAB57]">{currentDisplayData?.micronutrients?.fiber || "0g"}</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-slate-50 pb-1.5 md:pb-2">
                                <span className="text-[10px] md:text-xs font-bold text-slate-600">Kalsium</span>
                                <span className="text-[10px] md:text-[11px] font-black text-slate-900">{currentDisplayData?.micronutrients?.calcium || "0mg"}</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-slate-50 pb-1.5 md:pb-2">
                                <span className="text-[10px] md:text-xs font-bold text-slate-600">Zat Besi</span>
                                <span className="text-[10px] md:text-[11px] font-black text-slate-900">{currentDisplayData?.micronutrients?.iron || "0mg"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedItemIndex === null && scanResult.total.ai_insight && (
                        <div className="bg-white border border-slate-100 shadow-sm rounded-xl md:rounded-2xl p-4 md:p-5 relative overflow-hidden">
                          <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-emerald-50 rounded-full blur-[20px] pointer-events-none"></div>
                          <IconSparkles className="absolute right-2 bottom-2 w-12 h-12 text-slate-100 pointer-events-none" />
                          <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#1EAB57] flex items-center justify-center shrink-0 border border-emerald-100">
                              <IconBot className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest">Kata Gizify AI:</span>
                          </div>
                          <p className="text-[11px] md:text-xs font-bold text-slate-500 italic leading-relaxed relative z-10">"{scanResult.total.ai_insight}"</p>
                        </div>
                      )}
                    </div>
                    
                    {/* BAGIAN BAWAH KARTU - DROPDOWN & BUTTONS */}
                    <div className="mt-2 md:mt-4 pt-4 border-t border-slate-100 shrink-0">
                      
                      <div className="mb-4">
                        <label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 block cursor-pointer">Kategori Waktu Makan</label>
                        {renderMealTypeDropdown()}
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <button onClick={handleSaveLog} className="col-span-2 bg-[#1EAB57] hover:bg-[#168E46] text-white py-3 md:py-3.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-[0_8px_20px_-5px_rgba(30,171,87,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <IconPlus className="w-3 h-3 md:w-4 md:h-4" /> Makan Makanan Ini
                        </button>
                        
                        <button onClick={() => setShowShareModal(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 md:py-3.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-[0_8px_20px_-5px_rgba(99,102,241,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <IconShare className="w-3 h-3 md:w-4 md:h-4" /> Bagikan
                        </button>
                        
                        <button onClick={handleRetake} className="bg-slate-50 text-slate-600 border border-slate-200 py-3 md:py-3.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase flex items-center justify-center gap-1.5 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer">
                          <IconRefresh className="w-3 h-3 md:w-4 md:h-4" /> Scan Ulang
                        </button>
                      </div>
                    </div>
                 </div>
              </div>
            ) : null}
          </div>
        </div>

        <div id="riwayat-scan" className={`mt-6 md:mt-12 ${isLoaded ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
            <h2 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">Riwayat Scan Terakhir</h2>
          </div>
          
          {recentScans.length === 0 ? (
            <div className="w-full bg-white rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-12 text-center border border-slate-100 border-dashed">
               <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-slate-300">
                  <IconHistory className="w-6 h-6 md:w-8 md:h-8" />
               </div>
               <h4 className="text-base md:text-lg font-black text-slate-800 mb-1.5 md:mb-2">Belum Ada Riwayat</h4>
               <p className="text-xs md:text-sm font-medium text-slate-500 max-w-[250px] md:max-w-[300px] mx-auto">Makanan yang kamu scan dan simpan akan otomatis muncul di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 xl:gap-6">
              {recentScans.map((scan) => (
                <div key={scan.id} className="bg-white rounded-2xl md:rounded-[1.5rem] p-3 md:p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-[#1EAB57]/30 transition-all duration-300 group flex items-center gap-3 md:gap-4 cursor-default">
                  <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl md:rounded-2xl flex flex-col items-center justify-center border shadow-inner group-hover:scale-105 transition-transform duration-500 ${scan.type === "Input Manual" ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-100/50' : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100/50'}`}>
                    {scan.type === "Input Manual" ? <IconEdit3 className="w-6 h-6 md:w-8 md:h-8 text-blue-400 opacity-80" /> : <IconCutlery className="w-6 h-6 md:w-8 md:h-8 text-[#1EAB57] opacity-80" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-1 md:mb-1.5">
                      <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <IconClock className="w-2.5 h-2.5 md:w-3 md:h-3" /> {formatTime(scan.scannedAt)}
                      </span>
                      {scan.mealType && (
                        <span className="text-[8px] md:text-[9px] text-[#1EAB57] font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                          {scan.mealType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs md:text-sm font-black text-slate-900 truncate mb-1.5 md:mb-2 group-hover:text-[#1EAB57] transition-colors leading-snug" title={scan.name}>
                      {scan.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="flex items-center gap-1 bg-rose-50 text-rose-600 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md font-black text-[9px] md:text-[10px]">
                        <IconFlame className="w-2.5 h-2.5 md:w-3 md:h-3"/> {scan.calories} Kkal
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
const IconScan = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 7 3 3 7 3"></polyline><polyline points="17 3 21 3 21 7"></polyline><polyline points="21 17 21 21 17 21"></polyline><polyline points="7 21 3 21 3 17"></polyline></svg>;
const IconSparkles = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconHistory = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline><path d="M12 7v5l4 2"></path></svg>;
const IconCheckCircle = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconLoader = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;
const IconImage = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const IconLightning = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconFlame = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>;
const IconPlus = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconRefresh = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 0 20.49 15"></path></svg>;
const IconClose = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconChevronLeft = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconCutlery = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
const IconClock = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconEye = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconEyeOff = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const IconBot = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconChevronDown = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconShare = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
const IconEdit3 = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;

const IconSunrise = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M5 10.5L3.5 9"></path><path d="M19 10.5l1.5-1.5"></path><path d="M2 17h20"></path><path d="M12 17a5 5 0 0 0-5-5"></path></svg>;
const IconSun = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const IconCookie = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 12v.01"></path><path d="M8 12v.01"></path><path d="M16 12v.01"></path><path d="M12 8v.01"></path><path d="M16 16v.01"></path><path d="M8 16v.01"></path></svg>;
const IconMoon = ({ className }: { className?: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;