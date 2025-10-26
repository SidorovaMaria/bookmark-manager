import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});
export const metadata: Metadata = {
  title: "Bookmark Manager",
  description:
    "Manage your bookmarks efficiently. A full-stack, production-ready implementation of the **Frontend Mentor – Bookmark Manager** challenge, expanded with authentication, metadata scraping (title/description/favicon), Cloudinary image storage, duplicate detection, keyboard shortcuts, PWA offline support, and a Chrome/Edge extension for one-click saving from the browser.",
  icons: {
    icon: "/icon.png",
  },
};
// GSAP
// import { gsap } from "gsap";
// import { useGSAP } from "@gsap/react";
// gsap.registerPlugin(useGSAP);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${manrope.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={true}
        >
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
