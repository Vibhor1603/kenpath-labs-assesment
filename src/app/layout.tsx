import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { BOOT_SCRIPT } from "@/lib/bootScript";
import "./globals.css";

// Minimal weights to stay near the 90 KB font budget.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  weight: ["600"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "How Things Work",
  description: "A daily illustrated museum in your pocket.",
};

export const viewport: Viewport = {
  themeColor: "#FBF5EC",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Boot script: sets data-lite, data-calm, data-returning before first paint */}
        <script
          dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }}
        />
      </head>
      <body className="min-h-dvh flex flex-col" suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              fontFamily: "var(--font-inter)",
            },
          }}
        />
      </body>
    </html>
  );
}
