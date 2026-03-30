import type { Metadata } from "next";
import { Manrope, Public_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/store/app-context";
import { Providers } from "@/lib/providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Viruj Health Clinical ERP",
  description:
    "ERP-demo UI transplanted into the Viruj Health web app for clinical operations, patient records, scheduling, staffing and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${publicSans.variable} font-sans`}>
        <AppProvider>
          <Providers>{children}</Providers>
        </AppProvider>
      </body>
    </html>
  );
}
