"use client";

export default function HomePage() {
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">Ringkasan Hari Ini</p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Halo, Zolla!
          </h1>
          <p className="text-gray-500 font-medium mt-2">Mari pantau nutrisi dan anggaran makanmu hari ini.</p>
        </div>
        <div className="text-left md:text-right bg-white p-3 rounded-2xl border border-gray-100 shadow-sm w-fit">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tanggal</p>
          <p className="text-sm font-bold text-gray-800">Senin, 14 Agustus</p>
        </div>
      </div>

      {/* Grid Utama Analitik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kartu Kalori Utama */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1A453A] to-emerald-800 rounded-[2rem] p-8 text-white shadow-[0_20px_40px_-15px_rgba(26,69,58,0.4)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-2 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-[9px] font-black text-green-50 uppercase tracking-[0.2em]">Sisa Kalori</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
                550 <span className="text-xl text-green-200/80 font-bold">Kkal</span>
              </h2>
              <p className="text-sm font-medium text-green-100/80 pt-2">
                Kamu telah mengonsumsi 1.450 dari target 2.000 Kkal harian.
              </p>
            </div>

            {/* Circular Progress Bar Simulasi */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#4ADE80" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset="62.8" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">72%</span>
                <span className="text-[10px] font-bold text-green-200 uppercase tracking-widest">Terpenuhi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kartu Anggaran / Budget */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-4">
              <IconWallet />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pengeluaran Makan</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Rp 45.000</h3>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-500">Batas Harian</span>
              <span className="text-gray-900">Rp 75.000</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-[60%] h-full bg-orange-400 rounded-full"></div>
            </div>
            <p className="text-[10px] font-bold text-orange-500 text-right pt-1">Tersisa Rp 30.000</p>
          </div>
        </div>
      </div>

      {/* Grid Bawah: Makronutrisi & Aktivitas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Detail Makronutrisi */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <h3 className="text-lg font-black text-gray-900 mb-6">Distribusi Makronutrisi</h3>
          <div className="space-y-6">
            
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-gray-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Protein</span>
                <span className="text-gray-900">75g / 120g</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-[62%] h-full bg-blue-500 rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-gray-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400"></span>Lemak Sehat</span>
                <span className="text-gray-900">40g / 65g</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-[61%] h-full bg-yellow-400 rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-gray-600 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Karbohidrat</span>
                <span className="text-gray-900">180g / 250g</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-[72%] h-full bg-purple-500 rounded-full"></div>
              </div>
            </div>

          </div>
        </div>

        {/* Aktivitas Terakhir */}
        <div className="lg:col-span-5 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900">Aktivitas Terakhir</h3>
            <button className="text-xs font-bold text-green-600 hover:text-[#1A453A] transition-colors cursor-pointer">Lihat Semua</button>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                <IconCamera />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Scan Nasi Goreng</p>
                <p className="text-xs font-medium text-gray-500">Makan Siang • 450 Kkal</p>
              </div>
              <p className="text-xs font-bold text-gray-400">12:30</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <IconBot />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Tanya GiziBot</p>
                <p className="text-xs font-medium text-gray-500">Rekomendasi sarapan</p>
              </div>
              <p className="text-xs font-bold text-gray-400">07:15</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                <IconFire />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Target Mingguan</p>
                <p className="text-xs font-medium text-gray-500">Berhasil turun 0.5 Kg</p>
              </div>
              <p className="text-xs font-bold text-gray-400">Kemarin</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// KUMPULAN SVG ICONS TAMBAHAN
// ==========================================
const IconWallet = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>;
const IconCamera = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>;
const IconBot = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconFire = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>;