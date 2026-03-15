import type { Metadata } from "next";
import { DM_Sans, Inter, Caveat, Cormorant_Garamond } from "next/font/google";
import { ThemeProvider } from "next-themes";
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
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
  weight: ["400", "500"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-myflora",
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${inter.variable} ${caveat.variable} ${cormorant.variable} font-body antialiased grain-overlay`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
