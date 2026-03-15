import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono, Caveat } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Glasswork",
  description:
    "Analyze Google Docs and GitHub repos to see who actually contributed.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Glasswork",
    description:
      "Analyze Google Docs and GitHub repos to see who actually contributed.",
    siteName: "Glasswork",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glasswork",
    description:
      "Analyze Google Docs and GitHub repos to see who actually contributed.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} ${caveat.variable} font-sans antialiased`}
      >
        <ConvexClientProvider>
          <AppShell>{children}</AppShell>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                background: "#18181F",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F5F5FA",
              },
            }}
          />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
