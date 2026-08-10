"use client";

import { useState, useEffect, useRef } from "react";

// ==========================================
// MOCK DATA: CHAT HISTORY & SUGGESTIONS
// ==========================================
const mockChatHistory = [
  { id: 1, title: "Rekomendasi sarapan 300 kalori", date: "Hari Ini", time: "08:12" },
  { id: 2, title: "Berapa protein dada ayam?", date: "Kemarin", time: "14:30" },
  { id: 3, title: "Meal plan defisit kalori", date: "2 Hari Lalu", time: "09:00" },
  { id: 4, title: "Cara menghitung TDEE", date: "Minggu Lalu", time: "16:45" },
  { id: 5, title: "Resep jus detox hijau", date: "Minggu Lalu", time: "07:20" },
];

const mockSuggestions = [
  { icon: "🍳", text: "Ide Sarapan High Protein" },
  { icon: "🔥", text: "Cara Defisit Kalori" },
  { icon: "🥑", text: "Lemak Baik vs Lemak Jahat" },
  { icon: "💪", text: "Hitung Kebutuhan Protein" }
];

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
  time: string;
  hasWidget?: boolean;
  widgetData?: any;
};

const initialMessages: Message[] = [
  { 
    id: 1, 
    sender: "bot", 
    text: "Halo Zolla! 👋 Aku GiziBot, asisten nutrisi pribadi kamu. Ada yang bisa aku bantu hari ini? Kamu bisa tanya soal resep diet, perhitungan kalori, atau tips nutrisi lainnya.", 
    time: "08:00" 
  },
  { 
    id: 2, 
    sender: "user", 
    text: "Tolong buatin rekomendasi makan siang yang tinggi protein tapi di bawah 400 kalori dong. Bosen makan dada ayam rebus terus.", 
    time: "08:02" 
  },
  { 
    id: 3, 
    sender: "bot", 
    text: "Tentu! Dada ayam rebus memang membosankan kalau dimakan tiap hari. Aku punya beberapa rekomendasi makan siang tinggi protein di bawah 400 kalori yang rasanya jauh lebih enak. \n\nIni salah satu menu favorit yang bisa kamu coba buat hari ini:", 
    time: "08:03",
    hasWidget: true,
    widgetData: {
      title: "Ayam Bakar Taliwang Diet",
      calories: 320,
      protein: 35,
      carbs: 8,
      fat: 12,
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop"
    }
  }
];

