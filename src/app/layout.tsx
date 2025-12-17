import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brasa Nobre",
  description: "Sistema de Comandas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-100 dark:bg-slate-950 transition-colors duration-300`}>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}