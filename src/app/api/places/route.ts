// Path: src/app/api/places/route.ts
import { NextResponse } from 'next/server';

// Rumus Haversine untuk menghitung jarak akurat di bumi (dalam KM)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude dan Longitude wajib diisi' }, { status: 400 });
  }

  // REVISI QUERY: 
  // 1. Pakai 'nwr' (Node, Way, Relation) biar Area Bangunan Pasar Tradisional ikut kebaca.
  // 2. Pasar & Supermarket radarnya diperluas jadi 5 KM, Minimarket dibatasi 2 KM aja biar gak nyepam.
  // 3. Pakai 'out center' buat dapetin titik tengah dari sebuah bangunan pasar.
  const overpassQuery = `
    [out:json][timeout:25];
    (
      nwr["amenity"="marketplace"](around:5000, ${lat}, ${lng});
      nwr["shop"="supermarket"](around:5000, ${lat}, ${lng});
      nwr["shop"="greengrocer"](around:5000, ${lat}, ${lng});
      nwr["shop"="convenience"](around:2000, ${lat}, ${lng});
    );
    out center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
        'User-Agent': 'GizifyApp/2.0 (NextJS Balanced)' 
      },
      body: overpassQuery, 
    });

    if (!response.ok) {
      throw new Error("Overpass API returned an error");
    }

    const data = await response.json();

    // Format data
    let stores = data.elements
      .filter((el: any) => el.tags && el.tags.name)
      .map((el: any) => {
        // Ambil kordinat (kalau Node dia punya lat/lon, kalau Way/Bangunan dia punya center.lat/lon)
        const objLat = el.lat || (el.center && el.center.lat);
        const objLon = el.lon || (el.center && el.center.lon);
        
        if (!objLat || !objLon) return null;

        const distance = getDistanceFromLatLonInKm(parseFloat(lat), parseFloat(lng), objLat, objLon);
        
        let type = "Toko/Minimarket";
        if (el.tags.amenity === "marketplace") type = "Pasar";
        if (el.tags.shop === "supermarket") type = "Supermarket";
        if (el.tags.shop === "greengrocer") type = "Toko Sayur";

        const dummyItemsMap: any = {
          "Pasar": ["tomat", "bayam", "daging ayam", "bawang merah", "cabai segar", "ikan"],
          "Supermarket": ["susu sapi", "daging sapi", "tomat", "buah naga", "chia seed", "ayam filet"],
          "Toko Sayur": ["bayam", "kangkung", "tomat", "tahu", "tempe"],
          "Toko/Minimarket": ["telur", "susu", "roti", "beras", "minyak goreng", "tomat"]
        };

        return {
          id: el.id,
          name: el.tags.name,
          distanceNum: distance,
          distance: distance.toFixed(1) + " km",
          type: type,
          status: "Buka",
          price: type === "Supermarket" ? "Menengah" : "Murah",
          items: dummyItemsMap[type] || ["bahan segar", "tomat"],
          lat: objLat,
          lng: objLon
        };
      })
      .filter((s: any) => s !== null); // Buang yang gak ada kordinatnya

    // ALGORITMA BALANCED DISTRIBUTION (Anti-Spam Indomaret)
    // Kita pisahin dulu berdasarkan kategori, lalu urutkan jaraknya
    const pasars = stores.filter((s: any) => s.type === "Pasar").sort((a: any, b: any) => a.distanceNum - b.distanceNum).slice(0, 15);
    const supers = stores.filter((s: any) => s.type === "Supermarket").sort((a: any, b: any) => a.distanceNum - b.distanceNum).slice(0, 15);
    const sayurs = stores.filter((s: any) => s.type === "Toko Sayur").sort((a: any, b: any) => a.distanceNum - b.distanceNum).slice(0, 10);
    const minis = stores.filter((s: any) => s.type === "Toko/Minimarket").sort((a: any, b: any) => a.distanceNum - b.distanceNum).slice(0, 15);

    // Gabungin semuanya jadi satu array
    let balancedStores = [...pasars, ...supers, ...sayurs, ...minis];

    // Urutkan ulang secara global berdasarkan jarak terdekat dari user
    balancedStores.sort((a: any, b: any) => a.distanceNum - b.distanceNum);

    return NextResponse.json({ stores: balancedStores });

  } catch (error) {
    console.error("Overpass API Error:", error);
    return NextResponse.json({ error: 'Gagal mengambil data dari satelit' }, { status: 500 });
  }
}