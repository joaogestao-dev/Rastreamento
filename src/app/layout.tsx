import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { PackageProvider } from "@/lib/data-store";
import { getPackages } from "@/app/actions/tracking";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrackFlow — Rastreamento Logístico",
  description:
    "Plataforma de gestão e rastreamento logístico com monitoramento de pacotes em tempo real",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialPackages = await getPackages();

  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <PackageProvider initialData={initialPackages}>
          <Sidebar />
          <main className="min-h-screen bg-background lg:pl-64">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </PackageProvider>
      </body>
    </html>
  );
}