export default function ChatbotPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // EFEK 1: JURUS MENGHITUNG SISA LAYAR OTOMATIS (Mencegah Global Scroll)
  useEffect(() => {
    const fixHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const paddingBottom = rect.top > 0 ? rect.top : 24; 
        const exactHeight = window.innerHeight - rect.top - paddingBottom;
        containerRef.current.style.height = `${exactHeight}px`;
      }
    };

    fixHeight();
    window.addEventListener("resize", fixHeight);
    
    const timer = setTimeout(() => setIsLoaded(true), 100);
    
    return () => {
      window.removeEventListener("resize", fixHeight);
      clearTimeout(timer);
    };
  }, []);

  // EFEK 2: Auto-Tutup Sidebar di Layar Kecil (Responsif)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // EFEK 3: Auto-scroll chat ke paling bawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const newBotMsg: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Baik, aku catat ya! Berdasarkan data terbarumu, aku akan sesuaikan rekomendasi selanjutnya agar lebih bervariasi. Ada lagi yang ingin kamu ketahui?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newBotMsg]);
    }, 2500);
  };

  const handleSuggestionClick = (text: string) => {
    setInputValue(text);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full flex flex-col min-h-0 overflow-hidden relative bg-transparent"
    >
      
      {/* DECORATIVE BACKGROUND BLURS */}
      <div className={`absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-[#1EAB57]/5 rounded-full blur-[100px] pointer-events-none z-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-400/5 rounded-full blur-[120px] pointer-events-none z-0 transition-opacity duration-1000 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`absolute top-1/2 left-0 w-[20rem] h-[20rem] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none z-0 transition-opacity duration-1000 delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* CSS ANIMASI KUSTOM */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(30px); animation: fadeUpAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-in { opacity: 0; animation: fadeInAnim 0.8s ease-out forwards; }
          
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInAnim { to { opacity: 1; } }
          
          .delay-100 { animation-delay: 0.1s; } 
          .delay-500 { animation-delay: 0.5s; }
          
          .no-scrollbar::-webkit-scrollbar { display: none; } 
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          
          .typing-dot { animation: typingBounce 1.4s infinite ease-in-out both; }
          .typing-dot:nth-child(1) { animation-delay: -0.32s; }
          .typing-dot:nth-child(2) { animation-delay: -0.16s; }
          @keyframes typingBounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
          
          /* Custom scrollbar for chat area */
          .chat-scrollbar::-webkit-scrollbar { width: 6px; }
          .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .chat-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
          .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        `
      }} />

      {/* WORKSPACE AREA (Menggunakan flex-row agar berdampingan di Desktop) */}
      <div className={`flex flex-row gap-0 lg:gap-6 w-full h-full min-h-0 relative z-10 overflow-hidden ${isLoaded ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
        
        {/* ======================================= */}
        {/* MAIN CHAT AREA (KIRI/TENGAH) */}
        {/* ======================================= */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_-15px_rgb(0,0,0,0.05)] overflow-hidden relative">
          
          {/* Chat Header */}
          <div className="h-[70px] md:h-[76px] shrink-0 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between z-10 shadow-sm relative">
            <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors lg:hidden active:scale-95"
              >
                <IconMenu className="w-6 h-6 text-slate-700" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1rem] bg-gradient-to-br from-[#1EAB57] to-[#127236] flex items-center justify-center shadow-md">
                  <IconBot className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black text-[#0F172A] tracking-tight leading-none mb-1">GiziBot AI</h2>
                <p className="text-[9px] md:text-[10px] font-bold text-[#1EAB57] uppercase tracking-widest flex items-center gap-1">
                  <IconCheckCircle className="w-3 h-3" /> Online & Siap Membantu
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto chat-scrollbar p-4 md:p-8 pb-28 md:pb-32 flex flex-col gap-6 md:gap-8 bg-slate-50/30 relative min-h-0">
            
            {/* Date Divider */}
            <div className="flex items-center justify-center my-2">
              <span className="bg-white border border-slate-100 px-4 py-1.5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                Hari Ini, 08:00
              </span>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`} style={{animationDuration: '0.4s'}}>
                <div className={`flex gap-2.5 md:gap-4 max-w-[90%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#1EAB57] to-[#127236] flex items-center justify-center shrink-0 shadow-sm self-end">
                      <IconBot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                  )}

                  <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 px-2">{msg.sender === 'user' ? 'Kamu' : 'GiziBot'} • {msg.time}</span>
                    
                    <div className={`px-4 md:px-5 py-3 md:py-4 text-[13px] md:text-sm font-medium leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                      ? 'bg-[#0F172A] text-white rounded-[1.25rem] md:rounded-[1.5rem] rounded-br-sm' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-[1.25rem] md:rounded-[1.5rem] rounded-bl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      
                      {/* Rich UI Widget */}
                      {msg.hasWidget && msg.widgetData && (
                        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-[1.25rem] p-3 w-full max-w-[260px] md:max-w-sm hover:shadow-md transition-shadow cursor-pointer group">
                          <div className="w-full h-28 md:h-32 rounded-lg md:rounded-xl overflow-hidden relative mb-3">
                            <img src={msg.widgetData.image} alt={msg.widgetData.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-2 left-2 bg-[#1EAB57]/90 backdrop-blur-sm px-2 py-1 rounded-lg text-white">
                              <span className="text-[8px] font-black uppercase tracking-widest"><IconFlame className="inline w-3 h-3 -mt-0.5"/> {msg.widgetData.calories} Kkal</span>
                            </div>
                          </div>
                          <h4 className="text-xs md:text-sm font-black text-slate-900 mb-2 group-hover:text-[#1EAB57] transition-colors">{msg.widgetData.title}</h4>
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            <span className="bg-white border border-slate-200 text-slate-500 px-1.5 md:px-2 py-1 rounded text-[8px] md:text-[9px] font-bold">Pro: {msg.widgetData.protein}g</span>
                            <span className="bg-white border border-slate-200 text-slate-500 px-1.5 md:px-2 py-1 rounded text-[8px] md:text-[9px] font-bold">Carbs: {msg.widgetData.carbs}g</span>
                            <span className="bg-white border border-slate-200 text-slate-500 px-1.5 md:px-2 py-1 rounded text-[8px] md:text-[9px] font-bold">Fat: {msg.widgetData.fat}g</span>
                          </div>
                          <button className="w-full mt-3 bg-[#1EAB57] text-white py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#168E46] transition-colors shadow-sm">
                            Tambah ke Jurnal
                          </button>
                        </div>
                      )}
                    </div>

                    {msg.sender === 'bot' && (
                      <div className="flex items-center gap-2 mt-1 px-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-300 hover:text-[#1EAB57] transition-colors"><IconCopy className="w-3.5 h-3.5" /></button>
                        <button className="text-slate-300 hover:text-emerald-500 transition-colors"><IconThumbsUp className="w-3.5 h-3.5" /></button>
                        <button className="text-slate-300 hover:text-rose-500 transition-colors"><IconThumbsDown className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex w-full justify-start animate-fade-up" style={{animationDuration: '0.3s'}}>
                <div className="flex gap-3 md:gap-4 max-w-[85%] flex-row">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#1EAB57] to-[#127236] flex items-center justify-center shrink-0 shadow-sm self-end">
                    <IconBot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-[10px] font-bold text-slate-400 px-2">GiziBot • Sedang mengetik</span>
                    <div className="px-5 py-4 bg-white border border-slate-100 rounded-[1.5rem] rounded-bl-sm shadow-sm flex items-center gap-1.5 h-[42px] md:h-[46px]">
                      <div className="w-1.5 h-1.5 bg-[#1EAB57] rounded-full typing-dot"></div>
                      <div className="w-1.5 h-1.5 bg-[#1EAB57] rounded-full typing-dot"></div>
                      <div className="w-1.5 h-1.5 bg-[#1EAB57] rounded-full typing-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="pt-4" />
          </div>

          {/* Suggestions Overlay */}
          {!isTyping && messages.length <= 3 && (
            <div className="absolute bottom-[80px] md:bottom-[90px] left-4 right-4 md:left-8 md:right-8 z-10 animate-fade-in delay-500 pointer-events-none">
              <div className="flex flex-nowrap md:flex-wrap overflow-x-auto no-scrollbar items-center justify-start gap-2 max-w-2xl pointer-events-auto pb-2 md:pb-0">
                {mockSuggestions.map((sug, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSuggestionClick(sug.text)}
                    className="shrink-0 bg-white/90 backdrop-blur-md border border-slate-200/60 hover:border-[#1EAB57] text-slate-600 hover:text-[#1EAB57] px-3 md:px-4 py-2 rounded-xl text-[11px] md:text-xs font-black transition-all shadow-[0_4px_10px_rgb(0,0,0,0.03)] hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center gap-1.5 md:gap-2"
                  >
                    <span>{sug.icon}</span> {sug.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Area */}
          <div className="p-3 md:p-6 bg-white border-t border-slate-100 z-20 shadow-[0_-10px_40px_rgb(0,0,0,0.02)] shrink-0">
            <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 md:gap-3 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] p-1.5 md:p-2 transition-all focus-within:bg-white focus-within:border-[#1EAB57]/30 focus-within:ring-4 focus-within:ring-[#1EAB57]/10">
              <button type="button" className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-[#1EAB57] hover:bg-emerald-50 transition-colors cursor-pointer mb-0.5 md:mb-0.5 ml-0.5 md:ml-1">
                <IconPaperclip className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ketik pesan atau resep diet..."
                className="flex-1 bg-transparent border-none resize-none max-h-28 md:max-h-32 min-h-[2.25rem] md:min-h-[2.5rem] py-2.5 md:py-3 text-[13px] md:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 chat-scrollbar"
                rows={1}
              />
              
              {inputValue.trim() ? (
                <button 
                  type="submit" 
                  className="w-10 h-10 md:w-11 md:h-11 shrink-0 bg-[#1EAB57] text-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(30,171,87,0.3)] hover:bg-[#168E46] hover:scale-105 active:scale-95 transition-all cursor-pointer mb-0.5 mr-0.5"
                >
                  <IconSend className="w-4 h-4 md:w-5 md:h-5 -ml-0.5" />
                </button>
              ) : (
                <button type="button" className="w-10 h-10 md:w-11 md:h-11 shrink-0 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer mb-0.5 mr-0.5">
                  <IconMic className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </form>
            <div className="text-center mt-2 md:mt-3 hidden sm:block">
              <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                GiziBot dapat berbuat kesalahan. Periksa info penting dengan ahli gizi.
              </p>
            </div>
          </div>

        </div>

        {/* ======================================= */}
        {/* SIDEBAR: HISTORY (KANAN - RESPONSIVE DRAWER DI MOBILE) */}
        {/* ======================================= */}
        
        {/* BACKDROP GELAP DI MOBILE SAAT SIDEBAR TERBUKA */}
        <div 
          className={`lg:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        <div className={`
          absolute lg:static right-0 top-0 h-full z-50 lg:z-10
          w-[85%] sm:w-[320px] lg:w-[320px]
          transition-transform duration-500 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:flex'}
          ${!sidebarOpen && 'lg:flex'} /* Pastikan di desktop selalu terlihat walau state mobile false */
          flex flex-col gap-4 shrink-0 bg-white/95 lg:bg-white/60 backdrop-blur-2xl lg:backdrop-blur-xl
          rounded-l-3xl lg:rounded-[2rem] border border-white/50 lg:border-white shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.1)] lg:shadow-[0_15px_40px_-10px_rgb(0,0,0,0.03)] p-4 md:p-5
        `}>
          
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-1 md:mb-2 px-1 md:px-2 shrink-0">
            <h3 className="text-base md:text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
              <IconHistory className="w-4 h-4 md:w-5 md:h-5 text-[#1EAB57]" /> Riwayat
            </h3>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-full hover:bg-slate-100 hidden lg:flex items-center justify-center text-slate-400 transition-colors cursor-pointer">
                <IconEdit className="w-4 h-4" />
              </button>
              {/* Tombol Close Khusus Mobile */}
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 flex lg:hidden items-center justify-center text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <button className="shrink-0 w-full bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl py-3 md:py-3.5 flex items-center justify-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer">
            <IconPlus className="w-4 h-4 text-[#1EAB57]" /> Chat Baru
          </button>

          {/* History List (Scrollable) */}
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4 md:gap-5 mt-2 md:mt-4 px-1 md:px-2 min-h-0">
            
            <div className="flex flex-col gap-1.5 md:gap-2">
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-0.5 md:mb-1">Hari Ini</span>
              {mockChatHistory.filter(h => h.date === "Hari Ini").map(chat => (
                <div key={chat.id} className="group flex flex-col gap-1 p-2.5 md:p-3 rounded-xl hover:bg-white transition-all cursor-pointer border border-transparent hover:border-slate-100 hover:shadow-sm">
                  <p className="text-[11px] md:text-xs font-bold text-slate-700 group-hover:text-[#1EAB57] truncate transition-colors">{chat.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-400">{chat.time}</span>
                    <button className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"><IconTrash className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 md:gap-2">
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-0.5 md:mb-1">Kemarin</span>
              {mockChatHistory.filter(h => h.date === "Kemarin").map(chat => (
                <div key={chat.id} className="group flex flex-col gap-1 p-2.5 md:p-3 rounded-xl hover:bg-white transition-all cursor-pointer border border-transparent hover:border-slate-100 hover:shadow-sm">
                  <p className="text-[11px] md:text-xs font-bold text-slate-700 group-hover:text-[#1EAB57] truncate transition-colors">{chat.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-400">{chat.time}</span>
                    <button className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"><IconTrash className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 md:gap-2">
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-0.5 md:mb-1">7 Hari Sebelumnya</span>
              {mockChatHistory.filter(h => h.date !== "Hari Ini" && h.date !== "Kemarin").map(chat => (
                <div key={chat.id} className="group flex flex-col gap-1 p-2.5 md:p-3 rounded-xl hover:bg-white transition-all cursor-pointer border border-transparent hover:border-slate-100 hover:shadow-sm">
                  <p className="text-[11px] md:text-xs font-bold text-slate-600 group-hover:text-[#1EAB57] truncate transition-colors">{chat.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-400">{chat.date}</span>
                    <button className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"><IconTrash className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Profile Plan Upgrade Card in Sidebar */}
          <div className="shrink-0 mt-3 md:mt-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl p-3 md:p-4 border border-emerald-200/50 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#1EAB57]/10 rounded-full blur-xl group-hover:bg-[#1EAB57]/20 transition-all"></div>
            <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 relative z-10">
              <IconSparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" />
              <h4 className="text-[11px] md:text-xs font-black text-emerald-900 uppercase tracking-widest">GiziBot Pro</h4>
            </div>
            <p className="text-[9px] md:text-[10px] font-bold text-emerald-700 leading-relaxed relative z-10">Dapatkan unlimited AI scan, meal plan kustom & konsultasi 24/7.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// KUMPULAN SVG ICONS KUSTOM
// ==========================================
const IconBot = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconSparkles = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path></svg>;
const IconFlame = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>;
const IconMenu = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const IconCheckCircle = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconPaperclip = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>;
const IconSend = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconTrash = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconCopy = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const IconThumbsUp = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
const IconThumbsDown = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>;
const IconEdit = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconPlus = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconHistory = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline><path d="M12 7v5l4 2"></path></svg>;
const IconMic = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>;
const IconClose = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;