import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider } from "@/context/loading";
import "./globals.css";

import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Rattabets",
  description: "Uma máfia de ratos tentando se divertir.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased dark", inter.variable)}>
        <ThemeProvider attribute="class">
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </ThemeProvider>
        </body>
    </html>
  );
}
