"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sembunyikan footer jika berada di halaman dashboard/portal
  if (pathname?.startsWith('/portal-kdh') || pathname?.startsWith('/dashboard')) {
    return null; 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Note: Pastikan ENV variabel ini sudah diset di .env.local atau Vercel
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID", 
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID", 
        {
          user_email: email,
          message: "Ada pengguna baru yang ingin ikut kontribusi dan mendapatkan newsletter tips sehat Gizify!"
        }, 
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY"
      );
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Terima kasih atas kontribusinya! Kami akan mengirimkan tips sehat ke email kamu.',
        confirmButtonColor: '#1A453A'
      });
      setEmail("");
    } catch (error) {
      console.error("Error sending email:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengirim',
        text: 'Maaf, terjadi kesalahan sistem. Silakan coba lagi nanti.',
        confirmButtonColor: '#1A453A'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-white relative overflow-hidden">
      
      {/* Garis gradien super tipis pemisah section (Warna Gizify) */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#1A453A]/20 to-transparent" />
      
      {/* Ambient Glow Tipis di background footer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#1A453A]/[0.03] blur-[100px] pointer-events-none" />

      <div className="w-full pt-20 pb-12 px-6 md:px-8 border-b border-gray-100 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
            
            {/* LEFT - Logo & Deskripsi */}
            <div className="md:col-span-4 space-y-6">
              <Link href="/" className="flex items-center gap-2 group w-fit">
                <div className="relative w-20 h-20 group-hover:scale-105 transition-transform duration-500">
                  <Image src="/image/logo.png" alt="Gizify Logo" fill className="object-contain" />
                </div>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed font-medium max-w-sm">
                Pendamping nutrisi personal berbasis AI terkini. Wujudkan pola hidup sehat yang terukur, realistis, dan berkelanjutan dari genggamanmu.
              </p>
            </div>

            {/* MIDDLE - Navigation Links */}
            <div className="md:col-span-4 grid grid-cols-2 gap-6 lg:pl-12">
              <div className="space-y-6">
                <h3 className="font-black tracking-wide text-gray-900 uppercase text-xs">Produk</h3>
                <ul className="space-y-4">
                  <li><a href="/#about" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Scan AI Kalori</a></li>
                  <li><a href="/#about" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Katalog Resep</a></li>
                  <li><a href="/#about" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">GiziBot Assistant</a></li>
                  <li>
                    <a href="/#pricing" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-flex items-center gap-1.5">
                      Paket VIP <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-100 text-green-700">PRO</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <h3 className="font-black tracking-wide text-gray-900 uppercase text-xs">Perusahaan</h3>
                <ul className="space-y-4">
                  <li><a href="/#about" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Tentang Kami</a></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Blog Nutrisi</a></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Karir</a></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-[#1A453A] hover:translate-x-1 font-medium transition-all duration-300 inline-block">Kontak</a></li>
                </ul>
              </div>
            </div>

            {/* RIGHT - Newsletter (Disesuaikan ke tema Clean) */}
            <div className="md:col-span-4 space-y-6 lg:pl-12">
              <h3 className="font-black tracking-wide text-gray-900 uppercase text-xs">Tips Sehat Mingguan</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Dapatkan resep sehat & artikel gizi gratis setiap minggu langsung di inbox-mu.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email kamu..."
                  className="w-full px-5 py-3.5 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A453A] focus:bg-white transition-all duration-300"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="relative overflow-hidden w-full py-3.5 bg-[#1A453A] text-white font-bold text-sm uppercase tracking-wide rounded-full shadow-[0_5px_20px_rgba(26,69,58,0.2)] hover:shadow-[0_8px_25px_rgba(26,69,58,0.3)] disabled:opacity-70 disabled:hover:shadow-none disabled:cursor-not-allowed active:scale-95 transition-all duration-500 group/btn"
                >
                  {/* Shine Animation */}
                  <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                  <span className="relative z-10">{isSubmitting ? 'Mengirim...' : 'Ikut Kontribusi'}</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM SECTION - Copyright & Social Media */}
      <div className="w-full py-6 px-6 md:px-8 bg-gray-50/50 relative z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-col md:flex-row gap-6">
          
          <p className="text-gray-400 font-medium text-sm flex items-center flex-wrap gap-2 md:gap-4 justify-center">
            <span>© {new Date().getFullYear()} <span className="font-bold text-[#1A453A]">GIZIFY</span>. All Rights Reserved.</span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span className="flex gap-4">
              <a href="#" className="hover:text-[#1A453A] transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-[#1A453A] transition-colors">Syarat & Ketentuan</a>
            </span>
          </p>
          
          <div className="flex items-center gap-3">
            <a href="http://linkedin.com/company/kodehana" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 bg-white border border-gray-200 text-gray-400 rounded-full flex items-center justify-center hover:bg-[#1A453A] hover:text-white hover:border-[#1A453A] hover:shadow-[0_8px_20px_rgba(26,69,58,0.2)] hover:-translate-y-1 transition-all duration-300 group">
              <IconLinkedin />
            </a>
            <a href="https://www.instagram.com/kodehanaa/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 bg-white border border-gray-200 text-gray-400 rounded-full flex items-center justify-center hover:bg-[#1A453A] hover:text-white hover:border-[#1A453A] hover:shadow-[0_8px_20px_rgba(26,69,58,0.2)] hover:-translate-y-1 transition-all duration-300 group">
              <IconInstagram />
            </a>
          </div>
          
        </div>
      </div>
    </footer>
  );
}

// ==========================================
// KUMPULAN SVG ICONS
// ==========================================
const IconInstagram = () => <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const IconLinkedin = () => <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;