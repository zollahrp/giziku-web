"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoverStyle, setHoverStyle] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Tentang", href: "#about" },
    { label: "Cara Kerja", href: "#cara-kerja" },
    { label: "Fitur", href: "#testimonial" },
    { label: "Harga", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  // Efek hover untuk sliding pill background di desktop
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    setHoverStyle({
      left: target.offsetLeft,
      top: target.offsetTop,
      width: target.offsetWidth,
      height: target.offsetHeight,
      opacity: 1,
    });
  };

  // Logika smooth scroll antar section
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const navHeight = 100; 
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
      setIsMobileMenuOpen(false); 
    } 
    else if (href === "/" && pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 sm:px-6 lg:px-8 ${
        isScrolled ? "py-4" : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <nav
          className={`relative flex items-center justify-between transition-all duration-500 ease-out ${
            isScrolled
              ? "bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-full px-6 py-3"
              : "bg-white/40 backdrop-blur-md border border-white/50 px-6 py-3.5 rounded-full"
          }`}
        >
          {/* KIRI: Logo GIZIKU */}
          <Link 
            href="/" 
            onClick={(e) => handleSmoothScroll(e, "/")}
            className="flex items-center gap-2 group z-20"
          >
            <div className={`flex items-center justify-center text-white font-black bg-[#1A453A] rounded-full shadow-md transition-all duration-500 ease-out group-hover:scale-105 ${isScrolled ? "w-8 h-8 text-base" : "w-9 h-9 text-lg"}`}>
              G
            </div>
            <span className={`font-black tracking-tight text-gray-900 transition-all duration-500 ${isScrolled ? "text-lg" : "text-xl"}`}>
              GIZIKU<span className="text-green-600">.AI</span>
            </span>
          </Link>

          {/* TENGAH: Desktop Nav - Floating Island dengan efek Sliding Hover */}
          <div 
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 bg-gray-50/80 backdrop-blur-md border border-gray-200/60 p-1.5 rounded-full shadow-inner"
            onMouseLeave={() => setHoverStyle((prev) => ({ ...prev, opacity: 0 }))}
          >
            {/* Sliding Pill Background */}
            <div
              className="absolute bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 rounded-full transition-all duration-300 ease-out z-0"
              style={{
                left: `${hoverStyle.left}px`,
                top: `${hoverStyle.top}px`,
                width: `${hoverStyle.width}px`,
                height: `${hoverStyle.height}px`,
                opacity: hoverStyle.opacity,
              }}
            />

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)} 
                  onMouseEnter={handleMouseEnter}
                  className={`relative z-10 px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-300 rounded-full ${
                    isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* KANAN: Login, CTA "Mulai Coba" & Hamburger */}
          <div className="flex items-center gap-4 z-20">
            
            {/* Teks Login Desktop */}
            <Link
              href="/login"
              className="hidden lg:block px-2 text-xs font-extrabold uppercase tracking-wider text-gray-600 hover:text-gray-900 transition-colors"
            >
              Masuk
            </Link>

            {/* Tombol CTA Desktop dengan Efek Shine (Warna GIZIKU) */}
            <Link
              href="/register"
              className="relative overflow-hidden hidden lg:flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all duration-500 bg-[#1A453A] hover:bg-[#123129] rounded-full shadow-[0_8px_20px_rgba(26,69,58,0.25)] hover:shadow-[0_15px_30px_rgba(26,69,58,0.4)] hover:-translate-y-0.5 hover:scale-105 active:scale-95 group/btn"
            >
              {/* Shine Animation */}
              <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              
              <span className="relative z-10 flex items-center gap-2">
                Mulai Coba
                <IconArrowRight />
              </span>
            </Link>

            {/* Tombol Hamburger Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-full transition-all duration-300 ${
                isScrolled ? "bg-gray-100/80 hover:bg-gray-200 text-gray-800" : "bg-white/50 hover:bg-white/80 text-gray-700"
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </nav>

        {/* ======================================= */}
        {/* MOBILE NAVIGATION DROPDOWN (Grid Trick) */}
        {/* ======================================= */}
        <div
          className={`lg:hidden grid transition-all duration-500 ease-in-out ${
            isMobileMenuOpen
              ? "grid-rows-[1fr] opacity-100 mt-3"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="bg-white/95 backdrop-blur-2xl border border-gray-100 shadow-2xl rounded-3xl p-5 flex flex-col gap-1 mx-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className={`px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-gray-900 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              <hr className="my-3 border-gray-100" />
              
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-2xl transition-colors"
              >
                Masuk ke Akun
              </Link>

              {/* Tombol CTA Mobile dengan Warna GIZIKU */}
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative overflow-hidden mt-1 flex items-center justify-center gap-2 px-5 py-4 text-sm font-bold text-white bg-[#1A453A] hover:bg-[#123129] rounded-2xl shadow-[0_8px_20px_rgba(26,69,58,0.25)] active:scale-95 transition-all duration-500 group/btnMobile"
              >
                <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover/btnMobile:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                <span className="relative z-10 flex items-center gap-2">
                  Mulai Transformasi
                  <IconArrowRight />
                </span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const IconClose = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);