import type { Metadata } from "next";
import { Geist, Manrope } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/store/app-context";
import { Providers } from "@/lib/providers";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline",
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html
      lang="en"
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className={`${manrope.variable} ${geist.variable} font-sans`}>
        <AppProvider>
          <Providers>{children}</Providers>
        </AppProvider>
      </body>
    </html>
  );
}
