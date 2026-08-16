// Path: src/components/dashboard/ShareModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadedImage: string | null;
  displayData: any;
}

export default function ShareModal({ isOpen, onClose, uploadedImage, displayData }: ShareModalProps) {
  const [mounted, setMounted] = useState(false);
  const [shareMode, setShareMode] = useState<"portrait" | "story" | "landscape" | "minimalist">("story");
  const [shareColor, setShareColor] = useState<string>("text-white");

  // STATE CUSTOM NUTRISI YANG MAU DIPAMERKAN
  const [showStats, setShowStats] = useState({
    date: true,
    calories: true,
    protein: true,
    carbs: true,
    fat: true,
    fiber: false,
    vitC: false,
    calcium: false,
    iron: false
  });33333333

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !uploadedImage || !displayData || !mounted) return null;

  const toggleStat = (key: keyof typeof showStats) => {
    setShowStats(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasValue = (val: any) => {
    if (val === undefined || val === null || val === '') return false;
    return true; 
  };

  const getStravaFormattedDate = () => {
    const d = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    let str = d.toLocaleDateString('id-ID', options).toUpperCase();
    return str.replace('.', ','); 
  };

  const captureAndShare = async (element: HTMLElement) => {
    try {
      Swal.fire({ title: "Memproses Gambar...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      const dataUrl = await (window as any).htmlToImage.toPng(element, { 
        pixelRatio: 3, 
        skipFonts: true, 
        backgroundColor: null, 
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });

      if (navigator.share) {
         try {
           const res = await fetch(dataUrl);
           const blob = await res.blob();
           const file = new File([blob], `Gizify_Scan_${Date.now()}.png`, { type: "image/png" });
           Swal.close();
           await navigator.share({
             title: "Gizify Scan Result",
             text: "Nggak nyangka kalori makanan ini segini! 😱 Yuk bedah gizi makananmu otomatis pakai AI Gizify. Coba sekarang! 🥗✨",
             files: [file]
           });
           return;
         } catch(e) {
           console.log("Web Share cancelled or failed, falling back to download.");
         }
      }

      const link = document.createElement("a");
      link.download = `Gizify_Scan_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      Swal.fire({ title: "Berhasil Diunduh!", text: "Gambar kartu berhasil disimpan ke perangkatmu.", icon: "success", timer: 2000, showConfirmButton: false, customClass: { popup: "rounded-[2rem]" }});
    } catch (error) {
      console.error("Share Image Error:", error);
      Swal.fire("Gagal", "Terjadi kesalahan saat memproses gambar.", "error");
    }
  };

  const handleDownloadShare = () => {
    const element = document.getElementById("gizify-share-card");
    if (!element) return;

    if (!(window as any).htmlToImage) {
      Swal.fire({ title: "Menyiapkan Modul Share...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js";
      script.onload = () => captureAndShare(element);
      document.body.appendChild(script);
    } else {
      captureAndShare(element);
    }
  };

  const colorOptions = [
    { name: "Putih", class: "text-white", bg: "bg-white" },
    { name: "Hitam", class: "text-slate-900", bg: "bg-slate-900" },
    { name: "Kuning", class: "text-amber-400", bg: "bg-amber-400" },
    { name: "Hijau", class: "text-[#1EAB57]", bg: "bg-[#1EAB57]" },
  ];

  const shareModes = [
    { id: "story", label: "Story (9:16)", aspect: "aspect-[9/16]" },
    { id: "portrait", label: "Portrait (4:5)", aspect: "aspect-[4/5]" },
    { id: "landscape", label: "Landscape", aspect: "aspect-[16/9] md:aspect-[21/9]" },
    { id: "minimalist", label: "Minimalis", aspect: "aspect-square" }
  ];

  const activeMicros = [];
  if (showStats.fiber && hasValue(displayData.micronutrients?.fiber)) activeMicros.push({ label: 'Serat', value: displayData.micronutrients.fiber });
  if (showStats.vitC && hasValue(displayData.micronutrients?.vitC)) activeMicros.push({ label: 'Vit C', value: displayData.micronutrients.vitC });
  if (showStats.calcium && hasValue(displayData.micronutrients?.calcium)) activeMicros.push({ label: 'Kalsium', value: displayData.micronutrients.calcium });
  if (showStats.iron && hasValue(displayData.micronutrients?.iron)) activeMicros.push({ label: 'Zat Besi', value: displayData.micronutrients.iron });

  const isDarkColor = shareColor === "text-slate-900";
  
  const aestheticTextShadow = isDarkColor 
    ? '0px 1px 4px rgba(255,255,255,0.7)' 
    : '0px 1px 3px rgba(0,0,0,0.8)';
  const elegantTitleShadow = isDarkColor 
    ? '0px 2px 8px rgba(255,255,255,0.7)' 
    : '0px 2px 6px rgba(0,0,0,0.9)';

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-slate-900/80 backdrop-blur-md overflow-y-auto custom-scroll animate-fade-in"
      onClick={onClose}
    >
      
      <button onClick={onClose} className="fixed top-6 right-6 w-12 h-12 bg-white/10 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center text-slate-200 transition-all z-[99999] cursor-pointer shadow-lg backdrop-blur-md">
         <IconClose className="w-6 h-6" />
      </button>

      <div className="min-h-full w-full flex items-center justify-center p-4 md:p-8">
        
        <div 
          className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 w-full max-w-[1050px] mx-auto py-12 lg:py-0"
          onClick={(e) => e.stopPropagation()} 
        >
          
          <div className={`flex justify-center transition-all duration-500 w-full shrink-0 ${shareMode === "story" || shareMode === "portrait" ? "max-w-[340px]" : "max-w-[600px]"}`}>
            
            <div id="gizify-share-card" className={`relative bg-transparent rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex w-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${shareModes.find(m => m.id === shareMode)?.aspect}`}>
               
               <div className="absolute inset-0 z-0 bg-transparent">
                  <img src={uploadedImage || ""} className={`w-full h-full object-cover transition-all duration-700 ${shareMode === "minimalist" ? "opacity-30 blur-2xl scale-125" : "opacity-100"}`} crossOrigin="anonymous" style={{ imageRendering: 'auto' }} />
                  {shareMode === "minimalist" && <div className="absolute inset-0 bg-slate-900/60"></div>}
               </div>
               
               <div className="relative z-10 flex flex-col justify-between w-full h-full p-6 md:p-8">
                 
                  <div className="flex justify-between items-start w-full px-1">
                    <div className="flex items-center opacity-100">
                       <span className={`text-[13px] font-black tracking-tight ${isDarkColor ? 'text-slate-900' : 'text-white'}`} style={{ textShadow: aestheticTextShadow }}>Gizify</span>
                    </div>
                    {showStats.date && shareMode !== "minimalist" && (
                      <div className="text-right">
                        <p className={`font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] ${isDarkColor ? 'text-slate-900' : 'text-white/95'}`} style={{ textShadow: aestheticTextShadow }}>
                          {getStravaFormattedDate()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1"></div>

                  {/* ======================================================== */}
                  {/* MAIN STATS GRID (RATA KIRI / LEFT ALIGNED)               */}
                  {/* ======================================================== */}
                  <div className={`flex flex-col items-start w-full px-1 sm:px-2 ${shareMode === "landscape" ? "max-w-md my-auto" : "mt-auto"}`}>
                    
                    {/* JUDUL MAKANAN (RATA KIRI) */}
                    <h2 className={`font-extrabold leading-[1.15] transition-colors duration-300 ${shareColor} text-[1.5rem] md:text-[2rem] w-full text-left mb-1.5 whitespace-normal break-words pr-2`} style={{ letterSpacing: '-0.02em', textShadow: elegantTitleShadow }}>
                      {displayData.name}
                    </h2>

                    {/* SUSUNAN MAKRO: Diubah jadi flex-nowrap biar Lemak stay 1 baris */}
                    <div className="flex flex-row flex-nowrap items-end justify-start gap-x-3 md:gap-x-5 w-full mb-1">
                      
                      {/* KALORI */}
                      {showStats.calories && hasValue(displayData.calories) && (
                        <div className="flex flex-col items-start shrink-0">
                          <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${isDarkColor ? 'text-slate-800' : 'text-white/80'}`} style={{ textShadow: aestheticTextShadow }}>Kalori</span>
                          <span className={`text-[1.75rem] md:text-[2.25rem] font-black ${shareColor} leading-none tracking-tighter`} style={{ textShadow: elegantTitleShadow }}>
                            {displayData.calories} <span className={`text-[8px] md:text-[10px] font-bold ml-0.5 tracking-wide ${isDarkColor ? 'text-slate-800' : 'text-white/90'}`} style={{ textShadow: aestheticTextShadow }}>Kkal</span>
                          </span>
                        </div>
                      )}

                      {/* PROTEIN */}
                      {showStats.protein && hasValue(displayData.protein) && (
                        <div className="flex flex-col items-start shrink-0">
                          <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${isDarkColor ? 'text-slate-800' : 'text-white/80'}`} style={{ textShadow: aestheticTextShadow }}>Protein</span>
                          <span className={`text-[1.25rem] md:text-[1.5rem] font-black ${shareColor} leading-none tracking-tighter`} style={{ textShadow: elegantTitleShadow }}>
                            {displayData.protein}<span className={`text-[9px] md:text-[11px] font-bold ml-0.5 ${isDarkColor ? 'text-slate-800' : 'text-white/90'}`} style={{ textShadow: aestheticTextShadow }}>g</span>
                          </span>
                        </div>
                      )}

                      {/* KARBO */}
                      {showStats.carbs && hasValue(displayData.carbs) && (
                        <div className="flex flex-col items-start shrink-0">
                          <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${isDarkColor ? 'text-slate-800' : 'text-white/80'}`} style={{ textShadow: aestheticTextShadow }}>Karbo</span>
                          <span className={`text-[1.25rem] md:text-[1.5rem] font-black ${shareColor} leading-none tracking-tighter`} style={{ textShadow: elegantTitleShadow }}>
                            {displayData.carbs}<span className={`text-[9px] md:text-[11px] font-bold ml-0.5 ${isDarkColor ? 'text-slate-800' : 'text-white/90'}`} style={{ textShadow: aestheticTextShadow }}>g</span>
                          </span>
                        </div>
                      )}

                      {/* LEMAK */}
                      {showStats.fat && hasValue(displayData.fat) && (
                        <div className="flex flex-col items-start shrink-0">
                          <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${isDarkColor ? 'text-slate-800' : 'text-white/80'}`} style={{ textShadow: aestheticTextShadow }}>Lemak</span>
                          <span className={`text-[1.25rem] md:text-[1.5rem] font-black ${shareColor} leading-none tracking-tighter`} style={{ textShadow: elegantTitleShadow }}>
                            {displayData.fat}<span className={`text-[9px] md:text-[11px] font-bold ml-0.5 ${isDarkColor ? 'text-slate-800' : 'text-white/90'}`} style={{ textShadow: aestheticTextShadow }}>g</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* MIKRONUTRISI */}
                    {activeMicros.length > 0 && (
                      <div className="w-full flex flex-wrap items-center justify-start gap-x-2 gap-y-0.5 mt-1 pt-1.5 border-t border-white/40">
                        {activeMicros.map((micro, idx) => (
                          <div key={micro.label} className="flex items-center gap-1.5">
                            <div className="flex items-baseline gap-1">
                              <span className={`text-[7px] md:text-[8px] font-extrabold uppercase tracking-widest ${isDarkColor ? 'text-slate-800' : 'text-white/90'}`} style={{ textShadow: aestheticTextShadow }}>{micro.label}</span>
                              <span className={`text-[9.5px] md:text-[11px] font-black ${shareColor}`} style={{ textShadow: aestheticTextShadow }}>{micro.value}</span>
                            </div>
                            {idx < activeMicros.length - 1 && <span className={`text-[6px] opacity-70 ${isDarkColor ? 'text-slate-800' : 'text-white'}`} style={{ textShadow: aestheticTextShadow }}>•</span>}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
               </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* AREA KANAN: PANEL KONTROL                 */}
          {/* ========================================= */}
          <div className="w-full max-w-[360px] shrink-0 bg-white border border-slate-100 rounded-[2rem] p-7 flex flex-col gap-7 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden h-max">
             
             <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full blur-[40px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
             
             <div className="relative z-10">
               <h3 className="text-slate-800 font-black text-[1.35rem] mb-1 flex items-center gap-2 tracking-tight">
                 <IconEdit3 className="w-5 h-5 text-emerald-500" /> Editor Kartu
               </h3>
               <p className="text-slate-500 text-xs font-medium">Sesuaikan informasi untuk dibagikan.</p>
             </div>

             <div className="space-y-6 flex-1 relative z-10">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-[0.15em] font-bold mb-3">Layout</p>
                  <div className="grid grid-cols-2 gap-2.5">
                     {shareModes.map(mode => (
                       <button key={mode.id} onClick={() => setShareMode(mode.id as any)} className={`py-3 rounded-full text-xs font-bold transition-all outline-none border cursor-pointer ${shareMode === mode.id ? "bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                         {mode.label}
                       </button>
                     ))}
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-[0.15em] font-bold mb-3">Warna Aksen</p>
                  <div className="flex gap-3.5">
                     {colorOptions.map((color) => (
                        <button key={color.name} onClick={() => setShareColor(color.class)} className={`w-9 h-9 rounded-full border-[3px] transition-all outline-none shadow-sm cursor-pointer ${shareColor === color.class ? 'border-slate-300 scale-110 shadow-md' : 'border-slate-100 hover:scale-110'} ${color.bg}`} title={color.name}></button>
                     ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-slate-400 text-[10px] uppercase tracking-[0.15em] font-bold">Info Ditampilkan</p>
                    <button onClick={() => toggleStat('date')} className={`text-[10px] font-black transition-colors ${showStats.date ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
                      {showStats.date ? '✔ Tgl Nyala' : 'O Tgl Mati'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {[
                       { key: 'calories', label: 'Kalori' },
                       { key: 'protein', label: 'Protein' },
                       { key: 'carbs', label: 'Karbo' },
                       { key: 'fat', label: 'Lemak' },
                       { key: 'fiber', label: 'Serat' },
                       { key: 'vitC', label: 'Vit C' },
                       { key: 'calcium', label: 'Kalsium' },
                       { key: 'iron', label: 'Zat Besi' }
                     ].map(stat => (
                        <button 
                          key={stat.key} 
                          onClick={() => toggleStat(stat.key as keyof typeof showStats)} 
                          className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all outline-none border cursor-pointer ${showStats[stat.key as keyof typeof showStats] ? 'bg-emerald-50 text-emerald-600 border-emerald-500 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'}`}
                        >
                           {stat.label}
                        </button>
                     ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 font-medium italic">*Data 0g / 0mg sekarang akan tetap dipamerkan!</p>
                </div>
             </div>

             <button onClick={handleDownloadShare} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2 cursor-pointer border border-emerald-400 relative z-10">
               <IconDownload className="w-4 h-4" /> Share Gambar
             </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}

// ICONS
const IconClose = ({ className, style }: { className?: string, style?: React.CSSProperties }) => <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconLightning = ({ className, style }: { className?: string, style?: React.CSSProperties }) => <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconDownload = ({ className, style }: { className?: string, style?: React.CSSProperties }) => <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconEdit3 = ({ className, style }: { className?: string, style?: React.CSSProperties }) => <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;