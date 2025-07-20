import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Header } from "@/components/header";
import { Lato } from "next/font/google";
// import { Toaster } from "sonner";
import ToasterProvider from "@/components/ToasterProvider";

const lato = Lato({
  weight: "400",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "MoneyTrail",
  description: "Know where your money goes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={lato.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main>
            {children}
            <ToasterProvider />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
