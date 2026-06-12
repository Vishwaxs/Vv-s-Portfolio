import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, ThemeScript } from "@/components/site/ThemeProvider";
import { getProfile, getSiteSettings } from "@/lib/data";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type SeoSettings = {
  site_name?: string;
  title_template?: string;
  default_description?: string;
};

export async function generateMetadata(): Promise<Metadata> {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);
  const seo = (settings.seo ?? {}) as SeoSettings;
  const name = profile?.full_name ?? seo.site_name ?? "Portfolio";
  const description =
    seo.default_description ?? profile?.tagline ?? "Developer portfolio";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${name} · ${profile?.headline ?? "Developer"}`,
      template: seo.title_template ?? `%s · ${name}`,
    },
    description,
    openGraph: {
      type: "website",
      siteName: name,
      title: name,
      description,
      images: ["/api/og"],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
