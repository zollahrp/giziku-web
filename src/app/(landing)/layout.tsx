import Link from "next/link";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm">
        <div className="text-xl font-bold text-green-600">Giziku</div>
        <nav>
          <Link href="/home" className="rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
            Masuk / Coba App
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-500">
        © 2026 Giziku. All rights reserved.
      </footer>
    </div>
  );
}