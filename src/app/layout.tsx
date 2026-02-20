import type { Metadata } from "next";
import { DM_Sans, Inter, Caveat } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Glasswork — Group work telemetry",
  description:
    "Analyze Google Docs and GitHub repos to see who actually contributed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${inter.variable} ${caveat.variable} font-body antialiased grain-overlay`}
      >
        <ConvexClientProvider>
          <AppShell>{children}</AppShell>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-body)",
                fontSize: "13px",
              },
            }}
          />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
