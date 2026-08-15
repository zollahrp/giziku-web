// Path: src/app/(dashboard)/maps/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

// FALLBACK STORES DI LUAR KOMPONEN (Anti Infinite Loop)
const fallbackStores = [
  { id: 1, name: "Pasar Senen Tradisional", distance: "0.8 km", type: "Pasar", status: "Buka", price: "Murah", items: ["tomat", "bayam", "daging ayam", "cabai"], lat: -6.1764, lng: 106.8423 },
  { id: 2, name: "Superindo Fresh", distance: "1.2 km", type: "Supermarket", status: "Buka", price: "Menengah", items: ["susu", "daging sapi", "tomat", "apel"], lat: -6.1814, lng: 106.8282 },
  { id: 3, name: "Tukang Sayur (Mang Ujang)", distance: "0.1 km", type: "Pasar", status: "Buka", price: "Murah", items: ["bayam", "kangkung", "tomat", "tahu", "tempe"], lat: -6.1734, lng: 106.8292 },
  { id: 4, name: "Organic Veggie Hub", distance: "2.5 km", type: "Organik", status: "Tutup 20:00", price: "Premium", items: ["bayam organik", "tomat ceri", "susu almond"], lat: -6.1944, lng: 106.8229 },
];

function MapsContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  
  const searchParams = useSearchParams();
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);
  
  const [userLocation, setUserLocation] = useState({ lat: -6.1754, lng: 106.8272 });
  const [isTracking, setIsTracking] = useState(false);
  const [activeRoute, setActiveRoute] = useState<any>(null);
  const [stores, setStores] = useState<any[]>(fallbackStores);
  
  const filters = ["Semua", "Pasar", "Supermarket", "Organik"];

  // PROFANITY FILTER (DAFTAR KATA KASAR)
  const badWords = ["kontol", "memek", "anjing", "babi", "bangsat", "tolol", "ngentot", "tai", "jancok", "peler", "jembut", "goblok", "bego"];
  const isBannedWord = badWords.some(word => searchQuery.toLowerCase().includes(word));

  const requestLocation = useCallback((showNotification = true) => {
    setIsTracking(true);
    setActiveRoute(null);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setUserLocation({ lat, lng });
          
          try {
            const res = await fetch(`/api/places?lat=${lat}&lng=${lng}`);
            if (res.ok) {
              const data = await res.json();
              if (data.stores && data.stores.length > 0) {
                const storesWithTomat = data.stores.map((s: any) => ({
                  ...s,
                  items: s.items.includes("tomat") ? s.items : ["tomat", ...s.items]
                }));
                setStores(storesWithTomat);
              } else {
                setStores(fallbackStores);
              }
            } else {
              setStores(fallbackStores);
            }
          } catch (err) {
            console.error(err);
            setStores(fallbackStores);
          }

          setIsTracking(false);
          
          if (showNotification) {
            Swal.fire({
              title: "Lokasi Terkunci!",
              text: "Menampilkan sumber bahan segar asli di sekitar Anda.",
              icon: "success",
              toast: true,
              position: "top-end",
              timer: 3000,
              showConfirmButton: false
            });
          }
        },
        (error) => {
          console.error("GPS Error:", error);
          setIsTracking(false);
          if (showNotification) {
            Swal.fire({
              title: "Akses Ditolak",
              text: "Pastikan izin lokasi (GPS) pada browser Anda diaktifkan.",
              icon: "error",
              confirmButtonColor: "#0F172A",
              customClass: { popup: "rounded-[2rem]" }
            });
          }
        },
        { enableHighAccuracy: true } 
      );
    } else {
      setIsTracking(false);
      if (showNotification) {
        Swal.fire("Tidak Didukung", "Browser Anda tidak mendukung fitur Geolocation.", "warning");
      }
    }
  }, []); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      requestLocation(false); 
    }, 100);
    return () => clearTimeout(timer);
  }, [requestLocation]);

  // ==========================================
  // LOGIC FILTER PINTAR (DIPERLUAS DENGAN KATEGORI UMUM)
  // ==========================================
  const searchLower = searchQuery.toLowerCase().trim();
  
  const commonBasics = [
    "air", "es", "garam", "gula", "lada", "merica", "minyak", "kecap", "mentega", "butter", "kaldu", "tepung", "bawang", "beras",
    "buah", "sayur", "sayuran", "daging", "ayam", "ikan", "sapi", "kambing", "telur", "susu", "roti", "kacang", "tahu", "tempe", "cabe", "cabai", "bumbu", "mie", "kopi", "teh"
  ];
  
  const isCommonBasic = commonBasics.some(b => searchLower.includes(b));

  const processedStores = stores.map(store => {
    let newItems = [...store.items];
    if (searchLower !== "" && isCommonBasic) {
      if (!newItems.some(i => i.toLowerCase().includes(searchLower))) {
        newItems.unshift(searchQuery); 
      }
    }
    return { ...store, items: newItems };
  });

  const filteredStores = processedStores.filter(store => {
    const matchFilter = activeFilter === "Semua" || store.type === activeFilter || (activeFilter === "Organik" && store.type === "Organik");
    const matchSearch = searchLower === "" || 
                        store.name.toLowerCase().includes(searchLower) || 
                        store.items.some((item: string) => item.toLowerCase().includes(searchLower));
    return matchFilter && matchSearch;
  });

  const openExternalMaps = (store: any) => {
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = store.lat ? `${store.lat},${store.lng}` : encodeURIComponent(store.name);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const handleRouteToStore = (store: any) => {
    setActiveRoute(store);
  };

  let mapEmbedUrl = `https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  if (activeRoute) {
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = activeRoute.lat ? `${activeRoute.lat},${activeRoute.lng}` : encodeURIComponent(activeRoute.name);
    mapEmbedUrl = `https://maps.google.com/maps?saddr=${origin}&daddr=${destination}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  }

  // TOKO ALTERNATIF ASLI
  const baseFallbackStore = processedStores.find(s => s.type === "Supermarket" || s.type === "Organik") || processedStores.find(s => s.type === "Pasar") || processedStores[0];
  
  let realFallbackStore: any = null;
  if (baseFallbackStore && searchLower !== "") {
    realFallbackStore = {
      ...baseFallbackStore,
      items: [searchQuery, ...baseFallbackStore.items.filter((i: string) => i.toLowerCase() !== searchLower)].slice(0, 4)
    };
  }

  return (
    <div className="w-full h-[85vh] lg:h-[88vh] flex flex-col relative overflow-hidden bg-[#F8FAFC]">
      
      <div className={`absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#1EAB57]/5 rounded-full blur-[120px] pointer-events-none z-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className={`shrink-0 flex items-center justify-between mb-4 lg:mb-6 z-10 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none mb-1 lg:mb-2">Peta Belanja</h1>
          <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5" title="Sistem pencarian toko gizi berbasis lokasi satelit">
            <IconMapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#1EAB57]" /> Sistem Informasi Geografis
          </p>
        </div>
      </div>

      <div className={`flex-1 flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 min-h-0 z-10 transition-all duration-1000 delay-100 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* LEFT PANEL */}
        <div className="w-full lg:w-[400px] h-[55%] lg:h-auto shrink-0 flex flex-col gap-3 lg:gap-6 min-h-0">
          
          <div 
            className={`bg-white/80 backdrop-blur-xl border rounded-xl lg:rounded-[1.5rem] p-2 shadow-sm flex items-center shrink-0 transition-all cursor-text ${isBannedWord ? 'border-rose-300 ring-4 ring-rose-500/10' : 'border-slate-200/60 focus-within:border-[#1EAB57]/50 focus-within:ring-4 focus-within:ring-[#1EAB57]/10'}`}
            title="Ketik nama bahan segar yang ingin Anda cari (Contoh: Tomat, Ayam, Air)"
          >
            <div className={`pl-3 pr-2 ${isBannedWord ? 'text-rose-400' : 'text-slate-400'}`}>
              <IconSearch className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent py-2 lg:py-3 text-xs lg:text-sm font-black outline-none placeholder:text-slate-400 ${isBannedWord ? 'text-rose-600' : 'text-[#0F172A]'}`}
              placeholder="Cari Tomat, Ayam, Buah..."
              title="Kolom pencarian bahan makanan"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-2 shrink-0" title="Filter kategori toko/pasar">
            {filters.map(f => (
              <button 
                key={f} 
                onClick={() => setActiveFilter(f)}
                title={`Tampilkan hanya kategori ${f}`}
                className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest shrink-0 transition-all outline-none cursor-pointer ${activeFilter === f ? 'bg-[#1EAB57] text-white shadow-md scale-105' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-1 pr-3 space-y-3 lg:space-y-4 pb-10 -ml-1">
            {isTracking ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl lg:rounded-[1.5rem] p-4 lg:p-5 border border-slate-100 shadow-sm animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-4 bg-slate-200 rounded-full w-2/3"></div>
                      <div className="h-5 bg-emerald-50 rounded-full w-12"></div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-3 bg-slate-200 rounded-full w-16"></div>
                      <div className="h-3 bg-slate-200 rounded-full w-12"></div>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                      <div className="h-4 bg-slate-200 rounded-full w-16"></div>
                      <div className="h-8 bg-slate-800/10 rounded-xl w-24"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : isBannedWord ? (
              <div className="flex flex-col items-center justify-center py-12 lg:py-16 bg-rose-50/80 rounded-xl lg:rounded-[1.5rem] border-2 border-rose-200 shadow-sm px-6 text-center animate-pulse">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4 border border-rose-200">
                  <IconAlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-base lg:text-lg font-black text-rose-800 mb-2">Astaghfirullah, Istighfar!</h3>
                <p className="text-xs lg:text-sm font-medium text-rose-600 leading-relaxed">
                  Gizify ini aplikasi pemenuhan gizi yang sehat dan halal. <br/> Tolong cari <b className="text-rose-800">Tomat, Bayam, atau Ayam</b> aja ya Komandan! 🙏
                </p>
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="flex flex-col gap-5 pb-10">
                <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl lg:rounded-[1.5rem] p-4 shadow-sm relative overflow-hidden" title="Informasi bahan tidak ditemukan">
                  <div className="flex items-start gap-3 relative z-10">
                    <IconAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[13px] font-black text-amber-800 mb-1 leading-tight">Pencarian Spesifik</h4>
                      <p className="text-[10px] lg:text-xs font-medium text-amber-700/80 leading-relaxed">
                        Bahan <span className="font-bold text-amber-900">"{searchQuery}"</span> sulit dikonfirmasi ketersediaannya pada toko sekitar.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1EAB57] to-[#1A453A] rounded-xl lg:rounded-[1.5rem] p-5 shadow-lg text-white">
                  <h4 className="text-sm lg:text-[15px] font-black mb-2 flex items-center gap-2 text-white">
                    <IconShoppingBag className="w-5 h-5 text-white" /> Beli Online Lebih Mudah?
                  </h4>
                  <p className="text-[11px] lg:text-xs font-medium text-white mb-5 leading-relaxed opacity-95">
                    Untuk bahan spesifik atau langka, kami sangat menyarankan Anda berbelanja melalui E-Commerce.
                  </p>
                  <div className="flex gap-3">
                    <a 
                      href={`https://www.tokopedia.com/search?q=${encodeURIComponent(searchQuery)}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      title={`Buka pencarian Tokopedia untuk: ${searchQuery}`}
                      className="flex-1 bg-white text-[#1EAB57] text-[10px] lg:text-xs font-black uppercase tracking-widest py-3 rounded-xl text-center shadow-sm hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      Tokopedia
                    </a>
                    <a 
                      href={`https://shopee.co.id/search?keyword=${encodeURIComponent(searchQuery)}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      title={`Buka pencarian Shopee untuk: ${searchQuery}`}
                      className="flex-1 bg-white text-[#ee4d2d] text-[10px] lg:text-xs font-black uppercase tracking-widest py-3 rounded-xl text-center shadow-sm hover:bg-orange-50 transition-colors cursor-pointer"
                    >
                      Shopee
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 mt-2 mb-1">
                  <div className="h-[2px] bg-slate-200 flex-1"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">Atau Cek Toko Alternatif</span>
                  <div className="h-[2px] bg-slate-200 flex-1"></div>
                </div>

                {realFallbackStore && (
                  <div 
                    title={`Klik untuk melihat rute ke ${realFallbackStore.name}`}
                    className={`bg-white rounded-xl lg:rounded-[1.5rem] p-4 lg:p-5 transition-all group cursor-pointer ${activeRoute?.id === realFallbackStore.id ? 'border-2 border-[#1EAB57] shadow-[0_8px_25px_rgba(30,171,87,0.2)]' : 'border-2 border-transparent ring-1 ring-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:-translate-y-1'}`}
                    onClick={() => activeRoute?.id !== realFallbackStore.id && handleRouteToStore(realFallbackStore)}
                  >
                    <div className="flex justify-between items-start mb-2 lg:mb-3">
                      <h3 className={`font-black text-sm lg:text-[15px] leading-tight transition-colors pr-2 lg:pr-4 ${activeRoute?.id === realFallbackStore.id ? 'text-[#1EAB57]' : 'text-slate-800 group-hover:text-[#1EAB57]'}`}>
                        {realFallbackStore.name}
                      </h3>
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 lg:px-2.5 rounded-lg text-[8px] lg:text-[9px] font-black tracking-widest shrink-0 shadow-sm" title={`Jarak dari lokasi Anda: ${realFallbackStore.distance}`}>
                        {realFallbackStore.distance}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 lg:gap-3 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                      <span className="flex items-center gap-1" title={`Kategori Toko: ${realFallbackStore.type}`}><IconStore className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-slate-400" /> {realFallbackStore.type}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-[#1EAB57]" title="Prediksi Sistem: Toko ini kemungkinan memiliki bahan Anda">Mungkin Tersedia</span>
                    </div>

                    <div className="flex flex-wrap gap-1 lg:gap-1.5 mb-3 lg:mb-4">
                      {realFallbackStore.items.map((item: string, idx: number) => (
                        <span key={idx} title={`Barang yang tersedia: ${item}`} className={`px-1.5 py-1 lg:px-2 rounded-md text-[8px] lg:text-[9px] font-bold border capitalize ${idx === 0 ? 'bg-emerald-50 text-[#1EAB57] border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 lg:pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1" title={`Tingkat Harga: ${realFallbackStore.price}`}>
                        <IconWallet className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-500" />
                        <span className="text-[10px] lg:text-[11px] font-black text-slate-700">{realFallbackStore.price}</span>
                      </div>
                      
                      {activeRoute?.id === realFallbackStore.id ? (
                        <button 
                          title="Buka rute navigasi di aplikasi asli Google Maps"
                          onClick={(e) => { e.stopPropagation(); openExternalMaps(realFallbackStore); }}
                          className="bg-[#1EAB57] hover:bg-[#168E46] text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest outline-none transition-all flex items-center gap-1 border border-[#1EAB57] active:scale-95 shadow-[0_5px_15px_rgba(30,171,87,0.3)] cursor-pointer"
                        >
                          <IconExternal className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Buka App
                        </button>
                      ) : (
                        <button 
                          title={`Tampilkan jalur navigasi ke ${realFallbackStore.name} di peta`}
                          onClick={(e) => { e.stopPropagation(); handleRouteToStore(realFallbackStore); }}
                          className="bg-[#0F172A] hover:bg-slate-800 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest outline-none transition-all flex items-center gap-1 border border-slate-800 active:scale-95 shadow-md hover:-translate-y-0.5 cursor-pointer"
                        >
                          <IconRoute className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Rute
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              filteredStores.map((store) => {
                const isSelected = activeRoute?.id === store.id;
                return (
                  <div 
                    key={store.id} 
                    title={isSelected ? `Rute aktif menuju ${store.name}` : `Klik untuk melihat rute ke ${store.name}`}
                    className={`bg-white rounded-xl lg:rounded-[1.5rem] p-4 lg:p-5 transition-all group cursor-pointer ${isSelected ? 'border-2 border-[#1EAB57] shadow-[0_8px_25px_rgba(30,171,87,0.2)]' : 'border-2 border-transparent ring-1 ring-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:-translate-y-1'}`}
                    onClick={() => !isSelected && handleRouteToStore(store)}
                  >
                    <div className="flex justify-between items-start mb-2 lg:mb-3">
                      <h3 className={`font-black text-sm lg:text-[15px] leading-tight transition-colors pr-2 lg:pr-4 ${isSelected ? 'text-[#1EAB57]' : 'text-slate-800 group-hover:text-[#1EAB57]'}`}>{store.name}</h3>
                      <span className={`${isSelected ? 'bg-[#1EAB57] text-white' : 'bg-emerald-50 text-[#1EAB57]'} px-2 py-1 lg:px-2.5 rounded-lg text-[8px] lg:text-[9px] font-black tracking-widest shrink-0 shadow-sm transition-colors`} title={`Jarak dari titik Anda: ${store.distance}`}>
                        {store.distance}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 lg:gap-3 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                      <span className="flex items-center gap-1" title={`Kategori Toko: ${store.type}`}><IconStore className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-slate-400" /> {store.type}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className={store.status === "Buka" ? "text-emerald-500" : "text-amber-500"} title={`Status Saat Ini: ${store.status}`}>{store.status}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 lg:gap-1.5 mb-3 lg:mb-4">
                      {store.items.slice(0, 3).map((item: string, idx: number) => {
                        const isMatched = searchQuery && item.toLowerCase().includes(searchQuery.toLowerCase());
                        return (
                          <span key={idx} title={`Tersedia bahan: ${item}`} className={`px-1.5 py-1 lg:px-2 rounded-md text-[8px] lg:text-[9px] font-bold border capitalize cursor-help ${isMatched ? 'bg-emerald-50 text-[#1EAB57] border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                            {item}
                          </span>
                        );
                      })}
                      {store.items.length > 3 && <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 px-1 py-1" title="Masih banyak bahan lainnya">+{store.items.length - 3}</span>}
                    </div>

                    <div className="pt-3 lg:pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1" title={`Tingkat Harga Mayoritas: ${store.price}`}>
                        <IconWallet className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-500" />
                        <span className="text-[10px] lg:text-[11px] font-black text-slate-700">{store.price}</span>
                      </div>
                      
                      {isSelected ? (
                        <button 
                          title="Buka rute ini di Google Maps aslinya"
                          onClick={(e) => { e.stopPropagation(); openExternalMaps(store); }}
                          className="bg-[#1EAB57] hover:bg-[#168E46] text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest outline-none transition-all flex items-center gap-1 border border-[#1EAB57] active:scale-95 shadow-[0_5px_15px_rgba(30,171,87,0.3)] cursor-pointer"
                        >
                          <IconExternal className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Buka App
                        </button>
                      ) : (
                        <button 
                          title={`Tampilkan garis navigasi ke ${store.name}`}
                          onClick={(e) => { e.stopPropagation(); handleRouteToStore(store); }}
                          className="bg-[#0F172A] hover:bg-slate-800 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest outline-none transition-all flex items-center gap-1 border border-slate-800 active:scale-95 shadow-md hover:-translate-y-0.5 cursor-pointer"
                        >
                          <IconRoute className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Rute
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* RIGHT PANEL - ACTIVE GIS MAP */}
        <div className="w-full h-[45%] lg:h-auto lg:flex-1 bg-slate-100 rounded-3xl lg:rounded-[2.5rem] border border-slate-200/60 shadow-md lg:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden relative group shrink-0 lg:shrink">
          
          <div className="absolute inset-0 bg-[#E8F1F2]">
            {isTracking && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm flex-col gap-2 lg:gap-3">
                <IconLoader className="w-6 h-6 lg:w-8 lg:h-8 text-[#1EAB57] animate-spin" />
                <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-600">Satelit OSM...</span>
              </div>
            )}
            
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              src={mapEmbedUrl}
              title="Peta Interaktif GIS Gizify"
              className={`w-full h-full object-cover transition-opacity duration-700 ${isTracking ? 'opacity-0' : 'opacity-100'}`}
            ></iframe>
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.1)_100%)] pointer-events-none z-10"></div>
          </div>

          <div className="absolute top-3 right-3 lg:top-6 lg:right-6 flex flex-col items-end gap-2 lg:gap-3 pointer-events-none z-30">
            <div 
              title={isTracking ? 'Sedang melacak satelit' : activeRoute ? 'Navigasi Rute Aktif' : 'GPS Berhasil Terkunci'}
              className={`backdrop-blur-md px-3 py-1.5 lg:px-4 lg:py-2.5 rounded-xl lg:rounded-2xl shadow-md border pointer-events-auto flex items-center gap-1.5 lg:gap-2 transition-colors cursor-help ${activeRoute ? 'bg-[#1A453A]/90 border-[#1A453A] text-white' : 'bg-white/90 border-white/80 text-slate-800'}`}
            >
              <span className="relative flex h-2 w-2 lg:h-3 lg:w-3">
                <span className={`absolute inline-flex h-full w-full rounded-full ${activeRoute ? 'bg-white' : 'bg-[#1EAB57]'} ${isTracking ? 'animate-ping opacity-100' : 'opacity-30'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 lg:h-3 lg:w-3 ${activeRoute ? 'bg-white' : 'bg-[#1EAB57]'}`}></span>
              </span>
              <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">
                {isTracking ? 'Loading...' : activeRoute ? 'Rute Aktif' : 'GPS Aktif'}
              </span>
            </div>
            
            <div className="flex flex-col gap-2 lg:gap-3 pointer-events-auto">
              <button 
                title="Temukan & Pusatkan Lokasi Saya Saat Ini"
                onClick={() => requestLocation(true)}
                disabled={isTracking}
                className="w-9 h-9 lg:w-12 lg:h-12 bg-white/95 backdrop-blur-md rounded-xl lg:rounded-2xl shadow-md border border-white/80 flex items-center justify-center text-slate-700 hover:text-[#1EAB57] active:scale-95 transition-all outline-none cursor-pointer"
              >
                <IconTarget className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              
              {activeRoute && (
                <button 
                  title="Batalkan dan Tutup Navigasi Rute"
                  onClick={() => setActiveRoute(null)}
                  className="w-9 h-9 lg:w-12 lg:h-12 bg-rose-500/90 backdrop-blur-md rounded-xl lg:rounded-2xl shadow-md border border-rose-400 flex items-center justify-center text-white hover:bg-rose-600 active:scale-95 transition-all outline-none cursor-pointer"
                >
                  <IconClose className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              )}
            </div>
          </div>

          <div 
            title="Informasi Status Peta"
            className="absolute bottom-3 lg:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] lg:w-max lg:min-w-[400px] bg-white/95 backdrop-blur-xl p-3 lg:p-5 rounded-2xl lg:rounded-[1.5rem] shadow-lg border border-white/80 pointer-events-auto z-30 flex items-center justify-between gap-3 lg:gap-4 cursor-default"
          >
            <div>
              {activeRoute ? (
                <>
                  <h3 className="text-xs lg:text-sm font-black text-slate-900 mb-0.5 lg:mb-1 tracking-tight">Menuju: <span className="text-[#1EAB57]">{activeRoute.name}</span></h3>
                  <p className="text-[9px] lg:text-[11px] font-medium text-slate-500 leading-relaxed max-w-[200px] lg:max-w-[300px] line-clamp-2">
                    Jarak <b>{activeRoute.distance}</b>. Ikuti jalur biru atau tekan <b>Buka di App</b>.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xs lg:text-sm font-black text-slate-900 mb-0.5 lg:mb-1 tracking-tight">Cakupan: <span className="text-[#1EAB57]">Radius 3 KM</span></h3>
                  <p className="text-[9px] lg:text-[11px] font-medium text-slate-500 leading-relaxed max-w-[200px] lg:max-w-[300px] line-clamp-2">
                    Pilih tombol <b>Rute</b> pada daftar toko untuk navigasi.
                  </p>
                </>
              )}
            </div>
            <div className={`flex w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl items-center justify-center shrink-0 border transition-colors ${activeRoute ? 'bg-[#1EAB57]/10 border-[#1EAB57]/30' : 'bg-emerald-50 border-emerald-100'}`}>
              {activeRoute ? <IconRoute className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#1EAB57]" /> : <IconMapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#1EAB57]" />}
            </div>
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `
      }} />
    </div>
  );
}

export default function MapsPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#1EAB57] animate-spin"></div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Memuat Peta...</span>
        </div>
      </div>
    }>
      <MapsContent />
    </Suspense>
  );
}

// ==========================================
// SVG ICONS
// ==========================================
const IconSearch = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconMapPin = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconStore = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconWallet = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const IconRoute = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path><circle cx="18" cy="5" r="3"></circle></svg>;
const IconTarget = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const IconLoader = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;
const IconCheck = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconClose = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconExternal = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>;
const IconAlertCircle = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const IconShoppingBag = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;