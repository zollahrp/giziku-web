"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ==========================================
// CUSTOM COMPONENT: VIP DROPDOWN (Main Form)
// ==========================================
function CustomSelect({ label, value, options, onChange, icon: Icon }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group relative cursor-pointer outline-none ${isOpen ? 'z-[60]' : 'z-10'}`}
      tabIndex={0}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center gap-3 px-3 py-1">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-focus-within:text-[#1EAB57] shadow-sm transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 flex flex-col justify-center relative">
          <label className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-widest group-focus-within:text-[#1EAB57] transition-colors cursor-pointer">
            {label}
          </label>
          <div className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none">
            {options.find((opt: any) => opt.value === value)?.label || value}
          </div>
        </div>
        <IconChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[110%] left-0 right-0 bg-white border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt: any) => (
            <div 
              key={opt.value} 
              onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
              className={`px-5 py-4 text-sm font-black cursor-pointer transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between ${value === opt.value ? 'bg-emerald-50/50 text-[#1EAB57]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {opt.label}
              {value === opt.value && <IconCheck className="w-4 h-4 text-[#1EAB57]" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// CUSTOM COMPONENT: MINI DROPDOWN (Kalender)
// ==========================================
function MiniDropdown({ value, options, onChange }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative z-50 outline-none"
      tabIndex={0}
      onBlur={() => setIsOpen(false)}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <span className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest group-hover:text-[#1EAB57] transition-colors">
          {options.find((o: any) => o.value === value)?.label}
        </span>
        <IconChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#1EAB57] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-white border border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.15)] rounded-2xl w-32 max-h-56 overflow-y-auto custom-scroll z-[100] py-1.5 animate-in fade-in zoom-in-95 duration-200">
          {options.map((opt: any) => (
            <div 
              key={opt.value}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
              className={`px-3 py-3 text-xs md:text-sm font-black text-center cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${value === opt.value ? 'bg-[#1EAB57] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // STATE: INFORMASI DASAR
  const [name, setName] = useState("Zolla Perdana Putra");
  const [email, setEmail] = useState("zollaperdana2907@gmail.com");
  const [gender, setGender] = useState("Pria");
  const [dob, setDob] = useState("2004-07-29");
  const [location, setLocation] = useState("Jakarta, Indonesia");
  
  // STATE: FISIK
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("65");

  // STATE: HASIL KALKULASI (Read-Only)
  const [bmi, setBmi] = useState("0");
  const [bmiStatus, setBmiStatus] = useState("Normal");
  const [idealWeight, setIdealWeight] = useState("0");
  const [calories, setCalories] = useState("0");

  // STATE: LIFESTYLE & TARGET
  const [activity, setActivity] = useState("Sedang");
  const [exercise, setExercise] = useState("1-2x/Minggu");
  const [bodyGoal, setBodyGoal] = useState("Menurunkan Berat Badan");

  // =====================================
  // STATE & LOGIC UNTUK CUSTOM CALENDAR
  // =====================================
  const [calYear, setCalYear] = useState(2004);
  const [calMonth, setCalMonth] = useState(6); // 0-11
  const [calDay, setCalDay] = useState(29);
  
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay(); // 0 = Minggu
  const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const emptyDaysArray = Array.from({length: firstDayOfMonth}, (_, i) => i);

  // Sync kalender pas dibuka
  useEffect(() => {
    if (showDatePicker && dob) {
      const [y, m, d] = dob.split("-");
      setCalYear(parseInt(y));
      setCalMonth(parseInt(m) - 1);
      setCalDay(parseInt(d));
    }
  }, [showDatePicker, dob]);

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } 
    else { setCalMonth(m => m - 1); }
  };
  const handleNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } 
    else { setCalMonth(m => m + 1); }
  };
  const applyCustomDate = () => {
    const m = (calMonth + 1).toString().padStart(2, '0');
    const d = calDay.toString().padStart(2, '0');
    setDob(`${calYear}-${m}-${d}`);
    setShowDatePicker(false);
  };

  // Trigger Animasi Awal
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // =====================================
  // ENGINE RUMUS GIZI AI
  // =====================================
  useEffect(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    let a = currentYear - birthYear;
    if (isNaN(a) || a < 1) a = 22; 

    if (!h || !w || h === 0) return;

    // 1. Hitung BMI
    const hMeter = h / 100;
    const calcBmi = w / (hMeter * hMeter);
    setBmi(calcBmi.toFixed(1));

    // 2. Status BMI
    if (a < 18) {
      setBmiStatus("BMI Anak");
    } else {
      if (calcBmi < 18.5) setBmiStatus("Kurus");
      else if (calcBmi < 25) setBmiStatus("Normal");
      else if (calcBmi < 30) setBmiStatus("Gemuk");
      else setBmiStatus("Obesitas");
    }

    // 3. Berat Ideal (Broca)
    let ideal = 0;
    if (gender === "Pria") {
      ideal = (h - 100) - ((h - 100) * 0.1);
    } else {
      ideal = (h - 100) - ((h - 100) * 0.15);
    }
    setIdealWeight(ideal.toFixed(1));

    // 4. Kebutuhan Kalori
    let bmr = 0;
    if (gender === "Pria") {
      bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }

    let activityFactor = 1.2;
    if (activity === "Sedang") activityFactor = 1.55;
    else if (activity === "Tinggi") activityFactor = 1.725;

    let exerciseFactor = 1.0;
    if (exercise === "1-2x/Minggu") exerciseFactor = 1.05;
    else if (exercise === "3-5x/Minggu") exerciseFactor = 1.10;
    else if (exercise === "Setiap Hari") exerciseFactor = 1.15;

    let totalCals = bmr * activityFactor * exerciseFactor;

    if (bodyGoal === "Menurunkan Berat Badan") totalCals -= 500;
    if (bodyGoal === "Menambah Massa Otot") totalCals += 300;

    setCalories(Math.round(totalCals).toString());

  }, [height, weight, dob, gender, activity, exercise, bodyGoal]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profil Berhasil Disimpan!");
    router.push("/profile");
  };

  const formatDob = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 md:pb-12 flex flex-col gap-6 md:gap-8 relative overflow-x-hidden min-w-0">
      
      {/* CSS Animasi & Scrollbar Kustom */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up {
            opacity: 0;
            transform: translateY(30px);
            animation: fadeUpAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes fadeUpAnim {
            to { opacity: 1; transform: translateY(0); }
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          
          .input-vip-group {
            transition: all 0.3s ease;
          }
          .input-vip-group:focus-within {
            transform: translateY(-2px);
            background-color: #ffffff;
            box-shadow: 0 10px 25px -5px rgba(30,171,87,0.15);
            border-color: #A7F3D0;
          }

          /* Kustom Scrollbar untuk Modal Dropdown */
          .custom-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background: #E2E8F0;
            border-radius: 10px;
          }
          .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: #CBD5E1;
          }
        `
      }} />

      {/* ======================================= */}
      {/* MODAL CUSTOM DATE PICKER (VIP GIZIKU STYLE) */}
      {/* ======================================= */}
      {showDatePicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-slate-100">
            
            <div className="p-6 border-b border-slate-50 flex justify-between items-start bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#E8F8EE] text-[#1EAB57] flex items-center justify-center border border-emerald-100/50">
                  <IconCake className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-[1.1rem] font-black text-slate-900 tracking-tight leading-tight">Tanggal Lahir</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pilih Tanggal</p>
                </div>
              </div>
              <button onClick={() => setShowDatePicker(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer shrink-0">
                <IconClose className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 bg-white">
              
              {/* HEADER KALENDER DENGAN QUICK SELECTOR TAHUN/BULAN */}
              <div className="flex items-center justify-between mb-8 px-1 relative">
                <div onClick={handlePrevMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors active:scale-95">
                  <IconChevronLeft className="w-5 h-5 text-slate-600" />
                </div>

                {/* Pill Bulan & Tahun VIP */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                  <MiniDropdown 
                    value={calMonth} 
                    onChange={setCalMonth} 
                    options={monthNames.map((m, i) => ({ label: m, value: i }))} 
                  />
                  <div className="w-[1.5px] h-4 bg-slate-200 rounded-full mx-1"></div>
                  <MiniDropdown 
                    value={calYear} 
                    onChange={setCalYear} 
                    options={Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(y => ({ label: y.toString(), value: y }))} 
                  />
                </div>

                <div onClick={handleNextMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors active:scale-95">
                  <IconChevronRight className="w-5 h-5 text-slate-600" />
                </div>
              </div>

              {/* Grid Hari */}
              <div className="grid grid-cols-7 gap-2 text-center mb-5">
                {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, i) => (
                  <span key={i} className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{day}</span>
                ))}
              </div>

              {/* Grid Tanggal Aktif (Makin Besar & Bold) */}
              <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center items-center">
                {emptyDaysArray.map(i => <div key={`empty-${i}`}></div>)}
                {daysArray.map(d => (
                  <div 
                    key={d} 
                    onClick={() => setCalDay(d)}
                    className={`w-10 h-10 mx-auto flex items-center justify-center text-sm rounded-full cursor-pointer transition-all ${
                      d === calDay 
                      ? 'text-white bg-[#1EAB57] shadow-[0_6px_15px_rgba(30,171,87,0.4)] scale-110 font-black' 
                      : 'text-slate-700 font-black hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Tombol Terapkan */}
              <button onClick={applyCustomDate} className="mt-8 w-full py-4 bg-[#0F172A] hover:bg-slate-800 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest shadow-[0_8px_20px_rgba(15,23,42,0.2)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2">
                <IconCheck className="w-4 h-4" /> Terapkan Tanggal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIP HEADER BANNER (PREMIUM OVERLAP SAAS) */}
      {/* ======================================= */}
      <div className={`relative w-full mt-2 lg:mt-4 transition-all duration-500 ${isLoaded ? 'animate-fade-up' : 'opacity-0'}`}>
        
        {/* Lapis 1: Background Hijau */}
        <div className="absolute top-0 left-0 right-0 h-[160px] md:h-[180px] bg-gradient-to-r from-[#1EAB57] via-[#24C667] to-[#127236] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_15px_30px_-10px_rgba(30,171,87,0.3)]">
          <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none animate-pulse"></div>
          <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-emerald-900/20 rounded-full blur-[50px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        </div>

        {/* Lapis 2: White Info Card & Avatar Float */}
        <div className="relative pt-[90px] md:pt-[110px] px-2 sm:px-4 md:px-8 pb-2">
          
          <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/60 relative">
            
            {/* Avatar Melayang */}
            <div className="md:absolute md:left-8 md:-top-[4.5rem] flex justify-center -mt-20 md:mt-0 z-20">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[6px] md:border-[8px] border-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] overflow-hidden bg-slate-100 group relative">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]">
                  <IconCamera className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform duration-300" />
                </div>
              </div>
            </div>

            <div className="hidden md:block w-36 shrink-0"></div>

            <div className="flex-1 text-center md:text-left flex flex-col justify-center min-w-0">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl md:text-[2rem] font-black text-slate-900 tracking-tight leading-none truncate max-w-[200px] md:max-w-full">{name || "Nama Lengkap"}</h1>
                <IconVerify className="w-6 h-6 text-[#1EAB57] shrink-0" />
              </div>
              
              <p className="text-sm font-bold text-slate-500 mb-5 truncate max-w-[250px] md:max-w-full">{email || "email@giziku.ai"}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 cursor-default max-w-[200px]">
                  <IconMapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest truncate">{location || "Lokasi Anda"}</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white shadow-sm cursor-default">
                  <span className="text-[11px] font-black uppercase tracking-widest">Edit Mode</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-center justify-center gap-3 md:h-full md:pt-3 mt-4 md:mt-0">
               <Link href="/profile" className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-500 px-6 py-3.5 md:py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer border border-slate-100">
                  Batal
               </Link>
               <button onClick={handleSave} className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-b from-[#24C667] to-[#1EAB57] hover:from-[#1EAB57] hover:to-[#168E46] text-white px-8 py-3.5 md:py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_8px_20px_rgba(30,171,87,0.3)] cursor-pointer group">
                  <IconSave className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Simpan
               </button>
            </div>

          </div>
        </div>
      </div>

      {/* ======================================= */}
      {/* FORM AREA SPLIT (KIRI FORM, KANAN AI RESULT) */}
      {/* ======================================= */}
      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start px-2 sm:px-4 md:px-8 mt-2 relative z-10">
        
        {/* KOLOM KIRI (7 Col) - FORM DATA VIP */}
        <div className={`xl:col-span-7 space-y-6 md:space-y-8 min-w-0 ${isLoaded ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
          
          {/* INFORMASI DASAR */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.03)] relative z-20">
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#E8F8EE] flex items-center justify-center text-[#1EAB57] shadow-[inset_0_2px_5px_rgba(255,255,255,0.8)] border border-emerald-100/50">
                <IconUser className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Data Diri Pribadi</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Identitas & Kontak</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              
              {/* Row 1: Nama & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group">
                  <div className="flex items-center gap-3 px-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-focus-within:text-[#1EAB57] shadow-sm transition-colors">
                      <IconUser className="w-4 h-4" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <label className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-widest group-focus-within:text-[#1EAB57] transition-colors">Nama Lengkap</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-medium" placeholder="Nama..." />
                    </div>
                  </div>
                </div>

                <div className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group">
                  <div className="flex items-center gap-3 px-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-focus-within:text-[#1EAB57] shadow-sm transition-colors">
                      <IconMail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <label className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-widest group-focus-within:text-[#1EAB57] transition-colors">Alamat Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-medium" placeholder="Email..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Gender & DOB */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
                
                {/* Z-Index Dropdown Custom - Paling Depan */}
                <div className="relative z-50">
                  <CustomSelect 
                    label="Jenis Kelamin"
                    value={gender}
                    onChange={setGender}
                    icon={IconGender}
                    options={[
                      { label: "Pria", value: "Pria" },
                      { label: "Wanita", value: "Wanita" }
                    ]}
                  />
                </div>

                {/* TANGGAL LAHIR (CUSTOM TRIGGER) */}
                <div 
                  onClick={() => setShowDatePicker(true)}
                  className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group cursor-pointer relative z-10"
                >
                  <div className="flex items-center gap-3 px-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-[#1EAB57] shadow-sm transition-colors">
                      <IconCake className="w-4 h-4" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <label className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-widest group-hover:text-[#1EAB57] transition-colors cursor-pointer">Tanggal Lahir</label>
                      <div className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none pt-0.5">
                        {formatDob(dob) || "Pilih Tanggal"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Location */}
              <div className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group relative z-0">
                <div className="flex items-center gap-3 px-3 py-1">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-focus-within:text-[#1EAB57] shadow-sm transition-colors">
                    <IconMapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <label className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-widest group-focus-within:text-[#1EAB57] transition-colors">Lokasi Tinggal</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Jakarta, Indonesia" className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-medium" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* FISIK, TARGET & AKTIVITAS */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] relative z-10">
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-[inset_0_2px_5px_rgba(255,255,255,0.8)] border border-amber-100/50">
                <IconActivity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Fisik & Aktivitas</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Penentu Kalori AI</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              
              {/* Row 1: Tinggi & Berat Badan */}
              <div className="grid grid-cols-2 gap-5 z-0">
                <div className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group">
                  <div className="flex items-center gap-3 px-3 py-1">
                    <div className="flex-1 flex flex-col justify-center text-center">
                      <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest group-focus-within:text-[#1EAB57] transition-colors">Tinggi (cm)</label>
                      <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-transparent text-2xl font-black text-slate-900 text-center focus:outline-none" />
                    </div>
                  </div>
                </div>
                
                <div className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group">
                  <div className="flex items-center gap-3 px-3 py-1">
                    <div className="flex-1 flex flex-col justify-center text-center">
                      <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest group-focus-within:text-amber-500 transition-colors">Berat (kg)</label>
                      <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-transparent text-2xl font-black text-slate-900 text-center focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Z-Index Dropdown Kaskade (Biar Gak Ketiban Bawahnya) */}
              <div className="relative z-30">
                <CustomSelect 
                  label="Target Perubahan Tubuh"
                  value={bodyGoal}
                  onChange={setBodyGoal}
                  icon={IconTarget}
                  options={[
                    { label: "Menurunkan Berat (Defisit Kalori)", value: "Menurunkan Berat Badan" },
                    { label: "Menjaga Berat (Maintenance)", value: "Menjaga Berat Badan" },
                    { label: "Menambah Otot (Surplus Kalori)", value: "Menambah Massa Otot" }
                  ]}
                />
              </div>

              <div className="relative z-20">
                <CustomSelect 
                  label="Aktivitas Harian"
                  value={activity}
                  onChange={setActivity}
                  icon={IconActivity}
                  options={[
                    { label: "Rendah (Banyak Duduk / Rebahan)", value: "Rendah" },
                    { label: "Sedang (Aktif Bergerak)", value: "Sedang" },
                    { label: "Tinggi (Pekerja Lapangan / Fisik)", value: "Tinggi" }
                  ]}
                />
              </div>

              <div className="relative z-10">
                <CustomSelect 
                  label="Rutinitas Olahraga"
                  value={exercise}
                  onChange={setExercise}
                  icon={IconDumbbell}
                  options={[
                    { label: "Jarang / Tidak Pernah", value: "Jarang" },
                    { label: "1-2x Seminggu (Ringan)", value: "1-2x/Minggu" },
                    { label: "3-5x Seminggu (Aktif)", value: "3-5x/Minggu" },
                    { label: "Setiap Hari (Sangat Aktif)", value: "Setiap Hari" }
                  ]}
                />
              </div>

            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* KOLOM KANAN (5 Col) - AI RESULTS (WHITE CLEAN) */}
        {/* ========================================== */}
        <div className="xl:col-span-5 relative min-w-0 z-0">
          <div className={`sticky top-8 space-y-6 md:space-y-8 ${isLoaded ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
            
            {/* HASIL KALKULASI AI */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-[50px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
              
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100/50 mb-8 relative z-10 shadow-sm">
                <IconSparkles className="w-4 h-4 text-[#1EAB57] animate-pulse" />
                <span className="text-xs font-black text-[#1EAB57] uppercase tracking-widest">Kalkulasi AI Live</span>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)]">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                      <span>Status BMI</span>
                    </p>
                    <p className={`text-2xl font-black mb-1 ${bmiStatus === 'Normal' ? 'text-[#1EAB57]' : 'text-amber-500'}`}>{bmiStatus}</p>
                    <p className="text-[10px] font-bold text-slate-400">Skor: <span className="text-slate-600">{bmi}</span></p>
                  </div>
                  
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)]">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Berat Ideal</p>
                    <p className="text-2xl font-black text-blue-500 mb-1">{idealWeight} <span className="text-sm font-bold text-slate-400">kg</span></p>
                    <p className="text-[10px] font-bold text-slate-400">Estimasi Broca</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1EAB57] via-[#24C667] to-[#127236] rounded-[1.5rem] p-6 md:p-8 shadow-[0_15px_30px_rgba(30,171,87,0.3)] relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                     <IconActivity className="w-32 h-32 text-white" />
                  </div>
                  
                  <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-widest mb-2 relative z-10 drop-shadow-sm">Target Kalori Harian</p>
                  <p className="text-[2.75rem] md:text-5xl font-black text-white relative z-10 transition-all duration-300 drop-shadow-md tracking-tighter">
                    {calories} <span className="text-sm md:text-base font-semibold text-emerald-200 ml-1 tracking-normal">Kkal</span>
                  </p>
                  <p className="text-[10px] md:text-[11px] font-bold text-emerald-50 mt-4 flex items-center gap-1.5 relative z-10 bg-black/10 w-max px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                    <IconCheck className="w-3.5 h-3.5"/> Menyesuaikan target
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-[1.5rem] p-5 md:p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <IconInfo className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest mb-1.5">Panduan GiziBot</h4>
                <p className="text-[11px] md:text-xs font-medium text-blue-700/80 leading-relaxed">Ubah angka <strong className="text-blue-800">Berat</strong> & <strong className="text-blue-800">Tinggi Badan</strong> di form kiri, lalu perhatikan kotak Kalkulasi AI Live di atas. Sistem otomatis merespon perubahan datamu.</p>
              </div>
            </div>

          </div>
        </div>
        
        {/* Sticky Mobile Save Button */}
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-[60]">
           <button type="submit" className="w-full flex justify-center items-center gap-2.5 bg-[#1EAB57] hover:bg-[#168E46] text-white py-4 rounded-[1.25rem] text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(30,171,87,0.4)] active:scale-95 transition-all border border-[#1EAB57]">
             <IconSave className="w-4 h-4" /> Simpan Profil
           </button>
        </div>

      </form>
    </div>
  );
}

// ==========================================
// KUMPULAN SVG ICONS KUSTOM
// ==========================================
const IconChevronLeft = ({ className, onClick }: any) => <svg onClick={onClick} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRight = ({ className, onClick }: any) => <svg onClick={onClick} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconChevronDown = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconUser = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconMail = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const IconGender = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M14 23v-8h-4v8"></path><path d="M8 9h4c1.1 0 2 .9 2 2v4"></path><path d="M21 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M21 16v7"></path><path d="M18 10h6v6h-6z"></path></svg>;
const IconCake = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"></path><path d="M2 21h20"></path><path d="M7 8v2"></path><path d="M12 8v2"></path><path d="M17 8v2"></path><path d="M7 4h.01"></path><path d="M12 4h.01"></path><path d="M17 4h.01"></path></svg>;
const IconMapPin = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconActivity = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const IconSparkles = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconTarget = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const IconCheck = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconInfo = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const IconSave = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IconDumbbell = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4l-4.8-4.8"></path><path d="M18.6 18.6l-3-3"></path><path d="M5.4 5.4l-3-3"></path><path d="M6.8 3.2l-3.6 3.6"></path><path d="M20.8 17.2l-3.6 3.6"></path><path d="M2 16v6h6"></path><path d="M22 8V2h-6"></path></svg>;
const IconCamera = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>;
const IconVerify = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconClose = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconCalendar = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;