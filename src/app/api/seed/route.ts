import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const dummyRecipes = [
  {
    title: "Smoothie Bowl Naga Merah & Chia Seed",
    category: "Sarapan",
    calories: 210,
    rating: 4.9,
    reviews: 89,
    author: "Zolla Perdana",
    date: "2023-10-01",
    matchScore: 95,
    description: "Smoothie bowl segar kaya antioksidan dan serat untuk memulai harimu dengan energi penuh.",
    prepTime: "10 Menit",
    cookTime: "-",
    servings: "1 Porsi",
    nutrition: { calories: 210, protein: "5g", fat: "4g", carbs: "35g", fiber: "8g", sugar: "18g", sodium: "10mg" },
    ingredients: [
      { section: "Bahan Utama", items: ["1/2 buah buah naga merah muda beku", "1 buah pisang beku", "100ml susu almond tanpa gula"] },
      { section: "Topping", items: ["1 sdm chia seed", "Muesli secukupnya", "Potongan stroberi"] }
    ],
    instructions: [
      "Masukkan buah naga beku, pisang beku, dan susu almond ke dalam blender.",
      "Blender hingga halus dan kental.",
      "Tuang ke dalam mangkuk.",
      "Taburkan chia seed, muesli, dan potongan buah segar di atasnya.",
      "Sajikan segera selagi dingin."
    ],
    image: "https://images.unsplash.com/photo-1628543118940-52e690a2c0bc?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Ayam Bakar Taliwang Diet Rendah Kalori",
    category: "Makan Siang",
    calories: 320,
    rating: 4.8,
    reviews: 124,
    author: "Chef GiziBot",
    date: "2023-10-05",
    matchScore: 98,
    description: "Versi rendah kalori dari Ayam Bakar Taliwang khas Lombok dengan dada ayam tanpa kulit dan minyak minimal.",
    prepTime: "15 Menit",
    cookTime: "30 Menit",
    servings: "2 Porsi",
    nutrition: { calories: 320, protein: "35g", fat: "12g", carbs: "15g", fiber: "3g", sugar: "4g", sodium: "450mg" },
    ingredients: [
      { section: "Bahan Utama", items: ["300g dada ayam fillet tanpa kulit", "1 sdm air perasan jeruk limau", "1 sdt madu murni (pengganti kecap manis)"] },
      { section: "Bumbu Halus", items: ["4 siung bawang merah", "2 siung bawang putih", "3 buah cabai merah keriting (sesuai selera)", "1 ruas kencur", "1/2 sdt terasi bakar", "Garam Himalaya secukupnya"] }
    ],
    instructions: [
      "Lumuri dada ayam dengan air jeruk limau dan sedikit garam. Diamkan 10 menit.",
      "Sangrai bumbu halus (tanpa minyak atau gunakan 1 sdt minyak zaitun jika perlu) hingga harum.",
      "Tambahkan sedikit air dan madu ke bumbu, aduk rata.",
      "Lumuri ayam dengan bumbu, diamkan lagi selama 30 menit agar meresap.",
      "Bakar atau panggang ayam di atas teflon anti lengket hingga matang sambil diolesi sisa bumbu.",
      "Angkat dan sajikan bersama sayur rebus."
    ],
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Pepes Ikan Nila Kemangi Pedas",
    category: "Makan Malam",
    calories: 250,
    rating: 4.7,
    reviews: 56,
    author: "Chef GiziBot",
    date: "2023-10-08",
    matchScore: 92,
    description: "Pepes ikan nila yang kaya rempah dan wangi kemangi, dimasak tanpa minyak (kukus/bakar). Sangat cocok untuk makan malam ringan.",
    prepTime: "20 Menit",
    cookTime: "40 Menit",
    servings: "2 Porsi",
    nutrition: { calories: 250, protein: "28g", fat: "8g", carbs: "10g", fiber: "2g", sugar: "2g", sodium: "380mg" },
    ingredients: [
      { section: "Bahan Utama", items: ["2 ekor (400g) ikan nila ukuran sedang, bersihkan", "1 ikat kemangi, petik daunnya", "Daun pisang untuk membungkus", "Tusuk lidi"] },
      { section: "Bumbu Halus", items: ["5 siung bawang merah", "3 siung bawang putih", "2 cm jahe", "2 cm kunyit", "1 batang serai (ambil putihnya)", "3 buah cabai rawit merah", "Garam dan lada secukupnya"] }
    ],
    instructions: [
      "Campurkan bumbu halus dengan daun kemangi.",
      "Balurkan bumbu merata ke seluruh bagian ikan nila, termasuk ke dalam perut ikan.",
      "Bungkus masing-masing ikan dengan daun pisang, sematkan lidi di kedua ujungnya.",
      "Kukus selama 30 menit hingga matang.",
      "Opsional: Bakar sebentar pepes yang sudah matang di atas wajan/arang agar daun pisang wangi.",
      "Sajikan selagi hangat."
    ],
    image: "https://images.unsplash.com/photo-1544025162-8366fd4d3ceb?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Puding Chia Berry Segar",
    category: "Cemilan",
    calories: 120,
    rating: 4.7,
    reviews: 200,
    author: "Dessert Diet",
    date: "2023-10-10",
    matchScore: 99,
    description: "Cemilan manis dan sehat bebas dosa yang kaya akan serat.",
    prepTime: "5 Menit",
    cookTime: "2 Jam (Dinginkan)",
    servings: "1 Porsi",
    nutrition: { calories: 120, protein: "4g", fat: "6g", carbs: "12g", fiber: "7g", sugar: "4g", sodium: "5mg" },
    ingredients: [
      { section: "Bahan", items: ["2 sdm chia seed", "120 ml susu almond (unsweetened)", "1 sdt sirup maple atau madu murni", "Segenggam buah beri segar (blueberry, strawberry)"] }
    ],
    instructions: [
      "Campur chia seed, susu almond, dan sirup maple dalam wadah kedap udara.",
      "Aduk rata agar chia seed tidak menggumpal. Diamkan 5 menit, lalu aduk lagi.",
      "Tutup wadah dan simpan di kulkas minimal 2 jam atau semalaman.",
      "Keluarkan dari kulkas, aduk, dan tambahkan buah beri di atasnya sebelum dinikmati."
    ],
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Jus Alpukat Tanpa Gula",
    category: "Minuman",
    calories: 150,
    rating: 4.5,
    reviews: 120,
    author: "Zolla Perdana",
    date: "2023-10-12",
    matchScore: 90,
    description: "Minuman sehat penuh lemak baik tanpa tambahan gula buatan atau susu kental manis.",
    prepTime: "5 Menit",
    cookTime: "-",
    servings: "1 Porsi",
    nutrition: { calories: 150, protein: "2g", fat: "12g", carbs: "9g", fiber: "5g", sugar: "1g", sodium: "2mg" },
    ingredients: [
      { section: "Bahan Utama", items: ["1/2 buah alpukat matang", "100 ml air kelapa murni", "Es batu secukupnya", "Sejumput chia seed"] }
    ],
    instructions: [
      "Keruk daging buah alpukat.",
      "Masukkan alpukat, air kelapa, dan es batu ke dalam blender.",
      "Blender hingga halus (tidak perlu ditambahkan gula karena air kelapa sudah memberikan sedikit rasa manis alami).",
      "Tuang ke gelas dan taburi chia seed di atasnya."
    ],
    image: "https://images.unsplash.com/photo-1628543118940-52e690a2c0bc?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Steak Tahu Tempe Saus Lada Hitam",
    category: "Vegan",
    calories: 280,
    rating: 4.8,
    reviews: 75,
    author: "Vegan Indo",
    date: "2023-10-15",
    matchScore: 88,
    description: "Alternatif steak tinggi protein nabati yang lezat dan ramah di kantong.",
    prepTime: "15 Menit",
    cookTime: "20 Menit",
    servings: "2 Porsi",
    nutrition: { calories: 280, protein: "20g", fat: "15g", carbs: "22g", fiber: "6g", sugar: "5g", sodium: "300mg" },
    ingredients: [
      { section: "Steak", items: ["100g tahu putih", "100g tempe, kukus sebentar", "1 sdm tepung oat", "Garam dan lada secukupnya"] },
      { section: "Saus Lada Hitam", items: ["1 siung bawang bombay, cincang", "1 sdm saus tomat", "1 sdt lada hitam bubuk kasar", "Air secukupnya"] }
    ],
    instructions: [
      "Hancurkan tahu dan tempe, campur dengan bumbu dan tepung oat hingga bisa dibentuk.",
      "Bentuk adonan menjadi pipih menyerupai patty steak.",
      "Panggang di atas teflon anti lengket dengan api sedang hingga kecoklatan di kedua sisi, sisihkan.",
      "Untuk saus: Tumis bawang bombay hingga layu dengan 1 sdt minyak kelapa/zaitun. Tambahkan bahan saus lainnya. Masak hingga mengental.",
      "Tuang saus lada hitam di atas steak vegan dan sajikan."
    ],
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Telur Dadar Jamur Bayam Keto",
    category: "Keto",
    calories: 220,
    rating: 4.6,
    reviews: 60,
    author: "Chef GiziBot",
    date: "2023-10-18",
    matchScore: 94,
    description: "Menu keto super simpel yang kaya lemak baik dan protein, serta rendah karbo.",
    prepTime: "5 Menit",
    cookTime: "10 Menit",
    servings: "1 Porsi",
    nutrition: { calories: 220, protein: "14g", fat: "18g", carbs: "3g", fiber: "1g", sugar: "1g", sodium: "200mg" },
    ingredients: [
      { section: "Bahan", items: ["2 butir telur utuh", "30g jamur kancing, iris", "Segenggam daun bayam, cincang kasar", "1 sdm mentega asli (butter)"] }
    ],
    instructions: [
      "Kocok lepas telur dengan sedikit garam dan merica.",
      "Lelehkan mentega di wajan. Tumis jamur hingga layu, masukkan bayam dan tumis sebentar.",
      "Tuang kocokan telur ke dalam wajan berisi jamur dan bayam.",
      "Masak dengan api kecil. Balik perlahan setelah sisi bawah matang.",
      "Sajikan selagi hangat."
    ],
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Salad Tuna Alpukat Zesty",
    category: "Low Carbs",
    calories: 270,
    rating: 4.9,
    reviews: 145,
    author: "Rika Rahmawati",
    date: "2023-10-20",
    matchScore: 97,
    description: "Salad menyegarkan tinggi protein dan rendah karbohidrat, pas untuk diet low carbs.",
    prepTime: "10 Menit",
    cookTime: "-",
    servings: "1 Porsi",
    nutrition: { calories: 270, protein: "25g", fat: "16g", carbs: "8g", fiber: "5g", sugar: "2g", sodium: "350mg" },
    ingredients: [
      { section: "Bahan", items: ["1 kaleng tuna in water (tiriskan)", "1/2 buah alpukat, potong dadu", "5 buah tomat ceri, belah dua", "Campuran selada hijau secukupnya", "1 sdm perasan lemon", "1 sdt minyak zaitun ekstra virgin (EVOO)"] }
    ],
    instructions: [
      "Siapkan mangkuk besar, masukkan selada, tomat ceri, dan alpukat.",
      "Tambahkan tuna yang sudah ditiriskan airnya.",
      "Buat dressing: campur perasan lemon, EVOO, garam, dan lada hitam tumbuk kasar. Aduk rata.",
      "Tuang dressing ke atas salad, aduk perlahan agar alpukat tidak hancur.",
      "Salad siap dinikmati."
    ],
    image: "https://images.unsplash.com/photo-1512852939750-1305098529bf?q=80&w=600&auto=format&fit=crop"
  }
];

export async function GET() {
  try {
    const recipesRef = collection(db, "recipes");
    let insertedCount = 0;
    
    for (const recipe of dummyRecipes) {
      await addDoc(recipesRef, recipe);
      insertedCount++;
    }
    
    return NextResponse.json({ success: true, message: `Successfully inserted ${insertedCount} dummy recipes.` });
  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
