// Path: src/app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key Gemini belum dipasang." }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    // =================================================================
    // 1. FILTER HISTORY BIAR GEMINI NGGAK NGAMBEK
    // =================================================================
    const formattedHistory: any[] = [];
    let lastRole = "";

    for (const m of messages) {
      const role = m.sender === 'user' ? 'user' : 'model';
      
      // RULES 1: Jangan biarkan bot bicara duluan di memory API
      if (formattedHistory.length === 0 && role === 'model') continue;
      
      // RULES 2: Role harus selang-seling (User -> Model -> User)
      if (role === lastRole) continue;
      lastRole = role;

      const parts: any[] = [];
      if (m.text) parts.push({ text: m.text });
      
      // Kalau user ngirim gambar
      if (m.image && role === 'user') {
        const mimeType = m.image.split(';')[0].split(':')[1];
        const base64Data = m.image.split(',')[1];
        parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
      }

      formattedHistory.push({ role, parts });
    }

    // =================================================================
    // 2. INSTRUKSI SISTEM SANGAT KETAT (GUARDRAILS)
    // =================================================================
    const systemInstruction = `Kamu adalah GiziBot, asisten nutrisi AI eksklusif untuk aplikasi Gizify. Gunakan bahasa Indonesia santai, asik, pakai kata "Kamu" atau "Mu", sedikit humoris dan berikan semangat.
    
    BATASAN SANGAT PENTING:
    1. KUNCI TOPIK: Kamu HANYA BOLEH menjawab pertanyaan seputar makanan, gizi, diet, resep, kalori, dan kesehatan. Jika user bertanya di luar ranah ini (seperti matematika, coding, politik, dsb), tolak dengan sopan tapi kocak, dan arahkan kembali ke nutrisi.
    2. ANTI-EMOJI: DILARANG KERAS menggunakan emoji apapun dalam balasanmu. Gunakan tanda baca standar saja.
    3. MATA AI: Jika mendapat kiriman gambar/foto, identifikasilah sebagai makanan dan hitung gizinya.
    
    ATURAN FORMAT BALASAN (WAJIB JSON):
    Kamu HANYA BOLEH merespon dalam format JSON murni.
    Struktur JSON WAJIB seperti ini:
    {
      "text": "Pesan balasanmu di sini (pastikan 100% tanpa emoji, gunakan \\n\\n untuk enter)",
      "hasWidget": true/false,
      "widgetData": null atau { "title": "Nama Makanan", "calories": 300, "protein": 20, "carbs": 30, "fat": 10, "image": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop" }
    }
    
    Jika user meminta saran makanan/resep, set "hasWidget" menjadi true dan isi "widgetData" dengan estimasi gizinya.`;

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: formattedHistory
    };

    // =================================================================
    // 3. TEMBAK KE GOOGLE
    // =================================================================
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    if (data.error) {
        console.error("Gemini API Error Detail:", data.error.message);
        return NextResponse.json({ error: "Gemini menolak memproses format ini." }, { status: 500 });
    }

    let textResult = data.candidates[0].content.parts[0].text;
    
    // Bersihkan dari format markdown
    textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedJson = JSON.parse(textResult);
    return NextResponse.json(parsedJson);

  } catch (error) {
    console.error("Chat API Error Catch:", error);
    return NextResponse.json({ error: "Gagal memproses pesan secara internal." }, { status: 500 });
  }
}