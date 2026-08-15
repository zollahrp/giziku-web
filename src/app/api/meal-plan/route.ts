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

    // PROMPT DIRACIK DI BACKEND
    // Memaksa format JSON bahasa Indonesia (sesuai dummyRecipes.ts)
    const systemPrompt = `
      Kamu adalah Ahli Gizi Profesional (AI) tingkat Master Chef.
      Buatkan rencana menu makanan harian (meal plan) HANYA UNTUK HARI PERTAMA dari total durasi ${days} hari, untuk ${people} orang. 
      Total budget maksimal adalah Rp ${budget} per harinya, dan disesuaikan dengan standar harga di Jakarta, Indonesia.
      
      Profil Gizi & Dapur Klien:
      - Target Kalori Harian: ${userData?.calories || "2000"} Kkal
      - Makronutrisi Target: Protein ${userData?.macros?.pro || "150"}g, Karbohidrat ${userData?.macros?.car || "200"}g, Lemak ${userData?.macros?.fat || "60"}g
      - Tipe Diet: ${userData?.dietTypes?.join(", ") || "Normal"}
      - Alergi: ${userData?.allergies?.join(", ") || "-"}, Bahan Dibenci: ${userData?.dislikedFoods || "-"}
      - Riwayat Medis: ${userData?.medicalHistory || "Tidak ada"}
      - Tingkat Skill Memasak: ${userData?.cookingSkill || "Pemula"}
      - Alat Dapur Tersedia: ${userData?.kitchenEquipments?.join(", ") || "Kompor, Knife, Pan"}
      - Frekuensi Makan: ${userData?.mealsPerDay || "3 Kali Sehari"}
      
      ATURAN PENTING:
      1. Waktu memasak (cookTime) dan persiapan (prepTime) harus spesifik (Contoh: "15 Menit").
      2. Instruksi (instructions) HARUS SANGAT DETAIL, profesional ala chef bintang 5, menjelaskan teknik, temperatur, dan alasan kenapa harus begitu. Berikan 6-9 langkah panjang.
      3. Equipments harus berisi daftar alat dapur dalam Bahasa Inggris dan alat dasar (contoh: "Stove", "Non-stick Pan", "Food Scale", dll).
      4. Nutrition facts harus akurat.

      Keluarkan respon MURNI HANYA dalam format JSON ARRAY (tanpa backtick, tanpa markdown). Format JSON wajib:
      [
        {
          "id": "ai_gen_1",
          "title": "Nama Makanan Mewah",
          "category": "Sarapan/Makan Siang/dsb",
          "time": "07:00",
          "kal": 450,
          "pro": 25,
          "car": 50,
          "fat": 15,
          "price": "25.000",
          "rating": 5.0,
          "reviews": 12,
          "author": "Gizify",
          "date": "2026-08-15",
          "matchScore": 98,
          "description": "Deskripsi makanan yang menggugah selera...",
          "prepTime": "10 Menit",
          "cookTime": "15 Menit",
          "servings": "${people} Porsi",
          "totalBudget": "Rp 25.000",
          "location": "Jakarta, Indonesia",
          "equipments": ["Stove", "Pan", "Knife"],
          "nutrition": {
            "kalori": 450,
            "protein": "25g",
            "lemak": "15g",
            "karbohidrat": "50g",
            "serat": "8g",
            "gula": "5g",
            "natrium": "300mg"
          },
          "ingredients": [
            { "section": "Bahan Utama", "items": ["Bahan 1", "Bahan 2"] }
          ],
          "instructions": [
            "Langkah memasak detail 1...",
            "Langkah memasak detail 2..."
          ],
          "image": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop"
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