import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { InlineScript } from "@/components/app/InlineScript";
import { BOOT_SCRIPT } from "@/lib/bootScript";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  weight: ["600"],
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "How Things Work",
  description:
    "A daily illustrated museum in your pocket. See how a fridge, a leaf and your heart work, then prove it with a 5 of 5 test.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F3F0EA",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${figtree.variable}`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={BOOT_SCRIPT} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
