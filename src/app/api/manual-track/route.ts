// Path: src/app/api/manual-track/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { foodName } = await request.json();
    if (!foodName) return NextResponse.json({ error: "Nama makanan wajib diisi" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY_MANUAL_TRACK;
    if (!apiKey) return NextResponse.json({ error: "API Key belum di-setting" }, { status: 500 });

    // Prompt super spesifik agar Gemini me-return murni JSON
    const prompt = `Berikan estimasi kandungan gizi dasar (per 100 gram) untuk makanan/minuman berikut: "${foodName}". 
    Balas HANYA dengan format JSON yang valid, tanpa markdown tambahan, tanpa penjelasan. 
    Gunakan key berikut dan isi HANYA dengan angka (tanpa satuan, jika tidak tahu isi "0"): 
    { "baseCalories": "...", "basePro": "...", "baseCar": "...", "baseFat": "...", "baseVitC": "...", "baseFiber": "...", "baseCalcium": "...", "baseIron": "..." }`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
            response_mime_type: "application/json",
            temperature: 0.2
        }
      })
    });

    const data = await res.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) throw new Error("Gagal mendapat respon dari Gemini");

    const parsedData = JSON.parse(textResponse);
    return NextResponse.json(parsedData);
    
  } catch (error) {
    console.error("Manual Track API Error:", error);
    return NextResponse.json({ error: "Gagal men-generate data gizi" }, { status: 500 });
  }
}