// Path: src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Cek apakah user punya "Kartu Akses" (Cookie)
  const sessionCookie = request.cookies.get('giziku_session')?.value;

  // 2. Daftar kawasan elit (Halaman yang butuh login)
  // Semua folder di dalam (dashboard) harus masuk ke sini!
  const protectedPaths = [
    '/home', 
    '/pricing', 
    '/resep', 
    '/chatbot',
    '/scanner',     // Udah ditambahin!
    '/meal-plan',   // Udah ditambahin!
    '/profile'      // Udah ditambahin!
  ]; 

  // Cek apakah URL yang mau dibuka user ada di daftar protectedPaths
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // 3. JIKA BELUM LOGIN TAPI MAKSA MASUK HALAMAN PROTECTED -> USIR KE /LOGIN
  if (isProtectedPath && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. JIKA UDAH LOGIN TAPI ISENG BUKA HALAMAN LOGIN/REGISTER -> LEMPAR KE /HOME
  const isAuthPath = ['/login', '/register'].includes(request.nextUrl.pathname);
  if (isAuthPath && sessionCookie) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi ini ngasih tau Next.js rute mana aja yang harus dicek sama Satpam
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};