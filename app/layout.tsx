import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Estação da Fumaça - Premium Cannabis Delivery",
  description:
    "As melhores genéticas de cannabis premium. Da boca pra sua porta, sem vacilo. Qualidade garantida, entrega discreta.",
  keywords: "cannabis, marijuana, delivery, premium, genéticas, flores, extrações",
  authors: [{ name: "Estação da Fumaça" }],
  creator: "Estação da Fumaça",
  publisher: "Estação da Fumaça",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://estacaodafumaca.com",
    title: "Estação da Fumaça - Premium Cannabis Delivery",
    description: "As melhores genéticas de cannabis premium. Da boca pra sua porta, sem vacilo.",
    siteName: "Estação da Fumaça",
  },
  twitter: {
    card: "summary_large_image",
    title: "Estação da Fumaça - Premium Cannabis Delivery",
    description: "As melhores genéticas de cannabis premium. Da boca pra sua porta, sem vacilo.",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#22c55e",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-cannabis-gradient">{children}</div>
      </body>
    </html>
  )
}
