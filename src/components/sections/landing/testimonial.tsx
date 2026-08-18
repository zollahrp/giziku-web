"use client";

import { useEffect, useState, useRef } from 'react';

const testimonials = [
  {
    name: "Ibu Rina S.",
    role: "Kader PKK Kota Bogor",
    text: "Gizify ngebantu banget buat program sadar gizi di kelurahan. Kader jadi gampang ngasih contoh menu sehat murah ke warga. Sangat direkomendasikan!",
    rating: 5,
  },
  {
    name: "Budi Santoso",
    role: "Ayah 2 Anak",
    text: "Tadi nyobain scan makanan langsung di pameran, prosesnya mulus banget dan tebakan kalorinya akurat. Aplikasi yang pas buat mantau gizi keluarga.",
    rating: 5,
  },
  {
    name: "Siti M.",
    role: "Mahasiswi Ilmu Gizi",
    text: "GiziBot berasa kayak asisten praktikum. Database makanannya lengkap buat masakan lokal. UX-nya juga clean, selalu ada opsi sehat buat anak kos.",
    rating: 5,
  },
  {
    name: "Ahmad F.",
    role: "Penggiat Gym",
    text: "Tracker makro-nya akurat. Ngebantu banget buat mantau asupan protein harian pas lagi masa bulking. Akhirnya nemu aplikasi diet buatan lokal yang sebagus ini.",
    rating: 5,
  },
  {
    name: "Dewi L.",
    role: "Ibu Rumah Tangga",
    text: "Suka banget sama rekomendasi resepnya. Bahan-bahannya gampang dicari di pasar tradisional dan harganya terjangkau. Makin semangat masak sehat!",
    rating: 4,
  }
];

