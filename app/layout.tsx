import "./globals.css";

import Footer from "./components/Footer";
import { cookies } from "next/headers";
import Navbar from "./components/Navbar";
import { UserProvider } from "./context/UserContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import { ToastProvider } from "./context/ToastContext";
import LayoutContentClient from "./components/LayoutContentClient";
import GoogleAnalytics from "./components/GoogleAnalytics";
import type { Metadata, Viewport } from "next";
import { Source_Serif_4 } from "next/font/google";

// ISR Global: Revalidar sitio cada 30 minutos
// Optimiza regeneración de página principal y otros contenidos estáticos
export const revalidate = 1800;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://todomarketec.com";
const SITE_NAME = "todoMarket";
const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-source-serif-4",
});

export const metadata: Metadata = {
  title: {
    default: "todoMarket - Tu tienda universitaria | Ecuador",
    template: "%s | todoShop",
  },
  description:
    "todoMarket - La plataforma de venta para estudiantes universitarios. Compra y reserva productos y alimentos de emprendedores estudiantiles. Envíos a todo Ecuador.",
  keywords: [
    "tienda universitaria",
    "estudiantes Ecuador",
    "compra online estudiantes",
    "emprendedores universitarios",
    "productos estudiantes",
    "alimentos reservas",
    "todoMarket",
    "plataforma universitaria",
  ],
  creator: "todoMarket",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  
  // Open Graph - Redes Sociales
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "todoMarket - Tu tienda universitaria",
    description:
      "La plataforma de venta para estudiantes universitarios. Compra y reserva productos y alimentos de emprendedores estudiantiles.",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "todoMarket - Tienda universitaria",
        type: "image/jpeg",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "TodoMarket - Tu tienda universitaria",
    description:
      "La plataforma de venta para estudiantes universitarios. Compra y reserva productos y alimentos de emprendedores estudiantiles.",
    images: [`${SITE_URL}/twitter-image.jpg`],
  },

  // Canonícal URL
  alternates: {
    canonical: SITE_URL,
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  // Verificación
  verification: {
    google: "tu-codigo-google-search-console",
  },

  // Apple
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
};

// Viewport export - separate from metadata in Next.js 16
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={sourceSerif4.variable}>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      </head>
      <body className="relative">
        <GoogleAnalytics />
        <ToastProvider>
          <OnboardingProvider>
            <LayoutContentClient>{children}</LayoutContentClient>
          </OnboardingProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

