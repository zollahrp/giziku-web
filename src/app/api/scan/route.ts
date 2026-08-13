// Path: src/app/api/scan/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { image, bodyGoal = "Menjaga Berat Badan" } = await req.json();
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key Gemini belum dipasang." }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: `Kamu adalah 'Gizify Vision', AI Computer Vision dan Ahli Gizi. Analisa piring makanan ini. Deteksi SETIAP KOMPONEN MAKANAN secara terpisah. Untuk setiap item, berikan 'box' berupa array [ymin, xmin, ymax, xmax] dengan nilai persentase 0-1000. Lengkapi nutrisinya (Makro & Mikro). Untuk 'portion', berikan estimasi gram (misal: '150g (1 potong sedang)'). 
            
            Target kesehatan user saat ini adalah: "${bodyGoal}". 
            Berdasarkan target tersebut, berikan 'ai_insight' di bagian 'total'. ATURAN BAHASA 'ai_insight': Gunakan bahasa Indonesia yang santai, asik, pakai kata "Kamu" atau "Mu" (JANGAN gunakan lo, gue, ngab, atau bahasa Gen Z yang berlebihan). Buat sedikit kocak/humoris tapi tetap informatif dan berikan semangat. Contoh: "Wah, salmonnya menggoda banget nih! Cocok buat targetmu, tapi sayurnya kurang banyak ya. Tambahin brokoli dikit biar pencernaanmu lancar jaya kayak jalan tol! 🥦✨"
            
            Jika BUKAN makanan, kosongkan items dan beri kalori 0. 
            
            KEMBALIKAN HANYA DALAM FORMAT JSON VALID DENGAN STRUKTUR: 
            {"items": [{"name": "Salmon Panggang", "box": [200, 500, 600, 900], "portion": "150g (1 potong)", "calories": 250, "protein": 30, "carbs": 0, "fat": 12, "micronutrients": {"vitC": "0mg", "fiber": "0g", "calcium": "15mg", "iron": "0.8mg"}}], "total": {"name": "Menu Lengkap", "portion": "1 Piring Penuh (± 400g)", "calories": 450, "protein": 35, "carbs": 40, "fat": 15, "score": 8, "micronutrients": {"vitC": "45mg", "fiber": "12g", "calcium": "120mg", "iron": "4.5mg"}, "ai_insight": "Wah, piringmu hari ini cakep banget! Kalorinya aman sentosa buat targetmu. Tapi awas ya, jangan sampai abis ini malah jajan boba manis! Lanjutkan perjuanganmu! 🔥"}}` },
            { inline_data: { mime_type: mimeType, data: base64Data } }
          ]
        }
      ]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    let textResult = data.candidates[0].content.parts[0].text;
    textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedJson = JSON.parse(textResult);
    return NextResponse.json(parsedJson);

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Gagal menganalisa gambar." }, { status: 500 });
  }
}