export default function Testimonial() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 } 
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section ref={sectionRef} className="w-full py-20 bg-white relative flex flex-col items-center justify-center min-h-[90vh] overflow-hidden" id="testimonial">
      
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Animasi Teks & Marquee (Fade Up biasa) */
          .fade-up {
            animation: fadeUpAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
            transform: translateY(40px);
          }
          @keyframes fadeUpAnim {
            to { opacity: 1; transform: translateY(0); }
          }

          /* Animasi Foto (Pop Up Spring dari tengah) */
          .pop-out {
            animation: popOutAnim 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            opacity: 0;
            transform: scale(0.6) translateY(50px);
            transform-origin: bottom center;
          }
          @keyframes popOutAnim {
            to { opacity: 1; transform: scale(1) translateY(0); }
          }

          /* Animasi Infinite Marquee Super Smooth */
          .animate-marquee {
            animation: marquee 50s linear infinite; 
          }
          .marquee-container:hover .animate-marquee {
            animation-play-state: paused;
          }
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); } 
          }
        `
      }} />

      <div className="w-full mx-auto flex flex-col items-center">
        
        {/* ========================================== */}
        {/* TOP: 8-COLUMN ARCH MASONRY (POP-OUT WAVE) */}
        {/* ========================================== */}
        <div className="relative w-full max-w-[1400px] flex justify-center items-start gap-3 md:gap-4 lg:gap-5 pb-32 md:pb-40 px-2">
          
          {/* Col 1 */}
          <div className={`hidden lg:flex flex-col gap-4 pt-36 ${isVisible ? 'pop-out' : 'opacity-0'}`} style={{ animationDelay: '700ms' }}>
             <div className="w-[100px] xl:w-[130px] h-[130px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-sm">
               <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
             <div className="w-[100px] xl:w-[130px] h-[180px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-sm">
               <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
          </div>

          {/* Col 2 */}
          <div className={`hidden md:flex flex-col gap-4 pt-12 ${isVisible ? 'pop-out' : 'opacity-0'}`} style={{ animationDelay: '500ms' }}>
             <div className="w-[110px] xl:w-[140px] h-[120px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-sm">
               <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
             <div className="w-[110px] xl:w-[140px] h-[130px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-sm">
               <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
             <div className="w-[110px] xl:w-[140px] h-[170px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-sm">
               <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
          </div>

          {/* Col 3 */}
          <div className={`flex flex-col gap-4 pt-28 ${isVisible ? 'pop-out' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
             <div className="w-[120px] md:w-[140px] xl:w-[160px] h-[220px] md:h-[260px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-md">
                <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
          </div>

          {/* Col 4 (Center Left) */}
          <div className={`flex flex-col gap-4 pt-0 ${isVisible ? 'pop-out' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
             <div className="w-[130px] md:w-[160px] xl:w-[180px] h-[280px] md:h-[340px] rounded-[2rem] overflow-hidden bg-gray-100 z-10 border-4 border-white hover:scale-105 transition-transform duration-500 shadow-xl">
                <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
          </div>

          {/* Col 5 (Center Right) */}
          <div className={`flex flex-col gap-4 pt-10 ${isVisible ? 'pop-out' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
             <div className="w-[130px] md:w-[150px] xl:w-[170px] h-[240px] md:h-[280px] rounded-[2rem] overflow-hidden bg-gray-100 z-10 border-4 border-white hover:scale-105 transition-transform duration-500 shadow-xl">
                <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
          </div>

          {/* Col 6 */}
          <div className={`flex flex-col gap-4 pt-32 ${isVisible ? 'pop-out' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
             <div className="w-[120px] md:w-[140px] xl:w-[160px] h-[200px] md:h-[230px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-md">
                <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
          </div>

          {/* Col 7 */}
          <div className={`hidden md:flex flex-col gap-4 pt-12 ${isVisible ? 'pop-out' : 'opacity-0'}`} style={{ animationDelay: '500ms' }}>
             <div className="w-[110px] xl:w-[140px] h-[130px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-sm">
                <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
             <div className="w-[110px] xl:w-[140px] h-[170px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-sm">
                <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
             <div className="w-[110px] xl:w-[140px] h-[120px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-sm">
                <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
          </div>

          {/* Col 8 (Far Right) */}
          <div className={`hidden lg:flex flex-col gap-4 pt-36 ${isVisible ? 'pop-out' : 'opacity-0'}`} style={{ animationDelay: '700ms' }}>
             <div className="w-[100px] xl:w-[130px] h-[150px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-sm">
                <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
             <div className="w-[100px] xl:w-[130px] h-[150px] rounded-3xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-500 shadow-sm">
                <img src="/image/about-giziku.jpg" className="w-full h-full object-cover" alt="Gizify Moment" />
             </div>
          </div>

          {/* TEXT HEADER - Delay 900ms */}
          <div className={`absolute bottom-[20px] md:bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl text-center flex flex-col items-center z-20 ${isVisible ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '900ms' }}>
            
            {/* INI TAG YANG UDAH DI-UPDATE BIAR SAMA KAYAK HERO & ABOUT */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100/80 mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md">
               <span className="w-2 h-2 rounded-full bg-[#1A453A] animate-pulse"></span>
               <span className="text-[9px] md:text-[10px] font-black text-[#1A453A] uppercase tracking-[0.25em]">Testimonials</span>
            </div>

            <h2 className="text-3xl md:text-[2.5rem] lg:text-[2.75rem] font-black text-gray-950 tracking-tight leading-[1.15]">
              Dipercaya oleh ibu-ibu penggerak dan <br className="hidden md:block" />
              <span className="text-gray-400">ribuan keluarga Indonesia</span>
            </h2>
          </div>

        </div>

        {/* ========================================== */}
        {/* BOTTOM: PREMIUM CARD MARQUEE REVIEWS */}
        {/* ========================================== */}
        <div className={`relative w-full overflow-hidden marquee-container mt-12 md:mt-20 py-4 ${isVisible ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '1100ms' }}>
          
          <div className="absolute top-0 left-0 w-[5%] md:w-[10%] h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[5%] md:w-[10%] h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          <div className="flex w-max animate-marquee hover:pause gap-6 md:gap-8 px-6 items-stretch">
            {duplicatedTestimonials.map((testi, index) => (
              <div 
                key={index} 
                className="w-[320px] md:w-[400px] shrink-0 bg-white border border-gray-100 rounded-3xl p-8 flex flex-col justify-between text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(26,69,58,0.08)] hover:-translate-y-1 transition-all duration-300 relative group"
              >
                
                {/* Watermark Quote Icon */}
                <div className="absolute top-6 right-8 text-gray-100 group-hover:text-green-50 transition-colors duration-300">
                  <IconQuote />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-6 relative z-10">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < testi.rating ? "text-[#F59E0B]" : "text-gray-200"}>
                        <IconStarSolid />
                      </span>
                    ))}
                  </div>

                  <p className="text-[15px] md:text-base text-gray-600 font-medium leading-relaxed mb-8 relative z-10">
                    "{testi.text}"
                  </p>
                </div>

                {/* Profil (Tanpa Avatar) */}
                <div className="flex flex-col border-t border-gray-50 pt-5 relative z-10">
                  <h4 className="text-[15px] font-extrabold text-gray-950 mb-0.5">{testi.name}</h4>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{testi.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconStarSolid = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconQuote = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.5"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>;