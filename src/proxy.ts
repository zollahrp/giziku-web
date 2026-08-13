// Path: src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Cek apakah user punya "Kartu Akses" (GIZIFY)
  const sessionCookie = request.cookies.get('gizify_session')?.value;

  // 2. Daftar kawasan elit (Halaman yang butuh login)
  const protectedPaths = [
    '/home', 
    '/pricing', 
    '/resep', 
    '/chatbot',
    '/scanner',     
    '/meal-plan',   
    '/profile'      
  ]; 

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

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};