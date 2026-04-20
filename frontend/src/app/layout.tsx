import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import { NextAuthSessionProvider } from "@/components/providers/next-auth-session-provider";
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { THEME_STORAGE_KEY } from "@/lib/theme";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SpecBuilder",
    template: "%s | SpecBuilder",
  },
  description:
    "Transform meeting notes into structured, unambiguous project specifications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeBootstrap = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){var leg=localStorage.getItem("specbuilder-theme");if(leg==="light"||leg==="dark"){localStorage.setItem(k,leg);t=leg;}}var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);}catch(e){}})();`;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
        <ThemeProvider>
          <NextAuthSessionProvider>
            <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
