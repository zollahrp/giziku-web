// Path: src/app/(dashboard)/chatbot/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// FIREBASE IMPORTS
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";

// ==========================================
// TIPE DATA CHAT
// ==========================================
type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
  time: string;
  image?: string; // TAMBAHAN: Buat nyimpen base64 gambar
  hasWidget?: boolean;
  widgetData?: any;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: Date;
  messages: Message[];
};

const mockSuggestions = [
  { icon: "🍳", text: "Ide Sarapan High Protein" },
  { icon: "🔥", text: "Cara Defisit Kalori" },
  { icon: "🥑", text: "Lemak Baik vs Lemak Jahat" },
  { icon: "💪", text: "Hitung Kebutuhan Protein" }
];

export default function ChatbotPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // STATE USER
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");

  // STATE CHAT
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // STATE FITUR BARU (MIC & IMAGE)
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const fetchedName = userDoc.exists() && userDoc.data().name ? userDoc.data().name.split(" ")[0] : "Zolla";
        setUserName(fetchedName);
        fetchChatHistory(user.uid, fetchedName);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

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
    return () => { window.removeEventListener("resize", fixHeight); clearTimeout(timer); };
  }, []);

  useEffect(() => { if (window.innerWidth < 1024) setSidebarOpen(false); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping, selectedImage]);

  // ==========================================
  // FITUR BARU: MIC (SPEECH TO TEXT)
  // ==========================================
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Swal.fire("Gagal", "Browser kamu tidak mendukung fitur suara. Coba pakai Google Chrome ya!", "error");
      return;
    }

    if (isListening) return; // Jika sedang mendengarkan, biarkan saja selesai otomatis

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID'; // Bahasa Indonesia
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Mic error:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // ==========================================
  // FITUR BARU: UPLOAD IMAGE
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startNewChat = (name: string) => {
    setCurrentChatId(null);
    setMessages([{ 
      id: Date.now(), 
      sender: "bot", 
      text: `Halo ${name}! Aku GiziBot. Ada yang bisa aku bantu hari ini? Kamu juga bisa lampirin foto makanan pakai tombol di bawah lho!`, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const fetchChatHistory = async (uid: string, name: string) => {
    try {
      const q = query(collection(db, "users", uid, "chats"), orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const loadedChats: ChatSession[] = [];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      for (const document of querySnapshot.docs) {
        const data = document.data();
        const chatDate = data.updatedAt?.toDate() || new Date();
        if (chatDate < sevenDaysAgo) {
          await deleteDoc(doc(db, "users", uid, "chats", document.id));
          continue; 
        }
        loadedChats.push({ id: document.id, title: data.title || "Obrolan Baru", updatedAt: chatDate, messages: data.messages || [] });
      }

      setChatSessions(loadedChats);
      if (loadedChats.length > 0) {
        setCurrentChatId(loadedChats[0].id);
        setMessages(loadedChats[0].messages);
      } else startNewChat(name);
    } catch (error) { console.error("Gagal menarik riwayat:", error); }
  };

  const selectChat = (chatId: string) => {
    const chat = chatSessions.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chat.id);
      setMessages(chat.messages);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "users", userId, "chats", chatId));
      const updatedChats = chatSessions.filter(c => c.id !== chatId);
      setChatSessions(updatedChats);
      if (currentChatId === chatId) {
        if (updatedChats.length > 0) selectChat(updatedChats[0].id);
        else startNewChat(userName);
      }
    } catch (error) { console.error("Gagal menghapus:", error); }
  };

  // ==========================================
  // FUNGSI CHAT DINAMIS KE GEMINI
  // ==========================================
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputValue;
    
    // Harus ada teks atau gambar untuk mengirim
    if (!textToSend.trim() && !selectedImage) return;

    // CEK AMAN: Pastikan user ID sudah ditarik dari Firebase
    if (!userId) {
      console.warn("User ID belum siap!");
      return;
    }

    // PERBAIKAN 1: Buat pesan user tanpa properti image dulu
    const newUserMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Kalau beneran ada gambarnya, baru kita masukin (menghindari 'undefined')
    if (selectedImage) {
      newUserMsg.image = selectedImage;
    }

    const newMessagesArray = [...messages, newUserMsg];
    setMessages(newMessagesArray);
    setInputValue("");
    setSelectedImage(null); 
    setIsTyping(true);

    let activeChatId = currentChatId;
    const chatsRef = collection(db, "users", userId, "chats");

    try {
      // PROSES SIMPAN KE FIREBASE
      if (!activeChatId) {
        const newDocRef = doc(chatsRef);
        activeChatId = newDocRef.id;
        setCurrentChatId(activeChatId);
        const newChatData = {
          id: activeChatId,
          title: textToSend.length > 25 ? textToSend.substring(0, 25) + "..." : (textToSend || "Bahas Foto Makanan"),
          updatedAt: new Date(),
          messages: newMessagesArray
        };
        setChatSessions(prev => [newChatData, ...prev]);
        await setDoc(newDocRef, { ...newChatData, updatedAt: serverTimestamp() });
      } else {
        await updateDoc(doc(chatsRef, activeChatId), { messages: newMessagesArray, updatedAt: serverTimestamp() });
        setChatSessions(prev => {
          const chatIndex = prev.findIndex(c => c.id === activeChatId);
          if (chatIndex === -1) return prev;
          const updatedChat = { ...prev[chatIndex], messages: newMessagesArray, updatedAt: new Date() };
          const newList = [...prev];
          newList.splice(chatIndex, 1);
          return [updatedChat, ...newList];
        });
      }

      // PROSES TEMBAK KE GEMINI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessagesArray })
      });
      const data = await response.json();
      
      if (response.ok) {
        const newBotMsg: Message = {
          id: Date.now() + 1,
          sender: "bot",
          text: data.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          // PERBAIKAN 2: Pastikan nilainya 'false' atau 'null', jangan 'undefined'
          hasWidget: data.hasWidget || false,
          widgetData: data.widgetData || null
        };
        const finalMessagesArray = [...newMessagesArray, newBotMsg];
        setMessages(finalMessagesArray);
        await updateDoc(doc(chatsRef, activeChatId), { messages: finalMessagesArray, updatedAt: serverTimestamp() });
      } else { 
        throw new Error(data.error || "Gagal dari API"); 
      }

    } catch (error: any) {
      console.error("🚨 ERROR DETAIL:", error.message || error);
      const errorMsg: Message = { id: Date.now() + 1, sender: "bot", text: "Koneksi ke GiziBot terputus nih! Coba kirim ulang pesanmu ya.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, errorMsg]);
    } finally { 
      setIsTyping(false); 
    }
  };

  const categorizeDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Hari Ini";
    if (date.toDateString() === yesterday.toDateString()) return "Kemarin";
    return "7 Hari Sebelumnya";
  };

  const groupedChats = {
    "Hari Ini": chatSessions.filter(c => categorizeDate(c.updatedAt) === "Hari Ini"),
    "Kemarin": chatSessions.filter(c => categorizeDate(c.updatedAt) === "Kemarin"),
    "7 Hari Sebelumnya": chatSessions.filter(c => categorizeDate(c.updatedAt) === "7 Hari Sebelumnya"),
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col min-h-0 overflow-hidden relative bg-transparent">
      
      {/* DECORATIVE BACKGROUND BLURS */}
      <div className={`absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-[#1EAB57]/5 rounded-full blur-[100px] pointer-events-none z-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-400/5 rounded-full blur-[120px] pointer-events-none z-0 transition-opacity duration-1000 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* CSS ANIMASI KUSTOM */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-fade-up { opacity: 0; transform: translateY(30px); animation: fadeUpAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-in { opacity: 0; animation: fadeInAnim 0.8s ease-out forwards; }
          @keyframes fadeUpAnim { to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInAnim { to { opacity: 1; } }
          .delay-100 { animation-delay: 0.1s; } .delay-500 { animation-delay: 0.5s; }
          .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .typing-dot { animation: typingBounce 1.4s infinite ease-in-out both; }
          .typing-dot:nth-child(1) { animation-delay: -0.32s; }
          .typing-dot:nth-child(2) { animation-delay: -0.16s; }
          @keyframes typingBounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
          .chat-scrollbar::-webkit-scrollbar { width: 6px; }
          .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .chat-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
          .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        `
      }} />

      <div className={`flex flex-row gap-0 lg:gap-6 w-full h-full min-h-0 relative z-10 overflow-hidden ${isLoaded ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
        
        {/* ======================================= */}
        {/* MAIN CHAT AREA */}
        {/* ======================================= */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_-15px_rgb(0,0,0,0.05)] overflow-hidden relative">
          
          {/* Chat Header */}
          <div className="h-[70px] md:h-[76px] shrink-0 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between z-10 shadow-sm relative">
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors lg:hidden active:scale-95">
                <IconMenu className="w-6 h-6 text-slate-700" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1rem] bg-slate-100 flex items-center justify-center shadow-md overflow-hidden border border-slate-200 shrink-0">
                  <img src="/image/icon-gizibot.jpg" alt="GiziBot" className="w-full h-full object-cover" />
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
          <div className="flex-1 overflow-y-auto chat-scrollbar p-4 md:p-8 pb-32 md:pb-40 flex flex-col gap-6 md:gap-8 bg-slate-50/30 relative min-h-0">
            
            <div className="flex items-center justify-center my-2">
              <span className="bg-white border border-slate-100 px-4 py-1.5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                Sesi Chat Ini Dikelola AI
              </span>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`} style={{animationDuration: '0.4s'}}>
                <div className={`flex gap-2.5 md:gap-4 max-w-[90%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-sm self-end overflow-hidden border border-slate-200">
                      <img src="/image/icon-gizibot.jpg" alt="GiziBot" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 px-2">{msg.sender === 'user' ? 'Kamu' : 'GiziBot'} • {msg.time}</span>
                    
                    <div className={`px-4 md:px-5 py-3 md:py-4 text-[13px] md:text-sm font-medium leading-relaxed shadow-sm flex flex-col gap-3 ${
                      msg.sender === 'user' 
                      ? 'bg-[#0F172A] text-white rounded-[1.25rem] md:rounded-[1.5rem] rounded-br-sm' 
                      : 'bg-white border border-slate-100 text-slate-700 rounded-[1.25rem] md:rounded-[1.5rem] rounded-bl-sm'
                    }`}>
                      
                      {/* RENDER GAMBAR KALAU ADA */}
                      {msg.image && (
                        <div className="w-full max-w-[200px] md:max-w-[250px] rounded-xl overflow-hidden mb-1">
                          <img src={msg.image} alt="User Upload" className="w-full h-auto object-cover" />
                        </div>
                      )}

                      {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                      
                      {/* Rich UI Widget */}
                      {msg.hasWidget && msg.widgetData && (
                        <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl md:rounded-[1.25rem] p-3 w-full max-w-[260px] md:max-w-sm hover:shadow-md transition-shadow cursor-pointer group">
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
                          <button className="w-full mt-3 bg-[#1EAB57] text-white py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#168E46] transition-colors shadow-sm active:scale-95">
                            Tambah ke Jurnal
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex w-full justify-start animate-fade-up" style={{animationDuration: '0.3s'}}>
                <div className="flex gap-3 md:gap-4 max-w-[85%] flex-row">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-sm self-end overflow-hidden border border-slate-200">
                    <img src="/image/icon-gizibot.jpg" alt="GiziBot" className="w-full h-full object-cover" />
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
          {!isTyping && messages.length <= 1 && (
            <div className="absolute bottom-[100px] md:bottom-[110px] left-4 right-4 md:left-8 md:right-8 z-10 animate-fade-in delay-500 pointer-events-none">
              <div className="flex flex-nowrap md:flex-wrap overflow-x-auto no-scrollbar items-center justify-start gap-2 max-w-2xl pointer-events-auto pb-2 md:pb-0">
                {mockSuggestions.map((sug, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSendMessage(undefined, sug.text)}
                    className="shrink-0 bg-white/90 backdrop-blur-md border border-slate-200/60 hover:border-[#1EAB57] text-slate-600 hover:text-[#1EAB57] px-3 md:px-4 py-2 rounded-xl text-[11px] md:text-xs font-black transition-all shadow-[0_4px_10px_rgb(0,0,0,0.03)] hover:-translate-y-1 active:scale-95 cursor-pointer flex items-center gap-1.5 md:gap-2"
                  >
                    <span>{sug.icon}</span> {sug.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Area */}
          <div className="p-3 md:p-6 bg-white border-t border-slate-100 z-20 shadow-[0_-10px_40px_rgb(0,0,0,0.02)] shrink-0 flex flex-col relative">
            
            {/* PREVIEW GAMBAR SEBELUM DIKIRIM */}
            {selectedImage && (
              <div className="mb-3 relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-[#1EAB57] animate-fade-up shadow-md">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedImage(null)} 
                  className="absolute -top-1 -right-1 bg-black/50 hover:bg-rose-500 text-white rounded-full p-1 transition-colors cursor-pointer"
                >
                  <IconClose className="w-3 h-3" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 md:gap-3 bg-slate-50 border border-slate-200 rounded-2xl md:rounded-[2rem] p-1.5 md:p-2 transition-all focus-within:bg-white focus-within:border-[#1EAB57]/30 focus-within:ring-4 focus-within:ring-[#1EAB57]/10">
              
              {/* TOMBOL ATTACH GAMBAR */}
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-[#1EAB57] hover:bg-emerald-50 transition-colors cursor-pointer mb-0.5 md:mb-0.5 ml-0.5 md:ml-1"
                title="Lampirkan Foto Makanan"
              >
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
                placeholder="Ketik pesan atau unggah foto makanan..."
                className="flex-1 bg-transparent border-none resize-none max-h-28 md:max-h-32 min-h-[2.25rem] md:min-h-[2.5rem] py-2.5 md:py-3 text-[13px] md:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 chat-scrollbar"
                rows={1}
              />
              
              {inputValue.trim() || selectedImage ? (
                <button 
                  type="submit" 
                  className="w-10 h-10 md:w-11 md:h-11 shrink-0 bg-[#1EAB57] text-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(30,171,87,0.3)] hover:bg-[#168E46] hover:scale-105 active:scale-95 transition-all cursor-pointer mb-0.5 mr-0.5"
                >
                  <IconSend className="w-4 h-4 md:w-5 md:h-5 -ml-0.5" />
                </button>
              ) : (
                // TOMBOL MIC (VOICE NOTE)
                <button 
                  type="button" 
                  onClick={toggleListening}
                  className={`w-10 h-10 md:w-11 md:h-11 shrink-0 rounded-full flex items-center justify-center transition-all cursor-pointer mb-0.5 mr-0.5 ${
                    isListening ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-110' : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                  title="Dikte pakai suara"
                >
                  <IconMic className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </form>
            <div className="text-center mt-2 md:mt-3 hidden sm:block">
              <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                GiziBot ditenagai oleh AI. Gunakan estimasi cerdas ini sebagai panduan utamamu menuju gaya hidup sehat.
              </p>
            </div>
          </div>

        </div>

        {/* ======================================= */}
        {/* SIDEBAR: HISTORY (KANAN) */}
        {/* ======================================= */}
        <div 
          className={`lg:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        <div className={`
          absolute lg:static right-0 top-0 h-full z-50 lg:z-10
          w-[85%] sm:w-[320px] lg:w-[320px]
          transition-transform duration-500 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:flex'}
          ${!sidebarOpen && 'lg:flex'} 
          flex flex-col gap-4 shrink-0 bg-white/95 lg:bg-white/60 backdrop-blur-2xl lg:backdrop-blur-xl
          rounded-l-3xl lg:rounded-[2rem] border border-white/50 lg:border-white shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.1)] lg:shadow-[0_15px_40px_-10px_rgb(0,0,0,0.03)] p-4 md:p-5
        `}>
          
          <div className="flex flex-col gap-3 mb-1 md:mb-2 shrink-0">
            <div className="flex items-center justify-between px-1 md:px-2">
              <h3 className="text-base md:text-lg font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                <IconHistory className="w-4 h-4 md:w-5 md:h-5 text-[#1EAB57]" /> Riwayat
              </h3>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setSidebarOpen(false)} 
                  className="w-8 h-8 rounded-full bg-slate-100 flex lg:hidden items-center justify-center text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <IconClose className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl flex items-start gap-2">
               <IconInfo className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
               <p className="text-[9px] font-bold text-amber-700 leading-tight">
                 Demi privasi dan efisiensi, riwayat chat akan terhapus otomatis setelah 7 hari.
               </p>
            </div>
          </div>

          <button onClick={() => startNewChat(userName)} className="shrink-0 w-full bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl py-3 md:py-3.5 flex items-center justify-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer">
            <IconPlus className="w-4 h-4 text-[#1EAB57]" /> Chat Baru
          </button>

          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4 md:gap-5 mt-2 px-1 md:px-2 min-h-0">
            {chatSessions.length === 0 ? (
               <p className="text-xs font-bold text-slate-400 text-center mt-10">Belum ada riwayat.</p>
            ) : (
               <>
                 {["Hari Ini", "Kemarin", "7 Hari Sebelumnya"].map((category) => {
                   const chatsInCategory = groupedChats[category as keyof typeof groupedChats];
                   if (chatsInCategory.length === 0) return null;

                   return (
                     <div key={category} className="flex flex-col gap-1.5 md:gap-2">
                       <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-0.5 md:mb-1">{category}</span>
                       {chatsInCategory.map(chat => (
                         <div 
                           key={chat.id} 
                           onClick={() => selectChat(chat.id)}
                           className={`group flex flex-col gap-1 p-2.5 md:p-3 rounded-xl transition-all cursor-pointer border ${currentChatId === chat.id ? 'bg-white border-emerald-200 shadow-sm' : 'border-transparent hover:border-slate-100 hover:bg-white hover:shadow-sm'}`}
                         >
                           <p className={`text-[11px] md:text-xs font-bold truncate transition-colors ${currentChatId === chat.id ? 'text-[#1EAB57]' : 'text-slate-700 group-hover:text-[#1EAB57]'}`}>{chat.title}</p>
                           <div className="flex items-center justify-between">
                             <span className="text-[8px] md:text-[9px] font-bold text-slate-400">{chat.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             <button onClick={(e) => deleteChat(chat.id, e)} className={`transition-all ${currentChatId === chat.id ? 'text-rose-400 hover:text-rose-600' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-slate-300 hover:text-rose-500'}`}>
                               <IconTrash className="w-3 h-3" />
                             </button>
                           </div>
                         </div>
                       ))}
                     </div>
                   );
                 })}
               </>
            )}
          </div>

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
// KUMPULAN SVG ICONS
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
const IconPlus = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconHistory = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline><path d="M12 7v5l4 2"></path></svg>;
const IconMic = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>;
const IconClose = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconInfo = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;