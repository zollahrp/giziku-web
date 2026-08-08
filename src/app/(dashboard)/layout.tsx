import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white shadow-xl sm:max-w-full sm:bg-gray-50">
      {/* Area Konten Utama (Scrollable) */}
      <main className="flex-1 overflow-y-auto pb-20 sm:pb-0">
        <div className="sm:mx-auto sm:max-w-md sm:bg-white sm:min-h-screen sm:shadow-lg sm:pb-20">
            {children}
        </div>
      </main>

      {/* Bottom Navigation (Ala Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md justify-around border-t bg-white px-2 py-3 text-xs text-gray-500 sm:bottom-0">
        <Link href="/home" className="flex flex-col items-center hover:text-green-500">
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </Link>
        <Link href="/chatbot" className="flex flex-col items-center hover:text-green-500">
          <span className="text-lg">🤖</span>
          <span>Bot</span>
        </Link>
        <Link href="/scanner" className="relative -top-5 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600">
          <span className="text-2xl">📷</span>
        </Link>
        <Link href="/resep" className="flex flex-col items-center hover:text-green-500">
          <span className="text-lg">🍲</span>
          <span>Resep</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center hover:text-green-500">
          <span className="text-lg">👤</span>
          <span>Profil</span>
        </Link>
      </nav>
    </div>
  );
}