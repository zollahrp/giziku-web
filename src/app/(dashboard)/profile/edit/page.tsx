// Path: src/app/(dashboard)/profile/edit/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// ==========================================
// CUSTOM COMPONENT: VIP SINGLE DROPDOWN
// ==========================================
function CustomSelect({ label, value, options, onChange, icon: Icon, color = "text-[#1EAB57]", bgHover = "hover:bg-emerald-50" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group relative cursor-pointer outline-none ${isOpen ? 'z-[60]' : 'z-10'}`} onClick={() => setIsOpen(!isOpen)}>
      <div className="flex items-center gap-3 px-3 py-1">
        <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:${color} shadow-sm transition-colors`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 flex flex-col justify-center relative">
          <label className={`text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-widest group-hover:${color} transition-colors cursor-pointer`}>
            {label}
          </label>
          <div className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none truncate">
            {options.find((opt: any) => opt.value === value)?.label || value || "Pilih Opsi"}
          </div>
        </div>
        <IconChevronDown className={`w-4 h-4 shrink-0 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[110%] left-0 right-0 bg-white border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden z-[100] animate-fade-in-down custom-scroll max-h-64 overflow-y-auto">
          {options.map((opt: any) => (
            <div 
              key={opt.value} 
              onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
              className={`px-5 py-3.5 text-sm font-black cursor-pointer transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between ${value === opt.value ? `bg-slate-50 ${color}` : `text-slate-600 ${bgHover} hover:text-slate-900`}`}
            >
              {opt.label}
              {value === opt.value && <IconCheck className={`w-4 h-4 ${color}`} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// CUSTOM COMPONENT: VIP MULTI-SELECT DROPDOWN
// ==========================================
function CustomMultiSelect({ label, values = [], options, onChange, icon: Icon, color = "text-[#1EAB57]" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (val: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (values.includes(val)) {
      onChange(values.filter((v: string) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const removeOption = (val: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(values.filter((v: string) => v !== val));
  };

  return (
    <div ref={dropdownRef} className={`input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group relative cursor-pointer outline-none ${isOpen ? 'z-[70]' : 'z-10'}`} onClick={() => setIsOpen(!isOpen)}>
      <div className="flex items-start gap-3 px-3 py-1.5 min-h-[48px]">
        <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:${color} shadow-sm transition-colors mt-0.5 shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 flex flex-col justify-center relative">
          <label className={`text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-widest group-hover:${color} transition-colors cursor-pointer`}>
            {label}
          </label>
          <div className="flex flex-wrap gap-1.5 mb-1">
            {values.length === 0 ? (
              <span className="text-sm font-bold text-slate-400">Pilih opsi (Bisa lebih dari satu)...</span>
            ) : (
              values.map((val: string) => {
                const optLabel = options.find((o: any) => o.value === val)?.label || val;
                return (
                  <span key={val} className="flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                    {optLabel}
                    <div onClick={(e) => removeOption(val, e)} className="hover:bg-rose-100 hover:text-rose-600 rounded-full p-0.5 ml-0.5 transition-colors">
                      <IconClose className="w-2.5 h-2.5" />
                    </div>
                  </span>
                )
              })
            )}
          </div>
        </div>
        <IconChevronDown className={`w-4 h-4 shrink-0 text-slate-300 transition-transform duration-300 mt-2 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[110%] left-0 right-0 bg-white border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden z-[100] animate-fade-in-down custom-scroll max-h-64 overflow-y-auto p-2">
          {options.map((opt: any) => {
            const isSelected = values.includes(opt.value);
            return (
              <div 
                key={opt.value} 
                onMouseDown={(e) => toggleOption(opt.value, e)}
                className={`px-4 py-3 m-1 text-sm font-black cursor-pointer transition-all rounded-xl flex items-center gap-3 ${isSelected ? 'bg-emerald-50 text-[#1EAB57] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#1EAB57] border-[#1EAB57]' : 'bg-white border-slate-300'}`}>
                  {isSelected && <IconCheck className="w-3.5 h-3.5 text-white" />}
                </div>
                {opt.label}
              </div>
            );
          })}
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
    <div className="relative z-50 outline-none" tabIndex={0} onBlur={() => setIsOpen(false)}>
      <div onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
        <span className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest group-hover:text-[#1EAB57] transition-colors">
          {options.find((o: any) => o.value === value)?.label}
        </span>
        <IconChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#1EAB57] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-white border border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.15)] rounded-2xl w-32 max-h-56 overflow-y-auto custom-scroll z-[100] py-1.5 animate-fade-in-down">
          {options.map((opt: any) => (
            <div key={opt.value} onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }} className={`px-3 py-3 text-xs md:text-sm font-black text-center cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${value === opt.value ? 'bg-[#1EAB57] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
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
  const [userId, setUserId] = useState<string | null>(null);

  // =====================================
  // STATE: INFORMASI DASAR
  // =====================================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Pria");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("BASIC");
  const [photoURL, setPhotoURL] = useState(""); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // =====================================
  // STATE: FISIK & AKTIVITAS
  // =====================================
  const [height, setHeight] = useState("0");
  const [weight, setWeight] = useState("0");
  const [activity, setActivity] = useState("Sedang");
  const [exercise, setExercise] = useState("1-2x/Minggu");
  const [bodyGoal, setBodyGoal] = useState("Menurunkan Berat Badan");

  // =====================================
  // STATE: PREFERENSI DIET (AHLI GIZI)
  // =====================================
  const [dietTypes, setDietTypes] = useState<string[]>([]); // MULTI-SELECT
  const [macroFocus, setMacroFocus] = useState("Seimbang");
  const [mealsPerDay, setMealsPerDay] = useState("3 Kali Sehari");
  const [waterIntake, setWaterIntake] = useState("2 Liter");

  // =====================================
  // STATE: MEDIS & PANTANGAN
  // =====================================
  const [allergies, setAllergies] = useState<string[]>([]); // MULTI-SELECT
  const [dislikedFoods, setDislikedFoods] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");

  // =====================================
  // STATE: DAPUR & KEMAMPUAN (NEW)
  // =====================================
  const [cookingSkill, setCookingSkill] = useState("Pemula");
  const [kitchenEquipments, setKitchenEquipments] = useState<string[]>([]); // MULTI-SELECT

  // =====================================
  // STATE: HASIL KALKULASI AI (LIVE)
  // =====================================
  const [bmi, setBmi] = useState("0");
  const [bmiStatus, setBmiStatus] = useState("Normal");
  const [idealWeight, setIdealWeight] = useState("0");
  const [calories, setCalories] = useState("0");
  const [macros, setMacros] = useState({ pro: 0, car: 0, fat: 0 });

  // =====================================
  // OPSI MULTI-SELECT
  // =====================================
  const dietOptions = [
    { label: "Halal (No Pork, No Alcohol)", value: "Halal" },
    { label: "Vegetarian", value: "Vegetarian" },
    { label: "Vegan", value: "Vegan" },
    { label: "Pescetarian", value: "Pescetarian" },
    { label: "Keto (Sangat Rendah Karbo)", value: "Keto" },
    { label: "Rendah Gula (Low Sugar)", value: "Rendah Gula" },
    { label: "Bebas Gluten (Gluten-Free)", value: "Bebas Gluten" },
    { label: "Bebas Laktosa (Dairy-Free)", value: "Bebas Laktosa" }
  ];

  const allergyOptions = [
    { label: "Kacang-kacangan (Peanuts)", value: "Kacang" },
    { label: "Seafood (Ikan, Udang)", value: "Seafood" },
    { label: "Telur", value: "Telur" },
    { label: "Susu Sapi (Dairy)", value: "Susu Sapi" },
    { label: "Kedelai (Soy)", value: "Kedelai" },
    { label: "Gandum (Wheat)", value: "Gandum" }
  ];

  const kitchenOptions = [
    { label: "Kompor Gas / Listrik", value: "Kompor" },
    { label: "Microwave", value: "Microwave" },
    { label: "Oven Panggang", value: "Oven" },
    { label: "Air Fryer", value: "Air Fryer" },
    { label: "Blender / Chopper", value: "Blender" },
    { label: "Rice Cooker", value: "Rice Cooker" },
    { label: "Kulkas / Freezer", value: "Kulkas" },
    { label: "Timbangan Makanan", value: "Timbangan" }
  ];

  // =====================================
  // AMBIL DATA DARI FIREBASE SAAT MOUNT
  // =====================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setName(data.name || user.displayName || "");
            setEmail(data.email || user.email || "");
            setGender(data.gender || "Pria");
            setDob(data.birthDate || "2000-01-01");
            setLocation(data.location || "");
            setRole(data.role || "BASIC");
            setPhotoURL(data.photoURL || user.photoURL || "");
            
            // Fisik
            setHeight(data.height || "170");
            setWeight(data.weight || "65");
            setActivity(data.activity || "Sedang");
            setExercise(data.exercise || "1-2x/Minggu");
            setBodyGoal(data.bodyGoal || "Menurunkan Berat Badan");
            
            // Diet (Migrasi fallback jika string lama ke array)
            const savedDiet = data.dietType || data.dietTypes;
            if (Array.isArray(savedDiet)) setDietTypes(savedDiet);
            else if (typeof savedDiet === 'string' && savedDiet !== "Normal / Bebas") setDietTypes([savedDiet]);
            
            setMacroFocus(data.macroFocus || "Seimbang");
            setMealsPerDay(data.mealsPerDay || "3 Kali Sehari");
            setWaterIntake(data.waterIntake || "2 Liter");

            // Medis
            setAllergies(data.allergies || []);
            setDislikedFoods(data.dislikedFoods || "");
            setMedicalHistory(data.medicalHistory || "Tidak Ada");

            // Dapur
            setCookingSkill(data.cookingSkill || "Pemula");
            setKitchenEquipments(data.kitchenEquipments || ["Kompor", "Rice Cooker"]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoaded(true); 
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // =====================================
  // FUNGSI UPLOAD FOTO (Maks 1 MB)
  // =====================================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1048576) {
      Swal.fire({
        title: "Ukuran Terlalu Besar",
        text: "Maksimal ukuran foto adalah 1 MB.",
        icon: "error",
        customClass: { popup: "rounded-[2rem]" }
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPhotoURL(reader.result as string);
    reader.readAsDataURL(file);
  };

  const getInitials = (nama: string) => {
    if (!nama) return "G";
    return nama.charAt(0).toUpperCase();
  };

  const fetchCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLocation("Sedang mencari...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`);
            const data = await response.json();
            const city = data.city || data.locality || "Kota";
            const country = data.countryName || "Indonesia";
            setLocation(`${city}, ${country}`);
          } catch (error) { setLocation("Gagal memuat lokasi"); }
        },
        (error) => { setLocation("Izin ditolak"); }
      );
    } else {
      alert("Browser Anda tidak mendukung fitur Lokasi.");
    }
  };

  // =====================================
  // CUSTOM CALENDAR LOGIC
  // =====================================
  const [calYear, setCalYear] = useState(new Date().getFullYear() - 20);
  const [calMonth, setCalMonth] = useState(0); 
  const [calDay, setCalDay] = useState(1);
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const emptyDaysArray = Array.from({length: firstDayOfMonth}, (_, i) => i);

  useEffect(() => {
    if (showDatePicker && dob) {
      const [y, m, d] = dob.split("-");
      if (y && m && d) {
        setCalYear(parseInt(y));
        setCalMonth(parseInt(m) - 1);
        setCalDay(parseInt(d));
      }
    }
  }, [showDatePicker, dob]);

  const handlePrevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else { setCalMonth(m => m - 1); } };
  const handleNextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else { setCalMonth(m => m + 1); } };
  const applyCustomDate = () => {
    const m = (calMonth + 1).toString().padStart(2, '0');
    const d = calDay.toString().padStart(2, '0');
    setDob(`${calYear}-${m}-${d}`);
    setShowDatePicker(false);
  };

  // =========================================================================
  // ENGINE RUMUS GIZIFY PROFESIONAL (LIVE) - BASED ON SCIENTIFIC JOURNALS
  // =========================================================================
  useEffect(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    
    // 1. HITUNG USIA PRESISI (Berdasarkan Tahun, Bulan, dan Tanggal)
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (isNaN(age) || age < 1) age = 22; // Fallback jika tanggal error

    if (!h || !w || h === 0) return;

    // =====================================================================
    // A. HITUNG BMI (Body Mass Index)
    // Jurnal/Standar: World Health Organization (WHO) BMI Classifications
    // =====================================================================
    const hMeter = h / 100;
    const calcBmi = w / (hMeter * hMeter);
    setBmi(calcBmi.toFixed(1));

    // Penyesuaian khusus lansia (Berdasarkan National Research Council)
    // Lansia punya standar BMI normal yang sedikit lebih tinggi (22 - 27) untuk harapan hidup lebih baik
    if (age < 18) {
      setBmiStatus("BMI Anak (Butuh Kurva)");
    } else if (age >= 65) {
      if (calcBmi < 22) setBmiStatus("Kurus (Lansia)");
      else if (calcBmi <= 27) setBmiStatus("Normal (Lansia)");
      else setBmiStatus("Gemuk (Lansia)");
    } else {
      // Standar Dewasa (WHO Asia-Pacific Guidelines - Opsional untuk akurasi Indo)
      if (calcBmi < 18.5) setBmiStatus("Kurus");
      else if (calcBmi < 25) setBmiStatus("Normal");
      else if (calcBmi < 30) setBmiStatus("Gemuk");
      else setBmiStatus("Obesitas");
    }

    // =====================================================================
    // B. HITUNG BERAT BADAN IDEAL (BBI)
    // Jurnal/Standar: Modifikasi Formula Paul Broca (1871) oleh WHO
    // =====================================================================
    let ideal = 0;
    if (gender === "Pria") {
      // Pria < 160cm tidak dikurangi 10%
      ideal = h < 160 ? (h - 100) : (h - 100) - ((h - 100) * 0.10);
    } else {
      // Wanita < 150cm tidak dikurangi 15%
      ideal = h < 150 ? (h - 100) : (h - 100) - ((h - 100) * 0.15);
    }
    setIdealWeight(ideal.toFixed(1));

    // =====================================================================
    // C. HITUNG BMR (Basal Metabolic Rate)
    // Jurnal/Standar: Mifflin, M.D., St Jeor, S.T., et al. (1990). 
    // "A new predictive equation for resting energy expenditure in healthy individuals". Am J Clin Nutr.
    // Bukti medis menunjukkan Mifflin-St Jeor lebih akurat dibanding Harris-Benedict untuk era modern.
    // =====================================================================
    let bmr = 0;
    if (gender === "Pria") {
      bmr = (10 * w) + (6.25 * h) - (5 * age) + 5;
    } else {
      bmr = (10 * w) + (6.25 * h) - (5 * age) - 161;
    }

    // =====================================================================
    // D. HITUNG TDEE (Total Daily Energy Expenditure)
    // Jurnal/Standar: FAO/WHO/UNU Expert Consultation (2001) - Physical Activity Levels (PAL)
    // Kombinasi dari aktivitas harian dan intensitas olahraga
    // =====================================================================
    let pal = 1.2; // Sedentary (Default)
    
    if (activity === "Rendah") {
      if (exercise === "Jarang") pal = 1.2;          // Sangat pasif
      else if (exercise === "1-2x/Minggu") pal = 1.375; // Ringan
      else pal = 1.45;                               // Rebahan tapi gym rajin
    } else if (activity === "Sedang") {
      if (exercise === "Jarang") pal = 1.375;
      else if (exercise === "1-2x/Minggu") pal = 1.55;  // Moderately active (Standar)
      else if (exercise === "3-5x/Minggu") pal = 1.65;
      else pal = 1.725;
    } else if (activity === "Tinggi") {
      if (exercise === "Jarang") pal = 1.55;
      else if (exercise === "1-2x/Minggu") pal = 1.725; // Very active
      else pal = 1.9;                                   // Extremely active (Kuli + Gym)
    }
    
    let totalCals = bmr * pal;

    // =====================================================================
    // E. PENYESUAIAN GOAL (SMART UX AUTO-TOGGLE) & SAFETY NET
    // Jurnal/Standar: American College of Sports Medicine (ACSM) Guidelines
    // =====================================================================
    let currentMacroFocus = macroFocus;

    // UX Logic: Otomatis ubah rekomendasi Makro sesuai Body Goal
    if (bodyGoal === "Menambah Massa Otot") {
      totalCals += 300; // Surplus sehat 300-500 kkal (Mencegah nambah lemak doang)
      currentMacroFocus = "Tinggi Protein (Muscle)";
      setMacroFocus("Tinggi Protein (Muscle)"); // Auto toggle!
    } 
    else if (bodyGoal === "Menurunkan Berat Badan") {
      totalCals -= 500; // Defisit sehat 500 kkal (Estimasi turun 0.5 kg/minggu)
      // Jika user sedang diet, kita sarankan Rendah Karbo atau Tinggi Protein
      if (currentMacroFocus === "Seimbang" || currentMacroFocus === "Sangat Rendah Karbo (Keto)") {
         currentMacroFocus = "Rendah Karbohidrat";
         setMacroFocus("Rendah Karbohidrat"); // Auto toggle!
      }
    }

    // ACSM Safety Net: Tidak boleh defisit di bawah batas aman metabolisme organ
    let finalCals = Math.round(totalCals);
    if (gender === "Wanita" && finalCals < 1200) finalCals = 1200;
    if (gender === "Pria" && finalCals < 1500) finalCals = 1500;

    setCalories(finalCals.toString());

    // =====================================================================
    // F. DISTRIBUSI MAKRONUTRISI
    // Jurnal/Standar: Atwater General Factor System (Pro 4, Car 4, Fat 9 kkal/g)
    // Dan AMDR (Acceptable Macronutrient Distribution Range) dari IOM.
    // =====================================================================
    let proPct = 0.3, carPct = 0.4, fatPct = 0.3; // Default (AMDR Seimbang)

    // Override jika ada diet Keto atau preferensi makro
    if (dietTypes.includes("Keto") || currentMacroFocus === "Sangat Rendah Karbo (Keto)") {
      proPct = 0.25; carPct = 0.05; fatPct = 0.70; // Standar Ketogenic
    } else if (currentMacroFocus === "Tinggi Protein (Muscle)") {
      proPct = 0.40; carPct = 0.30; fatPct = 0.30; // Standar Bodybuilding
    } else if (currentMacroFocus === "Rendah Karbohidrat") {
      proPct = 0.35; carPct = 0.20; fatPct = 0.45; // Low Carb High Fat (LCHF)
    } else if (currentMacroFocus === "Rendah Lemak") {
      proPct = 0.30; carPct = 0.50; fatPct = 0.20; // Standar Low Fat
    }

    // Konversi Persentase Kalori ke Gram
    const proteinGram = Math.round((finalCals * proPct) / 4);
    const carbsGram = Math.round((finalCals * carPct) / 4);
    const fatGram = Math.round((finalCals * fatPct) / 9);

    setMacros({ pro: proteinGram, car: carbsGram, fat: fatGram });

  }, [height, weight, dob, gender, activity, exercise, bodyGoal, macroFocus, dietTypes]);

  // =====================================
  // FUNGSI SIMPAN KE FIREBASE
  // =====================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, {
        name, gender, birthDate: dob, location, photoURL, 
        height, weight, activity, exercise, bodyGoal,
        dietTypes, macroFocus, mealsPerDay, waterIntake, // Diet Baru
        allergies, dislikedFoods, medicalHistory, // Medis
        cookingSkill, kitchenEquipments, // Dapur Baru
        bmi, bmiStatus, idealWeight, calories, macros // Hasil AI
      }, { merge: true });

      Swal.fire({
        title: "Personalisasi Sukses!",
        text: "GiziBot kini mengenali preferensi genetik & dapurmu.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "rounded-[2rem]" }
      }).then(() => {
        router.push("/profile");
      });

    } catch (error) {
      console.error("Gagal simpan profil:", error);
      Swal.fire("Error!", "Terjadi kesalahan saat menyimpan data.", "error");
    }
  };

  const formatDob = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    if(!day || !month || !year) return "";
    return `${day}/${month}/${year}`;
  };

  // =======================================
  // UI SKELETON LOADER (Mencegah Blank/Popping)
  // =======================================
  if (!isLoaded) {
    return (
      <div className="w-full pb-24 md:pb-12 flex flex-col gap-6 md:gap-8 relative overflow-x-hidden min-w-0 animate-in fade-in duration-500 mt-2 lg:mt-4 px-2 sm:px-4 md:px-8">
        <div className="w-full h-[160px] md:h-[180px] bg-slate-200 animate-pulse rounded-[2rem] md:rounded-[2.5rem]"></div>
        <div className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm border border-slate-100 -mt-16 md:-mt-24 mx-2 md:mx-0 relative z-10">
           <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-slate-200 animate-pulse border-[6px] md:border-[8px] border-white shrink-0 -mt-12 md:-mt-8"></div>
           <div className="flex-1 space-y-4 w-full md:mt-10">
              <div className="h-8 bg-slate-200 animate-pulse rounded-xl w-1/2 md:w-1/3 mx-auto md:mx-0"></div>
              <div className="h-4 bg-slate-200 animate-pulse rounded-lg w-1/3 md:w-1/4 mx-auto md:mx-0"></div>
              <div className="flex gap-3 justify-center md:justify-start pt-2">
                 <div className="h-8 bg-slate-200 animate-pulse rounded-xl w-24"></div>
                 <div className="h-8 bg-slate-200 animate-pulse rounded-xl w-32"></div>
              </div>
           </div>
           <div className="w-full md:w-32 h-12 bg-slate-200 animate-pulse rounded-2xl md:mt-10"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 mt-2">
           <div className="xl:col-span-7 space-y-6 md:space-y-8">
              <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 h-[400px] flex flex-col">
                 <div className="flex gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-200 animate-pulse rounded-xl shrink-0"></div>
                    <div className="space-y-2 flex-1 pt-1">
                       <div className="h-5 bg-slate-200 animate-pulse rounded-md w-1/3"></div>
                       <div className="h-3 bg-slate-200 animate-pulse rounded-md w-1/4"></div>
                    </div>
                 </div>
                 <div className="space-y-4 flex-1">
                    <div className="h-12 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
                    <div className="h-12 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
                    <div className="h-24 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
                 </div>
              </div>
           </div>
           <div className="xl:col-span-5 space-y-6 md:space-y-8">
              <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 h-[600px]">
                 <div className="h-8 bg-slate-200 animate-pulse rounded-xl w-48 mb-8"></div>
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="h-28 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
                    <div className="h-28 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
                 </div>
                 <div className="h-36 bg-slate-200 animate-pulse rounded-[2rem] w-full mb-6"></div>
                 <div className="grid grid-cols-3 gap-3">
                   <div className="h-24 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
                   <div className="h-24 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
                   <div className="h-24 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    )
  }

  // =======================================
  // UI UTAMA (Tampil kalau data udah siap)
  // =======================================
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 md:pb-12 flex flex-col gap-6 md:gap-8 relative overflow-x-hidden min-w-0">
      
      {/* CSS Animasi Khusus & Scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(30px); animation: fadeUpAnim 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-in-down { opacity: 0; transform: translateY(-10px); animation: fadeInDownAnim 0.3s ease-out forwards; }
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInDownAnim { to { opacity: 1; transform: translateY(0); } }
          .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; } .delay-300 { animation-delay: 0.3s; }
          .input-vip-group { transition: all 0.3s ease; }
          .input-vip-group:focus-within { transform: translateY(-2px); background-color: #ffffff; box-shadow: 0 10px 25px -5px rgba(30,171,87,0.15); border-color: #A7F3D0; }
          .custom-scroll::-webkit-scrollbar { width: 5px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        `
      }} />

      {/* MODAL DATE PICKER */}
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
              <button type="button" onClick={() => setShowDatePicker(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer shrink-0">
                <IconClose className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 bg-white">
              <div className="flex items-center justify-between mb-8 px-1 relative">
                <div onClick={handlePrevMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors active:scale-95">
                  <IconChevronLeft className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                  <MiniDropdown value={calMonth} onChange={setCalMonth} options={monthNames.map((m, i) => ({ label: m, value: i }))} />
                  <div className="w-[1.5px] h-4 bg-slate-200 rounded-full mx-1"></div>
                  <MiniDropdown value={calYear} onChange={setCalYear} options={Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(y => ({ label: y.toString(), value: y }))} />
                </div>
                <div onClick={handleNextMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors active:scale-95">
                  <IconChevronRight className="w-5 h-5 text-slate-600" />
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center mb-5">
                {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, i) => (
                  <span key={i} className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{day}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center items-center">
                {emptyDaysArray.map(i => <div key={`empty-${i}`}></div>)}
                {daysArray.map(d => (
                  <div 
                    key={d} onClick={() => setCalDay(d)}
                    className={`w-10 h-10 mx-auto flex items-center justify-center text-sm rounded-full cursor-pointer transition-all ${d === calDay ? 'text-white bg-[#1EAB57] shadow-[0_6px_15px_rgba(30,171,87,0.4)] scale-110 font-black' : 'text-slate-700 font-black hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <button type="button" onClick={applyCustomDate} className="mt-8 w-full py-4 bg-[#0F172A] hover:bg-slate-800 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest shadow-[0_8px_20px_rgba(15,23,42,0.2)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2">
                <IconCheck className="w-4 h-4" /> Terapkan Tanggal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIP HEADER BANNER (MODE EDIT + FOTO) */}
      {/* ======================================= */}
      <div className="relative w-full mt-2 lg:mt-4 transition-all duration-500 animate-fade-up">
        
        {/* Lapis 1: Background Hijau */}
        <div className="absolute top-0 left-0 right-0 h-[160px] md:h-[180px] bg-gradient-to-r from-[#1EAB57] via-[#24C667] to-[#127236] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_15px_30px_-10px_rgba(30,171,87,0.3)]">
          <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none animate-pulse"></div>
          <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-emerald-900/20 rounded-full blur-[50px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        </div>

        {/* Lapis 2: White Info Card & Avatar Float */}
        <div className="relative pt-[90px] md:pt-[110px] px-2 sm:px-4 md:px-8 pb-2">
          
          <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/60 relative z-30">
            
            {/* Avatar Melayang */}
            <div className="md:absolute md:left-8 md:-top-[4.5rem] flex justify-center -mt-20 md:mt-0 z-20">
              <div 
                className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[6px] md:border-[8px] border-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] overflow-hidden bg-slate-100 group relative flex items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#24C667] to-[#1A453A] flex items-center justify-center text-white text-5xl font-black transition-transform duration-700 group-hover:scale-110">
                    {getInitials(name)}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                  <IconCamera className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform duration-300" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest mt-2 scale-75 group-hover:scale-100 transition-transform duration-300">Ubah Foto</span>
                </div>
              </div>
            </div>

            <div className="hidden md:block w-36 shrink-0"></div>

            <div className="flex-1 text-center md:text-left flex flex-col justify-center min-w-0">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl md:text-[2rem] font-black text-slate-900 tracking-tight leading-none truncate max-w-[200px] md:max-w-full">{name.split(" ")[0] || "Nama Lengkap"}</h1>
                {role !== "BASIC" && <IconVerify className="w-6 h-6 text-[#1EAB57] shrink-0" />}
              </div>
              
              <p className="text-sm font-bold text-slate-500 mb-5 truncate max-w-[250px] md:max-w-full">{email || "email@gizify.ai"}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-100 cursor-default shadow-sm">
                  <IconEdit className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">Mode Ahli Gizi</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white shadow-sm cursor-default">
                  <span className="text-[11px] font-black uppercase tracking-widest">{bodyGoal.split("(")[0] || "Target"}</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-[#1EAB57] border border-emerald-100 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] cursor-default">
                  <IconSparkles className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">{role} Member</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Top */}
            <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row items-center justify-center gap-3 md:h-full md:pt-3 mt-4 md:mt-0">
               <Link href="/profile" className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-500 px-6 py-3.5 md:py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer border border-slate-100">
                  Batal
               </Link>
               <button onClick={handleSave} type="button" className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-b from-[#24C667] to-[#1EAB57] hover:from-[#1EAB57] hover:to-[#168E46] text-white px-8 py-3.5 md:py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_8px_20px_rgba(30,171,87,0.3)] cursor-pointer group">
                  <IconSave className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Simpan
               </button>
            </div>

          </div>
        </div>
      </div>

      {/* ======================================= */}
      {/* 4 METRIK KESEHATAN LIVE (SaaS Style) */}
      {/* ======================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 sm:px-4 md:px-8 animate-fade-up delay-100">
        
        {/* Card 1: Target Kalori */}
        <div className="bg-white rounded-[1.5rem] p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1EAB57] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Kalori</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{calories}<span className="text-xs font-semibold text-slate-400 ml-1">Kkal</span></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-emerald-100">
              <IconActivity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-2 leading-snug">
            Menggunakan formula <strong className="text-slate-700">Mifflin-St Jeor</strong> & standar aktivitas fisik WHO.
          </p>
        </div>

        {/* Card 2: Status BMI */}
        <div className="bg-white rounded-[1.5rem] p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status BMI</p>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">{bmiStatus}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-rose-100">
              <IconHeart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-2 leading-snug">
            Skor: <strong className="text-slate-700">{bmi}</strong> (Berdasarkan standar klasifikasi kesehatan WHO).
          </p>
        </div>

        {/* Card 3: Berat Aktual */}
        <div className="bg-white rounded-[1.5rem] p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Berat Aktual</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-amber-500 transition-colors">{weight}<span className="text-xs font-semibold text-slate-400 ml-1">Kg</span></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-amber-100">
              <IconScale className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-2 leading-snug">
            Sesuai dengan input data profil fisik terbarumu.
          </p>
        </div>

        {/* Card 4: Berat Ideal */}
        <div className="bg-white rounded-[1.5rem] p-5 md:p-6 border border-slate-100 shadow-sm hover-float transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Berat Ideal</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{idealWeight}<span className="text-xs font-semibold text-slate-400 ml-1">Kg</span></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-blue-100">
              <IconTarget className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-2 leading-snug">
            Menggunakan modifikasi medis dari <strong className="text-slate-700">Formula Broca (1871)</strong>.
          </p>
        </div>
        
      </div>

      {/* ======================================= */}
      {/* FORM AREA SPLIT (KIRI FORM, KANAN AI RESULT) */}
      {/* ======================================= */}
      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start relative z-10 px-2 sm:px-4 md:px-8">
        
        {/* KOLOM KIRI (7 Col) - FORM DATA LENGKAP */}
        <div className="xl:col-span-7 space-y-6 md:space-y-8 min-w-0 animate-fade-up delay-100">
          
          {/* ======================================= */}
          {/* SECTION 1: INFORMASI DASAR */}
          {/* ======================================= */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.03)] relative z-[40]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-[inset_0_2px_5px_rgba(255,255,255,0.8)] border border-slate-200">
                  <IconUser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Data Diri Pribadi</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Identitas & Kontak</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group">
                  <div className="flex items-center gap-3 px-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-focus-within:text-[#1EAB57] shadow-sm transition-colors">
                      <IconUser className="w-4 h-4" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <label className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-widest group-focus-within:text-[#1EAB57] transition-colors">Nama Lengkap</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-medium" placeholder="Nama..." required />
                    </div>
                  </div>
                </div>

                <div className="input-vip-group bg-slate-100/50 rounded-2xl p-2 border border-slate-100/80 group opacity-70 cursor-not-allowed">
                  <div className="flex items-center gap-3 px-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <IconMail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                      <label className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-widest">Alamat Email (Terkunci)</label>
                      <input type="email" value={email} disabled className="w-full bg-transparent text-sm font-black text-slate-600 focus:outline-none truncate cursor-not-allowed" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-20">
                <CustomSelect 
                  label="Jenis Kelamin" value={gender} onChange={setGender} icon={IconGender}
                  options={[ { label: "Pria", value: "Pria" }, { label: "Wanita", value: "Wanita" } ]}
                />

                <div onClick={() => setShowDatePicker(true)} className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group cursor-pointer relative z-10">
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

              <div className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group relative z-0 flex items-center">
                <div className="flex items-center gap-3 px-3 py-1 flex-1">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-focus-within:text-rose-500 shadow-sm transition-colors">
                    <IconMapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <label className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-widest group-focus-within:text-rose-500 transition-colors">Lokasi Tinggal</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Jakarta, Indonesia" className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none placeholder:text-slate-300 placeholder:font-medium" />
                  </div>
                </div>
                <button type="button" onClick={fetchCurrentLocation} className="mr-3 p-2 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 rounded-xl transition-colors tooltip" title="Ambil Lokasi Saat Ini">
                   <IconTarget className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ======================================= */}
          {/* SECTION 2: FISIK, TARGET & AKTIVITAS */}
          {/* ======================================= */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] relative z-[35]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-[inset_0_2px_5px_rgba(255,255,255,0.8)] border border-blue-100/50">
                <IconActivity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Metrik Fisik & Target</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Penentu Kalori Dasar AI</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5 z-0">
                <div className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group">
                  <div className="flex items-center gap-3 px-3 py-1">
                    <div className="flex-1 flex flex-col justify-center text-center">
                      <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest group-focus-within:text-blue-500 transition-colors">Tinggi (cm)</label>
                      <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-transparent text-2xl font-black text-slate-900 text-center focus:outline-none" required />
                    </div>
                  </div>
                </div>
                
                <div className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group">
                  <div className="flex items-center gap-3 px-3 py-1">
                    <div className="flex-1 flex flex-col justify-center text-center">
                      <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest group-focus-within:text-blue-500 transition-colors">Berat (kg)</label>
                      <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-transparent text-2xl font-black text-slate-900 text-center focus:outline-none" required />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-30">
                <CustomSelect 
                  label="Target Perubahan Tubuh" value={bodyGoal} onChange={setBodyGoal} icon={IconTarget} color="text-blue-500" bgHover="hover:bg-blue-50"
                  options={[
                    { label: "Menurunkan Berat (Defisit Kalori)", value: "Menurunkan Berat Badan" },
                    { label: "Menjaga Berat (Maintenance)", value: "Menjaga Berat Badan" },
                    { label: "Menambah Otot (Surplus Kalori)", value: "Menambah Massa Otot" }
                  ]}
                />
              </div>

              <div className="relative z-20">
                <CustomSelect 
                  label="Aktivitas Harian (Di luar olahraga)" value={activity} onChange={setActivity} icon={IconActivity} color="text-blue-500" bgHover="hover:bg-blue-50"
                  options={[
                    { label: "Rendah (Banyak Duduk / Rebahan)", value: "Rendah" },
                    { label: "Sedang (Aktif Bergerak / Jalan)", value: "Sedang" },
                    { label: "Tinggi (Pekerja Lapangan / Berdiri Terus)", value: "Tinggi" }
                  ]}
                />
              </div>

              <div className="relative z-10">
                <CustomSelect 
                  label="Rutinitas Olahraga" value={exercise} onChange={setExercise} icon={IconDumbbell} color="text-blue-500" bgHover="hover:bg-blue-50"
                  options={[
                    { label: "Jarang / Tidak Pernah", value: "Jarang" },
                    { label: "1-2x Seminggu (Ringan)", value: "1-2x/Minggu" },
                    { label: "3-5x Seminggu (Aktif/Gym)", value: "3-5x/Minggu" },
                    { label: "Setiap Hari (Atlet / Sangat Aktif)", value: "Setiap Hari" }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* ======================================= */}
          {/* SECTION 3: PREFERENSI DIET & MAKRO (NEW) */}
          {/* ======================================= */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-emerald-100 shadow-[0_15px_40px_-10px_rgba(30,171,87,0.08)] relative z-[30]">
            <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-50 rounded-full blur-[40px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#24C667] to-[#1EAB57] flex items-center justify-center text-white shadow-md border border-emerald-400/50">
                <IconCutlery className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Profil Ahli Gizi</h3>
                <p className="text-[11px] font-bold text-[#1EAB57] uppercase tracking-widest mt-0.5">Personalisasi Meal Plan AI</p>
              </div>
            </div>

            <div className="flex flex-col gap-5 relative z-10">
              {/* MULTI-SELECT: Tipe Diet */}
              <div className="relative z-40">
                <CustomMultiSelect 
                  label="Kombinasi Tipe Diet (Pilih >1)" 
                  values={dietTypes} 
                  onChange={setDietTypes} 
                  icon={IconSparkles} 
                  options={dietOptions}
                />
              </div>

              {/* SINGLE SELECT: Fokus Makro */}
              <div className="relative z-30">
                <CustomSelect 
                  label="Fokus Makronutrisi" value={macroFocus} onChange={setMacroFocus} icon={IconPieChart}
                  options={[
                    { label: "Seimbang (Pro 30% : Car 40% : Fat 30%)", value: "Seimbang" },
                    { label: "Tinggi Protein (Muscle) (Pro 40% : Car 30% : Fat 30%)", value: "Tinggi Protein (Muscle)" },
                    { label: "Rendah Karbohidrat (Pro 35% : Car 20% : Fat 45%)", value: "Rendah Karbohidrat" },
                    { label: "Rendah Lemak (Pro 30% : Car 50% : Fat 20%)", value: "Rendah Lemak" },
                    { label: "Sangat Rendah Karbo (Keto) (Pro 25% : Car 5% : Fat 70%)", value: "Sangat Rendah Karbo (Keto)" }
                  ]}
                />
              </div>

              {/* SINGLE SELECT: Frekuensi Makan */}
              <div className="relative z-20">
                <CustomSelect 
                  label="Frekuensi Makan Harian" value={mealsPerDay} onChange={setMealsPerDay} icon={IconClock}
                  options={[
                    { label: "3 Kali Sehari (Pagi, Siang, Malam)", value: "3 Kali Sehari" },
                    { label: "3 Kali + 2 Cemilan (Porsi Kecil Sering)", value: "5 Kali (Porsi Kecil)" },
                    { label: "2 Kali Sehari (Intermittent Fasting 16:8)", value: "2 Kali Sehari (Fasting)" },
                    { label: "1 Kali Sehari (OMAD)", value: "1 Kali Sehari (OMAD)" }
                  ]}
                />
              </div>

              {/* SINGLE SELECT: Target Air Minum */}
              <div className="relative z-10">
                <CustomSelect 
                  label="Target Air Minum Harian" value={waterIntake} onChange={setWaterIntake} icon={IconDroplet}
                  options={[
                    { label: "Standar (2 - 2.5 Liter)", value: "2 Liter" },
                    { label: "Tinggi (3 - 4 Liter - Disarankan Olahragawan)", value: "3.5 Liter" },
                    { label: "Rendah (Kurang dari 2 Liter)", value: "1.5 Liter" }
                  ]}
                />
              </div>

            </div>
          </div>

          {/* ======================================= */}
          {/* SECTION 4: MEDIS & PANTANGAN */}
          {/* ======================================= */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] relative z-[25]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-[inset_0_2px_5px_rgba(255,255,255,0.8)] border border-rose-100/50">
                <IconStethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Alergi & Kondisi Medis</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Filter Keamanan Resep AI</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              
              {/* MULTI-SELECT: Alergi */}
              <div className="relative z-30">
                <CustomMultiSelect 
                  label="Alergi Makanan (Pilih >1)" 
                  values={allergies} 
                  onChange={setAllergies} 
                  icon={IconClose} color="text-rose-500"
                  options={allergyOptions}
                />
              </div>

              <div className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group">
                <div className="flex items-start gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-focus-within:text-amber-500 shadow-sm transition-colors mt-1 shrink-0">
                    <IconHeart className="w-4 h-4" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest group-focus-within:text-amber-500 transition-colors">Bahan Benci / Tidak Disukai</label>
                    <textarea 
                      value={dislikedFoods} onChange={(e) => setDislikedFoods(e.target.value)} 
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-300 resize-none h-12 custom-scroll" 
                      placeholder="Ketik bahan yang dibenci. Contoh: Bawang mentah, Pete, Jeroan..." 
                    />
                  </div>
                </div>
              </div>

              <div className="input-vip-group bg-slate-50 rounded-2xl p-2 border border-slate-100/80 group">
                <div className="flex items-start gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-focus-within:text-blue-500 shadow-sm transition-colors mt-1 shrink-0">
                    <IconInfo className="w-4 h-4" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest group-focus-within:text-blue-500 transition-colors">Riwayat Penyakit Khusus</label>
                    <input 
                      type="text" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} 
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-300" 
                      placeholder="Contoh: Asam lambung, Diabetes, Hipertensi..." 
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ======================================= */}
          {/* SECTION 5: PROFIL DAPUR (NEW) */}
          {/* ======================================= */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] relative z-[20]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-[inset_0_2px_5px_rgba(255,255,255,0.8)] border border-orange-100/50">
                <IconChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Fasilitas & Kemampuan Dapur</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Penentu Tingkat Kesulitan Resep</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              
              <div className="relative z-30">
                <CustomSelect 
                  label="Kemampuan Memasak" value={cookingSkill} onChange={setCookingSkill} icon={IconChefHat} color="text-orange-500" bgHover="hover:bg-orange-50"
                  options={[
                    { label: "Pemula (Bisa masak telur & mie)", value: "Pemula" },
                    { label: "Menengah (Bisa ikuti resep standar)", value: "Menengah" },
                    { label: "Mahir (Bisa racik bumbu & teknik kompleks)", value: "Mahir" }
                  ]}
                />
              </div>

              <div className="relative z-20">
                <CustomMultiSelect 
                  label="Peralatan Dapur Tersedia (Pilih >1)" 
                  values={kitchenEquipments} 
                  onChange={setKitchenEquipments} 
                  icon={IconMicrowave} color="text-orange-500"
                  options={kitchenOptions}
                />
              </div>

            </div>
          </div>

        </div>

        {/* ================= KOLOM KANAN (5 Col) ================= */}
        <div className="xl:col-span-5 relative min-w-0 z-0 animate-fade-up delay-300">
          <div className="sticky top-8 space-y-6 md:space-y-8">
            
            {/* ======================================= */}
            {/* DASHBOARD AI LIVE (GAYA PUTIH BERSIH) */}
            {/* ======================================= */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-visible z-[50]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1EAB57] flex items-center justify-center border border-emerald-100/50">
                    <IconPieChart className="w-5 h-5 drop-shadow-sm" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 drop-shadow-sm">Distribusi Makro</h3>
                </div>
                
                <div className="group relative cursor-help flex items-center justify-center p-2">
                  <IconInfo className="w-5 h-5 text-slate-400 hover:text-[#1EAB57] transition-colors" />
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-[240px] bg-slate-900 text-white text-[10px] p-4 rounded-xl shadow-2xl z-50 border border-slate-700 font-medium leading-relaxed">
                    Makronutrisi adalah penyumbang kalori utama: 
                    <br/><br/>
                    <b className="text-blue-400">Protein</b>: Membangun & menjaga otot.<br/>
                    <b className="text-[#34D399]">Karbohidrat</b>: Sumber energi utama tubuh.<br/>
                    <b className="text-rose-400">Lemak</b>: Menjaga keseimbangan hormon.
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Visual Bar Makro Tanpa Jarak */}
                <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden shadow-inner border border-slate-200/50">
                   <div className="h-full bg-blue-500 transition-all duration-1000" style={{width: `${(macros.pro / (macros.pro+macros.car+macros.fat))*100}%`}}></div>
                   <div className="h-full bg-[#1EAB57] transition-all duration-1000" style={{width: `${(macros.car / (macros.pro+macros.car+macros.fat))*100}%`}}></div>
                   <div className="h-full bg-rose-500 transition-all duration-1000" style={{width: `${(macros.fat / (macros.pro+macros.car+macros.fat))*100}%`}}></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 text-center flex flex-col justify-center transition-colors hover:bg-white hover:shadow-[0_5px_15px_rgba(0,0,0,0.03)] cursor-default">
                    <div className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1.5 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span> PROTEIN
                    </div>
                    <div className="text-2xl font-black text-slate-800 flex items-baseline justify-center gap-0.5">{macros.pro}<span className="text-[10px] text-slate-400 font-bold ml-0.5">g</span></div>
                  </div>
                  
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 text-center flex flex-col justify-center transition-colors hover:bg-white hover:shadow-[0_5px_15px_rgba(0,0,0,0.03)] cursor-default">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#1EAB57] mb-1.5 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1EAB57] shadow-[0_0_5px_rgba(30,171,87,0.5)]"></span> KARBO
                    </div>
                    <div className="text-2xl font-black text-slate-800 flex items-baseline justify-center gap-0.5">{macros.car}<span className="text-[10px] text-slate-400 font-bold ml-0.5">g</span></div>
                  </div>
                  
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 text-center flex flex-col justify-center transition-colors hover:bg-white hover:shadow-[0_5px_15px_rgba(0,0,0,0.03)] cursor-default">
                    <div className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1.5 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span> LEMAK
                    </div>
                    <div className="text-2xl font-black text-slate-800 flex items-baseline justify-center gap-0.5">{macros.fat}<span className="text-[10px] text-slate-400 font-bold ml-0.5">g</span></div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center text-[#1EAB57] shrink-0 border border-emerald-200/50 mt-0.5">
                     <IconCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Akurasi Klinis</p>
                     <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                       Kalkulasi AI ini menggunakan formula <strong>Mifflin-St Jeor</strong> yang direkomendasikan oleh WHO untuk akurasi tingkat metabolisme terbaik.
                     </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Kotak Panduan Ringkas */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100/50">
                <IconBot className="w-6 h-6" />
              </div>
              <div className="pt-1">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1.5">Makin Pintar dengan Data</h4>
                <p className="text-[11px] md:text-xs font-medium text-slate-500 leading-relaxed">AI kami menggunakan setiap detail profilmu (terutama Makro & Pantangan) untuk memberikan rekomendasi resep yang <strong>mustahil meleset</strong>. Simpan perubahan untuk melihat bedanya di Menu Resep!</p>
              </div>
            </div>

          </div>
        </div>
        
        {/* Sticky Mobile Save Button */}
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-[60]">
           <button type="submit" className="w-full flex justify-center items-center gap-2.5 bg-gradient-to-r from-[#24C667] to-[#1EAB57] hover:from-[#1EAB57] hover:to-[#168E46] text-white py-4.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(30,171,87,0.4)] active:scale-95 transition-all border border-[#1EAB57]">
             <IconSave className="w-4 h-4" /> Simpan Profil AI
           </button>
        </div>

      </form>
    </div>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconChevronDown = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconChevronLeft = ({ className, onClick }: any) => <svg onClick={onClick} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRight = ({ className, onClick }: any) => <svg onClick={onClick} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconUser = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconMail = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const IconGender = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M14 23v-8h-4v8"></path><path d="M8 9h4c1.1 0 2 .9 2 2v4"></path><path d="M21 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M21 16v7"></path><path d="M18 10h6v6h-6z"></path></svg>;
const IconCake = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"></path><path d="M2 21h20"></path><path d="M7 8v2"></path><path d="M12 8v2"></path><path d="M17 8v2"></path><path d="M7 4h.01"></path><path d="M12 4h.01"></path><path d="M17 4h.01"></path></svg>;
const IconMapPin = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconActivity = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const IconSparkles = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconTarget = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const IconCheck = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconInfo = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const IconSave = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IconDumbbell = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4l-4.8-4.8"></path><path d="M18.6 18.6l-3-3"></path><path d="M5.4 5.4l-3-3"></path><path d="M6.8 3.2l-3.6 3.6"></path><path d="M20.8 17.2l-3.6 3.6"></path><path d="M2 16v6h6"></path><path d="M22 8V2h-6"></path></svg>;
const IconCutlery = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
const IconStethoscope = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"></path><path d="M8 2v4"></path><path d="M16 2v4"></path><circle cx="16" cy="16" r="3"></circle><path d="M18.1 18.1L22 22"></path></svg>;
const IconHeart = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const IconClose = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconCamera = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>;
const IconVerify = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconEdit = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconScale = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"></path><path d="M12 2v20"></path><rect x="4" y="8" width="16" height="8" rx="2"></rect></svg>;
const IconPieChart = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const IconDroplet = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>;
const IconChefHat = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path><line x1="6" y1="17" x2="18" y2="17"></line></svg>;
const IconMicrowave = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><line x1="18" y1="10" x2="18" y2="10"></line><line x1="18" y1="14" x2="18" y2="14"></line><line x1="6" y1="12" x2="14" y2="12"></line></svg>;
const IconBot = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconClock = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconUsers = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;