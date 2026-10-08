import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/shared/components/Footer";
import { Header } from "@/shared/components/Header";
import { SessaoProvider } from "@/modules/autenticacao/contexts/SessaoContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rotaê — Passagens de ônibus pelo Brasil",
  description: "Compare ônibus, encontre seu horário e viaje pelo Brasil.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} lang="pt-BR">
      <body className="min-h-full flex flex-col">
  <SessaoProvider>
    <Header />
    {children}
    <Footer />
  </SessaoProvider>
</body>
    </html>
  );
}
