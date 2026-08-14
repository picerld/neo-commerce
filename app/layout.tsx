import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import ClientProvider from "@/components/providers/ClientProvider";
import { Toaster } from "@/components/ui/sonner";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans-ui",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-ui",
  weight: ["400", "500", "700"],
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading-ui",
  weight: ["700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Neo Commerce",
  description: "Toko online dengan pembayaran Midtrans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${jakartaSans.variable} ${jetbrainsMono.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <ClientProvider>{children}</ClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
