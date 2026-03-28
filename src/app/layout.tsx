import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { CurrencyProvider } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GroomConnect - Your Style, On Demand",
  description: "Discover and book grooming services near you. Connect with top barbershops, salons, and beauty professionals.",
  keywords: ["grooming", "barbershop", "salon", "beauty", "booking", "marketplace", "GroomConnect"],
  authors: [{ name: "GroomConnect Team" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "GroomConnect - Your Style, On Demand",
    description: "Discover and book grooming services near you",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GroomConnect - Your Style, On Demand",
    description: "Discover and book grooming services near you",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CurrencyProvider>
            {children}
            <Toaster />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
