import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grade Trail — Học từng bước, hiểu từng bài",
  description: "Không gian tự học và luyện tập cho học sinh Việt Nam từ lớp 1 đến lớp 12.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Grade Trail", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#faf8ff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
