"use client";

import { useState, useRef, useEffect } from "react";

// Data FAQ disesuaikan untuk Giziku
const faqData = [
  {
    id: 1,
    question: "Apakah aplikasi Giziku berbayar?",
    answer: "Kamu bisa menggunakan fitur dasar seperti tracking kalori, BMI, dan akses resep standar secara GRATIS selamanya! Namun, jika kamu ingin fitur AI lanjutan seperti Unlimited Scan dan Custom Meal Plan, kamu bisa berlangganan Paket Pro."
  },
  {
    id: 2,
    question: "Apakah resepnya pakai bahan lokal yang gampang dicari?",
    answer: "Tentu saja! Kami sangat memahami kebutuhan pengguna di Indonesia. Rekomendasi GiziBot disesuaikan dengan bahan baku yang mudah dan murah ditemukan di pasar tradisional seperti tempe, tahu, ayam, dan sayuran lokal."
  },
  {
    id: 3,
    question: "Seberapa akurat AI Scanner makanan Giziku?",
    answer: "AI kami dilatih dengan puluhan ribu dataset makanan lokal dan global. Tingkat akurasinya mencapai 95%+ untuk mendeteksi kalori dan makronutrisi dari foto makanan utuh. Namun, untuk masakan olahan yang kompleks, GiziBot mungkin akan menanyakan beberapa detail tambahan."
  },
  {
    id: 4,
    question: "Apakah saya bisa membatalkan langganan kapan saja?",
    answer: "Bisa banget! Giziku tidak mengikat penggunanya. Kamu bebas melakukan upgrade, downgrade, atau membatalkan langganan kapan saja langsung melalui menu Pengaturan Profil tanpa syarat yang ribet."
  },
  {
    id: 5,
    question: "Apakah data kesehatan dan foto saya aman?",
    answer: "Keamanan privasi kamu adalah prioritas kami. Semua data berat badan, target diet, dan foto makanan dienkripsi secara aman. Kami tidak akan pernah menjual data pribadimu ke pihak ketiga."
  }
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Default buka item pertama
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

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={sectionRef} className="w-full py-24 md:py-32 px-4 md:px-8 bg-[#FAFAFA] relative overflow-hidden" id="faq">
      
      {/* Decorative Background Glow (Diganti Hijau Giziku) */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-64 w-[600px] h-[600px] rounded-full bg-green-500/10 blur-[120px] pointer-events-none animate-pulse" />

      {/* Injeksi CSS Animasi */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up {
            opacity: 0;
            transform: translateY(40px);
            animation: fadeUpAnim 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          @keyframes fadeUpAnim {
            to { opacity: 1; transform: translateY(0); }
          }
          
          /* Native Accordion Animation Trick */
          .faq-content {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .faq-content.open {
            grid-template-rows: 1fr;
          }
          .faq-inner {
            overflow: hidden;
          }
        `
      }} />

      <div className="max-w-[1240px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* ========================================== */}
          {/* LEFT CONTENT - Sticky on Desktop */}
          {/* ========================================== */}
          <div className={`lg:col-span-5 flex flex-col justify-center space-y-8 lg:sticky lg:top-32 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
            <div className="space-y-6">
              
              {/* TAG PILL STANDAR */}
              <div className="inline-flex w-max items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#1A453A] animate-pulse"></span>
                <span className="text-[9px] md:text-[10px] font-black text-[#1A453A] uppercase tracking-[0.25em]">Pusat Bantuan</span>
              </div>

              {/* Heading */}
              <h2 className="text-4xl md:text-[3.25rem] font-black text-gray-900 leading-[1.1] tracking-tighter">
                Pertanyaan Paling <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-[#1A453A] to-green-500">
                  Sering Muncul
                </span>
              </h2>
              
              {/* Copywriting Utama */}
              <p className="text-base text-gray-500 leading-relaxed font-medium">
                Punya keraguan tentang cara kerja AI, paket langganan, atau keamanan data? Temukan semua jawabannya di sini sebelum kamu mulai.
              </p>
            </div>

            {/* Interactive CTA "Kling/Shine" Effect (Tombol Mewah!) */}
            <div className="pt-2">
              <a href="/chatbot" className="relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A453A] text-white font-bold text-sm rounded-full transition-all duration-500 shadow-[0_8px_20px_rgba(26,69,58,0.2)] hover:shadow-[0_15px_30px_rgba(26,69,58,0.4)] hover:-translate-y-1 group/btn w-fit">
                
                {/* Efek Kilap (Shine) meluncur dari kiri ke kanan */}
                <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />

                {/* Konten Text & Icon */}
                <span className="relative z-10 w-5 h-5 text-green-300 transition-all duration-300 group-hover/btn:rotate-12 group-hover/btn:scale-110 group-hover/btn:text-white">
                  <IconPhoneCall />
                </span>
                <span className="relative z-10">Tanya GiziBot</span>
                <span className="relative z-10 w-5 h-5 ml-1 transition-transform duration-300 group-hover/btn:translate-x-1">
                  <IconArrowRight />
                </span>
              </a>
            </div>
          </div>

          {/* ========================================== */}
          {/* RIGHT CONTENT - Custom Accordion Cards */}
          {/* ========================================== */}
          <div className="lg:col-span-7">
            <div className="space-y-5">
              
              {faqData.map((faq, index) => {
                const isOpen = openIndex === index;
                const delay = `${(index * 100) + 200}ms`;

                return (
                  <div 
                    key={faq.id}
                    onClick={() => toggleFaq(index)}
                    className={`group cursor-pointer bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-400 
                      ${isVisible ? 'animate-fade-up' : 'opacity-0'}
                      ${isOpen 
                        ? 'border-[#1A453A]/50 shadow-[0_15px_40px_rgba(26,69,58,0.08)] bg-green-50/30 scale-[1.01]' 
                        : 'border-gray-200 hover:border-[#1A453A]/30 hover:bg-gray-50/50'
                      }`}
                    style={{ animationDelay: isVisible ? delay : '0ms' }}
                  >
                    {/* Accordion Trigger */}
                    <div className="px-6 py-5 md:px-8 md:py-6 flex items-center justify-between gap-4 select-none">
                      <h4 className={`text-base md:text-lg font-bold transition-colors duration-300 ${isOpen ? 'text-[#1A453A]' : 'text-gray-800 group-hover:text-[#1A453A]'}`}>
                        {faq.question}
                      </h4>
                      
                      <div className={`flex-shrink-0 transition-transform duration-400 ${isOpen ? 'rotate-180 text-[#1A453A]' : 'text-gray-400 group-hover:text-[#1A453A]'}`}>
                        <IconChevronDown />
                      </div>
                    </div>

                    {/* Accordion Content (Native CSS Grid Trick) */}
                    <div className={`faq-content ${isOpen ? 'open' : ''}`}>
                      <div className="faq-inner">
                        <div className="px-6 pb-6 md:px-8 md:pb-8 pt-0">
                          <p className="text-[15px] text-gray-500 leading-relaxed font-medium">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconChevronDown = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconMessageCircle = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><circle cx="12" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="12" r="1"/></svg>;
const IconPhoneCall = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M14.05 2a9 9 0 0 1 8 7.94"/><path d="M14.05 6A5 5 0 0 1 18 10"/></svg>;
const IconArrowRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;