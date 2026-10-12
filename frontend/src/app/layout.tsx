import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "MagEdu", template: "%s | MagEdu" },
  description: "Adaptive learning for Class 10 Science — personalized to how you learn.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-stone-50 text-[#17201D] selection:bg-[#F1B24A] selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
