import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Header } from "@/components/shared/header";
import { Lato } from "next/font/google";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { StatsProvider } from "@/contexts/StatsContext";
import { ToasterProvider } from "@/components/shared/ToasterProvider";

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

          <CalendarProvider>
            <StatsProvider>{children}</StatsProvider>
          </CalendarProvider>
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
