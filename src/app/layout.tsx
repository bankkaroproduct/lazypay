import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Analytics } from "@/components/Analytics";
import { brandConfig } from "@/config/brand.config";
import { BrandStyles } from "@/components/BrandStyles";
import { SEOTags } from "@/components/SEOTags";

const bricolage = Bricolage_Grotesque({
    subsets: ["latin"],
    variable: "--font-display",
    weight: ["300", "400", "500", "600", "700", "800"],
});
const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-body",
    weight: ["300", "400", "500", "600", "700", "800"],
});
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    style: ["normal", "italic"],
});

export const metadata: Metadata = {
    title: `${brandConfig.name} - ${brandConfig.tagline}`,
    description: brandConfig.tagline,
    icons: {
        icon: brandConfig.favicon,
        shortcut: brandConfig.favicon,
        apple: brandConfig.favicon,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <BrandStyles />
            </head>
            <body className={`${jakarta.className} ${bricolage.variable} ${jakarta.variable} ${playfair.variable}`}>
                <SEOTags />
                <Analytics />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
