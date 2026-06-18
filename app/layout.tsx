import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Archivo, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://munsoc.opensourcenitj.com"),

  title: {
    default: "MUNSoC NITJ | Model United Nations Society",
    template: "%s | MUNSoC NITJ",
  },

  description:
    "Official Model United Nations Society of Dr. B.R. Ambedkar National Institute of Technology Jalandhar. Promoting diplomacy, public speaking, international relations, negotiation, leadership, and global awareness through conferences, debates, and simulations.",

  keywords: [
    "MUNSoC",
    "MUNSoC NITJ",
    "Model United Nations",
    "NIT Jalandhar",
    "NITJ",
    "MUN Society",
    "MUN Conference",
    "United Nations Simulation",
    "Diplomacy",
    "International Relations",
    "Public Speaking",
    "Debate Society",
    "Student Leadership",
    "Youth Diplomacy",
    "Committee Simulation",
    "UN Debate",
    "NIT Jalandhar Clubs",
    "NITJ Student Society",
    "MUN Punjab",
    "College MUN India",
    "Best MUN Society",
    "Student Diplomacy",
    "Negotiation Skills",
    "Global Affairs",
    "Policy Debate",
    "Academic Society",
    "Model UN India",
  ],

  applicationName: "MUNSoC NITJ",

  authors: [
    {
      name: "MUNSoC NITJ",
      url: "https://munsoc.opensourcenitj.com",
    },
  ],

  creator: "MUNSoC NITJ",
  publisher: "MUNSoC NITJ",

  category: "education",

  alternates: {
    canonical: "https://munsoc.opensourcenitj.com",
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        sizes: "180x180",
      },
    ],
    shortcut: ["/favicon.ico"],
  },

  manifest: "/manifest.webmanifest",

  openGraph: {
    type: "website",
    locale: "en_IN",

    url: "https://munsoc.opensourcenitj.com",

    siteName: "MUNSoC NITJ",

    title: "MUNSoC NITJ | Model United Nations Society",

    description:
      "Empowering future diplomats, leaders, and changemakers through Model United Nations conferences, debates, negotiations, and global engagement at NIT Jalandhar.",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MUNSoC NITJ",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "MUNSoC NITJ | Model United Nations Society",

    description: "Official Model United Nations Society of NIT Jalandhar.",

    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,

    nocache: false,

    googleBot: {
      index: true,
      follow: true,

      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${archivo.variable} ${geistMono.variable} ${anton.variable} bg-[#121212]`}
    >
      <body className="font-sans antialiased">
        {children}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "MUNSoC NITJ",
              alternateName: "Model United Nations Society NIT Jalandhar",
              url: "https://munsoc.opensourcenitj.com",
              logo: "https://munsoc.opensourcenitj.com/icon-512.png",
              description:
                "Official Model United Nations Society of NIT Jalandhar.",
            }),
          }}
        />
      </body>
    </html>
  );
}
