import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

// Valor de fallback válido para a URL base
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: "Questões do ENEM | Estude com Provas Anteriores",
  description: "Pratique com questões de provas anteriores do ENEM (Exame Nacional do Ensino Médio). Estude online, teste seus conhecimentos e prepare-se para obter a melhor nota no vestibular.",
  keywords: "ENEM, vestibular, questões ENEM, provas anteriores, estudo ENEM, simulado ENEM, exercícios ENEM, preparação vestibular, questões resolvidas",
  authors: [{ name: "Questões ENEM" }],
  creator: "Questões ENEM",
  publisher: "Questões ENEM",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Questões do ENEM | Estude com Provas Anteriores",
    description: "Pratique com questões de provas anteriores do ENEM (Exame Nacional do Ensino Médio). Estude online, teste seus conhecimentos e prepare-se.",
    url: "/",
    siteName: "Questões ENEM",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Questões do ENEM | Estude com Provas Anteriores",
    description: "Pratique com questões de provas anteriores do ENEM (Exame Nacional do Ensino Médio).",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="google-site-verification" content="sua-verificacao-do-google-aqui" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}