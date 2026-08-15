// Path: src/app/api/meal-plan/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Tangkap data murni dari Frontend
    const body = await req.json();
    const { days, people, budget, userData } = body;
    
    // Ambil API Key dari environment variable (.env.local)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key tidak ditemukan" }, { status: 500 });
    }

    // =========================================================================
    // PROMPT DIRACIK DI BACKEND (HYBRID JSON FORMAT: MEAL PLAN + RECIPE DETAIL)
    // =========================================================================
    const systemPrompt = `
      Kamu adalah Ahli Gizi Profesional (AI) tingkat Master Chef.
      Buatkan rencana menu makanan harian (meal plan) UNTUK HARI 1 HINGGA HARI ${days}, untuk ${people} orang. 
      Total budget maksimal adalah Rp ${budget} per harinya, dan disesuaikan dengan standar harga di Jakarta, Indonesia.
      
      Profil Gizi & Dapur Klien:
      - Target Kalori Harian: ${userData?.calories || "2000"} Kkal
      - Makronutrisi Target: Protein ${userData?.macros?.pro || "150"}g, Karbohidrat ${userData?.macros?.car || "200"}g, Lemak ${userData?.macros?.fat || "60"}g
      - Tipe Diet: ${userData?.dietTypes?.join(", ") || "Normal"}
      - Alergi/Pantangan: ${userData?.allergies?.join(", ") || "-"}, Bahan Dibenci: ${userData?.dislikedFoods || "-"}
      - Riwayat Medis: ${userData?.medicalHistory || "Tidak ada"}
      - Tingkat Skill Memasak: ${userData?.cookingSkill || "Pemula"}
      - Alat Dapur Tersedia: ${userData?.kitchenEquipments?.join(", ") || "Kompor, Pisau, Wajan"}
      - Frekuensi Makan: ${userData?.mealsPerDay || "3 Kali Sehari"}
      
      ATURAN PENTING:
      1. Rencana harus memenuhi kalori dan makro target sedekat mungkin.
      2. Waktu memasak (cookTime) dan persiapan (prepTime) harus spesifik (Contoh: "15 Menit").
      3. Instruksi (instructions) HARUS SANGAT DETAIL, profesional ala chef bintang 5, menjelaskan teknik, temperatur, dan alasan kenapa harus begitu. Berikan 6-9 langkah panjang per resep.
      4. Equipments harus berisi daftar alat dapur yang dipakai (contoh: "Stove", "Non-stick Pan", "Food Scale", dll).
      5. Nutrition facts harus akurat.

      WAJIB KELUARKAN RESPONS MURNI DALAM BENTUK JSON ARRAY TEPAT SEPERTI FORMAT BERIKUT (tanpa markdown backtick):
      [
        {
          "day": 1,
          "meals": [
            {
              "id": "ai_gen_d1_m1",
              "type": "Sarapan",
              "time": "07:00",
              "title": "Smoothie Bowl Naga Merah & Chia Seed",
              "category": "Sarapan",
              "kal": 210,
              "pro": 5,
              "car": 35,
              "fat": 4,
              "calories": 210,
              "rating": 5.0,
              "reviews": 1,
              "author": "Gizify AI",
              "date": "Hari Ini",
              "matchScore": 98,
              "description": "Smoothie bowl segar yang kaya akan antioksidan dari buah naga dan serat dari chia seed...",
              "prepTime": "10 Menit",
              "cookTime": "3 Menit",
              "servings": "${people} Porsi",
              "totalBudget": "Rp 25.000",
              "location": "Jakarta, Indonesia",
              "equipments": ["Blender", "Refrigerator", "Food Scale", "Serving Bowl", "Knife"],
              "nutrition": {
                "kalori": 210,
                "protein": "5g",
                "lemak": "4g",
                "karbohidrat": "35g",
                "serat": "8g",
                "gula": "18g",
                "natrium": "10mg"
              },
              "ingredients": [
                {
                  "section": "Bahan Utama",
                  "items": [
                    "1/2 buah naga merah beku (potong dadu)",
                    "150ml susu almond tanpa gula"
                  ]
                },
                {
                  "section": "Topping",
                  "items": [
                    "1 sdm chia seed",
                    "2 sdm granola utuh"
                  ]
                }
              ],
              "instructions": [
                "Langkah pertama yang sangat krusial adalah persiapan bahan (Mise en place)...",
                "Siapkan blender berkecepatan tinggi. Masukkan potongan buah naga...",
                "Tuangkan 150ml susu almond tanpa gula secara perlahan..."
              ],
              "image": "https://images.unsplash.com/photo-1496412705862-e0088f16f791?q=80&w=800&auto=format&fit=crop"
            }
          ]
        }
      ]
    `;

    // Menggunakan model gemini-3.1-flash-lite
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7, 
          responseMimeType: "application/json", // Paksa output JSON murni
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("Gemini API Error:", data);
        return NextResponse.json({ error: data.error?.message || "Terjadi kesalahan di Gemini API" }, { status: response.status });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json({ result: text });

  } catch (error: any) {
    console.error("Meal Plan API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}