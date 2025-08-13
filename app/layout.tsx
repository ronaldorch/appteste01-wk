import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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
    <html lang="pt-BR">
      <body className={inter.className}>
        <CartProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </CartProvider>
      </body>
    </html>
  )
}
